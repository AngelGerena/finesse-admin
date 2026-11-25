/* Pressa back office (Finesse OS). Preview build: data lives in this browser.
   The live build keeps the same screens and field names on Supabase. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function readJ(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function writeJ(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  var lang = (function () { try { return localStorage.getItem("pressa-lang") === "en" ? "en" : "es"; } catch (e) { return "es"; } })();
  function L(en, es) { return lang === "es" ? es : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  var WD = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], es: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] };
  var MO = { en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] };
  function stamp(t) {
    var d = new Date(t), h = d.getHours(), mm = ("0" + d.getMinutes()).slice(-2), ap = h < 12 ? "AM" : "PM", h12 = h % 12 || 12;
    return lang === "es" ? WD.es[d.getDay()] + ", " + d.getDate() + " " + MO.es[d.getMonth()] + " a las " + h12 + ":" + mm + " " + ap
      : WD.en[d.getDay()] + ", " + MO.en[d.getMonth()] + " " + d.getDate() + " at " + h12 + ":" + mm + " " + ap;
  }
  function digits(p) { var d = String(p || "").replace(/\D/g, ""); return d.length === 10 ? "1" + d : d; }
  function ic(n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function userName() { try { return localStorage.getItem("pressa-admin-user") || "Hiram"; } catch (e) { return "Hiram"; } }
  window.PRESSA_USER = userName;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- state: sample data plus anything sent from the website ---------- */
  var SEED = window.PRESSA_DATA, ST = readJ("pressa-admin-state", null);
  if (!ST) ST = { inbox: SEED.inbox, orders: SEED.orders, setup: {} };
  function saveState() { writeJ("pressa-admin-state", ST); }
  function siteInbox() { return readJ("pressa-inbox", []); }
  function allInbox() { return siteInbox().concat(ST.inbox).filter(function (m) { return !m.deleted; }).sort(function (a, b) { return new Date(b.at) - new Date(a.at); }); }
  function updateMsg(id, fn) {
    var box = siteInbox(), hit = false;
    box.forEach(function (m) { if (m.id === id) { fn(m); hit = true; } });
    if (hit) writeJ("pressa-inbox", box); else { ST.inbox.forEach(function (m) { if (m.id === id) fn(m); }); saveState(); }
  }
  function newCount() { return allInbox().filter(function (m) { return m.status === "new"; }).length; }

  var STORE0 = { price: 1497, open: true, colors: { black: true, orange: true } };
  function store() { var s = readJ("pressa-store", {}); return { price: s.price > 0 ? Number(s.price) : STORE0.price, open: s.open !== false, colors: Object.assign({}, STORE0.colors, s.colors || {}) }; }
  var BIZ0 = { nameHiram: "Hiram Díaz", phoneHiram: "(787) 460-3010", nameFelix: "Felix Ortiz", phoneFelix: "(321) 203-8541", email: "pressatools@gmail.com", instagram: "pressatools", facebook: "" };
  function biz() { return Object.assign({}, BIZ0, readJ("pressa-biz", {})); }

  /* ---------- navigation ---------- */
  var NAV = [
    { id: "dashboard", icon: "home", en: "Dashboard", es: "Inicio" },
    { id: "inbox", icon: "inbox", en: "Messages", es: "Mensajes", count: newCount },
    { id: "orders", icon: "box", en: "Orders", es: "Pedidos" },
    { id: "store", icon: "tag", en: "Store", es: "Tienda" },
    { id: "site", icon: "pen", en: "Website words", es: "Textos del sitio" },
    { id: "media", icon: "image", en: "Photos & videos", es: "Fotos y videos" },
    { id: "settings", icon: "gear", en: "Settings", es: "Ajustes" }
  ];
  var TABS = ["dashboard", "inbox", "site", "media"];
  var view = "dashboard";
  function navLabel(x) { return L(x.en, x.es); }
  function renderNav() {
    $("#sideNav").innerHTML = NAV.map(function (x) {
      var c = x.count ? x.count() : 0;
      return '<button class="nav-item' + (view === x.id ? " on" : "") + '" data-go="' + x.id + '"' + (view === x.id ? ' aria-current="page"' : "") + ">" + ic(x.icon) + '<span class="nav-label">' + navLabel(x) + "</span>" + (c ? '<span class="nav-count">' + c + "</span>" : "") + "</button>";
    }).join("");
    $("#tabBar").innerHTML = TABS.map(function (id) {
      var x = NAV.filter(function (y) { return y.id === id; })[0], c = x.count ? x.count() : 0;
      return '<button class="tab' + (view === id ? " on" : "") + '" data-go="' + id + '">' + ic(x.icon) + "<span>" + navLabel(x) + "</span>" + (c ? '<i class="tab-count">' + c + "</i>" : "") + "</button>";
    }).join("") + '<button class="tab" data-act="more" aria-label="' + L("More pages", "Más páginas") + '">' + ic("menu") + "<span>" + L("More", "Más") + "</span></button>";
    $("#moreList").innerHTML = NAV.filter(function (x) { return TABS.indexOf(x.id) < 0; }).map(function (x) {
      return '<button class="more-item" data-go="' + x.id + '">' + ic(x.icon) + "<span>" + navLabel(x) + "</span></button>";
    }).join("");
  }
  function go(v) { if (v === view) { closeMore(); return; } if (view === "site" && unsavedKeys().length && !confirm(L("You have unsaved changes on Website words. Leave without saving?", "Tienes cambios sin guardar en Textos del sitio. ¿Salir sin guardar?"))) return; view = v; S_siteDraft = {}; closeMore(); renderNav(); render(); window.scrollTo(0, 0); try { history.replaceState(null, "", "#" + v); } catch (e) {} }
  function head(title, sub, actions) { return '<div class="page-h"><div><h1>' + title + "</h1>" + (sub ? '<p class="muted">' + sub + "</p>" : "") + "</div>" + (actions ? '<div class="page-actions">' + actions + "</div>" : "") + "</div>"; }
  function empty(msg, icon) { return '<div class="empty">' + ic(icon || "inbox") + "<p>" + msg + "</p></div>"; }

  /* ---------- dashboard ---------- */
  var SETUP = [
    { id: "phones", en: "Check your phone numbers and email", es: "Revisa tus teléfonos y correo", go: "settings" },
    { id: "price", en: "Confirm the price of the stand", es: "Confirma el precio del soporte", go: "store" },
    { id: "words", en: "Read your website words and change anything you like", es: "Lee los textos de tu sitio y cambia lo que quieras", go: "site" },
    { id: "photo", en: "Add a new photo to your gallery", es: "Agrega una foto nueva a tu galería", go: "media" },
    { id: "clear", en: "Clear the sample messages and orders", es: "Borra los mensajes y pedidos de ejemplo", go: "settings" }
  ];
  function markSetup(id) { if (!ST.setup[id]) { ST.setup[id] = true; saveState(); } }
  function vDashboard() {
    var inbox = allInbox(), msgs = inbox.filter(function (m) { return m.type === "contact"; }), wl = inbox.filter(function (m) { return m.type === "waitlist"; });
    var open = ST.orders.filter(function (o) { return o.status !== "shipped"; }), sales = ST.orders.reduce(function (a, o) { return a + o.total; }, 0), s = store();
    var todo = SETUP.filter(function (x) { return !ST.setup[x.id]; });
    var recent = inbox.slice(0, 4);
    return head(L("Hi, ", "Hola, ") + esc(userName()), L("Here's what's happening with Pressa today.", "Esto es lo que está pasando con Pressa hoy.")) +
      '<div class="kpis">' +
        kpi(L("New messages", "Mensajes nuevos"), msgs.filter(function (m) { return m.status === "new"; }).length, "inbox", L("from your website", "de tu sitio web")) +
        kpi(L("Waitlist", "Lista de espera"), wl.length, "users", L("people waiting for launch", "personas esperando el lanzamiento")) +
        kpi(L("Orders to ship", "Pedidos por enviar"), open.length, "box", L("sample orders", "pedidos de ejemplo")) +
        kpi(L("Price", "Precio"), money(s.price), "tag", s.open ? L("pre-orders open", "pre-órdenes abiertas") : L("pre-orders closed", "pre-órdenes cerradas")) +
      "</div>" +
      (todo.length ? '<section class="card setup"><div class="card-h"><h3>' + L("Finish setting up", "Termina de configurar") + '</h3><span class="muted small">' + (SETUP.length - todo.length) + "/" + SETUP.length + "</span></div><ul class=\"rows\">" +
        todo.map(function (x) { return '<li class="row"><div class="grow">' + L(x.en, x.es) + '</div><button class="btn sm ghost" data-go="' + x.go + '">' + L("Go", "Ir") + ic("right") + "</button></li>"; }).join("") + "</ul></section>" : "") +
      '<div class="grid2"><section class="card"><div class="card-h"><h3>' + L("Latest messages", "Últimos mensajes") + '</h3><button class="btn sm ghost" data-go="inbox">' + L("See all", "Ver todos") + "</button></div>" +
        (recent.length ? '<ul class="rows">' + recent.map(function (m) {
          return '<li class="row"><div class="grow"><b>' + esc(m.name || m.email) + "</b>" + (m.lang === "en" ? '<span class="tag-en">EN · Felix</span>' : "") + "<small>" + (m.type === "waitlist" ? L("Joined the waitlist", "Se unió a la lista de espera") : esc(String(m.message || "").slice(0, 70)) + (String(m.message || "").length > 70 ? "..." : "")) + " · " + stamp(m.at) + "</small></div>" + (m.status === "new" ? '<span class="badge b-new">' + L("New", "Nuevo") + "</span>" : "") + "</li>";
        }).join("") + "</ul>" : empty(L("No messages yet. When someone writes from your website, it shows up here.", "Todavía no hay mensajes. Cuando alguien te escriba desde tu sitio web, sale aquí."))) +
      '</section><section class="card"><div class="card-h"><h3>' + L("Quick changes", "Cambios rápidos") + '</h3></div><div class="quick">' +
        quick("pen", "site", L("Change website content", "Cambiar contenido del sitio"), L("Headlines, prices text, FAQ, hours", "Titulares, preguntas, horario")) +
        quick("image", "media", L("Change photos and videos", "Cambiar fotos y videos"), L("Replace a photo or add to the gallery", "Reemplaza una foto o agrega a la galería")) +
        quick("tag", "store", L("Price and pre-orders", "Precio y pre-órdenes"), L("Change the price, open or close pre-orders", "Cambia el precio, abre o cierra pre-órdenes")) +
      "</div></section></div>" +
      '<p class="muted small center">' + L("Sales so far (sample): ", "Ventas hasta ahora (ejemplo): ") + money(sales) + "</p>";
  }
  function kpi(label, val, icon, sub) { return '<div class="kpi">' + ic(icon) + "<small>" + label + "</small><b>" + val + "</b><span>" + sub + "</span></div>"; }
  function quick(icon, goTo, t, d) { return '<button class="quick-i" data-go="' + goTo + '">' + ic(icon) + '<span><b>' + t + "</b><small>" + d + "</small></span>" + ic("right") + "</button>"; }

  /* ---------- messages ---------- */
  var inboxTab = "contact";
  function vInbox() {
    var all = allInbox(), list = all.filter(function (m) { return m.type === inboxTab; });
    var nC = all.filter(function (m) { return m.type === "contact"; }).length, nW = all.filter(function (m) { return m.type === "waitlist"; }).length;
    return head(L("Messages", "Mensajes"), L("Everything people send from your website lands here, and a copy goes to pressatools@gmail.com.", "Todo lo que la gente envía desde tu sitio web llega aquí, y una copia va a pressatools@gmail.com."),
        inboxTab === "waitlist" && nW ? '<button class="btn ghost" data-act="exportWl">' + ic("down") + L("Download list", "Descargar lista") + "</button>" : "") +
      '<div class="seg-tabs" id="inboxTabs"><button class="' + (inboxTab === "contact" ? "on" : "") + '" data-act="inboxTab" data-tab="contact">' + L("Contact form", "Formulario de contacto") + " (" + nC + ')</button><button class="' + (inboxTab === "waitlist" ? "on" : "") + '" data-act="inboxTab" data-tab="waitlist">' + L("Waitlist", "Lista de espera") + " (" + nW + ")</button></div>" +
      (list.length ? '<div class="cards">' + list.map(msgCard).join("") + "</div>" :
        empty(inboxTab === "waitlist" ? L("Nobody on the waitlist yet. Sign-ups from the Be first in line box show up here.", "Todavía nadie en la lista de espera. Los que se apunten en Sé el primero en la fila salen aquí.") : L("No messages yet. When someone uses the contact form on your website, it shows up here.", "Todavía no hay mensajes. Cuando alguien use el formulario de contacto de tu sitio, sale aquí.")));
  }
  function msgCard(m) {
    var b = biz(), wa = m.phone ? "https://wa.me/" + digits(m.phone) + "?text=" + encodeURIComponent((m.lang === "en" ? "Hi " : "Hola ") + (m.name ? m.name.split(" ")[0] : "") + (m.lang === "en" ? ", this is " + b.nameHiram.split(" ")[0] + " from Pressa. " : ", te habla " + b.nameHiram.split(" ")[0] + " de Pressa. ")) : "";
    var mail = "mailto:" + m.email + "?subject=" + encodeURIComponent(m.lang === "en" ? "Re: your message to Pressa" : "Re: tu mensaje a Pressa");
    return '<article class="card req' + (m.status === "new" ? " is-new" : "") + '"><div class="req-h"><div class="grow"><b>' + esc(m.name || m.email) + "</b>" + (m.lang === "en" ? '<span class="tag-en">' + L("English · for Felix", "Inglés · para Felix") + "</span>" : "") + "<small>" + stamp(m.at) + (m.isDemo ? " · " + L("sample", "ejemplo") : "") + "</small></div>" + (m.status === "new" ? '<span class="badge b-new">' + L("New", "Nuevo") + "</span>" : '<span class="badge ok">' + L("Answered", "Contestado") + "</span>") + "</div>" +
      (m.message ? '<p class="msg">' + esc(m.message) + "</p>" : "") +
      '<p class="muted small">' + esc(m.email) + (m.phone ? " · " + esc(m.phone) : "") + "</p>" +
      '<div class="actions">' +
        (m.phone ? '<a class="btn sm ghost" href="tel:+' + digits(m.phone) + '">' + ic("phone") + L("Call", "Llamar") + '</a><a class="btn sm ghost" href="sms:+' + digits(m.phone) + '">' + ic("sms") + L("Text", "Texto") + '</a><a class="btn sm wa" href="' + esc(wa) + '" target="_blank" rel="noopener">' + ic("wa") + "WhatsApp</a>" : "") +
        '<a class="btn sm ghost" href="' + esc(mail) + '">' + ic("send") + L("Email", "Correo") + "</a>" +
        (m.status === "new" ? '<button class="btn sm" data-act="msgDone" data-id="' + m.id + '">' + ic("check") + L("Mark answered", "Marcar contestado") + "</button>" : '<button class="btn sm ghost" data-act="msgNew" data-id="' + m.id + '">' + L("Mark as new", "Marcar como nuevo") + "</button>") +
        '<button class="btn sm ghost icon-b" data-act="msgDel" data-id="' + m.id + '" aria-label="' + L("Delete", "Borrar") + '">' + ic("trash") + "</button>" +
      "</div></article>";
  }

  /* ---------- orders ---------- */
  function vOrders() {
    var list = ST.orders.slice().sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
    return head(L("Orders", "Pedidos"), L("Pre-orders paid through your store. These are samples until the store goes live with Stripe.", "Pre-órdenes pagadas en tu tienda. Estos son ejemplos hasta que la tienda abra con Stripe.")) +
      (list.length ? '<div class="cards">' + list.map(function (o) {
        var col = o.color === "orange" ? L("Orange", "Anaranjado") : L("Black", "Negro");
        return '<article class="card req"><div class="req-h"><div class="grow"><b>' + esc(o.id) + " · " + esc(o.name) + "</b><small>" + stamp(o.at) + " · " + esc(o.city) + "</small></div>" + (o.status === "shipped" ? '<span class="badge ok">' + L("Shipped", "Enviado") + "</span>" : '<span class="badge b-new">' + L("Ready to ship", "Listo para enviar") + "</span>") + "</div>" +
          '<p class="msg">' + o.qty + " x Pressa Stand 360 · " + col + "<br><b>" + money(o.total) + "</b></p>" +
          (o.tracking ? '<p class="muted small">' + L("Tracking: ", "Rastreo: ") + esc(o.tracking) + "</p>" : "") +
          '<div class="actions"><a class="btn sm ghost" href="tel:+' + digits(o.phone) + '">' + ic("phone") + L("Call", "Llamar") + "</a>" +
          (o.status !== "shipped" ? '<button class="btn sm" data-act="ship" data-id="' + o.id + '">' + ic("box") + L("Mark shipped", "Marcar enviado") + "</button>" : "") + "</div></article>";
      }).join("") + "</div>" : empty(L("No orders yet. When someone pre-orders, the order shows up here with their address.", "Todavía no hay pedidos. Cuando alguien pre-ordene, el pedido sale aquí con su dirección."), "box"));
  }

  /* ---------- store ---------- */
  function vStore() {
    var s = store();
    return head(L("Store", "Tienda"), L("Change the price, open or close pre-orders, and pick which colors you sell.", "Cambia el precio, abre o cierra las pre-órdenes y escoge los colores que vendes.")) +
      '<form class="card form" id="storeForm"><label class="field"><span>' + L("Price of one stand (US dollars)", "Precio de un soporte (dólares)") + '</span><div class="price-in"><b>$</b><input name="price" type="number" min="1" step="1" inputmode="numeric" value="' + s.price + '"></div><small>' + L("The website shows it with cents, like $1,497.00, and the subtotal updates by itself.", "El sitio lo muestra con centavos, como $1,497.00, y el subtotal se calcula solo.") + "</small></label>" +
      toggleRow("open", L("Pre-orders are open", "Pre-órdenes abiertas"), L("Turn this off to stop new orders. The button changes to Pre-orders are closed.", "Apágalo para detener pedidos nuevos. El botón cambia a Pre-órdenes cerradas."), s.open) +
      toggleRow("black", L("Sell it in black", "Venderlo en negro"), L("Shows the black color choice in the store.", "Muestra la opción negra en la tienda."), s.colors.black) +
      toggleRow("orange", L("Sell it in orange", "Venderlo en anaranjado"), L("Shows the orange color choice in the store.", "Muestra la opción anaranjada en la tienda."), s.colors.orange) +
      '<div class="form-foot"><span class="saved" id="storeSaved" hidden>' + ic("check") + L("Saved", "Guardado") + '</span><button class="btn" id="storeSave" disabled>' + L("Save", "Guardar") + "</button></div></form>" +
      '<p class="muted small">' + L("The words around the price, like estimated price, are in Website words.", "Las palabras alrededor del precio, como precio estimado, están en Textos del sitio.") + "</p>";
  }
  function toggleRow(name, t, d, on) { return '<div class="toggle"><div><b>' + t + "</b><small>" + d + '</small></div><label class="switch"><input type="checkbox" name="' + name + '"' + (on ? " checked" : "") + ' aria-label="' + esc(t) + '"><span></span></label></div>'; }

  /* ---------- settings ---------- */
  function vSettings() {
    var b = biz(), tipsOn = !window.PRESSA_TIPS || window.PRESSA_TIPS.on();
    return head(L("Settings", "Ajustes"), L("Your contact details, help tips and safety tools.", "Tus datos de contacto, consejos de ayuda y herramientas de seguridad.")) +
      '<form class="card form" id="bizForm"><div class="card-h"><h3>' + L("Contact details on your website", "Datos de contacto en tu sitio") + "</h3></div>" +
        '<div class="two">' + fld(L("Your name", "Tu nombre"), "nameHiram", b.nameHiram) + fld(L("Your phone", "Tu teléfono"), "phoneHiram", b.phoneHiram, "tel") + "</div>" +
        '<div class="two">' + fld(L("English contact name", "Nombre del contacto en inglés"), "nameFelix", b.nameFelix) + fld(L("English contact phone", "Teléfono del contacto en inglés"), "phoneFelix", b.phoneFelix, "tel") + "</div>" +
        fld(L("Email", "Correo"), "email", b.email, "email") +
        '<div class="two">' + fld("Instagram", "instagram", b.instagram) + fld(L("Facebook page link", "Enlace de la página de Facebook"), "facebook", b.facebook, "url", L("Paste the link to your Facebook page", "Pega el enlace de tu página de Facebook")) + "</div>" +
        '<p class="muted small">' + L("These update the Contact section, the call buttons and the WhatsApp button on your website.", "Esto cambia la sección de Contacto, los botones de llamar y el botón de WhatsApp de tu sitio.") + "</p>" +
        '<div class="form-foot"><span class="saved" id="bizSaved" hidden>' + ic("check") + L("Saved", "Guardado") + '</span><button class="btn" id="bizSave" disabled>' + L("Save", "Guardar") + "</button></div></form>" +
      '<section class="card" id="tipsCard"><div class="card-h"><h3>' + L("Help tips", "Consejos de ayuda") + '</h3></div><div class="toggle"><div><b>' + L("Show help tips", "Mostrar consejos") + "</b><small>" + L("Short tips walk you through each page the first time you open it.", "Consejos cortos te enseñan cada página la primera vez que la abres.") + '</small></div><label class="switch"><input type="checkbox" id="tipsSwitch"' + (tipsOn ? " checked" : "") + ' aria-label="' + L("Show help tips", "Mostrar consejos") + '"><span></span></label></div>' +
        '<button class="btn ghost sm" data-tip-act="replay-all">' + ic("refresh") + L("Start the tour again", "Ver el recorrido otra vez") + "</button></section>" +
      '<section class="card"><div class="card-h"><h3>' + L("Getting into your back office", "Cómo entrar a tu panel") + '</h3></div><p>' + L("On your website, press and hold the Pressa logo at the top left for 5 seconds, on your phone or your computer. Then enter your PIN and pick your name.", "En tu sitio web, mantén presionado el logo de Pressa arriba a la izquierda por 5 segundos, en el teléfono o en la computadora. Luego escribe tu PIN y escoge tu nombre.") + '</p><p class="muted small">' + L("Preview PIN: 3010. In the live version you also sign in with your own password.", "PIN de prueba: 3010. En la versión final también entras con tu propia contraseña.") + "</p></section>" +
      '<section class="card"><div class="card-h"><h3>' + L("Sample data", "Datos de ejemplo") + '</h3></div><p class="muted small">' + L("The messages and orders marked sample are here so you can practice. Clear them when you're ready.", "Los mensajes y pedidos marcados como ejemplo están aquí para practicar. Bórralos cuando estés listo.") + '</p><button class="btn ghost" data-act="clearDemo">' + ic("trash") + L("Clear sample data", "Borrar datos de ejemplo") + "</button></section>" +
      '<section class="card se-reset"><div class="card-h"><h3>' + L("Go back to the original website", "Volver al sitio original") + '</h3></div><p class="muted small">' + L("Puts your whole website back exactly the way Finesse Media delivered it: every word, photo, video, price and contact detail. Your current words are saved first, so you can still restore them from Website words.", "Deja todo tu sitio exactamente como lo entregó Finesse Media: cada texto, foto, video, precio y dato de contacto. Tus textos de ahora se guardan antes, así que todavía los puedes restaurar en Textos del sitio.") + '</p><button class="btn danger" data-act="restoreAll">' + ic("refresh") + L("Restore original website", "Restaurar el sitio original") + "</button></section>";
  }
  function fld(label, name, val, type, ph) { return '<label class="field"><span>' + label + '</span><input name="' + name + '" type="' + (type || "text") + '" value="' + esc(val) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : "") + (type === "tel" ? ' inputmode="tel"' : "") + "></label>"; }

  /* ---------- photos and videos ---------- */
  var MS = window.PRESSA_MEDIA, ups = [], galTab = "all";
  var SLOTS = [
    { id: "loop", kind: "video", src: "../video/pressa-loop.mp4", poster: "../images/loop-poster.jpg", en: "Rotating stand video", es: "Video del soporte girando", den: "Top of the page and the welcome screen", des: "Parte de arriba y pantalla de bienvenida" },
    { id: "main", kind: "video", src: "../video/pressa-video.mp4", poster: "../images/video-poster.jpg", en: "Main product video", es: "Video principal del producto", den: "Plays when people tap Watch it in action", des: "Se reproduce al tocar Míralo en acción" },
    { id: "store", kind: "image", src: "../images/stand.jpg", en: "Store photo", es: "Foto de la tienda", den: "Next to the price and Pre-order button", des: "Al lado del precio y el botón de pre-ordenar" },
    { id: "showcase", kind: "image", src: "../images/showcase.jpg", en: "Big product photo", es: "Foto grande del producto", den: "The black section with Up to 90%", des: "La sección negra con el 90%" },
    { id: "feat1", kind: "image", src: "../images/f-rotate.jpg", en: "Feature: Full 360° rotation", es: "Función: Rotación de 360°", den: "Meet Pressa, card 1", des: "Conoce Pressa, tarjeta 1" },
    { id: "feat2", kind: "video", src: "../video/spray-loop.mp4", poster: "../images/spray-poster.jpg", en: "Feature: Faster production", es: "Función: Producción más rápida", den: "Meet Pressa, card 2", des: "Conoce Pressa, tarjeta 2" },
    { id: "feat3", kind: "image", src: "../images/f-body.jpg", en: "Feature: Protects your body", es: "Función: Protege tu cuerpo", den: "Meet Pressa, card 3", des: "Conoce Pressa, tarjeta 3" },
    { id: "feat4", kind: "image", src: "../images/f-stack.jpg", en: "Feature: Stack doors", es: "Función: Apila puertas", den: "Meet Pressa, card 4", des: "Conoce Pressa, tarjeta 4" },
    { id: "feat5", kind: "image", src: "../images/f-aluminum.jpg", en: "Feature: Wood and aluminum", es: "Función: Madera y aluminio", den: "Meet Pressa, card 5", des: "Conoce Pressa, tarjeta 5" },
    { id: "feat6", kind: "image", src: "../images/f-precise.jpg", en: "Feature: Fewer ruined doors", es: "Función: Menos puertas dañadas", den: "Meet Pressa, card 6", des: "Conoce Pressa, tarjeta 6" }
  ];
  var GALLERY = [
    ["factory", "The fabrication shop", "El taller de fabricación"], ["sheet-a", "Laser-cut steel", "Acero cortado con láser"], ["stand-t", "Raw steel, before finish", "Acero crudo, antes del acabado"],
    ["hub", "The rotation hub", "El eje de rotación"], ["sheet-b", "PRESSA cut into every arm", "PRESSA cortado en cada brazo"], ["two-stands", "A matched pair", "Un par listo"], ["forklift", "Built for the shop floor", "Hecho para el taller"]
  ].map(function (g) { return { id: "b-" + g[0], src: "../images/built/" + g[0] + ".jpg", en: g[1], es: g[2], builtIn: true }; });
  function loadUps() {
    if (!MS) return Promise.resolve();
    return MS.all().then(function (l) {
      ups.forEach(function (u) { if (u._url) URL.revokeObjectURL(u._url); });
      ups = l.filter(function (u) { return u.blob && !u.purged; }).sort(function (a, b) { return b.created - a.created; });
      ups.forEach(function (u) { u._url = URL.createObjectURL(u.blob); });
    });
  }
  function slotRec(id) { return ups.filter(function (u) { return u.slot === id && !u.deleted; })[0]; }
  function galItems() {
    var meta = MS ? MS.meta() : {};
    var b = GALLERY.map(function (g) { var m = meta[g.id] || {}; return { id: g.id, builtIn: true, kind: "image", src: g.src, alt: L(g.en, g.es), published: m.published !== false, deleted: !!m.deleted, purged: !!m.purged }; }).filter(function (g) { return !g.purged; });
    var u = ups.filter(function (x) { return x.slot === "gallery"; }).map(function (x) { return { id: x.id, kind: x.kind, src: x._url, alt: x.alt || "", published: x.published, deleted: !!x.deleted, rec: x }; });
    return u.concat(b);
  }
  function vMedia() {
    var g = galItems(), c = { all: 0, live: 0, hidden: 0, trash: 0 };
    g.forEach(function (m) { if (m.deleted) { c.trash++; return; } c.all++; if (m.published) c.live++; else c.hidden++; });
    var list = g.filter(function (m) { return galTab === "trash" ? m.deleted : !m.deleted && (galTab === "all" || (galTab === "live" ? m.published : !m.published)); });
    var tabs = [["all", L("All", "Todas"), c.all], ["live", L("Live", "En vivo"), c.live], ["hidden", L("Hidden", "Ocultas"), c.hidden], ["trash", L("Trash", "Papelera"), c.trash]];
    return head(L("Photos & videos", "Fotos y videos"), L("Replace any photo or video on your website, and manage the From the shop floor gallery.", "Reemplaza cualquier foto o video de tu sitio y maneja la galería Desde el taller.")) +
      '<section class="card"><div class="card-h"><h3>' + L("Photos and videos on your website", "Fotos y videos en tu sitio") + '</h3></div><p class="muted small">' + L("Tap Replace to swap one. The design stays the same, only the picture changes. Use original puts back the one Finesse Media delivered.", "Toca Reemplazar para cambiar una. El diseño se queda igual, solo cambia la imagen. Usar original devuelve la que entregó Finesse Media.") + '</p><div class="slots" id="slotGrid">' +
        SLOTS.map(function (s) {
          var r = slotRec(s.id), src = r ? r._url : s.src, isVid = r ? r.kind === "video" : s.kind === "video";
          var media = isVid ? '<video src="' + esc(src) + '#t=0.5" muted playsinline preload="metadata"' + (!r && s.poster ? ' poster="' + s.poster + '"' : "") + "></video>" : '<img src="' + esc(src) + '" alt="" loading="lazy">';
          return '<div class="slot" data-slot="' + s.id + '"><div class="slot-media">' + media + '<span class="slot-tag' + (r ? "" : " orig") + '">' + (r ? L("Yours", "Tuya") : L("Original", "Original")) + '</span></div><div class="slot-b"><b>' + L(s.en, s.es) + "</b><small>" + L(s.den, s.des) + "</small>" +
            '<div class="slot-row"><label class="btn sm">' + ic("up") + L("Replace", "Reemplazar") + '<input type="file" class="slot-file" data-slot="' + s.id + '" accept="' + (s.kind === "video" ? "video/*,image/*" : "image/*") + '" hidden></label>' +
            (r ? '<button class="btn sm ghost" data-act="slotReset" data-slot="' + s.id + '">' + ic("refresh") + L("Use original", "Usar original") + "</button>" : "") + "</div></div></div>";
        }).join("") + "</div></section>" +
      '<section class="card"><div class="card-h"><h3>' + L("Gallery: From the shop floor", "Galería: Desde el taller") + '</h3><label class="btn sm" id="galAdd">' + ic("plus") + L("Add", "Agregar") + '<input type="file" accept="image/*,video/*" multiple class="gal-file" hidden></label></div>' +
        '<label class="drop" id="galDrop"><input type="file" accept="image/*,video/*" multiple class="gal-file" hidden>' + ic("up") + "<b>" + L("Tap to add photos or videos", "Toca para agregar fotos o videos") + "</b><small>" + L("Or drag them here from your computer. New ones show on your website right away.", "O arrástralos aquí desde tu computadora. Lo nuevo sale en tu sitio de inmediato.") + '</small><span class="drop-prog" id="galProg" hidden></span></label>' +
        '<div class="seg-tabs" id="galTabs">' + tabs.map(function (t) { return '<button class="' + (galTab === t[0] ? "on" : "") + '" data-act="galTab" data-tab="' + t[0] + '">' + t[1] + " (" + t[2] + ")</button>"; }).join("") + "</div>" +
        (list.length ? '<div class="gal">' + list.map(galCard).join("") + "</div>" : empty(galTab === "trash" ? L("Trash is empty.", "La papelera está vacía.") : galTab === "hidden" ? L("Nothing hidden. Everything here is on your website.", "Nada oculto. Todo lo de aquí está en tu sitio.") : L("No photos yet. Add your first one above.", "Todavía no hay fotos. Agrega la primera arriba."), "image")) +
      "</section>";
  }
  function galCard(m) {
    var media = m.kind === "video" ? '<div class="gal-media is-video"><video src="' + esc(m.src) + '#t=0.1" muted playsinline preload="metadata"></video><i class="gal-play" aria-hidden="true"></i><span class="gal-kind">Video</span></div>' : '<div class="gal-media"><img src="' + esc(m.src) + '" alt="' + esc(m.alt) + '" loading="lazy"></div>';
    var body = m.deleted
      ? '<div class="gal-row"><button class="btn xs" data-act="galRestore" data-id="' + m.id + '">' + ic("refresh") + L("Restore", "Restaurar") + '</button><button class="btn xs ghost danger-t" data-act="galPurge" data-id="' + m.id + '">' + L("Delete forever", "Borrar para siempre") + "</button></div>"
      : (m.builtIn ? '<small class="muted">' + esc(m.alt) + "</small>" : '<input class="gal-cap" data-act="galAlt" data-id="' + m.id + '" value="' + esc(m.alt) + '" placeholder="' + L("Caption (optional)", "Texto de la foto (opcional)") + '" maxlength="80">') +
        '<div class="gal-row"><button class="btn xs ' + (m.published ? "" : "ghost") + '" data-act="galPub" data-id="' + m.id + '" aria-pressed="' + !!m.published + '">' + (m.published ? L("Live", "En vivo") : L("Hidden", "Oculta")) + '</button><button class="btn xs ghost icon-b" data-act="galDel" data-id="' + m.id + '" aria-label="' + L("Move to trash", "Mover a la papelera") + '">' + ic("trash") + "</button></div>";
    return '<figure class="gal-i' + (m.published || m.deleted ? "" : " off") + '">' + media + "<figcaption>" + body + "</figcaption></figure>";
  }
  function galSave(m) {
    if (!MS) return Promise.resolve();
    var p;
    if (m.builtIn) { var meta = MS.meta(); meta[m.id] = { published: m.published, deleted: !!m.deleted, purged: !!m.purged }; MS.setMeta(meta); p = Promise.resolve(); }
    else { m.rec.published = m.published; m.rec.deleted = !!m.deleted; m.rec.alt = m.alt; p = m.purged ? MS.del(m.id) : MS.put(stripUrl(m.rec)); }
    return p.then(function () { MS.ping(); }).catch(function () { toast(L("Couldn't save that in this browser. Try again.", "No se pudo guardar en este navegador. Intenta otra vez.")); });
  }
  function stripUrl(r) { var o = {}; Object.keys(r).forEach(function (k) { if (k !== "_url") o[k] = r[k]; }); return o; }
  function galById(id) { return galItems().filter(function (m) { return m.id === id; })[0]; }
  function shrinkImage(f) {
    return new Promise(function (res) {
      if (f.size < 900000 || !/^image\/(jpeg|png|webp)$/.test(f.type)) { res(f); return; }
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        var k = Math.min(1, 2000 / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement("canvas");
        cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
        cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height); URL.revokeObjectURL(u);
        cv.toBlob(function (b) { res(b && b.size < f.size ? b : f); }, "image/jpeg", 0.85);
      };
      im.onerror = function () { URL.revokeObjectURL(u); res(f); };
      im.src = u;
    });
  }
  function isTall(blob, kind) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(blob), el = document.createElement(kind === "video" ? "video" : "img");
      function done(w, h) { URL.revokeObjectURL(u); res(h > w); }
      if (kind === "video") { el.preload = "metadata"; el.onloadedmetadata = function () { done(el.videoWidth, el.videoHeight); }; }
      else el.onload = function () { done(el.naturalWidth, el.naturalHeight); };
      el.onerror = function () { URL.revokeObjectURL(u); res(false); };
      el.src = u;
    });
  }
  function checkFile(f) {
    var vid = /^video\//.test(f.type), img = /^image\//.test(f.type);
    if (!vid && !img) return f.name + L(" isn't a photo or video", " no es foto ni video");
    if (vid && f.size > 60 * 1048576) return f.name + L(": videos up to 60 MB", ": videos de hasta 60 MB");
    if (img && f.size > 25 * 1048576) return f.name + L(": photos up to 25 MB", ": fotos de hasta 25 MB");
    return "";
  }
  function addGallery(files) {
    files = Array.prototype.slice.call(files || []); if (!files.length || !MS) return;
    var bad = [], ok = files.filter(function (f) { var e = checkFile(f); if (e) bad.push(e); return !e; });
    if (bad.length) toast(bad.join(". "));
    if (!ok.length) return;
    var prog = $("#galProg"); if (prog) { prog.hidden = false; prog.textContent = L("Adding ", "Agregando ") + ok.length + "..."; }
    Promise.all(ok.map(function (f, i) {
      var kind = /^video\//.test(f.type) ? "video" : "image";
      return (kind === "video" ? Promise.resolve(f) : shrinkImage(f)).then(function (blob) {
        return isTall(blob, kind).then(function (tall) {
          return MS.put({ id: "u" + Date.now() + "-" + i, slot: "gallery", kind: kind, tall: tall, alt: "", published: true, deleted: false, created: Date.now() + i, name: f.name, blob: blob });
        });
      });
    })).then(function () {
      MS.ping(); markSetup("photo"); if (galTab !== "all" && galTab !== "live") galTab = "all";
      return loadUps();
    }).then(function () { render(); toast(L("Added and showing on your website.", "Agregado y ya sale en tu sitio.")); })
      .catch(function () { toast(L("This browser couldn't keep that file. Try a smaller one.", "Este navegador no pudo guardar ese archivo. Prueba uno más pequeño.")); render(); });
  }
  function replaceSlot(id, file) {
    if (!file || !MS) return;
    var err = checkFile(file); if (err) { toast(err); return; }
    var kind = /^video\//.test(file.type) ? "video" : "image", s = SLOTS.filter(function (x) { return x.id === id; })[0];
    if (s.kind === "image" && kind === "video") { toast(L("This spot needs a photo.", "Este espacio necesita una foto.")); return; }
    (kind === "video" ? Promise.resolve(file) : shrinkImage(file)).then(function (blob) {
      var old = ups.filter(function (u) { return u.slot === id; });
      return Promise.all(old.map(function (u) { return MS.del(u.id); })).then(function () {
        return MS.put({ id: "s" + Date.now(), slot: id, kind: kind, published: true, deleted: false, created: Date.now(), name: file.name, blob: blob });
      });
    }).then(function () { MS.ping(); markSetup("photo"); return loadUps(); })
      .then(function () { render(); toast(L("Replaced. Your website shows the new one now.", "Reemplazada. Tu sitio ya muestra la nueva.")); })
      .catch(function () { toast(L("This browser couldn't keep that file. Try a smaller one.", "Este navegador no pudo guardar ese archivo. Prueba uno más pequeño.")); });
  }

  /* ---------- website words: every text block, with saved versions ---------- */
  var FIELDS = window.PRESSA_FIELDS || [], FM = {}, seQuery = "", seOpen = {}, S_siteDraft = {};
  FIELDS.forEach(function (f) { FM[f.k] = f; });
  function sitePub() { return readJ("pressa-site-content", {}); }
  function siteVersions() { return readJ("pressa-site-versions", []); }
  function pubVal(pub, k, l) { var o = pub[k]; return (o && o[l]) ? o[l] : FM[k][l]; }
  function norm(k, l, v) { return (v == null || !String(v).trim()) ? FM[k][l] : String(v).replace(/\r/g, ""); }
  function draftVal(pub, k, l) { var d = S_siteDraft[k]; return d && d[l] !== undefined ? norm(k, l, d[l]) : pubVal(pub, k, l); }
  function unsavedKeys() { var pub = sitePub(); return Object.keys(S_siteDraft).filter(function (k) { return FM[k] && (draftVal(pub, k, "en") !== pubVal(pub, k, "en") || draftVal(pub, k, "es") !== pubVal(pub, k, "es")); }); }
  function overrideCount(pub) { return Object.keys(pub).filter(function (k) { return FM[k]; }).length; }
  function seField(f, pub) {
    var en = draftVal(pub, f.k, "en"), es = draftVal(pub, f.k, "es"), changed = en !== f.en || es !== f.es;
    function box(l, v) {
      var lab = l === "en" ? "EN" : "ES";
      return '<label class="se-box"><span class="se-lang">' + lab + "</span>" + (f.ml
        ? '<textarea class="se-in" data-k="' + f.k + '" data-l="' + l + '" rows="2" placeholder="' + esc(f[l]) + '">' + esc(v) + "</textarea>"
        : '<input class="se-in" data-k="' + f.k + '" data-l="' + l + '" value="' + esc(v) + '" placeholder="' + esc(f[l]) + '">') + "</label>";
    }
    var hl = /\[/.test(f.en + f.es) ? '<p class="se-hint">' + L("Words inside [brackets] show in <em>orange</em> on the website.", "Las palabras entre [corchetes] salen en <em>anaranjado</em> en el sitio.") + "</p>" : "";
    return '<div class="se-f' + (changed ? " is-changed" : "") + '" data-k="' + f.k + '"><div class="se-fh"><b>' + esc(L(f.l[0], f.l[1])) + '</b><span class="badge se-badge">' + L("Changed", "Cambiado") + '</span><button type="button" class="btn xs ghost se-undo" data-act="seUndo" data-k="' + f.k + '">' + ic("refresh") + L("Use original", "Usar original") + "</button></div>" +
      '<div class="se-two">' + box("en", en) + box("es", es) + "</div>" + hl + "</div>";
  }
  function vSite() {
    var pub = sitePub(), vers = siteVersions(), secs = [], bySec = {}, q = seQuery.toLowerCase();
    FIELDS.forEach(function (f) {
      if (q && [f.en, f.es, f.l[0], f.l[1], f.sl[0], f.sl[1], draftVal(pub, f.k, "en"), draftVal(pub, f.k, "es")].join(" ").toLowerCase().indexOf(q) < 0) return;
      if (!bySec[f.s]) { bySec[f.s] = []; secs.push(f); }
      bySec[f.s].push(f);
    });
    return head(L("Website words", "Textos del sitio"), L("Change any words on your website, in English and Spanish.", "Cambia cualquier texto de tu sitio web, en inglés y en español."),
        '<a class="btn ghost" href="../" target="_blank" rel="noopener">' + ic("click") + L("Open my website", "Abrir mi sitio") + "</a>") +
      '<section class="card se-safe">' + ic("shield") + "<div><b>" + L("You can't break your site from here", "Desde aquí no puedes dañar tu sitio") + '</b><p class="muted small">' + L("Only the words change, never the design. Nothing goes live until you tap Save, and every save is kept below so you can go back. Leave a box empty to use the original words.", "Solo cambian las palabras, nunca el diseño. Nada sale en el sitio hasta que tocas Guardar, y cada vez que guardas queda abajo para que puedas volver. Deja una casilla vacía para usar el texto original.") + "</p></div></section>" +
      '<label class="field se-search"><span class="sr-only">' + L("Find text", "Buscar texto") + '</span><input type="search" id="seSearch" value="' + esc(seQuery) + '" placeholder="' + L("Find a word or section, like price, hours or FAQ", "Busca una palabra o sección, como precio, horario o preguntas") + '" autocomplete="off"></label>' +
      '<div id="seList">' + (secs.length ? secs.map(function (s0) {
        var fs = bySec[s0.s], nCh = fs.filter(function (f) { return draftVal(pub, f.k, "en") !== f.en || draftVal(pub, f.k, "es") !== f.es; }).length, open = q || seOpen[s0.s];
        return '<details class="card se-sec" data-sec="' + s0.s + '"' + (open ? " open" : "") + '><summary><span class="grow"><b>' + esc(L(s0.sl[0], s0.sl[1])) + "</b><small>" + fs.length + L(" items", " textos") + (nCh ? " · " + nCh + L(" changed", " cambiados") : "") + "</small></span>" + ic("chev") + "</summary>" +
          fs.map(function (f) { return seField(f, pub); }).join("") + "</details>";
      }).join("") : empty(L("Nothing matches that. Try another word.", "Nada coincide. Prueba con otra palabra."), "pen")) + "</div>" +
      '<p class="muted small se-note">' + L("The price, colors and contact details are changed in Store and Settings.", "El precio, los colores y los datos de contacto se cambian en Tienda y Ajustes.") + "</p>" +
      '<section class="card" id="seHistory"><h3>' + L("Saved versions", "Versiones guardadas") + '</h3><p class="muted small">' + L("Every save is kept here. Restore any version to put your website back the way it was.", "Cada vez que guardas queda aquí. Restaura cualquier versión para dejar tu sitio como estaba.") + '</p><ul class="rows">' +
        (vers.length ? vers.map(function (v, i) {
          return '<li class="row"><div class="grow"><b>' + (i === 0 ? L("Live now", "En vivo ahora") : esc(noteText(v) || L("Saved", "Guardado"))) + "</b><small>" + stamp(v.at) + L(" by ", " por ") + esc(v.by) + " · " + (i === 0 && noteText(v) ? esc(noteText(v)) + " · " : "") + v.count + (v.count === 1 ? L(" change from the original", " cambio del original") : L(" changes from the original", " cambios del original")) + "</small></div>" +
            (i === 0 ? '<span class="badge ok">' + L("Current", "Actual") + "</span>" : '<button class="btn sm ghost" data-act="seRestore" data-id="' + v.id + '">' + ic("refresh") + L("Restore", "Restaurar") + "</button>") + "</li>";
        }).join("") : '<li class="row"><div class="grow"><small>' + L("No saves yet. Your website is showing the original words.", "Todavía no has guardado. Tu sitio muestra el texto original.") + "</small></div></li>") + "</ul></section>" +
      '<section class="card se-reset"><h3>' + L("Start over", "Empezar de nuevo") + '</h3><p class="muted small">' + L("Puts every word back to the original website. Your current version is saved first, so you can still restore it.", "Regresa todo el texto al sitio original. Tu versión actual se guarda antes, así que todavía la puedes restaurar.") + '</p><button class="btn danger" data-act="seReset"' + (overrideCount(pub) ? "" : " disabled") + ">" + ic("refresh") + L("Reset all words to original", "Regresar todos los textos al original") + "</button></section>" +
      '<div class="se-bar" id="seBar"><span id="seCount"></span><button class="btn ghost sm" data-act="seDiscard" id="seDiscard">' + L("Discard", "Descartar") + '</button><button class="btn sm" data-act="seSave" id="seSave">' + ic("check") + L("Save", "Guardar") + "</button></div>";
  }
  function noteText(v) {
    var n = v.note; if (!n) return "";
    if (n.type === "restored") return L("Restored from ", "Restaurada del ") + stamp(n.from);
    if (n.type === "reset") return L("Back to original", "Regresado al original");
    if (n.type === "original") return L("Original website", "Sitio original");
    return "";
  }
  function seBar() {
    var n = unsavedKeys().length, bar = $("#seBar"); if (!bar) return;
    bar.classList.toggle("on", n > 0);
    $("#seCount").textContent = n ? n + (n === 1 ? L(" unsaved change", " cambio sin guardar") : L(" unsaved changes", " cambios sin guardar")) : L("Everything is saved", "Todo está guardado");
    $("#seSave").disabled = !n; $("#seDiscard").disabled = !n;
  }
  function seFieldState(k) {
    var row = document.querySelector('.se-f[data-k="' + k + '"]'); if (!row) return;
    var pub = sitePub(), f = FM[k];
    row.classList.toggle("is-changed", draftVal(pub, k, "en") !== f.en || draftVal(pub, k, "es") !== f.es);
  }
  function grow(t) { t.style.height = "auto"; t.style.height = (t.scrollHeight + 2) + "px"; }
  function wireSite() {
    var list = $("#seList"); if (!list) return;
    list.addEventListener("input", function (e) {
      var el = e.target; if (!el.classList.contains("se-in")) return;
      var k = el.dataset.k; S_siteDraft[k] = S_siteDraft[k] || {}; S_siteDraft[k][el.dataset.l] = el.value;
      seFieldState(k); seBar(); if (el.tagName === "TEXTAREA") grow(el);
    });
    $$("textarea.se-in", list).forEach(grow);
    list.addEventListener("toggle", function (e) { if (e.target.open) $$("textarea.se-in", e.target).forEach(grow); if (e.target.dataset && e.target.dataset.sec && !seQuery) seOpen[e.target.dataset.sec] = e.target.open; }, true);
    var sr = $("#seSearch"), tm;
    if (sr) sr.addEventListener("input", function () { clearTimeout(tm); tm = setTimeout(function () { seQuery = sr.value.trim(); render(); var s2 = $("#seSearch"); s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); }, 250); });
    seBar();
  }
  function pushVersion(data, note) {
    var vers = siteVersions();
    vers.unshift({ id: "v" + Date.now(), at: Date.now(), by: userName(), count: overrideCount(data), note: note || null, data: data });
    if (vers.length > 25) vers.length = 25;
    var ok = writeJ("pressa-site-versions", vers) && writeJ("pressa-site-content", data);
    if (!ok) toast(L("This browser is full. Couldn't save.", "Este navegador está lleno. No se pudo guardar."));
    return ok;
  }
  function ensureBaseline() { if (!siteVersions().length) writeJ("pressa-site-versions", [{ id: "v0", at: Date.now() - 1000, by: "Finesse Media", count: 0, note: { type: "original" }, data: {} }]); }

  /* ---------- render ---------- */
  var VIEWS = { dashboard: vDashboard, inbox: vInbox, orders: vOrders, store: vStore, site: vSite, media: vMedia, settings: vSettings };
  function render() {
    $("#view").innerHTML = VIEWS[view]();
    var x = NAV.filter(function (y) { return y.id === view; })[0];
    $("#crumb").textContent = navLabel(x);
    document.documentElement.lang = lang;
    $$(".lang-btn").forEach(function (b) { var on = b.dataset.lang === lang; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    $$("[data-t-en]").forEach(function (el) { el.textContent = el.getAttribute("data-t-" + lang); });
    $$("[data-al-en]").forEach(function (el) { el.setAttribute("aria-label", el.getAttribute("data-al-" + lang)); });
    var av = $(".avatar"); if (av) { av.textContent = userName().charAt(0); av.setAttribute("aria-label", L("Signed in as ", "Sesión de ") + userName()); }
    wire();
    document.dispatchEvent(new CustomEvent("pressa:render", { detail: { view: view, lang: lang } }));
  }
  function dirty(formId, btnId, savedId, onSave) {
    var f = $(formId); if (!f) return;
    function snapOf() { var o = {}; $$("input", f).forEach(function (i) { o[i.name] = i.type === "checkbox" ? i.checked : i.value; }); return o; }
    var snap = snapOf();
    f.addEventListener("input", function () { var cur = snapOf(), ch = Object.keys(cur).some(function (k) { return cur[k] !== snap[k]; }); $(btnId).disabled = !ch; $(savedId).hidden = true; });
    f.addEventListener("change", function () { f.dispatchEvent(new Event("input")); });
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var d = snapOf();
      if (onSave(d) === false) return;
      snap = d; $(btnId).disabled = true; $(savedId).hidden = false; toast(L("Saved. Your website is updated.", "Guardado. Tu sitio ya está actualizado."));
    });
  }
  function wire() {
    wireSite();
    dirty("#storeForm", "#storeSave", "#storeSaved", function (d) {
      var p = Math.round(Number(d.price));
      if (!(p > 0)) { toast(L("Enter a price above $0.", "Escribe un precio mayor de $0.")); $('#storeForm [name="price"]').focus(); return false; }
      if (!d.black && !d.orange) { toast(L("Keep at least one color on.", "Deja por lo menos un color prendido.")); return false; }
      writeJ("pressa-store", { price: p, open: d.open, colors: { black: d.black, orange: d.orange } }); markSetup("price");
    });
    dirty("#bizForm", "#bizSave", "#bizSaved", function (d) {
      if (!/@/.test(d.email)) { toast(L("Check the email address.", "Revisa el correo.")); return false; }
      var b = {}; Object.keys(d).forEach(function (k) { b[k] = String(d[k]).trim(); });
      writeJ("pressa-biz", b); markSetup("phones");
    });
    var ts = $("#tipsSwitch"); if (ts) ts.addEventListener("change", function () { if (window.PRESSA_TIPS) window.PRESSA_TIPS.set(ts.checked); });
    $$(".gal-file").forEach(function (inp) { inp.addEventListener("change", function () { addGallery(inp.files); inp.value = ""; }); });
    $$(".slot-file").forEach(function (inp) { inp.addEventListener("change", function () { replaceSlot(inp.dataset.slot, inp.files[0]); inp.value = ""; }); });
    var dz = $("#galDrop");
    if (dz) {
      ["dragenter", "dragover"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("over"); }); });
      ["dragleave", "drop"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("over"); }); });
      dz.addEventListener("drop", function (e) { addGallery(e.dataTransfer && e.dataTransfer.files); });
    }
  }

  /* ---------- modal ---------- */
  function modal(title, bodyHtml, footHtml) {
    $("#modalTitle").textContent = title; $("#modalBody").innerHTML = bodyHtml; $("#modalFoot").innerHTML = footHtml || "";
    $("#modal").hidden = false; document.body.classList.add("modal-open");
    var f = $("#modal input, #modal button.btn"); if (f) f.focus();
  }
  function closeModal() { $("#modal").hidden = true; document.body.classList.remove("modal-open"); }
  function confirmTyped(id, word) { var v = ($("#" + id).value || "").trim().toUpperCase(); return word.indexOf(v) > -1 && v; }

  /* ---------- actions ---------- */
  var ACT = {
    more: function () { var m = $("#moreSheet"); m.hidden = !m.hidden; },
    closeModal: closeModal,
    inboxTab: function (el) { inboxTab = el.dataset.tab; render(); },
    msgDone: function (el) { updateMsg(el.dataset.id, function (m) { m.status = "answered"; }); renderNav(); render(); toast(L("Marked answered", "Marcado como contestado")); },
    msgNew: function (el) { updateMsg(el.dataset.id, function (m) { m.status = "new"; }); renderNav(); render(); },
    msgDel: function (el) {
      modal(L("Delete this message?", "¿Borrar este mensaje?"), "<p>" + L("It's removed from your back office. The copy in your email stays.", "Se quita de tu panel. La copia en tu correo se queda.") + "</p>",
        '<button class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button class="btn danger" data-act="msgDelGo" data-id="' + el.dataset.id + '">' + L("Delete", "Borrar") + "</button>");
    },
    msgDelGo: function (el) { updateMsg(el.dataset.id, function (m) { m.deleted = true; }); closeModal(); renderNav(); render(); toast(L("Message deleted", "Mensaje borrado")); },
    exportWl: function () {
      var rows = [["Email", "Language", "Date"]].concat(allInbox().filter(function (m) { return m.type === "waitlist"; }).map(function (m) { return [m.email, m.lang === "en" ? "English" : "Spanish", new Date(m.at).toLocaleDateString("en-US")]; }));
      var csv = rows.map(function (r) { return r.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
      try { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "pressa-waitlist.csv"; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {}
      toast(L("Waitlist downloaded", "Lista descargada"));
    },
    ship: function (el) {
      modal(L("Mark as shipped", "Marcar como enviado"), '<label class="field"><span>' + L("Tracking number (optional)", "Número de rastreo (opcional)") + '</span><input id="trk" autocomplete="off"></label>',
        '<button class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button class="btn" data-act="shipGo" data-id="' + el.dataset.id + '">' + L("Mark shipped", "Marcar enviado") + "</button>");
    },
    shipGo: function (el) { var t = ($("#trk").value || "").trim(); ST.orders.forEach(function (o) { if (o.id === el.dataset.id) { o.status = "shipped"; if (t) o.tracking = t; } }); saveState(); closeModal(); render(); toast(L("Marked shipped", "Marcado como enviado")); },
    galTab: function (el) { galTab = el.dataset.tab; render(); },
    galPub: function (el) { var m = galById(el.dataset.id); if (!m) return; m.published = !m.published; galSave(m).then(function () { render(); }); toast(m.published ? L("Now showing on your website", "Ya sale en tu sitio") : L("Hidden from your website", "Oculta de tu sitio")); },
    galDel: function (el) { var m = galById(el.dataset.id); if (!m) return; m.deleted = true; galSave(m).then(function () { render(); }); toast(L("Moved to Trash. You can restore it from the Trash tab.", "Se movió a la Papelera. La puedes restaurar en la pestaña Papelera.")); },
    galRestore: function (el) { var m = galById(el.dataset.id); if (!m) return; m.deleted = false; galSave(m).then(function () { render(); }); toast(L("Restored", "Restaurada")); },
    galPurge: function (el) {
      modal(L("Delete forever?", "¿Borrar para siempre?"), "<p>" + L("This can't be undone.", "Esto no se puede deshacer.") + "</p>",
        '<button class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button class="btn danger" data-act="galPurgeGo" data-id="' + el.dataset.id + '">' + L("Delete forever", "Borrar para siempre") + "</button>");
    },
    galPurgeGo: function (el) { var m = galById(el.dataset.id); if (!m) return; m.purged = true; galSave(m).then(loadUps).then(function () { closeModal(); render(); toast(L("Deleted for good", "Borrada para siempre")); }); },
    slotReset: function (el) {
      var id = el.dataset.slot;
      Promise.all(ups.filter(function (u) { return u.slot === id; }).map(function (u) { return MS.del(u.id); })).then(function () { MS.ping(); return loadUps(); })
        .then(function () { render(); toast(L("Back to the original", "De vuelta al original")); });
    },
    seSave: function () {
      var keys = unsavedKeys(); if (!keys.length) return;
      var pub = sitePub(), next = JSON.parse(JSON.stringify(pub));
      keys.forEach(function (k) {
        var o = {}, en = draftVal(pub, k, "en"), es = draftVal(pub, k, "es");
        if (en !== FM[k].en) o.en = en; if (es !== FM[k].es) o.es = es;
        if (o.en || o.es) next[k] = o; else delete next[k];
      });
      ensureBaseline();
      if (pushVersion(next, null)) { S_siteDraft = {}; markSetup("words"); render(); toast(L("Saved. Your website is updated.", "Guardado. Tu sitio ya está actualizado.")); }
    },
    seDiscard: function () { S_siteDraft = {}; render(); toast(L("Changes discarded", "Cambios descartados")); },
    seUndo: function (el) { var k = el.dataset.k; S_siteDraft[k] = { en: "", es: "" }; $$('.se-in[data-k="' + k + '"]').forEach(function (i) { i.value = FM[k][i.dataset.l]; }); seFieldState(k); seBar(); },
    seRestore: function (el) {
      var v = siteVersions().filter(function (x) { return x.id === el.dataset.id; })[0]; if (!v) return;
      modal(L("Restore this version?", "¿Restaurar esta versión?"), "<p>" + L("Your website goes back to how it was on ", "Tu sitio vuelve a como estaba el ") + "<b>" + stamp(v.at) + "</b>.</p><p class=\"muted small\">" + L("The version showing now stays in your list, so you can switch back anytime.", "La versión de ahora se queda en tu lista, así que puedes volver cuando quieras.") + "</p>",
        '<button class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button class="btn" data-act="seRestoreGo" data-id="' + v.id + '">' + L("Restore", "Restaurar") + "</button>");
    },
    seRestoreGo: function (el) {
      var v = siteVersions().filter(function (x) { return x.id === el.dataset.id; })[0]; if (!v) return;
      if (pushVersion(JSON.parse(JSON.stringify(v.data)), { type: "restored", from: v.at })) { S_siteDraft = {}; closeModal(); render(); toast(L("Restored. Your website is back to that version.", "Restaurado. Tu sitio volvió a esa versión.")); }
    },
    seReset: function () {
      modal(L("Reset all words?", "¿Regresar todos los textos?"), "<p>" + L("Every word goes back to the original website. Your current version is saved first.", "Todo el texto vuelve al sitio original. Tu versión actual se guarda antes.") + "</p><p>" + L("Type ", "Escribe ") + "<b>" + L("RESET", "RESTABLECER") + "</b>" + L(" to confirm.", " para confirmar.") + '</p><label class="field"><span>' + L("Confirm", "Confirmar") + '</span><input id="seResetIn" autocomplete="off" autocapitalize="characters"></label>',
        '<button class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button class="btn danger" data-act="seResetGo">' + L("Reset words", "Regresar textos") + "</button>");
    },
    seResetGo: function () {
      if (!confirmTyped("seResetIn", ["RESET", "RESTABLECER"])) { $("#seResetIn").focus(); toast(L("Type RESET to confirm", "Escribe RESTABLECER para confirmar")); return; }
      ensureBaseline(); if (pushVersion({}, { type: "reset" })) { S_siteDraft = {}; closeModal(); render(); toast(L("Your website is back to the original words.", "Tu sitio volvió al texto original.")); }
    },
    restoreAll: function () {
      modal(L("Restore the original website?", "¿Restaurar el sitio original?"), "<p>" + L("Every word, photo, video, price and contact detail goes back to the way Finesse Media delivered it. Your messages and orders are not touched.", "Cada texto, foto, video, precio y dato de contacto vuelve a como lo entregó Finesse Media. Tus mensajes y pedidos no se tocan.") + "</p><p>" + L("Type ", "Escribe ") + "<b>" + L("RESTORE", "RESTAURAR") + "</b>" + L(" to confirm.", " para confirmar.") + '</p><label class="field"><span>' + L("Confirm", "Confirmar") + '</span><input id="raIn" autocomplete="off" autocapitalize="characters"></label>',
        '<button class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button class="btn danger" data-act="restoreAllGo">' + L("Restore original", "Restaurar original") + "</button>");
    },
    restoreAllGo: function () {
      if (!confirmTyped("raIn", ["RESTORE", "RESTAURAR"])) { $("#raIn").focus(); toast(L("Type RESTORE to confirm", "Escribe RESTAURAR para confirmar")); return; }
      ensureBaseline(); pushVersion({}, { type: "reset" });
      try { localStorage.removeItem("pressa-store"); localStorage.removeItem("pressa-biz"); localStorage.removeItem("pressa-media-meta"); } catch (e) {}
      var p = MS ? Promise.all(ups.map(function (u) { return MS.del(u.id); })) : Promise.resolve();
      p.then(function () { if (MS) MS.ping(); return loadUps(); }).then(function () { S_siteDraft = {}; closeModal(); render(); toast(L("Done. Your website looks exactly like the original again.", "Listo. Tu sitio se ve exactamente como el original otra vez.")); });
    },
    clearDemo: function () {
      modal(L("Clear sample data?", "¿Borrar datos de ejemplo?"), "<p>" + L("This removes the sample messages and orders. Real messages from your website stay. Type ", "Esto quita los mensajes y pedidos de ejemplo. Los mensajes reales de tu sitio se quedan. Escribe ") + "<b>" + L("CLEAR", "BORRAR") + "</b>" + L(" to confirm.", " para confirmar.") + '</p><label class="field"><span>' + L("Confirm", "Confirmar") + '</span><input id="clearIn" autocomplete="off" autocapitalize="characters"></label>',
        '<button class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button class="btn danger" data-act="clearDemoGo">' + L("Clear sample data", "Borrar datos de ejemplo") + "</button>");
    },
    clearDemoGo: function () {
      if (!confirmTyped("clearIn", ["CLEAR", "BORRAR"])) { $("#clearIn").focus(); toast(L("Type CLEAR to confirm", "Escribe BORRAR para confirmar")); return; }
      ST.inbox = ST.inbox.filter(function (m) { return !m.isDemo; }); ST.orders = ST.orders.filter(function (o) { return !o.isDemo; }); markSetup("clear"); saveState();
      closeModal(); renderNav(); render(); toast(L("Sample data cleared. You're starting fresh.", "Datos de ejemplo borrados. Empiezas desde cero."));
    }
  };
  function closeMore() { var m = $("#moreSheet"); if (m) m.hidden = true; }
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]");
    if (g) { e.preventDefault(); go(g.dataset.go); return; }
    var a = e.target.closest("[data-act]");
    if (a && a.tagName !== "INPUT" && ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a); return; }
    if (e.target.id === "modal") closeModal();
    if (e.target.id === "moreSheet") closeMore();
  });
  document.addEventListener("change", function (e) {
    var a = e.target.closest("[data-act]"); if (!a) return;
    if (a.dataset.act === "galAlt") { var m = galById(a.dataset.id); if (m && !m.builtIn) { m.alt = a.value.trim(); galSave(m); toast(L("Caption saved", "Texto guardado")); } }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeModal(); closeMore(); } });
  window.addEventListener("beforeunload", function (e) { if (view === "site" && unsavedKeys().length) { e.preventDefault(); e.returnValue = ""; } });
  window.addEventListener("storage", function (e) { if (e.key === "pressa-inbox") { renderNav(); if (view === "inbox" || view === "dashboard") render(); } });
  function setLang(l) { lang = l === "es" ? "es" : "en"; try { localStorage.setItem("pressa-lang", lang); } catch (e) {} renderNav(); render(); }
  $$(".lang-btn").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang); }); });
  window.PRESSA_ADMIN = { view: function () { return view; }, toast: toast, lang: function () { return lang; } };

  window.addEventListener("hashchange", function () { var v = (location.hash || "").replace("#", ""); if (VIEWS[v] && v !== view) go(v); });
  var h = (location.hash || "").replace("#", ""); if (VIEWS[h]) view = h;
  renderNav(); render();
  loadUps().then(function () { if (view === "media") render(); });
})();
