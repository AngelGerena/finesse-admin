/* Gio Lopez vCard — Canon 5D Mark III edition
   Edit the GIO object below; every look reads from it. */
const GIO = {
  name: "Gio Lopez",
  first: "Gio",
  last: "Lopez",
  role: "Photographer",
  brand: "GioLopez Media Co.",
  about: "Portraits, headshots and events with clean light and real presence. Shot on full frame, edited by hand.",
  location: "", // add Gio's city once he confirms it; it shows up automatically
  // PLACEHOLDERS — replace with Gio's real details before going live
  phone: "+1 (347) 446-3290",
  phoneRaw: "+13474463290",
  email: "giolopezmedia@gmail.com",
  instagram: "giolopezmedia",
  services: ["Portraits", "Headshots", "Events", "Brand Sessions", "Couples"],
  photo: "images/gio.jpg",
  cutout: "images/gio-cutout.webp",
  exposure: { shutter: "1/200", aperture: "2.8", iso: "100", focal: "85mm" }
};

const FINESSE_WA = "14079609004";
const LOOKS = [
  { id: "top", label: "Top Plate" },
  { id: "vf", label: "Viewfinder" },
  { id: "studio", label: "Studio" },
  { id: "play", label: "Playback" }
];
const T = "︎"; // text presentation marker for symbols

/* ---------- icons ---------- */
const ICON = {
  call: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  text: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  ig: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
  web: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  book: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/></svg>',
  save: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/></svg>'
};

const LINKS = {
  call: () => `tel:${GIO.phoneRaw}`,
  mail: () => `mailto:${GIO.email}`,
  ig: () => `https://www.instagram.com/${GIO.instagram}/`,
  book: () => "#book"
};
const ext = (k) => (k === "ig" || k === "book") ? ' target="_blank" rel="noopener"' : "";

const ACTIONS = [
  ["call", "Call"], ["mail", "Email"],
  ["ig", "Instagram"], ["book", "Book"]
];

/* ---------- shared blocks ---------- */
function actionsGrid() {
  return `<nav class="actions" aria-label="Contact ${GIO.first}">${ACTIONS.map(([k, l]) =>
    k === "book"
      ? `<button class="act act-book" type="button" data-book>${ICON[k]}<span>${l}</span></button>`
      : `<a class="act" data-snd href="${LINKS[k]()}"${ext(k)}>${ICON[k]}<span>${l}</span></a>`).join("")}</nav>`;
}
function shutter(sub) {
  return `<div class="shutter-row"><button class="shutter" type="button" data-save aria-label="Save ${GIO.name} to contacts"></button>
    <div class="shutter-copy"><b>Save Contact</b><span>${sub}</span></div></div>`;
}
function gear() {
  return `<section class="panel"><div class="gear-head"><div><div class="eyebrow">Shot on</div><div class="model">Canon EOS 5D Mark III</div></div><div class="tag">Full Frame</div></div>
    <div class="specs">
      <div class="spec"><b>22.3MP</b><span>Full-frame CMOS</span></div>
      <div class="spec"><b>61-pt</b><span>High-density AF</span></div>
      <div class="spec"><b>ISO 100</b><span>to 25,600 native</span></div>
      <div class="spec"><b>6 fps</b><span>Continuous</span></div>
      <div class="spec"><b>DIGIC 5+</b><span>Image processor</span></div>
      <div class="spec"><b>RAW</b><span>Every frame</span></div>
    </div></section>`;
}
function services() {
  return `<section class="panel"><h2>What I shoot</h2><p class="about">${GIO.about}</p>
    <div class="chips" style="margin-top:12px">${GIO.services.map(s => `<span class="chip">${s}</span>`).join("")}</div></section>`;
}
function qrPanel() {
  return `<section class="panel qr-panel" aria-label="QR code for this card">
    <button type="button" class="qr-tile" data-qr-full aria-label="Show the QR code full screen">${qrSvg(cardUrl())}</button>
    <div class="qr-copy"><h2>Scan to save my card</h2><p>Point any phone camera here to open my card and save my contact.</p>
      <div class="qr-btns"><button type="button" class="qr-btn" data-qr-full>Full screen</button><button type="button" class="qr-btn" data-share>Share link</button></div></div>
  </section>`;
}
function tail() {
  const msg = `Hi Angel, I really like the vCard you made for ${GIO.name}. I'd love one for my business too.`;
  return `${qrPanel()}<a class="own" data-snd data-send="${esc(msg)}" href="https://wa.me/${FINESSE_WA}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Get your own vCard <span aria-hidden="true">↗${T}</span></a>
    <p class="foot">Crafted by <a href="https://finessemedia.pro" target="_blank" rel="noopener">Finesse Media</a></p>`;
}
const E = GIO.exposure;

/* ---------- LOOK 1: TOP PLATE ---------- */
function lookTop() {
  const blades = Array.from({ length: 8 }, (_, i) => `<i class="blade" style="transform:rotate(${i * 45}deg)"></i>`).join("");
  const ring = "GIOLOPEZ MEDIA CO. · ULTRASONIC · 1:2.8 · Ø77mm · ";
  return `
  <div class="tp-body">
    <div class="tp-top"><img src="images/mark-white.png" alt="GioLopez Media Co. mark"><span class="tp-model">EOS 5D Mark III</span>
      <button class="dial" type="button" data-dial aria-label="Turn mode dial"><span>M</span></button></div>
    <div class="lens">
      <div class="lens-outer"></div>
      <svg class="lens-text" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="lensPath" d="M50,50 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs><text><textPath href="#lensPath">${ring}</textPath></text></svg>
      <div class="lens-red"></div><div class="lens-inner"></div>
      <div class="glass"><div class="iris" id="iris">${blades}</div></div>
      <div class="lens-shadow"></div>
      <div class="pop"><div class="pop-in"><img src="${GIO.cutout}" alt="Portrait of ${GIO.name}"></div></div>
    </div>
    <div class="lcd" aria-label="Exposure: ${E.shutter} second, f/${E.aperture}, ISO ${E.iso}">
      <div class="lcd-big"><span>${E.shutter}</span><span>F${E.aperture}</span><span>${E.iso}</span></div>
      <div class="lcd-bar">${Array.from({ length: 13 }, (_, i) => `<i class="${i === 6 ? "on" : ""}"></i>`).join("")}</div>
      <div class="lcd-row"><span>M</span><span>AWB</span><span>ONE SHOT</span><span>RAW</span><span>[9999]</span></div>
    </div>
  </div>
  <header><div class="eyebrow">${GIO.location || "Shot on Canon EOS 5D Mark III"}</div><h1 class="name">${GIO.name}</h1><p class="role"><strong>${GIO.role}</strong> · ${GIO.brand}</p></header>
  ${shutter("Tap the shutter to add me to your phone")}
  ${actionsGrid()}${services()}${gear()}${tail()}`;
}

/* ---------- LOOK 2: VIEWFINDER ---------- */
function lookVf() {
  const rows = [5, 9, 11, 11, 11, 9, 5];
  const lit = { "1": [3, 4, 5], "2": [4, 5, 6] };
  const af = rows.map((n, r) => `<div class="af-row">${Array.from({ length: n }, (_, c) =>
    `<i class="af-pt${(lit[r] || []).includes(c) ? " lit" : ""}"></i>`).join("")}</div>`).join("");
  return `
  <div class="vf">
    <img class="vf-img" src="${GIO.photo}" alt="Portrait of ${GIO.name}">
    <div class="vf-shade"></div><div class="vf-frame"></div>
    <div class="af" aria-hidden="true">${af}</div>
    <div class="vf-data" aria-label="Viewfinder readout"><span>M</span><span>${E.shutter}</span><span>F${E.aperture}</span><span class="vf-scale">-2..1..<b>0</b>..1..+2</span><span>ISO${E.iso}</span><span class="dot"></span></div>
  </div>
  <div class="vf-id"><header><div class="eyebrow">In focus${GIO.location ? " · " + GIO.location : ""}</div><h1 class="name">${GIO.name}</h1><p class="role"><strong>${GIO.role}</strong> · ${GIO.brand}</p></header><img src="images/mark-white.png" alt=""></div>
  ${shutter("Half-press to focus. Full press to save.")}
  ${actionsGrid()}${services()}${gear()}${tail()}`;
}

/* ---------- LOOK 3: STUDIO ---------- */
function lookStudio() {
  return `
  <div class="st-hero">
    <img class="photo" src="${GIO.photo}" alt="Portrait of ${GIO.name}">
    <img class="st-logo" src="images/logo-black.png" alt="GioLopez Media Co. logo">
    <div class="st-ring">5D Mark III</div>
    <div class="st-name"><h1 class="name">Gio<br>Lopez</h1><p class="role"><strong>${GIO.role}</strong> · ${GIO.location || GIO.brand}</p></div>
  </div>
  ${shutter(`${E.focal} · f/${E.aperture} · ${E.shutter} · ISO ${E.iso}`)}
  ${actionsGrid()}${services()}${gear()}${tail()}`;
}

/* ---------- LOOK 4: PLAYBACK ---------- */
function lookPlay() {
  const q = (k, small, big) => k === "book"
    ? `<button class="q" type="button" data-book><small>${small}</small><b>${ICON[k]}${big}</b></button>`
    : `<a class="q${k === "call" ? " sel" : ""}" data-snd href="${LINKS[k]()}"${ext(k)}><small>${small}</small><b>${ICON[k]}${big}</b></a>`;
  return `
  <div class="pb">
    <div class="pb-screen">
      <img src="${GIO.photo}" alt="Portrait of ${GIO.name}" id="pbImg">
      <div class="pb-top"><span>100-0001</span><span class="stars">★${T}★${T}★${T}★${T}★${T}</span></div>
      <canvas class="pb-hist" id="hist" width="192" height="112" aria-label="RGB histogram of the portrait"></canvas>
      <div class="pb-bottom"><div class="row"><span>${E.shutter}</span><span>F${E.aperture}</span><span>ISO ${E.iso}</span><span>${E.focal}</span></div>
        <div class="row file"><span>GIO_0001.CR2</span><span>22M  5760x3840</span></div></div>
    </div>
    <div class="pb-id"><img src="images/mark-white.png" alt=""><header><h1 class="name">${GIO.name}</h1><p class="role"><strong>${GIO.role}</strong> · ${GIO.brand}</p></header></div>
    <div class="qscreen" role="navigation" aria-label="Contact ${GIO.first}">
      <button class="q wide" type="button" data-save><span><small>Q · Save</small><b>${ICON.save}Save Contact</b></span><b aria-hidden="true">▶${T}</b></button>
      ${q("call", "Drive", "Call")}${q("mail", "Mail", "Email")}
      ${q("ig", "Social", "Instagram")}${q("book", "Session", "Book")}
    </div>
    <div class="pb-keys" aria-hidden="true"><span>MENU</span><span>INFO</span><span>Q</span><span>PLAY</span><span>ZOOM</span></div>
  </div>
  ${services()}${gear()}${tail()}`;
}

const RENDER = { top: lookTop, vf: lookVf, studio: lookStudio, play: lookPlay };

/* ---------- sound: shutter click (synthesized, no files) ---------- */
let actx;
function click(heavy) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const burst = (t0, dur, freq, gain) => {
      const len = Math.floor(actx.sampleRate * dur);
      const buf = actx.createBuffer(1, len, actx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = actx.createBufferSource(); src.buffer = buf;
      const f = actx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 0.9;
      const g = actx.createGain(); g.gain.value = gain;
      src.connect(f).connect(g).connect(actx.destination); src.start(actx.currentTime + t0);
    };
    if (heavy) { burst(0, 0.05, 2400, 1.1); burst(0.085, 0.06, 1500, 0.9); }
    else burst(0, 0.035, 3200, 0.55);
  } catch (e) { /* audio unavailable */ }
}

/* ---------- vCard file ---------- */
async function saveContact() {
  click(true);
  const fl = document.getElementById("flash"); fl.classList.remove("go"); void fl.offsetWidth; fl.classList.add("go");
  const iris = document.getElementById("iris");
  if (iris) { iris.classList.remove("reopen"); void iris.offsetWidth; iris.classList.add("reopen"); }
  let photo = "";
  try {
    const blob = await (await fetch(GIO.photo)).blob();
    const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(",")[1]); fr.readAsDataURL(blob); });
    photo = `PHOTO;ENCODING=b;TYPE=JPEG:${b64}\r\n`;
  } catch (e) { }
  const v = `BEGIN:VCARD\r\nVERSION:3.0\r\nN:${GIO.last};${GIO.first};;;\r\nFN:${GIO.name}\r\nORG:${GIO.brand}\r\nTITLE:${GIO.role}\r\nTEL;TYPE=CELL:${GIO.phoneRaw}\r\nEMAIL;TYPE=INTERNET:${GIO.email}\r\nX-SOCIALPROFILE;TYPE=instagram:https://www.instagram.com/${GIO.instagram}/\r\nNOTE:${GIO.role} · Shot on Canon EOS 5D Mark III\r\n${photo}END:VCARD\r\n`;
  const url = URL.createObjectURL(new Blob([v], { type: "text/vcard" }));
  const a = document.createElement("a"); a.href = url; a.download = "Gio-Lopez.vcf";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast("Contact captured. Check your downloads.");
}

function toast(msg) {
  const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- histogram (playback look) ---------- */
function drawHistogram() {
  const img = document.getElementById("pbImg"), cv = document.getElementById("hist");
  if (!img || !cv) return;
  const go = () => {
    try {
      const w = 160, h = Math.round(160 * img.naturalHeight / img.naturalWidth);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data;
      const bins = [new Array(64).fill(0), new Array(64).fill(0), new Array(64).fill(0)];
      for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) bins[k][d[i + k] >> 2]++;
      const max = Math.max(...bins.flat().slice(1, -1));
      const g = cv.getContext("2d"); g.clearRect(0, 0, cv.width, cv.height);
      g.globalCompositeOperation = "lighter";
      ["#ff4040", "#40ff60", "#4080ff"].forEach((col, k) => {
        g.fillStyle = col; g.globalAlpha = .55; g.beginPath(); g.moveTo(0, cv.height);
        bins[k].forEach((v, i) => g.lineTo(i * (cv.width / 63), cv.height - Math.min(1, v / max) * (cv.height - 6)));
        g.lineTo(cv.width, cv.height); g.closePath(); g.fill();
      });
      g.globalCompositeOperation = "source-over"; g.globalAlpha = .35; g.strokeStyle = "#ffffff";
      for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * cv.width / 4, 0); g.lineTo(i * cv.width / 4, cv.height); g.stroke(); }
    } catch (e) { }
  };
  img.complete ? go() : img.addEventListener("load", go, { once: true });
}

/* ---------- picker + boot ---------- */
function setLook(id, sound) {
  if (!RENDER[id]) id = "top";
  document.body.className = "look-" + id;
  const card = document.getElementById("card");
  card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
  card.innerHTML = RENDER[id]();
  document.querySelectorAll(".picker-row button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.look === id)));
  const label = LOOKS.find(l => l.id === id).label;
  document.getElementById("lookName").textContent = label;
  const pick = document.getElementById("pickLook");
  const pickMsg = `Hi Angel, it's Gio. I love the vCard! I'm going with the ${label} look.`;
  if (pick) { pick.href = `https://wa.me/${FINESSE_WA}?text=${encodeURIComponent(pickMsg)}`; pick.dataset.send = pickMsg; }
  if (id === "play") drawHistogram();
  try { localStorage.setItem("gio-look", id); } catch (e) { }
  if (sound) click(true);
}

document.addEventListener("click", (e) => {
  const lb = e.target.closest("[data-look]"); if (lb) { setLook(lb.dataset.look, true); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  if (e.target.closest("[data-save]")) { e.preventDefault(); saveContact(); return; }
  const dial = e.target.closest("[data-dial]");
  if (dial) { const n = (+(dial.dataset.turn || 0) + 1); dial.dataset.turn = n; dial.style.transform = `rotate(${n * 45}deg)`; click(false); return; }
  const send = e.target.closest("[data-send]");
  if (send) { e.preventDefault(); click(false); openSend(send.dataset.send); return; }
  if (e.target.closest("[data-qr-full]")) { click(false); openQr(); return; }
  if (e.target.closest("[data-share]")) { click(false); shareCard(); return; }
  if (e.target.closest("[data-sheet-close]")) { closeSheets(); return; }
  if (e.target.closest("[data-sent]")) { setTimeout(closeSheets, 400); }
  if (e.target.closest("[data-snd]")) click(false);
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheets(); });

/* ---------- send to Angel: WhatsApp or a regular text, message pre-written ---------- */
function openSend(msg) {
  let el = document.getElementById("sendSheet");
  if (!el) {
    el = document.createElement("div"); el.id = "sendSheet"; el.className = "sheet"; el.hidden = true;
    el.innerHTML = `<div class="sheet-scrim" data-sheet-close></div>
      <div class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="sendTitle">
        <div class="sheet-head"><h2 id="sendTitle">Send to Angel</h2><button type="button" class="sheet-x" data-sheet-close aria-label="Close">✕${T}</button></div>
        <p class="sheet-msg" id="sendMsg"></p>
        <a class="sheet-opt wa" id="sendWa" data-sent target="_blank" rel="noopener"><b>WhatsApp</b><span>Opens a chat with the message ready</span></a>
        <a class="sheet-opt sms" id="sendSms" data-sent><b>Text message</b><span>No WhatsApp? Send it as a regular text</span></a>
        <p class="sheet-note">Tap send in the app that opens. (407) 960-9004</p>
      </div>`;
    document.body.appendChild(el);
  }
  document.getElementById("sendMsg").textContent = `"${msg}"`;
  document.getElementById("sendWa").href = `https://wa.me/${FINESSE_WA}?text=${encodeURIComponent(msg)}`;
  document.getElementById("sendSms").href = `sms:+${FINESSE_WA}?&body=${encodeURIComponent(msg)}`;
  showSheet(el);
}

/* ---------- QR code ---------- */
function cardUrl() { return location.origin + location.pathname; }
function qrSvg(text) {
  try {
    const qr = qrcode(0, "H"); qr.addData(text); qr.make();
    const n = qr.getModuleCount(), q = 2, s = n + q * 2;
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + q},${r + q}h1v1h-1z`;
    const lw = Math.round(n * 0.22), lx = (s - lw) / 2;
    return `<svg viewBox="0 0 ${s} ${s}" role="img" aria-label="QR code linking to ${esc(text)}" shape-rendering="crispEdges">
      <rect width="${s}" height="${s}" fill="#fff"/><path d="${d}" fill="#111"/>
      <rect x="${lx - .6}" y="${lx - .6}" width="${lw + 1.2}" height="${lw + 1.2}" rx="1.4" fill="#fff"/>
      <image href="images/mark-black.png" x="${lx + lw * .18}" y="${lx + lw * .06}" width="${lw * .64}" height="${lw * .88}" preserveAspectRatio="xMidYMid meet"/></svg>`;
  } catch (e) { return `<span class="qr-fail">${esc(text)}</span>`; }
}
function openQr() {
  let el = document.getElementById("qrSheet");
  if (!el) {
    el = document.createElement("div"); el.id = "qrSheet"; el.className = "sheet sheet-center"; el.hidden = true;
    el.innerHTML = `<div class="sheet-scrim" data-sheet-close></div>
      <div class="qr-full" role="dialog" aria-modal="true" aria-label="QR code for ${esc(GIO.name)}">
        <button type="button" class="sheet-x" data-sheet-close aria-label="Close">✕${T}</button>
        <div class="qr-big">${qrSvg(cardUrl())}</div>
        <b>${esc(GIO.name)}</b><span>${esc(GIO.role)} · ${esc(GIO.brand)}</span>
        <small>Point your camera here to open my card</small>
      </div>`;
    document.body.appendChild(el);
  }
  showSheet(el);
}
async function shareCard() {
  const data = { title: `${GIO.name} | ${GIO.role}`, text: `${GIO.name}, ${GIO.role}. Save my contact:`, url: cardUrl() };
  try { if (navigator.share) { await navigator.share(data); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(cardUrl()); toast("Link copied"); } catch (e) { toast(cardUrl()); }
}
function showSheet(el) {
  closeSheets(); el.hidden = false; requestAnimationFrame(() => el.classList.add("open"));
  document.documentElement.classList.add("bk-lock");
  const f = el.querySelector("a,button:not(.sheet-scrim)"); if (f) setTimeout(() => f.focus({ preventScroll: true }), 250);
}
function closeSheets() {
  document.querySelectorAll(".sheet.open").forEach(el => { el.classList.remove("open"); setTimeout(() => { el.hidden = true; }, 260); });
  if (!document.querySelector("#bk.open")) document.documentElement.classList.remove("bk-lock");
}


(function boot() {
  const row = document.getElementById("pickerRow");
  row.innerHTML = LOOKS.map(l => `<button type="button" data-look="${l.id}" aria-pressed="false">${l.label}</button>`).join("");
  let start = new URLSearchParams(location.search).get("look") || location.hash.replace("#", "");
  if (!RENDER[start]) { try { start = localStorage.getItem("gio-look"); } catch (e) { } }
  setLook(RENDER[start] ? start : "top", false);
})();

/* =========================================================
   BOOKING MODAL — shoot type, calendar, AM/PM time slots, message
   Sends the request to Gio by email (or text) prefilled.
   ========================================================= */
const SHOOT_TYPES = ["Portraits", "Headshots", "Events", "Brand Session", "Couples", "Something else"];
const TIME_SLOTS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];
const BK = { view: null, date: null, time: null, lastFocus: null };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function buildBooking() {
  if (document.getElementById("bk")) return;
  const el = document.createElement("div");
  el.id = "bk"; el.className = "bk"; el.hidden = true;
  el.innerHTML = `
  <div class="bk-scrim" data-bk-close></div>
  <div class="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="bkTitle">
    <div class="bk-grab" aria-hidden="true"></div>
    <header class="bk-head">
      <div><div class="eyebrow">Book a session</div><h2 id="bkTitle">Shoot with ${GIO.first}</h2></div>
      <button class="bk-x" type="button" data-bk-close aria-label="Close">✕${T}</button>
    </header>
    <form id="bkForm" novalidate>
      <div class="bk-step">
        <label class="bk-label" for="bkType">Type of shoot</label>
        <div class="bk-select"><select id="bkType" required>
          <option value="" disabled selected>Choose a shoot</option>
          ${SHOOT_TYPES.map(t => `<option>${t}</option>`).join("")}
        </select></div>
      </div>
      <div class="bk-step">
        <div class="bk-label" id="bkDateLbl">Pick a date</div>
        <div class="cal" aria-labelledby="bkDateLbl">
          <div class="cal-head">
            <button type="button" class="cal-nav" data-cal="-1" aria-label="Previous month">‹${T}</button>
            <div class="cal-title" id="calTitle"></div>
            <button type="button" class="cal-nav" data-cal="1" aria-label="Next month">›${T}</button>
          </div>
          <div class="cal-grid cal-dow" aria-hidden="true"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
          <div class="cal-grid" id="calDays"></div>
        </div>
      </div>
      <div class="bk-step">
        <div class="bk-label">Pick a time</div>
        <div class="slots" id="bkSlots" role="radiogroup" aria-label="Start time">
          ${TIME_SLOTS.map(t => `<button type="button" class="slot" role="radio" aria-checked="false" data-slot="${t}">${t}</button>`).join("")}
        </div>
      </div>
      <div class="bk-step bk-two">
        <div><label class="bk-label" for="bkName">Your name</label><input id="bkName" type="text" autocomplete="name" required placeholder="Full name"></div>
        <div><label class="bk-label" for="bkPhone">Phone</label><input id="bkPhone" type="tel" autocomplete="tel" placeholder="(000) 000-0000"></div>
      </div>
      <div class="bk-step">
        <label class="bk-label" for="bkEmail">Email</label><input id="bkEmail" type="email" autocomplete="email" placeholder="you@email.com">
      </div>
      <div class="bk-step">
        <label class="bk-label" for="bkMsg">Message for ${GIO.first}</label>
        <textarea id="bkMsg" rows="4" placeholder="Location, number of people, outfits, the vibe you're going for, anything ${GIO.first} should know."></textarea>
      </div>
      <p class="bk-err" id="bkErr" role="alert"></p>
      <div class="bk-summary" id="bkSummary" hidden></div>
      <button class="bk-send" type="submit">${ICON.mail}<span>Send request by email</span></button>
      <button class="bk-alt" type="button" data-bk-text>Or send it by text</button>
      <p class="bk-note">This opens your email or messages app with everything filled in. Tap send there and ${GIO.first} will confirm your date.</p>
    </form>
  </div>`;
  document.body.appendChild(el);
  const today = new Date(); BK.view = new Date(today.getFullYear(), today.getMonth(), 1);
  drawCal();
  el.querySelector("#bkForm").addEventListener("submit", (e) => { e.preventDefault(); sendBooking("mail"); });
}

function drawCal() {
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  const y = BK.view.getFullYear(), m = BK.view.getMonth();
  document.getElementById("calTitle").textContent = `${MONTHS[m]} ${y}`;
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  let html = "";
  for (let i = 0; i < first; i++) html += `<span></span>`;
  for (let d = 1; d <= days; d++) {
    const dt = new Date(y, m, d), past = dt < t0;
    const sel = BK.date && dt.getTime() === BK.date.getTime();
    const isToday = dt.getTime() === t0.getTime();
    html += `<button type="button" class="day${sel ? " sel" : ""}${isToday ? " today" : ""}" data-day="${d}" ${past ? "disabled" : ""} aria-pressed="${sel}" aria-label="${fmtDate(dt)}">${d}</button>`;
  }
  document.getElementById("calDays").innerHTML = html;
  const prev = document.querySelector('[data-cal="-1"]');
  prev.disabled = (y === t0.getFullYear() && m === t0.getMonth());
  clearBkErr();
}

function openBooking() {
  buildBooking();
  const el = document.getElementById("bk");
  BK.lastFocus = document.activeElement;
  el.hidden = false; requestAnimationFrame(() => el.classList.add("open"));
  document.documentElement.classList.add("bk-lock");
  click(false);
  setTimeout(() => document.getElementById("bkType").focus({ preventScroll: true }), 300);
}
function closeBooking() {
  const el = document.getElementById("bk"); if (!el) return;
  el.classList.remove("open"); document.documentElement.classList.remove("bk-lock");
  setTimeout(() => { el.hidden = true; }, 280);
  if (BK.lastFocus && BK.lastFocus.focus) BK.lastFocus.focus({ preventScroll: true });
}

function bookingText() {
  const v = (id) => document.getElementById(id).value.trim();
  const type = v("bkType"), name = v("bkName"), phone = v("bkPhone"), email = v("bkEmail"), msg = v("bkMsg");
  const missing = [];
  if (!type) missing.push("shoot type");
  if (!BK.date) missing.push("date");
  if (!BK.time) missing.push("time");
  if (!name) missing.push("your name");
  if (!phone && !email) missing.push("a phone or email so Gio can reach you");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push("a valid email");
  if (missing.length) return { err: "Please add " + missing.join(", ") + "." };
  const when = `${fmtDate(BK.date)} at ${BK.time}`;
  const body = `Hi ${GIO.first}, I'd like to book a session.\n\nShoot: ${type}\nDate: ${when}\nName: ${name}${phone ? `\nPhone: ${phone}` : ""}${email ? `\nEmail: ${email}` : ""}${msg ? `\n\nDetails:\n${msg}` : ""}\n\nSent from your vCard`;
  return { type, when, name, body };
}

function sendBooking(via) {
  const r = bookingText(), err = document.getElementById("bkErr");
  if (r.err) { err.textContent = r.err; err.classList.add("show"); click(false); return; }
  err.textContent = ""; err.classList.remove("show");
  click(true);
  const subj = encodeURIComponent(`Booking request: ${r.type}, ${r.when}`);
  const href = via === "mail"
    ? `mailto:${GIO.email}?subject=${subj}&body=${encodeURIComponent(r.body)}`
    : `sms:${GIO.phoneRaw}?&body=${encodeURIComponent(r.body)}`;
  const sum = document.getElementById("bkSummary");
  sum.hidden = false;
  sum.innerHTML = `<b>Request ready</b><span>${esc(r.type)} · ${esc(r.when)}</span><span>Your ${via === "mail" ? "email" : "messages"} app should open now. If it didn't, call or text ${GIO.first} at ${GIO.phone}.</span>`;
  window.location.href = href;
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-book]")) { e.preventDefault(); openBooking(); return; }
  if (e.target.closest("[data-bk-close]")) { closeBooking(); return; }
  if (e.target.closest("[data-bk-text]")) { sendBooking("sms"); return; }
  const nav = e.target.closest("[data-cal]");
  if (nav && !nav.disabled) { BK.view = new Date(BK.view.getFullYear(), BK.view.getMonth() + +nav.dataset.cal, 1); drawCal(); click(false); return; }
  const day = e.target.closest("[data-day]");
  if (day && !day.disabled) { BK.date = new Date(BK.view.getFullYear(), BK.view.getMonth(), +day.dataset.day); drawCal(); click(false); return; }
  const slot = e.target.closest("[data-slot]");
  if (slot) {
    BK.time = slot.dataset.slot;
    document.querySelectorAll(".slot").forEach(s => s.setAttribute("aria-checked", String(s === slot)));
    click(false);
  }
  if (slot) clearBkErr();
});
function clearBkErr() {
  const err = document.getElementById("bkErr");
  if (err && err.classList.contains("show")) { const r = bookingText(); if (!r.err) { err.textContent = ""; err.classList.remove("show"); } else err.textContent = r.err; }
}
document.addEventListener("input", (e) => { if (e.target.closest("#bkForm")) clearBkErr(); });
document.addEventListener("change", (e) => { if (e.target.closest("#bkForm")) clearBkErr(); });
document.addEventListener("keydown", (e) => {
  const el = document.getElementById("bk");
  if (!el || el.hidden) return;
  if (e.key === "Escape") closeBooking();
  if (e.key === "Tab") {
    const f = [...el.querySelectorAll("button:not([disabled]),select,input,textarea")].filter(n => n.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
