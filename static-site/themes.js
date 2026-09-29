/* Finesse Media — site palette (build 20260928-28).
   The palette switcher has been retired. The site always uses the first palette,
   Ivory & Champagne. Any palette a visitor chose earlier (saved in their browser or
   carried in a ?palette= link) is cleared so everyone sees the same colors. */
(function () {
  'use strict';
  var list = (typeof finessePalettes !== 'undefined' && finessePalettes) || [];
  var p = list.find(function (x) { return x.id === 'champagne'; }) || list[0];
  if (!p) return;
  var root = document.documentElement;
  root.dataset.sitePalette = p.id;
  root.dataset.paletteMode = 'light';
  var vars = { bg: p.bg, paper: p.paper, surface: p.surface, ink: p.ink, muted: p.muted, gold: p.accent,
    deep: p.deep, soft: p.soft, 'button-ink': '#ffffff', 'cinema-accent': '#c9b48c' };
  Object.keys(vars).forEach(function (k) { root.style.setProperty('--' + k, vars[k]); });
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = '#090a0b';
  try { localStorage.removeItem('finesse-palette'); } catch (e) {}
  // Remove leftover ?palette= / ?palettes from the address bar and from internal links
  try {
    var url = new URL(location.href);
    if (url.searchParams.has('palette') || url.searchParams.has('palettes')) {
      url.searchParams.delete('palette'); url.searchParams.delete('palettes');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  } catch (e) {}
})();
