const world=document.getElementById('world'),music=document.getElementById('music'),seek=document.getElementById('seek');
const scenes=[[0,"THE GREEN GARDENS","MUSHROOM KINGDOM"],[5,"","TOAD"],[13,"","BOWSER JR."],[21,"","YOSHI"],[29,"",""],[34,"KEJAR-KEJARAN DIMULAI","Toad, lari!"],[40,"",""],[43.5,"TABRAKAN!","Kena!"],[45.5,"",""],[47,"KEADAAN BERBALIK","Kini pengejar yang dikejar."],[53,"",""],[76,"SATU TAMAN. BANYAK AKSI.","Petualangan terus berputar."],[82,"TOAD - BOWSER JR. - YOSHI","MUSHROOM KINGDOM"]];
let t=0,playing=false,last=0,ready=false;
music.volume=.65;
function draw(){if(!ready)return;world.contentWindow.drawFilmFrame(t);let i=Math.max(0,scenes.findLastIndex(s=>t>=s[0]));const s=scenes[i],end=scenes[i+1]?.[0]??90;document.getElementById('eyebrow').textContent=s[1];document.getElementById('title').textContent=s[2];document.getElementById('caption').style.opacity=Math.max(0,Math.min(1,(t-s[0])/.65,(end-t)/.5));document.getElementById('fade').style.opacity=Math.max(0,(t-88.5)/1.5);seek.value=t;document.getElementById('time').textContent=Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')+' / 1:30';}
function toggle(){if(!ready)return;if(t>=90)t=0;playing=!playing;last=performance.now();document.getElementById('play').textContent=playing?'Jeda':'Putar';if(playing){music.currentTime=t;music.play().catch(()=>{});}else music.pause();}
world.addEventListener('load',()=>{ready=true;draw();toggle();});
document.getElementById('play').onclick=toggle;
seek.oninput=()=>{t=Number(seek.value);music.currentTime=t;last=performance.now();draw();};

window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='z'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();if(!e.repeat)location.assign('index.html');return;}if(e.code==='Space'&&e.target.tagName!=='INPUT'){e.preventDefault();toggle();}});
function tick(now){if(playing){t=Math.max(0,Math.min(90,t+Math.max(0,now-last)/1000));draw();if(t>=90){playing=false;music.pause();document.getElementById('play').textContent='Ulangi';}}last=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);
