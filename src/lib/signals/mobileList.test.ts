import { describe, expect, it } from 'vitest';
import { appliedSignalFilters, mobileNeed, signalContact } from './mobileList';
import type { Signal } from './catalog';

describe('Mobile signal presentation rules', () => {
  it('uses the actual need before categories without inventing a summary', () => {
    const s = { need_detail: '  Bộ quà gốm in logo cuối năm  ', need_group: 'Sứ quà tặng', products: ['Ấm chén'] } as Signal;
    expect(mobileNeed(s)).toBe('Bộ quà gốm in logo cuối năm');
    expect(mobileNeed({ ...s, need_detail: null })).toBe('Sứ quà tặng');
    expect(mobileNeed({ ...s, need_detail: null, need_group: null, products: [] })).toBeNull();
  });
  it('creates call links only for valid existing numbers', () => {
    expect(signalContact('0989 123 456')).toEqual({ phone: '0989123456', tel: 'tel:0989123456' });
    expect(signalContact('')).toBeNull();
    expect(signalContact('0989***456')).toBeNull();
    expect(signalContact('abc')).toBeNull();
  });
  it('counts combined applied filters, not search or custom date endpoints twice', () => {
    expect(appliedSignalFilters({ quick: 'consulting', q: 'Khách', time: 'custom', from: '2026-11-01', to: '2026-11-06', potential: 'high', labelId: 'shared' }, 'overdue', 'all')).toBe(5);
    expect(appliedSignalFilters({ quick: 'all', time: '' }, null, 'all')).toBe(0);
  });
});