import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate, AssignKpiV2 } from "@/components/kpi/KpiV2";

export const Route = createFileRoute("/settings_/kpi-v2")({
  head: () => ({ meta: [{ title: "Giao KPI V2 (thử nghiệm) — Base Marketing" }, { name: "robots", content: "noindex" }] }),
  component: () => <KpiV2Gate title="Giao KPI (V2 thử nghiệm)">{(a) => <AssignKpiV2 actor={a} />}</KpiV2Gate>,
});
