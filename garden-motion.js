export const AUTO_PANEL_MS=90000,PANEL_HOLD_MS=30000;
// Slow velocities in pixels/second; taste and graphics never enter this simulation.
export function stepGarden(points,width,height,dt,fixed=-1){
 const cells=new Map(),cell=180;
 points.forEach((p,i)=>{p.homeX??=p.x;p.homeY??=p.y;p.vx??=Math.cos(i*2.4+1)*12;p.vy??=Math.sin(i*1.7+.5)*10;const key=Math.floor(p.x/cell)+','+Math.floor(p.y/cell);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i)});
 points.forEach((p,i)=>{if(i===fixed)return;const cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell);for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++)for(const j of cells.get(x+','+y)||[]){if(j<=i)continue;const q=points[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1,reach=(p.size+q.size)*.29;if(d<reach){const force=(1-d/reach)*7*dt;p.vx+=dx/d*force;p.vy+=dy/d*force;if(j!==fixed){q.vx-=dx/d*force;q.vy-=dy/d*force}}}
 // A gentle return toward each starting position keeps the middle populated.
 p.driftTime=(p.driftTime||0)+dt;
 p.vx+=(Math.cos(p.driftTime*.16+i*2.4)*2.2+(p.homeX-p.x)*.001)*dt;
 p.vy+=(Math.sin(p.driftTime*.19+i*1.7+.5)*2.2+(p.homeY-p.y)*.001)*dt;
 p.vx*=Math.exp(-.08*dt);p.vy*=Math.exp(-.10*dt);
 const speed=Math.hypot(p.vx,p.vy);if(speed>13){p.vx*=13/speed;p.vy*=13/speed}p.x+=p.vx*dt;p.y+=p.vy*dt;
 const r=p.size*.3,left=r+12,right=Math.max(left,width-r-12),top=r+20,bottom=Math.max(top,height-r-20);
 if(p.x<left){p.x=left;p.vx=Math.abs(p.vx)}if(p.x>right){p.x=right;p.vx=-Math.abs(p.vx)}if(p.y<top){p.y=top;p.vy=Math.abs(p.vy)}if(p.y>bottom){p.y=bottom;p.vy=-Math.abs(p.vy)}
 });
}
