/* Progressive motion: native scrolling, visible content by default, one frame per scroll. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  try { paused = localStorage.getItem('kashechewan-motion') === 'paused'; } catch {}
  const enabled = () => !paused && !reduced.matches;
  const button = document.querySelector('.motion-toggle');
  const activeAnimations = new Set();
  function setMotion() {
    root.dataset.motion = enabled() ? 'flow' : 'paused';
    button?.setAttribute('aria-pressed', String(!enabled()));
    button?.setAttribute('aria-label', enabled() ? 'Pause motion' : 'Motion paused. Resume motion');
    if (button) {
      button.title = reduced.matches ? 'Motion follows your reduced-motion setting' : enabled() ? 'Pause motion' : 'Resume motion';
      button.disabled = reduced.matches;
    }
    if (!enabled()) {
      activeAnimations.forEach(animation => animation.cancel());
      activeAnimations.clear();
      document.querySelectorAll('[style*="--parallax"]').forEach(el => el.style.removeProperty('--parallax'));
    }
  }
  button?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('kashechewan-motion', paused ? 'paused' : 'flow'); } catch {}
    setMotion();
  });
  reduced.addEventListener('change', setMotion);
  setMotion();

  const symbol = {index:'waves',about:'map-pin',community:'hand-heart',culture:'feather',governance:'users-round',news:'newspaper',contact:'messages-square',credits:'camera'};
  const crumb = document.querySelector('.crumb');
  if (crumb) {
    const icon = document.createElement('i');
    icon.dataset.lucide = symbol[document.body.dataset.page] || 'waves';
    icon.setAttribute('aria-hidden','true');
    crumb.prepend(icon);
  }
  document.querySelectorAll('.contact-layout .card').forEach((card,index) => {
    const icon = document.createElement('span');
    icon.className = 'service-icon';
    icon.innerHTML = `<i data-lucide="${index ? 'users-round' : 'shield-check'}" aria-hidden="true"></i>`;
    card.prepend(icon);
  });
  window.lucide?.createIcons({attrs:{'stroke-width':1.5}});
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href') === current) { a.classList.add('active'); a.setAttribute('aria-current','page'); }
  });

  const fields = document.querySelectorAll('.hero,.page-banner,.band-spruce,.site-footer');
  fields.forEach(surface => {
    const field = document.createElement('div');
    field.className = 'flow-field'; field.setAttribute('aria-hidden','true');
    field.innerHTML = '<span></span><span></span>';
    surface.prepend(field);
  });
  const observedPhotos = new Set();
  if ('IntersectionObserver' in window) {
    const ambient = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('flow-active', entry.isIntersecting);
      if (entry.target.matches('.photo,.hero')) {
        if (entry.isIntersecting) observedPhotos.add(entry.target); else observedPhotos.delete(entry.target);
      }
    }), {rootMargin:'50px'});
    new Set([...fields,...document.querySelectorAll('.photo')]).forEach(el => ambient.observe(el));

    function animate(el,frames,options) {
      if (!el.animate || !enabled()) return;
      const animation = el.animate(frames,options);
      activeAnimations.add(animation);
      animation.finished.then(() => activeAnimations.delete(animation),() => activeAnimations.delete(animation));
    }
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      reveals.unobserve(el);
      if (!enabled()) return;
      const words = el.querySelectorAll('.reveal-word');
      if (words.length) {
        words.forEach((word,index) => animate(word,[{opacity:0,transform:'translateY(32px) rotate(2deg)',filter:'blur(5px)'},{opacity:1,transform:'none',filter:'none'}],{duration:850,delay:Math.min(index*45,450),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
      } else {
        animate(el,[{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'none'}],{duration:900,delay:Number(el.dataset.revealDelay || 0),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
      }
    }), {threshold:0,rootMargin:'0px 0px -32px 0px'});
    // Keep inline semantics, links, line breaks, and accessible text intact.
    document.querySelectorAll('h1,h2').forEach(heading => {
      const walker = document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
      const nodes = []; while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        if (!node.textContent.trim()) return;
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(word => {
          if (/^\s+$/.test(word)) fragment.append(document.createTextNode(word));
          else { const span=document.createElement('span');span.className='reveal-word';span.textContent=word;fragment.append(span); }
        });
        node.replaceWith(fragment);
      });
      reveals.observe(heading);
    });
    document.querySelectorAll('.dept,.card,.photo,.stat,.t-item,.note,.callout,.location-panel,.prose>p,.hero-inner>p,.page-banner p,.section-head>.lead,.footer-grid>div,.info-rows>.row').forEach(el => {
      if (el.parentElement.classList.contains('grid')) el.dataset.revealDelay = String([...el.parentElement.children].indexOf(el)%3*80);
      reveals.observe(el);
    });
    const anchors = [...document.querySelectorAll('.page-index a[href^="#"]')];
    const sections = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        anchors.forEach(a => {
          if (a.hash === '#'+entry.target.id) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-18% 0px -60% 0px'});
    anchors.forEach(a => { const target=document.getElementById(a.hash.slice(1)); if(target) sections.observe(target); });
  }
  const header = document.querySelector('.site-header');
  const progress = document.createElement('div');
  progress.className = 'reading-progress'; progress.setAttribute('aria-hidden','true'); header?.append(progress);
  let pending = false;
  function scrollFrame() {
    pending = false;
    const length = root.scrollHeight - innerHeight;
    header?.style.setProperty('--reading',length > 0 ? Math.min(1,Math.max(0,scrollY/length)) : 0);
    header?.classList.toggle('is-scrolled',scrollY>30);
    if (!enabled() || !finePointer.matches) return;
    observedPhotos.forEach(el => {
      const box = el.getBoundingClientRect();
      const amount = Math.max(-14,Math.min(14,(innerHeight/2-box.top-box.height/2)*.025));
      el.style.setProperty('--parallax',`${amount.toFixed(1)}px`);
    });
  }
  function queueFrame() { if (!pending) { pending=true; requestAnimationFrame(scrollFrame); } }
  addEventListener('scroll',queueFrame,{passive:true});
  addEventListener('resize',queueFrame,{passive:true});
  queueFrame();
  document.querySelectorAll('.dept,article.card').forEach(card => {
    card.addEventListener('pointermove',event => {
      if (!enabled() || !finePointer.matches) return;
      const box=card.getBoundingClientRect();
      card.style.setProperty('--pointer-x',`${event.clientX-box.left}px`);
      card.style.setProperty('--pointer-y',`${event.clientY-box.top}px`);
    },{passive:true});
  });
})();
