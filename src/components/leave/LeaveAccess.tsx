import { useEffect, useState } from 'react';
import { useAuth, useCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/PermissionGate';
import { LEAVE_ACCESS_KEYS, leaveAccessState } from '@/lib/leave/accessState';
import { withDeadline, leaveReadMessage } from '@/lib/leave/readPolicy';
import { LeavePage } from './LeaveUi';

export function LeaveAccess() {
  const { user, isSuperAdmin, canAny } = useCurrentUser();
  const verifiedActor = useAuth(s => s.baseAccess?.user_id);
  const refresh = useAuth(s => s.refreshBaseAccess);
  const [failure, setFailure] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const actor = user?.id;
  const matched = actor === verifiedActor;
  useEffect(() => {
    setFailure(null);
    if (!actor || matched || isSuperAdmin) return;
    const ctl = new AbortController();
    withDeadline(() => refresh(attempt > 0), ctl.signal)
      .then(() => {
        if (!ctl.signal.aborted && useAuth.getState().baseAccess?.user_id !== actor)
          setFailure('Chưa xác minh được quyền Nghỉ phép. Vui lòng thử lại.');
      })
      .catch(e => { if (!ctl.signal.aborted) setFailure(`Chưa tải được quyền: ${leaveReadMessage(e)}`); });
    return () => ctl.abort();
  }, [actor, matched, isSuperAdmin, refresh, attempt]);
  const state = leaveAccessState(actor, user?.status === 'Đang hoạt động', isSuperAdmin, verifiedActor, canAny(...LEAVE_ACCESS_KEYS), !!failure);
  if (state === 'pending') return <p role="status" className="py-12 text-center text-muted-foreground">Đang xác minh quyền Nghỉ phép…</p>;
  if (state === 'error') return <div role="alert" className="space-y-3 py-12 text-center"><p className="text-destructive">{failure}</p><Button variant="outline" onClick={() => setAttempt(n => n + 1)}>Thử lại</Button></div>;
  return <RequirePermission perm={LEAVE_ACCESS_KEYS}><LeavePage /></RequirePermission>;
}