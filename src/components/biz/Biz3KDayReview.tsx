import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { k3Error } from '@/lib/biz/k3';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoalStatusBadge } from './Biz3KGoals';
import type { K3EntityMetric } from '@/lib/biz/k3Goals';
import { Biz3KKpiResult } from './Biz3KKpiResult';

export interface K3DayReviewData {
  date: string; source_version: string; manual_status: 'none' | 'reviewed' | 'reconfirm';
  system_status: 'open' | 'auto_closed' | 'legacy_closed' | 'adjusted';
  confirmed_at: string | null; closed_at: string | null; auto_close_time: string;
  missing: number; result_count: number; action_count: number; goal_count: number;
  actions: { id: string; goal_id: string; name: string; goal_name: string; assignee_name: string; due_date: string | null; metric?: K3EntityMetric; updated: boolean; kpis: { id: string; name: string }[] }[];
  goal_kpis: { id: string; name: string }[];
  results: { id: string; action_id: string; problem?: string; cause?: string; solution?: string }[];
  history: { id: string; revision: number; confirmed_at: string; missing: number }[];
  legacy_confirmation: boolean;
  summary_late?: boolean;
}
export const manualReviewLabels = { none: 'Chưa tổng kết', reviewed: 'Đã tổng kết', reconfirm: 'Cần tổng kết lại' };
export const systemCloseLabels = { open: 'Chưa chốt hệ thống', auto_closed: 'Đã chốt tự động', legacy_closed: 'Chốt theo cơ chế cũ', adjusted: 'Có điều chỉnh sau chốt' };
export const employeeReviewQuery = (uid: string, date: string, user?: string) => ({ queryKey: ['k3_employee_review', uid, date, user], queryFn: async () => { const { data, error } = await supabase.rpc('k3_employee_review_read', { _date: date, _user: user }); if (error) throw error; return data as unknown as K3DayReviewData; } });

export function Biz3KDayReview({ date, today, user, onClose }: { date: string; today: string; user?: string; onClose: () => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const query = useQuery(employeeReviewQuery(uid, date, user));
  const qc = useQueryClient();
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [requestKey] = useState(() => crypto.randomUUID());
  const data = query.data;
  const groups = [...new Set(data?.actions.map((a) => a.goal_id) ?? [])].sort((a,b) => Number(data?.actions.some(x => x.goal_id === b && !x.updated)) - Number(data?.actions.some(x => x.goal_id === a && !x.updated)));
  return <Dialog open onOpenChange={(v) => !v && onClose()}><DialogContent className="k3-mobile-dialog max-h-[90dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{date === today ? 'Tổng kết hôm nay' : 'Tổng kết ngày'} · {date}</DialogTitle></DialogHeader>
    {query.isLoading && <p>Đang tải tổng kết…</p>}
    {query.error && <div><p className="text-destructive">{k3Error(query.error)}</p><Button variant="outline" onClick={() => query.refetch()}>Thử lại</Button></div>}
    {data && <>
      <div className="flex flex-wrap gap-2"><Badge variant={data.manual_status === 'reconfirm' ? 'destructive' : 'secondary'}>{data.manual_status === 'reviewed' && data.summary_late ? 'Đã tổng kết muộn' : manualReviewLabels[data.manual_status]}</Badge><Badge variant="outline">{systemCloseLabels[data.system_status]}</Badge></div>
      <div className="grid grid-cols-3 gap-2 border-y border-border py-3">{[['Công việc', data.action_count], ['Đã cập nhật', data.action_count - data.missing], ['Chưa cập nhật', data.missing]].map(([label, count]) => <div key={label} className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{count}</p></div>)}</div><p className="md:hidden text-sm">{data.actions.filter(a => a.metric?.status === 'done').length} công việc hoàn thành</p>
      <p className="text-xs text-muted-foreground">Chốt tự động dự kiến {data.auto_close_time?.slice(0, 5)} · Giờ Việt Nam{data.confirmed_at ? ` · Xác nhận gần nhất ${new Date(data.confirmed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : ''}</p>
      {groups.map((goalId) => <section key={goalId} className="space-y-3 border-b border-border pb-3"><h3 className="font-semibold max-md:hidden">{data.actions.find((a) => a.goal_id === goalId)?.goal_name}</h3>{data.actions.filter((a) => a.goal_id === goalId).sort((a,b) => Number(a.updated) - Number(b.updated)).map((a) => <div key={a.id} className="space-y-2 border-l-2 border-border pl-3"><div className="grid grid-cols-[minmax(0,1fr)_auto] md:flex md:justify-between gap-2"><div className="min-w-0"><p className="break-words font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.assignee_name ?? '—'} · Hạn {a.due_date ?? '—'}</p></div><div className="flex flex-col md:flex-row gap-1 min-w-0"><Badge variant={a.updated ? 'secondary' : 'outline'}>{a.updated ? 'Có cập nhật KPI' : 'Chưa cập nhật'}</Badge>{a.metric && <GoalStatusBadge status={a.metric.status} metric={a.metric} />}</div></div><details className="k3-review-item" open={!a.updated}><summary className="text-sm text-primary">Xem / cập nhật {a.kpis.length} chỉ số</summary><div>{a.kpis.map((k) => <Biz3KKpiResult key={k.id} kpiId={k.id} date={date} showStatus={false} readOnly={!!user} />)}{data.results.filter((r) => r.action_id === a.id && (r.problem || r.cause || r.solution)).map((r) => <div key={r.id} className="text-sm">{r.problem && <p>Vấn đề: {r.problem}</p>}{r.cause && <p>Nguyên nhân: {r.cause}</p>}{r.solution && <p>Giải pháp: {r.solution}</p>}</div>)}</div></details></div>)}</section>)}
      {data.goal_kpis.map((k) => <Biz3KKpiResult key={k.id} kpiId={k.id} date={date} readOnly={!!user} />)}
      {!data.action_count && !data.result_count && <p className="text-sm text-muted-foreground">Không có công việc theo lịch hoặc kết quả liên quan ngày này.</p>}
      {data.missing > 0 && <div className="space-y-2 border-t border-border pt-3"><p className="text-sm text-destructive">Còn {data.missing} KF chưa cập nhật; chưa có số liệu không được tính là 0.</p>{!user && <label className="flex items-center gap-2 text-sm"><Checkbox checked={ack} onCheckedChange={(v) => setAck(v === true)} />Tôi đã xem cảnh báo còn thiếu kết quả</label>}</div>}
      <details><summary className="cursor-pointer text-sm font-medium">Lịch sử xác nhận ({data.history.length})</summary>{data.legacy_confirmation && <p className="text-xs text-muted-foreground">Có bản chốt theo cơ chế cũ; không coi là xác nhận theo quy trình mới.</p>}{data.history.map((h) => <p key={h.id} className="py-1 text-xs">Phiên bản {h.revision} · {new Date(h.confirmed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · {h.missing} KF chưa cập nhật</p>)}</details>
    </>}
    <DialogFooter><Button variant="outline" onClick={onClose}>Đóng</Button>{!user && date <= today && data && <Button disabled={busy || (data.missing > 0 && !ack)} onClick={async () => { setBusy(true); try { const { error } = await supabase.rpc('k3_employee_review_confirm', { _date: date, _version: data.source_version, _request_key: requestKey, _ack_missing: ack }); if (error) throw error; await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('k3_') }); toast.success('Đã xác nhận tổng kết; chốt hệ thống vẫn chạy riêng.'); onClose(); } catch (e) { toast.error(k3Error(e)); } finally { setBusy(false); } }}>{busy ? 'Đang xác nhận…' : 'Xác nhận đã tổng kết'}</Button>}</DialogFooter>
  </DialogContent></Dialog>;
}