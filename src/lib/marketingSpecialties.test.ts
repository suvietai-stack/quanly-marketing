import { describe, it, expect } from 'vitest';
import { applySpecialtyDiff } from './marketingSpecialties';
describe('applySpecialtyDiff', () => {
  it('keeps multiple specialties for one person', () => {
    expect(applySpecialtyDiff(new Set(['seo']), new Set(['seo','social','video']))).toEqual({ add: ['social','video'], remove: [] });
  });
  it('removes unticked specialty', () => {
    expect(applySpecialtyDiff(new Set(['seo','social']), new Set(['social']))).toEqual({ add: [], remove: ['seo'] });
  });
});
