import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const init=await readFile(resolve(root,'assets/js/theme.js'),'utf8');
const main=await readFile(resolve(root,'assets/js/main.js'),'utf8');
let cases=0;
for(const storageAvailable of [true,false]) for(const reduced of [true,false]) {
 const events={},media=new Map(),storage=new Map();
 const select={value:'',addEventListener:(name,fn)=>events[name]=fn};
 const document={documentElement:{dataset:{}},querySelector:s=>s==='.theme-select'?select:null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener:()=>{},startViewTransition:fn=>fn()};
 const context=vm.createContext({document,window:{},matchMedia:query=>{
   if(!media.has(query)) media.set(query,{matches:query.includes('reduced-motion')&&reduced,addEventListener:(_,fn)=>media.get(query).listener=fn});
   return media.get(query);
 },localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>{if(!storageAvailable)throw Error('storage unavailable');storage.set(key,value)}}});
 vm.runInContext(init,context);vm.runInContext(main,context);
 for(const selected of ['river','dark','light','river']) {
   select.value=selected;events.change();
   assert.equal(document.documentElement.dataset.theme,selected);
   media.get('(prefers-color-scheme: dark)').listener({matches:selected!=='dark'});
   assert.equal(document.documentElement.dataset.theme,selected,'system must not override an explicit choice');
   if(storageAvailable) {vm.runInContext(init,context);assert.equal(document.documentElement.dataset.theme,selected,'choice must survive page reload');}
   cases++;
 }
}
console.log(`Verified ${cases} mode changes, system preference isolation, reduced-motion paths, reload persistence, and unavailable-storage behavior.`);
