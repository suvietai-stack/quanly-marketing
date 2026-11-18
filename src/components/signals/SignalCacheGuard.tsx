import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';

/**
 * Session-scoped Signal cache cleanup. Keep this file lightweight:
 * the root route must not load the entire Signals workspace just to clear cache.
 */
export function SignalCacheGuard() {
  const uid = useAuth((s) => s.currentUserId);
  const qc = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (previous.current !== undefined && previous.current !== uid) {
      qc.removeQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('sig:') });
    }
    previous.current = uid;
  }, [uid, qc]);
  return null;
}
