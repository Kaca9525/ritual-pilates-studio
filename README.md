# Ritual Pilates Studio — Rezervacije

Javna web aplikacija za online zakazivanje reformer pilates treninga: grupni, individualni i duo
termini od 55 min, nalozi klijenata, mesečne članarine (8 ili 12 termina) koje klijentkinje same biraju
zajedno sa danima i vremenom, izbor plaćanja (uplata na račun ili u studiju) sa napomenom „nije plaćeno”
dok se uplata ne evidentira, pravilnik i cenovnik, admin panel sa ručnim ispravkama i automatski
e-mail podsetnici.

Radi za neograničen broj realnih korisnika — klijentima je potreban samo link.

## Šta je u paketu

```
server.js          – ceo backend (Node.js + Express + SQLite)
public/index.html  – kompletna aplikacija koju korisnici vide
public/img         – fotografije studija, public/logo.svg – logo
seed/settings.json – početna podešavanja: raspored, cene, kapacitet, akcija, podaci za uplatu (učita se pri
                     prvom startu; kad se poveća polje "version", raspored, kapacitet, akcija i podaci za
                     uplatu se osveže i na postojećoj bazi)
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

1. **Registracija** sa adresom iz `ADMIN_EMAILS` → nalog je automatski admin; u meniju se pojavi kartica **Admin** (Raspored, Klijenti, Podešavanja)
   - još adresa sa admin pristupom: Admin → Podešavanja → „Pristup adminu” (osoba se registruje tom adresom)
2. Admin → **Podešavanja**: raspored, broj mesta na grupnom času, cene, kontakt, akcija (pop-up pri otvaranju)
   i **Podaci za uplatu na račun** (primalac, tekući račun, svrha). Dok račun nije upisan, klijentkinjama se
   nudi samo plaćanje u studiju.
3. Admin → **Klijenti**: klijentkinja sama bira članarinu i termine, a paket se upiše sa napomenom „nije plaćeno”.
   Kad uplata stigne (na račun ili u studiju), kliknite **Evidentiraj uplatu** i napomena nestaje.
   Ručni upis paketa (npr. za plaćanje gotovinom bez online rezervacije) i dalje postoji.
4. Admin → **Raspored**: dnevni pregled, „Kasno otkazao“ (računa se kao iskorišćen), premeštanje, ručni upis

## Pravila ugrađena u aplikaciju

- trening 55 min; zakazivanje do 14 dana unapred (podesivo)
- otkazivanje najkasnije 12h pre termina; kasnije se računa kao iskorišćen
- članarina: 8 ili 12 termina mesečno; klijentkinja za svaki dan u nedelji bira svoje vreme (npr. utorak
  i četvrtak u 19h, subota u 9h) i isti raspored se ponavlja svake nedelje do kraja članarine; pojedinačan
  termin može sama da promeni najkasnije 12h ranije
  (Moji termini → „Promeni”)
- članarina važi mesec dana od prvog termina do istog datuma sledećeg meseca (17.11. → 17.12., bez obzira
  na broj dana u mesecu); admin može produžiti do 7 ili zamrznuti do 14 dana
- plaćanje: uplata na račun (klijentkinja odmah dobija mejl sa primaocem, računom, svrhom i iznosom) ili
  plaćanje u studiju pri dolasku; rezervacija važi odmah, a napomena „nije plaćeno” stoji dok admin ne
  evidentira uplatu
- radno vreme na Kontaktu se računa iz rasporeda termina (npr. 08–11 i 18–21), pa je uvek usklađeno;
  Kontakt ima Google mapu sa dugmetom „Navigacija” i telefonom (adresa je ispod naziva, Instagram je u zaglavlju i podnožju)
- kartice u meniju, „Zakaži termin” na naslovnoj i dugmad u zelenoj traci vode pravo na izabrani deo (odmah ispod zaglavlja)
- listanje na telefonu i tabletu: bez paralakse i zamućenja, zrno pozadine je mala pločica, fotografije u karticama su manje verzije (`public/img/p/s`),
  pozadine kartice „Radno vreme” su unapred zamućene; Admin → Klijenti ima dugme „Pretraži” (radi i Enter)
- grupni čas do 4 osobe (podesivo); individualni i duo treninzi se zakazuju po dogovoru (upit stiže studiju mejlom)
- lista čekanja: kad je termin popunjen, klijentkinja klikne „obavesti me“; čim neko otkaže, svi sa liste dobijaju mejl da je termin ponovo slobodan (mesto dobija ko prvi zakaže)
- akcija: pop-up sa fotografijom i tekstom pri otvaranju; dok traje, probni trening se prikazuje kao besplatan
- svaka ručna izmena se upisuje u istoriju klijenta

## Sigurnost

Lozinke su scrypt hash + so; prijava je httpOnly kolačić potpisan `SECRET`-om i važi 180 dana.
Server ponovo proverava svaku rezervaciju (raspored, kapacitet, 12h pravilo).
