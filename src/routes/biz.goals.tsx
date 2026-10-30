import { createFileRoute } from "@tanstack/react-router";
import { BizGoals } from "@/components/biz/BizGoals";
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
    <RequirePermission perm={["biz.view_own", "biz.goal_submit", "biz.goal_approve", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Mục tiêu KR" description="Lập mục tiêu năm, tự phân bổ xuống từng tháng, gửi lãnh đạo duyệt." />
        <BizGoals />
      </div>
    </RequirePermission>
  ),
});
