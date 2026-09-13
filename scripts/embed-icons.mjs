import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';
const root=resolve(import.meta.dirname,'..');
const context={};
vm.runInNewContext(readFileSync(resolve(root,'assets/js/lucide.min.js'),'utf8'),context);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;');
const icon=name=>{
 const key=name.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join('');
 const nodes=context.lucide.icons[key]?.[2];
 if(!nodes)throw Error('Unknown icon: '+name);
 return `<svg class="icon icon-${name}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${nodes.map(([tag,attrs])=>`<${tag} ${Object.entries(attrs).filter(([key])=>key!=='key').map(([k,v])=>`${k}="${escape(v)}"`).join(' ')}/>`).join('')}</svg>`;
};
const symbol=text=>/health|wellness/i.test(text)?'heart-pulse':/education|school|learning/i.test(text)?'book-open':/housing|works/i.test(text)?'house':/emergency|flood|safety/i.test(text)?'shield-check':/land|relocation|ground|geography/i.test(text)?'trees':/polic/i.test(text)?'shield':/council|governance|leadership|partners/i.test(text)?'users-round':/culture|language|tradition/i.test(text)?'feather':/name|river|water/i.test(text)?'waves':/history|timeline|story/i.test(text)?'book-open':/source|credit|photo/i.test(text)?'camera':/contact|connect/i.test(text)?'messages-square':'hand-heart';
const navIcons={'index.html':'house','about.html':'map-pin','culture.html':'feather','community.html':'hand-heart','governance.html':'users-round','news.html':'newspaper','contact.html':'messages-square'};
let count=0;
for(const file of readdirSync(root).filter(f=>f.endsWith('.html'))){
 let html=readFileSync(resolve(root,file),'utf8');
 if(html.includes('assets/css/refinements.css'))continue;
 html=html.replace(/<nav class="nav"([^>]*)>([\s\S]*?)<\/nav><div class="header-actions">([\s\S]*?)<a class="btn header-contact"/,(all,attrs,links,preferences)=>{
   links=links.replace(/(<a href="([^"]+)"[^>]*>)([\s\S]*?)(<\/a>)/g,(_,start,href,label,end)=>start+icon(navIcons[href]||'map-pin')+'<span>'+label+'</span>'+end);
   return '<nav class="nav"'+attrs+'><div class="nav-links">'+links+'</div><div class="nav-preferences"><span class="preferences-label">Appearance &amp; motion</span>'+preferences+'</div></nav><div class="header-actions"><a class="btn header-contact"';
 });
 html=html.replace(/<i\b[^>]*data-lucide="([^"]+)"[^>]*><\/i>/g,(_,name)=>{count++;return icon(name)});
 html=html.replace(/(<div class="crumb">)/g,'$1'+icon(navIcons[file]||'camera'));
 // Stable, pre-rendered icons and heading groups: no runtime insertion or line reflow.
 html=html.replace(/(<h2\b[^>]*>)([\s\S]*?)(<\/h2>)/g,(_,start,content,end)=>{
  const plain=content.replace(/<[^>]*>/g,'');
  return start+'<span class="heading-icon">'+icon(symbol(plain))+'</span><span class="heading-text">'+content+'</span>'+end;
 });
 html=html.replace(/(<(?:article|div|a)\b[^>]*class="[^"]*\b(?:dept|card)\b[^"]*"[^>]*>)(\s*)(?=<h3)/g,(_,start,space,offset)=>{
   const title=html.slice(offset+start.length).match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1]||'';
   return start+space+'<span class="service-icon">'+icon(symbol(title))+'</span>';
 });
 html=html.replace('<script src="assets/js/lucide.min.js"></script>','');
 html=html.replace('</head>','<link rel="stylesheet" href="assets/css/refinements.css"></head>');
 writeFileSync(resolve(root,file),html);
}
console.log(`Embedded ${count} existing icons plus navigation, breadcrumbs, headings and service icons in every page.`);
