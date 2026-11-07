// A deterministic 36-second film using the project's original models and renderer.
(() => {
    'use strict';
    const duration = 36, W = 1280, H = 720;
    const film = document.getElementById('film'), ctx = film.getContext('2d');
    const status = document.getElementById('status'), seek = document.getElementById('seek');
    const play = document.getElementById('play'), record = document.getElementById('record');
    let time = 0, running = false, started = 0, recording = false, recorder, sound, offlineExport = false;
    const ease = v => {v = Math.max(0, Math.min(1, v)); return v*v*(3-2*v);};
    const mix = (a,b,t) => a+(b-a)*t;
    const node = (root, name) => {
        if(root.name === name) return root;
        for(const child of root.children) {const found = node(child,name); if(found) return found;}
    };
    function pose(character, t, mode, x, z, yaw, jump = false) {
        character.visible = true;
        character.animate(t, mode);
        character.setTransform([x,0,z],[0,yaw,0]);
        if(character.restFootY === undefined) {
            character.animate(0,'idle');character.restFootY=characterFootY(character);character.animate(t,mode);
        }
        const foot = characterFootY(character);
        character.position[1] = environmentNode.groundY - (jump ? Math.min(foot,character.restFootY) : foot);
    }
    function camera(target, distance, yaw, pitch) {
        camTarget=target;camDist=distance;camYaw=yaw;camPitch=pitch;
    }
    function stage(t) {
        const y = yoshiNode, b = bowserJrNode, toad = toadNode;
        const ground = environmentNode.groundY;
        lightingMode = t > 29 ? 'golden' : 'day';
        pose(y,t,'idle',-4.2,5.2,0.45);
        pose(toad,t,'idle',1.4,6.4,-0.2);
        pose(b,t,'idle',-2,6.2,0.8);
        let title='', subtitle='', tag='';
        if(t < 4) {
            y.visible=b.visible=false;
            camera([0,0.2,-1],mix(26,19,ease(t/4)),0.32-t*.03,0.34);
            title='MUSHROOM KINGDOM';subtitle='Satu hari yang tenang…';tag='THE GREEN GARDENS';
        } else if(t < 12) {
            const q=t-4, a=q*.65;
            const r=2.25, center=6.3;
            pose(toad,t*1.55,'walk',Math.cos(a)*r,center+Math.sin(a)*r,-a);
            pose(b,t*1.45,'walk',Math.cos(a-1.12)*r,center+Math.sin(a-1.12)*r,-a+1.12);
            y.visible=false;
            camera([0,-0.8,6.3],10.8,0.18+Math.sin(q*.2)*.16,0.19);
            subtitle=q<3.5?'…berubah menjadi pengejaran.':'TOAD, LARI!';tag='TAK ADA WAKTU UNTUK DIAM';
        } else if(t < 16) {
            const q=t-12;
            pose(b,0.45+q*.28,'action',-1.65,6,Math.PI/2);
            pose(toad,q*.8,'action',1.6,6.1,-Math.PI/2,true);
            y.visible=false;
            // A single fireball crosses the gap while Toad dodges it.
            const fire=node(b,'FireballProjectile');
            fire.scale=[.9,.9,.9];fire.animPos=[0,0,(q%1.4)*2];
            camera([0,-.7,6],8.5,0.12,0.13);
            subtitle='Satu lompatan. Satu kesempatan.';tag='BAHAYA MAKIN DEKAT';
        } else if(t < 20) {
            const q=t-16;
            pose(y,t,'walk',mix(-4,-1.6,ease(q/3)),7.2,Math.PI/2);
            pose(b,t,'idle',1.5,7.2,-Math.PI/2);
            pose(toad,t,'idle',3.3,6.1,-Math.PI/2);
            camera([-1.4,-.65,7.2],mix(7,8.5,ease(q/4)),0.32,0.16);
            subtitle='Untungnya, Toad tidak sendirian.';tag='YOSHI DATANG';
        } else if(t < 25) {
            const q=t-20;
            pose(y,0.52+q*.18,'action',-1.15,7.2,Math.PI/2);
            pose(b,t,'idle',1.05,7.2,-Math.PI/2);
            pose(toad,t,'idle',3.1,6.1,-Math.PI/2);
            // Build one readable attack rather than repeating the tongue cycle.
            const strike=ease(q/.55)*(1-ease((q-1.35)/.6));
            const tongue=node(y,'TonguePivot');tongue.scale=[1,1,.15+strike*1.48];
            const head=node(y,'YoshiHead');head.animRot=[0,0,0];
            if(q>0.65) {
                const recoil=ease((q-.65)/.7);
                b.position[0]+=recoil*.9;
                b.animAxis=[1,0,1];b.animAxisAngle=-Math.sin(Math.min(1,(q-.65)/1.2)*Math.PI/2)*.6;
                b.position[1]=ground-characterFootY(b);
            }
            camera([.2,-.7,7.1],8.8,0.15,0.18);
            subtitle=q<2?'Saatnya membalas!':'Jangan ganggu sahabatku.';tag='SATU SERANGAN BALIK';
        } else if(t < 29) {
            const q=t-25;
            pose(y,t,'idle',-1.1,7.2,0.25);
            pose(toad,q*.7,'action',1.2,7.2,-.2,true);
            pose(b,t*1.5,'walk',mix(2.8,9,ease(q/4)),6.7,Math.PI/2);
            b.animAxis=[1,0,1];b.animAxisAngle=Math.sin(q*9)*.16;
            b.position[1]=ground-characterFootY(b);
            camera([.3,-.75,7.1],9.3,-.12,0.16);
            subtitle='Sekarang, siapa yang harus lari?';tag='PERSAHABATAN MENANG';
        } else if(t < 33) {
            const q=t-29;
            pose(y,t,'idle',-1.15,7.1,0.15);
            pose(toad,q*.7,'action',1.15,7.1,-.15,true);
            b.visible=false;
            camera([0,-.6,7],mix(8.5,7.2,ease(q/4)),.12-q*.04,.15);
            subtitle='Petualangan lebih seru bersama.';tag='JELAJAHI DUNIA MEREKA';
        } else {
            const q=t-33;
            pose(y,t,'idle',-2.8,0.15,0.15);y.position[1]=-characterFootY(y);
            pose(toad,t,'idle',0,0,0);toad.position[1]=-characterFootY(toad);
            pose(b,t,'idle',2.8,0.15,-.2);b.position[1]=-characterFootY(b);
            camera([0,1,-1],18.5-q*.25,.12,.25);
            title='MUSHROOM KINGDOM';subtitle='Tiga karakter. Satu dunia. Ayo bermain.';tag='PETUALANGAN MENANTIMU';
        }
        renderWorld([environmentNode,y,toad,b],t>=33?0:ground);
        ctx.drawImage(gl.canvas,0,0,W,H);
        // Movie graphics are painted into the export canvas, never captured from browser UI.
        const vignette=ctx.createRadialGradient(W/2,H*.45,H*.22,W/2,H*.45,W*.64);
        vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#001b2670');
        ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#091814';ctx.fillRect(0,0,W,48);ctx.fillRect(0,H-48,W,48);
        ctx.textAlign='left';ctx.fillStyle='#e9cf83';ctx.font='bold 13px Trebuchet MS';
        ctx.fillText('WORLD 1–1  /  THE GREEN GARDENS',40,30);
        ctx.textAlign='right';ctx.fillStyle='#cbdace';ctx.fillText('MUSHROOM KINGDOM',W-40,30);
        if(title) {
            const gradient=ctx.createLinearGradient(0,65,0,260);gradient.addColorStop(0,'#061f2755');gradient.addColorStop(1,'#061f2700');
            ctx.fillStyle=gradient;ctx.fillRect(0,48,W,235);
            ctx.textAlign='center';ctx.fillStyle='#fff4c9';ctx.shadowColor='#12382b';ctx.shadowBlur=14;
            ctx.font='900 64px Trebuchet MS';ctx.fillText(title,W/2,t<4?170:165);
            ctx.shadowBlur=0;
        }
        ctx.textAlign='center';ctx.font='bold 12px Trebuchet MS';ctx.fillStyle='#ffe28c';
        ctx.fillText(tag,W/2,H-113);
        ctx.font='bold 26px Trebuchet MS';ctx.shadowColor='#00170c';ctx.shadowBlur=12;ctx.fillStyle='#fffbe9';
        ctx.fillText(subtitle,W/2,H-75);ctx.shadowBlur=0;
        const shotStart=[0,4,12,16,20,25,29,33].filter(v=>v<=t).pop();
        const fade=Math.max(1-ease((t-shotStart)/.3),t>35?ease((t-35)/1):0);
        if(fade>0){ctx.fillStyle=`rgba(5,15,12,${fade})`;ctx.fillRect(0,0,W,H);}
    }
    // Original synthesized score: no external music or assets.
    function soundtrack(offline = false) {
        const ac=offline?new OfflineAudioContext(2,48000*duration,48000):new AudioContext();
        const destination=offline?null:ac.createMediaStreamDestination();
        const master=ac.createGain();master.gain.value=.17;if(destination)master.connect(destination);master.connect(ac.destination);
        const start=offline?0:ac.currentTime+.08, beat=.375;
        master.gain.setValueAtTime(.17,start+34.5);master.gain.linearRampToValueAtTime(0,start+duration);
        const melody=[72,76,79,76,74,77,81,77,72,76,79,84,83,79,77,74];
        function note(midi,at,len,gain,type='triangle') {
            const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=440*2**((midi-69)/12);
            o.connect(g);g.connect(master);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+.015);g.gain.exponentialRampToValueAtTime(.001,at+len);o.start(at);o.stop(at+len+.02);
        }
        for(let i=0;i<Math.floor(duration/beat);i++) {
            const at=start+i*beat,seconds=i*beat;
            note(melody[i%16]-(seconds>=4&&seconds<16?12:0),at,beat*.65,.24,'triangle');
            if(i%2===0)note([48,45,53,55][Math.floor(i/8)%4],at,beat*1.7,.40,'sine');
            if(i%4===0)note(36,at,.12,.65,'sine');
        }
        for(const seconds of [12,16,20.7,25,33]){note(60,start+seconds,.5,.55,'sawtooth');note(67,start+seconds,.7,.3);}
        return {ac,destination};
    }
    function startPlayback(withSound=true) {
        if(sound)sound.ac.close();sound=withSound?soundtrack():null;
        time=0;started=performance.now();running=true;play.textContent='Putar ulang';
    }
    async function exportVideo() {
        if(recording)return;
        if(window.TrailerMux && window.VideoEncoder && window.AudioEncoder) return exportOffline();
        if(!film.captureStream||!window.MediaRecorder){status.textContent='Browser ini belum mendukung ekspor video.';return;}
        const mime=['video/mp4;codecs=avc1.42001E,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus'].find(m=>MediaRecorder.isTypeSupported(m));
        if(!mime){status.textContent='Codec video tidak tersedia.';return;}
        recording=true;record.disabled=play.disabled=seek.disabled=true;
        startPlayback();
        const stream=film.captureStream(30);sound.destination.stream.getAudioTracks().forEach(track=>stream.addTrack(track));
        const chunks=[];recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6500000});
        recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
        recorder.onstop=async()=>{
            const ext=mime.startsWith('video/mp4')?'mp4':'webm';
            const blob=new Blob(chunks,{type:mime.split(';')[0]});
            const link=document.getElementById('download');link.href=URL.createObjectURL(blob);link.download='Mushroom-Kingdom-Trailer.'+ext;link.hidden=false;
            let saved=false;
            try{const response=await fetch('/__trailer_export?ext='+ext,{method:'POST',headers:{'Content-Type':blob.type},body:blob});saved=response.ok;}catch{}
            status.textContent=saved?'Video tersimpan di folder output proyek.':'Video selesai. Klik Unduh video.';
            recording=false;record.disabled=play.disabled=seek.disabled=false;
            stream.getTracks().forEach(track=>track.stop());if(sound){sound.ac.close();sound=null;}
        };
        recorder.start(1000);status.textContent='Merekam trailer…';
    }
    async function exportOffline() {
        recording=offlineExport=true;running=false;
        record.disabled=play.disabled=seek.disabled=true;
        if(sound){await sound.ac.close();sound=null;}
        const fps=24, frames=duration*fps, chunks=[];
        let encoderError;
        const copy=(chunk,type)=>{const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);chunks.push({track:type,timestamp:chunk.timestamp,data,key:chunk.type==='key'});};
        const video=new VideoEncoder({output:chunk=>copy(chunk,1),error:error=>{encoderError=error;}});
        const audio=new AudioEncoder({output:chunk=>copy(chunk,2),error:error=>{encoderError=error;}});
        // Deterministic frame rendering avoids background-tab / real-time recording drops.
        // Contact shadows remain; skip the expensive full-world directional pass for export.
        const oldRender=sunShadow.render, oldEnabled=sunShadow.enabled;
        sunShadow.render=()=>{};sunShadow.enabled=false;
        try {
            video.configure({codec:'vp09.00.10.08',width:W,height:H,bitrate:4000000,framerate:fps,latencyMode:'quality'});
            audio.configure({codec:'opus',sampleRate:48000,numberOfChannels:2,bitrate:128000});
            gl.canvas.width=W;gl.canvas.height=H;
            for(let i=0;i<frames;i++) {
                if(encoderError)throw encoderError;
                time=i/fps;stage(time);seek.value=time;
                const frame=new VideoFrame(film,{timestamp:Math.round(i*1000000/fps),duration:Math.round(1000000/fps)});
                video.encode(frame,{keyFrame:i%fps===0});frame.close();
                status.textContent=`Merender frame ${i+1} / ${frames} · ${(100*(i+1)/frames).toFixed(0)}%`;
                // Let the page paint progress and allow the encoder to consume its queue.
                if(i%3===0 || video.encodeQueueSize>6)await new Promise(resolve=>setTimeout(resolve,0));
            }
            await video.flush();video.close();
            status.textContent='Menyusun musik dan video…';
            const score=soundtrack(true),buffer=await score.ac.startRendering();
            for(let start=0;start<buffer.length;start+=960) {
                const count=Math.min(960,buffer.length-start),data=new Float32Array(count*2);
                data.set(buffer.getChannelData(0).subarray(start,start+count),0);
                data.set(buffer.getChannelData(1).subarray(start,start+count),count);
                const frame=new AudioData({format:'f32-planar',sampleRate:48000,numberOfChannels:2,numberOfFrames:count,timestamp:Math.round(start/48000*1e6),data});
                audio.encode(frame);frame.close();
                if(audio.encodeQueueSize>12)await new Promise(resolve=>setTimeout(resolve,0));
            }
            await audio.flush();audio.close();if(encoderError)throw encoderError;
            const blob=window.TrailerMux(chunks,W,H,duration,fps);
            const link=document.getElementById('download');link.href=URL.createObjectURL(blob);link.download='Mushroom-Kingdom-Trailer.webm';link.hidden=false;
            const response=await fetch('/__trailer_export?ext=webm',{method:'POST',headers:{'Content-Type':'video/webm'},body:blob});
            status.textContent=response.ok?'Video 24 fps tersimpan di output/Mushroom-Kingdom-Trailer.webm.':'Video selesai. Klik Unduh video.';
        } catch(error) {
            console.error(error);status.textContent='Ekspor gagal: '+error.message;
        } finally {
            if(video.state!=='closed')video.close();if(audio.state!=='closed')audio.close();
            sunShadow.render=oldRender;sunShadow.enabled=oldEnabled;
            recording=offlineExport=false;record.disabled=play.disabled=seek.disabled=false;
        }
    }
    window.Trailer={active:true,frame(now){
        if(offlineExport)return;
        gl.canvas.width=W;gl.canvas.height=H;
        if(running)time=Math.min(duration,(now-started)/1000);
        stage(time);seek.value=time;
        if(recording)status.textContent=`Merekam ${time.toFixed(1)} / ${duration} detik…`;
        else if(running)status.textContent=`Trailer ${time.toFixed(1)} / ${duration} detik`;
        else if(!status.dataset.ready){status.textContent='Siap. Putar trailer atau ekspor video.';status.dataset.ready='yes';}
        if(running&&time>=duration){running=false;if(recording)recorder.stop();else status.textContent='Trailer selesai.';}
    }};
    play.onclick=()=>startPlayback();record.onclick=exportVideo;
    seek.oninput=()=>{running=false;time=Number(seek.value);if(sound){sound.ac.close();sound=null;}};
})();
