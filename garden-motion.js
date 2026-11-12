export const AUTO_PANEL_MS=90000,PANEL_HOLD_MS=30000;
// A shared horizontal stream. Height is a display slot, never an edge-seeking force.
export function stepGarden(points,width,height,dt,fixed=-1){
 if(!points.length||!Number.isFinite(dt)||dt<=0)return;
 dt=Math.min(dt,.05);
 const margin=Math.max(150,...points.map(p=>p.size*.7+32));
 const span=width+margin*2,speed=Math.max(9,Math.min(18,width*.009));
 points.forEach((p,i)=>{
  if(i===fixed)return;
  p.flowHomeY??=p.y;
  p.x-=speed*dt;
  if(p.x< -margin||p.x>width+margin)p.x=((p.x+margin)%span+span)%span-margin;
  p.y=p.flowHomeY;
 });
}
