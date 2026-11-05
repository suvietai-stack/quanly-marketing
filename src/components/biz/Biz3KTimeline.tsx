import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { K3CreationKf } from '@/lib/biz/k3Creation';

export function Biz3KTimeline({ id, start, end, startTime, endTime, onChange }: {
  id: string; start: string; end: string; startTime: string; endTime: string;
  onChange: (field: 'start' | 'end' | 'startTime' | 'endTime', value: string) => void;
}) {
  return <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
    <div className="min-w-0 space-y-1"><Label htmlFor={`${id}-start`}>Ngày bắt đầu *</Label><Input className="min-w-0" id={`${id}-start`} type="date" value={start} onChange={(e) => onChange('start', e.target.value)} /><Label className="text-xs text-muted-foreground" htmlFor={`${id}-start-time`}>Giờ bắt đầu (tùy chọn)</Label><Input id={`${id}-start-time`} type="time" step={60} value={startTime} onChange={(e) => onChange('startTime', e.target.value)} /></div>
    <div className="min-w-0 space-y-1"><Label htmlFor={`${id}-end`}>Hạn hoàn thành *</Label><Input className="min-w-0" id={`${id}-end`} type="date" value={end} onChange={(e) => onChange('end', e.target.value)} /><Label className="text-xs text-muted-foreground" htmlFor={`${id}-end-time`}>Giờ hoàn thành (tùy chọn)</Label><Input id={`${id}-end-time`} type="time" step={60} value={endTime} onChange={(e) => onChange('endTime', e.target.value)} /></div>
  </div>;
}
export function Biz3KSchedule({ value, onChange }: { value: K3CreationKf['execution_schedule']; onChange: (value: K3CreationKf['execution_schedule']) => void }) {
  return <div className="space-y-2"><Label>Lộ trình thực hiện</Label><Select value={value.mode} onValueChange={(mode) => onChange({ ...value, mode: mode as K3CreationKf['execution_schedule']['mode'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Hằng ngày</SelectItem><SelectItem value="dates">Chọn một / nhiều ngày</SelectItem><SelectItem value="weekdays">Các thứ trong tuần</SelectItem><SelectItem value="weekly">Hằng tuần</SelectItem></SelectContent></Select>
    {value.mode === 'dates' && <div className="space-y-2"><Input aria-label="Thêm ngày thực hiện" type="date" value="" onChange={(e) => { if (e.target.value) onChange({ ...value, dates: [...new Set([...(value.dates ?? []), e.target.value])].sort() }); }} /><div className="flex flex-wrap gap-1">{value.dates?.map((d) => <Button key={d} size="sm" variant="outline" onClick={() => onChange({ ...value, dates: value.dates?.filter((v) => v !== d) })}>{d} ×</Button>)}</div></div>}
    {value.mode === 'weekdays' && <div className="flex flex-wrap gap-1">{[1, 2, 3, 4, 5, 6, 7].map((d) => <Button key={d} type="button" size="sm" aria-pressed={value.weekdays?.includes(d) ?? false} variant={value.weekdays?.includes(d) ? 'default' : 'outline'} onClick={() => onChange({ ...value, weekdays: value.weekdays?.includes(d) ? value.weekdays.filter((v) => v !== d) : [...(value.weekdays ?? []), d] })}>{d === 7 ? 'CN' : `T${d + 1}`}</Button>)}</div>}
    <div className="grid grid-cols-2 gap-2"><div><Label className="text-xs">Giờ dự kiến bắt đầu</Label><Input aria-label="Giờ lộ trình bắt đầu" type="time" value={value.start_time ?? ''} onChange={(e) => onChange({ ...value, start_time: e.target.value })} /></div><div><Label className="text-xs">Giờ dự kiến kết thúc</Label><Input aria-label="Giờ lộ trình kết thúc" type="time" value={value.end_time ?? ''} onChange={(e) => onChange({ ...value, end_time: e.target.value })} /></div></div>
  </div>;
}