import { describe, expect, it } from 'vitest';
import { blockTone, buildBaseBlocks, buildBizBlock, countPeople, executiveSlots, nodeMatches } from './orgChart';
import { emptyConfig } from './basePermissions/types';
import type { OrgData } from './biz/organization';
import type { PositionsData } from './biz/positions';

const now = '2026-11-10T02:00:00.000Z';
const nameOf = (id: string) => ({ u1: 'An', u2: 'Bình', u3: 'Chi', u4: 'Dũng', u5: 'Em' } as Record<string, string>)[id] ?? id;

const positions: PositionsData = {
  server_now: now,
  positions: [
    { id: 'p5', code: 'executive_director', name: 'Giám Đốc Điều hành', description: '', level: 5, unit_kind: 'system', sort_order: 1, active: true, business_policy: 'executive', all_business: true },
    { id: 'p4', code: 'deputy_executive_director', name: 'Phó Giám Đốc Điều hành', description: '', level: 4, unit_kind: 'system', sort_order: 2, active: true, business_policy: 'executive', all_business: true },
    { id: 'p2', code: 'department_head', name: 'Trưởng Phòng', description: '', level: 2, unit_kind: 'department', sort_order: 4, active: true },
  ],
  appointments: [
    { id: 'a1', position_id: 'p5', user_id: 'u1', system_id: null, department_id: null, team_id: null, scope_kind: 'system', started_at: '2026-01-01T00:00:00Z', ended_at: null, status: 'active', position_snapshot: { id: 'p5', code: 'executive_director', name: 'Giám Đốc Điều hành', level: 5 } as never, replaces_id: null },
    { id: 'a2', position_id: 'p4', user_id: 'u2', system_id: null, department_id: null, team_id: null, scope_kind: 'system', started_at: '2026-01-01T00:00:00Z', ended_at: null, status: 'active', position_snapshot: { id: 'p4', code: 'deputy_executive_director', name: 'Phó Giám Đốc Điều hành', level: 4 } as never, replaces_id: null },
    { id: 'a3', position_id: 'p2', user_id: 'u3', system_id: null, department_id: 'd1', team_id: null, scope_kind: 'department', started_at: '2026-01-01T00:00:00Z', ended_at: null, status: 'active', position_snapshot: { id: 'p2', code: 'department_head', name: 'Trưởng Phòng', level: 2 } as never, replaces_id: null },
  ],
};

const bizOrg: OrgData = {
  systems: [{ id: 's1', name: 'Đơn Hàng', active: true }],
  departments: [{ id: 'd1', name: 'Kinh doanh 1', active: true, system_id: 's1' } as never],
  teams: [{ id: 't1', name: 'Nhóm A', active: true, department_id: 'd1' }],
  members: [
    { id: 'm1', user_id: 'u3', department_id: 'd1', started_at: '2026-01-01T00:00:00Z', ended_at: null },
    { id: 'm2', user_id: 'u4', department_id: 'd1', started_at: '2026-01-01T00:00:00Z', ended_at: null },
    { id: 'm3', user_id: 'u5', department_id: 'd1', started_at: '2026-01-01T00:00:00Z', ended_at: null },
  ] as never,
  team_members: [{ id: 'tm1', team_id: 't1', user_id: 'u5', started_at: '2026-01-01T00:00:00Z', ended_at: null }],
  managers: [],
  events: [],
};

describe('executiveSlots', () => {
  it('Giám đốc đứng trên Phó Giám đốc, kèm người đang giữ chức vụ', () => {
    const slots = executiveSlots(positions, nameOf);
    expect(slots.map(s => s.code)).toEqual(['executive_director', 'deputy_executive_director']);
    expect(slots[0].holder?.name).toBe('An');
    expect(slots[1].holder?.name).toBe('Bình');
  });
  it('không có dữ liệu chức vụ thì trả rỗng', () => {
    expect(executiveSlots(undefined, nameOf)).toEqual([]);
  });
});

describe('buildBizBlock', () => {
  it('dựng Hệ → Phòng → Nhóm → Nhân viên với người phụ trách thật', () => {
    const block = buildBizBlock(bizOrg, positions, nameOf);
    expect(block.name).toBe('Khối Kinh doanh');
    const he = block.children[0];
    expect(he.name).toBe('Hệ Đơn Hàng');
    const dep = he.children[0];
    expect(dep.name).toBe('Kinh doanh 1');
    expect(dep.leader?.name).toBe('Chi');
    expect(he.leaderLabel).toBe('Giám đốc Hệ');
    expect(dep.leaderLabel).toBe('Trưởng phòng');
    expect(dep.children[0].leaderLabel).toBe('Trưởng nhóm');
    expect(he.leader).toBeUndefined();
    expect(dep.children[0].name).toBe('Nhóm A');
    expect(dep.children[0].people.map(p => p.name)).toEqual(['Em']);
    expect(dep.people.map(p => p.name)).toEqual(['Chi', 'Dũng']);
  });
  it('không tính trùng nhân sự trong tổng nhánh', () => {
    const block = buildBizBlock(bizOrg, positions, nameOf);
    expect(countPeople(block)).toBe(3);
  });
});

describe('buildBaseBlocks', () => {
  it('dựng khối từ cấu hình, gộp nhân sự trùng và giữ nhiệm vụ', () => {
    const config = emptyConfig();
    config.units = [
      { id: 'b1', name: 'Khối Marketing', kind: 'block', active: true },
      { id: 'dp1', name: 'Bộ phận Marketing', kind: 'department', parent_id: 'b1', active: true },
      { id: 'tm1', name: 'Content', kind: 'team', parent_id: 'dp1', active: true },
    ];
    config.titles = [{ id: 'tt1', name: 'Trưởng bộ phận', active: true }];
    config.memberships = [
      { id: 'mb1', user_id: 'u1', unit_id: 'dp1', title_id: 'tt1', duties: 'Phụ trách Marketing', active: true },
      { id: 'mb2', user_id: 'u1', unit_id: 'dp1', active: true },
      { id: 'mb3', user_id: 'u2', unit_id: 'tm1', active: true },
    ];
    const blocks = buildBaseBlocks(config, [{ id: 'u1', name: 'An' }, { id: 'u2', name: 'Bình' }]);
    expect(blocks).toHaveLength(1);
    const dep = blocks[0].children[0];
    expect(dep.people).toHaveLength(1);
    expect(dep.people[0]).toMatchObject({ name: 'An', title: 'Trưởng bộ phận', duties: 'Phụ trách Marketing' });
    expect(blocks[0].children[0].children[0].people[0].name).toBe('Bình');
    expect(countPeople(blocks[0])).toBe(2);
  });
  it('chức danh gắn bộ phận thành ô riêng, hiện cả khi trống và không tính trùng', () => {
    const config = emptyConfig();
    config.units = [
      { id: 'b1', name: 'Khối Marketing', kind: 'block', active: true },
      { id: 'dp1', name: 'Bộ phận Marketing', kind: 'department', parent_id: 'b1', active: true },
    ];
    config.titles = [
      { id: 'tt1', name: 'Trưởng bộ phận Marketing', active: true, unit_id: 'dp1' },
      { id: 'tt2', name: 'Nhân viên Marketing', active: true, unit_id: 'dp1' },
    ];
    config.memberships = [
      { id: 'mb1', user_id: 'u1', unit_id: 'dp1', title_id: 'tt1', active: true },
      { id: 'mb2', user_id: 'u2', unit_id: 'dp1', title_id: 'tt2', active: true },
      { id: 'mb3', user_id: 'u2', unit_id: 'dp1', title_id: 'tt2', active: true },
    ];
    const dep = buildBaseBlocks(config, [{ id: 'u1', name: 'An' }, { id: 'u2', name: 'Bình' }])[0].children[0];
    expect(dep.slots).toHaveLength(2);
    expect(dep.slots![0]).toMatchObject({ title: 'Trưởng bộ phận Marketing', manager: true });
    expect(dep.slots![0].holders.map(h => h.name)).toEqual(['An']);
    expect(dep.slots![1].holders.map(h => h.name)).toEqual(['Bình', 'Bình']);
    expect(dep.people).toHaveLength(0);
    expect(countPeople(dep)).toBe(2);
  });
  it('ô chức danh trống vẫn xuất hiện và khớp tìm kiếm theo tên chức danh', () => {
    const config = emptyConfig();
    config.units = [
      { id: 'b1', name: 'Khối Vận hành', kind: 'block', active: true },
      { id: 'dp1', name: 'Bộ phận Kế toán', kind: 'department', parent_id: 'b1', active: true },
    ];
    config.titles = [{ id: 'tt1', name: 'Kế toán trưởng', active: true, unit_id: 'dp1' }];
    const block = buildBaseBlocks(config, [])[0];
    const dep = block.children[0];
    expect(dep.slots![0].holders).toHaveLength(0);
    expect(nodeMatches(block, 'kế toán trưởng')).toBe(true);
  });
});

describe('nodeMatches / blockTone', () => {
  it('tìm theo tên đơn vị và tên nhân sự trong nhánh', () => {
    const block = buildBizBlock(bizOrg, positions, nameOf);
    expect(nodeMatches(block, 'đơn hàng')).toBe(true);
    expect(nodeMatches(block, 'em')).toBe(true);
    expect(nodeMatches(block, 'xyz')).toBe(false);
    expect(nodeMatches(block.children[0].children[0].children[0], 'dũng')).toBe(false);
  });
  it('gán màu khối theo tên', () => {
    expect(blockTone('Khối Kinh doanh')).toBe('biz');
    expect(blockTone('Khối Marketing')).toBe('marketing');
    expect(blockTone('Khối Vận hành')).toBe('ops');
    expect(blockTone('Khối Khác')).toBe('other');
  });
});
