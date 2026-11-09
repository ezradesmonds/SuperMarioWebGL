const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});try{
 const page=await browser.newPage({viewport:{width:1100,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///C:/Kuliah/Grafkom/Project%20UTS/index.html');await page.waitForFunction(()=>typeof environmentNode!=='undefined'&&environmentNode);
 const url=page.url();await page.keyboard.press('z');assert.equal(await page.evaluate(()=>CharacterFilm.active),true);assert.equal(page.url(),url);
 const liveBefore=await page.evaluate(()=>({time:CharacterFilm.time,wall:performance.now(),positions:[yoshiNode,toadNode,bowserJrNode].map(c=>c.position.slice())}));
 await page.waitForTimeout(1800);
 const liveAfter=await page.evaluate(()=>({time:CharacterFilm.time,wall:performance.now(),positions:[yoshiNode,toadNode,bowserJrNode].map(c=>c.position.slice())}));
 const wallSeconds=(liveAfter.wall-liveBefore.wall)/1000,animationSeconds=liveAfter.time-liveBefore.time;
 assert.ok(animationSeconds>wallSeconds*.7,`Animation fell behind: ${animationSeconds}/${wallSeconds}`);
 assert.notDeepEqual(liveBefore.positions[1],liveAfter.positions[1],'Toad did not move after Z');
 assert.deepEqual(await page.evaluate(()=>[yoshiNode.visible,toadNode.visible,bowserJrNode.visible]),[false,true,false]);
 const before=await page.evaluate(()=>({yaw:camYaw,pitch:camPitch,dist:camDist}));
 await page.mouse.move(500,300);await page.mouse.down();await page.mouse.move(650,340,{steps:5});await page.mouse.up();await page.mouse.wheel(0,100);
 const after=await page.evaluate(()=>({yaw:camYaw,pitch:camPitch,dist:camDist}));assert.notEqual(before.yaw,after.yaw);assert.notEqual(before.pitch,after.pitch);assert.notEqual(before.dist,after.dist);
 await page.evaluate(()=>{CharacterFilm.active=false;});
 const states=[];
 for(const t of [0,8,14.99,15,20,28,33.99,34,38,39.99,40,48,58,66,74,78,84,106,109.99]){
  const s=await page.evaluate(t=>{
   const camera=JSON.stringify([camYaw,camPitch,camDist,camTarget]),actors=[yoshiNode,toadNode,bowserJrNode];
   function signature(c){return JSON.stringify([c.position,c.rotation,c.animPos,c.animRot,c.animScale,c.animAxisAngle,c.visible,c.children.map(signature)]);}
   CharacterFilm.frame(t);const before=actors.map(signature),visible=actors.map(c=>c.visible);
   CharacterFilm.frame(Math.min(t+.2,109.999));const moving=actors.map((c,i)=>!visible[i]||signature(c)!==before[i]);
   return {t,moving,error:gl.getError(),cameraPreserved:camera===JSON.stringify([camYaw,camPitch,camDist,camTarget]),visible,egg:yoshiNode.eggMode,finite:actors.every(c=>c.position.every(Number.isFinite))};
  },t);
  assert.ok(s.moving.every(Boolean),`Stationary actor at ${t}: ${JSON.stringify(s.moving)}`);
  const visible=t<15?[false,true,false]:t<34?[false,true,true]:[true,true,true];
  assert.equal(s.error,0);assert.equal(s.cameraPreserved,true);assert.deepEqual(s.visible,visible,`Wrong actors at ${t}`);assert.equal(s.finite,true);if(t===66)assert.equal(s.egg,true);states.push(s);
 }
 const replay=await page.evaluate(()=>{
  const snapshot=()=>JSON.stringify([yoshiNode,toadNode,bowserJrNode].map(c=>({position:c.position,rotation:c.rotation,visible:c.visible,axis:c.animAxisAngle})));
  CharacterFilm.frame(78);const first=snapshot();CharacterFilm.frame(8);CharacterFilm.frame(78);const same=first===snapshot();
  CharacterFilm.time=109.99;CharacterFilm.advance(.02);
  return {same,time:CharacterFilm.time,visible:[yoshiNode.visible,toadNode.visible,bowserJrNode.visible]};
 });assert.equal(replay.same,true);assert.ok(replay.time<.1);assert.deepEqual(replay.visible,[false,true,false]);
 const jump=await page.evaluate(()=>{CharacterFilm.frame(7.3);return characterFootY(toadNode)+toadNode.position[1]-environmentNode.surfaceY;});assert.ok(jump>.2,`Toad jump cancelled: ${jump}`);
 await page.keyboard.press('z');assert.equal(await page.evaluate(()=>CharacterFilm.active),true);await page.waitForFunction(()=>CharacterFilm.time>.1);await page.keyboard.press('z');assert.equal(await page.evaluate(()=>CharacterFilm.active),false);
 assert.deepEqual(await page.evaluate(()=>[yoshiNode.visible,toadNode.visible,bowserJrNode.visible]),[true,true,true]);
 await page.keyboard.press('z');await page.screenshot({path:'tmp/report-review/character-film-moving.png'});await page.keyboard.press('z');
 assert.equal(await page.locator('video,audio').count(),0);assert.equal((await page.locator('body').innerText()).trim(),'');assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,ZStaysInScene:true,mouseCamera:true,silent:true,noText:true,toggleOff:true,wallSeconds,animationSeconds,jump,replay,states,errors},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
