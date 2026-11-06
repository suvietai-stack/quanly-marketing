import { useRef } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function K3DateControl({ date, today, onChange }: { date: string; today?: string; onChange: (date: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const shift = (amount: number) => {
    const value = new Date(`${date}T12:00:00Z`);
    if (Number.isNaN(value.getTime())) return;
    value.setUTCDate(value.getUTCDate() + amount);
    onChange(value.toISOString().slice(0, 10));
  };
  return <div className="k3-date-control min-w-0">
    <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-1 md:hidden">
      <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Ngày trước" onClick={() => shift(-1)}><ChevronLeft /></Button>
      <div className="relative min-w-0"><Button variant="outline" className="h-11 w-full min-w-0" onClick={() => { try { input.current?.showPicker(); } catch { input.current?.focus(); } }}><CalendarDays className="h-4 w-4 shrink-0" /><span className="truncate">{date === today ? 'Hôm nay, ' : ''}{date.slice(8, 10)}/{date.slice(5, 7)}</span></Button><Input ref={input} aria-label="Chọn ngày thực hiện" type="date" value={date} onChange={e => e.target.value && onChange(e.target.value)} className="absolute inset-0 h-11 w-full opacity-0" /></div>
      <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Ngày sau" onClick={() => shift(1)}><ChevronRight /></Button>
    </div>
    {today && date !== today && <Button variant="ghost" size="sm" className="mx-auto flex md:hidden" onClick={() => onChange(today)}>Về hôm nay</Button>}
    <div className="hidden md:flex items-end gap-2"><div><Label htmlFor="k3-desktop-date">Ngày thực hiện</Label><Input id="k3-desktop-date" type="date" value={date} onChange={e => e.target.value && onChange(e.target.value)} className="w-40" /></div>{today && <Button variant="outline" size="sm" onClick={() => onChange(today)}><CalendarDays className="mr-1 h-4 w-4" />Hôm nay</Button>}</div>
  </div>;
}