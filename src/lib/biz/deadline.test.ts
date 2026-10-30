import { expect,it } from 'vitest';
import { deadlinePreview } from './deadline';
it('March plan before February 28 uses Vietnam local date',()=>expect(deadlinePreview('plan_month',{day:28,phase:'before'},2027,3)).toBe('2027-02-28 17:00'));
it('March report after April 3 preserves hour and minute',()=>expect(deadlinePreview('report_month',{day:3,phase:'after',hour:8,minute:30},2027,3)).toBe('2027-04-03 08:30'));
it('clamps February to leap year last day',()=>expect(deadlinePreview('plan_month',{day:31,phase:'before'},2028,3)).toBe('2028-02-29 17:00'));
it('specific year/period exception wins',()=>expect(deadlinePreview('goal_year',{day:28,phase:'before',exceptions:{'2027-01':'2026-12-20T10:15'}},2027,1)).toBe('2026-12-20 10:15'));
it('Q4 report after moves to following year',()=>expect(deadlinePreview('report_quarter',{day:3,phase:'after'},2027,4)).toBe('2028-01-03 17:00'));