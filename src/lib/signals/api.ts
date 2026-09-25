import { supabase } from "@/integrations/supabase/client";
import type { Signal, SignalStatus } from "./catalog";

const db = supabase as any;

export async function listSignals(): Promise<Signal[]> {
  const { data, error } = await db.from("opportunity_signals").select("*").order("detected_on", { ascending: false }).order("created_at", { ascending: false }).limit(2000);
  if (error) throw error;
  return data as Signal[];
}

export interface SignalInput {
  detected_on: string; customer_name: string; phone: string; address: string | null;
  need_detail: string | null; products: string[]; need_group: string | null; source: string; marketing_note: string | null;
}

export async function createSignal(input: SignalInput, userId: string): Promise<Signal> {
  const { data, error } = await db.from("opportunity_signals").insert({ ...input, created_by: userId }).select("*").single();
  if (error) throw error;
  return data as Signal;
}

export async function updateSignalInfo(id: string, input: SignalInput) {
  const { error } = await db.from("opportunity_signals").update(input).eq("id", id);
  if (error) throw error;
}

export async function assignSignal(id: string, userId: string | null) {
  const { error } = await db.rpc("signal_assign", { _id: id, _user: userId });
  if (error) throw error;
}

export async function saleUpdate(id: string, p: { status: SignalStatus; note: string; next: string | null; revenue: number | null; lostReason: string | null }) {
  const { error } = await db.rpc("signal_sale_update", { _id: id, _status: p.status, _note: p.note, _next: p.next, _revenue: p.revenue, _lost_reason: p.lostReason });
  if (error) throw error;
}

export async function reopenSignal(id: string, reason: string) {
  const { error } = await db.rpc("signal_reopen", { _id: id, _reason: reason });
  if (error) throw error;
}

export async function deleteSignal(id: string) {
  const { error } = await db.from("opportunity_signals").delete().eq("id", id);
  if (error) throw error;
}

export interface SignalNote { id: string; author_id: string; note: string | null; status_from: string | null; status_to: string | null; next_contact_on: string | null; revenue: number | null; lost_reason: string | null; created_at: string }
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

export const errMsg = (e: any) => e?.message || "Có lỗi xảy ra";
