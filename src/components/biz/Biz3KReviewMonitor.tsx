import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { k3Error } from '@/lib/biz/k3';
import { Biz3KDayReview, manualReviewLabels, systemCloseLabels, type K3DayReviewData } from './Biz3KDayReview';

export function Biz3KReviewMonitor({ date, today }: { date: string; today: string }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const [selected, setSelected] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['k3_review_monitor', uid, date], queryFn: async () => { const { data, error } = await supabase.rpc('k3_employee_review_team', { _date: date }); if (error) throw error; return data as unknown as { user_id: string; name: string; department: string; data: K3DayReviewData }[]; } });
  const people = query.data ?? [];
  const obligated = people.filter((p) => p.data.action_count > 0 || p.data.result_count > 0);
  const counts = [['Nhân viên thuộc phạm vi', people.length], ['Có nghĩa vụ 3K', obligated.length], ['Có cập nhật KPI', obligated.filter((p) => p.data.result_count > 0).length], ['Chưa cập nhật KPI', obligated.filter((p) => !p.data.result_count).length], ['Đã tổng kết thủ công', obligated.filter((p) => p.data.manual_status === 'reviewed').length], ['Chưa tổng kết', obligated.filter((p) => p.data.manual_status === 'none').length], ['Cần tổng kết lại', obligated.filter((p) => p.data.manual_status === 'reconfirm').length], ['Đã chốt tự động', obligated.filter((p) => ['auto_closed', 'adjusted'].includes(p.data.system_status)).length], ['KF chưa cập nhật', obligated.reduce((n, p) => n + p.data.missing, 0)], ['Có điều chỉnh sau chốt', obligated.filter((p) => p.data.system_status === 'adjusted').length]];
  return <section className="space-y-3 border-y border-border py-3"><h3 className="font-medium">Tổng kết nhân viên · {date}</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{counts.map(([label, n]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{n}</p></div>)}</div>{query.error && <p className="text-destructive">{k3Error(query.error)}</p>}{obligated.map((p) => <div key={p.user_id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-2"><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.department} · {p.data.action_count - p.data.missing}/{p.data.action_count} KF có cập nhật</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{manualReviewLabels[p.data.manual_status]}</Badge><Badge variant="outline">{systemCloseLabels[p.data.system_status]}</Badge><Button size="sm" variant="ghost" onClick={() => setSelected(p.user_id)}>Xem tổng kết</Button></div></div>)}{selected && <Biz3KDayReview date={date} today={today} user={selected} onClose={() => setSelected(null)} />}</section>;
}