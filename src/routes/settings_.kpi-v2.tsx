import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate, AssignKpiV2 } from "@/components/kpi/KpiV2";

export const Route = createFileRoute("/settings_/kpi-v2")({
  head: () => ({ meta: [{ title: "Giao KPI — Base Marketing" }] }),
  component: () => <KpiV2Gate title="Giao KPI" perm={["kpi.view_own", "kpi.view_all", "kpi.goal_create", "kpi.goal_edit", "kpi.goal_archive", "kpi.goal_delete", "kpi.kr_assign", "kpi.kr_adjust", "kpi.period_manage"]}>{(a) => <AssignKpiV2 actor={a} />}</KpiV2Gate>,
});
