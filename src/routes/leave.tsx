import { createFileRoute } from "@tanstack/react-router";
import { LeaveAccess } from "@/components/leave/LeaveAccess";

export const Route = createFileRoute("/leave")({
  head: () => ({ meta: [
    { title: "Nghỉ phép & Đi sớm muộn — Base Marketing" },
    { name: "description", content: "Gửi và phê duyệt đơn nghỉ phép, đi muộn, về sớm nội bộ." },
    { property: "og:title", content: "Nghỉ phép & Đi sớm muộn — Base Marketing" },
    { property: "og:description", content: "Gửi và phê duyệt đơn nghỉ phép, đi muộn, về sớm nội bộ." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LeaveAccess,
});
