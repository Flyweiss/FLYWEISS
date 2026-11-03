import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const content = JSON.parse(await readFile(resolve(root,'src/content.json'),'utf8'));
const brief = JSON.parse(await readFile(resolve(root,'src/brief-copy.json'),'utf8'));
const legalContent = JSON.parse(await readFile(resolve(root,'src/legal-content.json'),'utf8'));
const legalPaths = {de:{legal:'/impressum/',privacy:'/datenschutz/'},en:{legal:'/en/legal-notice/',privacy:'/en/privacy/'}};
const approved = brief.copy;
for (const lang of ['de','en']) {
  for (const [key,value] of Object.entries(content[lang])) {
    if (/sombor/i.test(value) && !['location','privacyController'].includes(key)) throw new Error('Registered office used as a fixed production site: ' + lang + '/' + key);
    if (lang === 'en' && /\bSerbien\b/.test(value)) throw new Error('Untranslated country name: ' + key);
  }
  for (const [key,exact] of Object.entries(approved[lang])) {
    if (content[lang][key] !== exact) throw new Error('Copy differs from client handoff: ' + lang + '/' + key);
  }
  if (brief.core) {
    const actual = {
      headline:content[lang].headline1 + ' ' + content[lang].headline2,
      sub:content[lang].homeCopy,
      cta:content[lang].learnMore + ' | ' + content[lang].heroSecondary,
      invest:content[lang].investmentCopy,
      subsidy:content[lang].fundingCopy
    };
    for (const [key,exact] of Object.entries(brief.core[lang])) {
      if (actual[key] !== exact) throw new Error('Latest core text differs: ' + lang + '/' + key);
    }
  }
}
if (JSON.stringify(Object.keys(content.de).sort()) !== JSON.stringify(Object.keys(content.en).sort())) throw new Error('Language keys differ');

async function verifyPage(path) {
  const html = await readFile(resolve(root,'dist',path),'utf8');
  if (/\{\{\w+\}\}/.test(html)) throw new Error('Unresolved template: ' + path);
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)) await access(resolve(root,'dist',match[1].slice(1)));
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) await access(resolve(root,'dist',candidate.trim().split(/\s+/)[0].slice(1)));
  }
  for (const match of html.matchAll(/href="#([^"]+)"/g)) if (!html.includes('id="' + match[1] + '"')) throw new Error('Broken anchor: ' + path + '#' + match[1]);
  if (!html.includes('content="noindex, nofollow"')) throw new Error('Indexing protection missing: ' + path);
  if (html.includes('flyweiss@icloud.com') || html.includes('formPrivacy')) throw new Error('Outdated contact information: ' + path);
  if (/ENTWURF|\bDRAFT\b|Interne Einbau|Freigabeliste|legalPreview|privacyPending|vor dem öffentlichen Start|before public launch/i.test(html)) throw new Error('Internal legal review note is public: ' + path);
  return html;
}
for (const lang of ['de','en']) {
  const html = await verifyPage(lang + '/index.html');
  for (const match of html.matchAll(/data-i18n(?:-aria|-placeholder|-alt)?="([\w]+)"/g)) {
    if (!content[lang][match[1]]) throw new Error('Missing ' + lang + ' translation: ' + match[1]);
  }
  for (const id of ['start','contracted-offtake','vorteile','markt','investmentvergleich','details','vertraege','unternehmen','produktion','technologie','produkte','nachhaltigkeit','investition','kontakt','contact-form']) {
    if (!html.includes('id="' + id + '"')) throw new Error('Missing section or form: ' + id);
  }
  if (!/<\/section>\s*<section\b[^>]*\bid="contracted-offtake"/.test(html.slice(html.indexOf('id="start"'), html.indexOf('id="unternehmen"')))) throw new Error('Contract section must immediately follow hero');
  if ((html.match(/<details\b/g) || []).length !== 7) throw new Error('Seven information disclosures are required');
  if (!html.includes('data-open-all') || !html.includes('data-close-all')) throw new Error('Disclosure controls missing');
  if (!html.includes('investment-concept-' + lang + '.webp')) throw new Error('Localized investment artwork missing');
  if (/Reploid|REPLOID/.test(html)) throw new Error('Removed manufacturer name is public');
  if (!html.includes(content[lang].bankCaptionCopy)) throw new Error('Symbolic investment graphic qualification missing');
  if (!html.includes('lang="' + lang + '"') || !html.includes(content[lang].homeCopy)) throw new Error('Language not prerendered');
  if (!html.includes('mailto:office@flyweiss.com')) throw new Error('Office email missing');
  if (!html.includes('https://api.web3forms.com/submit')) throw new Error('Contact form endpoint missing');
  if (!html.includes('factory-hero-mobile.webp')) throw new Error('Responsive factory image missing');
  for (const [kind,path] of Object.entries(legalPaths[lang])) {
    if (!html.includes('href="' + path + '" data-legal="' + kind + '"')) throw new Error('Incorrect legal link: ' + lang + '/' + kind);
  }
}
await verifyPage('index.html');
for (const lang of ['de','en']) {
  for (const kind of ['legal','privacy']) {
    const path = legalPaths[lang][kind];
    const html = await verifyPage(path.slice(1) + 'index.html');
    if (!html.includes('class="legal-main"')) throw new Error('Missing legal content');
    if (!html.includes('FLYWEISS D.O.O. SOMBOR') || !html.includes('Josićki put 85')) throw new Error('Registered company details changed: ' + path);
    if (!html.includes('rel="canonical" href="https://www.flyweiss.com' + path + '"')) throw new Error('Incorrect legal canonical: ' + path);
    if (!html.includes('<h1>' + legalContent[lang][kind].title + '</h1>')) throw new Error('Incorrect legal heading: ' + path);
    if (html.includes('<script')) throw new Error('Legal pages must work without JavaScript: ' + path);
    for (const target of ['de','en']) {
      if (!html.includes('href="' + legalPaths[target][kind] + '" data-lang="' + target + '"')) throw new Error('Language switch changes legal document: ' + path);
    }
    if (kind === 'legal') {
      for (const value of ['Andria Mitić','Martin Kurt Holzer','22162152','115468829']) if (!html.includes(value)) throw new Error('Company detail missing: ' + value);
    } else {
      if ((html.match(/<section class="privacy-block">/g) || []).length !== 9) throw new Error('Privacy notice requires all nine sections');
      for (const value of ['Shipvela','Content Petit LLC','Amazon CloudFront','Web3Forms','Web3Creative','https://web3forms.com/dpa','office@poverenik.rs']) if (!html.includes(value)) throw new Error('Processing disclosure missing: ' + value);
      if (/World4You|two weeks|zwei Wochen/.test(html)) throw new Error('Outdated hosting or retention claim: ' + path);
    }
    if (lang === 'de') {
      const alias = await verifyPage('de' + path + 'index.html');
      if (alias !== html) throw new Error('Legacy German legal route differs: ' + path);
    }
  }
}
async function auditPublicFiles(directory) {
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    const path = resolve(directory,entry.name);
    if (entry.isDirectory()) await auditPublicFiles(path);
    else if (!/\.(html|css|js|webp|svg|png|ico|txt|xml)$/.test(entry.name)) throw new Error('Unexpected public file: ' + entry.name);
  }
}
await auditPublicFiles(resolve(root,'dist'));
const js = await readFile(resolve(root,'dist/app.js'),'utf8');
if (/WBPEF|Western Balkans Private Equity|office@wbpe|googletagmanager|__CONTENT__|flyweiss@icloud\.com|reploid|legalPreview|privacyPending|\bDRAFT\b|ENTWURF/i.test(js)) throw new Error('Outdated content or unresolved script');
console.log('Verified client copy, ' + Object.keys(content.de).length + ' translations per language, DE/EN routes, legal pages, public assets, contact form and office email.');
