import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Source = 'signal' | 'kpi' | 'task';
export const sourceLabel: Record<Source, string> = { signal: 'Chốt tín hiệu', kpi: 'Hoàn thành KPI', task: 'Công việc được xác nhận' };
export interface Gift { id: string; name: string; image_url: string; price: number; stock: number; reserved: number; enabled: boolean }
export interface Rule { id: string; source: Source; stars: number; enabled: boolean; enabled_at: string | null }
export interface Ledger { id: string; user_id: string; amount: number; source: string; reason: string; balance_after: number; created_at: string }
export interface Redemption { id: string; user_id: string; gift_id: string; gift_name: string; price: number; status: 'pending' | 'fulfilled' | 'cancelled'; created_at: string; reason: string | null }
export interface Celebration { stars: number; balance: number; rewards: { amount: number; reason: string; source: string }[] }
export interface SaoData { balance: number; held: number; gifts: Gift[]; ledger: Ledger[]; requests: Redemption[]; rules: Rule[]; events: { id: string; kind: string; created_at: string }[] }

async function allRows(table: 'sao_ledger' | 'sao_redemptions', userId?: string) {
  const rows: unknown[] = [];
  for (let from = 0; ; from += 500) {
    let q = supabase.from(table).select('*').order('created_at', { ascending: false }).order('id').range(from, from + 499);
    if (userId) q = q.eq('user_id', userId);
    const { data, error } = await q;
    if (error) throw error;
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}
export async function loadSao(userId: string, admin = false): Promise<SaoData> {
  const [wallet, gifts, ledger, requests, rules, events] = await Promise.all([
    supabase.from('sao_wallets').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('sao_gifts').select('*').order('name'),
    allRows('sao_ledger', admin ? undefined : userId),
    allRows('sao_redemptions', admin ? undefined : userId),
    admin ? supabase.from('sao_rules').select('*').order('source') : Promise.resolve({ data: [], error: null }),
    admin ? supabase.from('sao_admin_events').select('id,kind,created_at').order('created_at', { ascending: false }).limit(100) : Promise.resolve({ data: [], error: null }),
  ]);
  const error = wallet.error || gifts.error || rules.error || events.error;
  if (error) throw error;
  const resolvedGifts = await Promise.all((gifts.data ?? []).map(async (gift) => {
    if (!gift.image_url.startsWith('storage:')) return gift;
    const image = await supabase.storage.from('sao-gifts').createSignedUrl(gift.image_url.slice(8), 3600);
    if (image.error) throw image.error;
    return { ...gift, image_url: image.data.signedUrl, image_ref: gift.image_url };
  }));
  return { balance: wallet.data?.balance ?? 0, held: wallet.data?.held ?? 0, gifts: resolvedGifts, ledger: ledger as Ledger[], requests: requests as Redemption[], rules: (rules.data ?? []) as Rule[], events: events.data ?? [] };
}
export const saoOptions = (userId: string, admin = false) => queryOptions({ queryKey: ['sao', userId, admin], queryFn: () => loadSao(userId, admin), staleTime: 0, refetchOnWindowFocus: true, refetchInterval: 15000 });
export async function redeem(gift: string, request: string) { const r = await supabase.rpc('sao_redeem', { _gift: gift, _request: request }); if (r.error) throw r.error; return r.data; }
export async function decide(id: string, status: 'fulfilled' | 'cancelled', reason = '') { const r = await supabase.rpc('sao_redemption_decide', { _id: id, _status: status, _reason: reason }); if (r.error) throw r.error; }
export async function saveRule(source: Source, stars: number, enabled: boolean) { const r = await supabase.rpc('sao_rule_save', { _source: source, _stars: stars, _enabled: enabled }); if (r.error) throw r.error; }
export async function saveGift(gift: Omit<Gift, 'reserved'>) { const r = await supabase.rpc('sao_gift_save', { _id: gift.id, _name: gift.name, _image: gift.image_url, _price: gift.price, _stock: gift.stock, _enabled: gift.enabled }); if (r.error) throw r.error; }
export async function grant(user: string, stars: number, reason: string, request: string) { const r = await supabase.rpc('sao_manual_grant', { _user: user, _stars: stars, _reason: reason, _request: request }); if (r.error) throw r.error; }
export async function claimCelebration(): Promise<Celebration> { const r = await supabase.rpc('sao_celebration_claim'); if (r.error) throw r.error; return r.data as unknown as Celebration; }
export async function uploadGift(file: File, userId: string) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Chọn ảnh JPG, PNG hoặc WebP tối đa 5 MB');
  const path = `${userId}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
  const r = await supabase.storage.from('sao-gifts').upload(path, file, { contentType: file.type, upsert: false });
  if (r.error) throw r.error;
  return `storage:${path}`;
}