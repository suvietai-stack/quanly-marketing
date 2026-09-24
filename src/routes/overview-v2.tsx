import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate } from "@/components/kpi/KpiV2";
import { OverviewV2 } from "@/components/kpi/OverviewV2";
import { validateV2Search } from "@/lib/kpi/overview";

export const Route = createFileRoute("/overview-v2")({
  validateSearch: validateV2Search,
  head: () => ({ meta: [{ title: "Tổng quan Brand V2 (thử nghiệm) — Base Marketing" }, { name: "description", content: "Bản thử nghiệm tổng quan mục tiêu theo thương hiệu và kênh." }, { name: "robots", content: "noindex" }] }),
  component: OverviewV2Page,
});

function OverviewV2Page() {
  const search = Route.useSearch();
  return <KpiV2Gate title="Tổng quan theo Brand / Kênh (V2 thử nghiệm)">{(a) => <OverviewV2 key={JSON.stringify(search)} actor={a} search={search} />}</KpiV2Gate>;
}
