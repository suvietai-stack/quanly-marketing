export interface K3ReportPerson {
  user_id: string;
  department_id: string | null;
  data: {
    name: string; department: string | null; updated: boolean;
    actions: { id: string; goal_id: string; updated: boolean; overdue: boolean; metric: { status: string } }[];
    results: { value?: number | null; kpi_id: string; problem?: string | null; solution?: string | null }[];
  };
}
export function k3DailyReport(date: string, people: K3ReportPerson[], labels: Record<string, string> = {}) {
  const actions = new Map(people.flatMap((p) => p.data.actions.map((a) => [a.id, a] as const)));
  const active = [...actions.values()].filter((a) => a.metric.status !== 'done');
  const updated = people.filter((p) => p.data.updated).length;
  const issues = people.reduce((n, p) => n + p.data.results.filter((r) => r.problem?.trim() || r.solution?.trim()).length, 0);
  const lines = [`3K · CHỐT SỔ NGÀY ${date.split('-').reverse().join('/')}`,
    `${people.length} nhân viên · Đã cập nhật ${updated} · Chưa cập nhật ${people.length - updated}`,
    `${new Set(active.map((a) => a.goal_id)).size} KG / ${active.length} KF đang thực hiện · ${active.filter((a) => a.overdue).length} KF quá hạn · ${issues} vướng mắc`, ''];
  if (people.length <= 12) {
    for (const p of people) {
      const highlights = p.data.results.filter((r) => r.value != null && r.value > 0).slice(0, 2).map((r) => `+${Number(r.value).toLocaleString('vi-VN')} ${labels[r.kpi_id] ?? 'kết quả'}`);
      lines.push(`${p.data.name}: ${p.data.updated ? `${p.data.actions.filter((a) => a.updated).length}/${p.data.actions.length} KF đã cập nhật` : 'Chưa cập nhật'}${highlights.length ? ` · ${highlights.join(' · ')}` : ''}`);
    }
  } else {
    const groups = new Map<string, K3ReportPerson[]>();
    for (const p of people) { const key = p.data.department ?? 'Chưa có phòng'; groups.set(key, [...(groups.get(key) ?? []), p]); }
    for (const [name, rows] of groups) lines.push(`${name}: ${rows.filter((p) => p.data.updated).length}/${rows.length} nhân viên đã cập nhật`);
  }
  return lines.join('\n').slice(0, 1800);
}