import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/components/PermissionGate";
import { SignalsReport } from "@/components/signals/SignalsReport";

export const Route = createFileRoute("/signals/report")({
  head: () => ({ meta: [
    { title: "Báo cáo tín hiệu — Base Marketing" },
    { name: "description", content: "Hiệu quả nguồn tín hiệu, tỷ lệ chốt và doanh số chốt theo Marketing và Sale." },
    { property: "og:title", content: "Báo cáo tín hiệu — Base Marketing" },
    { property: "og:description", content: "Hiệu quả nguồn tín hiệu, tỷ lệ chốt và doanh số chốt theo Marketing và Sale." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["signal.report", "signal.manage"]}>
      <SignalsReport />
    </RequirePermission>
  ),
});
