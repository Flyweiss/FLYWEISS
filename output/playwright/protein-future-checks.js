async (page) => {
 const ensure=(value,message)=>{if(!value)throw new Error(message)};
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://api.web3forms.com/**',r=>r.abort());
 const views=[];
 for(const lang of ['de','en']){
  await page.goto('http://127.0.0.1:4177/'+(lang==='en'?'en/':''));
  ensure((await page.locator('h1').innerText()).replace(/\s/g,'')==='FLYWEISS','Headline is incorrect');
  ensure(await page.locator('.accordion details').count()===7,'Expected seven disclosures');
  ensure(await page.locator('.accordion details[open]').count()===0,'Disclosures should start collapsed');
  ensure((await page.locator('.bank-investment-figure img').getAttribute('src')).includes('investment-concept-'+lang+'.webp'),'Wrong localized artwork');
  ensure((await page.locator('.bank-visual-caption').innerText()).includes(lang==='de'?'keine Renditedaten':'not return data'),'Chart qualification missing');
  ensure(!(await page.locator('body').innerText()).toLowerCase().includes('reploid'),'Manufacturer name remains public');
  ensure((await page.locator('#technologie .accordion-body').textContent()).includes(lang==='de'?'9 Millionen':'9 million'),'Machinery copy missing');
  for(const width of [320,390,560,768,1024,1440,1920]){
   await page.setViewportSize({width,height:width<=560?844:1000});
   await page.waitForFunction(()=>document.querySelector('.hero-media img').complete&&document.querySelector('.hero-media img').naturalWidth>0);
   ensure(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow '+lang+'/'+width);
   ensure(await page.locator('.factory-caption').isVisible(),'Missing AI image caption');
   const geometry=await page.evaluate(()=>{const h=document.querySelector('.hero').getBoundingClientRect(),c=document.querySelector('.hero-copy').getBoundingClientRect(),f=document.querySelector('.factory-caption').getBoundingClientRect();return {hero:h.bottom,copy:c.bottom,captionTop:f.top,captionBottom:f.bottom}});
   ensure(geometry.copy<=geometry.captionTop,'Hero text overlaps image caption at '+lang+'/'+width);
   ensure(geometry.captionBottom<=geometry.hero,'Image caption is outside hero');
   if(width===390||width===1440)await page.screenshot({path:'output/playwright/protein-future-'+lang+'-'+width+'.png'});
   views.push(lang+':'+width);
  }
  await page.getByRole('button',{name:lang==='de'?'Alle öffnen':'Expand all',exact:true}).click();
  ensure(await page.locator('.accordion details[open]').count()===7,'Expand all failed');
  ensure((await page.locator('#investition').innerText()).includes(lang==='de'?'zuständigen Stellen':'relevant authorities'),'Funding caveat missing');
  await page.getByRole('button',{name:lang==='de'?'Alle schließen':'Collapse all',exact:true}).click();
  ensure(await page.locator('.accordion details[open]').count()===0,'Collapse all failed');
  await page.locator('#technologie summary').focus();await page.keyboard.press('Enter');
  ensure(await page.locator('#technologie').getAttribute('open')!==null,'Keyboard disclosure failed');
  await page.locator('#investmentvergleich').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.bank-investment-figure img').complete&&document.querySelector('.bank-investment-figure img').naturalWidth>0);
  await page.locator('#investmentvergleich').screenshot({path:'output/playwright/protein-future-bank-'+lang+'.png',style:'.site-header,.skip-link{visibility:hidden!important}'});
  await page.locator('.hero [data-interest="investment"]').click();
  ensure(await page.locator('#interest').inputValue()==='investment','Equity CTA did not preselect investment');
 }
 await page.locator('#name').fill('Local QA');await page.locator('#message').fill('Preserve this unsent local test');
 await page.getByRole('link',{name:'Deutsch',exact:true}).click();
 ensure(await page.locator('#message').inputValue()==='Preserve this unsent local test','Language switch lost input');
 ensure((await page.locator('.bank-investment-figure img').getAttribute('src')).endsWith('-de.webp'),'Language switch did not update artwork');
 ensure((await page.locator('.bank-visual-zoom').getAttribute('href')).endsWith('-de.webp'),'Language switch did not update full-size link');
 ensure(await page.locator('#technologie').getAttribute('open')!==null,'Language switch closed open disclosure');
 await page.setViewportSize({width:390,height:844});await page.locator('.menu-button').click();
 await page.locator('#mobile-nav').getByRole('link',{name:'Mehr erfahren',exact:true}).click();
 ensure(await page.locator('#mobile-nav').isHidden(),'Menu did not close');
 await page.locator('.menu-button').click();await page.keyboard.press('Escape');ensure(await page.locator('#mobile-nav').isHidden(),'Escape did not close menu');
 for(const route of ['de/impressum/','de/datenschutz/','en/legal-notice/','en/privacy/']){
  const response=await page.goto('http://127.0.0.1:4177/'+route);ensure(response.status()===200,'Legal route failed');
  ensure((await page.locator('.legal-main').innerText()).includes('FLYWEISS D.O.O. SOMBOR'),'Registered name missing');
  ensure(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Legal overflow');
 }
 ensure(errors.length===0,'Runtime errors: '+errors.join(', '));
 await page.goto('http://127.0.0.1:4177/en/');await page.setViewportSize({width:1440,height:1000});
 return {views:views.length,disclosures:7,keyboard:true,localizedArtwork:true,languagePreservesForm:true,legalRoutes:4,errors,realEmailsSent:0};
}
