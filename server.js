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
CREATE TABLE IF NOT EXISTS waitlist(id TEXT PRIMARY KEY, userEmail TEXT, date TEXT, start TEXT, type TEXT, created TEXT);
CREATE INDEX IF NOT EXISTS idx_w_slot ON waitlist(date, start);
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
// Dopune šeme za postojeće baze (fiksni termini; članarina koju klijent sam izabere pre uplate).
for (const [t, col, def] of [["packages", "fixed", "TEXT"], ["bookings", "fixed", "INTEGER DEFAULT 0"], ["packages", "unpaid", "INTEGER DEFAULT 0"], ["packages", "paidOn", "TEXT"], ["packages", "payMethod", "TEXT"],
  ["bookings", "payMethod", "TEXT"], ["bookings", "paid", "INTEGER DEFAULT 0"], ["bookings", "price", "INTEGER"],
  ["users", "legalConsent", "TEXT"]]) // legalConsent: kada je korisnik prihvatio Uslove korišćenja i Politiku privatnosti
  if (!db.prepare(`PRAGMA table_info(${t})`).all().some(x => x.name === col)) db.exec(`ALTER TABLE ${t} ADD COLUMN ${col} ${def}`);
const cfg = () => JSON.parse(db.prepare("SELECT json FROM settings WHERE key='config'").get().json);
const saveCfg = c => db.prepare("UPDATE settings SET json=? WHERE key='config'").run(JSON.stringify(c));
// Nova verzija seed podešavanja (raspored, kapacitet, akcija) primenjuje se i na postojeću bazu.
{
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, "seed", "settings.json"), "utf8")), c = cfg();
  if ((seed.version || 0) > (c.version || 0)) {
    c.week = seed.week; c.groupCapacity = seed.groupCapacity; c.individualNote = seed.individualNote;
    if (!c.promo) c.promo = seed.promo;
    if (!c.payment) c.payment = seed.payment;
    delete c.validDays; // članarina važi mesec dana (isti datum narednog meseca), ne fiksan broj dana
    c.version = seed.version; saveCfg(c);
    console.log("Podešavanja dopunjena iz seed-a (verzija " + seed.version + ").");
  }
}

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
// isti datum narednog meseca (17.11 → 17.12; 31.01 → 28.02), bez obzira na broj dana u mesecu
const addMonths = (s, n) => { const [y, m, d] = s.split("-").map(Number); const last = new Date(y, m - 1 + n + 1, 0).getDate(); return dstr(new Date(y, m - 1 + n, Math.min(d, last))); };
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
const fmtRsd = n => String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const promoActive = (c = cfg()) => { const p = c.promo; if (!p || !p.active) return null; const t = today(); if ((p.from && t < p.from) || (p.to && t > p.to)) return null; return p; };
/* plaćanje: klijent pri rezervaciji bira uplatu na račun (instrukcije stižu mejlom) ili plaćanje u studiju pri dolasku;
   dok studio ne evidentira uplatu, uz rezervaciju stoji napomena „nije plaćeno” */
const PAY = { racun: "uplata na račun", studio: "plaćanje u studiju", akcija: "besplatno (akcija)" };
const payMethodOf = v => v === "racun" ? "racun" : "studio";
const paymentInfo = (c = cfg()) => { const p = c.payment || {}; return p.account ? { account: p.account, recipient: p.recipient || c.studio.name, purpose: p.purpose || "Članarina" } : null; };
function paymentText(amount, c = cfg()) {
  const p = paymentInfo(c);
  if (!p) return "Podatke za uplatu na račun dobićete od studija.";
  return `Podaci za uplatu:\nPrimalac: ${p.recipient}\nTekući račun: ${p.account}\nSvrha uplate: ${p.purpose}\nIznos: ${fmtRsd(amount)} RSD\n\nU svrhu uplate dopišite i svoje ime, da bismo uplatu lakše povezali sa vašim nalogom. Kad studio evidentira uplatu, napomena „nije plaćeno” nestaje iz aplikacije.`;
}
const singlePrice = (type, trial, c = cfg()) => {
  const item = c.catalog.find(x => x.cat === type && x.total === 1 && (trial ? x.trial : !x.trial)) || c.catalog.find(x => x.cat === type && x.total === 1);
  if (trial && promoActive(c)) return 0;
  return item ? item.price : null;
};
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
  // Članarina važi mesec dana od početka (paidAt je datum početka važenja): od 17.11. do 17.12. bez obzira na broj dana u mesecu,
  // plus eventualno produženje/zamrzavanje koje upiše admin.
  const validUntil = addDays(addMonths(p.paidAt, 1), (p.extendDays || 0) + (p.freezeDays || 0));
  const remaining = Math.max(0, p.total - used - sched - (p.adjust || 0));
  return { used: used + (p.adjust || 0), sched, remaining, firstUse: first, validUntil, expired: validUntil < today() };
}
const pkgOut = (p, c) => ({ ...p, unpaid: p.unpaid ? 1 : 0, fixed: p.fixed ? JSON.parse(p.fixed) : null, ...pkgStats(p, c) });
// Aktivna članarina: nije istekla i ima neiskorišćenih termina (prvo ona koja ranije ističe).
function activePackage(email, cat, c = cfg()) {
  return db.prepare("SELECT * FROM packages WHERE userEmail=? AND cat=?").all(email, cat)
    .map(p => pkgOut(p, c)).filter(p => !p.expired && p.remaining > 0)
    .sort((a, b) => a.validUntil.localeCompare(b.validUntil))[0] || null;
}
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
// početna strana: apsolutne adrese za pregled linka (WhatsApp, Instagram, Viber) prema stvarnom domenu
const INDEX_PATH = path.join(__dirname, "public", "index.html");
let indexHtml = null;
app.get(["/", "/index.html"], (req, res) => {
  if (!indexHtml || process.env.NODE_ENV !== "production") indexHtml = fs.readFileSync(INDEX_PATH, "utf8");
  const origin = (process.env.SITE_URL || req.protocol + "://" + req.get("host")).replace(/\/$/, "");
  res.type("html").send(indexHtml.replace(/__ORIGIN__/g, origin));
});
app.use(express.static(path.join(__dirname, "public")));

/* admin: adrese iz ADMIN_EMAILS (okruženje) + adrese koje admin doda u Podešavanjima („Pristup adminu”, čuvaju se u bazi) */
const isAdminEmail = e => { e = String(e || "").toLowerCase(); return ADMIN_EMAILS.includes(e) || (cfg().adminEmails || []).includes(e); };
const userOut = u => u && ({ email: u.email, ime: u.ime, prezime: u.prezime, telefon: u.telefon, admin: isAdminEmail(u.email), needConsent: !u.legalConsent });
function me(req) {
  const email = verify(req.cookies[COOKIE]);
  return email ? userOut(db.prepare("SELECT * FROM users WHERE email=?").get(email)) : null;
}
const auth = (req, res, next) => { const u = me(req); if (!u) return res.status(401).json({ error: "Prijavite se." }); req.user = u; next(); };
const admin = (req, res, next) => { if (!req.user.admin) return res.status(403).json({ error: "Samo administrator." }); next(); };
const setLogin = (res, email) => res.cookie(COOKIE, sign(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 180 * 864e5 });
const fail = (res, code, error) => res.status(code).json({ error });

/* ---- javni podaci ---- */
// koja verzija radi: Render postavlja RENDER_GIT_COMMIT pri svakoj objavi; služi za proveru da li je nova objava podignuta
const STARTED_AT = new Date().toISOString();
app.get("/api/version", (req, res) => res.json({ commit: (process.env.RENDER_GIT_COMMIT || "").slice(0, 7) || null, started: STARTED_AT }));
app.get("/api/public", (req, res) => {
  const c = cfg();
  res.json({ studio: c.studio, groupCapacity: c.groupCapacity, bookAheadDays: c.bookAheadDays, minutes: c.minutes,
    cancelHours: c.cancelHours, maxExtend: c.maxExtend, maxFreeze: c.maxFreeze,
    week: c.week, catalog: c.catalog, individualNote: c.individualNote || "", promo: promoActive(c), payment: paymentInfo(c), me: me(req) });
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
      const waiting = u ? !!db.prepare("SELECT 1 FROM waitlist WHERE userEmail=? AND date=? AND start=?").get(u.email, date, start) : false;
      return { start, end: endOf(start, c.minutes), taken: n, cap, mine, waiting, past: hoursUntil(date, start) <= 0 };
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
  if (consent !== true) return fail(res, 400, "Potrebno je da potvrdite da ste upoznati sa Uslovima korišćenja i Politikom privatnosti.");
  if (db.prepare("SELECT 1 FROM users WHERE email=?").get(email)) return fail(res, 409, "Nalog sa ovom e-mail adresom već postoji. Prijavite se.");
  const salt = crypto.randomBytes(12).toString("hex");
  db.prepare("INSERT INTO users(email,ime,prezime,telefon,salt,hash,created,consent,legalConsent) VALUES(?,?,?,?,?,?,?,?,?)")
    .run(email, ime, prezime, telefon, salt, scrypt(String(pw), salt), nowIso(), nowIso(), nowIso());
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
// nalozi napravljeni pre uvođenja Uslova korišćenja i Politike privatnosti prihvataju ih pri prvoj sledećoj poseti
app.post("/api/consent", auth, (req, res) => {
  db.prepare("UPDATE users SET legalConsent=? WHERE email=?").run(nowIso(), req.user.email);
  res.json({ me: { ...req.user, needConsent: false } });
});
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
function createBooking({ email, date, start, type, trial, by, force, fixed, payMethod }) {
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
    const isTrial = !pkg && trial ? 1 : 0;
    // termin van paketa: cena pojedinačnog/probnog časa i način plaćanja; besplatan probni (akcija) je odmah „plaćen”
    const price = pkg ? null : singlePrice(type, isTrial, c);
    const pm = pkg ? null : price === 0 ? "akcija" : payMethodOf(payMethod);
    const b = { id: newId(), userEmail: email, date, start, type, pkgId: pkg ? pkg.id : null, trial: isTrial, status: "zakazano", created: nowIso(), createdBy: by, fixed: fixed ? 1 : 0,
      payMethod: pm, price, paid: price === 0 ? 1 : 0 };
    db.prepare("INSERT INTO bookings(id,userEmail,date,start,type,pkgId,trial,status,created,createdBy,fixed,payMethod,price,paid) VALUES(@id,@userEmail,@date,@start,@type,@pkgId,@trial,@status,@created,@createdBy,@fixed,@payMethod,@price,@paid)").run(b);
    return { booking: b, pkg };
  });
  return tx.immediate();
}
function bookingText(b) { const c = cfg(); return `${TYPES[b.type]} trening, ${fmtD(b.date)} u ${b.start}-${endOf(b.start, c.minutes)}`; }
function notify(b, what) {
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(b.userEmail); if (!u) return;
  const c = cfg();
  if (what === "new") {
    const pay = b.pkgId ? "" : b.price === 0 ? "\n\nProbni trening je besplatan (akcija)." : b.payMethod === "racun"
      ? `\n\nIzabrali ste uplatu na račun (${fmtRsd(b.price)} RSD). ${paymentText(b.price, c)}`
      : `\n\nPlaćanje u studiju pri dolasku: ${fmtRsd(b.price)} RSD. Do uplate uz termin stoji napomena „nije plaćeno”.`;
    sendMail(u.email, "Rezervacija potvrđena - Ritual Pilates Studio",
      `Zdravo ${u.ime},\n\nvaš termin je zakazan: ${bookingText(b)}.${pay}\n\nMolimo dođite najmanje 5 min ranije. Otkazivanje je moguće najkasnije ${c.cancelHours}h pre termina, inače se trening računa kao iskorišćen.\n\nRitual Pilates Studio`);
    sendMail(studioEmail(), "Nova rezervacija: " + u.ime + " " + u.prezime, `${u.ime} ${u.prezime} (${u.telefon}) je zakazao/la: ${bookingText(b)}.${b.pkgId ? "" : b.price === 0 ? " Besplatan probni (akcija)." : ` ${PAY[b.payMethod] || ""}, ${fmtRsd(b.price)} RSD - nije plaćeno.`}`);
  } else {
    sendMail(u.email, "Termin otkazan - Ritual Pilates Studio", `Zdravo ${u.ime},\n\notkazan je termin: ${bookingText(b)}.\n\nRitual Pilates Studio`);
    sendMail(studioEmail(), "Otkazano: " + u.ime + " " + u.prezime, `${u.ime} ${u.prezime} (${u.telefon}) je otkazao/la: ${bookingText(b)}.`);
  }
}

app.post("/api/bookings", auth, (req, res) => {
  const { date, start, type, trial, payMethod } = req.body || {};
  const r = createBooking({ email: req.user.email, date, start, type, trial: !!trial, by: req.user.email, payMethod });
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
  notifyWaitlist(b.date, b.start);
  res.json({ ok: true });
});

// Klijent sam menja pojedinačni termin: najkasnije cancelHours pre starog termina, novi termin mora biti slobodan i u periodu važenja paketa.
app.post("/api/bookings/:id/move", auth, (req, res) => {
  const b = db.prepare("SELECT * FROM bookings WHERE id=? AND userEmail=?").get(req.params.id, req.user.email);
  if (!b || b.status !== "zakazano") return fail(res, 404, "Rezervacija nije pronađena.");
  const c = cfg(), { date, start } = req.body || {};
  if (hoursUntil(b.date, b.start) < c.cancelHours)
    return fail(res, 400, `Termin se može promeniti najkasnije ${c.cancelHours}h ranije. Ovaj trening se računa kao iskorišćen ako izostanete.`);
  if (!validDate(date) || !validTime(start)) return fail(res, 400, "Izaberite novi dan i vreme.");
  if (date === b.date && start === b.start) return fail(res, 400, "To je isti termin. Izaberite drugi.");
  const kind = kindOf(b.type);
  if (!slotsFor(date, kind, c).includes(start)) return fail(res, 400, "Ovaj termin nije u rasporedu.");
  if (hoursUntil(date, start) <= 0) return fail(res, 400, "Novi termin je već počeo ili prošao.");
  if (date > addDays(today(), c.bookAheadDays - 1)) return fail(res, 400, "Termini se zakazuju najviše " + c.bookAheadDays + " dana unapred.");
  const pkg = b.pkgId ? db.prepare("SELECT * FROM packages WHERE id=?").get(b.pkgId) : null;
  if (pkg) { const st = pkgStats(pkg, c); if (date < pkg.paidAt || date > st.validUntil) return fail(res, 400, `Novi termin mora biti u periodu važenja članarine (do ${fmtD(st.validUntil)}).`); }
  const r = db.transaction(() => {
    if (db.prepare("SELECT 1 FROM bookings WHERE userEmail=? AND date=? AND start=? AND status='zakazano'").get(b.userEmail, date, start))
      return { code: 409, error: "Već imate rezervaciju u tom terminu." };
    if (countAt(date, start) >= capacity(kindAt(date, start, c) || kind, c)) return { code: 409, error: "Novi termin je popunjen. Izaberite drugi." };
    db.prepare("UPDATE bookings SET date=?, start=?, reminderSent=0, fixed=0 WHERE id=?").run(date, start, b.id);
    return null;
  }).immediate();
  if (r) return fail(res, r.code, r.error);
  const nb = db.prepare("SELECT * FROM bookings WHERE id=?").get(b.id);
  logAction(req.user.email, b.userEmail, "promenjen termin", bookingText(b) + " → " + fmtD(date) + " " + start);
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(b.userEmail);
  if (u) {
    sendMail(u.email, "Termin promenjen - Ritual Pilates Studio", `Zdravo ${u.ime},\n\numesto termina ${fmtD(b.date)} u ${b.start} zakazan je: ${bookingText(nb)}.\n\nRitual Pilates Studio`);
    sendMail(studioEmail(), "Promena termina: " + u.ime + " " + u.prezime, `${u.ime} ${u.prezime} (${u.telefon}) je pomerio/la termin ${fmtD(b.date)} u ${b.start} → ${bookingText(nb)}.`);
  }
  notifyWaitlist(b.date, b.start);
  res.json({ booking: nb });
});

/* ---- lista čekanja: kad se popunjen termin oslobodi, zainteresovani dobijaju mejl ---- */
app.post("/api/waitlist", auth, (req, res) => {
  const { date, start, type } = req.body || {};
  if (!validDate(date) || !validTime(start) || !TYPES[type]) return fail(res, 400, "Neispravan termin.");
  if (hoursUntil(date, start) <= 0) return fail(res, 400, "Termin je prošao.");
  const ex = db.prepare("SELECT id FROM waitlist WHERE userEmail=? AND date=? AND start=?").get(req.user.email, date, start);
  if (ex) { db.prepare("DELETE FROM waitlist WHERE id=?").run(ex.id); return res.json({ waiting: false }); }
  db.prepare("INSERT INTO waitlist(id,userEmail,date,start,type,created) VALUES(?,?,?,?,?,?)").run(newId(), req.user.email, date, start, type, nowIso());
  res.json({ waiting: true });
});
function siteUrl() { return (process.env.SITE_URL || "").replace(/\/$/, ""); }
function notifyWaitlist(date, start) {
  if (hoursUntil(date, start) <= 0) return 0;
  const c = cfg(), kind = kindAt(date, start, c); if (!kind) return 0;
  if (countAt(date, start) >= capacity(kind, c)) return 0;
  const rows = db.prepare("SELECT * FROM waitlist WHERE date=? AND start=?").all(date, start);
  let n = 0;
  for (const w of rows) {
    db.prepare("DELETE FROM waitlist WHERE id=?").run(w.id);
    if (db.prepare("SELECT 1 FROM bookings WHERE userEmail=? AND date=? AND start=? AND status='zakazano'").get(w.userEmail, date, start)) continue;
    const u = db.prepare("SELECT * FROM users WHERE email=?").get(w.userEmail); if (!u) continue;
    sendMail(u.email, "Oslobodio se termin - Ritual Pilates Studio",
      `Zdravo ${u.ime},\n\noslobodilo se mesto za termin koji ste čekali: ${TYPES[w.type] || "Grupni"} trening, ${fmtD(date)} u ${start}.\n\nMesto dobija ko prvi zakaže${siteUrl() ? ": " + siteUrl() + "/#zakazi" : " u aplikaciji."}\n\nRitual Pilates Studio`);
    logAction("sistem", u.email, "lista čekanja", "obaveštenje: " + fmtD(date) + " " + start);
    n++;
  }
  return n;
}
/* ---- upit za individualni / duo trening (po dogovoru) ---- */
app.post("/api/inquiry", auth, (req, res) => {
  const type = TYPES[(req.body || {}).type] ? req.body.type : "individualni";
  const msg = String((req.body || {}).message || "").trim().slice(0, 1000);
  if (!msg) return fail(res, 400, "Napišite koji dani i vreme vam odgovaraju.");
  const u = req.user;
  logAction(u.email, u.email, "upit", TYPES[type] + ": " + msg);
  sendMail(studioEmail(), "Upit za " + TYPES[type].toLowerCase() + " trening: " + u.ime + " " + u.prezime,
    `${u.ime} ${u.prezime}\nTelefon: ${u.telefon}\nE-mail: ${u.email}\n\nŽeljeni termini:\n${msg}`);
  res.json({ ok: true, mailed: !!mailer });
});

/* ---- fiksni termini uz paket od 8 ili 12 treninga ---- */
const DAY_SHORT = ["ned", "pon", "uto", "sre", "čet", "pet", "sub"], DAY_LONG = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"], DAY_ORD = [1, 2, 3, 4, 5, 6, 0];
// Obrazac: za svaki izabrani dan u nedelji svoje vreme (slots: [{d, t}]), npr. uto i čet u 19:00, sub u 09:00.
// Stariji zapisi {days, time} (isto vreme u sve dane) čitaju se kao isti oblik.
const fixedSlots = f => !f ? [] : (Array.isArray(f.slots) ? f.slots : (f.days || []).map(d => ({ d, t: f.time }))).slice().sort((a, b) => DAY_ORD.indexOf(a.d) - DAY_ORD.indexOf(b.d));
const fixedText = f => { const g = []; for (const x of fixedSlots(f)) { const y = g.find(z => z.t === x.t); if (y) y.days.push(x.d); else g.push({ t: x.t, days: [x.d] }); } return g.map(x => x.days.map(d => DAY_SHORT[d]).join(", ") + " u " + x.t).join(" · "); };
const fixedTimeOn = (f, date) => { const x = fixedSlots(f).find(z => z.d === parseD(date).getDay()); return x ? x.t : null; };
// Iz zahteva: slots [{d, t}] ili stariji oblik days + time. Svaki izabrani dan mora imati taj termin u rasporedu.
function parseSlots(body, opts) {
  const legacy = !Array.isArray(body.slots);
  const raw = legacy ? (Array.isArray(body.days) ? body.days.map(d => ({ d, t: body.time })) : []) : body.slots;
  const map = new Map();
  for (const x of raw) { const d = Number(x && (x.d ?? x.day)), t = String((x && (x.t ?? x.time)) || ""); if (Number.isInteger(d) && d >= 0 && d <= 6 && validTime(t)) map.set(d, t); }
  let slots = DAY_ORD.filter(d => map.has(d)).map(d => ({ d, t: map.get(d) }));
  if (legacy) slots = slots.filter(x => opts[x.d].includes(x.t)); // stari oblik: dani bez tog vremena se preskaču
  if (!slots.length) return { error: "Izaberite bar jedan dan u nedelji i vreme za taj dan." };
  const bad = slots.find(x => !opts[x.d].includes(x.t));
  if (bad) return { error: DAY_LONG[bad.d] + " nema termin u " + bad.t + ". Izaberite drugo vreme za taj dan." };
  return { slots };
}
// Planira narednih N termina po nedeljnom obrascu, u okviru važenja paketa.
function planFixed(p, f, c = cfg()) {
  const st = pkgStats(p, c), type = f.type, kind = kindOf(type);
  const first = f.from && f.from > today() ? f.from : addDays(today(), 1);
  const plan = []; let need = st.remaining;
  for (let d = first; d <= st.validUntil && need > 0; d = addDays(d, 1)) {
    const t = fixedTimeOn(f, d); if (!t) continue;
    const inSched = slotsFor(d, kind, c).includes(t);
    const mine = db.prepare("SELECT 1 FROM bookings WHERE userEmail=? AND date=? AND start=? AND status='zakazano'").get(p.userEmail, d, t);
    const full = inSched && countAt(d, t) >= capacity(kindAt(d, t, c) || kind, c);
    const reason = !inSched ? "nema termina u rasporedu" : mine ? "već zakazano" : full ? "popunjeno" : null;
    plan.push({ date: d, start: t, ok: !reason, reason });
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
  if (body.preview === true && !body.days && !body.slots) return res.json({ options: fixedOptions(p, c), fixed: p.fixed ? JSON.parse(p.fixed) : null });
  const type = p.cat === "grupni" ? "grupni" : (body.type === "duo" ? "duo" : "individualni");
  const ps = parseSlots(body, fixedOptions(p, c)); if (ps.error) return fail(res, 400, ps.error);
  const f = { slots: ps.slots, type, from: validDate(body.from) ? body.from : null };
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

/* ---- mesečna članarina koju klijent sam bira pri zakazivanju: 8 ili 12 termina, za svaki dan u nedelji svoje vreme, za ceo mesec.
        Paket nastaje odmah (važi mesec dana od prvog treninga), uplata se evidentira u studiju (admin → Klijenti). ---- */
const planItems = c => c.catalog.filter(x => !x.trial && x.total >= 8);
app.post("/api/plans", auth, (req, res) => {
  const c = cfg(), body = req.body || {};
  const item = planItems(c).find(x => x.id === body.catalogId);
  if (body.preview === true && !body.days && !body.slots) return res.json({ items: planItems(c), options: fixedOptions({ cat: item ? item.cat : (body.cat === "individualni" ? "individualni" : "grupni") }, c) });
  if (!item) return fail(res, 400, "Izaberite članarinu od 8 ili 12 termina.");
  const active = activePackage(req.user.email, item.cat, c);
  if (active) return fail(res, 409, `Već imate članarinu „${active.name}” sa ${active.remaining} neiskorišćenih termina (važi do ${fmtD(active.validUntil)}). Termine zakazujete iz nje.`);
  const type = item.cat === "grupni" ? "grupni" : (body.type === "duo" ? "duo" : "individualni");
  const ps = parseSlots(body, fixedOptions({ cat: item.cat }, c)); if (ps.error) return fail(res, 400, ps.error);
  const slots = ps.slots, slotDays = slots.map(x => x.d);
  // početak: prvi izabrani dan od sutra (ili od datuma koji je klijent izabrao)
  let from = validDate(body.from) && body.from > today() ? body.from : addDays(today(), 1);
  for (let i = 0; i < 7 && !slotDays.includes(parseD(from).getDay()); i++) from = addDays(from, 1);
  if (from > addDays(today(), c.bookAheadDays - 1)) return fail(res, 400, "Termini se zakazuju najviše " + c.bookAheadDays + " dana unapred.");
  const p = { id: newId(), userEmail: req.user.email, catalogId: item.id, name: item.name, cat: item.cat, total: item.total, price: item.price, paidAt: from,
    unpaid: 1, paidOn: null, payMethod: payMethodOf(body.payMethod), adjust: 0, extendDays: 0, freezeDays: 0, note: "", created: nowIso(), createdBy: req.user.email };
  const f = { slots, type, from };
  const planned = planFixed(p, f, c), fits = planned.plan.filter(x => x.ok).length;
  if (body.preview) return res.json({ ...planned, from, fits, total: item.total, price: item.price, name: item.name });
  if (!fits) return fail(res, 400, "Nema slobodnih termina po ovom obrascu. Izaberite druge dane ili vreme.");
  const made = [], skipped = [];
  db.transaction(() => {
    db.prepare(`INSERT INTO packages(id,userEmail,catalogId,name,cat,total,price,paidAt,unpaid,paidOn,payMethod,adjust,extendDays,freezeDays,note,created,createdBy,fixed)
      VALUES(@id,@userEmail,@catalogId,@name,@cat,@total,@price,@paidAt,@unpaid,@paidOn,@payMethod,@adjust,@extendDays,@freezeDays,@note,@created,@createdBy,@fixed)`).run({ ...p, fixed: JSON.stringify(f) });
    for (const x of planned.plan) {
      if (!x.ok) { if (x.reason !== "već zakazano") skipped.push(x); continue; }
      const r = createBooking({ email: p.userEmail, date: x.date, start: x.start, type, by: req.user.email, fixed: true });
      if (r.error) skipped.push({ ...x, reason: r.error }); else made.push(r.booking);
    }
    logAction(req.user.email, p.userEmail, "članarina", `${item.name}: ${fixedText(f)} od ${fmtD(from)}, zakazano ${made.length}${skipped.length ? ", preskočeno " + skipped.length : ""}; ${PAY[p.payMethod]}, nije plaćeno`);
  })();
  const out = pkgOut(db.prepare("SELECT * FROM packages WHERE id=?").get(p.id), c);
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(p.userEmail);
  if (u) {
    const list = made.map(b => "- " + fmtD(b.date) + " u " + b.start).join("\n");
    sendMail(u.email, "Vaša članarina i termini - Ritual Pilates Studio",
      `Zdravo ${u.ime},\n\nizabrali ste: ${item.name} (${item.price} rsd), ${fixedText(f)}.\nČlanarina važi od ${fmtD(from)} do ${fmtD(out.validUntil)}.\n\nZakazani termini:\n${list}${skipped.length ? "\n\nNije zakazano (popunjeno ili van rasporeda): " + skipped.map(x => fmtD(x.date)).join(", ") + ". Te termine možete zakazati pojedinačno u aplikaciji." : ""}${out.remaining ? "\n\nPreostalo za pojedinačno zakazivanje: " + out.remaining + "." : ""}\n\n${p.payMethod === "racun" ? "Izabrali ste uplatu na račun. " + paymentText(item.price, c) : "Izabrali ste plaćanje u studiju pri dolasku (" + fmtRsd(item.price) + " RSD). Do uplate uz članarinu stoji napomena „nije plaćeno”."}\n\nSvaki termin možete promeniti ili otkazati najkasnije ${c.cancelHours}h ranije; kasnije otkazan ili propušten trening računa se kao iskorišćen.\n\nRitual Pilates Studio`);
    sendMail(studioEmail(), "Nova članarina: " + u.ime + " " + u.prezime,
      `${u.ime} ${u.prezime} (${u.telefon}, ${u.email}) je izabrao/la ${item.name} (${item.price} rsd): ${fixedText(f)}, od ${fmtD(from)} do ${fmtD(out.validUntil)}.\nZakazano ${made.length} termina${skipped.length ? ", preskočeno " + skipped.length : ""}.\nNačin plaćanja: ${PAY[p.payMethod]} - još nije plaćeno. Kad uplata stigne, evidentirajte je u Admin → Klijenti.`);
  }
  res.json({ pkg: out, made, skipped, plan: planned.plan });
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
    if (status !== "zakazano") notifyWaitlist(b.date, b.start);
  }
  if (date || start) {
    if (!validDate(date) || !validTime(start)) return fail(res, 400, "Neispravan novi termin.");
    const c = cfg(), kind = kindAt(date, start, c) || kindOf(b.type);
    if (!(req.body || {}).force && countAt(date, start, b.id) >= capacity(kind, c)) return fail(res, 409, "Novi termin je popunjen. Označite „ipak upiši“ ako želite preko kapaciteta.");
    db.prepare("UPDATE bookings SET date=?, start=?, reminderSent=0 WHERE id=?").run(date, start, b.id);
    logAction(req.user.email, b.userEmail, "premešteno", bookingText(b) + " → " + fmtD(date) + " " + start);
    notifyWaitlist(b.date, b.start);
  }
  if ((req.body || {}).paid !== undefined) {
    const paid = (req.body || {}).paid ? 1 : 0;
    db.prepare("UPDATE bookings SET paid=? WHERE id=?").run(paid, b.id);
    logAction(req.user.email, b.userEmail, "plaćanje", bookingText(b) + (paid ? ": plaćeno" + (b.price ? " " + fmtRsd(b.price) + " RSD" : "") : ": označeno kao neplaćeno"));
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
  res.json(users.map(u => ({ ...u, admin: isAdminEmail(u.email),
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
  const p = { id: newId(), userEmail: em, catalogId: item.id, name: item.name, cat: item.cat, total: item.total, price: item.price, paidAt, unpaid: 0, paidOn: paidAt,
    adjust: 0, extendDays: 0, freezeDays: 0, note: String(note || "").slice(0, 500), created: nowIso(), createdBy: req.user.email };
  db.transaction(() => {
    db.prepare(`INSERT INTO packages(id,userEmail,catalogId,name,cat,total,price,paidAt,unpaid,paidOn,adjust,extendDays,freezeDays,note,created,createdBy)
      VALUES(@id,@userEmail,@catalogId,@name,@cat,@total,@price,@paidAt,@unpaid,@paidOn,@adjust,@extendDays,@freezeDays,@note,@created,@createdBy)`).run(p);
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
  if (b.paidAt !== undefined) { if (!validDate(b.paidAt)) return fail(res, 400, "Neispravan datum početka."); p.paidAt = b.paidAt; changes.push("važi od " + fmtD(b.paidAt)); }
  if (b.paid !== undefined) {
    p.unpaid = b.paid ? 0 : 1; p.paidOn = b.paid ? (validDate(b.paidOn) ? b.paidOn : today()) : null;
    changes.push(b.paid ? "uplata evidentirana " + fmtD(p.paidOn) : "označeno kao neplaćeno");
  }
  if (b.total !== undefined) { p.total = Math.max(1, Math.min(100, parseInt(b.total, 10) || p.total)); changes.push("ukupno " + p.total); }
  if (b.note !== undefined) p.note = String(b.note).slice(0, 500);
  db.prepare("UPDATE packages SET adjust=?, extendDays=?, freezeDays=?, paidAt=?, unpaid=?, paidOn=?, total=?, note=? WHERE id=?")
    .run(p.adjust, p.extendDays, p.freezeDays, p.paidAt, p.unpaid ? 1 : 0, p.paidOn, p.total, p.note, p.id);
  if (changes.length) logAction(req.user.email, p.userEmail, "paket", p.name + ": " + changes.join(", ") + (b.reason ? " (" + String(b.reason).slice(0, 200) + ")" : ""));
  res.json({ pkg: pkgOut(p, c) });
});
app.post("/api/admin/packages/:id/delete", auth, admin, (req, res) => {
  const p = db.prepare("SELECT * FROM packages WHERE id=?").get(req.params.id);
  if (!p) return fail(res, 404, "Paket nije pronađen.");
  db.transaction(() => {
    db.prepare("UPDATE bookings SET pkgId=NULL WHERE pkgId=?").run(p.id);
    db.prepare("DELETE FROM packages WHERE id=?").run(p.id);
    logAction(req.user.email, p.userEmail, "paket obrisan", p.name + ", važio od " + fmtD(p.paidAt));
  })();
  res.json({ ok: true });
});

/* ---- admin: podešavanja ---- */
app.get("/api/admin/settings", auth, admin, (req, res) => res.json({ ...cfg(), envAdmins: ADMIN_EMAILS }));
app.post("/api/admin/settings", auth, admin, (req, res) => {
  const b = req.body || {}, c = cfg();
  if (b.studio) for (const k of ["name", "address", "phone", "email", "instagram"]) if (b.studio[k] !== undefined) c.studio[k] = String(b.studio[k]).trim().slice(0, 200);
  if (b.groupCapacity !== undefined) c.groupCapacity = Math.max(1, Math.min(30, parseInt(b.groupCapacity, 10) || c.groupCapacity));
  if (b.bookAheadDays !== undefined) c.bookAheadDays = Math.max(1, Math.min(120, parseInt(b.bookAheadDays, 10) || c.bookAheadDays));
  if (b.week) for (const d of ["0","1","2","3","4","5","6"]) if (b.week[d]) {
    const clean = a => [...new Set((Array.isArray(a) ? a : []).map(String).map(s => s.trim()).filter(validTime))].sort();
    c.week[d] = { g: clean(b.week[d].g), p: clean(b.week[d].p) };
  }
  if (b.individualNote !== undefined) c.individualNote = String(b.individualNote).trim().slice(0, 300);
  if (b.promo && typeof b.promo === "object") {
    const p = c.promo || {};
    p.active = !!b.promo.active;
    for (const k of ["title", "text", "button"]) if (b.promo[k] !== undefined) p[k] = String(b.promo[k]).trim().slice(0, k === "text" ? 500 : 80);
    for (const k of ["from", "to"]) if (b.promo[k] !== undefined) p[k] = validDate(b.promo[k]) ? b.promo[k] : "";
    if (b.promo.image !== undefined && /^\/img\/[\w./-]+$/.test(String(b.promo.image))) p.image = String(b.promo.image);
    c.promo = p;
  }
  if (b.payment && typeof b.payment === "object") {
    const p = c.payment || {};
    for (const k of ["account", "recipient", "purpose"]) if (b.payment[k] !== undefined) p[k] = String(b.payment[k]).trim().slice(0, 120);
    c.payment = p;
  }
  if (Array.isArray(b.adminEmails)) c.adminEmails = [...new Set(b.adminEmails.map(x => String(x).trim().toLowerCase()).filter(x => validEmail(x) && !ADMIN_EMAILS.includes(x)))].slice(0, 20);
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
    if (u && await sendMail(u.email, "Podsetnik: sutra trening u Ritualu", `Zdravo ${u.ime},\n\npodsećamo vas na termin: ${bookingText(b)}.\nMolimo dođite najmanje 5 min ranije.\n\nRitual Pilates Studio`))
      db.prepare("UPDATE bookings SET reminderSent=1 WHERE id=?").run(b.id);
  }
}
setInterval(() => runReminders().catch(e => console.error(e)), 10 * 60 * 1000).unref();

app.get("/zdravlje", (req, res) => res.json({ ok: true }));
if (require.main === module) app.listen(PORT, () => console.log("Ritual rezervacije - http://localhost:" + PORT));
module.exports = { app, db };
