import { supabase } from "@/integrations/supabase/client";
import { zaloDispatch } from "@/lib/zalo.functions";
import { pushDispatch } from "@/lib/push.functions";

/** Đẩy thông báo Zalo chạy nền — lỗi không ảnh hưởng thao tác chính. */
function dispatchZalo() { zaloDispatch().catch(() => {});  pushDispatch().catch(() => {}); }
import { resolveOptions, type CatOption, type LastNote, type OptionScope, type Signal, type SignalStatus } from "./catalog";
import type { AcceptNoteRow, AssignEventRow } from "./acceptTime";
import type { ProgressionRow } from './progression';
import type { DeadlineRow, DeadlineReport, DeadlineHistory } from './deadlines';
import type { SignalLabel, LabelLink, Potential } from './potential';

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

export async function listSignals(priority = false): Promise<Signal[]> {
  const [rows,links] = await Promise.all([
    fetchAll<Signal>((a,b)=>priority
      ? db.from('signal_list_priority').select('*').order('list_work_priority').order('list_wait_since',{ascending:true,nullsFirst:false}).order('list_progression_due_on',{ascending:true,nullsFirst:false}).order('list_activity_at',{ascending:false}).order('id').range(a,b)
      : db.from('opportunity_signals').select('*').order('detected_on',{ascending:false}).order('created_at',{ascending:false}).order('id').range(a,b)),
    fetchAll<LabelLink>((a,b)=>db.from('signal_label_links').select('signal_id,label_id').order('signal_id').order('label_id').range(a,b)),
  ]);
  const labels: Record<string,string[]> = {};
  for(const link of links) (labels[link.signal_id] ??= []).push(link.label_id);
  return rows.map(s=>({...s,label_ids:labels[s.id]??[]}));
}

export async function listSignalLabels(): Promise<SignalLabel[]> {
  return fetchAll<SignalLabel>((a,b)=>db.from('signal_labels').select('*').order('name').order('id').range(a,b));
}
export async function saveSignalLabel(id: string | null,name: string,personal: boolean,active = true): Promise<string> {
  const {data,error}=await db.rpc('signal_label_save',{_id:id,_name:name,_personal:personal,_active:active});
  if(error) throw error; return data;
}
export async function saveSignalEnrichment(id:string,requestId:string,potential:Potential,labels:string[]) {
  const {error}=await db.rpc('signal_assessment_save',{_id:id,_request_id:requestId,_potential:potential,_labels:labels});
  if(error) throw error;
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
  is_progression?: boolean | null;
  id: string; author_id: string; note: string | null; status_from: string | null; status_to: string | null;
  next_contact_on: string | null; next_contact_at: string | null; revenue: number | null; lost_reason: string | null;
  event_type: string | null; channel: string | null; created_at: string;
}
export interface SignalEvent { id: string; actor_id: string | null; kind: string; detail: any; created_at: string }

export async function signalHistory(id: string, offset = 0): Promise<{ notes: SignalNote[]; events: SignalEvent[]; hasMore:boolean; noteCount:number }> {
  const [n, e] = await Promise.all([
    db.from("opportunity_signal_notes").select("id,author_id,note,status_from,status_to,next_contact_on,next_contact_at,revenue,lost_reason,event_type,channel,created_at,is_progression").eq("signal_id", id).order("created_at", { ascending: false }).order('id').range(offset,offset+29),
    db.from("opportunity_signal_events").select("id,actor_id,kind,detail,created_at").eq("signal_id", id).order("created_at", { ascending: false }).order('id').range(offset,offset+29),
  ]);
  if (n.error) throw n.error;
  if (e.error) throw e.error;
  const {data:count,error}=await db.rpc('signal_note_count',{_id:id});
  if(error)throw error;
  return { notes: n.data, events: e.data, hasMore:n.data.length===30||e.data.length===30,noteCount:Number(count) };
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
  const { data, error } = await db.rpc("signal_delete", { _id: id });
  if (error) throw error;
  return data === true;
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

/** Số tín hiệu đang dùng lựa chọn (đếm phía máy chủ, kiểm tra quyền). Lỗi → không cho xóa. */
export async function optionUsage(scope: OptionScope, name: string): Promise<number> {
  const { data, error } = await db.rpc("signal_catalog_usage", { _scope: scope, _name: name });
  if (error) throw new Error(`Không kiểm tra được dữ liệu lịch sử nên chưa xóa: ${error.message || "lỗi không xác định"}`);
  return Number(data) || 0;
}

/** Sự kiện phân công (kind=assign) — nguồn timestamp giao tín hiệu cho báo cáo TG tiếp nhận. */
export async function listAssignEvents(): Promise<AssignEventRow[]> {
  return fetchAll<AssignEventRow>((a, b) => db.from("opportunity_signal_events")
    .select("signal_id,kind,detail,created_at").eq("kind", "assign").order("id").range(a, b));
}

/** Nhật ký kèm status_from — nguồn timestamp Sale bấm Tiếp nhận (status_from = waiting). */
export async function listAcceptNotes(): Promise<AcceptNoteRow[]> {
  return fetchAll<AcceptNoteRow>((a, b) => db.from("opportunity_signal_notes")
    .select("signal_id,author_id,status_from,created_at").order("id").range(a, b));
}

/** Nhật ký rút gọn (người viết + thời điểm) để tính nhắc chăm sóc — trong phạm vi RLS. */
export async function listCareNotes(): Promise<Record<string, { author_id: string; created_at: string }[]>> {
  const rows = await fetchAll<{ signal_id: string; author_id: string; created_at: string }>((a, b) => db.from("opportunity_signal_notes")
    .select("signal_id,author_id,created_at").order("id").range(a, b));
  const m: Record<string, { author_id: string; created_at: string }[]> = {};
  for (const r of rows) (m[r.signal_id] ??= []).push(r);
  return m;
}

/** Aggregation is authoritative and SECURITY INVOKER: parent and history RLS apply. */
export async function listProgression(from?: string, to?: string): Promise<Record<string, ProgressionRow>> {
  const rows = await fetchAll<ProgressionRow>((a,b) => db.rpc('signal_progression_rows',{_from:from || null,_to:to || null}).order('signal_id').range(a,b));
  return Object.fromEntries(rows.map(r => [r.signal_id,r]));
}
export async function saveProgression(id: string, requestId: string, p: SaleUpdate) {
  const { data,error } = await db.rpc('signal_progression_save',{_id:id,_request_id:requestId,_status:p.status,_note:p.note,_next:p.next,_next_at:p.nextAt,_revenue:p.revenue,_lost_reason:p.lostReason});
  if(error) throw error;
  return data as string;
}

export async function listDeadlines(): Promise<Record<string,DeadlineRow>> {
  const rows=await fetchAll<DeadlineRow>((a,b)=>db.rpc('signal_progression_deadlines').order('signal_id').range(a,b));
  return Object.fromEntries(rows.map(r=>[r.signal_id,r]));
}
export async function deadlineReport(from?:string,to?:string,sale?:string,group?:string,source?:string): Promise<DeadlineReport> {
  const {data,error}=await db.rpc('signal_progression_report',{_from:from||null,_to:to||null,_sale:sale||null,_group:group||null,_source:source||null});
  if(error) throw error; return data;
}
export async function deadlineHistory(id:string):Promise<DeadlineHistory[]> {
  return fetchAll<DeadlineHistory>((a,b)=>db.rpc('signal_progression_history',{_id:id}).order('starts_at',{ascending:false}).order('sequence',{ascending:false}).range(a,b));
}

