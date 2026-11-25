/* Pressa preview: shows the owner's back office changes on the website.
   Text: only the words inside tagged blocks ([data-ek]) can change, and every value is
   inserted as plain text ([brackets] become the orange highlight), so an edit can't break the layout.
   Photos and videos: a replaced slot shows the owner's upload; the gallery shows the built-in
   photos the owner kept plus anything uploaded from the back office.
   PREVIEW: everything is saved in this browser. The live build reads the same fields from Supabase. */
(function () {
  "use strict";
  var F = window.PRESSA_FIELDS || [], FM = {};
  F.forEach(function (f) { FM[f.k] = f; });
  var M = window.PRESSA_MEDIA;
  function readJ(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function rich(v) { return esc(v).replace(/\[([^\]\n]+)\]/g, "<em>$1</em>").replace(/\n/g, "<br>"); }

  /* ---------- words ---------- */
  function applyText() {
    var c = readJ("pressa-site-content", {});
    Array.prototype.forEach.call(document.querySelectorAll("[data-ek]"), function (el) {
      if (el._orig === undefined) el._orig = el.innerHTML;
      var k = el.getAttribute("data-ek"), l = el.getAttribute("data-l"), o = c[k];
      var html = (o && o[l] && FM[k]) ? rich(o[l]) : el._orig;
      if (el.innerHTML !== html) el.innerHTML = html;
    });
  }

  /* ---------- business details ---------- */
  var BIZ0 = { nameHiram: "Hiram Díaz", phoneHiram: "(787) 460-3010", nameFelix: "Felix Ortiz", phoneFelix: "(321) 203-8541", email: "pressatools@gmail.com", instagram: "pressatools", facebook: "" };
  function digits(p) { var d = String(p || "").replace(/\D/g, ""); return d.length === 10 ? "1" + d : d; }
  function applyBiz() {
    var b = Object.assign({}, BIZ0, readJ("pressa-biz", {}));
    function el(k) { return document.querySelector('[data-bind="' + k + '"]'); }
    var e;
    if ((e = el("email"))) { e.href = "mailto:" + b.email; e.textContent = b.email; }
    [["phoneHiram", "nameHiram"], ["phoneFelix", "nameFelix"]].forEach(function (p) {
      var a = el(p[0]); if (!a) return;
      a.href = "tel:+" + digits(b[p[0]]);
      var n = a.querySelector(".ct-num"), nm = a.querySelector("[data-bind-name]");
      if (n) n.textContent = b[p[0]]; if (nm) nm.textContent = b[p[1]];
    });
    if ((e = el("instagram"))) { var ig = String(b.instagram || "").replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""); e.href = "https://instagram.com/" + ig; e.textContent = "@" + ig; }
    if ((e = el("facebook")) && b.facebook) e.href = /^https?:/.test(b.facebook) ? b.facebook : "https://facebook.com/" + b.facebook.replace(/^@/, "");
    if ((e = el("whatsapp"))) e.href = e.href.replace(/wa\.me\/\d+/, "wa.me/" + digits(b.phoneHiram));
  }

  /* ---------- store ---------- */
  function applyStore() {
    var s = readJ("pressa-store", {}), btn = document.getElementById("checkoutBtn");
    if (btn) {
      var closed = s.open === false;
      btn.disabled = closed; btn.classList.toggle("is-closed", closed);
      var note = btn.querySelector(".closed-note");
      if (closed && !note) { btn.insertAdjacentHTML("beforeend", '<span class="closed-note"><span data-l="en">Pre-orders are closed for now</span><span data-l="es">Las pre-órdenes están cerradas por ahora</span></span>'); }
      if (!closed && note) note.remove();
    }
  }

  /* ---------- photos and videos ---------- */
  var urls = [], galleryBox = document.querySelector("#built .gallery"), BUILT = [];
  if (galleryBox) Array.prototype.forEach.call(galleryBox.children, function (n) { BUILT.push({ node: n, src: n.dataset.img }); });
  var slotOrig = {};
  Array.prototype.forEach.call(document.querySelectorAll("[data-slot]"), function (el, i) {
    el._slotI = i; slotOrig[i] = { src: el.getAttribute("src"), poster: el.getAttribute("poster"), html: el.innerHTML };
  });
  function setSlot(el, rec, url) {
    var o = slotOrig[el._slotI];
    if (el.tagName === "IMG") { el.src = rec ? url : o.src; if (rec) el.removeAttribute("srcset"); return; }
    if (rec) {
      if (el.getAttribute("src") === url) return;
      el.removeAttribute("poster"); el.innerHTML = ""; el.src = url;
    } else {
      if (!el.getAttribute("src")) return;
      el.removeAttribute("src"); el.innerHTML = o.html; if (o.poster) el.setAttribute("poster", o.poster);
    }
    el.load();
    if (el.autoplay || el.classList.contains("b-loop")) { el.muted = true; var p = el.play(); if (p && p.catch) p.catch(function () {}); }
  }
  function applyMedia() {
    if (!M) return;
    var meta = M.meta();
    M.all().then(function (ups) {
      urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = [];
      var bySlot = {}, gal = [];
      ups.sort(function (a, b) { return b.created - a.created; }).forEach(function (u) {
        if (!u.blob || u.deleted || u.purged) return;
        if (u.slot && u.slot !== "gallery") { if (!bySlot[u.slot] && u.published !== false) bySlot[u.slot] = u; }
        else if (u.published) gal.push(u);
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-slot]"), function (el) {
        var rec = bySlot[el.getAttribute("data-slot")], url = null;
        if (rec) { if (!rec._url) { rec._url = URL.createObjectURL(rec.blob); urls.push(rec._url); } url = rec._url; }
        setSlot(el, rec, url);
      });
      window.PRESSA_MAIN_SRC = bySlot.main ? bySlot.main._url : null;
      if (!galleryBox) return;
      var frag = document.createDocumentFragment();
      BUILT.forEach(function (g) {
        var m = meta[M.idFor(g.src)] || {};
        if (m.deleted || m.published === false) return;
        frag.appendChild(g.node);
      });
      gal.forEach(function (u) {
        var src = URL.createObjectURL(u.blob); urls.push(src);
        var b = document.createElement("button");
        b.className = "g-item rv in" + (u.tall ? " g-tall" : ""); b.dataset.img = src; b.dataset.kind = u.kind;
        b.setAttribute("aria-label", u.alt || "Pressa");
        b.innerHTML = (u.kind === "video" ? '<video src="' + src + '#t=0.1" muted playsinline preload="metadata"></video><i class="g-playi" aria-hidden="true"></i>' : '<img src="' + src + '" alt="' + esc(u.alt || "") + '" loading="lazy">') +
          (u.alt ? '<span class="g-cap">' + esc(u.alt) + "</span>" : "");
        frag.appendChild(b);
      });
      galleryBox.innerHTML = ""; galleryBox.appendChild(frag);
      var head = document.querySelector("#built .g-head"); if (head) head.hidden = !galleryBox.children.length;
    });
  }

  function applyAll() { applyText(); applyBiz(); applyStore(); }
  window.PRESSA_LIVE = { apply: applyAll, media: applyMedia };
  applyAll(); applyMedia();

  window.addEventListener("storage", function (e) {
    if (e.key === "pressa-site-content") applyText();
    else if (e.key === "pressa-biz") applyBiz();
    else if (e.key === "pressa-store") location.reload();
    else if (e.key === "pressa-media-rev" || e.key === "pressa-media-meta") applyMedia();
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) { applyAll(); applyMedia(); } });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { applyText(); applyBiz(); } });
})();
