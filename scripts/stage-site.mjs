import {mkdir,cp,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
await mkdir(resolve(root,'dist'),{recursive:true});
for(const file of await readdir(root)) if(file.endsWith('.html'))await cp(resolve(root,file),resolve(root,'dist',file));
await cp(resolve(root,'assets'),resolve(root,'dist/assets'),{recursive:true});
console.log('Staged all public pages and assets.');
