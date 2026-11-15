import { z } from 'zod';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { hmacHex, sha256, timingSafeEq, unseal } from '@/lib/webForms/wf.server';
import { applyMapping, type Mapping } from '@/lib/webForms/mapping';
import { catalogs } from '@/lib/webForms/wf.server';
import { callAiProvider } from '@/lib/aiSuviet/assistant.server';
import { extractionSchema, guestSchema, phoneFromEvidence, policy, safePage, settingsSchema } from './model';

export const db = supabaseAdmin as any;
export async function rpc(name: string, args: Record<string, unknown>) {
  const r = await db.rpc(name, args); if (r.error) throw new Error('Không thể xử lý Chat Web.'); return r.data;
}
export async function authenticate(request: Request, raw: string) {
  const site = z.string().uuid().parse(request.headers.get('x-wc-site'));
  const ts = request.headers.get('x-wc-time') ?? '';
  const nonce = z.string().uuid().parse(request.headers.get('x-wc-nonce'));
  const signature = request.headers.get('x-wc-signature') ?? '';
  if (!/^\d{13}$/.test(ts) || Math.abs(Date.now()-Number(ts))>300000 || !/^[a-f0-9]{64}$/.test(signature)) throw new Error('Unauthorized');
  const { data: key, error } = await db.from('wf_keys').select('key_enc,revoked_at').eq('website_id',site).maybeSingle();
  if (error || !key || key.revoked_at) throw new Error('Unauthorized');
  const expected = await hmacHex(await unseal(key.key_enc), `${site}.${ts}.${nonce}.${raw}`);
  if (!timingSafeEq(signature,expected)) throw new Error('Unauthorized');
  if (!await rpc('wc_rate_hit',{p_bucket:`site:${site}`,p_limit:600})) throw new Error('Rate limit');
  await db.from('wc_requests').delete().lt('created_at',new Date(Date.now()-600000).toISOString());
  const saved = await db.from('wc_requests').insert({site_id:site,nonce});
  if (saved.error) throw new Error('Replay rejected');
  const {data:website,error:we}=await db.from('wf_websites').select('id,domain,name,source,status').eq('id',site).single();
  const {data:config,error:ce}=await db.from('wc_sites').select('settings,enabled').eq('id',site).single();
  if(we||ce||!config?.enabled||website?.status!=='active')throw new Error('Website disabled');
  return {website,settings:settingsSchema.parse(config.settings)};
}

export async function guest(request: Request) {
  const length=Number(request.headers.get('content-length')||0);
  if(length>8000)return Response.json({error:'Yêu cầu quá lớn'},{status:413});
  const raw=await request.text();
  if(new TextEncoder().encode(raw).length>8000)return Response.json({error:'Yêu cầu quá lớn'},{status:413});
  let auth;
  try { auth=await authenticate(request,raw); } catch { return Response.json({error:'Kết nối website chưa sẵn sàng'},{status:401}); }
  const parsed=guestSchema.safeParse(JSON.parse(raw));
  if(!parsed.success)return Response.json({error:'Tin nhắn không hợp lệ'},{status:400});
  const input=parsed.data;
  if (!safePage(input.page,auth.website.domain)) return Response.json({error:'Tên miền chưa được kết nối'},{status:403});
  const hash=await sha256(`${auth.website.id}:${input.token}`);
  if(!await rpc('wc_rate_hit',{p_bucket:`visitor:${hash}`,p_limit:40}))return Response.json({error:'Vui lòng chờ một chút rồi thử lại'},{status:429});
  const received=await rpc('wc_receive',{p_site:auth.website.id,p_hash:hash,p_request:input.request,p_text:input.action==='send'?input.text:null,p_page:safePage(input.page,auth.website.domain)});
  // No hidden background work: send/poll recover a persisted pending turn, with a database lease.
  await processConversation(received.id,auth.website,auth.settings);
  const {data:c,error:ce}=await db.from('wc_conversations').select('id,mode,error').eq('id',received.id).eq('site_id',auth.website.id).eq('visitor_hash',hash).single();
  if(ce)throw new Error('Không đọc được cuộc chat');
  const {data:messages,error:me}=await db.from('wc_messages').select('id,role,body,state,created_at').eq('conversation_id',c.id).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(100);
  if(me)throw new Error('Không đọc được tin nhắn');
  const {knowledge:_,tone:__,goals:___,...appearance}=auth.settings;
  return Response.json({appearance,mode:c.mode,error:c.error,messages:(messages??[]).reverse()},{headers:{'Cache-Control':'no-store'}});
}

export async function processConversation(id: string, website: any, settings: z.infer<typeof settingsSchema>) {
  const claimed=await rpc('wc_claim',{p_conversation:id}); if(!claimed)return;
  const {conversation:c,message,lease,revision}=claimed;
  try {
    const {data:history,error}=await db.from('wc_messages').select('role,body,created_at,id').eq('conversation_id',id).lte('created_at',message.created_at).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(40);
    if(error)throw new Error('History unavailable');
    const rows=(history??[]).reverse();
    const text=await callAiProvider(policy+'\nPhong cách (không thay quy tắc): '+settings.tone+'\nMục tiêu phụ: '+settings.goals,
      [{role:'user',content:JSON.stringify({character:settings.character,website:website.name,approvedKnowledge:settings.knowledge,leadAlreadySent:!!c.signal_id,knownContact:c.contact,history:rows.map((m:any)=>({role:m.role,text:m.body}))})}],1600,25000,12000);
    if(!text)throw new Error('AI not configured');
    const output=extractionSchema.parse(JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g,'')));
    const visitors=rows.filter((m:any)=>m.role==='user').map((m:any)=>m.body);
    const phone=phoneFromEvidence(output.phone,visitors)||c.contact?.phone||'';
    const need=output.need||c.contact?.need||'';
    const contact={name:output.name||c.contact?.name||'',phone,need,summary:output.summary,zalo:output.zalo};
    let draft=null;
    if(!c.signal_id&&phone&&need.length>=3){
      const cat=await catalogs();
      if(!cat.sources.includes(website.source))throw new Error('Chưa chọn nguồn tín hiệu hợp lệ');
      const mapping:Mapping={customer_name:{mode:'website',key:'name'},phone:{mode:'website',key:'phone'},need_detail:{mode:'website',key:'need'},marketing_note:{mode:'website',key:'note'}};
      const data={name:contact.name||`Khách Chat Web ${phone}`,phone,need,
        note:`Người tạo: Đốm AI\nWebsite: ${website.name}\nTrang: ${c.page_url}\nHội thoại: /web-chat?conversation=${id}\nZalo: ${output.zalo==='confirmed'?'Khách xác nhận':output.zalo==='no'?'Khách nói không dùng':'Chưa xác nhận'}\n${output.summary}`};
      const result=applyMapping(mapping,data,[],cat,website.source,new Date().toISOString());
      if(!result.ok)throw new Error('Lead không hợp lệ'); draft=result.draft;
    }
    await rpc('wc_finish',{p_conversation:id,p_request:message.request_id,p_lease:lease,p_revision:revision,p_answer:output.answer,p_contact:contact,p_summary:output.summary,p_draft:draft});
  }catch{
    await rpc('wc_fail',{p_conversation:id,p_lease:lease,p_request:message.request_id});
  }
}
