/* Finesse Media — digital studio showcases (build 20260928-26).
   Websites tab: tap a client site in the picker to preview it in the browser frame.
   Finesse OS tab: switch the Deltona Wellness case study between the public site ("What your
   clients see") and its Finesse OS admin ("What you see"). */
(function () {
  'use strict';

  var web = document.querySelector('[data-sx-web]');
  if (web) {
    var img = web.querySelector('[data-sx-img]');
    var url = web.querySelector('[data-sx-url]');
    var name = web.querySelector('[data-sx-name]');
    var kind = web.querySelector('[data-sx-kind]');
    var link = web.querySelector('[data-sx-link]');
    var picks = web.querySelectorAll('.site-pick');
    picks.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-pressed') === 'true') return;
        picks.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        img.src = b.dataset.src;
        img.width = Number(b.dataset.w); img.height = Number(b.dataset.h);
        img.alt = b.dataset.name.replace(/&amp;/g, '&') + ' website designed by Finesse Media';
        url.textContent = b.dataset.url;
        name.textContent = b.dataset.name.replace(/&amp;/g, '&');
        kind.textContent = b.dataset.kind;
        link.href = b.dataset.href;
      });
    });
  }

  var os = document.querySelector('[data-sx-case]');
  if (os) {
    var views = os.querySelectorAll('[data-sx-view]');
    var shots = os.querySelectorAll('[data-sx-shot]');
    var bar = os.querySelector('[data-sx-bar]');
    var cap = os.querySelector('[data-sx-caption]');
    var TEXT = {
      site: { bar: 'deltonawellnesspsychiatry.com', cap: 'The public website her patients visit.' },
      admin: { bar: 'admin · Finesse OS', cap: 'Her private Finesse OS dashboard: bookings, customers, availability, services, and the site editor.' }
    };
    views.forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.sxView;
        views.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        shots.forEach(function (s) { s.hidden = s.dataset.sxShot !== v; });
        bar.textContent = TEXT[v].bar;
        cap.textContent = TEXT[v].cap;
      });
    });
  }
})();
