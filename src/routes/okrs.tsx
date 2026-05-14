import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { ComingSoon } from "@/components/Common";

export const Route = createFileRoute("/okrs")({
  head: () => ({ meta: [{ title: "OKRs — Base Marketing" }] }),
  component: () => (
    <>
      <PageHeader title="OKRs" description="Quản lý mục tiêu phòng ban, thương hiệu, kênh." />
      <ComingSoon
        title="Module OKRs sẽ được phát triển ở giai đoạn sau"
        items={[
          "Mục tiêu toàn phòng",
          "Mục tiêu theo thương hiệu",
          "Mục tiêu theo kênh",
          "Tiến độ hiện tại",
          "Đánh giá cuối kỳ",
        ]}
      />
    </>
  ),
});
