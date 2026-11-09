import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/components/PermissionGate";
import { SaleWork } from "@/components/salework/SaleWork";

export const Route = createFileRoute("/biz/sale-work")({
  head: () => ({
    meta: [
      { title: "Sale Work Zalo — Base Sứ Việt" },
      { name: "description", content: "Liên kết truy cập và thông tin đăng nhập Sale Work Zalo được cấp riêng cho từng nhân sự Sứ Việt." },
      { property: "og:title", content: "Sale Work Zalo — Base Sứ Việt" },
      { property: "og:description", content: "Truy cập nhanh Sale Work Zalo với tài khoản được cấp và bảo vệ riêng." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequirePermission perm={["sale_work.access", "sale_work.manage_settings", "sale_work.manage_credentials"]}>
      <SaleWork />
    </RequirePermission>
  ),
});
