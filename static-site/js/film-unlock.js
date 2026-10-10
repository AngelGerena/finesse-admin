/* Finesse Media — iPhone video unlock.
   Safari on iPhone (especially in Low Power Mode) will not prepare a video for scrubbing
   until the visitor has interacted with the page. On the first touch or click anywhere,
   briefly play and pause each scroll film so its frames become available. Runs until both
   films are ready, then removes itself. Never shows or changes anything on screen. */
(function () {
  'use strict';
  var ids = ['lens-film', 'digital-film'];
  function films() { return ids.map(function (id) { return document.getElementById(id); }).filter(Boolean); }
  function prime(v) {
    if (!v.src || v.readyState >= 2) return;
    try {
      var p = v.play();
      if (p && p.then) p.then(function () { v.pause(); }).catch(function () {});
      else v.pause();
    } catch (e) { /* ignore */ }
    if (v.readyState < 1) { try { v.load(); } catch (e) { /* ignore */ } }
  }
  function onGesture(e) {
    // Never interfere with the buttons that start the automatic camera or studio playback
    if (e && e.target && e.target.closest && e.target.closest('.play-journey, .enter-studio, #stop-playback')) return;
    var list = films();
    list.forEach(prime);
    var pending = list.some(function (v) { return !v.src || v.readyState < 2; });
    if (!pending) {
      ['touchend', 'click', 'keydown'].forEach(function (t) { document.removeEventListener(t, onGesture, true); });
    }
  }
  ['touchend', 'click', 'keydown'].forEach(function (t) { document.addEventListener(t, onGesture, { capture: true, passive: true }); });
})();
