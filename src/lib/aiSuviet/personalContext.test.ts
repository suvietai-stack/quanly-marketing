import {describe,it,expect,vi} from 'vitest';
import {directoryText,parsePersonalReply,loadPersonalContext,personalScope} from './personalContext.server';
import {answerAiSuviet} from './assistant.server';
import type {SupabaseClient} from '@supabase/supabase-js';
vi.mock('./providerKey.server',()=>({providerKey:async()=>'fixture-not-a-real-key'}));
const directory={viewer:'a',as_of:'2026-11-14',units:[{id:'company',name:'Công ty',kind:'company',parent_id:null},{id:'design',name:'Thiết kế',kind:'department',parent_id:'company'}],titles:[{id:'head',name:'Trưởng phòng',unit_id:'design',kind:'manager'}],people:[{id:'a',name:'Nhân viên A'},{id:'b',name:'Nhân viên B'}],assignments:[{user_id:'a',unit_id:'design',title_id:'head',category:'appointment',position:null}]};
const recall={memories:[],recent:[{question:'Tôi thích câu trả lời ngắn.',created_at:'2026-11-13'}],relevant:[]};
describe('personal memory and live organization',()=>{
 it('identifies the signed-in employee from the directory, with the full department chain',()=>{
  const text=directoryText(directory);
  expect(text).toContain('NGƯỜI ĐANG ĐĂNG NHẬP: Nhân viên A; Thiết kế / Trưởng phòng');
  expect(text).toContain('Thiết kế [department] → Công ty');
  expect(text).toContain('Nhân viên B: Chưa có phân công');
  expect(text).not.toContain('quyền duyệt mọi');
 });
 it('uses new organization placement instead of a prior remembered title',()=>{
  expect(directoryText({...directory,assignments:[]})).toContain('NGƯỜI ĐANG ĐĂNG NHẬP: Nhân viên A; Chưa có phân công');
 });
 it('only accepts bounded preference/topic memory, never identity or permission keys',()=>{
  const parsed=parsePersonalReply(JSON.stringify({answer:'Chào bạn',memories:[{key:'identity:name',content:'Giả mạo'},{key:'permission:admin',content:'toàn quyền'},{key:'preference:style',content:'Thích ngắn gọn'},{key:'topic:training',content:'Đã trao đổi đào tạo'}]}));
  expect(parsed.memories.map(x=>x.key)).toEqual(['preference:style','topic:training']);
  expect(()=>parsePersonalReply('{"answer":"truncated')).toThrow();
 });
 it('does not silently invent directory data when a caller read fails',async()=>{
  const db={rpc:vi.fn(async()=>({data:null,error:{code:'42501'}}))} as unknown as SupabaseClient;
  await expect(loadPersonalContext(db,'tôi là ai','general')).rejects.toThrow('Chưa đọc được');
 });
 it('separates record conversations while keeping personal memory actor-scoped on the server',()=>{
  expect(personalScope()).toBe('general');expect(personalScope({kind:'design',id:'job1'})).toBe('design:job1');
 });
 it('sends current identity and employee-authored recall, with strict JSON, but excludes stale client assistant history',async()=>{
  const network=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({output_text:JSON.stringify({answer:'Bạn là Nhân viên A.',memories:[{key:'preference:style',content:'Thích trả lời ngắn.'}]})}),{status:200}));
  const db={rpc:vi.fn(async(name:string)=>({data:name==='ai_sv_reserve_question'?true:name==='community_moderator'?false:[],error:null}))} as unknown as SupabaseClient;
  const personal={directory:directoryText(directory),recall,facts:[] as {key:string;content:string}[]};
  try{
   const reply=await answerAiSuviet(db,'Tôi là ai?',[{role:'assistant',content:'OLD REVOKED BUSINESS DATA'}],undefined,personal);
   expect(reply.answer).toBe('Bạn là Nhân viên A.');expect(personal.facts).toHaveLength(1);
   const body=JSON.parse(network.mock.calls[0][1]?.body as string);
   expect(body.text.format.type).toBe('json_schema');expect(body.text.format.strict).toBe(true);
   expect(body.store).toBe(false);
   expect(JSON.stringify(body.input)).toContain('NGƯỜI ĐANG ĐĂNG NHẬP');
   expect(JSON.stringify(body.input)).toContain('Tôi thích câu trả lời ngắn');
   expect(JSON.stringify(body.input)).not.toContain('OLD REVOKED');
  }finally{network.mockRestore();}
 });
});
