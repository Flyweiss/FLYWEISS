// Both languages are prerendered; this script enhances the preview.
const CONTENT = __CONTENT__;
let lang = document.documentElement.lang === 'en' ? 'en' : 'de';
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
let draftUrl = null;
let draftValues = null;
const slugs = {de:{legal:'impressum',privacy:'datenschutz'},en:{legal:'legal-notice',privacy:'privacy'}};
function setMenu(open) {
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', CONTENT[lang][open ? 'closeMenu' : 'openMenu']);
}
function updateDraft() {
  if (!draftValues) return;
  const t = CONTENT[lang];
  const interestKey = {general:'interestGeneral',investment:'interestInvestment',partnership:'interestPartnership'}[draftValues.interest];
  const text = `FLYWEISS — ${t.navContact}\n\n${t.fieldName.replace(' *','')}: ${draftValues.name}\n${t.fieldCompany}: ${draftValues.company}\n${t.fieldEmail.replace(' *','')}: ${draftValues.email}\n${t.fieldInterest}: ${t[interestKey]}\n\n${t.fieldMessage.replace(' *','')}:\n${draftValues.message}\n`;
  document.querySelector('#draft-content').textContent = text;
  if (draftUrl) URL.revokeObjectURL(draftUrl);
  draftUrl = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
  document.querySelector('#download-draft').href = draftUrl;
  document.querySelector('#download-draft').download = lang === 'de' ? 'flyweiss-anfrage.txt' : 'flyweiss-enquiry.txt';
}
function setLanguage(next, updateUrl = true) {
  lang = next === 'en' ? 'en' : 'de';
  const t = CONTENT[lang];
  document.documentElement.lang = lang;
  document.title = t.title;
  document.querySelector('meta[name="description"]').content = t.metaDescription;
  document.querySelector('link[rel="canonical"]').href = `https://flyweiss.at/${lang}/`;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t[el.dataset.i18n]; });
  for (const [attr, dataset] of [['aria-label','i18nAria'],['placeholder','i18nPlaceholder'],['alt','i18nAlt']]) {
    document.querySelectorAll(`[data-${dataset.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}]`).forEach(el => el.setAttribute(attr, t[el.dataset[dataset]]));
  }
  document.querySelectorAll('[data-lang]').forEach(link => {
    if(link.dataset.lang === lang) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current');
    link.href = `/${link.dataset.lang}/${location.hash}`;
  });
  document.querySelectorAll('[data-legal]').forEach(link => link.href = `/${lang}/${slugs[lang][link.dataset.legal]}/`);
  setMenu(false);
  updateDraft();
  if (updateUrl) history.pushState(null,'',`/${lang}/${location.hash}`);
}
const queryLang = new URLSearchParams(location.search).get('lang');
setLanguage(queryLang || lang, Boolean(queryLang));
document.querySelectorAll('[data-lang]').forEach(link => link.addEventListener('click', event => {
  if(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); setLanguage(link.dataset.lang);
}));
window.addEventListener('popstate', () => setLanguage(location.pathname.startsWith('/en') ? 'en' : 'de', false));
menuButton.addEventListener('click', () => setMenu(mobileNav.hidden));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {if(event.key === 'Escape' && !mobileNav.hidden) {setMenu(false); menuButton.focus();}});
document.addEventListener('click', event => {if(!event.target.closest('.site-header')) setMenu(false);});
matchMedia('(min-width: 1200px)').addEventListener('change', event => {if(event.matches) setMenu(false);});
document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => {document.querySelector('#interest').value = link.dataset.interest;}));
const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
const sections = [...document.querySelectorAll('main>section[id]')];
let scrollTick = false;
function updateNav() {
  const current = sections.filter(section => section.getBoundingClientRect().top < 180).at(-1) || sections[0];
  navLinks.forEach(link => {if(link.hash === '#'+current.id) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');});
  scrollTick = false;
}
window.addEventListener('scroll', () => {if(!scrollTick) {scrollTick=true; requestAnimationFrame(updateNav);}}, {passive:true});
updateNav();
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  if(values.website) return;
  for (const key of ['name','company','email','message']) values[key] = values[key].trim();
  if (!values.name || values.message.length < 10) {
    const input = !values.name ? form.elements.name : form.elements.message;
    input.setCustomValidity(CONTENT[lang].validationMessage);
    input.reportValidity(); input.addEventListener('input', () => input.setCustomValidity(''), {once:true}); return;
  }
  draftValues = values; updateDraft(); document.querySelector('#form-response').hidden = false;
});
document.querySelector('#contact-form').addEventListener('input', () => {
  document.querySelector('#form-response').hidden = true;
  draftValues = null;
  if(draftUrl) {URL.revokeObjectURL(draftUrl); draftUrl = null;}
  document.querySelector('#download-draft').removeAttribute('href');
});
window.addEventListener('pagehide', () => {if(draftUrl) URL.revokeObjectURL(draftUrl);});
