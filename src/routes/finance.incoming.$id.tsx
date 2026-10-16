import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_LABEL, MONEY_TYPES, TX_STATUS, TX_VARIANT, fmtTime, vnd } from "@/lib/finance/incoming";

export const Route = createFileRoute("/finance/incoming/$id")({
  head: () => ({ meta: [
    { title: "Chi tiết giao dịch — Tiền Về" },
    { name: "description", content: "Xác nhận và đối soát giao dịch tiền vào." },
    { property: "og:title", content: "Chi tiết giao dịch — Tiền Về" },
    { property: "og:description", content: "Xác nhận và đối soát giao dịch tiền vào." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequirePermission perm={["finance.incoming.view", "finance.incoming.claim", "finance.incoming.reconcile", "finance.incoming.manage"]}><Detail /></RequirePermission>,
});

const field = "text-base md:text-sm";

function Detail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { user, can } = useCurrentUser();
  const users = useAuth((s) => s.users);
  const nameOf = (u: string | null) => (u && users.find((x) => x.id === u)?.fullName) || "—";
  const canClaim = can("finance.incoming.claim");
  const canRec = can("finance.incoming.reconcile");
  const canManage = can("finance.incoming.manage");

  const { data: t, isLoading, refetch } = useQuery({
    queryKey: ["bank_tx", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("bank_transactions").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: labels } = useQuery({ queryKey: ["fin_bank_labels"], queryFn: async () => (await supabase.rpc("fin_bank_labels")).data ?? [] });
  const { data: events } = useQuery({
    queryKey: ["bank_tx_events", id],
    queryFn: async () => (await supabase.from("bank_transaction_events").select("id, actor_id, action, reason, created_at").eq("tx_id", id).order("created_at")).data ?? [],
  });

  const [f, setF] = useState({ customer: "", type: "", ref: "", note: "" });
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (t) setF({ customer: t.customer ?? "", type: t.money_type ?? "", ref: t.ref_code ?? "", note: t.note ?? "" }); }, [t?.id, t?.status]);

  if (isLoading) return <div className="py-16 text-center text-muted-foreground">Đang tải…</div>;
  if (!t) return <div className="py-16 text-center text-muted-foreground">Không tìm thấy giao dịch hoặc bạn không có quyền xem.</div>;

  const bank = labels?.find((l: any) => l.id === t.bank_account_id)?.label;
  const mine = t.claimed_by === user?.id;
  const saleEditable = canClaim && ((t.status === "unclaimed" && !t.claimed_by) || (mine && ["pending_reconciliation", "needs_info"].includes(t.status)));
  const accSelf = canRec && t.status === "unclaimed" && !t.claimed_by;
  const showForm = saleEditable || accSelf;

  const done = async (p: PromiseLike<{ error: any }>, ok: string) => {
    if (busy) return;
    setBusy(true);
    const { error } = await p;
    setBusy(false);
    if (error) { toast.error(error.message || "Không thực hiện được"); refetch(); return; }
    toast.success(ok);
    setReason("");
    qc.invalidateQueries({ queryKey: ["bank_transactions"] });
    qc.invalidateQueries({ queryKey: ["bank_tx_events", id] });
    refetch();
  };
  const check = () => {
    if (!f.customer.trim()) return toast.error("Vui lòng nhập Khách hàng"), false;
    if (!f.type) return toast.error("Vui lòng chọn Loại tiền"), false;
    if (!f.note.trim()) return toast.error("Vui lòng nhập Ghi chú chi tiết"), false;
    return true;
  };
  const args = { _tx: id, _customer: f.customer, _type: f.type, _ref: f.ref, _note: f.note };

  return (
    <div className="max-w-2xl mx-auto pb-28 md:pb-6">
      <Link to="/finance/incoming" className="inline-flex items-center text-sm text-muted-foreground mb-3"><ArrowLeft className="h-4 w-4 mr-1" />Tiền Về</Link>
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="text-3xl font-bold text-primary">{vnd(Number(t.amount))}</div>
          <Badge variant={TX_VARIANT[t.status] ?? "secondary"}>{TX_STATUS[t.status] ?? t.status}</Badge>
        </div>
        <div className="text-base">{t.description || "—"}</div>
        <div className="text-sm text-muted-foreground grid grid-cols-[110px_1fr] gap-y-1">
          <span>Ngân hàng</span><span>{bank || t.bank_name || "—"}</span>
          <span>Thời gian</span><span>{fmtTime(t.transaction_at, t.transaction_date)}</span>
          <span>Mã giao dịch</span><span className="break-all">{t.reference_number || "—"}</span>
        </div>
      </div>

      {t.status === "needs_info" && t.info_reason && (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"><b>Kế toán yêu cầu bổ sung:</b> {t.info_reason}</div>
      )}

      {t.claimed_by || t.customer ? (
        <div className="mt-3 rounded-lg border bg-card p-4 text-sm grid grid-cols-[130px_1fr] gap-y-1.5">
          <span className="text-muted-foreground">Sale xác nhận</span><span>{nameOf(t.claimed_by)}{t.claimed_at ? ` · ${fmtTime(t.claimed_at)}` : ""}</span>
          <span className="text-muted-foreground">Khách hàng</span><span>{t.customer || "—"}</span>
          <span className="text-muted-foreground">Loại tiền</span><span>{MONEY_TYPES[t.money_type ?? ""] ?? "—"}</span>
          <span className="text-muted-foreground">Mã đơn / tham chiếu</span><span>{t.ref_code || "—"}</span>
          <span className="text-muted-foreground">Ghi chú</span><span className="whitespace-pre-wrap">{t.note || "—"}</span>
          {t.reconciled_by && <><span className="text-muted-foreground">Đối soát</span><span>{nameOf(t.reconciled_by)} · {fmtTime(t.reconciled_at)}</span></>}
        </div>
      ) : null}

      {showForm && (
        <div className="mt-4 rounded-lg border bg-card p-4 space-y-4">
          <div className="font-medium">{accSelf && !canClaim ? "Kế toán tự ghi chú & đối soát" : "Xác nhận tiền về"}</div>
          <div className="space-y-1.5"><Label>Khách hàng *</Label><Input className={`h-11 ${field}`} value={f.customer} maxLength={200} placeholder="Tên khách hàng hoặc công ty" onChange={(e) => setF({ ...f, customer: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Loại tiền *</Label>
            <select className={`h-11 w-full rounded-md border border-input bg-background px-3 ${field}`} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              <option value="">— Chọn loại tiền —</option>
              {Object.entries(MONEY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-1.5"><Label>Mã đơn / Mã tham chiếu</Label><Input className={`h-11 ${field}`} value={f.ref} maxLength={100} placeholder="Có thể bỏ trống" onChange={(e) => setF({ ...f, ref: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Ghi chú chi tiết *</Label><Textarea className={`min-h-28 ${field}`} value={f.note} maxLength={2000} placeholder="VD: Khách Công ty ABC cọc 50 bộ ly sứ in logo, Sale Nguyễn A phụ trách." onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
          <div className="fixed md:static bottom-0 inset-x-0 p-3 md:p-0 bg-background border-t md:border-0 flex flex-col md:flex-row gap-2 z-20">
            {saleEditable && <Button className="h-12 md:h-10 w-full md:w-auto" disabled={busy} onClick={() => check() && done(supabase.rpc("fin_claim", args), "Đã gửi Kế toán đối soát")}>{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Xác nhận & gửi Kế toán</Button>}
            {accSelf && <Button variant={saleEditable ? "outline" : "default"} className="h-12 md:h-10 w-full md:w-auto" disabled={busy} onClick={() => check() && done(supabase.rpc("fin_reconcile", args), "Đã đối soát")}>Ghi chú & đối soát luôn</Button>}
          </div>
        </div>
      )}

      {canRec && t.status === "pending_reconciliation" && (
        <div className="mt-4 rounded-lg border bg-card p-4 space-y-3">
          <div className="font-medium">Kế toán đối soát</div>
          <Button className="h-11 w-full md:w-auto" disabled={busy} onClick={() => done(supabase.rpc("fin_reconcile", { _tx: id }), "Đã đối soát")}>Xác nhận đối soát</Button>
          <div className="space-y-1.5 pt-2 border-t"><Label>Lý do yêu cầu bổ sung</Label><Textarea className={field} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          <Button variant="outline" disabled={busy || !reason.trim()} onClick={() => done(supabase.rpc("fin_request_info", { _tx: id, _reason: reason }), "Đã yêu cầu bổ sung")}>Yêu cầu bổ sung</Button>
        </div>
      )}

      {(canRec || canManage) && t.claimed_by && (t.status !== "reconciled" || canManage) && (
        <details className="mt-4 rounded-lg border bg-card p-4">
          <summary className="cursor-pointer text-sm font-medium">Điều chỉnh nhận nhầm</summary>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">Gỡ Sale đã nhận và đưa giao dịch về “Chưa xác nhận”. Thao tác được lưu lịch sử.</p>
            <Textarea className={field} placeholder="Lý do điều chỉnh" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button variant="destructive" disabled={busy || !reason.trim()} onClick={() => done(supabase.rpc("fin_reset", { _tx: id, _reason: reason }), "Đã đưa về chưa xác nhận")}>Đưa về chưa xác nhận</Button>
          </div>
        </details>
      )}

      <div className="mt-4 rounded-lg border bg-card p-4">
        <div className="font-medium mb-2 text-sm">Lịch sử xử lý</div>
        {!events?.length ? <div className="text-sm text-muted-foreground">Chưa có thao tác.</div> : (
          <ul className="space-y-1.5 text-sm">
            {events.map((e: any) => <li key={e.id}><span className="text-muted-foreground">{fmtTime(e.created_at)}</span> · {EVENT_LABEL[e.action] ?? e.action} — {nameOf(e.actor_id)}{e.reason ? `: ${e.reason}` : ""}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
