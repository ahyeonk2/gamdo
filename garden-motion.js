export const AUTO_PANEL_MS=90000,PANEL_HOLD_MS=30000;
// Carry a spacious field across the viewport. Wrap only beyond the screen.
export function stepGarden(points,width,height,dt,fixed=-1){
 points.forEach((p,i)=>{
  if(i===fixed)return;
  p.driftTime=(p.driftTime||0)+dt;
  // Small individual variations preserve space between neighboring flowers.
  p.x+=(20+Math.sin(p.driftTime*.18+i*1.7)*2)*dt;
  p.y+=(12+Math.cos(p.driftTime*.16+i*2.4)*2)*dt;
  const left=p.fieldLeft??-width*.25,top=p.fieldTop??-height*.4;
  const fieldWidth=p.fieldWidth??width*1.5,fieldHeight=p.fieldHeight??height*1.6;
  if(p.x>left+fieldWidth)p.x-=fieldWidth;
  if(p.x<left)p.x+=fieldWidth;
  if(p.y>top+fieldHeight)p.y-=fieldHeight;
  if(p.y<top)p.y+=fieldHeight;
 });
}
