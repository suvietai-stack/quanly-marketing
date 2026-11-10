import { describe, it, expect } from 'vitest';
import { applySpecialtyDiff, orderBySpecialty } from './marketingSpecialties';
describe('applySpecialtyDiff', () => {
  it('keeps multiple specialties for one person', () => {
    expect(applySpecialtyDiff(new Set(['seo']), new Set(['seo','social','video']))).toEqual({ add: ['social','video'], remove: [] });
  });
  it('removes unticked specialty', () => {
    expect(applySpecialtyDiff(new Set(['seo','social']), new Set(['social']))).toEqual({ add: [], remove: ['seo'] });
  });
});
describe('orderBySpecialty', () => {
  const people = [{ id: '1', name: 'An' }, { id: '2', name: 'Bình' }, { id: '3', name: 'Chi' }, { id: '4', name: 'Dũng' }];
  it('puts matching candidates first, primary before secondary, then everyone else', () => {
    const { matched, rest } = orderBySpecialty(people, [
      { user_id: '3', name: 'Chi', is_primary: false, unit_name: null, title_name: null },
      { user_id: '2', name: 'Bình', is_primary: true, unit_name: null, title_name: null },
    ]);
    expect(matched.map(p => p.name)).toEqual(['Bình', 'Chi']);
    expect(rest.map(p => p.name)).toEqual(['An', 'Dũng']);
  });
  it('a multi-specialty person appears in every matching list but never twice', () => {
    const { matched, rest } = orderBySpecialty(people, [
      { user_id: '2', name: 'Bình', is_primary: false, unit_name: null, title_name: null },
      { user_id: '2', name: 'Bình', is_primary: false, unit_name: null, title_name: null },
    ]);
    expect(matched.filter(p => p.name === 'Bình')).toHaveLength(1);
    expect(rest.some(p => p.name === 'Bình')).toBe(false);
  });
  it('returns empty matched list when nobody fits, without auto-selecting anyone', () => {
    const { matched, rest } = orderBySpecialty(people, []);
    expect(matched).toEqual([]);
    expect(rest).toHaveLength(4);
  });
});
