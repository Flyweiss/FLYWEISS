import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'dist');
const origin = 'https://www.flyweiss.com';
const content = JSON.parse(await readFile(resolve(root, 'src/content.json'), 'utf8'));
const contactForm = await readFile(resolve(root, 'src/contact-form.html'), 'utf8');
const template = (await readFile(resolve(root, 'src/index.html'), 'utf8')).replace('{{CONTACT_FORM}}', contactForm);
const slugs = {de:{legal:'impressum',privacy:'datenschutz'},en:{legal:'legal-notice',privacy:'privacy'}};
const homePath = lang => lang === 'en' ? '/en/' : '/';
const escape = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const render = (source, lang) => source.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  const value = {lang,localePath:homePath(lang).slice(1),legalSlug:slugs[lang].legal,privacySlug:slugs[lang].privacy,...content[lang]}[key];
  if (value === undefined) throw new Error('Missing translation ' + lang + ':' + key);
  return escape(value);
}).replace(/[ \t]+$/gm,'');

await rm(dist, {recursive:true,force:true});
await mkdir(resolve(dist, 'assets'), {recursive:true});
const assetNames = [
  'factory-hero.webp','factory-hero-mobile.webp','planned-larvae.svg','planned-frass.svg',
  'flyweiss-logo-white.svg','favicon.svg','favicon.png','favicon.ico','apple-touch-icon.png'
];
for (const name of assetNames) await cp(resolve(root,'src/assets',name),resolve(dist,'assets',name));
await cp(resolve(root, 'src/styles.css'), resolve(dist, 'styles.css'));
const app = (await readFile(resolve(root, 'src/app.js'), 'utf8')).replace('__CONTENT__', JSON.stringify(content));
await writeFile(resolve(dist, 'app.js'), app);
await writeFile(resolve(dist, 'index.html'), render(template, 'de'));

const legalBody = [
  '<main id="main" class="legal-main"><div class="container">',
  '<a class="back-link" href="HOME_PATH">← {{returnHome}}</a>',
  '<p class="eyebrow">{{legalPreview}}</p><h1>{{legalLink}}</h1>',
  '<p class="notice">{{legalPreviewNote}}</p>',
  '<dl class="legal-data">',
  '<dt>{{legalCompanyLabel}}</dt><dd>FLYWEISS DOO SOMBOR</dd>',
  '<dt>{{legalAddressLabel}}</dt><dd>Josićki put 85<br>Sombor, Serbia</dd>',
  '<dt>{{legalRegistrationLabel}}</dt><dd>22162152</dd>',
  '<dt>{{legalTaxLabel}}</dt><dd>115468829</dd>',
  '<dt>{{legalRepresentativesLabel}}</dt><dd>Andria Mitić<br>Martin Kurt Holzer</dd>',
  '<dt>{{legalContactLabel}}</dt><dd><a href="mailto:office@flyweiss.com">office@flyweiss.com</a></dd>',
  '</dl><p class="legal-source">{{legalSource}}</p></div></main>'
].join('\n');
const privacyBody = [
  '<main id="main" class="legal-main"><div class="container">',
  '<a class="back-link" href="HOME_PATH">← {{returnHome}}</a>',
  '<p class="eyebrow">{{legalPreview}}</p><h1>{{privacyLink}}</h1>',
  '<p class="notice">{{privacyPreviewNote}}</p>',
  '<section class="privacy-block"><h2>{{privacyControllerTitle}}</h2><p>{{privacyController}}</p></section>',
  '<section class="privacy-block"><h2>{{privacyFormTitle}}</h2><p>{{privacyText}}</p></section>',
  '<section class="privacy-block"><h2>{{privacyEmailTitle}}</h2><p>{{privacyEmailText}}</p></section>',
  '<section class="privacy-block"><h2>{{privacyHostingTitle}}</h2><p>{{privacyHostingText}}</p></section>',
  '<section class="privacy-block"><h2>{{privacyPendingTitle}}</h2><p>{{privacyPending}}</p></section>',
  '</div></main>'
].join('\n');

for (const lang of ['de','en']) {
  await mkdir(resolve(dist, lang), {recursive:true});
  await writeFile(resolve(dist, lang, 'index.html'), render(template, lang));
  for (const kind of ['legal','privacy']) {
    const route = lang + '/' + slugs[lang][kind] + '/';
    const title = content[lang][kind === 'legal' ? 'legalLink' : 'privacyLink'];
    const note = content[lang][kind === 'legal' ? 'legalPreviewNote' : 'privacyPreviewNote'];
    let prefix = template.slice(0, template.indexOf('<main id="main">'))
      .replace('<script src="/app.js" defer></script>','')
      .replace(/<nav class="desktop-nav"[\s\S]*?<\/nav>/,'')
      .replace(/<button class="menu-button"[\s\S]*?<\/button>/,'')
      .replace(/<nav id="mobile-nav"[\s\S]*?<\/nav>/,'')
      .replaceAll('href="#start"','href="' + homePath(lang) + '"')
      .replaceAll('href="#kontakt"','href="' + homePath(lang) + '#kontakt"')
      .replace(/href="[^"]*" data-lang="(de|en)"/g,(_,l)=>'href="/' + l + '/' + slugs[l][kind] + '/" data-lang="' + l + '"')
      .replace('data-lang="' + lang + '"','data-lang="' + lang + '" aria-current="true"');
    const body = (kind === 'legal' ? legalBody : privacyBody).replace('HOME_PATH',homePath(lang));
    const footer = '<footer class="site-footer"><div class="container footer-bottom"><span>FLYWEISS DOO SOMBOR · PROTEIN • FUTURE</span><div><a href="/' + lang + '/' + slugs[lang].legal + '/">{{legalLink}}</a><a href="/' + lang + '/' + slugs[lang].privacy + '/">{{privacyLink}}</a></div></div></footer></body></html>';
    let html = render(prefix + body + footer, lang);
    html = html.replace(/<title>[^<]*<\/title>/,'<title>' + escape(title) + ' — FLYWEISS</title>')
      .replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="' + escape(note) + '">')
      .replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="' + escape(title) + ' — FLYWEISS">')
      .replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="' + escape(note) + '">')
      .replace(/<meta property="og:url" content="[^"]*">/,'<meta property="og:url" content="' + origin + '/' + route + '">')
      .replace(/<link rel="canonical" href="[^"]*">/,'<link rel="canonical" href="' + origin + '/' + route + '">')
      .replace(/hreflang="(de|en|x-default)" href="[^"]*"/g,(_,l)=>{
        const target = l === 'en' ? 'en' : 'de';
        return 'hreflang="' + l + '" href="' + origin + '/' + target + '/' + slugs[target][kind] + '/"';
      });
    await mkdir(resolve(dist, route), {recursive:true});
    await writeFile(resolve(dist, route, 'index.html'), html);
  }
}
for (const [route,anchor] of [['investment-policy','investoren'],['contact-us','kontakt']]) {
  await mkdir(resolve(dist, route), {recursive:true});
  await writeFile(resolve(dist, route, 'index.html'),'<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/#' + anchor + '"><title>FLYWEISS</title></head><body><a href="/#' + anchor + '">FLYWEISS</a></body></html>');
}
await writeFile(resolve(dist,'robots.txt'),'User-agent: *\nDisallow: /\n# Indexing remains disabled while company and legal details are reviewed.\n');
const urls = ['', 'en/', 'de/impressum/', 'de/datenschutz/', 'en/legal-notice/', 'en/privacy/'];
await writeFile(resolve(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(path=>'<url><loc>' + origin + '/' + path + '</loc></url>').join('\n') + '\n</urlset>\n');
console.log('Built FLYWEISS: client factory design, DE/EN content, contact form, legal pages and public assets only.');
