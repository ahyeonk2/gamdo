/* GAMDO grammar v20: continuous spatial composition of local curve cells.
 * Relation crosses rooted loops; narrative folds intact loops; immersion redistributes a fixed set of contours.
 * Fixed cell topology + continuous transformations; seed only sets rotation phase.
 */
export const AXES=[['감각','절제','강렬','채도 · 대비'],['정서','잔잔','격렬','매끈함 ↔ 파동 리듬'],['인물','관찰','동일시','각진 ↔ 유기적 곡률'],['관계','분리','연결','독립 흐름 ↔ 얽힘'],['몰입','거리','몰입','바깥 분산 ↔ 중심 집중'],['서사','닫힘','열림','감싸임 ↔ 펼쳐짐']];
export const BASIC_COLORS=[['핑크','#ed7db6'],['레드','#f1847e'],['블루','#8cc7df'],['그린','#b4d17e'],['퍼플','#c28bda'],['옐로','#f4d07a']];
export const COLORS=BASIC_COLORS;
function paletteColor(hex){
 if(COLORS.some(c=>c[1]===hex.toLowerCase()))return hex.toLowerCase();
 const legacy={'#e98fbd':0,'#ef9691':1,'#a5cddd':2,'#bfd59c':3,'#c5a0d5':4,'#f3d897':5,'#f789b6':0,'#ef665c':1,'#80add9':2,'#c7dd4a':3,'#d98edb':4,'#fce130':5,'#b5a0cf':4,'#f6d43b':5,'#abc97b':3,'#4597ed':2,'#a6e413':3,'#bd93c5':4,'#31e1de':2,'#f8e81f':5,'#f868ca':0,'#fd7e60':1,'#4cb6f7':2,'#58db96':3,'#bc82f7':4,'#e5d691':5,'#ffeaea':0,'#cee3ff':2,'#f0be9d':1};
 if(hex in legacy)return COLORS[legacy[hex]][1];
 const lab=toLab(hex);return COLORS.reduce((best,c)=>{const distance=Math.hypot(...toLab(c[1]).map((v,i)=>v-lab[i]));return distance<best.distance?{color:c[1],distance}:best},{color:COLORS[0][1],distance:Infinity}).color;
}
export function resolveMix(s){
 const fallback={310:'#ed7db6',350:'#f1847e',30:'#f4d07a',60:'#f4d07a',145:'#b4d17e',205:'#8cc7df',270:'#c28bda'};
 const input=s.mixing?.length>=2?s.mixing.slice(0,3):[{color:fallback[s.hue]||COLORS[0][1],weight:80},{color:fallback[s.hue]||COLORS[0][1],weight:20}];
 const valid=input.map(x=>({color:/^#[0-9a-f]{6}$/i.test(x.color)?paletteColor(x.color):COLORS[0][1],weight:Math.max(0,Number(x.weight)||0)}));
 const total=valid.reduce((a,x)=>a+x.weight,0);return valid.map((x,i)=>({...x,weight:total?x.weight/total*100:(i===0?100:0)}));
}
export function rebalanceMix(colors,index,value){
 const next=colors.map(x=>({...x})),other=next.map((_,i)=>i).filter(i=>i!==index);
 value=Math.max(0,Math.min(100,Math.round(Number(value)||0)));const sum=other.reduce((a,i)=>a+next[i].weight,0);next[index].weight=value;
 let remaining=100-value;other.forEach((i,j)=>{const w=j===other.length-1?remaining:Math.round((100-value)*(sum?next[i].weight/sum:1/other.length));next[i].weight=w;remaining-=w});return next;
}
function tone(hex,sense,lighten=0){const nums=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255);const max=Math.max(...nums),min=Math.min(...nums),delta=max-min;let h=0,l=(max+min)/2,sat=0;if(delta){sat=delta/(1-Math.abs(2*l-1));h=max===nums[0]?((nums[1]-nums[2])/delta)%6:max===nums[1]?(nums[2]-nums[0])/delta+2:(nums[0]-nums[1])/delta+4;h=(h*60+360)%360}return `hsl(${h.toFixed(2)} ${Math.min(96,sat*100*(.72+.28*sense)+28*sense).toFixed(2)}% ${Math.min(96,Math.max(40,l*100+(1-sense)*6+lighten-5*sense)).toFixed(2)}%)`;}
function hexHsl(hex){const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255),hi=Math.max(...v),lo=Math.min(...v),d=hi-lo,l=(hi+lo)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=hi===v[0]?((v[1]-v[2])/d)%6:hi===v[1]?(v[2]-v[0])/d+2:(v[0]-v[1])/d+4;h=(h*60+360)%360}return {h,s:s*100,l:l*100};}
export function gradientRegions(state){let ordered=resolveMix(state).filter(x=>x.weight>0);if(state.gradientDirection!=='main-inside')ordered=ordered.reverse();let end=0;return ordered.map(x=>{const start=end;end+=x.weight/100;return {...x,start,end,hsl:hexHsl(x.color)}});}
function toLab(hex){const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);const [r,g,b]=v;const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),q=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);return [.2104542553*l+.793617785*m-.0040720468*q,1.9779984951*l-2.428592205*m+.4505937099*q,.0259040371*l+.7827717662*m-.808675766*q];}
function labHex([L,a,b]){const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,q=(L-.0894841775*a-1.291485548*b)**3;return '#'+[4.0767416621*l-3.3077115913*m+.2309699292*q,-1.2684380046*l+2.6097574011*m-.3413193965*q,-.0041960863*l-.7034186147*m+1.707614701*q].map(x=>Math.max(0,Math.min(1,x))).map(x=>x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055).map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');}
// Opposition is measured in the chromatic plane, independently of hue wrapping.
function colorOpposition(colors){let opposition=0;for(let i=0;i<colors.length;i++)for(let j=i+1;j<colors.length;j++){if(!colors[i].weight||!colors[j].weight)continue;const a=toLab(colors[i].color),b=toLab(colors[j].color),den=Math.hypot(a[1],a[2])*Math.hypot(b[1],b[2]);if(den>.0001)opposition=Math.max(opposition,Math.max(0,-(a[1]*b[1]+a[2]*b[2])/den))}return opposition;}
export function gradientInfluences(state,t){
 let colors=resolveMix(state);if(state.gradientDirection!=='main-inside')colors=[...colors].reverse();
 // Full-petal fields: no Gaussian boundary, local halo, or separate color zones.
 const softness=state.softness??.75,span=.96-.24*softness-.10*colorOpposition(colors);
 const u=.5+(Math.max(0,Math.min(1,t))-.5)*span;
 const basis=colors.length===3?[(1-u)**2,2*u*(1-u),u*u]:[1-u,u];
 // Anchor the broad middle of each garden petal in its primary hue.
 const main=state.gradientDirection==='main-inside'?0:colors.length-1;
 if(state.primaryPetalField)basis[main]+=0.8*4*u*(1-u);
 const values=colors.map((c,i)=>({...c,strength:c.weight*basis[i]}));
 const total=values.reduce((sum,c)=>sum+c.strength,0)||1;
 return values.map(c=>({...c,strength:c.strength/total}));
}
export function gradientLabAt(state,t){
 const fields=gradientInfluences(state,t),lab=[0,0,0];
 for(const c of fields){const p=toLab(c.color);for(let i=0;i<3;i++)lab[i]+=p[i]*c.strength}
 // Uniform pastel harmonization, never a bright ring at the color crossover.
 const opposition=colorOpposition(resolveMix(state));
 lab[0]+=.025*opposition;lab[1]+=.003*opposition;lab[2]+=.005*opposition;
 return lab;
}
export function gradientColorAt(state,t){return hexHsl(labHex(gradientLabAt(state,t)));}
function colorStops(state,sense,layer,petal){return Array.from({length:65},(_,i)=>i/64).map(t=>{const c=gradientColorAt(state,t),depth=state.surface??1;
 const lightLift=27*t;
 const localLight=c.l+lightLift*(100-c.l)/42*Math.min(1,(100-c.l)/25);
 const baseLight=petal?Math.min(98,c.l+(localLight-c.l)*depth):Math.min(96,c.l+(layer===1?4:0));
 const light=layer===1?Math.max(32,baseLight-16+5*t):baseLight;
 const shift=petal?(layer===1?3:0)+4*t:0;
 const sat=Math.min(100,c.s*(.6+.52*sense)*(layer===1?1.38:1));
 return `<stop offset="${t.toFixed(5)}" stop-color="hsl(${((c.h+shift)%360).toFixed(3)} ${sat.toFixed(3)}% ${light.toFixed(3)}%)"/>`;}).join('');}
export const DEFAULT={axes:[90,75,28,28,30,45],hue:310,glow:2.5,width:0,opacity:0.96,surface:1,softness:.75,colorMode:'aurora',repeat:6,seed:1248,locked:true,modules:{core:true,radial:true,contour:true},gradientDirection:'main-inside',mixing:[{color:'#ed7db6',weight:80},{color:'#ed7db6',weight:20}]};
const TAU=Math.PI*2,f=n=>Number(n.toFixed(3)),mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function parameters(s){const [a,e,c,r,d,o]=s.axes.map(v=>v/100);return {saturation:32+30*a,lightness:85-8*a,radius:220,rhythm:e,bend:c,connection:r,density:d,opening:o};}
// Periodic parametric curves become editable cubic Bezier paths.
function curve(fn){const start=0,end=TAU,N=48,dt=(end-start)/N,eps=.001;
 const point=t=>fn(t),derivative=t=>{const a=fn(t-eps),b=fn(t+eps);return [(b[0]-a[0])/(2*eps),(b[1]-a[1])/(2*eps)]};
 let a=point(start),path=`M ${a.map(f).join(' ')}`;
 for(let i=0;i<N;i++){const t=start+i*dt,b=point(t+dt),da=derivative(t),db=derivative(t+dt);path+=` C ${f(a[0]+da[0]*dt/3)} ${f(a[1]+da[1]*dt/3)} ${f(b[0]-db[0]*dt/3)} ${f(b[1]-db[1]*dt/3)} ${f(b[0])} ${f(b[1])}`;a=b}
 return path+' Z';
}
export function flower(s,id='flower',mono=false){
 const p=parameters(s),n=s.repeat,phase=((s.seed%360)+360)%360*Math.PI/180,step=TAU/n;
 const isRed=s.hue===350;
 const paletteHue=s.hue===310?345:isRed?8:s.hue;
 const col=(h,l)=>`hsl(${(h+360)%360} ${p.saturation}% ${l}%)`;
 const stroke=mono?'#303038':`url(#${id}-ink)`;
 const colors=resolveMix(s),sense=s.axes[0]/100,aurora=s.colorMode==='aurora';
 const tone=hexHsl(colors[0].color);
 const tint=(offset,light)=>`hsl(${(tone.h+offset+360)%360} ${Math.min(84,tone.s+4)}% ${light}%)`;
 const family=BASIC_COLORS.findIndex(c=>c[1]===colors[0].color);
 // Main hue stays dominant; related hues supply local light and reflections.
 const companions=[['#ffc996','#c7a4ed'],['#ffbf84','#ec9ec6'],['#74e0e5','#aaa7ef'],['#e5ec67','#81ceab'],['#eea6d4','#9cbce8'],['#f4ae60','#efb2ca']][Math.max(0,family)];
 if(colors.filter(c=>c.weight>0).length>1){companions[0]=colors[1].color;companions[1]=(colors[2]||colors[1]).color;}
 const pearl=`hsl(${(tone.h+48)%360} 52% 88%)`;
 const luminousTone=`hsl(${tone.h} ${Math.min(78,Math.max(34,tone.s))}% 72%)`;
 let paints=`<linearGradient id="${id}-tonal-edge" gradientUnits="userSpaceOnUse" x1="-210" y1="180" x2="200" y2="-180"><stop stop-color="${companions[0]}"/><stop offset=".35" stop-color="${colors[0].color}"/><stop offset=".75" stop-color="${colors[0].color}"/><stop offset="1" stop-color="${companions[1]}"/></linearGradient>`;
 for(let layer=0;layer<3;layer++){
  const warm=(h,l)=>`hsl(${h} ${52+p.saturation*.2}% ${l}%)`;
  let stops='';
  if(layer===0){stops=`<stop stop-color="hsl(15 ${48+52*sense}% ${71-17*sense+3}%)"/><stop offset=".48" stop-color="hsl(23 ${48+52*sense}% 73%)"/><stop offset="1" stop-color="hsl(33 ${48+52*sense}% 91%)"/>`;}
  else {stops=colorStops(s,sense,layer,(s.colorMode||'petal')==='petal'||aurora);}

  paints+=aurora&&layer>0
   ? `<linearGradient id="${id}-paint-${layer}" x1="8%" y1="86%" x2="92%" y2="10%">${stops}</linearGradient>`
   : layer===0||(s.colorMode||'petal')==='petal'
   ? `<radialGradient id="${id}-paint-${layer}" cx="42%" cy="42%" r="64%" fx="38%" fy="38%">${stops}</radialGradient>`
   : `<radialGradient id="${id}-paint-${layer}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${p.radius}" fx="0" fy="0">${stops}</radialGradient>`;
 }
 if(aurora){
  const lightColor=c=>{const h=hexHsl(c.color);return `hsl(${h.h} ${Math.min(100,h.s*(.8+.25*sense))}% ${Math.max(65,h.l)}%)`};
  const accent=colors[1],main=colors[0],third=colors[2]||colors[1];
  // Broad off-center light fields, rendered inside each original petal silhouette.
  // Alpha falls continuously to zero; no colored disk, black shadow, or blend mode.
  paints+=`<radialGradient id="${id}-aurora-cool" cx="78%" cy="18%" r="102%"><stop stop-color="${lightColor(accent)}" stop-opacity="${Math.min(.75,accent.weight*.026)}"/><stop offset=".5" stop-color="${lightColor(accent)}" stop-opacity="${Math.min(.42,accent.weight*.012)}"/><stop offset="1" stop-color="${lightColor(accent)}" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}-aurora-main" cx="16%" cy="72%" r="100%"><stop stop-color="${lightColor(main)}" stop-opacity="${Math.min(.58,main.weight*.0074)}"/><stop offset=".55" stop-color="${lightColor(main)}" stop-opacity="${Math.min(.22,main.weight*.0028)}"/><stop offset="1" stop-color="${lightColor(main)}" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}-aurora-third" cx="28%" cy="6%" r="95%"><stop stop-color="${lightColor(third)}" stop-opacity="${colors.length===3?Math.min(.45,third.weight*.028):0}"/><stop offset="1" stop-color="${lightColor(third)}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}-aurora-sheen" x1="5%" y1="15%" x2="90%" y2="100%"><stop stop-color="#fff8ef" stop-opacity=".36"/><stop offset=".48" stop-color="#fff8ef" stop-opacity=".08"/><stop offset="1" stop-color="#fff8ef" stop-opacity="0"/></linearGradient>`;
 }
 let core='',radial='',contour='',radialExtent=1; const ornamentPolygons=[];
 // Every loop has a shared root. Relation controls crossing, never detachment.
 // Narrative changes the fold of intact closed paths, never trims a stroke.
 const relation=smooth(p.connection),d=p.density,c=p.bend,R=p.radius,opening=smooth(p.opening);
 for(let layer=0;layer<3;layer++){
  const fill=mono?'none':`url(#${id}-paint-${layer})`;
  const alpha=1; // No layer appears or disappears with immersion.
  const scale=1;
  let cells='';
  for(let k=0;k<n;k++){
   const a=phase+k*step+layer*step*.08;
   let cell='';
   for(let j=0;j<1;j++){
    const q=layer/2;
    const fn=t=>{
      const u=(1+Math.cos(t))/2;
      const corner=Math.cos(Math.PI/6)/Math.cos(((t+Math.PI/6)%(TAU/6)+TAU/6)%(TAU/6)-Math.PI/6);
      const organic=1+.12*Math.cos(3*t+q*.6);
      const pulse=1-.22*p.rhythm*(1-Math.cos(6*t))/2;
      const shape=mix(corner,organic,c)*pulse;
      // Fixed inner and outer extents; only distribution of the 3 loops changes.
      const length=R*scale*(.18+.77*Math.pow(q,mix(.45,2.8,d)));
      let x=length*u*shape;
      // A common root (t=pi) keeps all loops part of one flower at relation=0.
      // Increasing connection carries the loop across its neighboring sectors.
      const breadth=step*(.22+.25*opening+.46*relation);
      let y=length*Math.sin(t)*breadth*(.38+.30*q)*(.85+.15*mix(corner,organic,c))*pulse;
      // Redistribute the intact loop radially: an outward field vs inward pull.
      const radialFraction=Math.hypot(x,y)/(length*mix(Math.cos(Math.PI/6),1+.12*Math.cos(q*.6),c));
      const focus=Math.pow(Math.max(.025,radialFraction),mix(-.35,.65,d));
      x*=focus;y*=focus;
      const fold=(1-opening)*1.35*(1-u);
      const weave=relation*(q-.5)*step*1.3+relation*.32*Math.sin(2*t);
      const angle=a+fold+weave;
      return [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)];
    };
    if(layer===2)ornamentPolygons.push(Array.from({length:96},(_,i)=>fn(i*TAU/96)));
    if(layer===1)for(let sample=0;sample<96;sample++)radialExtent=Math.max(radialExtent,Math.hypot(...fn(sample*TAU/96)));
    const pathId=`${id}-petal-${layer}-${k}-${j}`;
    cell+=`<g fill="${fill}"><path id="${pathId}" data-cell="${j+1}" d="${curve(fn)}" opacity="1"/></g>`;
    if(aurora&&!mono&&layer>0&&!(layer===2&&s.glow>0))cell+=`<g id="${pathId}-light" data-finish="aurora-light" stroke="none" opacity="${(.6+.4*(s.surface??1))*(layer===1?.35:1)}"><use href="#${pathId}" fill="url(#${id}-aurora-main)"/><use href="#${pathId}" fill="url(#${id}-aurora-cool)"/><use href="#${pathId}" fill="url(#${id}-aurora-third)"/><use href="#${pathId}" fill="url(#${id}-aurora-sheen)"/></g>`;

   }
   cells+=`<g id="${id}-layer-${layer}-cluster-${k}" data-cluster="${k}"${layer===2&&!mono&&s.glow>0?` filter="url(#${id}-membrane)"`:''} opacity="${f(alpha)}">${cell}</g>`;
  }
  if(layer===0)core+=cells;else if(layer===1)radial+=cells;else contour+=cells;
 }
 // A single flower-centered dot screen only reveals the existing Radial paint.
 // The square lattice mirrors the reference: large near-touching dots at the
 // center shrink outwards, widening the visible gaps without recoloring pixels.
 const screenRadius=radialExtent*1.16,pitch=screenRadius/14;
 let dots='';
 for(let row=-14;row<=14;row++)for(let column=-14;column<=14;column++){
  const x=column*pitch,y=row*pitch,t=Math.hypot(x,y)/screenRadius;
  if(t>=1)continue;
  const radius=pitch*.98*Math.pow(1-t,.72);
  if(radius>.035){const softness=Math.max(0,(t-.25)/.75);const blur=softness**1.35*pitch*.36;const dotId=`${id}-dot-${row+14}-${column+14}`;if(blur>.03)paints+=`<filter id="${dotId}" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="${f(blur)}"/></filter>`;dots+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(radius)}"${blur>.03?` filter="url(#${dotId})"`:''}/>`;}
 }
 paints+=`<mask id="${id}-radial-halftone" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="-300" y="-300" width="600" height="600" style="mask-type:alpha"><g fill="white" stroke="none">${dots}</g></mask>`;
 const luminous=!mono&&s.glow>0;
 const strength=Math.min(1,s.glow/2.5),bloom=18+s.glow*9;
 // Union silhouette carries the light membrane; a faint independent wash suggests petals.
 // Original paths and the Radial mask stay intact.
 paints+=`<filter id="${id}-membrane" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="surfaceAlpha"/><feFlood flood-color="#ffffff"/><feComposite in2="surfaceAlpha" operator="in" result="whiteSurface"/><feGaussianBlur in="SourceAlpha" stdDeviation="48" result="inward"/><feComposite in="SourceAlpha" in2="inward" operator="arithmetic" k2="1.95" k3="-1.95" result="edge"/><feGaussianBlur in="edge" stdDeviation="6" result="softEdge"/><feComposite in="SourceGraphic" in2="softEdge" operator="in" result="coloredEdge"/><feMerge><feMergeNode in="whiteSurface"/><feMergeNode in="coloredEdge"/></feMerge></filter>
 <filter id="${id}-color-bloom" x="-55%" y="-55%" width="210%" height="210%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${bloom}" result="wide"/><feFlood flood-color="${companions[1]}" flood-opacity="${strength*.85}"/><feComposite in2="wide" operator="in" result="aura"/><feGaussianBlur in="SourceAlpha" stdDeviation="${bloom*.32}" result="near"/><feFlood flood-color="${luminousTone}" flood-opacity="${strength*.78}"/><feComposite in2="near" operator="in" result="nearColor"/><feMerge><feMergeNode in="aura"/><feMergeNode in="nearColor"/></feMerge></filter>`;
 // White transition behind Radial, clipped to the outer petals. No dot-mask edits.
 const contactPaths=Array.from({length:n},(_,k)=>`<use href="#${id}-petal-1-${k}-0"/>`).join('');
 const outerPaths=Array.from({length:n},(_,k)=>`<use href="#${id}-petal-2-${k}-0"/>`).join('');
 paints+=`<clipPath id="${id}-contact-clip" clipPathUnits="userSpaceOnUse">${outerPaths}</clipPath><filter id="${id}-contact-soft" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="25" result="contactAlpha"/><feFlood flood-color="#ffffff"/><feComposite in2="contactAlpha" operator="in"/></filter>`;
 const contact=!mono&&s.modules.radial&&s.modules.contour?`<g id="${id}-contact-white" data-finish="radial-contact-diffuse" opacity="1" clip-path="url(#${id}-contact-clip)" fill="#ffffff" stroke="none"><g filter="url(#${id}-contact-soft)">${contactPaths}</g></g>`:'';
 paints+=`<filter id="${id}-petal-seam-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.8"/></filter><radialGradient id="${id}-whisper-fade" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="240"><stop offset="0" stop-color="black"/><stop offset=".25" stop-color="black"/><stop offset=".6" stop-color="white"/><stop offset="1" stop-color="white"/></radialGradient><mask id="${id}-whisper-mask" x="-300" y="-300" width="600" height="600" maskUnits="userSpaceOnUse"><rect x="-300" y="-300" width="600" height="600" fill="url(#${id}-whisper-fade)"/></mask>`;
 // Trace the original petal boundaries softly, without adding a filled color patch.
 const whisper=luminous&&s.modules.contour?`<g data-finish="faint-petal-boundaries" opacity=".18" fill="none" stroke="${colors[0].color}" stroke-width="4" mask="url(#${id}-whisper-mask)" clip-path="url(#${id}-contact-clip)">${Array.from({length:n},(_,k)=>`<use href="#${id}-petal-2-${k}-0" fill="none" filter="url(#${id}-petal-seam-soft)"/>`).join('')}</g>`:'';
 // Seeded, spatially separated particles fill the flower instead of a regular ring.
 let particleSeed=(Number(s.seed)^0x51f15e)>>>0;
 const particleRandom=()=>{particleSeed=(Math.imul(particleSeed,1664525)+1013904223)>>>0;return particleSeed/4294967296};
 const insidePolygon=([x,y],poly)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;};
 const particles=[];
 // Uneven random pockets and open space, never an evenly spaced dot pattern.
 const pockets=Array.from({length:4},()=>{const a=particleRandom()*TAU,r=R*(.3+.42*particleRandom());return [Math.cos(a)*r,Math.sin(a)*r]});
 for(let i=0;i<36;i++){for(let attempt=0;attempt<120;attempt++){const pocket=pockets[Math.floor(particleRandom()*pockets.length)],a=particleRandom()*TAU,r=R*.24*Math.sqrt(particleRandom());const candidate=particleRandom()<.72?[pocket[0]+Math.cos(a)*r,pocket[1]+Math.sin(a)*r]:[Math.cos(a)*R*.87*Math.sqrt(particleRandom()),Math.sin(a)*R*.87*Math.sqrt(particleRandom())];if(Math.hypot(...candidate)<42||!ornamentPolygons.some(poly=>insidePolygon(candidate,poly))||particles.some(p=>Math.hypot(candidate[0]-p[0],candidate[1]-p[1])<5))continue;particles.push(candidate);break;}}
 const ornamentCount=12+24*d;
 const particleMarkup=particles.map((a,i)=>{const visibility=smooth(Math.max(0,Math.min(1,ornamentCount-i)));const radius=1.1+Math.pow(particleRandom(),2)*3.4;const alpha=.3+.55*particleRandom();return `<circle data-ornament="${i+1}" cx="${f(a[0])}" cy="${f(a[1])}" r="${f(radius)}" opacity="${f(visibility*alpha)}"/>`;}).join('');
 paints+=`<clipPath id="${id}-ornament-clip" clipPathUnits="userSpaceOnUse">${contactPaths}</clipPath><g id="${id}-particle-shapes">${particleMarkup}</g>`;
 const ornaments=!mono&&s.modules.radial?`<g id="${id}-radial-ornaments" data-finish="scattered-flat-particles" stroke="none" clip-path="url(#${id}-contact-clip)"><use href="#${id}-particle-shapes" fill="${colors[0].color}"/><g clip-path="url(#${id}-ornament-clip)"><use href="#${id}-particle-shapes" fill="#ffffff"/></g></g>`:'';
 // Reference palettes: a broad pastel color cloud surrounding one luminous source.

 paints+=`<radialGradient id="${id}-color-cloud" gradientUnits="userSpaceOnUse" cx="-15" cy="-8" r="245"><stop stop-color="#ffffff" stop-opacity=".06"/><stop offset=".36" stop-color="${colors[0].color}" stop-opacity=".45"/><stop offset=".78" stop-color="${colors[0].color}" stop-opacity=".8"/><stop offset="1" stop-color="${colors[0].color}" stop-opacity=".15"/></radialGradient><radialGradient id="${id}-neighbor-warm"><stop stop-color="${companions[0]}" stop-opacity=".8"/><stop offset=".42" stop-color="${companions[0]}" stop-opacity=".4"/><stop offset="1" stop-color="${companions[0]}" stop-opacity="0"/></radialGradient><radialGradient id="${id}-neighbor-cool"><stop stop-color="${companions[1]}" stop-opacity=".7"/><stop offset=".45" stop-color="${companions[1]}" stop-opacity=".25"/><stop offset="1" stop-color="${companions[1]}" stop-opacity="0"/></radialGradient><radialGradient id="${id}-source-halo"><stop stop-color="#fffef1" stop-opacity=".95"/><stop offset=".16" stop-color="#fff7d7" stop-opacity=".8"/><stop offset=".5" stop-color="${companions[0]}" stop-opacity=".4"/><stop offset="1" stop-color="${colors[0].color}" stop-opacity="0"/></radialGradient><radialGradient id="${id}-source-ray"><stop stop-color="#ffffff"/><stop offset=".18" stop-color="#fffce8" stop-opacity=".95"/><stop offset="1" stop-color="#fff9e6" stop-opacity="0"/></radialGradient><filter id="${id}-source-soft" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.3"/></filter>`;
 const cloud=!mono&&s.modules.contour?`<g data-finish="pastel-color-cloud" clip-path="url(#${id}-contact-clip)" stroke="none"><circle r="280" fill="url(#${id}-color-cloud)" opacity=".7"/><ellipse cx="-95" cy="-85" rx="160" ry="130" fill="url(#${id}-neighbor-warm)"/><ellipse cx="110" cy="65" rx="145" ry="185" fill="url(#${id}-neighbor-cool)"/><ellipse cx="-35" cy="150" rx="115" ry="90" fill="url(#${id}-neighbor-warm)" opacity=".45"/></g>`:'';
 const sparkle=(x,y,r,opacity)=>`<g transform="translate(${x} ${y})" opacity="${opacity}" fill="url(#${id}-source-ray)" stroke="none"><ellipse rx="${r*.15}" ry="${r}"/><ellipse rx="${r}" ry="${r*.15}"/><circle r="${r*.12}" fill="#fffef7"/></g>`;
 if(!mono){core=`<g data-finish="single-light-source" stroke="none"><circle r="92" fill="url(#${id}-source-halo)"/>${Array.from({length:8},(_,i)=>`<ellipse rx="${i%2?1.2:2.3}" ry="${i%2?34:52}" transform="rotate(${i*22.5})" fill="url(#${id}-source-ray)"/>`).join('')}<circle r="11" fill="#fff6d8" opacity=".75" filter="url(#${id}-source-soft)"/><circle r="5.5" fill="#fffffa"/></g>`;}
 const filaments=!mono&&s.modules.contour?`<g data-finish="petal-light-filaments" fill="none" stroke="#ffffff" stroke-width=".65" opacity=".24" clip-path="url(#${id}-contact-clip)" mask="url(#${id}-whisper-mask)">${Array.from({length:n},(_,k)=>`<use href="#${id}-petal-2-${k}-0" transform="scale(.965)"/>`).join('')}</g>`:'';
 const satellites=!mono&&s.modules.core?`<g id="${id}-satellite-sparkles" data-finish="satellite-sparkles">${sparkle(-73,-55,10,.72)}${sparkle(89,18,14,.58)}${sparkle(48,86,7,.62)}${sparkle(-112,38,5,.45)}</g>`:'';
 const body=`<g id="${id}-geometry" transform="translate(300 300)" fill="none" stroke="${stroke}" stroke-width="${mono?1.1:s.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${s.opacity}">${[['contour',contour],['radial',radial],['core',core]].map(([name,markup])=>`${name==='radial'?cloud+whisper+filaments+contact:name==='core'?ornaments+satellites:''}<g id="${id}-${name}" data-module="${name}"${name==='radial'?` opacity=".62" mask="url(#${id}-radial-halftone)"`:''} stroke="${name==='core'&&!mono?col(38,76):stroke}" style="display:${s.modules[name]?'inline':'none'}">${markup}</g>`).join('')}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 600 600" role="img" aria-label="GAMDO 추상 취향 꽃"><title>GAMDO · ${s.axes.join(' / ')}</title><metadata>${JSON.stringify({grammar:'gamdo-20',...s})}</metadata><defs>${paints}<linearGradient id="${id}-ink" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${col(paletteHue+12,p.lightness+5)}"/><stop offset=".48" stop-color="${col(paletteHue,p.lightness)}"/><stop offset="1" stop-color="${col(paletteHue-12,p.lightness+3)}"/></linearGradient><radialGradient id="${id}-wash"><stop stop-color="${col(s.hue+38,80)}" stop-opacity="0"/><stop offset=".7" stop-color="${col(s.hue,66)}" stop-opacity=".045"/><stop offset="1" stop-color="${col(s.hue-38,74)}" stop-opacity=".22"/></radialGradient><filter id="${id}-blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${s.glow}"/></filter></defs>${luminous&&s.modules.contour?`<g id="${id}-glow" data-finish="colored-bloom" transform="translate(300 300)" filter="url(#${id}-color-bloom)"><use href="#${id}-contour"/></g>`:''}${body}</svg>`;
}
