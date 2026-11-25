/* Pressa 3D viewer: any [data-3d] button opens a full-screen pop-up where the
   visitor can spin the stand, pinch or scroll to zoom, and (on phones that
   support it) place it in their own space with AR.
   The 3D library (~1 MB) only loads the first time someone opens the viewer,
   so it never slows down the page. */
(function () {
  "use strict";
  var MODEL = "models/pressa-stand.glb";
  var LIB = "js/vendor/model-viewer.min.js";
  var modal = document.getElementById("v3d");
  if (!modal) return;
  var stage = modal.querySelector(".v3d-stage");
  var bar = modal.querySelector(".v3d-bar i");
  var load = modal.querySelector(".v3d-load");
  var err = modal.querySelector(".v3d-err");
  var lastFocus = null, mv = null, libP = null;

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
      exposure: "1.2",
      "environment-image": "neutral",
      "camera-orbit": "135deg 78deg 100%",
      "min-camera-orbit": "auto 10deg 35%",
      "max-camera-orbit": "auto 100deg 220%",
      "field-of-view": "30deg",
      ar: "",
      "ar-modes": "webxr scene-viewer quick-look",
      "ar-scale": "fixed",
      loading: "eager"
    };
    Object.keys(a).forEach(function (k) { mv.setAttribute(k, a[k]); });
    var arBtn = modal.querySelector(".v3d-ar");
    if (arBtn) { arBtn.setAttribute("slot", "ar-button"); mv.appendChild(arBtn); }
    mv.addEventListener("progress", function (e) {
      var p = Math.round((e.detail.totalProgress || 0) * 100);
      bar.style.width = p + "%";
      if (p >= 100) setTimeout(function () { load.hidden = true; }, 250);
    });
    mv.addEventListener("load", function () { load.hidden = true; modal.classList.add("ready"); });
    mv.addEventListener("error", function () { load.hidden = true; err.hidden = false; });
    mv.addEventListener("camera-change", function (e) {
      if (e.detail && e.detail.source === "user-interaction") modal.classList.add("touched");
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
    modal.classList.remove("on");
    document.documentElement.classList.remove("v3d-open");
    setTimeout(function () { modal.hidden = true; }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function reset() {
    if (!mv) return;
    mv.cameraOrbit = "135deg 78deg 100%";
    mv.cameraTarget = "auto auto auto";
    mv.fieldOfView = "30deg";
    mv.resetTurntableRotation && mv.resetTurntableRotation();
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-3d]")) { e.preventDefault(); open(); return; }
    if (modal.hidden) return;
    if (e.target.closest(".v3d-x") || e.target === modal) { close(); return; }
    if (e.target.closest(".v3d-reset")) reset();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
  window.PRESSA_3D = { open: open, close: close };
})();
