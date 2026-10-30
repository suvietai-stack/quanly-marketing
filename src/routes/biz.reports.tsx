import { createFileRoute } from "@tanstack/react-router";
import { BizDocuments } from "@/components/biz/BizDocuments";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";

export const Route = createFileRoute("/biz/reports")({
  head: () => ({ meta: [
    { title: "Báo cáo kinh doanh — Quản trị Kinh doanh" },
    { name: "description", content: "Nộp báo cáo kinh doanh Tháng / Quý / Năm, nhập số thực tế, tài liệu đính kèm tùy chọn." },
    { property: "og:title", content: "Báo cáo kinh doanh — Quản trị Kinh doanh" },
    { property: "og:description", content: "Nộp báo cáo kinh doanh theo kỳ, lãnh đạo xác nhận kết quả." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["biz.report_submit", "biz.report_approve", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Báo cáo kinh doanh" description="Nộp báo cáo Tháng / Quý / Năm, nhập số thực tế, tài liệu đính kèm tùy chọn." />
        <BizDocuments kind="report" />
      </div>
    </RequirePermission>
  ),
});
