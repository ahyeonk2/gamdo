// Animate only a composited receipt bitmap and a small set of light particles.
export async function transferReceipt(dialog,image,color='#d98edb'){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,box=image.getBoundingClientRect();
 const center={x:box.x+box.width/2,y:box.y+box.height*.48};
 const layer=document.createElement('div');layer.className='receipt-transfer';layer.setAttribute('popover','manual');layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');
 const caption=document.createElement('p');caption.textContent='앞쪽의 벽의 정원에 옮겨 심고 있어요';layer.append(caption);dialog.append(layer);layer.showPopover?.();dialog.classList.add('is-transferring');image.classList.remove('receipt-printing');
 const animations=[];let cleaned=false;
 const cleanup=()=>{if(cleaned)return;cleaned=true;animations.forEach(a=>a.cancel());layer.hidePopover?.();layer.remove();dialog.classList.remove('is-transferring');};
 try{
  const fold=image.animate(reduced?[{opacity:1},{opacity:0}]:[{transform:'perspective(900px) rotateX(0deg) scale(1)',clipPath:'inset(0)',opacity:1},{offset:.45,transform:'perspective(900px) rotateX(-45deg) scale(.85,.65)',clipPath:'inset(18% 0)',opacity:1},{transform:'perspective(900px) rotateX(-78deg) scale(.12,.2)',clipPath:'inset(35% 12%)',opacity:0}],{duration:reduced?200:720,easing:'cubic-bezier(.45,0,.2,1)',fill:'forwards'});animations.push(fold);await fold.finished;
  const lights=[];
  for(let i=0;i<(reduced?6:22);i++){
   const dot=document.createElement('i'),angle=i*2.39996,radius=12+Math.sqrt(i/22)*45,size=5+(i*7%13);
   dot.style.cssText=`left:${center.x}px;top:${center.y}px;width:${size}px;height:${size}px;--light-color:${color}`;layer.append(dot);
   const dx=Math.cos(angle)*radius,dy=Math.sin(angle)*radius,drift=Math.sin(i*1.7)*65;
   const a=dot.animate(reduced?[{opacity:0},{opacity:.8,offset:.3},{opacity:0}]:[{transform:'translate(-50%,-50%) scale(.15)',opacity:0},{offset:.16,transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1)`,opacity:.95},{offset:.42,transform:`translate(calc(-50% + ${dx*.6}px),calc(-50% + ${dy-55}px)) scale(.8)`,opacity:.9},{transform:`translate(calc(-50% + ${drift}px),${-center.y-100}px) scale(.35)`,opacity:0}],{duration:reduced?350:1550+i%5*65,delay:reduced?0:i%4*28,easing:'cubic-bezier(.35,.05,.45,1)',fill:'forwards'});animations.push(a);lights.push(a.finished);
  }
  const captionAnimation=caption.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,delay:reduced?0:480,fill:'forwards'});animations.push(captionAnimation);
  await Promise.all(lights);return cleanup;
 }catch(error){cleanup();throw error;}
}
