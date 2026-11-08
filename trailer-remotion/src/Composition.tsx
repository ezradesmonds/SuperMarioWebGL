import {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, IFrame, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';

type FilmWindow = Window & {drawFilmFrame?: (seconds: number) => void};
const World = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ref = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Loading original WebGL world'));
  useLayoutEffect(() => {
    if (!ready) return;
    const world = ref.current?.contentWindow as FilmWindow | null;
    if (!world?.drawFilmFrame) throw new Error('WebGL film bridge is missing');
    world.drawFilmFrame(frame / fps);
    continueRender(handle);
  }, [frame, fps, ready, handle]);
  return <IFrame ref={ref} title="Original WebGL world" src={staticFile('world/film.html')} onLoad={() => setReady(true)} style={{width:1280,height:720,border:0,pointerEvents:'none'}}/>;
};
const StoryText = ({eyebrow, text, title = false}: {eyebrow:string; text:string; title?:boolean}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return <AbsoluteFill style={{justifyContent:title?'flex-start':'flex-end', padding:title?'76px 76px':'0 76px 82px', color:'#fff7dc', fontFamily:'Georgia, serif', opacity:interpolate(frame,[0,.65*fps,durationInFrames-.5*fps,durationInFrames],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
    <div style={{fontFamily:'Arial, sans-serif',fontSize:23,fontWeight:700,letterSpacing:5,color:'#ffe18b',marginBottom:12,textShadow:'0 2px 12px #000'}}>{eyebrow}</div>
    <div style={{fontSize:title?65:48,fontWeight:700,lineHeight:1.1,maxWidth:1000,textShadow:'0 3px 18px #102e24'}}>{text}</div>
  </AbsoluteFill>;
};
const Finish = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background:'#071b19',opacity:interpolate(frame,[88.5*fps,90*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}/>;
};
export const MushroomTrailer = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background:'#317ed0'}}>
    <World/>
    <AbsoluteFill style={{pointerEvents:'none',background:'linear-gradient(180deg,rgba(5,24,30,.35),transparent 30%,transparent 65%,rgba(5,24,30,.60))'}}/>
    <Sequence name="Dunia pembuka" from={0*fps} durationInFrames={5*fps}><StoryText eyebrow="THE GREEN GARDENS" text="MUSHROOM KINGDOM" title/></Sequence>
    <Sequence name="Perkenalan Toad" from={5*fps} durationInFrames={6*fps}><StoryText eyebrow="" text="TOAD" title/></Sequence>
    <Sequence name="Perkenalan Bowser Jr." from={11*fps} durationInFrames={6*fps}><StoryText eyebrow="" text="BOWSER JR." title/></Sequence>
    <Sequence name="Perkenalan Yoshi" from={17*fps} durationInFrames={6*fps}><StoryText eyebrow="" text="YOSHI" title/></Sequence>
    <Sequence name="Toad dikejar Bowser Jr." from={23*fps} durationInFrames={12*fps}><StoryText eyebrow="KEJAR-KEJARAN DIMULAI" text="Toad, lari!" title/></Sequence>
    <Sequence name="Aksi langkah dan tendangan Toad" from={35*fps} durationInFrames={5*fps}><StoryText eyebrow="JANGAN SAMPAI TERTANGKAP" text="Terus bergerak!" title/></Sequence>
    <Sequence name="Aksi Bowser Jr. mengejar" from={40*fps} durationInFrames={5*fps}><StoryText eyebrow="BOWSER JR. MENDEKAT" text="Tak mau menyerah." title/></Sequence>
    <Sequence name="Yoshi datang menolong" from={45*fps} durationInFrames={9*fps}><StoryText eyebrow="BANTUAN DATANG" text="Yoshi ikut beraksi!" title/></Sequence>
    <Sequence name="Yoshi mengejar Bowser Jr." from={54*fps} durationInFrames={10*fps}><StoryText eyebrow="KEADAAN BERBALIK" text="Kini pengejar yang dikejar." title/></Sequence>
    <Sequence name="Yoshi berubah menjadi telur" from={64*fps} durationInFrames={3.5*fps}><StoryText eyebrow="BERSIAP..." text="Menggelinding!" title/></Sequence>
    <Sequence name="Telur menabrak Bowser Jr." from={67.5*fps} durationInFrames={2.5*fps}><StoryText eyebrow="TABRAKAN!" text="Kena!" title/></Sequence>
    <Sequence name="Yoshi kembali berjalan" from={70*fps} durationInFrames={6*fps}><StoryText eyebrow="BELUM SELESAI" text="Terus mengejar!" title/></Sequence>
    <Sequence name="Pengejaran berlanjut" from={76*fps} durationInFrames={6*fps}><StoryText eyebrow="SATU TAMAN. BANYAK AKSI." text="Petualangan terus berputar." title/></Sequence>
    <Sequence name="Judul penutup" from={82*fps} durationInFrames={8*fps}><StoryText eyebrow="TOAD - BOWSER JR. - YOSHI" text="MUSHROOM KINGDOM" title/></Sequence>
    <Audio src={staticFile('adventure.wav')} volume={.65}/>
    <Finish/>
  </AbsoluteFill>;
};

