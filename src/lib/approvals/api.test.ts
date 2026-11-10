import { describe, it, expect } from 'vitest';
import { sortTodo, filterItems, waitingText, badgeText, sourceGroup, vnd, type ApprovalItem } from './api';

const item = (patch: Partial<ApprovalItem> = {}): ApprovalItem => ({
  source: 'finance', id: '1', title: 'Đề nghị thanh toán', requester: 'Nguyễn Văn A', url: '/finance/payment?open=1', ...patch,
});

describe('sortTodo', () => {
  it('puts overdue first, then longest waiting, then newer', () => {
    const items = [
      item({ id: 'new', waiting_since: '2026-11-10T08:00:00Z' }),
      item({ id: 'old', waiting_since: '2026-11-01T08:00:00Z' }),
      item({ id: 'overdue', overdue: true, waiting_since: '2026-11-09T08:00:00Z' }),
    ];
    expect(sortTodo(items).map((i) => i.id)).toEqual(['overdue', 'old', 'new']);
  });
});

describe('filterItems', () => {
  const items = [
    item({ id: 'fr', source: 'finance', code: 'TT-00025', summary: 'Thanh toán mua vật tư' }),
    item({ id: 'leave', source: 'leave', requester: 'Trần Thị B', title: 'Đơn nghỉ phép' }),
    item({ id: 'biz', source: 'biz', title: 'Báo cáo Kinh doanh' }),
  ];
  it('filters by group', () => {
    expect(filterItems(items, '', 'hr').map((i) => i.id)).toEqual(['leave']);
    expect(filterItems(items, '', 'finance').map((i) => i.id)).toEqual(['fr']);
  });
  it('searches across requester, code, title, summary', () => {
    expect(filterItems(items, 'tt-00025', 'all').map((i) => i.id)).toEqual(['fr']);
    expect(filterItems(items, 'trần', 'all').map((i) => i.id)).toEqual(['leave']);
    expect(filterItems(items, 'vật tư', 'all').map((i) => i.id)).toEqual(['fr']);
  });
});

describe('sourceGroup', () => {
  it('maps every source to a filter group', () => {
    expect(sourceGroup('finance')).toBe('finance');
    expect(sourceGroup('leave')).toBe('hr');
    expect(sourceGroup('leave_cancel')).toBe('hr');
    expect(sourceGroup('attendance')).toBe('hr');
    expect(sourceGroup('account')).toBe('hr');
    expect(sourceGroup('biz')).toBe('biz');
    expect(sourceGroup('design')).toBe('design');
    expect(sourceGroup('order_tracking')).toBe('order');
  });
});

describe('waitingText', () => {
  const now = '2026-11-10T10:00:00Z';
  it('formats minutes, hours and days in Vietnamese', () => {
    expect(waitingText('2026-11-10T09:45:00Z', now)).toBe('15 phút');
    expect(waitingText('2026-11-10T06:00:00Z', now)).toBe('4 giờ');
    expect(waitingText('2026-11-07T06:00:00Z', now)).toBe('3 ngày');
    expect(waitingText('2026-11-10T10:00:00Z', now)).toBe('vừa xong');
  });
  it('returns empty for invalid input', () => {
    expect(waitingText(undefined, now)).toBe('');
    expect(waitingText('not-a-date', now)).toBe('');
  });
});

describe('badgeText', () => {
  it('hides zero and caps at 99+', () => {
    expect(badgeText(0)).toBe('');
    expect(badgeText(3)).toBe('3');
    expect(badgeText(120)).toBe('99+');
  });
});

describe('vnd', () => {
  it('formats Vietnamese currency and rejects invalid numbers', () => {
    expect(vnd(5000000)).toBe('5.000.000đ');
    expect(vnd('abc')).toBe('');
  });
});
