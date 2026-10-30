const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const server=http.createServer((req,res)=>{const name=req.url.split('?')[0];if(name==='/tests.json'){res.setHeader('Content-Type','application/json');res.end('[]');return;}const file=path.join(process.cwd(),name==='/'?'index.html':name);if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(8770,r));const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/tmp/reading-chromium',headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:8770/index.html');await page.locator('#readingTestsButton').click();await page.waitForSelector('#packet-other-1-teacher');
  for(const collection of require('./reading-collections.json')){
   const group=collection.group==='major-1'?'readingTestsContents':'otherReadingContents';
   if(await page.locator('#'+group).isHidden()){await page.locator(collection.group==='major-1'?'#readingTestsButton':'#otherReadingButton').click();await page.waitForSelector('#packet-'+collection.id);}
   const url=page.url();await page.locator('#packet-'+collection.id).click();await page.waitForSelector('#'+group+' .packet-contents .card');
   assert.equal(page.url(),url);assert.equal(await page.locator('#'+group+' .packet-contents .card').count(),collection.count);assert.equal(await page.locator('#'+group+' .packet-contents h4').innerText(),collection.title);
   assert.equal(await page.locator('#'+group+' .packet-choice[aria-expanded=true]').count(),1);assert.equal(await page.locator('#'+group+' .packet-choice-dimmed').count(),collection.group==='major-1'?1:2);
   const href=await page.locator('#'+group+' .packet-contents a').first().getAttribute('href');assert.equal(href,'reading-practice.html?collection='+collection.id+'&reading=1');
   if(collection.vocabulary)assert.equal(await page.locator('#'+group+' .packet-contents').getByRole('link',{name:'Vocabulary',exact:true}).count(),18);
  }
  const sticky=page.locator('#packet-contents-major-2-final>h4');
  await page.locator('#packet-contents-major-2-final .card').nth(6).scrollIntoViewIfNeeded();
  await page.evaluate(()=>window.scrollBy(0,120));
  assert(Math.abs((await sticky.boundingBox()).y)<1);assert.equal(await sticky.innerText(),'Reading Tests 3-Student');
  await page.screenshot({path:'/tmp/sticky-packet-desktop.png'});
  await page.locator('#packet-other-3-student').press('Space');assert(await page.locator('#packet-contents-major-2-final').isHidden());assert.equal(await page.locator('#otherReadingContents .packet-choice-dimmed').count(),0);
  await page.locator('#packet-other-2-teacher').press('Enter');await page.waitForSelector('#packet-contents-major-2-final .card');await page.screenshot({path:'/tmp/inline-packets-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.locator('#readingTestsButton').click();await page.waitForSelector('#packet-reading-1-student');await page.locator('#packet-reading-1-student').click();await page.waitForSelector('#packet-contents-major-1 .card');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/tmp/inline-packets-mobile.png',fullPage:true});
  const mobileHeading=page.locator('#packet-contents-major-1>h4');
  await page.locator('#packet-contents-major-1 .card').nth(8).scrollIntoViewIfNeeded();
  await page.evaluate(()=>window.scrollBy(0,120));
  assert(Math.abs((await mobileHeading.boundingBox()).y)<1);assert.equal(await mobileHeading.innerText(),'Reading Tests 1-Student');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'/tmp/sticky-packet-mobile.png'});
  await page.locator('#packet-contents-major-1 .card').first().getByRole('link',{name:'Vocabulary',exact:true}).click();await page.waitForSelector('#vocabWord');assert(await page.locator('#practiceVocabulary').isVisible());
  await page.goto('http://localhost:8770/index.html');let attempts=0;await page.route('**/other-2-teacher.json',route=>++attempts===1?route.abort():route.continue());await page.locator('#otherReadingButton').click();await page.waitForSelector('#packet-other-2-teacher');await page.locator('#packet-other-2-teacher').click();await page.getByRole('button',{name:'Try again',exact:true}).click();await page.waitForSelector('#packet-contents-major-2-final .card');assert.equal(await page.locator('#packet-contents-major-2-final .card').count(),15);
  await page.locator('#packet-contents-major-2-final .card').first().getByRole('link',{name:'Reading test',exact:true}).click();await page.waitForSelector('#exam-q-0');assert(await page.locator('#practiceExam').isVisible());assert.deepEqual(errors,[]);
  console.log('Passed: all five packets expand inline, correct counts, selected/dimmed states, switching and keyboard collapse, vocabulary/test links, failed-load retry, and mobile width.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
