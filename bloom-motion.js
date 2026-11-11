// Fold the six existing petal groups into one upright bud, then fan them outward.
export function bloomSvg(svg,groups){
 if(!svg)return;
 const ids=new Map([...svg.querySelectorAll('g[id]')].map(g=>[g.id,g])),wrappers=[];
 for(const info of groups||[]){const group=ids.get(info.id);if(!group)continue;
  const path=group.querySelector('path[d]'),numbers=(path?.getAttribute('d')?.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number);let x=0,y=0;
  for(let i=0;i+1<numbers.length;i+=2){x+=numbers[i];y+=numbers[i+1]}
  const axis=Math.atan2(y,x)*180/Math.PI,budAngle=-90+(Number(info.index||0)-2.5)*3.5;
  const wrapper=document.createElementNS('http://www.w3.org/2000/svg','g');wrapper.classList.add('blooming-petal');wrapper.style.setProperty('--bud-transform',`rotate(${budAngle}deg) scale(.40,.30) rotate(${-axis}deg)`);
  while(group.firstChild)wrapper.append(group.firstChild);group.append(wrapper);wrappers.push(wrapper);
 }
 svg.classList.add('blooming-svg');
 const finish=()=>{for(const wrapper of wrappers){while(wrapper.firstChild)wrapper.before(wrapper.firstChild);wrapper.remove();}svg.classList.remove('blooming-svg');};
 setTimeout(finish,580);return finish;
}
