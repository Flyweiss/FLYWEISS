# FLYWEISS — website

Aktuelno: 01.11.2026. Dvojezični statički sajt na Shipveli, na `https://www.flyweiss.com/`. Adresa bez www preusmerava na isti sajt uz očuvanje putanje i query parametara.

## Pokretanje i objava

Potreban je Node.js 20 ili noviji. Sajt nema dodatne pakete ili serverski runtime.

```sh
npm run build
npm run check
npm run dev
```

Lokalni pregled: `http://localhost:4173/` za nemački i `/en/` za engleski. Server služi generisani `dist`; posle izmene izvora ponoviti build. `/de/` ostaje dostupna sa canonical oznakom na koren sajta.

Projekt je vezan kroz `shipvela.json`. Git push ne pokreće objavu automatski. Posle provera i push-a na `main`, objaviti samo folder `dist` zvaničnim Shipvela CLI-jem:

```sh
shipvela publish dist --project 81e792de-8815-42db-9c57-27febf9f960f --json
```

Pratiti posao do `SUCCEED`, zatim proveriti aktivni domen i uporediti objavljene fajlove sa buildom. Za vraćanje prethodne verzije izgraditi prethodni Git commit i ponovo objaviti njegov `dist`.

## Izvor i klijentski paket

- `src/index.html`: raspored i prevodni placeholderi.
- `src/content.json`: javni DE/EN tekstovi i poruke interfejsa.
- `src/brief-copy.json`: kontrolna kopija odobrenih javnih tekstova.
- `src/contact-form.html`: forma sa javnim Web3Forms identifikatorom.
- `src/app.js`: navigacija, jezici, kopiranje adrese i slanje forme.
- `src/styles.css`: responzivni izgled sa sistemskim fontovima.
- `src/assets/`: slike, vektorski logo, ilustracije i favicon.
- `scripts/build.mjs`: generisanje stranica i dozvoljenih javnih resursa.
- `scripts/verify.mjs`: tekstovi, rute, slike, prevodi, metapodaci i javni fajlovi.
- `output/playwright/`: scenariji i snimci provera koji nisu deo javnog sajta.

Izgled i javni tekstovi prate klijentski paket od 01.11.2026: tamno zaglavlje, veliki fabrički motiv i sekcije kompanija, proizvodni pristup, planirani proizvodi, partnerstva i kontakt. Na telefonu slika prethodi tekstu. Logo prati postojeću referencu sa larvom i sloganom PROTEIN • FUTURE. Prethodni izvor je sačuvan u Git istoriji.

Lokacija i fabrička zgrada opisane su kao postojeće, a početak proizvodnje je u pripremi. Rok od deset godina za dobavljanje i otkup korisnik je izričito potvrdio za javnu objavu; tekst zadržava pripisivanje upravi. Energetska nezavisnost ostaje cilj. Nisu dodati finansijski iznosi, kapaciteti ili tehnički parametri.

`factory-hero.webp` i `factory-hero-mobile.webp` su dostavljene varijante konceptualne slike sa vidljivom HTML oznakom. Ilustracije larvi i frasa prenete su iz klijentovog koda kao SVG. Nema automatskog videa, slajdera, animacija, analitike, mapa ili eksternih fontova.

Originalni DOCX, interni priručnik, izvori i ceo klijentski paket nisu kopirani u repozitorijum ili javni build. Objavljuje se samo `dist`.

## Kontakt

Javna adresa je `office@flyweiss.com`, sa mailto linkom i kopiranjem. Odbijen pristup clipboardu prikazuje uputstvo za ručno kopiranje.

Forma ostaje aktivna prema prethodnom korisnikovom zahtevu. Podaci idu iz pregledača na `https://api.web3forms.com/submit`. Primalac je adresa povezana sa postojećim ključem; javna kontakt adresa ne menja automatski primaoca. Ključ je javni identifikator prema [dokumentaciji servisa](https://docs.web3forms.com/getting-started/faq).

Obavezni su ime, važeći e-mail, poruka od najmanje deset znakova i saglasnost. Tokom slanja kontrole su zaključane. Uspeh zahteva uspešan HTTP odgovor i `success: true`; tek tada se polja prazne. Odbijanje, ograničenje zahteva, mrežna greška i timeout od 20 sekundi čuvaju unos. Nema automatskog ponavljanja. Sva stanja prate odabrani jezik, uključujući promenu jezika tokom slanja.

Polja `website` i `botcheck` služe kao honeypot; obradu spama i ograničenja pruža Web3Forms. Dodatna CAPTCHA i plaćene funkcije nisu dodate. Bez JavaScript-a forma koristi standardni POST i stranicu servisa za rezultat.

Stvarni test pre redizajna: `FLYWEISS-LIVE-2026-11-01T20:55:03.518Z`. Web3Forms je prihvatio jednu probnu poruku i forma je ispraznila polja. Prijem u sandučetu nije zasebno potvrđen. Dokaz je u `output/playwright/contact-live-success.png` i `web3forms-live-result.json`.

## Pravne stranice

Rute su `/de/impressum/`, `/de/datenschutz/`, `/en/legal-notice/` i `/en/privacy/`. Podaci iz klijentskog paketa prikazani su uz oznaku da aktuelni registarski podaci i završni tekstovi zahtevaju potvrdu. Kontakt koristi noviju adresu koju je dao korisnik.

Privatnost opisuje stvarnu formu, Web3Forms, Shipvela hosting i e-poštu. Nije preuzeta tvrdnja predloška da nema forme. Tekstovi nisu predstavljeni kao završeni pravni dokumenti. Postojeći `noindex, nofollow` i robots `Disallow: /` ostaju aktivni do odgovarajuće potvrde. Canonical, hreflang i sitemap koriste aktivni domen; nemački canonical je `/`, engleski `/en/`.

## Provere 01.11.2026.

Build, check i sintaksa generisanog JavaScript-a prolaze. `refresh-checks.js` proverava oba jezika na širinama 320, 390, 560, 768, 1024, 1440 i 1920 px, položaj slike i oznake, overflow, navigaciju, kopiranje sa uspehom i greškom, metapodatke, partnerski CTA i četiri pravne rute. Nema JavaScript runtime grešaka.

`contact-flow.js` proverava obavezna polja, saglasnost, honeypot, payload, dupli zahtev, promenu jezika tokom slanja, uspeh, API odbijanje, HTTP 500/429, mrežnu grešku i očuvanje unosa. Regresione provere simuliraju odgovore i ne šalju dodatne mejlove.
