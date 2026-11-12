import type { Membership, OrgConfig, Title, Unit } from '@/lib/basePermissions/types';

/**
 * Cơ cấu mặc định toàn Base: Khối Marketing và Khối Vận hành với bộ phận + chức danh chốt.
 * Khối Kinh doanh kế thừa dữ liệu thật từ hệ thống Kinh doanh, không nằm trong cấu hình này.
 * ID cố định để chạy lại không nhân đôi; chức danh là dữ liệu tổ chức, không tạo Role/quyền mới.
 */
const uid = (n: number) => `b5e00000-0000-4000-8000-${String(n).padStart(12, '0')}`;

interface DefaultUnit { n: number; name: string; kind: Unit['kind']; parent?: number }
interface DefaultTitle { n: number; name: string; dep: number; code: string; level: number; kind: 'manager' | 'staff'; capacity: number }

export const DEFAULT_UNITS: DefaultUnit[] = [
  { n: 1, name: 'Khối Marketing', kind: 'block' },
  { n: 2, name: 'Khối Vận hành', kind: 'block' },
  { n: 11, name: 'Phòng Marketing', kind: 'department', parent: 1 },
  { n: 12, name: 'Phòng Thiết kế', kind: 'department', parent: 1 },
  { n: 21, name: 'Hành chính & Nhân sự', kind: 'department', parent: 2 },
  { n: 22, name: 'Phòng Kế toán', kind: 'department', parent: 2 },
  { n: 23, name: 'Phòng Mua hàng & Giao vận', kind: 'department', parent: 2 },
];

/** Chức danh mặc định: tên chính thức, mã ổn định, cấp bậc theo mô hình 5→0, quản lý một người, nhân viên không giới hạn. */
export const DEFAULT_TITLES: DefaultTitle[] = [
  { n: 120, name: 'Giám đốc Marketing', dep: 1, code: 'mkt_director', level: 3, kind: 'manager', capacity: 1 },
  { n: 101, name: 'Trưởng phòng Marketing', dep: 11, code: 'mkt-head', level: 2, kind: 'manager', capacity: 1 },
  { n: 102, name: 'Nhân viên Marketing', dep: 11, code: 'mkt-staff', level: 0, kind: 'staff', capacity: 0 },
  { n: 103, name: 'Trưởng phòng Thiết kế', dep: 12, code: 'design-head', level: 2, kind: 'manager', capacity: 1 },
  { n: 104, name: 'Nhân viên Thiết kế', dep: 12, code: 'design-staff', level: 0, kind: 'staff', capacity: 0 },
  { n: 106, name: 'Hành chính Nhân sự', dep: 21, code: 'hr-staff', level: 0, kind: 'staff', capacity: 0 },
  { n: 107, name: 'Kế toán trưởng', dep: 22, code: 'acc-head', level: 2, kind: 'manager', capacity: 1 },
  { n: 108, name: 'Kế toán kho', dep: 22, code: 'acc-stock', level: 0, kind: 'staff', capacity: 0 },
  { n: 109, name: 'Trưởng phòng Mua hàng & Giao vận', dep: 23, code: 'proc-head', level: 2, kind: 'manager', capacity: 1 },
  { n: 110, name: 'Nhân viên Thu mua', dep: 23, code: 'proc-buyer', level: 0, kind: 'staff', capacity: 0 },
  { n: 111, name: 'Nhân viên Đóng hàng', dep: 23, code: 'proc-packer', level: 0, kind: 'staff', capacity: 0 },
];

const norm = (s: string) => s.trim().toLocaleLowerCase('vi');

/** Dự phòng cho chức danh cũ chưa có loại vị trí — chức danh mới luôn khai báo kind rõ ràng. */
export function isManagerTitle(name: string): boolean {
  const n = norm(name);
  return n.includes('trưởng') || n.includes('giám đốc');
}

/** Loại vị trí của chức danh: ưu tiên khai báo rõ, chỉ đoán theo tên với dữ liệu cũ chưa chuẩn hóa. */
export function titleKind(t: Pick<Title, 'name' | 'kind'>): 'manager' | 'staff' {
  return t.kind ?? (isManagerTitle(t.name) ? 'manager' : 'staff');
}

/** Cấp bậc hiển thị: ưu tiên khai báo; dữ liệu cũ suy ra từ loại vị trí. */
export function titleLevel(t: Pick<Title, 'name' | 'kind' | 'level'>): number {
  return t.level ?? (titleKind(t) === 'manager' ? 2 : 0);
}

/** Số người tối đa của ô chức danh: 1 với quản lý, 0 nghĩa là không giới hạn. */
export function slotCapacity(t: Pick<Title, 'name' | 'kind' | 'capacity'>): number {
  return t.capacity ?? (titleKind(t) === 'manager' ? 1 : 0);
}

export interface SeedResult { config: OrgConfig; addedUnits: string[]; addedTitles: string[]; updatedTitles: string[] }

/**
 * Bổ sung đơn vị/chức danh mặc định còn thiếu vào bản nháp cấu hình.
 * Không sửa tên, không xóa dữ liệu hiện có; khớp theo tên + cấp (và bộ phận với chức danh) để không trùng khi chạy lại.
 * Chức danh đã có nhưng thiếu mã/cấp bậc/loại vị trí được bổ sung thông tin chuẩn (không đổi tên, không đổi quyền).
 */
export function ensureDefaultStructure(config: OrgConfig): SeedResult {
  const units = [...config.units];
  const titles = [...config.titles];
  const addedUnits: string[] = [];
  const addedTitles: string[] = [];
  const updatedTitles: string[] = [];
  const unitId = new Map<number, string>();

  for (const d of DEFAULT_UNITS) {
    const existing = units.find(u => u.kind === d.kind && norm(u.name) === norm(d.name));
    if (existing) { unitId.set(d.n, existing.id); continue; }
    const id = uid(d.n);
    const parentId = d.parent ? unitId.get(d.parent) : undefined;
    units.push({ id, name: d.name, kind: d.kind, active: true, ...(parentId ? { parent_id: parentId } : {}) });
    unitId.set(d.n, id);
    addedUnits.push(d.name);
  }

  for (const t of DEFAULT_TITLES) {
    const depId = unitId.get(t.dep);
    if (!depId) continue;
    const existing = titles.find(x => norm(x.name) === norm(t.name) && (x.unit_id ?? '') === depId);
    if (existing) {
      if (existing.code === undefined || existing.level === undefined || existing.kind === undefined || existing.capacity === undefined) {
        const i = titles.indexOf(existing);
        titles[i] = {
          ...existing,
          code: existing.code ?? t.code,
          level: existing.level ?? t.level,
          kind: existing.kind ?? t.kind,
          capacity: existing.capacity ?? t.capacity,
        };
        updatedTitles.push(t.name);
      }
      continue;
    }
    titles.push({ id: uid(t.n), name: t.name, active: true, unit_id: depId, code: t.code, level: t.level, kind: t.kind, capacity: t.capacity });
    addedTitles.push(t.name);
  }

  return { config: { ...config, units, titles }, addedUnits, addedTitles, updatedTitles };
}

/** Phần cơ cấu mặc định còn thiếu hoặc chưa chuẩn hóa cấp bậc — để hiện nút khởi tạo. */
export function missingDefaultStructure(config: OrgConfig): boolean {
  const r = ensureDefaultStructure(config);
  return r.addedUnits.length > 0 || r.addedTitles.length > 0 || r.updatedTitles.length > 0;
}

/** Chức danh đang hoạt động gắn với một bộ phận (chức danh chung không có unit_id không thuộc ô nào). */
export function unitTitles(config: OrgConfig, unitId: string): Title[] {
  const unit = config.units.find(u => u.id === unitId);
  // Chức danh Kinh doanh không gắn đơn vị chỉ hiển thị trong các đơn vị thuộc Khối Kinh doanh.
  const inBizBlock = (() => {
    let cur = unit;
    const seen = new Set<string>();
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      if (cur.kind === 'block') return cur.id === 'biz-block' || cur.code === 'business' || cur.name.toLocaleLowerCase('vi').includes('kinh doanh');
      const parentId = cur.parent_id;
      cur = config.units.find(x => x.id === parentId);
    }
    return false;
  })();
  return config.titles.filter(t => t.active && (t.unit_id === unitId || (!t.unit_id && t.source === 'biz_positions' && inBizBlock && (t.unit_kind === unit?.kind || (t.unit_kind === 'individual' && ['department','team'].includes(unit?.kind ?? ''))))));
}

/** Người đang giữ một ô chức danh trong bộ phận. */
export function slotHolders(config: OrgConfig, unitId: string, titleId: string): Membership[] {
  return config.memberships.filter(m => membershipEffective(m) && m.unit_id === unitId && m.title_id === titleId);
}

/** Toàn bộ lịch sử gán của một ô chức danh, mới nhất trước. */
export function slotHistory(config: OrgConfig, unitId: string, titleId: string): Membership[] {
  return config.memberships
    .filter(m => m.unit_id === unitId && m.title_id === titleId)
    .sort((a, b) => Date.parse(b.starts_at ?? '') - Date.parse(a.starts_at ?? ''));
}

/** Số nhân sự đang giữ một chức danh (mọi đơn vị) — dùng để báo người bị ảnh hưởng khi chỉnh quyền mặc định. */
export function titleHolders(config: OrgConfig, titleId: string): Membership[] {
  return config.memberships.filter(m => membershipEffective(m) && m.title_id === titleId);
}

export const membershipEffective = (m: Membership, now = new Date().toISOString()): boolean => m.active && m.status !== 'cancelled' && (!m.starts_at || m.starts_at <= now) && (!m.ends_at || m.ends_at > now);
const nowIso = () => new Date().toISOString();

/**
 * Gán người vào ô chức danh trong bản nháp cấu hình.
 * Ô một người (quản lý hoặc capacity = 1): kết thúc người đang giữ rồi gán người mới — tương đương Đổi người.
 * Ô nhiều người: thêm người mới, người đang giữ nguyên; đã giữ thì không thêm trùng.
 */
export function assignSlot(config: OrgConfig, unitId: string, titleId: string, userId: string): OrgConfig {
  const title = config.titles.find(t => t.id === titleId);
  const single = title ? slotCapacity(title) === 1 : true;
  const now = nowIso();
  const already = config.memberships.some(m => membershipEffective(m) && m.unit_id === unitId && m.title_id === titleId && m.user_id === userId);
  if (already) return config;
  const memberships = single
    ? config.memberships.map(m => membershipEffective(m) && m.unit_id === unitId && m.title_id === titleId ? { ...m, active: false, ends_at: now } : m)
    : [...config.memberships];
  memberships.push({ id: crypto.randomUUID(), user_id: userId, unit_id: unitId, title_id: titleId, active: true, starts_at: now });
  return { ...config, memberships };
}

/** Bỏ gán một người khỏi ô chức danh — kết thúc phân công, giữ lịch sử. */
export function unassignSlot(config: OrgConfig, unitId: string, titleId: string, userId: string): OrgConfig {
  const now = nowIso();
  return {
    ...config,
    memberships: config.memberships.map(m =>
      membershipEffective(m) && m.unit_id === unitId && m.title_id === titleId && m.user_id === userId ? { ...m, active: false, ends_at: now } : m),
  };
}

/** Hình thức phân công: mặc định là chính; kiêm nhiệm phải khai báo rõ. */
export function membershipKind(m: Pick<Membership, 'kind'>): 'primary' | 'concurrent' {
  return m.kind ?? 'primary';
}

/** Đơn vị + toàn bộ đơn vị con cháu trong cây cấu hình. */
export function unitDescendants(config: OrgConfig, unitId: string): string[] {
  const out = [unitId];
  for (let i = 0; i < out.length; i++) {
    for (const u of config.units) if (u.parent_id === out[i] && !out.includes(u.id)) out.push(u.id);
  }
  return out;
}

/** Đường dẫn đơn vị trong cây, ví dụ "Khối Marketing / Bộ phận Marketing". */
export function unitPath(config: OrgConfig, unitId: string): string {
  const parts: string[] = [];
  let cur = config.units.find(u => u.id === unitId);
  const seen = new Set<string>();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    parts.unshift(cur.name);
    cur = config.units.find(u => u.id === cur?.parent_id);
  }
  return parts.join(' / ');
}

export interface BatchResult { config: OrgConfig; added: string[]; skipped: { userId: string; reason: string }[] }

/**
 * Gán nhiều nhân sự vào một ô chức danh bằng checkbox.
 * Ô một người: chỉ nhận khi đang trống, ngược lại báo lỗi từng người (dùng Đổi người để thay thế).
 * Ô nhiều người: người đã giữ được giữ nguyên và báo "đã có", không thêm trùng — không áp dụng một phần âm thầm.
 */
export function assignMany(config: OrgConfig, unitId: string, titleId: string, userIds: string[], kind: 'primary' | 'concurrent' = 'primary'): BatchResult {
  const title = config.titles.find(t => t.id === titleId);
  const single = title ? slotCapacity(title) === 1 : true;
  let next = config;
  const added: string[] = [];
  const skipped: { userId: string; reason: string }[] = [];
  const now = nowIso();
  for (const userId of [...new Set(userIds)]) {
    const already = next.memberships.some(m => membershipEffective(m) && m.unit_id === unitId && m.title_id === titleId && m.user_id === userId);
    if (already) { skipped.push({ userId, reason: 'Đã có phân công này' }); continue; }
    if (single && slotHolders(next, unitId, titleId).length > 0) { skipped.push({ userId, reason: 'Vị trí một người đang có người giữ' }); continue; }
    next = { ...next, memberships: [...next.memberships, { id: crypto.randomUUID(), user_id: userId, unit_id: unitId, title_id: titleId, active: true, starts_at: now, kind }] };
    added.push(userId);
  }
  return { config: next, added, skipped };
}

export interface TransferResult { config: OrgConfig; moved: string[]; skipped: { userId: string; reason: string }[]; endedManagers: { userId: string; unitId: string; titleId: string }[] }

/**
 * Điều chuyển nhân sự sang đơn vị mới: kết thúc phân công chính hiện tại (trong phạm vi đơn vị nguồn
 * được chọn, mặc định toàn bộ), tạo phân công chính mới, giữ nguyên kiêm nhiệm ngoài phạm vi và lịch sử.
 * endedManagers liệt kê vị trí quản lý sẽ kết thúc — giao diện phải yêu cầu xác nhận riêng trước khi gọi.
 */
export function transferMembers(config: OrgConfig, userIds: string[], toUnitId: string, toTitleId: string, fromUnitIds?: string[]): TransferResult {
  const scope = fromUnitIds ? new Set(fromUnitIds) : null;
  let next = config;
  const moved: string[] = [];
  const skipped: { userId: string; reason: string }[] = [];
  const endedManagers: { userId: string; unitId: string; titleId: string }[] = [];
  const now = nowIso();
  for (const userId of [...new Set(userIds)]) {
    if (next.memberships.some(m => membershipEffective(m) && m.unit_id === toUnitId && m.title_id === toTitleId && m.user_id === userId)) {
      skipped.push({ userId, reason: 'Đã có phân công này tại đơn vị đích' });
      continue;
    }
    const ending = next.memberships.filter(m => membershipEffective(m) && m.user_id === userId && membershipKind(m) === 'primary' && (!scope || scope.has(m.unit_id)));
    for (const m of ending) {
      const t = next.titles.find(x => x.id === m.title_id);
      if (t && slotCapacity(t) === 1) endedManagers.push({ userId, unitId: m.unit_id, titleId: m.title_id ?? '' });
    }
    next = {
      ...next,
      memberships: [
        ...next.memberships.map(m => ending.some(e => e.id === m.id) ? { ...m, active: false, ends_at: now } : m),
        { id: crypto.randomUUID(), user_id: userId, unit_id: toUnitId, title_id: toTitleId, active: true, starts_at: now, kind: 'primary' as const },
      ],
    };
    moved.push(userId);
  }
  return { config: next, moved, skipped, endedManagers };
}

/** Kết thúc một phân công theo ID — dùng để kết thúc riêng từng kiêm nhiệm, giữ lịch sử. */
export function endMembership(config: OrgConfig, membershipId: string): OrgConfig {
  const now = nowIso();
  return { ...config, memberships: config.memberships.map(m => m.id === membershipId && m.active ? { ...m, active: false, ends_at: now } : m) };
}

/** Xem trước kết quả điều chuyển (không thay đổi cấu hình) để giao diện hiển thị cảnh báo trước khi áp dụng. */
export function transferPreview(config: OrgConfig, userIds: string[], fromUnitIds?: string[]): { ending: Membership[]; endedManagers: Membership[] } {
  const scope = fromUnitIds ? new Set(fromUnitIds) : null;
  const ending = config.memberships.filter(m => membershipEffective(m) && userIds.includes(m.user_id) && membershipKind(m) === 'primary' && (!scope || scope.has(m.unit_id)));
  const endedManagers = ending.filter(m => { const t = config.titles.find(x => x.id === m.title_id); return t ? slotCapacity(t) === 1 : false; });
  return { ending, endedManagers };
}

const kindLabel = (k: 'manager' | 'staff') => (k === 'manager' ? 'Quản lý' : 'Nhân viên');

/**
 * Tóm tắt thay đổi tổ chức giữa hai phiên bản cấu hình — phục vụ Nhật ký.
 * Chỉ mô tả đơn vị/chức danh/phân công; thay đổi quyền đã có phần tác động riêng.
 */
export function orgConfigDiff(before: OrgConfig | undefined, after: OrgConfig | undefined, nameOf: (id: string) => string): string[] {
  if (!before || !after) return [];
  const out: string[] = [];
  const unitName = (c: OrgConfig, id?: string) => c.units.find(u => u.id === id)?.name ?? '';
  const titleName = (c: OrgConfig, id?: string) => c.titles.find(t => t.id === id)?.name ?? '';

  for (const u of after.units) {
    const b = before.units.find(x => x.id === u.id);
    if (!b) { out.push(`Thêm đơn vị ${u.name}`); continue; }
    if (b.name !== u.name) out.push(`Đổi tên đơn vị ${b.name} → ${u.name}`);
    if (b.active !== u.active) out.push(`${u.active ? 'Kích hoạt' : 'Ngừng'} đơn vị ${u.name}`);
    if ((b.parent_id ?? '') !== (u.parent_id ?? '')) out.push(`Chuyển đơn vị ${u.name} sang ${unitName(after, u.parent_id) || 'cấp gốc'}`);
  }
  for (const u of before.units) if (!after.units.some(x => x.id === u.id)) out.push(`Xóa đơn vị ${u.name}`);

  for (const t of after.titles) {
    const b = before.titles.find(x => x.id === t.id);
    if (!b) { out.push(`Thêm chức danh ${t.name} (cấp ${titleLevel(t)}, ${kindLabel(titleKind(t))})`); continue; }
    if (b.name !== t.name) out.push(`Đổi tên chức danh ${b.name} → ${t.name}`);
    if (titleLevel(b) !== titleLevel(t)) out.push(`Đổi cấp bậc ${t.name}: ${titleLevel(b)} → ${titleLevel(t)}`);
    if (titleKind(b) !== titleKind(t)) out.push(`Đổi loại vị trí ${t.name}: ${kindLabel(titleKind(b))} → ${kindLabel(titleKind(t))}`);
    if ((b.unit_id ?? '') !== (t.unit_id ?? '')) out.push(`Chuyển chức danh ${t.name} sang ${unitName(after, t.unit_id) || 'chức danh chung'}`);
    if (b.active !== t.active) out.push(`${t.active ? 'Kích hoạt' : 'Ngừng'} chức danh ${t.name}`);
  }
  for (const t of before.titles) if (!after.titles.some(x => x.id === t.id)) out.push(`Xóa chức danh ${t.name}`);

  for (const m of after.memberships) {
    const b = before.memberships.find(x => x.id === m.id);
    const where = `${titleName(after, m.title_id) || 'Chưa có chức danh'} · ${unitName(after, m.unit_id)}`;
    if (!b) { if (m.active) out.push(`Gán ${nameOf(m.user_id)} vào ${where}`); continue; }
    if (b.active && !m.active) out.push(`Bỏ gán ${nameOf(m.user_id)} khỏi ${where}`);
    if (!b.active && m.active) out.push(`Gán lại ${nameOf(m.user_id)} vào ${where}`);
    if ((b.duties ?? '') !== (m.duties ?? '')) out.push(`Đổi nhiệm vụ của ${nameOf(m.user_id)} tại ${where}`);
  }

  return out;
}
