# Ritual Pilates Studio — Rezervacije

Javna web aplikacija za online zakazivanje reformer pilates treninga: grupni, individualni i duo
termini od 55 min, nalozi klijenata, evidencija paketa (uplata, početak korišćenja, iskorišćeno,
preostalo), pravilnik i cenovnik, admin panel sa ručnim ispravkama i automatski e-mail podsetnici.

Radi za neograničen broj realnih korisnika — klijentima je potreban samo link.

## Šta je u paketu

```
server.js          – ceo backend (Node.js + Express + SQLite)
public/index.html  – kompletna aplikacija koju korisnici vide
public/img         – fotografije studija, public/logo.svg – logo
seed/settings.json – početna podešavanja: raspored, cene, kapacitet (učita se pri prvom startu)
test/smoke.js      – automatski test celog toka (npm test)
```

Baza (`ritual.db`) se pravi sama pri prvom pokretanju.

## Pokretanje

```bash
npm install
npm start          # http://localhost:3000
npm test           # provera: registracija, zakazivanje, paketi, admin
```

## Podešavanja (environment promenljive)

| Promenljiva     | Obavezno | Opis |
|-----------------|----------|------|
| `SECRET`        | DA       | Dugačak nasumičan niz (potpisivanje prijave), 40+ znakova |
| `ADMIN_EMAILS`  | ne       | Admin nalozi, zarezom odvojeni. Podrazumevano `kaca9525@gmail.com` |
| `SMTP_USER`     | za mejl  | Gmail adresa sa koje se šalju potvrde i podsetnici |
| `SMTP_PASS`     | za mejl  | Gmail **App Password** |
| `STUDIO_EMAIL`  | ne       | Adresa na koju studio dobija obaveštenja (podrazumevano `SMTP_USER`) |
| `REMINDER_HOUR` | ne       | Sat slanja podsetnika za sutra (podrazumevano `18`) |
| `PORT`          | ne       | Port servera (hosting ga sam zada) |
| `DATA_DIR`      | ne       | Folder za bazu (uz trajni disk, npr. `/data`) |

Bez SMTP podešavanja aplikacija normalno radi, samo se mejlovi ne šalju.
Gmail App Password: uključite 2-Step Verification, zatim https://myaccount.google.com/apppasswords.

## Postavljanje na internet (Render.com)

1. Ovaj repozitorijum na GitHub-u
2. render.com → **New → Web Service** → povežite repo
3. Build Command `npm install` · Start Command `npm start`
4. Environment: bar `SECRET`; za mejlove `SMTP_USER` i `SMTP_PASS`
5. Deploy → javna adresa tipa `https://ritual-rezervacije.onrender.com`

Na Render **Free** planu disk nije trajan — za pravu produkciju Starter plan + Disk (`/data`, `DATA_DIR=/data`).

## Prvi koraci posle postavljanja

1. **Registracija** sa adresom iz `ADMIN_EMAILS` → nalog je automatski admin
2. Admin → **Podešavanja**: raspored, broj mesta na grupnom času, cene, kontakt
3. Admin → **Klijenti**: posle svake uplate evidentirajte paket (datum uplate pokreće 30 dana važenja)
4. Admin → **Raspored**: dnevni pregled, „Kasno otkazao“ (računa se kao iskorišćen), premeštanje, ručni upis

## Pravila ugrađena u aplikaciju

- trening 55 min; zakazivanje do 14 dana unapred (podesivo)
- otkazivanje najkasnije 12h pre termina; kasnije se računa kao iskorišćen
- paket važi 30 dana od uplate; admin može produžiti do 7 ili zamrznuti do 14 dana
- grupni čas do 5 osoba (podesivo); individualni/duo termini 1 rezervacija
- svaka ručna izmena se upisuje u istoriju klijenta

## Sigurnost

Lozinke su scrypt hash + so; prijava je httpOnly kolačić potpisan `SECRET`-om i važi 180 dana.
Server ponovo proverava svaku rezervaciju (raspored, kapacitet, 12h pravilo).
