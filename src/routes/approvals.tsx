import { createFileRoute } from "@tanstack/react-router";
import { ApprovalCenter } from "@/components/approvals/ApprovalCenter";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [
    { title: "Trung tâm Phê duyệt — Base Marketing" },
    { name: "description", content: "Một nơi xem và xử lý toàn bộ hồ sơ đang chờ bạn phê duyệt trên Base Sứ Việt." },
    { property: "og:title", content: "Trung tâm Phê duyệt — Base Marketing" },
    { property: "og:description", content: "Một nơi xem và xử lý toàn bộ hồ sơ đang chờ bạn phê duyệt trên Base Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ApprovalCenter,
});
