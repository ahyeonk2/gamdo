// Shared by the iPad form and the server: display readiness and acceptance must agree.
export function reviewState(value){
 const review=typeof value==='string'?value.trim():'',length=review.length;
 if(length<40)return {valid:false,length,message:`${40-length}자 더 적으면 준비돼요`};
 if(length>1500)return {valid:false,length,message:'1500자 이내로 적어 주세요'};
 const detail=review.replace(/[\s\p{P}]/gu,'');
 const filler=/^(재밌|재미있|좋았|좋아|최고|별로|노잼|감동|멋있|추천|ㅋㅋ|ㅎㅎ|ㅠ|ㅜ|너무|정말|진짜|완전|어요|다|요|고|했|습니다|았|었)+$/.test(detail);
 if(detail.length<30||new Set(detail).size<10||filler)return {valid:false,length,message:'기억나는 장면과 좋았던 이유를 조금 더 적어 주세요'};
 return {valid:true,length,message:'이 영화의 감상이 준비됐어요'};
}
export function reviewsReady(movies){
 if(!Array.isArray(movies)||movies.length!==3)return false;
 if(!movies.every(m=>m&&typeof m.title==='string'&&m.title.trim()&&m.title.trim().length<=100&&reviewState(m.review).valid))return false;
 const norm=s=>s.normalize('NFKC').replace(/[\s\p{P}]/gu,'').toLowerCase();
 return new Set(movies.map(m=>m.id||norm(m.title))).size===3&&new Set(movies.map(m=>norm(m.title)+(m.year||''))).size===3;
}
