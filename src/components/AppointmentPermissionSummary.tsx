import { useQuery } from '@tanstack/react-query';
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