import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate } from "@/components/kpi/KpiV2";
import { OverviewV2 } from "@/components/kpi/OverviewV2";
import { validateV2Search } from "@/lib/kpi/overview";

export const Route = createFileRoute("/overview-v2")({
  validateSearch: validateV2Search,
  head: () => ({ meta: [{"title": "Tổng quan Brand — Base Sứ Việt"}, {"name": "description", "content": "Tổng quan mục tiêu theo thương hiệu và kênh."}, {"property": "og:title", "content": "Tổng quan Brand — Base Sứ Việt"}, {"property": "og:description", "content": "Tổng quan mục tiêu theo thương hiệu và kênh."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: OverviewV2Page,
});

function OverviewV2Page() {
  const search = Route.useSearch();
  return <KpiV2Gate title="Tổng quan theo Brand / Kênh" perm="kpi.report">{(a) => <OverviewV2 key={JSON.stringify(search)} actor={a} search={search} />}</KpiV2Gate>;
}
