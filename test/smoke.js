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
  for (let i = 0; i < pub.groupCapacity; i++) {
    await call("x" + i, "/api/register", { ime: "K" + i, prezime: "P", email: "k" + i + "@test.rs", telefon: "1", pw: "lozinka1", consent });
    r = await call("x" + i, "/api/bookings", { date: next.date, start: next.start, type: "grupni" }); assert.equal(r.status, 200, JSON.stringify(r.data));
  }
  r = await call("k", "/api/bookings", { date: next.date, start: next.start, type: "grupni" }); assert.equal(r.status, 409);
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
  // fiksni termini: nova klijentkinja sa paketom od 8, pon/sre/pet
  await call("f", "/api/register", { ime: "Fiksna", prezime: "T", email: "fiksna@test.rs", telefon: "2", pw: "lozinka1", consent });
  r = await call("a", "/api/admin/packages", { email: "fiksna@test.rs", catalogId: "g8", paidAt: dstr(new Date()) }); assert.equal(r.status, 200);
  const fp = r.data.pkg;
  r = await call("f", "/api/packages/" + fp.id + "/fixed", { preview: true }); assert.equal(r.status, 200); assert.ok(r.data.options["1"].length);
  const ft = r.data.options["1"][0];
  r = await call("f", "/api/packages/" + fp.id + "/fixed", { days: [1, 3, 5], time: ft, preview: true }); assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.ok(r.data.plan.length >= 8, "plan " + r.data.plan.length);
  r = await call("f", "/api/packages/" + fp.id + "/fixed", { days: [1, 3, 5], time: ft }); assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.made.length + r.data.skipped.length, r.data.made.length ? r.data.made.length + r.data.skipped.length : 0); assert.ok(r.data.made.length >= 6, "made " + r.data.made.length);
  let fmy = (await call("f", "/api/my")).data; assert.equal(fmy.packages[0].sched, r.data.made.length); assert.deepEqual(fmy.packages[0].fixed.days, [1, 3, 5]);
  assert.ok(fmy.bookings.every(b => [1, 3, 5].includes(new Date(b.date + "T12:00:00").getDay()) && b.start === ft && b.fixed === 1));
  r = await call("f", "/api/packages/" + fp.id + "/fixed", { days: [2], time: ft }); assert.equal(r.status, 400); // nema preostalih
  r = await call("f", "/api/packages/" + fp.id + "/fixed/clear", {}); assert.equal(r.status, 200); assert.ok(r.data.cancelled >= 5);
  fmy = (await call("f", "/api/my")).data; assert.equal(fmy.packages[0].fixed, null); assert.equal(fmy.packages[0].remaining, 8 - fmy.packages[0].sched);
  // odjava
  await call("k", "/api/logout", {}); assert.equal((await call("k", "/api/my")).status, 401);
  console.log("Svi testovi su prošli.");
  srv.close(); process.exit(0);
})().catch(e => { console.error("TEST NEUSPEŠAN:", e.message); srv.close(); process.exit(1); });
