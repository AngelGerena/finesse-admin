/* JA Paint Pro - Finesse OS admin demo (Track A). State lives in memory. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var S = JSON.parse(JSON.stringify(window.JA_DATA));
  var view = "dashboard", inboxTab = "bookings", pitchLang = {}, quoteSeq = 260015;
  var ES = window.JA_ES || {};
  var lang = "en";
  try { lang = (localStorage.getItem("ja-admin-lang") || localStorage.getItem("ja-lang")) === "es" ? "es" : "en"; } catch (e) {}

  /* Requests sent from the website preview (same browser) land in the inbox, like they will for real. */
  function importSite() {
    var list = [], added = 0;
    try { list = JSON.parse(localStorage.getItem("ja-demo-inbox") || "[]"); } catch (e) {}
    list.forEach(function (r) {
      var cid = "w" + r.id;
      if (!r || !r.id || S.contacts.some(function (c) { return c.id === cid; })) return;
      var dg = String(r.phone || "").replace(/\D/g, "").slice(-10);
      if (dg.length === 10) r.phone = "(" + dg.slice(0, 3) + ") " + dg.slice(3, 6) + "-" + dg.slice(6);
      S.contacts.unshift({ id: cid, name: r.name, phone: r.phone, email: r.email, city: r.city || "", lang: r.lang === "es" ? "es" : "en", source: "Website" });
      if (r.kind === "booking") S.bookingRequests.unshift({ id: "wb" + r.id, contactId: cid, service: r.service, when: r.when, address: r.address || "", status: "new", notes: r.notes || "" });
      else S.quoteRequests.unshift({ id: "wq" + r.id, contactId: cid, service: r.service, when: r.when, timeline: r.timeline || "", description: r.description || "", photos: r.photos || 0, status: "new" });
      added++;
    });
    return added;
  }
  var fromSite = importSite();
  function L(en, es) { return lang === "es" ? es : en; }
  function tr(s) { return lang === "es" && ES[s] ? ES[s] : s; }
  function svcName(n) { var x = S.services.filter(function (s) { return s.nameEn === n; })[0]; return lang === "es" ? (x ? x.nameEs : tr(n)) : n; }
  function applyLang() {
    document.documentElement.lang = lang;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentElement.closest("script,.lang,[data-noi18n]") ? 2 : 1; } });
    var n;
    while ((n = w.nextNode())) {
      if (n.__shown === undefined || n.nodeValue !== n.__shown) n.__src = n.nodeValue;
      var src = n.__src, key = src.trim(), out = key && lang === "es" && ES[key] ? src.replace(key, ES[key]) : src;
      if (n.nodeValue !== out) n.nodeValue = out;
      n.__shown = out;
    }
    $$("[placeholder],[aria-label],[title]").forEach(function (el) {
      el.__sa = el.__sa || {}; el.__sh = el.__sh || {};
      ["placeholder", "aria-label", "title"].forEach(function (a) {
        var v = el.getAttribute(a); if (v === null) return;
        if (el.__sh[a] === undefined || v !== el.__sh[a]) el.__sa[a] = v;
        var o = tr(el.__sa[a]); el.setAttribute(a, o); el.__sh[a] = o;
      });
    });
    $$(".lang-btn").forEach(function (b) { var on = b.dataset.lang === lang; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
  }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return "$" + Number(n || 0).toLocaleString("en-US"); }
  function fdate(iso) { if (!iso) return tr("Not set"); return new Date(iso).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { weekday: "short", month: "short", day: "numeric" }); }
  function ftime(iso) { return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }); }
  function fdt(iso) { return iso ? fdate(iso) + ", " + ftime(iso) : tr("Not scheduled"); }
  function contact(id) { return S.contacts.filter(function (c) { return c.id === id; })[0] || { name: "Unknown" }; }
  /* Logo: the one uploaded in Settings, or the truck-wrap mark until Javier sends his file */
  var MARK = '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect x="3" y="5" width="28" height="12" rx="6" class="bm-roll"/><path d="M31 11h4v10H19v7" class="bm-frame"/><rect x="16" y="27" width="6" height="11" rx="2" class="bm-handle"/></svg>';
  function logoUrl() { var u = S.businessSettings.logoUrl; try { u = u || localStorage.getItem("ja-demo-logo") || ""; } catch (e) {} return u; }
  function logoHtml(cls) {
    var u = logoUrl();
    return u ? '<img class="' + cls + '" src="' + esc(u) + '" alt="' + esc(S.businessSettings.businessName) + ' logo">'
      : '<span class="' + cls + ' logo-ph">' + MARK + '<span class="brand-text"><b>JA</b> PAINT<em>PRO</em></span></span>';
  }
  function digits(p) { var d = String(p || "").replace(/\D/g, ""); return d.length === 10 ? "1" + d : d; }
  /* Customer-facing quote page link: carries the quote so the page can show it with the logo */
  function quoteLink(q) {
    var c = contact(q.contactId), b = S.businessSettings;
    var data = { id: q.id, to: c.name, on: q.issued, lang: c.lang === "es" ? "es" : "en",
      items: q.items.map(function (i) { return [i.desc, i.qty, i.price]; }), dep: b.depositPct,
      biz: [b.businessName, b.phone, b.email, b.licenseNumber || ""] };
    if (/^https:\/\//.test(b.logoUrl || "")) data.logo = b.logoUrl; /* hosted logo travels with the link */
    var json = JSON.stringify(data), enc = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return new URL("quote.html#" + enc, location.href).href;
  }
  function quoteMsg(q) {
    var c = contact(q.contactId), es = c.lang === "es", b = S.businessSettings, tot = total(q), dep = Math.round(tot * b.depositPct / 100);
    var first = c.name.split(" ")[0];
    return es
      ? "Hola " + first + ", soy Javier de " + b.businessName + ". Aquí está su cotización " + q.id + ": total " + money(tot) + ", depósito para agendar " + money(dep) + ". Véala aquí: " + quoteLink(q) + " Cualquier pregunta, llámeme al " + b.phone + "."
      : "Hi " + first + ", this is Javier with " + b.businessName + ". Here's your quote " + q.id + ": total " + money(tot) + ", deposit to schedule " + money(dep) + ". See it here: " + quoteLink(q) + " Any questions, call me at " + b.phone + ".";
  }
  function total(q) { return q.items.reduce(function (a, i) { return a + i.qty * i.price; }, 0); }
  function toast(msg) {
    var t = $("#toast"); t.textContent = tr(msg); t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }
  function badge(status) { return '<span class="badge b-' + esc(status) + '">' + esc(tr(status)) + "</span>"; }
  function ic(name) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }

  var NAV = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "inbox", label: "Requests", icon: "inbox" },
    { id: "jobs", label: "Jobs", icon: "roller" },
    { id: "quotes", label: "Quotes", icon: "doc" },
    { id: "customers", label: "Customers", icon: "users" },
    { id: "leads", label: "Lead Finder", icon: "target", ai: true },
    { id: "marketing", label: "Marketing Coach", icon: "mega", ai: true },
    { id: "seo", label: "SEO Agent", icon: "chart", ai: true },
    { id: "blog", label: "Blog", icon: "pen" },
    { id: "gallery", label: "Gallery", icon: "image" },
    { id: "site", label: "Site Editor", icon: "layout" },
    { id: "settings", label: "Settings", icon: "gear" }
  ];
  var TABS = ["dashboard", "inbox", "jobs", "leads"];

  function newCount() {
    return S.bookingRequests.filter(function (b) { return b.status === "new"; }).length +
      S.quoteRequests.filter(function (q) { return q.status === "new"; }).length;
  }

  /* ---------- shell ---------- */
  function renderNav() {
    var n = newCount();
    $("#sideNav").innerHTML = NAV.map(function (x) {
      return '<button class="nav-item' + (x.id === view ? " on" : "") + '" data-go="' + x.id + '" title="' + x.label + '">' + ic(x.icon) +
        '<span class="nav-label">' + x.label + "</span>" +
        (x.ai ? '<span class="nav-ai">AI</span>' : "") +
        (x.id === "inbox" && n ? '<span class="nav-count">' + n + "</span>" : "") + "</button>";
    }).join("");
    $("#tabBar").innerHTML = TABS.map(function (id) {
      var x = NAV.filter(function (y) { return y.id === id; })[0];
      return '<button class="tab' + (id === view ? " on" : "") + '" data-go="' + id + '">' + ic(x.icon) + "<span>" + (id === "leads" ? "Leads" : x.label) + "</span>" +
        (id === "inbox" && n ? '<i class="tab-dot"></i>' : "") + "</button>";
    }).join("") + '<button class="tab' + (TABS.indexOf(view) < 0 ? " on" : "") + '" data-act="more" aria-label="More pages">' + ic("menu") + "<span>More</span></button>";
    $("#moreList").innerHTML = NAV.filter(function (x) { return TABS.indexOf(x.id) < 0; }).map(function (x) {
      return '<button class="nav-item' + (x.id === view ? " on" : "") + '" data-go="' + x.id + '">' + ic(x.icon) + '<span class="nav-label">' + x.label + "</span></button>";
    }).join("");
  }
  function go(v) {
    view = v; renderNav(); render(); closeMore();
    var m = $("#main"); if (m) m.scrollTop = 0; window.scrollTo(0, 0);
  }

  /* ---------- views ---------- */
  function vDashboard() {
    var upcoming = S.bookingRequests.filter(function (b) { return b.status !== "done"; })
      .sort(function (a, b) { return new Date(a.when) - new Date(b.when); });
    var pipeline = S.jobs.filter(function (j) { return j.stage !== "done"; }).reduce(function (a, j) { return a + j.value; }, 0);
    var won = S.jobs.filter(function (j) { return ["scheduled", "progress", "done"].indexOf(j.stage) > -1; }).reduce(function (a, j) { return a + j.value; }, 0);
    var todo = S.setupChecklist.filter(function (s) { return !s.done; });
    var hr = new Date().getHours();
    return head((hr < 12 ? L("Good morning, ", "Buenos días, ") : hr < 18 ? L("Good afternoon, ", "Buenas tardes, ") : L("Good evening, ", "Buenas noches, ")) + S.businessSettings.ownerName, "Here's what's happening with JA Paint Pro.") +
            '<div class="kpis">' +
      kpi("New requests", newCount(), "inbox", "Waiting for you") +
      kpi("Estimates this week", upcoming.length, "cal", "Booked online") +
      kpi("Open pipeline", money(pipeline), "roller", "Quoted and scheduled") +
      kpi("Won this month", money(won), "check", "Scheduled, in progress or done") +
      "</div>" +
      (todo.length ? '<section class="card setup"><div class="card-h"><h3>Finish setting up</h3><span class="muted">' + (S.setupChecklist.length - todo.length) + L(" of ", " de ") + S.setupChecklist.length + L(" done", " listos") + '</span></div><div class="prog"><span style="width:' + Math.round((S.setupChecklist.length - todo.length) / S.setupChecklist.length * 100) + '%"></span></div><ul class="checks">' +
        S.setupChecklist.map(function (s) { return '<li><label class="chk"><input type="checkbox" data-act="setup" data-id="' + s.id + '"' + (s.done ? " checked" : "") + "><span>" + esc(s.label) + "</span></label></li>"; }).join("") + "</ul></section>" : "") +
      '<div class="grid2"><section class="card"><div class="card-h"><h3>Upcoming estimates</h3><button class="link" data-go="inbox">View all</button></div><ul class="rows">' +
      upcoming.slice(0, 4).map(function (b) {
        var c = contact(b.contactId);
        return '<li class="row"><div class="when"><b>' + new Date(b.when).toLocaleDateString("en-US", { day: "numeric" }) + "</b><small>" + new Date(b.when).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "short" }).replace(".", "") + '</small></div><div class="grow"><b>' + esc(c.name) + "</b><small>" + esc(svcName(b.service)) + " &middot; " + ftime(b.when) + "</small></div>" + badge(b.status) + "</li>";
      }).join("") + "</ul></section>" +
      '<section class="card"><div class="card-h"><h3>Your AI team</h3><span class="muted">Working in the background</span></div><ul class="rows">' +
      agentRow("seo", "SEO Agent", S.agents.seo.stats.pagesIndexed + L(" of ", " de ") + S.agents.seo.stats.pagesTotal + L(" pages on Google", " páginas en Google")) +
      agentRow("marketing", "Marketing Coach", L("Next email " + S.agents.marketing.sendDay + " at ", "Próximo correo el " + tr(S.agents.marketing.sendDay) + " a las ") + S.agents.marketing.sendTime) +
      agentRow("leads", "Lead Finder", S.agents.leads.found7 + L(" new leads this week", " clientes potenciales nuevos esta semana")) +
      "</ul></section></div>";
  }
  function kpi(label, val, icon, sub) { return '<div class="kpi">' + ic(icon) + "<small>" + label + "</small><b>" + val + "</b><span>" + sub + "</span></div>"; }
  function agentRow(key, name, line) {
    var a = S.agents[key];
    return '<li class="row"><span class="agent-dot' + (a.on ? " on" : "") + '"></span><div class="grow"><b>' + name + "</b><small>" + esc(line) + '</small></div><button class="btn sm ghost" data-go="' + (key === "leads" ? "leads" : key) + '">Open</button></li>';
  }
  function head(t, sub, actions) {
    return '<div class="page-h"><div><h1>' + esc(t) + "</h1>" + (sub ? '<p class="muted">' + esc(sub) + "</p>" : "") + "</div>" + (actions || "") + "</div>";
  }

  function vInbox() {
    var list = inboxTab === "bookings" ? S.bookingRequests : S.quoteRequests;
    return head("Requests", "Every booking and quote request from your website lands here.") +
      '<div class="seg-tabs"><button class="' + (inboxTab === "bookings" ? "on" : "") + '" data-act="inboxTab" data-tab="bookings">' + L("Estimate bookings", "Citas de estimado") + " (" + S.bookingRequests.length + ')</button><button class="' + (inboxTab === "quotes" ? "on" : "") + '" data-act="inboxTab" data-tab="quotes">' + L("Quote requests", "Solicitudes de cotización") + " (" + S.quoteRequests.length + ")</button></div>" +
      (list.length ? '<div class="cards">' + list.map(function (r) {
        var c = contact(r.contactId);
        return '<article class="card req"><div class="card-h"><div><b>' + esc(c.name) + "</b><small>" + esc(svcName(r.service)) + "</small></div>" + badge(r.status) + "</div>" +
          '<dl class="meta"><div><dt>' + (inboxTab === "bookings" ? "Estimate" : "Received") + "</dt><dd>" + fdt(r.when) + "</dd></div>" +
          (r.address ? "<div><dt>Address</dt><dd>" + esc(r.address) + "</dd></div>" : "<div><dt>Timeline</dt><dd>" + esc(tr(r.timeline)) + "</dd></div>") +
          "<div><dt>Phone</dt><dd>" + esc(c.phone) + "</dd></div>" + (r.photos ? "<div><dt>Photos</dt><dd>" + r.photos + L(" attached", " adjuntas") + "</dd></div>" : "") + "</dl>" +
          ((r.notes || r.description) ? '<p class="note">' + esc(r.notes || r.description) + "</p>" : "") +
          '<div class="actions">' +
          (inboxTab === "bookings"
            ? (r.status === "new" ? '<button class="btn sm" data-act="confirmBooking" data-id="' + r.id + '">Confirm</button>' : "") +
              (r.status !== "done" ? '<button class="btn sm ghost" data-act="doneBooking" data-id="' + r.id + '">Mark done</button>' : "")
            : '<button class="btn sm" data-act="newQuote" data-contact="' + r.contactId + '" data-service="' + esc(r.service) + '" data-req="' + r.id + '">Write quote</button>') +
          '<a class="btn sm ghost" href="tel:+1' + c.phone.replace(/\D/g, "") + '">Call</a><a class="btn sm ghost" href="sms:+1' + c.phone.replace(/\D/g, "") + '">Text</a></div></article>';
      }).join("") + "</div>" : empty("No requests yet. When someone fills out the form on your website it lands here and we text you right away."));
  }
  function empty(msg) { return '<div class="empty">' + ic("inbox") + "<p>" + esc(msg) + "</p></div>"; }

  var STAGES = [["estimate", "Estimate"], ["quoted", "Quoted"], ["scheduled", "Scheduled"], ["progress", "In progress"], ["done", "Done"]];
  function vJobs() {
    return head("Jobs", "Move each job forward as it happens.", '<button class="btn" data-act="newJob">' + ic("plus") + "New job</button>") +
      '<div class="board">' + STAGES.map(function (st, si) {
        var js = S.jobs.filter(function (j) { return j.stage === st[0]; });
        return '<section class="col"><div class="col-h"><b>' + st[1] + "</b><span>" + js.length + "</span></div>" +
          (js.length ? js.map(function (j) {
            return '<article class="job"><b>' + esc(j.title) + "</b><small>" + esc(contact(j.contactId).name) + "</small><div class=\"job-f\"><span>" + money(j.value) + "</span><small>" + (j.start ? fdate(j.start) : "No date") + '</small></div><div class="job-a">' +
              (si > 0 ? '<button class="btn xs ghost" data-act="moveJob" data-id="' + j.id + '" data-dir="-1" aria-label="Move back">' + ic("left") + "</button>" : "") +
              (si < STAGES.length - 1 ? '<button class="btn xs" data-act="moveJob" data-id="' + j.id + '" data-dir="1">' + STAGES[si + 1][1] + ic("right") + "</button>" : "") + "</div></article>";
          }).join("") : '<p class="col-empty">Nothing here</p>') + "</section>";
      }).join("") + "</div>";
  }

  function vQuotes() {
    return head("Quotes", "Numbered, branded and saved as sent.", '<button class="btn" data-act="newQuote">' + ic("plus") + "New quote</button>") +
      '<div class="table"><div class="tr th"><span>Quote</span><span>Customer</span><span>Total</span><span>Status</span><span></span></div>' +
      S.quotes.map(function (q) {
        return '<div class="tr"><span><b>' + q.id + "</b><small>" + fdate(q.issued) + "</small></span><span>" + esc(contact(q.contactId).name) + "</span><span><b>" + money(total(q)) + "</b><small>" + S.businessSettings.depositPct + L("% deposit ", "% de depósito ") + money(Math.round(total(q) * S.businessSettings.depositPct / 100)) + "</small></span><span>" + badge(q.status) + '</span><span class="tr-a">' +
          (q.status === "draft" ? '<button class="btn sm" data-act="sendQuote" data-id="' + q.id + '">Send</button>' : "") +
          (q.status === "sent" ? '<button class="btn sm ghost" data-act="acceptQuote" data-id="' + q.id + '">Mark accepted</button>' : "") +
          '<button class="btn sm ghost" data-act="viewQuote" data-id="' + q.id + '">View</button></span></div>';
      }).join("") + "</div>";
  }

  function vCustomers() {
    return head("Customers", S.contacts.length + L(" people and businesses.", " personas y negocios."), '<div class="h-actions"><input class="search" id="custSearch" placeholder="Search name or city" aria-label="Search customers"><button class="btn ghost" data-act="exportCsv">' + ic("down") + "Export CSV</button></div>") +
      '<div class="table" id="custTable">' + custRows("") + "</div>";
  }
  function custRows(q) {
    q = q.toLowerCase();
    var list = S.contacts.filter(function (c) { return !q || (c.name + " " + c.city).toLowerCase().indexOf(q) > -1; });
    return '<div class="tr th"><span>Name</span><span>Phone</span><span>City</span><span>Source</span><span></span></div>' +
      (list.length ? list.map(function (c) {
        return '<div class="tr"><span><b>' + esc(c.name) + "</b><small>" + (c.lang === "es" ? "Prefers Spanish" : "Prefers English") + "</small></span><span>" + esc(c.phone) + "</span><span>" + esc(c.city) + "</span><span>" + esc(tr(c.source)) + '</span><span class="tr-a"><a class="btn sm ghost" href="tel:+1' + c.phone.replace(/\D/g, "") + '">Call</a></span></div>';
      }).join("") : '<div class="tr"><span class="muted">No customers match that search.</span></div>');
  }

  function pitch(l, lang) {
    if (lang === "es") {
      var sg = l.signalEs || l.signal;
      return "Hola, soy Javier de JA Paint Pro. Vi lo siguiente: " + sg.charAt(0).toLowerCase() + sg.slice(1) + ", y me encantaría ayudarles. Hacemos pintura residencial y comercial, y pisos de epoxy y poliaspártico en toda Florida Central, con licencia y seguro. Le preparo un estimado gratis por escrito esta semana. ¿Qué día le queda mejor? Javier, (407) 301-7117.";
    }
    return "Hi, this is Javier with JA Paint Pro. I noticed " + l.signal.charAt(0).toLowerCase() + l.signal.slice(1) + ", and I'd love to help. We handle residential and commercial painting plus epoxy and polyaspartic floors across Central Florida, licensed and insured. I can put together a free written estimate this week. What day works best for you? Javier, (407) 301-7117.";
  }
  function vLeads() {
    var a = S.agents.leads;
    return head("Lead Finder", "Your AI agent finds people likely to need painting and drafts the first message in your voice.", toggle("leads")) +
      '<div class="kpis three">' + kpi("Found this week", a.found7, "target", "Scored by fit") + kpi("You reached out", a.pitched7, "send", "This week") + kpi("Last search", ftime(a.lastRun), "clock", fdate(a.lastRun)) + "</div>" +
      '<p class="callout">' + ic("shield") + "The agent drafts. You send. Nothing goes out without you pressing a button, which keeps you within texting and email rules.</p>" +
      '<div class="cards">' + S.leads.map(function (l) {
        var lg = pitchLang[l.id] || l.lang;
        return '<article class="card lead"><div class="card-h"><div><b>' + esc(l.name) + "</b><small>" + esc(tr(l.type)) + " &middot; " + esc(l.city) + '</small></div><span class="score" title="Fit score">' + l.score + "</span></div>" +
          '<p class="signal">' + ic("spark") + esc(lang === "es" && l.signalEs ? l.signalEs : l.signal) + "</p>" +
          '<div class="pitch-h"><span>Draft message</span><div class="mini-seg"><button class="' + (lg === "en" ? "on" : "") + '" data-act="pitchLang" data-id="' + l.id + '" data-lang="en">EN</button><button class="' + (lg === "es" ? "on" : "") + '" data-act="pitchLang" data-id="' + l.id + '" data-lang="es">ES</button></div></div>' +
          '<p class="pitch" id="pitch-' + l.id + '">' + esc(pitch(l, lg)) + "</p>" +
          '<div class="actions">' + badge(l.status) + '<button class="btn sm" data-act="copyPitch" data-id="' + l.id + '">' + ic("copy") + "Copy</button>" +
          (l.status === "new" ? '<button class="btn sm ghost" data-act="leadContacted" data-id="' + l.id + '">Mark contacted</button>' : "") +
          '<button class="btn sm ghost" data-act="leadSkip" data-id="' + l.id + '">Skip</button></div></article>';
      }).join("") + "</div>";
  }

  function toggle(key) {
    var on = S.agents[key].on;
    return '<button class="switch' + (on ? " on" : "") + '" role="switch" aria-checked="' + on + '" data-act="agentToggle" data-key="' + key + '"><i></i><span>' + (on ? "Agent on" : "Agent paused") + "</span></button>";
  }

  function vMarketing() {
    var m = S.agents.marketing;
    return head("Marketing Coach", "A step-by-step email in Spanish every week, showing you how to get seen on social media.", toggle("marketing")) +
      '<section class="card"><div class="card-h"><h3>Your weekly lessons</h3><span class="muted">' + L(m.sendDay + "s at " + m.sendTime + " to ", "Los " + tr(m.sendDay).toLowerCase() + " a las " + m.sendTime + " a ") + esc(S.businessSettings.email) + "</span></div><ul class=\"rows\">" +
      m.emails.map(function (e, i) {
        return '<li class="row"><span class="wk">' + e.week + '</span><div class="grow"><b>' + esc(e.subject) + "</b><small>" + (e.status === "sent" ? L("Sent", "Enviado") : e.status === "scheduled" ? L("Goes out " + m.sendDay + " at ", "Sale el " + tr(m.sendDay).toLowerCase() + " a las ") + m.sendTime : L("In the queue", "En la cola")) + "</small></div>" + badge(e.status) + '<button class="btn sm ghost" data-act="previewEmail" data-i="' + i + '">Preview</button></li>';
      }).join("") + "</ul></section>" +
      '<section class="card"><div class="card-h"><h3>This week\'s challenge</h3></div><ol class="steps">' +
      "<li><b>Film the before.</b> Before you start, film 10 seconds walking slowly along the wall or floor.</li>" +
      "<li><b>Film one action shot.</b> The roller, the flake broadcast, the spray rig. Phone at waist height.</li>" +
      "<li><b>Film the after</b> from the exact same spot as the before.</li>" +
      "<li><b>Ask the customer</b> for 15 seconds on camera: what they liked, and who they'd send to you.</li>" +
      '<li><b>Post it as a reel</b> with the city in the caption, like "Garaje en Sanford".</li></ol><button class="btn" data-act="challengeDone">' + ic("check") + "I posted it</button></section>";
  }

  function vSeo() {
    var s = S.agents.seo;
    return head("SEO Agent", "Keeps Google finding, reading and ranking your site.", toggle("seo")) +
      '<div class="kpis">' + kpi("Pages on Google", s.stats.pagesIndexed + " / " + s.stats.pagesTotal, "chart", "Indexed") + kpi("Avg. position", s.stats.avgPosition, "up", "Across tracked searches") + kpi("Clicks, 30 days", s.stats.clicks30, "click", "From Google search") + kpi("Last check", ftime(s.lastRun), "clock", fdate(s.lastRun)) + "</div>" +
      '<div class="grid2"><section class="card"><div class="card-h"><h3>Where you rank</h3><button class="btn sm ghost" data-act="runSeo">' + ic("refresh") + "Check now</button></div><ul class=\"rows\">" +
      s.keywords.map(function (k) {
        return '<li class="row"><span class="pos' + (k.pos <= 3 ? " top" : "") + '">#' + k.pos + '</span><div class="grow"><b>' + esc(k.kw) + "</b></div><span class=\"chg " + (k.change >= 0 ? "up" : "down") + '">' + (k.change >= 0 ? "+" : "") + k.change + "</span></li>";
      }).join("") + "</ul></section>" +
      '<section class="card"><div class="card-h"><h3>Agent to-do</h3></div><ul class="checks">' +
      s.tasks.map(function (t, i) { return '<li><label class="chk"><input type="checkbox" data-act="seoTask" data-i="' + i + '"><span>' + esc(t) + "</span></label></li>"; }).join("") +
      '</ul><p class="muted small">Sample numbers in this preview. Live numbers come from Google Search Console once the site launches.</p></section></div>';
  }

  function vBlog() {
    return head("Blog", "Job stories tied to real towns are the strongest pages for local search.", '<button class="btn" data-act="newPost">' + ic("plus") + "New post</button>") +
      '<div class="cards">' + S.blogPosts.map(function (p) {
        return '<article class="card"><div class="card-h"><div><b>' + esc(p.titleEn) + "</b><small>" + esc(p.titleEs) + "</small></div>" + badge(p.status) + '</div><dl class="meta"><div><dt>Town</dt><dd>' + esc(p.city) + "</dd></div><div><dt>Source</dt><dd>" + esc(tr(p.source)) + "</dd></div><div><dt>Date</dt><dd>" + fdate(p.date) + '</dd></div></dl><div class="actions">' +
          (p.status === "draft" ? '<button class="btn sm" data-act="publishPost" data-id="' + p.id + '">Approve and publish</button>' : '<button class="btn sm ghost" data-act="unpublishPost" data-id="' + p.id + '">Unpublish</button>') + "</div></article>";
      }).join("") + "</div>";
  }

  function vGallery() {
    return head("Gallery", "Photos marked live show on your website.", '<label class="btn">' + ic("up") + 'Upload photos<input type="file" accept="image/*" multiple id="galUpload" hidden></label>') +
      '<div class="gal">' + S.media.map(function (m) {
        return '<figure class="gal-i' + (m.published ? "" : " off") + '"><img src="' + esc(m.src) + '" alt="' + esc(m.cat) + ' project photo" loading="lazy"><figcaption><select data-act="mediaCat" data-id="' + m.id + '" aria-label="Category">' +
          ["exterior", "interior", "floors", "commercial", "pressure"].map(function (c) { return '<option value="' + c + '"' + (c === m.cat ? " selected" : "") + ">" + c + "</option>"; }).join("") +
          '</select><button class="btn xs ' + (m.published ? "" : "ghost") + '" data-act="mediaPub" data-id="' + m.id + '">' + (m.published ? "Live" : "Hidden") + "</button></figcaption></figure>";
      }).join("") + "</div>";
  }

  function vSite() {
    return head("Site Editor", "Change what your website says. Leave a field empty to go back to the original.") +
      '<form class="card form" id="siteForm"><label class="field"><span>Headline (English)</span><input name="h1en" value="Paint it right. Coat it tough."></label><label class="field"><span>Headline (Spanish)</span><input name="h1es" value="Bien pintado. Bien protegido."></label>' +
      '<label class="field"><span>Short description (English)</span><textarea name="suben" rows="2">Interior and exterior painting, epoxy and polyaspartic floors and pressure washing for homes and businesses across Central Florida.</textarea></label>' +
      '<label class="field"><span>Short description (Spanish)</span><textarea name="subes" rows="2">Pintura interior y exterior, pisos de epoxy y poliaspártico y lavado a presión para casas y negocios en toda Florida Central.</textarea></label>' +
      '<div class="form-a"><button class="btn" type="submit" id="siteSave" disabled>Save changes</button><span class="saved" id="siteSaved" hidden>' + ic("check") + "Saved</span></div></form>";
  }

  function vSettings() {
    var b = S.businessSettings;
    return head("Settings", "Your business details show on your website, quotes and invoices.") +
      '<section class="card logo-card" id="logoCard"><div class="logo-prev">' + logoHtml("logo-big") + '</div><div class="grow"><h3>Your logo</h3><p class="muted small">' + (logoUrl() ? L("This logo shows on every quote you send.", "Este logo sale en cada cotización que envías.") : L("Shows on every quote you send. Until you upload yours, quotes use the logo from your truck.", "Sale en cada cotización que envías. Hasta que subas el tuyo, las cotizaciones usan el logo de tu camioneta.")) + '</p>' +
      '<div class="tips-row"><label class="btn sm">' + ic("up") + (logoUrl() ? "Change logo" : "Upload logo") + '<input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" id="logoUpload" hidden></label>' + (logoUrl() ? '<button class="btn sm ghost" data-act="removeLogo">Remove</button>' : "") + "</div></div></section>" +
      '<div class="grid2"><form class="card form" id="bizForm"><h3>Business</h3>' +
      field("Business name", "businessName", b.businessName) + field("Phone", "phone", b.phone) + field("Email", "email", b.email) +
      field("Contractor license number", "licenseNumber", b.licenseNumber, "Shows on quotes and the footer") + field("Deposit percent", "depositPct", b.depositPct) +
      '<div class="form-a"><button class="btn" type="submit" id="bizSave" disabled>Save</button><span class="saved" id="bizSaved" hidden>' + ic("check") + "Saved</span></div></form>" +
      '<section class="card"><h3>Hours</h3><ul class="rows">' + b.hours.map(function (h) {
        return '<li class="row"><div class="grow"><b>' + h.day + "</b></div><span>" + (h.closed ? "Closed" : h.open + " - " + h.close) + "</span></li>";
      }).join("") + '</ul><h3 class="mt">Services and prices</h3><ul class="rows">' + S.services.map(function (s) {
        return '<li class="row"><div class="grow"><b>' + esc(lang === "es" ? s.nameEs : s.nameEn) + "</b><small>" + esc(lang === "es" ? s.nameEn : s.nameEs) + "</small></div><span>" + (s.price ? money(s.price) : esc(tr(s.priceNote))) + "</span></li>";
      }).join("") + '</ul><h3 class="mt">Demo data</h3><p class="muted small">This preview is filled with sample customers and jobs so you can try everything.</p><button class="btn danger" data-act="clearDemo">' + ic("trash") + "Clear demo data</button></section></div>" +
      '<section class="card tips-card" id="tipsCard"><h3>Help tips</h3><p class="muted small">Short tips that walk you through each page the first time you open it. On a computer, rest your mouse on a button to see what it does.</p>' +
      '<div class="tips-row"><button type="button" class="switch' + (tipsOn() ? " on" : "") + '" role="switch" aria-checked="' + tipsOn() + '" data-tip-act="toggle"><i></i><span>' + (tipsOn() ? L("Tips are on", "Consejos prendidos") : L("Tips are off", "Consejos apagados")) + "</span></button>" +
      '<button type="button" class="btn sm ghost" data-tip-act="replay-all">' + ic("refresh") + "Show all tips again</button></div></section>";
  }
  function tipsOn() { return !window.JA_TIPS || window.JA_TIPS.on(); }
  function field(label, name, val, hint) {
    return '<label class="field"><span>' + label + '</span><input name="' + name + '" value="' + esc(val) + '"' + (name === "depositPct" ? ' inputmode="numeric"' : "") + ">" + (hint ? "<small>" + hint + "</small>" : "") + "</label>";
  }

  var VIEWS = { dashboard: vDashboard, inbox: vInbox, jobs: vJobs, quotes: vQuotes, customers: vCustomers, leads: vLeads, marketing: vMarketing, seo: vSeo, blog: vBlog, gallery: vGallery, site: vSite, settings: vSettings };
  function render() {
    $("#view").innerHTML = VIEWS[view]();
    var label = NAV.filter(function (x) { return x.id === view; })[0].label;
    $("#crumb").textContent = label;
    wireForms(); applyLang();
    document.dispatchEvent(new CustomEvent("ja:render", { detail: { view: view, lang: lang } }));
  }

  /* ---------- forms with dirty-state save ---------- */
  function dirty(formId, btnId, savedId, onSave) {
    var f = $(formId); if (!f) return;
    var start = new FormData(f), snap = {};
    start.forEach(function (v, k) { snap[k] = v; });
    f.addEventListener("input", function () {
      var changed = false; new FormData(f).forEach(function (v, k) { if (snap[k] !== v) changed = true; });
      $(btnId).disabled = !changed; $(savedId).hidden = true;
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var d = {}; new FormData(f).forEach(function (v, k) { d[k] = v; snap[k] = v; });
      onSave(d); $(btnId).disabled = true; $(savedId).hidden = false; toast("Saved");
    });
  }
  function wireForms() {
    dirty("#siteForm", "#siteSave", "#siteSaved", function () {});
    dirty("#bizForm", "#bizSave", "#bizSaved", function (d) {
      Object.keys(d).forEach(function (k) { S.businessSettings[k] = k === "depositPct" ? Number(d[k]) || 0 : d[k]; });
      if (d.licenseNumber) markSetup("s3");
    });
    var cs = $("#custSearch");
    if (cs) cs.addEventListener("input", function () { $("#custTable").innerHTML = custRows(cs.value); });
    var lu = $("#logoUpload");
    if (lu) lu.addEventListener("change", function () {
      var f = lu.files[0]; if (!f) return;
      if (f.size > 2 * 1024 * 1024) { toast(L("That file is over 2 MB. Try a smaller logo.", "Ese archivo pasa de 2 MB. Prueba un logo más pequeño.")); return; }
      var rd = new FileReader();
      rd.onload = function () {
        S.businessSettings.logoUrl = rd.result;
        try { localStorage.setItem("ja-demo-logo", rd.result); } catch (e) {}
        markSetup("s1"); render(); toast(L("Logo saved. It's on your quotes now.", "Logo guardado. Ya sale en tus cotizaciones."));
      };
      rd.readAsDataURL(f);
    });
    var up = $("#galUpload");
    if (up) up.addEventListener("change", function () {
      Array.prototype.slice.call(up.files).forEach(function (f, i) {
        S.media.unshift({ id: "m" + Date.now() + i, src: URL.createObjectURL(f), cat: "exterior", published: false });
      });
      toast(up.files.length + L(" photo" + (up.files.length > 1 ? "s" : "") + " added. Mark them live to show on your site.", (up.files.length > 1 ? " fotos agregadas" : " foto agregada") + ". Márcalas en vivo para que salgan en tu sitio."));
      render();
    });
  }
  function markSetup(id) { S.setupChecklist.forEach(function (s) { if (s.id === id) s.done = true; }); }

  /* ---------- modal ---------- */
  function modal(title, bodyHtml, footHtml) {
    $("#modalTitle").textContent = title; $("#modalBody").innerHTML = bodyHtml; $("#modalFoot").innerHTML = footHtml || "";
    $("#modal").hidden = false; document.body.classList.add("modal-open");
    applyLang();
    var f = $("#modal input, #modal select, #modal textarea, #modal button.btn"); if (f) f.focus();
  }
  function closeModal() { $("#modal").hidden = true; document.body.classList.remove("modal-open"); }

  function quoteForm(contactId, service, reqId) {
    var opts = S.contacts.map(function (c) { return '<option value="' + c.id + '"' + (c.id === contactId ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("");
    var svc = S.services.filter(function (s) { return s.nameEn === service; })[0];
    modal(L("New quote ", "Nueva cotización ") + "Q-" + quoteSeq,
      '<form id="qForm" class="form"><label class="field"><span>Customer</span><select name="contact">' + opts + "</select></label>" +
      '<label class="field"><span>Description</span><input name="desc" value="' + esc(svcName(service) || L("Exterior repaint", "Pintura exterior")) + '" required></label>' +
      '<div class="two"><label class="field"><span>Qty</span><input name="qty" type="number" min="1" value="1" inputmode="numeric"></label><label class="field"><span>Price ($)</span><input name="price" type="number" min="0" value="' + (svc && svc.price ? svc.price : 2500) + '" inputmode="numeric"></label></div>' +
      '<p class="q-total">Total <b id="qTotal"></b><small id="qDep"></small></p><input type="hidden" name="req" value="' + (reqId || "") + '"></form>',
      '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn ghost" data-act="saveQuote" data-send="0">Save draft</button><button class="btn" data-act="saveQuote" data-send="1">Save and send</button>');
    var f = $("#qForm");
    function upd() { var t = (Number(f.qty.value) || 0) * (Number(f.price.value) || 0); $("#qTotal").textContent = money(t); $("#qDep").textContent = S.businessSettings.depositPct + L("% deposit ", "% de depósito ") + money(Math.round(t * S.businessSettings.depositPct / 100)); }
    f.addEventListener("input", upd); upd();
  }

  /* ---------- actions ---------- */
  var ACT = {
    more: function () { var m = $("#moreSheet"); m.hidden = !m.hidden; },
    closeModal: closeModal,
    setup: function (el) { S.setupChecklist.forEach(function (s) { if (s.id === el.dataset.id) s.done = el.checked; }); render(); },
    inboxTab: function (el) { inboxTab = el.dataset.tab; render(); },
    confirmBooking: function (el) { setStatus(S.bookingRequests, el.dataset.id, "confirmed"); toast("Confirmed. The customer gets a text reminder the day before."); },
    doneBooking: function (el) { setStatus(S.bookingRequests, el.dataset.id, "done"); toast("Marked done"); },
    newQuote: function (el) { quoteForm(el.dataset.contact, el.dataset.service, el.dataset.req); },
    saveQuote: function (el) {
      var f = $("#qForm"); if (!f.desc.value.trim()) { f.desc.focus(); return; }
      var q = { id: "Q-" + quoteSeq++, contactId: f.contact.value, status: el.dataset.send === "1" ? "sent" : "draft", issued: new Date().toISOString(), items: [{ desc: f.desc.value.trim(), qty: Number(f.qty.value) || 1, price: Number(f.price.value) || 0 }] };
      S.quotes.unshift(q);
      if (f.req.value) setStatus(S.quoteRequests, f.req.value, "quoted", true);
      closeModal(); view = "quotes"; renderNav(); render();
      toast(q.status === "sent" ? q.id + L(" sent to ", " enviada a ") + contact(q.contactId).name : q.id + L(" saved as a draft", " guardada como borrador"));
    },
    sendQuote: function (el) { S.quotes.forEach(function (q) { if (q.id === el.dataset.id) q.status = "sent"; }); render(); toast(el.dataset.id + L(" sent by text and email", " enviada por texto y correo")); },
    acceptQuote: function (el) {
      S.quotes.forEach(function (q) {
        if (q.id === el.dataset.id) { q.status = "accepted"; S.jobs.push({ id: "j" + Date.now(), title: contact(q.contactId).name.split(" ").pop() + " job", contactId: q.contactId, stage: "scheduled", value: total(q), start: null }); }
      });
      render(); toast("Accepted. A job was added to Scheduled.");
    },
    viewQuote: function (el) {
      var q = S.quotes.filter(function (x) { return x.id === el.dataset.id; })[0], c = contact(q.contactId), b = S.businessSettings;
      var msg = quoteMsg(q), es = c.lang === "es";
      modal(q.id, '<div class="qdoc"><div class="qdoc-h">' + logoHtml("qdoc-logo") + '<div class="qdoc-biz"><b>' + esc(b.legalName || b.businessName) + "</b><small>" + esc(b.phone) + "<br>" + esc(b.email) + (b.licenseNumber ? "<br>Lic. " + esc(b.licenseNumber) : "") + "</small></div></div><p>" + L("Prepared for ", "Preparado para ") + "<b>" + esc(c.name) + "</b>" + L(" on ", " el ") + fdate(q.issued) + "</p>" +
        q.items.map(function (i) { return '<div class="qline"><span>' + esc(i.desc) + (i.qty > 1 ? " x" + i.qty : "") + "</span><b>" + money(i.qty * i.price) + "</b></div>"; }).join("") +
        '<div class="qline tot"><span>Total</span><b>' + money(total(q)) + '</b></div><div class="qline"><span>' + L("Deposit due to schedule (", "Depósito para agendar (") + b.depositPct + "%)</span><b>" + money(Math.round(total(q) * b.depositPct / 100)) + "</b></div></div>" +
        '<p class="muted small qshare-note">' + L("Your logo goes on every quote. The customer gets a link to this quote page, which they can save as a PDF.", "Tu logo sale en cada cotización. El cliente recibe un enlace a esta página, que puede guardar como PDF.") + (logoUrl() ? "" : " " + L("Upload your logo in Settings.", "Sube tu logo en Ajustes.")) + "</p>",
        '<button class="btn ghost" data-act="closeModal">Close</button>' +
        '<a class="btn ghost" href="' + esc(quoteLink(q)) + '" target="_blank" rel="noopener" data-act="quotePdf">' + ic("down") + "PDF</a>" +
        (c.email ? '<a class="btn ghost" href="mailto:' + esc(c.email) + "?subject=" + encodeURIComponent((es ? "Su cotización " : "Your quote ") + q.id + " - " + b.businessName) + "&body=" + encodeURIComponent(msg) + '" data-act="quoteShared" data-id="' + q.id + '">' + ic("send") + "Email</a>" : "") +
        '<a class="btn wa" href="https://wa.me/' + digits(c.phone) + "?text=" + encodeURIComponent(msg) + '" target="_blank" rel="noopener" data-act="quoteShared" data-id="' + q.id + '">' + ic("wa") + "WhatsApp</a>");
    },
    quotePdf: function () {},
    removeLogo: function () { S.businessSettings.logoUrl = ""; try { localStorage.removeItem("ja-demo-logo"); } catch (e) {} S.setupChecklist.forEach(function (x) { if (x.id === "s1") x.done = false; }); render(); toast(L("Logo removed", "Logo quitado")); },
    quoteShared: function (el) { S.quotes.forEach(function (q) { if (q.id === el.dataset.id && q.status === "draft") q.status = "sent"; }); },
    newJob: function () {
      var opts = S.contacts.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + "</option>"; }).join("");
      modal("New job", '<form id="jForm" class="form"><label class="field"><span>Job name</span><input name="title" placeholder="Example: Smith exterior repaint" required></label><label class="field"><span>Customer</span><select name="contact">' + opts + '</select></label><label class="field"><span>Value ($)</span><input name="value" type="number" min="0" value="2500" inputmode="numeric"></label></form>',
        '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn" data-act="saveJob">Add job</button>');
    },
    saveJob: function () {
      var f = $("#jForm"); if (!f.title.value.trim()) { f.title.focus(); return; }
      S.jobs.push({ id: "j" + Date.now(), title: f.title.value.trim(), contactId: f.contact.value, stage: "estimate", value: Number(f.value.value) || 0, start: null });
      closeModal(); render(); toast("Job added to Estimate");
    },
    moveJob: function (el) {
      S.jobs.forEach(function (j) {
        if (j.id !== el.dataset.id) return;
        var i = STAGES.map(function (s) { return s[0]; }).indexOf(j.stage) + Number(el.dataset.dir);
        j.stage = STAGES[i][0]; toast(j.title + L(" moved to ", " pasó a ") + tr(STAGES[i][1]));
      });
      render();
    },
    exportCsv: function () {
      var rows = [["Name", "Phone", "Email", "City", "Source"]].concat(S.contacts.map(function (c) { return [c.name, c.phone, c.email, c.city, c.source]; }));
      var csv = rows.map(function (r) { return r.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
      try { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "ja-paint-pro-customers.csv"; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {}
      toast("Customer list exported");
    },
    pitchLang: function (el) { pitchLang[el.dataset.id] = el.dataset.lang; render(); },
    copyPitch: function (el) {
      var txt = $("#pitch-" + el.dataset.id).textContent, done = function () { toast("Message copied. Paste it into a text or email."); };
      try { navigator.clipboard.writeText(txt).then(done, done); } catch (e) { done(); }
    },
    leadContacted: function (el) { setStatus(S.leads, el.dataset.id, "contacted", true); S.agents.leads.pitched7++; render(); toast("Marked contacted"); },
    leadSkip: function (el) { S.leads = S.leads.filter(function (l) { return l.id !== el.dataset.id; }); render(); toast("Lead skipped. The agent learns from this."); },
    agentToggle: function (el) { var a = S.agents[el.dataset.key]; a.on = !a.on; render(); toast(tr(a.name) + (a.on ? L(" is on", " está encendido") : L(" is paused", " está en pausa"))); },
    previewEmail: function (el) {
      var e = S.agents.marketing.emails[Number(el.dataset.i)];
      modal(e.subject, '<div class="email"><p>Hola Javier,</p><p>Esta semana vamos a enfocarnos en una sola cosa. Sigue estos pasos:</p><ol><li>Graba 10 segundos del <b>antes</b> caminando despacio.</li><li>Graba una toma de acción: el rodillo, las hojuelas, la pistola de pintura.</li><li>Graba el <b>después</b> desde el mismo lugar.</li><li>Pídele al cliente 15 segundos: qué le gustó y a quién te recomendaría.</li><li>Súbelo como reel con la ciudad en el texto, por ejemplo "Garaje en Sanford".</li></ol><p>Cuando lo subas, márcalo como hecho en tu portal.</p><p>Tu equipo de Finesse Media</p></div>',
        '<button class="btn ghost" data-act="closeModal">Close</button>');
    },
    challengeDone: function () { toast("Nice work. Your coach will check how it did next week."); },
    runSeo: function () {
      S.agents.seo.lastRun = new Date().toISOString();
      S.agents.seo.keywords.forEach(function (k) { if (k.pos > 1 && Math.random() > 0.5) { k.pos--; k.change++; } });
      render(); toast("Rankings checked");
    },
    seoTask: function (el) { if (el.checked) toast("Done"); },
    newPost: function () {
      modal("New post", '<form id="pForm" class="form"><label class="field"><span>Title (English)</span><input name="en" placeholder="Example: Exterior repaint in Lake Mary" required></label><label class="field"><span>Title (Spanish)</span><input name="es" placeholder="Ejemplo: Pintura exterior en Lake Mary"></label><label class="field"><span>Town</span><input name="city" value="Deltona"></label></form>',
        '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn" data-act="savePost">Save draft</button>');
    },
    savePost: function () {
      var f = $("#pForm"); if (!f.en.value.trim()) { f.en.focus(); return; }
      S.blogPosts.unshift({ id: "p" + Date.now(), titleEn: f.en.value.trim(), titleEs: f.es.value.trim() || f.en.value.trim(), city: f.city.value, status: "draft", date: new Date().toISOString(), source: "Written by you" });
      closeModal(); render(); toast("Draft saved");
    },
    publishPost: function (el) { setStatus(S.blogPosts, el.dataset.id, "published"); toast("Published to your blog"); },
    unpublishPost: function (el) { setStatus(S.blogPosts, el.dataset.id, "draft"); toast("Moved back to drafts"); },
    mediaPub: function (el) { S.media.forEach(function (m) { if (m.id === el.dataset.id) { m.published = !m.published; toast(m.published ? "Now showing on your site" : "Hidden from your site"); } }); render(); },
    clearDemo: function () {
      modal("Clear demo data", '<p>This removes the sample customers, requests, quotes and jobs. Type <b>' + L("CLEAR", "BORRAR") + '</b> to confirm.</p><label class="field"><span>Confirm</span><input id="clearConfirm" autocomplete="off"></label>',
        '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn danger" data-act="clearDemoGo">Clear demo data</button>');
    },
    clearDemoGo: function () {
      var cv = $("#clearConfirm").value.trim().toUpperCase(); if (cv !== "CLEAR" && cv !== "BORRAR") { $("#clearConfirm").focus(); toast(L("Type CLEAR to confirm", "Escribe BORRAR para confirmar")); return; }
      ["contacts", "bookingRequests", "quoteRequests", "quotes", "jobs", "leads", "blogPosts"].forEach(function (k) { S[k] = S[k].filter(function (x) { return !x.isDemo; }); });
      markSetup("s5"); closeModal(); renderNav(); render(); toast("Demo data cleared. You're starting fresh.");
    }
  };
  function setStatus(list, id, st, quiet) { list.forEach(function (x) { if (x.id === id) x.status = st; }); if (!quiet) { renderNav(); render(); } }
  function closeMore() { var m = $("#moreSheet"); if (m) m.hidden = true; }

  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]");
    if (g) { e.preventDefault(); go(g.dataset.go); return; }
    var a = e.target.closest("[data-act]");
    if (a && a.tagName === "A" && a.getAttribute("href") && a.getAttribute("href") !== "#" && ACT[a.dataset.act]) { ACT[a.dataset.act](a); return; } /* real links still open */
    if (a && a.tagName !== "INPUT" && a.tagName !== "SELECT" && ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a); return; }
    if (e.target.id === "modal") closeModal();
  });
  document.addEventListener("change", function (e) {
    var a = e.target.closest("[data-act]");
    if (!a) return;
    if (a.dataset.act === "mediaCat") { S.media.forEach(function (m) { if (m.id === a.dataset.id) m.cat = a.value; }); toast("Category updated"); }
    else if (ACT[a.dataset.act]) ACT[a.dataset.act](a);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeModal(); closeMore(); } });

  window.JA_ADMIN = { view: function () { return view; }, toast: function (m) { toast(m); } };
  function setLang(l) {
    lang = l === "es" ? "es" : "en";
    try { localStorage.setItem("ja-admin-lang", lang); localStorage.setItem("ja-lang", lang); } catch (e) {}
    renderNav(); render();
  }
  $$(".lang-btn").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang); }); });

  /* Open a page from the link: #inbox, #inbox-quotes, #jobs ... */
  var h = (location.hash || "").replace("#", "");
  if (h === "inbox-quotes") { view = "inbox"; inboxTab = "quotes"; }
  else if (VIEWS[h]) view = h;
  renderNav(); render();
  if (fromSite) setTimeout(function () {
    toast(fromSite === 1 ? L("1 new request from your website", "1 solicitud nueva de tu sitio web") : L(fromSite + " new requests from your website", fromSite + " solicitudes nuevas de tu sitio web"));
  }, 600);
})();
