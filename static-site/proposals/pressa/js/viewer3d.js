/* Pressa 3D viewer: any [data-3d] button opens a full-screen pop-up where the
   visitor can spin the stand, pinch or scroll to zoom, and (on phones that
   support it) place it in their own space with AR.
   Numbered notes are pinned to the real parts (positions come from Hiram's
   SolidWorks files). A note opens when it is tapped, when the visitor zooms in
   close to it, or during the guided Tour, which flies the camera part to part.
   The 3D library (~1 MB) only loads the first time someone opens the viewer,
   so it never slows down the page. */
(function () {
  "use strict";
  var MODEL = "models/pressa-stand.glb";
  var LIB = "js/vendor/model-viewer.min.js";
  var HOME = "155deg 82deg 100%"; /* the PRESSA logo side faces the visitor */
  /* camera for each note in the Tour: theta, phi, distance */
  var VIEWS = {
    hub: "18deg 80deg 0.95m",
    arm: "200deg 82deg 1.05m",
    brackets: "28deg 52deg 0.95m",
    knobs: "-32deg 50deg 0.85m",
    base: "60deg 62deg 1.5m"
  };
  var modal = document.getElementById("v3d");
  if (!modal) return;
  var stage = modal.querySelector(".v3d-stage");
  var bar = modal.querySelector(".v3d-bar i");
  var load = modal.querySelector(".v3d-load");
  var err = modal.querySelector(".v3d-err");
  var card = modal.querySelector(".v3d-card");
  var spots = Array.prototype.slice.call(modal.querySelectorAll(".v3d-hs"));
  var lastFocus = null, mv = null, libP = null;
  var active = -1, how = "", homeR = 0, raf = 0;

  function loadLib() {
    if (libP) return libP;
    libP = new Promise(function (res, rej) {
      if (window.customElements && customElements.get("model-viewer")) { res(); return; }
      var s = document.createElement("script");
      s.type = "module"; s.src = LIB;
      s.onload = function () { customElements.whenDefined("model-viewer").then(res); };
      s.onerror = rej;
      document.head.appendChild(s);
    });
    return libP;
  }

  function name(i) { return spots[i].getAttribute("slot").replace("hotspot-", ""); }

  /* ---------- notes ---------- */
  function fillCard() {
    if (active < 0) return;
    var s = spots[active];
    card.querySelector(".v3d-card-n").textContent = (active + 1) + " / " + spots.length;
    card.querySelector(".v3d-card-t").innerHTML = s.querySelector(".hs-lbl").innerHTML;
    card.querySelector(".v3d-card-d").innerHTML = s.querySelector(".hs-desc").innerHTML;
  }
  function show(i, mode) {
    if (i === active && mode === how) return;
    active = i; how = mode;
    spots.forEach(function (s, j) { s.classList.toggle("on", j === i); });
    if (i < 0) { card.hidden = true; modal.classList.remove("noting"); return; }
    fillCard();
    card.hidden = false;
    modal.classList.add("noting");
    if (mv) mv.removeAttribute("auto-rotate");
  }
  function fly(i) {
    if (!mv) return;
    var s = spots[i];
    show(i, "tour");
    /* auto-rotate spins the model itself, so square it up first or the camera lands on the wrong side */
    if (mv.resetTurntableRotation) mv.resetTurntableRotation(0);
    mv.cameraTarget = s.getAttribute("data-position");
    mv.cameraOrbit = VIEWS[name(i)] || HOME;
  }
  function closeNote() {
    var wasTour = how === "tour";
    show(-1, "");
    if (wasTour && mv) { mv.setAttribute("auto-rotate", ""); mv.cameraTarget = "auto auto auto"; mv.cameraOrbit = HOME; }
  }

  /* zooming in close to a part opens its note on its own */
  function scan() {
    raf = 0;
    if (!mv || !homeR) return;
    var r = mv.getCameraOrbit().radius;
    var zoomed = r < homeR * 0.72;
    modal.classList.toggle("zoomed", zoomed);
    var w = mv.clientWidth, h = mv.clientHeight, best = -1, bestD = Infinity;
    spots.forEach(function (s, i) {
      var q = mv.queryHotspot && mv.queryHotspot(spots[i].getAttribute("slot"));
      if (!q) return;
      var x = q.canvasPosition.x, y = q.canvasPosition.y;
      var lw = s.querySelector(".hs-lbl").offsetWidth || 160;
      s.classList.toggle("flip", x + 34 + lw > w - 8 && x - 34 - lw > 8);
      if (!q.facingCamera || !s.hasAttribute("data-visible")) return;
      var d = Math.hypot(x - w / 2, y - h / 2);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (how === "tour" || how === "tap") return;
    if (zoomed && best > -1 && bestD < Math.min(w, h) * 0.3) show(best, "zoom");
    else if (how === "zoom") show(-1, "");
  }
  function queue() { if (!raf) raf = requestAnimationFrame(scan); }

  function build() {
    mv = document.createElement("model-viewer");
    var a = {
      src: MODEL,
      alt: "Pressa Stand 360, 3D model",
      "camera-controls": "",
      "touch-action": "none",
      "auto-rotate": "",
      "auto-rotate-delay": "2500",
      "rotation-per-second": "18deg",
      "interaction-prompt": "none",
      "shadow-intensity": "1.1",
      "shadow-softness": "0.9",
      exposure: "1.1",
      "environment-image": "neutral",
      "camera-orbit": HOME,
      "min-camera-orbit": "auto 10deg 0.55m",
      "max-camera-orbit": "auto 100deg 220%",
      "field-of-view": "30deg",
      "interpolation-decay": "120",
      ar: "",
      "ar-modes": "webxr scene-viewer quick-look",
      "ar-scale": "fixed",
      loading: "eager"
    };
    Object.keys(a).forEach(function (k) { mv.setAttribute(k, a[k]); });
    spots.forEach(function (s) { mv.appendChild(s); });
    var arBtn = modal.querySelector(".v3d-ar");
    if (arBtn) { arBtn.setAttribute("slot", "ar-button"); mv.appendChild(arBtn); }
    mv.addEventListener("progress", function (e) {
      var p = Math.round((e.detail.totalProgress || 0) * 100);
      bar.style.width = p + "%";
      if (p >= 100) setTimeout(function () { load.hidden = true; }, 250);
    });
    mv.addEventListener("load", function () {
      load.hidden = true; modal.classList.add("ready");
      setTimeout(function () { homeR = mv.getCameraOrbit().radius; queue(); }, 60);
    });
    mv.addEventListener("error", function () { load.hidden = true; err.hidden = false; });
    mv.addEventListener("camera-change", function (e) {
      if (e.detail && e.detail.source === "user-interaction") {
        modal.classList.add("touched");
        if (how === "tour") how = "tap"; /* they took the wheel: keep the note, stop steering */
      }
      queue();
    });
    stage.appendChild(mv);
  }

  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add("v3d-open");
    requestAnimationFrame(function () { modal.classList.add("on"); });
    var x = modal.querySelector(".v3d-x"); if (x) x.focus();
    if (mv) return;
    load.hidden = false; err.hidden = true; bar.style.width = "4%";
    loadLib().then(build).catch(function () { load.hidden = true; err.hidden = false; });
  }
  function close() {
    show(-1, "");
    modal.classList.remove("on");
    document.documentElement.classList.remove("v3d-open");
    setTimeout(function () { modal.hidden = true; }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function reset() {
    if (!mv) return;
    show(-1, "");
    mv.cameraTarget = "auto auto auto";
    mv.cameraOrbit = HOME;
    mv.fieldOfView = "30deg";
    mv.setAttribute("auto-rotate", "");
    mv.resetTurntableRotation && mv.resetTurntableRotation();
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-3d]")) { e.preventDefault(); open(); return; }
    if (modal.hidden) return;
    var hs = e.target.closest(".v3d-hs");
    if (hs) { var i = spots.indexOf(hs); if (i === active) closeNote(); else show(i, "tap"); return; }
    if (e.target.closest(".v3d-tour")) { if (mv && modal.classList.contains("ready")) fly(0); return; }
    if (e.target.closest(".v3d-next")) { fly((active + 1) % spots.length); return; }
    if (e.target.closest(".v3d-prev")) { fly((active - 1 + spots.length) % spots.length); return; }
    if (e.target.closest(".v3d-card-x")) { closeNote(); return; }
    if (e.target.closest(".v3d-x") || e.target === modal) { close(); return; }
    if (e.target.closest(".v3d-reset")) reset();
  });
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") { if (active > -1) closeNote(); else close(); }
    else if (active > -1 && e.key === "ArrowRight") fly((active + 1) % spots.length);
    else if (active > -1 && e.key === "ArrowLeft") fly((active - 1 + spots.length) % spots.length);
  });
  /* back office edits and language switches refresh the open note */
  document.addEventListener("pressa:render", fillCard);
  new MutationObserver(fillCard).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  window.PRESSA_3D = { open: open, close: close, tour: function () { fly(0); } };
})();
