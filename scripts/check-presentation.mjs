import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
let iconCount=0;
for(const page of readdirSync(root).filter(p=>p.endsWith('.html'))){
 const html=read(page);
 assert.ok(!/<i\b[^>]*data-lucide|<script[^>]+lucide/.test(html),`${page}: runtime-dependent icon`);
 const header=html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
 assert.ok(header.includes('class="nav-links"')&&header.includes('class="nav-preferences"'),`${page}: menu organization`);
 for(const name of ['house','map-pin','hand-heart','feather','users-round','newspaper','menu','waves'])assert.ok(header.includes('icon-'+name),`${page}: ${name}`);
 for(const svg of html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g)){
  assert.match(svg[1],/stroke="currentColor"/);assert.match(svg[1],/viewBox="0 0 24 24"/);assert.match(svg[1],/aria-hidden="true"/);assert.match(svg[2],/<(?:path|circle|rect|line|polyline|polygon|ellipse)\b/);iconCount++;
 }
 assert.ok(header.includes('kashechewan-official.png'),`${page}: official logo`);
 assert.ok(html.includes('assets/css/refinements.css'),`${page}: contrast rules`);
}
const css=read('assets/css/refinements.css');
const lum=hex=>{const rgb=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
let pairs=0,min=Infinity;
for(const theme of ['light','dark','river']){
 const source=read('assets/css/flow.css');
 const block=source.match(new RegExp(':root\\[data-theme='+theme+'\\]\\{([^}]+)'))?.[1]||source.match(/:root,:root\[data-theme=river\]\{([^}]+)/)[1];
 const override=css.match(new RegExp(':root\\[data-theme='+theme+'\\]\\{([^}]+)'))[1];
 const tokens=Object.fromEntries([...`${block};${override}`.matchAll(/--([\w-]+):\s*(#[\da-f]{3,6})\b/g)].map(m=>[m[1],m[2].length===4?'#'+m[2].slice(1).split('').map(c=>c+c).join(''):m[2]]));
 for(const [fg,bg] of [['ink','paper'],['ink','cream'],['muted','paper'],['muted','cream'],['river','paper'],['river','accent-soft'],['river','icon-surface'],['spruce','paper'],['ochre','paper'],['on-deep','spruce-deep'],['on-deep-muted','spruce-deep'],['gold','spruce-deep']]){
  const ratio=contrast(tokens[fg],tokens[bg]);assert.ok(ratio>=4.5,`${theme}: ${fg} on ${bg} = ${ratio.toFixed(2)}`);min=Math.min(min,ratio);pairs++;
 }
}
assert.match(css,/\.site-header\{position:relative;top:auto/,'header must scroll away');
console.log(`Verified ${iconCount} embedded SVGs across all 9 pages; menu icons and official logo; ${pairs} text/icon colour pairs pass 4.5:1 (lowest ${min.toFixed(2)}:1); non-sticky header rule.`);
