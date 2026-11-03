import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'dist');
const origin = 'https://www.flyweiss.com';
const content = JSON.parse(await readFile(resolve(root, 'src/content.json'), 'utf8'));
const legalContent = JSON.parse(await readFile(resolve(root, 'src/legal-content.json'), 'utf8'));
const contactForm = await readFile(resolve(root, 'src/contact-form.html'), 'utf8');
const template = (await readFile(resolve(root, 'src/index.html'), 'utf8')).replace('{{CONTACT_FORM}}', contactForm);
const slugs = {de:{legal:'impressum',privacy:'datenschutz'},en:{legal:'legal-notice',privacy:'privacy'}};
const homePath = lang => lang === 'en' ? '/en/' : '/';
const legalPath = (lang, kind) => homePath(lang) + slugs[lang][kind] + '/';
const escape = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const render = (source, lang) => source.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  const value = {lang,localePath:homePath(lang).slice(1),legalPath:legalPath(lang,'legal'),privacyPath:legalPath(lang,'privacy'),...content[lang]}[key];
  if (value === undefined) throw new Error('Missing translation ' + lang + ':' + key);
  return escape(value);
}).replace(/[ \t]+$/gm,'');

await rm(dist, {recursive:true,force:true});
await mkdir(resolve(dist, 'assets'), {recursive:true});
const assetNames = [
  'factory-hero.webp','factory-hero-mobile.webp','planned-larvae.svg','planned-frass.svg',
  'flyweiss-logo-white.svg','favicon.svg','favicon.png','favicon.ico','apple-touch-icon.png',
  'flyweiss-logo-transparent.webp','investment-concept-de.webp','investment-concept-en.webp'
];
for (const name of assetNames) await cp(resolve(root,'src/assets',name),resolve(dist,'assets',name));
await cp(resolve(root, 'src/styles.css'), resolve(dist, 'styles.css'));
await cp(resolve(root, 'src/protein-future.css'), resolve(dist, 'protein-future.css'));
await cp(resolve(root, 'src/legal.css'), resolve(dist, 'legal.css'));
const app = (await readFile(resolve(root, 'src/app.js'), 'utf8')).replace('__CONTENT__', JSON.stringify(content));
await writeFile(resolve(dist, 'app.js'), app);
await writeFile(resolve(dist, 'index.html'), render(template, 'de'));

function paragraph(text) {
  return text.split(/(https:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[a-z]{2,})/gi).map(part => {
    if (part.startsWith('https://')) {
      const url = part.replace(/[.,;]+$/, '');
      return '<a href="' + escape(url) + '">' + escape(url) + '</a>' + escape(part.slice(url.length));
    }
    if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(part)) return '<a href="mailto:' + escape(part) + '">' + escape(part) + '</a>';
    return escape(part).replaceAll('\n','<br>');
  }).join('');
}
function legalBody(lang, kind) {
  const copy = legalContent[lang];
  const page = copy[kind];
  return [
    '<main id="main" class="legal-main"><div class="container">',
    '<a class="back-link" href="' + homePath(lang) + '">← ' + escape(content[lang].returnHome) + '</a>',
    '<p class="eyebrow">' + escape(copy.eyebrow) + '</p><h1>' + escape(page.title) + '</h1>',
    '<p class="legal-source"><time datetime="2026-11-03">' + escape(copy.updated) + '</time></p>',
    ...page.sections.map(section => '<section class="privacy-block"><h2>' + escape(section.title) + '</h2>' + section.paragraphs.map(text => '<p>' + paragraph(text) + '</p>').join('') + '</section>'),
    '</div></main>'
  ].join('\n');
}

for (const lang of ['de','en']) {
  await mkdir(resolve(dist, lang), {recursive:true});
  await writeFile(resolve(dist, lang, 'index.html'), render(template, lang));
  for (const kind of ['legal','privacy']) {
    const route = legalPath(lang,kind).slice(1);
    const {title,description} = legalContent[lang][kind];
    let prefix = template.slice(0, template.indexOf('<main id="main">'))
      .replace('<script src="/app.js" defer></script>','')
      .replace('</head>','<link rel="stylesheet" href="/legal.css">\n</head>')
      .replace(/<nav class="desktop-nav"[\s\S]*?<\/nav>/,'')
      .replace(/<button class="menu-button"[\s\S]*?<\/button>/,'')
      .replace(/<nav id="mobile-nav"[\s\S]*?<\/nav>/,'')
      .replaceAll('href="#start"','href="' + homePath(lang) + '"')
      .replaceAll('href="#kontakt"','href="' + homePath(lang) + '#kontakt"')
      .replace(/href="[^"]*" data-lang="(de|en)"/g,(_,l)=>'href="' + legalPath(l,kind) + '" data-lang="' + l + '"')
      .replace('data-lang="' + lang + '"','data-lang="' + lang + '" aria-current="true"');
    const footer = '<footer class="site-footer"><div class="container footer-bottom"><span>FLYWEISS D.O.O. SOMBOR · PROTEIN • FUTURE</span><div><a href="{{legalPath}}">{{legalLink}}</a><a href="{{privacyPath}}">{{privacyLink}}</a></div></div></footer></body></html>';
    let html = render(prefix + legalBody(lang,kind) + footer, lang);
    html = html.replace(/<title>[^<]*<\/title>/,'<title>' + escape(title) + ' — FLYWEISS</title>')
      .replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="' + escape(description) + '">')
      .replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="' + escape(title) + ' — FLYWEISS">')
      .replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="' + escape(description) + '">')
      .replace(/<meta property="og:url" content="[^"]*">/,'<meta property="og:url" content="' + origin + '/' + route + '">')
      .replace(/<link rel="canonical" href="[^"]*">/,'<link rel="canonical" href="' + origin + '/' + route + '">')
      .replace(/hreflang="(de|en|x-default)" href="[^"]*"/g,(_,l)=>{
        const target = l === 'en' ? 'en' : 'de';
        return 'hreflang="' + l + '" href="' + origin + legalPath(target,kind) + '"';
      });
    await mkdir(resolve(dist, route), {recursive:true});
    await writeFile(resolve(dist, route, 'index.html'), html);
    if (lang === 'de') {
      // Keep existing bookmarks working; the unprefixed URL is canonical.
      const legacyRoute = 'de/' + slugs.de[kind];
      await mkdir(resolve(dist,legacyRoute),{recursive:true});
      await writeFile(resolve(dist,legacyRoute,'index.html'),html);
    }
  }
}
for (const [route,anchor] of [['investment-policy','investoren'],['contact-us','kontakt']]) {
  await mkdir(resolve(dist, route), {recursive:true});
  await writeFile(resolve(dist, route, 'index.html'),'<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/#' + anchor + '"><title>FLYWEISS</title></head><body><a href="/#' + anchor + '">FLYWEISS</a></body></html>');
}
await writeFile(resolve(dist,'robots.txt'),'User-agent: *\nDisallow: /\n');
const urls = ['', 'en/', 'impressum/', 'datenschutz/', 'en/legal-notice/', 'en/privacy/'];
await writeFile(resolve(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(path=>'<url><loc>' + origin + '/' + path + '</loc></url>').join('\n') + '\n</urlset>\n');
console.log('Built FLYWEISS: client factory design, DE/EN content, contact form, legal pages and public assets only.');
