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
seed/settings.json – početna podešavanja: raspored, cene, kapacitet, akcija (učita se pri prvom startu;
                     kad se poveća polje "version", raspored, kapacitet i akcija se osveže i na postojećoj bazi)
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

Najlakše, jednim klikom preko `render.yaml` u repou:

1. render.com → **New → Blueprint** → izaberite repo `ritual-pilates-studio` → **Apply**
2. Render sam napravi web servis (Starter plan, Frankfurt), trajni disk `/data` za bazu i `SECRET`
3. Kad se traže vrednosti, upišite `SMTP_USER` (Gmail adresa) i `SMTP_PASS` (Gmail App Password); `STUDIO_EMAIL` može ostati prazno
4. Posle deploy-a adresa je tipa `https://ritual-pilates-studio.onrender.com`

Ručno (bez Blueprint-a): **New → Web Service**, Build `npm install`, Start `npm start`, Environment `SECRET`, `ADMIN_EMAILS`, `DATA_DIR=/data` + Disk na `/data`.

Na Render **Free** planu disk nije trajan — nalozi i rezervacije bi nestajali pri svakom deploy-u, zato Starter plan + Disk.

## Prvi koraci posle postavljanja

1. **Registracija** sa adresom iz `ADMIN_EMAILS` → nalog je automatski admin
2. Admin → **Podešavanja**: raspored, broj mesta na grupnom času, cene, kontakt, akcija (pop-up pri otvaranju)
3. Admin → **Klijenti**: posle svake uplate evidentirajte paket (datum uplate pokreće 30 dana važenja)
4. Admin → **Raspored**: dnevni pregled, „Kasno otkazao“ (računa se kao iskorišćen), premeštanje, ručni upis

## Pravila ugrađena u aplikaciju

- trening 55 min; zakazivanje do 14 dana unapred (podesivo)
- otkazivanje najkasnije 12h pre termina; kasnije se računa kao iskorišćen
- paket važi 30 dana od uplate; admin može produžiti do 7 ili zamrznuti do 14 dana
- grupni čas do 4 osobe (podesivo); individualni i duo treninzi se zakazuju po dogovoru (upit stiže studiju mejlom)
- lista čekanja: kad je termin popunjen, klijentkinja klikne „obavesti me“; čim neko otkaže, svi sa liste dobijaju mejl da je termin ponovo slobodan (mesto dobija ko prvi zakaže)
- akcija: pop-up sa fotografijom i tekstom pri otvaranju; dok traje, probni trening se prikazuje kao besplatan
- svaka ručna izmena se upisuje u istoriju klijenta

## Sigurnost

Lozinke su scrypt hash + so; prijava je httpOnly kolačić potpisan `SECRET`-om i važi 180 dana.
Server ponovo proverava svaku rezervaciju (raspored, kapacitet, 12h pravilo).
