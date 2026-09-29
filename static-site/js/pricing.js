/* Finesse Media — pricing plan cards on phones: dots follow the swipe,
   tapping a dot scrolls to that plan, and the list opens on "Most chosen". */
(function () {
  'use strict';
  var track = document.querySelector('.cmp-cards');
  if (!track) return;
  var cards = Array.prototype.slice.call(track.querySelectorAll('.cmp-card'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-plan-dot]'));
  function mark(i) { dots.forEach(function (d, n) { if (n === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); }); }
  function go(i, smooth) {
    var card = cards[i]; if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0), behavior: smooth ? 'smooth' : 'auto' });
  }
  dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i, true); mark(i); }); });
  var ticking = false;
  track.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var best = 0, dist = Infinity, left = track.getBoundingClientRect().left;
      cards.forEach(function (c, n) { var d = Math.abs(c.getBoundingClientRect().left - left); if (d < dist) { dist = d; best = n; } });
      mark(best);
    });
  }, { passive: true });
  // Open on the highlighted plan once the cards are laid out.
  var start = cards.findIndex(function (c) { return c.classList.contains('is-pop'); });
  if (window.matchMedia('(max-width: 900px)').matches && start > 0) {
    window.requestAnimationFrame(function () { go(start, false); mark(start); });
  }
})();
