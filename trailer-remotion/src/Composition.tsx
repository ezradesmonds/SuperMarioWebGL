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
    <div style={{fontFamily:'Arial, sans-serif',fontSize:17,fontWeight:700,letterSpacing:5,color:'#ffe18b',marginBottom:12,textShadow:'0 2px 12px #000'}}>{eyebrow}</div>
    <div style={{fontSize:title?65:39,fontWeight:700,lineHeight:1.1,maxWidth:1000,textShadow:'0 3px 18px #102e24'}}>{text}</div>
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
    <Sequence name="Pembukaan dunia" durationInFrames={7*fps}><StoryText eyebrow="THE GREEN GARDENS" text="MUSHROOM KINGDOM" title/></Sequence>
    <Sequence name="Tiga sahabat di taman" from={7*fps} durationInFrames={7*fps}><StoryText eyebrow="SEMUANYA BERAWAL DI SINI" text="Satu hari yang tenang…"/></Sequence>
    <Sequence name="Pengejaran dimulai" from={14*fps} durationInFrames={10*fps}><StoryText eyebrow="TOAD, LARI!" text="…sampai Bowser Jr. datang."/></Sequence>
    <Sequence name="Bowser Jr. — pengejar" from={24*fps} durationInFrames={7*fps}><StoryText eyebrow="BOWSER JR." text="Kecil. Tapi penuh masalah."/></Sequence>
    <Sequence name="Toad — lompatan" from={31*fps} durationInFrames={7*fps}><StoryText eyebrow="JANGAN SAMPAI TERTANGKAP" text="Satu lompatan lagi!"/></Sequence>
    <Sequence name="Pengejaran melingkar" from={38*fps} durationInFrames={7*fps}><StoryText eyebrow="BAHAYA TERUS MENGIKUTI" text="Ke mana pun Toad berlari…"/></Sequence>
    <Sequence name="Yoshi datang" from={45*fps} durationInFrames={7*fps}><StoryText eyebrow="YOSHI" text="Sahabat tidak tinggal diam."/></Sequence>
    <Sequence name="Tiga karakter satu lintasan" from={52*fps} durationInFrames={8*fps}><StoryText eyebrow="KINI GILIRAN YOSHI" text="Pengejar pun dikejar."/></Sequence>
    <Sequence name="Yoshi ikut mengejar" from={60*fps} durationInFrames={8*fps}><StoryText eyebrow="JANGAN GANGGU SAHABATKU" text="Yoshi tak akan menyerah!"/></Sequence>
    <Sequence name="Bowser dikejar Yoshi" from={68*fps} durationInFrames={8*fps}><StoryText eyebrow="KEADAAN BERBALIK" text="Sekarang, siapa yang harus lari?"/></Sequence>
    <Sequence name="Petualangan bersama" from={76*fps} durationInFrames={6*fps}><StoryText eyebrow="LEBIH SERU BERSAMA" text="Tak ada sahabat yang tertinggal."/></Sequence>
    <Sequence name="Judul penutup" from={82*fps} durationInFrames={8*fps}><StoryText eyebrow="TIGA KARAKTER. SATU PETUALANGAN." text="MUSHROOM KINGDOM" title/></Sequence>
    <Audio src={staticFile('adventure.wav')} volume={.65}/>
    <Finish/>
  </AbsoluteFill>;
};

