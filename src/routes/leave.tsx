import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/components/PermissionGate";
import { LeavePage } from "@/components/leave/LeaveUi";

export const Route = createFileRoute("/leave")({
  head: () => ({ meta: [
    { title: "Đơn từ & Phê duyệt — Base Marketing" },
    { name: "description", content: "Gửi và phê duyệt đơn nghỉ phép, đi muộn, về sớm nội bộ." },
    { property: "og:title", content: "Đơn từ & Phê duyệt — Base Marketing" },
    { property: "og:description", content: "Gửi và phê duyệt đơn nghỉ phép, đi muộn, về sớm nội bộ." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["leave.view_own", "leave.create", "leave.view_assigned", "leave.approve", "leave.view_all", "leave.report", "att.create", "att.view_own", "att.witness", "att.view_all", "att.reconcile", "att.report", "att.manage"]}>
      <LeavePage />
    </RequirePermission>
  ),
});
