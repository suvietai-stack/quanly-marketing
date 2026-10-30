import {describe,expect,it} from 'vitest';
import {aggregate,children,sumDec,tone,type HFact} from './hierarchy';
const def=(name:string,code:string|null,unit='VNĐ',value_kind='money')=>({name,code,unit,aggregation:'sum',direction:'higher',value_kind} as unknown as HFact['definition']);
const f=(o:Partial<HFact>):HFact=>({user_id:'u1',month:1,baseline_id:'b',target_version_id:null,definition:def('Doanh số','revenue'),target:'100',actual:'50',system_id:'s1',system_name:'Đơn Hàng',department_id:'d1',department_name:'P1',team_id:null,...o} as HFact);
describe('hierarchy dashboard',()=>{
 it('gộp hai KR Doanh số cùng mã chuẩn dù khác chữ hoa',()=>{const r=aggregate([f({}),f({user_id:'u2',department_id:'d2',definition:def('Doanh số','revenue'),target:'300',actual:'250'})],1,12);expect(r).toHaveLength(1);expect(r[0].target).toBe('400');expect(r[0].actual).toBe('300');expect(r[0].percent).toBe(75);});
 it('không gộp KR khác đơn vị dù cùng mã',()=>{expect(aggregate([f({}),f({user_id:'u2',definition:def('Doanh số','revenue','Đơn','count')})],1,12)).toHaveLength(2);});
 it('không gộp KR chưa có mã chỉ vì cùng tên khác đơn vị',()=>{expect(aggregate([f({definition:def('Doanh số',null)}),f({user_id:'u2',definition:def('Doanh số',null,'USD')})],1,12)).toHaveLength(2);});
 it('tháng thiếu báo cáo không tính là 0 và đánh dấu chưa đủ',()=>{const r=aggregate([f({}),f({month:2,actual:null})],1,12)[0];expect(r.actual).toBe('50');expect(r.complete).toBe(false);expect(tone(r)).toBe('muted');});
 it('tỷ lệ cộng dồn = tổng thực tế / tổng mục tiêu, không trung bình tỷ lệ',()=>{const r=aggregate([f({target:'100',actual:'100'}),f({user_id:'u2',target:'900',actual:'0'})],1,12)[0];expect(r.percent).toBe(10);});
 it('cộng thập phân chính xác',()=>{expect(sumDec(['0.1','0.2'])).toBe('0.3');expect(sumDec(['123456789012345678','1'])).toBe('123456789012345679');});
 it('Phòng không có Nhóm hiển thị trực tiếp nhân viên; Hệ trống vẫn xuất hiện',()=>{expect(children([f({})],{system:'s1',department:'d1'}).axis).toBe('employee');const all=children([f({})],{},[{id:'s1',name:'Đơn Hàng'},{id:'s3',name:'Bán Lẻ'}]);expect(all.items.map(i=>i.name)).toContain('Bán Lẻ');expect(all.items.find(i=>i.id==='s3')!.facts).toHaveLength(0);});
 it('màu: ≥100 đạt, ≥90 gần đạt, còn lại chưa đạt',()=>{expect(tone({complete:true,percent:100})).toBe('success');expect(tone({complete:true,percent:92})).toBe('warning');expect(tone({complete:true,percent:50})).toBe('destructive');});
});
