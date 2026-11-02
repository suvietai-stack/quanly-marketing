import { expect, it } from 'vitest';
import { distributeExact, remainingTarget, rollingError, type RollingBasis } from './rollingPlan';
it('1.2 billion less January 70 million leaves 1.13 billion', () => expect(remainingTarget('1200000000','70000000')).toBe('1130000000'));
it('January 150 million leaves 1.05 billion', () => expect(remainingTarget('1200000000','150000000')).toBe('1050000000'));
it('exceeding the annual commitment leaves zero', () => expect(remainingTarget('1200000000','1300000000')).toBe('0'));
it('11 months split VND exactly without rounding loss', () => {
 const rows = distributeExact('1130000000',Array(11).fill('1'));
 expect(rows.reduce((s,v)=>s+BigInt(v),0n)).toBe(1130000000n);
 expect(rows[0]).toBe('102727273'); expect(rows[10]).toBe('102727272');
});
it('order counts distribute the remainder as whole units', () => expect(distributeExact('5',['1','1','1'])).toEqual(['2','2','1']));
it('weighted allocations preserve exact seasonality', () => expect(distributeExact('11',['1','3'])).toEqual(['3','8']));
it('zero weights fall back to equal shares', () => expect(distributeExact('3',['0','0'])).toEqual(['2','1']));
const definition = {name:'Doanh số',description:null,unit:'VNĐ',aggregation:'sum' as const,value_kind:'money' as const,direction:'higher' as const};
const basis:RollingBasis={year:2026,first_month:3,official_version_id:'v',current_plan_id:null,items:[{metric_id:'m',definition,annual:'1200',months:Array(12).fill('100'),current:Array(12).fill('100'),actuals:['70',...Array(11).fill(null)],complete:true,actual:'70',remaining:'1130'}]};
const proposal=()=>[{metric_id:'m',definition,annual:'1200',months:['100','100',...distributeExact('1130',Array(10).fill('1'))]}];
it('annual commitment cannot be changed by a rolling plan',()=>expect(rollingError(proposal().map(i=>({...i,annual:'1300'})),basis)).toBe('Không được thay đổi cam kết năm.'));
it('the current and past months are locked',()=>{const items=proposal();items[0].months[0]='70';expect(rollingError(items,basis)).toBe('Không được sửa tháng hiện tại hoặc lịch sử.');});
it('missing official history blocks submission',()=>expect(rollingError(proposal(),{...basis,items:basis.items.map(i=>({...i,complete:false,remaining:null}))})).toBe('Thiếu dữ liệu chính thức của tháng đã kết thúc.'));
it('underfunding cannot be sent without correction',()=>{const items=proposal();items[0].months[11]='0';expect(rollingError(items,basis)).toBe('Tổng kế hoạch tương lai chưa đủ phần còn phải đạt.');});
it('ambition may exceed the floor without changing the annual commitment',()=>{const items=proposal();items[0].months[11]='500';expect(rollingError(items,basis)).toBeNull();expect(items[0].annual).toBe('1200');});
it('fractional counts cannot enter the proposal',()=>{const items=proposal();items[0].months[11]='1.5';expect(rollingError(items,basis)).toBe('Cần nhập đủ số nguyên không âm cho các tháng.');});
describe('stale draft rebase after month rollover',()=>{
 const metric=basis.items[0];
 it('keeps proposed values for still-editable months and follows current plan for newly locked months',()=>{
  const old=['100','100','150','150','150','150','150','150','150','150','150','150'];
  expect(rebaseMonths(metric,old,4)).toEqual(['100','100','100','150','150','150','150','150','150','150','150','150']);
 });
 it('falls back to the current plan when the old draft has no value',()=>{
  const old=Array(12).fill(null);
  expect(rebaseMonths(metric,old,3)).toEqual(metric.current);
 });
 it('detects a draft created for an earlier first month',()=>{
  const p={first_month:3,status:'draft'} as RollingProposal;
  expect(isStaleDraft(p,{...basis,first_month:4})).toBe(true);
  expect(isStaleDraft(p,basis)).toBe(false);
  expect(isStaleDraft(undefined,basis)).toBe(false);
  expect(isStaleDraft({...p,status:'approved'}, {...basis,first_month:4})).toBe(false);
 });
});
describe('month coverage labels',()=>{
 it('maps the four coverage states',()=>{
  expect(coverageLabel({status:'full',source:'reports',expected:4,received:4,missing:[]})).toBe('Đầy đủ');
  expect(coverageLabel({status:'partial',source:'reports',expected:4,received:3,missing:[]})).toBe('Chưa đầy đủ');
  expect(coverageLabel({status:'none',source:'reports',expected:4,received:0,missing:[]})).toBe('Chưa có dữ liệu');
  expect(coverageLabel({status:'na',source:'reports',expected:0,received:0,missing:[]})).toBe('Không áp dụng');
  expect(coverageLabel(null)).toBe('—');
 });
 it('lists missing obligation periods in Vietnamese',()=>{
  expect(coverageMissingText({status:'partial',source:'reports',expected:5,received:3,missing:[{period_kind:'week',year:2026,period:44,period_start:'2026-10-26',period_end:'2026-11-01'},{period_kind:'week',year:2026,period:45,period_start:'2026-11-02',period_end:'2026-11-08'}]})).toBe('Tuần 44, Tuần 45');
  expect(coverageMissingText({status:'full',source:'reports',expected:1,received:1,missing:[]})).toBe('');
 });
});
