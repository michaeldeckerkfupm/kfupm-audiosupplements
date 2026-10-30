const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const catalog=require('./reading-collections.json');
(async()=>{
 const server=http.createServer((req,res)=>{
  const name=req.url.split('?')[0];
  if(name==='/tests.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(['short','long','full'].map(section=>({section,series:'Set 1',number:1,audio:'test.mp3',questions:[]}))));return;}
  const file=path.join(process.cwd(),name==='/'?'index.html':name);
  if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(8769,r));
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/tmp/reading-chromium',headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const home=async()=>{await page.goto('http://localhost:8769/index.html');await page.waitForSelector('[data-section="short"]');};
  const group=async(id,count)=>{await page.locator(id==='major-1'?'#readingTestsButton':'#otherReadingButton').click();const box=page.locator(id==='major-1'?'#readingTestsContents':'#otherReadingContents');await box.locator('.card').first().waitFor();assert.equal(await box.locator('.card').count(),count);return box;};
  await home();assert.deepEqual(await page.locator('#readingMenu strong').allTextContents(),['Skills guide','Major 1','Major 2 and Final Exam']);
  const major1=await group('major-1',2);assert.deepEqual(await major1.locator('.card strong').allTextContents(),['Reading Tests 1-Teacher','Reading Tests 1-Student']);
  const major2=await group('major-2-final',3);assert.deepEqual(await major2.locator('.card strong').allTextContents(),['Reading Tests 2-Teacher','Reading Tests 3-Teacher','Reading Tests 3-Student']);assert(await major1.isHidden());
  assert(!/not aligned|B1 Reading|5_Student/.test(await page.locator('body').innerText()));await page.screenshot({path:'/tmp/reading-groups-desktop.png',fullPage:true});
  await page.locator('[data-section="short"]').click();assert(await major2.isHidden());await page.locator('#readingGuideButton').click();await page.waitForSelector('.reading-toc button');assert(await page.locator('#tests').isHidden());
  for(const collection of catalog){
   const data=JSON.parse(fs.readFileSync(collection.dataFile));assert.equal(data.length,collection.count);
   await page.goto('http://localhost:8769/reading-practice.html?collection='+collection.id);await page.waitForSelector('#practiceTests .card');assert.equal(await page.locator('#practiceTests .card').count(),collection.count);assert.equal(await page.locator('#practiceCollectionTitle').innerText(),collection.exam);assert.equal(await page.locator('#practiceCollectionSubtitle strong').innerText(),collection.title);assert.equal(await page.locator('#practiceDisclaimer').count(),0);assert(!/B1|5_Student|not aligned/.test(await page.locator('body').innerText()));
   if(collection.vocabulary)assert.equal(await page.getByRole('button',{name:'Vocabulary',exact:true}).count(),18);
   await page.locator('#practiceTests .card').first().getByRole('button',{name:'Start · 20 minutes',exact:true}).click();assert.equal(await page.locator('#passageImageButton').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.exam-question').count(),data[0].questions.length);
  }
  // Start through old student URL, then resume through its newly named packet.
  await page.goto('http://localhost:8769/reading-practice.html?reading=1');await page.waitForSelector('#exam-q-0');await page.locator('#exam-q-0 input').first().check();await page.locator('#exam-q-0 .flag-button').click();
  const key='engl010-reading-five-student-v1:1',saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  await page.locator('.brand-home').click();await page.waitForSelector('#readingTestsButton');const box=await group('major-1',2);await box.locator('#packet-reading-1-student').click();await box.locator('.packet-contents .card').first().waitFor();await box.locator('.packet-contents .card').first().getByRole('link',{name:'Reading test',exact:true}).click();await page.waitForSelector('#exam-q-0');assert.equal(await page.locator('#exam-q-0 input:checked').count(),1);assert.equal(await page.locator('#exam-q-0 .flag-button').getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).deadline,key),saved.deadline);
  await page.goto('http://localhost:8769/reading-practice.html?vocabulary=1');await page.waitForSelector('#vocabWord');await page.locator('#vocabKnown').click();const vocab=await page.locator('#vocabProgress').innerText();await page.goto('http://localhost:8769/reading-practice.html?collection=reading-1-student&vocabulary=1');await page.waitForSelector('#vocabWord');assert.equal(await page.locator('#vocabProgress').innerText(),vocab);
  // The old teacher collection URL and current packet link retain the same saved attempt.
  await page.goto('http://localhost:8769/reading-practice.html?collection=other-1-teacher&reading=1');await page.waitForSelector('#exam-q-0');await page.locator('#exam-q-0 input').first().check();const teacherKey='engl010-reading-five-student-v1:other-1-teacher-1',teacher=await page.evaluate(k=>localStorage.getItem(k),teacherKey);await page.locator('.brand-home').click();await page.waitForSelector('#readingTestsButton');const teacherMenu=await group('major-1',2);await teacherMenu.locator('#packet-other-1-teacher').click();await teacherMenu.locator('.packet-contents .card').first().waitFor();await teacherMenu.locator('.packet-contents .card').first().getByRole('link',{name:'Reading test',exact:true}).click();await page.waitForSelector('#exam-q-0');assert.equal(await page.evaluate(k=>localStorage.getItem(k),teacherKey),teacher);assert.equal(await page.locator('#exam-q-0 input:checked').count(),1);
  await page.setViewportSize({width:390,height:844});await home();await group('major-1',2);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/tmp/reading-groups-mobile.png',fullPage:true});await group('major-2-final',3);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  assert.equal(catalog.filter(c=>c.group==='major-1').reduce((n,c)=>n+c.count,0),42);assert.equal(catalog.filter(c=>c.group==='major-2-final').reduce((n,c)=>n+c.count,0),38);
  console.log('Passed: 2/3 packet grouping, all 80 readings reachable, old links, saved student/teacher answers and timers, vocabulary progress, default images, guide/listening switching, and mobile width.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
