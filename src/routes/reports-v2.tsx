import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KpiV2Gate } from "@/components/kpi/KpiV2";
import { ReportV2 } from "@/components/kpi/ReportV2";
import { OverviewV2 } from "@/components/kpi/OverviewV2";
import { validateV2Search } from "@/lib/kpi/overview";

export const Route = createFileRoute("/reports-v2")({
  validateSearch: validateV2Search,
  head: () => ({ meta: [
    { title: "Báo cáo — Base Marketing" },
    { name: "description", content: "Báo cáo tiến độ theo dự án và hiệu suất theo nhân sự." },
    { property: "og:title", content: "Báo cáo — Base Marketing" },
    { property: "og:description", content: "Báo cáo tiến độ theo dự án và hiệu suất theo nhân sự." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ReportsV2Page,
});

function ReportsV2Page() {
  const search = Route.useSearch();
  const [tab, setTab] = useState<"project" | "staff">(search.userId ? "staff" : "project");
  return (
    <KpiV2Gate title="Báo cáo">
      {(a) => (
        <div className="space-y-4">
          <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
            {(["project", "staff"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 ${tab === t ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}>
                {t === "project" ? "Theo dự án" : "Theo nhân sự"}
              </button>
            ))}
          </div>
          {tab === "project"
            ? <OverviewV2 key={`p${JSON.stringify(search)}`} actor={a} search={search} />
            : <ReportV2 key={`s${JSON.stringify(search)}`} actor={a} search={search} />}
        </div>
      )}
    </KpiV2Gate>
  );
}
