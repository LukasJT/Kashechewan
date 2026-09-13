/* Full motion with bounded effects. No scroll-time layout reads or runtime text rewriting. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = localStorage.getItem('kashechewan-motion') === 'paused'; } catch {}
  const allowed = () => !paused && !reduced.matches;
  const enabled = () => allowed() && !document.hidden;
  const button = document.querySelector('.motion-toggle');
  const active = new Set();
  function setMotion() {
    root.dataset.motion = allowed() ? 'flow' : 'paused';
    button?.setAttribute('aria-pressed', String(!allowed()));
    button?.setAttribute('aria-label', allowed() ? 'Pause motion' : 'Resume motion');
    if (button) {
      button.title = reduced.matches ? 'Motion follows your reduced-motion setting' : allowed() ? 'Pause motion' : 'Resume motion';
      button.disabled = reduced.matches;
    }
    if (!allowed()) { active.forEach(animation => animation.cancel()); active.clear(); }
  }
  button?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('kashechewan-motion', paused ? 'paused' : 'flow'); } catch {}
    setMotion();
  });
  reduced.addEventListener('change', setMotion);
  setMotion();
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href').replace(/^\//,'') === current) { a.classList.add('active'); a.setAttribute('aria-current','page'); }
  });

  // No wheel/touch/scroll event interceptors. The browser owns scroll-driven images.
  document.addEventListener('visibilitychange', () => {
    root.dataset.tabHidden = String(document.hidden);
    if(document.hidden){active.forEach(animation=>animation.cancel());active.clear();}
  });
  const coarse = matchMedia('(pointer: coarse)').matches;
  const maxAnimations = coarse ? 4 : 8;
  function run(element,frames,options={}) {
    if(!enabled() || !element.animate || active.size>=maxAnimations)return null;
    const animation=element.animate(frames,{duration:420,easing:'cubic-bezier(.2,.8,.2,1)',...options});
    active.add(animation);
    animation.finished.then(()=>active.delete(animation),()=>active.delete(animation));
    return animation;
  }
  const surfaces=document.querySelectorAll('[data-liquid],.hero,.page-banner,.band-spruce,.site-footer');
  surfaces.forEach(surface=>{
    surface.classList.add('liquid-surface');
    const field=document.createElement('div');field.className='liquid-field';field.setAttribute('aria-hidden','true');field.innerHTML='<span></span><span></span>';surface.prepend(field);
  });
  const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.querySelector('.site-header')?.append(progress);
  if('IntersectionObserver' in window){
    const visibleSurfaces=new Set();
    const ambient=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting)visibleSurfaces.add(entry.target);else visibleSurfaces.delete(entry.target);});
      const running=[...visibleSurfaces].slice(0,coarse ? 1 : 2);
      surfaces.forEach(surface=>surface.classList.toggle('liquid-visible',running.includes(surface)));
    },{threshold:0});
    surfaces.forEach(surface=>ambient.observe(surface));
    const seen=new WeakSet();
    const reveals=new IntersectionObserver(entries=>{
      let sequence=0;
      entries.forEach(entry=>{
        if(!entry.isIntersecting || seen.has(entry.target))return;
        const target=entry.target;seen.add(target);reveals.unobserve(target);
        if(!enabled())return;
        const words=target.querySelectorAll('.motion-word');
        if(!coarse && words.length && words.length<=4 && active.size+words.length<=maxAnimations){
          words.forEach((word,index)=>run(word,[{opacity:.35,transform:'translate3d(0,10px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{delay:index*25,fill:'backwards'}));
        }else{
          // Mobile reveals each text block as one layer, keeping the word layout untouched.
          run(target,[{opacity:.4,transform:'translate3d(0,8px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{delay:Math.min(sequence++*25,75)});
        }
      });
    },{threshold:0,rootMargin:'0px 0px -16px 0px'});
    document.querySelectorAll('main h1,main h2').forEach(heading=>{
      if(!heading.closest('.card,.dept'))reveals.observe(heading);
    });
    document.querySelectorAll('.dept,.card,.history-path article,.notice-links>a,.service-directory>a,.landing-description,.story-summary,.culture-copy>p,.life-heading>p,.prose>p,.t-item').forEach(el=>reveals.observe(el));
    if(coarse){
      const images=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        images.unobserve(entry.target);
        run(entry.target,[{opacity:.85,transform:'scale(1.035)'},{opacity:1,transform:'scale(1.01)'}],{duration:600});
      }),{threshold:.1});
      document.querySelectorAll('.motion-media>img,.photo>img').forEach(el=>images.observe(el));
    }
    const anchors=[...document.querySelectorAll('.page-index a[href^="#"],.chapter-nav a[href^="#"]')];
    const sections=new IntersectionObserver(entries=>{
      const visible=entries.find(entry=>entry.isIntersecting);if(!visible)return;
      anchors.forEach(a=>{if(a.hash==='#'+visible.target.id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    },{rootMargin:'-18% 0px -60% 0px'});
    anchors.forEach(a=>{const target=document.getElementById(a.hash.slice(1));if(target)sections.observe(target);});
  }
  document.querySelectorAll('.btn,.quick-links a,.service-directory>a').forEach(el=>el.addEventListener('pointerdown',event=>{
    if(!enabled())return;
    const box=el.getBoundingClientRect();
    const ripple=document.createElement('span');ripple.className='motion-ripple';ripple.setAttribute('aria-hidden','true');
    ripple.style.left=(event.clientX-box.left)+'px';ripple.style.top=(event.clientY-box.top)+'px';el.append(ripple);
    const animation=run(ripple,[{opacity:.2,transform:'scale(.4)'},{opacity:0,transform:'scale(18)'}],{duration:600});
    if(animation)animation.finished.then(()=>ripple.remove(),()=>ripple.remove());else ripple.remove();
  }));
  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    // One pointer frame globally. Geometry is sampled once on entry, never on scroll.
    let frame=0,point=null;
    document.querySelectorAll('.dept,article.card,.notice-links>a').forEach(card=>{
      card.classList.add('glow-host');
      const glow=document.createElement('span');glow.className='card-glow';glow.setAttribute('aria-hidden','true');card.append(glow);
      let origin=null;
      card.addEventListener('pointerenter',()=>{const box=card.getBoundingClientRect();origin={x:box.left+scrollX,y:box.top+scrollY};});
      card.addEventListener('pointermove',event=>{
        if(!enabled()||!origin)return;
        point={glow,x:event.pageX-origin.x-90,y:event.pageY-origin.y-90};
        if(frame)return;
        frame=requestAnimationFrame(()=>{frame=0;if(enabled()&&point)point.glow.style.transform='translate3d('+point.x+'px,'+point.y+'px,0)';});
      },{passive:true});
      card.addEventListener('pointerleave',()=>{origin=null;point=null;});
    });
  }
})();
