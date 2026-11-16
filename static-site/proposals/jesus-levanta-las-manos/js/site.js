/* Jesús Levanta Las Manos - look picker.
   CONTENT is shaped like the future Finesse OS tables (services, messages, ministries, pastors, settings),
   so the admin portal can replace this object with live data without touching the layout. */

var CONTENT = {
  settings: {
    name: 'Jesús Levanta Las Manos',
    kicker: { es: 'Ministerio Misionero', en: 'Missionary Ministry' },
    city: 'Miami, Florida',
    tagline: { es: 'Somos una iglesia que inspira a otros a seguir a Jesús.', en: 'We are a church that inspires others to follow Jesus.' },
    address: { es: 'Dirección por confirmar', en: 'Address to be confirmed' },
    phone: { es: 'Teléfono por confirmar', en: 'Phone to be confirmed' },
    facebook: 'https://www.facebook.com/manitassanadoras.ministers',
    instagram: 'https://www.instagram.com/jesuslevanta/',
    igHandle: '@jesuslevanta'
  },
  services: [
    { day: { es: 'Domingo', en: 'Sunday' }, time: '11:00 AM', main: true },
    { day: { es: 'Martes', en: 'Tuesday' }, time: '7:30 PM' },
    { day: { es: 'Miércoles', en: 'Wednesday' }, time: '9:00 AM' },
    { day: { es: 'Viernes', en: 'Friday' }, time: '7:30 PM' }
  ],
  pastors: [
    { name: 'Huascar Contreras', role: { es: 'Pastor', en: 'Pastor' } },
    { name: 'Consuelo Contreras', role: { es: 'Pastora', en: 'Pastor' } }
  ],
  messages: [
    { title: { es: 'Dios quiere tu corazón', en: 'God wants your heart' }, ref: { es: 'Proverbios 23:26', en: 'Proverbs 23:26' }, by: 'Pastor Huascar Contreras' },
    { title: { es: 'Yo era ciego, pero ahora veo', en: 'I was blind, but now I see' }, ref: { es: 'Juan 9:25', en: 'John 9:25' }, by: 'Pastor Huascar Contreras' },
    { title: { es: 'Un pueblo que se humilla a Dios', en: 'A people who humble themselves before God' }, ref: { es: '2 Crónicas 7:14', en: '2 Chronicles 7:14' }, by: 'Pastora Consuelo Contreras' },
    { title: { es: 'Somos uno en Cristo Jesús', en: 'We are one in Christ Jesus' }, ref: { es: 'Gálatas 3:28', en: 'Galatians 3:28' }, by: 'Pastor Huascar Contreras' }
  ],
  ministries: [
    { icon: 'hands', name: { es: 'Misión en las calles', en: 'Street mission' }, text: { es: 'Llevamos alimento y la Palabra a quienes más lo necesitan en las calles de Miami.', en: 'We bring food and the Word to those who need it most on the streets of Miami.' } },
    { icon: 'book', name: { es: 'Caminando con Jesús', en: 'Walking with Jesus' }, text: { es: 'Estudio bíblico para crecer en la fe, la mayordomía y la vida en la iglesia.', en: 'Bible study to grow in faith, stewardship and church life.' } },
    { icon: 'flame', name: { es: 'Culto de Poder', en: 'Power Service' }, text: { es: 'Noches de adoración, oración y Palabra bajo la presencia del Espíritu Santo.', en: 'Nights of worship, prayer and the Word in the presence of the Holy Spirit.' } },
    { icon: 'shield', name: { es: 'Servicio de Caballeros', en: 'Men’s Service' }, text: { es: 'Hombres que se levantan juntos en el nombre de Jesús.', en: 'Men rising together in the name of Jesus.' } },
    { icon: 'play', name: { es: 'En vivo', en: 'Live stream' }, text: { es: 'Cada servicio se transmite en vivo por Facebook para que nadie se quede fuera.', en: 'Every service streams live on Facebook so no one is left out.' } }
  ]
};

/* Hero copy and character per look */
var LOOKS = {
  luz: {
    note: { es: 'Luz: claro, cálido y familiar, estilo Lakewood. Fácil de leer para todas las edades.', en: 'Luz: bright, warm and family friendly, Lakewood style. Easy to read at any age.' },
    h1: { es: 'Bienvenido a casa.<br><em>Aquí hay lugar para ti.</em>', en: 'Welcome home.<br><em>There is a place for you here.</em>' },
    divider: 'M0,81 L0,40 C360,-10 1080,-10 1440,40 L1440,81 Z'
  },
  fuego: {
    note: { es: 'Fuego: fondo blanco, tipografía gigante y un degradado vivo. Energía de conferencia.', en: 'Fuego: white background, giant type and a vivid gradient. Conference energy.' },
    h1: { es: 'Jesús<br>levanta<br><em>las manos</em>', en: 'Jesus<br>lifts<br><em>the hands</em>' },
    divider: 'M0,0 L1440,80 L1440,81 L0,81 Z'
  },
  calle: {
    note: { es: 'Calle: editorial y humano, centrado en la misión en las calles de Miami.', en: 'Calle: editorial and human, built around the street mission in Miami.' },
    h1: { es: 'Una iglesia con las manos <em>abiertas</em>.', en: 'A church with <em>open</em> hands.' },
    divider: 'M0,81 L0,30 C480,90 960,90 1440,30 L1440,81 Z'
  }
};

/* Color palettes per look. Each has a light and a dark set; "art" tints photo slots and message tiles.
   In Finesse OS these become the theme options in the Site Editor. */
var PALETTES = {
  luz: [
    { id: 'violeta', name: { es: 'Violeta', en: 'Violet' }, sw: ['#5b3fd6', '#c9952b'], art: '#5b3fd6',
      light: { bg: '#fffdf8', bg2: '#f3eefb', ink: '#1c1637', muted: '#5b5674', accent: '#5b3fd6', 'accent-ink': '#ffffff', line: 'rgba(28,22,55,.12)', card: '#ffffff', gold: '#b88420', 'band-a': '#5b3fd6', 'band-b': '#2a1a78' },
      dark: { bg: '#141026', bg2: '#1d1736', ink: '#f4f1ff', muted: '#bdb6da', accent: '#a998ff', 'accent-ink': '#17112e', line: 'rgba(255,255,255,.16)', card: '#251e44', gold: '#e2b857', 'band-a': '#6a4fe0', 'band-b': '#3a2a98' } },
    { id: 'coral', name: { es: 'Coral', en: 'Coral' }, sw: ['#c23a1f', '#f0a23a'], art: '#d9482b',
      light: { bg: '#fffaf5', bg2: '#fdeee4', ink: '#2b1612', muted: '#6b524b', accent: '#c23a1f', 'accent-ink': '#ffffff', line: 'rgba(43,22,18,.13)', card: '#ffffff', gold: '#b8791a', 'band-a': '#dc5230', 'band-b': '#9c2748' },
      dark: { bg: '#1c110e', bg2: '#281813', ink: '#fff3ec', muted: '#d6bbb0', accent: '#ff9072', 'accent-ink': '#2b1109', line: 'rgba(255,255,255,.16)', card: '#34211a', gold: '#f0b85a', 'band-a': '#dc5230', 'band-b': '#9c2748' } },
    { id: 'real', name: { es: 'Azul real', en: 'Royal blue' }, sw: ['#1f3a8a', '#c9952b'], art: '#1f3a8a',
      light: { bg: '#fdfcf8', bg2: '#edf1fa', ink: '#101a3a', muted: '#4c5676', accent: '#1f3a8a', 'accent-ink': '#ffffff', line: 'rgba(16,26,58,.13)', card: '#ffffff', gold: '#b07d18', 'band-a': '#23429c', 'band-b': '#0f1f52' },
      dark: { bg: '#0e1430', bg2: '#151d44', ink: '#f1f4ff', muted: '#b9c1df', accent: '#f0c860', 'accent-ink': '#1a1405', line: 'rgba(255,255,255,.16)', card: '#1d2754', gold: '#f0c860', 'band-a': '#2c4fb8', 'band-b': '#162a6e' } }
  ],
  fuego: [
    { id: 'fuego', name: { es: 'Fuego', en: 'Fire' }, sw: ['#6a1fd0', '#f0692a'], art: '#6a1fd0',
      light: { bg: '#ffffff', bg2: '#f6f1ff', ink: '#1b0b3a', muted: '#54487a', accent: '#6a1fd0', 'accent-ink': '#ffffff', line: 'rgba(27,11,58,.16)', card: '#ffffff', g1: '#6a1fd0', g2: '#d2307a', g3: '#f0692a' },
      dark: { bg: '#130926', bg2: '#1d103a', ink: '#ffffff', muted: '#d2c7ee', accent: '#c9a0ff', 'accent-ink': '#1a0b33', line: 'rgba(255,255,255,.24)', card: '#25144c', g1: '#7b33e0', g2: '#d2307a', g3: '#f0692a' } },
    { id: 'amanecer', name: { es: 'Amanecer', en: 'Sunrise' }, sw: ['#c8321a', '#f5b323'], art: '#c8321a',
      light: { bg: '#ffffff', bg2: '#fff4ea', ink: '#2a0f0a', muted: '#6d4a40', accent: '#b92c16', 'accent-ink': '#ffffff', line: 'rgba(42,15,10,.16)', card: '#ffffff', g1: '#c8321a', g2: '#ee6a24', g3: '#f0a51c' },
      dark: { bg: '#1a0c08', bg2: '#27130d', ink: '#ffffff', muted: '#e0c4b8', accent: '#ffa27a', 'accent-ink': '#2a0f0a', line: 'rgba(255,255,255,.24)', card: '#341a12', g1: '#d43a20', g2: '#ee6a24', g3: '#f0a51c' } },
    { id: 'real', name: { es: 'Real', en: 'Royal' }, sw: ['#2740d8', '#e0368c'], art: '#2740d8',
      light: { bg: '#ffffff', bg2: '#eef2ff', ink: '#0f1640', muted: '#485080', accent: '#2740d8', 'accent-ink': '#ffffff', line: 'rgba(15,22,64,.16)', card: '#ffffff', g1: '#2740d8', g2: '#7a2fd6', g3: '#e0368c' },
      dark: { bg: '#0b1030', bg2: '#131a48', ink: '#ffffff', muted: '#c4cbee', accent: '#a9b8ff', 'accent-ink': '#0f1640', line: 'rgba(255,255,255,.24)', card: '#1b2360', g1: '#3a55ea', g2: '#8a3fe0', g3: '#e0368c' } }
  ],
  calle: [
    { id: 'terracota', name: { es: 'Terracota', en: 'Terracotta' }, sw: ['#b4472a', '#ebe0cd'], art: '#b4472a',
      light: { bg: '#f6efe3', bg2: '#ebe0cd', ink: '#1d1814', muted: '#5f554b', accent: '#b4472a', 'accent-ink': '#fff7ee', line: 'rgba(29,24,20,.18)', card: '#fffaf1' },
      dark: { bg: '#1b1612', bg2: '#26201a', ink: '#f6efe3', muted: '#c9bcaa', accent: '#ec8a68', 'accent-ink': '#24100a', line: 'rgba(246,239,227,.2)', card: '#2f2821' } },
    { id: 'olivo', name: { es: 'Olivo', en: 'Olive' }, sw: ['#55652a', '#e6e2cc'], art: '#55652a',
      light: { bg: '#f5f1e4', bg2: '#e6e2cc', ink: '#1c1e14', muted: '#585a48', accent: '#55652a', 'accent-ink': '#fbf9ee', line: 'rgba(28,30,20,.18)', card: '#fdfbf0' },
      dark: { bg: '#171910', bg2: '#20231a', ink: '#f1eede', muted: '#c2c3ad', accent: '#bccb7c', 'accent-ink': '#1a1d0c', line: 'rgba(241,238,222,.2)', card: '#2a2d22' } },
    { id: 'vino', name: { es: 'Vino', en: 'Wine' }, sw: ['#7b1e3a', '#eddcd3'], art: '#7b1e3a',
      light: { bg: '#f8f0ea', bg2: '#eddcd3', ink: '#23121a', muted: '#654b55', accent: '#7b1e3a', 'accent-ink': '#fff4f0', line: 'rgba(35,18,26,.18)', card: '#fff8f4' },
      dark: { bg: '#1c1014', bg2: '#28171d', ink: '#f8ece8', muted: '#cdb6bd', accent: '#ea93aa', 'accent-ink': '#2a0c16', line: 'rgba(248,236,232,.2)', card: '#33212a' } }
  ]
};

var UI = {
  nav: [
    { href: '#sec-about', es: 'Nosotros', en: 'About' },
    { href: '#sec-messages', es: 'Mensajes', en: 'Messages' },
    { href: '#sec-ministries', es: 'Ministerios', en: 'Ministries' },
    { href: '#sec-give', es: 'Dar', en: 'Give' }
  ],
  plan: { es: 'Planifica tu visita', en: 'Plan your visit' },
  watch: { es: 'Ver en vivo', en: 'Watch live' },
  timesTitle: { es: 'Horario de servicios', en: 'Service times' },
  aboutEyebrow: { es: 'Quiénes somos', en: 'Who we are' },
  aboutTitle: { es: 'Una familia que camina con Jesús', en: 'A family walking with Jesus' },
  aboutText: { es: 'Somos un ministerio misionero en Miami. Creemos en el poder del nombre de Jesús, en una Palabra que transforma y en una iglesia que sale a servir. No importa de qué país vengas: somos uno en Cristo. Ven con tu familia, te esperamos.', en: 'We are a missionary ministry in Miami. We believe in the power of the name of Jesus, in a Word that transforms and in a church that goes out to serve. No matter what country you come from, we are one in Christ. Bring your family, we are waiting for you.' },
  pastorsTitle: { es: 'Nuestros pastores', en: 'Our pastors' },
  photoSoon: { es: 'Foto', en: 'Photo' },
  msgEyebrow: { es: 'Mensajes recientes', en: 'Recent messages' },
  msgTitle: { es: 'Palabra que edifica', en: 'A Word that builds' },
  msgCta: { es: 'Ver todos en Facebook', en: 'See all on Facebook' },
  minEyebrow: { es: 'Ministerios', en: 'Ministries' },
  minTitle: { es: 'Hay un lugar para ti', en: 'There is a place for you' },
  missionEyebrow: { es: 'Deuteronomio 15:7', en: 'Deuteronomy 15:7' },
  missionTitle: { es: 'No cierres tu mano al necesitado.', en: 'Do not close your hand to those in need.' },
  missionText: { es: 'Por eso salimos a las calles de Miami con platos de comida, oración y esperanza. Cada ofrenda y cada voluntario llega a alguien que lo necesita.', en: 'That is why we go out to the streets of Miami with meals, prayer and hope. Every gift and every volunteer reaches someone in need.' },
  missionCta: { es: 'Quiero servir', en: 'I want to serve' },
  giveTitle: { es: 'Dar', en: 'Give' },
  giveText: { es: 'Tu generosidad sostiene la misión en las calles y la obra de la iglesia.', en: 'Your generosity sustains the street mission and the work of the church.' },
  giveCta: { es: 'Dar en línea', en: 'Give online' },
  giveNote: { es: 'Las ofrendas en línea se pueden activar cuando la iglesia lo decida.', en: 'Online giving can be turned on whenever the church decides.' },
  prayTitle: { es: 'Petición de oración', en: 'Prayer request' },
  prayName: { es: 'Tu nombre', en: 'Your name' },
  prayMsg: { es: '¿Cómo podemos orar por ti?', en: 'How can we pray for you?' },
  prayCta: { es: 'Enviar petición', en: 'Send request' },
  prayDone: { es: 'Vista previa: en el sitio real, esta petición llega al equipo pastoral.', en: 'Preview only: on the live site this request goes to the pastoral team.' },
  visitEyebrow: { es: 'Visítanos', en: 'Visit us' },
  visitTitle: { es: 'Te esperamos esta semana', en: 'We are waiting for you this week' },
  mapSoon: { es: 'Mapa con direcciones', en: 'Map with directions' },
  follow: { es: 'Síguenos', en: 'Follow us' },
  rights: { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
  crafted: { es: 'Creado por', en: 'Crafted by' },
  palette: { es: 'Colores', en: 'Colors' },
  intro: { es: 'Propuesta de sitio web para Jesús Levanta Las Manos. Elija un diseño y sus colores, y pruebe el idioma y el modo oscuro dentro de la página.', en: 'Website proposal for Jesús Levanta Las Manos. Pick a design and its colors, and try the language and dark mode switches inside the page.' },
  want: { es: 'Quiero este', en: 'I want this one' },
  chooseEyebrow: { es: 'Su elección', en: 'Your choice' },
  chooseTitle: { es: '¿Le gusta este diseño?', en: 'Like this design?' },
  chooseDesign: { es: 'Diseño', en: 'Design' },
  chooseDark: { es: 'modo oscuro', en: 'dark mode' },
  chooseWa: { es: 'Enviar por WhatsApp', en: 'Send by WhatsApp' },
  chooseSms: { es: 'Enviar por mensaje de texto', en: 'Send by text message' },
  chooseNote: { es: 'Esta es una vista previa. Las fotos, la dirección y el teléfono se agregan con la información de la iglesia.', en: 'This is a preview. Photos, address and phone are added with the church\u2019s information.' },
  darkOn: { es: 'Activar modo oscuro', en: 'Turn on dark mode' },
  darkOff: { es: 'Volver a modo claro', en: 'Back to light mode' },
  langLabel: { es: 'Idioma', en: 'Language' }
};

var ICONS = {
  hands: '<path d="M7 20c-2-1.5-3-3.6-3-6V8.5a1.5 1.5 0 0 1 3 0V12l1.2-6.3a1.5 1.5 0 0 1 3 .5L10.5 12"/><path d="M17 20c2-1.5 3-3.6 3-6V8.5a1.5 1.5 0 0 0-3 0V12l-1.2-6.3a1.5 1.5 0 0 0-3 .5L13.5 12"/><path d="M10.5 12c.3 2.5-.2 5-1.5 8M13.5 12c-.3 2.5.2 5 1.5 8"/>',
  book: '<path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.500-2 8-2v-13c-3.500 0-6 .5-8 2z"/><path d="M12 6.5v13"/>',
  flame: '<path d="M12 21c-3.600 0-6-2.400-6-5.600 0-2.600 1.700-4.300 3-6 .9-1.200 1.500-2.600 1.400-4.400 2.800 1.200 4.200 3.600 4.200 5.600.9-.5 1.500-1.300 1.700-2.300C17.500 10 18 12.200 18 15.400 18 18.600 15.600 21 12 21z"/>',
  shield: '<path d="M12 3l7 2.500v5.500c0 4.500-2.900 8-7 10-4.100-2-7-5.500-7-10V5.500L12 3z"/><path d="M12 8v7M9 11h6"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.500v7l6-3.500-6-3.500z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s7-6.200 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
  phone: '<path d="M5 4h4l1.500 4.500L8 10a12 12 0 0 0 6 6l1.500-2.500L20 15v4a1.500 1.500 0 0 1-1.500 1.500C10.500 20.500 3.500 13.500 3.500 5.500A1.500 1.500 0 0 1 5 4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.500l3.500 2"/>',
  moon: '<path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2M12 19.500v2M2.500 12h2M19.500 12h2M5.300 5.300l1.400 1.400M17.300 17.300l1.400 1.400M5.300 18.700l1.400-1.400M17.300 6.700l1.400-1.400"/>'
};

var lang = 'es';
var look = 'luz';
var dark = false;
var palIdx = { luz: 0, fuego: 0, calle: 0 };

function t(o) { return (o && typeof o === 'object') ? (o[lang] || o.es) : o; }
function ic(n) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>'; }
function divider(to) { return '<svg class="divider to-' + to + '" viewBox="0 0 1440 81" preserveAspectRatio="none" aria-hidden="true"><path d="' + LOOKS[look].divider + '"/></svg>'; }

function render() {
  var s = CONTENT.settings, L = LOOKS[look], h = '';

  h += '<header class="nav"><a class="nav-brand" href="#top"><img src="images/logo-sm.webp" alt="' + s.name + '" width="44" height="44"><span><small>' + t(s.kicker) + '</small>' + s.name + '</span></a>';
  h += '<nav class="nav-links">' + UI.nav.map(function (n) { return '<a href="' + n.href + '">' + n[lang] + '</a>'; }).join('') + '</nav>';
  h += '<div class="nav-tools"><div class="lang" role="group" aria-label="' + t(UI.langLabel) + '" data-on="' + lang + '"><span class="lang-thumb" aria-hidden="true"></span>';
  h += '<button type="button" data-lang="es" aria-pressed="' + (lang === 'es') + '">ES</button><button type="button" data-lang="en" aria-pressed="' + (lang === 'en') + '">EN</button></div>';
  h += '<button type="button" class="mode" data-mode aria-pressed="' + dark + '" aria-label="' + t(dark ? UI.darkOff : UI.darkOn) + '" title="' + t(dark ? UI.darkOff : UI.darkOn) + '">' + ic(dark ? 'sun' : 'moon') + '</button></div>';
  h += '<a class="btn btn-sm nav-cta" href="#sec-visit">' + t(UI.plan) + '</a></header>';

  h += '<section class="hero" id="top"><div class="hero-glow" aria-hidden="true"></div><div class="hero-in">';
  h += '<div class="hero-copy"><p class="script">' + t(s.kicker) + '</p><h1>' + t(L.h1) + '</h1><p class="lede">' + t(s.tagline) + '</p>';
  h += '<div class="cta-row"><a class="btn" href="#sec-visit">' + t(UI.plan) + ic('arrow') + '</a><a class="btn btn-ghost" href="' + s.facebook + '" target="_blank" rel="noopener">' + ic('play') + t(UI.watch) + '</a></div></div>';
  h += '<div class="hero-mark"><div class="rays" aria-hidden="true"></div><img src="images/logo.webp" alt="" width="420" height="420"></div>';
  h += '</div>';
  h += '<div class="ticker" aria-hidden="true"><div class="ticker-track">' + [0, 1].map(function () { return CONTENT.services.map(function (v) { return '<span>' + t(v.day) + ' ' + v.time + '</span><i></i>'; }).join(''); }).join('') + '</div></div>';
  h += '</section>';

  h += '<section class="times"><div class="wrap"><h2 class="times-title">' + ic('clock') + t(UI.timesTitle) + '</h2><div class="times-grid">';
  h += CONTENT.services.map(function (v) { return '<div class="time' + (v.main ? ' main' : '') + '"><span>' + t(v.day) + '</span><strong>' + v.time + '</strong></div>'; }).join('');
  h += '</div></div></section>';

  h += divider(2);
  h += '<section class="sec alt" id="sec-about"><div class="wrap about"><div class="about-copy"><p class="eyebrow">' + t(UI.aboutEyebrow) + '</p><h2>' + t(UI.aboutTitle) + '</h2><p class="body">' + t(UI.aboutText) + '</p></div>';
  h += '<div class="pastors"><p class="eyebrow">' + t(UI.pastorsTitle) + '</p><div class="pastor-grid">';
  h += CONTENT.pastors.map(function (p) { return '<figure class="pastor"><div class="photo"><span>' + t(UI.photoSoon) + '</span></div><figcaption><strong>' + p.name + '</strong><span>' + t(p.role) + '</span></figcaption></figure>'; }).join('');
  h += '</div></div></div></section>';

  h += divider(1);
  h += '<section class="sec" id="sec-messages"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">' + t(UI.msgEyebrow) + '</p><h2>' + t(UI.msgTitle) + '</h2></div><a class="link" href="' + s.facebook + '" target="_blank" rel="noopener">' + t(UI.msgCta) + ic('arrow') + '</a></div><div class="msg-grid">';
  h += CONTENT.messages.map(function (m, i) { return '<article class="msg"><div class="msg-art"><span class="msg-n">0' + (i + 1) + '</span>' + ic('play') + '</div><div class="msg-body"><span class="ref">' + t(m.ref) + '</span><h3>' + t(m.title) + '</h3><p>' + m.by + '</p></div></article>'; }).join('');
  h += '</div></div></section>';

  h += divider(2);
  h += '<section class="sec alt" id="sec-ministries"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">' + t(UI.minEyebrow) + '</p><h2>' + t(UI.minTitle) + '</h2></div></div><div class="min-grid">';
  h += CONTENT.ministries.map(function (m, i) { return '<article class="min"><span class="min-n">0' + (i + 1) + '</span><span class="min-ic">' + ic(m.icon) + '</span><h3>' + t(m.name) + '</h3><p>' + t(m.text) + '</p></article>'; }).join('');
  h += '</div></div></section>';

  h += '<section class="mission"><div class="wrap mission-in"><p class="eyebrow">' + t(UI.missionEyebrow) + '</p><h2>' + t(UI.missionTitle) + '</h2><p class="body">' + t(UI.missionText) + '</p><a class="btn" href="#sec-visit">' + t(UI.missionCta) + ic('arrow') + '</a></div></section>';

  h += '<section class="sec" id="sec-give"><div class="wrap duo"><div class="card give"><h2>' + t(UI.giveTitle) + '</h2><p class="body">' + t(UI.giveText) + '</p><a class="btn" href="#sec-give">' + t(UI.giveCta) + '</a><p class="fine">' + t(UI.giveNote) + '</p></div>';
  h += '<form class="card pray" id="prayForm"><h2>' + t(UI.prayTitle) + '</h2><label><span>' + t(UI.prayName) + '</span><input type="text" name="n" autocomplete="name"></label><label><span>' + t(UI.prayMsg) + '</span><textarea name="m" rows="3"></textarea></label><button class="btn" type="submit">' + t(UI.prayCta) + '</button><p class="fine" id="prayDone" hidden>' + t(UI.prayDone) + '</p></form></div></section>';

  h += divider(2);
  h += '<section class="sec alt" id="sec-visit"><div class="wrap visit"><div><p class="eyebrow">' + t(UI.visitEyebrow) + '</p><h2>' + t(UI.visitTitle) + '</h2><ul class="info">';
  h += '<li>' + ic('pin') + '<span><b>' + s.city + '</b><em class="tbd">' + t(s.address) + '</em></span></li>';
  h += '<li>' + ic('phone') + '<span><em class="tbd">' + t(s.phone) + '</em></span></li>';
  h += '<li>' + ic('clock') + '<span>' + CONTENT.services.map(function (v) { return t(v.day) + ' ' + v.time; }).join('<br>') + '</span></li></ul></div>';
  h += '<div class="map"><span>' + ic('pin') + t(UI.mapSoon) + '</span></div></div></section>';

  h += '<footer class="foot"><div class="wrap foot-in"><div class="foot-brand"><img src="images/logo-sm.webp" alt="" width="64" height="64"><div><small>' + t(s.kicker) + '</small><strong>' + s.name + '</strong><span>' + s.city + '</span></div></div>';
  h += '<div class="foot-links"><b>' + t(UI.follow) + '</b><a href="' + s.facebook + '" target="_blank" rel="noopener">Facebook</a><a href="' + s.instagram + '" target="_blank" rel="noopener">Instagram ' + s.igHandle + '</a></div></div>';
  h += '<div class="wrap foot-base"><span>&copy; 2026 ' + s.name + '. ' + t(UI.rights) + '</span><a href="https://finessemedia.pro" target="_blank" rel="noopener">' + t(UI.crafted) + ' Finesse Media</a></div></footer>';

  document.getElementById('site').innerHTML = h;
  document.documentElement.lang = lang;

  var f = document.getElementById('prayForm');
  f.addEventListener('submit', function (e) { e.preventDefault(); document.getElementById('prayDone').hidden = false; });
}

function applyTheme() {
  var P = PALETTES[look][palIdx[look]], set = dark ? P.dark : P.light, st = document.documentElement.style;
  ['bg', 'bg2', 'ink', 'muted', 'accent', 'accent-ink', 'line', 'card', 'gold', 'band-a', 'band-b', 'g1', 'g2', 'g3'].forEach(function (k) {
    if (set[k]) { st.setProperty('--' + k, set[k]); } else { st.removeProperty('--' + k); }
  });
  st.setProperty('--violet', P.art);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

function renderPalettes() {
  var el = document.getElementById('pickerPalettes');
  el.innerHTML = '<span class="pal-label">' + t(UI.palette) + '</span>' + PALETTES[look].map(function (p, i) {
    var on = i === palIdx[look];
    return '<button type="button" data-pal="' + i + '" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '"><i style="background:linear-gradient(135deg,' + p.sw[0] + ' 50%,' + p.sw[1] + ' 50%)"></i>' + t(p.name) + '</button>';
  }).join('');
}

var ANGEL = '14079609004';
function renderChoose() {
  var P = PALETTES[look][palIdx[look]], lookName = look.charAt(0).toUpperCase() + look.slice(1);
  var pick = t(UI.chooseDesign) + ' ' + lookName + ' \u00b7 ' + t(UI.palette) + ' ' + t(P.name) + (dark ? ' \u00b7 ' + t(UI.chooseDark) : '');
  var msg = lang === 'es'
    ? 'Hola Angel, vi la propuesta del sitio web para Jesús Levanta Las Manos. Me gusta el diseño ' + lookName + ' con los colores ' + t(P.name) + (dark ? ' en modo oscuro' : '') + '.'
    : 'Hi Angel, I saw the website proposal for Jesús Levanta Las Manos. I like the ' + lookName + ' design with the ' + t(P.name) + ' colors' + (dark ? ' in dark mode' : '') + '.';
  document.getElementById('introText').textContent = t(UI.intro);
  document.getElementById('pickerWant').textContent = t(UI.want);
  document.getElementById('chooseEyebrow').textContent = t(UI.chooseEyebrow);
  document.getElementById('chooseTitle').textContent = t(UI.chooseTitle);
  document.getElementById('choosePick').textContent = pick;
  document.getElementById('chooseNote').textContent = t(UI.chooseNote);
  var wa = document.getElementById('chooseWa'), sms = document.getElementById('chooseSms');
  wa.textContent = t(UI.chooseWa); wa.href = 'https://wa.me/' + ANGEL + '?text=' + encodeURIComponent(msg);
  sms.textContent = t(UI.chooseSms); sms.href = 'sms:+' + ANGEL + '?&body=' + encodeURIComponent(msg);
}

function refresh() { applyTheme(); renderPalettes(); render(); renderChoose(); }

function setLook(k) {
  if (!LOOKS[k]) k = 'luz';
  look = k;
  document.documentElement.setAttribute('data-look', k);
  Array.prototype.forEach.call(document.querySelectorAll('[data-pick]'), function (b) {
    var on = b.getAttribute('data-pick') === k;
    b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  refresh();
}

document.addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  if (b.hasAttribute('data-pick')) {
    var k = b.getAttribute('data-pick');
    if (location.hash !== '#' + k) { location.hash = k; } else { setLook(k); }
    window.scrollTo(0, 0);
  } else if (b.hasAttribute('data-pal')) {
    palIdx[look] = +b.getAttribute('data-pal'); refresh();
  } else if (b.hasAttribute('data-lang')) {
    lang = b.getAttribute('data-lang'); refresh();
  } else if (b.hasAttribute('data-want')) {
    document.getElementById('choose').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (b.hasAttribute('data-mode')) {
    dark = !dark; refresh();
    var m = document.querySelector('[data-mode]'); if (m) m.focus();
  }
});

/* In-page section links scroll without touching the hash (the hash is reserved for the chosen look) */
document.getElementById('site').addEventListener('click', function (e) {
  var a = e.target.closest('a[href^="#"]'); if (!a) return;
  e.preventDefault();
  var el = document.querySelector(a.getAttribute('href'));
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

window.addEventListener('hashchange', function () { setLook(location.hash.slice(1)); });
setLook(location.hash.slice(1) || 'luz');
