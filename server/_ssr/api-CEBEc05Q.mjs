import { s as supabase } from "./client-DfPXH9B8.mjs";
const db = supabase;
async function rpc(fn, args) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
}
async function sel(q) {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}
const otApi = {
  orders: () => sel(db.from("ot_orders").select("*").order("created_at", { ascending: false }).limit(1e3)),
  allTasks: () => sel(db.from("ot_tasks").select("*").limit(5e3)),
  order: (id) => sel(db.from("ot_orders").select("*").eq("id", id).maybeSingle()),
  tasks: (id) => sel(db.from("ot_tasks").select("*").eq("order_id", id).order("position").order("created_at")),
  receipts: (ids) => ids.length ? sel(db.from("ot_receipts").select("*").in("task_id", ids).order("received_at")) : Promise.resolve([]),
  logs: (id) => sel(db.from("ot_logs").select("*").eq("order_id", id).order("created_at", { ascending: false })),
  suppliers: () => sel(db.from("ot_suppliers").select("*").order("name")),
  settings: () => sel(db.from("ot_settings").select("allow_manual").eq("id", 1).maybeSingle()),
  people: () => rpc("ot_people", {}),
  saveSettings: (allow) => rpc("ot_settings_save", { _allow_manual: allow }),
  saveSupplier: (id, data) => rpc("ot_supplier_save", { _id: id, _data: data }),
  setSupplierActive: (id, active) => rpc("ot_supplier_active", { _id: id, _active: active }),
  create: (data) => rpc("ot_create", { _data: data }),
  accept: (id) => rpc("ot_accept", { _id: id }),
  updateOrder: (id, data) => rpc("ot_update_order", { _id: id, _data: data }),
  plan: (id, box, proc, qty) => rpc("ot_plan", { _id: id, _has_box: box, _has_proc: proc, _qty: qty }),
  addProc: (order, data) => rpc("ot_proc_add", { _order: order, _data: data }),
  updateTask: (task, data) => rpc("ot_task_update", { _task: task, _data: data }),
  action: (task, action, qty) => rpc("ot_task_action", { _task: task, _action: action, _qty: qty ?? null }),
  fixTime: (task, field, value, reason) => rpc("ot_fix_time", { _task: task, _field: field, _value: value, _reason: reason }),
  cancel: (id, reason) => rpc("ot_cancel", { _id: id, _reason: reason }),
  reschedules: (id) => sel(db.from("ot_reschedules").select("*").eq("order_id", id).order("created_at", { ascending: false })),
  pendingReschedules: () => sel(db.from("ot_reschedules").select("*").eq("status", "pending")),
  propose: (order, date, reason) => rpc("ot_reschedule_propose", { _order: order, _date: date, _reason: reason }),
  reply: (id, decision, counter, note) => rpc("ot_reschedule_reply", { _id: id, _decision: decision, _counter: counter, _note: note }),
  withdraw: (id) => rpc("ot_reschedule_withdraw", { _id: id }),
  setContact: (task, date) => rpc("ot_set_contact", { _task: task, _date: date })
};
const fmtDate = (d) => {
  const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
};
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
export {
  fmtDateTime as a,
  fmtDate as f,
  otApi as o
};
