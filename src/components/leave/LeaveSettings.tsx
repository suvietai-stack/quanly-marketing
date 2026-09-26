import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOW_LABEL, fmtDate, type LeaveSettings as S } from "@/lib/leave/calc";
import * as api from "@/lib/leave/api";

const norm = (v: string) => v.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");

export function LeaveSettings() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["leave", "settings"], queryFn: api.getSettings });
  const [s, setS] = useState<S | null>(null);
  const [busy, setBusy] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [hol, setHol] = useState({ date: "", name: "" });
  useEffect(() => { if (q.data) setS(structuredClone(q.data)); }, [q.data]);
  if (!s) return <p className="text-sm text-muted-foreground">Đang tải…</p>;

  const save = async (next = s) => {
    setBusy(true);
    try { await api.saveSettings(next); toast.success("Đã lưu cài đặt đơn từ"); qc.invalidateQueries({ queryKey: ["leave"] }); }
    catch (e) { toast.error(api.leaveErr(e)); } finally { setBusy(false); }
  };
  const up = (f: (x: S) => void) => setS((prev) => { const n = structuredClone(prev!); f(n); return n; });

  const addReason = () => {
    const n = newReason.trim();
    if (!n) return;
    if (s.reasons.some((r) => norm(r.name) === norm(n))) return toast.error("Tên lý do đã tồn tại.");
    up((x) => { x.reasons.push({ id: "r" + Date.now().toString(36), name: n, active: true }); });
    setNewReason("");
  };
  const renameReason = (i: number, name: string) => up((x) => { x.reasons[i].name = name; });
  const move = (i: number, d: number) => up((x) => { const j = i + d; if (j < 0 || j >= x.reasons.length) return; [x.reasons[i], x.reasons[j]] = [x.reasons[j], x.reasons[i]]; });
  const removeReason = async (i: number) => {
    const r = s.reasons[i];
    if (r.id === "other") return toast.error("\"Lý do khác\" là lý do hệ thống, chỉ có thể đổi tên.");
    try {
      const n = await api.reasonUsage(r.id);
      if (n > 0) return toast.error(`"${r.name}" đã được dùng trong ${n} đơn — chỉ có thể Ngừng sử dụng.`);
    } catch (e) { return toast.error("Không kiểm tra được dữ liệu đã dùng: " + api.leaveErr(e)); }
    if (!confirm(`Xóa lý do "${r.name}"?`)) return;
    up((x) => { x.reasons.splice(i, 1); });
  };
  const dupName = new Set<string>(); let hasDup = false;
  s.reasons.forEach((r) => { const k = norm(r.name); if (!k || dupName.has(k)) hasDup = true; dupName.add(k); });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Lịch làm việc</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["am", "pm"] as const).map((h) => (
              <div key={h} className="rounded-md border p-3 space-y-2">
                <div className="font-medium text-sm">Buổi {h === "am" ? "sáng" : "chiều"}</div>
                <div className="flex items-center gap-2">
                  <Input type="time" value={s.sessions[h].start || ""} onChange={(e) => up((x) => { x.sessions[h].start = e.target.value || null; })} />
                  <span>–</span>
                  <Input type="time" value={s.sessions[h].end || ""} onChange={(e) => up((x) => { x.sessions[h].end = e.target.value || null; })} />
                </div>
              </div>
            ))}
          </div>
          {(!s.sessions.am.start || !s.sessions.am.end || !s.sessions.pm.start || !s.sessions.pm.end) && (
            <p className="text-sm text-destructive">Chưa cấu hình đủ giờ làm việc — nhân viên chưa thể gửi đơn cho buổi chưa có giờ.</p>
          )}
          <div className="rounded-md border divide-y">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div key={d} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="w-24">{DOW_LABEL[d]}</span>
                {(["am", "pm"] as const).map((h) => (
                  <label key={h} className="flex items-center gap-2">
                    <Switch checked={!!s.schedule[String(d)]?.[h]} onCheckedChange={(v) => up((x) => { x.schedule[String(d)] = { ...(x.schedule[String(d)] || { am: false, pm: false }), [h]: v }; })} />
                    {h === "am" ? "Sáng" : "Chiều"}
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Label>Mỗi buổi tương đương</Label>
            <Input type="number" step="0.5" min="0.1" className="w-24" value={s.session_value} onChange={(e) => up((x) => { x.session_value = Number(e.target.value); })} />
            <span>ngày</span>
          </div>
          <div className="space-y-2">
            <Label>Ngày nghỉ lễ / nghỉ riêng của công ty</Label>
            <div className="flex flex-wrap gap-2">
              <Input type="date" className="w-44" value={hol.date} onChange={(e) => setHol({ ...hol, date: e.target.value })} />
              <Input placeholder="Tên ngày nghỉ" className="w-56" value={hol.name} onChange={(e) => setHol({ ...hol, name: e.target.value })} />
              <Button variant="outline" disabled={!hol.date} onClick={() => { if (s.holidays.some((x) => x.date === hol.date)) return toast.error("Ngày này đã có."); up((x) => { x.holidays.push({ ...hol }); x.holidays.sort((a, b) => a.date.localeCompare(b.date)); }); setHol({ date: "", name: "" }); }}><Plus className="h-4 w-4 mr-1" />Thêm</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.holidays.map((h, i) => (
                <span key={h.date} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
                  {fmtDate(h.date)}{h.name ? ` — ${h.name}` : ""}
                  <button onClick={() => up((x) => { x.holidays.splice(i, 1); })} aria-label="Xóa"><Trash2 className="h-3 w-3" /></button>
                </span>
              ))}
              {!s.holidays.length && <span className="text-xs text-muted-foreground">Chưa có ngày nghỉ riêng.</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Quy định thời hạn</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
          <Num label="Nghỉ phép: gửi trước giờ bắt đầu nghỉ (giờ)" v={s.deadlines.leave_hours} on={(n) => up((x) => { x.deadlines.leave_hours = n; })} />
          <Num label="Đi muộn: gửi trước giờ bắt đầu ca (phút)" v={s.deadlines.late_minutes} on={(n) => up((x) => { x.deadlines.late_minutes = n; })} />
          <Num label="Về sớm: gửi trước giờ dự kiến ra về (phút)" v={s.deadlines.early_minutes} on={(n) => up((x) => { x.deadlines.early_minutes = n; })} />
          <Num label="Thu hồi nghỉ phép: trước giờ bắt đầu nghỉ (phút)" v={s.recall_minutes.leave} on={(n) => up((x) => { x.recall_minutes.leave = n; })} />
          <Num label="Thu hồi đi muộn: trước giờ bắt đầu ca (phút)" v={s.recall_minutes.late} on={(n) => up((x) => { x.recall_minutes.late = n; })} />
          <Num label="Thu hồi về sớm: trước giờ dự kiến ra về (phút)" v={s.recall_minutes.early} on={(n) => up((x) => { x.recall_minutes.early = n; })} />
          <p className="sm:col-span-3 text-xs text-muted-foreground">Thay đổi chỉ áp dụng cho đơn gửi sau này; đơn đã gửi giữ quy định tại thời điểm gửi.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Danh mục lý do</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {s.reasons.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2">
              <Input value={r.name} onChange={(e) => renameReason(i, e.target.value)} className={r.active ? "" : "line-through text-muted-foreground"} />
              <Button size="icon" variant="ghost" onClick={() => move(i, -1)} aria-label="Lên"><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => move(i, 1)} aria-label="Xuống"><ArrowDown className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" className="w-28 shrink-0" onClick={() => up((x) => { x.reasons[i].active = !x.reasons[i].active; })}>{r.active ? "Ngừng dùng" : "Kích hoạt lại"}</Button>
              <Button size="icon" variant="ghost" onClick={() => removeReason(i)} aria-label="Xóa"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input placeholder="Thêm lý do mới" value={newReason} onChange={(e) => setNewReason(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addReason()} />
            <Button variant="outline" onClick={addReason}><Plus className="h-4 w-4 mr-1" />Thêm</Button>
          </div>
          {hasDup && <p className="text-sm text-destructive">Có lý do trống hoặc trùng tên.</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 sticky bottom-2">
        <Button variant="outline" onClick={() => q.data && setS(structuredClone(q.data))}>Hoàn tác</Button>
        <Button onClick={() => save()} disabled={busy || hasDup}>{busy ? "Đang lưu…" : "Lưu cài đặt"}</Button>
      </div>
    </div>
  );
}

function Num({ label, v, on }: { label: string; v: number; on: (n: number) => void }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label><Input type="number" min={0} value={v} onChange={(e) => on(Math.max(0, Number(e.target.value) || 0))} /></div>;
}
