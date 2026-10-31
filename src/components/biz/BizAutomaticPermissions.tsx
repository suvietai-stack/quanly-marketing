import { useState } from 'react';
import { useAuth, useCurrentUser } from '@/lib/auth';
import { DEFAULT_BUSINESS_POSITIONS } from '@/lib/biz/positions';
import { BizEffectiveAccess } from './BizEffectiveAccess';
import { BizAccessExceptions } from './BizAccessExceptions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BizAutomaticPermissions() {
 const users = useAuth(s => s.users); const { can, isSuperAdmin } = useCurrentUser();
 const [user, setUser] = useState('');
 return <div className="space-y-6 pb-28 sm:pb-5">
  <section className="space-y-3"><h2 className="font-semibold">Quyền mặc định theo chức vụ</h2>
   <div className="divide-y border-y">{DEFAULT_BUSINESS_POSITIONS.map(p => <div key={p.code} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 py-3 text-sm"><div className="min-w-0"><strong className="break-words">{p.name}</strong><p className="text-xs text-muted-foreground">Cấp {p.level}</p></div><span className="text-muted-foreground max-sm:col-start-1">{p.scope}</span><span className="text-primary max-sm:col-start-2 max-sm:row-start-1">Tự động</span></div>)}<div className="py-3 text-sm flex flex-wrap justify-between gap-2"><strong>Admin / Super Admin</strong><span>Toàn quyền · Role hệ thống</span></div></div>
  </section>
  <section className="space-y-3"><h2 className="font-semibold">Quyền đang áp dụng cho nhân sự</h2><Select value={user || 'none'} onValueChange={v => setUser(v === 'none' ? '' : v)}><SelectTrigger aria-label="Nhân sự xem quyền" className="sm:max-w-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Chọn nhân sự</SelectItem>{users.filter(u => u.status === 'Đang hoạt động').map(u => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}</SelectContent></Select>{user && <BizEffectiveAccess key={user} user={user} />}</section>
  {(isSuperAdmin || can('biz.access_manage')) && <details className="border-t pt-4"><summary className="cursor-pointer font-semibold text-sm">Nâng cao · Quyền ngoại lệ</summary><div className="pt-4"><BizAccessExceptions /></div></details>}
 </div>;
}