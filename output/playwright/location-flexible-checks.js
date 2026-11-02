async (page) => {
  const ensure = (condition,message) => { if (!condition) throw new Error(message); };
  const errors = [];
  const expected = {"de": {"headline": "FLYWEISS — Industrielle Proteinproduktion mit Zukunft.", "sub": "Wir entwickeln in Serbien eine moderne Produktionsplattform für Insektenprotein. Mehrere geeignete Standortoptionen und Produktionsflächen, vertraglich geregelte Projektgrundlagen und ein engagiertes Umsetzungsteam bilden die Basis für die nächste Entwicklungsphase.", "cta": "Projekt entdecken | Investorenkontakt", "invest": "FLYWEISS verbindet industrielle Produktionstechnologie, langfristig angelegte Geschäftsbeziehungen und eigene technische Umsetzungskompetenz. Für ausgewählte Investoren stellen wir weiterführende Projektinformationen im persönlichen Gespräch bereit.", "subsidy": "Für das Vorhaben wird nach aktueller Projektplanung eine Förderung von rund 60 % der förderfähigen Investitionskosten angestrebt. Die tatsächliche Förderfähigkeit und Bewilligung stehen unter dem Vorbehalt der zuständigen Stellen."}, "en": {"headline": "FLYWEISS — Industrial protein production for the future.", "sub": "We are developing a modern insect protein production platform in Serbia. Several suitable site and production facility options, contractually arranged project foundations and a committed implementation team provide the basis for the next stage.", "cta": "Explore the project | Investor enquiries", "invest": "FLYWEISS combines industrial production technology, long-term business relationships and in-house technical implementation expertise. Further project information is available to selected investors in a direct conversation.", "subsidy": "Based on the current project plan, funding of approximately 60% of eligible investment costs is being targeted. Eligibility and approval remain subject to the relevant authorities."}};
  await page.route('https://api.web3forms.com/**', route => route.abort());
  page.on('pageerror', error => errors.push(error.message));
  const views = [];
  for (const lang of ['de','en']) {
    await page.goto('http://127.0.0.1:4177/' + (lang === 'en' ? 'en/' : ''));
    ensure((await page.locator('h1').innerText()).replace(/\s+/g,' ').trim() === expected[lang].headline,'New headline missing: ' + lang);
    ensure(await page.locator('[data-i18n="homeCopy"]').innerText() === expected[lang].sub,'New introduction missing');
    ensure(await page.locator('[data-i18n="investmentCopy"]').innerText() === expected[lang].invest,'Investment copy differs');
    ensure(await page.locator('[data-i18n="fundingCopy"]').innerText() === expected[lang].subsidy,'Funding caveat differs');
    ensure((await page.locator('.automation-overview').innerText()).includes('Reploid'),'Planned automation missing');
    ensure((await page.locator('#nachhaltigkeit').innerText()).includes(lang === 'de' ? 'Kühlung' : 'cooling'),'Cooling contribution missing');
    const order = await page.locator('main > section').evaluateAll(elements => elements.map(el => el.id));
    ensure(order[0] === 'start' && order[1] === 'contracted-offtake','Contract section must immediately follow hero');
    ensure(await page.locator('.facts > li').count() === 5,'Company facts incomplete');
    for (const section of ['start','contracted-offtake','unternehmen','technologie','produkte','investition','investoren']) {
      ensure(!/sombor/i.test(await page.locator('#' + section).innerText()),'Fixed production location in ' + lang + '/' + section);
    }
    ensure((await page.locator('#contracted-offtake').innerText()).includes(lang === 'de' ? 'Mengen' : 'quantities'),'Contract scope missing');
    ensure((await page.locator('[data-i18n="researchCopy"]').innerText()).includes(lang === 'de' ? 'analytisch und technisch zu belegen' : 'must be verified'),'Research qualification missing');
    ensure((await page.locator('[data-i18n="location"]').innerText()).includes(lang === 'de' ? 'Firmensitz' : 'Registered office'),'Legal location not distinguished');
    for (const width of [320,390,560,768,1024,1440,1920]) {
      await page.setViewportSize({width,height:width <= 560 ? 844 : 1000});
      await page.waitForFunction(mobile => {
        const img = document.querySelector('.hero-media img');
        return img.complete && img.naturalWidth > 0 && img.currentSrc.endsWith(mobile ? 'factory-hero-mobile.webp' : 'factory-hero.webp');
      },width <= 560);
      ensure(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), lang + ' horizontal overflow at ' + width);
      ensure(await page.locator('.factory-caption').isVisible(), 'Concept caption is hidden');
      ensure(await page.locator('[data-lang="' + lang + '"]').getAttribute('aria-current') === 'true','Language indicator missing');
      const geometry = await page.evaluate(() => {
        const hero = document.querySelector('.hero').getBoundingClientRect();
        const media = document.querySelector('.hero-media').getBoundingClientRect();
        const copy = document.querySelector('.hero-content').getBoundingClientRect();
        const caption = document.querySelector('.factory-caption').getBoundingClientRect();
        return {heroBottom:hero.bottom,copyBottom:copy.bottom,mediaBottom:media.bottom,copyTop:copy.top,captionTop:caption.top,captionBottom:caption.bottom};
      });
      ensure(geometry.copyBottom <= geometry.heroBottom + 1,'Hero clips text at ' + width);
      if (width <= 560) {
        ensure(geometry.copyTop >= geometry.mediaBottom,'Mobile hero does not put image before text');
        ensure(geometry.captionTop >= 0 && geometry.captionBottom <= geometry.mediaBottom,'Mobile caption outside image');
      }
      if (width === 390 || width === 1440) {
        await page.screenshot({path:'output/playwright/location-flexible-' + lang + '-' + (width === 390 ? 'mobile' : 'desktop') + '.png'});
      }
      if (lang === 'en' && (width === 390 || width === 1440)) {
        for (const section of ['contracted-offtake','unternehmen','additional-value']) {
          await page.locator('#' + section).screenshot({path:'output/playwright/location-flexible-' + section + '-' + width + '.png',style:'.site-header,.skip-link{visibility:hidden!important}'});
        }
        await page.evaluate(() => scrollTo(0,0));
      }
      views.push(lang + ':' + width);
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#produkte').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.product-art img')].every(img=>img.complete && img.naturalWidth > 0));
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.images].every(img=>img.complete && img.naturalWidth > 0));
    await page.evaluate(() => scrollTo(0,0));
    await page.screenshot({path:'output/playwright/location-flexible-' + lang + '-full.png',fullPage:true});
  }

  await page.goto('http://127.0.0.1:4177/en/');
  ensure((await page.locator('#unternehmen').innerText()).includes('ten-year'),'Confirmed contract term missing');
  ensure((await page.locator('#unternehmen').innerText()).includes('Martin Holzer and Andria Mitić'),'Operations names missing');
  ensure(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://www.flyweiss.com/en/','English canonical incorrect');
  await page.locator('.desktop-nav').getByRole('link',{name:'Investment perspective',exact:true}).click();
  ensure(await page.evaluate(() => location.hash) === '#investition','Investment navigation failed');
  await page.locator('#investition').screenshot({path:'output/playwright/location-flexible-investment-desktop.png'});
  await page.locator('.hero').getByRole('link',{name:'Investor enquiries',exact:true}).click();
  ensure(await page.locator('#interest').inputValue() === 'investment','Hero investor CTA did not select investment');
  ensure(await page.locator('.email-address').getAttribute('href') === 'mailto:office@flyweiss.com','Office mail link incorrect');
  await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text => {window.copiedEmailForTest=text;}}}));
  await page.getByRole('button',{name:'Copy address',exact:true}).click();
  ensure(await page.evaluate(() => window.copiedEmailForTest) === 'office@flyweiss.com','Copy uses wrong address');
  ensure((await page.locator('.copy-status').innerText()).includes('Email address copied'),'Copy success feedback missing');
  await page.getByRole('link',{name:'Deutsch',exact:true}).click();
  ensure(await page.locator('html').getAttribute('lang') === 'de','German language switch failed');
  ensure(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://www.flyweiss.com/','German canonical incorrect');
  ensure((await page.locator('.copy-status').innerText()).includes('kopiert'),'Copy feedback not translated');
  await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async () => {throw new Error('clipboard denied for test');}}}));
  await page.getByRole('button',{name:'Adresse kopieren',exact:true}).click();
  ensure((await page.locator('.copy-status').innerText()).includes('markieren'),'Clipboard fallback missing');

  await page.setViewportSize({width:390,height:844});
  await page.locator('#investition').scrollIntoViewIfNeeded();
  await page.locator('#investition').screenshot({path:'output/playwright/location-flexible-investment-mobile.png',style:'.site-header,.skip-link{visibility:hidden!important}'});
  const menu = page.locator('.menu-button');
  await menu.click();
  ensure(await menu.getAttribute('aria-expanded') === 'true','Mobile menu did not open');
  await page.keyboard.press('Escape');
  ensure(await page.locator('#mobile-nav').isHidden(),'Escape did not close menu');
  await menu.click();
  await page.locator('#mobile-nav').getByRole('link',{name:'Erzeugnisse',exact:true}).click();
  ensure(await page.locator('#mobile-nav').isHidden(),'Mobile menu did not close after navigation');
  ensure(await page.evaluate(() => location.hash) === '#produkte','Mobile navigation used wrong anchor');
  await page.locator('#investoren').getByRole('link',{name:'Partnerschaft besprechen',exact:true}).click();
  ensure(await page.locator('#interest').inputValue() === 'investment','Partnership CTA did not select enquiry type');

  for (const route of ['de/impressum/','de/datenschutz/','en/legal-notice/','en/privacy/']) {
    const response = await page.goto('http://127.0.0.1:4177/' + route);
    ensure(response.status() === 200,'Legal page failed: ' + route);
    ensure(await page.locator('h1').count() === 1,'Legal heading missing');
    ensure((await page.locator('.legal-main').innerText()).includes('FLYWEISS DOO SOMBOR') && (await page.locator('.legal-main').innerText()).includes('Josićki put 85'),'Registered company details changed');
    ensure(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),'Legal page overflows: ' + route);
    ensure(!(await page.locator('body').innerText()).includes('flyweiss@icloud.com'),'Stale email in legal page');
    ensure(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://www.flyweiss.com/' + route,'Legal canonical incorrect');
    if (route.endsWith('privacy/') || route.endsWith('datenschutz/')) {
      ensure((await page.locator('.legal-main').innerText()).includes('Web3Forms'),'Actual form service missing from privacy page');
      ensure((await page.locator('.legal-main').innerText()).includes('Shipvela'),'Actual hosting missing from privacy page');
    }
  }
  ensure(errors.length === 0,'Browser runtime errors: ' + errors.join(', '));
  await page.goto('http://127.0.0.1:4177/en/');
  await page.setViewportSize({width:1440,height:1000});
  return {views:views.length,copy:true,investment:true,mobileNavigation:true,legalRoutes:4,runtimeErrors:errors};
}
