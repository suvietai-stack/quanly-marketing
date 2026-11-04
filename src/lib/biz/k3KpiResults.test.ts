import { describe, expect, it } from 'vitest';
import { k3ReplaceDaily, k3RequiredStatus, k3ResultPreview, type K3DailyValue, type K3Measurement } from './k3KpiResults';

const base: K3Measurement = { measure: 'cumulative', condition: 'gte', target: 200 };
describe('KPI theo tổng ngày', () => {
  it('sáng 20 chiều nhập tổng mới 30: ngày là 30, không phải 50', () => {
    const rows = k3ReplaceDaily([{ user_id: 'sale', work_date: '2026-11-04', value: 20 }], { user_id: 'sale', work_date: '2026-11-04', value: 30 });
    expect(rows).toHaveLength(1);
    expect(k3ResultPreview(base, rows)).toMatchObject({ actual: 30, progress: 15 });
  });
  it('20 + 30 = 50/200, 25%; sửa 30 thành 25 không cộng 55', () => {
    let rows = [{ user_id: 'a', work_date: '2026-11-04', value: 20 }, { user_id: 'a', work_date: '2026-11-05', value: 30 }];
    expect(k3ResultPreview(base, rows)).toMatchObject({ actual: 50, progress: 25, attained: false });
    rows = k3ReplaceDaily(rows, { user_id: 'a', work_date: '2026-11-05', value: 25 });
    expect(k3ResultPreview(base, rows).actual).toBe(45);
    rows = k3ReplaceDaily(rows, { user_id: 'a', work_date: '2026-11-06', value: 15 });
    expect(k3ResultPreview(base, rows).actual).toBe(60);
    expect(k3ReplaceDaily(rows, rows[2]).length).toBe(3);
  });
  it('250/200 hiển thị 125%', () => expect(k3ResultPreview(base, [{ value: 250 }]).progress).toBe(125));
  it('hai người đóng góp 20 và 15 cùng ngày = 35', () => expect(k3ResultPreview(base, [{ value: 20 }, { value: 15 }]).actual).toBe(35));
  it('không có kết quả thì chưa bắt đầu, không coi thiếu là 0 đã đạt', () => expect(k3ResultPreview({ ...base, condition: 'lte', target: 2 }, [])).toEqual({ actual: null, progress: null, attained: null, status: 'not_started' }));
});
describe('công thức phương thức đo', () => {
  const calc = (measure: K3Measurement['measure'], rows: K3DailyValue[], extra: Partial<K3Measurement> = {}) => k3ResultPreview({ ...base, measure, ...extra }, rows);
  it('không trùng dựa trên định danh đối tượng', () => expect(calc('distinct', [{ objects: ['A', 'B'] }, { objects: ['B', 'C'] }]).actual).toBe(3));
  it('giá trị hiện tại không cộng dồn', () => expect(calc('current', [{ value: 20 }, { value: 30 }]).actual).toBe(30));
  it('tỷ lệ là tổng tử/tổng mẫu, không cộng phần trăm', () => expect(calc('ratio', [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 8 }]).actual).toBe(20));
  it('trung bình có trọng số quan sát', () => expect(calc('average', [{ numerator: 10, denominator: 2 }, { numerator: 90, denominator: 3 }]).actual).toBe(20));
  it('mẫu số 0 không đủ dữ liệu', () => expect(calc('ratio', [{ numerator: 0, denominator: 0 }]).attained).toBeNull());
  it('mốc chỉ tính tiêu chí cấu hình, không đếm trùng', () => expect(calc('milestone', [{ completed: ['a'] }, { completed: ['a', 'b'] }], { milestones: ['a', 'b'] })).toMatchObject({ actual: 2, progress: 100, attained: true }));
  it('thời lượng cộng theo phút', () => expect(calc('duration', [{ value: 60 }, { value: 30 }]).actual).toBe(90));
  it('tỷ lệ lỗi ≤ 2% không tạo phần trăm cải thiện giả', () => expect(calc('ratio', [{ numerator: 1, denominator: 100 }], { target: 2, condition: 'lte' })).toMatchObject({ attained: true, progress: null }));
  it('điều kiện bằng mục tiêu', () => expect(calc('current', [{ value: 20 }], { target: 20, condition: 'eq' }).attained).toBe(true));
  it('điều kiện trong khoảng', () => expect(calc('current', [{ value: 20 }], { target: 10, target_max: 15, condition: 'range' }).attained).toBe(false));
});
it('KF có 3 KPI bắt buộc: đạt 2/3 chưa hoàn thành, đạt đủ 3 mới hoàn thành', () => {
  const done = k3ResultPreview(base, [{value:200}]);
  const open = k3ResultPreview(base, [{value:100}]);
  expect(k3RequiredStatus([{required:true,metric:done},{required:true,metric:done},{required:true,metric:open}])).toEqual({total:3,attained:2,status:'in_progress'});
  expect(k3RequiredStatus(Array.from({length:3},()=>({required:true,metric:done})))).toEqual({total:3,attained:3,status:'done'});
});
it('không có KPI bắt buộc thì không tự kết luận KG hoàn thành từ KF', () => {
  expect(k3RequiredStatus([]).status).toBe('not_started');
});