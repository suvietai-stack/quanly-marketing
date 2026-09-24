import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate, GoalsV2 } from "@/components/kpi/KpiV2";

export const Route = createFileRoute("/goals-v2")({
  head: () => ({ meta: [{ title: "Mục tiêu — Base Marketing" }] }),
  component: () => <KpiV2Gate title="Mục tiêu">{(a) => <GoalsV2 actor={a} />}</KpiV2Gate>,
});
