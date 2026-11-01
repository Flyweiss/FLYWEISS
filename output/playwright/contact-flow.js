async (page) => {
  const ensure = (condition, message) => { if (!condition) throw new Error(message); };
  const requests = [];
  let mode = 'success';
  let pendingRoute;
  await page.route('https://api.web3forms.com/submit', async route => {
    requests.push(route.request().postDataJSON());
    if (mode === 'pending') { pendingRoute = route; return; }
    if (mode === 'network') return route.abort('failed');
    const status = mode === 'rateLimit' ? 429 : mode === 'serverError' ? 500 : 200;
    return route.fulfill({status, contentType:'application/json', body:JSON.stringify({success:mode === 'success'})});
  });
  const form = page.locator('#contact-form');
  const button = form.getByRole('button', {name:'Send enquiry', exact:true});
  const fill = async () => {
    await page.getByRole('textbox', {name:'Name',exact:true}).fill('  Integration QA  ');
    await page.getByRole('textbox', {name:'Company',exact:true}).fill('FLYWEISS QA');
    await page.getByRole('textbox', {name:'Email',exact:true}).fill('qa@example.com');
    await page.getByRole('textbox', {name:'Message',exact:true}).fill('Local integration test; no email is sent.');
    await page.getByRole('checkbox', {name:'Privacy consent',exact:true}).check();
  };
  const waitState = state => page.waitForFunction(expected => {
    const response = document.querySelector('#form-response');
    return !response.hidden && response.dataset.state === expected && document.querySelector('#contact-form').getAttribute('aria-busy') === 'false';
  }, state);
  await button.click();
  ensure(requests.length === 0, 'Empty form sent a request');
  await fill();
  await page.getByRole('checkbox', {name:'Privacy consent',exact:true}).uncheck();
  await button.click();
  ensure(requests.length === 0, 'Consent was not enforced');
  await page.getByRole('checkbox', {name:'Privacy consent',exact:true}).check();
  await form.locator('[name="website"]').fill('spam.example');
  await button.click();
  ensure(requests.length === 0, 'Honeypot sent a request');
  await form.locator('[name="website"]').fill('');
  mode = 'pending';
  await button.click();
  await page.waitForFunction(() => document.querySelector('#contact-form').getAttribute('aria-busy') === 'true');
  ensure(await form.locator('button[type="submit"]').isDisabled(), 'Submit button not locked');
  await form.evaluate(element => element.dispatchEvent(new Event('submit', {cancelable:true,bubbles:true})));
  ensure(requests.length === 1, 'Duplicate submit was not blocked');
  ensure(requests[0].access_key === '0e24c4d6-8f78-42cb-b097-83b32f42a52d', 'Access key missing');
  ensure(requests[0].name === 'Integration QA' && requests[0].email === 'qa@example.com', 'Contact fields not normalized');
  ensure(requests[0].language === 'en' && requests[0].consent === 'on', 'Language or consent missing');
  await page.getByRole('link', {name:'Deutsch',exact:true}).click();
  ensure(await form.locator('button[type="submit"]').innerText() === 'Wird gesendet …\n→', 'Sending state lost on language change');
  await pendingRoute.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true})});
  await waitState('success');
  ensure((await page.locator('#form-response-title').innerText()).includes('Vielen Dank'), 'Success not localized');
  ensure(await form.locator('#message').inputValue() === '', 'Successful submission not reset');
  await page.getByRole('link', {name:'English',exact:true}).click();
  for (const scenario of ['rejected','serverError','rateLimit','network']) {
    mode = scenario;
    await fill();
    await button.click();
    await waitState('error');
    ensure(await form.locator('#message').inputValue() === 'Local integration test; no email is sent.', 'Failure discarded message');
    const response = await page.locator('#form-response').innerText();
    ensure(!response.includes('submitted successfully'), 'Failure claimed success');
    if (scenario === 'rateLimit') ensure(response.includes('Too many'), 'Rate limit feedback missing');
    if (scenario === 'network') ensure(response.includes('may already'), 'Network uncertainty not disclosed');
  }
  mode = 'success';
  await fill();
  await button.click();
  await waitState('success');
  ensure((await page.locator('#form-response').innerText()).includes('submitted successfully'), 'Success response missing');
  ensure(requests.length === 6, 'Unexpected request count');
  await page.goto('http://127.0.0.1:4177/en/#kontakt');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#contact-form').scrollIntoViewIfNeeded();
  ensure(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile horizontal overflow');
  await page.screenshot({path:'output/playwright/contact-mobile.png'});
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#kontakt').scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/playwright/contact-desktop.png'});
  console.log(JSON.stringify({passed:['required fields','consent','honeypot','payload','duplicate-submit lock','language switch during submit','confirmed success','API rejection','server error','rate limit','network failure','input preservation','mobile layout'],interceptedRequests:requests.length,realEmailsSent:0}));
}
