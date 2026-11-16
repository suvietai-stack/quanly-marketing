import { describe, expect, it } from "vitest";
import { emptyConfig, type OrgConfig } from "@/lib/basePermissions/types";
import type { CatalogRole } from "@/lib/basePermissions/roleCatalog";
import { organizationCommands } from "@/lib/basePermissions/commands";
import { DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";
import {
  DISTRIBUTION_POSITION_ROLES,
  distributionPositionSetup,
  missingDistributionPositions,
} from "./positionSetup";

const roles = DISTRIBUTION_POSITION_ROLES.map((p) => ({
  id: p.roleId,
  name: p.name,
  role_kind: "position",
  catalog_state: "standard",
  is_system: false,
})) as CatalogRole[];
const setup = (): OrgConfig => ({
  ...emptyConfig(),
  units: [
    { id: "biz-block", name: "Kinh doanh", kind: "block", active: true },
    {
      id: DISTRIBUTION_UNIT,
      name: "Phân Phối",
      kind: "system",
      parent_id: "biz-block",
      active: true,
    },
    {
      id: "dept",
      name: "Kinh doanh Phân Phối 1",
      kind: "department",
      parent_id: DISTRIBUTION_UNIT,
      active: true,
    },
    { id: "team", name: "Nhóm thật", kind: "team", parent_id: "dept", active: true },
    { id: "orders", name: "Đơn hàng", kind: "system", parent_id: "biz-block", active: true },
  ],
  titles: [{ id: "legacy", name: "Giám Đốc", source: "biz_positions", active: true }],
  memberships: [
    {
      id: "history",
      user_id: "original-user",
      unit_id: DISTRIBUTION_UNIT,
      title_id: "legacy",
      slot_id: "original-slot",
      active: true,
      source: "biz_appointments",
    },
  ],
});

describe("Distribution empty-position setup", () => {
  it("uses four independent exact-name Roles, in rank order", () => {
    const center = distributionPositionSetup(setup(), DISTRIBUTION_UNIT, roles);
    const department = distributionPositionSetup(center.next, "dept", roles);
    const team = distributionPositionSetup(department.next, "team", roles);
    expect(DISTRIBUTION_POSITION_ROLES.map((p) => p.name)).toEqual([
      "Giám đốc Kinh doanh Phân Phối",
      "Trưởng phòng Phân phối",
      "Trưởng nhóm Phân phối",
      "Nhân viên phân phối",
    ]);
    expect(DISTRIBUTION_POSITION_ROLES.map((p) => p.level)).toEqual([3, 2, 1, 0]);
    expect(
      [...center.commands, ...department.commands, ...team.commands].map((c) => c.data.role_id),
    ).toEqual([
      "role-v2-distribution-director",
      "role-v2-distribution-head",
      "role-v2-distribution-staff",
      "role-v2-distribution-team",
      "role-v2-distribution-staff",
    ]);
  });
  it("preserves all people, assignments, slots, units and legacy titles", () => {
    const before = setup();
    const frozen = structuredClone(before);
    const { next, commands } = distributionPositionSetup(before, DISTRIBUTION_UNIT, roles);
    expect(before).toEqual(frozen);
    expect(next.memberships).toEqual(frozen.memberships);
    expect(next.units).toEqual(frozen.units);
    expect(next.titles[0]).toEqual(frozen.titles[0]);
    expect(next.titles.slice(1).every((t) => t.capacity === 0)).toBe(true);
    expect([...organizationCommands(before, next), ...commands].map((c) => c.action)).toEqual([
      "title",
      "position_role",
    ]);
  });
  it("binds only department head/staff and real-team lead/staff", () => {
    expect(
      distributionPositionSetup(setup(), "dept", roles).commands.map((c) => c.data.role_id),
    ).toEqual(["role-v2-distribution-head", "role-v2-distribution-staff"]);
    expect(
      distributionPositionSetup(setup(), "team", roles).commands.map((c) => c.data.role_id),
    ).toEqual(["role-v2-distribution-team", "role-v2-distribution-staff"]);
  });
  it.each(["biz-block", "orders", "unknown"])("refuses outside unit %s", (unit) => {
    expect(() => distributionPositionSetup(setup(), unit, roles)).toThrow(/không thuộc/);
  });
  it("fails closed for inactive Distribution ancestor", () => {
    const c = setup();
    c.units = c.units.map((u) => (u.id === DISTRIBUTION_UNIT ? { ...u, active: false } : u));
    expect(() => distributionPositionSetup(c, "dept", roles)).toThrow(/không thuộc/);
  });
  it("requires live catalog records rather than creating fake Roles", () => {
    expect(() => distributionPositionSetup(setup(), DISTRIBUTION_UNIT, [])).toThrow(
      /chưa được tạo/,
    );
    expect(() =>
      distributionPositionSetup(
        setup(),
        DISTRIBUTION_UNIT,
        roles.map((r) => ({ ...r, is_system: true })),
      ),
    ).toThrow(/chưa được tạo/);
  });
  it("reuses empty canonical IDs without creating duplicates", () => {
    const once = distributionPositionSetup(setup(), DISTRIBUTION_UNIT, roles);
    const twice = distributionPositionSetup(once.next, DISTRIBUTION_UNIT, roles);
    expect(twice.next.titles).toEqual(once.next.titles);
    expect(twice.commands).toEqual(once.commands);
    expect(missingDistributionPositions(twice.next, DISTRIBUTION_UNIT)).toBe(false);
  });
  it("refuses even ended history on an existing position", () => {
    const c = distributionPositionSetup(setup(), "dept", roles).next;
    const title = c.titles.find((t) => t.code === "distribution-head");
    if (!title) throw new Error("Missing fixture title");
    c.memberships.push({
      id: "ended",
      user_id: "old-user",
      unit_id: "dept",
      title_id: title.id,
      active: false,
    });
    expect(() => distributionPositionSetup(c, "dept", roles)).toThrow(/lịch sử/);
  });
  it("does not silently repair customized titles", () => {
    const c = distributionPositionSetup(setup(), "dept", roles).next;
    c.titles = c.titles.map((t) => (t.code === "distribution-head" ? { ...t, level: 5 } : t));
    expect(() => distributionPositionSetup(c, "dept", roles)).toThrow(/cấu hình khác/);
  });
});
