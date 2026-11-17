(function(){
  var PHONE = "14073500061";
  var C_WA = "https://wa.me/" + PHONE + "?text=";
  var C_SMS = "sms:+" + PHONE + "?&body=";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var es = false;
  try{ es = localStorage.getItem("bgbd-lang") === "es"; }catch(e){}

  // ---------- Language (remembered across pages) ----------
  var langListeners = [];
  function setLang(isEs){
    es = isEs;
    document.querySelectorAll("[data-es]").forEach(function(el){
      if(el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = es ? el.dataset.es : el.dataset.en;
    });
    root.lang = es ? "es" : "en";
    document.querySelectorAll("[data-lang]").forEach(function(b){
      b.textContent = es ? "EN" : "ES";
      b.setAttribute("aria-label", es ? "Switch to English / Cambiar a inglés" : "Cambiar a español / Switch to Spanish");
    });
    try{ localStorage.setItem("bgbd-lang", es ? "es" : "en"); }catch(e){}
    langListeners.forEach(function(f){ f(); });
  }
  document.querySelectorAll("[data-lang]").forEach(function(b){ b.addEventListener("click", function(){ setLang(!es); }); });

  // ---------- Header: burger + scrolled state ----------
  var burger = document.querySelector("[data-burger]"), nav = document.getElementById("nav");
  function closeNav(){ if(!burger) return; burger.setAttribute("aria-expanded","false"); document.body.classList.remove("nav-open"); }
  if(burger){
    burger.addEventListener("click", function(){
      var open = burger.getAttribute("aria-expanded") !== "true";
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
      if(open){ var a = nav.querySelector("a"); if(a) a.focus(); }
    });
    nav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && document.body.classList.contains("nav-open")){ closeNav(); burger.focus(); } });
    window.addEventListener("resize", function(){ if(innerWidth > 900) closeNav(); });
  }
  var hdr = document.querySelector(".hdr");
  function onScroll(){ if(hdr) hdr.classList.toggle("scrolled", scrollY > 10); }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  // ---------- Design switcher ----------
  var sw = document.querySelector("[data-switcher]");
  if(sw){
    var tg = sw.querySelector(".sw-toggle"), panel = document.getElementById("swPanel");
    function swSet(open){ panel.hidden = !open; tg.setAttribute("aria-expanded", open ? "true" : "false"); sw.classList.toggle("open", open); }
    tg.addEventListener("click", function(){ swSet(panel.hidden); });
    document.addEventListener("click", function(e){ if(!panel.hidden && !sw.contains(e.target)) swSet(false); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !panel.hidden){ swSet(false); tg.focus(); } });
  }

  // ---------- Reveal on scroll ----------
  if("IntersectionObserver" in window && !reduce){
    var io = new IntersectionObserver(function(en){ en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }); }, {rootMargin:"0px 0px -6% 0px"});
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  } else document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); });

  // ---------- Toast ----------
  function toast(msg){
    var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role","status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2200);
  }

  // ---------- Zelle ----------
  document.querySelectorAll("[data-copy]").forEach(function(b){
    b.addEventListener("click", function(){
      var v = b.dataset.copy;
      function ok(){ toast(es ? "Email copiado" : "Email copied"); }
      function fb(){ var i = document.createElement("textarea"); i.value = v; document.body.appendChild(i); i.select(); try{ document.execCommand("copy"); ok(); }catch(e){} i.remove(); }
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(ok, fb); else fb();
    });
  });
  var zf = document.getElementById("zfull"), zLast = null;
  if(zf){
    var zClose = function(){ zf.hidden = true; document.body.style.overflow = ""; if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function(){}); if(zLast) zLast.focus(); };
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
  }

  // ---------- Focus trap helper ----------
  function trap(box, e){
    var f = [].slice.call(box.querySelectorAll("button:not([disabled]),a:not([aria-disabled]),input,select,textarea,iframe")).filter(function(x){ return x.offsetParent; });
    if(!f.length) return;
    if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
    else if(!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
  }

  // ---------- Request calendar (goes to Daly) ----------
  var bk = document.getElementById("bk"), lastBtn = null;
  var T = {
    en:{kicker:"Book with Daly", title:"Request an appointment", vag:"Want it instantly? Book on Vagaro",
      s1:"1. Pick the day", s2:"2. Pick the time", s3:"3. Your treatment", fName:"Your name", fVisit:"Visit",
      sms:"Text", close:"Close", prev:"Previous month", next:"Next month",
      fine:"Your request goes to Daly. She confirms every appointment personally.",
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      types:["Facial","Body sculpting","Massage","Wood therapy","Sauna blanket / Detox","Consultation","Not sure yet"],
      visits:["First visit","Returning client","Package session"], pick:"Pick a day and a time to send your request.", at:"at", none:"To be confirmed"},
    es:{kicker:"Reserva con Daly", title:"Solicita una cita", vag:"¿La quieres al instante? Reserva en Vagaro",
      s1:"1. Elige el día", s2:"2. Elige la hora", s3:"3. Tu tratamiento", fName:"Tu nombre", fVisit:"Visita",
      sms:"Texto", close:"Cerrar", prev:"Mes anterior", next:"Mes siguiente",
      fine:"Tu solicitud le llega a Daly. Ella confirma cada cita personalmente.",
      months:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
      dow:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], days:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
      types:["Facial","Moldeo corporal","Masaje","Maderoterapia","Manta sauna / Detox","Consulta","Aún no sé"],
      visits:["Primera visita","Clienta frecuente","Sesión de paquete"], pick:"Elige un día y una hora para enviar tu solicitud.", at:"a las", none:"Por confirmar"}
  };
  var HOURS = [9,10,11,12,13,14,15,16,17,18];
  function ampm(h){ return (h % 12 || 12) + ":00 " + (h < 12 ? "AM" : "PM"); }
  var today = new Date(); today.setHours(0,0,0,0);
  var minDay = new Date(today); minDay.setDate(minDay.getDate()+1);
  var view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  var maxView = new Date(today.getFullYear()+1, today.getMonth(), 1);
  var sel = {date:null, hour:null, type:null};
  function L(){ return T[es ? "es" : "en"]; }
  function $(id){ return document.getElementById(id); }

  function drawCal(){
    var t = L(), g = $("calGrid");
    $("calMonth").textContent = t.months[view.getMonth()] + " " + view.getFullYear();
    $("calDow").innerHTML = t.dow.map(function(d){ return "<span>"+d+"</span>"; }).join("");
    g.innerHTML = "";
    for(var i=0;i<view.getDay();i++) g.appendChild(document.createElement("span"));
    var dim = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
    for(var d=1; d<=dim; d++){
      var dt = new Date(view.getFullYear(), view.getMonth(), d), b = document.createElement("button");
      b.type = "button"; b.className = "day"; b.textContent = d;
      b.setAttribute("aria-label", t.days[dt.getDay()] + " " + d + " " + t.months[dt.getMonth()]);
      if(dt < minDay) b.disabled = true;
      if(+dt === +today) b.classList.add("today");
      b.setAttribute("aria-pressed", sel.date && +sel.date === +dt ? "true" : "false");
      (function(dt){ b.addEventListener("click", function(){ sel.date = dt; drawCal(); update(); }); })(dt);
      g.appendChild(b);
    }
    $("calPrev").disabled = view <= new Date(minDay.getFullYear(), minDay.getMonth(), 1);
    $("calNext").disabled = view >= maxView;
  }
  function drawChips(){
    var t = L(), slots = $("slots"), types = $("evType"), vis = $("bkVisit");
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
  function longDate(d){
    var t = L();
    return es ? t.days[d.getDay()] + ", " + d.getDate() + " de " + t.months[d.getMonth()] + " de " + d.getFullYear()
              : t.days[d.getDay()] + ", " + t.months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }
  function update(){
    var t = L(), ok = sel.date && sel.hour !== null, sum = $("bkSum"), wa = $("bkWa"), sms = $("bkSms");
    if(!ok){
      sum.textContent = t.pick;
      wa.setAttribute("aria-disabled","true"); sms.setAttribute("aria-disabled","true");
      wa.href = "https://wa.me/" + PHONE; sms.href = "sms:+" + PHONE; return;
    }
    sum.innerHTML = "<b>" + longDate(sel.date) + "</b> " + t.at + " <b>" + ampm(sel.hour) + "</b>";
    var name = $("bkName").value.trim(), vEl = $("bkVisit"), visit = vEl.selectedIndex > 0 ? vEl.value : "";
    var type = sel.type === null ? "" : t.types[sel.type];
    var msg = es
      ? "Hola Daly" + (name ? ", soy " + name : "") + ". Quisiera solicitar una cita en Body Glam by Daly.\nFecha: " + longDate(sel.date) + "\nHora: " + ampm(sel.hour) + "\nTratamiento: " + (type || t.none) + "\nVisita: " + (visit || t.none)
      : "Hi Daly" + (name ? ", this is " + name : "") + ". I'd like to request an appointment at Body Glam by Daly.\nDate: " + longDate(sel.date) + "\nTime: " + ampm(sel.hour) + "\nTreatment: " + (type || t.none) + "\nVisit: " + (visit || t.none);
    wa.href = C_WA + encodeURIComponent(msg); sms.href = C_SMS + encodeURIComponent(msg);
    wa.removeAttribute("aria-disabled"); sms.removeAttribute("aria-disabled");
  }
  function openBk(btn){
    lastBtn = btn;
    sel = {date:null, hour:null, type:null};
    $("bkName").value = ""; $("bkVisit").selectedIndex = 0;
    view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
    var t = L();
    bk.querySelectorAll("[data-i18n]").forEach(function(el){ el.textContent = t[el.dataset.i18n]; });
    bk.querySelector(".bk-x").setAttribute("aria-label", t.close);
    $("calPrev").setAttribute("aria-label", t.prev); $("calNext").setAttribute("aria-label", t.next);
    drawCal(); drawChips(); update();
    bk.hidden = false; document.body.classList.add("bk-open");
    bk.querySelector(".bk-sheet").scrollTop = 0; bk.querySelector(".bk-x").focus();
  }
  function closeBk(){ bk.hidden = true; document.body.classList.remove("bk-open"); if(lastBtn) lastBtn.focus(); }
  if(bk){
    $("calPrev").addEventListener("click", function(){ view.setMonth(view.getMonth()-1); drawCal(); });
    $("calNext").addEventListener("click", function(){ view.setMonth(view.getMonth()+1); drawCal(); });
    $("bkName").addEventListener("input", update);
    $("bkVisit").addEventListener("change", update);
    bk.querySelector("[data-bk-close]").addEventListener("click", closeBk);
    bk.addEventListener("click", function(e){ if(e.target === bk) closeBk(); });
    [$("bkWa"), $("bkSms")].forEach(function(a){ a.addEventListener("click", function(e){ if(a.getAttribute("aria-disabled") === "true") e.preventDefault(); }); });
    document.addEventListener("keydown", function(e){ if(bk.hidden) return; if(e.key === "Escape") closeBk(); if(e.key === "Tab") trap(bk, e); });
  }

  // ---------- Vagaro sheet ----------
  // Paste the script src from Daly's Vagaro booking widget (Vagaro: Settings > Booking Widget)
  // into VAGARO_WIDGET_SRC to show her live calendar right on the site.
  var VAGARO_WIDGET_SRC = "";
  var vg = document.getElementById("vg"), vgLast = null, vgLoaded = false;
  var VT = {
    en:{kicker:"Book with Daly", title:"Pick your treatment and time", sub:"See Daly's open times and book instantly on Vagaro. You'll get a confirmation right away.",
      open:"Open Daly's Vagaro booking", st1:"Choose a facial, body sculpting or massage service", st2:"Pick a day and an open time",
      st3:"Confirm, and Vagaro sends your reminder", req:"Can't find a time? Send Daly a request", close:"Close"},
    es:{kicker:"Reserva con Daly", title:"Elige tu tratamiento y tu hora", sub:"Mira las horas disponibles de Daly y reserva al instante en Vagaro. Recibirás tu confirmación enseguida.",
      open:"Abrir las reservas de Daly en Vagaro", st1:"Elige un facial, moldeo corporal o masaje", st2:"Elige un día y una hora disponible",
      st3:"Confirma, y Vagaro te envía tu recordatorio", req:"¿No encuentras hora? Envíale una solicitud a Daly", close:"Cerrar"}
  };
  function openVg(btn){
    vgLast = btn; var t = VT[es ? "es" : "en"];
    vg.querySelectorAll("[data-vi18n]").forEach(function(el){ el.textContent = t[el.dataset.vi18n]; });
    vg.querySelector(".bk-x").setAttribute("aria-label", t.close);
    if(VAGARO_WIDGET_SRC && !vgLoaded){
      vgLoaded = true; var sc = document.createElement("script");
      sc.src = VAGARO_WIDGET_SRC; sc.async = true; $("vgWidget").appendChild(sc); vg.classList.add("has-widget");
    }
    vg.hidden = false; document.body.classList.add("bk-open");
    vg.querySelector(".bk-sheet").scrollTop = 0; vg.querySelector(".bk-x").focus();
  }
  function closeVg(keep){ vg.hidden = true; if(!keep){ document.body.classList.remove("bk-open"); if(vgLast) vgLast.focus(); } }
  if(vg){
    vg.querySelector("[data-vg-close]").addEventListener("click", function(){ closeVg(); });
    vg.addEventListener("click", function(e){ if(e.target === vg) closeVg(); });
    document.addEventListener("keydown", function(e){ if(vg.hidden) return; if(e.key === "Escape") closeVg(); if(e.key === "Tab") trap(vg, e); });
  }
  document.querySelectorAll("[data-book]").forEach(function(b){ b.addEventListener("click", function(){ openVg(b); }); });
  document.querySelectorAll("[data-request]").forEach(function(b){
    b.addEventListener("click", function(){ if(b.closest("#vg")){ var src = vgLast; closeVg(true); openBk(src); } else openBk(b); });
  });

  // ---------- Contact form -> WhatsApp / text to Daly ----------
  document.querySelectorAll("[data-rform]").forEach(function(f){
    var wa = f.querySelector("[data-rf-wa]"), sms = f.querySelector("[data-rf-sms]"), hint = f.querySelector(".rf-hint");
    function val(n){ var el = f.elements[n]; return el ? el.value.trim() : ""; }
    function upd(){
      var name = val("name");
      if(!name){
        wa.setAttribute("aria-disabled","true"); sms.setAttribute("aria-disabled","true");
        wa.href = "https://wa.me/" + PHONE; sms.href = "sms:+" + PHONE; hint.hidden = false; return;
      }
      hint.hidden = true;
      var none = es ? "Por confirmar" : "To be confirmed", d = val("date"), day = none;
      if(d){ var p = d.split("-"); day = longDate(new Date(+p[0], +p[1]-1, +p[2])); }
      var svc = f.elements.service, svcTxt = svc ? svc.options[svc.selectedIndex].text : "";
      var tm = f.elements.time, tmTxt = tm && tm.value ? tm.value : (es ? "Cualquier hora" : "Any time");
      var phone = val("phone"), note = val("msg");
      var msg = es
        ? "Hola Daly, soy " + name + ". Te escribo desde tu página web.\nTratamiento: " + svcTxt + "\nDía preferido: " + day + "\nHora preferida: " + tmTxt + (phone ? "\nMi teléfono: " + phone : "") + (note ? "\nNota: " + note : "")
        : "Hi Daly, this is " + name + ". I'm reaching out from your website.\nTreatment: " + svcTxt + "\nPreferred day: " + day + "\nPreferred time: " + tmTxt + (phone ? "\nMy phone: " + phone : "") + (note ? "\nNote: " + note : "");
      wa.href = C_WA + encodeURIComponent(msg); sms.href = C_SMS + encodeURIComponent(msg);
      wa.removeAttribute("aria-disabled"); sms.removeAttribute("aria-disabled");
    }
    f.addEventListener("input", upd); f.addEventListener("change", upd);
    [wa, sms].forEach(function(a){ a.addEventListener("click", function(e){ if(a.getAttribute("aria-disabled") === "true"){ e.preventDefault(); f.elements.name.focus(); } }); });
    langListeners.push(upd); upd();
  });

  // ---------- Booking bar (Eucalyptus home) ----------
  // The bar's button already carries data-book, so it opens the Vagaro sheet.

  // ---------- Treatment finder (Citrus home) ----------
  document.querySelectorAll("[data-goals]").forEach(function(box){
    var map = {}; box.dataset.goals.split(";").forEach(function(x){ var k = x.split(":"); map[k[0]] = k[1].split("|"); });
    var out = document.querySelector(".f-out"), list = out.querySelector(".f-list"), empty = out.querySelector(".f-empty"), cta = out.querySelector(".f-cta"), cur = null;
    function draw(){
      if(!cur) return;
      list.innerHTML = map[cur].map(function(n){ var p = n.split("~"); return "<li>" + (es ? p[1] : p[0]) + "</li>"; }).join("");
      empty.hidden = true; cta.hidden = false;
    }
    box.querySelectorAll(".goal").forEach(function(g){ g.addEventListener("click", function(){
      box.querySelectorAll(".goal").forEach(function(o){ o.setAttribute("aria-pressed", o === g ? "true" : "false"); });
      cur = g.dataset.goal; draw();
    }); });
    langListeners.push(draw);
  });

  // ---------- Count-up (Citrus stat and any [data-count]) ----------
  document.querySelectorAll("[data-count]").forEach(function(el){ el.textContent = el.dataset.count; });

  if(es) setLang(true);
})();
