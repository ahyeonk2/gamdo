import {approvedColors} from './approved-colors.js?v=1';
import {DEFAULT,flower,BASIC_COLORS} from './engine.js?v=44-approved-color-1';
export const GENERATOR_VERSION='gamdo-approved-paint-original-geometry-1';
const COLLECTION_COLORS=["#ed7db6", "#f1847e", "#8cc7df", "#b4d17e", "#c28bda", "#f4d07a"];
export const MOODS=Object.fromEntries(['pink','red','blue','green','purple','yellow'].map((k,i)=>[k,{name:BASIC_COLORS[i][0],hex:COLLECTION_COLORS[i]}]));
// Pass the six coordinates directly to the original GAMDO generator.
// No shape amplification, alternate geometry, or per-petal finishing overrides.
export function visualAxes(axes){return [...axes];}
export function flowerAxes(axes){return [...axes];}
let provider={version:GENERATOR_VERSION,generate(input,id){const palette=input.palette?.length?input.palette:[{mood:input.mood||'pink',weight:100}];const mixing=palette.map(c=>({color:MOODS[c.mood]?.hex||MOODS.pink.hex,weight:c.weight}));if(mixing.length===1)mixing.push({...mixing[0],weight:0});const state={...structuredClone(DEFAULT),primaryPetalField:true,...input.settings,axes:flowerAxes(input.axes),repeat:6,seed:input.seed,mixing};const svg=flower(state,id);const groups=[...svg.matchAll(/<g id="([^"]+)" data-cluster="(\d+)"/g)].map(m=>({id:m[1],index:+m[2],layer:+m[1].match(/layer-(\d)/)[1],origin:'0px 0px'}));return {svg,groups,version:GENERATOR_VERSION,parameters:state,analysisAxes:input.axes}}};
export function setGenerator(next){if(!next?.version||typeof next.generate!=='function')throw Error('생성기 인터페이스가 올바르지 않습니다.');provider=next;}
export function generateRecord(record,id){record=approvedColors(record);const axes=record.profile.axes.map(a=>a.level==='부족'?50:a.value);if(axes.length!==6||axes.some(v=>!Number.isFinite(v)||v<0||v>100))throw Error('6축 데이터가 올바르지 않습니다.');const result=provider.generate({axes,mood:record.profile.mood,palette:record.profile.palette,seed:record.seed,settings:record.generator?.settings||{repeat:6}},id);return {...result,animationAvailable:Array.isArray(result.groups)&&result.groups.length>0};}
