'use strict';
// Only functional behavior; no scroll hijacking, hidden content or perpetual animation.
document.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide) lucide.createIcons();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const faqAnimations=new Map();
  const setAnswer=(button,open)=>{
    const panel=button.closest('.faq__item').querySelector('.faq__answer');
    const previous=faqAnimations.get(panel);
    const from=panel.hidden?0:panel.getBoundingClientRect().height;
    const fromPadding=panel.hidden?'0px':getComputedStyle(panel).paddingBottom;
    previous?.cancel();faqAnimations.delete(panel);
    button.setAttribute('aria-expanded',String(open));panel.inert=!open;
    if(reduced.matches||!panel.animate){panel.hidden=!open;return;}
    if(!open&&panel.hidden)return;
    panel.hidden=false;
    // Read natural height once. Only the accordion uses layout animation.
    const target=open?panel.getBoundingClientRect().height:0;
    const targetPadding=open?getComputedStyle(panel).paddingBottom:'0px';
    const animation=panel.animate([
      {height:from+'px',paddingBottom:fromPadding,opacity:open?.35:1,transform:open?'translateY(-3px)':'none',overflow:'hidden'},
      {height:target+'px',paddingBottom:targetPadding,opacity:open?1:0,transform:open?'none':'translateY(-3px)',overflow:'hidden'}
    ],{duration:300,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    faqAnimations.set(panel,animation);
    animation.finished.then(()=>{
      if(faqAnimations.get(panel)!==animation)return;
      panel.hidden=!open;animation.cancel();faqAnimations.delete(panel);
    }).catch(()=>{});
  };
  document.querySelectorAll('.faq__question').forEach(button=>{
    button.addEventListener('click',()=>{
      const open=button.getAttribute('aria-expanded')!=='true';
      document.querySelectorAll('.faq__question').forEach(other=>{
        if(other!==button&&other.getAttribute('aria-expanded')==='true')setAnswer(other,false);
      });
      setAnswer(button,open);
    });
  });
  const settleFAQ=()=>{
    faqAnimations.forEach((animation,panel)=>{
      animation.cancel();panel.hidden=panel.closest('.faq__item').querySelector('button').getAttribute('aria-expanded')!=='true';
    });faqAnimations.clear();
  };
  reduced.addEventListener('change',settleFAQ);
  window.addEventListener('pagehide',settleFAQ);
  // Preserve the original WhatsApp message and destination, add focus management.
  let returnFocus=null;
  const originalOpen=window.openWAModal,originalClose=window.closeWAModal;
  const modal=document.getElementById('wa-modal');
  const outside=[...document.body.children].filter(el=>el!==modal&&el.tagName!=='SCRIPT');
  window.openWAModal=()=>{returnFocus=document.activeElement;originalOpen();outside.forEach(el=>el.inert=true)};
  window.closeWAModal=()=>{const opened=modal.classList.contains('wa-modal--open');originalClose();outside.forEach(el=>el.inert=false);if(opened&&returnFocus)returnFocus.focus()};
  modal.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const focusable=[...modal.querySelectorAll('button,input,select,a[href]')].filter(el=>el.tabIndex>=0&&!el.hidden&&!el.disabled&&el.getClientRects().length);
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
  const viewer=document.getElementById('evidenceDialog');
  const image=document.getElementById('evidenceImage');
  const zoom=document.getElementById('evidenceZoom');
  let evidenceTrigger=null;
  document.querySelectorAll('.evidence-open').forEach(button=>button.addEventListener('click',()=>{
    evidenceTrigger=button;
    const source=button.querySelector('img');
    image.src=source.currentSrc||source.src;image.alt=source.alt;
    document.getElementById('evidenceTitle').textContent=button.dataset.evidenceTitle;
    viewer.classList.remove('evidence-dialog--zoom');zoom.textContent='Acercar +';zoom.setAttribute('aria-pressed','false');
    viewer.showModal();document.body.style.overflow='hidden';
    document.getElementById('evidenceClose').focus();
  }));
  zoom.addEventListener('click',()=>{
    const enlarged=viewer.classList.toggle('evidence-dialog--zoom');
    zoom.textContent=enlarged?'Ajustar −':'Acercar +';zoom.setAttribute('aria-pressed',String(enlarged));
    viewer.querySelector('.evidence-dialog__viewport').scrollTo(0,0);
  });
  document.getElementById('evidenceClose').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()}});
  viewer.addEventListener('close',()=>{document.body.style.overflow='';if(evidenceTrigger)evidenceTrigger.focus()});
});
