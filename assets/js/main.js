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
