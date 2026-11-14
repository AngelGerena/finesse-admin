(function(){
  var WA = "https://wa.me/14079609004?text=";
  var SMS = "sms:+14079609004?&body=";
  var PHONE = "14073500061";
  var C_WA = "https://wa.me/" + PHONE + "?text=";
  var C_SMS = "sms:+" + PHONE + "?&body=";
  var CLIENT = "Daly (Body Glam by Daly)";

  var tabs = document.querySelectorAll(".tab");
  var cards = document.querySelectorAll(".site");
  var pick = document.getElementById("pickBtn");
  var pickSms = document.getElementById("pickSms");
  var note = document.getElementById("note");

  function show(id){
    var name = "";
    tabs.forEach(function(t){
      var on = t.dataset.look === id;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if(on){ name = t.textContent; t.scrollIntoView({block:"nearest", inline:"center"}); }
    });
    cards.forEach(function(c){ c.hidden = c.id !== id; if(c.id === id) note.textContent = c.dataset.note; });
    var msg = "Hi Angel, this is Daly from Body Glam by Daly. I want the " + name + " design for my website.";
    pick.href = WA + encodeURIComponent(msg);
    pickSms.href = SMS + encodeURIComponent(msg);
    try{ localStorage.setItem("bgbd-site2", id); }catch(e){}
  }
  tabs.forEach(function(t, i){
    t.addEventListener("click", function(){ show(t.dataset.look); window.scrollTo({top:0}); kick(); });
    t.addEventListener("keydown", function(e){
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if(!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n.dataset.look);
    });
  });
  var start = "s1";
  try{ start = localStorage.getItem("bgbd-site2") || "s1"; }catch(e){}
  if(!document.getElementById(start)) start = "s1";
  show(start);

  // EN / ES per card
  function setLang(card, es){
    card.querySelectorAll("[data-es]").forEach(function(el){
      if(el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = es ? el.dataset.es : el.dataset.en;
    });
    card.dataset.lang = es ? "es" : "en";
    var b = card.querySelector("[data-lang]");
    if(b){ b.textContent = es ? "EN" : "ES"; b.setAttribute("aria-label", es ? "Switch to English / Cambiar a inglés" : "Cambiar a español / Switch to Spanish"); }
    card.querySelectorAll(".qr-hint").forEach(function(h){ h.textContent = es ? "Presiona el código para verlo en pantalla completa" : "Press the code to show it full screen"; });
  }
  cards.forEach(function(card){
    var b = card.querySelector("[data-lang]");
    if(b) b.addEventListener("click", function(){ setLang(card, card.dataset.lang !== "es"); });
  });

  // Services: Facial / Body switch
  cards.forEach(function(card){
    var segs = card.querySelectorAll(".seg-b");
    segs.forEach(function(s){
      s.addEventListener("click", function(){
        segs.forEach(function(o){ o.setAttribute("aria-selected", o === s ? "true" : "false"); });
        card.querySelectorAll("[data-pane]").forEach(function(p){ p.hidden = p.dataset.pane !== s.dataset.seg; });
      });
    });
  });

  // Toast
  function toast(msg){
    var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role","status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2200);
  }

  // Zelle: copy email + full screen code
  document.querySelectorAll("[data-copy]").forEach(function(b){
    b.addEventListener("click", function(){
      var es = b.closest(".site").dataset.lang === "es", v = b.dataset.copy;
      function ok(){ toast(es ? "Email copiado" : "Email copied"); }
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(v).then(ok, function(){ fallback(); }); } else fallback();
      function fallback(){ var i = document.createElement("textarea"); i.value = v; document.body.appendChild(i); i.select(); try{ document.execCommand("copy"); ok(); }catch(e){} i.remove(); }
    });
  });
  var zf = document.getElementById("zfull"), zLast = null;
  function zClose(){ zf.hidden = true; document.body.style.overflow = ""; if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function(){}); if(zLast) zLast.focus(); }
  document.querySelectorAll("[data-zelle]").forEach(function(b){
    b.addEventListener("click", function(){
      zLast = b; zf.hidden = false; document.body.style.overflow = "hidden"; zf.querySelector(".qr-x").focus();
      if(zf.requestFullscreen) zf.requestFullscreen().catch(function(){});
    });
  });
  zf.querySelector("[data-z-close]").addEventListener("click", zClose);
  zf.addEventListener("click", function(e){ if(e.target === zf || e.target.tagName === "IMG") zClose(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !zf.hidden) zClose(); });
  document.addEventListener("fullscreenchange", function(){ if(!document.fullscreenElement && !zf.hidden) zClose(); });

  // Booking pop-up (requests go to Daly)
  var bk = document.getElementById("bk"), lastBtn = null, es = false;
  var T = {
    en:{kicker:"Book with Daly", title:"Request an appointment", vag:"Want it instantly? Book on Vagaro",
      s1:"1. Pick the day", s2:"2. Pick the time", s3:"3. Your treatment", fName:"Your name", fVisit:"Visit",
      sms:"Text", close:"Close", prev:"Previous month", next:"Next month",
      fine:"Your request goes to Daly. She confirms every appointment personally.",
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      types:["Facial","Anti-aging","Acne facial","Body sculpting","Wood therapy","Sauna blanket / Detox","Consultation","Not sure yet"],
      visits:["First visit","Returning client","Package session"], pick:"Pick a day and a time to send your request.", at:"at", none:"To be confirmed"},
    es:{kicker:"Reserva con Daly", title:"Solicita una cita", vag:"¿La quieres al instante? Reserva en Vagaro",
      s1:"1. Elige el día", s2:"2. Elige la hora", s3:"3. Tu tratamiento", fName:"Tu nombre", fVisit:"Visita",
      sms:"Texto", close:"Cerrar", prev:"Mes anterior", next:"Mes siguiente",
      fine:"Tu solicitud le llega a Daly. Ella confirma cada cita personalmente.",
      months:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
      dow:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], days:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
      types:["Facial","Antienvejecimiento","Facial para acné","Moldeo corporal","Maderoterapia","Manta sauna / Detox","Consulta","Aún no sé"],
      visits:["Primera visita","Clienta frecuente","Sesión de paquete"], pick:"Elige un día y una hora para enviar tu solicitud.", at:"a las", none:"Por confirmar"}
  };
  var HOURS = [9,10,11,12,13,14,15,16,17,18];
  function ampm(h){ return (h % 12 || 12) + ":00 " + (h < 12 ? "AM" : "PM"); }
  var today = new Date(); today.setHours(0,0,0,0);
  var minDay = new Date(today); minDay.setDate(minDay.getDate()+1);
  var view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  var maxView = new Date(today.getFullYear()+1, today.getMonth(), 1);
  var sel = {date:null, hour:null, type:null};
  var calGrid = document.getElementById("calGrid"), calMonth = document.getElementById("calMonth");
  var prevB = document.getElementById("calPrev"), nextB = document.getElementById("calNext");
  function L(){ return T[es ? "es" : "en"]; }

  function drawCal(){
    var t = L();
    calMonth.textContent = t.months[view.getMonth()] + " " + view.getFullYear();
    document.getElementById("calDow").innerHTML = t.dow.map(function(d){ return "<span>"+d+"</span>"; }).join("");
    calGrid.innerHTML = "";
    for(var i=0;i<view.getDay();i++) calGrid.appendChild(document.createElement("span"));
    var dim = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
    for(var d=1; d<=dim; d++){
      var dt = new Date(view.getFullYear(), view.getMonth(), d), b = document.createElement("button");
      b.type = "button"; b.className = "day"; b.textContent = d;
      b.setAttribute("aria-label", t.days[dt.getDay()] + " " + d + " " + t.months[dt.getMonth()]);
      if(dt < minDay) b.disabled = true;
      if(+dt === +today) b.classList.add("today");
      b.setAttribute("aria-pressed", sel.date && +sel.date === +dt ? "true" : "false");
      (function(dt){ b.addEventListener("click", function(){ sel.date = dt; drawCal(); update(); }); })(dt);
      calGrid.appendChild(b);
    }
    prevB.disabled = view <= new Date(minDay.getFullYear(), minDay.getMonth(), 1);
    nextB.disabled = view >= maxView;
  }
  prevB.addEventListener("click", function(){ view.setMonth(view.getMonth()-1); drawCal(); });
  nextB.addEventListener("click", function(){ view.setMonth(view.getMonth()+1); drawCal(); });

  function drawChips(){
    var t = L(), slots = document.getElementById("slots"), types = document.getElementById("evType"), vis = document.getElementById("bkVisit");
    slots.innerHTML = ""; types.innerHTML = "";
    HOURS.forEach(function(h){
      var b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.textContent = ampm(h);
      b.setAttribute("aria-pressed", sel.hour === h ? "true" : "false");
      b.addEventListener("click", function(){ sel.hour = h; drawChips(); update(); });
      slots.appendChild(b);
    });
    t.types.forEach(function(n, i){
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = n;
      b.setAttribute("aria-pressed", sel.type === i ? "true" : "false");
      b.addEventListener("click", function(){ sel.type = sel.type === i ? null : i; drawChips(); update(); });
      types.appendChild(b);
    });
    var keep = vis.selectedIndex;
    vis.innerHTML = "<option value=''>—</option>" + t.visits.map(function(s){ return "<option>"+s+"</option>"; }).join("");
    vis.selectedIndex = keep > 0 ? keep : 0;
  }
  function dateText(){
    var t = L(), d = sel.date;
    return es ? t.days[d.getDay()] + ", " + d.getDate() + " de " + t.months[d.getMonth()] + " de " + d.getFullYear()
              : t.days[d.getDay()] + ", " + t.months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }
  function update(){
    var t = L(), ok = sel.date && sel.hour !== null;
    var sum = document.getElementById("bkSum"), wa = document.getElementById("bkWa"), sms = document.getElementById("bkSms");
    if(!ok){
      sum.textContent = t.pick;
      wa.setAttribute("aria-disabled","true"); sms.setAttribute("aria-disabled","true");
      wa.href = "https://wa.me/" + PHONE; sms.href = "sms:+" + PHONE; return;
    }
    sum.innerHTML = "<b>" + dateText() + "</b> " + t.at + " <b>" + ampm(sel.hour) + "</b>";
    var name = document.getElementById("bkName").value.trim();
    var vEl = document.getElementById("bkVisit"), visit = vEl.selectedIndex > 0 ? vEl.value : "";
    var type = sel.type === null ? "" : t.types[sel.type];
    var msg = es
      ? "Hola Daly" + (name ? ", soy " + name : "") + ". Quisiera solicitar una cita en Body Glam by Daly.\nFecha: " + dateText() + "\nHora: " + ampm(sel.hour) +
        "\nTratamiento: " + (type || t.none) + "\nVisita: " + (visit || t.none)
      : "Hi Daly" + (name ? ", this is " + name : "") + ". I'd like to request an appointment at Body Glam by Daly.\nDate: " + dateText() + "\nTime: " + ampm(sel.hour) +
        "\nTreatment: " + (type || t.none) + "\nVisit: " + (visit || t.none);
    wa.href = C_WA + encodeURIComponent(msg); sms.href = C_SMS + encodeURIComponent(msg);
    wa.removeAttribute("aria-disabled"); sms.removeAttribute("aria-disabled");
  }
  document.getElementById("bkName").addEventListener("input", update);
  document.getElementById("bkVisit").addEventListener("change", update);

  var VARS = ["--bg","--bg2","--ink","--muted","--accent","--on","--panel","--line","--fd","--fb"];
  function openBk(btn){
    lastBtn = btn; var card = btn.closest(".site");
    es = card && card.dataset.lang === "es";
    var cs = getComputedStyle(card);
    VARS.forEach(function(v){ bk.style.setProperty(v, cs.getPropertyValue(v)); });
    sel = {date:null, hour:null, type:null};
    document.getElementById("bkName").value = ""; document.getElementById("bkVisit").selectedIndex = 0;
    view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
    var t = L();
    bk.querySelectorAll("[data-i18n]").forEach(function(el){ el.textContent = t[el.dataset.i18n]; });
    bk.querySelector(".bk-x").setAttribute("aria-label", t.close);
    prevB.setAttribute("aria-label", t.prev); nextB.setAttribute("aria-label", t.next);
    drawCal(); drawChips(); update();
    bk.hidden = false; document.body.classList.add("bk-open");
    bk.querySelector(".bk-sheet").scrollTop = 0;
    bk.querySelector(".bk-x").focus();
  }
  function closeBk(){
    bk.hidden = true; document.body.classList.remove("bk-open");
    if(lastBtn) lastBtn.focus();
  }
  document.querySelectorAll("[data-book]").forEach(function(b){ b.addEventListener("click", function(){ openVg(b); }); });
  document.querySelectorAll("[data-request]").forEach(function(b){
    b.addEventListener("click", function(){
      if(b.closest("#vg")){ var src = vgLast; closeVg(true); openBk(src); } else openBk(b);
    });
  });
  bk.querySelector("[data-bk-close]").addEventListener("click", closeBk);
  bk.addEventListener("click", function(e){ if(e.target === bk) closeBk(); });
  document.addEventListener("keydown", function(e){
    if(bk.hidden) return;
    if(e.key === "Escape") closeBk();
    if(e.key === "Tab"){
      var f = [].slice.call(bk.querySelectorAll("button:not([disabled]),a:not([aria-disabled]),input,select")).filter(function(x){ return x.offsetParent; });
      if(!f.length) return;
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
    }
  });

  // Vagaro booking pop-up. Paste the script src from Daly's Vagaro booking widget code
  // (Vagaro: Settings > Booking Widget) into VAGARO_WIDGET_SRC to show her live calendar right in the card.
  var VAGARO_WIDGET_SRC = "";
  var vg = document.getElementById("vg"), vgLast = null, vgLoaded = false;
  var VT = {
    en:{kicker:"Book with Daly", title:"Pick your treatment and time", sub:"See Daly's open times and book instantly on Vagaro. You'll get a confirmation right away.",
      open:"Open Daly's Vagaro booking", st1:"Choose a facial or body sculpting service", st2:"Pick a day and an open time",
      st3:"Confirm, and Vagaro sends your reminder", req:"Can't find a time? Send Daly a request", close:"Close"},
    es:{kicker:"Reserva con Daly", title:"Elige tu tratamiento y tu hora", sub:"Mira las horas disponibles de Daly y reserva al instante en Vagaro. Recibirás tu confirmación enseguida.",
      open:"Abrir las reservas de Daly en Vagaro", st1:"Elige un facial o un servicio de moldeo corporal", st2:"Elige un día y una hora disponible",
      st3:"Confirma, y Vagaro te envía tu recordatorio", req:"¿No encuentras hora? Envíale una solicitud a Daly", close:"Cerrar"}
  };
  function openVg(btn){
    vgLast = btn; var card = btn.closest(".site"), isEs = card && card.dataset.lang === "es", t = VT[isEs ? "es" : "en"];
    var cs = getComputedStyle(card);
    VARS.forEach(function(v){ vg.style.setProperty(v, cs.getPropertyValue(v)); });
    vg.querySelectorAll("[data-vi18n]").forEach(function(el){ el.textContent = t[el.dataset.vi18n]; });
    vg.querySelector(".bk-x").setAttribute("aria-label", t.close);
    if(VAGARO_WIDGET_SRC && !vgLoaded){
      vgLoaded = true; var w = document.getElementById("vgWidget"), sc = document.createElement("script");
      sc.src = VAGARO_WIDGET_SRC; sc.async = true; w.appendChild(sc); vg.classList.add("has-widget");
    }
    vg.hidden = false; document.body.classList.add("bk-open");
    vg.querySelector(".bk-sheet").scrollTop = 0; vg.querySelector(".bk-x").focus();
  }
  function closeVg(keep){
    vg.hidden = true; if(!keep){ document.body.classList.remove("bk-open"); if(vgLast) vgLast.focus(); }
  }
  vg.querySelector("[data-vg-close]").addEventListener("click", function(){ closeVg(); });
  vg.addEventListener("click", function(e){ if(e.target === vg) closeVg(); });
  document.addEventListener("keydown", function(e){
    if(vg.hidden) return;
    if(e.key === "Escape") closeVg();
    if(e.key === "Tab"){
      var f = [].slice.call(vg.querySelectorAll("button,a,iframe")).filter(function(x){ return x.offsetParent; });
      if(!f.length) return;
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
    }
  });


  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function cur(){ return document.querySelector(".site:not([hidden])"); }

  // Overlay menu
  cards.forEach(function(site){
    var m = site.querySelector("[data-menu]"), ov = site.querySelector(".overlay");
    function close(){ ov.hidden = true; m.setAttribute("aria-expanded","false"); document.body.classList.remove("ov-open"); }
    m.addEventListener("click", function(){
      var open = ov.hidden; ov.hidden = !open; m.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("ov-open", open);
    });
    ov.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", close); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !ov.hidden) close(); });
  });

  // Split manifesto text into words for the scroll-lit effect
  document.querySelectorAll("[data-lit]").forEach(function(p){
    function split(){
      var txt = p.textContent.trim(), words = txt.split(/\s+/);
      var gold = /^(beauty|inside|glowing|belleza|dentro|brillando)/i;
      p.querySelectorAll("span[data-es]").forEach(function(sp){
        var w = sp.textContent.trim().split(/\s+/);
        sp.innerHTML = w.map(function(x){ return '<span class="wd' + (gold.test(x) ? ' g' : '') + '">' + x + '</span>'; }).join(" ");
      });
    }
    split(); p._split = split;
  });

  // Reveal on scroll
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }); }, {rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });

  // Gold dust
  var dusts = [];
  document.querySelectorAll(".dust").forEach(function(cv){
    var ctx = cv.getContext("2d"), pts = [];
    for(var i=0;i<70;i++) pts.push({x:Math.random(),y:Math.random(),r:Math.random()*1.8+.3,v:Math.random()*.0006+.0002,a:Math.random()*.6+.2,d:Math.random()*Math.PI*2});
    dusts.push({cv:cv,ctx:ctx,pts:pts});
  });
  function drawDust(){
    dusts.forEach(function(d){
      if(!d.cv.closest(".site") || d.cv.closest(".site").hidden) return;
      var r = d.cv.getBoundingClientRect(); if(r.bottom < 0 || r.top > innerHeight) return;
      var w = d.cv.width = d.cv.clientWidth, h = d.cv.height = d.cv.clientHeight, c = d.ctx;
      c.clearRect(0,0,w,h);
      d.pts.forEach(function(p){
        p.y -= p.v; p.d += .01; if(p.y < -.02) p.y = 1.02;
        c.beginPath(); c.arc((p.x + Math.sin(p.d)*.01)*w, p.y*h, p.r, 0, 6.3);
        c.fillStyle = "rgba(240,200,110," + (p.a * (.6 + .4*Math.sin(p.d*3))) + ")"; c.fill();
      });
    });
  }

  // Scroll engine: pinned scenes write --p (0 to 1)
  function prog(el){
    var r = el.getBoundingClientRect(), span = r.height - innerHeight;
    return span <= 0 ? 0 : Math.max(0, Math.min(1, -r.top / span));
  }
  function frame(){
    var site = cur(); if(!site) return;
    site.querySelectorAll("[data-pin]").forEach(function(sec){
      var p = prog(sec); sec.style.setProperty("--p", p.toFixed(4));
      if(sec.classList.contains("bloom")){
        var st = p < .12 ? 0 : p < .38 ? 1 : p < .62 ? 2 : 3;
        sec.classList.remove("s-0","s-1","s-2","s-3"); sec.classList.add("s-" + st);
        sec.querySelector(".rays").style.setProperty("--p", p);
        var foot = sec.querySelector(".bloom-foot"); if(st === 3) foot.removeAttribute("inert"); else foot.setAttribute("inert","");
      }
      if(sec.hasAttribute("data-hscroll")){
        var tr = sec.querySelector(".h-track"), max = tr.scrollWidth - innerWidth;
        var q = Math.max(0, Math.min(1, (p - .05) / .9));
        tr.style.transform = "translate3d(" + (-q * max) + "px,0,0)";
        sec.querySelector(".h-bar").style.setProperty("--p", q);
      }
      var lit = sec.querySelector("[data-lit]");
      if(lit){
        var ws = lit.querySelectorAll(".wd"), n = Math.round(Math.max(0, Math.min(1, (p - .05) / .8)) * ws.length);
        ws.forEach(function(w, i){ w.classList.toggle("on", i < n); });
      }
    });
    site.querySelectorAll("[data-par]").forEach(function(el){
      var r = el.getBoundingClientRect(), c = (r.top + r.height/2 - innerHeight/2) / innerHeight;
      el.style.transform = "translate3d(0," + (c * parseFloat(el.dataset.par)) + "px,0)";
    });
  }
  // Footer giant word fits its row exactly
  function fitGiant(){
    var s = cur(); if(!s) return;
    s.querySelectorAll(".giant").forEach(function(g){
      g.style.fontSize = "100px"; g.style.whiteSpace = "nowrap";
      var cs = getComputedStyle(g.parentNode), w = g.parentNode.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), sw = g.scrollWidth || 1;
      g.style.fontSize = Math.floor(100 * w / sw * .98) + "px";
    });
  }
  window.addEventListener("resize", fitGiant);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitGiant);
  function loop(){ frame(); if(!reduce) drawDust(); requestAnimationFrame(loop); }
  function kick(){ frame(); fitGiant(); }
  requestAnimationFrame(loop); setTimeout(fitGiant, 50);
  window.addEventListener("resize", kick);

  // Re-split lit text after a language switch
  cards.forEach(function(site){
    var b = site.querySelector("[data-lang]");
    if(b) b.addEventListener("click", function(){ site.querySelectorAll("[data-lit]").forEach(function(p){ p._split && p._split(); }); });
  });

  // Atelier: services filter
  document.querySelectorAll(".ix-filter").forEach(function(g){
    var btns = g.querySelectorAll(".fb"), items = g.closest(".index").querySelectorAll(".ix");
    btns.forEach(function(b){ b.addEventListener("click", function(){
      btns.forEach(function(o){ o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      items.forEach(function(it){ it.hidden = b.dataset.f !== "all" && it.dataset.cat !== b.dataset.f; });
    }); });
  });

  // Atelier: treatment finder
  var ESN = window.ESN || {};
  document.querySelectorAll("[data-goals]").forEach(function(box){
    var map = {}; box.dataset.goals.split(";").forEach(function(x){ var k = x.split(":"); map[k[0]] = k[1].split("|"); });
    var site = box.closest(".site"), out = site.querySelector(".fd-out"), list = out.querySelector(".fd-list"), empty = out.querySelector(".fd-empty"), cta = out.querySelector(".fd-cta");
    box.querySelectorAll(".goal").forEach(function(g){ g.addEventListener("click", function(){
      box.querySelectorAll(".goal").forEach(function(o){ o.setAttribute("aria-pressed", o === g ? "true" : "false"); });
      var es = site.dataset.lang === "es";
      list.innerHTML = map[g.dataset.goal].map(function(n){ return "<li>" + (es && ESN[n] ? ESN[n] : n) + "</li>"; }).join("");
      empty.hidden = true; cta.hidden = false;
    }); });
  });

  // Sculpt: glow plan builder (message goes to Daly)
  document.querySelectorAll(".pl-box").forEach(function(box){
    var site = box.closest(".site"), wa = site.querySelector("#planWa"), sms = site.querySelector("#planSms");
    var list = box.querySelector(".pl-list"), empty = box.querySelector(".pl-empty");
    function upd(){
      var es = site.dataset.lang === "es";
      var picks = [].slice.call(box.querySelectorAll(".pk[data-pk][aria-pressed=true]")).map(function(b){ return b.textContent.trim(); });
      var f = box.querySelector(".pk[data-freq][aria-pressed=true]");
      var freq = f ? (es ? f.dataset.freqEs : f.dataset.freq) : "";
      list.innerHTML = picks.map(function(p){ return "<li>" + p + "</li>"; }).join("") + (freq ? "<li>" + (es ? "Frecuencia: " : "How often: ") + freq + "</li>" : "");
      empty.hidden = picks.length > 0;
      if(!picks.length){ wa.setAttribute("aria-disabled","true"); sms.setAttribute("aria-disabled","true"); wa.href = "https://wa.me/14073500061"; sms.href = "sms:+14073500061"; return; }
      var msg = es ? "Hola Daly, armé mi plan de brillo en tu página: " + picks.join(", ") + (freq ? ". Frecuencia: " + freq : "") + ". ¿Me ayudas a reservar?"
                   : "Hi Daly, I built my glow plan on your website: " + picks.join(", ") + (freq ? ". How often: " + freq : "") + ". Can you help me book?";
      wa.href = "https://wa.me/14073500061?text=" + encodeURIComponent(msg);
      sms.href = "sms:+14073500061?&body=" + encodeURIComponent(msg);
      wa.removeAttribute("aria-disabled"); sms.removeAttribute("aria-disabled");
    }
    box.querySelectorAll(".pk[data-pk]").forEach(function(b){ b.addEventListener("click", function(){ b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); upd(); }); });
    box.querySelectorAll(".pk[data-freq]").forEach(function(b){ b.addEventListener("click", function(){
      box.querySelectorAll(".pk[data-freq]").forEach(function(o){ o.setAttribute("aria-pressed", o === b && o.getAttribute("aria-pressed") !== "true" ? "true" : "false"); }); upd(); }); });
    var lb = site.querySelector("[data-lang]"); if(lb) lb.addEventListener("click", function(){ setTimeout(upd, 0); });
    upd();
  });
})();
