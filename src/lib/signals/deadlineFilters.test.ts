import { expect,it } from 'vitest';
import { deadlineCounts } from './deadlineFilters';
import { applyListFilter,type ListFilter } from './report';
import type { Signal } from './catalog';
import type { DeadlineRow } from './deadlines';

const rows = [
  {id:'1',status:'consulting',assigned_to:'sale-a',potential:'high',detected_on:'2026-11-06'},
  {id:'2',status:'consulting',assigned_to:'sale-b',potential:'high',detected_on:'2026-11-06'},
  {id:'3',status:'quoted',assigned_to:'sale-a',potential:'low',detected_on:'2026-11-05'},
  {id:'4',status:'consulting',assigned_to:'sale-a',potential:'high',detected_on:'2026-11-06'},
  {id:'5',status:'won',assigned_to:'sale-a',potential:'high',detected_on:'2026-11-06'},
].map(s=>({...s,address:null,need_detail:null,need_group:null,source:'Website',marketing_note:null,created_by:'sale-a',assigned_at:null,next_contact_on:null,revenue:null,lost_reason:null,closed_at:null,created_at:'2026-11-06T01:00:00Z',customer_name:'Khách',phone:'09',products:[],need_groups:[],updated_at:'2026-11-06T01:00:00Z'} as Signal));
const deadlines=Object.fromEntries(['today','soon','overdue','updated','ok'].map((state,i)=>[String(i+1),{deadline_state:state}])) as Record<string,DeadlineRow>;
it('four deadline counts use distinct authoritative states and deduplicate signal IDs',()=>{
 expect(deadlineCounts([...rows,rows[0]],deadlines)).toEqual({all:5,today:1,soon:1,overdue:1});
});
it('counts recalculate for combined status, potential, Sale and time filters',()=>{
 const f:ListFilter={quick:'consulting',potential:'high',saleId:'sale-a',time:'today'};
 expect(deadlineCounts(applyListFilter(rows,f,'2026-11-06'),deadlines)).toEqual({all:2,today:1,soon:0,overdue:0});
 expect(deadlineCounts(applyListFilter(rows,{...f,saleId:'sale-b'},'2026-11-06'),deadlines)).toEqual({all:1,today:0,soon:1,overdue:0});
 expect(deadlineCounts(applyListFilter(rows,{quick:'quoted',time:''},'2026-11-06'),deadlines)).toEqual({all:1,today:0,soon:0,overdue:1});
});
it('missing deadlines stay in All without inferring dates or overdue state',()=>{
 expect(deadlineCounts(rows,{})).toEqual({all:5,today:0,soon:0,overdue:0});
});