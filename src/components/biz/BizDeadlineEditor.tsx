import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { History, Save } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { bizDeadlineLogQuery, bizDeadlineQuery, useBizDeadlineSave } from '@/lib/biz/queries';
import type { BizDeadlineException, BizDeadlineRule, BizMilestoneRule } from '@/lib/biz/types';
import { fmtVN, milestoneOrderError, milestonesFor, upcomingPeriods } from '@/lib/biz/deadline';
import { periodLabel, type PeriodKind } from '@/lib/biz/documents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type MilestoneKey = 'open' | 'due' | 'late_close';
const DOC_GROUPS = [
  { key: 'plan', label: 'Kế hoạch' },
  { key: 'report', label: 'Báo cáo' },
  { key: 'goal', label: 'Mục tiêu KR' },
] as const;
const PERIOD_TABS: { key: PeriodKind; label: string }[] = [{ key: 'month', label: 'Tháng' }, { key: 'quarter', label: 'Quý' }, { key: 'year', label: 'Năm' }];
const MILESTONES: { key: MilestoneKey; label: string; desc: string; optional: boolean }[] = [
  { key: 'open', label: 'Mốc 1 · Mở nộp', desc: 'Từ thời điểm này nhân viên bắt đầu nộp được. Để trống nếu cho nộp bất kỳ lúc nào.', optional: true },
  { key: 'due', label: 'Mốc 2 · Hạn cuối nộp', desc: 'Sau thời điểm này không nộp trực tiếp được nữa — nhân viên phải xin nộp bù và chờ duyệt.', optional: false },
  { key: 'late_close', label: 'Mốc 3 · Đóng nộp bù', desc: 'Sau thời điểm này kỳ đóng hoàn toàn; yêu cầu nộp bù chưa xử lý sẽ hết hiệu lực. Để trống nếu không giới hạn.', optional: true },
];
const OFFSET_OPTIONS: Record<PeriodKind, { value: number; label: string }[]> = {
  month: [{ value: -1, label: 'Tháng trước kỳ' }, { value: 0, label: 'Tháng của kỳ' }, { value: 1, label: 'Tháng sau kỳ' }],
  quarter: [{ value: -1, label: 'Tháng cuối quý trước' }, { value: 0, label: 'Tháng 1 của quý' }, { value: 1, label: 'Tháng 2 của quý' }, { value: 2, label: 'Tháng 3 của quý' }, { value: 3, label: 'Tháng đầu quý sau' }],
  year: [{ value: -1, label: 'Tháng 12 năm trước' }, ...Array.from({ length: 12 }, (_, i) => ({ value: i, label: `Tháng ${i + 1} của năm` })), { value: 12, label: 'Tháng 1 năm sau' }],
};

/** Chuẩn hóa cấu hình cũ (một mốc) sang shape 3 mốc. */
function normalize(rule: BizDeadlineRule | undefined): BizDeadlineRule {
  if (!rule) return {};
  if ('open' in rule || 'due' in rule || 'late_close' in rule) return rule;
  const legacy = rule as unknown as { day?: number; phase?: 'before' | 'during' | 'after'; hour?: number; minute?: number; exceptions?: Record<string, string> };
  return {
    open: null,
    due: legacy.day ? { phase: legacy.phase, day: legacy.day, hour: legacy.hour, minute: legacy.minute } : null,
    late_close: null,
    exceptions: Object.fromEntries(Object.entries(legacy.exceptions ?? {}).map(([k, v]) => [k, { due: v }])),
  };
}

export function BizDeadlineEditor() {
  const { data } = useQuery(bizDeadlineQuery);
  const save = useBizDeadlineSave();
  const [form, setForm] = useState<Record<string, BizDeadlineRule> | null>(null);
  const [group, setGroup] = useState<(typeof DOC_GROUPS)[number]['key']>('plan');
  const [periodKind, setPeriodKind] = useState<PeriodKind>('month');
  const cur = useMemo(() => {
    const source = form ?? data ?? {};
    return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, normalize(v)]));
  }, [form, data]);
  const kinds = group === 'goal' ? ['goal_year'] : PERIOD_TABS.map((t) => `${group}_${t.key}`);
  const kind = group === 'goal' ? 'goal_year' : `${group}_${periodKind}`;
  const rule = cur[kind] ?? {};
  const update = (next: BizDeadlineRule) => setForm({ ...cur, [kind]: next });
  const milestones = group === 'goal' ? MILESTONES.filter((m) => m.key === 'due') : MILESTONES;
  const submit = async () => {
    for (const k of kinds) {
      const error = milestoneOrderError(k, cur[k] ?? {});
      if (error) { toast.error(error); return; }
    }
    try {
      await save.mutateAsync({ _data: cur });
      setForm(null);
      toast.success('Đã lưu cấu hình lịch nộp.');
    } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); }
  };
  return <div className="space-y-5">
    <div className="flex flex-wrap gap-3 items-center">
      <Tabs value={group} onValueChange={(v) => setGroup(v as typeof group)}><TabsList className="h-auto flex-wrap">{DOC_GROUPS.map((g) => <TabsTrigger key={g.key} value={g.key}>{g.label}</TabsTrigger>)}</TabsList></Tabs>
      {group !== 'goal' && <Tabs value={periodKind} onValueChange={(v) => setPeriodKind(v as PeriodKind)}><TabsList>{PERIOD_TABS.map((t) => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}</TabsList></Tabs>}
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      {milestones.map((m) => <MilestoneCard key={m.key} meta={m} kind={kind} periodKind={group === 'goal' ? 'year' : periodKind} rule={rule[m.key]} onChange={(value) => update({ ...rule, [m.key]: value })} />)}
    </div>
    <SchedulePreview kind={kind} rule={rule} />
    <ExceptionEditor values={rule.exceptions ?? {}} onChange={(exceptions) => update({ ...rule, exceptions })} />
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled={!form || save.isPending} onClick={submit}><Save className="h-4 w-4 mr-2" />Lưu cấu hình lịch nộp</Button>
      <p className="text-xs text-muted-foreground">Giờ Việt Nam · Ngày vượt cuối tháng được tính vào ngày cuối tháng · Hồ sơ đã nộp giữ nguyên hạn đã xác nhận.</p>
    </div>
    <ConfigHistory />
  </div>;
}

function MilestoneCard({ meta, kind, periodKind, rule, onChange }: { meta: (typeof MILESTONES)[number]; kind: string; periodKind: PeriodKind; rule: BizMilestoneRule | null | undefined; onChange: (v: BizMilestoneRule | null) => void }) {
  const enabled = !meta.optional || rule != null;
  const value = rule ?? {};
  const set = (field: keyof BizMilestoneRule, v: unknown) => onChange({ ...value, [field]: v });
  return <section className="border rounded-lg bg-card p-4 space-y-3">
    <div className="flex items-start justify-between gap-2">
      <div><h3 className="font-semibold">{meta.label}</h3><p className="text-xs text-muted-foreground mt-1">{meta.desc}</p></div>
      {meta.optional && <Button variant={enabled ? 'secondary' : 'outline'} size="sm" onClick={() => onChange(enabled ? null : { offset: 0, day: 1, hour: 17, minute: 0 })}>{enabled ? 'Đang áp dụng' : 'Không áp dụng'}</Button>}
    </div>
    {enabled && <div className="space-y-3">
      <div className="space-y-1">
        <Label>Thời điểm trong kỳ</Label>
        <Select value={String(value.offset ?? (value.phase === 'before' ? -1 : value.phase === 'after' ? (periodKind === 'month' ? 1 : periodKind === 'quarter' ? 3 : 12) : 0))} onValueChange={(v) => set('offset', Number(v))}>
          <SelectTrigger aria-label={`${meta.label} thời điểm`}><SelectValue /></SelectTrigger>
          <SelectContent>{OFFSET_OPTIONS[periodKind].map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['day', 'hour', 'minute'] as const).map((field, i) => <div key={field} className="space-y-1">
          <Label>{['Ngày', 'Giờ', 'Phút'][i]}</Label>
          <Input aria-label={`${meta.label} ${field}`} type="number" min={field === 'day' ? 1 : 0} max={field === 'day' ? 31 : field === 'hour' ? 23 : 59} value={value[field] ?? (field === 'day' ? '' : field === 'hour' ? 17 : 0)} onChange={(e) => set(field, e.target.value === '' ? undefined : Number(e.target.value))} />
        </div>)}
      </div>
    </div>}
  </section>;
}

function SchedulePreview({ kind, rule }: { kind: string; rule: BizDeadlineRule }) {
  const periods = upcomingPeriods(kind);
  const label = kind.startsWith('plan') ? 'Kế hoạch' : kind.startsWith('report') ? 'Báo cáo' : 'Mục tiêu KR';
  const pk: PeriodKind = kind.endsWith('month') ? 'month' : kind.endsWith('quarter') ? 'quarter' : 'year';
  return <section className="border rounded-lg bg-muted/30 p-4 space-y-3">
    <h3 className="font-semibold">Xem trước lịch nộp</h3>
    <div className="grid gap-3 md:grid-cols-3">
      {periods.map(({ year, period }) => {
        const m = milestonesFor(kind, rule, year, period);
        const special = !!rule.exceptions?.[`${year}-${String(period).padStart(2, '0')}`];
        return <div key={`${year}-${period}`} className="border rounded-lg bg-card p-3 space-y-1 text-sm">
          <p className="font-medium">{label} {periodLabel(pk, year, period)} {special && <Badge variant="outline" className="text-warning border-warning/40 ml-1">Lịch đặc biệt</Badge>}</p>
          <p>Mở nộp: <strong>{fmtVN(m.open)}</strong></p>
          <p>Hạn cuối: <strong>{fmtVN(m.due)}</strong></p>
          <p>Đóng nộp bù: <strong>{fmtVN(m.late_close)}</strong></p>
        </div>;
      })}
    </div>
  </section>;
}

function ExceptionEditor({ values, onChange }: { values: Record<string, BizDeadlineException | string>; onChange: (v: Record<string, BizDeadlineException | string>) => void }) {
  const [period, setPeriod] = useState('');
  const [open, setOpen] = useState('');
  const [due, setDue] = useState('');
  const [close, setClose] = useState('');
  const valid = /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(period) && (open || due || close);
  const add = () => {
    const entry: BizDeadlineException = {};
    if (open) entry.open = open;
    if (due) entry.due = due;
    if (close) entry.late_close = close;
    onChange({ ...values, [period]: entry });
    setPeriod(''); setOpen(''); setDue(''); setClose('');
  };
  return <details className="border rounded-lg p-4 space-y-3">
    <summary className="font-semibold cursor-pointer">Ngoại lệ theo kỳ <span className="text-xs font-normal text-muted-foreground">(ví dụ: tháng nghỉ Tết, kỳ được gia hạn riêng)</span></summary>
    <p className="text-xs text-muted-foreground">Ngoại lệ chỉ áp dụng cho kỳ được chọn, không đổi quy tắc mặc định của các kỳ khác. Sửa kỳ đang mở hoặc đã có hồ sơ sẽ được ghi nhật ký; hạn đúng của hồ sơ đã nộp không tự thay đổi.</p>
    {Object.entries(values).map(([p, v]) => {
      const ex: BizDeadlineException = typeof v === 'string' ? { due: v } : v;
      return <div key={p} className="flex flex-wrap items-center gap-2 text-sm border-t pt-2">
        <Badge variant="outline" className="text-warning border-warning/40">Lịch đặc biệt</Badge><strong>{p}</strong>
        <span className="text-muted-foreground">Mở: {fmtVN(ex.open)} · Hạn cuối: {fmtVN(ex.due)} · Đóng bù: {fmtVN(ex.late_close)}</span>
        <Button variant="ghost" size="sm" aria-label={`Bỏ ngoại lệ ${p}`} onClick={() => { const next = { ...values }; delete next[p]; onChange(next); }}>Bỏ</Button>
      </div>;
    })}
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      <Input aria-label="Kỳ ngoại lệ" placeholder="2027-01" value={period} onChange={(e) => setPeriod(e.target.value)} />
      <div className="space-y-1"><Label className="text-xs">Mở nộp</Label><Input aria-label="Mở nộp ngoại lệ" type="datetime-local" value={open} onChange={(e) => setOpen(e.target.value)} /></div>
      <div className="space-y-1"><Label className="text-xs">Hạn cuối</Label><Input aria-label="Hạn cuối ngoại lệ" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} /></div>
      <div className="space-y-1"><Label className="text-xs">Đóng nộp bù</Label><Input aria-label="Đóng nộp bù ngoại lệ" type="datetime-local" value={close} onChange={(e) => setClose(e.target.value)} /></div>
      <div className="flex items-end"><Button variant="outline" size="sm" disabled={!valid} onClick={add}>Thêm ngoại lệ</Button></div>
    </div>
  </details>;
}

function ConfigHistory() {
  const { data } = useQuery(bizDeadlineLogQuery);
  const users = useAuth((s) => s.users);
  if (!data?.length) return null;
  const nameOf = (id: string | null) => users.find((u) => u.id === id)?.fullName ?? 'Hệ thống';
  return <details className="border rounded-lg p-4 space-y-3">
    <summary className="font-semibold cursor-pointer flex items-center gap-2"><History className="h-4 w-4" />Lịch sử thay đổi cấu hình</summary>
    {data.map((row) => {
      const changed = Object.keys(row.new_data).filter((k) => JSON.stringify(row.old_data?.[k]) !== JSON.stringify(row.new_data[k]));
      return <div key={row.id} className="text-sm border-t pt-2">
        <p>{new Date(row.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · {nameOf(row.actor_id)}</p>
        <p className="text-xs text-muted-foreground">Thay đổi: {changed.length ? changed.join(', ') : 'Không đổi nội dung'}</p>
      </div>;
    })}
  </details>;
}
