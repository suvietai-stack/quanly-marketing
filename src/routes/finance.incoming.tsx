import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search, Settings2 } from "lucide-react";
import { BankSettings } from "@/components/finance/BankSettings";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/finance/incoming")({
  head: () => ({ meta: [
    { title: "Tiền Về — Tài Chính Kế Toán" },
    { name: "description", content: "Giao dịch tiền vào đồng bộ tự động từ ngân hàng." },
    { property: "og:title", content: "Tiền Về — Tài Chính Kế Toán" },
    { property: "og:description", content: "Giao dịch tiền vào đồng bộ tự động từ ngân hàng." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequirePermission perm="finance.incoming.view"><Incoming /></RequirePermission>,
});

const STATUS: Record<string, string> = { unclaimed: "Chưa xác nhận" };
const vnd = (n: number) => "+" + n.toLocaleString("vi-VN") + "đ";
const fmt = (iso: string | null, raw: string | null) =>
  iso ? new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : raw || "—";
const dayKey = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(iso)) : "";

function Incoming() {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [bank, setBank] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const { isSuperAdmin, user } = useCurrentUser();
  const isAdmin = isSuperAdmin || user?.roleId === "role-admin";
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["bank_transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select("id, bank_name, transaction_at, transaction_date, amount, description, reference_number, status, created_at")
        .gt("amount", 0)
        .order("transaction_at", { ascending: false, nullsFirst: false })
        .limit(1000);
      if (error) throw error;
      return data;
    },
  });
  const banks = useMemo(() => [...new Set((data ?? []).map((r) => r.bank_name).filter(Boolean))] as string[], [data]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      const k = dayKey(r.transaction_at ?? r.created_at);
      if (from && k < from) return false;
      if (to && k > to) return false;
      if (bank && r.bank_name !== bank) return false;
      if (s && !`${r.description ?? ""} ${r.reference_number ?? ""}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [data, q, from, to, bank]);

  return (
    <div>
      <PageHeader
        title="Tiền Về"
        description="Quản lý các giao dịch tiền vào được đồng bộ tự động từ ngân hàng."
        actions={<>{isAdmin && <Button variant="outline" onClick={() => setShowSettings(true)}><Settings2 className="h-4 w-4 mr-2" />Cài đặt ngân hàng</Button>}<Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />Làm mới</Button></>}
      />
      {isAdmin && <BankSettings open={showSettings} onOpenChange={setShowSettings} />}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Tìm nội dung CK hoặc mã giao dịch" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Input type="date" className="w-auto" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Từ ngày" />
        <Input type="date" className="w-auto" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Đến ngày" />
        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={bank} onChange={(e) => setBank(e.target.value)}>
          <option value="">Tất cả ngân hàng</option>
          {banks.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{rows.length} giao dịch</span>
      </div>
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>{["Thời gian", "Ngân hàng", "Số tiền", "Nội dung CK", "Mã giao dịch", "Trạng thái"].map((h) => <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Đang tải dữ liệu…</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-destructive">Không tải được danh sách. Vui lòng thử lại.</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Chưa có giao dịch tiền vào.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">{fmt(r.transaction_at, r.transaction_date)}</td>
                <td className="px-3 py-2">{r.bank_name || "—"}</td>
                <td className="px-3 py-2 font-medium text-primary whitespace-nowrap">{vnd(Number(r.amount))}</td>
                <td className="px-3 py-2 min-w-[240px]">{r.description || "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.reference_number || "—"}</td>
                <td className="px-3 py-2"><Badge variant="secondary">{STATUS[r.status] ?? r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
