/* Brzi test celog toka: registracija, zakazivanje, paketi, admin ispravke. Pokretanje: npm test */
process.env.DB_FILE = "test-" + Date.now() + ".db";
process.env.DATA_DIR = require("os").tmpdir();
process.env.ADMIN_EMAILS = "admin@test.rs";
const { app } = require("../server.js");
const assert = require("assert");
const srv = app.listen(0);
const base = "http://127.0.0.1:" + srv.address().port;
const jars = {};
async function call(who, url, body) {
  const r = await fetch(base + url, { method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json", cookie: jars[who] || "" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const sc = r.headers.get("set-cookie"); if (sc) jars[who] = sc.split(";")[0];
  return { status: r.status, data: await r.json() };
}
const pad = n => String(n).padStart(2, "0");
const dstr = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parseD = x => { const [y, m, d] = x.split("-").map(Number); return new Date(y, m - 1, d); };
const addMonths = (s, n) => { const [y, m, d] = s.split("-").map(Number); const last = new Date(y, m - 1 + n + 1, 0).getDate(); return dstr(new Date(y, m - 1 + n, Math.min(d, last))); };
const hoursUntil = (date, start) => (new Date(date + "T" + start) - Date.now()) / 36e5;
(async () => {
  const consent = true;
  { const rr = await call("a", "/api/register", { ime: "Admin", prezime: "Studio", email: "admin@test.rs", telefon: "1", pw: "lozinka1", consent }); assert.equal(rr.status, 200, JSON.stringify(rr.data)); }
  assert.equal((await call("k", "/api/register", { ime: "Ana", prezime: "Klijent", email: "ana@test.rs", telefon: "0601", pw: "lozinka1", consent })).status, 200);
  assert.equal((await call("k", "/api/register", { ime: "Ana", prezime: "Klijent", email: "ana@test.rs", telefon: "0601", pw: "lozinka1", consent })).status, 409);
  const pub = (await call("k", "/api/public")).data; assert.equal(pub.me.email, "ana@test.rs"); assert.ok(!pub.me.admin);
  assert.equal((await call("a", "/api/me")).data.me.admin, true);
  // slobodan grupni termin bar 13h unapred
  const slots = (await call("k", "/api/slots?type=grupni")).data;
  const far = slots.days.flatMap(d => d.slots.map(s => ({ ...s, date: d.date }))).find(s => !s.past && (new Date(s.date + "T" + s.start) - Date.now()) / 36e5 > 13);
  assert.ok(far, "nema termina");
  // rezervacija bez paketa, probni
  let r = await call("k", "/api/bookings", { date: far.date, start: far.start, type: "grupni", trial: true });
  assert.equal(r.status, 200, "probni: " + JSON.stringify(r.data)); assert.equal(r.data.booking.trial, 1); assert.equal(r.data.pkg, null);
  assert.equal((await call("k", "/api/bookings", { date: far.date, start: far.start, type: "grupni" })).status, 409);
  // klijent ne sme admin
  assert.equal((await call("k", "/api/admin/clients")).status, 403);
  // admin evidentira paket 8 termina, uplaćen danas -> postojeći probni ne ulazi (trial=1)
  r = await call("a", "/api/admin/packages", { email: "ana@test.rs", catalogId: "g8", paidAt: dstr(new Date()) });
  assert.equal(r.status, 200); assert.equal(r.data.pkg.remaining, 8);
  // druga rezervacija troši paket
  const next = slots.days.flatMap(d => d.slots.map(s => ({ ...s, date: d.date }))).filter(s => (new Date(s.date + "T" + s.start) - Date.now()) / 36e5 > 13 && !(s.date === far.date && s.start === far.start))[1];
  r = await call("k", "/api/bookings", { date: next.date, start: next.start, type: "grupni" });
  assert.equal(r.status, 200); assert.ok(r.data.pkg); assert.equal(r.data.pkg.sched, 1); assert.equal(r.data.pkg.remaining, 7);
  const bid = r.data.booking.id;
  // otkazivanje >12h vraća u paket
  assert.equal((await call("k", "/api/bookings/" + bid + "/cancel", {})).status, 200);
  let my = (await call("k", "/api/my")).data; assert.equal(my.packages[0].remaining, 8); assert.equal(my.bookings.length, 1);
  // admin ručno upisuje kasno otkazivanje: +1 iskorišćen
  r = await call("a", "/api/admin/packages/" + my.packages[0].id, { adjustDelta: 1, reason: "nije došla" });
  assert.equal(r.data.pkg.used, 1); assert.equal(r.data.pkg.remaining, 7);
  r = await call("a", "/api/admin/packages/" + my.packages[0].id, { extendDays: 30, freezeDays: 5 });
  assert.equal(r.data.pkg.extendDays, 7); assert.equal(r.data.pkg.freezeDays, 5);
  // admin status "kasno" na probnom terminu
  r = await call("a", "/api/admin/bookings/" + my.bookings[0].id, { status: "kasno" }); assert.equal(r.data.booking.status, "kasno");
  // kapacitet: popuni termin preko force i proveri 409 za klijenta
  let xBooking;
  for (let i = 0; i < pub.groupCapacity; i++) {
    await call("x" + i, "/api/register", { ime: "K" + i, prezime: "P", email: "k" + i + "@test.rs", telefon: "1", pw: "lozinka1", consent });
    r = await call("x" + i, "/api/bookings", { date: next.date, start: next.start, type: "grupni" }); assert.equal(r.status, 200, JSON.stringify(r.data)); if (i === 0) xBooking = r.data.booking.id;
  }
  r = await call("k", "/api/bookings", { date: next.date, start: next.start, type: "grupni" }); assert.equal(r.status, 409);
  // lista čekanja: popunjen termin -> klijentkinja se prijavi, jedna otkaže -> obaveštenje i brisanje sa liste
  r = await call("k", "/api/waitlist", { date: next.date, start: next.start, type: "grupni" }); assert.equal(r.status, 200, JSON.stringify(r.data)); assert.equal(r.data.waiting, true);
  const slotOf = async who => (await call(who, "/api/slots?type=grupni")).data.days.find(d => d.date === next.date).slots.find(s => s.start === next.start);
  let sl = await slotOf("k"); assert.equal(sl.waiting, true); assert.equal(sl.taken, pub.groupCapacity);
  r = await call("x0", "/api/bookings/" + xBooking + "/cancel", {}); assert.equal(r.status, 200, JSON.stringify(r.data));
  sl = await slotOf("k"); assert.equal(sl.waiting, false, "lista čekanja nije ispražnjena"); assert.equal(sl.taken, pub.groupCapacity - 1);
  assert.ok((await call("a", "/api/admin/clients/ana@test.rs")).data.log.some(l => l.action === "lista čekanja"), "nema beleške o obaveštenju sa liste čekanja");
  r = await call("k", "/api/waitlist", { date: next.date, start: next.start, type: "grupni" }); assert.equal(r.data.waiting, true);
  r = await call("k", "/api/waitlist", { date: next.date, start: next.start, type: "grupni" }); assert.equal(r.data.waiting, false);
  r = await call("x0", "/api/bookings", { date: next.date, start: next.start, type: "grupni" }); assert.equal(r.status, 200, JSON.stringify(r.data));
  // upit za individualni trening po dogovoru
  assert.equal((await call("k", "/api/inquiry", { type: "individualni", message: "" })).status, 400);
  r = await call("k", "/api/inquiry", { type: "individualni", message: "sreda posle 17h" }); assert.equal(r.status, 200, JSON.stringify(r.data));
  // akcija i napomena u javnim podešavanjima
  { const t = dstr(new Date()), pb = (await call("k", "/api/public")).data; if (t >= "2026-11-01" && t <= "2026-12-31") assert.ok(pb.promo && pb.promo.title, "nema akcije"); assert.equal(typeof pb.individualNote, "string"); }
  r = await call("a", "/api/admin/bookings", { email: "ana@test.rs", date: next.date, start: next.start, type: "grupni", force: true }); assert.equal(r.status, 200);
  // admin dan
  const day = (await call("a", "/api/admin/day?date=" + next.date)).data;
  assert.equal(day.slots.find(s => s.start === next.start).bookings.length, pub.groupCapacity + 1);
  // izmena rasporeda za dan
  assert.equal((await call("a", "/api/admin/day", { date: next.date, g: ["07:00"], p: [] })).status, 200);
  assert.deepEqual((await call("a", "/api/admin/day?date=" + next.date)).data.g, ["07:00"]);
  assert.equal((await call("a", "/api/admin/day", { date: next.date, reset: true })).status, 200);
  // klijent detalj i log
  const det = (await call("a", "/api/admin/clients/ana@test.rs")).data;
  assert.ok(det.log.length >= 3); assert.equal(det.packages.length, 1);
  // podešavanja
  r = await call("a", "/api/admin/settings", { studio: { phone: "011" }, groupCapacity: 6, catalog: [{ id: "g1", price: 2200 }] });
  assert.equal(r.data.groupCapacity, 6); assert.equal(r.data.catalog.find(x => x.id === "g1").price, 2200);
  // dodatni admin nalozi iz podešavanja
  r = await call("a", "/api/admin/settings", { adminEmails: ["K1@test.rs ", "nije-mejl", "admin@test.rs"] }); assert.deepEqual(r.data.adminEmails, ["k1@test.rs"]);
  assert.equal((await call("x1", "/api/me")).data.me.admin, true); assert.equal((await call("x1", "/api/admin/clients")).status, 200);
  r = await call("a", "/api/admin/settings", { adminEmails: [] }); assert.equal((await call("x1", "/api/me")).data.me.admin, false); assert.equal((await call("x1", "/api/admin/clients")).status, 403);
  // fiksni termini: nova klijentkinja sa paketom od 8, pon/sre/pet
  await call("f", "/api/register", { ime: "Fiksna", prezime: "T", email: "fiksna@test.rs", telefon: "2", pw: "lozinka1", consent });
  r = await call("a", "/api/admin/packages", { email: "fiksna@test.rs", catalogId: "g8", paidAt: dstr(new Date()) }); assert.equal(r.status, 200);
  const fp = r.data.pkg;
  assert.equal(fp.validUntil, addMonths(fp.paidAt, 1), "članarina važi mesec dana"); assert.equal(fp.unpaid, 0); assert.equal(fp.paidOn, fp.paidAt);
  r = await call("f", "/api/packages/" + fp.id + "/fixed", { preview: true }); assert.equal(r.status, 200); assert.ok(r.data.options["1"].length);
  const ft = r.data.options["1"][0];
  r = await call("f", "/api/packages/" + fp.id + "/fixed", { days: [1, 3, 5], time: ft, preview: true }); assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.ok(r.data.plan.length >= 8, "plan " + r.data.plan.length);
  r = await call("f", "/api/packages/" + fp.id + "/fixed", { days: [1, 3, 5], time: ft }); assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.made.length + r.data.skipped.length, r.data.made.length ? r.data.made.length + r.data.skipped.length : 0); assert.ok(r.data.made.length >= 6, "made " + r.data.made.length);
  let fmy = (await call("f", "/api/my")).data; assert.equal(fmy.packages[0].sched, r.data.made.length); assert.deepEqual(fmy.packages[0].fixed.slots.map(x => x.d), [1, 3, 5]); assert.ok(fmy.packages[0].fixed.slots.every(x => x.t === ft));
  assert.ok(fmy.bookings.every(b => [1, 3, 5].includes(new Date(b.date + "T12:00:00").getDay()) && b.start === ft && b.fixed === 1));
  r = await call("f", "/api/packages/" + fp.id + "/fixed", { days: [2], time: ft }); assert.equal(r.status, 400); // nema preostalih
  r = await call("f", "/api/packages/" + fp.id + "/fixed/clear", {}); assert.equal(r.status, 200); assert.ok(r.data.cancelled >= 5);
  fmy = (await call("f", "/api/my")).data; assert.equal(fmy.packages[0].fixed, null); assert.equal(fmy.packages[0].remaining, 8 - fmy.packages[0].sched);
  // važenje mesec dana: isti datum narednog meseca, 31.01 -> 28.02 (već isteklo)
  await call("v", "/api/register", { ime: "Vazenje", prezime: "T", email: "vazenje@test.rs", telefon: "3", pw: "lozinka1", consent });
  r = await call("a", "/api/admin/packages", { email: "vazenje@test.rs", catalogId: "g8", paidAt: "2026-01-31" }); assert.equal(r.status, 200);
  assert.equal(r.data.pkg.validUntil, "2026-02-28"); assert.equal(r.data.pkg.expired, true);
  // članarina koju klijent sam bira: 8 termina, pon/sre/pet, uplata na račun -> paket odmah, „nije plaćeno”
  await call("m", "/api/register", { ime: "Mesec", prezime: "T", email: "mesec@test.rs", telefon: "4", pw: "lozinka1", consent });
  r = await call("m", "/api/plans", { preview: true }); assert.equal(r.status, 200); assert.ok(r.data.items.some(x => x.id === "g8")); assert.ok(r.data.options["1"].length);
  const pt = r.data.options["1"].find(t => r.data.options["3"].includes(t) && r.data.options["5"].includes(t)); assert.ok(pt);
  r = await call("m", "/api/plans", { catalogId: "g8", days: [1, 3, 5], time: pt, preview: true }); assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.validUntil, addMonths(r.data.from, 1)); assert.ok(r.data.fits >= 6, "fits " + r.data.fits);
  assert.equal((await call("m", "/api/plans", { catalogId: "g8", days: [], time: pt, payMethod: "racun" })).status, 400);
  r = await call("m", "/api/plans", { catalogId: "g8", days: [1, 3, 5], time: pt, payMethod: "racun" }); assert.equal(r.status, 200, JSON.stringify(r.data));
  const mp = r.data.pkg;
  assert.equal(mp.unpaid, 1); assert.equal(mp.payMethod, "racun"); assert.ok(r.data.made.length >= 6, "made " + r.data.made.length); assert.equal(mp.sched, r.data.made.length);
  assert.deepEqual(mp.fixed.slots.map(x => x.d), [1, 3, 5]); assert.equal(mp.validUntil, addMonths(mp.paidAt, 1)); assert.equal(mp.paidAt, r.data.made[0].date);
  assert.equal(mp.remaining, 8 - r.data.made.length);
  assert.equal((await call("f", "/api/plans", { catalogId: "g12", days: [1, 3, 5], time: pt, payMethod: "studio" })).status, 409, "ko ima neiskorišćene termine ne bira novu članarinu");
  // za svaki dan svoje vreme: uto i čet uveče, subota ujutru
  assert.equal((await call("s", "/api/register", { ime: "Slot", prezime: "Test", email: "slot@test.rs", telefon: "4", pw: "lozinka1", consent })).status, 200);
  const optS = (await call("s", "/api/plans", { preview: true })).data.options, tue = optS["2"][optS["2"].length - 1], sat = optS["6"][0];
  assert.ok(tue && sat && tue !== sat, "utorak uveče i subota ujutru imaju različita vremena");
  r = await call("s", "/api/plans", { catalogId: "g8", slots: [{ d: 2, t: tue }, { d: 4, t: tue }, { d: 6, t: sat }], preview: true }); assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.ok(r.data.plan.length && r.data.plan.every(x => (parseD(x.date).getDay() === 6 ? x.start === sat : x.start === tue)), "svaki dan dobija svoje vreme");
  r = await call("s", "/api/plans", { catalogId: "g8", slots: [{ d: 2, t: sat }], payMethod: "studio" }); assert.equal(r.status, 400, "utorak nema jutarnji termin");
  r = await call("s", "/api/plans", { catalogId: "g8", slots: [{ d: 2, t: tue }, { d: 4, t: tue }, { d: 6, t: sat }], payMethod: "studio" }); assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.pkg.fixed.slots.length, 3); assert.ok(r.data.made.every(b => [2, 4, 6].includes(parseD(b.date).getDay())));
  assert.ok(r.data.made.some(b => parseD(b.date).getDay() === 6 && b.start === sat), "subota u jutarnjem terminu");
  // klijent sam menja jedan termin (>=12h ranije): u periodu važenja može, van perioda ne može
  let mmy = (await call("m", "/api/my")).data;
  const mb = mmy.bookings.filter(b => hoursUntil(b.date, b.start) > 13).sort((a, b) => a.date.localeCompare(b.date))[0]; assert.ok(mb);
  const mslots = (await call("m", "/api/slots?type=grupni")).data.days.flatMap(d => d.slots.map(s => ({ ...s, date: d.date })));
  const target = mslots.find(s => !s.past && !s.mine && s.taken < s.cap && s.date >= mp.paidAt && s.date <= mp.validUntil && hoursUntil(s.date, s.start) > 13); assert.ok(target);
  const outside = mslots.find(s => s.date > mp.validUntil && !s.past && s.taken < s.cap); assert.ok(outside, "nema termina posle isteka");
  r = await call("m", "/api/bookings/" + mb.id + "/move", { date: outside.date, start: outside.start }); assert.equal(r.status, 400, "van važenja: " + JSON.stringify(r.data));
  r = await call("m", "/api/bookings/" + mb.id + "/move", { date: target.date, start: target.start }); assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.booking.date, target.date); assert.equal(r.data.booking.start, target.start); assert.equal(r.data.booking.pkgId, mp.id);
  mmy = (await call("m", "/api/my")).data; assert.equal(mmy.packages[0].sched, mp.sched); assert.equal(mmy.packages[0].unpaid, 1);
  assert.ok((await call("a", "/api/admin/clients/mesec@test.rs")).data.log.some(l => l.action === "promenjen termin"));
  // admin evidentira uplatu -> napomena „nije plaćeno” nestaje
  r = await call("a", "/api/admin/packages/" + mp.id, { paid: true }); assert.equal(r.status, 200); assert.equal(r.data.pkg.unpaid, 0); assert.ok(r.data.pkg.paidOn);
  assert.ok((await call("a", "/api/admin/clients/mesec@test.rs")).data.log.some(l => l.action === "članarina"));
  // pojedinačan termin bez članarine: cena pojedinačnog časa, način plaćanja, admin označi plaćeno
  await call("s", "/api/register", { ime: "Solo", prezime: "T", email: "solo@test.rs", telefon: "5", pw: "lozinka1", consent });
  const ss = mslots.find(s => !s.past && s.taken < s.cap - 1 && hoursUntil(s.date, s.start) > 13 && !(s.date === target.date && s.start === target.start)); assert.ok(ss);
  r = await call("s", "/api/bookings", { date: ss.date, start: ss.start, type: "grupni", payMethod: "racun" }); assert.equal(r.status, 200, JSON.stringify(r.data));
  const pubNow = (await call("s", "/api/public")).data;
  assert.equal(r.data.booking.payMethod, "racun"); assert.equal(r.data.booking.paid, 0); assert.equal(r.data.booking.price, pubNow.catalog.find(x => x.id === "g1").price);
  r = await call("a", "/api/admin/bookings/" + r.data.booking.id, { paid: true }); assert.equal(r.data.booking.paid, 1);
  // podaci za uplatu iz podešavanja idu u javne podatke
  r = await call("a", "/api/admin/settings", { payment: { account: "160-0000000000000-00", recipient: "Ritual", purpose: "Članarina" } }); assert.equal(r.data.payment.account, "160-0000000000000-00");
  assert.equal((await call("k", "/api/public")).data.payment.account, "160-0000000000000-00"); assert.equal(pubNow.payment, null);
  // odjava
  await call("k", "/api/logout", {}); assert.equal((await call("k", "/api/my")).status, 401);
  console.log("Svi testovi su prošli.");
  srv.close(); process.exit(0);
})().catch(e => { console.error("TEST NEUSPEŠAN:", e.message); srv.close(); process.exit(1); });
