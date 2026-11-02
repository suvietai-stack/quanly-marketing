import { createFileRoute } from "@tanstack/react-router";
import { Biz3K } from "@/components/biz/Biz3K";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";

export const Route = createFileRoute("/biz/3k")({
  head: () => ({ meta: [
    { title: "Quản lý 3K — Quản trị Kinh doanh" },
    { name: "description", content: "Lập và thực thi công việc 3K hằng ngày: mục tiêu KG, công việc KF, chỉ số KPI, mũi khoan trọng tâm và tổng kết cuối ngày." },
    { property: "og:title", content: "Quản lý 3K — Quản trị Kinh doanh" },
    { property: "og:description", content: "Công cụ thực thi hằng ngày theo phương pháp 3K của Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["k3.use", "k3.view_scope", "k3.settings", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Quản lý 3K" description="Lập công việc đầu ngày, cập nhật tiến độ trong ngày và tổng kết cuối ngày theo phương pháp 3K." />
        <Biz3K />
      </div>
    </RequirePermission>
  ),
});
