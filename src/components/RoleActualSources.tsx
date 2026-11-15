import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { PERMISSIONS, useCurrentUser } from '@/lib/auth';

type Source = { role_id: string; role_name: string; source_id: string; source_kind: string; unit_id: string | null; unit_name: string | null; legacy: boolean; permissions: string[]; eligible: boolean; scope: string };
type Actual = { sources: Source[]; effective: string[]; legacy_paths: string[] };
export function RoleActualSources({ userId }: { userId: string }) {
  const { user } = useCurrentUser();
  const q = useQuery({ queryKey: ['role-actual-sources', user?.id, userId], retry: false, queryFn: async () => {
    const { data, error } = await supabase.rpc('role_actual_sources', { _target: userId });
    if (error) throw error;
    return data as unknown as Actual;
  } });
  if (q.isPending) return <p className="py-3 text-sm text-muted-foreground">Đang đọc Role thực tế…</p>;
  if (q.error) return <p role="alert" className="text-sm text-destructive">{q.error.message}</p>;
  const labels: Record<string, string> = { common:'Quyền chung',position:'Role vị trí', slot: 'Role vị trí (lịch sử ô)' , title_legacy: 'Chức danh chưa chuyển ô', task: 'Role nhiệm vụ', specialty: 'Role nhiệm vụ', direct: 'Role trực tiếp' };
  return <section className="space-y-3 py-3">
    <h3 className="font-semibold">Ba nguồn Role</h3>
    {q.data.legacy_paths.length > 0 && <p className="text-sm text-muted-foreground">Còn nguồn legacy: {q.data.legacy_paths.join(', ')}. Chưa chuyển đổi quyền.</p>}
    <div className="divide-y border-y">{[{name:'Quyền chung',kinds:['common']},{name:'Role vị trí',kinds:['position','slot']},{name:'Role nhiệm vụ',kinds:['task','specialty']},{name:'Nguồn cũ được giữ',kinds:['direct','title_legacy']}].filter(group=>group.name!=='Nguồn cũ được giữ'||q.data.sources.some(s=>group.kinds.includes(s.source_kind))).map(group=><section key={group.name} className="py-3"><h4 className="text-sm font-semibold">{group.name}</h4>{q.data.sources.filter(s=>group.kinds.includes(s.source_kind)).map(s => <div key={`${s.source_kind}:${s.source_id}:${s.role_id}`} className="py-3 space-y-1">
      <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{s.role_name}</p><Badge variant="outline">{labels[s.source_kind] ?? s.source_kind}</Badge>{s.legacy && <Badge variant="outline">Legacy</Badge>}</div>
      <p className="text-xs text-muted-foreground">{s.unit_name ?? 'Phạm vi nghiệp vụ hiện hành'} · {s.scope === 'own' ? 'Cá nhân' : 'Theo nguồn và giới hạn nghiệp vụ'} · {s.source_id}</p>
      {!s.eligible && <p className="text-xs text-muted-foreground">Không còn bổ nhiệm Marketing; quyền nguồn cũ đang chờ xác nhận chuyển đổi.</p>}
      <details><summary className="cursor-pointer text-sm">{s.permissions.length} quyền từ nguồn này</summary>{s.permissions.map(k => <p className="text-xs py-1" key={k}>{PERMISSIONS.find(p => p.key === k)?.label ?? k}{!q.data.effective.includes(k) ? ' · Không được phép thực tế (giới hạn/ưu tiên từ chối)' : ''}</p>)}</details>
    </div>)}{!q.data.sources.some(s=>group.kinds.includes(s.source_kind))&&<p className="mt-1 text-xs text-muted-foreground">{group.name==='Quyền chung'?'Chưa có nguồn quyền chung đã kích hoạt.':'Không có Role từ nguồn này.'}</p>}</section>)}</div>
    {!q.data.sources.length && <p className="text-sm text-muted-foreground">Chưa có nguồn Role hiệu lực.</p>}
  </section>;
}