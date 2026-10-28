import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/components/PermissionGate";
import { SignalsPage } from "@/components/signals/SignalsUi";

export const Route = createFileRoute("/signals/")({
  head: () => ({ meta: [
    { title: "Tín hiệu cơ hội — Base Sứ Việt" },
    { name: "description", content: "Nhập, phân công và theo dõi tín hiệu khách hàng có khả năng phát sinh đơn hàng." },
    { property: "og:title", content: "Tín hiệu cơ hội — Base Sứ Việt" },
    { property: "og:description", content: "Nhập, phân công và theo dõi tín hiệu khách hàng có khả năng phát sinh đơn hàng." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm={["signal.create", "signal.view_all", "signal.manage", "signal.sale", "signal.assign"]}>
      <SignalsPage />
    </RequirePermission>
  ),
});
