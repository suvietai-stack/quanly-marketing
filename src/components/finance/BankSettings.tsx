import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { gmfStatus, gmfListGroups, gmfSave, gmfSendTest, gmfRetry } from "@/lib/finance/gmf.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TYPES: Record<string, string> = { personal: "Cá nhân", household: "Hộ kinh doanh", company: "Công ty" };
type Acc = { id: string; bank_name: string; account_number: string; label: string | null; account_type: string; active: boolean; share_sale: boolean; gmf_notify: boolean };
const EMPTY = { id: "", bank_name: "", account_number: "", label: "", account_type: "personal" };

export function BankSettings({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["bank_accounts"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("bank_accounts").select("id, bank_name, account_number, label, account_type, active, share_sale, gmf_notify").order("created_at");
      if (error) throw error;
      return data as Acc[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["bank_accounts"] });

  const save = async () => {
    const no = f.account_number.replace(/\D/g, "");
    if (!f.bank_name.trim() || no.length < 4) return toast.error("Nhập ngân hàng và số tài khoản hợp lệ.");
    setSaving(true);
    const row = { bank_name: f.bank_name.trim(), account_number: no, label: f.label.trim() || null, account_type: f.account_type };
    const { error } = f.id
      ? await supabase.from("bank_accounts").update(row).eq("id", f.id)
      : await supabase.from("bank_accounts").insert(row);
    setSaving(false);
    if (error) return toast.error(error.code === "23505" ? "Số tài khoản đã tồn tại." : "Không lưu được. Vui lòng thử lại.");
    toast.success("Đã lưu tài khoản.");
    setF(EMPTY);
    refresh();
  };

  const toggle = async (a: Acc, k: "active" | "share_sale" | "gmf_notify" = "active") => {
    const { error } = await supabase.from("bank_accounts").update({ [k]: !a[k] }).eq("id", a.id);
    if (error) toast.error("Không cập nhật được.");
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Cài đặt ngân hàng</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Chỉ giao dịch của tài khoản đã đăng ký và đang bật mới được ghi nhận vào Tiền Về.</p>
        <div className="space-y-2">
          {isLoading ? <div className="text-sm text-muted-foreground">Đang tải…</div>
            : !data?.length ? <div className="text-sm text-muted-foreground">Chưa có tài khoản nào.</div>
            : data.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-md border p-2.5 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.label || a.bank_name} <span className="text-muted-foreground font-normal">· {TYPES[a.account_type]}</span></div>
                  <div className="text-muted-foreground">{a.bank_name} · ****{a.account_number.slice(-4)}</div>
                </div>
                <label className="flex flex-col items-center text-[11px] text-muted-foreground gap-1">{a.active ? "Bật" : "Tạm ngừng"}<Switch checked={a.active} onCheckedChange={() => toggle(a)} /></label>
                <label className="flex flex-col items-center text-[11px] text-muted-foreground gap-1">Sale xem<Switch checked={a.share_sale} onCheckedChange={() => toggle(a, "share_sale")} /></label>
                <label className="flex flex-col items-center text-[11px] text-muted-foreground gap-1">Báo GMF<Switch checked={a.gmf_notify} onCheckedChange={() => toggle(a, "gmf_notify")} /></label>
                <Button size="sm" variant="ghost" onClick={() => setF({ id: a.id, bank_name: a.bank_name, account_number: a.account_number, label: a.label ?? "", account_type: a.account_type })}>Sửa</Button>
              </div>
            ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-4">
          <div><Label>Ngân hàng *</Label><Input value={f.bank_name} placeholder="VietinBank" onChange={(e) => setF({ ...f, bank_name: e.target.value })} /></div>
          <div><Label>Số tài khoản *</Label><Input value={f.account_number} inputMode="numeric" onChange={(e) => setF({ ...f, account_number: e.target.value })} /></div>
          <div><Label>Tên gợi nhớ</Label><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></div>
          <div><Label>Loại tài khoản</Label>
            <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={f.account_type} onChange={(e) => setF({ ...f, account_type: e.target.value })}>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            {f.id && <Button variant="ghost" onClick={() => setF(EMPTY)}>Hủy sửa</Button>}
            <Button onClick={save} disabled={saving}>{f.id ? "Lưu thay đổi" : "Thêm tài khoản"}</Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">“Sale xem”: cho Sale thấy giao dịch của tài khoản này để xác nhận. “Báo GMF”: Bật thông báo tiền về cho nhóm GMF. Cả hai mặc định tắt.</p>
        <GmfSettings enabled={open} />
      </DialogContent>
    </Dialog>
  );
}

function GmfSettings({ enabled }: { enabled: boolean }) {
  const status = useServerFn(gmfStatus), list = useServerFn(gmfListGroups), save = useServerFn(gmfSave), test = useServerFn(gmfSendTest), retry = useServerFn(gmfRetry);
  const [s, setS] = useState<any>(null);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [g, setG] = useState({ groupId: "", groupName: "", enabled: false });
  const [busy, setBusy] = useState(false);
  const load = () => status().then((r) => { setS(r); setG({ groupId: r.groupId, groupName: r.groupName, enabled: r.enabled }); }).catch((e) => setS({ error: e.message }));
  useEffect(() => { if (enabled) load(); }, [enabled]);
  const run = async (fn: () => Promise<any>) => { setBusy(true); try { const r = await fn(); if (r?.message) (r.ok === false ? toast.error : toast.success)(r.message); } catch (e: any) { toast.error(e.message); } setBusy(false); load(); };
  if (!s) return null;
  if (s.error) return <p className="text-sm text-muted-foreground border-t pt-4">{s.error}</p>;
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="font-medium">Cài đặt Zalo GMF</div>
      <p className="text-sm text-muted-foreground">{s.oaConnected ? `Zalo OA: ${s.oaName ?? "đã kết nối"}` : "Zalo OA chưa kết nối — kết nối trong Cài đặt → Zalo OA trước."} Link nhóm (zalo.me/g/…) không dùng thay cho mã nhóm; bấm “Lấy danh sách nhóm” để lấy mã nhóm từ Zalo.</p>
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" variant="outline" disabled={busy || !s.oaConnected} onClick={() => run(async () => { const r = await list(); setGroups(r.groups); return r.ok ? { ok: true, message: `Tìm thấy ${r.groups.length} nhóm` } : r; })}>Lấy danh sách nhóm</Button>
        {groups.length > 0 && (
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={g.groupId} onChange={(e) => setG({ ...g, groupId: e.target.value, groupName: groups.find((x) => x.id === e.target.value)?.name ?? "" })}>
            <option value="">— Chọn nhóm —</option>
            {groups.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        )}
        {!groups.length && g.groupId && <span className="text-sm">Nhóm: {g.groupName || g.groupId}</span>}
      </div>
      <label className="flex items-center gap-2 text-sm"><Switch checked={g.enabled} onCheckedChange={(v) => setG({ ...g, enabled: v })} />Gửi thông báo tiền về vào nhóm</label>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => run(() => save({ data: g }))}>Lưu</Button>
        <Button size="sm" variant="outline" disabled={busy || !s.groupId} onClick={() => run(() => test())}>Gửi thử (không chứa dữ liệu thật)</Button>
        {s.failed > 0 && <Button size="sm" variant="outline" disabled={busy} onClick={() => run(async () => { const r = await retry(); return { ok: !r.failed, message: `Gửi lại: ${r.sent} thành công, ${r.failed} lỗi${r.message ? ` (${r.message})` : ""}` }; })}>Gửi lại {s.failed} thông báo lỗi</Button>}
      </div>
    </div>
  );
}
