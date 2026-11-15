import {describe,it,expect,vi} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {dashboardData} from './domains.server';
import type {DashboardContext} from './context';
const ctx:DashboardContext={userId:'a',asOf:'now',identity:{name:'A',placements:[]},units:[],people:[],capabilities:{work:false,k3:false,business:false,signals:false},canManage:false};
function fake(context=ctx){
 const calls:{table:string;method:string;args:unknown[]}[]=[];
 const rpc=vi.fn(async(name:string,args?:unknown):Promise<{data:unknown;error:unknown}>=>({data:name==='dashboard_scope_context'?context:name==='community_active'?true:name==='base_permissions_navigation'?{permissions:[{key:'overview.view',allowed:true},{key:'task.view',allowed:true},{key:'signal.sale',allowed:true}]}:name==='get_profiles_directory'?[{id:'a',full_name:'A'},{id:'b',full_name:'B'}]:name==='k3_settings_read'?{enabled:false}:null,error:null}));
 const from=vi.fn((table:string)=>{const q:any={};for(const method of ['select','eq','is','or','order','range'])q[method]=(...args:unknown[])=>{calls.push({table,method,args});return q;};q.abortSignal=()=>Promise.resolve({data:[],error:null});return q;});
 return {db:{rpc,from} as unknown as SupabaseClient,rpc,from,calls};
}
describe('Dashboard modes use native source boundaries',()=>{
 it('rejects a forged management mode before reading report data',async()=>{
  const c=fake();await expect(dashboardData(c.db,'a','week','manage')).rejects.toThrow('không có quyền');expect(c.from).not.toHaveBeenCalled();
 });
 it('binds context to the verified actor instead of accepting another account context',async()=>{
  const c=fake({...ctx,userId:'b',canManage:true});await expect(dashboardData(c.db,'a','week','manage')).rejects.toThrow('phạm vi');expect(c.from).not.toHaveBeenCalled();
 });
 it('keeps personal Sale owned and reports no populated panels for empty sources',async()=>{
  const c=fake();const d=await dashboardData(c.db,'a','week','personal');
  expect(c.calls).toContainEqual({table:'opportunity_signals',method:'eq',args:['assigned_to','a']});
  expect(d.hasWork).toBe(false);expect(d.signal.state==='ok'&&d.signal.hasData).toBe(false);expect(d.business.state).toBe('unavailable');
 });
 it('does not borrow native 3K management rights to read other employees work items',async()=>{
  const c=fake({...ctx,canManage:true,capabilities:{...ctx.capabilities,k3:true}});
  const d=await dashboardData(c.db,'a','week','manage');
  expect(d.work).toBeNull();expect(c.from).not.toHaveBeenCalledWith('tasks');expect(d.signal.state).toBe('unavailable');
 });
 it('an authorized but empty work scope never counts the manager own records as the team',async()=>{
  const c=fake({...ctx,canManage:true,units:[{id:'empty',name:'Empty',parent_id:null}],capabilities:{...ctx.capabilities,work:true}});
  const d=await dashboardData(c.db,'a','week','manage');
  expect(d.hasWork).toBe(false);expect(c.from).not.toHaveBeenCalledWith('tasks');
 });
 it('uses measured 3K results and never turns legacy task status into KPI results',async()=>{
  const c=fake();const original=c.rpc.getMockImplementation()!;
  c.rpc.mockImplementation(async(name,args)=>name==='k3_settings_read'?{data:{enabled:true,can_use:true},error:null}:name==='k3_measured_period_read'?{data:[{user_id:'a',updated:true,closes:0,kpis:[{metric:{actual:0},official_metric:{actual:null}}]}],error:null}:original(name,args));
  const d=await dashboardData(c.db,'a','week','personal');
  expect(d.k3).toMatchObject({state:'ok',entered:1,official:0,hasData:true});
  expect(c.rpc).toHaveBeenCalledWith('k3_measured_period_read',expect.objectContaining({_manage:false}));
  expect(c.from).not.toHaveBeenCalledWith('k3_tasks');
 });
 it('forces personal business metrics to the signed-in account, using native entitlement',async()=>{
  const c=fake({...ctx,canUseBusiness:true});const original=c.rpc.getMockImplementation()!;
  c.rpc.mockImplementation(async(name,args)=>name==='biz_dashboard_data'?{data:{totals:[]},error:null}:original(name,args));
  await dashboardData(c.db,'a','month','personal');
  expect(c.rpc).toHaveBeenCalledWith('biz_dashboard_data',expect.objectContaining({_user_id:'a',_period_kind:'month',_mode:'official'}));
 });
 it('an individual native source network failure does not erase successful sources',async()=>{
  const c=fake();const original=c.rpc.getMockImplementation()!;
  c.rpc.mockImplementation(async(name,args)=>{if(name==='k3_settings_read')throw new Error('network');return original(name,args);});
  const d=await dashboardData(c.db,'a','week','personal');
  expect(d.k3.state).toBe('error');expect(d.signal.state).toBe('ok');expect(d.complete).toBe(false);
 });

 it('counts authorized team owners, not the manager or outsiders returned by a broad mock source',async()=>{
  const c=fake({...ctx,canManage:true,units:[{id:'A',name:'Unit A',parent_id:null}],people:[{id:'b',name:'B',units:['A']},{id:'a',name:'A',units:['outside']}],capabilities:{...ctx.capabilities,work:true}});
  c.from.mockImplementation((table:string)=>{const q:any={};for(const method of ['select','eq','is','or','order','range'])q[method]=(...args:unknown[])=>{c.calls.push({table,method,args});return q;};q.abortSignal=()=>Promise.resolve({data:[{id:'b1',data:{assigneeId:'b',status:'Đang làm'}},{id:'a1',data:{assigneeId:'a',status:'Đang làm'}},{id:'a2',data:{assigneeId:'a',status:'Đang làm'}}],error:null});return q;});
  const d=await dashboardData(c.db,'a','week','manage');
  expect(d.work?.summary.working).toBe(1);
  const filter=c.calls.find(x=>x.table==='tasks'&&x.method==='or')?.args[0] as string;
  expect(filter).toContain('data->>assigneeId.eq."b"');expect(filter).not.toContain('data->>assigneeId.eq."a"');
 });

});
