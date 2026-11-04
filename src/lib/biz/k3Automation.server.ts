import { postGroup } from '@/lib/finance/gmf.server';
import { k3DailyReport, type K3ReportPerson } from './k3DailyReport';

export async function processK3Reports() {
  const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
  const { error: queuedError } = await db.rpc('k3_zalo_report_queue');
  if (queuedError) throw new Error('Không tạo được báo cáo 3K.');
  const { data: reports, error } = await db.rpc('k3_zalo_report_claim');
  if (error) throw new Error('Không nhận được lượt gửi báo cáo 3K.');
  let processed = 0;
  for (const report of reports ?? []) {
    if (!report.lease) continue;
    const people = report.snapshot as unknown as K3ReportPerson[];
    const ids = [...new Set(people.flatMap((p) => p.data.results.map((r) => r.kpi_id)))];
    const labels: Record<string, string> = {};
    if (ids.length) {
      const { data } = await db.from('k3_kpis').select('id,name,unit').in('id', ids);
      for (const k of data ?? []) labels[k.id] = k.unit ?? k.name;
    }
    const result = await postGroup(report.group_id, k3DailyReport(report.work_date, people, labels));
    const { data: finalized, error: finished } = await db.rpc('k3_zalo_report_finish', { _id: report.id, _lease: report.lease, _status: result.ok ? 'sent' : result.ambiguous ? 'unknown' : 'failed', _error: result.ok ? undefined : `${result.code}: ${result.message}` });
    if (finished || !finalized) throw new Error('Chưa xác nhận được kết quả gửi; cần đối soát.');
    processed++;
  }
  return { processed };
}