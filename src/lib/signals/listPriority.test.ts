import { expect, it } from 'vitest';
import { matchesSignalStatus, signalStatusTabs } from './listPriority';
import { sortSignals } from './potential';
import { applyListFilter } from './report';
import type { Signal } from './catalog';
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