const q = (s) => document.querySelector(s);
const film = q('#lens-film');
const journey = q('.journey');
const heroCopy = q('.hero-copy');
const scene = q('.scene-copy');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionChoice=(()=>{try{return localStorage.getItem('finesse-motion')}catch(e){return null}})();
let reduced = motionChoice ? motionChoice==='reduce' : prefersReduced.matches;
let targetTime = 0;
let ticking = false;
let playbackVideo=null;
let playbackFrame=0;
let playbackRequest=0;
const filmSources=new WeakMap();
function showCameraStatus(message){q('.media-status').hidden=false;q('.media-status').textContent=message;}
function ensureFilmSource(video){
  if(filmSources.has(video))return filmSources.get(video);
  // The private host returns complete files for Range requests. A local Blob
  // gives the media decoder a fully seekable source for scroll scrubbing.
  const loading=(async()=>{
    if(video===film)showCameraStatus('Loading the camera animation…');
    const response=await fetch(video.dataset.src,{credentials:'same-origin',signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw new Error('Unable to load the animation');
    const blob=await response.blob();
    const url=URL.createObjectURL(new Blob([blob],{type:'video/mp4'}));
    try{
      await new Promise((resolve,reject)=>{
        const cleanup=()=>{clearTimeout(timeout);video.removeEventListener('loadeddata',ready);video.removeEventListener('error',failed);};
        const ready=()=>{cleanup();resolve();};
        const failed=()=>{cleanup();reject(new Error('Unable to decode the animation'));};
        const timeout=setTimeout(failed,30000);
        video.addEventListener('loadeddata',ready,{once:true});
        video.addEventListener('error',failed,{once:true});
        video.src=url;
        video.preload='auto';
        video.load();
      });
      video.dataset.objectUrl=url;
      if(video===film)q('.media-status').hidden=true;
    }catch(error){URL.revokeObjectURL(url);throw error;}
  })().catch(error=>{
    filmSources.delete(video);
    if(video===film)showCameraStatus('The camera animation could not load. Select “Play the camera journey” to retry.');
    throw error;
  });
  filmSources.set(video,loading);
  return loading;
}
const clamp = (n, min=0, max=1) => Math.min(max, Math.max(min,n));
function setMotion(value){reduced=value;document.body.classList.toggle('reduced-motion',value);q('.motion-toggle').setAttribute('aria-pressed',String(value));q('.motion-toggle').textContent=value?'Enable motion':'Reduce motion';const mn=q('.motion-notice');if(mn)mn.hidden=!value;if(!value)ensureFilmSource(film).catch(()=>{});update();}
function rememberMotion(){try{localStorage.setItem('finesse-motion',reduced?'reduce':'on')}catch(e){}}
q('.motion-toggle').addEventListener('click',()=>{setMotion(!reduced);rememberMotion();});
if(q('.motion-notice'))q('.motion-notice').addEventListener('click',()=>{setMotion(false);rememberMotion();});
prefersReduced.addEventListener('change',e=>{let c=null;try{c=localStorage.getItem('finesse-motion')}catch(err){}if(!c)setMotion(e.matches);});
function update(){
  ticking=false;
  q('.site-header').classList.toggle('scrolled',scrollY>45);
  updatePortal();
  if(reduced){heroCopy.inert=false;heroCopy.style.pointerEvents='';return;}
  const rect=journey.getBoundingClientRect();
  const progress=clamp(-rect.top/(journey.offsetHeight-q('.cinema').offsetHeight));
  heroCopy.style.opacity=1-clamp(progress/.14);
  heroCopy.style.transform=`translateY(${-clamp(progress/.14)*28}px)`;
  heroCopy.style.pointerEvents=progress>.14?'none':'';
  heroCopy.inert=progress>.14;
  scene.style.opacity=progress<.18?0:progress>.96?clamp((1-progress)/.04):clamp((progress-.18)/.06);
  const chapter=progress<.35?0:progress<.76?1:2;
  q('#scene-label').textContent=['01 / THE PERSPECTIVE','02 / THE DETAILS','03 / THE FEELING'][chapter];
  q('#scene-title').innerHTML=['A little closer.<br><em>A different perspective.</em>','Every detail.<br><em>With intention.</em>','Beyond the image.<br><em>Into the feeling.</em>'][chapter];
  document.querySelectorAll('.chapter-nav button').forEach((b,i)=>{b.classList.toggle('active',i===chapter);b.setAttribute('aria-pressed',String(i===chapter))});
  q('.film-progress span').style.width=`${progress*100}%`;
  if(Number.isFinite(film.duration)&&film.duration>0){targetTime=progress*(film.duration-.045);seek();}
}
function seek(){if(!reduced&&playbackVideo!==film&&!film.seeking&&film.readyState>=1&&!film.error&&Math.abs(film.currentTime-targetTime)>.035){try{film.currentTime=targetTime;}catch{}}}
film.addEventListener('seeked',seek);
film.addEventListener('loadedmetadata',update);
film.addEventListener('canplay',seek);
film.addEventListener('loadeddata',()=>{q('.film-wrap').classList.add('ready');update()});
film.addEventListener('error',()=>{q('.film-wrap').classList.remove('ready');q('.media-status').hidden=false;q('.media-status').textContent='The camera film could not load. Select “Play the camera journey” to retry.';stopJourney();});
window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
window.addEventListener('resize',update);
document.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>{if(reduced)setMotion(false);const y=journey.getBoundingClientRect().top+scrollY+Number(b.dataset.chapter)*(journey.offsetHeight-innerHeight);window.scrollTo({top:y,behavior:prefersReduced.matches?'instant':'smooth'});}));
const menuButton=q('.menu-toggle'),menu=q('#mobile-nav');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');menu.classList.remove('open');menu.inert=true;}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');menu.classList.toggle('open',open);menu.inert=!open;});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){closeMenu();menuButton.focus();}});
q('#year').textContent=new Date().getFullYear();
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.desktop-nav a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-20% 0px -55% 0px'});
['work','photography','digital','finesse-os','websites','studio','contact'].filter(id=>document.getElementById(id)).forEach(id=>observer.observe(document.getElementById(id)));

const digitalJourney=q('.digital-journey'),digitalFilm=q('#digital-film'),hud=q('.hud'),portalCopy=q('.portal-copy');
let digitalTarget=0;
let portalEntered=false;
function updatePortal(){
  if(!digitalJourney)return;
  if(reduced){hud.inert=false;return;}
  const rect=digitalJourney.getBoundingClientRect();
  const p=clamp(-rect.top/(digitalJourney.offsetHeight-q('.digital-stage').offsetHeight));
  if(p>.74)portalEntered=true;
  if(p<.28)portalEntered=false;
  const reveal=portalEntered?1:clamp((p-.52)/.22);
  portalCopy.style.opacity=1-clamp(p/.23);
  portalCopy.inert=p>.23;
  q('.portal-hint').style.opacity=1-clamp(p/.25);
  hud.style.opacity=reveal;
  hud.style.transform=`scale(${.78+reveal*.22}) translateY(${(1-reveal)*40}px)`;
  hud.style.pointerEvents=reveal>.9?'auto':'none';
  hud.inert=reveal<.9;
  q('.digital-film-wrap').style.opacity=1-reveal*.93;
  if(Number.isFinite(digitalFilm.duration)&&digitalFilm.duration>0){digitalTarget=clamp(p/.72)*(digitalFilm.duration-.045);seekDigital();}
}
function seekDigital(){if(!reduced&&playbackVideo!==digitalFilm&&!digitalFilm.seeking&&digitalFilm.readyState>=1&&!digitalFilm.error&&Math.abs(digitalFilm.currentTime-digitalTarget)>.035){try{digitalFilm.currentTime=digitalTarget;}catch{}}}
digitalFilm.addEventListener('seeked',seekDigital);
digitalFilm.addEventListener('loadedmetadata',updatePortal);
digitalFilm.addEventListener('canplay',seekDigital);
digitalFilm.addEventListener('loadeddata',()=>{q('.digital-film-wrap').classList.add('ready');updatePortal();});
digitalFilm.addEventListener('error',()=>{q('.digital-film-wrap').classList.remove('ready');});
const digitalLoad=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!digitalFilm.dataset.loaded){digitalFilm.dataset.loaded='true';ensureFilmSource(digitalFilm).catch(()=>{});digitalLoad.disconnect();}},{rootMargin:'900px'});
digitalLoad.observe(digitalJourney);
function enterStudio(animate=true){if(animate){startJourney('digital');return;}portalEntered=true;if(reduced){hud.scrollIntoView({behavior:'instant',block:'center'});}else{const y=digitalJourney.getBoundingClientRect().top+scrollY+(digitalJourney.offsetHeight-q('.digital-stage').offsetHeight)*.84;window.scrollTo({top:y,behavior:'instant'});updatePortal();}}
q('.enter-studio').addEventListener('click',()=>enterStudio());
const serviceTabs=[...document.querySelectorAll('[data-service]')];
function selectService(key,focus=false){serviceTabs.forEach(tab=>{const selected=tab.dataset.service===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;if(selected&&focus)tab.focus();});}
serviceTabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectService(tab.dataset.service));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(index+1)%serviceTabs.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(index+serviceTabs.length-1)%serviceTabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=serviceTabs.length-1;if(next!==undefined){e.preventDefault();selectService(serviceTabs[next].dataset.service,true);}});});
document.querySelectorAll('[data-open-service]').forEach(button=>button.addEventListener('click',()=>{selectService(button.dataset.openService);enterStudio(false);}));
document.querySelectorAll('[data-palette]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const colors={dark:['#141416','#c9b48c'],gold:['#c9b48c','#171614'],light:['#eeeae2','#171614']};const [bg,ink]=colors[button.dataset.palette];q('.brand-sample').style.background=bg;q('.brand-sample').style.color=ink;}));
document.querySelectorAll('[data-logo]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-logo]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const sample=q('#logo-sample'),kind=button.dataset.logo;sample.textContent={wordmark:'FINESSE',monogram:'F.',signature:'Finesse'}[kind];sample.style.fontStyle=kind==='signature'?'italic':'normal';sample.style.fontSize=kind==='monogram'?'110px':kind==='signature'?'65px':'';sample.style.letterSpacing=kind==='wordmark'?'.09em':'-.04em';}));
document.querySelectorAll('.project-demo').forEach(button=>button.addEventListener('click',()=>{const stage=(Number(button.dataset.stage)+1)%3;button.dataset.stage=String(stage);button.querySelector('b').textContent=['Planning','Building','Review'][stage];}));
document.querySelectorAll('[data-web-view]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-web-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));q('#website-preview').hidden=button.dataset.webView!=='website';q('#os-preview').hidden=button.dataset.webView!=='os';}));
function filterWork(filter){
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  document.querySelectorAll('[data-work-group]').forEach(group=>{group.hidden=filter!=='all'&&group.dataset.workGroup!==filter;});
  const count=[...document.querySelectorAll('[data-category]')].filter(card=>filter==='all'||card.dataset.category===filter).length;
  const labels={photography:'photography',websites:'website',saas:'SaaS / web app'};
  if(q('.work-count'))q('.work-count').textContent=filter==='all'?`Showing ${count} projects across 3 disciplines`:`Showing ${count} ${labels[filter]} project${count===1?'':'s'}`;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>filterWork(button.dataset.filter)));
document.querySelectorAll('[data-filter-link]').forEach(link=>link.addEventListener('click',()=>filterWork(link.dataset.filterLink)));
const photoDialog=q('#photo-dialog');
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{photoDialog.querySelector('img').src=button.dataset.photo;photoDialog.querySelector('img').alt=button.dataset.caption;photoDialog.querySelector('p').textContent=button.dataset.caption;photoDialog.showModal();}));
q('.close-dialog').addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('click',e=>{if(e.target===photoDialog){const r=photoDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)photoDialog.close();}});
document.querySelectorAll('.service-inquiry').forEach(link=>link.addEventListener('click',()=>{q('#inquiry-service').value=link.dataset.interest;}));
let draft='';
q('#inquiry-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);const subject=`Finesse inquiry: ${data.get('service')}`;draft=`Hello Finesse Media,\n\nMy name is ${data.get('name')}. I’m interested in ${data.get('service')}.\n\n${data.get('message')}\n\nYou can reach me at ${data.get('email')}.\n\nThank you,\n${data.get('name')}`;q('#send-inquiry').href=`mailto:angel@finessemedia.pro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`;q('#inquiry-result').hidden=false;q('#inquiry-fallback').value=draft;q('#copy-status').textContent='';q('#send-inquiry').focus();});
q('#copy-inquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft);q('#copy-status').textContent='Copied. Paste it into an email to angel@finessemedia.pro.';}catch{q('#inquiry-fallback').hidden=false;q('#inquiry-fallback').focus();q('#inquiry-fallback').select();q('#copy-status').textContent='Select and copy your inquiry below.';}});
function stopJourney(){
  playbackRequest++;
  cancelAnimationFrame(playbackFrame);
  if(playbackVideo)playbackVideo.pause();
  playbackVideo=null;
  q('.journey-playback').hidden=true;
}
async function startJourney(kind){
  stopJourney();
  const request=playbackRequest;
  const video=kind==='camera'?film:digitalFilm;
  const section=kind==='camera'?journey:digitalJourney;
  const stage=kind==='camera'?q('.cinema'):q('.digital-stage');
  if(reduced)setMotion(false);
  playbackVideo=video;
  portalEntered=false;
  q('.media-status').hidden=true;
  q('#playback-label').textContent=kind==='camera'?'Loading the camera journey…':'Loading the digital studio…';
  q('.journey-playback').hidden=false;
  const sectionTop=()=>section.getBoundingClientRect().top+scrollY;
  window.scrollTo({top:sectionTop(),behavior:'instant'});
  video.muted=true;
  // Clicking "Enter the digital studio" plays the laptop film at 2x so visitors reach the studio in about 4 seconds.
  // The camera journey keeps its normal speed.
  video.defaultPlaybackRate=kind==='digital'?2:1;
  video.playbackRate=video.defaultPlaybackRate;
  video.preload='auto';
  if(kind==='digital'){digitalFilm.dataset.loaded='true';digitalLoad.disconnect();}
  try{
    await ensureFilmSource(video);
    if(request!==playbackRequest)return;
    video.currentTime=0;
    q('#playback-label').textContent=kind==='camera'?'Playing the camera journey':'Entering the digital studio';
    await video.play();
    if(request!==playbackRequest){video.pause();return;}
    const frame=()=>{
      if(playbackVideo!==video)return;
      const progress=Number.isFinite(video.duration)?clamp(video.currentTime/video.duration):0;
      const distance=section.offsetHeight-stage.offsetHeight;
      window.scrollTo({top:sectionTop()+progress*distance*(kind==='digital'?.78:1),behavior:'instant'});
      update();
      if(video.ended){stopJourney();if(kind==='digital')enterStudio(false);return;}
      playbackFrame=requestAnimationFrame(frame);
    };
    playbackFrame=requestAnimationFrame(frame);
  }catch{
    if(request!==playbackRequest)return;
    stopJourney();
    q('.media-status').hidden=false;
    q('.media-status').textContent='Playback couldn’t start. Please try the play button again, or scroll to explore.';
  }
}
q('.play-journey').addEventListener('click',()=>startJourney('camera'));
q('#stop-playback').addEventListener('click',stopJourney);
window.addEventListener('wheel',()=>{if(playbackVideo)stopJourney();},{passive:true});
window.addEventListener('touchstart',()=>{if(playbackVideo)stopJourney();},{passive:true});
document.addEventListener('keydown',e=>{if(playbackVideo&&['Escape','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))stopJourney();});
document.querySelectorAll('a[href^="#"],.motion-toggle,[data-chapter],#palette-launcher').forEach(control=>control.addEventListener('click',()=>{if(playbackVideo)stopJourney();}));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playbackVideo)stopJourney();});
if(new URLSearchParams(location.search).get('interest')==='website')q('#inquiry-service').value='Website + Finesse OS';
selectService('web');
setMotion(reduced);

