import { createFileRoute } from "@tanstack/react-router";
import { FinanceRequests } from "@/components/finance/FinanceRequests";

export const Route = createFileRoute("/finance/salary")({
  head: () => ({ meta: [
    { title: "Tạm Ứng Lương — Tài Chính Kế Toán" },
    { name: "description", content: "Đề nghị tạm ứng lương, phê duyệt và theo dõi khấu trừ theo kỳ lương." },
    { property: "og:title", content: "Tạm Ứng Lương — Tài Chính Kế Toán" },
    { property: "og:description", content: "Đề nghị tạm ứng lương, phê duyệt và theo dõi khấu trừ theo kỳ lương." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <FinanceRequests kind="salary_advance" />,
});
