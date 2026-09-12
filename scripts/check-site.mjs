import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import vm from 'node:vm';
const root=resolve(import.meta.dirname,'..');
const files=(await readdir(root)).filter(f=>f.endsWith('.html'));
const pages=new Map(await Promise.all(files.map(async f=>[f,await readFile(resolve(root,f),'utf8')])));
let count=0; const errors=[];
for(const [file,html] of pages){
 if((html.match(/<main[ >]/g)||[]).length!==1||(html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${file}: main or h1 count`);
 if(!html.includes('assets/js/theme.js'))errors.push(`${file}: theme missing`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)errors.push(`${file}: duplicate id`);
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=m[1];if(/^(https?:|mailto:|tel:|data:)/.test(url))continue;
  const [path,hash]=url.split('#');const local=path.replace(/^\//,'')||file;
  try{await stat(resolve(root,local));if(hash&&local.endsWith('.html')&&!pages.get(local)?.includes(`id="${hash}"`))errors.push(`${file}: missing anchor ${url}`)}catch{errors.push(`${file}: missing ${url}`)}count++;
 }
 for(const img of html.matchAll(/<img\b[^>]*>/g))if(!/\balt=/.test(img[0]))errors.push(`${file}: image alt missing`);
}
const init=await readFile(resolve(root,'assets/js/theme.js'),'utf8');
for(const system of [false,true])for(const stored of [null,'light','dark','invalid','throws']){
 const document={documentElement:{dataset:{}}};
 vm.runInNewContext(init,{document,matchMedia:()=>({matches:system}),localStorage:{getItem(){if(stored==='throws')throw Error();return stored}}});
 const expected=['light','dark'].includes(stored)?stored:system?'dark':'light';
 if(document.documentElement.dataset.theme!==expected)errors.push('Theme initialization failed');
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Verified ${files.length} routes, ${count} local links/assets, anchor targets, image alternatives, and 10 theme initialization cases.`);
