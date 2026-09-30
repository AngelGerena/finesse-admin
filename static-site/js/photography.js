/* Finesse Media — photography price guide requests.
   Submits to Netlify Forms (form name "price-guide"), then reveals the private
   guide link in the chosen language. Every request lands in Netlify > Forms
   and triggers the email notification configured there. */
(function () {
  'use strict';

  // Private, unlisted guide pages (noindex). Rename the slugs to rotate access.
  var GUIDES = {
    en: 'guides/collections-f7k2q9.html',
    es: 'guides/colecciones-f7k2q9.html'
  };
  var ANCHORS = {
    'Weddings': 'weddings',
    'Quinceañeras': 'quinceaneras',
    'Portraits & Maternity': 'portraits',
    'Senior & Graduation': 'seniors',
    'Headshots & Branding': 'headshots',
    'Events': 'events'
  };

  var form = document.getElementById('guide-form');
  if (!form) return;
  var result = document.getElementById('guide-result');
  var error = document.getElementById('guide-error');
  var link = document.getElementById('guide-link');
  var select = document.getElementById('guide-interest');
  var submit = form.querySelector('button[type="submit"]');

  // "Get the price guide" buttons on each card preselect that collection.
  document.querySelectorAll('[data-guide]').forEach(function (button) {
    button.addEventListener('click', function () {
      select.value = button.getAttribute('data-guide');
      document.getElementById('price-guide').scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(function () { document.getElementById('guide-name').focus({ preventScroll: true }); }, 600);
    });
  });

  function encode(data) {
    return Array.from(data.entries()).map(function (pair) {
      return encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]);
    }).join('&');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var data = new FormData(form);
    var lang = data.get('language') === 'es' ? 'es' : 'en';
    var anchor = ANCHORS[data.get('interest')] || '';
    error.hidden = true;
    submit.disabled = true;
    submit.firstChild.textContent = lang === 'es' ? 'Enviando… ' : 'Sending… ';

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(data)
    }).then(function (response) {
      if (!response.ok) throw new Error('Form request failed');
      link.href = GUIDES[lang] + (anchor ? '#' + anchor : '');
      link.firstChild.textContent = lang === 'es' ? 'Ver mi guía de precios ' : 'Open my price guide ';
      document.getElementById('guide-result-title').textContent = lang === 'es' ? 'Tu guía está lista.' : 'Your guide is ready.';
      document.getElementById('guide-result-copy').textContent = lang === 'es'
        ? 'Gracias. Guarda este enlace; también te contactaremos personalmente.'
        : 'Thank you. Bookmark this link. I\u2019ll also follow up with you personally.';
      form.hidden = true;
      result.hidden = false;
      link.focus();
    }).catch(function () {
      error.hidden = false;
      submit.disabled = false;
      submit.firstChild.textContent = 'Send me the price guide ';
    });
  });
})();

/* Date hint: the wrapper shows "Choose a date" until a date is picked or the field is focused */
(function () {
  var wrap = document.querySelector('.guide-date-wrap');
  var input = wrap && wrap.querySelector('input[type="date"]');
  if (!input) return;
  function sync() { wrap.classList.toggle('is-empty', !input.value && document.activeElement !== input); }
  ['input', 'change', 'focus', 'blur'].forEach(function (ev) { input.addEventListener(ev, sync); });
  var form = input.form; if (form) form.addEventListener('reset', function () { setTimeout(sync, 0); });
  sync();
})();
