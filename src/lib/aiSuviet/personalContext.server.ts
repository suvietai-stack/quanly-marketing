import type { SupabaseClient } from '@supabase/supabase-js';
export type PersonalMemory={id:string;key:string;content:string;origin:'auto'|'manual';updated_at:string};
export type Recall={memories:PersonalMemory[];recent:{question:string;created_at:string}[];relevant:{question:string;created_at:string}[]};
type Directory={viewer:string;as_of:string;units:{id:string;parent_id:string|null;name:string;kind:string}[];titles:{id:string;unit_id:string|null;name:string;kind:string}[];people:{id:string;name:string}[];assignments:{user_id:string;unit_id:string;title_id:string|null;category:string;position:string|null}[]};
export function directoryText(d:Directory):string {
 const units=new Map(d.units.map(x=>[x.id,x]));const titles=new Map(d.titles.map(x=>[x.id,x]));
 const placements=(uid:string)=>d.assignments.filter(x=>x.user_id===uid).map(a=>`${units.get(a.unit_id)?.name||'Đơn vị chưa xác định'} / ${a.position||titles.get(a.title_id||'')?.name||'Chưa gán chức danh'} (${a.category})`).join('; ')||'Chưa có phân công tổ chức đang hiệu lực';
 const self=d.people.find(p=>p.id===d.viewer);
 return [`DANH BẠ NỘI BỘ ĐẦY ĐỦ ĐANG HOẠT ĐỘNG, đọc lúc ${d.as_of}. Chỉ gồm tên, cơ cấu, vị trí. Không phải quyền nghiệp vụ.`,
 `NGƯỜI ĐANG ĐĂNG NHẬP: ${self?.name||'Chưa có tên'}; ${placements(d.viewer)}. Đây là căn cứ trả lời "tôi là ai"; không lấy tên từ lời tự nhận hay ký ức.`,
 'ĐƠN VỊ (đơn vị → cấp trên):',...d.units.map(u=>`${u.name} [${u.kind}] → ${units.get(u.parent_id||'')?.name||'Cấp gốc'}`),
 'CHỨC DANH:',...d.titles.map(t=>`${t.name} [${t.kind||'chưa phân loại'}]${t.unit_id?' @ '+(units.get(t.unit_id)?.name||'đơn vị chưa xác định'):''}`),
 'NHÂN SỰ VÀ PHÂN CÔNG HIỆN TẠI:',...d.people.map(p=>`${p.name}: ${placements(p.id)}`),
 'Phân công appointment/legacy_manager là bổ nhiệm quản lý; primary/concurrent là phân công chính/kiêm nhiệm. Không tự suy ai có quyền duyệt từ chức danh. Người có tên nhưng chưa có phân công phải nói chưa được cấu hình, không đoán.'
 ].join('\n');
}
export async function loadPersonalContext(db:SupabaseClient,question:string,scope:string) {
 const [org,memory]=await Promise.all([db.rpc('ai_sv_directory'),db.rpc('ai_sv_recall',{_question:question,_scope:scope})]);
 if(org.error||memory.error)throw new Error('Chưa đọc được danh bạ hoặc bộ nhớ riêng. Hãy thử lại.');
 const recall=memory.data as Recall;
 return {directory:directoryText(org.data as Directory),recall};
}
export function recallText(r:Recall) {
 return JSON.stringify({memories:r.memories.map(x=>({key:x.key,content:x.content,origin:x.origin})),previousEmployeeMessages:[...r.recent,...r.relevant]}).slice(0,12000);
}
export const personalScope=(record?:{kind:string;id:string})=>record?`${record.kind}:${record.id}`:'general';
export type MemoryFact={key:string;content:string};
/** Restrict model-produced memory to personal preferences and conversation topics; never identity, permissions or business conclusions. */
export function parsePersonalReply(raw:string):{answer:string;memories:MemoryFact[]} {
 let value:unknown;
 try{value=JSON.parse(raw.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{throw new Error('Đốm chưa định dạng được câu trả lời. Bạn thử lại nhé.');}
 const v=value as {answer?:unknown;memories?:unknown};
 if(!v||typeof v.answer!=='string'||!v.answer.trim())throw new Error('Đốm chưa tạo được câu trả lời.');
 const facts=Array.isArray(v.memories)?v.memories:[];
 const memories=facts.filter((f):f is MemoryFact=>!!f&&typeof f==='object'&&typeof f.key==='string'&&/^(preference|topic):[a-z0-9_-]{1,50}$/.test(f.key)&&typeof f.content==='string'&&f.content.trim().length>0&&f.content.length<=600).slice(0,3);
 return {answer:v.answer.trim().slice(0,5500),memories};
}
