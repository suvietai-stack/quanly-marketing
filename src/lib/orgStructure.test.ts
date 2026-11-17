import { describe, expect, it } from 'vitest';
import { assignMany, assignSlot, endMembership, ensureDefaultStructure, isManagerTitle, membershipKind, missingDefaultStructure, orgConfigDiff, slotCapacity, slotHistory, slotHolders, titleHolders, titleKind, titleLevel, transferMembers, transferPreview, unassignSlot, unitDescendants, unitPath, unitTitles, DEFAULT_TITLES, DEFAULT_UNITS } from './orgStructure';
import { emptyConfig } from './basePermissions/types';

it('old global business positions are hidden; canonical V2 positions remain unit-scoped',()=>{
  const c=emptyConfig();c.units=[{id:'org-company',kind:'company',name:'Công ty',active:true},{id:'biz-block',parent_id:'org-company',kind:'block',name:'Khối đã đổi tên',active:true},{id:'d',parent_id:'biz-block',kind:'department',name:'Phòng',active:true},{id:'m',parent_id:'org-company',kind:'block',name:'Marketing',active:true},{id:'md',parent_id:'m',kind:'department',name:'Phòng M',active:true}];c.titles=[
    {id:'sale',name:'Nhân viên Kinh doanh',source:'biz_positions',unit_kind:'department',active:true},
    {id:'sale-v2',name:'Nhân viên Kinh doanh B2B',source:'canonical',unit_id:'d',active:true}
  ];
  expect(unitTitles(c,'d').map(t=>t.id)).toEqual(['sale-v2']);
  expect(unitTitles(c,'md')).toEqual([]);
});

describe('ensureDefaultStructure', () => {
  it('khởi tạo đủ 2 khối, 5 bộ phận và 11 chức danh từ cấu hình trống', () => {
    const { config, addedUnits, addedTitles } = ensureDefaultStructure(emptyConfig());
    expect(addedUnits).toHaveLength(DEFAULT_UNITS.length);
    expect(addedTitles).toHaveLength(DEFAULT_TITLES.length);
    const blocks = config.units.filter(u => u.kind === 'block').map(u => u.name);
    expect(blocks).toEqual(['Khối Marketing', 'Khối Vận hành']);
    const marketing = config.units.find(u => u.name === 'Khối Marketing')!;
    const ops = config.units.find(u => u.name === 'Khối Vận hành')!;
    expect(config.units.filter(u => u.parent_id === marketing.id).map(u => u.name)).toEqual(['Phòng Marketing', 'Phòng Thiết kế']);
    expect(config.units.filter(u => u.parent_id === ops.id).map(u => u.name)).toEqual(['Hành chính & Nhân sự', 'Phòng Kế toán', 'Phòng Mua hàng & Giao vận']);
    const acc = config.units.find(u => u.name === 'Phòng Kế toán')!;
    expect(unitTitles(config, acc.id).map(t => t.name)).toEqual(['Kế toán trưởng', 'Kế toán kho']);
  });

  it('chạy lại không nhân đôi và không thay đổi dữ liệu hiện có', () => {
    const first = ensureDefaultStructure(emptyConfig()).config;
    first.memberships.push({ id: 'm1', user_id: 'u1', unit_id: first.units.find(u => u.name === 'Phòng Marketing')!.id, title_id: unitTitles(first, first.units.find(u => u.name === 'Phòng Marketing')!.id)[0].id, active: true });
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
    const dep = seeded.units.find(u => u.name === 'Phòng Marketing')!;
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
  const marketingDep = (c: ReturnType<typeof seeded>) => c.units.find(u => u.name === 'Phòng Marketing')!.id;

  it('phân biệt ô quản lý một người và ô nhân viên nhiều người', () => {
    expect(isManagerTitle('Trưởng phòng Marketing')).toBe(true);
    expect(isManagerTitle('Kế toán trưởng')).toBe(true);
    expect(isManagerTitle('Nhân viên Marketing')).toBe(false);
    expect(isManagerTitle('Kế toán kho')).toBe(false);
  });

  it('gán người vào ô trống và hiển thị người giữ', () => {
    const c = seeded();
    const dep = marketingDep(c);
    const head = unitTitles(c, dep).find(t => t.name === 'Trưởng phòng Marketing')!;
    const next = assignSlot(c, dep, head.id, 'u1');
    expect(slotHolders(next, dep, head.id).map(m => m.user_id)).toEqual(['u1']);
    expect(slotHistory(next, dep, head.id)).toHaveLength(1);
  });

  it('đổi người ở ô quản lý: kết thúc người cũ, giữ lịch sử', () => {
    const c = seeded();
    const dep = marketingDep(c);
    const head = unitTitles(c, dep).find(t => t.name === 'Trưởng phòng Marketing')!;
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
    const head = unitTitles(c, dep).find(t => t.name === 'Trưởng phòng Marketing')!;
    const assigned = assignSlot(c, dep, head.id, 'u1');
    const removed = unassignSlot(assigned, dep, head.id, 'u1');
    expect(slotHolders(removed, dep, head.id)).toHaveLength(0);
    expect(slotHistory(removed, dep, head.id)).toHaveLength(1);
    expect(slotHistory(removed, dep, head.id)[0].active).toBe(false);
  });
});

describe('chức danh chuẩn hóa: mã, cấp bậc, loại vị trí', () => {
  it('seed mang đủ mã ổn định, cấp bậc và loại vị trí theo mô hình 5→0', () => {
    const { config } = ensureDefaultStructure(emptyConfig());
    const head = config.titles.find(t => t.name === 'Trưởng phòng Marketing')!;
    expect(head).toMatchObject({ code: 'mkt-head', level: 2, kind: 'manager', capacity: 1 });
    const staff = config.titles.find(t => t.name === 'Nhân viên Marketing')!;
    expect(staff).toMatchObject({ code: 'mkt-staff', level: 0, kind: 'staff', capacity: 0 });
    const acc = config.titles.find(t => t.name === 'Kế toán trưởng')!;
    expect(acc).toMatchObject({ code: 'acc-head', level: 2, kind: 'manager', capacity: 1 });
  });

  it('bổ sung mã/cấp bậc cho chức danh cũ thiếu thông tin mà không đổi tên hay quyền', () => {
    const config = emptyConfig();
    config.units.push({ id: 'dep-mkt', name: 'Phòng Marketing', kind: 'department', active: true, parent_id: 'blk-mkt' });
    config.units.push({ id: 'blk-mkt', name: 'Khối Marketing', kind: 'block', active: true });
    config.titles.push({ id: 'old-head', name: 'Trưởng phòng Marketing', active: true, unit_id: 'dep-mkt' });
    expect(missingDefaultStructure(config)).toBe(true);
    const { config: seeded, updatedTitles, addedTitles } = ensureDefaultStructure(config);
    expect(addedTitles).not.toContain('Trưởng phòng Marketing');
    expect(updatedTitles).toContain('Trưởng phòng Marketing');
    const head = seeded.titles.find(t => t.id === 'old-head')!;
    expect(head).toMatchObject({ name: 'Trưởng phòng Marketing', code: 'mkt-head', level: 2, kind: 'manager', capacity: 1 });
  });

  it('loại vị trí khai báo rõ được ưu tiên, không đoán theo chữ trong tên', () => {
    expect(titleKind({ name: 'Trưởng dự án đặc biệt', kind: 'staff' })).toBe('staff');
    expect(titleKind({ name: 'Chuyên viên kiêm nhiệm', kind: 'manager' })).toBe('manager');
    expect(titleLevel({ name: 'Chuyên viên', kind: 'manager', level: 3 })).toBe(3);
    expect(slotCapacity({ name: 'Điều phối', kind: 'staff', capacity: 1 })).toBe(1);
    // Dữ liệu cũ chưa chuẩn hóa vẫn suy ra được như trước
    expect(titleKind({ name: 'Kế toán trưởng' })).toBe('manager');
  });

  it('ô một người theo capacity thay thế an toàn dù loại vị trí là nhân viên', () => {
    const c = emptyConfig();
    c.units.push({ id: 'dep', name: 'Phòng X', kind: 'department', active: true });
    c.titles.push({ id: 'slot1', name: 'Điều phối', active: true, unit_id: 'dep', kind: 'staff', level: 1, capacity: 1 });
    const first = assignSlot(c, 'dep', 'slot1', 'u1');
    const second = assignSlot(first, 'dep', 'slot1', 'u2');
    expect(slotHolders(second, 'dep', 'slot1').map(m => m.user_id)).toEqual(['u2']);
    expect(slotHistory(second, 'dep', 'slot1')).toHaveLength(2);
  });

  it('đếm nhân sự đang giữ chức danh để báo người bị ảnh hưởng', () => {
    const c = ensureDefaultStructure(emptyConfig()).config;
    const dep = c.units.find(u => u.name === 'Phòng Marketing')!.id;
    const staffTitle = unitTitles(c, dep).find(t => t.name === 'Nhân viên Marketing')!;
    const next = assignSlot(assignSlot(c, dep, staffTitle.id, 'u1'), dep, staffTitle.id, 'u2');
    expect(titleHolders(next, staffTitle.id)).toHaveLength(2);
  });
});

describe('nhật ký thay đổi tổ chức', () => {
  const nameOf = (id: string) => ({ u1: 'An', u2: 'Bình' } as Record<string, string>)[id] ?? id;

  it('ghi nhận gán, bỏ gán và đổi cấp bậc chức danh', () => {
    const before = ensureDefaultStructure(emptyConfig()).config;
    const dep = before.units.find(u => u.name === 'Phòng Marketing')!.id;
    const head = unitTitles(before, dep).find(t => t.name === 'Trưởng phòng Marketing')!;
    const assigned = assignSlot(before, dep, head.id, 'u1');
    expect(orgConfigDiff(before, assigned, nameOf)).toEqual(['Gán An vào Trưởng phòng Marketing · Phòng Marketing']);
    const removed = unassignSlot(assigned, dep, head.id, 'u1');
    expect(orgConfigDiff(assigned, removed, nameOf)).toEqual(['Bỏ gán An khỏi Trưởng phòng Marketing · Phòng Marketing']);
    const leveled = { ...before, titles: before.titles.map(t => (t.id === head.id ? { ...t, level: 3 } : t)) };
    expect(orgConfigDiff(before, leveled, nameOf)).toEqual(['Đổi cấp bậc Trưởng phòng Marketing: 2 → 3']);
  });

  it('ghi nhận thêm đơn vị và đổi tên đơn vị', () => {
    const before = emptyConfig();
    const after = ensureDefaultStructure(before).config;
    const diff = orgConfigDiff(before, after, nameOf);
    expect(diff).toContain('Thêm đơn vị Khối Marketing');
    expect(diff.some(d => d.startsWith('Thêm chức danh Trưởng phòng Marketing (cấp 2, Quản lý)'))).toBe(true);
    const renamed = { ...after, units: after.units.map(u => (u.name === 'Khối Marketing' ? { ...u, name: 'Khối Tiếp thị' } : u)) };
    expect(orgConfigDiff(after, renamed, nameOf)).toEqual(['Đổi tên đơn vị Khối Marketing → Khối Tiếp thị']);
  });

  it('không báo thay đổi khi hai cấu hình giống nhau', () => {
    const c = ensureDefaultStructure(emptyConfig()).config;
    expect(orgConfigDiff(c, structuredClone(c), nameOf)).toEqual([]);
    expect(orgConfigDiff(undefined, c, nameOf)).toEqual([]);
  });
});

describe('gán nhiều nhân sự bằng checkbox', () => {
  const seeded = () => ensureDefaultStructure(emptyConfig()).config;
  const mktDep = (c: ReturnType<typeof seeded>) => c.units.find(u => u.name === 'Phòng Marketing')!.id;
  const staffTitle = (c: ReturnType<typeof seeded>) => unitTitles(c, mktDep(c)).find(t => t.name === 'Nhân viên Marketing')!;

  it('gán 5 nhân viên cùng lúc vào Marketing', () => {
    const c = seeded();
    const r = assignMany(c, mktDep(c), staffTitle(c).id, ['u1', 'u2', 'u3', 'u4', 'u5']);
    expect(r.added).toHaveLength(5);
    expect(r.skipped).toHaveLength(0);
    expect(slotHolders(r.config, mktDep(c), staffTitle(c).id)).toHaveLength(5);
  });

  it('người đã có phân công tại đơn vị đích được báo lỗi riêng, không thêm trùng', () => {
    const c = assignSlot(seeded(), mktDep(seeded()), staffTitle(seeded()).id, 'u1');
    const r = assignMany(c, mktDep(c), staffTitle(c).id, ['u1', 'u2']);
    expect(r.added).toEqual(['u2']);
    expect(r.skipped).toEqual([{ userId: 'u1', reason: 'Đã có phân công này' }]);
    expect(slotHolders(r.config, mktDep(c), staffTitle(c).id).filter(m => m.user_id === 'u1')).toHaveLength(1);
  });

  it('ô một người từ chối gán hàng loạt khi đang có người giữ', () => {
    const c = seeded();
    const dep = mktDep(c);
    const head = unitTitles(c, dep).find(t => t.name === 'Trưởng phòng Marketing')!;
    const withHead = assignSlot(c, dep, head.id, 'u1');
    const r = assignMany(withHead, dep, head.id, ['u2', 'u3']);
    expect(r.added).toHaveLength(0);
    expect(r.skipped).toHaveLength(2);
    expect(slotHolders(r.config, dep, head.id).map(m => m.user_id)).toEqual(['u1']);
  });

  it('gán kiêm nhiệm giữ nguyên phân công chính hiện có', () => {
    const c = assignSlot(seeded(), mktDep(seeded()), staffTitle(seeded()).id, 'u1');
    const designDep = c.units.find(u => u.name === 'Phòng Thiết kế')!.id;
    const designStaff = unitTitles(c, designDep).find(t => t.name === 'Nhân viên Thiết kế')!;
    const r = assignMany(c, designDep, designStaff.id, ['u1'], 'concurrent');
    const mine = r.config.memberships.filter(m => m.active && m.user_id === 'u1');
    expect(mine).toHaveLength(2);
    expect(membershipKind(mine.find(m => m.unit_id === designDep)!)).toBe('concurrent');
    expect(membershipKind(mine.find(m => m.unit_id === mktDep(c))!)).toBe('primary');
  });
});

describe('điều chuyển và kết thúc kiêm nhiệm', () => {
  const seeded = () => ensureDefaultStructure(emptyConfig()).config;
  const depId = (c: ReturnType<typeof seeded>, name: string) => c.units.find(u => u.name === name)!.id;

  it('điều chuyển kết thúc phân công chính cũ, tạo phân công mới và giữ lịch sử', () => {
    let c = seeded();
    const mkt = depId(c, 'Phòng Marketing');
    const design = depId(c, 'Phòng Thiết kế');
    const mktStaff = unitTitles(c, mkt).find(t => t.name === 'Nhân viên Marketing')!;
    const designStaff = unitTitles(c, design).find(t => t.name === 'Nhân viên Thiết kế')!;
    c = assignSlot(c, mkt, mktStaff.id, 'u1');
    const r = transferMembers(c, ['u1'], design, designStaff.id);
    expect(r.moved).toEqual(['u1']);
    const old = r.config.memberships.find(m => m.user_id === 'u1' && m.unit_id === mkt)!;
    expect(old.active).toBe(false);
    expect(old.ends_at).toBeTruthy();
    const now = r.config.memberships.filter(m => m.active && m.user_id === 'u1');
    expect(now).toHaveLength(1);
    expect(now[0].unit_id).toBe(design);
  });

  it('điều chuyển giữ nguyên kiêm nhiệm ở đơn vị khác', () => {
    let c = seeded();
    const mkt = depId(c, 'Phòng Marketing');
    const design = depId(c, 'Phòng Thiết kế');
    const acc = depId(c, 'Phòng Kế toán');
    const mktStaff = unitTitles(c, mkt).find(t => t.name === 'Nhân viên Marketing')!;
    const designStaff = unitTitles(c, design).find(t => t.name === 'Nhân viên Thiết kế')!;
    const accStaff = unitTitles(c, acc).find(t => t.name === 'Kế toán kho')!;
    c = assignSlot(c, mkt, mktStaff.id, 'u1');
    c = assignMany(c, design, designStaff.id, ['u1'], 'concurrent').config;
    const r = transferMembers(c, ['u1'], acc, accStaff.id);
    const active = r.config.memberships.filter(m => m.active && m.user_id === 'u1');
    expect(active.some(m => m.unit_id === design && membershipKind(m) === 'concurrent')).toBe(true);
    expect(active.some(m => m.unit_id === mkt)).toBe(false);
    expect(active.some(m => m.unit_id === acc)).toBe(true);
  });

  it('xem trước điều chuyển cảnh báo vị trí quản lý sẽ kết thúc', () => {
    let c = seeded();
    const mkt = depId(c, 'Phòng Marketing');
    const design = depId(c, 'Phòng Thiết kế');
    const head = unitTitles(c, mkt).find(t => t.name === 'Trưởng phòng Marketing')!;
    const designStaff = unitTitles(c, design).find(t => t.name === 'Nhân viên Thiết kế')!;
    c = assignSlot(c, mkt, head.id, 'u1');
    const p = transferPreview(c, ['u1']);
    expect(p.endedManagers).toHaveLength(1);
    const r = transferMembers(c, ['u1'], design, designStaff.id);
    expect(r.endedManagers).toHaveLength(1);
    expect(slotHolders(r.config, mkt, head.id)).toHaveLength(0);
    expect(slotHistory(r.config, mkt, head.id)).toHaveLength(1);
  });

  it('kết thúc một kiêm nhiệm không ảnh hưởng phân công chính', () => {
    let c = seeded();
    const mkt = depId(c, 'Phòng Marketing');
    const design = depId(c, 'Phòng Thiết kế');
    const mktStaff = unitTitles(c, mkt).find(t => t.name === 'Nhân viên Marketing')!;
    const designStaff = unitTitles(c, design).find(t => t.name === 'Nhân viên Thiết kế')!;
    c = assignSlot(c, mkt, mktStaff.id, 'u1');
    c = assignMany(c, design, designStaff.id, ['u1'], 'concurrent').config;
    const concurrent = c.memberships.find(m => m.active && m.user_id === 'u1' && m.unit_id === design)!;
    const next = endMembership(c, concurrent.id);
    const active = next.memberships.filter(m => m.active && m.user_id === 'u1');
    expect(active).toHaveLength(1);
    expect(active[0].unit_id).toBe(mkt);
    expect(next.memberships.find(m => m.id === concurrent.id)?.ends_at).toBeTruthy();
  });

  it('điều chuyển người đã ở đơn vị đích báo lỗi, không tạo trùng', () => {
    let c = seeded();
    const mkt = depId(c, 'Phòng Marketing');
    const mktStaff = unitTitles(c, mkt).find(t => t.name === 'Nhân viên Marketing')!;
    c = assignSlot(c, mkt, mktStaff.id, 'u1');
    const r = transferMembers(c, ['u1'], mkt, mktStaff.id);
    expect(r.moved).toHaveLength(0);
    expect(r.skipped).toEqual([{ userId: 'u1', reason: 'Đã có phân công này tại đơn vị đích' }]);
  });
});

describe('đường dẫn và cây đơn vị', () => {
  it('unitDescendants gồm chính đơn vị và con cháu', () => {
    const c = ensureDefaultStructure(emptyConfig()).config;
    const mkt = c.units.find(u => u.name === 'Khối Marketing')!.id;
    const tree = unitDescendants(c, mkt);
    expect(tree).toHaveLength(3);
    expect(tree).toContain(depIdOf(c, 'Phòng Marketing'));
    expect(tree).toContain(depIdOf(c, 'Phòng Thiết kế'));
  });

  it('unitPath hiển thị Khối / Bộ phận', () => {
    const c = ensureDefaultStructure(emptyConfig()).config;
    expect(unitPath(c, depIdOf(c, 'Phòng Kế toán'))).toBe('Khối Vận hành / Phòng Kế toán');
  });
});

function depIdOf(c: ReturnType<typeof ensureDefaultStructure>['config'], name: string) {
  return c.units.find(u => u.name === name)!.id;
}
