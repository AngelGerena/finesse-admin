const websiteCards=[...document.querySelectorAll('.website-project')];
const websiteFilterButtons=[...document.querySelectorAll('[data-website-filter]')];
const websiteSearch=document.querySelector('#website-search');
let websiteCategory='all';
function filterWebsiteCollection(){
  const search=websiteSearch.value.toLocaleLowerCase().trim();let count=0;
  websiteCards.forEach(card=>{const matches=(websiteCategory==='all'||card.dataset.websiteCategory===websiteCategory)&&card.dataset.websiteName.includes(search);card.hidden=!matches;if(matches)count++;});
  websiteFilterButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.websiteFilter===websiteCategory)));
  document.querySelector('.website-count').textContent=`Showing ${count} of ${websiteCards.length} websites`;
  document.querySelector('.website-empty').hidden=count!==0;
}
websiteFilterButtons.forEach(button=>button.addEventListener('click',()=>{websiteCategory=button.dataset.websiteFilter;filterWebsiteCollection();}));
websiteSearch.addEventListener('input',filterWebsiteCollection);
const projectDialog=document.querySelector('#website-project-dialog');
document.querySelectorAll('[data-project-preview]').forEach(button=>button.addEventListener('click',()=>{
  const project=websiteProjects[Number(button.dataset.projectPreview)];
  document.querySelector('#project-dialog-title').textContent=project.name;
  document.querySelector('#project-dialog-description').textContent=project.description;
  const image=projectDialog.querySelector('img');image.src=project.image;image.alt=project.alt;
  const visit=projectDialog.querySelector('.project-dialog-live');visit.hidden=!project.available;if(project.available)visit.href=project.url;else visit.removeAttribute('href');
  projectDialog.showModal();
}));
document.querySelector('.project-dialog-close').addEventListener('click',()=>projectDialog.close());
projectDialog.addEventListener('click',e=>{if(e.target===projectDialog){const r=projectDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)projectDialog.close();}});
const websiteMenuButton=document.querySelector('.menu-toggle'),websiteMenu=document.querySelector('#mobile-nav');
function closeWebsiteMenu(){websiteMenuButton.setAttribute('aria-expanded','false');websiteMenuButton.setAttribute('aria-label','Open menu');websiteMenu.classList.remove('open');websiteMenu.inert=true;}
websiteMenuButton.addEventListener('click',()=>{const open=websiteMenuButton.getAttribute('aria-expanded')!=='true';websiteMenuButton.setAttribute('aria-expanded',String(open));websiteMenuButton.setAttribute('aria-label',open?'Close menu':'Open menu');websiteMenu.classList.toggle('open',open);websiteMenu.inert=!open;});
websiteMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeWebsiteMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&websiteMenu.classList.contains('open')){closeWebsiteMenu();websiteMenuButton.focus();}});
document.querySelector('#year').textContent=new Date().getFullYear();
