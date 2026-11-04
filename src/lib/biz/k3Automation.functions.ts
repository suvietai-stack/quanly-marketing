import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const k3ReportGroups = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc('k3_automation_read');
  if (error || !data) throw new Error('Bạn không có quyền cấu hình báo cáo 3K.');
  const { listGroups } = await import('@/lib/finance/gmf.server');
  return listGroups();
});