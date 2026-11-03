import { describe, expect, it } from 'vitest';
import { hasText, k3Counts, k3Error, k3LateFlags, k3ProgressLabel, k3Ratio, k3VngbComplete, type K3Settings } from './k3';

const settings: K3Settings = {
  enabled: true, effective_from: '2026-11-02', plan_by: '08:45:00', summary_by: '18:00:00', max_focus: 3,
  updated_at: null, can_use: true, can_view_scope: false, can_comment: false, can_settings: false, today: '2026-11-02',
};

describe('k3Ratio / k3ProgressLabel', () => {
  it('tính đúng tỷ lệ theo số lượng', () => {
    expect(k3Ratio({ kpi_target: 10, kpi_actual: 8 })).toBe(80);
  });
  it('cho phép kết quả vượt kế hoạch trên 100%', () => {
    expect(k3Ratio({ kpi_target: 10, kpi_actual: 12 })).toBe(120);
    expect(k3ProgressLabel({ kpi_target: 10, kpi_actual: 12, progress: 100 })).toBe('120%');
  });
  it('công việc không đo số dùng phần trăm tự nhập', () => {
    expect(k3Ratio({ kpi_target: null, kpi_actual: null })).toBeNull();
    expect(k3ProgressLabel({ kpi_target: null, kpi_actual: null, progress: 60 })).toBe('60%');
  });
  it('kế hoạch 0 không chia cho 0', () => {
    expect(k3Ratio({ kpi_target: 0, kpi_actual: 5 })).toBeNull();
  });
});

describe('k3VngbComplete', () => {
  it('bắt buộc đủ Vấn đề - Nguyên nhân - Giải pháp', () => {
    expect(k3VngbComplete({ problem: 'a', cause: 'b', solution: 'c' })).toBe(true);
    expect(k3VngbComplete({ problem: 'a', cause: '', solution: 'c' })).toBe(false);
  });
  it('chuỗi khoảng trắng không vượt được kiểm tra', () => {
    expect(k3VngbComplete({ problem: '   ', cause: 'b', solution: 'c' })).toBe(false);
    expect(hasText('  ')).toBe(false);
  });
});

describe('k3Counts', () => {
  it('đếm đúng các trạng thái và mũi khoan', () => {
    const c = k3Counts([
      { status: 'done', is_focus: true },
      { status: 'doing', is_focus: true },
      { status: 'incomplete', is_focus: false, problem: 'x', solution: 'y' },
    ] as never);
    expect(c).toEqual({ total: 3, done: 1, doing: 1, open: 2, focus: 2, issues: 1 });
  });
});

describe('k3LateFlags', () => {
  it('09:10 giờ Việt Nam là lập muộn 25 phút, không lấy giờ UTC', () => {
    const flags = k3LateFlags({ planned_at: '2026-11-02T02:10:00Z', summarized_at: null } as never, settings, '2026-11-02');
    expect(flags.planLate).toBe(true);
    expect(flags.planLateMinutes).toBe(25);
  });
  it('08:30 Việt Nam đúng hạn', () => {
    expect(k3LateFlags({ planned_at: '2026-11-02T01:30:00Z' } as never, settings, '2026-11-02').planLate).toBe(false);
  });
  it('00:10 Việt Nam thuộc ngày sau dù timestamp UTC thuộc ngày trước', () => {
    expect(k3LateFlags({ planned_at: '2026-11-01T17:10:00Z' } as never, settings, '2026-11-02').planLate).toBe(false);
  });
  it('lập ở ngày sau vẫn là muộn so với ngày cần lập', () => {
    expect(k3LateFlags({ planned_at: '2026-11-02T17:01:00Z' } as never, settings, '2026-11-02').planLate).toBe(true);
  });
  it('ghi nhận lập trễ và tổng kết trễ theo mốc cài đặt', () => {
    const day = { planned_at: '2026-11-02T09:10:00', summarized_at: '2026-11-02T18:30:00' } as never;
    const flags = k3LateFlags(day, settings, '2026-11-02');
    expect(flags.planLate).toBe(true);
    expect(flags.summaryLate).toBe(true);
  });
  it('ngày quá khứ chưa tổng kết là quá hạn', () => {
    const flags = k3LateFlags({ planned_at: '2026-11-01T08:00:00', summarized_at: null } as never, { ...settings, effective_from: '2026-10-01' }, '2026-11-01');
    expect(flags.summaryOverdue).toBe(true);
    expect(flags.planLate).toBe(false);
  });
});

describe('k3Error', () => {
  it('không bao giờ trả về [object Object]', () => {
    expect(k3Error(new Error('Lỗi máy chủ'))).toBe('Lỗi máy chủ');
    expect(k3Error({ message: 'Từ RPC' })).toBe('Từ RPC');
    expect(k3Error({})).not.toContain('[object');
  });
});
