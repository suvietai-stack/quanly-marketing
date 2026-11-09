import { createFileRoute } from "@tanstack/react-router";
import { FinanceRequests } from "@/components/finance/FinanceRequests";

export const Route = createFileRoute("/finance/payment")({
  head: () => ({ meta: [
    { title: "Đề Nghị Thanh Toán — Tài Chính Kế Toán" },
    { name: "description", content: "Đề nghị thanh toán nhà cung cấp, hoàn chi phí nhân viên và quyết toán tạm ứng." },
    { property: "og:title", content: "Đề Nghị Thanh Toán — Tài Chính Kế Toán" },
    { property: "og:description", content: "Đề nghị thanh toán nhà cung cấp, hoàn chi phí nhân viên và quyết toán tạm ứng." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <FinanceRequests kind="payment" />,
});
