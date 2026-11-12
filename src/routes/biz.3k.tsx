import { createFileRoute } from "@tanstack/react-router";
import { Biz3K } from "@/components/biz/Biz3K";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/biz/3k")({
  head: () => ({ meta: [
    { title: "3K của tôi — Base Sứ Việt" },
    { name: "description", content: "Quản lý thực thi 3K Ngày, Tuần và Tháng tại Sứ Việt: mục tiêu KG, hành động KF, KPI, công việc và tổng kết." },
    { property: "og:title", content: "3K của tôi — Base Sứ Việt" },
    { property: "og:description", content: "Một công việc xuyên suốt 3K Ngày, Tuần và Tháng của Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
      <div>
        <div className="hidden md:block"><PageHeader title="3K của tôi" /></div>
        <Biz3K />
      </div>
  ),
});
