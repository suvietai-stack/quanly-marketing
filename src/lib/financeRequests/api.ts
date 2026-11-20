import { supabase } from "@/integrations/supabase/client";
import { frGroupDispatch } from "./zaloGroup.functions";
import type { FrKind, FrStatus } from "./logic";

const db = supabase as any;
// Sau khi nghiệp vụ ghi thành công: đánh thức bộ gửi nhóm Zalo (lỗi không ảnh hưởng thao tác chính).
const wakeZaloGroup = () => { frGroupDispatch().catch(() => {}); };
async function rpc<T = any>(fn: string, args: Record<string, unknown>, wake = false): Promise<T> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  if (wake) wakeZaloGroup();
  return data as T;
}
async function sel<T>(q: any): Promise<T> {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data as T;
}

export type FrRequest = {
  id: string; code: string; kind: FrKind; requester_id: string; department_id: string | null;
  amount: number; title: string; detail: string | null; desired_date: string | null;
  payee_name: string | null; payee_info: string | null; attachments: any[]; note: string | null;
  payment_type_id: string | null; advance_id: string | null;
  advance_type_id: string | null; other_label: string | null;
  supplier_name: string | null; supplier_tax: string | null; supplier_bank: string | null; invoice_no: string | null;
  salary_period: string | null; status: FrStatus; current_step: number;
  approved_at: string | null; paid_amount: number; paid_at: string | null; paid_by: string | null;
  pay_method: string | null; pay_ref: string | null; settled_amount: number; deducted_amount: number;
  submitted_at: string | null; created_at: string; updated_at: string;
  requester?: { full_name: string | null } | null;
};

export type FrStep = {
  id: string; request_id: string; step_no: number; label: string; approver_id: string | null; perm: string | null;
  status: "pending" | "approved" | "rejected" | "info_requested"; comment: string | null;
  decided_by: string | null; decided_at: string | null;
};

export type FrEvent = { id: string; request_id: string; actor_id: string | null; action: string; payload: any; created_at: string };
export type FrTypeKind = "payment" | "advance" | "salary_advance";
export type FrPaymentType = { id: string; name: string; active: boolean; sort: number; kind?: FrTypeKind; sys_code?: string | null; description?: string | null };
export type FrTypeWithUsage = FrPaymentType & { usage: number };
export type FrLineCatalog = { id: string; name: string; active: boolean; sort: number };
export type FrRequestLine = {
  id: string; request_id: string; line_no: number; name: string; catalog_id: string | null;
  unit: string | null; qty: number; unit_price: number; line_total: number;
};
export type FrSettings = { kind: FrKind; flow: { label: string; perm?: string; user_id?: string; position?: string }[]; limits: Record<string, any> };
export type FrSettleOption = { id: string; code: string; title: string; paid_amount: number; settled_amount: number; remaining: number };

export const frApi = {
  list: (kind: FrKind, opts: { statuses?: FrStatus[]; q?: string; mine?: boolean; uid?: string; limit?: number } = {}) => {
    let q = db.from("fr_requests").select("*").eq("kind", kind).order("created_at", { ascending: false }).limit(opts.limit ?? 200);
    if (opts.statuses?.length) q = q.in("status", opts.statuses);
    if (opts.mine && opts.uid) q = q.eq("requester_id", opts.uid);
    if (opts.q) q = q.or(`code.ilike.%${opts.q}%,title.ilike.%${opts.q}%`);
    return sel<FrRequest[]>(q);
  },
  detail: (id: string) => sel<FrRequest | null>(db.from("fr_requests").select("*").eq("id", id).maybeSingle()),
  steps: (id: string) => sel<FrStep[]>(db.from("fr_steps").select("*").eq("request_id", id).order("step_no")),
  pendingSteps: () => sel<FrStep[]>(db.from("fr_steps").select("*").eq("status", "pending")),
  events: (id: string) => sel<FrEvent[]>(db.from("fr_events").select("*").eq("request_id", id).order("created_at", { ascending: false })),
  paymentTypes: (kind: FrTypeKind = "payment") =>
    sel<FrPaymentType[]>(db.from("fr_payment_types").select("*").eq("kind", kind).order("sort").order("name")),
  typesWithUsage: (kind: FrTypeKind) => rpc<FrTypeWithUsage[]>("fr_types_with_usage", { _kind: kind }),
  saveType: (id: string | null, kind: FrTypeKind, name: string, description: string, active: boolean, sort: number) =>
    rpc<string>("fr_type_save", { _id: id, _kind: kind, _name: name, _description: description, _active: active, _sort: sort }),
  deleteType: (id: string) => rpc("fr_type_delete", { _id: id }),
  lines: (requestId: string) =>
    sel<FrRequestLine[]>(db.from("fr_request_lines").select("*").eq("request_id", requestId).order("line_no")),
  lineCatalog: () => sel<FrLineCatalog[]>(db.from("fr_line_catalog").select("*").order("sort").order("name")),
  saveLineCatalog: (id: string | null, name: string, active: boolean, sort: number) =>
    rpc<string>("fr_line_catalog_save", { _id: id, _name: name, _active: active, _sort: sort }),
  deleteLineCatalog: (id: string) => rpc("fr_line_catalog_delete", { _id: id }),
  lineCatalogUsage: () => rpc<Record<string, number>>("fr_line_catalog_usage", {}),
  settings: () => sel<FrSettings[]>(db.from("fr_settings").select("*")),
  settleOptions: () => rpc<FrSettleOption[]>("fr_settle_options", {}),
  save: (id: string | null, kind: FrKind, payload: Record<string, unknown>, requestKey: string) =>
    rpc<string>("fr_save", { _id: id, _kind: kind, _payload: payload, _request_key: requestKey }),
  submit: (id: string) => rpc<string>("fr_submit", { _id: id }, true),
  decide: (id: string, action: "approve" | "reject" | "info", comment: string) =>
    rpc("fr_decide", { _id: id, _action: action, _comment: comment }, true),
  cancel: (id: string) => rpc("fr_cancel", { _id: id }),
  pay: (id: string, amount: number, method: string, ref: string, note: string) =>
    rpc("fr_pay", { _id: id, _amount: amount, _method: method, _ref: ref, _note: note }, true),
  deduct: (id: string, amount: number, note: string) => rpc("fr_deduct", { _id: id, _amount: amount, _note: note }, true),
  saveSettings: (kind: FrKind, flow: any[], limits: Record<string, any>) =>
    rpc("fr_settings_save", { _kind: kind, _flow: flow, _limits: limits }),
  report: (kind: FrKind, from: string | null, to: string | null) =>
    rpc<any>("fr_report", { _kind: kind, _from: from, _to: to }),
  /** Toàn bộ đề nghị theo bộ lọc, đọc từng trang 1000 dòng (giới hạn mỗi lần đọc của máy chủ). */
  listAll: async (kind: FrKind, opts: { statuses?: FrStatus[]; q?: string; mine?: boolean; uid?: string } = {}) => {
    const out: FrRequest[] = [];
    for (let from = 0; from < 20000; from += 1000) {
      let q = db.from("fr_requests").select("*").eq("kind", kind).order("created_at", { ascending: false }).order("id").range(from, from + 999);
      if (opts.statuses?.length) q = q.in("status", opts.statuses);
      if (opts.mine && opts.uid) q = q.eq("requester_id", opts.uid);
      if (opts.q) q = q.or(`code.ilike.%${opts.q}%,title.ilike.%${opts.q}%`);
      const page = await sel<FrRequest[]>(q);
      out.push(...page);
      if (page.length < 1000) break;
    }
    return out;
  },
  /** Bảng kê của nhiều đề nghị (RLS fr_can_view vẫn lọc). */
  linesFor: async (requestIds: string[]) => {
    const out: FrRequestLine[] = [];
    for (let i = 0; i < requestIds.length; i += 200)
      out.push(...await sel<FrRequestLine[]>(db.from("fr_request_lines").select("*").in("request_id", requestIds.slice(i, i + 200))));
    return out;
  },
  profiles: (ids: string[]) =>
    ids.length ? sel<{ id: string; full_name: string | null }[]>(db.from("profiles").select("id,full_name").in("id", ids)) : Promise.resolve([]),
};

