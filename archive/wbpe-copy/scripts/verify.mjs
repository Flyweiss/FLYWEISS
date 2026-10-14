import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const content = JSON.parse(await readFile(resolve(root,'src/content.json'),'utf8'));
const approved = JSON.parse(await readFile(resolve(root,'src/brief-copy.json'),'utf8')).copy;
for(const lang of ['de','en']) for(const [key,exact] of Object.entries(approved[lang])) {if(content[lang][key]!==exact) throw new Error(`Copy differs from reviewed brief: ${lang}/${key}`);}
if(JSON.stringify(Object.keys(content.de).sort())!==JSON.stringify(Object.keys(content.en).sort())) throw new Error('Language keys differ');
for(const lang of ['de','en']) {
 const html = await readFile(resolve(root,`dist/${lang}/index.html`),'utf8');
 for(const match of html.matchAll(/data-i18n(?:-aria|-placeholder|-alt)?="([\w]+)"/g)) if(!content[lang][match[1]]) throw new Error(`Missing ${lang} translation: ${match[1]}`);
 for(const id of ['start','unternehmen','technologie','produkte','nachhaltigkeit','investoren','kontakt']) if(!html.includes(`id="${id}"`)) throw new Error(`Missing section: ${id}`);
 for(const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)) await access(resolve(root,'dist',match[1].slice(1)));
 for(const match of html.matchAll(/href="#([^"]+)"/g)) if(!html.includes(`id="${match[1]}"`)) throw new Error(`Broken anchor: ${match[1]}`);
 if(!html.includes('content="noindex, nofollow"')) throw new Error('Preview indexing protection missing');
 if(!html.includes(`lang="${lang}"`) || !html.includes(content[lang].homeCopy)) throw new Error('Language not prerendered');
 if(/\{\{\w+\}\}/.test(html)) throw new Error('Unresolved template');
}
for(const path of ['de/impressum','de/datenschutz','en/legal-notice','en/privacy']) {
 const html = await readFile(resolve(root,`dist/${path}/index.html`),'utf8');
 if(/\{\{\w+\}\}/.test(html)) throw new Error('Unresolved legal template');
 if(!html.includes('class="legal-main"')) throw new Error('Missing legal content');
}
const js = await readFile(resolve(root,'dist/app.js'),'utf8');
if(/WBPEF|Western Balkans Private Equity|office@wbpe|googletagmanager|__CONTENT__/.test(js)) throw new Error('Old content or unresolved script');
console.log(`Verified 7 sections, ${Object.keys(content.de).length} translations per language, DE/EN routes, legal review pages, local assets and internal anchors.`);
