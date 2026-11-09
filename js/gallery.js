/* Progressive enhancement: photos remain ordinary full-image links without JS. */
(function(){
  'use strict';
  const grid=document.querySelector('.gallery-grid');
  const cards=Array.from(grid.querySelectorAll('.gallery-card'));
  const groups=Array.from(grid.querySelectorAll('.gallery-group'));
  const filters=document.querySelector('.gallery-filters');
  const count=document.getElementById('galleryCount');
  const dialog=document.getElementById('photoViewer');
  const image=dialog.querySelector('img');
  const title=document.getElementById('photoTitle');
  const caption=document.getElementById('photoCaption');
  const position=document.getElementById('photoPosition');
  const close=document.getElementById('photoClose');
  let visible=cards.slice(),index=0,opener=null,oldOverflow='';
  filters.hidden=false;
  filters.querySelectorAll('button').forEach(button=>{
    button.addEventListener('click',()=>{
      const category=button.dataset.filter;
      filters.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      cards.forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;});
      groups.forEach(group=>{group.hidden=category!=='all'&&group.dataset.category!==category;});
      visible=cards.filter(card=>!card.hidden);
      grid.dataset.filter=category;
      count.textContent=visible.length+' photos';
    });
  });
  function show(next){
    index=(next+visible.length)%visible.length;
    const card=visible[index],link=card.querySelector('.gallery-open');
    image.src=link.href;
    image.alt=card.querySelector('img').alt;
    title.textContent=card.querySelector('h3').textContent;
    caption.textContent=card.querySelector('.eyebrow').textContent+'. '+card.querySelector('.gallery-caption').textContent;
    position.textContent=(index+1)+' / '+visible.length;
  }
  cards.forEach(card=>{
    const link=card.querySelector('.gallery-open');
    link.addEventListener('click',event=>{
      if(typeof dialog.showModal!=='function'||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      opener=link;
      show(visible.indexOf(card));
      oldOverflow=document.body.style.overflow;
      document.body.style.overflow='hidden';
      dialog.showModal();
      close.focus();
    });
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    document.body.style.overflow=oldOverflow;
    if(opener)opener.focus({preventScroll:true});
  });
  document.getElementById('photoPrevious').addEventListener('click',()=>show(index-1));
  document.getElementById('photoNext').addEventListener('click',()=>show(index+1));
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Tab'){
      const buttons=Array.from(dialog.querySelectorAll('button:not([disabled])'));
      const first=buttons[0],last=buttons[buttons.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
    if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}
  });
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  });
})();
