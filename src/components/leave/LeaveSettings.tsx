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
import { useAuth, getUserPermissions } from "@/lib/auth";

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
        <CardHeader><CardTitle className="text-base">Thông báo</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!s.notify?.zalo} onChange={(e) => up((x) => { x.notify = { ...(x.notify ?? {}), zalo: e.target.checked }; })} />Gửi tin Zalo cho đơn từ (người duyệt và người đứng tên)</label>
          <Num label="Nhắc người duyệt khi đơn chờ quá (giờ)" v={s.notify?.remind_hours ?? 4} on={(n) => up((x) => { x.notify = { ...(x.notify ?? {}), remind_hours: Math.max(1, n) }; })} />
          <p className="sm:col-span-2 text-xs text-muted-foreground">Thông báo trong Base luôn bật. Nhắc duyệt gửi tối đa 1 lần/ngày, trong giờ 08:00–18:00; đơn sắp tới giờ bắt đầu (còn ≤ 2 giờ) được nhắc sớm. Cần bật "Gửi tự động" và đã lưu cài đặt nhắc trong Thông báo Zalo.</p>
        </CardContent>
      </Card>

      <CcCard s={s} up={up} />
      <AttNotifyCard s={s} up={up} />

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

type Cc = { enabled?: boolean; on_approve?: boolean; on_cancel?: boolean; role_ids?: string[]; user_ids?: string[] };
function CcCard({ s, up }: { s: S; up: (f: (x: S) => void) => void }) {
  const users = useAuth((a) => a.users);
  const roles = useAuth((a) => a.roles);
  const cc: Cc = s.notify?.cc ?? {};
  const set = (patch: Partial<Cc>) => up((x) => { x.notify = { ...(x.notify ?? {}), cc: { ...(x.notify?.cc ?? {}), ...patch } }; });
  const toggle = (key: "role_ids" | "user_ids", id: string) => {
    const cur = cc[key] ?? [];
    set({ [key]: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
  };
  const active = users.filter((u) => u.status === "Đang hoạt động");
  const rec = new Map<string, (typeof users)[number]>();
  active.forEach((u) => { if ((u.roleId && cc.role_ids?.includes(u.roleId)) || cc.user_ids?.includes(u.id)) rec.set(u.id, u); });
  const missing = [...rec.values()].filter((u) => !getUserPermissions(u, roles).has("leave.view_all" as any));
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Thông báo sau khi phê duyệt</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <label className="flex items-center gap-2"><Switch checked={!!cc.enabled} onCheckedChange={(v) => set({ enabled: v })} />Bật thông báo CC</label>
        {cc.enabled && (<>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!cc.on_approve} onChange={(e) => set({ on_approve: e.target.checked })} />Đơn được phê duyệt</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!cc.on_cancel} onChange={(e) => set({ on_cancel: e.target.checked })} />Đơn đã duyệt được chấp thuận hủy</label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Theo vai trò (người đang hoạt động tại thời điểm gửi)</Label>
              <div className="max-h-56 overflow-auto rounded-md border p-2 space-y-1">
                {roles.map((r) => <label key={r.id} className="flex items-center gap-2"><input type="checkbox" checked={!!cc.role_ids?.includes(r.id)} onChange={() => toggle("role_ids", r.id)} />{r.name}</label>)}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Theo cá nhân</Label>
              <div className="max-h-56 overflow-auto rounded-md border p-2 space-y-1">
                {active.map((u) => <label key={u.id} className="flex items-center gap-2"><input type="checkbox" checked={!!cc.user_ids?.includes(u.id)} onChange={() => toggle("user_ids", u.id)} />{u.fullName || u.username}</label>)}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Hiện có {rec.size} người nhận (đã bỏ trùng). Chủ đơn và người vừa duyệt không nhận CC. Chỉ áp dụng cho đơn duyệt/hủy từ nay, không gửi bù đơn cũ. Zalo gửi kèm nếu đã bật Zalo đơn từ và người nhận đã liên kết.</p>
          {missing.length > 0 && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {missing.length} người nhận chưa có quyền "Xem toàn bộ" đơn từ nên sẽ không mở được chi tiết đơn: {missing.map((u) => u.fullName || u.username).join(", ")}. Nhận thông báo không tự cấp quyền xem.
            </p>
          )}
        </>)}
      </CardContent>
    </Card>
  );
}

type AttN = { enabled?: boolean; role_ids?: string[]; user_ids?: string[] };
function AttNotifyCard({ s, up }: { s: S; up: (f: (x: S) => void) => void }) {
  const users = useAuth((a) => a.users);
  const roles = useAuth((a) => a.roles);
  const cfg: AttN = (s as any).attendance?.notify ?? {};
  const set = (patch: Partial<AttN>) => up((x: any) => { x.attendance = { ...(x.attendance ?? {}), notify: { ...(x.attendance?.notify ?? {}), ...patch } }; });
  const toggle = (key: "role_ids" | "user_ids", id: string) => { const cur = cfg[key] ?? []; set({ [key]: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] }); };
  const active = users.filter((u) => u.status === "Đang hoạt động");
  const rec = new Map<string, (typeof users)[number]>();
  active.forEach((u) => { if ((u.roleId && cfg.role_ids?.includes(u.roleId)) || cfg.user_ids?.includes(u.id)) rec.set(u.id, u); });
  const missing = [...rec.values()].filter((u) => { const p = getUserPermissions(u, roles); return !["att.view_all", "att.reconcile", "att.manage"].some((k) => p.has(k as any)); });
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Người nhận giải trình chấm công</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <label className="flex items-center gap-2"><Switch checked={!!cfg.enabled} onCheckedChange={(v) => set({ enabled: v })} />Bật thông báo giải trình chấm công</label>
        {cfg.enabled && (<>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Theo vai trò (người đang hoạt động tại thời điểm gửi)</Label>
              <div className="max-h-56 overflow-auto rounded-md border p-2 space-y-1">
                {roles.map((r) => <label key={r.id} className="flex items-center gap-2"><input type="checkbox" checked={!!cfg.role_ids?.includes(r.id)} onChange={() => toggle("role_ids", r.id)} />{r.name}</label>)}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Theo cá nhân</Label>
              <div className="max-h-56 overflow-auto rounded-md border p-2 space-y-1">
                {active.map((u) => <label key={u.id} className="flex items-center gap-2"><input type="checkbox" checked={!!cfg.user_ids?.includes(u.id)} onChange={() => toggle("user_ids", u.id)} />{u.fullName || u.username}</label>)}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Hiện có {rec.size} người nhận (đã bỏ trùng). Người nhận được báo khi có giải trình mới và khi nhân viên sửa ngày/giờ. Thông báo trong Base luôn được tạo; Zalo gửi kèm nếu đã bật Zalo đơn từ và người nhận đã liên kết. Không gửi bù giải trình cũ.</p>
          {missing.length > 0 && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {missing.length} người nhận chưa có quyền xem giải trình (Xem toàn bộ / Đối chiếu / Quản lý giải trình) nên sẽ không mở được chi tiết: {missing.map((u) => u.fullName || u.username).join(", ")}.
            </p>
          )}
        </>)}
      </CardContent>
    </Card>
  );
}
