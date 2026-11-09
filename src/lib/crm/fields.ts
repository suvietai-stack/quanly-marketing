import type { Catalog, Customer } from './types';
import { descendant } from './logic';
export const FIELD_TYPES: Record<string,string> = { text:'Văn bản ngắn', textarea:'Văn bản dài', number:'Số', money:'Số tiền', date:'Ngày', boolean:'Có/Không', select:'Chọn một', multiselect:'Chọn nhiều', url:'Đường dẫn URL' };
export type FieldValue = string | number | boolean | string[] | null;
export type FieldValues = Record<string, FieldValue>;
export type DynamicFilter = { id:string; min?:string; max?:string; value?:FieldValue; contains?:string };
export function fieldOptions(c:Catalog): {id:string;name:string;active:boolean}[] {
  return Array.isArray(c.config.options) ? c.config.options.filter((x):x is {id:string;name:string;active:boolean}=>!!x && typeof x==='object' && 'id' in x && 'name' in x).map(x=>({...x,active:x.active!==false})) : [];
}
export function scopeMatches(c:Catalog, group:string, segment='', catalogs:Catalog[]=[]):boolean {
  if(!group) return false;
  const mode=c.config.scope_mode;
  if(mode==='shared') return true;
  if(mode==='segments') return Array.isArray(c.config.segment_ids) && c.config.segment_ids.some(id=>typeof id==='string' && !!segment && (id===segment || descendant(segment,id,catalogs)));
  if(mode==='groups' || !mode) return Array.isArray(c.config.group_ids) && c.config.group_ids.includes(group);
  return false;
}
export function applicableFields(catalogs:Catalog[],group:string,segment='') {
  return catalogs.filter(c=>c.kind==='custom_field' && c.active && scopeMatches(c,group,segment,catalogs));
}
export function displayValue(c:Catalog,v:FieldValue|undefined):string {
  if(v===undefined || v===null || v==='') return '—';
  if(typeof v==='boolean') return v?'Có':'Không';
  if(typeof v==='number') return v.toLocaleString('vi-VN')+(c.config.field_type==='money'?' ₫':'');
  if(Array.isArray(v)) return v.map(id=>fieldOptions(c).find(o=>o.id===id)?.name || id).join(', ');
  if(c.config.field_type==='select') return fieldOptions(c).find(o=>o.id===v)?.name || v;
  return v;
}
export function dynamicAnalysis(customers:Customer[],c:Catalog,catalogs:Catalog[],range:{min?:string;max?:string}={}) {
  const unique=[...new Map(customers.map(x=>[x.id,x])).values()].filter(x=>scopeMatches(c,x.group_id||'',x.segment_id||'',catalogs));
  const filled=unique.filter(x=>{const v=x.custom_values?.[c.id];if(v===undefined || v===null || v==='' || (Array.isArray(v)&&!v.length))return false;if(['number','money','date'].includes(String(c.config.field_type))){const val=typeof v==='number'?v:Date.parse(String(v));const lo=range.min?typeof v==='number'?Number(range.min):Date.parse(range.min):null,hi=range.max?typeof v==='number'?Number(range.max):Date.parse(range.max):null;return (lo===null||val>=lo)&&(hi===null||val<=hi);}return true;});
  const counts=new Map<string,{name:string;ids:string[]}>();
  for(const x of filled) {const v=x.custom_values?.[c.id];for(const item of Array.isArray(v)?[...new Set(v)]:[v]) {const key=String(item);const old=counts.get(key)||{name:displayValue(c,item as FieldValue),ids:[]};old.ids.push(x.id);counts.set(key,old);}}
  const nums=filled.flatMap(x=>typeof x.custom_values?.[c.id]==='number'?[x.custom_values[c.id] as number]:[]);
  return {total:unique.length,filled:filled.length,selections:[...counts.values()].reduce((n,x)=>n+x.ids.length,0),sum:nums.length?nums.reduce((n,x)=>n+x,0):null,average:nums.length?nums.reduce((n,x)=>n+x,0)/nums.length:null,rows:[...counts].map(([id,x])=>({id,...x,count:x.ids.length,share:unique.length?x.ids.length/unique.length*100:null}))};
}