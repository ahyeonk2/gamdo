// Display-only randomness: movie taste and the generated vector never change.
export function scatterGarden(records,width,height,seed,{projection=false}={}){
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const count=records.length;
 const worldWidth=projection?width:Math.max(width,Math.ceil(count/4)*Math.min(width,1100)*.34);
 if(!count)return {worldWidth,locations:[]};
 const usableHeight=Math.max(120,height-(projection?0:140));
 const base=Math.min(370,width*.29,height*.48,Math.sqrt(worldWidth*usableHeight/count)*1.1);
 const maxSize=Math.min(420,width*.36,height*.57);
 // Shuffle a continuous range of scales; no repeating size or column rhythm.
 const ranks=records.map((_,i)=>(i+random())/count);
 for(let i=count-1;i>0;i--){const j=Math.floor(random()*(i+1));[ranks[i],ranks[j]]=[ranks[j],ranks[i]];}
 const sizes=ranks.map(u=>Math.min(maxSize,Math.max(Math.min(52,maxSize),base*(.28+1.10*Math.pow(u,1.35)))));
 if(count===1)sizes[0]=Math.min(maxSize,base);
 const order=records.map((_,i)=>i).sort((a,b)=>sizes[b]-sizes[a]);
 const locations=new Array(count),placed=[];
 const patches=Array.from({length:Math.min(4,Math.max(2,Math.ceil(count/9)))},()=>({x:worldWidth*(.15+random()*.7),y:height*(.18+random()*.64)}));
 const normal=()=>Math.sqrt(-2*Math.log(Math.max(.000001,random())))*Math.cos(2*Math.PI*random());
 for(const i of order){
  const size=sizes[i],radius=size*.30;
  const left=projection?-worldWidth*.035+radius:radius+20;
  const right=Math.max(left,worldWidth*(projection?1.035:1)-radius-(projection?0:20));
  const top=projection?-height*.025+radius:70+radius;
  const bottom=Math.max(top,height*(projection?1.025:1)-radius-(projection?0:70));
  let best=null,bestScore=Infinity;
  for(let attempt=0;attempt<220;attempt++){
   const patch=patches[Math.floor(random()*patches.length)],clustered=random()<.36;
   const x=clustered?Math.max(left,Math.min(right,patch.x+normal()*worldWidth*.19)):left+random()*(right-left);
   const y=clustered?Math.max(top,Math.min(bottom,patch.y+normal()*height*.21)):top+random()*(bottom-top);
   let overlap=0;
   for(const p of placed){const d=Math.hypot(x-p.x,y-p.y),reach=radius+p.radius+8;overlap+=Math.max(0,reach-d)**2;}
   // Accept natural gaps rather than optimizing everyone to the same distance.
   const score=overlap+random()*30;
   if(score<bestScore){bestScore=score;best={x,y,size,radius};}
   if(overlap===0)break;
  }
  placed.push(best);
  locations[i]={x:best.x,y:best.y,size,phase:random()*Math.PI*2,period:17+random()*17,dx:4+random()*11,dy:4+random()*12,rotation:.7+random()*1.8,sign:random()<.5?-1:1,flowPhase:random()*Math.PI*2,flowPeriod:32+random()*47,speed:5+random()*8};
 }
 return {worldWidth,locations};
}
