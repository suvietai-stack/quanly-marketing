import { createFileRoute } from "@tanstack/react-router";
import { FinanceRequests } from "@/components/finance/FinanceRequests";

export const Route = createFileRoute("/finance/advance")({
  head: () => ({ meta: [
    { title: "Đề Nghị Tạm Ứng — Tài Chính Kế Toán" },
    { name: "description", content: "Tạo và theo dõi đề nghị tạm ứng công việc, phê duyệt trực tuyến và quyết toán." },
    { property: "og:title", content: "Đề Nghị Tạm Ứng — Tài Chính Kế Toán" },
    { property: "og:description", content: "Tạo và theo dõi đề nghị tạm ứng công việc, phê duyệt trực tuyến và quyết toán." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <FinanceRequests kind="advance" />,
});
