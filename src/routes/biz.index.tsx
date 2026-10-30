import { createFileRoute } from "@tanstack/react-router";
import { BizDashboard } from "@/components/biz/BizDashboard";
import { RequirePermission } from "@/components/PermissionGate";

export const Route = createFileRoute("/biz/")({
  head: () => ({ meta: [
    { title: "Tổng quan — Quản trị Kinh doanh" },
    { name: "description", content: "Dashboard theo dõi kết quả kinh doanh, KPI, deadline và tình trạng báo cáo của các phòng kinh doanh." },
    { property: "og:title", content: "Tổng quan — Quản trị Kinh doanh" },
    { property: "og:description", content: "Dashboard theo dõi kết quả kinh doanh, KPI, deadline và tình trạng báo cáo." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["biz.view_own", "biz.view_dept", "biz.view_all"]}>
      <BizDashboard />
    </RequirePermission>
  ),
});
