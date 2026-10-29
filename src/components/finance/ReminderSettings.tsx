import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_REMINDER } from "@/lib/finance/reminder";
import { FIN_PERM_CATEGORIES } from "@/lib/leave/permCategories";
import { RolePermissionMatrix } from "@/components/leave/FunctionSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const DAYS = [[1, "T2"], [2, "T3"], [3, "T4"], [4, "T5"], [5, "T6"], [6, "T7"], [0, "CN"]] as const;

export const reminderConfigQuery = {
  queryKey: ["fin_reminder_config"],
  queryFn: async () => {
    const { data } = await supabase.from("fin_reminder_config").select("enabled, interval_min, start_hour, end_hour, workdays, max_auto").eq("id", 1).maybeSingle();
    return data ?? DEFAULT_REMINDER;
  },
};

export function ReminderSettings({ groupName }: { groupName?: string }) {
  const qc = useQueryClient();
  const { data } = useQuery(reminderConfigQuery);
  const [f, setF] = useState(DEFAULT_REMINDER);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setF(data as any); }, [data]);
  const num = (k: "interval_min" | "start_hour" | "end_hour" | "max_auto") => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: Number(e.target.value) });
  const err = f.interval_min < 5 || f.interval_min > 240 ? "Chu kỳ từ 5 đến 240 phút"
    : f.start_hour < 0 || f.end_hour > 24 || f.end_hour <= f.start_hour ? "Giờ kết thúc phải sau giờ bắt đầu"
    : f.max_auto < 1 || f.max_auto > 10 ? "Số lần nhắc từ 1 đến 10" : !f.workdays.length ? "Chọn ít nhất một ngày" : "";
  const save = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("fin_reminder_config_save", { _enabled: f.enabled, _interval: f.interval_min, _start: f.start_hour, _end: f.end_hour, _days: f.workdays, _max: f.max_auto });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Đã lưu cài đặt nhắc nhở");
    qc.invalidateQueries({ queryKey: ["fin_reminder_config"] });
  };
  return (
    <section className="border-t pt-4 space-y-3">
      <h3 className="font-medium">Nhắc nhở xác nhận</h3>
      <label className="flex items-center gap-2 text-sm"><Switch checked={f.enabled} onCheckedChange={(v) => setF({ ...f, enabled: v })} />Tự động nhắc khoản chưa xác nhận vào nhóm{groupName ? ` “${groupName}”` : " Tiền Về"}</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div><Label>Chu kỳ (phút)</Label><Input type="number" min={5} max={240} value={f.interval_min} onChange={num("interval_min")} /></div>
        <div><Label>Từ giờ</Label><Input type="number" min={0} max={23} value={f.start_hour} onChange={num("start_hour")} /></div>
        <div><Label>Đến giờ</Label><Input type="number" min={1} max={24} value={f.end_hour} onChange={num("end_hour")} /></div>
        <div><Label>Tối đa (lần)</Label><Input type="number" min={1} max={10} value={f.max_auto} onChange={num("max_auto")} /></div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DAYS.map(([d, l]) => { const on = f.workdays.includes(d); return (
          <button key={d} type="button" onClick={() => setF({ ...f, workdays: on ? f.workdays.filter((x) => x !== d) : [...f.workdays, d] })}
            className={`h-9 min-w-11 px-3 rounded-full border text-sm ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>{l}</button>
        ); })}
      </div>
      <p className="text-xs text-muted-foreground">Giờ Việt Nam. Chỉ tính thời gian làm việc; thông báo gốc không tính là lượt nhắc. Nhắc thủ công không giới hạn khung giờ và không tính vào số lần tự động.</p>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button size="sm" disabled={busy || !!err} onClick={save}>Lưu nhắc nhở</Button>
    </section>
  );
}

export function FinancePermissions() {
  return <div className="border-t pt-4"><RolePermissionMatrix categories={FIN_PERM_CATEGORIES} personal={[]} /></div>;
}
