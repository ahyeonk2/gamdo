// A small staggered batch of existing flowers; at most two live SVG blooms at once.
export function createRebloomScheduler({now=0,random=Math.random}={}){
 let nextBatch=now+6000,nextStart=0;const queue=[],history=new Map();
 return {
  reset(time=0){queue.length=0;nextBatch=time+6000;nextStart=0;},
  next(time,candidates,{blooming=0,displayed=0}={}){
   if(!queue.length&&time>=nextBatch&&displayed===0){
    const eligible=candidates.filter(p=>time-(history.get(p.index)??-Infinity)>=28000);
    for(let i=eligible.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[eligible[i],eligible[j]]=[eligible[j],eligible[i]];}
    const picked=[];
    for(const p of eligible){if(picked.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>(p.size+q.size)*.42+35))picked.push(p);if(picked.length===3)break;}
    if(picked.length<2)for(const p of eligible){if(!picked.includes(p))picked.push(p);if(picked.length>=Math.min(2,eligible.length))break;}
    queue.push(...picked.map(p=>p.index));nextBatch=time+(queue.length?22000:2000);nextStart=time;
   }
   if(time<nextStart||blooming>=2||displayed>=3)return null;
   const available=new Set(candidates.map(p=>p.index));
   while(queue.length){const index=queue.shift();if(!available.has(index))continue;history.set(index,time);nextStart=time+1200;return index;}
   return null;
  }
 };
}
