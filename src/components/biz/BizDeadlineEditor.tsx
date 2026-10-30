import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bizDeadlineQuery, useBizDeadlineSave } from '@/lib/biz/queries';
import { DEADLINE_KINDS, type BizDeadlineData } from '@/lib/biz/types';
import { deadlinePreview } from '@/lib/biz/deadline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
type Rule = BizDeadlineData[string];
export function BizDeadlineEditor() {
 const { data } = useQuery(bizDeadlineQuery); const save = useBizDeadlineSave(); const [form, setForm] = useState<BizDeadlineData | null>(null); const cur = form ?? data ?? {};
 const update = (key: string, field: keyof Rule, value: unknown) => setForm({ ...cur, [key]: { ...cur[key], [field]: value } });
 return <div className="space-y-5">
 {DEADLINE_KINDS.map(({ key, label }) => <section key={key} className="border-b pb-5 space-y-3"><h3 className="font-semibold">{label}</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><div className="col-span-2 md:col-span-1 space-y-1"><Label>Thời điểm</Label><Select value={cur[key]?.phase ?? 'during'} onValueChange={v => update(key, 'phase', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="before">Tháng trước khi bắt đầu kỳ</SelectItem><SelectItem value="during">Tháng đầu của kỳ</SelectItem><SelectItem value="after">Tháng sau khi kết thúc kỳ</SelectItem></SelectContent></Select></div>{(['day', 'hour', 'minute'] as const).map((field, i) => <div key={field} className="space-y-1"><Label>{['Ngày', 'Giờ', 'Phút'][i]}</Label><Input aria-label={`${label} ${field}`} type="number" min={field === 'day' ? 1 : 0} max={field === 'day' ? 31 : field === 'hour' ? 23 : 59} value={cur[key]?.[field] ?? (field === 'day' ? '' : field === 'hour' ? 17 : 0)} onChange={e => update(key, field, e.target.value === '' ? undefined : Number(e.target.value))} /></div>)}</div>
 <div className="text-xs text-muted-foreground">Giờ Việt Nam · Ngày vượt cuối tháng được tính vào ngày cuối tháng.</div>
 <ExceptionEditor key={`${key}-${JSON.stringify(cur[key]?.exceptions)}`} values={cur[key]?.exceptions ?? {}} onChange={value => update(key, 'exceptions', value)} />
 </section>)}
 <Button disabled={!form || save.isPending} onClick={async () => { try { await save.mutateAsync({ _data: cur }); setForm(null); toast.success('Đã lưu deadline.'); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } }}>Lưu cấu hình deadline</Button>
 </div>;
}
function ExceptionEditor({ values, onChange }: { values: Record<string,string>; onChange: (v: Record<string,string>) => void }) {
 const [period, setPeriod] = useState(''); const [date, setDate] = useState('');
 return <div className="space-y-2"><Label>Ngoại lệ theo kỳ</Label>{Object.entries(values).map(([p,d]) => <div key={p} className="flex flex-wrap items-center gap-2 text-sm"><span>{p} · {d.replace('T',' ')}</span><Button variant="ghost" size="sm" aria-label={`Bỏ ngoại lệ ${p}`} onClick={() => { const next = { ...values }; delete next[p]; onChange(next); }}>Bỏ</Button></div>)}<div className="flex flex-wrap gap-2"><Input aria-label="Kỳ ngoại lệ" placeholder="2027-01" className="w-32" value={period} onChange={e => setPeriod(e.target.value)} /><Input aria-label="Hạn ngoại lệ giờ Việt Nam" type="datetime-local" className="w-full sm:w-64" value={date} onChange={e => setDate(e.target.value)} /><Button variant="outline" size="sm" disabled={!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(period) || !date} onClick={() => onChange({ ...values, [period]: date })}>Thêm ngoại lệ</Button></div></div>;
}
function RulePreview({ kind, rule }: { kind: string; rule: BizDeadlineData[string] }) {
 const [year,setYear] = useState(new Date().getFullYear()); const [period,setPeriod] = useState(1); const max = kind.endsWith('month') ? 12 : kind.endsWith('quarter') ? 4 : 1;
 const deadline = deadlinePreview(kind,rule,year,period);
 return <div className="flex flex-wrap items-center gap-2 text-sm"><span>Hạn cụ thể:</span><Input aria-label={`Năm xem hạn ${kind}`} type="number" min={2000} max={2200} className="w-24 h-9" value={year} onChange={e=>setYear(Number(e.target.value))} />{max>1 && <Input aria-label={`Kỳ xem hạn ${kind}`} type="number" min={1} max={max} className="w-20 h-9" value={period} onChange={e=>setPeriod(Math.max(1,Math.min(max,Number(e.target.value))))} />}<strong>{deadline ?? 'Chưa áp dụng'}{deadline ? ' (giờ Việt Nam)' : ''}</strong></div>;
}