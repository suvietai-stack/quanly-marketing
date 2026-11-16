import { describe, expect, it } from "vitest";
import { buildOrganizationTree, countPeople } from "@/lib/orgChart";
import { emptyConfig, type OrgConfig } from "@/lib/basePermissions/types";
import { DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";
import { distributionDefinitions } from "./positionSetup";

const config = (): OrgConfig => ({
  ...emptyConfig(),
  units: [
    { id: "org-company", name: "Công ty", kind: "company", active: true },
    {
      id: "biz-block",
      name: "Khối Kinh doanh",
      kind: "block",
      parent_id: "org-company",
      active: true,
    },
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
    {
      id: "orders",
      name: "Kinh doanh Đơn hàng",
      kind: "department",
      parent_id: "biz-block",
      active: true,
    },
  ],
  titles: [
    { id: "head", name: "Trưởng Phòng", unit_id: "dept", kind: "manager", level: 2, active: true },
  ],
  memberships: [{ id: "real", user_id: "person", title_id: "head", unit_id: "dept", active: true }],
});

describe("Distribution visual hierarchy without live reparent", () => {
  it("moves the same ID to company peer and connects the existing department directly", () => {
    const c = config();
    const before = structuredClone(c);
    const root = buildOrganizationTree(c, [{ id: "person", name: "Existing person" }])[0];
    const center = root.children.find((n) => n.id === DISTRIBUTION_UNIT);
    expect(root.children.map((n) => n.id)).toEqual(["biz-block", DISTRIBUTION_UNIT]);
    expect(center?.kind).toBe("block");
    expect(center?.visualHierarchy).toBe(true);
    expect(center?.children.map((n) => n.id)).toEqual(["dept"]);
    expect(root.children.find((n) => n.id === "biz-block")?.children.map((n) => n.id)).toEqual([
      "orders",
    ]);
    expect(center?.children[0].slots?.[0].holders.map((h) => h.id)).toEqual(["person"]);
    expect(c).toEqual(before);
    expect(c.units.find((u) => u.id === DISTRIBUTION_UNIT)?.parent_id).toBe("biz-block");
  });
  it("does not fabricate a team or relocate department employees", () => {
    const c = config();
    const center = buildOrganizationTree(c, [])[0].children.find((n) => n.id === DISTRIBUTION_UNIT);
    expect(center?.children[0].children).toEqual([]);
    expect(distributionDefinitions(c, DISTRIBUTION_UNIT).map((p) => p.level)).toEqual([3]);
    expect(distributionDefinitions(c, "dept").map((p) => p.level)).toEqual([2, 0]);
    if (!center) throw new Error("Missing center");
    expect(countPeople(center)).toBe(1);
  });
  it("preserves a real group beneath its original department", () => {
    const c = config();
    c.units.push({
      id: "real-team",
      name: "Existing group",
      kind: "team",
      parent_id: "dept",
      active: true,
    });
    const center = buildOrganizationTree(c, [])[0].children.find((n) => n.id === DISTRIBUTION_UNIT);
    expect(center?.children[0].children.map((n) => n.id)).toEqual(["real-team"]);
    expect(distributionDefinitions(c, "real-team").map((p) => p.level)).toEqual([1, 0]);
  });
  it("keeps a partial authorized chart independent without inventing a company", () => {
    const c = config();
    c.units = c.units.filter((u) => !["org-company", "biz-block", "orders"].includes(u.id));
    const tree = buildOrganizationTree(c, []);
    expect(tree.map((n) => n.id)).toEqual([DISTRIBUTION_UNIT]);
    expect(tree[0].children.map((n) => n.id)).toEqual(["dept"]);
  });
});
