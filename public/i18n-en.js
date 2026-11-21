/* Engleski prevod aplikacije Ritual Pilates Studio.
   Učitava se samo kada posetilac izabere engleski (zastavica u zaglavlju).

   EN       – kratki tekstovi: levo je srpski original (ključ, ne menjati), desno engleski prevod (slobodno menjati).
              {n}, {datum}, {ime}… su mesta gde aplikacija upisuje broj, datum ili ime; moraju ostati u prevodu.
   EN_HTML  – delovi sa linkovima (npr. saglasnost pri registraciji).
   EN_DOCS  – Pravilnik, Uslovi korišćenja i Politika privatnosti na engleskom (ceo tekst).
   Ako neki ključ nedostaje, aplikacija prikazuje srpski tekst. */
window.EN = {
  /* ---- zaglavlje, početna, meni ---- */
  "Ritual Pilates Studio · Zakazivanje": "Ritual Pilates Studio · Booking",
  "Online zakazivanje reformer pilates treninga u studiju Ritual, Dorćol, Beograd.": "Book reformer Pilates classes online at Ritual studio, Dorćol, Belgrade.",
  "Reformer pilates u Dorćolu. Grupni, individualni i duo treninzi od 55 minuta. Zakažite svoj termin online.": "Reformer Pilates in Dorćol, Belgrade. Group, private and duo classes of 55 minutes. Book your class online.",
  "pilates studio": "pilates studio",
  "· Dorćol": "· Dorćol",
  "Reformer pilates · Dorćol, Beograd": "Reformer Pilates · Dorćol, Belgrade",
  "telo. um.": "body. mind.",
  "ritual.": "ritual.",
  "Zakaži termin": "Book a class",
  "Ritual pilates studio": "Ritual pilates studio",
  "Prostor stvoren za vaše telo i um.": "A space made for your body and mind.",
  "Grupni, individualni i duo treninzi na reformeru, u trajanju od 55 minuta. Vreme rezervisano samo za vas.": "Group, private and duo reformer classes, 55 minutes each. Time reserved just for you.",
  "Cenovnik": "Prices",
  "Pravilnik": "Studio rules",
  "Zakaži": "Book",
  "Moji termini": "My bookings",
  "Kontakt": "Contact",
  "Admin": "Admin",
  "Studio Ritual": "Ritual studio",
  "Studio Ritual: reformeri ispod lučnih prolaza": "Ritual studio: reformers beneath arched passages",
  "O studiju": "About the studio",
  "Vežba na reformeru u studiju Ritual": "A reformer exercise at Ritual studio",
  "Glavni meni": "Main menu",
  "Pretraga usluga": "Search services",
  "Pretraži usluge…": "Search services…",
  "Obriši pretragu": "Clear search",
  "Admin panel: raspored, klijenti, podešavanja": "Admin panel: schedule, clients, settings",
  "Odjava": "Log out",
  "Prijava": "Log in",
  "Registracija": "Sign up",

  /* ---- zakazivanje ---- */
  "Zakažite svoj termin": "Book your class",
  "Svaki trening traje 55 minuta. Prijava je obavezna kako bi se obezbedilo mesto na reformeru.": "Every class lasts 55 minutes. Booking is required to secure your place on a reformer.",
  "Vrsta treninga": "Type of class",
  "Dan": "Day",
  "Vreme": "Time",
  "Učitavam termine…": "Loading classes…",
  "Vaša rezervacija": "Your booking",
  "Za zakazivanje je potreban nalog, kako biste videli svoje termine i stanje paketa.": "You need an account to book, so you can see your classes and your package balance.",
  "Ovo mi je prvi, probni trening": "This is my first, trial class",
  "Znam da se termin može otkazati najkasnije 12h ranije, a da se kasnije otkazan ili propušten trening računa kao iskorišćen.": "I understand that a class can be cancelled no later than 12 hours before, and that a class cancelled later or missed counts as used.",
  "Potvrdi rezervaciju": "Confirm booking",
  "Molimo dođite najmanje 5 min ranije. U slučaju kašnjenja trening se ne produžava.": "Please arrive at least 5 minutes early. If you are late, the class is not extended.",
  "Grupni": "Group",
  "do {n} osoba na reformerima": "up to {n} people on reformers",
  "Individualni": "Private",
  "1 na 1 sa trenerom": "1-on-1 with an instructor",
  "Duo": "Duo",
  "vas dvoje sa trenerom": "the two of you with an instructor",
  "Pozovi {tel}": "Call {tel}",
  "Individualni i duo treninzi se zakazuju po dogovoru sa studiom.": "Private and duo classes are booked by arrangement with the studio.",
  "{vrsta} trening · po dogovoru": "{vrsta} class · by arrangement",
  "Prijavite se": "Log in",
  " ili ": " or ",
  "napravite nalog": "create an account",
  " da biste poslali upit sa željenim terminima.": " to send a request with the times you would like.",
  "Npr. ponedeljak ili sreda posle 17h, ili subota pre podne": "E.g. Monday or Wednesday after 5 pm, or Saturday morning",
  "Pošalji upit": "Send request",
  "Upit je poslat. Studio vam se javlja da dogovorite termin.": "Your request has been sent. The studio will contact you to arrange a time.",
  "Koji dani i vreme vam odgovaraju?": "Which days and times suit you?",
  "Članarina": "Membership",
  "Broj termina": "Number of classes",
  "{n} termina": "{n} classes",
  "mesečno · dani i vreme po izboru": "per month · days and times of your choice",
  "Pojedinačno": "Single class",
  "jedan termin ili probni trening": "one class or a trial class",
  "jedan termin": "one class",
  "probni besplatno": "trial class free",
  "od {cena}": "from {cena}",
  "Rasporedi sve termine odjednom": "Schedule all classes at once",
  " · preostalo {n} · važi do {datum}": " · {n} left · valid until {datum}",
  " · nije plaćeno": " · not paid",
  ". Izaberite dan i termin.": ". Choose a day and a time.",
  "Potvrdi članarinu i termine": "Confirm membership and classes",
  "Izaberite vreme za {dan}.": "Choose a time for {dan}.",
  "Uključite dane u nedelji i za svaki izaberite vreme, pa ćete videti termine za ceo mesec.": "Turn on the days of the week and choose a time for each, and you will see your classes for the whole month.",
  "Zakazuje se {ok} od {n} termina": "{ok} of {n} classes will be booked",
  " · članarina važi od {od} do {do}": " · membership valid from {od} to {do}",
  " Još 1 termin zakazujete pojedinačno u kalendaru": " You book 1 more class separately in the calendar",
  " Još {n} termina zakazujete pojedinačno u kalendaru": " You book {n} more classes separately in the calendar",
  " ({n} popunjeno)": " ({n} full)",
  "Izaberite dane i vreme za svaki dan, sa slobodnim terminima.": "Choose days and a time for each day, with available classes.",
  "Izaberite način plaćanja.": "Choose a payment method.",
  "Potvrdite da znate pravila otkazivanja.": "Please confirm that you know the cancellation rules.",
  "Članarina je izabrana: zakazano {n} termina.": "Membership chosen: {n} classes booked.",
  "{n} preskočeno (popunjeno).": "{n} skipped (full).",
  " · poslali smo ih i na vaš e-mail.": " · we have also sent them to your email.",
  "{n} termina mesečno": "{n} classes per month",
  "Uključite dane u koje dolazite i za svaki dan izaberite vreme, npr. utorak i četvrtak u 19:00, subota u 09:00. Isti raspored se ponavlja svake nedelje do kraja članarine. Svaki termin kasnije možete promeniti ili otkazati najkasnije {h}h ranije.": "Turn on the days you will come and choose a time for each day, e.g. Tuesday and Thursday at 19:00, Saturday at 09:00. The same schedule repeats every week until the membership ends. You can later change or cancel any class no later than {h} hours before.",
  "Dani i vreme": "Days and times",
  "Prvi trening od": "First class from",
  "Plaćanje": "Payment",
  "Znam da se svaki termin može promeniti ili otkazati najkasnije {h}h ranije, a da se kasnije otkazan ili propušten trening računa kao iskorišćen.": "I understand that each class can be changed or cancelled no later than {h} hours before, and that a class cancelled later or missed counts as used.",
  "Za potvrdu članarine i termina potreban je nalog; izbor ostaje sačuvan.": "You need an account to confirm the membership and classes; your choice will be kept.",
  "Menjate termin: {dan} u {vreme}.": "Changing your class: {dan} at {vreme}.",
  "Izaberite novi dan i vreme": "Choose a new day and time",
  " (članarina važi do {datum})": " (membership valid until {datum})",
  "Odustani": "Cancel",
  "Trenutno nema slobodnih termina za ovu vrstu treninga.": "There are currently no available classes of this type.",
  "sve popunjeno": "all full",
  "Vaš termin": "Your class",
  "Prošao": "Past",
  "Na listi čekanja ✓": "On the waiting list ✓",
  "Popunjeno · obavesti me": "Full · notify me",
  "{n} od {cap} slobodno": "{n} of {cap} available",
  "Slobodno": "Available",
  "Prijavite se da bismo vas obavestili kad se termin oslobodi.": "Log in so we can let you know when a spot opens up.",
  "Javićemo vam mejlom čim se oslobodi mesto.": "We will email you as soon as a spot opens up.",
  "Uklonjeni ste sa liste čekanja.": "You have been removed from the waiting list.",
  "Termin je popunjen. Kliknite da dobijete mejl ako se oslobodi mesto.": "This class is full. Click to get an email if a spot opens up.",
  "Studio ne radi ovog dana.": "The studio is closed on this day.",
  "Novi termin · ": "New class · ",
  "{vrsta} trening · ": "{vrsta} class · ",
  "Potvrdi promenu termina": "Confirm the change",
  "umesto {dan} u {vreme}": "instead of {dan} at {vreme}",
  "Troši se iz članarine „{naziv}” (ostaje {n})": "Taken from your membership “{naziv}” ({n} left)",
  " · članarina još nije plaćena": " · membership not paid yet",
  "Probni trening · besplatno (akcija do {datum})": "Trial class · free (special offer until {datum})",
  "Probni trening · besplatno (akcija)": "Trial class · free (special offer)",
  "Probni trening": "Trial class",
  "Pojedinačni čas": "Single class",
  "izaberite način plaćanja": "choose a payment method",
  "uplata na račun": "bank transfer",
  "plaćanje u studiju": "payment at the studio",
  "besplatno (akcija)": "free (special offer)",
  "plaćeno": "paid",
  "nije plaćeno ({nacin})": "not paid ({nacin})",
  "u studiju": "at the studio",
  "Način plaćanja": "Payment method",
  "Uplata na račun": "Bank transfer",
  "podaci za uplatu stižu na e-mail odmah po rezervaciji": "payment details arrive by email right after booking",
  "Plaćanje u studiju": "Pay at the studio",
  "na licu mesta, pri dolasku na trening": "on site, when you arrive for class",
  "Podatke za uplatu na račun dobićete od studija.": "The studio will send you the bank transfer details.",
  "Kopirano": "Copied",
  "Kopiraj": "Copy",
  "Primalac": "Recipient",
  "Tekući račun": "Account number",
  "Svrha uplate": "Payment reference",
  "Iznos": "Amount",
  "U svrhu uplate dopišite i svoje ime. Kad studio evidentira uplatu, napomena „nije plaćeno” nestaje.": "Please add your name to the payment reference. Once the studio records the payment, the “not paid” note disappears.",
  "Podaci za uplatu": "Payment details",
  "Zatvori": "Close",
  "neradno": "closed",
  ", ima slobodnih termina": ", classes available",
  ", popunjeno": ", full",
  "Prethodni mesec": "Previous month",
  "Sledeći mesec": "Next month",
  "slobodni termini": "available",
  "popunjeno": "full",
  "izabrano": "selected",
  "Izaberite dan": "Choose a day",
  "Izaberite mesec i godinu": "Choose month and year",
  "Termin je promenjen: {dan} u {vreme}.": "Your class has been changed: {dan} at {vreme}.",
  "Rezervisano: {dan} u {vreme}. Vidimo se!": "Booked: {dan} at {vreme}. See you!",
  "Termin {dan} u {vreme}": "Class on {dan} at {vreme}",
  "Ritual · reformer pilates · 55 min": "Ritual · reformer Pilates · 55 min",
  /* razlozi zašto termin nije zakazan (plan članarine i fiksnih termina) */
  "nema termina u rasporedu": "no class in the schedule",
  "već zakazano": "already booked",
  "prošao": "past",
  "nema termina": "no classes",

  /* ---- moji termini, paketi ---- */
  "Svaki termin možete promeniti ili otkazati najkasnije 12h ranije. Kasnije otkazani ili propušteni treninzi računaju se kao iskorišćeni.": "You can change or cancel any class no later than 12 hours before. Classes cancelled later or missed count as used.",
  "Zakazani i održani treninzi": "Booked and attended classes",
  "Zakazano": "Booked",
  "Kasno otkazan": "Late cancellation",
  "Otkazan": "Cancelled",
  "Fiksni termini: ": "Fixed classes: ",
  "Ukini fiksne": "Remove fixed classes",
  "Otkazano {n} budućih termina.": "{n} upcoming classes cancelled.",
  "Fiksni raspored je ukinut.": "The fixed schedule has been removed.",
  "Potvrdi ukidanje": "Confirm removal",
  "Dolazite uvek u iste dane? Zakažite sve preostale treninge odjednom.": "Always coming on the same days? Book all your remaining classes at once.",
  "Postavi fiksne termine": "Set fixed classes",
  "Upiši i kada je termin popunjen (preko kapaciteta)": "Add even when a class is full (over capacity)",
  "Zakazuje se narednih {n} treninga po ovom obrascu, do isteka paketa ({datum}). Svaki termin možete posle pojedinačno otkazati po pravilniku.": "The next {n} classes will be booked in this pattern, until the package expires ({datum}). You can later cancel any single class according to the studio rules.",
  "Nema slobodnih termina po ovom obrascu do isteka paketa.": "There are no available classes in this pattern before the package expires.",
  "Prikaži plan": "Show plan",
  "Zakazano {n} fiksnih termina": "{n} fixed classes booked",
  "Potvrdi fiksne termine": "Confirm fixed classes",
  "Fiksni termini": "Fixed classes",
  " · preostalo {n}": " · {n} left",
  "Vrsta": "Type",
  "Od datuma": "From",
  "Fiksni termini?": "Fixed classes?",
  "{ime} je uplatio/la {naziv}.": "{ime} has paid for {naziv}.",
  "Uplaćen je {naziv}.": "{naziv} has been paid.",
  "Želite li automatsku rezervaciju svih uplaćenih termina u tačno određene dane u nedelji, u određeno vreme?": "Would you like all paid classes to be booked automatically on set days of the week, at a set time?",
  "Na primer: utorak i četvrtak u 19:00, subota u 09:00. Svaki termin se kasnije može pojedinačno otkazati ili pomeriti.": "For example: Tuesday and Thursday at 19:00, Saturday at 09:00. Any class can later be cancelled or moved on its own.",
  "Ne sada": "Not now",
  "Ne, zakazivaću sam/a": "No, I will book myself",
  "Da, izaberi dane": "Yes, choose days",
  "Isteklo {datum}": "Expired {datum}",
  "Iskorišćen": "Used",
  "Važi do {datum}": "Valid until {datum}",
  "Nije plaćeno": "Not paid",
  "produžen {n} d": "extended {n} d",
  "zamrznut {n} d": "frozen {n} d",
  "ručna korekcija {n}": "manual adjustment {n}",
  "Ukupno": "Total",
  "Iskorišćeno": "Used",
  "Preostalo": "Left",
  "Važi od {od} do {do}": "Valid from {od} to {do}",
  "uplata na račun još nije stigla": "bank transfer not received yet",
  "plaćanje u studiju, još nije plaćeno": "payment at the studio, not paid yet",
  "uplaćeno {datum}": "paid {datum}",
  "prvi trening {datum}": "first class {datum}",
  "još nije korišćen": "not used yet",
  "Termini: ": "Classes: ",
  "Napomena: ": "Note: ",
  " da biste videli svoje termine i paket.": " to see your classes and package.",
  "Nemate članarinu. ": "You don't have a membership. ",
  "Izaberite je pri zakazivanju": "Choose one when booking",
  ": 8 ili 12 termina mesečno, u dane i vreme koje vama odgovaraju.": ": 8 or 12 classes a month, on the days and at the times that suit you.",
  "Još nemate zakazanih termina. ": "You don't have any booked classes yet. ",
  "Zakažite prvi trening.": "Book your first class.",
  "Ne može se menjati": "Can't be changed",
  "{dan} u {vreme}": "{dan} at {vreme}",
  "Promeni": "Change",
  "Otkaži": "Cancel",
  "Termin je otkazan i trening je vraćen u članarinu.": "The class has been cancelled and returned to your membership.",
  "Termin je otkazan.": "The class has been cancelled.",
  "Potvrdi otkazivanje": "Confirm cancellation",
  "Potvrdi": "Confirm",
  "članarina nije plaćena": "membership not paid",
  "članarina „{naziv}”": "membership “{naziv}”",
  "probni trening": "trial class",
  "pojedinačni čas": "single class",
  "računa se kao iskorišćen ako izostanete": "counts as used if you don't come",
  "{vrsta} trening": "{vrsta} class",

  /* ---- prijava i registracija ---- */
  "Prijavite se da biste zakazivali termine i pratili svoj paket.": "Log in to book classes and keep track of your package.",
  "Nalog vam omogućava da zakazujete termine i vidite koliko vam je treninga ostalo u paketu.": "An account lets you book classes and see how many classes you have left in your package.",
  "Poslaćemo vam link za postavljanje nove lozinke.": "We will send you a link to set a new password.",
  "Upišite novu lozinku za svoj nalog.": "Enter a new password for your account.",
  "E-mail": "Email",
  "Lozinka": "Password",
  "Prijavi se": "Log in",
  "Nemate nalog?": "Don't have an account?",
  "Registrujte se": "Sign up",
  "·": "·",
  "Zaboravljena lozinka": "Forgot password",
  "Ime": "First name",
  "Prezime": "Last name",
  "Telefon": "Phone",
  "06x xxx xxxx": "+381 6x xxx xxxx",
  "Napravi nalog": "Create account",
  "Već imate nalog?": "Already have an account?",
  "Pošalji link za novu lozinku": "Send password reset link",
  "Nazad na prijavu": "Back to log in",
  "Nova lozinka": "New password",
  "Sačuvaj lozinku": "Save password",
  "Dobro došli, {ime}.": "Welcome, {ime}.",
  "Pre otvaranja naloga potrebno je da se upoznate sa Uslovima korišćenja i Politikom privatnosti i da ih prihvatite.": "Before creating an account, please read and accept the Terms of Use and the Privacy Policy.",
  "Bez saglasnosti sa Uslovima korišćenja i Politikom privatnosti nalog ne može da se napravi.": "An account can't be created without accepting the Terms of Use and the Privacy Policy.",
  "Nalog je napravljen. Dobro došli!": "Your account has been created. Welcome!",
  "Ako nalog postoji, link za novu lozinku je poslat na e-mail.": "If the account exists, a password reset link has been sent to the email.",
  "Lozinka je promenjena.": "Your password has been changed.",
  "Greška na serveru. Pokušajte ponovo.": "Server error. Please try again.",
  "Server nije dostupan. Osvežite stranicu.": "The server is not available. Please refresh the page.",

  /* ---- cenovnik ---- */
  "Svi treninzi traju 55 minuta. Članarina važi mesec dana od prvog treninga (npr. od 17.11. do 17.12.). Izaberite vrstu treninga, pa kliknite na cenu da zakažete.": "All classes last 55 minutes. A membership is valid for one month from the first class (e.g. from 17 Nov to 17 Dec). Choose the type of class, then click a price to book.",
  "1 na 1 ili duo sa trenerom": "1-on-1 or duo with an instructor",
  "Akcija važi do {datum}.": "Offer valid until {datum}.",
  "Prvi dolazak, jednokratno.": "First visit, one time only.",
  "Pojedinačni grupni čas": "Single group class",
  "Mesečne članarine": "Monthly memberships",
  "Članarina važi mesec dana od prvog treninga (npr. od 17.11. do 17.12.). Pri zakazivanju birate 8 ili 12 termina, dane u nedelji i vreme za ceo mesec; plaćanje uplatom na račun ili u studiju.": "A membership is valid for one month from the first class (e.g. from 17 Nov to 17 Dec). When booking, you choose 8 or 12 classes and the days and times for the whole month; pay by bank transfer or at the studio.",
  "{naziv}, {cena} dinara, zakaži": "{naziv}, {cena} dinars, book",
  "besplatno": "free",
  "akcija": "offer",
  "AKCIJA": "SPECIAL OFFER",
  "Zakaži probni trening": "Book a trial class",
  "Kasnije": "Later",

  /* ---- pravilnik, dokumenti, obrasci ---- */
  "Ritual Pilates Studio · važe od 1. decembra 2026.": "Ritual Pilates Studio · effective from 1 December 2026",
  "Uslovi korišćenja": "Terms of Use",
  "Politika privatnosti": "Privacy Policy",
  "Pravilnik studija": "Studio rules",
  "Obrasci": "Forms",
  "Sadržaj: Uslovi korišćenja": "Contents: Terms of Use",
  "Sadržaj: Politika privatnosti": "Contents: Privacy Policy",
  "Koje podatke čuvamo, zašto i koja prava imate · od 1. decembra 2026.": "What data we keep, why, and what rights you have · from 1 December 2026",
  "Obrazac reklamacije i obrazac odustanka od ugovora, za preuzimanje.": "Complaint form and contract withdrawal form, to download.",
  "Obrazac reklamacije": "Complaint form",
  "Ako smatrate da Usluga nije pružena u skladu sa ugovorom. Popunjen obrazac pošaljite na": "If you believe the Service was not provided in line with the contract. Send the completed form to",
  "ili ga predajte u Studiju (Uslovi korišćenja, tačka V.3.5).": "or hand it in at the Studio (Terms of Use, section V.3.5).",
  "Preuzmi (Word)": "Download (Word)",
  "Obrazac odustanka od ugovora": "Contract withdrawal form",
  "Za odustanak od ugovora zaključenog na daljinu u roku od 14 dana. Popunjen obrazac pošaljite na": "For withdrawing from a distance contract within 14 days. Send the completed form to",
  "ili poštom na adresu Studija (Uslovi korišćenja, tačka V.3.1).": "or by post to the Studio's address (Terms of Use, section V.3.1).",
  "Pročitao/la sam": "I have read it",
  "Ritual Pilates Studio · pročitajte pre registracije": "Ritual Pilates Studio · please read before signing up",
  "Dokument": "Document",
  "Uslovi i privatnost": "Terms and privacy",
  "Klikom na „Prihvatam” potvrđujete da ste upoznati sa Uslovima korišćenja i Politikom privatnosti (uključujući odeljak o kolačićima) i da ih prihvatate.": "By clicking “I accept” you confirm that you have read the Terms of Use and the Privacy Policy (including the section on cookies) and that you accept them.",
  "Prihvatam": "I accept",
  "Ne prihvatam": "I don't accept",
  "Uveli smo Uslove korišćenja i Politiku privatnosti. Da biste nastavili da koristite svoj nalog, potrebno je da potvrdite da ste upoznati sa njima.": "We have introduced Terms of Use and a Privacy Policy. To keep using your account, please confirm that you have read them.",
  "Bez saglasnosti nalog ne može da se koristi, pa ste odjavljeni.": "The account can't be used without your consent, so you have been logged out.",
  "Pravni dokumenti": "Legal documents",

  /* ---- kontakt, futer, kolačići ---- */
  "Reformer pilates, grupni, individualni i duo treninzi.": "Reformer Pilates: group, private and duo classes.",
  "Mapa se učitava sa Google Maps, koji pri tome može da postavi svoje kolačiće.": "The map loads from Google Maps, which may set its own cookies.",
  "Prikaži mapu": "Show map",
  "Mapa: Ritual Pilates Studio": "Map: Ritual Pilates Studio",
  "Navigacija": "Directions",
  "Radno vreme": "Opening hours",
  "zatvoreno": "closed",
  "Ritual Pilates Studio · Skenderbegova 53, Dorćol, Beograd": "Ritual Pilates Studio · Skenderbegova 53, Dorćol, Belgrade",
  "Obaveštenje o kolačićima": "Cookie notice",
  "Kolačići.": "Cookies.",
  "Koristimo samo neophodne kolačiće, za prijavu i rad rezervacija. Bez praćenja i reklama.": "We only use essential cookies, for logging in and for bookings. No tracking and no ads.",
  "U redu": "OK",

  /* ---- pretraga ---- */
  "Otvori": "Open",
  "{n} za „{q}”": "{n} for “{q}”",
  "Nema rezultata za „{q}”": "No results for “{q}”",
  "Probajte npr. „grupni”, „individualni”, „8 termina”, „probni” ili „radno vreme”.": "Try e.g. “group”, “private”, “8 classes”, “trial” or “opening hours”.",
  "probni trening · ": "trial class · ",
  "{n} treninga · ": "{n} classes · ",
  "1 trening · ": "1 class · ",
  " · mesečna članarina": " · monthly membership",

  /* ---- admin panel ---- */
  "Admin panel": "Admin panel",
  "Raspored": "Schedule",
  "Klijenti": "Clients",
  "Podešavanja": "Settings",
  "Ko je zakazan po terminima. „Kasno otkazao“ oslobađa mesto, a trening se računa kao iskorišćen. „Otkaži“ vraća trening u paket.": "Who is booked in each class. “Late cancel” frees the spot, and the class counts as used. “Cancel” returns the class to the package.",
  "Prethodni dan": "Previous day",
  "Sledeći dan": "Next day",
  "Izmeni termine za ovaj dan": "Change classes for this day",
  "Upišite vremena odvojena zarezom, npr. 08:00, 09:00. Ostavite prazno da taj dan nema takvih termina. Nedeljni raspored menjate u Podešavanjima.": "Enter times separated by commas, e.g. 08:00, 09:00. Leave empty if there are no such classes that day. You change the weekly schedule in Settings.",
  "Grupni časovi": "Group classes",
  "Individualni / duo": "Private / duo",
  "Sačuvaj za ovaj dan": "Save for this day",
  "Vrati nedeljni raspored": "Restore weekly schedule",
  "Klijenti i paketi": "Clients and packages",
  "Evidencija uplata, iskorišćenih i preostalih treninga. Svaka ručna izmena se upisuje u istoriju klijenta.": "Records of payments, used and remaining classes. Every manual change is written to the client's history.",
  "Pretraga": "Search",
  "Pretraži": "Search",
  "Ime, e-mail ili telefon": "Name, email or phone",
  "‹ Svi klijenti": "‹ All clients",
  "Podaci o studiju, broj mesta na grupnom času, nedeljni raspored i cene.": "Studio details, spots per group class, weekly schedule and prices.",
  " · posebno podešen raspored za ovaj dan": " · custom schedule for this day",
  "Ovog dana nema termina.": "No classes on this day.",
  "Individualni/duo · slobodno": "Private/duo · available",
  "Van rasporeda": "Outside the schedule",
  " · kasno otkazan": " · late cancellation",
  " (ostalo {n})": " ({n} left)",
  " · NIJE PLAĆENO": " · NOT PAID",
  "probni": "trial",
  "pojedinačni": "single",
  "Upisano kao plaćeno.": "Marked as paid.",
  "Plaćeno": "Paid",
  "Vrati": "Restore",
  "Kasno otkazao": "Late cancel",
  "Premesti": "Move",
  "Rezervacija je vraćena.": "The booking has been restored.",
  "Upisano kao kasno otkazivanje. Trening se računa kao iskorišćen.": "Recorded as a late cancellation. The class counts as used.",
  "Termin je otkazan, trening je vraćen u paket.": "The class has been cancelled and returned to the package.",
  "Termin je premešten.": "The class has been moved.",
  "Novi datum": "New date",
  "ipak upiši i ako je popunjeno": "add anyway, even if full",
  "Dodaj klijenta u termin…": "Add a client to this class…",
  "Izaberite klijenta.": "Choose a client.",
  "Klijent je upisan u termin.": "The client has been added to the class.",
  "Upiši": "Add",
  "Izaberite dan za pregled.": "Choose a day to view.",
  "Radno vreme: ": "Opening hours: ",
  "Raspored za ovaj dan je sačuvan.": "The schedule for this day has been saved.",
  "Vraćen je nedeljni raspored.": "The weekly schedule has been restored.",
  "Nema klijenata za tu pretragu.": "No clients match that search.",
  "Još nema registrovanih klijenata.": "No registered clients yet.",
  " · ostalo {n} · važi do {datum}": " · {n} left · valid until {datum}",
  "Nema aktivnu članarinu": "No active membership",
  "{a} zakazano · {b} održanih": "{a} booked · {b} attended",
  "nalog od {datum}": "account since {datum}",
  "jezik: engleski": "language: English",
  "Paketi": "Packages",
  "Klijent još nema članarinu.": "The client has no membership yet.",
  "npr. plaćeno gotovinom": "e.g. paid in cash",
  "Uplata je evidentirana.": "The payment has been recorded.",
  "Upiši uplaćenu članarinu": "Record a paid membership",
  "Za uplatu primljenu u studiju bez izbora u aplikaciji. Članarinu koju je klijent sam izabrao samo označite kao plaćenu na njenoj kartici.": "For a payment received at the studio without a booking in the app. A membership the client chose in the app only needs to be marked as paid on its card.",
  "Paket": "Package",
  "Datum uplate (početak važenja)": "Payment date (start of validity)",
  "Napomena": "Note",
  "Sačuvaj uplatu": "Save payment",
  "Termini": "Classes",
  "Nema rezervacija.": "No bookings.",
  "Paket za ovaj termin": "Package for this class",
  "Paket za termin je promenjen.": "The package for this class has been changed.",
  "bez paketa": "no package",
  "Upisano kao kasno otkazivanje.": "Recorded as a late cancellation.",
  "bez članarine": "no membership",
  "otkazao klijent": "cancelled by client",
  "otkazao studio": "cancelled by studio",
  "ostavite prazno": "leave empty",
  "Sačuvano. Javite klijentu novu lozinku.": "Saved. Let the client know the new password.",
  "Sačuvano.": "Saved.",
  "Podaci klijenta": "Client details",
  "Napomena (vidi samo studio)": "Note (visible to the studio only)",
  "Sačuvaj": "Save",
  "Istorija izmena": "Change history",
  "Razlog (upisuje se u istoriju)": "Reason (written to the history)",
  "Dana produženja": "Days of extension",
  "Dana zamrzavanja": "Days frozen",
  "Važi od": "Valid from",
  "Važi do": "Valid until",
  "Uplata je evidentirana, napomena „nije plaćeno” je uklonjena.": "The payment has been recorded and the “not paid” note removed.",
  "Evidentiraj uplatu": "Record payment",
  "Označeno kao neplaćeno.": "Marked as not paid.",
  "Označi kao neplaćeno": "Mark as not paid",
  "Upisan iskorišćen trening.": "A used class has been recorded.",
  "+1 iskorišćen": "+1 used",
  "Trening je vraćen u paket.": "The class has been returned to the package.",
  "Vrati 1 trening": "Return 1 class",
  "Obriši paket": "Delete package",
  "Paket je obrisan.": "The package has been deleted.",
  "Potvrdi brisanje": "Confirm deletion",
  "Produženje (do {n} d)": "Extension (up to {n} d)",
  "Zamrzavanje (do {n} d)": "Freeze (up to {n} d)",
  "Članarina je ažurirana.": "The membership has been updated.",
  "Adresa": "Address",
  "E-mail studija": "Studio email",
  "Mesta na grupnom času": "Spots per group class",
  "Zakazivanje unapred (dana)": "Booking ahead (days)",
  "Poruka za individualne/duo (po dogovoru)": "Message for private/duo (by arrangement)",
  "Ista poruka na engleskom": "Same message in English",
  "npr. 160-0000000000000-00": "e.g. 160-0000000000000-00",
  "Naslov akcije": "Offer title",
  "Tekst akcije": "Offer text",
  "Tekst dugmeta": "Button text",
  "Naslov akcije (engleski)": "Offer title (English)",
  "Tekst akcije (engleski)": "Offer text (English)",
  "Tekst dugmeta (engleski)": "Button text (English)",
  "Engleska polja vide posetioci koji su izabrali engleski jezik. Ako ostanu prazna, prikazuje se srpski tekst.": "Visitors who chose English see the English fields. If they are left empty, the Serbian text is shown.",
  "Fotografija {n}": "Photo {n}",
  "Fotografija": "Photo",
  "npr. trener@gmail.com": "e.g. trainer@gmail.com",
  " grupni": " group",
  " individualni": " private",
  "Podaci za uplatu na račun": "Bank transfer details",
  "Klijent pri rezervaciji bira uplatu na račun ili plaćanje u studiju; ovi podaci idu u mejl i u aplikaciju. Dok je račun prazan, nudi se samo plaćanje u studiju.": "When booking, the client chooses bank transfer or payment at the studio; these details go into the email and the app. While the account is empty, only payment at the studio is offered.",
  "Akcija (pop-up na otvaranju)": "Special offer (pop-up on opening)",
  "Akcija je uključena": "Offer is on",
  "Pristup adminu": "Admin access",
  "Stalni admin: {lista} (podešeno na serveru). Ovde dodajte adrese koje takođe treba da vide admin panel; osoba se registruje tom adresom i odmah dobija pristup.": "Permanent admin: {lista} (set on the server). Add other addresses that should see the admin panel here; the person signs up with that address and gets access right away.",
  "Dodatni admin nalozi (po jedna adresa u redu)": "Additional admin accounts (one address per line)",
  "Nedeljni raspored": "Weekly schedule",
  "Vremena početka odvojena zarezom. Prva kolona su grupni časovi, druga individualni i duo termini.": "Start times separated by commas. The first column is group classes, the second private and duo classes.",
  "Cene": "Prices",
  "Sačuvaj podešavanja": "Save settings",
  "Rezervna kopija svih podataka: ": "Backup of all data: ",
  "preuzmi JSON": "download JSON",
  "Podešavanja su sačuvana.": "Settings saved."
};

/* delovi teksta sa linkovima i dugmadima (ključ = data-i18n u index.html) */
window.EN_HTML = {
  consent: 'I confirm that I have read the <button type="button" class="link-in" data-consent="uslovi">Terms of Use</button> and the <button type="button" class="link-in" data-consent="privatnost">Privacy Policy</button> (including the section on cookies), as well as the <a href="#pravilnik" id="r-rules">studio rules</a>, and I agree to the processing of my data for booking classes.'
};

/* ---- pravni dokumenti na engleskom (HTML, isti raspored kao srpski u index.html) ---- */
window.EN_DOCS = {};

window.EN_DOCS.pravilnik = `
      <div>
        <h3>Class duration</h3>
        <ul>
          <li>One class lasts <strong>55 min</strong>.</li>
          <li>Please arrive at least 5 min <strong>early</strong> so that you can get ready for the class.</li>
          <li>If you are <strong>late</strong>, the instructors are not obliged to extend the class.</li>
        </ul>
      </div>
      <div>
        <h3>Validity of classes</h3>
        <ul>
          <li>A membership (8 or 12 classes) is valid for <strong>one month</strong> from its start date, e.g. from 17 Nov to 17 Dec, regardless of the number of days in the month.</li>
          <li>Payment is made <strong>by bank transfer</strong> (the details arrive by email when you book) or <strong>at the studio</strong> when you arrive. Until the payment is recorded, the booking shows a “not paid” note.</li>
          <li>In justified situations and by arrangement with the instructor, your membership can be <strong>extended</strong> by up to 7 days or <strong>frozen</strong> for up to 14 days.</li>
        </ul>
      </div>
      <div>
        <h3>Booking and cancellation</h3>
        <ul>
          <li>Booking a class is <strong>required</strong> to secure your place.</li>
          <li>If you cannot attend a class, you need to <strong>cancel</strong> it in time.</li>
          <li>A class can be cancelled or changed no later than <strong>12 hours</strong> before it starts, <strong>in the app or by phone</strong>.</li>
          <li>Classes that are not cancelled in time, or that the client does not attend, count as <strong>used</strong> and cannot be made up.</li>
        </ul>
      </div>
`;

window.EN_DOCS.uslovi = `
<p class="doc-meta">English translation · in case of any discrepancy, the Serbian version prevails</p>
<h3>I. Definitions</h3>
<p>In these Terms of Use, the following terms have the following meaning:</p>
<ul>
<li><strong>“Terms of Use”</strong> – the general terms of use of the Application and the special terms of providing the Services, set out in this document.</li>
<li><strong>“Provider”, “Studio”, “Ritual”, “we”</strong> – the entity named in Part IV.</li>
<li><strong>“Application”</strong> – the Studio's web application and tools, including the contact form and the online booking module.</li>
<li><strong>“User”, “you”</strong> – any person who uses the Application, books a class or buys a service.</li>
<li><strong>“Consumer”</strong> – a natural person who acquires services on the market for purposes not intended for their business or other commercial activity.</li>
<li><strong>“Services”</strong> – trial, private and group Pilates Trainings held at the Studio's premises, as well as training packages and memberships.</li>
<li><strong>“Training”</strong> – a single private or group Pilates training session.</li>
<li><strong>“Appointment”</strong> – the agreed date and time of a Training.</li>
<li><strong>“Package”</strong> – a paid set number of Trainings.</li>
<li><strong>“Membership”</strong> – a Service that entitles the User to Trainings within one membership cycle.</li>
<li><strong>“Application Content”</strong> – texts, photographs, videos, logos, graphics, design and other materials in the Application.</li>
<li><strong>“User Content”</strong> – any content the User submits to the Studio through the Application or social networks (messages, photographs, comments, reviews).</li>
</ul>
<h3>II. Subject, acceptance of the terms and entry into force</h3>
<p>These Terms of Use govern the conditions under which the Studio provides Services to Users, as well as the conditions for using the Application.</p>
<p>By using the Application, sending an enquiry, booking an Appointment or buying a Service, the User confirms that they have read these Terms of Use, understand them and accept them. If you do not agree with the Terms of Use, please do not use the Application and do not book Services.</p>
<p>The Terms of Use enter into force on the day they are published in the Application and apply until an amended version is published. Individual service contracts are governed by the version of the Terms of Use in force at the time the contract was concluded.</p>
<p>A contract for the provision of a Service is deemed concluded when the Studio confirms the Appointment (through the Application, by phone or by message) and the User pays in accordance with section V.2.2, or when the User pays for a Package or Membership, whichever happens first, and it lasts until the Service has been fully performed.</p>
<h3>III. General terms of using the Application</h3>
<p><strong>1. Age.</strong> The Application may be used, and Services booked, by persons older than 15. Persons older than 15 but younger than 18 may attend Trainings only with the written consent of a parent or guardian, who takes responsibility for the use of the Service. By accepting these Terms, you confirm that you are of age or that you have the consent of your legal representative.</p>
<p><strong>2. Registration and booking.</strong> Online booking is done through the Application, which requires opening a user account and entering the requested data.</p>
<p><strong>3. Accuracy of data.</strong> The User guarantees that the data they enter (name, contact phone, email address) are accurate, complete and up to date. The Studio is not responsible for missed Appointments or missing notifications caused by incorrectly entered data.</p>
<p><strong>4. Account security.</strong> The User is responsible for keeping their login details safe and for all actions taken through their account. The User must notify the Studio without delay of any unauthorised use of the account.</p>
<p><strong>5. Informative content.</strong> The content in the Application and on the Studio's social networks (about exercise, movement, nutrition and the like) is for information only and does not constitute medical advice, diagnosis or treatment. Before starting an exercise programme, especially if you have an existing health condition, consult a doctor.</p>
<p><strong>6. Technical requirements.</strong> To use the Application you need a device with internet access and an up-to-date web browser. The User bears the cost of the internet connection.</p>
<h3>IV. Information about the service provider</h3>
<p>In accordance with the Law on Electronic Commerce and the Law on Consumer Protection, we publish the following information:</p>
<ul>
<li><strong>Business name:</strong> MARINA IGNJATOVIĆ PR FITNES-PILATES STUDIO RITUAL PILATES STUDIO BEOGRAD (STARI GRAD)</li>
<li><strong>Legal form:</strong> sole proprietor (preduzetnik)</li>
<li><strong>Registered office and business premises:</strong> Skenderbegova broj 53, Stari Grad, 11158 Belgrade</li>
<li><strong>Tax ID (PIB):</strong> 115465457</li>
<li><strong>Registration number (matični broj):</strong> 68387361</li>
<li><strong>Register:</strong> entered in the register of the Serbian Business Registers Agency (APR), registration decision no. БП 206244/2025 of 5 January 2026</li>
<li><strong>Code and description of main activity:</strong> 93.13 – Fitness facilities</li>
<li><strong>Phone:</strong> +381 66 428 926</li>
<li><strong>Email:</strong> <a href="mailto:ritualstudio99@gmail.com">ritualstudio99@gmail.com</a></li>
<li><strong>Social networks:</strong> Instagram (@pilates__ritual)</li>
<li><strong>VAT status:</strong> not registered for VAT.</li>
</ul>
<h3>V. Special terms of providing the Services</h3>
<h4>1. Description of the Service, rights and obligations of the User</h4>
<p><strong>1.1. Description of the Services.</strong> The Studio provides private and group Pilates Trainings at its premises. The Trainings are recreational and are not a health service, therapy, physiotherapy treatment or rehabilitation. The types of Trainings, their duration, group size and schedule are published in the Application and available at the Studio.</p>
<p><strong>1.2. Prices and content of the Services.</strong> The description, content and price of single Trainings, Packages and Memberships are published in the Application and available at the Studio, and are expressed in Serbian dinars (RSD). The results of exercise depend on the User's individual characteristics, regularity and effort; descriptions of results are not a guarantee of any specific outcome.</p>
<p><strong>1.3. Health condition and adapting the Training.</strong> The User exercises in line with their own health condition and abilities and must follow the instructor's instructions. The User is not obliged to provide the Studio with information about their health. If the Training needs to be adapted to a health condition (e.g. pregnancy, injury, surgery, chronic illness, back or joint pain), the User is invited to inform the instructor in good time, and only to the extent necessary to adapt the exercises safely. If the User decides not to share this information, the Studio cannot adapt the Training to a health condition it has not been told about. It is recommended that the User consults a doctor before starting to exercise, and the Studio may ask for a doctor's opinion when it considers this necessary for safety. The Studio reserves the right to refuse or stop a Training if it considers that exercising could endanger the health of the User or other participants.</p>
<p><strong>1.4. Booking and arrival.</strong> An Appointment is booked through the online booking system in the Application, by phone or through social networks. Please arrive at the Training at least 5 minutes early. For group Trainings, entry after the class has started is possible no later than 5 minutes after the start, for safety reasons and out of respect for the other participants. Arriving late for a private Training shortens the Training without reducing the price.</p>
<p><strong>1.5. Booking through the Application and paying for Appointments.</strong> Booking through the Application is done in accordance with the general terms in Part III. An Appointment is paid in the full amount of the price of the chosen Service, in accordance with section V.2.2: by bank transfer after booking in the Application, or directly at the Studio, on site.</p>
<p><strong>1.6. Cancelling and rescheduling Appointments.</strong> An Appointment can be cancelled or rescheduled no later than 12 hours before the booked time, by phone or through the Application. If the Appointment is cancelled within this period, the User is offered a new Appointment or a refund of the amount paid. A shorter period does not leave enough time to offer the free place to another User, which is especially important for group Trainings with a limited number of places. In the event of cancellation after this period, or of not attending without notice, the Studio reserves the right to: (a) treat the Appointment as used within the Package or Membership; (b) refuse to book new Appointments without prior payment.</p>
<p><strong>1.7. Training packages.</strong> Packages (e.g. a package of 8 or 12 Trainings) are paid in full and used according to the schedule agreed between the User and the Studio. A Package is considered purchased, and can be used, only once the payment has been made. A Package is valid for 1 (one) month from the date it is first used (e.g. from 17 Nov to 17 Dec), regardless of the number of days in the month. Trainings not used by the end of this period expire. Exceptionally, the period can be extended by agreement and with the Studio's confirmation, for example in case of illness or injury, on presentation of an appropriate certificate. A Package is personal and cannot be transferred to a third party without the Studio's consent.</p>
<p><strong>1.8. Membership.</strong> A Membership entitles the User to Trainings within a monthly membership, to the extent published with the price of a single training or package, in accordance with the chosen service and in a one-month cycle. Unused Trainings from one monthly cycle are carried over to the next cycle in justified cases, by agreement with an authorised person of the Studio. A Membership is personal and cannot be transferred to a third party.</p>
<p><strong>1.9. Group Trainings.</strong> Groups have a limited number of places – 4 places per Appointment. The Studio reserves the right not to hold a group Training if the minimum number of participants does not sign up, in which case Users will be notified no later than 2 hours before the start and offered a new Appointment. The Studio reserves the right, for justified reasons, to replace the instructor or to change the time and content of the Training.</p>
<p><strong>1.10. Obligations of the User.</strong> The User must comply with these Terms, the Studio's rules of conduct, the instructor's instructions and hygiene measures; use the equipment for its intended purpose and with care; wear comfortable clothing and non-slip socks (or footwear intended for the Studio); not attend a Training under the influence of alcohol or psychoactive substances; not disturb other participants; stop exercising and inform the instructor if they feel pain, dizziness or other discomfort; and settle payment obligations on time. The User is liable for damage they cause to the Studio's equipment and premises intentionally or through negligence. A User showing signs of a contagious illness should refrain from coming to a Training.</p>
<p><strong>1.11. Photographs and recordings.</strong> Photographs and videos of the User are published only with the User's prior express written consent, which can be withdrawn at any time without consequences for the provision of the Services.</p>
<p><strong>1.12.</strong> The Studio reserves the right to remove content that is contrary to these Terms or the law.</p>
<h4>2. Prices, payment, membership and refunds</h4>
<p><strong>2.1.</strong> Prices are expressed in Serbian dinars (RSD) without VAT, as the provider is not registered for VAT, and apply at the time the contract is concluded. The Studio reserves the right to change prices; a change does not affect contracts already concluded and Services already paid.</p>
<p><strong>2.2. Payment methods.</strong> Appointments, Packages and Memberships are paid in full, in one of two ways: by bank transfer in line with the instructions received after booking in the Application, or directly at the Studio, on site, in cash or by payment card. A Package or Membership is considered purchased, and can be used, only once the payment has been made.</p>
<p><strong>2.3.</strong> For all payments, the Studio issues a fiscal receipt or another document in accordance with the fiscalisation regulations.</p>
<p><strong>2.4. Membership price and changes to it.</strong> The Membership price for each cycle equals the price in force on the first day of that cycle. The User will be informed of a change in the Membership price no later than 30 days before the start of the cycle in which the new price applies, and may stop using the Membership before that cycle begins.</p>
<p><strong>2.5. Refunds.</strong> When the User is entitled to a refund (cancelling an Appointment within the period in section V.1.6, cancellation of a Training by the Studio, inability to provide the Service or a justified withdrawal), the refund is made using the same means of payment that was used for the payment, without undue delay and no later than 14 days from the day the withdrawal statement was received or the day the right to a refund was established.</p>
<p><strong>2.6.</strong> If the Studio cancels or changes a booked Appointment for justified reasons (instructor illness, equipment failure, force majeure), the User is offered a new Appointment or a refund of the amount paid for the unused Service.</p>
<h4>3. Consumer rights</h4>
<p><strong>3.1. Right of withdrawal (14 days).</strong> A Consumer who concludes a distance contract (e.g. through the Application or by phone) has, in accordance with the Law on Consumer Protection, the right to withdraw from the contract within 14 days of its conclusion, without giving a reason. You can send the withdrawal statement to <a href="mailto:ritualstudio99@gmail.com">ritualstudio99@gmail.com</a> or by post to the Studio's address, using the withdrawal form available in the Application or any other unambiguous statement.</p>
<p><strong>3.2. Exceptions to the right of withdrawal.</strong> The Consumer has no right of withdrawal, among other cases:</p>
<ul>
<li>when the Service has been fully performed, if performance began with the Consumer's prior express consent and their acknowledgement that they will lose the right of withdrawal once the contract has been fully performed;</li>
<li>for services related to leisure activities (e.g. Trainings) where the contract provides for a specific date or period of performance, such as an individually booked and paid Appointment;</li>
<li>for digital content not supplied on a durable medium, if supply began with the Consumer's express consent and their acknowledgement that they thereby lose the right of withdrawal;</li>
<li>in other cases provided for by law.</li>
</ul>
<p><strong>3.3.</strong> If the Consumer withdraws from a service contract whose performance began at their express request during the withdrawal period, they must pay a proportionate part of the price for the Services provided up to that point. For Packages and Memberships without a set date of performance, Trainings may begin before the end of the withdrawal period only at the User's express request, made on a durable medium (e.g. by email or by a confirmation/booking in the Application). The proportionate amount for the Service provided is calculated on the basis of the agreed price and cannot exceed the market value of the Services provided.</p>
<p><strong>3.4. Contracts concluded on business premises.</strong> For Services agreed and paid directly at the Studio's premises, the right of withdrawal in section 3.1 does not apply, but the Consumer retains all rights based on conformity and complaints.</p>
<p><strong>3.5. Complaints.</strong> The Consumer has the right to file a complaint if they believe that the Service was not provided in accordance with the contract, because of an incorrectly calculated price or other defects. You can file a complaint orally at the Studio's premises at Skenderbegova broj 53, 11158 Belgrade, by phone, in writing to <a href="mailto:ritualstudio99@gmail.com">ritualstudio99@gmail.com</a> or on another durable medium, stating the User's details, the Service, the date it was provided and a description of the defect, and enclosing the receipt or other proof of the Service provided. The complaint form is available at the Studio and in the Application. The Studio immediately issues a written confirmation, or confirms electronically, that the complaint has been received, and states the number under which it has been entered in the register of received complaints. The Studio replies to the Consumer in writing or electronically without delay, and no later than 8 days from receiving the complaint. The reply contains the decision on whether the complaint is accepted, the reasons if it is not, a statement on the Consumer's request and a proposal for when and how the complaint will be resolved. The deadline for resolving a complaint cannot be longer than 15 days from the day it was filed. The Consumer must respond to the Studio's reply within three days of receiving it; if they do not respond, they are considered not to agree with the proposal. If, for objective reasons, the Studio cannot resolve the complaint within the deadline, the deadline may be extended only once, with notice to and the consent of the Consumer. The Studio keeps a register of received complaints. If the complaint is justified, the Consumer may request that the defect be remedied, the price reduced, the Service provided again or the contract terminated with a refund, in accordance with the law.</p>
<p><strong>3.6. Out-of-court resolution of consumer disputes.</strong> If the Consumer is not satisfied with the outcome of the complaint, they may start out-of-court resolution of the consumer dispute before an authorised body (mediator) entered in the register kept by the ministry responsible for consumer protection, and may also contact consumer protection associations.</p>
<p><strong>3.7.</strong> The provisions of these Terms do not exclude or limit the rights that the Consumer has under mandatory regulations.</p>
<h4>4. Limitation of liability</h4>
<p><strong>4.1.</strong> Prices, descriptions and availability of the Services may change.</p>
<p><strong>4.2.</strong> The Studio is not liable for damage resulting from:</p>
<ul>
<li>inaccurate, incomplete or withheld information about the User's health, or the User not informing the instructor of a condition that requires the Training to be adapted;</li>
<li>failing to follow the instructor's instructions before, during and after the Training, or exercising contrary to their recommendations;</li>
<li>exercising despite discomfort, pain or a doctor's advice to refrain from exercise;</li>
<li>loss of or damage to personal belongings left at the Studio's premises, unless the damage was caused intentionally or through gross negligence of the Studio.</li>
</ul>
<p><strong>4.3.</strong> Individual results of exercise vary and cannot be guaranteed.</p>
<p><strong>4.4.</strong> To the extent permitted by law, the Studio is not liable for indirect and consequential damage, loss of profit, lost opportunities or similar damage arising in connection with the provision of the Services, even if it was informed in advance of the possibility of such damage.</p>
<p><strong>4.5.</strong> Nothing in these Terms excludes the Studio's liability that cannot be excluded or limited under the law and mandatory regulations, including liability for damage caused intentionally or through gross negligence, and for injury to life and physical integrity caused by the Studio's fault.</p>
<h3>VI. User Content and licence</h3>
<p><strong>1.</strong> The User retains all rights to the content they submit to the Studio (messages, photographs, reviews, comments).</p>
<p><strong>2.</strong> By giving consent and submitting User Content intended for publication (e.g. a review, photographs from a training), the User gives the Studio express consent and a non-exclusive, non-transferable licence to display, store and use that content free of charge in the Application and on the Studio's official social networks, which can be withdrawn at any time by written request, except for content already published in printed or archived materials.</p>
<p><strong>3.</strong> The User guarantees that they hold the rights to the submitted content or have the necessary permission, and that the content does not infringe the rights of third parties or the law.</p>
<h3>VII. Prohibited conduct</h3>
<p>The User must not:</p>
<ul>
<li>use the Application in a way that is contrary to the law, these Terms or good business practice;</li>
<li>enter false, inaccurate or someone else's data, or impersonate anyone;</li>
<li>attempt unauthorised access to the Application, servers, databases or other people's accounts;</li>
<li>introduce or spread viruses, malicious code or content that may damage or disrupt the operation of the Application;</li>
<li>use automated tools (bots, scripts, scraping) without the Studio's written consent;</li>
<li>book Appointments in bulk or maliciously without intending to use them;</li>
<li>publish or send offensive, threatening, discriminatory, unlawful or misleading content, or content that infringes the rights of third parties;</li>
<li>copy, reproduce, distribute or commercially use Application Content, including the Studio's exercise programmes and materials, without prior written consent;</li>
<li>record, photograph or broadcast Trainings, staff or other Users at the Studio's premises without the consent of everyone present;</li>
<li>insult, harass or endanger the safety of staff and other Users.</li>
</ul>
<p>If these prohibitions are breached, the Studio may restrict or terminate access to the Application, refuse to provide the Service and take measures permitted by law.</p>
<h3>VIII. Intellectual property</h3>
<p><strong>1.</strong> Application Content, including the logo, name, visual identity, texts, photographs, videos, design, structure and program code, is protected by copyright and related rights and belongs to the Studio or to the persons from whom the Studio has obtained the right of use.</p>
<p><strong>2.</strong> The User is granted a limited, non-exclusive, non-transferable right to use the Application solely for personal, non-commercial purposes in accordance with these Terms.</p>
<p><strong>3.</strong> The Studio's exercise programmes, teaching and video materials and working techniques are the Studio's intellectual property and are intended solely for the User's personal use. Reproducing, publishing or reselling them is not permitted without the written consent of an authorised person of the Studio.</p>
<p><strong>4.</strong> Brand and product names mentioned in the Application belong to their owners.</p>
<h3>IX. Limitation of liability for the Application</h3>
<p><strong>1.</strong> The Application and informative content are provided “as is”. We take reasonable care to keep the information accurate and up to date, but we do not guarantee that it is complete and error-free at all times.</p>
<p><strong>2.</strong> The Studio is not liable for damage caused by technical faults, interruptions of the internet connection or the operation of third-party services (including social network services), force majeure, or the use of links to external third-party websites.</p>
<p><strong>3.</strong> To the extent permitted by law, the Studio is not liable for indirect and consequential damage arising in connection with the use of the Application.</p>
<h3>X. Availability, maintenance and account suspension</h3>
<p><strong>1.</strong> We try to keep the Application available at all times, but we do not guarantee uninterrupted or error-free access. The Studio may temporarily suspend the Application or some of its functions for maintenance, improvement or security reasons, and will try to inform Users in good time of planned longer interruptions.</p>
<p><strong>2.</strong> The Studio may temporarily or permanently restrict or terminate access to the Application or to the User's account, and may refuse bookings, in the event of a breach of these Terms, abuse, repeated unjustified absences or endangering the safety of staff and other Users. Where possible, the User will be informed of the reasons and will have the opportunity to respond.</p>
<p><strong>3.</strong> The User may stop using the Application at any time, and may request deletion of the account or data by sending a request to the email address in Part XIV, subject to the statutory periods for keeping records.</p>
<h3>XI. Protection of personal data</h3>
<p><strong>1.</strong> The Studio processes personal data in accordance with the Law on Personal Data Protection and other applicable regulations. Detailed information on the types of data collected, the purposes and legal basis of processing, retention periods, recipients of the data and the rights of data subjects (access, rectification, erasure, restriction of processing, portability, objection and withdrawal of consent) is set out in the Privacy Policy, available in the Application and at the Studio.</p>
<p><strong>2.</strong> Data about health are a special category of sensitive data. The Studio does not require them as a condition for using the Services. If the User voluntarily shares them so that the Training can be adapted, they are processed only to the extent necessary to adapt the exercises safely, on the basis of the User's express consent, which can be withdrawn at any time, and in accordance with the Privacy Policy.</p>
<p><strong>3.</strong> If you believe that your rights in relation to the processing of personal data have been violated, you can contact the Studio, and you have the right to lodge a complaint with the Commissioner for Information of Public Importance and Personal Data Protection.</p>
<h3>XII. Changes to the Terms and notifying Users</h3>
<p>The Studio reserves the right to change these Terms from time to time, in particular to bring them in line with regulations or with changes in its services, business or technical functionality.</p>
<p>Amended Terms are published in the Application with a new date of last change, and are also available at the Studio. The Studio informs the User of the changes in the Application and by email no later than 30 days before the changes start to apply. Changes concerning the price or content of a Membership apply from the next cycle at the earliest, and the User has the right to cancel the Membership before the changes start to apply. If the User does not agree with the changes, they may stop using the Application; continuing to use it after the changes start to apply is considered acceptance only if the User was previously notified in this way. Changes do not affect rights acquired under contracts already concluded and Services already paid.</p>
<h3>XIII. Governing law, competent court and final provisions</h3>
<p>These Terms and all relations between the Studio and the User are governed by the law of the Republic of Serbia. The parties will try to resolve disputes arising from these Terms amicably. If this is not possible, consumer disputes fall under the court determined by law, and other disputes under the court with subject-matter jurisdiction in Belgrade. The Consumer retains the right to out-of-court dispute resolution.</p>
<p>If any provision of these Terms proves to be null, invalid or unenforceable, this does not affect the validity of the other provisions. Such a provision will be replaced by a valid provision whose effect comes closest to the intention of the original provision.</p>
<p>These Terms, together with the Privacy Policy and all individual Appointment confirmations, offers and written agreements on Services, constitute the entire agreement between the Studio and the User. The Studio's failure to exercise any of its rights at a given moment does not mean that it waives that right. The User may not transfer their rights and obligations under these Terms to a third party without the Studio's written consent.</p>
<h3>XIV. Contact for questions and objections</h3>
<p>For any questions, remarks, objections, complaints and requests regarding these Terms and the Services, you can contact us:</p>
<ul>
<li><strong>Ritual Pilates Studio</strong></li>
<li><strong>Address:</strong> Skenderbegova br. 53, Belgrade-Stari Grad</li>
<li><strong>Phone:</strong> +381 66 428 926</li>
<li><strong>Email:</strong> <a href="mailto:ritualstudio99@gmail.com">ritualstudio99@gmail.com</a></li>
<li><strong>Instagram:</strong> Pilates__Ritual</li>
<li><strong>Opening hours:</strong> Monday-Friday: 08:00-21:00; Saturday 08:00-11:30.</li>
</ul>
<p>We reply to written enquiries within a reasonable time, and at the latest within the deadlines set by law.</p>
<h3>Date of last change</h3>
<p>These Terms of Use were last changed on 1 December 2026.</p>
`;

window.EN_DOCS.privatnost = `
<p class="doc-meta">RITUAL PILATES STUDIO BEOGRAD · English translation · in case of any discrepancy, the Serbian version prevails</p>
<p>This Privacy Policy explains what personal data we collect when you use our web application and the services of Ritual Pilates Studio (hereinafter: the Studio), why we process it, how long we keep it and what rights you have.</p>
<h3>1. Data controller</h3>
<p>The controller of personal data is MARINA IGNJATOVIĆ PR FITNES-PILATES STUDIO RITUAL PILATES STUDIO BEOGRAD (STARI GRAD), sole proprietor, registration no. (MB): 68387361, tax ID (PIB): 115465457, with its registered office at Skenderbegova broj 53, Stari Grad, 11158 Belgrade — hereinafter the “Studio” or the “Controller”, which operates as Ritual Pilates Studio. Contact: <a href="mailto:ritualstudio99@gmail.com">ritualstudio99@gmail.com</a>, +381 66 428 926.</p>
<h3>2. What data we collect</h3>
<p><strong>When you register:</strong> first name, last name, email address, phone number and password, which is stored only in a protected, unreadable form.</p>
<p><strong>When you book:</strong> the Trainings, Packages and Memberships you choose, the Appointment you want and the history of your bookings, including records of attendance and cancellations.</p>
<p><strong>When we provide services:</strong> data about your health that you voluntarily share with us and that the instructor needs in order to adapt the reformer Training to your needs and carry it out safely (e.g. pregnancy, injury, surgery, chronic illness, back or joint pain). We do not require this data as a condition for using the services, and we collect it only to the extent necessary to adapt the Training.</p>
<p><strong>Data on payments and transactions:</strong> records of payments for Appointments, Packages and Memberships, receipts and other information needed for accounting and financial purposes. We do not store payment card data.</p>
<p><strong>Data from communication:</strong> information you send us by email, phone, social networks or other communication channels.</p>
<p><strong>Photographs and videos,</strong> only when we receive your prior express written consent, for the purpose of promoting the Studio.</p>
<p><strong>Data on complaints and objections:</strong> information you provide when filing a complaint, a description of the Service it concerns, the reasons for dissatisfaction, the relevant communication and documentation needed to consider, resolve and record the complaint.</p>
<p><strong>Other personal data</strong> that you voluntarily provide to us in connection with our services and the use of the Application.</p>
<p>We collect and process only data that are relevant and necessary for specific, justified and lawful purposes.</p>
<h3>3. Purpose and legal basis of processing</h3>
<p>We process data in order to provide the Services, run your account in the Application, manage bookings, send booking confirmations and reminders by email, contact you about booked Services, keep track of Packages and Memberships and their renewal, record payments, keep business records and fulfil our legal obligations.</p>
<p>Depending on the purpose, the legal basis may be the performance of a contract or steps taken at your request before concluding a contract, your consent, compliance with legal obligations or our legitimate interest in organising and improving the business, provided that this interest does not override your rights and freedoms.</p>
<p>We process health data, as a special category of sensitive data, only on the basis of your express consent, only in order to adapt the Training, and subject to the additional conditions set by law. You can withdraw your consent at any time; refusing to share the data does not affect your right to use the Services, but in that case the Studio cannot adapt the Training to your health condition.</p>
<h3>4. Age of users</h3>
<p>The Application may be used by persons older than 15. Persons older than 15 but younger than 18 may attend Trainings with the consent of a parent or guardian. If you are under 18, please ask your parent or guardian to contact us at <a href="mailto:ritualstudio99@gmail.com">ritualstudio99@gmail.com</a> or +381 66 428 926, so that the Appointment and type of Service can be agreed with their consent.</p>
<h3>5. Access to data and sharing data with third parties</h3>
<p>We do not sell your data or share it with third parties for marketing purposes. Only authorised Studio staff (instructors and administration) have access, and health data are accessed only by the instructor who adapts your Training.</p>
<p>We may make data available to trusted business partners and service providers, only to the extent necessary for the Studio's operation: providers of IT, hosting and email services, Application maintenance, accounting and bookkeeping services and payment processing. We may provide personal data to competent state authorities and other authorised entities when we are required to do so by law or when there is another appropriate legal basis.</p>
<h3>6. Retention period</h3>
<p>We keep data for as long as necessary for the purposes for which they were collected and for as long as your account exists. At your request, data are deleted, except those we are legally required to keep, such as accounting records. Health data you have shared with us are deleted when there is no longer a need to adapt the Training, at your request or when you withdraw your consent.</p>
<p>When the prescribed or justified retention period expires, or when the data are no longer needed for a lawful purpose, personal data are securely deleted.</p>
<h3>7. Data security</h3>
<p>We apply reasonable technical and organisational measures to protect data from unauthorised access, loss and misuse. Passwords are stored only in a protected form, and only authorised persons have access to the data.</p>
<h3>8. Your rights</h3>
<ul>
<li><strong>Right of access</strong> – you can ask for information about which of your personal data we process, for what purpose and how long we keep them.</li>
<li><strong>Right to withdraw consent</strong> – if processing is based on consent, you can withdraw it at any time. This does not affect the lawfulness of processing carried out before the withdrawal.</li>
<li><strong>Right to rectification, completion and erasure</strong> – you can ask for inaccurate data to be corrected, completed or erased when the legal conditions are met.</li>
<li><strong>Right to restriction of processing</strong> – in certain cases you can ask for processing to be temporarily restricted.</li>
<li><strong>Right to data portability</strong> – in cases provided for by law, you can ask us to provide your data in a common electronic format.</li>
<li><strong>Right to object</strong> – in cases provided for by law, you can object to processing.</li>
<li><strong>Right to lodge a complaint</strong> – if you believe your data are being processed contrary to the law, you can lodge a complaint with the Commissioner for Information of Public Importance and Personal Data Protection of the Republic of Serbia.</li>
</ul>
<p>To exercise your rights, you can contact us at <a href="mailto:ritualstudio99@gmail.com">ritualstudio99@gmail.com</a>.</p>
<h3>9. Cookies</h3>
<p>The Application uses only essential cookies, without which it cannot work:</p>
<ul>
<li><strong>Login cookie</strong> – keeps you logged in to your account (lasts up to 180 days or until you log out) and is not used for tracking.</li>
<li><strong>Local browser storage</strong> – remembers small display settings on your device.</li>
</ul>
<p>We do not use analytics, marketing or third-party cookies. You can delete cookies in your browser settings; in that case you will need to log in again.</p>
<h3>10. Changes to the policy</h3>
<p>We inform you of changes to this Policy in the Application and at the Studio. By continuing to use the Application and the Services, you accept the version in force.</p>
<h3>11. Entry into force and application</h3>
<p>This Policy applies from the day it enters into force, 1 December 2026.</p>
`;
