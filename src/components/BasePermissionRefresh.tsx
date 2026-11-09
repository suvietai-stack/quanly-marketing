import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
export function BasePermissionRefresh() {
  const uid = useAuth(s => s.currentUserId);
  const access = useAuth(s => s.baseAccess);
  useEffect(() => {
    if (!uid || access?.user_id !== uid || !access.next_transition_at) return;
    const delay = Date.parse(access.next_transition_at) - Date.parse(access.server_now);
    if (!Number.isFinite(delay)) return;
    const timer = window.setTimeout(() => {
      useAuth.setState({ baseAccess: null });
      void useAuth.getState().refreshBaseAccess();
    }, Math.min(2_147_000_000, Math.max(0, delay)));
    return () => clearTimeout(timer);
  }, [uid, access]);
  useEffect(() => {
    if (!uid) return;
    const refresh = () => { if (document.visibilityState === 'visible') void useAuth.getState().refreshBaseAccess(); };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [uid]);
  return null;
}