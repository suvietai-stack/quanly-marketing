import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { k3Error } from '@/lib/biz/k3';
import { disciplineTotals, planLabels, sourceLabels, type K3DisciplineDay } from '@/lib/biz/k3Discipline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Biz3KDiscipline({ start, end, manage = false }: { start: string; end: string; manage?: boolean }) {
  const uid = useAuth(s => s.currentUserId) ?? '';
  const query = useQuery({ queryKey: ['k3_discipline', uid, start, end, manage], queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_discipline_read', { _start: start, _end: end, _manage: manage });
    if (error) throw error;
    return data as unknown as K3DisciplineDay[];
  } });
  if (query.error) return <div><p className="text-destructive">{k3Error(query.error)}</p><Button variant="outline" onClick={() => query.refetch()}>Thử lại</Button></div>;
  if (!query.data) return <p className="text-sm text-muted-foreground">Đang tải kỷ luật ngày…</p>;
  const rows = query.data;
  const totals = disciplineTotals(rows);
  const people = [...new Set(rows.map(r => r.user_id))];
  return <section className="space-y-3 border-y border-border py-3">
    <h3 className="font-medium">Kỷ luật 3K</h3>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Ngày có nghĩa vụ',totals.required],['Kế hoạch đúng hạn',`${totals.planOnTime}/${totals.required}`],['Tổng kết đúng hạn',`${totals.reviewOnTime}/${totals.required}`],['Tổng kết muộn',totals.reviewLate]].map(([label,n]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{n}</p></div>)}</div>
    {people.map(id => { const days = rows.filter(r => r.user_id === id); const person = days[0]; if (!person) return null; const t = disciplineTotals(days);
      return <div key={id} className="grid gap-2 border-t border-border py-2 sm:grid-cols-3"><div><p className="font-medium">{manage ? person.name : 'Của tôi'}</p><p className="text-xs text-muted-foreground">{person.department} · {t.required} ngày có nghĩa vụ</p></div><div><p className="text-xs text-muted-foreground">Kế hoạch đầu ngày</p>{start === end ? <><Badge variant="outline">{planLabels[person.plan_status]}</Badge>{person.plan_source && <p className="text-xs text-muted-foreground">{sourceLabels[person.plan_source]}</p>}</> : <p className="text-sm">Đúng hạn {t.planOnTime}/{t.required} · Muộn {t.planLate} · Chưa lập {t.planMissing}{t.unobserved ? ` · Chưa có dấu mốc ${t.unobserved}` : ''}</p>}</div><div><p className="text-xs text-muted-foreground">Tổng kết cuối ngày</p>{start === end ? <Badge variant={person.manual_status === 'reconfirm' ? 'destructive' : 'secondary'}>{!person.obligated ? 'Không áp dụng' : person.manual_status === 'reconfirm' ? 'Cần tổng kết lại' : person.manual_status === 'none' ? 'Chưa tổng kết' : person.summary_late ? 'Đã tổng kết muộn' : 'Đã tổng kết'}</Badge> : <p className="text-sm">Đúng hạn {t.reviewOnTime}/{t.required} · Muộn {t.reviewLate} · Chưa tổng kết {t.reviewMissing} · Cần lại {t.reconfirm}</p>}</div></div>;
    })}
    {!rows.length && <p className="text-sm text-muted-foreground">Chưa có ngày phù hợp phạm vi.</p>}
  </section>;
}