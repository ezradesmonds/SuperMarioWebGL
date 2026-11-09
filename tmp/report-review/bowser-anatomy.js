const back=new URLSearchParams(location.search).get('view')==='back';
document.querySelector('.viewname').textContent=back?'02 / PUNGGUNG, LENGAN & KAKI':'01 / WAJAH, RAMBUT & BADAN';
const canvas=document.querySelector('canvas');
const gl=canvas.getContext('webgl',{antialias:true,preserveDrawingBuffer:true});
if(!gl)throw Error('WebGL unavailable');
function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
const vertex='attribute vec3 aPosition,aNormal;uniform mat4 uModelMatrix,uViewMatrix,uProjectionMatrix;uniform mat3 uNormalMatrix;varying vec3 N,P;void main(){vec4 p=uModelMatrix*vec4(aPosition,1.);P=p.xyz;N=normalize(uNormalMatrix*aNormal);gl_Position=uProjectionMatrix*uViewMatrix*p;}';
const fragment='precision mediump float;varying vec3 N,P;uniform vec3 uColor,eye;uniform float uShininess;void main(){vec3 n=normalize(N);vec3 l=normalize(vec3(-3.,6.,7.));vec3 v=normalize(eye-P);float diffuse=max(dot(n,l),0.);float fill=max(dot(n,normalize(vec3(5.,3.,-5.))),0.);float spec=pow(max(dot(n,normalize(l+v)),0.),max(12.,uShininess))*.15;gl_FragColor=vec4(uColor*(vec3(.43,.46,.49)+vec3(.65,.62,.55)*diffuse+vec3(.14,.18,.22)*fill)+vec3(spec),1.);}';
const prog=gl.createProgram();gl.attachShader(prog,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
const shader={};for(const k of ['uModelMatrix','uViewMatrix','uProjectionMatrix','uNormalMatrix','uColor','uShininess','uChecker','uMaterialKind'])shader[k]=gl.getUniformLocation(prog,k);for(const k of ['aPosition','aNormal']){shader[k]=gl.getAttribLocation(prog,k);gl.enableVertexAttribArray(shader[k]);}
const root=createBowserJr(gl);root.animate(1,'idle');root.resetAnim();for(const l of root.eyelids)l.visible=false;
const yaw=back?Math.PI-.35:.12,dist=6.25,target=1.35;
const eye=[Math.sin(yaw)*dist,target+.26,Math.cos(yaw)*dist];
const projection=Mat4.perspective(.62,canvas.width/canvas.height,.1,30),view=Mat4.lookAt(eye,[0,target,0],[0,1,0]);
gl.viewport(0,0,canvas.width,canvas.height);gl.enable(gl.DEPTH_TEST);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform3fv(gl.getUniformLocation(prog,'eye'),eye);gl.uniformMatrix4fv(shader.uProjectionMatrix,false,projection);gl.uniformMatrix4fv(shader.uViewMatrix,false,view);root.draw(gl,shader,Mat4.identity());gl.finish();
const matrices=new Map();
function collect(n,parent){let m=Mat4.translate(parent,...n.position);m=Mat4.rotateX(m,n.rotation[0]);m=Mat4.rotateY(m,n.rotation[1]);m=Mat4.rotateZ(m,n.rotation[2]);m=Mat4.scale(m,...n.scale);if(!matrices.has(n.name)||back&&['UpperArmFrustum','SpikedWristbandTorus'].includes(n.name))matrices.set(n.name,m);for(const c of n.children)collect(c,m);}
collect(root,Mat4.identity());
function transform(m,p){return [0,1,2,3].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]);}
function anchor(name,p=[0,0,0]){const m=matrices.get(name);if(!m)throw Error('Anchor missing '+name);const world=transform(m,p);const pv=Mat4.multiply(projection,view);const clip=transform(pv,world);return [470+(clip[0]/clip[3]+1)*430,245+(1-clip[1]/clip[3])*730];}
const frontCards=[
 {num:'01',title:'Mata & kelopak',x:35,y:300,anchor:['JrEye',[-.02,.03,.05]],rows:[['Mata hitam + kilau putih','ellipsoid','Ellipsoid'],['Dasar kelopak hijau','ellipsoid','Ellipsoid'],['Kelopak kedip','patch','Ellipsoid patch']],note:'Patch kedip tampak saat mata menutup.'},
 {num:'02',title:'Kepala & wajah',x:35,y:780,anchor:['CenterCreamSnout',[-.19,.07,.30]],rows:[['Kepala hijau','ellipsoid','Ellipsoid'],['Pipi + moncong krem','ellipsoid','Ellipsoid'],['2 lubang hidung','ellipsoid','Ellipsoid']]},
 {num:'03',title:'Ekspresi',x:35,y:1260,anchor:['CenterCreamSnout',[-.18,-.18,.27]],rows:[['2 alis + garis senyum','bezier','Tabung Bézier 3D'],['1 taring putih','cone','Cone frustum']]},
 {num:'04',title:'Rambut & tanduk',x:1360,y:300,anchor:['PonytailGroup',[.04,.26,-.03]],rows:[['3 helai jambul','bezier','Tabung Bézier 3D'],['Ikat rambut','cylinder','Cylinder'],['2 tanduk kepala','cone','Cone frustum'],['Cincin pangkal tanduk','torus','Torus']]},
 {num:'05',title:'Bandana putih',x:1360,y:870,anchor:['WhiteBandanaPatch',[.12,.28,.26]],rows:[['Kain / napkin putih','patch','Ellipsoid patch'],['Kerah putih','torus','Torus'],['Simpul','ellipsoid','Ellipsoid']]},
 {num:'06',title:'Badan & perut',x:1360,y:1330,anchor:['PlastronBelly',[.24,-.23,.22]],rows:[['Badan + plastron perut','ellipsoid','Ellipsoid'],['3 garis perut','bezier','Tabung Bézier 3D']]}
];
const backCards=[
 {num:'07',title:'Cangkang',x:1360,y:390,anchor:['GreenShellDome',[-.28,.37,.10]],rows:[['Kubah hijau','patch','Dome / bagian ellipsoid'],['Rim putih','torus','Torus']]},
 {num:'08',title:'Duri punggung',x:1360,y:840,anchor:['GreenShellDome',[-.35,.32,.20]],rows:[['7 duri krem','cone','Cone frustum'],['7 cincin pangkal cokelat','torus','Torus']],note:'Susunan: 1 atas, 2 sisi atas, 1 tengah, 2 sisi bawah, 1 bawah.'},
 {num:'09',title:'Ekor',x:35,y:1350,anchor:['KoopaTailCone',[0,.18,0]],rows:[['Ekor kuning','cone','Cone frustum']]},
 {num:'10',title:'Lengan & tangan',x:35,y:390,anchor:['UpperArmFrustum',[0,-.08,.07]],rows:[['Lengan atas','cone','Cone frustum'],['Kepalan tangan','ellipsoid','Ellipsoid']]},
 {num:'11',title:'Gelang berduri',x:35,y:870,anchor:['SpikedWristbandTorus',[0,.03,.10]],rows:[['2 gelang gelap','torus','Torus'],['8 duri gelang','cone','Cone frustum']],note:'Empat duri pada setiap gelang.'},
 {num:'12',title:'Kaki & kuku',x:1360,y:1260,anchor:['FootEllipsoid',[-.04,0,-.22]],rows:[['Sendi paha + telapak','ellipsoid','Ellipsoid'],['Batang kaki','cylinder','Cylinder'],['Bantalan bawah telapak','patch','Ellipsoid patch'],['6 kuku kaki','cone','Cone frustum']]}
];
const cards=back?backCards:frontCards,svg=document.querySelector('#lines');
for(const item of cards){const card=document.createElement('section');card.className='card';card.style.left=item.x+'px';card.style.top=item.y+'px';card.innerHTML=`<h2><span class="num">${item.num}</span>${item.title}</h2>`+item.rows.map(([part,type,label])=>`<div class="mapping"><div class="part">${part}</div><span class="type ${type}">${label}</span></div>`).join('')+(item.note?`<p class="micro">${item.note}</p>`:'');document.querySelector('#cards').append(card);const [ax,ay]=anchor(...item.anchor);const right=item.x>900,sx=right?item.x:item.x+405,sy=item.y+45,elbow=right?1343:457;const color=back?'#61806b':'#6a8978';svg.insertAdjacentHTML('beforeend',`<path d="M ${sx} ${sy} H ${elbow} V ${ay} H ${ax}" fill="none" stroke="${color}" stroke-width="2.7"/><circle cx="${ax}" cy="${ay}" r="7" fill="#fff" stroke="${color}" stroke-width="3"/>`);}
document.querySelector('#status').textContent=`Render model asli • WebGL error: ${gl.getError()} • ${back?'2':'1'}/2`;
