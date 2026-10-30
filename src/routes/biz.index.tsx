import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
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
      <div>
        <PageHeader title="Tổng quan kinh doanh" description="Theo dõi kết quả kinh doanh, KPI, deadline và tình trạng báo cáo." />
        <div className="rounded-xl border border-dashed bg-card p-10 text-center space-y-2">
          <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <div className="font-medium">Chưa có dữ liệu</div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Dashboard sẽ hiển thị khi nhân viên lập mục tiêu KR năm và nộp báo cáo. Các chức năng này đang được xây dựng ở bước tiếp theo.
          </p>
        </div>
      </div>
    </RequirePermission>
  ),
});
