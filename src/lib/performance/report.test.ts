import {describe,it,expect,vi} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {buildMyPerformance} from './report.server';
const now=new Date('2026-11-14T15:00:00Z');
function client(options:{taskError?:boolean;denied?:boolean}={}){
 const calls:{table:string;method:string;args:unknown[]}[]=[];
 const rpc=vi.fn(async(name:string)=>({data:name==='community_active'?true:name==='base_permissions_navigation'?{permissions:[{key:'overview.view',allowed:!options.denied},{key:'task.view',allowed:true},{key:'signal.sale',allowed:true}]}:name==='get_profiles_directory'?[{id:'a',full_name:'Alice',username:'alice'}]:name==='k3_settings_read'?{enabled:true,can_use:true}:null,error:null}));
 const from=vi.fn((table:string)=>{
  const q:any={};
  for(const method of ['select','eq','or','is','gte','lte','order','range'])q[method]=(...args:unknown[])=>{calls.push({table,method,args});return q;};
  q.abortSignal=()=>Promise.resolve({data:table==='tasks'?[{id:'own',data:{assigneeId:'a',title:'Own job',status:'Hoàn thành',completedAt:'2026-11-12',deadline:'2026-11-13'}},{id:'foreign',data:{assigneeId:'b',assignee:'Alice',title:'Foreign job',status:'Hoàn thành',completedAt:'2026-11-12'}},{id:'created',data:{reporter:'Alice',assignee:'Bob',title:'Only assigned by me',status:'Đang làm'}}]:[],error:options.taskError&&table==='tasks'?{code:'57014'}:null});
  return q;
 });return {db:{rpc,from} as unknown as SupabaseClient,calls,from};
}
describe('caller-owned performance reads',()=>{
 it('only credits self-owned work and scopes signals/3K to the verified actor id',async()=>{
  const c=client();const r=await buildMyPerformance(c.db,'a','week',now);
  expect(r.summary.done).toBe(1);expect(r.modules.find(m=>m.key==='web')?.state).toBe('unavailable');
  expect(c.from).not.toHaveBeenCalledWith('web_contents');
  expect(c.calls).toContainEqual({table:'opportunity_signals',method:'eq',args:['assigned_to','a']});
  expect(c.calls).toContainEqual({table:'k3_tasks',method:'eq',args:['user_id','a']});
  expect(c.calls).toContainEqual({table:'tasks',method:'eq',args:['is_demo',false]});
 });
 it('keeps an individual source timeout separate from the rest of the report',async()=>{
  const c=client({taskError:true});const r=await buildMyPerformance(c.db,'a','week',now);
  expect(r.complete).toBe(false);expect(r.modules.find(m=>m.key==='tasks')?.state).toBe('error');
  expect(r.extras?.signal.state).toBe('ok');expect(r.extras?.k3.state).toBe('ok');
 });
 it('rejects report access before any table read when dashboard permission is absent',async()=>{
  const c=client({denied:true});await expect(buildMyPerformance(c.db,'a','week',now)).rejects.toThrow('chưa có quyền');expect(c.from).not.toHaveBeenCalled();
 });
});
