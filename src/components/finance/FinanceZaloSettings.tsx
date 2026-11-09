// Cài đặt thông báo nhóm Zalo cho từng chức năng tài chính (Tạm Ứng / Thanh Toán / Tạm Ứng Lương).
// Một kết nối OA chung; mỗi chức năng chọn nhóm + sự kiện riêng. Tạm Ứng Lương dùng mẫu tin che dữ liệu.
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Send, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  frGroupStatus, frGroupListGroups, frGroupSave, frGroupSendTest, frGroupHistory, frGroupRetry,
} from "@/lib/financeRequests/zaloGroup.functions";
import { FR_ZALO_EVENTS, frZaloEventsForKind, frGroupMessage, type FrZaloEvent } from "@/lib/financeRequests/zaloGroupMessage";
import { FR_KIND_LABEL, vnd, type FrKind } from "@/lib/financeRequests/logic";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));
const fmtDateTime = (s: string | null | undefined) => (s ? new Date(s).toLocaleString("vi-VN") : "—");

const STATUS_LABEL: Record<string, string> = {
  pending: "Đang chờ", sent: "Đã gửi", failed: "Lỗi", unknown: "Không rõ", skipped: "Đã bỏ qua",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary", sent: "default", failed: "destructive", unknown: "secondary", skipped: "outline",
};

export function FinanceZaloSettings({ kind }: { kind: FrKind }) {
  const qc = useQueryClient();
  const fnStatus = useServerFn(frGroupStatus);
  const fnGroups = useServerFn(frGroupListGroups);
  const fnSave = useServerFn(frGroupSave);
  const fnTest = useServerFn(frGroupSendTest);
  const fnHistory = useServerFn(frGroupHistory);
  const fnRetry = useServerFn(frGroupRetry);

  const [enabled, setEnabled] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [intro, setIntro] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [groupQuery, setGroupQuery] = useState("");
  const [groups, setGroups] = useState<{ id: string; name: string }[] | null>(null);
  const [busy, setBusy] = useState(false);

  const status = useQuery({
    queryKey: ["fr-zalo", kind, "status"],
    queryFn: () => fnStatus({ data: { kind } }),
  });
  const history = useQuery({
    queryKey: ["fr-zalo", kind, "history"],
    queryFn: () => fnHistory({ data: { kind } }),
  });

  useEffect(() => {
    const s = status.data;
    if (!s) return;
    setEnabled(s.enabled); setGroupId(s.groupId); setGroupName(s.groupName);
    setIntro(s.intro); setToggles(s.toggles);
  }, [status.data]);

  const events = useMemo(() => FR_ZALO_EVENTS.filter((e) => frZaloEventsForKind(kind).includes(e.key)), [kind]);

  const preview = frGroupMessage("submitted", {
    kind, code: kind === "advance" ? "TU-0001" : kind === "payment" ? "TT-0001" : "UL-0001",
    title: kind === "salary_advance" ? "" : "Ví dụ nội dung đề nghị",
    amount: 2200000, requester_name: "Nguyễn Văn A", status: "pending", lines_count: 3,
  }, "https://base.suviet.vn/finance/...", intro);

  const loadGroups = async () => {
    setBusy(true);
    try {
      const r = await fnGroups({ data: { kind } });
      if (!r.ok) { toast.error(r.message || "Không lấy được danh sách nhóm"); setGroups([]); }
      else setGroups(r.groups);
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true);
    try {
      const r = await fnSave({ data: { kind, groupId, groupName, enabled, intro, toggles } });
      if (!r.ok) return toast.error(r.message);
      toast.success(r.message);
      qc.invalidateQueries({ queryKey: ["fr-zalo", kind] });
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const sendTest = async () => {
    setBusy(true);
    try {
      const r = await fnTest({ data: { kind } });
      r.ok ? toast.success(r.message) : toast.error(r.message);
      qc.invalidateQueries({ queryKey: ["fr-zalo", kind, "history"] });
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  if (status.isLoading) return <p className="text-sm text-muted-foreground">Đang tải cài đặt Zalo…</p>;
  const s = status.data;

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-semibold">Thông báo Zalo nhóm</div>
          <p className="text-sm text-muted-foreground">
            Gửi tự động vào nhóm Zalo do OA quản lý khi đề nghị có biến động. Dùng chung kết nối OA của Base.
          </p>
        </div>
        <Badge variant={s?.oaConnected ? "default" : "secondary"}>
          {s?.oaConnected ? `OA đã kết nối${s.oaName ? `: ${s.oaName}` : ""}` : "OA chưa kết nối"}
        </Badge>
      </div>

      {!s?.oaConnected && (
        <p className="text-sm text-destructive">
          Chưa đủ điều kiện gửi tin nhóm Zalo — cần kết nối OA và cấp quyền nhóm ở khu vực quản lý kết nối Zalo chung.
        </p>
      )}
      {kind === "salary_advance" && (
        <p className="text-sm rounded-md bg-muted/50 px-3 py-2">
          Bảo mật nhân sự: tin nhóm Tạm Ứng Lương chỉ gồm mã đề nghị và trạng thái — không tên nhân viên, số tiền, lý do hay kỳ lương.
        </p>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" className="h-4 w-4" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Gửi thông báo vào nhóm Zalo
      </label>

      <div className="space-y-2">
        <Label>Nhóm Zalo nhận thông báo</Label>
        <div className="flex gap-2">
          <Input placeholder="Group ID (nhập thủ công hoặc chọn từ danh sách)" value={groupId}
            onChange={(e) => setGroupId(e.target.value)} />
          <Button type="button" variant="outline" className="shrink-0" disabled={busy} onClick={loadGroups}>
            <Search className="h-4 w-4 mr-1" />Tải nhóm
          </Button>
        </div>
        {groupName && <p className="text-sm text-muted-foreground">Đang chọn: <b>{groupName}</b> ({groupId})</p>}
        {groups !== null && (
          <div className="rounded-md border max-h-48 overflow-y-auto">
            <div className="p-2 border-b">
              <Input placeholder="Tìm nhóm…" value={groupQuery} onChange={(e) => setGroupQuery(e.target.value)} className="h-9" />
            </div>
            {groups.filter((g) => !groupQuery || g.name.toLowerCase().includes(groupQuery.toLowerCase())).map((g) => (
              <button key={g.id} type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${g.id === groupId ? "bg-accent" : ""}`}
                onClick={() => { setGroupId(g.id); setGroupName(g.name); }}>
                {g.name} <span className="text-muted-foreground">— {g.id}</span>
              </button>
            ))}
            {groups.length === 0 && <p className="p-3 text-sm text-muted-foreground">Không lấy được nhóm — kiểm tra quyền OA hoặc nhập Group ID thủ công.</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Sự kiện gửi thông báo</Label>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {events.map((e) => (
            <label key={e.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="h-4 w-4" checked={toggles[e.key] !== false}
                onChange={(ev) => setToggles({ ...toggles, [e.key]: ev.target.checked })} />
              {e.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lời dẫn tùy chỉnh (tùy chọn, tối đa 300 ký tự)</Label>
        <Textarea rows={2} maxLength={300} value={intro} onChange={(e) => setIntro(e.target.value)}
          placeholder="VD: Kính gửi anh/chị kế toán," />
      </div>

      <div className="space-y-1.5">
        <Label>Xem trước mẫu tin</Label>
        <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">{preview}</pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={save}>{busy ? "Đang lưu…" : "Lưu cài đặt"}</Button>
        <Button variant="outline" disabled={busy || !groupId} onClick={sendTest}>
          <Send className="h-4 w-4 mr-1" />Gửi tin kiểm tra
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Lịch sử gửi gần nhất</Label>
          {(s?.failed ?? 0) > 0 && <Badge variant="destructive">{s!.failed} lỗi cần xử lý</Badge>}
        </div>
        {(history.data?.events ?? []).length === 0 && <p className="text-sm text-muted-foreground">Chưa có lượt gửi nào.</p>}
        <div className="space-y-1.5">
          {(history.data?.events ?? []).map((ev: any) => (
            <div key={ev.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Badge variant={STATUS_VARIANT[ev.status] ?? "outline"}>{STATUS_LABEL[ev.status] ?? ev.status}</Badge>
              <div className="flex-1 min-w-0">
                <div className="truncate">{ev.summary ?? ev.event}</div>
                <div className="text-xs text-muted-foreground">
                  {fmtDateTime(ev.created_at)}{ev.error ? ` — ${ev.error}` : ""}
                </div>
              </div>
              {(ev.status === "failed" || ev.status === "unknown") && (
                <Button size="sm" variant="outline" onClick={async () => {
                  const r = await fnRetry({ data: { kind, id: ev.id } });
                  r.ok ? toast.success(r.message) : toast.error(r.message);
                  qc.invalidateQueries({ queryKey: ["fr-zalo", kind, "history"] });
                }}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />Gửi lại
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
