import { supabase } from "@/integrations/supabase/client";
import { zaloDispatch } from "@/lib/zalo.functions";

/** Đẩy thông báo Zalo chạy nền — lỗi không ảnh hưởng thao tác chính. */
function dispatchZalo() { zaloDispatch().catch(() => {}); }
import { resolveOptions, type CatOption, type LastNote, type OptionScope, type Signal, type SignalStatus } from "./catalog";

const db = supabase as any;
const PAGE = 1000;

/** Tải theo trang cho đến hết — không cắt ngầm dữ liệu. RLS vẫn giới hạn phạm vi. */
export async function fetchAll<T>(build: (from: number, to: number) => any): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) return out;
  }
}

export async function listSignals(): Promise<Signal[]> {
  return fetchAll<Signal>((a, b) => db.from("opportunity_signals").select("*")
    .order("detected_on", { ascending: false }).order("created_at", { ascending: false }).order("id").range(a, b));
}

/** Diễn biến gần nhất của mỗi tín hiệu (trong phạm vi được xem). */
export async function listLastNotes(): Promise<Record<string, LastNote>> {
  const rows = await fetchAll<LastNote>((a, b) => db.from("opportunity_signal_notes")
    .select("signal_id,created_at,event_type,note").order("created_at", { ascending: false }).order("id").range(a, b));
  const m: Record<string, LastNote> = {};
  for (const r of rows) if (!m[r.signal_id]) m[r.signal_id] = r;
  return m;
}

export interface SignalInput {
  detected_on: string; customer_name: string; phone: string; address: string | null;
  need_detail: string | null; products: string[]; need_group: string | null; need_groups: string[]; source: string; marketing_note: string | null;
}

export async function createSignal(input: SignalInput, userId: string): Promise<Signal> {
  const { data, error } = await db.from("opportunity_signals").insert({ ...input, created_by: userId }).select("*").single();
  if (error) throw error;
  dispatchZalo();
  return data as Signal;
}

export async function updateSignalInfo(id: string, input: SignalInput) {
  const { error } = await db.from("opportunity_signals").update(input).eq("id", id);
  if (error) throw error;
}

export async function assignSignal(id: string, userId: string | null) {
  const { error } = await db.rpc("signal_assign", { _id: id, _user: userId });
  if (error) throw error;
  dispatchZalo();
}

export interface SaleUpdate {
  status: SignalStatus; note: string; event: string | null; channel: string;
  nextAt: string | null; // ISO datetime hoặc null
  next: string | null;   // YYYY-MM-DD
  revenue: number | null; lostReason: string | null;
}
export async function saleUpdate(id: string, p: SaleUpdate) {
  const { error } = await db.rpc("signal_sale_update", {
    _id: id, _status: p.status, _note: p.note, _next: p.next, _revenue: p.revenue, _lost_reason: p.lostReason,
    _event: p.event, _channel: p.channel, _next_at: p.nextAt,
  });
  if (error) throw error;
}

export async function reopenSignal(id: string, reason: string) {
  const { error } = await db.rpc("signal_reopen", { _id: id, _reason: reason });
  if (error) throw error;
}

export interface SignalNote {
  id: string; author_id: string; note: string | null; status_from: string | null; status_to: string | null;
  next_contact_on: string | null; next_contact_at: string | null; revenue: number | null; lost_reason: string | null;
  event_type: string | null; channel: string | null; created_at: string;
}
export interface SignalEvent { id: string; actor_id: string | null; kind: string; detail: any; created_at: string }

export async function signalHistory(id: string): Promise<{ notes: SignalNote[]; events: SignalEvent[] }> {
  const [n, e] = await Promise.all([
    db.from("opportunity_signal_notes").select("*").eq("signal_id", id).order("created_at", { ascending: false }),
    db.from("opportunity_signal_events").select("*").eq("signal_id", id).order("created_at", { ascending: false }),
  ]);
  if (n.error) throw n.error;
  if (e.error) throw e.error;
  return { notes: n.data, events: e.data };
}

export async function salesList(): Promise<{ id: string; full_name: string }[]> {
  const { data, error } = await db.rpc("signal_sales_list");
  if (error) return [];
  return data ?? [];
}

/** Chỉ đối chiếu trong những tín hiệu người dùng được phép xem (RLS). */
export async function findSamePhone(phone: string, exceptId?: string): Promise<Pick<Signal, "id" | "customer_name" | "status" | "detected_on">[]> {
  let q = db.from("opportunity_signals").select("id,customer_name,status,detected_on").eq("phone", phone).limit(5);
  if (exceptId) q = q.neq("id", exceptId);
  const { data, error } = await q;
  if (error) return [];
  return data ?? [];
}

/** Xóa: DB chỉ cho phép khi chưa có nhật ký và chưa Chốt/Trượt. Trả false nếu bị chặn. */
export async function deleteSignal(id: string): Promise<boolean> {
  const { data, error } = await db.from("opportunity_signals").delete().eq("id", id).select("id");
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function cancelSignal(id: string, reason: string, undo = false) {
  const { error } = await db.rpc("signal_cancel", { _id: id, _reason: reason, _undo: undo });
  if (error) throw error;
}

/** Lý do trượt tùy chỉnh do quản lý bổ sung — lưu trong danh mục dùng chung. */
export const LOST_REASON_SCOPE = "signal_lost_reasons";
export async function getCustomLostReasons(): Promise<string[]> {
  const { data } = await db.from("catalogs").select("items").eq("scope", LOST_REASON_SCOPE).maybeSingle();
  return Array.isArray(data?.items) ? data.items : [];
}
export async function setCustomLostReasons(items: string[]) {
  const { error } = await db.from("catalogs").upsert({ scope: LOST_REASON_SCOPE, items }, { onConflict: "scope" });
  if (error) throw error;
}

export const errMsg = (e: any) => e?.message || "Có lỗi xảy ra";

export async function getOptions(scope: OptionScope): Promise<CatOption[]> {
  const { data } = await db.from("catalogs").select("items").eq("scope", scope).maybeSingle();
  return resolveOptions(data?.items, scope);
}
export async function saveOptions(scope: OptionScope, items: CatOption[]) {
  const { error } = await db.from("catalogs").upsert({ scope, items }, { onConflict: "scope" });
  if (error) throw error;
}
/** Đổi tên: cập nhật cả tín hiệu cũ (kiểm tra quyền phía máy chủ), rồi lưu danh mục. */
export async function renameOptionEverywhere(scope: OptionScope, from: string, to: string, items: CatOption[]) {
  const { error } = await db.rpc("signal_catalog_rename", { _scope: scope, _old: from, _new: to });
  if (error) throw error;
  await saveOptions(scope, items);
}
