import { expect,it } from 'vitest';
import { k3PeriodBounds,k3UnitActuals,k3ActionMetrics,k3PeriodCounts,type K3PeriodTask } from './k3Periods';
import { k3DisplayStatus,k3Counts } from './k3';
it('tuần giao năm 28/12/2026–03/01/2027',()=>expect(k3PeriodBounds('week','2027-01-01')).toEqual({start:'2026-12-28',end:'2027-01-03'}));
it('đổi chế độ giữ ngữ cảnh tháng 11/2026',()=>expect(k3PeriodBounds('month','2026-11-10')).toEqual({start:'2026-11-01',end:'2026-11-30'}));
it('tháng có tuần thứ năm/sáu không bị cắt tại bốn tuần',()=>expect(k3PeriodBounds('month','2026-08-01').end).toBe('2026-08-31'));
it('một việc một thực tế; đơn vị khác không cộng chung, chưa xếp lịch không tính',()=>{
 const a={id:'a',kpi_unit:'cuộc gọi',kpi_actual:10,is_unscheduled:false} as K3PeriodTask;
 expect(k3UnitActuals([a,a,{...a,id:'b',kpi_unit:'báo giá',kpi_actual:3},{...a,id:'c',is_unscheduled:true}])).toEqual([{unit:'cuộc gọi',actual:10},{unit:'báo giá',actual:3}]);
});
it('không cộng chỉ tiêu KF với kết quả việc con; 8/10 là 80%',()=>{
 const m=k3ActionMetrics({id:'kf',kpi_target:10,kpi_unit:'khách'} as never,[{id:'t',action_id:'kf',kpi_actual:8,kpi_unit:'khách',status:'doing',is_unscheduled:false}] as never);
 expect(m.actual).toBe(8);expect(m.kpiProgress).toBe(80);expect(m.workProgress).toBe(0);
});
it('chưa xếp lịch không tự quá hạn',()=>expect(k3PeriodCounts([{is_unscheduled:true,work_date:'2020-01-01',status:'todo'}] as never,'2026-11-03').overdue).toBe(0));
it('dữ liệu cũ Hoàn thành 5/50 không tính đạt hoặc hiển thị 100%',()=>{
 const t={status:'done',kpi_target:50,kpi_actual:5,progress:100} as const;
 expect(k3DisplayStatus(t)).toBe('incomplete');expect(k3Counts([t] as never).done).toBe(0);
});