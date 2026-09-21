/* Functional and responsive checks for the standalone Handlebars template.
   Requires local preview: python3 -m http.server 3458 --directory public */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const Handlebars=require('handlebars');
const root=path.resolve(__dirname,'..');
const compile=Handlebars.compile(fs.readFileSync(path.join(root,'template/templates/sundara.html'),'utf8'));
const demo=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/sundara-demo.json'),'utf8'));
const base=process.env.SUNDARA_PREVIEW_URL||'http://127.0.0.1:3458';
const output=process.env.SUNDARA_QA_DIR||'/tmp/sundara-qa';fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext();const page=await context.newPage();let fixture=structuredClone(demo);const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/sundara-qa',r=>r.fulfill({contentType:'text/html',body:compile(fixture)}));
 const load=async()=>{await page.goto(base+'/sundara-qa',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#sundara').dataset.ready==='true')};
 const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 // 1. Responsive / visual verification at the full supported width range.
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await load();await noOverflow();assert.equal(await page.locator('.wb-event-card').count(),3);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('[data-cover-date]').textContent(),'23–24 February 2027');await page.screenshot({path:path.join(output,`hero-${width}.png`)});}
 // The sample film is visible, decodable, and starts only after a guest action.
 await page.locator('#film').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Play our film'}).click();await page.waitForFunction(()=>document.querySelector('video').currentTime>.25);assert.equal(await page.locator('video').evaluate(v=>v.paused),false);await page.locator('video').evaluate(v=>v.pause());
 // 2. Calendar must retain true event times, apostrophes, and overnight dates.
 fixture.events=[{...demo.events[0],title:"Family's welcome & dinner",date:'2027-02-23',startTime:'23:30',endTime:'01:30'}];
 await load();await page.evaluate(()=>{window.open=(url)=>{window.__calendar=url;return null}});await page.locator('.wb-btn-cal').click();
 const calendar=new URL(await page.evaluate(()=>window.__calendar));assert.equal(calendar.searchParams.get('dates'),'20270223T180000Z/20270223T200000Z');assert.equal(calendar.searchParams.get('text'),"Family's welcome & dinner — Ananya & Arjun");
 // Empty optional content must leave no gallery, video, or visible notes.
 fixture=structuredClone(demo);fixture.gallery={images:[]};fixture.media={};fixture.couple.bride.notes='';fixture.couple.groom.notes='';await load();assert.equal(await page.locator('#moments').count(),0);assert.equal(await page.locator('#film').count(),0);assert.equal(await page.locator('#notes').isVisible(),false);
 // Long names, one family member, and all supported gallery counts.
 for(const count of [1,2,3,4]){fixture=structuredClone(demo);fixture.gallery.images=Array(count).fill(demo.gallery.images[0]);fixture.couple.bride.firstName='Ananyalakshmipriya';fixture.couple.groom.firstName="Arjun O'Connor";fixture.couple.bride.motherName='';await page.setViewportSize({width:320,height:800});await load();await noOverflow();assert.equal(await page.locator('.photo-button').count(),count);await page.locator('.photo-button').first().click();assert.equal(await page.locator('dialog').isVisible(),true);if(count>1){await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.photo-counter').textContent(),`2 / ${count}`)}await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').isVisible(),false);assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('photo-button')),true);}
 // Safe user content and malformed dates cannot execute script or create a fake calendar date.
 fixture=structuredClone(demo);fixture.couple.bride.firstName='<img src=x onerror=alert(1)>';fixture.events[0].date='2027-02-30';fixture.events[0].googleMapsUrl='javascript:alert(1)';fixture.media.videoUrl='javascript:alert(1)';await load();assert.equal(await page.locator('h1 img').count(),0);assert.equal(await page.locator('.wb-btn-cal').first().isDisabled(),true);assert.equal(await page.locator('.map-link').first().isVisible(),false);assert.equal(await page.locator('.film-slot').isVisible(),false);
 // Reduced motion and native uploaded video.
 await page.emulateMedia({reducedMotion:'reduce'});fixture=structuredClone(demo);fixture.media.videoUrl='https://example.com/wedding.mp4';await page.route('https://example.com/wedding.mp4',r=>r.fulfill({status:200,body:'',contentType:'video/mp4'}));await load();assert.equal(await page.locator('#sundara').evaluate(el=>el.classList.contains('motion')),false);assert.equal(await page.locator('video[controls]').count(),1);
 // iOS receives an ICS with true end time, stable calendar fields, and escaped punctuation.
 const ios=await browser.newContext({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',acceptDownloads:true});const ip=await ios.newPage();await ip.route('**/sundara-qa',r=>r.fulfill({contentType:'text/html',body:compile({...demo,events:[{...demo.events[0],title:'Welcome, family; friends',startTime:'18:30',endTime:'21:30'}]})}));await ip.goto(base+'/sundara-qa');const downloadPromise=ip.waitForEvent('download');await ip.locator('.wb-btn-cal').click();const download=await downloadPromise;const file=path.join(output,'event.ics');await download.saveAs(file);const ics=fs.readFileSync(file,'utf8');assert(ics.includes('DTSTART:20270223T130000Z'));assert(ics.includes('DTEND:20270223T160000Z'));assert(ics.includes('Welcome\\, family\\; friends'));await ios.close();
 // The production renderer injects template HTML into a div and re-executes scripts.
 const injected=await context.newPage();await injected.goto(base+'/sundara-qa');await injected.setContent('<div id="template-host"></div>');await injected.evaluate(html=>{const host=document.querySelector('#template-host');host.innerHTML=html;host.querySelectorAll('script').forEach(old=>{const script=document.createElement('script');script.text=old.textContent;old.replaceWith(script)})},compile(demo));assert.equal(await injected.locator('#sundara').getAttribute('data-ready'),'true');assert.equal(await injected.locator('.wb-event-card').count(),3);await injected.close();
 const noJS=await browser.newContext({javaScriptEnabled:false});const fallback=await noJS.newPage();await fallback.route('**/sundara-qa',r=>r.fulfill({contentType:'text/html',body:compile(demo)}));await fallback.goto(base+'/sundara-qa');assert.equal(await fallback.locator('#notes').isVisible(),true);assert.equal(await fallback.locator('.wb-event-card').first().isVisible(),true);await noJS.close();
 assert.deepEqual(errors,[]);console.log('PASS: responsive layouts, event/calendar dates, optional sections, gallery 1–4, keyboard/lightbox focus, long names, escaped content, invalid URLs/dates, reduced motion, native video, iOS calendar.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
