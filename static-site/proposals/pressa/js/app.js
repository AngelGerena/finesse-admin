(function () {
  var root = document.documentElement;
  var ANGEL = "14079609004";
  var LOOKS = { a: "A (Studio)", b: "B (Precision)", c: "C (Editorial)", d: "D (Steel)", e: "E (Red Block)" };
  var PRICE = 299; // sample price until Hiram confirms
  var current = "a";

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
    root.classList.remove("look-a", "look-b", "look-c", "look-d", "look-e");
    root.classList.add("look-" + k);
    chips.forEach(function (c) { c.classList.toggle("on", c.dataset.look === k); if (c.dataset.look === k && c.parentNode.scrollWidth > c.parentNode.clientWidth) { c.parentNode.scrollLeft = c.offsetLeft - c.parentNode.offsetLeft - 8; } });
    try { localStorage.setItem("pressa-look2", k); } catch (e) {}
    updateWant();
  }
  chips.forEach(function (c) { c.addEventListener("click", function () { setLook(c.dataset.look); }); });

  // ---------- "I want this one" (WhatsApp + SMS backup to Angel) ----------
  var wa = document.getElementById("wantWa"), sms = document.getElementById("wantSms");
  function updateWant() {
    var msg = root.lang === "es"
      ? "Hola Angel, soy Hiram. Quiero el estilo " + LOOKS[current] + " para la página de Pressa."
      : "Hi Angel, it's Hiram. I want Look " + LOOKS[current] + " for the Pressa website.";
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
  var shopArt = document.querySelector(".shop-media .stand-art");
  function setColor(k) {
    document.querySelectorAll(".sw").forEach(function (s) { s.classList.toggle("on", s.dataset.color === k); });
    colorName.innerHTML = '<span data-l="en">' + COLORS[k].en + '</span><span data-l="es">' + COLORS[k].es + "</span>";
    shopArt.style.setProperty("--sw-color", COLORS[k].hex);
  }
  document.querySelectorAll(".sw").forEach(function (s) { s.addEventListener("click", function () { setColor(s.dataset.color); }); });
  setColor("black");

  // ---------- toast ----------
  var toast = document.getElementById("toast"), tt;
  function say(en, es) {
    toast.textContent = root.lang === "es" ? es : en; toast.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { toast.hidden = true; }, 3200);
  }
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    say("Preview only: this opens secure Stripe checkout at launch.", "Vista previa: aquí se abre el pago seguro de Stripe al lanzar.");
  });

  // ---------- video placeholders ----------
  document.querySelectorAll("[data-video]").forEach(function (b) {
    b.addEventListener("click", function () {
      openModal(root.lang === "es"
        ? "<h3>Video</h3><p>Aquí se reproduce tu video " + (b.dataset.video === "made" ? "de fabricación" : "demostrativo") + " dentro de la página, sin salir a YouTube.</p>"
        : "<h3>Video</h3><p>Your " + (b.dataset.video === "made" ? "manufacturing" : "demo") + " video plays right here on the page, without sending visitors off to YouTube.</p>");
    });
  });

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
    returns: ["Returns and Refunds", "Devoluciones y reembolsos", "30-day return window. Full policy drafted by Finesse Media for your attorney to review.", "30 días para devolver. Política completa redactada por Finesse Media para revisión de tu abogado."],
    shipping: ["Shipping Policy", "Política de envíos", "USA only, real carrier rates at checkout, packed and shipped by Pressa from Florida.", "Solo EE. UU., tarifas reales al pagar, empacado y enviado por Pressa desde Florida."],
    warranty: ["Warranty", "Garantía", "Warranty terms go here once you confirm the coverage period.", "Los términos de garantía van aquí cuando confirmes el período de cobertura."],
    terms: ["Terms of Service", "Términos de servicio", "Standard store terms, drafted for attorney review.", "Términos estándar de la tienda, redactados para revisión legal."],
    privacy: ["Privacy Policy", "Política de privacidad", "How customer data, orders and accounts are handled.", "Cómo se manejan los datos, pedidos y cuentas de los clientes."]
  };
  var modal = document.getElementById("modal"), body = document.getElementById("modalBody");
  function openModal(html) { body.innerHTML = html; modal.hidden = false; }
  function closeModal() { modal.hidden = true; }
  document.getElementById("modalX").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  document.querySelectorAll("[data-policy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = POL[b.dataset.policy], es = root.lang === "es";
      openModal("<h3>" + (es ? p[1] : p[0]) + "</h3><p>" + (es ? p[3] : p[2]) + "</p>");
    });
  });

  // ---------- init ----------
  var savedLook = "a", savedLang = "es";
  try { savedLook = localStorage.getItem("pressa-look2") || "a"; savedLang = localStorage.getItem("pressa-lang") || "es"; } catch (e) {}
  setLook(LOOKS[savedLook] ? savedLook : "a");
  setLang(savedLang === "en" ? "en" : "es");
})();
