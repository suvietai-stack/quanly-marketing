import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/components/PermissionGate";
import { Crm } from "@/components/crm/Crm";
export const Route = createFileRoute("/biz/crm")({
  head: () => ({
    meta: [
      { title: "CRM Khách Hàng — Base Sứ Việt" },
      {
        name: "description",
        content: "Quản lý khách hàng, lịch chăm sóc và báo cáo CRM theo cơ cấu Kinh doanh Sứ Việt.",
      },
      { property: "og:title", content: "CRM Khách Hàng — Base Sứ Việt" },
      {
        property: "og:description",
        content: "Hồ sơ khách hàng và chăm sóc hằng ngày theo phạm vi được phân quyền.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequirePermission perm="biz.crm_use">
      <Crm />
    </RequirePermission>
  ),
});
