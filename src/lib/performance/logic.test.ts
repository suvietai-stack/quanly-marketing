import {describe,it,expect} from 'vitest';
import {summarize,stateFor,instant,uniqueActorNames,ownItem,ownerFilter,type Work,type ModuleResult} from './logic';
const now=new Date('2026-11-14T15:00:00Z');
const w=(id:string,status:string,due?:string,completed?:string):Work=>({id,module:'tasks',title:id,status,state:stateFor('tasks',status),due,completed,href:'/tasks'});
const module=(items:Work[]):ModuleResult=>({key:'tasks',label:'Task',href:'/tasks',state:'ok',items,ambiguous:0});
describe('personal performance accounting',()=>{
 it('separates actionable late work from waiting, and current backlog from period completions',()=>{
  const waiting={...w('waiting','Chờ xác nhận','2026-11-12'),state:'waiting' as const};
  const r=summarize([module([w('late','Đang làm','2026-11-13'),waiting,w('done','Hoàn thành','2026-11-11','2026-11-10'),w('previous','Hoàn thành','2026-11-01','2026-11-02'),w('future','Hoàn thành','2026-11-20','2026-11-15'),w('cancelled','Đã hủy','2026-11-01'),w('missing','Hoàn thành','2026-11-10')])],'week',now);
  expect(r.summary).toMatchObject({active:2,working:1,waiting:1,overdue:1,waitingLate:1,done:1,ontime:1,comparable:1,ontimeRate:100,undatedDone:1});
  expect(r.daily.reduce((n,d)=>n+d.done,0)).toBe(1);expect(r.start).toBe('2026-11-09');expect(r.end).toBe('2026-11-15');
 });
 it('represents insufficient date evidence as null rather than zero percent',()=>{
  const r=summarize([module([w('no_due','Hoàn thành',undefined,'2026-11-12'),w('day_only','Hoàn thành','2026-11-12T09:00:00+07:00','2026-11-12')])],'week',now);
  expect(r.summary.done).toBe(2);expect(r.summary.comparable).toBe(0);expect(r.summary.ontimeRate).toBeNull();
 });
 it('uses Vietnam day-end for a date-only deadline and validates dates',()=>{
  expect(instant('2026-11-10',true)).toBe(Date.parse('2026-11-10T16:59:59.999Z'));
  expect(instant('2026-02-30')).toBeNull();expect(instant('not a date')).toBeNull();
  const r=summarize([module([w('late','Hoàn thành','2026-11-10','2026-11-10T17:00:00Z')])],'week',now);
  expect(r.summary.ontimeRate).toBe(0);
 });
 it('keeps unknown status visible without asserting it is actionable; published web is not final completion',()=>{
  expect(stateFor('web','Đã đăng web')).toBe('waiting');expect(stateFor('video','Đã đăng')).toBe('done');expect(stateFor('tasks','new unknown status')).toBe('other');
 });
 it('does not make a failed source look like a successful zero, including extra modules',()=>{
  const r=summarize([{...module([]),state:'error'}],'week',now);
  expect(r.complete).toBe(false);expect(r.coverage).toBe(0);expect(r.modules[0].state).toBe('error');
 });
 it('never falls back to matching a name when a conflicting stable owner id exists',()=>{
  const fields:[string,string][]=[['assigneeId','assignee']];
  expect(ownItem({assigneeId:'b',assignee:'Alice'},fields,'a',['Alice'])).toBe(false);
  expect(ownItem({assigneeId:'a',assignee:'old name'},fields,'a',['Alice'])).toBe(true);
  expect(ownItem({reporter:'Alice',assignee:'Bob'},fields,'a',['Alice'])).toBe(false);
 });
 it('excludes ambiguous legacy names and quotes filter values safely',()=>{
  const names=uniqueActorNames([{id:'a',full_name:'Alice',username:'alice-a'},{id:'b',full_name:'Alice',username:'alice-b'}],'a');
  expect(names).toEqual(['a','alice-a']);
  expect(ownerFilter([['assigneeId','assignee']],'a',['A, "B"'])).toContain('data->>assignee.eq."A, \\"B\\""');
 });
});
