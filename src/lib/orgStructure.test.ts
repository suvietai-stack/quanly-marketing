import { describe, expect, it } from 'vitest';
import { assignSlot, ensureDefaultStructure, isManagerTitle, missingDefaultStructure, orgConfigDiff, slotCapacity, slotHistory, slotHolders, titleHolders, titleKind, titleLevel, unassignSlot, unitTitles, DEFAULT_TITLES, DEFAULT_UNITS } from './orgStructure';
import { emptyConfig } from './basePermissions/types';

describe('ensureDefaultStructure', () => {
  it('khởi tạo đủ 2 khối, 5 bộ phận và 11 chức danh từ cấu hình trống', () => {
    const { config, addedUnits, addedTitles } = ensureDefaultStructure(emptyConfig());
    expect(addedUnits).toHaveLength(DEFAULT_UNITS.length);
    expect(addedTitles).toHaveLength(DEFAULT_TITLES.length);
    const blocks = config.units.filter(u => u.kind === 'block').map(u => u.name);
    expect(blocks).toEqual(['Khối Marketing', 'Khối Vận hành']);
    const marketing = config.units.find(u => u.name === 'Khối Marketing')!;
    const ops = config.units.find(u => u.name === 'Khối Vận hành')!;
    expect(config.units.filter(u => u.parent_id === marketing.id).map(u => u.name)).toEqual(['Bộ phận Marketing', 'Bộ phận Thiết kế']);
    expect(config.units.filter(u => u.parent_id === ops.id).map(u => u.name)).toEqual(['Bộ phận Hành chính & Nhân sự', 'Bộ phận Kế toán', 'Bộ phận Mua hàng & Giao vận']);
    const acc = config.units.find(u => u.name === 'Bộ phận Kế toán')!;
    expect(unitTitles(config, acc.id).map(t => t.name)).toEqual(['Kế toán trưởng', 'Kế toán kho']);
  });

  it('chạy lại không nhân đôi và không thay đổi dữ liệu hiện có', () => {
    const first = ensureDefaultStructure(emptyConfig()).config;
    first.memberships.push({ id: 'm1', user_id: 'u1', unit_id: first.units.find(u => u.name === 'Bộ phận Marketing')!.id, title_id: unitTitles(first, first.units.find(u => u.name === 'Bộ phận Marketing')!.id)[0].id, active: true });
    const second = ensureDefaultStructure(first);
    expect(second.addedUnits).toHaveLength(0);
    expect(second.addedTitles).toHaveLength(0);
    expect(second.config.units).toHaveLength(first.units.length);
    expect(second.config.titles).toHaveLength(first.titles.length);
    expect(second.config.memberships).toHaveLength(1);
    expect(missingDefaultStructure(first)).toBe(false);
  });

  it('tái sử dụng đơn vị đã có theo tên, không tạo trùng', () => {
    const config = emptyConfig();
    config.units.push({ id: 'existing-block', name: 'khối marketing ', kind: 'block', active: true });
    const { config: seeded, addedUnits } = ensureDefaultStructure(config);
    expect(addedUnits).not.toContain('Khối Marketing');
    expect(seeded.units.filter(u => u.kind === 'block' && u.name.toLocaleLowerCase('vi').includes('marketing'))).toHaveLength(1);
    const dep = seeded.units.find(u => u.name === 'Bộ phận Marketing')!;
    expect(dep.parent_id).toBe('existing-block');
  });

  it('không đụng tới quyền mặc định, bộ quyền hay quyền trực tiếp', () => {
    const config = emptyConfig();
    config.grants.push({ id: 'g1', permission: 'leave.view_own', effect: 'ALLOW', scope: 'native', active: true, user_id: 'u1' });
    config.bundles.push({ id: 'b1', name: 'Bộ quyền A', active: true, rules: [] });
    const seeded = ensureDefaultStructure(config).config;
    expect(seeded.grants).toEqual(config.grants);
    expect(seeded.bundles).toEqual(config.bundles);
  });
});

describe('ô chức danh', () => {
  const seeded = () => ensureDefaultStructure(emptyConfig()).config;
  const marketingDep = (c: ReturnType<typeof seeded>) => c.units.find(u => u.name === 'Bộ phận Marketing')!.id;

  it('phân biệt ô quản lý một người và ô nhân viên nhiều người', () => {
    expect(isManagerTitle('Trưởng bộ phận Marketing')).toBe(true);
    expect(isManagerTitle('Kế toán trưởng')).toBe(true);
    expect(isManagerTitle('Nhân viên Marketing')).toBe(false);
    expect(isManagerTitle('Kế toán kho')).toBe(false);
  });

  it('gán người vào ô trống và hiển thị người giữ', () => {
    const c = seeded();
    const dep = marketingDep(c);
    const head = unitTitles(c, dep).find(t => t.name === 'Trưởng bộ phận Marketing')!;
    const next = assignSlot(c, dep, head.id, 'u1');
    expect(slotHolders(next, dep, head.id).map(m => m.user_id)).toEqual(['u1']);
    expect(slotHistory(next, dep, head.id)).toHaveLength(1);
  });

  it('đổi người ở ô quản lý: kết thúc người cũ, giữ lịch sử', () => {
    const c = seeded();
    const dep = marketingDep(c);
    const head = unitTitles(c, dep).find(t => t.name === 'Trưởng bộ phận Marketing')!;
    const first = assignSlot(c, dep, head.id, 'u1');
    const second = assignSlot(first, dep, head.id, 'u2');
    expect(slotHolders(second, dep, head.id).map(m => m.user_id)).toEqual(['u2']);
    const history = slotHistory(second, dep, head.id);
    expect(history).toHaveLength(2);
    expect(history.find(m => m.user_id === 'u1')?.active).toBe(false);
    expect(history.find(m => m.user_id === 'u1')?.ends_at).toBeTruthy();
  });

  it('ô nhân viên giữ nhiều người và không thêm trùng', () => {
    const c = seeded();
    const dep = marketingDep(c);
    const staff = unitTitles(c, dep).find(t => t.name === 'Nhân viên Marketing')!;
    let next = assignSlot(c, dep, staff.id, 'u1');
    next = assignSlot(next, dep, staff.id, 'u2');
    next = assignSlot(next, dep, staff.id, 'u1');
    expect(slotHolders(next, dep, staff.id).map(m => m.user_id).sort()).toEqual(['u1', 'u2']);
  });

  it('bỏ gán đưa vị trí về trống nhưng giữ lịch sử', () => {
    const c = seeded();
    const dep = marketingDep(c);
    const head = unitTitles(c, dep).find(t => t.name === 'Trưởng bộ phận Marketing')!;
    const assigned = assignSlot(c, dep, head.id, 'u1');
    const removed = unassignSlot(assigned, dep, head.id, 'u1');
    expect(slotHolders(removed, dep, head.id)).toHaveLength(0);
    expect(slotHistory(removed, dep, head.id)).toHaveLength(1);
    expect(slotHistory(removed, dep, head.id)[0].active).toBe(false);
  });
});
