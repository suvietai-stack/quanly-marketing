import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth, SUPER_ADMIN_ID } from '@/lib/auth';
import { ROLE_SCOPES } from '@/lib/biz/positions';
import { roleScopesQuery, usePositionAction } from '@/lib/biz/positionQueries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export function BizRoleScopes() {
 const uid = useAuth(s => s.currentUserId) ?? ''; const roles = useAuth(s => s.roles); const query = useQuery(roleScopesQuery(uid)); const save = usePositionAction();
 return <section className="space-y-3"><h3 className="font-semibold">Phạm vi quản lý theo Role</h3>{query.error && <p role="alert" className="text-destructive">{query.error.message}</p>}<div className="divide-y border-y">{roles.map(r => <div key={r.id} className="py-3 grid gap-2 sm:grid-cols-2 items-center"><strong className="text-sm break-words">{r.name}</strong>{r.id === SUPER_ADMIN_ID ? <span className="text-sm text-primary">Toàn bộ · Toàn quyền</span> : <Select value={query.data?.find(s => s.id === r.id)?.scope ?? 'assigned'} disabled={save.isPending || !query.data} onValueChange={async scope => { try { await save.mutateAsync({ kind: 'role', role: r.id, scope }); toast.success('Đã cập nhật phạm vi Role.'); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } }}><SelectTrigger aria-label={`Phạm vi ${r.name}`}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ROLE_SCOPES).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>}</div>)}</div></section>;
}