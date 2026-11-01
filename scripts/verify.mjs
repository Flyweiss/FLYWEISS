import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const content = JSON.parse(await readFile(resolve(root,'src/content.json'),'utf8'));
const approved = JSON.parse(await readFile(resolve(root,'src/brief-copy.json'),'utf8')).copy;
for (const lang of ['de','en']) {
  for (const [key,exact] of Object.entries(approved[lang])) {
    if (content[lang][key] !== exact) throw new Error('Copy differs from client handoff: ' + lang + '/' + key);
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
  return html;
}
for (const lang of ['de','en']) {
  const html = await verifyPage(lang + '/index.html');
  for (const match of html.matchAll(/data-i18n(?:-aria|-placeholder|-alt)?="([\w]+)"/g)) {
    if (!content[lang][match[1]]) throw new Error('Missing ' + lang + ' translation: ' + match[1]);
  }
  for (const id of ['start','unternehmen','technologie','produkte','nachhaltigkeit','investoren','kontakt','contact-form']) {
    if (!html.includes('id="' + id + '"')) throw new Error('Missing section or form: ' + id);
  }
  if (!html.includes('lang="' + lang + '"') || !html.includes(content[lang].homeCopy)) throw new Error('Language not prerendered');
  if (!html.includes('mailto:office@flyweiss.com')) throw new Error('Office email missing');
  if (!html.includes('https://api.web3forms.com/submit')) throw new Error('Contact form endpoint missing');
  if (!html.includes('factory-hero-mobile.webp')) throw new Error('Responsive factory image missing');
}
await verifyPage('index.html');
for (const route of ['de/impressum','de/datenschutz','en/legal-notice','en/privacy']) {
  const html = await verifyPage(route + '/index.html');
  if (!html.includes('class="legal-main"')) throw new Error('Missing legal content');
  if (!html.includes('rel="canonical" href="https://www.flyweiss.com/' + route + '/"')) throw new Error('Incorrect legal canonical: ' + route);
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
if (/WBPEF|Western Balkans Private Equity|office@wbpe|googletagmanager|__CONTENT__|flyweiss@icloud\.com/.test(js)) throw new Error('Outdated content or unresolved script');
console.log('Verified client copy, ' + Object.keys(content.de).length + ' translations per language, DE/EN routes, legal pages, public assets, contact form and office email.');
