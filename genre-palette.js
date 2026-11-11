export const GENRE_PALETTE_VERSION='genre65-review35-v2';
// A shared design legend, not a psychological measurement.
export const GENRE_COLORS={28:'red',53:'red',80:'red',10752:'red',10749:'pink',35:'yellow',12:'yellow',10402:'yellow',36:'yellow',37:'yellow',878:'blue',18:'blue',14:'purple',9648:'purple',27:'purple',16:'green',10751:'green',99:'green'};
export const COLOR_NAMES={pink:'핑크',red:'레드',blue:'블루',green:'연두',purple:'퍼플',yellow:'옐로'};
const GENRE_FEEL={red:'속도감 있는 움직임과 팽팽한 긴장',pink:'관계가 가까워지는 순간의 설렘과 애정',yellow:'경쾌한 리듬과 새로운 곳으로 향하는 활기',blue:'인물의 내면이나 넓은 세계를 바라보는 차분한 거리감',purple:'현실의 경계를 벗어나는 상상과 낯선 분위기',green:'성장과 돌봄, 새로운 세계를 만나는 생기'};
const REVIEW_FEEL={red:'벅찬 쾌감과 긴장',pink:'사람을 향한 애정과 다정함',yellow:'따뜻함과 반가운 활기',blue:'조용한 생각과 쓸쓸함',purple:'낯섦과 호기심',green:'일상의 회복과 생동감'};
export function explainPalette(palette,review,movies,sources){
 const main=palette[0];
 const lines=[`세 편의 영화가 가진 장르와 전체적인 분위기, 남겨주신 감상을 함께 살펴 ${COLOR_NAMES[main.mood]}를 메인 컬러로 골랐어요.`];
 lines.push(`그중 ${GENRE_FEEL[main.mood]}과 감상에 남은 ${REVIEW_FEEL[main.mood]}을 이 색에 담았고요.`);
 const secondary=palette.slice(1).map(c=>`${COLOR_NAMES[c.mood]}(${REVIEW_FEEL[c.mood]})`);
 if(secondary.length)lines.push(`함께 느껴지는 분위기는 ${secondary.join(', ')}로 더해, 세 편의 서로 다른 결도 남겨두었어요.`);
 return lines.join(' ');
}
export function applyGenrePalette(profile,movies){
 const review=profile.reviewPalette||profile.palette||[{mood:profile.mood,weight:100}],votes={},sources=[];
 for(const [index,movie] of movies.entries()){const genres=movie.genres||[],all=genres.filter(g=>GENRE_COLORS[g.id]);const specific=all.filter(g=>g.id!==18),usable=specific.length?specific:all;if(!usable.length)continue;const row={};
 if(usable.every(g=>g.id===18)){
   continue;
 }else for(const g of usable){const color=GENRE_COLORS[g.id];row[color]=(row[color]||0)+(g.id===28?1.5:1);}const sum=Object.values(row).reduce((a,b)=>a+b,0);for(const [color,value] of Object.entries(row))votes[color]=(votes[color]||0)+value/sum;sources.push({index,genres:usable.map(g=>({id:g.id,name:g.name,color:GENRE_COLORS[g.id]}))});}
 const sum=Object.values(votes).reduce((a,b)=>a+b,0);if(!sum)return {...profile,mood:review[0].mood,palette:review,reviewPalette:review,colorMethod:{version:GENRE_PALETTE_VERSION,genreShare:0,reviewShare:1,sources:[]},colorReason:'영화의 장르 정보를 찾지 못해, 이번에는 감상에 남은 분위기를 중심으로 색을 골랐어요.'};
 const genreShare=.65*sources.length/movies.length,reviewShare=1-genreShare;const weights={};for(const [color,value] of Object.entries(votes))weights[color]=value/sum*genreShare;for(const c of review)weights[c.mood]=(weights[c.mood]||0)+c.weight/100*reviewShare;
 const chosen=Object.entries(weights).sort((a,b)=>b[1]-a[1]).slice(0,3),total=chosen.reduce((a,c)=>a+c[1],0);const palette=chosen.map(([mood,value])=>({mood,weight:Math.floor(value/total*100)}));let remainder=100-palette.reduce((a,c)=>a+c.weight,0);for(let i=0;remainder>0;i=(i+1)%palette.length,remainder--)palette[i].weight++;
 const genres=[...new Set(sources.flatMap(s=>s.genres.filter(g=>g.color===palette[0].mood).map(g=>g.name)))].slice(0,3);
 return {...profile,reviewPalette:review,palette,mood:palette[0].mood,colorReason:explainPalette(palette,review,movies,sources),colorMethod:{version:GENRE_PALETTE_VERSION,genreShare,reviewShare,sources}};
}
