import { expect,it } from 'vitest';
import { k3DailyReport,type K3ReportPerson } from './k3DailyReport';
const person = (id:string): K3ReportPerson => ({user_id:id,department_id:'dep',data:{name:id,department:'Phòng A',updated:true,actions:[{id:'shared',goal_id:'g',updated:true,overdue:true,metric:{status:'in_progress'}}],results:[{kpi_id:'k',value:20}]}});
it('shared KF and KG are counted once across two sales',() => {
  const text = k3DailyReport('2026-11-04',[person('A'),person('B')],{k:'đại lý'});
  expect(text).toContain('1 KG / 1 KF'); expect(text).toContain('Đã cập nhật 2'); expect(text).toContain('+20 đại lý');
});
it('large teams summarize by department instead of listing every person',() => {
  const text = k3DailyReport('2026-11-04',Array.from({length:13},(_,i)=>person(`sale-${i}`)));
  expect(text).toContain('Phòng A: 13/13'); expect(text).not.toContain('sale-12:');
});
it('no update is never reported as updated',() => {
  const p = person('C');p.data.updated=false;p.data.results=[];
  expect(k3DailyReport('2026-11-04',[p])).toContain('Đã cập nhật 0 · Chưa cập nhật 1');
});