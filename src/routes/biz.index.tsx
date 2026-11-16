import { createFileRoute } from "@tanstack/react-router";
import { CommercialAreaGate } from '@/components/distribution/AreaAccessGate';
import { BizDashboardViews } from "@/components/biz/BizPublishedDashboard";
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
    <CommercialAreaGate area="orders"><RequirePermission perm={["biz.dashboard_public", "biz.view_own", "biz.view_dept", "biz.view_all"]}>
      <BizDashboardViews />
    </RequirePermission></CommercialAreaGate>
  ),
});
