import { describe, expect, it } from 'vitest';
import {
  timingTotals, timingDaily, uniqueEmployeeDays, timeInVietnam, dateInVietnam,
  type K3TimingEntry,
} from './timing';

const row = (overrides: Partial<K3TimingEntry> = {}): K3TimingEntry => ({
  date: '2026-11-16',
  user_id: 'member-a',
  full_name: 'Nhân viên A',
  unit_id: 'showroom-hanoi',
  unit_name: 'Showroom Hà Nội',
  block_id: 'showroom-block',
  block_name: 'Khối Showroom',
  position: 'Nhân viên',
  planned_at: null,
  work_created_at: null,
  summarized_at: null,
  summary_source: null,
  plan_deadline: '2026-11-16T01:45:00Z',
  summary_deadline: '2026-11-16T10:00:00Z',
  plan_status: 'no_record',
  summary_status: 'no_record',
  multi_unit: false,
  ...overrides,
});

describe('3K management timeline statistics', () => {
  it('does not treat missing timestamps as completed or automatically late', () => {
    expect(timingTotals([row()])).toEqual({
      peopleDays: 1, planned:0, planOnTime:0,planLate:0,
      hasWorkOnly:0,summarized:0,summaryOnTime:0,summaryLate:0,
      noPlanRecord:1,noSummaryRecord:1,
    });
  });
  it('separates actual legacy plan stamps, new review summaries and work creation only', () => {
    const items = [
      row({user_id:'a',planned_at:'2026-11-16T01:30:00Z',plan_status:'on_time',
        summarized_at:'2026-11-16T09:00:00Z',summary_source:'employee_review',summary_status:'on_time'}),
      row({user_id:'b',planned_at:'2026-11-16T04:00:00Z',plan_status:'late',
        summarized_at:'2026-11-16T11:15:00Z',summary_status:'late'}),
      row({user_id:'c',work_created_at:'2026-11-16T02:30:00Z',plan_status:'work_only'}),
    ];
    expect(timingTotals(items)).toMatchObject({
      peopleDays:3,planned:2,planOnTime:1,planLate:1,hasWorkOnly:1,
      summarized:2,summaryOnTime:1,summaryLate:1,noPlanRecord:0,
    });
  });
  it('deduplicates concurrent appointments per person/day but preserves daily trend', () => {
    const duplicate = [
      row({unit_id:'hanoi',planned_at:'2026-11-16T02:00:00Z',plan_status:'late'}),
      row({unit_id:'another-appointment'}),
      row({user_id:'b',date:'2026-11-15'}),
    ];
    expect(uniqueEmployeeDays(duplicate)).toHaveLength(2);
    expect(timingTotals(duplicate).peopleDays).toBe(2);
    expect(timingDaily(duplicate).map(x=>[x.date,x.peopleDays])).toEqual([
      ['2026-11-15',1],['2026-11-16',1],
    ]);
  });
  it('formats stored UTC instants in Vietnam local time', () => {
    expect(timeInVietnam('2026-11-16T01:45:00Z')).toBe('08:45');
    expect(dateInVietnam('2026-11-16')).toBe('16/11/2026');
  });
});
