const newK3KpiDraft = () => ({ request_key: crypto.randomUUID(), name: "", measure: "cumulative", condition: "gte", target: "", target_max: "", unit: "", required: true, config: {} });
function k3KpiPayload(k) {
  return { ...k, target: k.measure === "binary" ? 1 : k.target === "" ? null : Number(k.target) * (k.measure === "duration" && k.config.duration_unit === "hours" ? 60 : 1), target_max: k.target_max === "" ? null : Number(k.target_max), milestones: k.config.milestones?.map((m) => m.id) ?? [] };
}
const number = (x) => x == null ? "—" : Number(x).toLocaleString("vi-VN");
function k3MetricDisplay(measure, metric, target, unit = "") {
  if (metric.pending_acceptance && metric.actual == null) return "Chờ nghiệm thu";
  if (metric.actual == null) return "Chưa đủ dữ liệu";
  if (measure === "binary") return metric.pending_acceptance ? "Chờ nghiệm thu" : metric.attained ? "Đã đáp ứng điều kiện" : "Chưa đáp ứng";
  if (measure === "ratio") return `${number(metric.numerator)}/${number(metric.denominator)} = ${number(metric.actual)}%`;
  if (measure === "average") return `${number(metric.actual)} ${unit} (${number(metric.numerator)}/${number(metric.denominator)})`;
  if (measure === "streak") return `Chuỗi ${number(metric.actual)}/${number(target)} ngày · Dài nhất ${number(metric.longest_streak)}`;
  if (measure === "frequency") return `${number(metric.actual)}/${number(target)} ${unit} · ${metric.cycle_start ?? ""} → ${metric.cycle_end ?? ""}`;
  if (measure === "milestone") return `${number(metric.actual)}/${number(metric.milestone_total ?? target)} mốc`;
  return `${number(metric.actual)}${target == null ? "" : `/${number(target)}`} ${unit}${metric.progress == null ? "" : ` · ${number(metric.progress)}%`}`;
}
function k3DailyReport(date, people, labels = {}) {
  const actions = new Map(people.flatMap((p) => p.data.actions.map((a) => [a.id, a])));
  const active = [...actions.values()].filter((a) => a.metric.status !== "done");
  const updated = people.filter((p) => p.data.updated).length;
  const issues = people.reduce((n, p) => n + p.data.results.filter((r) => r.problem?.trim() || r.solution?.trim()).length, 0);
  const manual = (p) => ({ none: "Chưa tổng kết", reviewed: "Đã tổng kết", reconfirm: "Cần tổng kết lại" })[p.data.employee_review?.status ?? "none"];
  const lines = [
    `3K · CHỐT SỔ NGÀY ${date.split("-").reverse().join("/")}`,
    `Kế hoạch đầu ngày: Đúng hạn ${people.filter((p) => p.data.discipline?.obligated && p.data.discipline.plan_status === "on_time").length}/${people.filter((p) => p.data.discipline?.obligated).length} · Thiết lập muộn ${people.filter((p) => p.data.discipline?.plan_status === "late").length} · Chưa thiết lập ${people.filter((p) => p.data.discipline?.plan_status === "none").length} · Chưa có dấu mốc ${people.filter((p) => !p.data.discipline || p.data.discipline.plan_status === "unobserved").length}`,
    `${people.length} nhân viên · Đã cập nhật ${updated} · Chưa cập nhật ${people.length - updated}`,
    `Đã tổng kết thủ công: ${people.filter((p) => p.data.employee_review?.status === "reviewed").length} · Chưa tổng kết: ${people.filter((p) => !p.data.employee_review || p.data.employee_review.status === "none").length} · Cần tổng kết lại: ${people.filter((p) => p.data.employee_review?.status === "reconfirm").length}`,
    `Tổng kết muộn: ${people.filter((p) => p.data.employee_review?.status === "reviewed" && p.data.discipline?.summary_late).length}`,
    `${new Set(active.map((a) => a.goal_id)).size} KG / ${active.length} KF đang thực hiện · ${active.filter((a) => a.overdue).length} KF quá hạn · ${issues} vướng mắc`,
    ""
  ];
  if (people.length <= 12) {
    for (const p of people) {
      const highlights = (p.data.measurements ?? p.data.results).slice(0, 2).map((r) => r.kpi_snapshot && r.day_metric ? `${r.kpi_snapshot.name}: ${k3MetricDisplay(r.kpi_snapshot.measure, r.day_metric, null, r.kpi_snapshot.unit ?? "")}` : r.numerator != null ? `${r.numerator}/${r.denominator ?? "—"} ${labels[r.kpi_id] ?? "kết quả"}` : r.objects ? `${new Set(r.objects).size} đối tượng` : r.completed ? `${r.completed.length} mốc` : r.value == null ? "Chưa đủ dữ liệu" : `${Number(r.value).toLocaleString("vi-VN")} ${labels[r.kpi_id] ?? "kết quả"}`);
      lines.push(`${p.data.name}: ${manual(p)} · ${p.data.updated ? `${p.data.actions.filter((a) => a.updated).length}/${p.data.actions.length} KF đã cập nhật` : "Chưa cập nhật"}${highlights.length ? ` · ${highlights.join(" · ")}` : ""}`);
    }
  } else {
    const groups = /* @__PURE__ */ new Map();
    for (const p of people) {
      const key = p.data.department ?? "Chưa có phòng";
      groups.set(key, [...groups.get(key) ?? [], p]);
    }
    for (const [name, rows] of groups) lines.push(`${name}: ${rows.filter((p) => p.data.updated).length}/${rows.length} nhân viên đã cập nhật`);
  }
  const link = "Chi tiết: https://base.suviet.vn/biz/3k";
  const result = [];
  for (const line of lines) {
    if ([...result, line, link].join("\n").length > 1800) break;
    result.push(line);
  }
  return [...result, link].join("\n");
}
export {
  k3KpiPayload as a,
  k3DailyReport as b,
  k3MetricDisplay as k,
  newK3KpiDraft as n
};
