window.GAMDO_CREATOR=false;
const originalFetch=window.fetch.bind(window);const siteRoot=new URL('./',location.href);const backend='https://gamdo-garden.gamdo-ahyeonk2.workers.dev';
window.fetch=(input,init={})=>{let url=typeof input==='string'?input:input instanceof URL?input.href:null;if(url&&url.startsWith('/api/')){const headers=new Headers(init.headers);const token=sessionStorage.getItem('gamdo-access');return originalFetch(backend+url,{...init,headers,credentials:'omit'});}if(url&&url.startsWith('/')&&!url.startsWith('//'))input=new URL(url.slice(1),siteRoot).href;return originalFetch(input,init);};
if(window.GAMDO_CREATOR&&!sessionStorage.getItem('gamdo-access'))location.replace('login.html');
