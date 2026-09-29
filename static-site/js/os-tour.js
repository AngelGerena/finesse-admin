/* Finesse Media — Finesse OS admin tours (build 20260928-37).
   Works for every [data-os-tour] on the page (the Mayordomía Fértil showcase and the
   Deltona Wellness studio tab). A thin bar under the active button fills over 5 seconds,
   then the tour steps to the next screen. It runs only while its buttons are visible,
   pauses on hover or focus, stops once a visitor picks a screen, and stays still for
   visitors who prefer reduced motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('[data-os-tour]'), function (tour) {
    var nav = tour.querySelector('.os-tour-nav');
    var btns = Array.prototype.slice.call(tour.querySelectorAll('.os-tour-btn'));
    var shots = tour.querySelectorAll('[data-tour-shot]');
    var caption = document.querySelector(tour.getAttribute('data-caption-target') || '');
    if (!nav || !btns.length) return;
    var auto = !reduce, inView = false, current = 0;

    function show(i) {
      current = i;
      var key = btns[i].getAttribute('data-tour');
      btns.forEach(function (b, n) { b.setAttribute('aria-pressed', String(n === i)); b.classList.remove('is-running'); });
      shots.forEach(function (s) { s.hidden = s.getAttribute('data-tour-shot') !== key; });
      if (caption) caption.textContent = btns[i].getAttribute('data-caption');
      run();
    }
    function run() {
      var b = btns[current];
      b.classList.remove('is-running');
      if (!auto || !inView) return;
      void b.offsetWidth; // restart the fill animation
      b.classList.add('is-running');
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { auto = false; show(i); });
      b.querySelector('.os-tour-bar i').addEventListener('animationend', function () {
        if (auto && b.classList.contains('is-running')) show((i + 1) % btns.length);
      });
    });
    ['mouseenter', 'focusin'].forEach(function (ev) { tour.addEventListener(ev, function () { tour.classList.add('is-paused'); }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { tour.addEventListener(ev, function () { tour.classList.remove('is-paused'); }); });

    // Watch the buttons themselves: they are hidden (and so never "in view") until the admin view is open.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries.some(function (e) { return e.isIntersecting; });
        if (inView) run(); else btns[current].classList.remove('is-running');
      }, { threshold: 0.5 }).observe(nav);
    }
  });
})();
