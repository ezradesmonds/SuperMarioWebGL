const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const {spawn}=require('child_process');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('url');
const path=require('path');
(async()=>{
 const server=spawn(process.execPath,['tools/trailer-server.cjs'],{cwd:process.cwd(),env:{...process.env,TRAILER_PORT:'8785'},windowsHide:true,stdio:['ignore','pipe','pipe']});
 let browser;
 try{
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
  const page=await browser.newPage({viewport:{width:960,height:600}}),errors=[],badRequests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badRequests.push(r.url()+':'+r.status());});
  await page.goto('http://127.0.0.1:8785/trailer-player.html');
  await page.waitForFunction(()=>!document.getElementById('start-play').disabled);
  await page.waitForFunction(()=>document.getElementById('music').readyState>=2);
  assert.equal(await page.locator('#music').evaluate(a=>a.duration),90);
  await page.locator('#start-play').click();
  await page.waitForFunction(()=>document.getElementById('seek').valueAsNumber>.3);
  assert.equal(await page.locator('#music').evaluate(a=>a.paused),false);
  await page.locator('#play').click();
  const stopped=await page.locator('#seek').inputValue();await page.waitForTimeout(250);
  assert.equal(await page.locator('#seek').inputValue(),stopped);
  const frames=[];
  for(const t of [6,12,18,24,36,46,55,64.5,66,68,70,77,83,89,0]){
   await page.locator('#seek').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},t);
   const state=await page.evaluate(()=>({error:gl.getError(),title:document.getElementById('title').textContent,egg:yoshiNode.eggMode,feet:[toadNode,bowserJrNode,yoshiNode].map(c=>c.position[1]+characterFootY(c)),audio:document.getElementById('music').currentTime}));
   assert.equal(state.error,0);assert.ok(state.feet.every(y=>Math.abs(y)<.001),'feet remain on platform');
   assert.ok(Math.abs(state.audio-t)<.15,'music seeks with film');
   if(t===66)assert.equal(state.egg,true);
   if(t===0)assert.equal(state.egg,false);
   if([12,24,66].includes(t))await page.screenshot({path:`tmp/report-review/film-${t}.png`});
   frames.push({t,...state});
  }
  await page.locator('#seek').evaluate(el=>{el.value=89.7;el.dispatchEvent(new Event('input'));});
  await page.locator('#play').click();await page.waitForFunction(()=>document.getElementById('play').textContent==='Ulangi');
  assert.equal(await page.locator('#music').evaluate(a=>a.paused),true);
  await page.locator('#play').click();await page.waitForFunction(()=>document.getElementById('seek').valueAsNumber<3);
  await page.locator('#play').click();
  await page.locator('#sound').click();assert.equal(await page.locator('#music').evaluate(a=>a.muted),true);
  await page.locator('#sound').click();
  await page.locator('body').click({position:{x:4,y:4}});await page.keyboard.press('z');await page.waitForURL('**/index.html');
  await page.keyboard.press('z');await page.waitForURL('**/trailer-player.html');await page.waitForFunction(()=>!document.getElementById('start-play').disabled);
  const filePage=await browser.newPage({viewport:{width:960,height:600}});filePage.on('pageerror',e=>errors.push(e.message));
  await filePage.goto(pathToFileURL(path.resolve('trailer-player.html')).href);
  await filePage.waitForFunction(()=>!document.getElementById('start-play').disabled);await filePage.locator('#start-play').click();
  await filePage.waitForFunction(()=>document.getElementById('seek').valueAsNumber>.2);
  assert.equal(await filePage.evaluate(()=>gl.getError()),0);
  assert.deepEqual(errors,[]);assert.deepEqual(badRequests,[]);
  console.log(JSON.stringify({ok:true,httpAndFilePlayback:true,audioDuration:90,pauseSeekReplayMuteAndZ:true,frames,errors,badRequests},null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
