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
    if(document.startViewTransition&&!reduced.matches&&root.dataset.motion!=='paused')document.startViewTransition(apply);else apply();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',event=>{
    if (explicitTheme) return;
    root.dataset.theme=event.matches?'dark':'light';themeLabel();
  });
  function closeMenu(focus=false){nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open menu');if(focus)toggle?.focus()}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open'))closeMenu(true)});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
  nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  matchMedia('(min-width: 1441px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
  // Icons are embedded in the HTML so controls never depend on a second script.
})();
