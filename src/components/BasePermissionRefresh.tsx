import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
export function BasePermissionRefresh() {
  const uid = useAuth(s => s.currentUserId);
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