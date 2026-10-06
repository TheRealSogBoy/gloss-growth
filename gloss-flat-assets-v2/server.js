const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'dist'),production=process.env.NODE_ENV==='production';
if(!fs.existsSync(path.join(root,'index.html')))throw Error('Run npm run build first');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon'};
http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 if(!production)res.setHeader('X-Robots-Tag','noindex, nofollow');
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
 const redirects={'/index.html':'/','/politica-de-privacidad':'/politica-de-privacidad/','/politica-de-privacidad.html':'/politica-de-privacidad/','/politica-de-privacidad/index.html':'/politica-de-privacidad/','/terminos-del-servicio':'/terminos-del-servicio/','/terminos-del-servicio.html':'/terminos-del-servicio/','/terminos-del-servicio/index.html':'/terminos-del-servicio/'};
 if(redirects[url]){res.writeHead(301,{Location:redirects[url]});return res.end();}
 if(url==='/robots.txt'&&!production){res.writeHead(200,{'Content-Type':mime['.txt']});return res.end(req.method==='HEAD'?'':'User-agent: *\nDisallow: /\n');}
 const resolved=path.resolve(root,'.'+url),safe=resolved.startsWith(root+path.sep)||resolved===root;
 let file=safe?resolved:'';
 if(file&&fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 const found=file&&fs.existsSync(file)&&fs.statSync(file).isFile();
 const status=found&&url!=='/404.html'?200:404;
 if(status===404){file=path.join(root,'404.html');res.setHeader('X-Robots-Tag','noindex, follow');}
 const ext=path.extname(file);if(ext!=='.html'&&url!=='/robots.txt')res.setHeader('X-Robots-Tag','noindex');
 res.writeHead(status,{'Content-Type':mime[ext]||'application/octet-stream','Content-Length':fs.statSync(file).size,'Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600'});
 if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT||8766),process.env.HOST||'127.0.0.1',()=>console.log('Gloss Growth ready'));
