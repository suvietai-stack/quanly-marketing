import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate } from "@/components/kpi/KpiV2";
import { ReportV2 } from "@/components/kpi/ReportV2";

export const Route = createFileRoute("/reports-v2")({
  head: () => ({ meta: [{ title: "Báo cáo nhân sự V2 (thử nghiệm) — Base Marketing" }, { name: "robots", content: "noindex" }] }),
  component: () => <KpiV2Gate title="Báo cáo hiệu suất theo nhân sự (V2 thử nghiệm)">{(a) => <ReportV2 actor={a} />}</KpiV2Gate>,
});
