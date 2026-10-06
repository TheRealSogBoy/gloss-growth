'use strict';
// Progressive enhancement: nothing is hidden while waiting for JavaScript or scrolling.
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:600px)');
 const active=new Set(),seen=new WeakSet();
 let observer=null,frame=0;
 const animate=(element,{delay=0,x=0,y=16,shape=false}={})=>{
  if(preference.matches||!element.animate)return;
  const factor=mobile.matches?.5:1;
  const animation=element.animate([
   {opacity:shape?.5:.3,transform:`translate(${x*factor}px,${y*factor}px)${shape?' scale(.97) rotate(-1deg)':''}`},
   {opacity:1,transform:'none'}
  ],{duration:mobile.matches?450:650,delay:mobile.matches?Math.min(delay,100):delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
  active.add(animation);
  animation.finished.catch(()=>{}).finally(()=>{active.delete(animation);animation.cancel()});
 };
 const groups=[
  ['.problem .section-head',{}],['.pain-list li',{sequence:75}],['.problem .closing',{}],
  ['.system .section-head',{}],['.patient-path li',{sequence:130,path:true}],['.system-close',{}],['.system-art',{shape:true,y:8}],
  ['.results>.wrap>.section-head',{}],['.zen-heading',{}],['.zen-narrative>div',{sequence:110}],
  ['.zen-proofs .proof',{sequence:70,y:8}],['.zen-review',{y:8}],['.secondary-heading',{}],
  ['.case-brief',{sequence:70,y:8}],['.project-grid article',{sequence:70,y:8}],
  ['.services .section-head',{}],['.service-row',{alternating:true,y:0}],
  ['.why .section-head',{y:20}],['.difference-list article',{sequence:85}],
  ['.process .section-head',{}],['.process-list li',{sequence:110,path:true}],
  ['.fit .section-head',{}],['.fit-columns>div',{alternating:true,y:0}],['.fit-close',{}],
  ['.faq-section .section-head',{}],['.faq-list',{y:10}],
  ['.final-cta .eyebrow,.final-cta h2,.final-cta .wrap>p:not(.eyebrow),.final-cta .btn',{sequence:80}],
  ['.final-wave',{shape:true,y:8}]
 ];
 const settings=new WeakMap();
 const stop=()=>{
  observer?.disconnect();observer=null;
  active.forEach(a=>a.cancel());active.clear();
  document.body.classList.remove('motion-enabled');
 };
 const start=()=>{
  if(preference.matches||!('IntersectionObserver' in window)||!Element.prototype.animate)return;
  document.body.classList.add('motion-enabled');
  observer=new IntersectionObserver(entries=>{
   const entered=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left);
   entered.forEach(entry=>{
    const el=entry.target;observer.unobserve(el);if(seen.has(el))return;seen.add(el);
    const cfg=settings.get(el)||{};
    // Only stagger siblings arriving together, never delay an isolated item on mobile scroll.
    const siblings=entered.filter(e=>e.target.parentElement===el.parentElement);
    const delay=(cfg.sequence||0)*siblings.findIndex(e=>e.target===el);
    el.style.setProperty('--motion-delay',`${mobile.matches?Math.min(delay,100):delay}ms`);
    el.classList.add('motion-in');animate(el,{...cfg,delay});
   });
  },{threshold:.12,rootMargin:'0px 0px -24px 0px'});
  groups.forEach(([selector,cfg])=>document.querySelectorAll(selector).forEach((el,i)=>{
   settings.set(el,{...cfg,x:cfg.alternating?(i%2?14:-14):0});if(!seen.has(el))observer.observe(el);
  }));
 };
 const updateHeader=()=>{frame=0;document.querySelector('.site-header')?.classList.toggle('is-scrolled',scrollY>48)};
 const onScroll=()=>{if(!frame)frame=requestAnimationFrame(updateHeader)};
 const onPreference=()=>{stop();if(!preference.matches)start()};
 document.addEventListener('DOMContentLoaded',()=>{
  start();
  ['.hero-v2 .eyebrow','.hero-v2 h1','.hero-intro','.hero-actions','.hero-underline'].forEach((selector,i)=>{
   const el=document.querySelector(selector);if(el)animate(el,{delay:i*65,y:i===1?24:12,shape:i===4});
  });
  updateHeader();window.addEventListener('scroll',onScroll,{passive:true});preference.addEventListener('change',onPreference);
 });
 window.addEventListener('pagehide',()=>{stop();if(frame)cancelAnimationFrame(frame);frame=0;window.removeEventListener('scroll',onScroll);preference.removeEventListener('change',onPreference)});
 window.addEventListener('pageshow',event=>{if(event.persisted){start();updateHeader();window.addEventListener('scroll',onScroll,{passive:true});preference.addEventListener('change',onPreference)}});
})();
