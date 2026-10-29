import { createFileRoute } from "@tanstack/react-router";
import { KpiV2Gate, GoalsV2 } from "@/components/kpi/KpiV2";

export const Route = createFileRoute("/goals-v2")({
  head: () => ({ meta: [{"title": "Mục tiêu — Base Sứ Việt"}, {"name": "description", "content": "Mục tiêu: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:title", "content": "Mục tiêu — Base Sứ Việt"}, {"property": "og:description", "content": "Mục tiêu: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => <KpiV2Gate title="Mục tiêu" perm={["kpi.view_own", "kpi.view_all", "kpi.goal_create", "kpi.goal_edit", "kpi.kr_assign"]}>{(a) => <GoalsV2 actor={a} />}</KpiV2Gate>,
});
