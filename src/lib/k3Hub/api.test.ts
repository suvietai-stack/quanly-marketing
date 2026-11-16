import { describe, expect, it } from 'vitest';
import { k3HubTotals, type K3HubPerson } from './api';

const member = (id: string, unit: string, state: K3HubPerson['state'], goals=0): K3HubPerson => ({
  user_id: id, full_name: id, unit_id: unit, unit_name: unit,
  block_id: 'biz-block', block_name: 'Khối Kinh doanh', position: 'Nhân viên',
  state, goals_count: goals, actions_count: goals, results_count: 0,
});

describe('unified company 3K report', () => {
  it('does not count employees twice for concurrent appointments', () => {
    expect(k3HubTotals([
      member('alice','department-a','planned',2),
      member('alice','department-b','none',0),
      member('bob','department-c','confirmed',1),
    ])).toMatchObject({ people:2, goals:3, actions:3, results:0 });
  });
  it('never fabricates goals or KPI values for an empty team', () => {
    expect(k3HubTotals([])).toEqual({
      people:0, pending:0, confirmed:0, goals:0, actions:0, results:0,
    });
  });
});
