import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../assets/js/flow.js',import.meta.url),'utf8');
let cases=0;
for(const systemReduced of [false,true])for(const savedPause of [false,true])for(const storageFails of [false,true]){
 const media={},observers=[],animations=[],writes=new Map();
 class Element {
  constructor(){this.dataset={};this.attributes={};this.events={};this.style={setProperty(){},removeProperty(){}};this.classList={toggle(){},contains:()=>false,add(){}};this.parentElement={classList:{contains:()=>false}};}
  setAttribute(k,v){this.attributes[k]=v;} removeAttribute(k){delete this.attributes[k];}
  addEventListener(k,v){this.events[k]=v;} append(){} prepend(){} querySelectorAll(){return [];}
  matches(){return false;} getBoundingClientRect(){return {top:20,height:200,left:0};}
  animate(){const animation={cancelled:false,finished:new Promise(()=>{}),cancel(){this.cancelled=true;}};animations.push(animation);return animation;}
 }
 const button=new Element(),card=new Element(),root=new Element(),header=new Element();root.scrollHeight=2000;
 const document={documentElement:root,body:{dataset:{page:'index'}},querySelector:s=>s==='.motion-toggle'?button:s==='.site-header'?header:null,querySelectorAll:s=>s.includes('.prose>p')?[card]:[],createElement:()=>new Element()};
 const context={document,window:{},location:{pathname:'/index.html'},innerHeight:800,scrollY:200,requestAnimationFrame:fn=>fn(),addEventListener(){},localStorage:{getItem(){if(storageFails)throw Error();return savedPause?'paused':null;},setItem(k,v){if(storageFails)throw Error();writes.set(k,v);}},matchMedia:q=>media[q]??=( {matches:q.includes('reduced')?systemReduced:true,addEventListener(_,fn){this.change=fn;}} ),IntersectionObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}unobserve(){}}};
 context.window.IntersectionObserver=context.IntersectionObserver;
 vm.runInNewContext(source,context);
 const initiallyPaused=systemReduced || savedPause&&!storageFails;
 assert.equal(root.dataset.motion,initiallyPaused?'paused':'flow');
 observers[1].callback([{isIntersecting:true,target:card}]);
 assert.equal(animations.length,initiallyPaused?0:1,'reduced/paused motion must not reveal animate');
 if(!systemReduced){
  button.events.click();
  assert.equal(root.dataset.motion,initiallyPaused?'flow':'paused');
  if(!initiallyPaused)assert.ok(animations.every(a=>a.cancelled),'pause cancels active reveals');
  if(!storageFails)assert.equal(writes.get('kashechewan-motion'),initiallyPaused?'flow':'paused');
 }
 media['(prefers-reduced-motion: reduce)'].matches=true;
 media['(prefers-reduced-motion: reduce)'].change();
 assert.equal(root.dataset.motion,'paused');assert.equal(button.disabled,true);
 cases++;
}
console.log(`Verified ${cases} motion preference cases, active-animation cancellation, live reduced-motion changes, and unavailable storage.`);
