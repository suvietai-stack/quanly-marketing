import { createFileRoute } from "@tanstack/react-router";
import { CommercialAreaGate } from '@/components/distribution/AreaAccessGate';
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import { BizSettings } from "@/components/biz/BizSettings";

export const Route = createFileRoute("/biz/settings")({
  head: () => ({ meta: [
    { title: "Cài đặt — Quản trị Kinh doanh" },
    { name: "description", content: "Cấu hình quy trình phê duyệt, chỉ số KR và deadline Kinh doanh Base Sứ Việt." },
    { property: "og:title", content: "Cài đặt — Quản trị Kinh doanh" },
    { property: "og:description", content: "Quy trình phê duyệt, chỉ số KR và deadline Kinh doanh Base Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <CommercialAreaGate area="orders"><RequirePermission perm={["biz.org_manage", "biz.workflow_manage", "biz.kr_manage", "biz.dept_manage", "biz.deadline_manage", "settings.role"]}>
      <div>
        <PageHeader title="Cài đặt — Quản trị Kinh doanh" description="Quy trình phê duyệt, chỉ số KR và deadline. Cơ cấu tổ chức, chức vụ và phân quyền quản lý tại Hành chính & Nhân sự → Cơ cấu tổ chức." />
        <BizSettings />
      </div>
    </RequirePermission></CommercialAreaGate>
  ),
});
