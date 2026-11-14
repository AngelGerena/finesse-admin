/* Customer quote page. The quote rides in the link (#...), so it opens anywhere: WhatsApp, email, text. */
(function () {
  "use strict";
  var MARK = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="3" y="5" width="28" height="12" rx="6" class="bm-roll"/><path d="M31 11h4v10H19v7" class="bm-frame"/><rect x="16" y="27" width="6" height="11" rx="2" class="bm-handle"/></svg>';
  var IC = {
    pdf: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1z"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>'
  };
  var TX = {
    en: { quote: "Quote", for_: "Prepared for", on: "on", total: "Total", dep: "Deposit to schedule", pdf: "Save as PDF", accept: "Accept this quote", call: "Call Javier",
      terms: "Free written estimate. Licensed and insured. The deposit holds your spot on the schedule, and the balance is due when the job is done. Prices are good for 30 days.",
      acceptMsg: function (id) { return "Hi Javier, I'd like to accept quote " + id + ". When can we get started?"; }, lic: "Lic." },
    es: { quote: "Cotización", for_: "Preparada para", on: "el", total: "Total", dep: "Depósito para agendar", pdf: "Guardar como PDF", accept: "Aceptar cotización", call: "Llamar a Javier",
      terms: "Estimado gratis por escrito. Con licencia y seguro. El depósito separa su fecha en la agenda, y el resto se paga al terminar el trabajo. Precios válidos por 30 días.",
      acceptMsg: function (id) { return "Hola Javier, quiero aceptar la cotización " + id + ". ¿Cuándo podemos empezar?"; }, lic: "Lic." }
  };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function money(n) { return "$" + Number(n || 0).toLocaleString("en-US"); }
  function digits(p) { var d = String(p || "").replace(/\D/g, ""); return d.length === 10 ? "1" + d : d; }
  var d = null;
  try {
    var h = location.hash.slice(1).replace(/-/g, "+").replace(/_/g, "/");
    while (h.length % 4) h += "=";
    d = JSON.parse(decodeURIComponent(escape(atob(h))));
  } catch (e) { d = null; }
  var root = document.getElementById("q");
  if (!d || !d.id || !d.items) { document.getElementById("qMissing").hidden = false; return; }
  var lang = d.lang === "es" ? "es" : "en";
  var logo = ""; try { logo = localStorage.getItem("ja-demo-logo") || ""; } catch (e) {}
  if (d.logo) logo = d.logo;
  function render() {
    var t = TX[lang], b = d.biz || [];
    document.documentElement.lang = lang;
    document.title = t.quote + " " + d.id + " | " + (b[0] || "JA Paint Pro");
    var tot = d.items.reduce(function (a, i) { return a + i[1] * i[2]; }, 0), dep = Math.round(tot * (d.dep || 0) / 100);
    var dt = new Date(d.on).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { year: "numeric", month: "long", day: "numeric" });
    var accept = "https://wa.me/" + digits(b[1]) + "?text=" + encodeURIComponent(t.acceptMsg(d.id));
    root.innerHTML =
      '<div class="lang" role="group" aria-label="Language"><button type="button" data-l="en" class="' + (lang === "en" ? "on" : "") + '">EN</button><button type="button" data-l="es" class="' + (lang === "es" ? "on" : "") + '">ES</button></div>' +
      '<article class="sheet"><div class="band"></div><header class="head">' +
      (logo ? '<img class="logo" src="' + esc(logo) + '" alt="' + esc(b[0]) + ' logo">' : '<span class="logo-ph">' + MARK + '<span class="word">JA PAINT<em>PRO</em></span></span>') +
      '<div class="biz"><b>' + esc(b[0]) + '</b><a href="tel:+' + digits(b[1]) + '">' + esc(b[1]) + "</a><br>" + esc(b[2]) + (b[3] ? "<br>" + t.lic + " " + esc(b[3]) : "") + "</div></header>" +
      '<section class="body"><div class="title"><h1>' + t.quote + "</h1><span>" + esc(d.id) + "</span></div>" +
      '<p class="for">' + t.for_ + " <b>" + esc(d.to) + "</b> " + t.on + " " + esc(dt) + "</p>" +
      d.items.map(function (i) { return '<div class="line"><span>' + esc(i[0]) + (i[1] > 1 ? " x" + i[1] : "") + "</span><b>" + money(i[1] * i[2]) + "</b></div>"; }).join("") +
      '<div class="line tot"><span>' + t.total + "</span><b>" + money(tot) + "</b></div>" +
      '<div class="line dep"><span>' + t.dep + " (" + esc(d.dep) + "%)</span><b>" + money(dep) + "</b></div>" +
      '<p class="terms">' + t.terms + "</p>" +
      '<div class="acts"><a class="btn wa" href="' + accept + '" target="_blank" rel="noopener">' + IC.ok + t.accept + '</a><a class="btn" href="tel:+' + digits(b[1]) + '">' + IC.call + t.call + '</a><button type="button" class="btn" id="pdf">' + IC.pdf + t.pdf + "</button></div>" +
      "</section></article>" +
      '<p class="foot">' + esc(b[0]) + ' &middot; <a href="https://finessemedia.pro" target="_blank" rel="noopener" class="no-print">Crafted by Finesse Media</a></p>';
    document.getElementById("pdf").addEventListener("click", function () { window.print(); });
    Array.prototype.forEach.call(root.querySelectorAll(".lang button"), function (x) { x.addEventListener("click", function () { lang = x.getAttribute("data-l"); render(); }); });
  }
  render();
})();
