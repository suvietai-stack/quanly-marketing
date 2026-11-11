import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import type { SpecialtyPermissionPreview } from '@/lib/marketingSpecialties';
import { Badge } from '@/components/ui/badge';
import { PERMISSIONS, useCurrentUser } from '@/lib/auth';
import { auditReasonLabel, titleRolesApi } from '@/lib/basePermissions/titleRoles';
import type { OrgConfig } from '@/lib/basePermissions/types';

export function AppointmentPermissionSummary({ titleId, config }: { titleId: string; config: OrgConfig }) {
  const { user } = useCurrentUser();
  const q = useQuery({ queryKey: ['title-role-links', user?.id], queryFn: titleRolesApi.read, retry: false });
  const title = config.titles.find(t => t.id === titleId);
  if (!titleId) return null;
  if (title?.source === 'biz_positions') return <p className="text-sm text-muted-foreground">Quyền Kinh doanh giữ nguyên theo bổ nhiệm nghiệp vụ.</p>;
  if (q.isPending) return <p className="text-sm text-muted-foreground">Đang đối chiếu quyền tự nhận…</p>;
  if (q.error) return <p role="alert" className="text-sm text-destructive">Chưa xác minh được quyền tự nhận: {q.error.message}</p>;
  const audits = q.data.link_audits?.filter(a => a.title_id === titleId) ?? [];
  const label = (key: string) => PERMISSIONS.find(p => p.key === key)?.label ?? key;
  return <div className="space-y-2 border-t pt-3 text-sm"><p className="font-medium">Quyền tự nhận khi bổ nhiệm có hiệu lực</p>{!audits.length && <p className="text-muted-foreground">Chưa có liên kết Role được kiểm chứng.</p>}{audits.map(a => <div key={a.role_id} className="space-y-1"><p>{a.role_name} <Badge variant="outline">{a.enabled.length ? `${a.enabled.length} quyền thực tế` : 'Chưa cấp quyền'}</Badge></p>{a.enabled.length > 0 && <p className="text-muted-foreground">{a.enabled.map(label).join(' · ')}</p>}{!a.signature_valid && <p className="text-destructive">Role đã thay đổi — cần kiểm chứng và xác nhận lại.</p>}{a.blocked.length > 0 && <details><summary className="cursor-pointer text-muted-foreground">{a.blocked.length} quyền còn chờ</summary>{a.blocked.map(p => <p key={p.key} className="py-1 text-xs">{label(p.key)} — {auditReasonLabel(p.reason)}</p>)}</details>}</div>)}</div>;
}
export function AssignmentSpecialties({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
 const { user, isSuperAdmin } = useCurrentUser();
 const q=useQuery({queryKey:['assignment-specialty-catalog',user?.id],queryFn:async()=>{const {data,error}=await supabase.rpc('mkt_specialty_permission_preview');if(error)throw error;return data as unknown as SpecialtyPermissionPreview[];},enabled:isSuperAdmin,retry:false});
 if(!isSuperAdmin)return null;
 return <details className="border-t pt-3"><summary className="cursor-pointer text-sm font-medium">Nhiệm vụ Marketing (nếu có)</summary>{q.error && <p role="alert" className="text-sm text-destructive">{q.error.message}</p>}{q.data?.map(s=><label key={s.id} className="flex items-center gap-2 py-2 text-sm"><Checkbox checked={selected.includes(s.id)} onCheckedChange={v=>onChange(v===true?[...selected,s.id]:selected.filter(id=>id!==s.id))}/>{s.name}</label>)}<p className="text-xs text-muted-foreground">Chỉ quyền cá nhân đã kiểm chứng của nhiệm vụ tự cấp theo thời hạn phân công; quyết định chuyên môn hiện có giữ nguyên.</p></details>;
}
