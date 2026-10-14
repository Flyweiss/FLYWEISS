# FLYWEISS — radna verzija za pregled

Datum: 14.10.2026. Nije javno objavljena. Logo, tekstovi, vizualizacije i konačni kontakt podaci zahtevaju prihvatanje FLYWEISS.

## Pokretanje

Potreban je Node.js 20 ili noviji. Nema obaveznih dodataka, instalacije paketa ni plaćenih servisa.

```sh
npm run build
npm run check
npm run dev
```

Otvoriti `http://localhost:4173/de/` ili `http://localhost:4173/en/`. Posle promene izvora ponovo pokrenuti build i osvežiti pregled. Server služi generisani `dist`, bez automatskog osvežavanja.

## Struktura i sadržaj

Početna stranica ima sedam celina: početna, kompanija, tehnologija i proces, proizvodi i primena, održivost, partneri i investitori, kontakt. To je prva početna stranica za odobrenje; zasebne detaljne podstranice mogu se razviti posle prihvatanja početnog rasporeda.

- `src/index.html`: semantičke HTML komponente.
- `src/styles.css`: responzivni izgled, lokalni fontovi, fokus i reduced-motion podrška.
- `src/content.json`: kompletni DE/EN tekstovi. Naslovi, svi glavni pasusi, CTA i oznake polja provereni su prema završnom PDF-u od 14.10.2026. Marketinške dopune su uklonjene. `src/brief-copy.json` čuva provereni tekst; `npm run check` sprečava nenamernu promenu. Dizajnerske napomene iz PDF-a nisu pretvorene u javni reklamni sadržaj.
- `src/app.js`: jezik, navigacija, priprema lokalnog nacrta upita.
- `src/assets/`: vektorski logo, favicon, transparentni PNG, konceptualne slike i licence.
- `scripts/build.mjs`: generisanje DE/EN početne stranice, pravnih nacrta, sitemap i robots.
- `scripts/serve.mjs`: lokalni server.
- `scripts/verify.mjs`: provera prevoda, ruta i resursa.
- `dist/`: statički rezultat za budući hosting. Uključuje samo resurse koji se koriste.

Jezici su pripremljeni unapred na `/de/` i `/en/`, tako da osnovni sadržaj postoji i bez JavaScript-a. Jezički prekidač održava odabranu sekciju i podatke trenutno unete u obrazac. Postoje različiti naslovi, opisi, canonical i hreflang oznake.

Pravne stranice su `/de/impressum/`, `/de/datenschutz/`, `/en/legal-notice/`, `/en/privacy/`. To su jasno označeni nacrti sa podacima koje treba potvrditi, a ne gotovi pravni dokumenti. Preview koristi `noindex, nofollow` i robots `Disallow: /`. Predviđena domena `flyweiss.at` je korišćena za SEO pripremu; vlasništvo, DNS, hosting i aktivni HTTPS još nisu potvrđeni.

## Logo i vizuelni materijal

Važeća referenca logotipa je slika koju je korisnik dostavio 14. oktobra 2026. uz zahtev za zamenu: crni kružni luk i zelena segmentirana larva, sa natpisom FLYWEISS / PROTEIN • FUTURE. Ovaj zahtev zamenjuje prethodnu verziju logotipa sa listom.

Primenjena paleta: tamnozelena `#144D32`, zelena `#4BAA67`, svetlozelena `#CDE8D1`, siva `#6B7280`, bela `#FFFFFF`. Providnost ovih boja koristi se za linije, slojeve preko slika i blage pozadine. Font sajta je lokalni Montserrat; slova novog logotipa su vektorske putanje precrtane iz korisnikove slike.

`flyweiss-logo.svg` i `flyweiss-logo-stacked.svg` prate novi korisnikov logo od 14. oktobra 2026: crni kružni luk, zelena segmentirana larva i natpis FLYWEISS / PROTEIN • FUTURE. Konture znaka i slova su vektorizovane iz dostavljene slike; SVG sadrži samo putanje, bez ugrađene bitmap slike ili zavisnosti od fonta. `flyweiss-logo-horizontal.svg` koristi iste elemente u horizontalnom rasporedu za zaglavlje, a `flyweiss-logo-white.svg` belu verziju za tamno podnožje. `flyweiss-logo.png` je transparentni PNG u 2760 × 2040 px. Favicon prikazuje samo gornji simbol, bez slova, na beloj pozadini: SVG, PNG 32 × 32 i 512 × 512, ICO sa šest veličina i Apple Touch ikona 180 × 180. Samostalni paket se nalazi u `output/brand-protein-future/`.

Industrijske slike i prikaz larvi su postojeće AI ilustracije u radnom projektu. Prikazuju se uz DE/EN oznaku „Konceptualna vizualizacija planiranog projekta“. Nisu dokazi postojeće fabrike ili stvarnih proizvoda. Na strani su upotrebljene komprimovane WebP slike, sa manjim heroom za mobilni. Originali su zadržani u izvoru, ali se ne kopiraju u web build. Nisu preuzimane fotografije završnih proizvoda iz priloženog kolaža. Sve tri tematske kartice imaju pozadinsku sliku i isti raspored. Technology koristi postojeću industrijsku konceptualnu sliku. Partnership koristi novu AI ilustraciju razgovora o industrijskoj saradnji, generisanu ugrađenim imagegen alatom; original i prompt su u `src/assets/partnership-concept.png` i `partnership-concept-prompt.txt`. Ilustracija ne prikazuje stvarne partnere ili ugovore FLYWEISS.

Montserrat fontovi se služe lokalno. OFL licenca je u `src/assets/Montserrat-OFL.txt`. Repozitorijum sadrži izvor i resurse pregledane FLYWEISS verzije.

## Kontakt forma u pregledu

Forma ima ime, kompaniju, e-mail, oblast interesovanja, poruku i obaveznu potvrdu pročitanog obaveštenja. Validira obavezne podatke, ima skriveno honeypot polje i priprema pregled/tekstualno preuzimanje nacrta. Ne šalje e-mail, ne skladišti upite na serveru i ne prikazuje lažnu potvrdu slanja. Uneti podaci nestaju pri napuštanju/ponovnom učitavanju stranice; preuzeti nacrt ostaje kod korisnika. Nema kolačića ili analitike.

Za stvarno slanje treba potvrditi adresu primaoca i odabrati servis ili backend pod kontrolom FLYWEISS. Tada implementirati serversku validaciju, honeypot proveru, ograničenje broja zahteva, zaštitu od botova i odgovarajuće obaveštenje o obradi podataka. Samo klijentski honeypot nije dovoljna zaštita za javni servis. Ne dodavati plaćeni servis bez saglasnosti. Kontakt uvod iz briefinga opisuje budući javni rad; neposredno iznad forme jasno je označeno ponašanje trenutne radne verzije.

## Pregled i provere

Izvršene su provere sadržaja i izgradnje, oba jezika na širinama 320, 390, 768, 1024 i 1440 px, mobilnog menija, CTA za investitore, obavezne saglasnosti, lokalnog nacrta i njegovog preuzimanja, povratka kroz istoriju jezika i četiri pravne rute. Snimci desktopa i mobilnog prikaza nalaze se u predatom paketu. To je provera u Chromium pregledu; nije zasebna provera na fizičkom Android uređaju/iPhone-u niti u Safari/Firefox-u.

## Pre javnog puštanja

FLYWEISS treba da potvrdi:

1. Produkcionu upotrebu vektorske rekonstrukcije potvrđenog logotipa, DE/EN tekstove i pravo korišćenja vizualizacija.
2. Adresu firme, register podatke, zastupnika, kontakt i pravne tekstove.
3. Podržane proizvode/primene i dokumentovane tvrdnje o odobrenjima.
4. Hosting i domen na svojim nalozima, cenu i odgovornost za održavanje.
5. Način slanja upita, primaoca i zaštitu od spama.

Nakon toga pripremiti radni backend za upite, konačne pravne tekstove, HTTPS i produkcione sigurnosne postavke na izabranom hostingu; proveriti slanje i greške, DNS i HTTPS, robots/sitemap i glavne preglednike. Ukloniti `noindex` i `Disallow` tek u odobrenom produkcionom izdanju. Sitemap već sadrži planirane jezičke i pravne adrese. Metapodaci ne garantuju indeksiranje dok je pregled blokiran za pretraživače.

Nisu kreirani novi hosting nalozi, plaćene pretplate ili javne objave. Nema novih pristupnih podataka za predaju.

## Održavanje i primopredaja

Pre izmene sačuvati ceo izvor. Promeniti oba jezika u `content.json`, pokrenuti build i check, zatim proveriti desktop i mobilni prikaz. Sačuvati odobrenu verziju i sigurnosnu kopiju pre zamene fajlova na hostingu. Vratiti prethodni `dist` ako se problem pojavi. Kontrolisati domen, sertifikat i rad forme posle svake produkcione izmene. Ne upisivati tajne ili pristupne podatke u javni izvor.

Predaje se izvor, generisani build, vektorski i PNG logo, favicon, font licence i ovo uputstvo. Prava na prilagođeni dizajn, konačne slike i eventualne ugovorne uslove prenosa potvrditi u dogovoru sa izvođačem; kod i putanje su otvoreno uređivi, bez tehničke vezanosti za alat. Sve buduće pristupe predati bezbedno direktno FLYWEISS, izvan repozitorijuma.

## Provera doslovnog teksta — 14.10.2026

Proverene su obe jezičke verzije prema odeljcima 3 i 4 dostavljenog PDF-a. Sačuvane su reči, velika/mala slova i interpunkcija; za poređenje se uklanjaju samo prelomi redova i višestruki razmaci. Vraćeni su puni naslovi, pune navigacione oznake, druga hero CTA i nazivi polja. Uklonjeni su dopisani promotivni opisi, dodatna traka vrednosti, parafrazirana lista proizvoda i dodatni promotivni tekst uz održivost i partnere. Dijagram i tematske kartice koriste naslov ili doslovni izraz iz izvora.

Obavezne oznake konceptualnih AI slika, pristupačne oznake kontrola i poruke o radu lokalnog pregleda nisu klijentski marketinški tekst. One ostaju kao tehničke oznake. Pravne stranice nemaju odobrene klijentske pravne tekstove; ostaju nacrti. Forma još ne šalje poruke. Za logo važi najnoviji korisnikov zahtev od 14. oktobra 2026. i slika sa segmentiranom larvom i sloganom PROTEIN • FUTURE; postojeća paleta ostatka sajta ostaje ista.

Paket je namenjen slanju na pregled/odobrenje FLYWEISS, ne javnom puštanju produkcije.

## Hero prikaz — 14.10.2026

Hero koristi novu konceptualnu vizualizaciju eksterijera fabrike u sumrak, prema korisnikovoj referenci. Izrađena je ugrađenim imagegen alatom i označena kao koncept planiranog projekta. Slika je u `src/assets/hero-exterior.png`, WebP varijante u `hero-exterior.webp` i `hero-exterior-mobile.webp`, a prompt u `hero-exterior-prompt.txt`. Na desktopu slika ima neutralni sloj za čitljiv tekst; na mobilnom je odvojena slika iznad teksta, bez zelenog sloja. Uklonjena je oznaka Draft for approval / Entwurf zur Freigabe iz podnožja. Odobreni DE/EN website copy je sačuvan.

## Zamena logotipa — 14.10.2026

Novi simbol i slogan PROTEIN • FUTURE zamenjeni su u zaglavlju, podnožju i kružnom prikazu održivosti. Ugrađena oznaka na fasadi hero slike zamenjena je ugrađenim imagegen alatom, uz očuvanje kompozicije fotografije. Izmenjena fotografija je `src/assets/hero-exterior-new-logo.png`; za sajt se koriste desktop i mobilni WebP sa istim novim logom. Prethodni original ostaje sačuvan. Prompt je u `src/assets/hero-exterior-new-logo-prompt.txt`.

## Workspace archive

The complete current website is at the repository root. `output/` preserves the logo packages, review bundle, copy audit, and browser screenshots from the workspace. `archive/wbpe-copy/` preserves the earlier website source and build; `archive/workspace-package.json` preserves the original parent workspace scripts. Git metadata, local tool configuration, and macOS metadata are excluded.
