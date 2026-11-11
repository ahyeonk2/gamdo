// Display positions and sizes are independent of taste data and flower geometry.
export function scatterGarden(records,width,height,seed){
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const count=records.length,clusters=Math.max(1,Math.ceil(count/4)),worldWidth=Math.max(width,clusters*Math.min(width,1100)*.34);
 if(!count)return {worldWidth,locations:[]};
 const top=Math.max(82,height*.14),bottom=Math.max(top+60,height-Math.max(80,height*.1)),usable=bottom-top;
 const base=Math.min(width*.38,usable*.58,350,Math.sqrt(worldWidth*usable/count)*1.25);
 const sizeRhythm=[1.04,.48,.72,.38,.58,.90,.44,.66,.40,.84,.52,.70];
 const sizes=records.map((_,i)=>base*sizeRhythm[i%sizeRhythm.length]*(.95+random()*.10));
 // Place large flowers first; the smaller ones settle into their gaps.
 const order=records.map((_,i)=>i).sort((a,b)=>sizes[b]-sizes[a]);
 const locations=new Array(count),placed=[];
 for(const i of order){
  const size=sizes[i],radius=size*.33;
  const fieldWidth=Math.min(worldWidth,Math.max(1100,count*110)),inset=(worldWidth-fieldWidth)/2;
  const minX=inset+radius+20,maxX=Math.max(minX,inset+fieldWidth-radius-20),minY=top+radius,maxY=Math.max(minY,bottom-radius);
  // One continuous field: stagger heights across the whole width instead of alternating clusters.
  const xFraction=(i+.5)/count,yFraction=(i*.61803398875+.23)%1;
  const anchor={x:Math.max(minX,Math.min(maxX,minX+(maxX-minX)*xFraction+(random()-.5)*worldWidth*.035)),y:Math.max(minY,Math.min(maxY,top+usable*(.22+yFraction*.56)+(random()-.5)*usable*.04))};
  // Alternate slight tip overlaps with clear breathing room. Never cover a center.
  const targetGap=[12,22,8,28][i%4];let best=null,bestScore=Infinity;
  for(let attempt=0;attempt<(count>50?180:450);attempt++){
   const x=minX+random()*(maxX-minX),y=minY+random()*(maxY-minY);
   let nearest=Infinity,collision=0;
   for(const p of placed){const distance=Math.hypot(x-p.x,y-p.y),sum=radius+p.radius;nearest=Math.min(nearest,distance-sum);collision+=Math.max(0,sum*.84-distance)**2;}
   const score=collision*35+(placed.length?Math.abs(nearest-targetGap)*1.8:Math.hypot(x-worldWidth*.44,y-(top+usable*.48))*.6)+Math.hypot(x-anchor.x,y-anchor.y)*2.7;
   if(score<bestScore){bestScore=score;best={x,y,size,radius};}
  }
  placed.push(best);locations[i]={x:best.x,y:best.y,size,phase:random()*Math.PI*2,period:11+random()*4,dx:3+random()*2,dy:5+random()*3,rotation:1+random()*2,sign:random()>.5?1:-1};
 }
 if(count<=8){
  const left=Math.min(...placed.map(p=>p.x-p.radius)),right=Math.max(...placed.map(p=>p.x+p.radius));
  const upper=Math.min(...placed.map(p=>p.y-p.radius)),lower=Math.max(...placed.map(p=>p.y+p.radius));
  const shiftX=(worldWidth-left-right)/2,shiftY=(top+bottom-upper-lower)/2;
  locations.forEach(p=>{p.x+=shiftX;p.y+=shiftY});
 }
 // Swap display slots to separate similar full palettes, without recoloring any record.
 const colors=['pink','red','blue','green','purple','yellow'];
 const vectors=records.map(r=>{const palette=r.profile?.palette||[{mood:r.profile?.mood,weight:100}];return colors.map(c=>palette.filter(p=>p.mood===c).reduce((n,p)=>n+p.weight/100,0));});
 const similarity=(a,b)=>vectors[a].reduce((n,v,k)=>n+v*vectors[b][k],0);
 const assignment=records.map((_,i)=>i);
 const cost=()=>{let total=0;for(let a=0;a<count;a++)for(let b=a+1;b<count;b++){
  const p=locations[assignment[a]],q=locations[assignment[b]],near=Math.exp(-Math.pow(Math.hypot(p.x-q.x,p.y-q.y)/300,2));
  total+=near*similarity(a,b)*(records[a].profile?.mood===records[b].profile?.mood?2:1);
 }return total};
 const affected=(a,b)=>{let total=0;for(let k=0;k<count;k++){if(k===a||k===b)continue;for(const i of [a,b]){const p=locations[assignment[i]],q=locations[assignment[k]];total+=Math.exp(-Math.pow(Math.hypot(p.x-q.x,p.y-q.y)/300,2))*similarity(i,k)*(records[i].profile?.mood===records[k].profile?.mood?2:1)}}return total};
 for(let trial=0;trial<600&&count>1;trial++){const a=Math.floor(random()*count),b=Math.floor(random()*count);if(a===b)continue;const before=affected(a,b);
 [assignment[a],assignment[b]]=[assignment[b],assignment[a]];
 if(affected(a,b)>=before)[assignment[a],assignment[b]]=[assignment[b],assignment[a]];
 }

 return {worldWidth,locations:assignment.map(i=>locations[i])};
}
