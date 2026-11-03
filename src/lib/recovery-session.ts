import { supabase } from '@/integrations/supabase/client';

// Ephemeral SDK-verified handoff; URL markers and ordinary sessions never grant recovery.
let recoveryUserId: string | null = null;
const listeners = new Set<() => void>();
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') recoveryUserId = session?.user.id ?? null;
  if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') recoveryUserId = null;
  if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_OUT' || event === 'SIGNED_IN') setTimeout(() => listeners.forEach(listener => listener()), 0);
});
export function onRecoveryChange(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export async function hasRecoverySession() {
  if (!recoveryUserId) return false;
  const { data, error } = await supabase.auth.getUser();
  return !error && data.user?.id === recoveryUserId;
}
export function clearRecoverySession() { recoveryUserId = null; }