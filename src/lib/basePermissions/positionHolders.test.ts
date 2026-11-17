import { expect, it } from 'vitest';
import { effectivePositionHolders, positionPairs } from './positionHolders';
import { emptyConfig, type Membership } from './types';
const at = Date.parse('2026-11-12T00:00:00Z');
const row = (id: string, user_id: string, extra: Partial<Membership> = {}): Membership => ({
  id, user_id, unit_id: 'department', title_id: 'staff', active: true, starts_at: '2026-11-11T00:00:00Z', ...extra,
});
it('counts unlimited concurrent staff, never future/ended/cancelled assignments or duplicate people', () => {
  const rows = Array.from({ length: 12 }, (_, i) => row(`a${i}`, `u${i}`));
  rows.push(row('dup', 'u0'), row('future', 'future', { starts_at: '2026-11-13T00:00:00Z' }),
    row('ended', 'ended', { ends_at: '2026-11-12T00:00:00Z' }), row('cancelled', 'cancelled', { status: 'cancelled' }));
  expect(effectivePositionHolders(rows, 'department', 'staff', at)).toHaveLength(12);
});
it('one unit/title pair remains one position even with many staff and stale references', () => {
  const cfg = emptyConfig();
  cfg.units = [{ id: 'department', name: 'Phòng', kind: 'department', active: true }];
  cfg.titles = [{ id: 'staff', name: 'Nhân viên', active: true, unit_id: 'department' }];
  cfg.memberships = [row('a', 'u1'), row('b', 'u2'), row('missing', 'u3', { title_id: 'missing' })];
  expect(positionPairs(cfg).map(p => [p.unit.id, p.title.id])).toEqual([['department', 'staff']]);
});
it('does not offer obsolete global business titles or inactive team-lead positions in Role binding', () => {
  const cfg=emptyConfig();
  cfg.units=[{id:'department',name:'Phòng Phân Phối',kind:'department',active:true}];
  cfg.titles=[
    {id:'head',unit_id:'department',name:'Trưởng phòng Phân Phối',source:'canonical',active:true},
    {id:'team-lead',unit_id:'department',name:'Trưởng nhóm Phân Phối',source:'canonical',active:false},
    {id:'old',name:'Trưởng Nhóm',source:'biz_positions',active:true},
  ];
  cfg.memberships=[
    row('old-appointment','u1',{title_id:'old',active:false}),
    row('old-team','u2',{title_id:'team-lead',active:false}),
  ];
  expect(positionPairs(cfg).map(({unit,title})=>[unit.id,title.id])).toEqual([['department','head']]);
});
