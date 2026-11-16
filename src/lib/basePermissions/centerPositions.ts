import type { OrgConfig, Title } from "./types";
import type { OrgCommand } from "./commands";
import type { CatalogRole } from "./roleCatalog";
import { areaUnitIds, DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";
import { B2B_CENTER, BTC_CENTER, RETAIL_SYSTEM } from "@/lib/orgCenters";

export const B2B_POSITIONS = [
  {
    name: "Giám đốc Trung tâm Kinh doanh B2B",
    code: "b2b-director",
    roleId: "role-v2-b2b-director",
    kind: "manager",
    level: 3,
    capacity: 0,
  },
  {
    name: "Trưởng phòng Kinh doanh B2B",
    code: "b2b-head",
    roleId: "role-v2-b2b-head",
    kind: "manager",
    level: 2,
    capacity: 0,
  },
  {
    name: "Trưởng nhóm Kinh doanh B2B",
    code: "b2b-team",
    roleId: "role-v2-b2b-team",
    kind: "manager",
    level: 1,
    capacity: 0,
  },
  {
    name: "Nhân viên Kinh doanh B2B",
    code: "b2b-staff",
    roleId: "role-v2-b2b-staff",
    kind: "staff",
    level: 0,
    capacity: 0,
  },
] as const;
export const DISTRIBUTION_POSITION_ROLES = [
  {
    name: "Giám đốc Kinh doanh Phân Phối",
    roleId: "role-v2-distribution-director",
    code: "distribution-director",
    kind: "manager",
    level: 3,
    capacity: 0,
  },
  {
    name: "Trưởng phòng Phân phối",
    roleId: "role-v2-distribution-head",
    code: "distribution-head",
    kind: "manager",
    level: 2,
    capacity: 0,
  },
  {
    name: "Trưởng nhóm Phân phối",
    roleId: "role-v2-distribution-team",
    code: "distribution-team",
    kind: "manager",
    level: 1,
    capacity: 0,
  },
  {
    name: "Nhân viên phân phối",
    roleId: "role-v2-distribution-staff",
    code: "distribution-staff",
    kind: "staff",
    level: 0,
    capacity: 0,
  },
] as const;
const BTC_DIRECTOR = {
  name: "Giám đốc Trung tâm Kinh doanh BTC",
  code: "btc-director",
  roleId: "role-v2-btc-director",
  kind: "manager",
  level: 3,
  capacity: 0,
} as const;
const SHOWROOM = [
  {
    name: "Cửa hàng trưởng",
    code: "showroom-manager",
    roleId: "role-v2-showroom-manager",
    kind: "manager",
    level: 2,
    capacity: 1,
  },
  {
    name: "Nhân viên Showroom",
    code: "showroom-staff",
    roleId: "role-v2-showroom-staff",
    kind: "staff",
    level: 0,
    capacity: 0,
  },
] as const;

export function centerPositionDefinitions(config: OrgConfig, unitId: string) {
  const unit = config.units.find((u) => u.id === unitId && u.active);
  if (!unit) return [];
  if (unitId === BTC_CENTER) return [BTC_DIRECTOR];
  if (areaUnitIds(config.units, DISTRIBUTION_UNIT).has(unitId))
    return DISTRIBUTION_POSITION_ROLES.filter(
      (p) =>
        (unitId === DISTRIBUTION_UNIT && p.level === 3) ||
        (unit.kind === "department" && [2, 0].includes(p.level)) ||
        (unit.kind === "team" && [1, 0].includes(p.level)),
    );
  if (areaUnitIds(config.units, B2B_CENTER).has(unitId))
    return B2B_POSITIONS.filter(
      (p) =>
        (unitId === B2B_CENTER && p.level === 3) ||
        (unit.kind === "department" && [2, 0].includes(p.level)) ||
        (unit.kind === "team" && [1, 0].includes(p.level)),
    );
  // A Bán Lẻ child is not automatically a showroom (e.g. logistics or storage).
  // Check the real active parent and a showroom label; role scope must never be
  // inferred from chart-only hierarchy projections.
  const btcActive = config.units.some(
    (u) => u.id === BTC_CENTER && u.active && u.kind === "block",
  );
  const parent = config.units.find((u) => u.id === unit.parent_id && u.active);
  if (
    btcActive &&
    unit.kind === "department" &&
    /showroom|showrom/i.test(unit.name) &&
    (parent?.id === BTC_CENTER ||
      (parent?.id === RETAIL_SYSTEM &&
        parent.kind === "system" &&
        parent.parent_id === BTC_CENTER))
  )
    return [...SHOWROOM];
  return [];
}
export function missingCenterPositions(config: OrgConfig, unitId: string) {
  return centerPositionDefinitions(config, unitId).some(
    (p) => !config.titles.some((t) => t.unit_id === unitId && t.code === p.code && t.active),
  );
}

/** Never rebind existing titles. Existing mapped Showroom positions are preserved even when occupied. */
export function centerPositionSetup(
  config: OrgConfig,
  unitId: string,
  roles: CatalogRole[],
  mapping: { unit_id: string | null; title_id: string; roles: string[] }[],
) {
  const definitions = centerPositionDefinitions(config, unitId);
  if (!definitions.length) throw new Error("Đơn vị không thuộc vị trí trung tâm hợp lệ.");
  const titles: Title[] = [...config.titles];
  const commands: OrgCommand[] = [];
  for (const p of definitions) {
    const role = roles.find((r) => r.id === p.roleId);
    if (
      !role ||
      role.name !== p.name ||
      role.role_kind !== "position" ||
      role.catalog_state !== "standard" ||
      role.is_system
    )
      throw new Error(`Role ${p.name} chưa được tạo và kiểm chứng.`);
    const matches = titles.filter(
      (t) => t.unit_id === unitId && (t.code === p.code || t.name === p.name),
    );
    const old = matches[0];
    if (
      mapping.some(
        (b) => b.unit_id === unitId && b.roles.includes(p.roleId) && b.title_id !== old?.id,
      )
    )
      throw new Error(
        `Role ${p.name} đã gắn vị trí khác trong đơn vị; cần kiểm toán để tránh trùng ô.`,
      );
    if (
      matches.length > 1 ||
      (old &&
        (!old.active ||
          old.name !== p.name ||
          old.kind !== p.kind ||
          old.level !== p.level ||
          (old.capacity !== undefined && old.capacity < 0) ||
          old.source === "biz_positions"))
    )
      throw new Error(`Vị trí ${p.name} có cấu hình khác; cần kiểm toán.`);
    if (old) {
      const bindings = mapping.filter((b) => b.unit_id === unitId && b.title_id === old.id);
      if (
        bindings.length === 1 &&
        bindings[0].roles.length === 1 &&
        bindings[0].roles[0] === p.roleId
      )
        continue;
      if (
        bindings.length ||
        config.memberships.some((m) => m.unit_id === unitId && m.title_id === old.id) ||
        config.position_slots?.some((s) => s.unit_id === unitId && s.title_id === old.id)
      ) {
        throw new Error(`Vị trí ${p.name} đã tồn tại; không tự đổi mapping hoặc lịch sử bổ nhiệm.`);
      }
      commands.push({
        action: "position_role",
        data: {
          unit_id: unitId,
          title_id: old.id,
          role_id: p.roleId,
          reason: "Gắn Role cho vị trí trống đã kiểm chứng",
        },
      });
      continue;
    }
    const id = crypto.randomUUID();
    titles.push({
      id,
      unit_id: unitId,
      name: p.name,
      code: p.code,
      kind: p.kind,
      level: p.level,
      capacity: p.capacity,
      active: true,
      source: "canonical",
    });
    commands.push({
      action: "position_role",
      data: {
        unit_id: unitId,
        title_id: id,
        role_id: p.roleId,
        reason: "Thiết lập vị trí trống B2B/BTC, không chuyển nguồn nhân sự",
      },
    });
  }
  return { next: { ...config, titles }, commands };
}
