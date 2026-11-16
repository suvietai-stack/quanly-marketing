import {describe,it,expect} from 'vitest';
import {scopeDepartmentRows} from './scope';
const distribution = 'cef13ee0-73a8-43c4-bfe5-6bef393248fc';
const sales = 'sales-department';
const records = [
  {id:'kr-distribution',department_id:distribution},
  {id:'report-sales',department_id:sales},
  {id:'plan-distribution',department_id:distribution},
];
describe('independent Distribution projection',()=>{
  it('keeps legacy Biz screen unchanged when no area scope is supplied',()=>{
    expect(scopeDepartmentRows(records)).toEqual(records);
  });
  it('shows only Distribution records, without changing record identity',()=>{
    expect(scopeDepartmentRows(records,[distribution]).map(x=>x.id))
      .toEqual(['kr-distribution','plan-distribution']);
  });
  it('never falls back to showing the whole company if no departments are assigned',()=>{
    expect(scopeDepartmentRows(records,[])).toEqual([]);
  });
  it('does not mutate the shared records',()=>{
    scopeDepartmentRows(records,[distribution]);
    expect(records).toHaveLength(3);
  });
});
