/* Pressa back office: guided tips.
   1) Tip trails: the first time a page is opened, a short trail of tips walks
      through it one step at a time (dots show where you are).
   2) Button help: on a computer, resting the mouse on a button explains it.
   Both can be switched off from the help button in the top bar or in Settings.
   Loaded before admin.js. Listens for the "pressa:render" event admin.js fires. */
(function () {
  "use strict";
  var KEY_ON = "pressa-tips-on", KEY_SEEN = "pressa-tips-seen";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function isOn() { return store(KEY_ON) !== "0"; }
  /* tips are remembered per person, so Hiram and Felix each get the full tour */
  function seenKey() { var u = window.PRESSA_USER ? window.PRESSA_USER() : ""; return KEY_SEEN + (u ? "-" + u.toLowerCase() : ""); }
  function seen() { try { return JSON.parse(store(seenKey()) || "[]"); } catch (e) { return []; } }
  function markSeen(v) { var s = seen(); if (s.indexOf(v) < 0) { s.push(v); store(seenKey(), JSON.stringify(s)); } }
  var lang = "en";
  function T(pair) { var n = window.PRESSA_USER ? window.PRESSA_USER() : "Hiram"; return (lang === "es" ? pair[1] : pair[0]).replace("{name}", n); }

  /* ---------- tip trails, one per page ---------- */
  var TRAILS = {
    dashboard: [
      { sel: null, t: ["Welcome to your back office, {name}", "Bienvenido a tu panel, {name}"],
        d: ["This is where you run Pressa: messages from your website, orders, your store, and every word, photo and video on your site. Here's a quick tour. You can turn these tips off anytime.",
            "Aquí manejas Pressa: los mensajes de tu sitio, los pedidos, tu tienda y cada texto, foto y video de tu sitio web. Te damos un recorrido rápido. Puedes apagar estos consejos cuando quieras."] },
      { sel: ".lang", t: ["Spanish or English", "Español o inglés"],
        d: ["Tap ES or EN to switch the whole back office. Your website follows the same choice.", "Toca ES o EN para cambiar todo el panel. Tu sitio web usa la misma elección."] },
      { sel: "#tabBar, #sideNav", t: ["Your pages", "Tus páginas"],
        d: ["Jump between Messages, Website content, Photos and the rest. On your phone, tap More to see Orders, Store and Settings.", "Cambia entre Mensajes, Contenido del sitio, Fotos y lo demás. En el teléfono, toca Más para ver Pedidos, Tienda y Ajustes."] },
      { sel: "#view .kpis", t: ["Your numbers at a glance", "Tus números de un vistazo"],
        d: ["New messages, how many people are on the waitlist, orders to ship and your current price. They update on their own.", "Mensajes nuevos, cuántas personas hay en la lista de espera, pedidos por enviar y tu precio de ahora. Se actualizan solos."] },
      { sel: "#view .setup", t: ["Finish setting up", "Termina de configurar"],
        d: ["A few things only you can do. Tap Go on each one. They check themselves off once they're done.", "Algunas cosas que solo tú puedes hacer. Toca Ir en cada una. Se marcan solas cuando las completas."] },
      { sel: "#view .quick", t: ["Quick changes", "Cambios rápidos"],
        d: ["The fastest way to change your website content, photos or price.", "La forma más rápida de cambiar los textos, las fotos o el precio de tu sitio."] },
      { sel: ".tb-site", t: ["Your secret door", "Tu puerta secreta"],
        d: ["To get back here from your website, press and hold the Pressa logo at the top left for 5 seconds, then enter your PIN. Customers never see it.", "Para volver aquí desde tu sitio web, mantén presionado el logo de Pressa arriba a la izquierda por 5 segundos y escribe tu PIN. Los clientes nunca lo ven."] },
      { sel: "#tipsBtn", t: ["Need help again?", "¿Necesitas ayuda otra vez?"],
        d: ["Tap this button anytime to replay the tips for the page you're on, or to turn them off.", "Toca este botón cuando quieras para repetir los consejos de la página en la que estás, o para apagarlos."] }
    ],
    inbox: [
      { sel: "#inboxTabs", t: ["Two kinds of messages", "Dos tipos de mensajes"],
        d: ["Contact form is people who wrote to you. Waitlist is people who want to know the moment Pressa is ready.", "Formulario de contacto son personas que te escribieron. Lista de espera son personas que quieren saber cuando Pressa esté listo."] },
      { sel: "#view .tag-en", t: ["English messages", "Mensajes en inglés"],
        d: ["Messages written in English are marked so Felix can answer them.", "Los mensajes escritos en inglés salen marcados para que Felix los conteste."] },
      { sel: '#view .req .actions a[href^="tel"], #view .req .actions a[href^="mailto"]', t: ["Answer in one tap", "Contesta con un toque"],
        d: ["Call, text, WhatsApp or email the person straight from your phone. The WhatsApp message starts with a hello for you.", "Llama, escribe, manda WhatsApp o un correo directo desde tu teléfono. El WhatsApp ya empieza con un saludo."] },
      { sel: '#view [data-act="msgDone"]', t: ["Mark answered", "Marcar contestado"],
        d: ["Tap it after you reply so the message leaves your to-do list.", "Tócalo después de contestar para que el mensaje salga de tus pendientes."] }
    ],
    orders: [
      { sel: "#view .req", t: ["Each order", "Cada pedido"],
        d: ["Who bought, how many and the total. These are samples until the store goes live.", "Quién compró, cuántos y el total. Estos son ejemplos hasta que la tienda abra."] },
      { sel: '#view [data-act="ship"]', t: ["Mark shipped", "Marcar enviado"],
        d: ["Once the stand is on its way, tap this and add the tracking number if you have one.", "Cuando el soporte salga, toca esto y agrega el número de rastreo si lo tienes."] }
    ],
    store: [
      { sel: '#storeForm .price-in', t: ["Your price", "Tu precio"],
        d: ["Type the price of one stand. The store and the total update by themselves.", "Escribe el precio de un soporte. La tienda y el total se actualizan solos."] },
      { sel: "#storeForm .toggle", t: ["Open or close pre-orders", "Abre o cierra pre-órdenes"],
        d: ["Switch pre-orders off when you're sold out, and back on when you have stands ready.", "Apaga las pre-órdenes cuando se te acaben y préndelas cuando tengas soportes listos."] },
      { sel: "#storeSave", t: ["Save", "Guardar"],
        d: ["Nothing changes on your website until you tap Save.", "Nada cambia en tu sitio hasta que tocas Guardar."] }
    ],
    site: [
      { sel: ".se-safe", t: ["Edit any words on your site", "Edita cualquier texto de tu sitio"],
        d: ["Only the words change, never the design, so you can't break anything.", "Solo cambian las palabras, nunca el diseño, así que no puedes dañar nada."] },
      { sel: "#seSearch", t: ["Find it fast", "Encuéntralo rápido"],
        d: ["Type a word you see on your website, like price or rotation, to jump right to it.", "Escribe una palabra que ves en tu sitio, como precio o rotación, para ir directo a ella."] },
      { sel: ".se-sec", t: ["Open a section", "Abre una sección"],
        d: ["Each part of your website has its own section. Type in English and Spanish side by side. Use original puts back the words Finesse Media wrote.", "Cada parte de tu sitio tiene su sección. Escribe en inglés y en español lado a lado. Usar original devuelve el texto que escribió Finesse Media."] },
      { sel: "#seBar", t: ["Save when you're ready", "Guarda cuando estés listo"],
        d: ["Nothing changes on your website until you tap Save. Discard throws away what you typed.", "Nada cambia en tu sitio hasta que tocas Guardar. Descartar borra lo que escribiste."] },
      { sel: "#seHistory", t: ["Go back anytime", "Vuelve cuando quieras"],
        d: ["Every save is kept here. Tap Restore on any version to put your website back the way it was.", "Cada vez que guardas queda aquí. Toca Restaurar en cualquier versión para dejar tu sitio como estaba."] }
    ],
    media: [
      { sel: "#slotGrid", t: ["Every photo and video on your site", "Cada foto y video de tu sitio"],
        d: ["Each card is one spot on your website. It says where it shows up.", "Cada tarjeta es un lugar de tu sitio. Te dice dónde sale."] },
      { sel: "#slotGrid .slot-row label.btn", t: ["Replace", "Reemplazar"],
        d: ["Pick a new photo or video from your phone. The design stays the same, only the picture changes. Use original brings back the old one.", "Escoge una foto o video nuevo de tu teléfono. El diseño se queda igual, solo cambia la imagen. Usar original devuelve la anterior."] },
      { sel: "#galDrop", t: ["Add to your gallery", "Agrega a tu galería"],
        d: ["New photos and videos go into From the shop floor on your website right away.", "Las fotos y videos nuevos salen en Desde el taller de tu sitio de inmediato."] },
      { sel: '#view [data-act="galPub"]', t: ["Live or Hidden", "En vivo u Oculta"],
        d: ["Live shows on your website. Tap it to hide a photo without deleting it.", "En vivo sale en tu sitio. Tócalo para ocultar una foto sin borrarla."] },
      { sel: "#galTabs", t: ["Nothing is lost", "Nada se pierde"],
        d: ["Deleted photos wait in Trash, so you can restore them anytime.", "Las fotos que borras esperan en la Papelera, así que las puedes restaurar cuando quieras."] }
    ],
    settings: [
      { sel: "#bizForm", t: ["Your contact details", "Tus datos de contacto"],
        d: ["Your phones, email and Instagram show on your website. Change one here and it updates everywhere.", "Tus teléfonos, correo e Instagram salen en tu sitio. Cambia uno aquí y se actualiza en todas partes."] },
      { sel: "#tipsCard", t: ["Tips on or off", "Consejos sí o no"],
        d: ["Turn these tips off once you've got the hang of it, or start the tour again.", "Apaga estos consejos cuando ya le agarres la onda, o vuelve a ver el recorrido."] },
      { sel: '#view [data-act="clearDemo"]', t: ["Clear the sample data", "Borra los datos de ejemplo"],
        d: ["When you're ready, this removes the practice messages and orders. It asks you to confirm first.", "Cuando estés listo, esto borra los mensajes y pedidos de práctica. Te pide confirmar primero."] },
      { sel: '#view [data-act="restoreAll"]', t: ["Your safety net", "Tu red de seguridad"],
        d: ["If you ever want your website exactly the way Finesse Media delivered it, tap this. It asks you to confirm first.", "Si algún día quieres tu sitio exactamente como lo entregó Finesse Media, toca esto. Te pide confirmar primero."] }
    ]
  };

  /* ---------- button help on hover (computer only) ---------- */
  var HELP = {
    inboxTab: ["Switch between contact messages and the waitlist", "Cambia entre mensajes de contacto y la lista de espera"],
    msgDone: ["You already answered this person", "Ya le contestaste a esta persona"],
    msgNew: ["Put it back on your to-do list", "Regrésalo a tus pendientes"],
    msgDel: ["Remove this message from your back office", "Quita este mensaje de tu panel"],
    exportWl: ["Download the waitlist as a spreadsheet", "Descarga la lista de espera en hoja de cálculo"],
    ship: ["The stand is on its way", "El soporte ya va de camino"],
    galTab: ["Filter your photos", "Filtra tus fotos"],
    galPub: ["Show or hide this on your website", "Muestra u oculta esto en tu sitio"],
    galDel: ["Move to Trash. You can restore it later", "Mover a la Papelera. La puedes restaurar después"],
    galRestore: ["Put it back where it was", "Devuélvela a donde estaba"],
    galPurge: ["Remove it for good", "Bórrala para siempre"],
    slotReset: ["Put back the photo Finesse Media delivered", "Devuelve la foto que entregó Finesse Media"],
    seSave: ["Put your changes on your website", "Pon tus cambios en tu sitio web"],
    seDiscard: ["Throw away what you typed since the last save", "Borra lo que escribiste desde la última vez que guardaste"],
    seUndo: ["Put this text back to the original", "Regresa este texto al original"],
    seRestore: ["Put your website back to this version", "Regresa tu sitio a esta versión"],
    seReset: ["Put every word back to the original website", "Regresa todo el texto al sitio original"],
    clearDemo: ["Remove the sample messages and orders", "Borra los mensajes y pedidos de ejemplo"],
    restoreAll: ["Put the whole website back the way it was delivered", "Deja todo el sitio como fue entregado"],
    closeModal: ["Close without changing anything", "Cerrar sin cambiar nada"],
    "#slotGrid label.btn": ["Pick a new photo or video for this spot", "Escoge una foto o video nuevo para este lugar"],
    "#galDrop": ["Add photos or videos", "Agrega fotos o videos"],
    "#galAdd": ["Add photos or videos", "Agrega fotos o videos"],
    "#storeSave": ["Save your price and store settings", "Guarda tu precio y la tienda"],
    "#bizSave": ["Save your contact details", "Guarda tus datos de contacto"],
    "#seSearch": ["Search by a word on your website", "Busca por una palabra de tu sitio"],
    ".tb-site": ["Open your website", "Abre tu sitio web"],
    ".lang-btn": ["Switch between English and Spanish", "Cambia entre inglés y español"],
    "#tipsBtn": ["Replay the tips for this page, or turn them off", "Repite los consejos de esta página, o apágalos"],
    "[data-go]:not(.nav-item):not(.tab):not(.more-item)": ["Go to this page", "Ir a esta página"]
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
    if (window.PRESSA_ADMIN) window.PRESSA_ADMIN.toast(on ? (lang === "es" ? "Consejos prendidos" : "Tips are on") : (lang === "es" ? "Consejos apagados. Los puedes prender en el botón de ayuda o en Ajustes." : "Tips are off. Turn them back on from the help button or Settings."));
  }
  function syncCard() {
    var sw = document.getElementById("tipsSwitch");
    if (sw) sw.checked = isOn();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tip-act]");
    if (!b) { if (menu && !menu.hidden && !e.target.closest(".tip-menu")) closeMenu(); return; }
    e.preventDefault(); e.stopPropagation();
    var a = b.getAttribute("data-tip-act"), view = window.PRESSA_ADMIN ? window.PRESSA_ADMIN.view() : "dashboard";
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
  document.addEventListener("pressa:render", function (e) {
    lang = e.detail.lang;
    syncCard();
    if (e.detail.view !== lastView) { lastView = e.detail.view; hideHover(); closeMenu(); if (trail && trail.view !== lastView) stop(); }
    if (trail) { setTimeout(show, 0); return; } /* re-render during a trail: re-point at the fresh element */
    if (isOn() && seen().indexOf(lastView) < 0) setTimeout(function () { if (!trail && window.PRESSA_ADMIN.view() === lastView) start(lastView, false); }, 500);
  });

  window.PRESSA_TIPS = { on: isOn, set: setOn, start: start, stop: stop };
})();
