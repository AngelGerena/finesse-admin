/* JA Paint Pro preview: shows the owner's saved edits on the website.
   Text: only the words inside tagged blocks ([data-edit]) can change, and every
   value is inserted as plain text, so an edit can't break the layout.
   Gallery: built-in photos plus anything uploaded from the admin. */
(function () {
  var F = window.JA_FIELDS || [], FM = {};
  F.forEach(function (f) { FM[f.k] = f; });
  var M = window.JA_MEDIA;

  function content() { try { return JSON.parse(localStorage.getItem("ja-site-content")) || {}; } catch (e) { return {}; } }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lang() { return document.documentElement.lang === "es" ? "es" : "en"; }

  function applyText() {
    var c = content(), l = lang();
    Array.prototype.forEach.call(document.querySelectorAll("[data-edit]"), function (el) {
      var k = el.getAttribute("data-edit"), f = FM[k];
      if (!f) return;
      var o = c[k], has = o && (o.en || o.es);
      if (!has && !el.hasAttribute("data-live")) return; /* untouched: leave the original alone */
      var v = (has && o[l]) ? o[l] : f[l];
      var html = esc(v).replace(/\n/g, "<br>");
      if (el.innerHTML !== html) el.innerHTML = html;
      el.setAttribute("data-pv", ""); el.setAttribute("data-live", "1");
    });
  }

  /* ---------- gallery ---------- */
  var BUILT = (window.JA_GALLERY || []).slice(), urls = [];
  function gallery() {
    if (!M || !window.JA_setGallery) return;
    var meta = M.meta();
    M.all().then(function (ups) {
      urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = [];
      var list = ups.filter(function (u) { return u.published && !u.deleted && u.blob; })
        .sort(function (a, b) { return b.created - a.created; })
        .map(function (u) {
          var src = URL.createObjectURL(u.blob); urls.push(src);
          return { src: src, cat: u.cat || "exterior", alt: u.alt || "", kind: u.kind };
        });
      BUILT.forEach(function (g) {
        var m = meta[M.idFor(g.src)] || {};
        if (m.deleted || m.published === false) return;
        list.push({ src: g.src, cat: m.cat || g.cat, alt: m.alt || g.alt, kind: "image" });
      });
      window.JA_setGallery(list);
    });
  }

  function apply() { applyText(); }
  window.JA_LIVE = { apply: apply, gallery: gallery };
  apply(); gallery();

  window.addEventListener("storage", function (e) {
    if (e.key === "ja-site-content") applyText();
    if (e.key === "ja-media-rev" || e.key === "ja-media-meta") gallery();
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) { applyText(); gallery(); } });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { applyText(); gallery(); } });
})();
