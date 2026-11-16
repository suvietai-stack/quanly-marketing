import { createFileRoute } from "@tanstack/react-router";
import { CommercialAreaGate } from '@/components/distribution/AreaAccessGate';
import { BizDocuments } from "@/components/biz/BizDocuments";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";

export const Route = createFileRoute("/biz/plans")({
  head: () => ({ meta: [
    { title: "Kế hoạch kinh doanh — Quản trị Kinh doanh" },
    { name: "description", content: "Nộp và quản lý kế hoạch kinh doanh Tháng / Quý / Năm bằng đường dẫn Google Docs." },
    { property: "og:title", content: "Kế hoạch kinh doanh — Quản trị Kinh doanh" },
    { property: "og:description", content: "Nộp và quản lý kế hoạch kinh doanh Tháng / Quý / Năm." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <CommercialAreaGate area="orders"><RequirePermission perm={["biz.plan_submit", "biz.plan_request_revision", "biz.plan_approve", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Kế hoạch kinh doanh" description="Nộp và quản lý kế hoạch Tháng / Quý / Năm bằng đường dẫn Google Docs." />
        <BizDocuments kind="plan" />
      </div>
    </RequirePermission></CommercialAreaGate>
  ),
});
