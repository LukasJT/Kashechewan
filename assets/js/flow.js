/* Restrained progressive enhancement. No scroll handlers, layout reads, or text rewriting. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = localStorage.getItem('kashechewan-motion') === 'paused'; } catch {}
  const enabled = () => !paused && !reduced.matches;
  const button = document.querySelector('.motion-toggle');
  const active = new Set();
  function setMotion() {
    root.dataset.motion = enabled() ? 'flow' : 'paused';
    button?.setAttribute('aria-pressed', String(!enabled()));
    button?.setAttribute('aria-label', enabled() ? 'Pause motion' : 'Resume motion');
    if (button) {
      button.title = reduced.matches ? 'Motion follows your reduced-motion setting' : enabled() ? 'Pause motion' : 'Resume motion';
      button.disabled = reduced.matches;
    }
    if (!enabled()) { active.forEach(animation => animation.cancel()); active.clear(); }
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
    if (a.getAttribute('href').replace(/^\//,'') === current) { a.classList.add('active'); a.setAttribute('aria-current','page'); }
  });
  if (!('IntersectionObserver' in window)) return;
  // Only section headings fade. Text nodes, geometry, and scrolling stay untouched.
  const seen = new WeakSet();
  let initialDelivery = true;
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      const heading = entry.target;
      seen.add(heading); reveals.unobserve(heading);
      if (initialDelivery || !enabled() || active.size >= 2 || !heading.animate) return;
      const animation = heading.animate([{opacity:.65},{opacity:1}],{duration:240,easing:'ease-out'});
      active.add(animation);
      animation.finished.then(() => active.delete(animation),() => active.delete(animation));
    });
    initialDelivery = false;
  }, {threshold:0,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('main h2').forEach(heading => reveals.observe(heading));
  const anchors = [...document.querySelectorAll('.page-index a[href^="#"]')];
  if (!anchors.length) return;
  const sections = new IntersectionObserver(entries => {
    const visible = entries.find(entry => entry.isIntersecting);
    if (!visible) return;
    anchors.forEach(a => {
      if (a.hash === '#'+visible.target.id) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
    });
  }, {rootMargin:'-18% 0px -60% 0px'});
  anchors.forEach(a => { const target=document.getElementById(a.hash.slice(1)); if(target) sections.observe(target); });
})();
