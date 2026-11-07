// Minimal WebM muxer for deterministic VP9 + Opus exports. Timestamps use milliseconds.
window.TrailerMux = function(chunks,width,height,duration,fps) {
    const bytes = a => new Uint8Array(a);
    const join = arrays => {const result=new Uint8Array(arrays.reduce((sum,a)=>sum+a.length,0));let p=0;for(const a of arrays){result.set(a,p);p+=a.length;}return result;};
    const id = n => {const a=[];do{a.unshift(n&255);n=Math.floor(n/256);}while(n);return bytes(a);};
    const size = n => {let length=1;while(n>=2**(7*length)-1)length++;const a=new Uint8Array(length);for(let i=length-1;i>=0;i--){a[i]=n%256;n=Math.floor(n/256);}a[0]|=1<<(8-length);return a;};
    const uint = n => id(n);
    const str = s => new TextEncoder().encode(s);
    const float = n => {const a=new Uint8Array(8);new DataView(a.buffer).setFloat64(0,n);return a;};
    const element = (tag,data) => join([id(tag),size(data.length),data]);
    const number = (tag,n) => element(tag,uint(n));
    const text = (tag,s) => element(tag,str(s));
    const header=element(0x1A45DFA3,join([number(0x4286,1),number(0x42F7,1),number(0x42F2,4),number(0x42F3,8),text(0x4282,'webm'),number(0x4287,4),number(0x4285,2)]));
    const info=element(0x1549A966,join([number(0x2AD7B1,1000000),element(0x4489,float(duration*1000)),text(0x4D80,'Mushroom Kingdom'),text(0x5741,'WebGL Trailer Studio')]));
    const video=element(0xAE,join([number(0xD7,1),number(0x73C5,1),number(0x83,1),text(0x86,'V_VP9'),number(0x23E383,Math.round(1e9/fps)),element(0xE0,join([number(0xB0,width),number(0xBA,height)]))]));
    // OpusHead v1, stereo, 312-sample pre-skip, 48 kHz, mapping family 0.
    const opusHead=join([str('OpusHead'),bytes([1,2,56,1,128,187,0,0,0,0,0])]);
    const audio=element(0xAE,join([number(0xD7,2),number(0x73C5,2),number(0x83,2),text(0x86,'A_OPUS'),element(0x63A2,opusHead),number(0x56AA,6500000),number(0x56BB,80000000),element(0xE1,join([element(0xB5,float(48000)),number(0x9F,2)]))]));
    const tracks=element(0x1654AE6B,join([video,audio]));
    const clusters=[];let clusterTime=-1,blocks=[];
    function flush(){if(blocks.length)clusters.push(element(0x1F43B675,join([number(0xE7,clusterTime),...blocks])));blocks=[];}
    chunks.sort((a,b)=>a.timestamp-b.timestamp||a.track-b.track);
    for(const chunk of chunks){
        const ms=Math.max(0,Math.round(chunk.timestamp/1000));
        if(clusterTime<0||ms-clusterTime>=1000){flush();clusterTime=ms;}
        const block=new Uint8Array(4+chunk.data.length);block[0]=0x80|chunk.track;new DataView(block.buffer).setInt16(1,ms-clusterTime);block[3]=(chunk.track===2||chunk.key)?0x80:0;block.set(chunk.data,4);blocks.push(element(0xA3,block));
    }
    flush();return new Blob([header,element(0x18538067,join([info,tracks,...clusters]))],{type:'video/webm'});
};
