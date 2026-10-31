import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarClock, ExternalLink, FileCheck2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { myWorkQuery, useDocumentOpen } from '@/lib/biz/documentQueries';
import { bizLateRequestsQuery, bizMilestonesQuery } from '@/lib/biz/queries';
import { phaseFromIso, type DeadlinePhase } from '@/lib/biz/deadline';
import { deadlineStatus, docStatusLabel, myWorkRank, periodLabel, TIME_STATUS, VIEW_STATUS, viewTone, type DocKind, type DocRow, type MyWorkRow, type PeriodKind, type ViewStatus } from '@/lib/biz/documents';
import {documentError,hasSubmittedDocument} from '@/lib/biz/planSubmission';
import { LateRequestDialog, LateRequestPanel } from './BizLateRequest';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dateText = (v: string | null) => (v ? new Date(v).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Chưa quy định');

export function useOpenDocument() { const open = useDocumentOpen(); return async (versionId: string) => { const win = window.open('', '_blank'); try { const url = await open.mutateAsync(versionId); if (win) { win.location.href = url; } else { window.location.href = url; } } catch (e) { win?.close(); toast.error(documentError(e)); } }; }

export function StatusBadges({ row, kind, showView = true, phase }: { row: DocRow; kind: DocKind; showView?: boolean; phase?: DeadlinePhase | null }) { const time = deadlineStatus(row.deadline, row.document?.first_submitted_at ?? null, row.server_now); const version = row.document?.versions.at(-1); return <div className="flex flex-wrap gap-2"><Badge variant="outline" className={['late', 'overdue'].includes(time) ? 'text-destructive border-destructive/40' : time === 'ontime' ? 'text-success border-success/40' : time === 'soon' ? 'text-warning border-warning/40' : ''}>{kind==='plan'&&!row.document?.first_submitted_at?(phase?PHASE_BADGE[phase].label:time==='overdue'?'Quá hạn trực tiếp':'Đang tải lịch nộp…'):TIME_STATUS[time]}</Badge>{row.document?.late_submitted && <Badge variant="outline" className="text-warning border-warning/40">Nộp muộn</Badge>}<Badge variant="secondary">{version ? docStatusLabel(kind, version.status) : 'Chưa nộp'}</Badge>{showView && hasSubmittedDocument(row) && <Badge variant="outline" className={viewTone(row.my_view)}>{VIEW_STATUS[row.my_view as ViewStatus]}</Badge>}</div>; }

const PHASE_BADGE: Record<DeadlinePhase, { label: string; className: string }> = {
  none: { label: 'Chưa cấu hình lịch nộp', className: '' },
  not_open: { label: 'Chưa mở nộp', className: '' },
  open: { label: 'Đang mở nộp', className: 'text-success border-success/40' },
  overdue: { label: 'Quá hạn trực tiếp – Đang trong thời gian xin nộp bù', className: 'text-destructive border-destructive/40' },
  closed: { label: 'Đã đóng kỳ', className: 'text-muted-foreground' },
};

/** Khu vực "Công việc của tôi": tự hiện các kỳ đang mở nộp/quá hạn/sắp mở/đang sửa — không phụ thuộc bộ lọc kỳ. */
export function MyWorkSection({ kind, onOpen }: { kind: DocKind; onOpen: (periodKind: PeriodKind, year: number, period: number, openDialog: boolean) => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const query = useQuery({ ...myWorkQuery(uid, kind), enabled: !!uid });
  const [askLate, setAskLate] = useState<MyWorkRow | null>(null);
  const rows = (query.data?.rows ?? []).slice().sort((a, b) => myWorkRank(a) - myWorkRank(b) || Date.parse(a.due_at ?? '') - Date.parse(b.due_at ?? ''));
  if (query.isPending || query.error || !rows.length) return null;
  const label = kind === 'plan' ? 'Kế hoạch' : 'Báo cáo';
  return <section className="space-y-3">
    <h2 className="text-lg font-semibold">Công việc của tôi</h2>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const phase = PHASE_BADGE[r.phase];
        const submitted = !!r.first_submitted_at;
        let action: React.ReactNode = null;
        if (r.version_status === 'changes') action = <Button size="sm" onClick={() => onOpen(r.period_kind, r.year, r.period, true)}>Nộp lại bản chỉnh sửa</Button>;
        else if (r.phase === 'open' && !submitted) action = <Button size="sm" onClick={() => onOpen(r.period_kind, r.year, r.period, true)}>Nộp {label.toLowerCase()}</Button>;
        else if (r.phase === 'overdue' && !submitted) {
          if (r.late_status === 'approved') action = <Button size="sm" onClick={() => onOpen(r.period_kind, r.year, r.period, true)}>Nộp bù</Button>;
          else if (r.late_status === 'pending') action = <Button size="sm" disabled>Đang chờ duyệt nộp bù</Button>;
          else action = <Button size="sm" variant="outline" onClick={() => setAskLate(r)}><CalendarClock className="h-4 w-4 mr-2" />Xin nộp bù</Button>;
        } else if (r.phase === 'not_open') action = <Button size="sm" disabled>Chưa mở nộp</Button>;
        else if (submitted) action = <Button size="sm" variant="outline" onClick={() => onOpen(r.period_kind, r.year, r.period, true)}><FileCheck2 className="h-4 w-4 mr-2" />Xem hồ sơ</Button>;
        return <div key={`${r.period_kind}-${r.year}-${r.period}`} className={`border rounded-lg bg-card p-4 space-y-2 ${r.version_status === 'changes' || r.phase === 'overdue' ? 'border-warning/60' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{label} {periodLabel(r.period_kind, r.year, r.period)}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={phase.className}>{phase.label}</Badge>
              {r.late_submitted && <Badge variant="outline" className="text-warning border-warning/40">Nộp muộn</Badge>}
              <Badge variant="secondary">{docStatusLabel(kind, r.version_status)}</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Mở nộp: {dateText(r.open_at)} · Hạn cuối: {dateText(r.due_at)} · Đóng nộp bù: {dateText(r.late_close_at)} (giờ Việt Nam)</p>
          {r.phase === 'overdue' && !submitted && r.late_status === 'approved' && <p className="text-xs text-success">Yêu cầu nộp bù đã được duyệt — hãy nộp trước {dateText(r.late_close_at)}.</p>}
          {r.phase === 'overdue' && !submitted && r.late_status === 'rejected' && <p className="text-xs text-destructive">Yêu cầu nộp bù bị từ chối — có thể gửi lại yêu cầu mới.</p>}
          {r.last_submitted_at && <p className="text-xs text-muted-foreground">Nộp gần nhất: {dateText(r.last_submitted_at)}</p>}
          <div className="flex flex-wrap gap-2">{action}<Button size="sm" variant="ghost" onClick={() => onOpen(r.period_kind, r.year, r.period, false)}>Tra cứu kỳ này</Button></div>
        </div>;
      })}
    </div>
    {askLate && <LateRequestDialog kind={kind} periodKind={askLate.period_kind} year={askLate.year} period={askLate.period} due={askLate.due_at} label={label} onClose={() => setAskLate(null)} />}
  </section>;
}

/** Card hồ sơ của chính mình cho kỳ đang chọn — nút thao tác theo đúng pha nộp do server quyết định. */
export function MyDocCard({ row, kind, periodKind, year, period, onOpen }: { row: DocRow; kind: DocKind; periodKind: PeriodKind; year: number; period: number; onOpen: () => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const version = row.document?.versions.at(-1);
  const openDoc = useOpenDocument();
  const milestones = useQuery(bizMilestonesQuery(`${kind}_${periodKind}`, year, period));
  const late = useQuery(bizLateRequestsQuery(kind, periodKind, year, period));
  const submitted = !!row.document?.first_submitted_at;
  const phase: DeadlinePhase | null = milestones.data ? phaseFromIso(milestones.data, late.data?.server_now ?? row.server_now) : null;
  const mine = late.data?.requests.find((r) => r.user_id === uid);
  const label = kind === 'plan' ? 'Kế hoạch' : 'Báo cáo';

  let primary: React.ReactNode = null;
  if (version?.status === 'changes') primary = <Button size="sm" onClick={onOpen}>Nộp lại bản chỉnh sửa</Button>;
  else if (!submitted) {
    if (phase === 'not_open') primary = <Button size="sm" disabled>Chưa mở nộp</Button>;
    else if (phase === 'open' || phase === 'none' || phase === null) primary = <Button size="sm" onClick={onOpen}>Nộp {label.toLowerCase()}</Button>;
    else if (phase === 'overdue') {
      if (mine?.status === 'approved') primary = <Button size="sm" onClick={onOpen}>Nộp bù</Button>;
      else if (mine?.status === 'pending') primary = <Button size="sm" disabled>Đang chờ duyệt nộp bù</Button>;
    } else if (phase === 'closed') primary = version ? <Button size="sm" variant="outline" onClick={onOpen}>Xem hồ sơ</Button> : <Badge variant="outline" className="text-muted-foreground">Đóng kỳ – Không nộp</Badge>;
  } else primary = <Button size="sm" onClick={onOpen}>Xem / cập nhật hồ sơ</Button>;

  return <section className="space-y-3"><h2 className="text-lg font-semibold">{label} của tôi</h2>
    <div className={`border rounded-lg bg-card p-4 space-y-3 max-w-xl ${version?.status === 'changes' || phase === 'overdue' ? 'border-warning/60' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{label} {periodLabel(periodKind, year, period)}</h3><StatusBadges row={row} kind={kind} phase={phase} /></div>
      <p className="text-sm text-muted-foreground">Hạn nộp: {dateText(row.deadline)} (giờ Việt Nam)</p>
      {milestones.data && <p className="text-xs text-muted-foreground">Mở nộp: {dateText(milestones.data.open)} · Đóng nộp bù: {dateText(milestones.data.late_close)}</p>}
      {row.document?.last_submitted_at && <p className="text-xs text-muted-foreground">Nộp gần nhất: {dateText(row.document.last_submitted_at)}</p>}
      <LateRequestPanel kind={kind} periodKind={periodKind} year={year} period={period} submitted={submitted} />
      <div className="flex flex-wrap gap-2">{primary}{version?.submitted_at && version.url && <Button size="sm" variant="outline" onClick={() => openDoc(version.id)}><ExternalLink className="h-4 w-4 mr-2" />Mở tài liệu</Button>}</div>
    </div></section>;
}
