import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../assets/js/flow.js',import.meta.url),'utf8');
let cases=0;
for(const reduced of [false,true])for(const paused of [false,true])for(const storageFails of [false,true])for(const coarse of [false,true]){
 const observers=[],animations=[],frames=[],media={},documentEvents={},writes=new Map();let reads=0;
 class Element{
  constructor(words=[]){this.words=words;this.dataset={};this.attributes={};this.events={};this.children=[];this.style={};this.classes=new Set();this.classList={add:c=>this.classes.add(c),toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c)};}
  setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}getAttribute(k){return this.attributes[k];}
  addEventListener(k,fn){this.events[k]=fn;}prepend(e){this.children.unshift(e);}append(e){this.children.push(e);}remove(){this.removed=true;}
  closest(){return null;}querySelectorAll(s){return s==='.motion-word'?this.words:[];}
  getBoundingClientRect(){reads++;return {left:20,top:30,width:300,height:160};}
  animate(keyframes,options){
   assert.ok(keyframes.every(f=>Object.keys(f).every(k=>['opacity','transform'].includes(k))),'no filter or geometry animation');
   assert.ok(options.duration<=650);assert.ok((options.delay||0)<=400);
   const animation={target:this,cancelled:false,keyframes,options,finished:new Promise(()=>{}),cancel(){this.cancelled=true;}};animations.push(animation);return animation;
  }
 }
 const root=new Element(),toggle=new Element(),header=new Element(),card=new Element(),button=new Element();
 const headings=Array.from({length:1000},()=>new Element(Array.from({length:4},()=>new Element())));
 const surfaces=Array.from({length:4},()=>new Element());
 const document={documentElement:root,body:{dataset:{page:'index'}},hidden:false,addEventListener:(e,fn)=>{assert.equal(e,'visibilitychange');documentEvents[e]=fn;},querySelector:s=>s==='.motion-toggle'?toggle:s==='.site-header'?header:null,querySelectorAll:s=>{
  if(s.startsWith('[data-liquid]'))return surfaces;
  if(s==='main h1,main h2')return headings;
  if(s==='.dept,article.card,.notice-links>a')return [card];
  if(s==='.btn,.quick-links a,.service-directory>a')return [button];
  return [];
 },createElement:()=>new Element(),createTreeWalker(){throw Error('Never split or measure text at runtime');}};
 const context={document,window:{},location:{pathname:'/index.html'},scrollX:0,scrollY:0,requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},addEventListener:e=>{throw Error('Unexpected global listener: '+e);},matchMedia:q=>media[q]??={matches:q.includes('reduced')?reduced:q.includes('coarse')?coarse:true,addEventListener(_,fn){this.change=fn;}},localStorage:{getItem(){if(storageFails)throw Error();return paused?'paused':null;},setItem(k,v){if(storageFails)throw Error();writes.set(k,v);}},IntersectionObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}unobserve(){}}};
 context.window.IntersectionObserver=context.IntersectionObserver;
 vm.runInNewContext(source,context);
 const disabled=reduced||paused&&!storageFails;
 assert.equal(root.dataset.motion,disabled?'paused':'flow');
 assert.equal(reads,0,'initialization must not read layout');
 observers[0].callback(surfaces.map(target=>({target,isIntersecting:true})));
 assert.equal(surfaces.filter(s=>s.classes.has('liquid-visible')).length,coarse?1:2,'limit ambient layers on touch and desktop');
 observers[0].callback(surfaces.map(target=>({target,isIntersecting:false})));
 assert.equal(surfaces.filter(s=>s.classes.has('liquid-visible')).length,0,'offscreen liquids must pause');
 observers[1].callback(headings.map(target=>({target,isIntersecting:true})));
 assert.equal(animations.length,disabled?0:coarse?4:8,'limit text-animation layers with no queue');
 if(coarse)assert.ok(animations.every(a=>headings.includes(a.target)),'touch screens animate whole headings instead of individual words');
 observers[1].callback(headings.map(target=>({target,isIntersecting:true})));
 assert.equal(animations.length,disabled?0:coarse?4:8,'do not replay revealed headings');
 assert.equal(reads,0,'reveals must not measure or reposition layout');
 if(!disabled){
  card.events.pointerenter();assert.equal(reads,1);
  for(let i=0;i<100;i++)card.events.pointermove({pageX:100+i,pageY:200});
  assert.equal(frames.length,1,'coalesce all pointer movement into one frame');frames[0]();assert.equal(reads,1,'pointer frames must not remeasure layout');
  assert.match(card.children[0].style.transform,/translate3d/);
 }
 document.hidden=true;documentEvents.visibilitychange();assert.ok(animations.every(a=>a.cancelled));
 document.hidden=false;documentEvents.visibilitychange();assert.equal(root.dataset.tabHidden,'false');assert.equal(root.dataset.motion,disabled?'paused':'flow');
 if(!reduced){toggle.events.click();assert.equal(root.dataset.motion,disabled?'flow':'paused');if(!storageFails)assert.equal(writes.get('kashechewan-motion'),disabled?'flow':'paused');}
 media['(prefers-reduced-motion: reduce)'].matches=true;media['(prefers-reduced-motion: reduce)'].change();assert.equal(root.dataset.motion,'paused');assert.equal(toggle.disabled,true);
 cases++;
}
console.log(`Verified ${cases} motion configurations: 1,000-entry bursts capped at 4 mobile / 8 desktop, mobile whole-block reveals, offscreen liquids paused, pointer frames coalesced, no scroll interception or reveal layout reads.`);
