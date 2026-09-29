/* Finesse Media — website pricing tracks (build 20260928-35).
   The toggle switches between the small business and established business tracks.
   Each plan button pre-fills the contact form with the plan the visitor picked. */
(function () {
  'use strict';
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.track-toggle [data-track]'));
  if (!buttons.length) return;
  function show(track) {
    buttons.forEach(function (b) {
      var on = b.getAttribute('data-track') === track;
      b.setAttribute('aria-pressed', String(on));
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-track')); });
  });

  // Plan buttons: the site already sets the service dropdown from data-interest.
  // Add the chosen plan to the message box if the visitor hasn't typed anything yet.
  document.querySelectorAll('.plan-cta[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () {
      var msg = document.getElementById('inquiry-message');
      if (msg && !msg.value.trim()) msg.value = 'I am interested in ' + a.getAttribute('data-plan') + '.';
    });
  });
})();
