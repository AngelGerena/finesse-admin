/* Finesse Media — photography galleries (build 20260928-22).
   Any element with data-gallery="weddings|quinceaneras|portraits|headshots|events" opens that
   category full screen. Every category is organized by session (a hero photo plus a tidy grid)
   and everything scrolls vertically. When a category holds more than one kind of shoot
   (Portraits: family, maternity, couples...) filter chips appear at the top. Tapping a photo
   opens a vertical viewer: swipe or scroll up for the next photo, arrow keys work too, Escape
   goes back. Links like #gallery-weddings open a category directly. */
(function () {
  'use strict';
  var SIZES = {"weddings":[[667,1000],[1000,667],[1000,667],[1000,667],[1000,891],[667,1000],[1000,667],[722,1000],[625,1000],[667,1000],[1000,667],[1000,667],[1000,783],[1000,667],[1000,667],[1000,667],[667,1000],[1000,667],[1000,667],[667,1000],[1000,667],[1000,667],[667,1000],[667,1000],[1000,743],[667,1000],[1000,667],[1000,667],[1000,667],[1000,667],[1000,667],[1000,667],[1000,667],[1000,667],[1000,667],[1213,811],[667,1000],[1000,667],[1000,667],[1000,667],[1000,667],[1000,690],[667,1000],[1000,736]],"quinceaneras":[[1000,822],[1000,731],[667,1000],[667,1000],[1000,667],[667,1000],[1000,667],[667,1000],[667,1000],[667,1000],[1067,1600],[1378,1600],[1067,1600],[1600,1237],[1067,1600],[1319,1600],[1600,1221],[1067,1600],[667,1000],[667,1000],[1000,667],[1000,667],[667,1000],[667,1000],[827,1000],[667,1000],[621,1000]],"portraits":[[773,1000],[1000,773],[667,1000],[773,1000],[667,1000],[667,1000],[773,1000],[1000,667],[772,1000],[1600,1067],[1600,795],[1600,1067],[1257,1600],[1600,1210],[1067,1600],[1000,667],[1000,667],[1000,773],[773,1000],[667,1000],[1000,667],[1000,667],[1000,667],[1000,667],[699,960],[667,1000],[1283,1600],[1113,1600],[667,1000],[667,1000],[741,1159],[1236,1600],[1000,815],[1236,1600],[640,960],[480,720],[720,480],[667,1000],[1000,667],[667,1000],[600,672],[600,950],[600,400],[600,900],[773,1000],[773,1000],[773,1000],[773,1000],[800,1000],[667,1000],[1000,773],[772,1000]],"headshots":[[800,1066],[800,1066],[1366,1077],[667,1000],[667,1000],[1000,667],[1000,667],[1000,667],[1000,667],[800,1066],[800,1066],[800,1066],[800,1066],[941,1151],[923,1290],[952,1263],[600,900],[667,1000],[667,1000]],"events":[[1000,602],[1000,667],[1000,667],[667,1000],[667,1000],[1000,667],[667,1000],[1000,667],[667,1000],[667,1000],[1000,616],[1000,734],[1000,562],[1000,562]]};
  var META = {
    weddings: { title: 'Weddings', line: 'A moment. A whole world.', pricing: '#weddings' },
    quinceaneras: { title: 'Quincea\u00f1eras', line: 'A chapter all her own.', pricing: '#quinceaneras' },
    portraits: { title: 'Portraits & family', line: 'The people who make it home.', pricing: '#portraits' },
    headshots: { title: 'Headshots & branding', line: 'A first impression that opens doors.', pricing: '#headshots' },
    events: { title: 'Events & celebrations', line: 'Celebrations worth remembering.', pricing: '#events' }
  };
  function r(a, b) { var out = []; for (var n = a; n <= b; n++) out.push(n); return out; }

  // Sessions, in the order they appear. "photos" are file numbers (assets/gallery/<cat>/NN.webp),
  // listed in the order they should show. "hero" is the featured photo and must be in "photos".
  // "kind" drives the eyebrow label and the filter chips. Any photo not listed in a session is
  // still shown, in a final "More moments" session, so nothing ever disappears from a gallery.
  var SESSIONS = {
    weddings: [
      { kind: 'Wedding', hero: 9, photos: r(1, 13), title: 'Pink heels and a chapel aisle.', line: 'Getting ready, the ceremony, and a reception that never sat down.' },
      { kind: 'Wedding', hero: 26, photos: r(14, 31), title: 'A garden gazebo in gold.', line: 'Bridesmaids in blue, a saxophone down the aisle, and vows under the oaks.' },
      { kind: 'Wedding', hero: 33, photos: [33, 34, 35, 36, 41, 43, 44], title: 'A fire engine and a Thunderbird.', line: 'Portraits with the fire truck and a classic white convertible.' },
      { kind: 'Wedding', hero: 37, photos: [37, 32, 38, 39, 40, 42], title: 'Rustic by the lake.', line: 'Blush roses, mason jars, and golden hour under the moss.' }
    ],
    quinceaneras: [
      { kind: 'Quincea\u00f1era', hero: 1, photos: r(1, 10), title: 'Two gowns, one afternoon.', line: 'A white gown and Converse, then red for the courthouse steps.' },
      { kind: 'Quincea\u00f1era', hero: 12, photos: r(11, 18), title: 'White by the water, then red.', line: 'Lakeside portraits in two gowns, from the balustrade to the boardwalk.' },
      { kind: 'Quincea\u00f1era', hero: 21, photos: r(19, 27), title: 'In royal blue.', line: 'Portraits in the gown before the big day.' }
    ],
    portraits: [
      { kind: 'Family', hero: 33, photos: r(26, 34), title: 'All white, all family.', line: 'A studio session in white shirts and denim, and nobody took it too seriously.' },
      { kind: 'Family', hero: 21, photos: r(16, 24), title: 'Christmas at home.', line: 'Matching pajamas, torn wrapping paper, and a teddy bear bigger than she is.' },
      { kind: 'Maternity', hero: 1, photos: r(1, 9), title: 'A teal gown and a big brother.', line: 'A maternity session with the whole family, sonogram and all.' },
      { kind: 'Maternity', hero: 40, photos: [40, 38, 39, 45, 46, 47, 48, 41, 42, 43, 44], title: 'Golden hour, then the studio.', line: 'Yellow lace in the woods, then black and white with a pink ribbon.' },
      { kind: 'Couples', hero: 14, photos: r(10, 15), title: 'Young love, downtown.', line: 'Brick streets, a mural wall, and a red door.' },
      { kind: 'Couples', hero: 49, photos: [49, 50, 51, 52], title: 'Still each other\u2019s favorite.', line: 'Sunset portraits by the water.' },
      { kind: 'Kids & portraits', hero: 36, photos: [36, 35, 37, 25], title: 'Personalities.', line: 'Kids being exactly who they are, and a few favorite portraits.' }
    ],
    headshots: [
      { kind: 'Team', hero: 13, photos: r(13, 16), title: 'One backdrop, a whole team.', line: 'Matching headshots so every bio on the website looks like it belongs.' },
      { kind: 'Partners', hero: 10, photos: r(10, 12), title: 'Two founders, one brand.', line: 'Color-coordinated portraits for a business partnership.' },
      { kind: 'Personal branding', hero: 1, photos: [1, 2, 18, 19, 17], title: 'Personal branding.', line: 'Studio portraits for websites, bios, and social.' },
      { kind: 'Musician', hero: 5, photos: r(3, 9), title: 'The saxophone session.', line: 'Dark, moody branding for a working musician.' }
    ],
    events: [
      { kind: 'Gender reveal', hero: 8, photos: r(1, 14), title: 'A pastel gender reveal.', line: 'The balloon arch, the dessert table, and the moment the smoke went blue.' }
    ]
  };
  var PREVIEW = 8; // thumbnails shown before a "See all" tile, when a session has more than PREVIEW + 1
  var UP = '\u2191\ufe0e', DOWN = '\u2193\ufe0e', LEFT = '\u2190\ufe0e', ARROW = '\u2197\ufe0e';

  var dlg, body, chipsEl, sessionsEl, viewer, feed, counter, hint, titleEl, lineEl, pricingLink, observer;
  var cat = null, filter = 'All', order = [], pos = 0, opener = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return String(n).padStart(2, '0'); }
  function src(c, n, thumb) { return 'assets/gallery/' + c + '/' + pad(n) + (thumb ? '-t' : '') + '.webp'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  // Clean, validated session list for a category (no duplicates, no missing photos)
  var cache = {};
  function sessionsFor(c) {
    if (cache[c]) return cache[c];
    var total = SIZES[c].length, seen = {}, list = [];
    (SESSIONS[c] || []).forEach(function (s) {
      var photos = (s.photos || []).filter(function (n) { var ok = n >= 1 && n <= total && !seen[n]; if (ok) seen[n] = true; return ok; });
      if (!photos.length) return;
      list.push({ kind: s.kind || '', title: s.title || '', line: s.line || '', photos: photos,
        hero: photos.indexOf(s.hero) >= 0 ? s.hero : photos[0] });
    });
    var rest = r(1, total).filter(function (n) { return !seen[n]; });
    if (rest.length) list.push({ kind: list.length ? 'More' : '', title: list.length ? 'More moments.' : '', line: '', photos: rest, hero: rest[0] });
    cache[c] = list;
    return list;
  }
  function kindsFor(c) {
    var k = [];
    sessionsFor(c).forEach(function (s) { if (s.kind && k.indexOf(s.kind) < 0) k.push(s.kind); });
    return k;
  }
  function visible(c) {
    return sessionsFor(c).filter(function (s) { return filter === 'All' || s.kind === filter; });
  }
  function alt(c, n) {
    var p = order.indexOf(n);
    return META[c].title + ' photo ' + (p >= 0 ? p + 1 : n) + ' of ' + order.length + ' by Finesse Media';
  }

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'gallery-dialog';
    dlg.setAttribute('aria-labelledby', 'gallery-title');
    dlg.innerHTML =
      '<div class="gallery-head">' +
        '<div><p class="eyebrow">THE GALLERY</p><h2 id="gallery-title"></h2><p class="gallery-line"></p></div>' +
        '<button type="button" class="gallery-close" aria-label="Close gallery">\u00d7</button>' +
      '</div>' +
      '<div class="gallery-body">' +
        '<div class="g-chips" role="group" aria-label="Filter sessions" hidden></div>' +
        '<div class="g-sessions"></div>' +
      '</div>' +
      '<div class="gallery-viewer" hidden>' +
        '<div class="gallery-vbar">' +
          '<button type="button" class="gallery-back"><span aria-hidden="true">' + LEFT + '</span> All photos</button>' +
          '<p class="gallery-count" aria-live="polite"></p>' +
        '</div>' +
        '<div class="gallery-feed" tabindex="-1"></div>' +
        '<div class="gallery-vnav">' +
          '<button type="button" class="gallery-nav gallery-prev" aria-label="Previous photo">' + UP + '</button>' +
          '<button type="button" class="gallery-nav gallery-next" aria-label="Next photo">' + DOWN + '</button>' +
        '</div>' +
        '<p class="gallery-hint" aria-hidden="true">Swipe up for the next photo</p>' +
      '</div>' +
      '<div class="gallery-foot">' +
        '<a class="gallery-pricing" href="#">See collections &amp; pricing <span aria-hidden="true">' + ARROW + '</span></a>' +
        '<a class="gold-button service-inquiry" data-interest="Photography" href="#contact">Check my date <span aria-hidden="true">' + ARROW + '</span></a>' +
      '</div>';
    document.body.appendChild(dlg);
    body = dlg.querySelector('.gallery-body');
    chipsEl = dlg.querySelector('.g-chips');
    sessionsEl = dlg.querySelector('.g-sessions');
    viewer = dlg.querySelector('.gallery-viewer');
    feed = viewer.querySelector('.gallery-feed');
    counter = viewer.querySelector('.gallery-count');
    hint = viewer.querySelector('.gallery-hint');
    titleEl = dlg.querySelector('#gallery-title');
    lineEl = dlg.querySelector('.gallery-line');
    pricingLink = dlg.querySelector('.gallery-pricing');

    dlg.querySelector('.gallery-close').addEventListener('click', function () { close(); });
    dlg.querySelector('.gallery-back').addEventListener('click', showSessions);
    dlg.querySelector('.gallery-prev').addEventListener('click', function () { step(-1); });
    dlg.querySelector('.gallery-next').addEventListener('click', function () { step(1); });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); if (!viewer.hidden) showSessions(); else close(); });
    dlg.addEventListener('keydown', function (e) {
      if (viewer.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); step(-1); }
    });

    chipsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-kind]');
      if (!b || b.getAttribute('aria-pressed') === 'true') return;
      filter = b.getAttribute('data-kind');
      renderChips(cat); renderSessions(cat); renderFeed(cat);
      body.scrollTop = 0;
    });

    // One delegated handler for every photo button and "See all" tile
    sessionsEl.addEventListener('click', function (e) {
      var more = e.target.closest('.g-more');
      if (more) {
        var sec = more.closest('.g-session');
        sec.classList.remove('is-collapsed');
        more.remove();
        var first = sec.querySelector('.g-extra');
        if (first) first.focus({ preventScroll: true });
        return;
      }
      var b = e.target.closest('[data-n]');
      if (b) openViewer(Number(b.getAttribute('data-n')));
    });

    feed.addEventListener('scroll', function () { hint.classList.add('is-gone'); }, { passive: true });

    // The two footer links close the gallery first so the page can scroll to them
    dlg.querySelectorAll('.gallery-foot a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (a.classList.contains('service-inquiry')) {
          var sel = document.getElementById('inquiry-service');
          if (sel) sel.value = 'Photography';
        }
        close(true);
      });
    });
  }

  function renderChips(c) {
    var kinds = kindsFor(c);
    if (kinds.length < 2) { chipsEl.hidden = true; chipsEl.innerHTML = ''; return; }
    var all = sessionsFor(c);
    function count(k) { return all.reduce(function (t, s) { return t + (k === 'All' || s.kind === k ? s.photos.length : 0); }, 0); }
    chipsEl.innerHTML = ['All'].concat(kinds).map(function (k) {
      return '<button type="button" class="g-chip" data-kind="' + esc(k) + '" aria-pressed="' + (filter === k) + '">' +
        esc(k) + ' <span class="g-chip-n">' + count(k) + '</span></button>';
    }).join('');
    chipsEl.hidden = false;
  }

  function thumb(c, n, extra) {
    var s = SIZES[c][n - 1];
    return '<button type="button" class="g-thumb' + (extra ? ' g-extra' : '') + '" data-n="' + n + '" aria-label="View ' + alt(c, n) + '">' +
      '<img src="' + src(c, n, true) + '" alt="" width="' + s[0] + '" height="' + s[1] + '" loading="lazy" decoding="async"></button>';
  }

  function renderSessions(c) {
    var list = visible(c), all = sessionsFor(c);
    var single = all.length === 1 && !all[0].title;
    order = [];
    list.forEach(function (s) { order.push(s.hero); s.photos.forEach(function (n) { if (n !== s.hero) order.push(n); }); });
    sessionsEl.innerHTML = list.map(function (s, k) {
      var hs = SIZES[c][s.hero - 1];
      var rest = s.photos.filter(function (n) { return n !== s.hero; });
      var collapse = !single && rest.length > PREVIEW + 1;
      var tiles = rest.map(function (n, j) { return thumb(c, n, collapse && j >= PREVIEW); }).join('');
      if (collapse) tiles += '<button type="button" class="g-more"><span class="g-more-n">+' + (rest.length - PREVIEW) + '</span>See all ' + rest.length + '</button>';
      var label = pad(k + 1) + (s.kind ? ' \u00b7 ' + esc(s.kind.toUpperCase()) : '') + ' \u00b7 ' + s.photos.length + ' PHOTOS';
      var head = single ? '' :
        '<header class="g-session-head"><p class="g-eyebrow">' + label + '</p>' +
          '<h3>' + esc(s.title) + '</h3>' + (s.line ? '<p>' + esc(s.line) + '</p>' : '') + '</header>';
      return '<section class="g-session' + (single ? ' g-session--all' : '') + (collapse ? ' is-collapsed' : '') + '"' +
        (single ? '' : ' aria-label="' + esc(s.title) + '"') + '>' + head +
        '<div class="g-session-media">' +
          '<button type="button" class="g-hero" data-n="' + s.hero + '" aria-label="View ' + alt(c, s.hero) + '">' +
            '<img src="' + src(c, s.hero, false) + '" alt="" width="' + hs[0] + '" height="' + hs[1] + '"' + (k ? ' loading="lazy"' : '') + ' decoding="async"></button>' +
          (rest.length ? '<div class="g-grid">' + tiles + '</div>' : '') +
        '</div></section>';
    }).join('');
  }

  function renderFeed(c) {
    if (observer) observer.disconnect();
    feed.innerHTML = order.map(function (n, p) {
      var s = SIZES[c][n - 1];
      return '<figure class="gallery-slide" data-p="' + p + '"><img src="' + src(c, n, false) + '" alt="' + alt(c, n) + '" width="' + s[0] + '" height="' + s[1] + '" loading="lazy" decoding="async"></figure>';
    }).join('');
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setPos(Number(en.target.getAttribute('data-p'))); });
      }, { root: feed, threshold: 0.55 });
      feed.querySelectorAll('.gallery-slide').forEach(function (f) { observer.observe(f); });
    }
  }

  function setPos(p) {
    pos = p;
    counter.textContent = pad(p + 1) + ' / ' + pad(order.length);
  }

  function open(c, trigger) {
    if (!SIZES[c]) return;
    if (!dlg) build();
    cat = c; filter = 'All'; pos = 0; opener = trigger || document.activeElement;
    var total = SIZES[c].length, n = sessionsFor(c).length;
    titleEl.textContent = META[c].title;
    lineEl.textContent = META[c].line + ' ' + (n > 1 ? n + ' sessions \u00b7 ' : '') + total + ' photos.';
    pricingLink.setAttribute('href', META[c].pricing);
    renderChips(c); renderSessions(c); renderFeed(c);
    viewer.hidden = true; body.hidden = false;
    document.documentElement.classList.add('gallery-open');
    dlg.showModal();
    body.scrollTop = 0;
  }

  function openViewer(n) {
    var p = order.indexOf(n); if (p < 0) p = 0;
    body.hidden = true; viewer.hidden = false;
    hint.classList.remove('is-gone');
    setPos(p);
    var slide = feed.querySelector('[data-p="' + p + '"]');
    if (slide) feed.scrollTop = slide.offsetTop;
    feed.focus({ preventScroll: true });
  }

  function step(d) {
    var p = Math.max(0, Math.min(order.length - 1, pos + d));
    var slide = feed.querySelector('[data-p="' + p + '"]');
    if (!slide) return;
    feed.scrollTo({ top: slide.offsetTop, behavior: reduceMotion ? 'auto' : 'smooth' });
    setPos(p);
  }

  function showSessions() {
    viewer.hidden = true; body.hidden = false;
    var t = sessionsEl.querySelector('[data-n="' + order[pos] + '"]');
    if (t && t.classList.contains('g-extra')) {
      var sec = t.closest('.g-session');
      sec.classList.remove('is-collapsed');
      var more = sec.querySelector('.g-more'); if (more) more.remove();
    }
    if (t) { t.scrollIntoView({ block: 'center' }); t.focus({ preventScroll: true }); }
  }

  function close(keepPosition) {
    if (!dlg || !dlg.open) return;
    dlg.close();
    document.documentElement.classList.remove('gallery-open');
    if (location.hash.indexOf('#gallery-') === 0) history.replaceState(null, '', location.pathname + location.search);
    if (!keepPosition && opener && opener.focus) opener.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-gallery]') : null;
    if (!t) return;
    e.preventDefault();
    open(t.getAttribute('data-gallery'), t);
  });

  function fromHash() {
    var m = /^#gallery-(\w+)$/.exec(location.hash);
    if (m && SIZES[m[1]]) open(m[1]);
  }
  window.addEventListener('hashchange', fromHash);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fromHash); else fromHash();
})();
