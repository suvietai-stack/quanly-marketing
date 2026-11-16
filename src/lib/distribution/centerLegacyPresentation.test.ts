import { expect, it } from "vitest";
import { buildOrganizationTree } from "@/lib/orgChart";
import { emptyConfig, type OrgConfig } from "@/lib/basePermissions/types";
import { B2B_CENTER } from "@/lib/orgCenters";

it("labels occupied shared Sales title as legacy with clear canonical target, retaining the holder", () => {
  const c: OrgConfig = {
    ...emptyConfig(),
    units: [
      { id: "company", name: "Công ty", kind: "company", active: true },
      { id: "biz-block", name: "Khối Kinh doanh", kind: "block", parent_id: "company", active: true },
      { id: B2B_CENTER, name: "Kinh doanh Đơn Hàng", kind: "system", parent_id: "biz-block", active: true },
    ],
    titles: [{
      id: "legacy-director", name: "Giám Đốc", code: "director", kind: "manager", level: 3,
      unit_kind: "system", source: "biz_positions", active: true,
    }],
    memberships: [{
      id: "real", unit_id: B2B_CENTER, user_id: "person", title_id: "legacy-director", active: true,
    }],
  };
  const before = structuredClone(c);
  const company = buildOrganizationTree(c, [{ id: "person", name: "Nhân sự hiện tại" }])[0];
  const center = company.children.find(x => x.id === B2B_CENTER);
  expect(center?.slots?.[0]).toMatchObject({
    legacy: true,
    targetTitle: "Giám đốc Trung tâm Kinh doanh B2B",
    title: "Giám Đốc",
  });
  expect(center?.slots?.[0]?.holders.map(x => x.id)).toEqual(["person"]);
  expect(c).toEqual(before);
});
