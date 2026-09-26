import { supabase } from "@/integrations/supabase/client";
import { zaloDispatch } from "@/lib/zalo.functions";
import type { AttExplanation, AttInput } from "./attendance";

const db = supabase as any;
export interface AttEvent { id: string; explanation_id: string; actor_id: string | null; action: string; detail: any; created_at: string }
export const ATT_ACTION_LABEL: Record<string, string> = {
  submit: "Gửi giải trình", edit: "Sửa giải trình", recall: "Thu hồi", witness_confirm: "Người làm chứng xác nhận",
  witness_unable: "Người làm chứng không thể xác nhận", reconcile: "Đánh dấu đã đối chiếu", note: "Cập nhật ghi chú đối chiếu",
};

async function rpc<T = any>(fn: string, args?: any, wake = false): Promise<T> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw error;
  if (wake) zaloDispatch().catch(() => {});
  return data as T;
}
export async function listAtt(): Promise<AttExplanation[]> {
  const { data, error } = await db.from("attendance_explanations").select("*").order("work_date", { ascending: false }).limit(2000);
  if (error) throw error;
  return data || [];
}
export async function getAtt(id: string): Promise<AttExplanation | null> {
  const { data, error } = await db.from("attendance_explanations").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
export async function getAttEvents(id: string): Promise<AttEvent[]> {
  const { data, error } = await db.from("attendance_explanation_events").select("*").eq("explanation_id", id).order("created_at");
  if (error) throw error;
  return data || [];
}
const args = (f: AttInput) => ({ _date: f.work_date, _kind: f.kind, _in: f.time_in || null, _out: f.time_out || null, _reason_id: f.reason_id, _detail: f.detail, _witness: f.witness_id });
export const listWitnesses = () => rpc<{ id: string; full_name: string }[]>("att_witnesses");
export const submitAtt = (f: AttInput) => rpc<string>("att_submit", args(f), true);
export const updateAtt = (id: string, f: AttInput) => rpc("att_update", { _id: id, ...args(f) }, true);
export const recallAtt = (id: string) => rpc("att_recall", { _id: id });
export const witnessAtt = (id: string, confirm: boolean, note: string) => rpc("att_witness", { _id: id, _confirm: confirm, _note: note });
export const reconcileAtt = (id: string, note: string) => rpc("att_reconcile", { _id: id, _note: note });
export const noteAtt = (id: string, note: string) => rpc("att_note", { _id: id, _note: note });
