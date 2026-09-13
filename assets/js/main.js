/* Kashechewan First Nation — light front-end behaviour.
   The site works without JavaScript; this only enhances it. */
(function () {
  "use strict";

  // Mobile navigation toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close the menu when a link is chosen
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Set the current year in footers
  var y = document.querySelectorAll("[data-year]");
  for (var i = 0; i < y.length; i++) {
    y[i].textContent = new Date().getFullYear();
  }
})();

(() => {
  'use strict';
  const root = document.documentElement, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const theme = document.querySelector('.theme-select');
  const modes = ['light', 'dark', 'river'];
  let explicitTheme = null;
  try { const saved = localStorage.getItem('kashechewan-theme'); if (modes.includes(saved)) explicitTheme = saved; } catch {}
  const toggle = document.querySelector('.nav-toggle'), nav = document.querySelector('.nav');
  const icons = () => window.lucide?.createIcons({attrs:{'stroke-width':1.6}});
  function themeLabel(){
    if(!theme)return;
    theme.value = root.dataset.theme;
  }
  themeLabel();
  theme?.addEventListener('change',()=>{
    const selected = theme.value;
    if (!modes.includes(selected)) return;
    explicitTheme = selected;
    const apply=()=>{root.dataset.theme=selected;try{localStorage.setItem('kashechewan-theme',selected)}catch{}themeLabel()};
    if(document.startViewTransition&&!reduced.matches)document.startViewTransition(apply);else apply();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',event=>{
    if (explicitTheme) return;
    root.dataset.theme=event.matches?'dark':'light';themeLabel();
  });
  function closeMenu(focus=false){nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open menu');if(focus)toggle?.focus()}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open'))closeMenu(true)});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
  nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  matchMedia('(min-width: 1241px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
  const symbolFor=text=>/health|wellness/i.test(text)?'heart-pulse':/education|school/i.test(text)?'book-open':/housing|works/i.test(text)?'house':/emergency|flood/i.test(text)?'shield-check':/land|relocation/i.test(text)?'trees':/polic|safety/i.test(text)?'shield':/council|governance/i.test(text)?'users-round':/culture|language/i.test(text)?'feather':'newspaper';
  document.querySelectorAll('.dept, article.card, .grid-4 > a.card').forEach(el=>{
    const title=el.querySelector('h3');if(!title)return;
    const icon=document.createElement('span');icon.className='service-icon';icon.innerHTML=`<i data-lucide="${symbolFor(title.textContent)}" aria-hidden="true"></i>`;el.prepend(icon);
  });
  icons();
  if(!reduced.matches&&'IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.75,.2,1)',fill:'none'});
      observer.unobserve(entry.target);
    }),{threshold:.08});
    document.querySelectorAll('.split > *, .dept, article.card, .stat, .timeline .t-item').forEach(el=>observer.observe(el));
  }
  document.querySelectorAll('.btn, .quick-links a').forEach(el=>el.addEventListener('pointerdown',e=>{
    if(reduced.matches)return;
    const box=el.getBoundingClientRect(),r=document.createElement('span');r.className='ripple';r.style.left=`${e.clientX-box.left}px`;r.style.top=`${e.clientY-box.top}px`;el.append(r);r.addEventListener('animationend',()=>r.remove(),{once:true});
  }));
})();
