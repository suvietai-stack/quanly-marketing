import { expect, it } from "vitest";
import { emptyConfig, type OrgConfig } from "./types";
import type { CatalogRole } from "./roleCatalog";
import { B2B_CENTER, BTC_CENTER, RETAIL_SYSTEM } from "@/lib/orgCenters";
import { DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";
import { B2B_POSITIONS, centerPositionDefinitions, centerPositionSetup } from "./centerPositions";
const config = (): OrgConfig => ({
  ...emptyConfig(),
  units: [
    { id: B2B_CENTER, name: "Orders", kind: "system", active: true },
    {
      id: "dept",
      name: "Real department",
      kind: "department",
      parent_id: B2B_CENTER,
      active: true,
    },
    { id: "team", name: "Real group", kind: "team", parent_id: "dept", active: true },
    { id: BTC_CENTER, name: "Showroom", kind: "block", active: true },
    { id: RETAIL_SYSTEM, name: "Bán Lẻ", kind: "system", parent_id: BTC_CENTER, active: true },
    { id: "store", name: "Showroom Hà Nội", kind: "department", parent_id: RETAIL_SYSTEM, active: true },
  ],
});
const roles = [
  ...B2B_POSITIONS,
  ...centerPositionDefinitions(config(), BTC_CENTER),
  ...centerPositionDefinitions(config(), "store"),
].map((p) => ({
  id: p.roleId,
  name: p.name,
  role_kind: "position",
  catalog_state: "standard",
  is_system: false,
})) as CatalogRole[];
it("uses four independent B2B IDs and BTC director at block, never retail system", () => {
  expect(B2B_POSITIONS.map((p) => p.roleId)).toEqual([
    "role-v2-b2b-director",
    "role-v2-b2b-head",
    "role-v2-b2b-team",
    "role-v2-b2b-staff",
  ]);
  expect(centerPositionDefinitions(config(), B2B_CENTER).map((p) => p.level)).toEqual([3]);
  expect(centerPositionDefinitions(config(), "dept").map((p) => p.level)).toEqual([2, 0]);
  expect(centerPositionDefinitions(config(), "team").map((p) => p.level)).toEqual([1, 0]);
  expect(centerPositionDefinitions(config(), BTC_CENTER).map((p) => p.roleId)).toEqual([
    "role-v2-btc-director",
  ]);
  expect(centerPositionDefinitions(config(), RETAIL_SYSTEM)).toEqual([]);
});
it("creates showroom positions only for true active showroom departments", () => {
  const c = config();
  c.units.push(
    { id: "retail-storage", name: "Kho hàng", kind: "department", parent_id: RETAIL_SYSTEM, active: true },
    { id: "direct-store", name: "Showroom Hải Phòng", kind: "department", parent_id: BTC_CENTER, active: true },
  );
  expect(centerPositionDefinitions(c, "store").map((p) => p.roleId)).toEqual([
    "role-v2-showroom-manager", "role-v2-showroom-staff",
  ]);
  expect(centerPositionDefinitions(c, "direct-store").map((p) => p.roleId)).toEqual([
    "role-v2-showroom-manager", "role-v2-showroom-staff",
  ]);
  expect(centerPositionDefinitions(c, "retail-storage")).toEqual([]);
  c.units = c.units.map((u) => u.id === RETAIL_SYSTEM ? { ...u, active: false } : u);
  expect(centerPositionDefinitions(c, "store")).toEqual([]);
});

it("creates only empty titles with original unit target and no personnel changes", () => {
  const c = config();
  const result = centerPositionSetup(c, BTC_CENTER, roles, []);
  expect(result.next.titles[0]?.unit_id).toBe("showroom-block");
  expect(result.commands[0]?.data.role_id).toBe("role-v2-btc-director");
  expect(result.next.units).toEqual(c.units);
  expect(result.next.memberships).toEqual(c.memberships);
  expect(c.titles).toEqual([]);
});
it("preserves occupied existing Showroom titles/IDs/mappings without rebinding", () => {
  const c = config();
  c.titles = centerPositionDefinitions(c, "store").map((p) => ({
    id: p.code,
    unit_id: "store",
    name: p.name,
    code: p.code,
    kind: p.kind,
    level: p.level,
    capacity: p.capacity,
    active: true,
    source: "canonical",
  }));
  c.memberships = [
    {
      id: "existing",
      user_id: "person",
      unit_id: "store",
      title_id: "showroom-staff",
      active: true,
    },
  ];
  const mapping = c.titles.map((t) => ({
    unit_id: "store",
    title_id: t.id,
    roles: [t.id === "showroom-staff" ? "role-v2-showroom-staff" : "role-v2-showroom-manager"],
  }));
  const result = centerPositionSetup(c, "store", roles, mapping);
  expect(result.commands).toEqual([]);
  expect(result.next).toEqual(c);
  expect(() => centerPositionSetup(c, "store", roles, [])).toThrow(/không tự đổi/);
});
it("fails closed for missing Role, outside branch and inactive center", () => {
  expect(() => centerPositionSetup(config(), B2B_CENTER, [], [])).toThrow(/chưa được tạo/);
  expect(() => centerPositionSetup(config(), "outside", roles, [])).toThrow(/không thuộc/);
  const c = config();
  c.units = c.units.map((u) => (u.id === B2B_CENTER ? { ...u, active: false } : u));
  expect(centerPositionDefinitions(c, "dept")).toEqual([]);
});
it("refuses a duplicate Role-position binding under a differently named title", () => {
  expect(() =>
    centerPositionSetup(config(), B2B_CENTER, roles, [
      { unit_id: B2B_CENTER, title_id: "legacy-director", roles: ["role-v2-b2b-director"] },
    ]),
  ).toThrow(/tránh trùng ô/);
});
it("one shared helper covers Distribution center/department/team without staff duplication", () => {
  const c = config();
  c.units.push(
    { id: DISTRIBUTION_UNIT, name: "Distribution", kind: "system", active: true },
    {
      id: "dist-dept",
      name: "Department",
      kind: "department",
      parent_id: DISTRIBUTION_UNIT,
      active: true,
    },
    { id: "dist-team", name: "Group", kind: "team", parent_id: "dist-dept", active: true },
  );
  expect(centerPositionDefinitions(c, DISTRIBUTION_UNIT).map((p) => p.level)).toEqual([3]);
  expect(centerPositionDefinitions(c, "dist-dept").map((p) => p.level)).toEqual([2, 0]);
  expect(centerPositionDefinitions(c, "dist-team").map((p) => p.level)).toEqual([1, 0]);
  const definitions = centerPositionDefinitions(c, "dist-dept");
  const distRoles = definitions.map((p) => ({
    id: p.roleId,
    name: p.name,
    role_kind: "position",
    catalog_state: "standard",
    is_system: false,
  })) as CatalogRole[];
  const result = centerPositionSetup(c, "dist-dept", distRoles, []);
  expect(result.next.titles).toHaveLength(2);
  expect(result.next.titles.filter((t) => t.kind === "staff")).toHaveLength(1);
  expect(result.next.titles.find((t) => t.kind === "staff")?.capacity).toBe(0);
  const mapping = result.commands.map((command) => ({
    unit_id: "dist-dept",
    title_id: String(command.data.title_id),
    roles: [String(command.data.role_id)],
  }));
  result.next.memberships = ["one", "two"].map((id) => ({
    id,
    user_id: id,
    unit_id: "dist-dept",
    title_id: result.next.titles.find((t) => t.kind === "staff")?.id,
    active: true,
  }));
  expect(centerPositionSetup(result.next, "dist-dept", distRoles, mapping).commands).toEqual([]);
});
it("preserves configured capacity and refuses duplicate or conflicting mappings", () => {
  const result = centerPositionSetup(config(), "store", roles, []);
  result.next.titles = result.next.titles.map((t) => ({
    ...t,
    capacity: t.kind === "staff" ? 12 : 3,
  }));
  const mapping = result.commands.map((c) => ({
    unit_id: "store",
    title_id: String(c.data.title_id),
    roles: [String(c.data.role_id)],
  }));
  expect(
    centerPositionSetup(result.next, "store", roles, mapping).next.titles.map((t) => t.capacity),
  ).toEqual([3, 12]);
  expect(() => centerPositionSetup(result.next, "store", roles, [...mapping, mapping[0]])).toThrow(
    /không tự đổi/,
  );
  result.next.titles.push({ ...result.next.titles[0], id: "duplicate" });
  expect(() => centerPositionSetup(result.next, "store", roles, mapping)).toThrow(/cấu hình khác/);
});
