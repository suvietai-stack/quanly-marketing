import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
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
    <RequirePermission perm={["biz.plan_submit", "biz.plan_approve", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Kế hoạch kinh doanh" description="Nộp và quản lý kế hoạch Tháng / Quý / Năm bằng đường dẫn Google Docs." />
        <div className="rounded-xl border border-dashed bg-card p-10 text-center space-y-2">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <div className="font-medium">Chưa có kế hoạch nào</div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Chức năng nộp kế hoạch bằng link Google Docs, kiểm soát deadline và phê duyệt đang được xây dựng ở bước tiếp theo.
          </p>
        </div>
      </div>
    </RequirePermission>
  ),
});
