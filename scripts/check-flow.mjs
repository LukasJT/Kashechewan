import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../assets/js/flow.js',import.meta.url),'utf8');
let cases=0;
for(const systemReduced of [false,true])for(const savedPause of [false,true])for(const storageFails of [false,true])for(const observerAvailable of [false,true]){
 const media={},observers=[],animations=[],writes=new Map();
 class Element {
  constructor(){this.dataset={};this.attributes={};this.events={};this.classList={add(){}};}
  setAttribute(k,v){this.attributes[k]=v;} removeAttribute(k){delete this.attributes[k];}
  addEventListener(k,v){this.events[k]=v;} prepend(){}
  getBoundingClientRect(){throw Error('Animation must not force a layout read');}
  animate(frames,options){
   assert.ok(frames.every(f=>Object.keys(f).every(k=>k==='opacity')),'only opacity may animate');
   assert.ok(frames.every(f=>f.opacity>=.6),'headings remain readable throughout');
   assert.ok(options.duration<=250);assert.equal(options.fill,undefined);
   const animation={cancelled:false,finished:new Promise(()=>{}),cancel(){this.cancelled=true;}};animations.push(animation);return animation;
  }
 }
 const button=new Element(),root=new Element(),headings=Array.from({length:1000},()=>new Element());
 const document={documentElement:root,body:{dataset:{page:'index'}},querySelector:s=>s==='.motion-toggle'?button:null,querySelectorAll:s=>s==='main h2'?headings:[],createElement:()=>new Element(),createTreeWalker(){throw Error('Headings must not be split into animated words');}};
 const context={document,window:{},location:{pathname:'/index.html'},addEventListener(type){throw Error(`Unexpected global ${type} handler`);},requestAnimationFrame(){throw Error('No animation frame loop is needed');},localStorage:{getItem(){if(storageFails)throw Error();return savedPause?'paused':null;},setItem(k,v){if(storageFails)throw Error();writes.set(k,v);}},matchMedia:q=>media[q]??={matches:systemReduced,addEventListener(_,fn){this.change=fn;}}};
 if(observerAvailable){context.IntersectionObserver=class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}unobserve(){}};context.window.IntersectionObserver=context.IntersectionObserver;}
 vm.runInNewContext(source,context);
 const initiallyPaused=systemReduced||savedPause&&!storageFails;
 assert.equal(root.dataset.motion,initiallyPaused?'paused':'flow');
 if(observerAvailable){
  observers[0].callback([{isIntersecting:true,target:headings[0]}]);
  assert.equal(animations.length,0,'initially visible headings must not animate');
  const entries=headings.map(target=>({isIntersecting:true,target}));
  observers[0].callback(entries);
  assert.equal(animations.length,initiallyPaused?0:2,'rapid scrolling must never queue more than two effects');
  observers[0].callback(entries);
  assert.equal(animations.length,initiallyPaused?0:2,'repeat visits must not replay effects');
 }
 if(!systemReduced){
  button.events.click();assert.equal(root.dataset.motion,initiallyPaused?'flow':'paused');
  if(!initiallyPaused)assert.ok(animations.every(a=>a.cancelled),'pause cancels active effects');
  if(!storageFails)assert.equal(writes.get('kashechewan-motion'),initiallyPaused?'flow':'paused');
 }
 media['(prefers-reduced-motion: reduce)'].matches=true;media['(prefers-reduced-motion: reduce)'].change();
 assert.equal(root.dataset.motion,'paused');assert.equal(button.disabled,true);
 assert.ok(animations.every(a=>a.cancelled),'changing the system setting cancels motion');
 cases++;
}
console.log(`Verified ${cases} preference/fallback cases and 1,000-heading scroll bursts: at most two opacity-only effects, no geometry reads, text rewriting, frame loops, or scroll handlers.`);
