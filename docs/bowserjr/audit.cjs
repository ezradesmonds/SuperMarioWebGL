const fs=require('fs'),vm=require('vm');
const ctx=vm.createContext({console,window:{addEventListener(){}},document:{querySelectorAll(){return []}}});
for(const file of ['js/math3d.js','js/primitives.js','js/sceneNode.js','characters/bowserjr.js','js/main.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
vm.runInContext(`
const fakeGL={createBuffer:()=>({}),bindBuffer(){},bufferData(){}};
for(const key of Object.keys(Primitives))if(key.startsWith('create')&&key!=='createMeshBuffer'){
 const original=Primitives[key];Primitives[key]=function(...args){const mesh=original.apply(this,args);mesh.kind=key;mesh.args=args.slice(1);return mesh;};
}
const bowser=createBowserJr(fakeGL);
bowser.animate(1,'combined');
const inventory=[];function walk(n,path,visible){const p=path+'/'+n.name;const vis=visible&&n.visible;if(n.mesh)inventory.push({name:n.name,path:p,kind:n.mesh.kind||'custom mesh',args:n.mesh.args||[],visible:vis,isCurve:n.mesh.isCurve,vertices:n.mesh.cpuPositions.length/3});n.children.forEach(c=>walk(c,p,vis));}walk(bowser,'',true);
environmentNode={walkCenterZ:6.3};
const samples=[];
for(const t of [0.16,1,2,3.16]){
 bowser.animate(t,'combined');applyWalkMovement(bowser,t,1);
 samples.push({t,position:bowser.position.slice(),rotation:bowser.rotation.slice(),arbitraryAxis:bowser.animAxis,arbitraryAngle:bowser.animAxisAngle,eyelids:bowser.eyelids.map(l=>({visible:l.visible,scale:l.animScale}))});
}
globalThis.result={inventory,samples,curves:inventory.filter(n=>n.isCurve).length,visibleMeshCount:inventory.filter(n=>n.visible).length,meshNodeCount:inventory.length};
`,ctx);
fs.writeFileSync('docs/bowserjr/inventory.json',JSON.stringify(ctx.result,null,2));
const counts={};for(const n of ctx.result.inventory)counts[n.kind]=(counts[n.kind]||0)+1;
console.log(JSON.stringify({counts,curves:ctx.result.curves,visibleMeshCount:ctx.result.visibleMeshCount,meshNodeCount:ctx.result.meshNodeCount,samples:ctx.result.samples},null,2));
