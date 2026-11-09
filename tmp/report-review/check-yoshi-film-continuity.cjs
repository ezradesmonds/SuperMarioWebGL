const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:700}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file:///C:/Kuliah/Grafkom/Project%20UTS/index.html');
  await page.waitForFunction(()=>typeof environmentNode!=='undefined'&&environmentNode);
  // Pause the live loop so all samples and screenshots show the requested timeline frame.
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(300);
  const result=await page.evaluate(()=>{
   const render=renderWorld;renderWorld=()=>{};
   const node=(c,name)=>c.name===name?c:c.children.map(c=>node(c,name)).find(Boolean);
   function sample(t){
    CharacterFilm.frame(t);
    return [yoshiNode,bowserJrNode,toadNode].map(c=>({
     p:c.position.slice(),yaw:c.rotation[1],scale:c.scale.slice(),axis:c.animAxisAngle,
     visible:c.visible,foot:characterFootY(c)+c.position[1],
     support:characterFootY(c,c===bowserJrNode?/sole|footellipsoid|BowserJrBody|GreenShellDome|ShellWhiteTorusRim/i:undefined)+c.position[1],
     torsoBottom:c===bowserJrNode?characterFootY(c,/^BowserJrBody$/)+c.position[1]:null,
     hips:c===bowserJrNode?['LeftHip','RightHip'].map(name=>node(c,name).animRot[0]):[],
     torsoPitch:c===bowserJrNode?node(c,'BowserJrBody').animRot[0]:0,
     egg:c===yoshiNode?node(c,'YoshiEggRollPivot').visible:false,
     eggScale:c===yoshiNode&&node(c,'YoshiEggRollPivot').visible?node(c,'YoshiEggRollPivot').scale[0]:0,
     body:c===yoshiNode?node(c,'YoshiBody').visible:true
    }));
   }
   try{
    const camera=JSON.stringify([camYaw,camPitch,camDist,camTarget]);
    const joins=[34,36,40,42,64,68,68.8,68.9,69.8,70,70.5,72.5,75,80,83].map(t=>({t,before:sample(t-.0001),after:sample(t+.0001)}));
    const growth=[34,34.5,35,35.5,36].map(t=>({t,actors:sample(t)}));
    const roll=[63.999,64,64.25,64.55,65,66,67,67.999,68,68.1,68.5,69,69.5,69.8,70,70.5,71.5,72.5,73,75,80,81,84].map(t=>({t,actors:sample(t)}));
    const velocities=[36,40,80].map(t=>{
     const a=sample(t-.001)[0].p,b=sample(t)[0].p,c=sample(t+.001)[0].p;
     return {t,before:a.map((v,i)=>(b[i]-v)/.001),after:b.map((v,i)=>(c[i]-v)/.001)};
    });
    const first=JSON.stringify(sample(35));sample(68.5);sample(8);const replay=first===JSON.stringify(sample(35));
    CharacterFilm.active=true;CharacterFilm.toggle();
    return {joins,growth,roll,velocities,replay,cameraPreserved:camera===JSON.stringify([camYaw,camPitch,camDist,camTarget]),restored:[yoshiNode,bowserJrNode,toadNode].every(c=>c.visible&&c.scale.every(v=>v===1))};
   }finally{renderWorld=render;}
  });
  for(const {t,before,after} of result.joins)for(let i=0;i<3;i++){
   if(!before[i].visible||!after[i].visible)continue;
   assert.ok(Math.hypot(...before[i].p.map((v,j)=>after[i].p[j]-v))<.02,`Position cut at ${t}, actor ${i}`);
   assert.ok(Math.abs(Math.atan2(Math.sin(after[i].yaw-before[i].yaw),Math.cos(after[i].yaw-before[i].yaw)))<.02,`Heading cut at ${t}, actor ${i}`);
   assert.ok(Math.abs(after[i].scale[0]-before[i].scale[0])<.01,`Scale cut at ${t}`);
  }
  const pipe=[-4.2,-1.55];
  for(let i=0;i<result.growth.length;i++){
   const actor=result.growth[i].actors[0];assert.equal(actor.visible,true);
   assert.ok(Math.hypot(actor.p[0]-pipe[0],actor.p[2]-pipe[1])<.001,'Yoshi did not emerge at pipe mouth');
   if(i)assert.ok(actor.scale[0]>result.growth[i-1].actors[0].scale[0],'Growth did not progress');
  }
  assert.equal(result.growth[0].actors[0].scale[0],.04);assert.equal(result.growth.at(-1).actors[0].scale[0],1);
  for(const v of result.velocities)assert.ok(Math.hypot(v.before[0]-v.after[0],v.before[2]-v.after[2])<.02,`Velocity cut at ${v.t}`);
  const chase=result.roll.filter(s=>s.t>=64&&s.t<=68);
  const gaps=chase.map(s=>Math.hypot(s.actors[0].p[0]-s.actors[1].p[0],s.actors[0].p[2]-s.actors[1].p[2]));
  for(let i=1;i<gaps.length;i++)assert.ok(gaps[i]<=gaps[i-1]+.0001,'Egg did not close the gap');
  assert.ok(Math.abs(gaps.at(-1)-1.2)<.001,'Egg did not contact Bowser');
  for(const s of result.roll.filter(s=>s.t>=65&&s.t<=69))assert.ok(s.actors[0].egg&&!s.actors[0].body,'Egg unfolded before collision');
  assert.equal(result.roll.find(s=>s.t===70).actors[0].body,true);
  for(const s of result.growth)assert.equal(s.actors[2].visible,true,'Toad disappeared during pipe entrance');
  const seated=result.roll.find(s=>s.t===69.5).actors[1],standing=result.roll.find(s=>s.t===73).actors[1];
  assert.ok(seated.hips.every(v=>Math.abs(v+1.4)<.001),'Bowser did not extend his legs into a sitting pose');
  assert.ok(seated.torsoPitch<-.4,'Bowser did not lean back into the seated pose');
  assert.ok(Math.abs(seated.support)<.001,'Seated Bowser is not supported by the floor');
  assert.ok(seated.foot>=-.001,'Seated feet penetrate the platform');
  assert.ok(seated.torsoBottom<.18,`Bowser torso did not lower onto the supported shell: ${JSON.stringify(seated)}`);
  assert.ok(standing.torsoBottom>seated.torsoBottom+.15,'Bowser did not stand back up');
  const yAt64=result.roll.find(s=>s.t===64).actors[0],originalAngle=Math.atan2(yAt64.p[2]-2,yAt64.p[0])+4*.65;
  const rebound=result.roll.find(s=>s.t===69.8).actors[0];
  assert.ok(Math.hypot(rebound.p[0]-2*Math.cos(originalAngle),rebound.p[2]-(2+2*Math.sin(originalAngle)))<.001,'Yoshi did not return to his original chase slot');
  assert.ok(result.roll.find(s=>s.t===68.5).actors[0].foot>.2,'Yoshi did not bounce into the air');
  const walkA=result.roll.find(s=>s.t===80).actors,walkB=result.roll.find(s=>s.t===81).actors;
  for(let i=0;i<3;i++)assert.ok(Math.hypot(walkB[i].p[0]-walkA[i].p[0],walkB[i].p[2]-walkA[i].p[2])>.5,`Actor ${i} did not resume walking`);
  for(const actors of [walkA,walkB])for(let i=0;i<3;i++)assert.ok(Math.abs(Math.hypot(actors[i].p[0]-actors[(i+1)%3].p[0],actors[i].p[2]-actors[(i+1)%3].p[2])-Math.sqrt(12))<.001,'Walking group lost spacing');
  assert.equal(result.replay,true);assert.equal(result.cameraPreserved,true);assert.equal(result.restored,true);
  const screenshots=[];
  for(const t of [35,37.5,41,65,67.9,68.5,69.5,70.5,72.5,81]){
   await page.evaluate(t=>{camTarget=[-1,1,1];camDist=13;camYaw=.25;camPitch=.4;CharacterFilm.frame(t);},t);
   const path=`tmp/report-review/yoshi-sequence-${t}.png`;await page.screenshot({path});screenshots.push(path);
   assert.equal(await page.evaluate(()=>gl.getError()),0);
  }
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({ok:true,joinsChecked:result.joins.map(s=>s.t),velocities:result.velocities,eggGaps:gaps,seated,standing,rebound,pipeGrowth:result.growth.map(s=>({t:s.t,scale:s.actors[0].scale[0],foot:s.actors[0].foot,toadVisible:s.actors[2].visible})),replay:result.replay,cameraPreserved:result.cameraPreserved,restored:result.restored,screenshots,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
