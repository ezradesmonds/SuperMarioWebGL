// Local-only preview/export endpoint. Run: node tools/trailer-server.cjs
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),port=Number(process.env.TRAILER_PORT||8765);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.mp4':'video/mp4','.webm':'video/webm'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(req.method==='POST'&&url.pathname==='/__trailer_export'){
  const ext=url.searchParams.get('ext');if(!['mp4','webm'].includes(ext)){res.writeHead(400);return res.end();}
  const out=path.join(root,'output');fs.mkdirSync(out,{recursive:true});
  const dest=path.join(out,'Mushroom-Kingdom-Trailer.'+ext),temp=dest+'.part';
  const file=fs.createWriteStream(temp);let size=0,failed=false;
  req.on('data',chunk=>{size+=chunk.length;if(size>150e6){failed=true;req.destroy();file.destroy();}});
  req.pipe(file);file.on('error',()=>{failed=true;if(!res.headersSent)res.writeHead(500);res.end('Export failed');});
  file.on('finish',()=>{if(failed)return;fs.renameSync(temp,dest);console.log('SAVED '+dest+' ('+size+' bytes)');res.writeHead(200);res.end('Saved');});return;
 }
 if(req.method!=='GET'){res.writeHead(405);return res.end();}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/trailer.html':url.pathname));}catch{res.writeHead(400);return res.end();}
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);});
}).listen(port,'127.0.0.1',()=>console.log('Trailer studio: http://127.0.0.1:'+port+'/trailer.html'));
