import {describe,it,expect} from 'vitest';
import {discipline,evaluable,metricState,ranking,type DashboardMetric,type DashboardObligation} from './dashboard';
const metric=(actual:string|null,complete=true,percent:string|null='55'):DashboardMetric=>({metric_key:'revenue',group_id:actual??'none',group_name:actual??'missing',definition:{name:'Doanh số',unit:'VNĐ',aggregation:'sum',direction:'higher',value_kind:'money',description:null},actual,target:'1000000000',difference:null,percent,complete,expected:1,received:actual===null?0:1,missing_months:[]});
describe('dashboard business rules',()=>{
it('late submission is never overdue unsubmitted',()=>{const rows=['late','overdue','ontime','soon'].map(time_status=>({time_status,first_submitted_at:['late','ontime'].includes(time_status)?'2026-01-01':null})) as DashboardObligation[];expect(discipline(rows)).toMatchObject({required:4,submitted:2,ontime:1,late:1,overdue:1,soon:1});});
it('missing data cannot be evaluated as failed or achieved',()=>{expect(evaluable(metric('550000000',false))).toBe(false);expect(metricState(metric('550000000',false))).toBe('Chưa đủ dữ liệu');});
it('zero actual is valid and ranked but missing actual is not',()=>{const rows=ranking([metric(null,false,null),metric('0',true,'0')]);expect(rows).toHaveLength(1);expect(rows[0].item.actual).toBe('0');});
it('unsupported ratios or zero target cannot invent a score',()=>{expect(evaluable(metric('0',true,null))).toBe(false);expect(evaluable({...metric('100'),definition:{...metric('100').definition,aggregation:'ratio'}})).toBe(false);});
it('ongoing year does not label below 100 percent as failed',()=>{expect(metricState(metric('550000000'),true)).toBe('Theo dõi lũy kế');});
it('ties share rank',()=>{expect(ranking([metric('100',true,'100'),metric('100',true,'100'),metric('50',true,'50')]).map(i=>i.rank)).toEqual([1,1,3]);});
it('ranking distinguishes large values differing by one without rounding',()=>{expect(ranking([metric('99999999999999999998'),metric('99999999999999999999')],'actual').map(i=>i.item.actual)).toEqual(['99999999999999999999','99999999999999999998']);});
});