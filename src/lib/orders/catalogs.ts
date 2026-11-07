import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/lib/auth';
import type { DesignFlow } from './design';
import type { DesignOrder } from '@/lib/store';
export interface DesignCatalog {id:string;workflow_kind:DesignFlow;kind:'work'|'product';name:string;active:boolean;position:number;is_other:boolean}
export interface DesignAttachment {id:string;kind:'link'|'file';name:string;url?:string;path?:string;size?:number;mime?:string;note?:string}
export const MAX_FILE_SIZE=20*1024*1024;
export const FILE_EXTENSIONS=['pdf','doc','docx','xls','xlsx','ppt','pptx','jpg','jpeg','png','webp','gif','heic','ai','psd','eps','svg','tif','tiff','zip','txt','csv'];
export function fileError(file:{name:string;size:number}) {return file.size>MAX_FILE_SIZE?'Tệp vượt quá 20 MB.':!FILE_EXTENSIONS.includes(file.name.split('.').at(-1)?.toLowerCase() || '')?'Định dạng tệp chưa được hỗ trợ.':file.size===0?'Tệp không có nội dung.':'';}
export function validDocumentUrl(value:string){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol) && !!u.hostname && !u.username && !u.password;}catch{return false;}}
export function useDesignCatalogs(){const {user}=useCurrentUser();return useQuery({queryKey:['design-catalogs',user?.id],enabled:!!user,queryFn:async()=>{const r=await supabase.from('design_catalogs').select('*').order('position').order('name');if(r.error)throw new Error(r.error.message);return r.data as DesignCatalog[];}});}
export const workLabel=(o:DesignOrder,c:DesignCatalog[])=>c.find(x=>x.id===o.workCategoryId)?.name || o.workCategoryName || o.type;
export function normalizeProducts(ids:string[],names:string[],catalogs:DesignCatalog[]){return catalogs.some(c=>c.is_other && ids.includes(c.id))?names.map(n=>n.trim()).filter(Boolean):[];}
export function productBreakdown(orders:DesignOrder[],catalogs:DesignCatalog[]){const rows=[...new Map(orders.map(o=>[o.id,o])).values()];const ids=[...new Set(rows.flatMap(o=>o.productIds || []))];return ids.map(id=>({id,name:catalogs.find(c=>c.id===id)?.name || rows.find(o=>o.productNames?.[id])?.productNames?.[id] || 'Danh mục cũ',rows:rows.filter(o=>o.productIds?.includes(id)),value:rows.filter(o=>o.productIds?.includes(id)).length}));}