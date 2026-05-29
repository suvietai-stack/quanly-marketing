import { useState } from "react";
import {
  useStore, todayISO, fmtDate,
  computeNextOptimizeDate,
  OPTIMIZE_TARGETS,
  type WebContent, type ContentStatus, type WebContentHistoryEntry,
  type OptimizeHistoryEntry, type OptimizeTarget,
} from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ExternalLink, History } from "lucide-react";
import { toast } from "sonner";


type Transition = {
  to: ContentStatus;
  action: string;
  note?: string;
  extra?: Partial<WebContent>;
};

function FieldRow({ k, v }: { k: string; v?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0">
      <span className="text-muted-foreground text-sm">{k}</span>
      <span className="font-medium text-right text-sm">{v ?? "—"}</span>
    </div>
  );
}

function PersonSelect({ label, value, onChange, disabled }: { label: string; value?: string; onChange: (v?: string) => void; disabled?: boolean }) {
  const { people } = useStore();
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value || "_"} onValueChange={(v) => onChange(v === "_" ? undefined : v)} disabled={disabled}>
        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_">—</SelectItem>
          {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export function OptimizeContentDetail({
  content, open, onClose,
}: {
  content: WebContent | null;
  open: boolean;
  onClose: () => void;
}) {
  const s = useStore();
  const { user, isAdmin } = useCurrentUser();

  // assign-form state
  const [assignee, setAssignee] = useState<string | undefined>(undefined);
  const [reviewer, setReviewer] = useState<string | undefined>(undefined);
  const [deadline, setDeadline] = useState("");
  const [assignNote, setAssignNote] = useState("");

  // result state
  const [resultLink, setResultLink] = useState("");
  const [resultNote, setResultNote] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  if (!content) return null;
  const c = s.webContents.find((x) => x.id === content.id) || content;
  const website = s.websites.find((w) => w.id === c.websiteId);
  const brand = s.brands.find((b) => b.id === c.brandId);

  const myName = user?.fullName || user?.username || "";
  const isAssignee = !!c.writer && c.writer.trim() === myName.trim();
  const isReviewer = !!c.optimizeReviewer && c.optimizeReviewer.trim() === myName.trim();

  const apply = (t: Transition) => {
    const entry: WebContentHistoryEntry = {
      at: new Date().toISOString(),
      byId: user?.id,
      byName: myName || "—",
      action: t.action,
      fromStatus: c.status,
      toStatus: t.to,
      note: t.note,
    };
    s.update("webContents", c.id, {
      status: t.to,
      ...(t.extra || {}),
      history: [...(c.history || []), entry],
    });
  };

  const doAssign = () => {
    if (!assignee) { toast.error("Chọn người phụ trách tối ưu"); return; }
    if (!reviewer) { toast.error("Chọn người duyệt tối ưu"); return; }
    if (!deadline) { toast.error("Nhập deadline"); return; }
    if (assignee === reviewer) { toast.error("Người phụ trách và người duyệt phải khác nhau"); return; }
    apply({
      to: "Đã giao",
      action: `Giao việc cho ${assignee}, người duyệt ${reviewer}`,
      note: assignNote || undefined,
      extra: {
        writer: assignee,
        optimizeReviewer: reviewer,
        deadline,
        optimizeAssignNote: assignNote || undefined,
      },
    });
    setAssignee(undefined); setReviewer(undefined); setDeadline(""); setAssignNote("");
  };

  const submitForReview = () => {
    if (!resultLink.trim()) { toast.error("Nhập link kết quả sau tối ưu"); return; }
    apply({
      to: "Chờ duyệt tối ưu",
      action: "Gửi duyệt tối ưu",
      extra: { optimizeResultLink: resultLink.trim(), optimizeResultNote: resultNote.trim() || undefined },
    });
    setResultLink(""); setResultNote("");
  };

  const approve = () => {
    apply({ to: "Đã duyệt tối ưu", action: "Duyệt tối ưu" });
  };

  const requestFix = () => {
    if (!reviewNote.trim()) { toast.error("Nhập ghi chú yêu cầu sửa"); return; }
    apply({
      to: "Cần sửa tối ưu",
      action: "Yêu cầu sửa",
      note: reviewNote.trim(),
      extra: {
        optimizeReviewNotes: reviewNote.trim(),
        optimizeRevisions: (c.optimizeRevisions || 0) + 1,
      },
    });
    setReviewNote("");
  };

  const startOptimize = () => apply({ to: "Đang tối ưu", action: "Bắt đầu tối ưu" });
  const completeOptimize = () => apply({ to: "Hoàn thành", action: "Xác nhận hoàn thành", extra: { completedAt: todayISO() } });
  const cancelOptimize = () => {
    if (!confirm("Hủy bài tối ưu này?")) return;
    apply({ to: "Đã hủy", action: "Hủy bài tối ưu" });
  };

  const NoPerm = () => (
    <div className="text-xs text-muted-foreground italic">
      Bạn không có quyền thực hiện hành động ở trạng thái này.
    </div>
  );

  function renderActions() {
    switch (c.status) {
      case "Đã tạo":
      case "Kế hoạch": {
        if (!isAdmin) return <NoPerm />;
        return (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <PersonSelect label="Người phụ trách tối ưu *" value={assignee} onChange={setAssignee} />
              <PersonSelect label="Người duyệt tối ưu *" value={reviewer} onChange={setReviewer} />
              <div>
                <Label>Deadline *</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Ghi chú giao việc</Label>
                <Textarea rows={2} value={assignNote} onChange={(e) => setAssignNote(e.target.value)} />
              </div>
            </div>
            <Button onClick={doAssign}><ArrowRight className="h-4 w-4" />Giao việc</Button>
          </div>
        );
      }
      case "Đã giao":
        if (!(isAdmin || isAssignee)) return <NoPerm />;
        return (
          <Button onClick={startOptimize}><ArrowRight className="h-4 w-4" />Bắt đầu tối ưu</Button>
        );
      case "Đang tối ưu":
      case "Cần sửa tối ưu": {
        if (!(isAdmin || isAssignee)) return <NoPerm />;
        return (
          <div className="space-y-3">
            {c.status === "Cần sửa tối ưu" && c.optimizeReviewNotes && (
              <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                <div className="text-xs font-semibold mb-1">Ghi chú sửa gần nhất</div>
                {c.optimizeReviewNotes}
              </div>
            )}
            <div>
              <Label>Link kết quả sau tối ưu *</Label>
              <Input value={resultLink || c.optimizeResultLink || ""} onChange={(e) => setResultLink(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Ghi chú kết quả</Label>
              <Textarea rows={2} value={resultNote || c.optimizeResultNote || ""} onChange={(e) => setResultNote(e.target.value)} />
            </div>
            <Button onClick={submitForReview}>
              <ArrowRight className="h-4 w-4" />
              {c.status === "Cần sửa tối ưu" ? "Gửi duyệt lại tối ưu" : "Gửi duyệt tối ưu"}
            </Button>
          </div>
        );
      }
      case "Chờ duyệt tối ưu": {
        if (!(isAdmin || isReviewer)) return <NoPerm />;
        return (
          <div className="space-y-3">
            {c.optimizeResultLink && (
              <a href={c.optimizeResultLink} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                Mở kết quả tối ưu <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <div>
              <Label>Ghi chú yêu cầu sửa (nếu cần)</Label>
              <Textarea rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={approve}>Duyệt tối ưu</Button>
              <Button variant="outline" onClick={requestFix}>Yêu cầu sửa</Button>
            </div>
          </div>
        );
      }
      case "Đã duyệt tối ưu":
        if (!(isAdmin || isAssignee || isReviewer)) return <NoPerm />;
        return <Button onClick={completeOptimize}>Xác nhận hoàn thành</Button>;
      case "Hoàn thành":
        return <div className="text-sm text-muted-foreground">Bài tối ưu đã hoàn thành.</div>;
      case "Đã hủy":
        return <div className="text-sm text-muted-foreground">Bài đã hủy.</div>;
      default:
        return <div className="text-sm text-muted-foreground">Trạng thái: {c.status}</div>;
    }
  }

  const sourceContent = c.sourceContentId ? s.webContents.find((x) => x.id === c.sourceContentId) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            <span>{c.title}</span>
            <StatusBadge value={c.status} />
          </DialogTitle>
          <div className="text-xs text-muted-foreground">
            {website?.name} · {brand?.name} · Bài tối ưu lại
          </div>
        </DialogHeader>

        <Tabs defaultValue="workflow">
          <TabsList>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="links">Tài liệu</TabsTrigger>
            <TabsTrigger value="history"><History className="h-3.5 w-3.5 mr-1" />Lịch sử xử lý</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="mt-3 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Hành động tiếp theo</div>
              <Card><CardContent className="p-4">{renderActions()}</CardContent></Card>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <FieldRow k="Trạng thái" v={<StatusBadge value={c.status} />} />
              <FieldRow k="Người phụ trách tối ưu" v={c.writer} />
              <FieldRow k="Người duyệt tối ưu" v={c.optimizeReviewer} />
              <FieldRow k="Deadline" v={fmtDate(c.deadline)} />
              <FieldRow k="Số lần sửa" v={c.optimizeRevisions || 0} />
              <FieldRow k="Ghi chú giao việc" v={c.optimizeAssignNote} />
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-3">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <FieldRow k="Tiêu đề" v={c.title} />
              <FieldRow k="URL bài" v={c.oldLink || c.url} />
              <FieldRow k="Bài gốc trong hệ thống" v={sourceContent?.title} />
              <FieldRow k="Website" v={website?.name} />
              <FieldRow k="Thương hiệu" v={brand?.name} />
              <FieldRow k="Từ khóa chính" v={c.mainKeyword} />
              <FieldRow k="Từ khóa phụ" v={c.subKeywords} />
              <FieldRow k="Nguồn tạo" v={c.optimizeSource} />
              <FieldRow k="Lý do tối ưu" v={c.optimizeReason} />
              <FieldRow k="Hạng mục cần tối ưu" v={c.optimizeTargets?.join(", ")} />
            </div>
            {c.optimizeNotes && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ghi chú yêu cầu</div>
                <div className="rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">{c.optimizeNotes}</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="mt-3 space-y-3">
            {[
              { label: "Link bài hiện tại", v: c.oldLink || c.url },
              { label: "Link tài liệu tham khảo", v: c.optimizeRefLink },
              { label: "Link kết quả sau tối ưu", v: c.optimizeResultLink },
            ].map((l) => (
              <div key={l.label} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                <span className="text-sm font-medium">{l.label}</span>
                {l.v ? (
                  <a href={l.v} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                    Mở <ExternalLink className="h-3 w-3" />
                  </a>
                ) : <span className="text-xs text-muted-foreground">Chưa có</span>}
              </div>
            ))}
            {c.optimizeResultNote && (
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ghi chú kết quả tối ưu</div>
                <div className="rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">{c.optimizeResultNote}</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            <div className="space-y-2">
              {(!c.history || c.history.length === 0) && (
                <div className="text-sm text-muted-foreground">Chưa có lịch sử xử lý.</div>
              )}
              {(c.history || []).slice().reverse().map((h, i) => (
                <div key={i} className="rounded-md border bg-card px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-medium">{h.action}</div>
                    <div className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString("vi-VN")}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Người thực hiện: {h.byName || "—"}</div>
                  {(h.fromStatus || h.toStatus) && h.fromStatus !== h.toStatus && (
                    <div className="mt-1 text-xs flex items-center gap-2">
                      <StatusBadge value={h.fromStatus || "—"} />
                      <ArrowRight className="h-3 w-3" />
                      <StatusBadge value={h.toStatus || "—"} />
                    </div>
                  )}
                  {h.note && (
                    <div className="mt-2 rounded bg-muted/50 px-2 py-1 text-xs whitespace-pre-wrap">{h.note}</div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {isAdmin && c.status !== "Hoàn thành" && c.status !== "Đã hủy" && (
            <Button variant="ghost" onClick={cancelOptimize}>Hủy bài</Button>
          )}
          <Button onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
