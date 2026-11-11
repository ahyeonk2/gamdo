// Presentation fallback uses only supported axis values, never invented movie experiences.
export function overallSummary(profile,movies=[]){
 const text=(profile.description||'').trim(),sentences=text.split(/(?<=[.!?。])\s+|\n+/).filter(Boolean);
 const names=movies.map(m=>m.title).filter(Boolean);
 if(text.length<=108&&sentences.length===3&&!names.some(n=>text.includes(n))&&!/첫\s*번째|두\s*번째|세\s*번째|반면|에서는|에선|다른\s*(영화|작품)/.test(text))return sentences.join('\n');
 const axis=n=>profile.axes?.find(a=>a.name===n),side=(n,low,high,unknown)=>{const a=axis(n);return !a||a.level==='부족'?unknown:a.value<45?low:a.value>55?high:unknown};
 return [side('감각','담백한 화면과 섬세한 표현에 눈길이 가요.','선명한 화면과 감각적인 리듬을 즐기는 편이에요.','화면과 소리가 만드는 분위기를 살펴보는 편이에요.'),side('인물','인물과 거리를 두고 선택을 지켜보는 편이에요.','인물의 마음을 따라 이야기에 빠져드는 편이에요.','인물의 태도와 서로의 관계에 눈길이 가요.'),side('서사','이야기의 흐름과 의미가 분명한 전달에 마음이 가요.','해석할 여지가 남는 이야기에 마음이 가요.','보고 난 뒤에도 장면을 천천히 곱씹는 편이에요.')].join('\n');
}
