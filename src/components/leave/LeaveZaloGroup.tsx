import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { leaveGroupHistory, leaveGroupListGroups, leaveGroupRetry, leaveGroupSave, leaveGroupSendTest, leaveGroupStatus } from "@/lib/leave/zaloGroup.functions";
import { GROUP_EVENT_LABEL, type GroupEvent } from "@/lib/leave/zaloGroupMessage";

const fmtTime = (iso: string | null) => iso
  ? new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hourCycle: "h23", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
  : "—";

const STATUS: Record<string, { label: string; cls: string }> = {
  sent: { label: "Thành công", cls: "text-emerald-600" },
  sending: { label: "Đang gửi", cls: "text-amber-600" },
  pending: { label: "Chờ gửi", cls: "text-amber-600" },
  failed: { label: "Thất bại", cls: "text-destructive" },
  unknown: { label: "Chưa rõ đã gửi — kiểm tra nhóm", cls: "text-destructive" },
  skipped: { label: "Bỏ qua", cls: "text-muted-foreground" },
};

/** Cài đặt THÔNG BÁO ZALO NHÓM NHÂN SỰ — độc lập với nhóm Tiền Về, dùng chung kết nối Zalo OA hiện có. */
export function LeaveZaloGroup() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["leave", "zalo-group"], queryFn: () => leaveGroupStatus() });
  const hist = useQuery({ queryKey: ["leave", "zalo-group-history"], queryFn: () => leaveGroupHistory() });
  const [s, setS] = useState<{ groupId: string; groupName: string; enabled: boolean; onNew: boolean; onReassign: boolean; onApproved: boolean; onRejected: boolean } | null>(null);
  const [groups, setGroups] = useState<{ id: string; name: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (q.data) setS({ groupId: q.data.groupId, groupName: q.data.groupName, enabled: q.data.enabled, onNew: q.data.onNew, onReassign: q.data.onReassign, onApproved: q.data.onApproved, onRejected: q.data.onRejected });
  }, [q.data]);

  const loadGroups = async () => {
    setBusy(true);
    try {
      const r = await leaveGroupListGroups();
      if (!r.ok) { setGroups([]); toast.error(r.message || "Không lấy được danh sách nhóm — nhập mã nhóm thủ công."); }
      else setGroups(r.groups);
    } finally { setBusy(false); }
  };

  if (q.isLoading || !s) return <Card><CardHeader><CardTitle className="text-base">Thông báo Zalo nhóm Nhân sự</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Đang tải…</p></CardContent></Card>;
  if (q.isError) return null; // không có quyền quản trị cài đặt đơn từ

  const save = async () => {
    setBusy(true);
    try {
      const r = await leaveGroupSave({ data: { ...s } });
      if (!r.ok) return toast.error(r.message);
      toast.success(r.message);
      qc.invalidateQueries({ queryKey: ["leave", "zalo-group"] });
    } finally { setBusy(false); }
  };
  const test = async () => {
    setBusy(true);
    try {
      const r = await leaveGroupSendTest();
      r.ok ? toast.success(r.message) : toast.error(r.message);
    } finally { setBusy(false); }
  };
  const retry = async (id: string) => {
    const event = hist.data?.events?.find((e: any) => e.id === id);
    if (event?.status === "unknown" && !window.confirm("Zalo có thể đã nhận tin này. Hãy kiểm tra nhóm trước khi gửi lại để tránh trùng. Bạn chắc chắn muốn gửi lại?")) return;
    const r = await leaveGroupRetry({ data: { id } });
    r.ok ? toast.success(r.message) : toast.error(r.message);
    qc.invalidateQueries({ queryKey: ["leave", "zalo-group-history"] });
    qc.invalidateQueries({ queryKey: ["leave", "zalo-group"] });
  };

  const d = q.data!;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Thông báo Zalo nhóm Nhân sự</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-md border p-3 space-y-1">
          <div className="font-medium">Kết nối Zalo OA</div>
          <p className={d.oaConnected ? "text-emerald-600" : "text-destructive"}>
            {d.oaConnected ? `Đang kết nối: ${d.oaName ?? "OA"}` : "OA chưa kết nối hoặc đã mất kết nối — kiểm tra tại Cài đặt → Thông báo Zalo."}
          </p>
          <p className="text-xs text-muted-foreground">Dùng chung kết nối Zalo OA hiện có của Base; không cần kết nối lại.</p>
        </div>

        <div className="space-y-2">
          <Label>Nhóm nhận thông báo (Zalo GMF)</Label>
          <div className="flex flex-wrap items-center gap-2">
            {groups === null ? (
              <Button variant="outline" size="sm" onClick={loadGroups} disabled={busy || !d.oaConnected}>Tải danh sách nhóm</Button>
            ) : groups.length ? (
              <Select value={s.groupId || undefined} onValueChange={(v) => setS({ ...s, groupId: v, groupName: groups.find((g) => g.id === v)?.name ?? "" })}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Chọn nhóm Zalo" /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : null}
            {groups !== null && !groups.length && (
              <Input className="w-64" placeholder="Nhập mã nhóm (Group ID)" value={s.groupId} onChange={(e) => setS({ ...s, groupId: e.target.value.trim(), groupName: s.groupName })} />
            )}
          </div>
          {s.groupId && <p className="text-xs text-muted-foreground">Nhóm đang chọn: {s.groupName || s.groupId}</p>}
          <p className="text-xs text-muted-foreground">Nhóm này độc lập với nhóm Tiền Về — thay đổi ở đây không ảnh hưởng module khác.</p>
        </div>

        <div className="space-y-2">
          <Label>Sự kiện gửi thông báo</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2"><Switch checked={s.onNew} onCheckedChange={(v) => setS({ ...s, onNew: v })} />Đơn mới gửi</label>
            <label className="flex items-center gap-2"><Switch checked={s.onReassign} onCheckedChange={(v) => setS({ ...s, onReassign: v })} />Chuyển người duyệt</label>
            <label className="flex items-center gap-2"><Switch checked={s.onApproved} onCheckedChange={(v) => setS({ ...s, onApproved: v })} />Đơn được duyệt</label>
            <label className="flex items-center gap-2"><Switch checked={s.onRejected} onCheckedChange={(v) => setS({ ...s, onRejected: v })} />Đơn bị từ chối</label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 font-medium"><Switch checked={s.enabled} onCheckedChange={(v) => setS({ ...s, enabled: v })} />Bật thông báo nhóm Nhân sự</label>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={test} disabled={busy || !s.groupId || !d.oaConnected}><Send className="h-4 w-4 mr-1" />Gửi thử</Button>
          <Button size="sm" onClick={save} disabled={busy}>{busy ? "Đang lưu…" : "Lưu cài đặt"}</Button>
        </div>
        {d.failed > 0 && <p className="text-xs text-destructive">Có {d.failed} thông báo lỗi/chưa rõ — xem lịch sử bên dưới để gửi lại.</p>}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Lịch sử gửi</Label>
            <Button variant="ghost" size="icon" aria-label="Tải lại" onClick={() => qc.invalidateQueries({ queryKey: ["leave", "zalo-group-history"] })}><RefreshCw className="h-4 w-4" /></Button>
          </div>
          <div className="rounded-md border divide-y max-h-72 overflow-auto">
            {(hist.data?.events ?? []).map((e: any) => (
              <div key={e.id} className="px-3 py-2 text-xs space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">{fmtTime(e.created_at)}</span>
                  <span className="font-medium">{e.summary || `Đơn ${String(e.request_id).slice(0, 8)}`}</span>
                  <span>{GROUP_EVENT_LABEL[e.event as GroupEvent] ?? e.event}</span>
                  <span className={STATUS[e.status]?.cls ?? ""}>{STATUS[e.status]?.label ?? e.status}</span>
                  {(e.status === "failed" || e.status === "unknown") && (
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => retry(e.id)}>Gửi lại</Button>
                  )}
                </div>
                {e.error && <p className="text-destructive">{e.error}</p>}
              </div>
            ))}
            {!hist.data?.events?.length && <p className="px-3 py-4 text-xs text-muted-foreground">Chưa có thông báo nào được gửi.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
