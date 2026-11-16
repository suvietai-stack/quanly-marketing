import { describe, expect, it } from 'vitest';
import { areaUnitIds, DISTRIBUTION_UNIT, hasAreaAppointment, selectAreaUnit } from './area';

const department = 'cef13ee0-73a8-43c4-bfe5-6bef393248fc';
const units = [
  { id: 'biz-block', active: true },
  { id: DISTRIBUTION_UNIT, parent_id: 'biz-block', active: true },
  { id: department, parent_id: DISTRIBUTION_UNIT, active: true },
  { id: 'orders', parent_id: 'biz-block', active: true },
  { id: 'retired', parent_id: DISTRIBUTION_UNIT, active: false },
];
describe('Distribution scope', () => {
  it('uses the existing Distribution and department IDs, never parent or sibling', () => {
    expect([...areaUnitIds(units, DISTRIBUTION_UNIT)]).toEqual([DISTRIBUTION_UNIT, department]);
  });
  it('fails closed when root is missing', () => {
    expect(areaUnitIds(units.slice(2), DISTRIBUTION_UNIT).size).toBe(0);
    expect(selectAreaUnit([], DISTRIBUTION_UNIT, 'biz-block')).toBe('');
  });
  it('rejects company and sibling overrides', () => {
    const options = units.filter(u => areaUnitIds(units, DISTRIBUTION_UNIT).has(u.id));
    expect(selectAreaUnit(options, DISTRIBUTION_UNIT, 'org-company')).toBe(DISTRIBUTION_UNIT);
    expect(selectAreaUnit(options, DISTRIBUTION_UNIT, 'orders')).toBe(DISTRIBUTION_UNIT);
    expect(selectAreaUnit(options, DISTRIBUTION_UNIT, department)).toBe(department);
  });
  it('uses actor-matched active assignment intervals', () => {
    const ids = areaUnitIds(units, DISTRIBUTION_UNIT);
    const now = Date.parse('2026-11-16T16:06:00Z');
    const member = { user_id: 'employee', unit_id: department, active: true };
    expect(hasAreaAppointment([member], 'employee', ids, now)).toBe(true);
    expect(hasAreaAppointment([member], 'other', ids, now)).toBe(false);
    expect(hasAreaAppointment([{ ...member, unit_id: 'orders' }], 'employee', ids, now)).toBe(false);
    expect(hasAreaAppointment([{ ...member, active: false }], 'employee', ids, now)).toBe(false);
    expect(hasAreaAppointment([{ ...member, ends_at: '2026-11-16T16:06:00Z' }], 'employee', ids, now)).toBe(false);
    expect(hasAreaAppointment([{ ...member, starts_at: '2026-11-17T00:00:00Z' }], 'employee', ids, now)).toBe(false);
  });
});