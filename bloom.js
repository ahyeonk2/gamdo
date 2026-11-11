const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let serial=0;
const smooth=t=>t*t*(3-2*t);
function budPath(k,n){
 const angle=(k-(n-1)/2)*.07,fn=t=>{const u=(1+Math.cos(t))/2,x=19*Math.sin(t)*( .55+.45*u),y=-66*u;return [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)]};
 const derivative=t=>{const a=fn(t-.001),b=fn(t+.001);return [(b[0]-a[0])/.002,(b[1]-a[1])/.002]};
 const dt=Math.PI*2/48;let a=fn(0),path=`M ${a.join(' ')}`;
 for(let i=0;i<48;i++){const t=i*dt,b=fn(t+dt),da=derivative(t),db=derivative(t+dt);path+=` C ${a[0]+da[0]*dt/3} ${a[1]+da[1]*dt/3} ${b[0]-db[0]*dt/3} ${b[1]-db[1]*dt/3} ${b[0]} ${b[1]}`;a=b;}return path+' Z';
}
export async function bloom(host,{delay=850}={}){
 if(!host||reduced.matches)return;
 host._birthCancel?.();const token={};host._birthToken=token;
 const image=host.querySelector(':scope > img');let svg=host.querySelector(':scope > svg');
 if(image){try{host._birthSource??=await fetch(image.src).then(r=>{if(!r.ok)throw Error();return r.text()});if(host._birthToken!==token)return;
 const doc=new DOMParser().parseFromString(host._birthSource,'image/svg+xml');svg=doc.documentElement;if(svg.tagName!=='svg')return;
 const prefix=`birth-${serial++}-`;const ids=[...svg.querySelectorAll('[id]')].map(x=>x.id);for(const el of [svg,...svg.querySelectorAll('*')])for(const attr of [...el.attributes]){let value=attr.value;for(const id of ids){if(attr.name==='id'&&value===id)value=prefix+id;else value=value.replaceAll(`url(#${id})`,`url(#${prefix}${id})`).replace(new RegExp(`^#${id}$`),`#${prefix}${id}`);}el.setAttribute(attr.name,value);}
 host.append(svg);image.style.display='none';}catch{return;}}
 if(!svg)return;host.classList.add('birth-stage');
 const number=/-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
 const paths=[...svg.querySelectorAll('path[id*="-petal-"]')];const outer=paths.filter(p=>p.id.includes('-petal-2-'));const n=outer.length;
 const records=paths.map(el=>{const original=el.getAttribute('d'),match=el.id.match(/-petal-(\d+)-(\d+)-/),layer=+match[1],k=+match[2];return {el,original,layer,k,to:original.match(number).map(Number),from:budPath(k,n).match(number).map(Number)};});
 const details=[...svg.querySelectorAll('[data-module="radial"],[data-module="core"],[data-finish="radial-contact-diffuse"],[data-finish="scattered-flat-particles"],[data-finish="faint-petal-boundaries"],[data-finish="satellite-sparkles"]')];
 const glowFilters=[...svg.querySelectorAll('filter')].filter(el=>/-membrane$|-color-bloom$|-contact-soft$/.test(el.id));const filterState=glowFilters.map(el=>Object.fromEntries(['x','y','width','height','filterUnits'].map(key=>[key,el.getAttribute(key)])));glowFilters.forEach(el=>{for(const [key,value] of Object.entries({x:'-300',y:'-300',width:'600',height:'600',filterUnits:'userSpaceOnUse'}))el.setAttribute(key,value)});
 // Precompile coordinates once; avoid regular expressions and parsing on every paint.
 const frames=records.map(r=>Array.from({length:121},(_,frame)=>{const t=frame/120;const progress=smooth(t)+(t>.7?Math.sin((t-.7)/.3*Math.PI)*.012:0);let i=0;return r.original.replace(number,()=>{const j=i++;return (r.from[j]+(r.to[j]-r.from[j])*progress).toFixed(2)})}));
 // Hundreds of per-dot blur filters become eight shared blur passes during motion.
 // Restore the exact original mask when the flower has settled.
 const mask=svg.querySelector('mask[id$="-radial-halftone"]');
 const savedMask=mask?.cloneNode(true),temporaryFilters=[];
 if(mask){
 const ns='http://www.w3.org/2000/svg',defs=svg.querySelector('defs'),buckets=new Map();
 for(const dot of [...mask.querySelectorAll('circle')]){
 const ref=dot.getAttribute('filter')?.match(/#([^)]*)/)[1];
 const source=ref?svg.querySelector(`[id="${ref}"] feGaussianBlur`):null;
 const blur=+(source?.getAttribute('stdDeviation')||0),band=Math.round(blur*2)/2;
 if(!buckets.has(band)){const group=document.createElementNS(ns,'g');
 if(band){const filter=document.createElementNS(ns,'filter');filter.id=`motion-blur-${serial++}`;filter.setAttribute('x','-30%');filter.setAttribute('y','-30%');filter.setAttribute('width','160%');filter.setAttribute('height','160%');const gaussian=document.createElementNS(ns,'feGaussianBlur');gaussian.setAttribute('stdDeviation',String(band));filter.append(gaussian);defs.append(filter);temporaryFilters.push(filter);group.setAttribute('filter',`url(#${filter.id})`)}
 mask.append(group);buckets.set(band,group)}
 dot.removeAttribute('filter');buckets.get(band).append(dot);
 }
 }
 const motionFilters=[...svg.querySelectorAll('[filter]')].map(el=>[el,el.getAttribute('filter')]);motionFilters.forEach(([el])=>el.removeAttribute('filter'));
 const originalOpacity=details.map(el=>el.getAttribute('opacity'));let raf,start,done=false;
 host.classList.add('is-blooming');

 let complete;const finished=new Promise(resolve=>{complete=resolve});
 function finish(){if(done)return;done=true;cancelAnimationFrame(raf);records.forEach(r=>r.el.setAttribute('d',r.original));details.forEach((el,i)=>originalOpacity[i]===null?el.removeAttribute('opacity'):el.setAttribute('opacity',originalOpacity[i]));svg.style.filter='';glowFilters.forEach((el,i)=>{for(const [key,value] of Object.entries(filterState[i]))value===null?el.removeAttribute(key):el.setAttribute(key,value)});if(image){svg.remove();image.style.display='';}if(mask&&savedMask)mask.replaceWith(savedMask);temporaryFilters.forEach(f=>f.remove());host.classList.remove('is-blooming');motionFilters.forEach(([el,value])=>el.setAttribute('filter',value));host._birthCancel=null;complete();}
 host._birthCancel=finish;
 let lastPaint=-Infinity;
 function draw(time){
 if(time-lastPaint<32){raf=requestAnimationFrame(draw);return}lastPaint=time;
 start??=time;const elapsed=Math.max(0,time-start-delay);
 records.forEach((r,i)=>{const stagger=(r.k%3)*65+(2-r.layer)*140;const t=Math.max(0,Math.min(1,(elapsed-stagger)/1800));const frame=Math.round(t*120);if(r.frame!==frame){r.el.setAttribute('d',frames[i][frame]);r.frame=frame;}});
 const reveal=smooth(Math.max(0,Math.min(1,(elapsed-950)/1200)));
 details.forEach((el,i)=>el.setAttribute('opacity',reveal*(originalOpacity[i]===null?1:+originalOpacity[i])));
 if(elapsed>=2350)finish();else raf=requestAnimationFrame(draw);
 }
 // Install the closed bud synchronously, before the modal's first paint.
 records.forEach((r,i)=>r.el.setAttribute('d',frames[i][0]));
 details.forEach(el=>el.setAttribute('opacity','0'));
 raf=requestAnimationFrame(draw);
 return finished;
}
