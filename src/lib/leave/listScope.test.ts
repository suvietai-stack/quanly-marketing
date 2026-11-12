import { expect, it, vi } from 'vitest';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { filterLeaveList, leaveListScope, leaveListKey, leaveActorQuery, LEAVE_LIST_LIMIT } from './listScope';
it('own default adds exactly owner equality; no broad or approver filter', () => {
 const eq=vi.fn();const builder={eq};eq.mockReturnValue(builder);
 expect(filterLeaveList(builder,'mine','employee-a')).toBe(builder);
 expect(eq.mock.calls).toEqual([['owner_id','employee-a']]);
 expect(leaveListScope('mine',{mine:true,approve:false,manage:false,report:false})).toBe('mine');
});
it('approve adds exactly approver equality',()=>{
 const eq=vi.fn();const builder={eq};eq.mockReturnValue(builder);
 filterLeaveList(builder,'approve','approver-a');expect(eq.mock.calls).toEqual([['approver_id','approver-a']]);
});
it('full list only selected manage/report with corresponding permission',()=>{
 const p={mine:true,approve:false,manage:false,report:false};
 expect(leaveListScope('manage',p)).toBeNull();expect(leaveListScope('report',p)).toBeNull();expect(leaveListScope('approve',p)).toBeNull();
 expect(leaveListScope('manage',{...p,manage:true})).toBe('manage');expect(leaveListScope('report',{...p,report:true})).toBe('manage');
 const eq=vi.fn();filterLeaveList({eq},'manage','a');expect(eq).not.toHaveBeenCalled();
});
it('list cap remains 1000; missing actor fails before SELECT',()=>{
 expect(LEAVE_LIST_LIMIT).toBe(1000);const eq=vi.fn();expect(()=>filterLeaveList({eq},'mine','')).toThrow();expect(eq).not.toHaveBeenCalled();
});
it('all scoped refresh keys match only the signed-in actor',()=>{
 for(const scope of ['mine','approve','manage'] as const) expect(leaveActorQuery(leaveListKey('a',scope),'a')).toBe(true);
 expect(leaveActorQuery(leaveListKey('b','mine'),'a')).toBe(false);
 expect(leaveActorQuery(['leave','settings','a'],'a')).toBe(true);
 expect(leaveActorQuery(['leave','list',undefined,'mine'],undefined)).toBe(false);
});
it('query scope changes cancel abandoned reads and actor cache does not leak',async()=>{
 const qc=new QueryClient({defaultOptions:{queries:{retry:false}}});let signal:AbortSignal|undefined;
 const observer=new QueryObserver(qc,{queryKey:leaveListKey('a','mine'),queryFn:({signal:s})=>{signal=s;return new Promise<string[]>(()=>{});}});
 const unsubscribe=observer.subscribe(()=>{});
 observer.setOptions({queryKey:leaveListKey('b','mine'),queryFn:async()=>['b-only']});
 expect(signal?.aborted).toBe(true);
 await qc.ensureQueryData({queryKey:leaveListKey('b','mine'),queryFn:async()=>['b-only']});
 expect(qc.getQueryData(leaveListKey('b','mine'))).toEqual(['b-only']);expect(qc.getQueryData(leaveListKey('a','mine'))).toBeUndefined();
 unsubscribe();await qc.cancelQueries();qc.clear();
});
it('sign-out stops the active read; disabled unauthorized tabs never fetch',async()=>{
 const qc=new QueryClient({defaultOptions:{queries:{retry:false}}});let signal:AbortSignal|undefined;
 const fn=vi.fn(({signal:s}:{signal:AbortSignal})=>{signal=s;return new Promise<string[]>(()=>{});});
 const observer=new QueryObserver(qc,{queryKey:leaveListKey('a','mine'),queryFn:fn});const stop=observer.subscribe(()=>{});
 observer.setOptions({queryKey:leaveListKey(undefined,null),enabled:false,queryFn:fn});
 expect(signal?.aborted).toBe(true);expect(fn).toHaveBeenCalledTimes(1);expect(observer.getCurrentResult().data).toBeUndefined();
 stop();qc.clear();
});
it('refresh invalidates every scope for actor without refetching hidden tabs or other actors',async()=>{
 const qc=new QueryClient();for(const scope of ['mine','approve','manage'] as const) qc.setQueryData(leaveListKey('a',scope),[scope]);
 qc.setQueryData(leaveListKey('b','mine'),['b']);
 await qc.invalidateQueries({predicate:q=>leaveActorQuery(q.queryKey,'a')});
 for(const scope of ['mine','approve','manage'] as const) expect(qc.getQueryState(leaveListKey('a',scope))?.isInvalidated).toBe(true);
 expect(qc.getQueryState(leaveListKey('b','mine'))?.isInvalidated).toBe(false);qc.clear();
});