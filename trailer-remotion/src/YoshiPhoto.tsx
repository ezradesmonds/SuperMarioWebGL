import {useRef,useState,useLayoutEffect} from 'react';
import {IFrame,staticFile,delayRender,continueRender} from 'remotion';
export const YoshiPhoto=({yaw=0,blink=false}:{yaw?:number;blink?:boolean})=>{
 const ref=useRef<HTMLIFrameElement>(null);const [ready,setReady]=useState(false);const [handle]=useState(()=>delayRender('Yoshi photo'));
 useLayoutEffect(()=>{if(ready){(ref.current!.contentWindow as Window & {drawYoshiPhoto:(y:number,b:boolean)=>void}).drawYoshiPhoto(yaw,blink);continueRender(handle);}},[ready,yaw,blink,handle]);
 return <IFrame ref={ref} onLoad={()=>setReady(true)} src={staticFile('world/yoshi-photo.html')} style={{width:1280,height:720,border:0}}/>;
};
