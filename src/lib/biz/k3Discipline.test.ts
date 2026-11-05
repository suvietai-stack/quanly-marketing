import { expect, it } from 'vitest';
import { disciplineTotals, type K3DisciplineDay } from './k3Discipline';
const row = (changes: Partial<K3DisciplineDay>): K3DisciplineDay => ({user_id:'u',name:'Sale',department:null,date:'2026-11-05',obligated:true,plan_status:'on_time',plan_source:'scheduled',manual_status:'none',summary_late:false,confirmed_at:null,system_status:'auto_closed',...changes});
it('discipline denominator counts only valid obligation days, not holidays or approved leave', () => {
  expect(disciplineTotals([row({}),row({obligated:false,plan_status:'na'})])).toMatchObject({required:1,planOnTime:1});
});
it('a late plan never counts as on time', () => {
  expect(disciplineTotals([row({plan_status:'late'})])).toMatchObject({required:1,planOnTime:0,planLate:1});
});
it('automatic close does not count as employee review', () => {
  expect(disciplineTotals([row({system_status:'auto_closed'})])).toMatchObject({reviewOnTime:0,reviewMissing:1});
});
it('late review and reconfirmation are separate from on-time review', () => {
  expect(disciplineTotals([row({manual_status:'reviewed',summary_late:true}),row({manual_status:'reconfirm'})])).toMatchObject({reviewOnTime:0,reviewLate:1,reconfirm:1});
});