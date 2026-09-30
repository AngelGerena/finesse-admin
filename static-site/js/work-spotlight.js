/* Finesse Media — Selected Work spotlight: accessible tabs (click, arrow keys,
   Home/End) that swap the featured category. Photo thumbnails reuse the site's
   existing photo dialog through their data-photo attributes. */
(function () {
  'use strict';
  var list = document.querySelector('.spot-index');
  if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    if (window.matchMedia('(max-width: 900px)').matches) {
      tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); select(tabs[next], true); }
    });
  });

  // "See my photography" under the wedding photo opens the Weddings spotlight.
  document.querySelectorAll('[data-filter-link]').forEach(function (link) {
    link.addEventListener('click', function () {
      var tab = document.getElementById('spot-tab-weddings');
      if (tab) select(tab, false);
    });
  });
})();
