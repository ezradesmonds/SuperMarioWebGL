// Finalize duration fields in the fragmented MP4 produced by browser MediaRecorder.
const fs=require('fs'),path=require('path');
const file=path.resolve(__dirname,'../output/Mushroom-Kingdom-Trailer.mp4');
const data=fs.readFileSync(file),tracks=new Map();let movie;
function boxes(a,z){const result=[];for(let p=a;p+8<=z;){const size=data.readUInt32BE(p);if(size<8||p+size>z)throw Error('Invalid MP4 box');result.push({p,size,type:data.toString('ascii',p+4,p+8)});p+=size;}return result;}
const children=box=>boxes(box.p+8,box.p+box.size);
const top=boxes(0,data.length),moov=top.find(b=>b.type==='moov');
if(!moov)throw Error('Missing movie metadata');
for(const box of children(moov)){
 if(box.type==='mvhd')movie=box;
 if(box.type==='trak'){
  const list=children(box),tkhd=list.find(b=>b.type==='tkhd'),mdia=list.find(b=>b.type==='mdia');
  const md=children(mdia),mdhd=md.find(b=>b.type==='mdhd'),hdlr=md.find(b=>b.type==='hdlr');
  const version=data[tkhd.p+8],id=data.readUInt32BE(tkhd.p+(version?28:20));
  const mediaVersion=data[mdhd.p+8],scale=data.readUInt32BE(mdhd.p+(mediaVersion?28:20));
  tracks.set(id,{tkhd,mdhd,scale,end:0,samples:0,kind:data.toString('ascii',hdlr.p+16,hdlr.p+20)});
 }
}
for(const moof of top.filter(b=>b.type==='moof'))for(const traf of children(moof).filter(b=>b.type==='traf')){
 const list=children(traf),tfhd=list.find(b=>b.type==='tfhd'),tfdt=list.find(b=>b.type==='tfdt');
 const track=tracks.get(data.readUInt32BE(tfhd.p+12));if(!track)throw Error('Unknown track');
 let base=data[tfdt.p+8]?Number(data.readBigUInt64BE(tfdt.p+12)):data.readUInt32BE(tfdt.p+12);
 const flags=data.readUIntBE(tfhd.p+9,3);let cursor=tfhd.p+16;if(flags&1)cursor+=8;if(flags&2)cursor+=4;
 const defaultDuration=flags&8?data.readUInt32BE(cursor):0;
 for(const run of list.filter(b=>b.type==='trun')){
  const flags=data.readUIntBE(run.p+9,3),count=data.readUInt32BE(run.p+12);let cursor=run.p+16;
  if(flags&1)cursor+=4;if(flags&4)cursor+=4;
  for(let i=0;i<count;i++){
   const duration=flags&256?data.readUInt32BE(cursor):defaultDuration;
   if(flags&256)cursor+=4;if(flags&512)cursor+=4;if(flags&1024)cursor+=4;if(flags&2048)cursor+=4;
   base+=duration;
  }
  track.samples+=count;
 }
 track.end=Math.max(track.end,base);
}
const movieScale=data.readUInt32BE(movie.p+(data[movie.p+8]?28:20));let end=0;
function duration(box,offset,value){if(data[box.p+8])data.writeBigUInt64BE(BigInt(Math.round(value)),box.p+offset[1]);else data.writeUInt32BE(Math.round(value),box.p+offset[0]);}
for(const track of tracks.values()){
 duration(track.mdhd,[24,32],track.end);duration(track.tkhd,[28,36],track.end/track.scale*movieScale);
 end=Math.max(end,track.end/track.scale);console.log(track.kind+': '+track.samples+' samples, '+(track.end/track.scale).toFixed(3)+' seconds');
}
duration(movie,[24,32],end*movieScale);fs.writeFileSync(file,data);
console.log('Finalized MP4 duration: '+end.toFixed(3)+' seconds');
