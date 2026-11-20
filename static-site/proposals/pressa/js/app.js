(function () {
  var root = document.documentElement;
  var ANGEL = "14079609004";
  var LOOKS = { a: "A (Studio)", b: "B (Precision)", c: "C (Editorial)", d: "D (Steel)", e: "E (Red Block)", f: "F (Black & Orange)" };
  var PRICE = 1497; // Hiram's estimated price
  var current = "a", variant = "1";
  var VNAMES = { "1": ["Bookends", "Extremos"], "2": ["Alternating", "Alternado"], "3": ["Full Contrast", "Contraste total"] };
  var G = "#232326", D = "#141414", W = "#ffffff", A = "#f5f3f0", O = "#e8681c";
  var VARIANTS = {
    "1": { dk: [".hero", "footer.foot"], div: { d1: [D, G], d2: [W, A], d3: [O, A], d4: [W, A] } },
    "2": { dk: ["#how", "#story"], div: { d1: [W, D], d2: [W, A], d3: [O, D], d4: [W, A] } },
    "3": { dk: [".hero", ".made", "#story", "#contact", "footer.foot"], div: { d1: [D, G], d2: [D, A], d3: [O, D], d4: [W, D] } }
  };
  function clearVariant() {
    document.querySelectorAll("main .dk, footer.dk").forEach(function (e) { e.classList.remove("dk", "dk2"); });
    document.querySelectorAll(".divider").forEach(function (d) { d.style.removeProperty("--top"); d.style.removeProperty("--bot"); });
  }
  function applyVariant() {
    clearVariant();
    var box = document.getElementById("fVariants");
    if (box) box.hidden = current !== "f";
    if (current !== "f") return;
    var v = VARIANTS[variant];
    v.dk.forEach(function (sel) { var e = document.querySelector(sel); if (e) e.classList.add("dk"); });
    Object.keys(v.div).forEach(function (k) { var d = document.querySelector(".divider." + k); if (d) { d.style.setProperty("--top", v.div[k][0]); d.style.setProperty("--bot", v.div[k][1]); } });
    document.querySelectorAll(".vchip").forEach(function (c) { c.classList.toggle("on", c.dataset.v === variant); });
  }

  // ---------- picker height -> sticky nav offset ----------
  var picker = document.getElementById("picker");
  function setPk() { root.style.setProperty("--pk", picker.offsetHeight + "px"); }
  window.addEventListener("resize", setPk); setPk();

  // ---------- language ----------
  var langBtn = document.getElementById("langBtn");
  function setLang(l) {
    root.lang = l;
    langBtn.textContent = l === "en" ? "ES" : "EN";
    document.querySelectorAll("[data-ph-en]").forEach(function (el) {
      el.placeholder = el.getAttribute("data-ph-" + l);
    });
    try { localStorage.setItem("pressa-lang", l); } catch (e) {}
    updateWant(); setPk();
  }
  langBtn.addEventListener("click", function () { setLang(root.lang === "en" ? "es" : "en"); });

  // ---------- looks ----------
  var chips = document.querySelectorAll(".chip");
  function setLook(k) {
    current = k;
    root.classList.remove("look-a", "look-b", "look-c", "look-d", "look-e", "look-f");
    root.classList.add("look-" + k);
    chips.forEach(function (c) { c.classList.toggle("on", c.dataset.look === k); if (c.dataset.look === k && c.parentNode.scrollWidth > c.parentNode.clientWidth) { c.parentNode.scrollLeft = c.offsetLeft - c.parentNode.offsetLeft - 8; } });
    try { localStorage.setItem("pressa-look2", k); } catch (e) {}
    applyVariant(); setPk && setPk();
    updateWant();
  }
  chips.forEach(function (c) { c.addEventListener("click", function () { setLook(c.dataset.look); }); });
  document.querySelectorAll(".vchip").forEach(function (c) {
    c.addEventListener("click", function () { variant = c.dataset.v; applyVariant(); updateWant(); });
  });

  // ---------- "I want this one" (WhatsApp + SMS backup to Angel) ----------
  var wa = document.getElementById("wantWa"), sms = document.getElementById("wantSms");
  function updateWant() {
    var es = root.lang === "es";
    var msg = es
      ? "Hola Angel, soy Hiram. Quiero la opción " + variant + " (" + VNAMES[variant][1] + ") para la página de Pressa."
      : "Hi Angel, it's Hiram. I want option " + variant + " (" + VNAMES[variant][0] + ") for the Pressa website.";
    var t = encodeURIComponent(msg);
    wa.href = "https://wa.me/" + ANGEL + "?text=" + t;
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    sms.href = "sms:+" + ANGEL + (ios ? "&" : "?") + "body=" + t;
  }

  // ---------- shop: color + qty + subtotal ----------
  var qty = document.getElementById("qty"), sub = document.getElementById("subtotal");
  var fmt = function (n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  function clampQty() {
    var v = parseInt(qty.value, 10);
    if (isNaN(v) || v < 1) v = 1; if (v > 99) v = 99;
    qty.value = v; sub.textContent = fmt(v * PRICE);
  }
  document.getElementById("minus").addEventListener("click", function () { qty.value = (parseInt(qty.value, 10) || 1) - 1; clampQty(); });
  document.getElementById("plus").addEventListener("click", function () { qty.value = (parseInt(qty.value, 10) || 0) + 1; clampQty(); });
  qty.addEventListener("input", function () { if (qty.value !== "") clampQty(); });
  qty.addEventListener("blur", clampQty);
  document.getElementById("unitPrice").textContent = fmt(PRICE); clampQty();

  var COLORS = { black: { en: "Black", es: "Negro", hex: "#1b1b1d" }, orange: { en: "Orange", es: "Anaranjada", hex: "#e8681c" } };
  var colorName = document.getElementById("colorName");
  function setColor(k) {
    document.querySelectorAll(".sw").forEach(function (s) { s.classList.toggle("on", s.dataset.color === k); });
    colorName.innerHTML = '<span data-l="en">' + COLORS[k].en + '</span><span data-l="es">' + COLORS[k].es + "</span>";
  }
  document.querySelectorAll(".sw").forEach(function (s) { s.addEventListener("click", function () { setColor(s.dataset.color); }); });
  setColor("orange");

  // ---------- toast ----------
  var toast = document.getElementById("toast"), tt;
  function say(en, es) {
    toast.textContent = root.lang === "es" ? es : en; toast.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { toast.hidden = true; }, 3200);
  }
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    say("Preview only: this opens secure Stripe checkout at launch.", "Vista previa: aquí se abre el pago seguro de Stripe al lanzar.");
  });

  // ---------- videos (play inside the page) ----------
  var cine = document.getElementById("cine"), cineVid = document.getElementById("cineVid");
  document.getElementById("cinePlay").addEventListener("click", function () {
    cine.classList.add("playing"); cineVid.controls = true; cineVid.muted = false;
    var p = cineVid.play(); if (p && p.catch) p.catch(function () {});
  });
  cineVid.addEventListener("ended", function () { cine.classList.remove("playing"); cineVid.controls = false; cineVid.currentTime = 0; });
  document.querySelectorAll("[data-video]").forEach(function (b) {
    b.addEventListener("click", function () {
      openModal('<video class="vmodal-vid" controls playsinline autoplay poster="images/video-poster.jpg"><source src="video/pressa-video.mp4" type="video/mp4"></video>', true);
      var v = body.querySelector("video"); var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
  });
  var heroVid = document.querySelector(".hero-vid");
  if (heroVid) { heroVid.muted = true; var hp = heroVid.play(); if (hp && hp.catch) hp.catch(function () {}); }

  // ---------- how it's made: loops play only when visible ----------
  var loops = document.querySelectorAll(".b-loop");
  if ("IntersectionObserver" in window) {
    var lo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.35 });
    loops.forEach(function (v) { lo.observe(v); });
  }
  document.querySelectorAll(".b-step").forEach(function (b) {
    b.addEventListener("click", function () {
      var tall = b.querySelector(".b-tall") ? " tall" : "";
      openModal('<video class="vmodal-vid' + tall + '" controls playsinline autoplay poster="' + b.dataset.poster + '"><source src="' + b.dataset.src + '" type="video/mp4"></video>', true);
      var v = body.querySelector("video"); var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
  });
  document.querySelectorAll(".g-item").forEach(function (g) {
    g.addEventListener("click", function () {
      openModal('<img class="vmodal-img" src="' + g.dataset.img + '" alt="">', true);
    });
  });

  // ---------- scroll reveal ----------
  var rvs = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    rvs.forEach(function (el) { io.observe(el); });
  } else { rvs.forEach(function (el) { el.classList.add("in"); }); }

  // ---------- forms (preview) ----------
  document.querySelectorAll("form[data-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      f.querySelectorAll("input,textarea,button").forEach(function (el) { el.disabled = true; });
      f.querySelector(".ok").hidden = false;
    });
  });

  // ---------- policies modal ----------
  var POL = {
    shipping: ["Shipping Policy", "Política de envíos", "USA only, real carrier rates at checkout, packed and shipped by Pressa from Florida.", "Solo EE. UU., tarifas reales al pagar, empacado y enviado por Pressa desde Florida."],
    terms: ["Terms of Service", "Términos de servicio", "Standard store terms, drafted for attorney review.", "Términos estándar de la tienda, redactados para revisión legal."],
  };
  var modal = document.getElementById("modal"), body = document.getElementById("modalBody");
  var box = document.querySelector(".modal-box");
  function openModal(html, wide) { body.innerHTML = html; box.classList.toggle("wide", !!wide); box.classList.remove("pat"); modal.hidden = false; }
  function closeModal() { var v = body.querySelector("video"); if (v) v.pause(); body.innerHTML = ""; modal.hidden = true; }
  document.getElementById("modalX").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  // patents pop-up
  var PAT = [
    ["U.S. Patent 11,878,404 B2", "Utility patent", "Patente de utilidad", "Covers the Pressa Stand 360 system", "Protege el sistema Pressa Stand 360"],
    ["U.S. Design Patent D1,120,726 S", "Design patent · Granted Mar. 31, 2026", "Patente de diseño · Otorgada el 31 de marzo de 2026", "Paint stand wood door holder", "Sujetador de puertas de madera para soporte de pintura"],
    ["U.S. Design Patent D1,122,062 S", "Design patent · Granted Apr. 14, 2026", "Patente de diseño · Otorgada el 14 de abril de 2026", "Paint stand metal door holder", "Sujetador de puertas de metal para soporte de pintura"]
  ];
  function patentsHTML() {
    var es = root.lang === "es", rows = PAT.map(function (p) {
      return '<li><b>' + p[0] + '</b><span class="pm-type">' + (es ? p[2] : p[1]) + '</span><span>' + (es ? p[4] : p[3]) + '</span></li>';
    }).join("");
    return '<p class="pm-eye">' + (es ? "Patentes y marcas" : "Patents & trademarks") + '</p>' +
      '<h3>' + (es ? "Protegido por 3 patentes de EE. UU." : "Protected by 3 U.S. patents") + '</h3>' +
      '<ul class="pm-list">' + rows + '</ul>' +
      '<p class="pm-tm">' + (es ? "PRESSA&trade; y el logo JL son marcas registradas en Puerto Rico de Hiram Díaz Moreno (Reg. 238607, 238608, 238609)." : "PRESSA&trade; and the JL logo are Puerto Rico registered trademarks of Hiram Díaz Moreno (Reg. 238607, 238608, 238609).") + '</p>' +
      '<a class="pm-link" href="patents.html">' + (es ? "Ver página de patentes" : "View patents page") + '</a>';
  }
  document.querySelectorAll("[data-patents]").forEach(function (b) {
    b.addEventListener("click", function () { openModal(patentsHTML(), false); box.classList.add("pat"); });
  });

  document.querySelectorAll("[data-policy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = POL[b.dataset.policy], es = root.lang === "es";
      openModal("<h3>" + (es ? p[1] : p[0]) + "</h3><p>" + (es ? p[3] : p[2]) + "</p>");
    });
  });

  // ---------- init ----------
  var savedLook = "a", savedLang = "es";
  try { savedLook = localStorage.getItem("pressa-look2") || "a"; savedLang = localStorage.getItem("pressa-lang") || "es"; } catch (e) {}
  setLook("f");
  setLang(savedLang === "en" ? "en" : "es");
})();

// ---------- landing intro ----------
(function () {
  var root = document.documentElement, intro = document.getElementById("intro");
  if (!intro) return;
  var bg = intro.querySelector(".intro-bg");
  root.classList.add("intro-open");
  if (bg) { bg.muted = true; var p = bg.play(); if (p && p.catch) p.catch(function () {}); }
  function enter() {
    if (intro.classList.contains("gone")) return;
    window.scrollTo(0, 0);
    intro.classList.add("gone");
    root.classList.remove("intro-open");
    setTimeout(function () { intro.classList.add("hidden"); if (bg) bg.pause(); }, 950);
  }
  function show() {
    intro.classList.remove("hidden");
    requestAnimationFrame(function () { intro.classList.remove("gone"); });
    root.classList.add("intro-open");
    if (bg) { var p = bg.play(); if (p && p.catch) p.catch(function () {}); }
  }
  document.getElementById("introEnter").addEventListener("click", enter);
  document.getElementById("introScroll").addEventListener("click", enter);
  intro.addEventListener("wheel", function (e) { if (e.deltaY > 30) enter(); }, { passive: true });
  var ty = null;
  intro.addEventListener("touchstart", function (e) { ty = e.touches[0].clientY; }, { passive: true });
  intro.addEventListener("touchend", function (e) {
    if (ty !== null && ty - e.changedTouches[0].clientY > 70 && intro.scrollTop + intro.clientHeight >= intro.scrollHeight - 4) enter();
    ty = null;
  }, { passive: true });
  document.addEventListener("keydown", function (e) { if (!intro.classList.contains("gone") && (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ")) { if (document.activeElement && document.activeElement.closest && document.activeElement.closest("#picker")) return; e.preventDefault(); enter(); } });
  var logo = document.querySelector(".nav .logo");
  if (logo) logo.addEventListener("click", function (e) { e.preventDefault(); show(); });
})();


// ---------- premium motion: progress bar, counters ----------
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = document.getElementById("siteNav"), bar = document.getElementById("scrollBar");
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight, y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    if (nav) nav.classList.toggle("scrolled", y > 10);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();
  // number counters
  var counters = [].slice.call(document.querySelectorAll(".hero-facts b, .sc-stats b"));
  function animate(el) {
    var text = el.textContent.trim(), m = text.match(/^(\d+)(.*)$/);
    if (!m || el.dataset.counted) return;
    el.dataset.counted = "1";
    var target = parseInt(m[1], 10), suffix = m[2], start = null, dur = 1200;
    if (reduce) return;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = text;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { animate(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }
})();
