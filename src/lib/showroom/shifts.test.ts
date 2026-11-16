import {describe,expect,it} from 'vitest';
import {dateAdd,mondayOf,weekLabel,restCount,SHIFT_LABELS} from './shifts';

describe('Showroom mobile weekly shifts',()=>{
  it('starts every week on Monday, including Sunday and month boundaries',()=>{
    expect(mondayOf('2026-11-16')).toBe('2026-11-16');
    expect(mondayOf('2026-11-22')).toBe('2026-11-16');
    expect(dateAdd('2026-11-30',7)).toBe('2026-12-07');
    expect(weekLabel('2026-11-23')).toContain('23/11');
  });
  it('supports one variable weekly rest day without imposing fixed Sunday',()=>{
    expect(restCount(['off','early','late','early','late','early','late'],'2026-11-23',[])).toBe(1);
    expect(restCount(['early','early','late','late','early','late','off'],'2026-11-23',[])).toBe(1);
  });
  it('does not count public holiday off as a weekly rest day',()=>{
    expect(restCount(['off','early','late','late','early','late','off'],'2026-11-23',['2026-11-29'])).toBe(1);
  });
  it('keeps full shifts distinct from two separate employees',()=>{
    expect(SHIFT_LABELS.full).toBe('Ca Full');
    expect(SHIFT_LABELS.early).not.toBe(SHIFT_LABELS.late);
  });
});
