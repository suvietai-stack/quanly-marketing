import { createFileRoute } from "@tanstack/react-router";
import { Biz3K } from "@/components/biz/Biz3K";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";

export const Route = createFileRoute("/biz/3k")({
  head: () => ({ meta: [
    { title: "Quản lý 3K — Quản trị Kinh doanh" },
    { name: "description", content: "Quản lý thực thi 3K Ngày, Tuần và Tháng tại Sứ Việt: mục tiêu KG, hành động KF, KPI, công việc và tổng kết." },
    { property: "og:title", content: "Quản lý 3K — Quản trị Kinh doanh" },
    { property: "og:description", content: "Một công việc xuyên suốt 3K Ngày, Tuần và Tháng của Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["k3.use", "k3.view_scope", "k3.settings", "biz.view_dept", "biz.view_all"]}>
      <div>
        <PageHeader title="Quản lý 3K" />
        <Biz3K />
      </div>
    </RequirePermission>
  ),
});
