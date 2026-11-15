import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { LEAD_FORM, settingsSchema } from './model';

async function active(ctx:any) {
  const r=await ctx.supabase.rpc('community_active'); if(r.error||!r.data)throw new Error('Tài khoản chưa có quyền truy cập');
}
async function manage(ctx:any) {
  await active(ctx); const r=await ctx.supabase.rpc('wf_can_manage'); return !r.error&&!!r.data;
}
async function access(ctx:any,site:string,management=false) {
  const manager=await manage(ctx); if(manager)return;
  if(management)throw new Error('Chỉ quản trị tích hợp được cấu hình Chat Web');
  const {db}=await import('./chat.server');
  const r=await db.from('wc_access').select('user_id').eq('site_id',site).eq('user_id',ctx.userId).maybeSingle();
  if(r.error||!r.data)throw new Error('Bạn chưa được cấp quyền website này');
}
export const chatOverview=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const canManage=await manage(context); const {db}=await import('./chat.server');
  let ids:string[]|null=null;
  if(!canManage){const r=await db.from('wc_access').select('site_id').eq('user_id',context.userId);if(r.error)throw new Error('Không đọc được quyền Chat Web'); ids=(r.data??[]).map((x:any)=>x.site_id);}
  let q=db.from('wc_sites').select('id,enabled,settings,updated_at'); if(ids)q=q.in('id',ids);
  const r=await q; if(r.error){if(['42P01','PGRST205'].includes(r.error.code))return {installed:false,canManage,sites:[],sources:[]};throw new Error('Không tải được Chat Web');}
  const rows=r.data??[];
  const websites=rows.length?await db.from('wf_websites').select('id,name,domain,source,status').in('id',rows.map((s:any)=>s.id)):{data:[]};
  if(websites.error)throw new Error('Không tải được website');
  const cat=canManage?await (await import('@/lib/webForms/wf.server')).catalogs():{sources:[]};
  return {installed:true,canManage,sites:rows.map((s:any)=>({...s,...websites.data.find((w:any)=>w.id===s.id),settings:canManage?s.settings:{character:s.settings.character,avatar:s.settings.avatar}})),sources:cat.sources};
});
export const chatSaveSite=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(v=>z.object({id:z.string().uuid().optional(),name:z.string().trim().min(1).max(150),domain:z.string().trim().toLowerCase().regex(/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/),source:z.string().min(1).max(200),enabled:z.boolean(),settings:settingsSchema}).parse(v)).handler(async({context,data})=>{
  if(!await manage(context))throw new Error('Không có quyền cấu hình');
  const {db}=await import('./chat.server'); const wf=await import('@/lib/webForms/wf.server');
  const cat=await wf.catalogs(); if(!cat.sources.includes(data.source))throw new Error('Chọn nguồn trong Kho nguồn tín hiệu');
  let id=data.id,key:string|undefined;
  if(!id){
    const r=await db.from('wf_websites').insert({name:data.name,domain:data.domain,source:data.source,created_by:context.userId}).select('id').single();if(r.error)throw new Error('Không tạo được website');id=r.data.id;
    const generated=wf.generateKey();key=generated.key;
    const k=await db.from('wf_keys').insert({website_id:id,key_hash:await wf.sha256(key),key_prefix:generated.prefix,key_enc:await wf.seal(key)});if(k.error)throw new Error('Không tạo được mã kết nối');
  }else{
    const found=await db.from('wc_sites').select('id').eq('id',id).single();if(found.error)throw new Error('Website không tồn tại');
    const r=await db.from('wf_websites').update({name:data.name,domain:data.domain,source:data.source,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)throw new Error('Không cập nhật được website');
  }
  const s=await db.from('wc_sites').upsert({id,enabled:data.enabled,settings:data.settings,updated_at:new Date().toISOString()});if(s.error)throw new Error('Không lưu được cấu hình');
  const f=await db.from('wf_forms').upsert({website_id:id,form_id:LEAD_FORM,variant:'',name:'Chat Web — Đốm AI',schema:[],mapping:{},enabled:data.enabled,enabled_at:new Date().toISOString(),needs_review:false},{onConflict:'website_id,form_id,variant'});if(f.error)throw new Error('Chưa bật được luồng tín hiệu');
  return {id,key};
});
export const chatRotateKey=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(v=>z.object({site:z.string().uuid()}).parse(v)).handler(async({context,data})=>{
  await access(context,data.site,true); const {db}=await import('./chat.server'); const wf=await import('@/lib/webForms/wf.server'); const k=wf.generateKey();
  const r=await db.from('wf_keys').update({key_hash:await wf.sha256(k.key),key_prefix:k.prefix,key_enc:await wf.seal(k.key),revoked_at:null,created_at:new Date().toISOString()}).eq('website_id',data.site).select('website_id').single();if(r.error)throw new Error('Không đổi được khóa');return {key:k.key};
});
export const chatAccess=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(v=>z.object({site:z.string().uuid(),user:z.string().uuid().optional(),enabled:z.boolean().optional()}).parse(v)).handler(async({context,data})=>{
  await access(context,data.site,true); const {db}=await import('./chat.server');
  if(data.user){
    const p=await db.from('profiles').select('id').eq('id',data.user).eq('status','active').maybeSingle();if(p.error||!p.data)throw new Error('Nhân viên không hoạt động');
    const r=data.enabled?await db.from('wc_access').upsert({site_id:data.site,user_id:data.user}):await db.from('wc_access').delete().eq('site_id',data.site).eq('user_id',data.user);if(r.error)throw new Error('Không lưu được quyền website');
  }
  const [p,a]=await Promise.all([db.from('profiles').select('id,full_name').eq('status','active').order('full_name'),db.from('wc_access').select('user_id').eq('site_id',data.site)]);if(p.error||a.error)throw new Error('Không tải được nhân viên');return {staff:p.data,allowed:a.data.map((x:any)=>x.user_id)};
});
export const chatThreads=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(v=>z.object({site:z.string().uuid(),before:z.string().datetime().optional()}).parse(v)).handler(async({context,data})=>{
  await access(context,data.site);const {db}=await import('./chat.server');let q=db.from('wc_conversations').select('id,mode,summary,contact,signal_id,created_at,updated_at,read_at,error,taken_by').eq('site_id',data.site).order('updated_at',{ascending:false}).limit(100);if(data.before)q=q.lt('updated_at',data.before);const r=await q;if(r.error)throw new Error('Không tải được hội thoại');return r.data;
});
export const chatLocate=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(v=>z.object({id:z.string().uuid()}).parse(v)).handler(async({context,data})=>{
  await active(context);const {db}=await import('./chat.server');const r=await db.from('wc_conversations').select('site_id').eq('id',data.id).maybeSingle();if(r.error||!r.data)throw new Error('Không mở được hội thoại');await access(context,r.data.site_id);return {site:r.data.site_id as string};
});
export const chatThread=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(v=>z.object({site:z.string().uuid(),id:z.string().uuid()}).parse(v)).handler(async({context,data})=>{
  await access(context,data.site);const {db}=await import('./chat.server');const c=await db.from('wc_conversations').select('id,site_id,mode,summary,contact,signal_id,page_url,error,taken_by').eq('id',data.id).eq('site_id',data.site).single();if(c.error)throw new Error('Không có quyền xem hội thoại');const r=await db.from('wc_messages').select('id,role,body,state,created_at').eq('conversation_id',data.id).order('created_at').order('id').limit(500);if(r.error)throw new Error('Không tải được tin nhắn');return {...c.data,messages:r.data,userId:context.userId};
});
export const chatControl=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(v=>z.object({site:z.string().uuid(),id:z.string().uuid(),action:z.enum(['takeover','resume','send','read']),request:z.string().uuid(),text:z.string().trim().max(2000).default('')}).parse(v)).handler(async({context,data})=>{
  await access(context,data.site); const {db,rpc}=await import('./chat.server');const c=await db.from('wc_conversations').select('id').eq('id',data.id).eq('site_id',data.site).single();if(c.error)throw new Error('Không có quyền hội thoại');
  await rpc('wc_control',{p_conversation:data.id,p_actor:context.userId,p_action:data.action,p_request:data.request,p_text:data.text});return {ok:true};
});
