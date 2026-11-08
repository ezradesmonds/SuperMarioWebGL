// Documentation renderer: imports and draws the unmodified production character.
const palette={ellipsoid:'#2d7960',cylinder:'#24749a',frustum:'#aa6225',torus:'#9362a6',curve:'#b6425a',custom:'#64707b'};
for(const key of Object.keys(Primitives)) {
 if(!key.startsWith('create')||key==='createMeshBuffer')continue;
 const original=Primitives[key];
 Primitives[key]=function(...args){const mesh=original.apply(this,args);mesh.documentationKind=key;mesh.documentationArgs=args.slice(1);return mesh;};
}
function compile(gl,type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;}
const vertex=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModelMatrix,uProjectionMatrix,uViewMatrix;uniform mat3 uNormalMatrix;varying vec3 normal;varying vec3 position;void main(){vec4 world=uModelMatrix*vec4(aPosition,1.0);normal=normalize(uNormalMatrix*aNormal);position=world.xyz;gl_Position=uProjectionMatrix*uViewMatrix*world;}`;
const fragment=`precision mediump float;varying vec3 normal;varying vec3 position;uniform vec3 uColor;uniform float uShininess;uniform vec3 uEye;void main(){vec3 N=normalize(normal);vec3 V=normalize(uEye-position);vec3 L=normalize(vec3(-3.0,6.0,7.0));vec3 H=normalize(L+V);float key=max(dot(N,L),0.0);float fill=max(dot(N,normalize(vec3(5.0,3.0,-5.0))),0.0);float spec=pow(max(dot(N,H),0.0),max(12.0,uShininess))*0.17;vec3 c=uColor*(vec3(0.43,0.46,0.49)+vec3(0.65,0.62,0.55)*key+vec3(0.14,0.18,0.22)*fill)+vec3(spec);gl_FragColor=vec4(c,1.0);}`;
function matrices(n,parent) {
 let m=Mat4.translate(parent,...n.position.map((p,i)=>p+n.animPos[i]));
 m=Mat4.rotateX(m,n.rotation[0]+n.animRot[0]);m=Mat4.rotateY(m,n.rotation[1]+n.animRot[1]);m=Mat4.rotateZ(m,n.rotation[2]+n.animRot[2]);m=Mat4.rotateAxis(m,n.animAxis,n.animAxisAngle);m=Mat4.scale(m,...n.scale.map((v,i)=>v*n.animScale[i]));
 let g=Mat4.translate(m,...n.geomOffset);g=Mat4.rotateX(g,n.geomRot[0]);g=Mat4.rotateY(g,n.geomRot[1]);g=Mat4.rotateZ(g,n.geomRot[2]);g=Mat4.scale(g,...n.geomScale);return {local:m,geometry:g};
}
function transform(m,p){return [0,1,2,3].map(r=>m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]);}
function meshCenter(mesh){if(mesh.documentationKind==='createBezierTube')return Vec3.bezierPoint(...mesh.documentationArgs.slice(0,4),0.5);const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];mesh.cpuPositions.forEach((v,i)=>{min[i%3]=Math.min(min[i%3],v);max[i%3]=Math.max(max[i%3],v);});return min.map((v,i)=>(v+max[i])/2);}
const inventories=[];
function renderPanel(id,yaw,labels,options={}) {
 const panel=document.getElementById(id),canvas=panel.querySelector('canvas');
 const gl=canvas.getContext('webgl',{antialias:true,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL unavailable');
 const program=gl.createProgram();gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const shader={};for(const k of ['uModelMatrix','uViewMatrix','uProjectionMatrix','uNormalMatrix','uColor','uShininess','uChecker','uMaterialKind'])shader[k]=gl.getUniformLocation(program,k);
 for(const k of ['aPosition','aNormal']){shader[k]=gl.getAttribLocation(program,k);gl.enableVertexAttribArray(shader[k]);}
 const root=createBowserJr(gl);root.animate(options.time||1,options.pose||'idle');if(!options.pose)root.resetAnim();if(!options.pose)root.eyelids.forEach(n=>n.visible=false);
 if(options.blink)animateBlink(root,0.16);
 const distance=options.distance||5.5,target=options.target||[0,1.22,0];
 const eye=[Math.sin(yaw)*distance,target[1]+0.26,Math.cos(yaw)*distance];
 const view=Mat4.lookAt(eye,target,[0,1,0]),projection=Mat4.perspective(0.62,canvas.width/canvas.height,.1,30),pv=Mat4.multiply(projection,view);
 gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);
 gl.uniform3fv(gl.getUniformLocation(program,'uEye'),eye);gl.uniformMatrix4fv(shader.uProjectionMatrix,false,projection);gl.uniformMatrix4fv(shader.uViewMatrix,false,view);
 root.draw(gl,shader,Mat4.identity());gl.finish();
 const nodes=[];
 function visit(n,parent,path,visible){const m=matrices(n,parent);const entry={node:n,world:m.geometry,path:path+'/'+n.name,visible:visible&&n.visible};nodes.push(entry);n.children.forEach(c=>visit(c,m.local,entry.path,entry.visible));}
 visit(root,Mat4.identity(),'',true);
 function project(entry,offset){const p=transform(entry.world,offset||meshCenter(entry.node.mesh));const q=transform(pv,p);return [(q[0]/q[3]*.5+.5)*canvas.width,(-q[1]/q[3]*.5+.5)*canvas.height];}
 const svg=panel.querySelector('svg'),NS='http://www.w3.org/2000/svg';
 for(const label of labels){
  const matches=nodes.filter(n=>n.node.name===label.name),entry=matches[label.index||0];if(!entry)throw Error('Missing node '+label.name);
  const [tx,ty]=project(entry,label.at),color=palette[label.type],left=label.side==='left',x=left?24:1018,y=label.y;
  const el=document.createElement('div');el.className='label';el.style.cssText=`left:${x}px;top:${y}px;--c:${color}`;
  el.innerHTML=`<b>${label.title}</b><span>${label.kind}</span><small>${label.source||label.name}</small>`;panel.appendChild(el);
  const start=left?x+305:x,edge=left?350:998,sy=y+37;
  const line=document.createElementNS(NS,'polyline');line.setAttribute('points',`${start},${sy} ${edge},${sy} ${tx},${ty}`);line.setAttribute('fill','none');line.setAttribute('stroke',color);line.setAttribute('stroke-width','1.8');line.setAttribute('opacity','.75');if(label.hidden)line.setAttribute('stroke-dasharray','6 5');svg.appendChild(line);
  const dot=document.createElementNS(NS,'circle');dot.setAttribute('cx',tx);dot.setAttribute('cy',ty);dot.setAttribute('r','4.8');dot.setAttribute('fill',color);dot.setAttribute('stroke','white');dot.setAttribute('stroke-width','2');svg.appendChild(dot);
 }
 inventories.push({view:id,glError:gl.getError(),nodes:nodes.filter(n=>n.node.mesh).map(n=>({name:n.node.name,path:n.path,kind:n.node.mesh.documentationKind||'custom mesh',args:n.node.mesh.documentationArgs||[],visible:n.visible}))});
}
try {
if(document.body.dataset.sheet==='detail'){
 renderPanel('front',0.03,[
 {side:'left',y:200,name:'BlinkEyelid',title:'Kelopak mata kiri',kind:'Ellipsoid patch',type:'ellipsoid',source:'Disembunyikan saat mata terbuka',hidden:true},
 {side:'right',y:200,name:'JrEye',index:1,title:'Mata hitam',kind:'Ellipsoid',type:'ellipsoid'},
 {side:'left',y:970,name:'FangToothCone',title:'Taring di sudut mulut',kind:'Cone frustum',type:'frustum'},
 {side:'right',y:970,name:'SmirkGrinBezier',title:'Senyum',kind:'3D cubic Bézier tube',type:'curve'}
 ],{distance:2.95,target:[0,1.93,0]});
 renderPanel('back',0.03,[
 {side:'left',y:200,name:'BlinkEyelid',title:'Kelopak menutup',kind:'Scaling Y = 1',type:'ellipsoid',source:'t = 0,16 detik · visible = true'},
 {side:'right',y:200,name:'BlinkEyelid',index:1,title:'Kelopak mata kanan',kind:'Ellipsoid patch',type:'ellipsoid'},
 {side:'left',y:970,name:'FieryEyebrowBezier',title:'Alis',kind:'3D cubic Bézier tube',type:'curve'},
 {side:'right',y:970,name:'HornCone',index:1,title:'Tanduk',kind:'Cone frustum',type:'frustum'}
 ],{distance:2.95,target:[0,1.93,0],blink:true});
}else{
renderPanel('front',0.10,[
 {side:'left',y:144,name:'RedHairBezierStrand',title:'Rambut / kuncir merah',kind:'3D cubic Bézier tube × 3',type:'curve'},
 {side:'left',y:261,name:'GreenHead',title:'Kepala hijau',kind:'Ellipsoid',type:'ellipsoid',at:[0,0.36,0.288]},
 {side:'left',y:378,name:'JrEye',title:'Mata + kilau putih',kind:'Ellipsoid',type:'ellipsoid',source:'JrEye / JrEyeShine'},
 {side:'left',y:495,name:'WideCreamCheeks',title:'Pipi + moncong krem',kind:'Ellipsoid',type:'ellipsoid',at:[-0.42,0,0.24],source:'WideCreamCheeks / CenterCreamSnout'},
 {side:'left',y:612,name:'WhiteBandanaPatch',title:'Bandana / bib putih',kind:'Ellipsoid patch',type:'ellipsoid'},
 {side:'left',y:729,name:'UpperArmFrustum',title:'Lengan yang meruncing',kind:'Cone frustum (kerucut terpotong)',type:'frustum'},
 {side:'left',y:846,name:'FistEllipsoid',title:'Kepalan tangan',kind:'Ellipsoid',type:'ellipsoid'},
 {side:'left',y:963,name:'FootEllipsoid',title:'Telapak + bantalan sol',kind:'Ellipsoid',type:'ellipsoid',source:'FootEllipsoid / FootSolePad'},
 {side:'right',y:144,name:'FieryEyebrowBezier',index:1,title:'Alis merah',kind:'3D cubic Bézier tube × 2',type:'curve'},
 {side:'right',y:261,name:'HornCone',index:1,title:'Tanduk kepala',kind:'Cone frustum',type:'frustum',at:[0,0.09,0]},
 {side:'right',y:378,name:'Nostril',index:1,title:'Lubang hidung',kind:'Ellipsoid',type:'ellipsoid'},
 {side:'right',y:495,name:'SmirkGrinBezier',title:'Garis senyum',kind:'3D cubic Bézier tube',type:'curve'},
 {side:'right',y:612,name:'PlastronBelly',title:'Perut / plastron',kind:'Ellipsoid',type:'ellipsoid',at:[0.22,-0.30,0.14]},
 {side:'right',y:729,name:'BellyRibBezier',index:2,title:'Garis segmen perut',kind:'3D cubic Bézier tube × 3',type:'curve',source:'Mesh detail tertutup sebagian bib/perut',hidden:true},
 {side:'right',y:846,name:'SpikedWristbandTorus',index:1,title:'Gelang + duri kecil',kind:'Torus + cone frustum',type:'torus',source:'SpikedWristbandTorus / WristSpikeCone'},
 {side:'right',y:963,name:'ToeClawCone',index:5,title:'Kuku kaki',kind:'Cone frustum × 6',type:'frustum'},
 {side:'left',y:1080,name:'FangToothCone',title:'Taring kecil',kind:'Cone frustum',type:'frustum'}
]);
renderPanel('back',2.68,[
 {side:'left',y:160,name:'BlackHairTie',title:'Ikat rambut hitam',kind:'Cylinder',type:'cylinder'},
 {side:'left',y:321,name:'BowserJrBody',title:'Badan kuning',kind:'Ellipsoid',type:'ellipsoid',at:[0.46,-0.26,0.03]},
 {side:'left',y:482,name:'GreenShellDome',title:'Tempurung cangkang',kind:'Dome / potongan ellipsoid',type:'ellipsoid'},
 {side:'left',y:643,name:'ShellWhiteTorusRim',title:'Pinggiran putih cangkang',kind:'Torus',type:'torus',at:[0.48,0.18,0]},
 {side:'left',y:804,name:'LegCylinder',index:1,title:'Batang kaki / paha',kind:'Cylinder',type:'cylinder'},
 {side:'left',y:965,name:'FootSolePad',index:1,title:'Bantalan telapak kaki',kind:'Ellipsoid',type:'ellipsoid'},
 {side:'right',y:160,name:'HornBaseTorus',index:1,title:'Cincin pangkal tanduk',kind:'Torus',type:'torus',hidden:true},
 {side:'right',y:321,name:'ShellSpikeCone',index:3,title:'Duri cangkang',kind:'Cone frustum × 4',type:'frustum'},
 {side:'right',y:482,name:'SpikeBaseRing',index:1,title:'Cincin pangkal duri',kind:'Torus × 4',type:'torus',at:[0.07,0,0.07],source:'Sebagian tertutup permukaan cangkang',hidden:true},
 {side:'right',y:643,name:'KoopaTailCone',title:'Ekor (di balik cangkang)',kind:'Cone frustum',type:'frustum',hidden:true}
]);
}
window.bowserAudit=inventories;
document.getElementById('status').textContent='Render selesai · WebGL error: '+inventories.map(v=>v.glError).join(', ')+' · Sumber: characters/bowserjr.js, js/primitives.js, js/sceneNode.js';
} catch(error){document.getElementById('status').textContent='ERROR: '+error.stack;}
