import type { Membership, OrgConfig, Title, Unit } from '@/lib/basePermissions/types';

/**
 * Cơ cấu mặc định toàn Base: Khối Marketing và Khối Vận hành với bộ phận + chức danh chốt.
 * Khối Kinh doanh kế thừa dữ liệu thật từ hệ thống Kinh doanh, không nằm trong cấu hình này.
 * ID cố định để chạy lại không nhân đôi; chức danh là dữ liệu tổ chức, không tạo Role/quyền mới.
 */
const uid = (n: number) => `b5e00000-0000-4000-8000-${String(n).padStart(12, '0')}`;

interface DefaultUnit { n: number; name: string; kind: Unit['kind']; parent?: number }
interface DefaultTitle { n: number; name: string; dep: number }

export const DEFAULT_UNITS: DefaultUnit[] = [
  { n: 1, name: 'Khối Marketing', kind: 'block' },
  { n: 2, name: 'Khối Vận hành', kind: 'block' },
  { n: 11, name: 'Bộ phận Marketing', kind: 'department', parent: 1 },
  { n: 12, name: 'Bộ phận Thiết kế', kind: 'department', parent: 1 },
  { n: 21, name: 'Bộ phận Hành chính & Nhân sự', kind: 'department', parent: 2 },
  { n: 22, name: 'Bộ phận Kế toán', kind: 'department', parent: 2 },
  { n: 23, name: 'Bộ phận Mua hàng & Giao vận', kind: 'department', parent: 2 },
];

export const DEFAULT_TITLES: DefaultTitle[] = [
  { n: 101, name: 'Trưởng bộ phận Marketing', dep: 11 },
  { n: 102, name: 'Nhân viên Marketing', dep: 11 },
  { n: 103, name: 'Trưởng bộ phận Thiết kế', dep: 12 },
  { n: 104, name: 'Nhân viên Thiết kế', dep: 12 },
  { n: 105, name: 'Trưởng bộ phận Hành chính & Nhân sự', dep: 21 },
  { n: 106, name: 'Nhân viên Hành chính & Nhân sự', dep: 21 },
  { n: 107, name: 'Kế toán trưởng', dep: 22 },
  { n: 108, name: 'Kế toán kho', dep: 22 },
  { n: 109, name: 'Trưởng bộ phận Mua hàng & Giao vận', dep: 23 },
  { n: 110, name: 'Nhân viên Thu mua', dep: 23 },
  { n: 111, name: 'Nhân viên Đóng hàng', dep: 23 },
];

const norm = (s: string) => s.trim().toLocaleLowerCase('vi');

/** Chức danh quản lý chỉ một người giữ tại một thời điểm; chức danh nhân viên cho nhiều người. */
export function isManagerTitle(name: string): boolean {
  const n = norm(name);
  return n.includes('trưởng') || n.includes('giám đốc');
}

export interface SeedResult { config: OrgConfig; addedUnits: string[]; addedTitles: string[] }

/**
 * Bổ sung đơn vị/chức danh mặc định còn thiếu vào bản nháp cấu hình.
 * Không sửa, không xóa dữ liệu hiện có; khớp theo tên + cấp (và bộ phận với chức danh) để không trùng khi chạy lại.
 */
export function ensureDefaultStructure(config: OrgConfig): SeedResult {
  const units = [...config.units];
  const titles = [...config.titles];
  const addedUnits: string[] = [];
  const addedTitles: string[] = [];
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
    if (existing) continue;
    titles.push({ id: uid(t.n), name: t.name, active: true, unit_id: depId });
    addedTitles.push(t.name);
  }

  return { config: { ...config, units, titles }, addedUnits, addedTitles };
}

/** Phần cơ cấu mặc định còn thiếu — để hiện nút khởi tạo. */
export function missingDefaultStructure(config: OrgConfig): boolean {
  const r = ensureDefaultStructure(config);
  return r.addedUnits.length > 0 || r.addedTitles.length > 0;
}

/** Chức danh đang hoạt động gắn với một bộ phận (chức danh chung không có unit_id không thuộc ô nào). */
export function unitTitles(config: OrgConfig, unitId: string): Title[] {
  return config.titles.filter(t => t.active && t.unit_id === unitId);
}

/** Người đang giữ một ô chức danh trong bộ phận. */
export function slotHolders(config: OrgConfig, unitId: string, titleId: string): Membership[] {
  return config.memberships.filter(m => m.active && m.unit_id === unitId && m.title_id === titleId);
}

/** Toàn bộ lịch sử gán của một ô chức danh, mới nhất trước. */
export function slotHistory(config: OrgConfig, unitId: string, titleId: string): Membership[] {
  return config.memberships
    .filter(m => m.unit_id === unitId && m.title_id === titleId)
    .sort((a, b) => Date.parse(b.starts_at ?? '') - Date.parse(a.starts_at ?? ''));
}

const nowIso = () => new Date().toISOString();

/**
 * Gán người vào ô chức danh trong bản nháp cấu hình.
 * Ô quản lý (một người): kết thúc người đang giữ rồi gán người mới — tương đương Đổi người.
 * Ô nhân viên (nhiều người): thêm người mới, người đang giữ nguyên; đã giữ thì không thêm trùng.
 */
export function assignSlot(config: OrgConfig, unitId: string, titleId: string, userId: string): OrgConfig {
  const title = config.titles.find(t => t.id === titleId);
  const single = title ? isManagerTitle(title.name) : true;
  const now = nowIso();
  const already = config.memberships.some(m => m.active && m.unit_id === unitId && m.title_id === titleId && m.user_id === userId);
  if (already) return config;
  const memberships = single
    ? config.memberships.map(m => m.active && m.unit_id === unitId && m.title_id === titleId ? { ...m, active: false, ends_at: now } : m)
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
      m.active && m.unit_id === unitId && m.title_id === titleId && m.user_id === userId ? { ...m, active: false, ends_at: now } : m),
  };
}
