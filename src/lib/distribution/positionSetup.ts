import type { OrgConfig, Title } from "@/lib/basePermissions/types";
import type { OrgCommand } from "@/lib/basePermissions/commands";
import type { CatalogRole } from "@/lib/basePermissions/roleCatalog";
import { areaUnitIds, DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";

export const DISTRIBUTION_POSITION_ROLES = [
  {
    name: "Giám đốc Kinh doanh Phân Phối",
    roleId: "role-v2-distribution-director",
    code: "distribution-director",
    kind: "manager",
    level: 3,
  },
  {
    name: "Trưởng phòng Phân phối",
    roleId: "role-v2-distribution-head",
    code: "distribution-head",
    kind: "manager",
    level: 2,
  },
  {
    name: "Trưởng nhóm Phân phối",
    roleId: "role-v2-distribution-team",
    code: "distribution-team",
    kind: "manager",
    level: 1,
  },
  {
    name: "Nhân viên phân phối",
    roleId: "role-v2-distribution-staff",
    code: "distribution-staff",
    kind: "staff",
    level: 0,
  },
] as const;

export function distributionDefinitions(config: OrgConfig, unitId: string) {
  if (!areaUnitIds(config.units, DISTRIBUTION_UNIT).has(unitId)) return [];
  const unit = config.units.find((u) => u.id === unitId);
  return DISTRIBUTION_POSITION_ROLES.filter(
    (p) =>
      unitId === DISTRIBUTION_UNIT ||
      p.level === 0 ||
      (unit?.kind === "department" && p.level === 2) ||
      (unit?.kind === "team" && p.level === 1),
  );
}

export function missingDistributionPositions(config: OrgConfig, unitId: string) {
  return distributionDefinitions(config, unitId).some(
    (p) => !config.titles.some((t) => t.unit_id === unitId && t.code === p.code && t.active),
  );
}

/** Empty canonical positions only. Occupied Biz titles require a separate audited cutover. */
export function distributionPositionSetup(
  config: OrgConfig,
  unitId: string,
  roles: CatalogRole[],
): { next: OrgConfig; commands: OrgCommand[] } {
  const definitions = distributionDefinitions(config, unitId);
  if (!definitions.length) throw new Error("Đơn vị không thuộc nhánh Phân Phối đang hoạt động.");
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
    ) {
      throw new Error(
        `Role ${p.name} chưa được tạo và kiểm chứng tại kho Role. Chưa thể gắn vị trí.`,
      );
    }
    const matches = titles.filter(
      (t) => t.unit_id === unitId && (t.code === p.code || t.name === p.name),
    );
    const existing = matches[0];
    if (
      matches.length > 1 ||
      (existing &&
        (!existing.active ||
          existing.name !== p.name ||
          existing.code !== p.code ||
          existing.kind !== p.kind ||
          existing.level !== p.level ||
          existing.capacity !== 0 ||
          existing.source === "biz_positions"))
    ) {
      throw new Error(`Vị trí ${p.name} có cấu hình khác; cần đối chiếu trước khi thay đổi.`);
    }
    if (
      existing &&
      config.memberships.some((m) => m.unit_id === unitId && m.title_id === existing.id)
    ) {
      throw new Error(`Vị trí ${p.name} đã có lịch sử bổ nhiệm; cần quy trình chuyển nguồn riêng.`);
    }
    const id = existing?.id ?? crypto.randomUUID();
    if (!existing)
      titles.push({
        id,
        unit_id: unitId,
        name: p.name,
        code: p.code,
        kind: p.kind,
        level: p.level,
        capacity: 0,
        active: true,
        source: "canonical",
      });
    commands.push({
      action: "position_role",
      data: {
        unit_id: unitId,
        title_id: id,
        role_id: p.roleId,
        reason: "Thiết lập vị trí Phân Phối riêng; không chuyển bổ nhiệm hiện hữu",
      },
    });
  }
  return { next: { ...config, titles }, commands };
}
