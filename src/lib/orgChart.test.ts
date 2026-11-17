import { describe, expect, it } from 'vitest';
import { buildOrganizationTree, countPeople, nodeMatches } from './orgChart';
import { emptyConfig, type OrgConfig } from './basePermissions/types';
import { slotHistory } from './orgStructure';
const config: OrgConfig = { ...emptyConfig(), units: [
  { id: 'company', name: 'Công ty', kind: 'company', active: true },
  { id: 'marketing', name: 'Marketing', kind: 'block', active: true },
  { id: 's', parent_id: 'marketing', name: 'Hệ A', kind: 'system', active: true },
  { id: 'd', parent_id: 's', name: 'Phòng A', kind: 'department', active: true },
  { id: 't', parent_id: 'd', name: 'Nhóm A', kind: 'team', active: true },
  { id: 'unmapped', name: 'Chưa ánh xạ', kind: 'department', active: true },
], titles: [{ id: 'director', name: 'Giám đốc Hệ', unit_id: 's', active: true, level: 3, kind: 'manager', capacity: 1 }], memberships: [
  { id: 'a', user_id: 'u', unit_id: 's', title_id: 'director', active: true, starts_at: '2026-01-01' },
  { id: 'b', user_id: 'u', unit_id: 't', active: true, starts_at: '2026-01-01' },
  { id: 'future', user_id: 'v', unit_id: 'd', active: true, starts_at: '2027-01-01' },
] };
describe('unified organization tree', () => {
  const tree = buildOrganizationTree(config, [{ id: 'u', name: 'Nhân sự A' }], '2026-11-10');
  const block = tree.find(x => x.id === 'marketing');
  it('allows systems and teams outside business', () => expect(block?.children[0]?.children[0]?.children[0]?.kind).toBe('team'));
  it('retains an unmapped department at root', () => expect(tree.find(x => x.id === 'unmapped')?.name).toBe('Chưa ánh xạ'));
  it('counts unique people, excluding future assignments', () => { if (!block) throw new Error('missing'); expect(countPeople(block)).toBe(1); });
  it('searches recursively through people and titles', () => { if (!block) throw new Error('missing'); expect(nodeMatches(block, 'nhân sự a')).toBe(true); expect(nodeMatches(block, 'Giám đốc')).toBe(true); expect(nodeMatches(block, 'absent')).toBe(false); });
  it('preserves empty title slots', () => { const c = { ...config, memberships: [] }; expect(buildOrganizationTree(c, [])[1]?.children[0]?.slots?.[0]?.holders).toEqual([]); });
});
describe('visual root nesting and biz title scoping', () => {
  const cfg: OrgConfig = { ...emptyConfig(), units: [
    { id: 'co', name: 'Công ty cổ phần Sứ Việt', kind: 'company', active: true },
    { id: 'biz', name: 'Khối Kinh doanh', kind: 'block', active: true },
    { id: 'mkt', name: 'Khối Marketing', kind: 'block', active: true },
    { id: 'kd1', parent_id: 'biz', name: 'Kinh doanh Phân Phối 1', kind: 'department', active: true },
    { id: 'pm', parent_id: 'mkt', name: 'Phòng Marketing', kind: 'department', active: true },
  ], titles: [
    { id: 'nvkd', name: 'Nhân viên Kinh doanh', active: true, level: 0, kind: 'staff', capacity: 0, source: 'biz_positions', unit_kind: 'department' },
  ], memberships: [] };
  it('xếp các Khối chưa gắn cha dưới Công ty khi mọi gốc đều là Khối', () => {
    const tree = buildOrganizationTree(cfg, []);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('co');
    expect(tree[0].children.map(c => c.id).sort()).toEqual(['biz', 'mkt']);
  });
  it('never duplicates a legacy global sales title into a department', () => {
    const tree = buildOrganizationTree(cfg, []);
    const biz = tree[0].children.find(c => c.id === 'biz')!;
    const mkt = tree[0].children.find(c => c.id === 'mkt')!;
    expect(biz.children[0].slots ?? []).toEqual([]);
    expect(mkt.children[0].slots ?? []).toEqual([]);
  });

  it('shows only the exact canonical V2 position of the department', () => {
    const newer: OrgConfig = {
      ...cfg,
      titles: [...cfg.titles,
        { id: 'role-b2b', name: 'Nhân viên Kinh doanh B2B',
          unit_id: 'kd1', active: true, source: 'canonical', kind: 'staff', level: 0 }],
    };
    const tree = buildOrganizationTree(newer, []);
    const dept = tree[0].children.find(c => c.id === 'biz')!.children[0];
    expect(dept.slots?.map(s => s.title)).toEqual(['Nhân viên Kinh doanh B2B']);
    expect(dept.slots?.[0].holders).toEqual([]);
  });
});
describe('deduplicate staff within a unit by user ID', () => {
  const cfg: OrgConfig = { ...emptyConfig(), units: [
    { id: 'biz-unit', name: 'Kinh doanh', kind: 'department', active: true },
  ], titles: [
    { id: 'sale', name: 'Kinh doanh Đơn hàng', unit_id: 'biz-unit', active: true, kind: 'staff', level: 0 },
    { id: 'manager', name: 'Quản lý', unit_id: 'biz-unit', active: true, kind: 'manager', level: 2 },
  ], memberships: [
    { id: 'membership', user_id: 'u1', unit_id: 'biz-unit', active: true },
    { id: 'appointment', user_id: 'u1', unit_id: 'biz-unit', title_id: 'sale', active: true },
    { id: 'duplicate', user_id: 'u1', unit_id: 'biz-unit', title_id: 'sale', active: true },
    { id: 'second-position', user_id: 'u1', unit_id: 'biz-unit', title_id: 'manager', active: true },
    { id: 'same-name', user_id: 'u2', unit_id: 'biz-unit', active: true },
  ] };
  const staff = [{ id: 'u1', name: 'Ngọc' }, { id: 'u2', name: 'Ngọc' }];
  const node = buildOrganizationTree(cfg, staff, '2026-11-11T00:00:00Z')[0];
  it('does not repeat a valid slot holder in the unassigned list', () => {
    expect(node.people.map(p => p.id)).toEqual(['u2']);
  });
  it('shows one user once in the same position', () => {
    expect(node.slots?.find(s => s.id === 'sale')?.holders.map(p => p.id)).toEqual(['u1']);
  });
  it('preserves genuine concurrent positions', () => {
    expect(node.slots?.find(s => s.id === 'manager')?.holders.map(p => p.id)).toEqual(['u1']);
  });
  it('does not merge two IDs sharing a name', () => {
    expect(countPeople(node)).toBe(2);
    expect(node.people[0]).toEqual({ id: 'u2', name: 'Ngọc', title: undefined, duties: undefined });
  });
  it('does not hide a membership for an expired appointment', () => {
    const ended = { ...cfg, memberships: cfg.memberships.map(m => m.title_id ? { ...m, ends_at: '2026-11-10T00:00:00Z' } : m) };
    expect(buildOrganizationTree(ended, staff, '2026-11-11T00:00:00Z')[0].people.map(p => p.id)).toEqual(['u1', 'u2']);
  });
  it('does not change membership records or history', () => {
    const before = JSON.stringify(cfg.memberships);
    buildOrganizationTree(cfg, staff, '2026-11-11T00:00:00Z');
    expect(JSON.stringify(cfg.memberships)).toBe(before);
    expect(cfg.memberships).toHaveLength(5);
  });
});

it('groups four historical Marketing slots into one title with three distinct holders', () => {
  const c: OrgConfig = { ...emptyConfig(), units: [{id:'m',name:'Phòng Marketing',kind:'department',active:true}],
    titles: [{id:'staff',unit_id:'m',name:'Nhân viên Marketing',kind:'staff',capacity:1,active:true}, {id:'head',unit_id:'m',name:'Trưởng phòng Marketing',kind:'manager',capacity:1,active:true}],
    position_slots: ['empty','a','b','c'].map(id=>({id,unit_id:'m',title_id:'staff',role_id:'role-v2-mkt-staff',name:`Nhân viên Marketing · ${id}`,active:true})),
    memberships: ['a','b','c'].flatMap(user_id=>[{id:user_id,user_id,unit_id:'m',title_id:'staff',slot_id:user_id,active:true},{id:`mirror-${user_id}`,user_id,unit_id:'m',active:true}]).concat([{id:'duplicate',user_id:'a',unit_id:'m',title_id:'staff',slot_id:'a',active:true}]) };
  const node=buildOrganizationTree(c,[], '2026-11-12T03:28:00Z')[0];
  expect(node.slots?.map(s=>s.id).sort()).toEqual(['head','staff']);
  expect(node.slots?.find(s=>s.id==='staff')?.holders.map(p=>p.id)).toEqual(['a','b','c']);
  expect(node.slots?.find(s=>s.id==='staff')?.capacity).toBe(0);
  expect(node.slots?.find(s=>s.id==='head')?.holders).toEqual([]);
  expect(node.people).toEqual([]);
  expect(countPeople(node)).toBe(3);
  expect(slotHistory(c,'m','staff').map(m=>m.id).sort()).toEqual(['a','b','c','duplicate']);
  expect(c.position_slots).toHaveLength(4);
});
