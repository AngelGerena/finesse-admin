const finessePalettes = [
  {id:'champagne',name:'Ivory & Champagne',mood:'Warm, intimate, timeless.',bg:'#f5f1e9',paper:'#fffcf6',surface:'#e8dfd1',ink:'#292720',muted:'#6b655b',accent:'#846333',deep:'#40372c',soft:'#ddc5a0'},
  {id:'midnight',name:'Pearl & Slate',mood:'Clean, architectural, modern.',bg:'#f1f4f5',paper:'#fcfdfd',surface:'#dce4e8',ink:'#26333c',muted:'#5b6b77',accent:'#426580',deep:'#263c4c',soft:'#bdcfdc'},
  {id:'merlot',name:'Blush & Merlot',mood:'Romantic, expressive, personal.',bg:'#f7efed',paper:'#fffbf8',surface:'#ecdbd7',ink:'#3e292f',muted:'#7b6269',accent:'#8a475a',deep:'#59313e',soft:'#ecc2bd'},
  {id:'forest',name:'Linen & Olive',mood:'Natural, considered, distinctive.',bg:'#f2f1e7',paper:'#fcfcf5',surface:'#dfe3d3',ink:'#2f362c',muted:'#656d5e',accent:'#626c41',deep:'#3a4838',soft:'#d4d8ae'},
  {id:'amethyst',name:'Pearl & Amethyst',mood:'Artful, soft, contemporary.',bg:'#f3eff6',paper:'#fefbff',surface:'#e4ddeb',ink:'#37303e',muted:'#71667e',accent:'#786086',deep:'#4c3d59',soft:'#d9c3e4'},
  {id:'porcelain',name:'Porcelain & Bronze',mood:'Airy, editorial, understated.',bg:'#f6f3ee',paper:'#fffdfa',surface:'#e7dfd5',ink:'#302b25',muted:'#71675b',accent:'#89613d',deep:'#5b4838',soft:'#e1c4a5'}
];

function paletteStudyMarkup(p,i){
  return `<span class="study-hero"><img src="assets/camera-poster.webp" alt=""><span class="study-brand">FINESSE <small>MEDIA LLC</small></span><span class="study-hero-title">A different kind<br>of <em>unforgettable.</em></span><span class="study-hero-note">YOUR HERO · UNCHANGED</span></span><span class="study-intro"><span class="study-kicker">THIS IS FINESSE</span><span class="study-title">Room for<br><em>your story.</em></span><span class="study-rule"></span></span><span class="study-services"><span class="study-kicker">CREATIVE POSSIBILITIES</span><span>Photography <i>01</i></span><span>Branding & digital <i>02</i></span></span><span class="study-contact">Let’s create something <em>meaningful.</em><b>↗︎</b></span><span class="palette-card-info"><span class="palette-number">0${i+1}</span><span><strong>${p.name}</strong><small>${p.mood}</small></span></span><span class="palette-strip" aria-hidden="true"><i style="background:#090a0b"></i><i style="background:${p.bg}"></i><i style="background:${p.surface}"></i><i style="background:${p.deep}"></i><i style="background:${p.accent}"></i></span><span class="palette-preview-action">Preview this direction ↗︎</span>`;
}

function stylePaletteStudy(el,p){
  for(const key of ['bg','paper','surface','ink','muted','accent','deep','soft'])el.style.setProperty('--choice-'+key,p[key]);
}
