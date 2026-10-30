import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import { BizSettings } from "@/components/biz/BizSettings";

export const Route = createFileRoute("/biz/settings")({
  head: () => ({ meta: [
    { title: "Cài đặt — Quản trị Kinh doanh" },
    { name: "description", content: "Cấu hình chức vụ, cấp bậc, bổ nhiệm, cơ cấu tổ chức, quy trình phê duyệt và phân quyền Kinh doanh Base Sứ Việt." },
    { property: "og:title", content: "Cài đặt — Quản trị Kinh doanh" },
    { property: "og:description", content: "Quản lý chức vụ, cấp bậc, bổ nhiệm, quy trình phê duyệt và phân quyền Kinh doanh Base Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["biz.org_manage", "biz.workflow_manage", "biz.kr_manage", "biz.dept_manage", "biz.deadline_manage", "settings.role"]}>
      <div>
        <PageHeader title="Cài đặt — Quản trị Kinh doanh" description="Phòng ban, chỉ số KR, deadline và phân quyền của module." />
        <BizSettings />
      </div>
    </RequirePermission>
  ),
});
