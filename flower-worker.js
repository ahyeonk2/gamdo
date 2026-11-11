import {generateRecord} from './generator-adapter.js?v=44-approved-color-1';
self.onmessage=({data})=>{try{self.postMessage({id:data.id,result:generateRecord(data.record,data.svgId)})}catch(error){self.postMessage({id:data.id,error:String(error.message||error)})}};
