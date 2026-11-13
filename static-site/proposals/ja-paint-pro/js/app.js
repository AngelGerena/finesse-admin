/* JA Paint Pro mockups - Finesse Media */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;

  /* ---------------- LOOKS ---------------- */
  var LOOKS = {
    fresh: {
      name: "Fresh Coat",
      eyebrow: "Interior · Exterior · Epoxy",
      h1: "Fresh color. Flawless lines.",
      sub: "JA Paint Pro turns tired walls into rooms you are proud of, with careful prep, crisp edges and a crew that respects your home."
    },
    estate: {
      name: "Estate",
      eyebrow: "Fine Residential Painting",
      h1: "Craftsmanship in every edge.",
      sub: "Premium painting for homes that deserve more than a quick coat. Meticulous prep, hand-cut lines and finishes built to last."
    },
    jobsite: {
      name: "Job Site",
      eyebrow: "Residential · Commercial · HOA",
      h1: "Painted right. On schedule.",
      sub: "Licensed crews, clear written quotes and job sites left cleaner than we found them. Homes, offices, churches and HOAs."
    },
    brand: {
      name: "JA Paint Pro",
      eyebrow: "Painting \u00B7 Epoxy \u00B7 Pressure Wash",
      h1: "Paint it right. Coat it tough.",
      sub: "Interior and exterior painting, epoxy and polyaspartic floors and pressure washing for homes and businesses across Central Florida."
    },
    propop: {
      name: "Pro Pop",
      eyebrow: "Residential \u00B7 Commercial \u00B7 HOA",
      h1: "Built tough. Painted bold.",
      sub: "Licensed crews, clear written quotes and color done right the first time. Homes, offices, churches and HOAs across Central Florida."
    },
    safetypop: {
      name: "Safety Pop",
      eyebrow: "Licensed \u00B7 Insured \u00B7 On Time",
      h1: "Bold color. Zero excuses.",
      sub: "From one bedroom to a full commercial repaint, JA Paint Pro shows up on time, preps it right and leaves the job site spotless."
    },
    paintchip: {
      name: "Paint Chip",
      eyebrow: "Pick a color. Pick a date.",
      h1: "Pro crews. Serious color.",
      sub: "Book your free estimate online in under a minute. We handle the prep, the paint and the clean-up for homes and businesses."
    },
  };
  var ANGEL = "14079609004";
  var I18N = window.JA_I18N || { ES: {}, HERO_ES: {} };
  var lang = "en";
  try { lang = localStorage.getItem("ja-lang") === "es" ? "es" : "en"; } catch (e) {}
  function t(en) { return lang === "es" && I18N.ES[en] ? I18N.ES[en] : en; }
  function applyLang() {
    document.documentElement.lang = lang;
    var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentElement.closest("script,.picker,.lang") ? 2 : 1; }
    });
    var n;
    while ((n = walker.nextNode())) {
      if (n.__shown === undefined || n.nodeValue !== n.__shown) n.__src = n.nodeValue;
      var src = n.__src, key = src.trim();
      var out = key && lang === "es" && I18N.ES[key] ? src.replace(key, I18N.ES[key]) : src;
      if (n.nodeValue !== out) n.nodeValue = out;
      n.__shown = out;
    }
    $$("[placeholder],[aria-label]").forEach(function (el) {
      if (el.closest(".picker,.lang")) return;
      el.__srcAttr = el.__srcAttr || {};
      el.__shownAttr = el.__shownAttr || {};
      ["placeholder", "aria-label"].forEach(function (a) {
        var v = el.getAttribute(a);
        if (v === null) return;
        if (el.__shownAttr[a] === undefined || v !== el.__shownAttr[a]) el.__srcAttr[a] = v;
        var o = t(el.__srcAttr[a]);
        el.setAttribute(a, o); el.__shownAttr[a] = o;
      });
    });
    $$(".lang-btn").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
    });
  }
  var current = "brand";

  function setLook(key) {
    if (!LOOKS[key]) key = "brand";
    current = key;
    body.setAttribute("data-theme", key);
    var L = LOOKS[key];
    var HE = lang === "es" && I18N.HERO_ES[key] ? I18N.HERO_ES[key] : L;
    $$("[data-copy]").forEach(function (el) { el.textContent = HE[el.getAttribute("data-copy")]; });
    $$(".pk-look").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-look") === key); });
    $("#pkName").textContent = L.name;
    var msg = "Hi Angel! For the JA Paint Pro website, I want the \"" + L.name + "\" design.";
    $("#pkWa").href = "https://wa.me/" + ANGEL + "?text=" + encodeURIComponent(msg);
    $("#pkSms").href = "sms:+" + ANGEL + "?&body=" + encodeURIComponent(msg);
    try { localStorage.setItem("ja-look3", key); } catch (e) {}
    readColors();
    paint();
  }
  $$(".pk-look").forEach(function (b) {
    b.addEventListener("click", function () { setLook(b.getAttribute("data-look")); });
  });
  $("#pkToggle").addEventListener("click", function () {
    var min = $("#picker").classList.toggle("min");
    this.setAttribute("aria-expanded", String(!min));
  });

  /* ---------------- NAV ---------------- */
  var menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  menuBtn.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach(function (a) { a.addEventListener("click", function () { navLinks.classList.remove("open"); }); });

  /* ---------------- HERO: SCROLL TO PAINT ---------------- */
  var hero = $("#hero"), painted = $("#painted"), roller = $("#roller"), nap = $("#rNap"), bar = $("#heroBar");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var colors = ["#D9480F", "#D9480F", "#D9480F"];
  function readColors() {
    var cs = getComputedStyle(body);
    colors = [cs.getPropertyValue("--c1").trim(), cs.getPropertyValue("--c2").trim(), cs.getPropertyValue("--c3").trim()];
  }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function setMask(h1, h2, h3) {
    var v = "33.4% " + (h1 * 100) + "%, 33.4% " + (h2 * 100) + "%, 33.4% " + (h3 * 100) + "%";
    painted.style.webkitMaskSize = v;
    painted.style.maskSize = v;
  }
  var ticking = false;
  function paint() {
    ticking = false;
    if (reduce) { setMask(1, 1, 1); hero.classList.add("is-painted"); return; }
    var total = hero.offsetHeight - window.innerHeight;
    var p = total > 0 ? clamp(-hero.getBoundingClientRect().top / total, 0, 1) : 1;
    var a = seg(p, 0.02, 0.3), b = seg(p, 0.3, 0.6), c = seg(p, 0.6, 0.88);
    setMask(a, b, c);
    bar.style.width = (p * 100) + "%";
    hero.classList.toggle("is-painted", p > 0.86);

    var W = window.innerWidth / 3, H = window.innerHeight;
    var elW = W * 0.92 * (220 / 200);
    var s = elW / 220;
    roller.style.width = elW + "px";
    var col, edge, y;
    if (p < 0.3) { col = 0; edge = a * H; }
    else if (p < 0.6) { col = 1; edge = H - b * H; }
    else { col = 2; edge = c * H; }
    y = edge - 32 * s;
    var x = col * W + W * 0.04 - 4 * s;
    if (p > 0.88) {
      var t = seg(p, 0.88, 1);
      x += t * (W * 1.4);
      y = H - 32 * s - t * H * 0.35;
    }
    roller.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    roller.style.setProperty("--rc", colors[col]);
    nap.setAttribute("transform", "translate(0 " + ((p * H * 3 / s) % 16) + ")");
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------------- BEFORE / AFTER ---------------- */
  var baRange = $("#baRange"), baBefore = $("#baBefore"), baHandle = $("#baHandle");
  function ba() {
    var v = baRange.value;
    baBefore.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
    baHandle.style.left = v + "%";
  }
  baRange.addEventListener("input", ba); ba();
  var baImgs = $$(".ba-photo");
  function checkPhotos() { if ($$(".ba-photo").length === 2 && baImgs.every(function (i) { return i.complete && i.naturalWidth; })) $("#ba").classList.add("has-photos"); }
  baImgs.forEach(function (i) { i.addEventListener("load", checkPhotos); }); checkPhotos();

  /* ---------------- GALLERY + LIGHTBOX ---------------- */
  var GAL = window.JA_GALLERY || [], galCat = "all", lbList = [], lbIdx = 0;
  var CAT_LABEL = { interior: "Interior", exterior: "Exterior", floors: "Epoxy Floors", pressure: "Pressure Washing", commercial: "Commercial" };
  function cats(g) { return [].concat(g.cat); }
  function catLabel(g) { return t(CAT_LABEL[cats(g)[0]] || ""); }
  function renderGallery() {
    var wrap = $("#gallery"); if (!GAL.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    $$(".gf").forEach(function (b) {
      var c = b.getAttribute("data-cat");
      b.hidden = c !== "all" && !GAL.some(function (g) { return cats(g).indexOf(c) > -1; });
      b.classList.toggle("on", c === galCat);
    });
    lbList = GAL.filter(function (g) { return galCat === "all" || cats(g).indexOf(galCat) > -1; });
    var grid = $("#galGrid"); grid.innerHTML = "";
    lbList.forEach(function (g, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "gal-item";
      var im = document.createElement("img"); im.src = g.src; im.alt = g.alt || catLabel(g); im.loading = "lazy";
      var tag = document.createElement("span"); tag.textContent = catLabel(g);
      b.appendChild(im); b.appendChild(tag);
      b.addEventListener("click", function () { openLb(i); });
      grid.appendChild(b);
    });
  }
  function showLb() {
    var g = lbList[lbIdx]; $("#lbImg").src = g.src; $("#lbImg").alt = g.alt || "";
    $("#lbCap").textContent = (lbIdx + 1) + " / " + lbList.length + "  \u00B7  " + catLabel(g);
  }
  function openLb(i) { lbIdx = i; showLb(); $("#lightbox").hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); }
  function closeLb() { $("#lightbox").hidden = true; document.body.style.overflow = ""; }
  function stepLb(d) { lbIdx = (lbIdx + d + lbList.length) % lbList.length; showLb(); }
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function () { stepLb(-1); });
  $("#lbNext").addEventListener("click", function () { stepLb(1); });
  $("#lightbox").addEventListener("click", function (e) { if (e.target.id === "lightbox") closeLb(); });
  document.addEventListener("keydown", function (e) {
    if ($("#lightbox").hidden) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") stepLb(-1); else if (e.key === "ArrowRight") stepLb(1);
  });
  var tx = null;
  $("#lightbox").addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  $("#lightbox").addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) stepLb(dx < 0 ? 1 : -1); tx = null; });
  $$(".gf").forEach(function (b) { b.addEventListener("click", function () { galCat = b.getAttribute("data-cat"); renderGallery(); }); });

  /* ---------------- TABS ---------------- */
  function showTab(name) {
    $$(".tab").forEach(function (t) {
      var on = t.getAttribute("data-pane") === name;
      t.classList.toggle("active", on); t.setAttribute("aria-selected", String(on));
    });
    $$(".pane").forEach(function (p) { p.classList.toggle("active", p.id === "pane-" + name); });
  }
  $$(".tab").forEach(function (t) { t.addEventListener("click", function () { showTab(t.getAttribute("data-pane")); }); });
  $$("[data-tab]").forEach(function (a) { a.addEventListener("click", function () { showTab(a.getAttribute("data-tab")); }); });
  $$(".svc-book").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.getAttribute("data-svc");
      $$('#svcChips input').forEach(function (i) { if (i.value === v) i.checked = true; });
      showTab("book"); goStep(0);
      $("#book").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------------- BOOKING ---------------- */
  var step = 0, rooms = 3, selDate = null, selTime = null;
  var bForm = $("#bookForm"), steps = $$(".bstep"), bNext = $("#bNext"), bBack = $("#bBack");
  var labels = $$(".stepper .st");
  function goStep(n) {
    step = n;
    steps.forEach(function (s, i) { s.classList.toggle("active", i === n); });
    labels.forEach(function (l, i) { l.classList.toggle("active", i <= n); });
    $("#bookBar").style.width = ((n + 1) * 25) + "%";
    bBack.style.visibility = n === 0 ? "hidden" : "visible";
    bNext.textContent = t(n === 3 ? "Confirm Booking" : "Continue");
    $$(".err[data-err]").forEach(function (e) { e.classList.remove("show"); });
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function validPhone(v) { return v.replace(/\D/g, "").length >= 10; }
  function checkStep(n) {
    var f = bForm.elements;
    if (n === 0) return $$('#svcChips input:checked').length > 0;
    if (n === 1) return f.address.value.trim().length > 4;
    if (n === 2) return selDate && selTime;
    if (n === 3) return f.name.value.trim().length > 1 && validPhone(f.phone.value) && validEmail(f.email.value.trim());
    return true;
  }
  bNext.addEventListener("click", function () {
    if (!checkStep(step)) { $('.err[data-err="' + step + '"]').classList.add("show"); return; }
    if (step < 3) { goStep(step + 1); return; }
    finishBooking();
  });
  bBack.addEventListener("click", function () { if (step > 0) goStep(step - 1); });
  $$(".stepper-num button").forEach(function (b) {
    b.addEventListener("click", function () {
      rooms = clamp(rooms + Number(b.getAttribute("data-n")), 1, 30);
      $("#roomsOut").textContent = rooms;
    });
  });
  function refCode() { return "JA-" + Math.floor(10000 + Math.random() * 89999); }
  function fmtDate(d) {
    if (lang === "es") return d.toLocaleDateString("es-US", { weekday: "long", day: "numeric", month: "long" });
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }
  var lastBook = null, lastQuote = null;
  function bookText() {
    var d = lastBook; if (!d) return;
    var svcs = d.svcs.map(t).join(", ");
    $("#bookSummary").textContent = lang === "es"
      ? d.first + ", tu estimado gratis de " + svcs.toLowerCase() + " está confirmado para el " + fmtDate(d.date) + " a las " + d.time +
        ". Te enviamos la confirmación a " + d.email + (d.sms ? " y te mandaremos un texto de recordatorio el día antes." : ".")
      : d.first + ", your free estimate for " + svcs + " is set for " + fmtDate(d.date) + " at " + d.time +
        ". A confirmation is on its way to " + d.email + (d.sms ? " and we will text you a reminder the day before." : ".");
  }
  function finishBooking() {
    var f = bForm.elements;
    lastBook = {
      first: f.name.value.trim().split(" ")[0],
      svcs: $$('#svcChips input:checked').map(function (i) { return i.value; }),
      date: selDate, time: selTime, email: f.email.value.trim(), sms: f.sms.checked
    };
    bookText();
    $("#bookRef").textContent = refCode();
    bForm.hidden = true;
    $(".stepper").hidden = true; $(".bar").hidden = true;
    $("#bookDone").hidden = false;
  }
  $("#bookAgain").addEventListener("click", function () {
    bForm.reset(); rooms = 3; $("#roomsOut").textContent = "3"; selDate = null; selTime = null;
    bForm.hidden = false; $(".stepper").hidden = false; $(".bar").hidden = false; $("#bookDone").hidden = true;
    renderCal(); renderSlots(); goStep(0);
  });

  /* calendar */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var viewY = today.getFullYear(), viewM = today.getMonth();
  var maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 60);
  var SLOTS = ["8:00 AM", "9:30 AM", "11:00 AM", "1:00 PM", "2:30 PM", "4:00 PM"];
  function renderCal() {
    var grid = $("#calGrid"); grid.innerHTML = "";
    var first = new Date(viewY, viewM, 1);
    var title = first.toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" });
    $("#calTitle").textContent = title.charAt(0).toUpperCase() + title.slice(1);
    var dow = lang === "es" ? ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    $("#calDow").innerHTML = dow.map(function (x) { return "<span>" + x + "</span>"; }).join("");
    for (var i = 0; i < first.getDay(); i++) grid.appendChild(document.createElement("span"));
    var days = new Date(viewY, viewM + 1, 0).getDate();
    for (var d = 1; d <= days; d++) {
      var dt = new Date(viewY, viewM, d);
      var b = document.createElement("button");
      b.type = "button"; b.className = "day"; b.textContent = d;
      b.setAttribute("aria-label", fmtDate(dt));
      if (dt <= today || dt > maxDate || dt.getDay() === 0) b.disabled = true;
      if (dt.getTime() === today.getTime()) b.classList.add("today");
      if (selDate && dt.getTime() === selDate.getTime()) b.classList.add("sel");
      (function (dt, b) {
        b.addEventListener("click", function () {
          selDate = dt; selTime = null;
          $$(".day").forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel"); renderSlots();
        });
      })(dt, b);
      grid.appendChild(b);
    }
    $("#calPrev").disabled = viewY === today.getFullYear() && viewM === today.getMonth();
    $("#calNext").disabled = new Date(viewY, viewM + 1, 1) > maxDate;
  }
  function renderSlots() {
    var wrap = $("#slots"); wrap.innerHTML = "";
    if (!selDate) { $("#slotsTitle").textContent = t("Choose a day to see open times"); return; }
    $("#slotsTitle").textContent = (lang === "es" ? "Horarios disponibles el " : "Open times on ") + fmtDate(selDate);
    var list = selDate.getDay() === 6 ? SLOTS.slice(0, 3) : SLOTS;
    list.forEach(function (tm, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "slot"; b.textContent = tm;
      if ((selDate.getDate() + i) % 4 === 0) { b.disabled = true; b.setAttribute("aria-label", tm + (lang === "es" ? ", ocupado" : ", booked")); }
      b.addEventListener("click", function () {
        selTime = tm;
        $$(".slot").forEach(function (x) { x.classList.remove("sel"); });
        b.classList.add("sel");
      });
      wrap.appendChild(b);
    });
  }
  $("#calPrev").addEventListener("click", function () { viewM--; if (viewM < 0) { viewM = 11; viewY--; } renderCal(); });
  $("#calNext").addEventListener("click", function () { viewM++; if (viewM > 11) { viewM = 0; viewY++; } renderCal(); });
  renderCal(); renderSlots();

  /* ---------------- QUOTE ---------------- */
  var qForm = $("#quoteForm");
  $("#qPhotos").addEventListener("change", function () {
    var th = $("#thumbs"); th.innerHTML = "";
    Array.prototype.slice.call(this.files, 0, 8).forEach(function (f) {
      var img = document.createElement("img");
      img.alt = "Uploaded photo"; img.src = URL.createObjectURL(f); th.appendChild(img);
    });
  });
  qForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = qForm.elements;
    var ok = f.qname.value.trim().length > 1 && validPhone(f.qphone.value) && validEmail(f.qemail.value.trim());
    $("#qErr").classList.toggle("show", !ok);
    if (!ok) return;
    lastQuote = {
      first: f.qname.value.trim().split(" ")[0],
      type: f.qtype.value,
      pref: qForm.querySelector('input[name="qpref"]:checked').value
    };
    quoteText();
    $("#quoteRef").textContent = refCode();
    qForm.hidden = true; $("#quoteDone").hidden = false;
  });
  function quoteText() {
    var d = lastQuote; if (!d) return;
    var prefEs = { Call: "llamada", Text: "texto", Email: "correo" };
    $("#quoteSummary").textContent = lang === "es"
      ? "Gracias, " + d.first + ". JA Paint Pro revisará tu proyecto (" + t(d.type).toLowerCase() + ") y te contactará por " +
        prefEs[d.pref] + " en un día laborable con tu cotización."
      : "Thanks, " + d.first + ". JA Paint Pro will review your " + d.type.toLowerCase() + " project and reach out by " +
        d.pref.toLowerCase() + " within one business day with your quote.";
  }
  $("#quoteAgain").addEventListener("click", function () {
    qForm.reset(); $("#thumbs").innerHTML = ""; qForm.hidden = false; $("#quoteDone").hidden = true;
  });

  /* ---------------- CONTACT ---------------- */
  var mForm = $("#msgForm");
  mForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = mForm.elements;
    var ok = f.mname.value.trim() && f.mcontact.value.trim() && f.mmsg.value.trim();
    $("#mErr").classList.toggle("show", !ok);
    $("#mSent").hidden = !ok;
    if (ok) mForm.reset();
  });

  $("#yr").textContent = new Date().getFullYear();

  /* ---------------- INIT ---------------- */
  var saved = "brand";
  try { saved = localStorage.getItem("ja-look3") || "brand"; } catch (e) {}
  function setLang(l) {
    lang = l === "es" ? "es" : "en";
    try { localStorage.setItem("ja-lang", lang); } catch (e) {}
    setLook(current);
    renderCal(); renderSlots(); bookText(); quoteText(); renderGallery();
    bNext.textContent = t(step === 3 ? "Confirm Booking" : "Continue");
    applyLang();
  }
  $$(".lang-btn").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  setLook(saved);
  setLang(lang);
})();
