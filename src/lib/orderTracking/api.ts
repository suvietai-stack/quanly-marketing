import { supabase } from "@/integrations/supabase/client";
import type { OtTask, OtReceipt } from "./logic";

const db = supabase as any;
async function rpc<T = any>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}
async function sel<T>(q: any): Promise<T> {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data as T;
}

export type OtOrder = {
  id: string; code: string; order_type: "sample" | "mass"; title: string; due_date: string; original_due: string; due_time: string | null;
  address: string | null; sale_id: string | null; supply_id: string | null; crm_url: string | null; note: string | null;
  planned: boolean; has_box: boolean; has_processing: boolean; qty: number | null; status: string; created_by: string;
  created_at: string; accepted_at: string | null; completed_at: string | null; updated_at: string;
};
export type OtSupplier = { id: string; name: string; groups: string[]; contact: string | null; phone: string | null; address: string | null; note: string | null; active: boolean };
export type OtLog = { id: string; task_id: string | null; actor_id: string | null; action: string; old: any; new: any; reason: string | null; created_at: string };
export type OtPerson = { id: string; full_name: string; sale: boolean; supply: boolean };

export const otApi = {
  orders: () => sel<OtOrder[]>(db.from("ot_orders").select("*").order("created_at", { ascending: false }).limit(1000)),
  allTasks: () => sel<OtTask[]>(db.from("ot_tasks").select("*").limit(5000)),
  order: (id: string) => sel<OtOrder | null>(db.from("ot_orders").select("*").eq("id", id).maybeSingle()),
  tasks: (id: string) => sel<OtTask[]>(db.from("ot_tasks").select("*").eq("order_id", id).order("position").order("created_at")),
  receipts: (ids: string[]) => ids.length ? sel<OtReceipt[]>(db.from("ot_receipts").select("*").in("task_id", ids).order("received_at")) : Promise.resolve([]),
  logs: (id: string) => sel<OtLog[]>(db.from("ot_logs").select("*").eq("order_id", id).order("created_at", { ascending: false })),
  suppliers: () => sel<OtSupplier[]>(db.from("ot_suppliers").select("*").order("name")),
  settings: () => sel<{ allow_manual: boolean } | null>(db.from("ot_settings").select("allow_manual").eq("id", 1).maybeSingle()),
  people: () => rpc<OtPerson[]>("ot_people", {}),
  saveSettings: (allow: boolean) => rpc("ot_settings_save", { _allow_manual: allow }),
  saveSupplier: (id: string | null, data: any) => rpc<string>("ot_supplier_save", { _id: id, _data: data }),
  setSupplierActive: (id: string, active: boolean) => rpc("ot_supplier_active", { _id: id, _active: active }),
  create: (data: any) => rpc<string>("ot_create", { _data: data }),
  accept: (id: string) => rpc("ot_accept", { _id: id }),
  updateOrder: (id: string, data: any) => rpc("ot_update_order", { _id: id, _data: data }),
  plan: (id: string, box: boolean, proc: boolean, qty: number) => rpc("ot_plan", { _id: id, _has_box: box, _has_proc: proc, _qty: qty }),
  addProc: (order: string, data: any) => rpc<string>("ot_proc_add", { _order: order, _data: data }),
  updateTask: (task: string, data: any) => rpc("ot_task_update", { _task: task, _data: data }),
  action: (task: string, action: string, qty?: number) => rpc("ot_task_action", { _task: task, _action: action, _qty: qty ?? null }),
  fixTime: (task: string, field: string, value: string, reason: string) => rpc("ot_fix_time", { _task: task, _field: field, _value: value, _reason: reason }),
  cancel: (id: string, reason: string) => rpc("ot_cancel", { _id: id, _reason: reason }),
};

export const fmtDate = (d?: string | null) => { const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null; return m ? `${m[3]}/${m[2]}/${m[1]}` : "—"; };
export const fmtDateTime = (d?: string | null) => d ? new Date(d).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
