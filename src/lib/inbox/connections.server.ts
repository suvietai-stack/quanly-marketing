import { appSecret, graph, META_APP_ID, pageToken, seal, subscribeCapabilities } from '../fbLeads/fb.server';
import { verifyCandidate, verifyMessagingCandidate, type DiscoveredPage } from '../fbLeads/pageDiscovery.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

type Feature = { page_id: string; lead_enabled: boolean; lead_enabled_at: string | null; enabled: boolean; ready: boolean; reason: string | null; tasks: string[] };
// These tables are server-only for writes. Callers must first pass fbl_can_manage.
const db = () => supabaseAdmin as unknown as { from: (table: string) => any; rpc: (name: string, args?: Record<string, unknown>) => Promise<{ error: { code?: string } | null }> };
export async function connectionFeatures() {
  const { data, error } = await db().from('inbox_page_capabilities').select('page_id,lead_enabled,lead_enabled_at,enabled,ready,reason,tasks');
  if (error && ['PGRST205', '42P01'].includes(error.code)) return { installed: false, rows: [] as Feature[] };
  if (error) throw new Error('Không đọc được trạng thái kết nối Page');
  return { installed: true, rows: (data ?? []) as Feature[] };
}
export async function configurePage(page: DiscoveredPage, lead: boolean, messaging: boolean, actorId: string, replaceToken: boolean) {
  const check = (await connectionFeatures());
  if (!check.installed) throw new Error('Hộp thư chưa được kích hoạt dữ liệu; cấu hình Lead hiện tại vẫn được giữ');
  const appToken = `${META_APP_ID}|${appSecret()}`;
  const { data: identity } = await graph('/debug_token', appToken, { params: { input_token: page.token } });
  if (!identity?.is_valid || identity.app_id !== META_APP_ID || identity.type !== 'PAGE' || String(identity.profile_id) !== page.id) throw new Error('Token không hợp lệ hoặc không đúng Page; hãy kết nối lại');
  if (lead) { const v = await verifyCandidate(graph, META_APP_ID, appToken, page); if (!v.eligible) throw new Error(v.message); }
  if (messaging) { const v = await verifyMessagingCandidate(graph, META_APP_ID, appToken, page); if (!v.eligible) throw new Error(v.message); }
  // Disabled features stop intake locally; keep subscriptions so the other feature is never removed.
  if (lead || messaging) await subscribeCapabilities(page.id, page.token, lead, messaging);
  const { error } = await db().rpc('inbox_connection_save', {
    p_page: page.id, p_name: page.name, p_token: replaceToken ? await seal(page.token) : null,
    p_lead: lead, p_messaging: messaging, p_tasks: page.tasks, p_ready: messaging, p_reason: null, p_actor: actorId,
  });
  if (error) throw new Error('Chưa lưu được lựa chọn của Page; cấu hình hiện tại được giữ. Hãy kiểm tra lại.');
  return { ok: true, message: 'Đã lưu lựa chọn nhận Lead / tin nhắn' };
}
export async function configureExisting(pageId: string, lead: boolean, messaging: boolean, actorId: string) {
  const { rows } = await connectionFeatures();
  const { data, error } = await db().from('fbl_pages').select('name,status').eq('page_id',pageId).maybeSingle();
  if (error || !data || data.status === 'disconnected') throw new Error('Page chưa kết nối; hãy kết nối lại');
  const feature = rows.find(r => r.page_id === pageId);
  return configurePage({ id: pageId, name: data.name, token: await pageToken(pageId), tasks: feature?.tasks ?? [], origins: [], eligible: false, message: '' }, lead, messaging, actorId, false);
}
