import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";

export const Route = createFileRoute("/biz/reports")({
  head: () => ({ meta: [
    { title: "Báo cáo kinh doanh — Quản trị Kinh doanh" },
    { name: "description", content: "Nộp báo cáo kinh doanh Tháng / Quý / Năm, nhập số thực tế và đính kèm Google Docs giải trình." },
    { property: "og:title", content: "Báo cáo kinh doanh — Quản trị Kinh doanh" },
    { property: "og:description", content: "Nộp báo cáo kinh doanh theo kỳ, lãnh đạo xác nhận kết quả." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["biz.report_submit", "biz.report_approve", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Báo cáo kinh doanh" description="Nộp báo cáo Tháng / Quý / Năm, nhập số thực tế và đính kèm Google Docs giải trình." />
        <div className="rounded-xl border border-dashed bg-card p-10 text-center space-y-2">
          <ClipboardCheck className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <div className="font-medium">Chưa có báo cáo nào</div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Chức năng nộp báo cáo theo kỳ và xác nhận kết quả đang được xây dựng ở bước tiếp theo.
          </p>
        </div>
      </div>
    </RequirePermission>
  ),
});
