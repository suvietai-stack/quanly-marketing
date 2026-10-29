import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate, AssignKpiV2 } from "@/components/kpi/KpiV2";

export const Route = createFileRoute("/settings_/kpi-v2")({
  head: () => ({ meta: [{"title": "Giao KPI — Base Sứ Việt"}, {"name": "description", "content": "Giao KPI: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:title", "content": "Giao KPI — Base Sứ Việt"}, {"property": "og:description", "content": "Giao KPI: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => <KpiV2Gate title="Giao KPI" perm={["kpi.view_own", "kpi.view_all", "kpi.goal_create", "kpi.goal_edit", "kpi.goal_archive", "kpi.goal_delete", "kpi.kr_assign", "kpi.kr_adjust", "kpi.period_manage"]}>{(a) => <AssignKpiV2 actor={a} />}</KpiV2Gate>,
});
