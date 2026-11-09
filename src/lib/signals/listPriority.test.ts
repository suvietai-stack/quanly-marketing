import { expect, it } from 'vitest';
import { matchesSignalStatus, signalStatusTabs } from './listPriority';
import { sortSignals } from './potential';
import { applyListFilter } from './report';
import type { Signal } from './catalog';
import type { DeadlineRow } from './deadlines';
const row = (id: string, extra: Partial<Signal> = {}): Signal => ({ id, detected_on:'2026-11-06', customer_name:'Khách', phone:'0901234567', address:null, need_detail:null, products:[], need_group:null, source:'Website', marketing_note:null, created_by:'creator', assigned_to:'sale', assigned_at:'2026-11-02T00:00:00Z', status:'consulting', next_contact_on:null, revenue:null, lost_reason:null, closed_at:null, created_at:'2026-11-01T00:00:00Z', updated_at:'2026-11-06T00:00:00Z', ...extra });
it('shows unassigned only when allowed and waiting directly after all for Sale', () => {
  expect(signalStatusTabs(false).map(x=>x.k)).toEqual(['all','waiting','contacting','consulting','quoted','deposit','won','lost']);
  expect(signalStatusTabs(true).map(x=>x.k)).toEqual(['all','unassigned','waiting','contacting','consulting','quoted','deposit','won','lost']);
});
it('prioritizes unassigned then oldest waiting then active then ended across hundreds of rows', () => {
  const rows = [...Array.from({length:574},(_,i)=>row(`active-${i}`)),row('waiting-new',{status:'waiting',list_wait_since:'2026-11-05T00:00:00Z'}),row('waiting-old',{status:'waiting',list_wait_since:'2026-11-02T00:00:00Z'}),row('unassigned',{status:null,assigned_to:null}),row('won',{status:'won'})];
  const sorted = sortSignals(rows,'priority');
  expect(sorted.slice(0,3).map(s=>s.id)).toEqual(['unassigned','waiting-old','waiting-new']);
  expect(sorted.at(-1)?.id).toBe('won');
});
it('uses stable ID ties and real assigned/creation fallback without changing inputs',()=>{
  const rows=[row('b',{status:'waiting'}),row('a',{status:'waiting'}),row('old',{status:'waiting',assigned_at:null,created_at:'2026-10-01T00:00:00Z'})];
  expect(sortSignals(rows,'priority').map(s=>s.id)).toEqual(['old','a','b']);
  expect(rows.map(s=>s.id)).toEqual(['b','a','old']);
});
it('retains filters and explicit newest sorting without injecting waiting into other statuses',()=>{
  const rows=[row('waiting',{status:'waiting'}),row('new',{status:'quoted',created_at:'2026-11-07T00:00:00Z'}),row('old',{status:'quoted'})];
  expect(sortSignals(applyListFilter(rows,{quick:'quoted',time:''}),'priority').map(s=>s.id)).toEqual(['new','old']);
  expect(sortSignals(rows,'newest')[0]?.id).toBe('new');
  expect(matchesSignalStatus(row('x',{status:null,assigned_to:null}),'unassigned')).toBe(true);
});
it('leaving waiting immediately changes priority while cancellation remains last',()=>{
  const waiting=row('waiting',{status:'waiting'}),active=row('active',{updated_at:'2026-11-07T00:00:00Z'});
  expect(sortSignals([active,waiting],'priority')[0]?.id).toBe('waiting');
  expect(sortSignals([active,{...waiting,status:'contacting'}],'priority')[0]?.id).toBe('active');
  expect(sortSignals([row('cancelled',{cancelled_at:'2026-11-07T00:00:00Z',status:null,assigned_to:null}),active],'priority').at(-1)?.id).toBe('cancelled');
});
it('work puts all four unassigned and two waiting records before 573 active records',()=>{
  const rows=[...Array.from({length:573},(_,i)=>row(`active-${i}`,{list_work_priority:2})),...Array.from({length:4},(_,i)=>row(`unassigned-${i}`,{status:null,assigned_to:null})),row('waiting-new',{status:'waiting',assigned_at:'2026-11-05T00:00:00Z'}),row('waiting-old',{status:'waiting'})];
  expect(sortSignals(rows,'work').slice(0,6).map(s=>s.id)).toEqual(['unassigned-0','unassigned-1','unassigned-2','unassigned-3','waiting-old','waiting-new']);
  expect(sortSignals(rows,'priority').map(s=>s.id)).toEqual(sortSignals(rows,'work').map(s=>s.id));
});
it('work retires deadline ranks and retains four groups',()=>{
  const rows=[row('closed',{status:'won',list_work_priority:2}),row('other',{potential:'high',next_contact_on:'2026-01-01'}),row('soon',{list_work_priority:4}),row('today',{list_work_priority:3}),row('overdue',{list_work_priority:2}),row('waiting',{status:'waiting',list_work_priority:2}),row('unassigned',{status:null,assigned_to:null,list_work_priority:2})];
  expect(sortSignals(rows,'work').map(s=>s.id)).toEqual(['unassigned','waiting','other','overdue','soon','today','closed']);
});
it('Sale waiting leads and old deadlines cannot reorder active signals',()=>{
  const rows=[row('a',{list_work_priority:2}),row('b',{list_work_priority:5}),row('waiting',{status:'waiting'})];
  const deadline=(signal_id:string,deadline_state:DeadlineRow['deadline_state']):DeadlineRow=>({signal_id,deadline_state,sale_id:'sale',sequence:1,due_on:'2026-11-07',next_due_on:'2026-11-14',calculated_at:'2026-11-07T00:00:00Z',overdue_days:0});
  expect(sortSignals(rows,'work',{a:deadline('a','updated'),b:deadline('b','overdue')}).map(s=>s.id)).toEqual(['waiting','a','b']);
});