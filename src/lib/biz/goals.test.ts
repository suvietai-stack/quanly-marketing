import { describe, it, expect } from 'vitest';
import { allocationMatches, quarterTotal, total, validValue, type GoalItem } from './goals';
const item = (annual: string | null, months: (string | null)[], aggregation: GoalItem['definition']['aggregation'] = 'sum'): GoalItem => ({ metric_id: 'kr', definition: { name: 'Doanh số', description: null, unit: 'VNĐ', aggregation, value_kind: 'money', direction: 'higher' }, annual, months });
describe('annual goal rules', () => {
 it('accepts uneven allocation totaling 6 billion', () => { expect(allocationMatches(item('6000000000', ['1000000000', '2000000000', '3000000000', ...Array(9).fill('0')]))).toBe(true); });
 it('derives Q1 from months 1–3 without duplicating annual values', () => { expect(quarterTotal(item('240', ['10', '20', '30', ...Array(9).fill('20')]), 0)).toBe('60'); });
 it('rejects allocation mismatch', () => { expect(allocationMatches(item('240', Array(12).fill('19')))).toBe(false); });
 it('distinguishes zero from unentered annual target', () => { expect(allocationMatches(item('0', Array(12).fill('0')))).toBe(true); expect(allocationMatches(item(null, Array(12).fill('0')))).toBe(false); });
 it('requires all months only when submitting', () => { expect(validValue(null)).toBe(true); expect(allocationMatches(item('1', ['1', ...Array(11).fill(null)]))).toBe(false); });
 it('preserves exact large integer money values', () => { expect(total(['99999999999999999998', '1'])).toBe(99999999999999999999n); });
 it('averages nonadditive ratios instead of summing', () => { expect(allocationMatches(item('50', Array(12).fill('50'), 'ratio'))).toBe(true); expect(quarterTotal(item('50', Array(12).fill('50'), 'ratio'), 0)).toBe('50'); });
 it('rejects negative, fractional and oversized values', () => { expect(validValue('-1')).toBe(false); expect(validValue('0.5')).toBe(false); expect(validValue('100000000000000000000')).toBe(false); });
});