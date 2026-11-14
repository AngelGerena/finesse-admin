/* JA Paint Pro: hidden owner access.
   Press and hold the logo (top left) for 5 seconds -> PIN pad -> who's signing in -> admin portal.
   Visitors never see anything: a normal tap still scrolls to the top, and the hold ring only
   appears after the first second of holding.
   PREVIEW: the PIN is checked here in the browser so the demo works anywhere. In the live build
   the PIN is checked on the server and the portal still requires the owner's login. */
(function () {
  "use strict";
  var HOLD_MS = 5000, SHOW_RING_AFTER = 900;
  var PIN = "7117";                 /* preview only: last 4 of the business phone */
  var ADMIN_URL = "admin/";
  var USERS = [{ id: "javier", name: "Javier" }, { id: "xiomara", name: "Xiomara" }];
  var MAX_TRIES = 5, LOCK_MS = 60000;

  var TX = {
    en: { title: "Owner access", enter: "Enter your PIN", wrong: "That PIN didn't match. Try again.", locked: "Too many tries. Wait a minute and try again.",
          who: "Who's signing in?", cancel: "Cancel", del: "Delete", hold: "Keep holding", opening: "Opening your portal" },
    es: { title: "Acceso del dueño", enter: "Escriba su PIN", wrong: "Ese PIN no coincide. Intente otra vez.", locked: "Demasiados intentos. Espere un minuto e intente otra vez.",
          who: "¿Quién está entrando?", cancel: "Cancelar", del: "Borrar", hold: "Siga presionando", opening: "Abriendo su panel" }
  };
  function lang() { return document.documentElement.lang === "es" ? "es" : "en"; }
  function t(k) { return TX[lang()][k]; }

  var logo = document.querySelector(".nav .logo") || document.querySelector(".logo");
  if (!logo) return;

  /* ---------- hold ring ---------- */
  var mark = logo.querySelector(".logo-mark") || logo;
  mark.style.position = "relative";
  var ring = document.createElement("span");
  ring.className = "gate-ring"; ring.setAttribute("aria-hidden", "true"); ring.setAttribute("data-pv", "");
  ring.innerHTML = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" class="gr-bg"/><circle cx="24" cy="24" r="21" class="gr-fg" pathLength="100"/></svg>';
  mark.appendChild(ring);
  var fg = ring.querySelector(".gr-fg");

  var tip = document.createElement("span");
  tip.className = "gate-tip"; tip.setAttribute("aria-hidden", "true"); tip.setAttribute("data-pv", "");
  logo.appendChild(tip);

  var timer = null, raf = null, start = 0, fired = false, swallowClick = false;
  function reset() {
    clearTimeout(timer); cancelAnimationFrame(raf); timer = null;
    ring.classList.remove("on"); tip.classList.remove("on"); fg.style.strokeDashoffset = "100";
    document.body.classList.remove("gate-holding");
  }
  function tick() {
    var el = Date.now() - start;
    if (el > SHOW_RING_AFTER) {
      ring.classList.add("on"); tip.classList.add("on"); tip.textContent = t("hold");
      document.body.classList.add("gate-holding");
      fg.style.strokeDashoffset = String(100 - Math.min(100, (el - SHOW_RING_AFTER) / (HOLD_MS - SHOW_RING_AFTER) * 100));
    }
    raf = requestAnimationFrame(tick);
  }
  function down(e) {
    if (e.button !== undefined && e.button !== 0) return;
    fired = false; start = Date.now();
    raf = requestAnimationFrame(tick);
    timer = setTimeout(function () {
      fired = true; swallowClick = true; reset();
      if (navigator.vibrate) { try { navigator.vibrate(40); } catch (x) {} }
      openPad();
    }, HOLD_MS);
  }
  function up() { if (!fired) reset(); }
  logo.addEventListener("pointerdown", down);
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { logo.addEventListener(ev, up); });
  logo.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  logo.addEventListener("click", function (e) { if (swallowClick) { e.preventDefault(); e.stopImmediatePropagation(); swallowClick = false; } }, true);
  logo.addEventListener("dragstart", function (e) { e.preventDefault(); });

  /* ---------- PIN pad ---------- */
  var ov = null, entry = "", tries = 0, lockedUntil = 0, lastFocus = null;
  function openPad() {
    lastFocus = document.activeElement;
    entry = "";
    ov = document.createElement("div");
    ov.className = "gate"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("data-pv", "");
    ov.setAttribute("aria-label", t("title"));
    render();
    document.body.appendChild(ov);
    document.body.classList.add("gate-open");
    var first = ov.querySelector(".gk"); if (first) first.focus();
  }
  function close() {
    if (!ov) return;
    ov.remove(); ov = null; document.body.classList.remove("gate-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function dots() { var s = ""; for (var i = 0; i < 4; i++) s += '<i class="' + (i < entry.length ? "on" : "") + '"></i>'; return s; }
  function render(msg, bad) {
    var keys = "";
    ["1","2","3","4","5","6","7","8","9","",  "0","del"].forEach(function (k) {
      if (!k) { keys += '<span></span>'; return; }
      keys += k === "del"
        ? '<button type="button" class="gk gk-del" data-k="del" aria-label="' + t("del") + '"><svg viewBox="0 0 24 24"><path d="M9 6h11v12H9l-5-6z"/><path d="M12 10l4 4M16 10l-4 4"/></svg></button>'
        : '<button type="button" class="gk" data-k="' + k + '">' + k + "</button>";
    });
    ov.innerHTML =
      '<div class="gate-card">' +
      '<div class="gate-logo">' + logo.querySelector(".logo-mark").innerHTML.replace(/<span class="gate-ring[\s\S]*$/, "") + '</div>' +
      '<h2>' + t("title") + '</h2><p class="gate-sub">' + t("enter") + '</p>' +
      '<div class="gate-dots' + (bad ? " shake" : "") + '" aria-live="polite" aria-label="' + entry.length + ' / 4">' + dots() + '</div>' +
      '<p class="gate-msg" role="status">' + (msg || "") + '</p>' +
      '<div class="gate-keys">' + keys + '</div>' +
      '<button type="button" class="gate-cancel" data-k="cancel">' + t("cancel") + '</button></div>';
  }
  function renderWho() {
    ov.innerHTML = '<div class="gate-card"><div class="gate-logo">' + logo.querySelector(".logo-mark").innerHTML.replace(/<span class="gate-ring[\s\S]*$/, "") + '</div>' +
      '<h2>' + t("who") + '</h2><div class="gate-who">' +
      USERS.map(function (u) { return '<button type="button" class="gw" data-u="' + u.id + '"><span class="gw-av">' + u.name.charAt(0) + '</span>' + u.name + '</button>'; }).join("") +
      '</div><button type="button" class="gate-cancel" data-k="cancel">' + t("cancel") + '</button></div>';
    var b = ov.querySelector(".gw"); if (b) b.focus();
  }
  function press(k) {
    if (k === "cancel") return close();
    if (Date.now() < lockedUntil) { render(t("locked"), true); return; }
    if (k === "del") { entry = entry.slice(0, -1); render(); return; }
    if (entry.length >= 4) return;
    entry += k; render();
    if (entry.length === 4) {
      setTimeout(function () {
        if (entry === PIN) { tries = 0; renderWho(); }
        else {
          tries++; entry = "";
          if (tries >= MAX_TRIES) { lockedUntil = Date.now() + LOCK_MS; tries = 0; render(t("locked"), true); }
          else render(t("wrong"), true);
          if (navigator.vibrate) { try { navigator.vibrate([30, 40, 30]); } catch (x) {} }
        }
      }, 160);
    }
  }
  document.addEventListener("click", function (e) {
    if (!ov) return;
    var k = e.target.closest("[data-k]"), u = e.target.closest("[data-u]");
    if (k) { e.preventDefault(); press(k.getAttribute("data-k")); }
    else if (u) {
      e.preventDefault();
      var who = u.getAttribute("data-u"), user = USERS.filter(function (x) { return x.id === who; })[0];
      try { localStorage.setItem("ja-admin-user", user.name); sessionStorage.setItem("ja-owner", "1"); } catch (x) {}
      ov.querySelector(".gate-card").innerHTML = '<div class="gate-go"><span class="gate-spin"></span>' + t("opening") + "</div>";
      setTimeout(function () { location.href = ADMIN_URL; }, 450);
    }
  });
  document.addEventListener("keydown", function (e) {
    if (!ov) return;
    if (e.key === "Escape") { close(); return; }
    if (/^[0-9]$/.test(e.key) && ov.querySelector(".gate-keys")) { press(e.key); e.preventDefault(); }
    else if (e.key === "Backspace" && ov.querySelector(".gate-keys")) { press("del"); e.preventDefault(); }
  });

  /* ---------- preview tip for Javier and Xiomara (removed in the live build) ---------- */
  var HINT = {
    en: '<b>Javier and Xiomara:</b> press and hold the logo at the top left for 5 seconds to open your portal. Preview PIN: <b>' + PIN + '</b>',
    es: '<b>Javier y Xiomara:</b> mantengan presionado el logo de arriba a la izquierda por 5 segundos para abrir su panel. PIN de prueba: <b>' + PIN + '</b>'
  };
  var hintOff = false; try { hintOff = localStorage.getItem("ja-gate-hint") === "off"; } catch (x) {}
  if (!hintOff) {
    var h = document.createElement("div");
    h.className = "gate-hint"; h.setAttribute("data-pv", ""); h.setAttribute("role", "note");
    function paint() {
      h.innerHTML = '<svg class="gh-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg><span>' + HINT[lang()] + '</span>' +
        '<button type="button" class="gh-x" aria-label="' + (lang() === "es" ? "Cerrar" : "Close") + '"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    }
    paint();
    document.body.appendChild(h);
    new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    h.addEventListener("click", function (e) {
      if (e.target.closest(".gh-x")) { h.remove(); try { localStorage.setItem("ja-gate-hint", "off"); } catch (x) {} }
    });
  }
})();
