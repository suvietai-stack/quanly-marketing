import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

/** Server-only: never return this value through a server-function response. */
export async function providerKey(): Promise<string> {
  const db = supabaseAdmin as unknown as SupabaseClient;
  const { data, error } = await db.rpc('ai_sv_key_server_read');
  if (error) throw new Error('Chưa đọc được cấu hình khóa AI trên máy chủ.');
  return (typeof data === 'string' ? data.trim() : '') || process.env.OPENAI_API_KEY?.trim() || '';
}
