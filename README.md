# FLYWEISS — website

Dvojezični statički sajt na Shipveli, na `https://www.flyweiss.com/`. Adresa bez www preusmerava na isti sajt uz očuvanje putanje i query parametara. Aktuelna predaja: 02.11.2026.

## Pokretanje i objava

Potreban je Node.js 20 ili noviji. Sajt nema dodatne pakete ili serverski runtime.

```sh
npm run build
npm run check
npm run dev
```

Server služi generisani `dist`; posle izmene izvora ponoviti build. Podrazumevani port je 4173; pregled ovog zadatka radi na 4177. Nemački je na `/`, engleski na `/en/`; `/de/` ostaje dostupna sa canonical oznakom na koren.

Git remote je `https://github.com/Flyweiss/FLYWEISS.git`. Koristiti postojeći GitHub nalog sa push pristupom tom repozitorijumu; aktivni globalni nalog može biti drugačiji. Ne menjati globalnu prijavu radi jednog push-a. Push na main ne pokreće objavu automatski. Nakon provera i push-a objaviti samo `dist` zvaničnim Shipvela CLI-jem:

```sh
shipvela publish dist --project 81e792de-8815-42db-9c57-27febf9f960f --json
```

Pratiti posao do `SUCCEED`, zatim uporediti sve javne fajlove sa buildom i proveriti DE/EN rute i preusmerenje domena. Za vraćanje prethodne verzije izgraditi prethodni Git commit i ponovo objaviti njegov `dist`.

## Izvori i najnoviji klijentski paket

- `src/index.html`: zajednički DE/EN raspored sa prevodnim placeholderima.
- `src/content.json`: aktuelni javni tekstovi i poruke forme.
- `src/legal-content.json`: DE/EN Impressum i politika privatnosti iz predaje od 03.11.2026, sa tehničkim usklađivanjem za Shipvela/AWS i Web3Forms.
- `src/legal.css`: dopune samo za pravne stranice; postojeći stilovi početne stranice se ne menjaju.
- `src/brief-copy.json`: kontrolna kopija efektivnih tekstova iz najnovije predaje.
- `src/styles.css`: postojeći header, forma, footer i pravni prikaz.
- `src/protein-future.css`: dostavljen Protein Future dizajn i prilagođavanja za postojeću aplikaciju.
- `src/app.js`: navigacija, promena jezika/slike, sedam native details sekcija, kopiranje adrese i forma.
- `src/contact-form.html`: postojeća Web3Forms forma sa javnim identifikatorom.
- `src/assets/`: odabrani javni mediji i favicon.
- `scripts/build.mjs`: generisanje stranica i eksplicitna lista javnih resursa.
- `scripts/verify.mjs`: tekstovi, prevodi, sekcije, rute, kvalifikacije grafikona i javni fajlovi.

Pregledana su tri paketa: FLYWEISS_PROTEIN_FUTURE_MIT_BANKGRAFIK_STEFAN, FLYWEISS_STEFAN_LOGO_OHNE_WEISS_FINAL i FLYWEISS_STEFAN_MODERNE_UEBERSCHRIFT_02-11-2026. DOCX predaja je identična u sva tri. Poslednji paket ima prednost za naslov i logo. Primenjeni su FLY/WEISS naslov u belo-zelenoj boji, transparentni horizontalni logo, tri ugovorna/investitorska stuba, tržišni prikaz, simbolična investitorska ilustracija i sedam informativnih sekcija koje se otvaraju pojedinačno ili zajedno. Raniji sadržaj nije dodat ponovo kao duplirana sekcija.

U novoj javnoj verziji nema imena proizvođača mašina. Proizvodna lokacija ostaje otvorena između više opcija u Srbiji. Sombor se pojavljuje kao registrovano sedište; naziv je po zahtevu korisnika prikazan kao FLYWEISS D.O.O. SOMBOR, uz nepromenjenu registarsku adresu. Desetogodišnji otkup odnosi se na ugovorene proizvode i količine, a odvojeni ugovor na snabdevanje jajima larvi. Direktno procentualno učešće u firmi navodi se kao mogućnost uz individualne ugovorne uslove, bez izmišljene fiksne kvote ili garantovanog prinosa.

Planirane mašine vrednosti oko 9 miliona evra i odgovornosti partnera preneti su iz klijentske predaje. Podrška oko 60% prihvatljivih investicionih troškova ostaje cilj uz uslov podobnosti i odobrenja. Mrežna nezavisnost je cilj energetskog planiranja. Kozmetičke, kolagenske i lepljive primene su razvojni potencijal; tehnička/komercijalna provera i uslovi primene ostaju vidljivi. Tehnička provera sajta ne potvrđuje originalne ugovore, vlasništvo, osiguranje ili status podsticaja.

Korisnik je 03.11.2026. potvrdio da je pravnik odobrio ovu pripremljenu DE/EN verziju sa Shipvela/AWS i Web3Forms izmenama. Potvrdio je i prijem poruka na `office@flyweiss.com` i odredište postojeće Web3Forms forme. Time je ispunjen njegov uslov za ranije traženi push na main i live objavu. Ove dve potvrde potiču od korisnika; tehnička provera nije uključivala slanje stvarnih poruka. DNS, hosting i pravila indeksiranja se ne menjaju.

## Grafikoni i slike

OECD/FAO Agricultural Outlook 2025–2034, odeljak 1.3.3, navodi oko 15% rasta ukupne svetske potrošnje stočne hrane merene proteinskim ekvivalentom. Izvor je proverena [zvanična publikacija](https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/07/oecd-fao-agricultural-outlook-2025-2034_3eb15914/601276cd-en.pdf). Oznaka prikazuje bazni period 2022–2024 i 2034; strelica je šematski prikaz ukupne prognoze, bez izmišljenih godišnjih vrednosti. To nije prognoza prihoda kompanije ili prodaje insekatskog proteina.

`investment-concept-de.webp` je dostavljena nemačka ilustracija. `investment-concept-en.webp` lokalizovana je ugrađenim ImageGen alatom, uz zadržavanje izgleda i prevod natpisa. Nalog i poreklo zabeleženi su u `output/imagegen/investment-concept-en.txt`. Krive i indeksne vrednosti su simbolične; vidljivi natpis uz grafiku na oba jezika navodi da nisu istorijski prinosi, prognoza prinosa, bezbednosti ili cena. Promena jezika menja i sliku i link za punu veličinu.

`flyweiss-logo-transparent.webp` je najnoviji dostavljeni logo sa pravom alpha transparentnošću. Nije generisan novi identitet. Originalna fabrička slika ostaje ista, sa vidljivom oznakom AI konceptualne vizualizacije. Privatni DOCX i kompletni klijentski paketi nisu deo repozitorijuma ili `dist`.

## Kontakt i pravne stranice

Javna adresa je `office@flyweiss.com`, sa mailto linkom i kopiranjem. Ranije autorizovana kontakt forma ostaje aktivna. Podaci idu direktno iz pregledača na Web3Forms; primalac zavisi od postojećeg javnog ključa i nije automatski promenjen javnom adresom. Obavezni su ime, važeći e-mail, poruka od najmanje deset znakova i saglasnost.

Uspeh forme zahteva uspešan HTTP odgovor i `success: true`. Odbijanje, HTTP 500/429, mrežna greška i timeout čuvaju unos. Kontrole su zaključane tokom slanja; nema automatskog ponavljanja. Promena jezika čuva otvorene sekcije i unos forme. Clipboard greška prikazuje uputstvo za ručno kopiranje.

Pripremljene kanonske rute su `/impressum/`, `/datenschutz/`, `/en/legal-notice/` i `/en/privacy/`. Ranije nemačke rute `/de/impressum/` i `/de/datenschutz/` ostaju kao identične kopije sa kanonskim adresama bez `/de/`. Footer i link privatnosti uz formu prate jezik, a pravne stranice menjaju jezik uz zadržavanje iste vrste dokumenta. Sadrže dostavljene registarske podatke, bez javnih internih napomena ili oznaka nacrta. `noindex, nofollow` i robots `Disallow: /` ostaju aktivni.

Tehnička provera 03.11.2026: `www.flyweiss.com` pokazuje na AWS CloudFront; HTTP zaglavlja i postojeći Shipvela projekat potvrđuju AWS Amplify hosting u `eu-central-1`. World4You je potvrđen za nameservere; to nije dokaz da se sadržaj sajta hostuje kod World4You. MX je `mail.flyweiss.com`, sa A zapisom `81.19.149.80`. To potvrđuje DNS za poštu, ali ne i postojanje/prijem konkretnog sandučeta.

U čistom pregledaču na live DE/EN stranicama nisu zabeleženi cookies, localStorage, sessionStorage ili spoljašnji zahtevi pri učitavanju. Kod koristi sistemske fontove i sopstvene resurse; nema analitike, marketinga, mapa, videa ili Captcha skripti. Web3Forms se poziva tek pri slanju. Provera forme simulira odgovor i ne šalje stvarne poruke. Korisnik je naknadno potvrdio da je postojeći Web3Forms ključ usmeren na `office@flyweiss.com` i da je prijem poruka potvrđen.

Usklađivanja sa predajom: zamenjen je planirani World4You hosting stvarnim Shipvela/AWS hostingom i uklonjena nedokazana tvrdnja o dvonedeljnom roku serverlogova; opisana je postojeća kontakt forma, poslata polja i tehnički metapodaci; dodati su Web3Forms i informacije iz njegovih objavljenih pravila o primaocima, međunarodnoj obradi i roku do tri godine. Ti navodi ne potvrđuju konkretan tarifni plan ili potpisan DPA. Zadržan je ranije traženi prikaz `FLYWEISS D.O.O. SOMBOR`; pravni naziv i ovlašćenja treba uporediti sa aktuelnim APR izvodom.

Završna pravna provera ove verzije i prijem poruka su potvrđeni od korisnika. Tehnička provera sama ne potvrđuje pravna ovlašćenja, ugovore, eventualno dejstvo DSGVO/člana 27, konkretne rokove čuvanja ili naloge pružalaca usluga. Ranije izdvojene stavke ostaju u internom izveštaju radi evidencije; nisu javni tekst niti novi zahtevi za odobrenje. Interne napomene nisu deo `dist`.

Predaja u ovoj poruci sadrži samo nalepljen tekst. ZIP i `START_HIER_Stefan.txt` nisu bili priloženi; sadržaj za javne stranice rekonstruisan je iz dostavljenih DE/EN odeljaka. Kompletan pregled sa izveštajem priprema se u `output/FLYWEISS_legal_review_2026-11-03.zip`, odvojeno od javnog build-a.

Provereni izvori za tehnička usklađivanja: [Shipvela privatnost](https://shipvela.com/privacy), [Web3Forms privatnost](https://web3forms.com/privacy), [Web3Forms DPA](https://web3forms.com/dpa) i [kontakt Poverenika](https://poverenik.rs/kontakt/?script=lat). U APR javnoj pretrazi potvrđeni su aktivan status, upisani naziv `FLYWEISS DOO SOMBOR`, MB `22162152` i sedište `Josićki put 85, 25000 Sombor`. U registru se i dalje vidi ranija iCloud adresa; na sajtu ostaje korisnički zadati `office@flyweiss.com`. Aktuelan overen izvod, PIB i način zastupanja nisu nezavisno potvrđeni; ti podaci ostaju preneti iz dostavljenog teksta.

## Provere

Build, check, sintaksa JavaScript-a i pregled diff-a obavezni su pre objave. `output/playwright/protein-future-checks.js` proverava oba jezika na širinama 320, 390, 560, 768, 1024, 1440 i 1920 px, sedam sekcija, tastaturu, kolektivno otvaranje/zatvaranje, dvojezične slike, investitorske CTA, mobilni meni i četiri pravne rute. Forma se proverava simuliranim odgovorima bez stvarnih mejlova. QA snimci i interni dokazi ostaju izvan javnog build-a.

`output/playwright/legal-pages-checks.js` proverava četiri kanonske pravne rute na 320, 390, 768 i 1440 px, oba smera promene jezika, footere, povratne linkove, dve stare nemačke adrese, rad bez JavaScript-a, službene mailto linkove i odsustvo internih oznaka. Simulacijom forme potvrđena su polja opisana u privatnosti. Poređenjem sa poslednjim live commitom potvrđeno je da su sadržaj početnih/investitorskih stranica (osim linka privatnosti), header, metapodaci, dva postojeća CSS fajla i svih 49 fajlova u `src/assets` nepromenjeni.
