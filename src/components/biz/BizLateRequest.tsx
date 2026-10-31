import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarClock, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { bizLateRequestsQuery, bizMilestonesQuery, useBizLateRequestCreate } from '@/lib/biz/queries';
import { LATE_STATUS_LABELS } from '@/lib/biz/types';
import { phaseFromIso } from '@/lib/biz/deadline';
import { periodLabel, type DocKind, type PeriodKind } from '@/lib/biz/documents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const dateText = (v: string | null) => (v ? new Date(v).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Không áp dụng');

/** Khu vực trạng thái lịch nộp + xin nộp bù cho hồ sơ của chính mình (Kế hoạch/Báo cáo). */
export function LateRequestPanel({ kind, periodKind, year, period, submitted }: { kind: DocKind; periodKind: PeriodKind; year: number; period: number; submitted: boolean }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const milestones = useQuery(bizMilestonesQuery(`${kind}_${periodKind}`, year, period));
  const late = useQuery(bizLateRequestsQuery(kind, periodKind, year, period));
  const [asking, setAsking] = useState(false);
  if (submitted || !milestones.data || !late.data) return null;
  const phase = phaseFromIso(milestones.data, late.data.server_now);
  const mine = late.data.requests.find((r) => r.user_id === uid);
  if (phase === 'none' || phase === 'open') return null;
  const label = kind === 'plan' ? 'Kế hoạch' : 'Báo cáo';
  return <div className="rounded-lg border p-3 space-y-2 text-sm bg-muted/30">
    {phase === 'not_open' && <p>Chưa mở nộp · Mở từ <strong>{dateText(milestones.data.open)}</strong> (giờ Việt Nam).</p>}
    {phase === 'closed' && <p className="text-destructive">Kỳ nộp đã đóng. Liên hệ quản trị nếu cần xử lý đặc biệt.</p>}
    {phase === 'overdue' && <>
      {!mine && <div className="flex flex-wrap items-center gap-2"><p className="text-destructive">Đã quá hạn nộp trực tiếp ({dateText(milestones.data.due)}).</p><Button size="sm" variant="outline" onClick={() => setAsking(true)}><CalendarClock className="h-4 w-4 mr-2" />Xin nộp bù</Button></div>}
      {mine?.status === 'pending' && <p className="text-warning">Đang chờ duyệt yêu cầu nộp bù · Gửi {dateText(mine.created_at)}.</p>}
      {mine?.status === 'approved' && <p className="text-success">Yêu cầu nộp bù đã được duyệt{mine.decider_name ? ` bởi ${mine.decider_name}` : ''} · Hãy nộp trước <strong>{dateText(milestones.data.late_close)}</strong>. Hồ sơ sẽ được ghi nhận Nộp muộn.</p>}
      {mine?.status === 'rejected' && <div className="space-y-2"><p className="text-destructive">Yêu cầu nộp bù bị từ chối{mine.decision_comment ? `: ${mine.decision_comment}` : ''}</p><Button size="sm" variant="outline" onClick={() => setAsking(true)}><CalendarClock className="h-4 w-4 mr-2" />Gửi lại yêu cầu</Button></div>}
    </>}
    {asking && <LateRequestDialog kind={kind} periodKind={periodKind} year={year} period={period} due={milestones.data.due} label={label} onClose={() => setAsking(false)} />}
  </div>;
}

function LateRequestDialog({ kind, periodKind, year, period, due, label, onClose }: { kind: DocKind; periodKind: PeriodKind; year: number; period: number; due: string | null; label: string; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const create = useBizLateRequestCreate();
  const send = async () => {
    try {
      await create.mutateAsync({ _kind: kind, _period_kind: periodKind, _year: year, _period: period, _reason: reason });
      toast.success('Đã gửi yêu cầu nộp bù. Vui lòng chờ lãnh đạo phê duyệt.');
      onClose();
    } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); }
  };
  return <Dialog open onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Xin nộp bù · {label} {periodLabel(periodKind, year, period)}</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">Deadline đã qua: {dateText(due)}. Yêu cầu được duyệt chỉ mở quyền nộp cho đúng kỳ này và hồ sơ sẽ được ghi nhận Nộp muộn.</p>
      <div className="space-y-1"><Label>Lý do xin nộp bù (bắt buộc)</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nêu rõ lý do quá hạn…" /></div>
      <Button disabled={!reason.trim() || create.isPending} onClick={send}><Send className="h-4 w-4 mr-2" />Gửi yêu cầu</Button>
    </DialogContent>
  </Dialog>;
}

/** Badge trạng thái yêu cầu nộp bù gọn cho danh sách quản lý. */
export function LateStatusBadge({ status }: { status: keyof typeof LATE_STATUS_LABELS }) {
  return <Badge variant="outline" className={status === 'approved' ? 'text-success border-success/40' : status === 'pending' ? 'text-warning border-warning/40' : status === 'rejected' || status === 'expired' ? 'text-destructive border-destructive/40' : ''}>{LATE_STATUS_LABELS[status]}</Badge>;
}
