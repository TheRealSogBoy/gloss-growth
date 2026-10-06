import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'dist');
const seeds=['index.html','404.html','politica-de-privacidad/index.html','terminos-del-servicio/index.html','robots.txt','sitemap.xml','fonts/PlusJakartaSans-OFL.txt','fonts/Zodiak-FFL.txt','vendor/LICENSE'];
const files=new Set(),queue=[...seeds];
while(queue.length){
 const rel=path.normalize(queue.shift());if(files.has(rel))continue;
 const file=path.resolve(root,rel);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error('Missing or unsafe resource: '+rel);
 files.add(rel);
 if(!/\.(html|css)$/.test(rel))continue;
 const source=fs.readFileSync(file,'utf8');
 const refs=[...source.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)];
 for(const m of refs){
  const ref=m[1]||m[2];if(/^(?:[a-z]+:|\/\/|#)/i.test(ref))continue;
  const clean=decodeURIComponent(ref.split(/[?#]/)[0]);if(!clean)continue;
  let target=path.resolve(clean.startsWith('/')?root:path.dirname(file),clean.replace(/^\//,''));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  queue.push(path.relative(root,target));
 }
}
// This is the generated output folder only; source and version archives are never removed.
if(out!==path.join(root,'dist'))throw Error('Unsafe output');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const rel of files){const dest=path.join(out,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,rel),dest);}
fs.writeFileSync(path.join(root,'BUILD_MANIFEST.json'),JSON.stringify([...files].sort(),null,2));
console.log(`Built ${files.size} public files in dist/`);
