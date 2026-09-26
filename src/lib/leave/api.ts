import { supabase } from "@/integrations/supabase/client";
import type { LeaveSettings, LeaveType } from "./calc";

const db = supabase as any;
export const leaveErr = (e: any) => e?.message || "Có lỗi xảy ra";

export type LeaveStatus = "pending" | "approved" | "rejected" | "recalled" | "cancelled";
export interface LeaveRequest {
  id: string; owner_id: string; created_by: string; type: LeaveType; status: LeaveStatus;
  cancel_state: "requested" | "rejected" | null; cancel_reason: string | null;
  approver_id: string; reason_id: string; reason_name: string; detail: string | null;
  payload: any; calc: any; mark_at: string; applied: any; submission_no: number;
  submitted_at: string; decided_by: string | null; decided_at: string | null; decision_note: string | null;
  created_at: string; updated_at: string;
}
export interface LeaveSubmission {
  id: string; request_id: string; no: number; payload: any; calc: any; reason_name: string; detail: string | null;
  approver_id: string; submitted_by: string; submitted_at: string; result: string | null;
  decided_by: string | null; decided_at: string | null; note: string | null;
}
export interface LeaveEvent { id: string; request_id: string; actor_id: string | null; action: string; detail: any; created_at: string }

export const STATUS_LABEL: Record<LeaveStatus, string> = {
  pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối", recalled: "Đã thu hồi", cancelled: "Đã hủy",
};
export const ACTION_LABEL: Record<string, string> = {
  submit: "Gửi đơn", edit: "Sửa nội dung", resubmit: "Sửa và gửi lại", approve: "Phê duyệt", reject: "Từ chối",
  recall: "Thu hồi", cancel_request: "Yêu cầu hủy", cancel_approve: "Chấp thuận hủy", cancel_reject: "Từ chối yêu cầu hủy",
  reassign: "Chuyển người duyệt", exception: "Xử lý ngoại lệ",
};

async function rpc<T = any>(fn: string, args?: any): Promise<T> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw error;
  return data as T;
}

export const getSettings = () => rpc<LeaveSettings>("leave_settings_get");
export const saveSettings = (data: LeaveSettings) => rpc("leave_settings_save", { _data: data });
export const reasonUsage = (id: string) => rpc<number>("leave_reason_usage", { _id: id });
export const listApprovers = () => rpc<{ id: string; full_name: string }[]>("leave_approvers");

export async function listRequests(): Promise<LeaveRequest[]> {
  const { data, error } = await db.from("leave_requests").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) throw error;
  return data || [];
}
export async function getRequest(id: string): Promise<LeaveRequest | null> {
  const { data, error } = await db.from("leave_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
export async function getHistory(id: string): Promise<{ subs: LeaveSubmission[]; events: LeaveEvent[] }> {
  const [a, b] = await Promise.all([
    db.from("leave_request_submissions").select("*").eq("request_id", id).order("no"),
    db.from("leave_request_events").select("*").eq("request_id", id).order("created_at"),
  ]);
  if (a.error) throw a.error; if (b.error) throw b.error;
  return { subs: a.data || [], events: b.data || [] };
}

export interface FormInput { owner?: string | null; type: LeaveType; payload: any; reasonId: string; detail: string; approver: string; exception?: string }
export const submitRequest = (f: FormInput) => rpc<string>("leave_submit", {
  _owner: f.owner || null, _type: f.type, _payload: f.payload, _reason_id: f.reasonId, _detail: f.detail, _approver: f.approver, _exception: f.exception || null,
});
export const updateRequest = (id: string, f: FormInput) => rpc("leave_update", { _id: id, _payload: f.payload, _reason_id: f.reasonId, _detail: f.detail, _approver: f.approver });
export const resubmitRequest = (id: string, f: FormInput) => rpc("leave_resubmit", { _id: id, _payload: f.payload, _reason_id: f.reasonId, _detail: f.detail, _approver: f.approver });
export const decide = (id: string, approve: boolean, note: string) => rpc("leave_decide", { _id: id, _approve: approve, _note: note });
export const recall = (id: string) => rpc("leave_recall", { _id: id });
export const cancelRequest = (id: string, reason: string) => rpc("leave_cancel_request", { _id: id, _reason: reason });
export const cancelDecide = (id: string, approve: boolean, note: string) => rpc("leave_cancel_decide", { _id: id, _approve: approve, _note: note });
export const reassign = (id: string, approver: string, note: string) => rpc("leave_reassign", { _id: id, _approver: approver, _note: note });
export const exceptionCancel = (id: string, reason: string) => rpc("leave_exception_cancel", { _id: id, _reason: reason });
