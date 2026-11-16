import { expect, it } from "vitest";
import { buildOrganizationTree } from "@/lib/orgChart";
import { emptyConfig, type OrgConfig } from "@/lib/basePermissions/types";
import { B2B_CENTER, BTC_CENTER, RETAIL_SYSTEM, HANOI_SHOWROOM } from "@/lib/orgCenters";
import { DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";
const config = (): OrgConfig => ({
  ...emptyConfig(),
  units: [
    { id: "company", name: "Company", kind: "company", active: true },
    { id: "biz-block", name: "Business", kind: "block", parent_id: "company", active: true },
    { id: B2B_CENTER, name: "Orders", kind: "system", parent_id: "biz-block", active: true },
    {
      id: DISTRIBUTION_UNIT,
      name: "Distribution",
      kind: "system",
      parent_id: "biz-block",
      active: true,
    },
    { id: BTC_CENTER, name: "Showroom", kind: "block", parent_id: "company", active: true },
    { id: RETAIL_SYSTEM, name: "Bán Lẻ", kind: "system", parent_id: BTC_CENTER, active: true },
    {
      id: HANOI_SHOWROOM,
      name: "Showrom Hà Nội",
      kind: "department",
      parent_id: RETAIL_SYSTEM,
      active: true,
    },
  ],
});
it("three centers share company parent, empty retail wrapper alone is hidden", () => {
  const c = config();
  const before = structuredClone(c);
  const tree = buildOrganizationTree(c, [])[0];
  expect(tree.children.filter((n) => n.visualHierarchy).map((n) => n.id)).toEqual([
    B2B_CENTER,
    DISTRIBUTION_UNIT,
    BTC_CENTER,
  ]);
  expect(tree.children.find((n) => n.id === BTC_CENTER)?.children.map((n) => n.id)).toEqual([
    HANOI_SHOWROOM,
  ]);
  expect(c).toEqual(before);
});
it("retains history-bearing wrapper with warning and original holders", () => {
  const c = config();
  c.memberships = [
    { id: "old", unit_id: RETAIL_SYSTEM, user_id: "past", active: false },
    { id: "real", unit_id: HANOI_SHOWROOM, user_id: "current", active: true },
  ];
  const children = buildOrganizationTree(c, [])[0].children.find((n) => n.id === BTC_CENTER)
    ?.children ?? [];
  expect(children.map((n) => n.id)).toEqual([HANOI_SHOWROOM, RETAIL_SYSTEM]);
  expect(children[0].people.map((p) => p.id)).toEqual(["current"]);
  expect(children[1].hierarchyWarning).toBeTruthy();
  expect(children[1].children).toEqual([]);
});
it("never discards empty configured slots or nonstructural metadata", () => {
  const c = config();
  c.titles = [{ id: "slot", unit_id: RETAIL_SYSTEM, name: "Empty position", active: true }];
  const children = buildOrganizationTree(c, [])[0].children.find((n) => n.id === BTC_CENTER)
    ?.children ?? [];
  expect(children.map((n) => n.id)).toEqual([HANOI_SHOWROOM, RETAIL_SYSTEM]);
  expect(children[1].slots?.[0].id).toBe("slot");
});

it("hides only empty redundant Khối Kinh doanh after promoting both centers", () => {
  const c = config();
  expect(buildOrganizationTree(c, [])[0].children.map(n => n.id)).toEqual([
    B2B_CENTER, DISTRIBUTION_UNIT, BTC_CENTER,
  ]);
  c.memberships.push({ id: "old-biz", unit_id: "biz-block", user_id: "old-person", active: false });
  const guarded = buildOrganizationTree(c, [])[0];
  expect(guarded.children.some(n => n.id === "biz-block")).toBe(true);
});
