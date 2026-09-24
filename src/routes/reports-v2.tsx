import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate } from "@/components/kpi/KpiV2";
import { ReportV2 } from "@/components/kpi/ReportV2";
import { validateV2Search } from "@/lib/kpi/overview";

export const Route = createFileRoute("/reports-v2")({
  validateSearch: validateV2Search,
  head: () => ({ meta: [{ title: "Báo cáo nhân sự V2 (thử nghiệm) — Base Marketing" }, { name: "description", content: "Bản thử nghiệm báo cáo hiệu suất theo nhân sự." }, { name: "robots", content: "noindex" }] }),
  component: ReportsV2Page,
});

function ReportsV2Page() {
  const search = Route.useSearch();
  return <KpiV2Gate title="Báo cáo hiệu suất theo nhân sự (V2 thử nghiệm)">{(a) => <ReportV2 key={JSON.stringify(search)} actor={a} search={search} />}</KpiV2Gate>;
}
