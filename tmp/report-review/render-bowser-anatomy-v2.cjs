const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
 try{
  const results=[];
  for(const [view,label] of [['front','depan'],['back','belakang']]){
   const page=await browser.newPage({viewport:{width:1800,height:2100},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(path.resolve('output/diagrams/bowserjr-anatomi-v2.html')).href+'?view='+view);
   await page.waitForFunction(()=>document.getElementById('status').textContent.includes('WebGL error: 0'));
   await page.evaluate(()=>document.fonts.ready);
   const state=await page.evaluate(()=>{
    const counts={};function walk(n){if(n.mesh)counts[n.name]=(counts[n.name]||0)+1;n.children.forEach(walk);}walk(root);
    return {counts,cards:document.querySelectorAll('.card').length,status:document.getElementById('status').textContent,blinkPatches:document.body.textContent.includes('Kelopak kedip'),fits:[...document.querySelectorAll('.card')].every(c=>c.getBoundingClientRect().bottom<1790)};
   });
   assert.deepEqual(errors,[]);assert.equal(state.cards,6);assert.equal(state.fits,true);assert.equal(state.blinkPatches,false);
   assert.equal(state.counts.ShellSpikeCone,7);assert.equal(state.counts.SpikeBaseRing,7);assert.equal(state.counts.RedHairBezierStrand,3);assert.equal(state.counts.WristSpikeCone,8);assert.equal(state.counts.ToeClawCone,6);
   const output='output/diagrams/bowserjr-bagian-'+label+'-v2.png';
   await page.screenshot({path:output});results.push({output,...state,errors});await page.close();
  }
  console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
