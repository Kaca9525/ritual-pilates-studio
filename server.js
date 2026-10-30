/* Ritual Pilates Studio - online zakazivanje reformer pilates treninga
   Node.js + Express + SQLite. Pokretanje: npm install && npm start            */
"use strict";
process.env.TZ = process.env.TZ || "Europe/Belgrade";

const express = require("express");
const cookieParser = require("cookie-parser");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || "promeni-ovaj-secret-u-produkciji";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "kaca9525@gmail.com")
  .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
const REMINDER_HOUR = parseInt(process.env.REMINDER_HOUR || "18", 10);
const DATA_DIR = process.env.DATA_DIR || __dirname;
const COOKIE = "ritual";

/* ---------------- baza ---------------- */
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
const db = new Database(path.join(DATA_DIR, process.env.DB_FILE || "ritual.db"));
console.log("Baza: " + db.name);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  email TEXT PRIMARY KEY, ime TEXT, prezime TEXT, telefon TEXT,
  salt TEXT, hash TEXT, created TEXT, consent TEXT,
  resetHash TEXT, resetExp TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS packages(
  id TEXT PRIMARY KEY, userEmail TEXT, catalogId TEXT, name TEXT, cat TEXT,
  total INTEGER, price INTEGER, paidAt TEXT,
  adjust INTEGER DEFAULT 0, extendDays INTEGER DEFAULT 0, freezeDays INTEGER DEFAULT 0,
  note TEXT, created TEXT, createdBy TEXT);
CREATE TABLE IF NOT EXISTS bookings(
  id TEXT PRIMARY KEY, userEmail TEXT, date TEXT, start TEXT, type TEXT,
  pkgId TEXT, trial INTEGER DEFAULT 0, status TEXT,
  created TEXT, createdBy TEXT, cancelledAt TEXT, cancelledBy TEXT,
  reminderSent INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS log(
  id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT, by TEXT, userEmail TEXT, action TEXT, detail TEXT);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, json TEXT);
CREATE INDEX IF NOT EXISTS idx_b_slot ON bookings(date, start);
CREATE INDEX IF NOT EXISTS idx_b_user ON bookings(userEmail);
CREATE INDEX IF NOT EXISTS idx_b_pkg ON bookings(pkgId);
CREATE INDEX IF NOT EXISTS idx_p_user ON packages(userEmail);
`);
if (!db.prepare("SELECT 1 FROM settings WHERE key='config'").get()) {
  db.prepare("INSERT INTO settings(key,json) VALUES('config',?)")
    .run(fs.readFileSync(path.join(__dirname, "seed", "settings.json"), "utf8"));
  console.log("Podešavanja su učitana iz seed/settings.json.");
}
// Dopune šeme za postojeće baze (fiksni termini).
for (const [t, col, def] of [["packages", "fixed", "TEXT"], ["bookings", "fixed", "INTEGER DEFAULT 0"]])
  if (!db.prepare(`PRAGMA table_info(${t})`).all().some(x => x.name === col)) db.exec(`ALTER TABLE ${t} ADD COLUMN ${col} ${def}`);
const cfg = () => JSON.parse(db.prepare("SELECT json FROM settings WHERE key='config'").get().json);
const saveCfg = c => db.prepare("UPDATE settings SET json=? WHERE key='config'").run(JSON.stringify(c));

/* ---------------- e-mail (Gmail SMTP) ---------------- */
let mailer = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  const nodemailer = require("nodemailer");
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    secure: (process.env.SMTP_PORT || "465") === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  console.log("E-mail slanje je UKLJUČENO (" + process.env.SMTP_USER + ").");
} else {
  console.log("E-mail slanje je ISKLJUČENO - postavite SMTP_USER i SMTP_PASS (Gmail App Password).");
}
const studioEmail = () => process.env.STUDIO_EMAIL || cfg().studio.email || process.env.SMTP_USER;
function sendMail(to, subject, text) {
  if (!mailer || !to) return Promise.resolve(false);
  return mailer.sendMail({ from: `"Ritual Pilates Studio" <${process.env.SMTP_USER}>`, to, subject, text, replyTo: studioEmail() })
    .then(() => true).catch(e => { console.error("Mail greška:", e.message); return false; });
}

/* ---------------- pomoćne ---------------- */
const DOWS = ["nedelja","ponedeljak","utorak","sreda","četvrtak","petak","subota"];
const MONTHS = ["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"];
const TYPES = { grupni: "Grupni", individualni: "Individualni", duo: "Duo" };
const pad = n => String(n).padStart(2, "0");
const dstr = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parseD = s => { const [a, b, c] = s.split("-").map(Number); return new Date(a, b - 1, c); };
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return dstr(d); };
const slotTime = (date, start) => { const d = parseD(date); const [h, m] = start.split(":").map(Number); d.setHours(h, m, 0, 0); return d; };
const hoursUntil = (date, start) => (slotTime(date, start) - Date.now()) / 36e5;
const endOf = (start, min) => { const [h, m] = start.split(":").map(Number); const e = h * 60 + m + min; return pad(Math.floor(e / 60)) + ":" + pad(e % 60); };
const fmtD = s => { const d = parseD(s); return DOWS[d.getDay()] + ", " + d.getDate() + ". " + MONTHS[d.getMonth()] + " " + d.getFullYear() + "."; };
const today = () => dstr(new Date());
const validDate = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const validTime = s => typeof s === "string" && /^\d{2}:\d{2}$/.test(s);
const validEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const kindOf = type => type === "grupni" ? "g" : "p";
const newId = () => crypto.randomBytes(8).toString("hex");
const nowIso = () => new Date().toISOString();

function scrypt(pw, salt) { return crypto.scryptSync(pw, salt, 32).toString("hex"); }
function sign(email) {
  const body = Buffer.from(JSON.stringify({ e: email, x: Date.now() + 180 * 864e5 })).toString("base64url");
  return body + "." + crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
}
function verify(token) {
  if (!token || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const good = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (mac.length !== good.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
  try { const p = JSON.parse(Buffer.from(body, "base64url").toString()); return p.x > Date.now() ? p.e : null; } catch { return null; }
}
function logAction(by, userEmail, action, detail) {
  db.prepare("INSERT INTO log(at,by,userEmail,action,detail) VALUES(?,?,?,?,?)").run(nowIso(), by, userEmail, action, detail || "");
}

/* ---------------- raspored ---------------- */
function slotsFor(date, kind, c = cfg()) {
  const o = (c.overrides || {})[date];
  if (o && Array.isArray(o[kind])) return o[kind].slice().sort();
  const w = c.week[String(parseD(date).getDay())] || {};
  return (w[kind] || []).slice().sort();
}
const capacity = (kind, c = cfg()) => kind === "g" ? c.groupCapacity : 1;
const countAt = (date, start, exceptId) =>
  db.prepare("SELECT COUNT(*) c FROM bookings WHERE date=? AND start=? AND status='zakazano' AND id<>?").get(date, start, exceptId || "").c;
// U jednom satu je ili grupni čas ili individualni/duo termin; ako je isti sat u oba rasporeda, gleda se zbir.
function kindAt(date, start, c = cfg()) {
  if (slotsFor(date, "g", c).includes(start)) return "g";
  if (slotsFor(date, "p", c).includes(start)) return "p";
  return null;
}

/* ---------------- paketi ---------------- */
function pkgStats(p, c = cfg()) {
  const bks = db.prepare("SELECT date,start,status FROM bookings WHERE pkgId=? AND status IN ('zakazano','kasno')").all(p.id);
  let used = 0, sched = 0, first = null;
  for (const b of bks) {
    if (b.status === "kasno" || hoursUntil(b.date, b.start) <= 0) used++; else sched++;
    if (!first || b.date < first) first = b.date;
  }
  const expires = addDays(p.paidAt, c.validDays + (p.extendDays || 0) + (p.freezeDays || 0)); // prvi dan kada više ne važi
  const remaining = Math.max(0, p.total - used - sched - (p.adjust || 0));
  return { used: used + (p.adjust || 0), sched, remaining, firstUse: first, validUntil: addDays(expires, -1), expired: expires <= today() };
}
const pkgOut = (p, c) => ({ ...p, fixed: p.fixed ? JSON.parse(p.fixed) : null, ...pkgStats(p, c) });
function pickPackage(email, type, date, c = cfg()) {
  return db.prepare("SELECT * FROM packages WHERE userEmail=? AND cat=?").all(email, type)
    .map(p => pkgOut(p, c))
    .filter(p => p.remaining > 0 && p.paidAt <= date && date <= p.validUntil)
    .sort((a, b) => a.validUntil.localeCompare(b.validUntil))[0] || null;
}

/* ---------------- app ---------------- */
const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const userOut = u => u && ({ email: u.email, ime: u.ime, prezime: u.prezime, telefon: u.telefon, admin: ADMIN_EMAILS.includes(u.email) });
function me(req) {
  const email = verify(req.cookies[COOKIE]);
  return email ? userOut(db.prepare("SELECT * FROM users WHERE email=?").get(email)) : null;
}
const auth = (req, res, next) => { const u = me(req); if (!u) return res.status(401).json({ error: "Prijavite se." }); req.user = u; next(); };
const admin = (req, res, next) => { if (!req.user.admin) return res.status(403).json({ error: "Samo administrator." }); next(); };
const setLogin = (res, email) => res.cookie(COOKIE, sign(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 180 * 864e5 });
const fail = (res, code, error) => res.status(code).json({ error });

/* ---- javni podaci ---- */
app.get("/api/public", (req, res) => {
  const c = cfg();
  res.json({ studio: c.studio, groupCapacity: c.groupCapacity, bookAheadDays: c.bookAheadDays, minutes: c.minutes,
    cancelHours: c.cancelHours, validDays: c.validDays, maxExtend: c.maxExtend, maxFreeze: c.maxFreeze,
    week: c.week, catalog: c.catalog, me: me(req) });
});
app.get("/api/slots", (req, res) => {
  const type = TYPES[req.query.type] ? req.query.type : "grupni";
  const kind = kindOf(type), c = cfg(), u = me(req);
  const cap = capacity(kind, c), days = [];
  for (let i = 0; i < c.bookAheadDays; i++) {
    const date = addDays(today(), i);
    days.push({ date, slots: slotsFor(date, kind, c).map(start => {
      const n = countAt(date, start);
      const mine = u ? !!db.prepare("SELECT 1 FROM bookings WHERE userEmail=? AND date=? AND start=? AND status='zakazano'").get(u.email, date, start) : false;
      return { start, end: endOf(start, c.minutes), taken: n, cap, mine, past: hoursUntil(date, start) <= 0 };
    }) });
  }
  res.json({ type, days });
});

/* ---- nalozi ---- */
app.post("/api/register", (req, res) => {
  let { ime, prezime, email, telefon, pw, consent } = req.body || {};
  ime = String(ime || "").trim(); prezime = String(prezime || "").trim();
  email = String(email || "").trim().toLowerCase(); telefon = String(telefon || "").trim();
  if (!ime || !prezime || !validEmail(email) || !telefon || String(pw || "").length < 6)
    return fail(res, 400, "Popunite ime, prezime, telefon i ispravan e-mail. Lozinka mora imati najmanje 6 karaktera.");
  if (consent !== true) return fail(res, 400, "Potrebno je da potvrdite da ste pročitali pravilnik studija.");
  if (db.prepare("SELECT 1 FROM users WHERE email=?").get(email)) return fail(res, 409, "Nalog sa ovom e-mail adresom već postoji. Prijavite se.");
  const salt = crypto.randomBytes(12).toString("hex");
  db.prepare("INSERT INTO users(email,ime,prezime,telefon,salt,hash,created,consent) VALUES(?,?,?,?,?,?,?,?)")
    .run(email, ime, prezime, telefon, salt, scrypt(String(pw), salt), nowIso(), nowIso());
  setLogin(res, email);
  res.json({ me: userOut(db.prepare("SELECT * FROM users WHERE email=?").get(email)) });
});
app.post("/api/login", (req, res) => {
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  const pw = String((req.body || {}).pw || "");
  if (!email || !pw) return fail(res, 400, "Unesite e-mail i lozinku.");
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!u) return fail(res, 404, "Nalog sa ovom adresom ne postoji. Proverite unos ili se registrujte.");
  if (scrypt(pw, u.salt) !== u.hash) return fail(res, 401, "Pogrešna lozinka.");
  setLogin(res, u.email);
  res.json({ me: userOut(u) });
});
app.post("/api/logout", (req, res) => { res.clearCookie(COOKIE); res.json({ ok: true }); });
app.get("/api/me", (req, res) => res.json({ me: me(req) }));
app.post("/api/profile", auth, (req, res) => {
  const telefon = String((req.body || {}).telefon || "").trim();
  if (!telefon) return fail(res, 400, "Unesite broj telefona.");
  db.prepare("UPDATE users SET telefon=? WHERE email=?").run(telefon, req.user.email);
  res.json({ me: { ...req.user, telefon } });
});
app.post("/api/forgot", (req, res) => {
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  if (!validEmail(email)) return fail(res, 400, "Unesite ispravnu e-mail adresu.");
  if (!mailer) return fail(res, 503, "Automatsko slanje mejlova još nije podešeno. Javite se studiju i dobićete novu lozinku.");
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (u) {
    const token = crypto.randomBytes(24).toString("hex");
    db.prepare("UPDATE users SET resetHash=?, resetExp=? WHERE email=?")
      .run(crypto.createHash("sha256").update(token).digest("hex"), new Date(Date.now() + 36e5).toISOString(), email);
    const link = (req.get("x-forwarded-proto") || "https") + "://" + req.get("host") + "/?reset=" + token;
    sendMail(email, "Nova lozinka - Ritual Pilates Studio",
      `Zdravo ${u.ime},\n\nza novu lozinku otvorite ovaj link (važi 1 sat):\n\n${link}\n\nAko niste vi tražili promenu, ignorišite ovu poruku.\n\nRitual Pilates Studio`);
  }
  res.json({ ok: true });
});
app.post("/api/reset", (req, res) => {
  const token = String((req.body || {}).token || ""), pw = String((req.body || {}).pw || "");
  if (pw.length < 6) return fail(res, 400, "Lozinka mora imati najmanje 6 karaktera.");
  if (!/^[0-9a-f]{48}$/.test(token)) return fail(res, 400, "Link za novu lozinku nije ispravan.");
  const u = db.prepare("SELECT * FROM users WHERE resetHash=?").get(crypto.createHash("sha256").update(token).digest("hex"));
  if (!u || !u.resetExp || u.resetExp < nowIso()) return fail(res, 400, "Link je istekao. Zatražite novi.");
  const salt = crypto.randomBytes(12).toString("hex");
  db.prepare("UPDATE users SET salt=?, hash=?, resetHash=NULL, resetExp=NULL WHERE email=?").run(salt, scrypt(pw, salt), u.email);
  setLogin(res, u.email);
  res.json({ me: userOut(u) });
});

/* ---- rezervacije ---- */
function createBooking({ email, date, start, type, trial, by, force, fixed }) {
  const c = cfg();
  if (!validDate(date) || !validTime(start) || !TYPES[type]) return { code: 400, error: "Neispravan termin." };
  const kind = kindOf(type);
  if (!slotsFor(date, kind, c).includes(start) && !force) return { code: 400, error: "Ovaj termin nije u rasporedu." };
  if (!force) {
    if (hoursUntil(date, start) <= 0) return { code: 400, error: "Termin je već počeo ili prošao." };
    if (date > addDays(today(), c.bookAheadDays - 1)) return { code: 400, error: "Termini se zakazuju najviše " + c.bookAheadDays + " dana unapred." };
  }
  const tx = db.transaction(() => {
    if (db.prepare("SELECT 1 FROM bookings WHERE userEmail=? AND date=? AND start=? AND status='zakazano'").get(email, date, start))
      return { code: 409, error: "Već imate rezervaciju u ovom terminu." };
    if (!force && countAt(date, start) >= capacity(kindAt(date, start, c) || kind, c))
      return { code: 409, error: "Termin je upravo popunjen. Izaberite drugi." };
    const pkg = pickPackage(email, type, date, c);
    const b = { id: newId(), userEmail: email, date, start, type, pkgId: pkg ? pkg.id : null, trial: !pkg && trial ? 1 : 0, status: "zakazano", created: nowIso(), createdBy: by, fixed: fixed ? 1 : 0 };
    db.prepare("INSERT INTO bookings(id,userEmail,date,start,type,pkgId,trial,status,created,createdBy,fixed) VALUES(@id,@userEmail,@date,@start,@type,@pkgId,@trial,@status,@created,@createdBy,@fixed)").run(b);
    return { booking: b, pkg };
  });
  return tx.immediate();
}
function bookingText(b) { const c = cfg(); return `${TYPES[b.type]} trening, ${fmtD(b.date)} u ${b.start}-${endOf(b.start, c.minutes)}`; }
function notify(b, what) {
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(b.userEmail); if (!u) return;
  const c = cfg();
  if (what === "new") {
    sendMail(u.email, "Rezervacija potvrđena - Ritual Pilates Studio",
      `Zdravo ${u.ime},\n\nvaš termin je zakazan: ${bookingText(b)}.\n\nMolimo dođite 5-10 min ranije. Otkazivanje je moguće najkasnije ${c.cancelHours}h pre termina, inače se trening računa kao iskorišćen.\n\nRitual Pilates Studio`);
    sendMail(studioEmail(), "Nova rezervacija: " + u.ime + " " + u.prezime, `${u.ime} ${u.prezime} (${u.telefon}) je zakazao/la: ${bookingText(b)}.`);
  } else {
    sendMail(u.email, "Termin otkazan - Ritual Pilates Studio", `Zdravo ${u.ime},\n\notkazan je termin: ${bookingText(b)}.\n\nRitual Pilates Studio`);
    sendMail(studioEmail(), "Otkazano: " + u.ime + " " + u.prezime, `${u.ime} ${u.prezime} (${u.telefon}) je otkazao/la: ${bookingText(b)}.`);
  }
}

app.post("/api/bookings", auth, (req, res) => {
  const { date, start, type, trial } = req.body || {};
  const r = createBooking({ email: req.user.email, date, start, type, trial: !!trial, by: req.user.email });
  if (r.error) return fail(res, r.code, r.error);
  notify(r.booking, "new");
  res.json({ booking: r.booking, pkg: r.pkg ? pkgOut(db.prepare("SELECT * FROM packages WHERE id=?").get(r.pkg.id)) : null });
});
app.get("/api/my", auth, (req, res) => {
  const c = cfg();
  res.json({
    bookings: db.prepare("SELECT * FROM bookings WHERE userEmail=? AND status IN ('zakazano','kasno') ORDER BY date DESC, start DESC").all(req.user.email),
    packages: db.prepare("SELECT * FROM packages WHERE userEmail=? ORDER BY paidAt DESC").all(req.user.email).map(p => pkgOut(p, c)),
  });
});
app.post("/api/bookings/:id/cancel", auth, (req, res) => {
  const b = db.prepare("SELECT * FROM bookings WHERE id=? AND userEmail=?").get(req.params.id, req.user.email);
  if (!b || b.status !== "zakazano") return fail(res, 404, "Rezervacija nije pronađena.");
  const c = cfg();
  if (hoursUntil(b.date, b.start) < c.cancelHours)
    return fail(res, 400, `Otkazivanje je moguće najkasnije ${c.cancelHours}h pre termina. Ovaj trening se računa kao iskorišćen.`);
  db.prepare("UPDATE bookings SET status='otkazano', cancelledAt=?, cancelledBy=? WHERE id=?").run(nowIso(), req.user.email, b.id);
  notify(b, "cancel");
  res.json({ ok: true });
});

/* ---- fiksni termini uz paket od 8 ili 12 treninga ---- */
const DAY_SHORT = ["ned", "pon", "uto", "sre", "čet", "pet", "sub"];
const fixedText = f => f ? f.days.map(d => DAY_SHORT[d]).join(", ") + " u " + f.time : "";
// Planira narednih N termina po nedeljnom obrascu, u okviru važenja paketa.
function planFixed(p, f, c = cfg()) {
  const st = pkgStats(p, c), type = f.type, kind = kindOf(type);
  const first = f.from && f.from > today() ? f.from : addDays(today(), 1);
  const plan = []; let need = st.remaining;
  for (let d = first; d <= st.validUntil && need > 0; d = addDays(d, 1)) {
    if (!f.days.includes(parseD(d).getDay())) continue;
    const inSched = slotsFor(d, kind, c).includes(f.time);
    const mine = db.prepare("SELECT 1 FROM bookings WHERE userEmail=? AND date=? AND start=? AND status='zakazano'").get(p.userEmail, d, f.time);
    const full = inSched && countAt(d, f.time) >= capacity(kindAt(d, f.time, c) || kind, c);
    const reason = !inSched ? "nema termina u rasporedu" : mine ? "već zakazano" : full ? "popunjeno" : null;
    plan.push({ date: d, start: f.time, ok: !reason, reason });
    if (!reason || mine) need--;
  }
  return { plan, remaining: st.remaining, validUntil: st.validUntil };
}
function fixedOptions(p, c = cfg()) {
  const kind = kindOf(p.cat), out = {};
  for (let d = 0; d < 7; d++) out[d] = ((c.week[String(d)] || {})[kind] || []).slice().sort();
  return out;
}
app.post("/api/packages/:id/fixed", auth, (req, res) => {
  const p = db.prepare("SELECT * FROM packages WHERE id=?").get(req.params.id);
  if (!p || (!req.user.admin && p.userEmail !== req.user.email)) return fail(res, 404, "Paket nije pronađen.");
  if (p.total < 8) return fail(res, 400, "Fiksni termini važe za pakete od 8 ili 12 treninga.");
  const c = cfg(), body = req.body || {};
  if (body.preview === true && !body.days) return res.json({ options: fixedOptions(p, c), fixed: p.fixed ? JSON.parse(p.fixed) : null });
  const days = [...new Set((Array.isArray(body.days) ? body.days : []).map(Number).filter(d => d >= 0 && d <= 6))].sort();
  const type = p.cat === "grupni" ? "grupni" : (body.type === "duo" ? "duo" : "individualni");
  const f = { days, time: String(body.time || ""), type, from: validDate(body.from) ? body.from : null };
  if (!days.length) return fail(res, 400, "Izaberite bar jedan dan u nedelji.");
  if (!validTime(f.time)) return fail(res, 400, "Izaberite vreme.");
  if (!days.some(d => fixedOptions(p, c)[d].includes(f.time))) return fail(res, 400, "U izabrane dane nema termina u to vreme.");
  const st = pkgStats(p, c);
  if (st.expired || st.remaining <= 0) return fail(res, 400, "Paket nema preostalih treninga ili je istekao.");
  const planned = planFixed(p, f, c);
  if (body.preview) return res.json({ ...planned, options: fixedOptions(p, c) });
  const made = [], skipped = [];
  for (const x of planned.plan) {
    if (!x.ok) { if (x.reason !== "već zakazano") skipped.push(x); continue; }
    const r = createBooking({ email: p.userEmail, date: x.date, start: x.start, type, by: req.user.email, force: !!(req.user.admin && body.force), fixed: true });
    if (r.error) skipped.push({ ...x, reason: r.error }); else made.push(r.booking);
  }
  db.prepare("UPDATE packages SET fixed=? WHERE id=?").run(JSON.stringify(f), p.id);
  logAction(req.user.email, p.userEmail, "fiksni termini", `${p.name}: ${fixedText(f)}, zakazano ${made.length}${skipped.length ? ", preskočeno " + skipped.length : ""}`);
  if (made.length) {
    const u = db.prepare("SELECT * FROM users WHERE email=?").get(p.userEmail);
    if (u) sendMail(u.email, "Vaši fiksni termini - Ritual Pilates Studio",
      `Zdravo ${u.ime},\n\nzakazani su vaši fiksni termini (${fixedText(f)}):\n${made.map(b => "- " + fmtD(b.date) + " u " + b.start).join("\n")}\n\nOtkazivanje pojedinačnog termina je moguće najkasnije ${c.cancelHours}h ranije.\n\nRitual Pilates Studio`);
  }
  res.json({ made, skipped, fixed: f });
});
app.post("/api/packages/:id/fixed/clear", auth, (req, res) => {
  const p = db.prepare("SELECT * FROM packages WHERE id=?").get(req.params.id);
  if (!p || (!req.user.admin && p.userEmail !== req.user.email)) return fail(res, 404, "Paket nije pronađen.");
  const c = cfg();
  // Budući fiksni termini se otkazuju (uz poštovanje roka za otkazivanje kada to radi klijent).
  const fut = db.prepare("SELECT * FROM bookings WHERE pkgId=? AND fixed=1 AND status='zakazano'").all(p.id)
    .filter(b => hoursUntil(b.date, b.start) >= (req.user.admin ? 0 : c.cancelHours));
  db.transaction(() => {
    for (const b of fut) db.prepare("UPDATE bookings SET status='otkazano', cancelledAt=?, cancelledBy=? WHERE id=?").run(nowIso(), req.user.email, b.id);
    db.prepare("UPDATE packages SET fixed=NULL WHERE id=?").run(p.id);
    logAction(req.user.email, p.userEmail, "fiksni termini ukinuti", `${p.name}: otkazano ${fut.length} budućih termina`);
  })();
  res.json({ cancelled: fut.length });
});

/* ---- admin: raspored ---- */
app.get("/api/admin/day", auth, admin, (req, res) => {
  const date = validDate(req.query.date) ? req.query.date : today();
  const c = cfg();
  const rows = db.prepare(`SELECT b.*, u.ime, u.prezime, u.telefon FROM bookings b LEFT JOIN users u ON u.email=b.userEmail
    WHERE b.date=? AND b.status IN ('zakazano','kasno') ORDER BY b.start`).all(date);
  const pk = id => { if (!id) return null; const p = db.prepare("SELECT * FROM packages WHERE id=?").get(id); return p ? pkgOut(p, c) : null; };
  const starts = [...new Set([...slotsFor(date, "g", c), ...slotsFor(date, "p", c), ...rows.map(r => r.start)])].sort();
  res.json({ date, overridden: !!(c.overrides || {})[date], g: slotsFor(date, "g", c), p: slotsFor(date, "p", c),
    slots: starts.map(start => {
      const kind = kindAt(date, start, c);
      return { start, end: endOf(start, c.minutes), kind, cap: kind ? capacity(kind, c) : null,
        bookings: rows.filter(r => r.start === start).map(r => ({ ...r, pkg: pk(r.pkgId) })) };
    }) });
});
app.post("/api/admin/day", auth, admin, (req, res) => {
  const { date, g, p, reset } = req.body || {};
  if (!validDate(date)) return fail(res, 400, "Neispravan datum.");
  const c = cfg(); c.overrides = c.overrides || {};
  if (reset) delete c.overrides[date];
  else {
    const clean = a => [...new Set((Array.isArray(a) ? a : []).map(String).map(s => s.trim()).filter(validTime))].sort();
    c.overrides[date] = { g: clean(g), p: clean(p) };
  }
  for (const d of Object.keys(c.overrides)) if (d < addDays(today(), -7)) delete c.overrides[d];
  saveCfg(c);
  logAction(req.user.email, null, "raspored", date + (reset ? " vraćen na nedeljni raspored" : " izmenjen"));
  res.json({ ok: true });
});
app.post("/api/admin/bookings", auth, admin, (req, res) => {
  const { email, date, start, type, force } = req.body || {};
  if (!db.prepare("SELECT 1 FROM users WHERE email=?").get(String(email || "").toLowerCase())) return fail(res, 404, "Klijent nije pronađen.");
  const r = createBooking({ email: String(email).toLowerCase(), date, start, type, by: req.user.email, force: !!force });
  if (r.error) return fail(res, r.code, r.error);
  logAction(req.user.email, r.booking.userEmail, "zakazano", bookingText(r.booking));
  res.json({ booking: r.booking });
});
app.post("/api/admin/bookings/:id", auth, admin, (req, res) => {
  const b = db.prepare("SELECT * FROM bookings WHERE id=?").get(req.params.id);
  if (!b) return fail(res, 404, "Rezervacija nije pronađena.");
  const { status, date, start, pkgId } = req.body || {};
  if (status) {
    if (!["zakazano", "otkazano", "kasno"].includes(status)) return fail(res, 400, "Neispravan status.");
    db.prepare("UPDATE bookings SET status=?, cancelledAt=?, cancelledBy=? WHERE id=?")
      .run(status, status === "zakazano" ? null : nowIso(), status === "zakazano" ? null : req.user.email, b.id);
    const label = { zakazano: "vraćeno u zakazano", otkazano: "otkazano (trening vraćen)", kasno: "kasno otkazivanje (računa se)" }[status];
    logAction(req.user.email, b.userEmail, "status", bookingText(b) + ": " + label);
    if (status === "otkazano") notify(b, "cancel");
  }
  if (date || start) {
    if (!validDate(date) || !validTime(start)) return fail(res, 400, "Neispravan novi termin.");
    const c = cfg(), kind = kindAt(date, start, c) || kindOf(b.type);
    if (!(req.body || {}).force && countAt(date, start, b.id) >= capacity(kind, c)) return fail(res, 409, "Novi termin je popunjen. Označite „ipak upiši“ ako želite preko kapaciteta.");
    db.prepare("UPDATE bookings SET date=?, start=?, reminderSent=0 WHERE id=?").run(date, start, b.id);
    logAction(req.user.email, b.userEmail, "premešteno", bookingText(b) + " → " + fmtD(date) + " " + start);
  }
  if (pkgId !== undefined) {
    if (pkgId && !db.prepare("SELECT 1 FROM packages WHERE id=? AND userEmail=?").get(pkgId, b.userEmail)) return fail(res, 400, "Paket ne pripada ovom klijentu.");
    db.prepare("UPDATE bookings SET pkgId=? WHERE id=?").run(pkgId || null, b.id);
    logAction(req.user.email, b.userEmail, "paket", bookingText(b) + (pkgId ? " povezano sa paketom" : " bez paketa"));
  }
  res.json({ booking: db.prepare("SELECT * FROM bookings WHERE id=?").get(b.id) });
});

/* ---- admin: klijenti i paketi ---- */
app.get("/api/admin/clients", auth, admin, (req, res) => {
  const c = cfg();
  const users = db.prepare("SELECT email,ime,prezime,telefon,created,note FROM users ORDER BY ime, prezime").all();
  res.json(users.map(u => ({ ...u, admin: ADMIN_EMAILS.includes(u.email),
    packages: db.prepare("SELECT * FROM packages WHERE userEmail=? ORDER BY paidAt DESC").all(u.email).map(p => pkgOut(p, c)),
    upcoming: db.prepare("SELECT COUNT(*) c FROM bookings WHERE userEmail=? AND status='zakazano' AND date>=?").get(u.email, today()).c,
    visits: db.prepare("SELECT COUNT(*) c FROM bookings WHERE userEmail=? AND status IN ('zakazano','kasno') AND date<=?").get(u.email, today()).c })));
});
app.get("/api/admin/clients/:email", auth, admin, (req, res) => {
  const email = req.params.email.toLowerCase(), c = cfg();
  const u = db.prepare("SELECT email,ime,prezime,telefon,created,note FROM users WHERE email=?").get(email);
  if (!u) return fail(res, 404, "Klijent nije pronađen.");
  res.json({ ...u,
    packages: db.prepare("SELECT * FROM packages WHERE userEmail=? ORDER BY paidAt DESC").all(email).map(p => pkgOut(p, c)),
    bookings: db.prepare("SELECT * FROM bookings WHERE userEmail=? ORDER BY date DESC, start DESC LIMIT 200").all(email),
    log: db.prepare("SELECT * FROM log WHERE userEmail=? ORDER BY id DESC LIMIT 100").all(email) });
});
app.post("/api/admin/clients/:email", auth, admin, (req, res) => {
  const email = req.params.email.toLowerCase();
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!u) return fail(res, 404, "Klijent nije pronađen.");
  const { telefon, note, newPassword } = req.body || {};
  if (telefon !== undefined) db.prepare("UPDATE users SET telefon=? WHERE email=?").run(String(telefon).trim(), email);
  if (note !== undefined) db.prepare("UPDATE users SET note=? WHERE email=?").run(String(note).slice(0, 1000), email);
  if (newPassword) {
    if (String(newPassword).length < 6) return fail(res, 400, "Lozinka mora imati najmanje 6 karaktera.");
    const salt = crypto.randomBytes(12).toString("hex");
    db.prepare("UPDATE users SET salt=?, hash=? WHERE email=?").run(salt, scrypt(String(newPassword), salt), email);
    logAction(req.user.email, email, "lozinka", "postavljena nova lozinka");
  }
  res.json({ ok: true });
});
app.post("/api/admin/packages", auth, admin, (req, res) => {
  const { email, catalogId, paidAt, note } = req.body || {};
  const c = cfg(), item = c.catalog.find(x => x.id === catalogId);
  const em = String(email || "").toLowerCase();
  if (!db.prepare("SELECT 1 FROM users WHERE email=?").get(em)) return fail(res, 404, "Klijent nije pronađen.");
  if (!item) return fail(res, 400, "Izaberite paket.");
  if (!validDate(paidAt)) return fail(res, 400, "Unesite datum uplate.");
  const p = { id: newId(), userEmail: em, catalogId: item.id, name: item.name, cat: item.cat, total: item.total, price: item.price, paidAt,
    adjust: 0, extendDays: 0, freezeDays: 0, note: String(note || "").slice(0, 500), created: nowIso(), createdBy: req.user.email };
  db.transaction(() => {
    db.prepare(`INSERT INTO packages(id,userEmail,catalogId,name,cat,total,price,paidAt,adjust,extendDays,freezeDays,note,created,createdBy)
      VALUES(@id,@userEmail,@catalogId,@name,@cat,@total,@price,@paidAt,@adjust,@extendDays,@freezeDays,@note,@created,@createdBy)`).run(p);
    // Već zakazani termini bez paketa iz perioda važenja ulaze u novi paket.
    const exp = pkgStats(p, c).validUntil;
    const loose = db.prepare("SELECT id FROM bookings WHERE userEmail=? AND type=? AND pkgId IS NULL AND trial=0 AND status IN ('zakazano','kasno') AND date>=? AND date<=? ORDER BY date,start").all(em, item.cat, paidAt, exp);
    for (const b of loose.slice(0, item.total)) db.prepare("UPDATE bookings SET pkgId=? WHERE id=?").run(p.id, b.id);
    logAction(req.user.email, em, "uplata", `${item.name}, uplaćeno ${fmtD(paidAt)}${loose.length ? ", povezano " + Math.min(loose.length, item.total) + " postojećih termina" : ""}`);
  })();
  res.json({ pkg: pkgOut(p, c) });
});
app.post("/api/admin/packages/:id", auth, admin, (req, res) => {
  const p = db.prepare("SELECT * FROM packages WHERE id=?").get(req.params.id);
  if (!p) return fail(res, 404, "Paket nije pronađen.");
  const c = cfg(), b = req.body || {}, changes = [];
  if (b.adjustDelta) { const d = Math.max(-50, Math.min(50, parseInt(b.adjustDelta, 10) || 0)); p.adjust = (p.adjust || 0) + d; changes.push(d > 0 ? `+${d} iskorišćen ručno` : `${-d} vraćen u paket`); }
  if (b.extendDays !== undefined) { p.extendDays = Math.max(0, Math.min(c.maxExtend, parseInt(b.extendDays, 10) || 0)); changes.push("produženje " + p.extendDays + " d"); }
  if (b.freezeDays !== undefined) { p.freezeDays = Math.max(0, Math.min(c.maxFreeze, parseInt(b.freezeDays, 10) || 0)); changes.push("zamrzavanje " + p.freezeDays + " d"); }
  if (b.paidAt !== undefined) { if (!validDate(b.paidAt)) return fail(res, 400, "Neispravan datum uplate."); p.paidAt = b.paidAt; changes.push("datum uplate " + fmtD(b.paidAt)); }
  if (b.total !== undefined) { p.total = Math.max(1, Math.min(100, parseInt(b.total, 10) || p.total)); changes.push("ukupno " + p.total); }
  if (b.note !== undefined) p.note = String(b.note).slice(0, 500);
  db.prepare("UPDATE packages SET adjust=?, extendDays=?, freezeDays=?, paidAt=?, total=?, note=? WHERE id=?")
    .run(p.adjust, p.extendDays, p.freezeDays, p.paidAt, p.total, p.note, p.id);
  if (changes.length) logAction(req.user.email, p.userEmail, "paket", p.name + ": " + changes.join(", ") + (b.reason ? " (" + String(b.reason).slice(0, 200) + ")" : ""));
  res.json({ pkg: pkgOut(p, c) });
});
app.post("/api/admin/packages/:id/delete", auth, admin, (req, res) => {
  const p = db.prepare("SELECT * FROM packages WHERE id=?").get(req.params.id);
  if (!p) return fail(res, 404, "Paket nije pronađen.");
  db.transaction(() => {
    db.prepare("UPDATE bookings SET pkgId=NULL WHERE pkgId=?").run(p.id);
    db.prepare("DELETE FROM packages WHERE id=?").run(p.id);
    logAction(req.user.email, p.userEmail, "paket obrisan", p.name + ", uplaćeno " + fmtD(p.paidAt));
  })();
  res.json({ ok: true });
});

/* ---- admin: podešavanja ---- */
app.get("/api/admin/settings", auth, admin, (req, res) => res.json(cfg()));
app.post("/api/admin/settings", auth, admin, (req, res) => {
  const b = req.body || {}, c = cfg();
  if (b.studio) for (const k of ["name", "address", "phone", "email", "instagram"]) if (b.studio[k] !== undefined) c.studio[k] = String(b.studio[k]).trim().slice(0, 200);
  if (b.groupCapacity !== undefined) c.groupCapacity = Math.max(1, Math.min(30, parseInt(b.groupCapacity, 10) || c.groupCapacity));
  if (b.bookAheadDays !== undefined) c.bookAheadDays = Math.max(1, Math.min(120, parseInt(b.bookAheadDays, 10) || c.bookAheadDays));
  if (b.week) for (const d of ["0","1","2","3","4","5","6"]) if (b.week[d]) {
    const clean = a => [...new Set((Array.isArray(a) ? a : []).map(String).map(s => s.trim()).filter(validTime))].sort();
    c.week[d] = { g: clean(b.week[d].g), p: clean(b.week[d].p) };
  }
  if (Array.isArray(b.catalog)) for (const it of b.catalog) {
    const x = c.catalog.find(y => y.id === it.id);
    if (x && it.price !== undefined) x.price = Math.max(0, parseInt(it.price, 10) || 0);
  }
  saveCfg(c);
  logAction(req.user.email, null, "podešavanja", "izmenjena podešavanja studija");
  res.json(c);
});
app.get("/api/admin/backup", auth, admin, (req, res) => {
  res.setHeader("Content-Disposition", `attachment; filename="ritual-backup-${today()}.json"`);
  res.json({ exported: nowIso(), settings: cfg(),
    users: db.prepare("SELECT email,ime,prezime,telefon,created,note FROM users").all(),
    packages: db.prepare("SELECT * FROM packages").all(), bookings: db.prepare("SELECT * FROM bookings").all(),
    log: db.prepare("SELECT * FROM log").all() });
});

/* ---- podsetnici dan pre termina ---- */
async function runReminders() {
  if (!mailer || new Date().getHours() < REMINDER_HOUR) return;
  const tomorrow = addDays(today(), 1);
  const rows = db.prepare("SELECT * FROM bookings WHERE date=? AND status='zakazano' AND reminderSent=0").all(tomorrow);
  for (const b of rows) {
    const u = db.prepare("SELECT * FROM users WHERE email=?").get(b.userEmail);
    if (u && await sendMail(u.email, "Podsetnik: sutra trening u Ritualu", `Zdravo ${u.ime},\n\npodsećamo vas na termin: ${bookingText(b)}.\nMolimo dođite 5-10 min ranije.\n\nRitual Pilates Studio`))
      db.prepare("UPDATE bookings SET reminderSent=1 WHERE id=?").run(b.id);
  }
}
setInterval(() => runReminders().catch(e => console.error(e)), 10 * 60 * 1000).unref();

app.get("/zdravlje", (req, res) => res.json({ ok: true }));
if (require.main === module) app.listen(PORT, () => console.log("Ritual rezervacije - http://localhost:" + PORT));
module.exports = { app, db };
