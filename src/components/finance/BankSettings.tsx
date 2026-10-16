import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TYPES: Record<string, string> = { personal: "Cá nhân", household: "Hộ kinh doanh", company: "Công ty" };
type Acc = { id: string; bank_name: string; account_number: string; label: string | null; account_type: string; active: boolean };
const EMPTY = { id: "", bank_name: "", account_number: "", label: "", account_type: "personal" };

export function BankSettings({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["bank_accounts"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("bank_accounts").select("id, bank_name, account_number, label, account_type, active").order("created_at");
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

  const toggle = async (a: Acc) => {
    const { error } = await supabase.from("bank_accounts").update({ active: !a.active }).eq("id", a.id);
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
                <span className="text-xs text-muted-foreground">{a.active ? "Bật" : "Tạm ngừng"}</span>
                <Switch checked={a.active} onCheckedChange={() => toggle(a)} />
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
      </DialogContent>
    </Dialog>
  );
}
