async (page) => {
  const ensure = (value,message) => { if (!value) throw new Error(message); };
  const origin = 'http://127.0.0.1:4177';
  const routes = [
    {path:'/impressum/',pair:'/en/legal-notice/',lang:'de',title:'Impressum',sections:5},
    {path:'/datenschutz/',pair:'/en/privacy/',lang:'de',title:'Datenschutzerklärung',sections:9},
    {path:'/en/legal-notice/',pair:'/impressum/',lang:'en',title:'Legal Notice',sections:5},
    {path:'/en/privacy/',pair:'/datenschutz/',lang:'en',title:'Privacy Policy',sections:9}
  ];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const checked = [];
  for (const route of routes) {
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:1000});
      const response = await page.goto(origin + route.path);
      ensure(response.status() === 200,'Route failed: ' + route.path);
      ensure(await page.locator('html').getAttribute('lang') === route.lang,'Incorrect language');
      ensure(await page.locator('h1').innerText() === route.title,'Incorrect title');
      ensure(await page.locator('.privacy-block').count() === route.sections,'Missing supplied sections');
      ensure(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://www.flyweiss.com' + route.path,'Incorrect canonical');
      ensure(await page.locator('.legal-main a[href="mailto:office@flyweiss.com"]').count() > 0,'Official email missing');
      ensure(await page.locator('.brand img').getAttribute('src') === '/assets/flyweiss-logo-transparent.webp','Original logo changed');
      ensure(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),'Horizontal overflow: ' + route.path + '/' + width);
      ensure(await page.locator('script').count() === 0,'Legal pages should not require scripts');
      ensure(!/ENTWURF|DRAFT|Freigabeliste|vor Veröffentlichung|before public launch/i.test(await page.locator('body').innerText()),'Internal note is visible');
      const footer = page.locator('footer');
      for (const label of route.lang === 'de' ? ['Impressum','Datenschutz'] : ['Legal Notice','Privacy Policy']) {
        ensure(await footer.getByRole('link',{name:label,exact:true}).count() === 1,'Footer label missing: ' + label);
      }
      if (width === 390 || width === 1440) {
        await page.screenshot({path:'output/playwright/legal-' + route.path.slice(1,-1).replaceAll('/','-') + '-' + width + '.png',fullPage:true});
      }
      checked.push(route.path + ':' + width);
    }
    const alternate = route.lang === 'de' ? 'English' : 'Deutsch';
    await page.getByRole('link',{name:alternate,exact:true}).click();
    ensure(new URL(page.url()).pathname === route.pair,'Language switch lost the legal document');
    await page.getByRole('link',{name:route.lang === 'de' ? 'Deutsch' : 'English',exact:true}).click();
    ensure(new URL(page.url()).pathname === route.path,'Language switch did not return');
    await page.locator('.back-link').click();
    ensure(new URL(page.url()).pathname === (route.lang === 'de' ? '/' : '/en/'),'Back link goes to wrong language');
  }
  for (const alias of ['/de/impressum/','/de/datenschutz/']) {
    ensure((await page.goto(origin + alias)).status() === 200,'Legacy route failed');
    ensure(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://www.flyweiss.com' + alias.replace('/de/','/'),'Legacy canonical incorrect');
  }
  for (const path of ['/','/en/','/de/']) {
    await page.goto(origin + path);
    const lang = path === '/en/' ? 'en' : 'de';
    ensure(await page.locator('footer [data-legal="legal"]').getAttribute('href') === (lang === 'en' ? '/en/legal-notice/' : '/impressum/'),'Home footer notice path wrong');
    ensure(await page.locator('#contact-form [data-legal="privacy"]').getAttribute('href') === (lang === 'en' ? '/en/privacy/' : '/datenschutz/'),'Form privacy path wrong');
    await page.getByRole('link',{name:lang === 'de' ? 'English' : 'Deutsch',exact:true}).click();
    ensure(await page.locator('footer [data-legal="legal"]').getAttribute('href') === (lang === 'de' ? '/en/legal-notice/' : '/impressum/'),'Home language switch left a stale footer link');
    ensure(await page.locator('#contact-form [data-legal="privacy"]').getAttribute('href') === (lang === 'de' ? '/en/privacy/' : '/datenschutz/'),'Home language switch left a stale form link');
  }
  await page.goto(origin + '/en/');
  let payload;
  await page.route('https://api.web3forms.com/submit',async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true})});
  });
  await page.locator('#name').fill('Local legal-page QA');
  await page.locator('#company').fill('FLYWEISS QA');
  await page.locator('#email').fill('qa@example.com');
  await page.locator('#message').fill('Simulated enquiry to verify the disclosed form data.');
  await page.locator('#consent').check();
  await page.locator('#contact-form button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('#form-response').dataset.state === 'success');
  ensure(payload.language === 'en' && payload.source === origin + '/en/','Disclosed metadata differs from submission');
  for (const field of ['name','company','email','interest','message','consent']) ensure(Boolean(payload[field]),'Disclosed field not submitted: ' + field);
  const storage = await page.evaluate(async () => ({local:Object.keys(localStorage),session:Object.keys(sessionStorage),serviceWorkers:'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0}));
  ensure((await page.context().cookies()).length === 0,'Unexpected cookies');
  ensure(storage.local.length === 0 && storage.session.length === 0 && storage.serviceWorkers === 0,'Unexpected browser persistence');
  const noScript = await page.context().browser().newContext({javaScriptEnabled:false});
  const plainPage = await noScript.newPage();
  for (const route of routes) {
    await plainPage.goto(origin + route.path);
    ensure(await plainPage.locator('h1').innerText() === route.title,'No-JavaScript legal page failed');
  }
  await noScript.close();
  ensure(errors.length === 0,'Runtime errors: ' + errors.join(', '));
  return {responsiveViews:checked,languagePairs:4,legacyRoutes:2,noJavaScriptPages:4,simulatedForm:true,submittedFields:Object.keys(payload).filter(key => !['access_key','subject','from_name'].includes(key)),storage,errors,realEmailsSent:0};
}
