import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Search, Settings2, X } from "lucide-react";
import { BankSettings } from "@/components/finance/BankSettings";
import { RemindButton, autoCount, remindersQuery } from "@/components/finance/RemindButton";
import { reminderConfigQuery } from "@/components/finance/ReminderSettings";
import { fmtWait } from "@/lib/finance/reminder";
import { ManualEntry } from "@/components/finance/ManualEntry";
import { OperationStart } from "@/components/finance/OperationStart";
import { useAuth, useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { confirmationFilter, TX_STATUS, TX_VARIANT, type BankLabel, fmtTime, receiver, safeQ, searchAmount, vnEndExcl, vnStart, vnd } from "@/lib/finance/incoming";

type S = { acc: string; st: string; q: string; from: string; to: string; sale: string; history: string; rem: string };
const str = (v: unknown) => (typeof v === "string" ? v : "");

export const Route = createFileRoute("/finance/incoming/")({
  validateSearch: (s: Record<string, unknown>): Partial<S> => {
    const o: Partial<S> = {};
    for (const k of ["acc", "st", "q", "from", "to", "sale", "history", "rem"] as const) if (str(s[k])) o[k] = str(s[k]);
    return o;
  },
  head: () => ({ meta: [
    { title: "Tiền Về — Tài Chính Kế Toán" },
    { name: "description", content: "Giao dịch tiền vào đồng bộ tự động từ ngân hàng và các khoản nhập thủ công." },
    { property: "og:title", content: "Tiền Về — Tài Chính Kế Toán" },
    { property: "og:description", content: "Giao dịch tiền vào đồng bộ tự động từ ngân hàng và các khoản nhập thủ công." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequirePermission perm={["finance.incoming.view", "finance.incoming.claim", "finance.incoming.reconcile", "finance.incoming.manage", "finance.incoming.manual_view"]}><Incoming /></RequirePermission>,
});

const PAGE = 50;
const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);
const chip = (on: boolean) => `shrink-0 h-9 px-3 rounded-full border text-sm whitespace-nowrap transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"}`;

function Incoming() {
  const sp = Route.useSearch();
  const s: S = { acc: sp.acc ?? "", st: confirmationFilter(sp.st ?? ""), q: sp.q ?? "", from: sp.from ?? "", to: sp.to ?? "", sale: sp.sale ?? "", history: sp.history ?? "", rem: sp.rem === "max" ? "max" : "" };
  const navigate = useNavigate({ from: "/finance/incoming/" });
  const set = (p: Partial<S>) => navigate({ search: (prev: any) => { const n = { ...prev, ...p }; for (const k in n) if (!n[k]) delete n[k]; return n; }, replace: true });
  const [qText, setQText] = useState(s.q);
  useEffect(() => { const h = setTimeout(() => { if (qText !== s.q) set({ q: qText }); }, 350); return () => clearTimeout(h); }, [qText]);
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [s.acc, s.st, s.q, s.from, s.to, s.sale, s.history, s.rem]);

  const [showSettings, setShowSettings] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const { user, can, isSuperAdmin } = useCurrentUser();
  const history = isSuperAdmin && s.history === "test";
  const canBank = can("finance.incoming.bank_config"), canGmf = can("finance.incoming.gmf_config") || can("finance.incoming.manage");
  const canTotals = can("finance.incoming.view_totals");
  const canAll = can("finance.incoming.manage") || can("finance.incoming.reconcile");
  const canManual = can("finance.incoming.manual_view") || canAll || can("finance.incoming.manual_manage") || can("finance.incoming.manual_create");
  const canAdd = can("finance.incoming.manual_create");
  const nav = useNavigate();
  const qc = useQueryClient();
  const users = useAuth((st) => st.users);
  const nameOf = (u: string | null) => (u && users.find((x) => x.id === u)?.fullName) || "—";

  const { data: labels } = useQuery({ queryKey: ["fin_bank_labels"], queryFn: async () => ((await supabase.rpc("fin_bank_labels")).data ?? []) as BankLabel[] });
  const src = s.acc === "cash" || s.acc === "other_account" ? s.acc : "";
  const acc = isUuid(s.acc) ? s.acc : "";
  const amount = searchAmount(s.q);
  const q = amount === null ? safeQ(s.q) : s.q.trim();
  const sale = isUuid(s.sale) ? s.sale : "";
  const fromTs = vnStart(s.from), toTs = vnEndExcl(s.to);
  const filt = { src, acc, q, sale, fromTs, toTs, history };

  const stats = useQuery({
    queryKey: ["bank_transactions", "stats", user?.id, filt, canTotals],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(history ? "fin_incoming_history_stats" : "fin_incoming_stats", { _src: src || undefined, _acc: acc || undefined, _from: fromTs ?? undefined, _to: toTs ?? undefined, _q: q || undefined, _sale: sale || undefined });
      if (error) throw error;
      return data ?? [];
    },
  });
  const count = (st: string) => (stats.data ?? []).filter((r) => !st || r.status === st).reduce((a, r) => a + Number(r.n), 0);
  const sum = (st: string, kind?: string) => (stats.data ?? []).filter((r) => (!st || r.status === st) && (!kind || r.source === kind)).reduce((a, r) => a + Number(r.total ?? 0), 0);

  const { data: rcfg } = useQuery(reminderConfigQuery);
  const maxAuto = rcfg?.max_auto ?? 5;
  const canRemind = can("finance.incoming.remind");
  // Khu tóm tắt cho người xem toàn bộ: chờ lâu nhất + đã nhắc tối đa (đọc qua cùng RLS).
  const summary = useQuery({
    queryKey: ["fin_reminders", "summary", user?.id, maxAuto],
    enabled: canAll && !history,
    queryFn: async () => {
      const [oldest, maxed] = await Promise.all([
        supabase.from("bank_transactions").select("id, amount, transaction_at, created_at").eq("confirmation_status", "unclaimed").is("cancelled_at", null).eq("operation_test", false).gt("amount", 0).order("transaction_at", { ascending: true }).limit(1),
        supabase.from("fin_reminders").select("tx_id, bank_transactions!inner(confirmation_status, cancelled_at)").eq("kind", "auto").eq("seq", maxAuto).neq("status", "failed").eq("bank_transactions.confirmation_status", "unclaimed").is("bank_transactions.cancelled_at", null).limit(500),
      ]);
      return { oldest: oldest.data?.[0] ?? null, maxedIds: [...new Set((maxed.data ?? []).map((r: any) => r.tx_id as string))] };
    },
  });
  const maxedIds = summary.data?.maxedIds ?? [];
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["bank_transactions", "list", user?.id, filt, s.st, limit, s.rem, maxedIds.length],
    queryFn: async () => {
      let x = supabase.from("bank_transactions")
        .select("id, source, bank_account_id, bank_name, transaction_at, transaction_date, amount, description, note, reference_number, confirmation_status, created_at, claimed_by, info_reason")
        .gt("amount", 0).is("cancelled_at", null).eq("operation_test", history);
      if (src) x = x.eq("source", src);
      if (acc) x = x.eq("bank_account_id", acc);
      if (s.st) x = x.eq("confirmation_status", s.st);
      if (sale) x = x.eq("claimed_by", sale);
      if (fromTs) x = x.gte("transaction_at", fromTs);
      if (toTs) x = x.lt("transaction_at", toTs);
      if (s.rem === "max") x = x.in("id", maxedIds.length ? maxedIds : ["00000000-0000-0000-0000-000000000000"]);
      if (amount !== null) x = x.eq("amount", amount);
      else if (q) x = x.or(["description", "reference_number", "note", "customer"].map((c) => `${c}.ilike.*${q}*`).join(","));
      const oldestFirst = s.st === "unclaimed" || s.rem === "max"; // chờ lâu lên đầu
      const { data, error } = await x.order("transaction_at", { ascending: oldestFirst }).order("created_at", { ascending: false }).range(0, limit - 1);
      if (error) throw error;
      return data;
    },
  });
  const rows = data ?? [];
  const { data: rems } = useQuery(remindersQuery(rows.filter((r) => r.confirmation_status === "unclaimed").map((r) => r.id)));
  const now = Date.now();
  const waitInfo = (r: any) => {
    if (r.confirmation_status !== "unclaimed") return null;
    const from = Date.parse(r.transaction_at ?? r.created_at);
    const n = autoCount(rems, r.id);
    return { wait: Number.isFinite(from) ? fmtWait(Math.max(0, Math.floor((now - from) / 60000))) : "", n, label: n >= maxAuto ? `Đã nhắc tối đa ${maxAuto} lần` : n ? `Đã nhắc ${n}/${maxAuto}` : "Chờ xác nhận" };
  };
  const total = count(s.st);
  const active = (labels ?? []).filter((l) => l.active), inactive = (labels ?? []).filter((l) => !l.active);
  const saleUsers = useMemo(() => [...users].filter((u) => u.fullName).sort((a, b) => a.fullName.localeCompare(b.fullName)), [users]);
  const hasFilter = !!(s.q || s.from || s.to || s.sale);
  const open = (id: string) => nav({ to: "/finance/incoming/$id", params: { id } });
  const who = (r: { claimed_by: string | null }) => nameOf(r.claimed_by);

  return (
    <div>
      <PageHeader
        title={history ? "Tiền Về — Lịch sử kiểm thử" : "Tiền Về"}
        description="Giao dịch tiền vào đồng bộ tự động từ ngân hàng và khoản Kế toán nhập thủ công."
        actions={<>
          {isSuperAdmin && <OperationStart userId={user?.id} />}
          {canAdd && !history && <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" />Thêm khoản tiền</Button>}
           {(canBank || canGmf || isSuperAdmin) && <Button variant="outline" onClick={() => setShowSettings(true)}><Settings2 className="h-4 w-4 mr-2" />Cài đặt</Button>}
          <Button variant="outline" size="icon" aria-label="Làm mới" onClick={() => { refetch(); stats.refetch(); }} disabled={isFetching}><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /></Button>
        </>}
      />
       {(canBank || canGmf || isSuperAdmin) && <BankSettings open={showSettings} onOpenChange={setShowSettings} canBank={canBank} canGmf={canGmf} onResetDone={() => { setQText(""); set({ history: "", acc: "", st: "", q: "", from: "", to: "", sale: "", rem: "" }); }} />}
      {canAdd && <ManualEntry open={showAdd} onOpenChange={setShowAdd} canReconcile={can("finance.incoming.reconcile")} onDone={(id) => { qc.invalidateQueries({ queryKey: ["bank_transactions"] }); if (id) open(id); }} />}

      {/* Tầng 1: tài khoản nhận / nguồn tiền */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto mb-2">
        <div className="flex gap-2 pb-1">
          <button className={chip(!s.acc)} onClick={() => set({ acc: "" })}>Tất cả tài khoản</button>
          {active.map((l) => <button key={l.id} className={chip(s.acc === l.id)} onClick={() => set({ acc: l.id })} title={`${l.bank_name} · ****${l.last4}`}>{l.label}</button>)}
          {canManual && <>
            <button className={chip(s.acc === "cash")} onClick={() => set({ acc: "cash" })}>Tiền mặt</button>
            <button className={chip(s.acc === "other_account")} onClick={() => set({ acc: "other_account" })}>TK khác</button>
          </>}
          {inactive.map((l) => <button key={l.id} className={`${chip(s.acc === l.id)} opacity-70`} onClick={() => set({ acc: l.id })}>{l.label} · ngừng</button>)}
        </div>
      </div>

      {canAll && !history && stats.data && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button className="rounded-xl border bg-card p-2.5 sm:p-3 text-left hover:bg-accent" onClick={() => set({ st: "unclaimed", rem: "" })}>
            <div className="text-xs text-muted-foreground">Đang chờ xác nhận</div><div className="text-xl font-bold text-primary">{count("unclaimed")}</div>
          </button>
          <button className="rounded-xl border bg-card p-3 text-left hover:bg-accent disabled:opacity-60" disabled={!summary.data?.oldest} onClick={() => summary.data?.oldest && open(summary.data.oldest.id)}>
            <div className="text-xs text-muted-foreground">Chờ lâu nhất</div>
            <div className="text-xs sm:text-sm font-semibold">{summary.data?.oldest ? `${vnd(Number(summary.data.oldest.amount))} · ${fmtWait(Math.max(0, Math.floor((now - Date.parse(summary.data.oldest.transaction_at ?? summary.data.oldest.created_at)) / 60000)))}` : "—"}</div>
          </button>
          <button className={`rounded-xl border p-3 text-left hover:bg-accent ${s.rem === "max" ? "border-primary bg-primary/5" : "bg-card"}`} onClick={() => set({ rem: s.rem === "max" ? "" : "max", st: "" })}>
            <div className="text-xs text-muted-foreground">Đã nhắc tối đa {maxAuto} lần</div><div className="text-xl font-bold text-warning">{maxedIds.length}</div>
          </button>
        </div>
      )}
      {s.rem === "max" && <div className="mb-2 text-sm">Đang xem khoản đã nhắc tối đa <Button variant="link" size="sm" className="px-1" onClick={() => set({ rem: "" })}>Bỏ lọc</Button></div>}

      {/* Tầng 2: trạng thái, số đếm theo tài khoản + bộ lọc */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto mb-3">
        <div className="flex gap-1 border-b">
          {[["", "Tất cả"], ...Object.entries(TX_STATUS)].map(([k, v]) => (
            <button key={k} onClick={() => set({ st: k })} className={`shrink-0 px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${s.st === k ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"}`}>
              {v} <span className="ml-1 rounded bg-muted px-1.5 text-xs">{stats.data ? count(k) : "…"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Tìm số tiền, nội dung CK, mã GD, ghi chú..." value={qText} onChange={(e) => setQText(e.target.value)} />
        </div>
        <Input type="date" className="w-auto" value={s.from} onChange={(e) => set({ from: e.target.value })} aria-label="Từ ngày" />
        <Input type="date" className="w-auto" value={s.to} onChange={(e) => set({ to: e.target.value })} aria-label="Đến ngày" />
        {canAll && <select className="h-9 rounded-md border border-input bg-background px-2 text-sm max-w-[180px]" value={s.sale} onChange={(e) => set({ sale: e.target.value })} aria-label="Sale xác nhận">
          <option value="">Sale xác nhận: tất cả</option>
          {saleUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
        </select>}
        {hasFilter && <Button variant="ghost" size="sm" onClick={() => { setQText(""); set({ q: "", from: "", to: "", sale: "" }); }}><X className="h-4 w-4 mr-1" />Xóa lọc</Button>}
      </div>
      <div className="text-sm text-muted-foreground mb-3">
        {stats.error ? <span className="text-destructive">Không tải được số đếm và tổng tiền.</span> : <>
          {stats.data ? total : "…"} giao dịch · {canTotals ? "Tổng" : "Tổng của tôi"} <b className="text-foreground">{stats.data ? vnd(sum(s.st)) : "…"}</b>
          {canTotals && sum(s.st, "manual") > 0 && <> (ngân hàng {vnd(sum(s.st, "bank"))} · thủ công {vnd(sum(s.st, "manual"))})</>}
        </>}
      </div>

      <div className="md:hidden space-y-2">
        {isLoading ? <div className="py-8 text-center text-muted-foreground">Đang tải dữ liệu…</div>
          : error ? <div className="py-8 text-center text-destructive">Không tải được danh sách.</div>
          : rows.length === 0 ? <div className="py-8 text-center text-muted-foreground">Không có giao dịch phù hợp.</div>
          : rows.map((r) => { const rc = receiver(r, labels); return (
            <div key={r.id} role="button" tabIndex={0} onClick={() => open(r.id)} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(r.id); } }} className="w-full text-left rounded-lg border bg-card p-3 active:bg-accent cursor-pointer">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl font-bold text-primary">{vnd(Number(r.amount))}</span>
                <Badge variant={TX_VARIANT[r.confirmation_status] ?? "secondary"}>{TX_STATUS[r.confirmation_status] ?? r.confirmation_status}</Badge>
              </div>
              <div className="mt-1 text-sm font-semibold uppercase">{rc.main}</div>
              <div className="text-sm mt-0.5 line-clamp-2 text-muted-foreground">{(r.source === "bank" ? r.description : r.description || r.note) || "—"}</div>
              <div className="text-xs text-muted-foreground mt-1">{fmtTime(r.transaction_at, r.transaction_date)}{who(r) !== "—" ? ` · ${who(r)}` : ""}</div>
              {(() => { const w = waitInfo(r); return w && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="text-xs"><span className={w.n >= maxAuto ? "text-warning font-medium" : "font-medium"}>{w.label}</span>{w.wait && <span className="text-muted-foreground"> · chờ {w.wait}</span>}</div>
                  {canRemind && <RemindButton txId={r.id} className="h-10" />}
                </div>
              ); })()}
            </div>
          ); })}
      </div>
      <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>{["Thời gian", "TK nhận / nguồn", "Số tiền", "Nội dung CK / ghi chú", "Sale xác nhận", "Trạng thái"].map((h) => <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Đang tải dữ liệu…</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-destructive">Không tải được danh sách. Vui lòng thử lại.</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Không có giao dịch phù hợp.</td></tr>
            ) : rows.map((r) => { const rc = receiver(r, labels); return (
              <tr key={r.id} className="border-t cursor-pointer hover:bg-accent/50" onClick={() => open(r.id)}>
                <td className="px-3 py-2 whitespace-nowrap">{fmtTime(r.transaction_at, r.transaction_date)}</td>
                <td className="px-3 py-2"><div className="font-semibold uppercase">{rc.main}</div>{rc.sub && <div className="text-xs text-muted-foreground">{rc.sub}</div>}</td>
                <td className="px-3 py-2 font-medium text-primary whitespace-nowrap">{vnd(Number(r.amount))}</td>
                <td className="px-3 py-2 min-w-[220px]"><div className="line-clamp-2 break-words">{(r.source === "bank" ? r.description : r.description || r.note) || "—"}</div></td>
                <td className="px-3 py-2 whitespace-nowrap">{who(r)}</td>
                <td className="px-3 py-2 min-w-[150px]"><Badge className="whitespace-nowrap" variant={TX_VARIANT[r.confirmation_status] ?? "secondary"}>{TX_STATUS[r.confirmation_status] ?? r.confirmation_status}</Badge>{r.info_reason && <div className="text-xs text-destructive mt-0.5">Cần chỉnh sửa</div>}
                  {(() => { const w = waitInfo(r); return w && (
                    <div className="mt-1 space-y-1 text-xs whitespace-nowrap">
                      <div className={w.n >= maxAuto ? "text-warning font-medium" : "font-medium"}>{w.label}</div>
                      {w.wait && <div className="text-muted-foreground">chờ {w.wait}</div>}
                      {canRemind && <RemindButton txId={r.id} className="h-8 px-2" />}
                    </div>); })()}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      {rows.length < total && rows.length >= limit && (
        <div className="mt-3 text-center"><Button variant="outline" disabled={isFetching} onClick={() => setLimit(limit + PAGE)}>Tải thêm ({rows.length}/{total})</Button></div>
      )}
    </div>
  );
}
