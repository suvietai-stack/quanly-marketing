import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";

export const Route = createFileRoute("/biz/goals")({
  head: () => ({ meta: [
    { title: "Mục tiêu KR — Quản trị Kinh doanh" },
    { name: "description", content: "Lập mục tiêu KR năm, tự phân bổ theo từng tháng và gửi lãnh đạo phê duyệt." },
    { property: "og:title", content: "Mục tiêu KR — Quản trị Kinh doanh" },
    { property: "og:description", content: "Lập mục tiêu KR năm, phân bổ theo tháng và gửi phê duyệt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["biz.goal_submit", "biz.goal_approve", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Mục tiêu KR" description="Lập mục tiêu năm, tự phân bổ xuống từng tháng, gửi lãnh đạo duyệt." />
        <div className="rounded-xl border border-dashed bg-card p-10 text-center space-y-2">
          <Target className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <div className="font-medium">Chưa có mục tiêu nào</div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Chức năng lập mục tiêu năm, phân bổ 12 tháng và quy trình phê duyệt đang được xây dựng ở bước tiếp theo.
          </p>
        </div>
      </div>
    </RequirePermission>
  ),
});
