import { expect, it } from "vitest";
import { emptyConfig, type OrgConfig } from "./types";
import type { CatalogRole } from "./roleCatalog";
import { B2B_CENTER, BTC_CENTER, RETAIL_SYSTEM } from "@/lib/orgCenters";
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
    { id: "store", name: "Store", kind: "department", parent_id: RETAIL_SYSTEM, active: true },
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
