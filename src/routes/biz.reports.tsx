import { createFileRoute } from "@tanstack/react-router";
import { BizDocuments } from "@/components/biz/BizDocuments";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import {BizReportSettings} from '@/components/biz/BizReportSettings';

export const Route = createFileRoute("/biz/reports")({
  head: () => ({ meta: [
    { title: "Báo cáo kinh doanh — Quản trị Kinh doanh" },
    { name: "description", content: "Báo cáo Sứ Việt theo chu kỳ Ngày, Tuần, Tháng, Quý; cấu hình lịch nộp và xem kết quả kinh doanh." },
    { property: "og:title", content: "Báo cáo kinh doanh — Quản trị Kinh doanh" },
    { property: "og:description", content: "Nộp báo cáo kinh doanh theo kỳ, lãnh đạo xác nhận kết quả." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["biz.report_submit", "biz.report_approve", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Báo cáo kinh doanh" actions={<BizReportSettings/>} />
        <BizDocuments kind="report" />
      </div>
    </RequirePermission>
  ),
});
