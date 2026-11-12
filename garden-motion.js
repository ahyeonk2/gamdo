export const AUTO_PANEL_MS=6000,PANEL_HOLD_MS=30000;
// Free drift on a looping field: no edge forces, bouncing, or vertical home slots.
export function stepGarden(points,width,height,dt,fixed=-1){
 if(!points.length||!Number.isFinite(dt)||dt<=0)return;
 dt=Math.min(dt,.05);
 for(let i=0;i<points.length;i++){
  if(i===fixed)continue;
  const p=points[i],phase=p.flowPhase??p.phase??(i+1)*2.3999632297;
  p.flowTime=(p.flowTime||0)+dt;
  const time=p.flowTime,period=p.flowPeriod||48;
  const heading=phase+Math.sin(time*2*Math.PI/period+phase)*.48+Math.sin(time*.027+phase*1.3)*.22;
  const speed=(Math.max(5,Math.min(13,p.speed||9))+2)*.82*(.93+.07*Math.sin(time*.08+phase));
  p.x+=Math.cos(heading)*speed*dt;p.y+=Math.sin(heading)*speed*dt;
  // Re-enter only after the entire flower and its glow have left the screen.
  const margin=p.size*.7+32,spanX=width+2*margin,spanY=height+2*margin;
  if(p.x< -margin||p.x>width+margin)p.x=((p.x+margin)%spanX+spanX)%spanX-margin;
  if(p.y< -margin||p.y>height+margin)p.y=((p.y+margin)%spanY+spanY)%spanY-margin;
 }
}
