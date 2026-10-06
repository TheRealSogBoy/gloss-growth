'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const toggle=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width:901px)');
 let animation=null,version=0;
 const setOpen=open=>{
  const ticket=++version;animation?.cancel();animation=null;
  toggle.setAttribute('aria-expanded',String(open));nav.inert=!open&&!desktop.matches;
  if(open)nav.classList.add('is-open');
  if(reduced.matches||desktop.matches||!nav.animate){nav.classList.toggle('is-open',open);return;}
  animation=nav.animate(open?[{opacity:0,transform:'translateY(-7px)'},{opacity:1,transform:'none'}]:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-5px)'}],{duration:open?280:220,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
  animation.finished.then(()=>{if(ticket===version){nav.classList.toggle('is-open',open);animation?.cancel();animation=null}}).catch(()=>{});
 };
 const close=()=>{if(toggle.getAttribute('aria-expanded')==='true')setOpen(false)};
 toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){close();toggle.focus()}});
 document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))close()});
 desktop.addEventListener('change',()=>setOpen(false));
 reduced.addEventListener('change',()=>setOpen(toggle.getAttribute('aria-expanded')==='true'));
 nav.inert=!desktop.matches;
 window.addEventListener('pagehide',()=>{animation?.cancel();animation=null});
});
