import { supabase } from '@/integrations/supabase/client';

// Ephemeral SDK-verified handoff; URL markers and ordinary sessions never grant recovery.
let recoveryUserId: string | null = null;
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') recoveryUserId = session?.user.id ?? null;
  if (event === 'SIGNED_OUT') recoveryUserId = null;
});
export async function hasRecoverySession() {
  if (!recoveryUserId) return false;
  const { data, error } = await supabase.auth.getUser();
  return !error && data.user?.id === recoveryUserId;
}
export function clearRecoverySession() { recoveryUserId = null; }