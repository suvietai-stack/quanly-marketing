import { supabase } from "@/integrations/supabase/client";
import { zaloDispatch } from "@/lib/zalo.functions";
import { pushDispatch } from "@/lib/push.functions";
import { leaveGroupDispatch } from "./zaloGroup.functions";
import type { LeaveSettings, LeaveType } from "./calc";
import { readLeave } from "./readPolicy";

const db = supabase as any;
export const leaveErr = (e: any) => e?.message || "Có lỗi xảy ra";

export type LeaveStatus = "pending" | "approved" | "rejected" | "recalled" | "cancelled";
export interface LeaveRequest {
  id: string; owner_id: string; created_by: string; type: LeaveType; status: LeaveStatus;
  cancel_state: "requested" | "rejected" | null; cancel_reason: string | null;
  approver_id: string; reason_id: string; reason_name: string; detail: string | null;
  payload: any; calc: any; mark_at: string; applied: any; submission_no: number;
  submitted_at: string; decided_by: string | null; decided_at: string | null; decision_note: string | null;
  is_late: boolean; late_reason: string | null;
  created_at: string; updated_at: string;
}
export interface LeaveSubmission {
  id: string; request_id: string; no: number; payload: any; calc: any; reason_name: string; detail: string | null;
  approver_id: string; submitted_by: string; submitted_at: string; result: string | null;
  decided_by: string | null; decided_at: string | null; note: string | null;
  is_late: boolean; late_reason: string | null;
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
  // Giống module Tín hiệu: sau thao tác thành công, nhờ máy chủ xử lý hàng đợi Zalo ngay (lỗi không ảnh hưởng thao tác chính)
  if (WRITE_RPC.has(fn)) { zaloDispatch().catch(() => {}); pushDispatch().catch(() => {}); leaveGroupDispatch().catch(() => {}); }
  return data as T;
}
const WRITE_RPC = new Set(["leave_submit", "leave_resubmit", "leave_decide", "leave_cancel_request", "leave_cancel_decide", "leave_reassign", "leave_exception_cancel"]);

export async function getSettings(opts?: { signal?: AbortSignal }): Promise<LeaveSettings> {
  return readLeave<LeaveSettings>('Cài đặt', signal => db.rpc('leave_settings_get').abortSignal(signal), opts?.signal);
}
export const saveSettings = (data: LeaveSettings) => rpc("leave_settings_save", { _data: data });
export const reasonUsage = (id: string) => rpc<number>("leave_reason_usage", { _id: id });
export async function listApprovers(opts?: { signal?: AbortSignal }): Promise<{ id: string; full_name: string }[]> {
  return readLeave('Người duyệt', signal => db.rpc('leave_approvers').abortSignal(signal), opts?.signal);
}

export async function listRequests(opts?: { signal?: AbortSignal }): Promise<LeaveRequest[]> {
  const data = await readLeave<LeaveRequest[] | null>('Danh sách đơn', signal => db.from('leave_requests').select('*').order('created_at', { ascending: false }).limit(1000).abortSignal(signal), opts?.signal);
  return data || [];
}
export async function getRequest(id: string, opts?: { signal?: AbortSignal }): Promise<LeaveRequest | null> {
  return readLeave<LeaveRequest | null>('Chi tiết đơn', signal => db.from('leave_requests').select('*').eq('id', id).maybeSingle().abortSignal(signal), opts?.signal);
}
export async function getHistory(id: string, opts?: { signal?: AbortSignal }): Promise<{ subs: LeaveSubmission[]; events: LeaveEvent[] }> {
  const [subs, events] = await Promise.all([
    readLeave<LeaveSubmission[] | null>('Phiên bản đơn', signal => db.from('leave_request_submissions').select('*').eq('request_id', id).order('no').abortSignal(signal), opts?.signal),
    readLeave<LeaveEvent[] | null>('Lịch sử đơn', signal => db.from('leave_request_events').select('*').eq('request_id', id).order('created_at').abortSignal(signal), opts?.signal),
  ]);
  return { subs: subs || [], events: events || [] };
}

export interface FormInput { owner?: string | null; type: LeaveType; payload: any; reasonId: string; detail: string; approver: string; exception?: string }
export const submitRequest = (f: FormInput) => rpc<string>("leave_submit", {
  _owner: f.owner || null, _type: f.type, _payload: f.payload, _reason_id: f.reasonId, _detail: f.detail, _approver: f.approver, _exception: f.exception || null,
});
export const updateRequest = (id: string, f: FormInput) => rpc("leave_update", { _id: id, _payload: f.payload, _reason_id: f.reasonId, _detail: f.detail, _approver: f.approver, _exception: f.exception || null });
export const resubmitRequest = (id: string, f: FormInput) => rpc("leave_resubmit", { _id: id, _payload: f.payload, _reason_id: f.reasonId, _detail: f.detail, _approver: f.approver, _exception: f.exception || null });
export const decide = (id: string, approve: boolean, note: string) => rpc("leave_decide", { _id: id, _approve: approve, _note: note });
export const recall = (id: string) => rpc("leave_recall", { _id: id });
export const cancelRequest = (id: string, reason: string) => rpc("leave_cancel_request", { _id: id, _reason: reason });
export const cancelDecide = (id: string, approve: boolean, note: string) => rpc("leave_cancel_decide", { _id: id, _approve: approve, _note: note });
export const reassign = (id: string, approver: string, note: string) => rpc("leave_reassign", { _id: id, _approver: approver, _note: note });
export const exceptionCancel = (id: string, reason: string) => rpc("leave_exception_cancel", { _id: id, _reason: reason });
