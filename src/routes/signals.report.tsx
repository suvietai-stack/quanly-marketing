import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/components/PermissionGate";
import { SignalsReport } from "@/components/signals/SignalsReport";

export const Route = createFileRoute("/signals/report")({
  head: () => ({ meta: [
    { title: "Báo cáo tín hiệu và chăm sóc Sale — Base Sứ Việt" },
    { name: "description", content: "Theo dõi hiệu quả nguồn, tỷ lệ chốt và cập nhật diễn biến khách hàng của Sale trong phạm vi được phép." },
    { property: "og:title", content: "Báo cáo tín hiệu và chăm sóc Sale — Base Sứ Việt" },
    { property: "og:description", content: "Theo dõi hiệu quả nguồn, tỷ lệ chốt và cập nhật diễn biến khách hàng của Sale trong phạm vi được phép." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["signal.report", "signal.manage"]}>
      <SignalsReport />
    </RequirePermission>
  ),
});
