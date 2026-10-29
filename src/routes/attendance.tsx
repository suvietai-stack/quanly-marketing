import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/components/PermissionGate";
import { AttendancePage } from "@/components/leave/AttendancePage";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [
    { title: "Giải trình chấm công — Base Marketing" },
    { name: "description", content: "Gửi và xử lý giải trình quên chấm công nội bộ." },
    { property: "og:title", content: "Giải trình chấm công — Base Marketing" },
    { property: "og:description", content: "Gửi và xử lý giải trình quên chấm công nội bộ." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["att.create", "att.view_own", "att.witness", "att.view_all", "att.reconcile", "att.report", "att.manage"]}>
      <AttendancePage />
    </RequirePermission>
  ),
});
