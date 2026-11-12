export const AUTO_PANEL_MS=6000,PANEL_HOLD_MS=30000;
const reach=(a,b)=>(a.size+b.size)*.40+12;
function redirect(point){if(point.centerRoute)point.routePauseUntil=(point.flowTime||0)+1.5;if(Math.hypot(point.vx||0,point.vy||0)>.1)point.driftHeading=Math.atan2(point.vy,point.vx)-(point.flowSway||0);}
// Solve only flower-to-flower contacts. There are no walls or forces toward a corner.
export function separateFlowers(points,{fixed=-1,iterations=6,bounce=false}={}){
 if(points.length<2)return;
 const cell=Math.max(180,...points.map(p=>p.size*.8+12));
 for(let pass=0;pass<iterations;pass++){
  const cells=new Map();let contacts=0;
  points.forEach((p,i)=>{const key=Math.floor(p.x/cell)+','+Math.floor(p.y/cell);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i);});
  points.forEach((p,i)=>{
   const cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell);
   for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++)for(const j of cells.get(x+','+y)||[]){
    if(j<=i)continue;const q=points[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy),minimum=reach(p,q);
    if(d>=minimum)continue;contacts++;
    const angle=(i+1)*.87+(j+1)*2.399963,nx=d>.001?dx/d:Math.cos(angle),ny=d>.001?dy/d:Math.sin(angle);
    const a=i===fixed?0:1/(p.size*p.size),b=j===fixed?0:1/(q.size*q.size),sum=a+b;if(!sum)continue;
    const overlap=minimum-d+.05;
    p.x+=nx*overlap*a/sum;p.y+=ny*overlap*a/sum;q.x-=nx*overlap*b/sum;q.y-=ny*overlap*b/sum;
    if(bounce){
     const relative=((i===fixed?0:(p.vx||0))-(j===fixed?0:(q.vx||0)))*nx+((i===fixed?0:(p.vy||0))-(j===fixed?0:(q.vy||0)))*ny;
     if(relative<-.05){const impulse=-(1+.55)*relative/sum;
      if(a){p.vx+=nx*impulse*a;p.vy+=ny*impulse*a;redirect(p);}
      if(b){q.vx-=nx*impulse*b;q.vy-=ny*impulse*b;redirect(q);}
     }
    }
   }
  });
  if(!contacts)break;
 }
}
function wrap(point,width,height){const margin=point.size*.7+32,spanX=width+2*margin,spanY=height+2*margin;if(point.x< -margin||point.x>width+margin)point.x=((point.x+margin)%spanX+spanX)%spanX-margin;if(point.y< -margin||point.y>height+margin)point.y=((point.y+margin)%spanY+spanY)%spanY-margin;}
export function stepGarden(points,width,height,dt,fixed=-1,minimumVisible=0){
 if(!points.length||!Number.isFinite(dt)||dt<=0)return;let remaining=Math.min(dt,.05);
 while(remaining>1e-8){const slice=Math.min(1/120,remaining);if(minimumVisible)ensureVisibleFlowers(points,width,height,minimumVisible,fixed);advanceGarden(points,width,height,slice,fixed);remaining-=slice;}
}
// Route a rotating minority through different points in the middle, then release them.
function maintainCoverage(points,width,height,fixed){
 const inside=p=>p.x>width*.23&&p.x<width*.77&&p.y>height*.20&&p.y<height*.80;
 for(const p of points)if(p.centerRoute&&Math.hypot(p.x-p.centerRoute.x,p.y-p.centerRoute.y)<Math.max(45,p.size*.12)){
  p.centerRoute=null;p.driftHeading=Math.atan2(p.vy||0,p.vx||1)-(p.flowSway||0);
 }
 const quota=Math.min(points.length,Math.max(2,Math.ceil(points.length*.26)));
 let missing=quota-points.filter(inside).length-points.filter(p=>p.centerRoute&&!inside(p)).length;
 if(missing<=0)return;
 const candidates=points.map((p,index)=>({p,index,d:Math.hypot((p.x-width/2)/width,(p.y-height/2)/height)})).filter(({p,index})=>index!==fixed&&!inside(p)&&!p.centerRoute).sort((a,b)=>a.d-b.d);
 const fraction=n=>{const v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v);};
 for(const {p,index}of candidates){if(missing--<=0)break;p.centerRoute={x:width*(.32+fraction(index+1)*.36),y:height*(.27+fraction(index+31)*.46)};}
}
function advanceGarden(points,width,height,dt,fixed){
 points.forEach((p,i)=>{if(i!==fixed)wrap(p,width,height);});
 maintainCoverage(points,width,height,fixed);
 points.forEach((p,i)=>{
  if(i===fixed)return;
  const phase=p.flowPhase??p.phase??(i+1)*2.3999632297;p.flowTime=(p.flowTime||0)+dt;
  const time=p.flowTime,period=p.flowPeriod||48;
  p.flowSway=Math.sin(time*2*Math.PI/period+phase)*.48+Math.sin(time*.027+phase*1.3)*.22;
  const heading=p.centerRoute&&time>=(p.routePauseUntil||0)?Math.atan2(p.centerRoute.y-p.y,p.centerRoute.x-p.x):(p.driftHeading??phase)+p.flowSway,speed=(Math.max(5,Math.min(13,p.speed||9))+2)*.82*(.93+.07*Math.sin(time*.08+phase));
  const targetX=Math.cos(heading)*speed,targetY=Math.sin(heading)*speed;
  p.vx??=targetX;p.vy??=targetY;const steer=1-Math.exp(-1.6*dt);
  p.vx+=(targetX-p.vx)*steer;p.vy+=(targetY-p.vy)*steer;
  p.x+=p.vx*dt;p.y+=p.vy*dt;wrap(p,width,height);
 });
 separateFlowers(points,{fixed,iterations:6,bounce:true});
 points.forEach((p,i)=>{if(i===fixed)return;const speed=Math.hypot(p.vx,p.vy);if(speed>20){p.vx*=20/speed;p.vy*=20/speed;}wrap(p,width,height);});
}

// Reserve enough inward routes before flowers reach an edge. Never relocate a live flower.
export function ensureVisibleFlowers(points,width,height,minimum=15,fixed=-1){
 const safe=p=>{const m=Math.min(p.size*.22,Math.min(width,height)*.12)+70;return p.x>m&&p.x<width-m&&p.y>m&&p.y<height-m;};
 const desired=Math.min(points.length,minimum+5);
 const ranked=points.map((p,i)=>({p,i,d:Math.hypot((p.x-width/2)/width,(p.y-height/2)/height)})).sort((a,b)=>a.d-b.d);
 let reserved=0;
 for(const {p,i}of ranked){
  if(i===fixed){reserved++;continue;}
  if(reserved>=desired)break;
  reserved++;
  if(!safe(p)){
   p.centerRoute={x:width*(.32+(i*.61803398875%1)*.36),y:height*(.27+(i*.38196601125%1)*.46)};
   // Existing velocity blends toward the route in advanceGarden, with no position snap.
  }
 }
}
