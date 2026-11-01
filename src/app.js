// Both languages are prerendered; this script enhances navigation and the form.
const CONTENT = __CONTENT__;
let lang = document.documentElement.lang === 'en' ? 'en' : 'de';
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
const contactForm = document.querySelector('#contact-form');
const formResponse = document.querySelector('#form-response');
let formState = 'idle';
let copyState = null;
const slugs = {de:{legal:'impressum',privacy:'datenschutz'},en:{legal:'legal-notice',privacy:'privacy'}};
const localePath = language => language === 'en' ? '/en/' : '/';
function renderCopyState() {
  document.querySelector('.copy-status').textContent = copyState ? CONTENT[lang][copyState] : '';
}
function setMenu(open) {
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', CONTENT[lang][open ? 'closeMenu' : 'openMenu']);
}
function renderFormState() {
  const t = CONTENT[lang];
  contactForm.querySelector('[data-i18n="submit"]').textContent = t[formState === 'sending' ? 'formSending' : 'submit'];
  contactForm.setAttribute('aria-busy', String(formState === 'sending'));
  formResponse.hidden = formState === 'idle';
  if (formState === 'idle') return;
  const messages = {
    sending: ['formSending', 'formSendingText'],
    success: ['formSuccessTitle', 'formSuccessText'],
    error: ['formErrorTitle', 'formErrorText'],
    rateLimit: ['formErrorTitle', 'formRateLimitText'],
    unconfirmed: ['formUnconfirmedTitle', 'formUnconfirmedText']
  }[formState];
  formResponse.dataset.state = ['error','rateLimit','unconfirmed'].includes(formState) ? 'error' : formState;
  document.querySelector('#form-response-title').textContent = t[messages[0]];
  document.querySelector('#form-response-message').textContent = t[messages[1]];
}
function setLanguage(next, updateUrl = true) {
  lang = next === 'en' ? 'en' : 'de';
  const t = CONTENT[lang];
  document.documentElement.lang = lang;
  document.title = t.title;
  document.querySelector('meta[name="description"]').content = t.metaDescription;
  document.querySelector('link[rel="canonical"]').href = `https://www.flyweiss.com${localePath(lang)}`;
  document.querySelector('meta[property="og:title"]').content = t.title;
  document.querySelector('meta[property="og:description"]').content = t.metaDescription;
  document.querySelector('meta[property="og:url"]').content = `https://www.flyweiss.com${localePath(lang)}`;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t[el.dataset.i18n]; });
  for (const [attr, dataset] of [['aria-label','i18nAria'],['placeholder','i18nPlaceholder'],['alt','i18nAlt']]) {
    document.querySelectorAll(`[data-${dataset.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}]`).forEach(el => el.setAttribute(attr, t[el.dataset[dataset]]));
  }
  document.querySelectorAll('[data-lang]').forEach(link => {
    if(link.dataset.lang === lang) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current');
    link.href = `${localePath(link.dataset.lang)}${location.hash}`;
  });
  document.querySelectorAll('[data-legal]').forEach(link => link.href = `/${lang}/${slugs[lang][link.dataset.legal]}/`);
  setMenu(false);
  renderFormState();
  renderCopyState();
  if (updateUrl) history.pushState(null,'',`${localePath(lang)}${location.hash}`);
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
matchMedia('(min-width: 1041px)').addEventListener('change', event => {if(event.matches) setMenu(false);});
document.querySelector('[data-copy-email]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('office@flyweiss.com');
    copyState = 'copied';
  } catch {
    copyState = 'copyFail';
  }
  renderCopyState();
});
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
contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (formState === 'sending') return;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  if (values.website || values.botcheck) return;
  for (const key of ['name','company','email','message']) values[key] = values[key].trim();
  if (!values.name || values.message.length < 10) {
    const input = !values.name ? form.elements.name : form.elements.message;
    input.setCustomValidity(CONTENT[lang].validationMessage);
    input.reportValidity(); input.addEventListener('input', () => input.setCustomValidity(''), {once:true}); return;
  }
  const interestKey = {general:'interestGeneral',investment:'interestInvestment',partnership:'interestPartnership'}[values.interest];
  const payload = {
    access_key: values.access_key,
    subject: values.subject,
    from_name: values.from_name,
    name: values.name,
    company: values.company,
    email: values.email,
    interest: CONTENT[lang][interestKey],
    message: values.message,
    consent: values.consent,
    language: lang,
    source: location.origin + location.pathname
  };
  const controls = [...form.elements].map(control => [control, control.disabled]);
  controls.forEach(([control]) => { control.disabled = true; });
  formState = 'sending';
  renderFormState();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: {'Content-Type':'application/json', Accept:'application/json'},
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'omit'
    });
    if (!response.ok) {
      formState = response.status === 429 ? 'rateLimit' : 'error';
    } else {
      const result = await response.json();
      formState = result.success === true ? 'success' : 'error';
      if (formState === 'success') form.reset();
    }
  } catch {
    // A network failure can occur after delivery; never claim success or retry automatically.
    formState = 'unconfirmed';
  } finally {
    clearTimeout(timeout);
    controls.forEach(([control, disabled]) => { control.disabled = disabled; });
    renderFormState();
    formResponse.focus({preventScroll:true});
  }
});
contactForm.addEventListener('input', () => {
  if (formState === 'sending') return;
  formState = 'idle';
  renderFormState();
});
