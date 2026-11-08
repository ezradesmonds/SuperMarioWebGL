const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const context=vm.createContext({console,window:{addEventListener(){}},document:{querySelectorAll(){return[]}}});
for(const f of ['js/math3d.js','js/primitives.js','js/sceneNode.js','characters/bowserjr.js','js/main.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context,{filename:f});
vm.runInContext(`
const fakeGL={createBuffer:()=>({}),bindBuffer(){},bufferData(){}};
for(const key of Object.keys(Primitives))if(key.startsWith('create')&&key!=='createMeshBuffer'){
 const original=Primitives[key];Primitives[key]=function(...args){const mesh=original.apply(this,args);mesh.kind=key;mesh.args=args.slice(1);return mesh;};
}
const root=createBowserJr(fakeGL);const nodes=[];function visit(n){nodes.push(n);n.children.forEach(visit)}visit(root);
const named=name=>nodes.filter(n=>n.name===name);
const ribs=named('BellyRibBezier').map(n=>{const p=n.mesh.args.slice(0,4);let gapMin=Infinity,gapMax=-Infinity;for(let i=0;i<=100;i++){const [x,y,z]=Vec3.bezierPoint(...p,i/100);const surface=.27+.34*Math.sqrt(Math.max(0,1-(x/.45)**2-((y+.08)/.47)**2));gapMin=Math.min(gapMin,z-surface);gapMax=Math.max(gapMax,z-surface);}return {gapMin,gapMax};});
const spikes=named('ShellSpikePivot').map(p=>{
const [x,y,z]=p.position,n=Vec3.normalize([x/.58**2,y/.46**2,z/.60**2]);let r=Mat4.rotateX(Mat4.identity(),p.rotation[0]);r=Mat4.rotateZ(r,p.rotation[2]);return {surface:(x/.58)**2+(y/.46)**2+(z/.60)**2,alignment:n[0]*r[4]+n[1]*r[5]+n[2]*r[6],base:p.children.find(c=>c.name==='ShellSpikeCone').position[1]-.23/2};});
const samples=[];let footError=0,nonFinite=0;
environmentNode={walkCenterZ:6.3};
for(const mode of ['idle','walk','action','combined'])for(let i=0;i<=140;i++){
 const t=i*.1;root.animate(t,mode);if(mode==='combined')applyWalkMovement(root,t,1);
 const foot=characterFootY(root);const ground=mode==='combined'?-2.375:0;root.position[1]=ground-foot;
 footError=Math.max(footError,Math.abs(characterFootY(root)+root.position[1]-ground));
 for(const n of nodes)for(const a of [n.position,n.rotation,n.scale,n.animPos,n.animRot,n.animScale,n.animAxis])if(!a.every(Number.isFinite))nonFinite++;
 if(!Number.isFinite(foot))nonFinite++;
 if(i===16)samples.push({mode,foot});
}
const pads=named('FootSolePad').map(n=>{let min=Infinity,max=-Infinity;for(let i=0;i<n.mesh.cpuPositions.length;i+=3){const p=n.mesh.cpuPositions;const r=(p[i]/.24)**2+(p[i+1]/.16)**2+(p[i+2]/.33)**2;min=Math.min(min,r);max=Math.max(max,r);}return {min,max,offset:n.position};});
globalThis.checks={pads,eyeBases:named('EyeLidBaseEllipsoid').length,thighJoints:named('ThighJointEllipsoid').length,meshNodes:nodes.filter(n=>n.mesh).length,curves:nodes.filter(n=>n.mesh&&n.mesh.isCurve).length,ribs,spikes,poseSamples:4*141,footError,nonFinite,samples};
`,context);
const r=context.checks;
assert.equal(r.meshNodes,80);assert.equal(r.spikes.length,7);assert.equal(r.curves,9);assert.equal(r.nonFinite,0);assert.ok(r.footError<1e-6);
assert.equal(r.eyeBases,2);assert.equal(r.thighJoints,2);
for(const pad of r.pads){assert.ok(pad.min>1&&pad.max<1.04);assert.ok(pad.offset.every(v=>v===0));}
for(const rib of r.ribs){assert.ok(rib.gapMin>=.003,JSON.stringify(rib));assert.ok(rib.gapMax<.04);}
for(const spike of r.spikes){assert.ok(Math.abs(spike.surface-1)<1e-10);assert.ok(spike.alignment>.999999);assert.ok(spike.base>0&&spike.base<.02);}
console.log(JSON.stringify(r,null,2));

