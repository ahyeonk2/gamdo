export const AUTO_PANEL_MS=90000,PANEL_HOLD_MS=30000;
// Independent slow currents, integrated in seconds. No home positions or row anchors.
export function stepGarden(points,width,height,dt,fixed=-1){
 if(!Number.isFinite(dt)||dt<=0||!points.length)return;
 dt=Math.min(dt,.05);
 const cell=Math.max(180,...points.map(p=>p.size*.7)),cells=new Map();
 points.forEach((p,i)=>{
  p.flowPhase??=p.phase??((i+1)*2.3999632297);
  p.flowPeriod??=36+(i*13%43);p.speed??=5+(i*7%9);
  p.flowTime??=0;p.vx??=Math.cos(p.flowPhase)*p.speed;p.vy??=Math.sin(p.flowPhase)*p.speed;
  const key=Math.floor(p.x/cell)+','+Math.floor(p.y/cell);
  if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i);
 });
 const forces=points.map(()=>({x:0,y:0}));
 points.forEach((p,i)=>{
  const cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell);
  for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++)for(const j of cells.get(x+','+y)||[]){
   if(j<=i)continue;
   const q=points[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy),reach=(p.size+q.size)*.30+10;
   if(d>=reach)continue;
   const angle=p.flowPhase+j*2.4,nx=d>.001?dx/d:Math.cos(angle),ny=d>.001?dy/d:Math.sin(angle),push=(1-d/reach)*24;
   forces[i].x+=nx*push;forces[i].y+=ny*push;forces[j].x-=nx*push;forces[j].y-=ny*push;
  }
 });
 points.forEach((p,i)=>{
  if(i===fixed)return;
  p.flowTime+=dt;
  const t=p.flowTime,phase=p.flowPhase;
  const angle=phase+Math.sin(t*2*Math.PI/p.flowPeriod+phase)*1.35+Math.sin(t*.071+phase*1.7)*.55;
  const speed=p.speed*(.86+.14*Math.sin(t*.11+phase));
  const follow=1-Math.exp(-.22*dt);
  p.vx+=(Math.cos(angle)*speed-p.vx)*follow+forces[i].x*dt;
  p.vy+=(Math.sin(angle)*speed-p.vy)*follow+forces[i].y*dt;
  // Turn through the edge gradually, with room for a few silhouettes to pass out of view.
  const inset=Math.max(30,p.size*.16),turn=22;
  p.vx+=(Math.max(0,inset-p.x)/100-Math.max(0,p.x-width+inset)/100)*turn*dt;
  p.vy+=(Math.max(0,inset-p.y)/100-Math.max(0,p.y-height+inset)/100)*turn*dt;
  const length=Math.hypot(p.vx,p.vy),cap=16;if(length>cap){p.vx*=cap/length;p.vy*=cap/length;}
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  const margin=p.size*.4+40;
  if(p.x< -margin){p.x=-margin;p.vx=Math.abs(p.vx);}if(p.x>width+margin){p.x=width+margin;p.vx=-Math.abs(p.vx);}
  if(p.y< -margin){p.y=-margin;p.vy=Math.abs(p.vy);}if(p.y>height+margin){p.y=height+margin;p.vy=-Math.abs(p.vy);}
 });
}
