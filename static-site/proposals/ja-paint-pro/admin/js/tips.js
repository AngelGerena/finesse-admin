/* JA Paint Pro admin: guided tips.
   1) Tip trails: the first time a page is opened, a short trail of tips walks
      through it one step at a time (breadcrumb dots show where you are).
   2) Button help: on a computer, resting the mouse on a button explains it.
   Both can be switched off from the help button in the top bar or in Settings.
   Loaded before admin.js. Listens for the "ja:render" event admin.js fires. */
(function () {
  "use strict";
  var KEY_ON = "ja-tips-on", KEY_SEEN = "ja-tips-seen";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function isOn() { return store(KEY_ON) !== "0"; }
  /* tips are remembered per person, so Javier and Xiomara each get the full tour */
  function seenKey() { var u = window.JA_USER ? window.JA_USER() : ""; return KEY_SEEN + (u ? "-" + u.toLowerCase() : ""); }
  function seen() { try { return JSON.parse(store(seenKey()) || "[]"); } catch (e) { return []; } }
  function markSeen(v) { var s = seen(); if (s.indexOf(v) < 0) { s.push(v); store(seenKey(), JSON.stringify(s)); } }
  var lang = "en";
  function T(pair) { var n = window.JA_USER ? window.JA_USER() : "Javier"; return (lang === "es" ? pair[1] : pair[0]).replace("{name}", n); }

  /* ---------- tip trails, one per page ---------- */
  var TRAILS = {
    dashboard: [
      { sel: null, t: ["Welcome to your admin, {name}", "Te damos la bienvenida, {name}"],
        d: ["This is where you run JA Paint Pro: requests, quotes, jobs and your AI helpers. Here's a quick tour. You can turn these tips off anytime.",
            "Aquí manejas JA Paint Pro: solicitudes, cotizaciones, trabajos y tus ayudantes de IA. Te damos un recorrido rápido. Puedes apagar estos consejos cuando quieras."] },
      { sel: ".lang", t: ["English or Spanish", "Inglés o español"],
        d: ["Tap EN or ES to switch the whole admin. Your choice is saved for next time.", "Toca EN o ES para cambiar todo el panel. Tu elección se queda guardada."] },
      { sel: "#tabBar, #sideNav", t: ["Your pages", "Tus páginas"],
        d: ["Jump between Requests, Jobs, Quotes and the rest. On your phone, tap More to see the other pages.", "Cambia entre Solicitudes, Trabajos, Cotizaciones y lo demás. En el teléfono, toca Más para ver las otras páginas."] },
      { sel: "#view .kpis", t: ["Your numbers at a glance", "Tus números de un vistazo"],
        d: ["New requests, estimates this week, money in the pipeline and what you've won this month. They update on their own.", "Solicitudes nuevas, estimados de la semana, dinero en proceso y lo que has ganado este mes. Se actualizan solos."] },
      { sel: "#view .setup", t: ["Finish setting up", "Termina de configurar"],
        d: ["A few things only you can do, like adding your license number. Each one checks itself off once it's done.", "Algunas cosas que solo tú puedes hacer, como agregar tu número de licencia. Cada una se marca sola cuando la completas."] },
      { sel: "#view .grid2 > .card:last-child", t: ["Your AI team", "Tu equipo de IA"],
        d: ["Three helpers work in the background: one keeps you on Google, one emails you a weekly marketing lesson, and one finds new customers. Tap Open to see each one.", "Tres ayudantes trabajan en segundo plano: uno te mantiene en Google, otro te manda una lección de marketing cada semana y otro encuentra clientes nuevos. Toca Abrir para ver cada uno."] },
      { sel: ".tb-site", t: ["Your secret door", "Tu puerta secreta"],
        d: ["To get back here from your website, press and hold your logo at the top left for 5 seconds, then enter your PIN. Customers never see it.", "Para volver aquí desde tu sitio web, mantén presionado tu logo de arriba a la izquierda por 5 segundos y escribe tu PIN. Los clientes nunca lo ven."] },
      { sel: "#tipsBtn", t: ["Need help again?", "¿Necesitas ayuda otra vez?"],
        d: ["Tap this button anytime to replay the tips for the page you're on, or to turn them off.", "Toca este botón cuando quieras para repetir los consejos de la página en la que estás, o para apagarlos."] }
    ],
    inbox: [
      { sel: "#view .seg-tabs", t: ["Two kinds of requests", "Dos tipos de solicitudes"],
        d: ["Estimate bookings are people who picked a day for a free estimate. Quote requests want a price first.", "Las citas de estimado son personas que escogieron un día para un estimado gratis. Las solicitudes de cotización quieren un precio primero."] },
      { sel: '#view [data-act="confirmBooking"]', t: ["Confirm", "Confirmar"],
        d: ["Lets the customer know you'll be there. Tap it once you've checked your schedule.", "Le avisa al cliente que vas a llegar. Tócalo cuando hayas revisado tu agenda."] },
      { sel: '#view .req .actions a[href^="tel"]', t: ["Call or text", "Llamar o mensaje"],
        d: ["Calls or texts the customer straight from your phone.", "Llama o le escribe al cliente directo desde tu teléfono."] },
      { sel: '#view [data-act="doneBooking"]', t: ["Mark done", "Marcar hecho"],
        d: ["Use it after the estimate visit so the request leaves your to-do list.", "Úsalo después de la visita para que la solicitud salga de tus pendientes."] }
    ],
    jobs: [
      { sel: "#view .board", t: ["Your job board", "Tu tablero de trabajos"],
        d: ["Every job moves left to right: Estimate, Quoted, Scheduled, In progress, Done.", "Cada trabajo avanza de izquierda a derecha: Estimado, Cotizado, Agendado, En curso, Hecho."] },
      { sel: '#view [data-act="moveJob"][data-dir="1"]', t: ["Move it forward", "Muévelo hacia adelante"],
        d: ["Tap to push a job to the next stage. The small arrow on the left moves it back if you tapped by mistake.", "Toca para pasar el trabajo a la siguiente etapa. La flechita de la izquierda lo regresa si te equivocaste."] },
      { sel: '#view [data-act="newJob"]', t: ["Add a job", "Agrega un trabajo"],
        d: ["For work that came in by phone or word of mouth.", "Para trabajos que llegaron por teléfono o de boca en boca."] }
    ],
    quotes: [
      { sel: '#view [data-act="newQuote"]', t: ["Write a quote", "Escribe una cotización"],
        d: ["Pick the customer and service and set the price. The 30% deposit is figured for you, and each quote gets its own number.", "Escoge el cliente y el servicio y pon el precio. El depósito del 30% se calcula solo, y cada cotización lleva su propio número."] },
      { sel: '#view [data-act="viewQuote"]', t: ["View and share", "Ver y compartir"],
        d: ["Opens the quote with your logo, phone and license number. From there, send it by WhatsApp or email, or save it as a PDF.", "Abre la cotización con tu logo, teléfono y número de licencia. Desde ahí la envías por WhatsApp o correo, o la guardas como PDF."] },
      { sel: '#view [data-act="sendQuote"], #view [data-act="acceptQuote"]', t: ["Send, then mark accepted", "Envía y luego marca aceptada"],
        d: ["Send emails the quote to the customer. When they say yes, tap Mark accepted so the job is ready to schedule.", "Enviar le manda la cotización al cliente por correo. Cuando diga que sí, toca Marcar aceptada para que el trabajo quede listo para agendar."] }
    ],
    customers: [
      { sel: "#custSearch", t: ["Find anyone fast", "Encuentra a cualquiera rápido"],
        d: ["Type a name or a city. Everyone who booked or asked for a quote is saved here.", "Escribe un nombre o una ciudad. Todos los que reservaron o pidieron cotización se guardan aquí."] },
      { sel: '#view [data-act="exportCsv"]', t: ["Export", "Exportar"],
        d: ["Downloads your customer list as a spreadsheet file.", "Descarga tu lista de clientes como archivo de hoja de cálculo."] }
    ],
    leads: [
      { sel: '#view [data-act="agentToggle"]', t: ["Turn it on or off", "Préndelo o apágalo"],
        d: ["While it's on, the Lead Finder searches every week for people and businesses likely to need painting. Pause it anytime.", "Mientras esté prendido, el Buscador de Clientes busca cada semana personas y negocios que probablemente necesitan pintura. Lo puedes pausar cuando quieras."] },
      { sel: "#view .lead .score", t: ["Fit score", "Afinidad"],
        d: ["How good a match this lead is, out of 100. The best ones are at the top.", "Qué tan buena oportunidad es este cliente, de 100. Los mejores salen arriba."] },
      { sel: "#view .lead .mini-seg", t: ["English or Spanish message", "Mensaje en inglés o español"],
        d: ["Each lead comes with a first message written in your voice. Switch the language to match the person.", "Cada cliente trae un primer mensaje escrito con tu voz. Cambia el idioma según la persona."] },
      { sel: '#view [data-act="copyPitch"]', t: ["Copy, then send it yourself", "Copia y envíalo tú"],
        d: ["Copy the message and send it from your own phone or email. Nothing goes out on its own.", "Copia el mensaje y envíalo desde tu teléfono o correo. Nada sale solo."] },
      { sel: '#view [data-act="leadContacted"], #view [data-act="leadSkip"]', t: ["Keep track", "Lleva la cuenta"],
        d: ["Tap Mark contacted after you reach out, or Skip if it's not a good fit.", "Toca Marcar contactado después de escribirle, u Omitir si no te conviene."] }
    ],
    marketing: [
      { sel: '#view [data-act="agentToggle"]', t: ["Your weekly coach", "Tu coach semanal"],
        d: ["Every Monday at 8:00 AM you get an email in Spanish with one simple marketing task for the week.", "Cada lunes a las 8:00 AM te llega un correo en español con una tarea de marketing sencilla para la semana."] },
      { sel: '#view [data-act="previewEmail"]', t: ["Read a lesson", "Lee una lección"],
        d: ["Preview opens the full email right here, so you never have to dig through your inbox.", "Vista previa abre el correo completo aquí mismo, sin tener que buscarlo en tu bandeja."] },
      { sel: '#view [data-act="challengeDone"]', t: ["This week's challenge", "El reto de esta semana"],
        d: ["Follow the steps, post the video, then tap I posted it so your coach can follow up next week.", "Sigue los pasos, sube el video y luego toca Ya lo subí para que tu coach le dé seguimiento la próxima semana."] }
    ],
    seo: [
      { sel: "#view .kpis", t: ["How Google sees you", "Cómo te ve Google"],
        d: ["Pages Google has found, your average spot in search results, and how many people clicked through to your site.", "Las páginas que Google encontró, tu posición promedio en los resultados y cuántas personas entraron a tu sitio."] },
      { sel: '#view [data-act="runSeo"]', t: ["Check now", "Revisar ahora"],
        d: ["Runs a fresh check of where you show up for searches like \"epoxy garage floor Sanford\".", "Hace una revisión nueva de dónde apareces en búsquedas como \"epoxy garage floor Sanford\"."] },
      { sel: '#view [data-act="seoTask"]', t: ["Agent to-do", "Pendientes del agente"],
        d: ["Small jobs that help you rank higher. Check them off as they get done.", "Tareas pequeñas que te ayudan a subir en Google. Márcalas cuando estén hechas."] }
    ],
    blog: [
      { sel: '#view [data-act="publishPost"], #view [data-act="unpublishPost"]', t: ["You approve before it goes live", "Tú apruebas antes de publicar"],
        d: ["Your SEO agent writes drafts about your real jobs. Nothing is published until you tap Approve and publish.", "Tu agente SEO escribe borradores sobre tus trabajos reales. Nada se publica hasta que toques Aprobar y publicar."] },
      { sel: '#view [data-act="newPost"]', t: ["Write your own", "Escribe el tuyo"],
        d: ["Add a post about any job you're proud of. Mentioning the town helps people nearby find you.", "Agrega una publicación sobre un trabajo del que estés orgulloso. Mencionar la ciudad ayuda a que la gente cerca te encuentre."] }
    ],
    gallery: [
      { sel: "#view label.btn", t: ["Add photos", "Agrega fotos"],
        d: ["Upload job photos from your phone. New photos stay hidden until you mark them Live.", "Sube fotos de tus trabajos desde el teléfono. Las fotos nuevas quedan ocultas hasta que las marques En vivo."] },
      { sel: '#view [data-act="mediaPub"]', t: ["Live or Hidden", "En vivo u Oculto"],
        d: ["Live photos show on your website. Tap again to hide one.", "Las fotos En vivo salen en tu sitio web. Tócalo otra vez para ocultarla."] },
      { sel: '#view [data-act="mediaCat"]', t: ["Pick a category", "Escoge una categoría"],
        d: ["This decides which filter the photo shows under on your website.", "Esto decide en qué filtro sale la foto en tu sitio web."] }
    ],
    site: [
      { sel: "#siteForm", t: ["Edit your website text", "Edita el texto de tu sitio"],
        d: ["Change the main headline and description, in English and Spanish.", "Cambia el titular principal y la descripción, en inglés y en español."] },
      { sel: "#siteSave", t: ["Save lights up when you change something", "Guardar se activa cuando cambias algo"],
        d: ["If you clear a field, your site goes back to the original wording, so you can't break it.", "Si dejas un campo vacío, tu sitio vuelve al texto original, así que no lo puedes dañar."] }
    ],
    settings: [
      { sel: "#logoCard", t: ["Your logo", "Tu logo"],
        d: ["Upload your logo once and it goes on every quote you send by WhatsApp or email.", "Sube tu logo una vez y sale en cada cotización que envíes por WhatsApp o correo."] },
      { sel: "#bizForm", t: ["Your business details", "Los datos de tu negocio"],
        d: ["These show on your website, quotes and invoices. Change one here and it updates everywhere.", "Salen en tu sitio web, cotizaciones y facturas. Cambia uno aquí y se actualiza en todas partes."] },
      { sel: "#tipsCard", t: ["Tips on or off", "Consejos sí o no"],
        d: ["Turn these tips off once you've got the hang of it, or show them all again from the start.", "Apaga estos consejos cuando ya le agarres la onda, o vuelve a verlos todos desde el principio."] },
      { sel: '#view [data-act="clearDemo"]', t: ["Clear the sample data", "Borra los datos de ejemplo"],
        d: ["When you're ready to go live, this removes the practice customers and jobs. It asks you to confirm first.", "Cuando estés listo para empezar, esto borra los clientes y trabajos de práctica. Te pide confirmar primero."] }
    ]
  };

  /* ---------- button help on hover (computer only) ---------- */
  var HELP = {
    confirmBooking: ["Confirm the estimate with the customer", "Confirma el estimado con el cliente"],
    doneBooking: ["Clear it from your list after the visit", "Quítalo de tu lista después de la visita"],
    newQuote: ["Write a new quote with the price and deposit", "Escribe una cotización nueva con el precio y el depósito"],
    "moveJob:1": ["Move this job to the next stage", "Pasa este trabajo a la siguiente etapa"],
    "moveJob:-1": ["Move this job back one stage", "Regresa este trabajo una etapa"],
    inboxTab: ["Switch between estimate bookings and quote requests", "Cambia entre citas de estimado y solicitudes de cotización"],
    viewQuote: ["See the quote the way the customer sees it", "Ve la cotización como la ve el cliente"],
    sendQuote: ["Email this quote to the customer", "Envíale esta cotización al cliente por correo"],
    acceptQuote: ["The customer said yes. Ready to schedule", "El cliente dijo que sí. Listo para agendar"],
    exportCsv: ["Download your customer list as a spreadsheet", "Descarga tu lista de clientes en hoja de cálculo"],
    pitchLang: ["Show the message in English or Spanish", "Muestra el mensaje en inglés o español"],
    copyPitch: ["Copy the message to send from your phone", "Copia el mensaje para enviarlo desde tu teléfono"],
    leadContacted: ["You reached out to this lead", "Ya contactaste a este cliente"],
    leadSkip: ["Not a fit. Remove it from the list", "No te conviene. Quítalo de la lista"],
    agentToggle: ["Turn this AI helper on or off", "Prende o apaga este ayudante de IA"],
    previewEmail: ["Read the full lesson", "Lee la lección completa"],
    challengeDone: ["Let your coach know you posted it", "Avísale a tu coach que ya lo subiste"],
    runSeo: ["Check where you rank on Google right now", "Revisa dónde apareces en Google ahora mismo"],
    seoTask: ["Check this off when it's done", "Márcalo cuando esté hecho"],
    setup: ["Check this off when it's done", "Márcalo cuando esté hecho"],
    newPost: ["Write a new blog post", "Escribe una publicación nueva"],
    publishPost: ["Approve this draft and put it on your website", "Aprueba este borrador y ponlo en tu sitio"],
    unpublishPost: ["Take this post off your website", "Quita esta publicación de tu sitio"],
    mediaPub: ["Show or hide this photo on your website", "Muestra u oculta esta foto en tu sitio"],
    mediaCat: ["Which gallery filter this photo shows under", "En qué filtro de la galería sale esta foto"],
    newJob: ["Add a job that came in by phone or word of mouth", "Agrega un trabajo que llegó por teléfono o de boca en boca"],
    "saveQuote:1": ["Save it and email it to the customer", "Guárdala y envíala al cliente por correo"],
    "saveQuote:0": ["Save it without sending", "Guárdala sin enviar"],
    saveJob: ["Add this job to your board", "Agrega este trabajo a tu tablero"],
    savePost: ["Save as a draft. Nothing goes live yet", "Guárdalo como borrador. Todavía no se publica"],
    closeModal: ["Close without saving", "Cerrar sin guardar"],
    quoteShared: ["Send this quote with your logo", "Envía esta cotización con tu logo"],
    quotePdf: ["Open the quote page to save it as a PDF", "Abre la cotización para guardarla como PDF"],
    removeLogo: ["Remove this logo", "Quita este logo"],
    "#logoCard label.btn": ["Upload your logo. PNG, JPG or SVG", "Sube tu logo. PNG, JPG o SVG"],
    clearDemo: ["Remove the sample customers and jobs", "Borra los clientes y trabajos de ejemplo"],
    clearDemoGo: ["Removes the sample data for good", "Borra los datos de ejemplo para siempre"],
    "#siteSave": ["Save your changes to the website text", "Guarda tus cambios al texto del sitio"],
    "#bizSave": ["Save your business details", "Guarda los datos de tu negocio"],
    "#custSearch": ["Search by name or city", "Busca por nombre o ciudad"],
    ".tb-site": ["Open your website", "Abre tu sitio web"],
    ".lang-btn": ["Switch the admin between English and Spanish", "Cambia el panel entre inglés y español"],
    "#tipsBtn": ["Replay the tips for this page, or turn them off", "Repite los consejos de esta página, o apágalos"],
    "#view label.btn": ["Upload job photos", "Sube fotos de tus trabajos"],
    "[data-go]:not(.nav-item):not(.tab)": ["Go to this page", "Ir a esta página"]
  };
  var HELP_SELS = Object.keys(HELP).filter(function (k) { return /^[#.\[]/.test(k); });
  function helpFor(el) {
    var a = el.closest("[data-act]");
    if (a && a.dataset.act) {
      var k = a.dataset.act, k2 = k + ":" + (a.dataset.dir || a.dataset.send || "");
      if (HELP[k2]) return { el: a, text: T(HELP[k2]) };
      if (HELP[k]) return { el: a, text: T(HELP[k]) };
    }
    for (var i = 0; i < HELP_SELS.length; i++) {
      var m = el.closest(HELP_SELS[i]);
      if (m) return { el: m, text: T(HELP[HELP_SELS[i]]) };
    }
    return null;
  }

  /* ---------- DOM ---------- */
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; e.setAttribute("data-noi18n", ""); return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var shield, ring, bub, hover, menu;
  function ensure() {
    if (bub) return;
    shield = mk("div", "tip-shield"); ring = mk("div", "tip-ring");
    bub = mk("div", "tip-bub"); bub.setAttribute("role", "dialog"); bub.setAttribute("aria-live", "polite");
    hover = mk("div", "tip-hover"); hover.setAttribute("role", "tooltip");
    menu = mk("div", "tip-menu"); menu.hidden = true;
    [shield, ring, bub, hover, menu].forEach(function (e) { e.hidden = true; document.body.appendChild(e); });
  }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (r.right <= 0 || r.left >= document.documentElement.clientWidth) return false; /* off-canvas menus */
    var cs = getComputedStyle(el); return cs.visibility !== "hidden" && cs.display !== "none";
  }
  function find(sel) {
    if (!sel) return null;
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) if (visible(list[i])) return list[i];
    return null;
  }
  function fixedBars() {
    var top = 0, bottom = window.innerHeight, tb = document.querySelector(".topbar"), tab = document.getElementById("tabBar");
    if (tb && visible(tb)) top = Math.max(0, tb.getBoundingClientRect().bottom);
    if (tab && visible(tab)) bottom = Math.min(bottom, tab.getBoundingClientRect().top);
    return { top: top, bottom: bottom };
  }

  /* ---------- trail engine ---------- */
  var trail = null; /* { view, steps, i } */
  function stepsFor(view) {
    return (TRAILS[view] || []).filter(function (s) { return !s.sel || find(s.sel); });
  }
  function start(view, manual) {
    ensure(); closeMenu();
    if (document.querySelector("#modal:not([hidden])") && !manual) return;
    var steps = stepsFor(view);
    if (!steps.length) return;
    markSeen(view);
    trail = { view: view, steps: steps, i: 0 };
    shield.hidden = false; bub.hidden = false;
    document.body.classList.add("tips-active");
    show();
  }
  function stop() {
    trail = null;
    if (!bub) return;
    shield.hidden = true; ring.hidden = true; bub.hidden = true;
    document.body.classList.remove("tips-active");
  }
  function show() {
    if (!trail) return;
    var s = trail.steps[trail.i], n = trail.steps.length, el = find(s.sel);
    if (s.sel && !el) { /* element went away after a re-render: skip ahead */
      if (trail.i < n - 1) { trail.i++; return show(); } return stop();
    }
    var dots = "";
    for (var k = 0; k < n; k++) dots += '<span class="' + (k === trail.i ? "on" : k < trail.i ? "past" : "") + '"></span>';
    bub.innerHTML =
      '<div class="tip-top"><span class="tip-crumbs" aria-hidden="true">' + dots + "</span>" +
      '<span class="tip-count">' + (trail.i + 1) + (lang === "es" ? " de " : " of ") + n + "</span>" +
      '<button type="button" class="tip-x" data-tip-act="close" aria-label="' + (lang === "es" ? "Cerrar consejos" : "Close tips") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      "<h4>" + esc(T(s.t)) + "</h4><p>" + esc(T(s.d)) + "</p>" +
      '<div class="tip-foot"><button type="button" class="tip-off" data-tip-act="off">' + (lang === "es" ? "Apagar consejos" : "Turn off tips") + "</button>" +
      '<span class="tip-nav">' + (trail.i > 0 ? '<button type="button" class="btn sm ghost" data-tip-act="back">' + (lang === "es" ? "Atrás" : "Back") + "</button>" : "") +
      '<button type="button" class="btn sm" data-tip-act="next">' + (trail.i < n - 1 ? (lang === "es" ? "Siguiente" : "Next") : (lang === "es" ? "Entendido" : "Got it")) + "</button></span></div>";
    if (el) {
      var bars = fixedBars(), r = el.getBoundingClientRect();
      var inFixed = el.closest(".topbar, .tabbar, .side");
      if (!inFixed && (r.top < bars.top + 8 || r.bottom > bars.bottom - 8)) {
        window.scrollBy(0, r.top - bars.top - 16);
      }
    }
    place(el);
    var nx = bub.querySelector('[data-tip-act="next"]'); if (nx) nx.focus({ preventScroll: true });
  }
  function place(el) {
    if (!trail) return;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight, bars = fixedBars(), pad = 6, gap = 12, m = 12;
    var bw = Math.min(340, vw - m * 2);
    bub.style.width = bw + "px";
    var bh = bub.offsetHeight;
    if (!el) { ring.hidden = true; bub.classList.add("center");
      bub.style.left = Math.round((vw - bw) / 2) + "px"; bub.style.top = Math.round(Math.max(m, (vh - bh) / 2)) + "px"; return; }
    bub.classList.remove("center");
    var r = el.getBoundingClientRect();
    var rt = Math.max(r.top - pad, 2), rb = Math.min(r.bottom + pad, vh - 2);
    ring.hidden = false;
    ring.style.left = Math.max(r.left - pad, 2) + "px"; ring.style.top = rt + "px";
    ring.style.width = (Math.min(r.right + pad, vw - 2) - Math.max(r.left - pad, 2)) + "px";
    ring.style.height = Math.max(rb - rt, 8) + "px";
    var below = bars.bottom - rb - gap, above = rt - bars.top - gap, top;
    if (below >= bh + m) top = rb + gap;
    else if (above >= bh + m) top = rt - gap - bh;
    else if (el.closest(".topbar")) top = rb + gap;
    else top = Math.max(bars.top + m, bars.bottom - bh - m); /* tall target: dock at the bottom */
    var left = r.left + r.width / 2 - bw / 2;
    left = Math.max(m, Math.min(left, vw - bw - m));
    bub.style.left = Math.round(left) + "px"; bub.style.top = Math.round(Math.max(m, top)) + "px";
  }
  function replace() { if (trail) place(find(trail.steps[trail.i].sel)); }
  window.addEventListener("resize", replace);
  window.addEventListener("scroll", function () { replace(); hideHover(); closeMenu(); }, true);

  /* ---------- help menu in the top bar ---------- */
  function openMenu(btn) {
    ensure(); stop();
    menu.innerHTML =
      '<div class="tip-menu-h"><span>' + (lang === "es" ? "Ayuda" : "Help") + '</span><button type="button" class="tip-menu-x" data-tip-act="close-menu" aria-label="' + (lang === "es" ? "Cerrar" : "Close") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<button type="button" data-tip-act="replay-page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/></svg>' + (lang === "es" ? "Ver consejos de esta página" : "Show tips for this page") + "</button>" +
      '<button type="button" role="switch" aria-checked="' + isOn() + '" data-tip-act="toggle" class="tip-sw' + (isOn() ? " on" : "") + '"><i></i>' + (isOn() ? (lang === "es" ? "Consejos prendidos" : "Tips are on") : (lang === "es" ? "Consejos apagados" : "Tips are off")) + "</button>";
    menu.hidden = false;
    var r = btn.getBoundingClientRect(), vw = document.documentElement.clientWidth, w = Math.min(260, vw - 24);
    menu.style.width = w + "px";
    menu.style.top = Math.round(r.bottom + 8) + "px";
    menu.style.left = Math.round(Math.max(12, Math.min(r.right - w, vw - w - 12))) + "px";
    btn.setAttribute("aria-expanded", "true");
  }
  function closeMenu() { if (menu && !menu.hidden) { menu.hidden = true; var b = document.getElementById("tipsBtn"); if (b) b.setAttribute("aria-expanded", "false"); } }

  function setOn(on) {
    store(KEY_ON, on ? "1" : "0");
    if (!on) { stop(); hideHover(); }
    syncCard();
    if (window.JA_ADMIN) window.JA_ADMIN.toast(on ? (lang === "es" ? "Consejos prendidos" : "Tips are on") : (lang === "es" ? "Consejos apagados. Los puedes prender en el botón de ayuda o en Ajustes." : "Tips are off. Turn them back on from the help button or Settings."));
  }
  function syncCard() {
    var sw = document.querySelector("#tipsCard .switch");
    if (!sw) return;
    var on = isOn();
    sw.classList.toggle("on", on); sw.setAttribute("aria-checked", String(on));
    var sp = sw.querySelector("span"); if (sp) sp.textContent = on ? (lang === "es" ? "Consejos prendidos" : "Tips are on") : (lang === "es" ? "Consejos apagados" : "Tips are off");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tip-act]");
    if (!b) { if (menu && !menu.hidden && !e.target.closest(".tip-menu")) closeMenu(); return; }
    e.preventDefault(); e.stopPropagation();
    var a = b.getAttribute("data-tip-act"), view = window.JA_ADMIN ? window.JA_ADMIN.view() : "dashboard";
    if (a === "next") { if (trail && trail.i < trail.steps.length - 1) { trail.i++; show(); } else stop(); }
    else if (a === "back") { if (trail && trail.i > 0) { trail.i--; show(); } }
    else if (a === "close") stop();
    else if (a === "off") setOn(false);
    else if (a === "menu") { if (menu && !menu.hidden) closeMenu(); else openMenu(b); }
    else if (a === "replay-page") { closeMenu(); start(view, true); }
    else if (a === "toggle") { setOn(!isOn()); closeMenu(); }
    else if (a === "close-menu") closeMenu();
    else if (a === "replay-all") { store(seenKey(), "[]"); setOn(true); start(view, true); }
  }, true);
  document.addEventListener("pointerdown", function (e) {
    if (menu && !menu.hidden && !e.target.closest(".tip-menu") && !e.target.closest("#tipsBtn")) closeMenu();
  }, true);
  document.addEventListener("touchstart", function (e) {
    if (menu && !menu.hidden && !e.target.closest(".tip-menu") && !e.target.closest("#tipsBtn")) closeMenu();
  }, { capture: true, passive: true });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (trail) { e.stopPropagation(); stop(); } closeMenu(); hideHover(); }
    else if (trail && e.key === "ArrowRight") { var n = bub.querySelector('[data-tip-act="next"]'); if (n) n.click(); }
    else if (trail && e.key === "ArrowLeft") { var p = bub.querySelector('[data-tip-act="back"]'); if (p) p.click(); }
  }, true);

  /* ---------- hover help (computers only) ---------- */
  var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hoverTimer = null, hoverFor = null;
  function hideHover() { clearTimeout(hoverTimer); hoverFor = null; if (hover) hover.hidden = true; }
  if (canHover) {
    document.addEventListener("mouseover", function (e) {
      if (!isOn() || trail) return;
      var h = helpFor(e.target);
      if (!h) { if (hoverFor && !hoverFor.contains(e.target)) hideHover(); return; }
      if (h.el === hoverFor) return;
      hideHover(); hoverFor = h.el;
      hoverTimer = setTimeout(function () {
        ensure(); if (!document.body.contains(h.el)) return;
        hover.textContent = h.text; hover.hidden = false;
        var r = h.el.getBoundingClientRect(), vw = document.documentElement.clientWidth, w = hover.offsetWidth, hh = hover.offsetHeight;
        var top = r.top - hh - 8; if (top < 8) top = r.bottom + 8;
        hover.style.left = Math.round(Math.max(8, Math.min(r.left + r.width / 2 - w / 2, vw - w - 8))) + "px";
        hover.style.top = Math.round(top) + "px";
      }, 450);
    });
    document.addEventListener("mousedown", hideHover, true);
  }

  /* ---------- hook into the admin ---------- */
  var lastView = null;
  document.addEventListener("ja:render", function (e) {
    lang = e.detail.lang;
    syncCard();
    if (e.detail.view !== lastView) { lastView = e.detail.view; hideHover(); closeMenu(); if (trail && trail.view !== lastView) stop(); }
    if (trail) { setTimeout(show, 0); return; } /* re-render during a trail: re-point at the fresh element */
    if (isOn() && seen().indexOf(lastView) < 0) setTimeout(function () { if (!trail && window.JA_ADMIN.view() === lastView) start(lastView, false); }, 500);
  });

  window.JA_TIPS = { on: isOn, start: start, stop: stop };
})();
