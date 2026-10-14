import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../',import.meta.url));
const dist = resolve(root,'dist');
const content = JSON.parse(await readFile(resolve(root,'src/content.json'),'utf8'));
const template = await readFile(resolve(root,'src/index.html'),'utf8');
const escape = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slugs = {de:{legal:'impressum',privacy:'datenschutz'},en:{legal:'legal-notice',privacy:'privacy'}};
const render = (source, lang) => source.replace(/\{\{(\w+)\}\}/g, (_,key) => {
  const value = {lang,legalSlug:slugs[lang].legal,privacySlug:slugs[lang].privacy,...content[lang]}[key];
  if(value === undefined) throw new Error('Missing translation '+lang+':'+key);
  return escape(value);
});
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
await writeFile(resolve(dist,'index.html'),render(template,'de'));
await mkdir(resolve(dist,'assets'),{recursive:true});
const assetNames = ['montserrat-400.ttf','montserrat-500.ttf','montserrat-600.ttf','montserrat-700.ttf','Montserrat-OFL.txt','facility-concept.webp','hero-exterior.webp','hero-exterior-mobile.webp','insect-production-concept.webp','partnership-concept.webp','flyweiss-logo.svg','flyweiss-logo-black.svg','flyweiss-logo-gray.svg','flyweiss-logo-stacked.svg','flyweiss-logo-white.svg','flyweiss-mark.svg','flyweiss-mark-white.svg','favicon.svg','favicon.png','favicon.ico'];
for(const name of assetNames) await cp(resolve(root,'src/assets',name),resolve(dist,'assets',name));
await cp(resolve(root,'src/styles.css'),resolve(dist,'styles.css'));
const app = (await readFile(resolve(root,'src/app.js'),'utf8')).replace('__CONTENT__',JSON.stringify(content));
await writeFile(resolve(dist,'app.js'),app);
for(const lang of ['de','en']) {
  await mkdir(resolve(dist,lang),{recursive:true});
  await writeFile(resolve(dist,lang,'index.html'),render(template,lang));
  for(const kind of ['legal','privacy']) {
    const slug = slugs[lang][kind];
    const title = content[lang][kind === 'legal' ? 'legalLink' : 'privacyLink'];
    const prefix = template.slice(0,template.indexOf('<main id="main">')).replace('<script src="/app.js" defer></script>','').replace(/<nav class="desktop-nav"[\s\S]*?<\/nav>/,'').replace(/<button class="menu-button"[\s\S]*?<\/button>/,'').replace(/<nav id="mobile-nav"[\s\S]*?<\/nav>/,'').replace(/href="#start"/g,`href="/${lang}/"`).replace(/href="#kontakt"/g,`href="/${lang}/#kontakt"`);
    const body = `<main id="main" class="legal-main"><div class="container"><p class="eyebrow">{{legalPreview}}</p><h1>${escape(title)}</h1><p class="preview-notice">{{legalPreviewNote}}</p><p class="lead">{{${kind}Text}}</p><p class="lead">{{${kind}Pending}}</p><a class="text-link" href="/${lang}/"><span aria-hidden="true">←</span><span>{{returnHome}}</span></a></div></main><footer class="site-footer"><div class="container footer-bottom"><span>FLYWEISS DOO SOMBOR · SUSTAINABLE PROTEIN SOLUTIONS</span></div></footer></body></html>`;
    let html = render(prefix+body,lang);
    html = html.replace(/<title>[^<]*<\/title>/,`<title>${escape(title)} — FLYWEISS</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(content[lang].legalPreviewNote)}">`);
    html = html.replace(/https:\/\/flyweiss\.at\/(de|en)\//g,(_,l)=>`https://flyweiss.at/${l}/${slugs[l][kind]}/`);
    html = html.replace(/href="\/(de|en)\/" data-lang/g,(_,l)=>`href="/${l}/${slugs[l][kind]}/" data-lang`);
    html = html.replace(`data-lang="${lang}"`,`data-lang="${lang}" aria-current="true"`);
    await mkdir(resolve(dist,lang,slug),{recursive:true});
    await writeFile(resolve(dist,lang,slug,'index.html'),html);
  }
}
for(const [route,anchor] of [['investment-policy','investoren'],['contact-us','kontakt']]) {
  await mkdir(resolve(dist,route),{recursive:true});
  await writeFile(resolve(dist,route,'index.html'),`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/de/#${anchor}"><title>FLYWEISS</title></head><body><a href="/de/#${anchor}">FLYWEISS</a></body></html>`);
}
await writeFile(resolve(dist,'robots.txt'),'User-agent: *\nDisallow: /\n# Local review build. Indexing requires FLYWEISS approval.\n');
const urls = ['de/','en/','de/impressum/','de/datenschutz/','en/legal-notice/','en/privacy/'];
await writeFile(resolve(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map(path=>`<url><loc>https://flyweiss.at/${path}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('Built FLYWEISS: 7 sections, prerendered DE/EN, 4 legal review pages, sitemap, noindex preview.');
