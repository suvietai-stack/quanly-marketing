import { useState } from "react";
import {
  useStore, uid, todayISO, fmtDate,
  type WebContent, type ContentStatus, type WebContentHistoryEntry,
  CONTENT_STATUSES,
} from "@/lib/store";
import { useCurrentUser, type PermissionKey } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink, Pencil, Palette, ArrowRight, Check, X, ShieldAlert, History,
} from "lucide-react";
import { ContentForm } from "@/components/ContentForm";
import { DesignOrderFormFromContent } from "@/components/DesignOrderForm";
import { toast } from "sonner";

type Transition = {
  to: ContentStatus;
  action: string;
  note?: string;
  extra?: Partial<WebContent>;
};

function ActionButton({ children, onClick, variant = "default", disabled }: any) {
  return (
    <Button size="sm" variant={variant} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

function WorkflowActions({
  c,
  apply,
  canAct,
  can,
}: {
  c: WebContent;
  apply: (t: Transition) => void;
  canAct: (perm: PermissionKey, isWriterOwned?: boolean) => boolean;
  can: (perm: PermissionKey) => boolean;
}) {
  const [outlineLink, setOutlineLink] = useState(c.outlineLink || "");
  const [draftLink, setDraftLink] = useState(c.draftLink || "");
  const [imageLink, setImageLink] = useState(c.imageLink || "");
  const [publishedLink, setPublishedLink] = useState(c.publishedLink || "");
  const [publishedAt, setPublishedAt] = useState(c.publishedAt || todayISO());
  const [webDraftLink, setWebDraftLink] = useState(c.webDraftLink || "");
  const [reviewNote, setReviewNote] = useState("");

  const NoPerm = () => (
    <div className="text-xs text-muted-foreground italic">
      Bạn không có quyền thực hiện hành động ở trạng thái này.
    </div>
  );

  switch (c.status) {
    case "Kế hoạch":
      return canAct("web.content_assign") ? (
        <ActionButton onClick={() => apply({ to: "Đã giao", action: "Giao bài" })}>
          <ArrowRight className="h-4 w-4" />Giao bài
        </ActionButton>
      ) : <NoPerm />;
    case "Đã giao":
      return canAct("web.outline_start", true) ? (
        <ActionButton onClick={() => apply({ to: "Đang làm outline", action: "Bắt đầu làm outline" })}>
          <ArrowRight className="h-4 w-4" />Bắt đầu làm outline
        </ActionButton>
      ) : <NoPerm />;
    case "Đang làm outline":
      return canAct("web.outline_submit", true) ? (
        <div className="space-y-2">
          <Label className="text-xs">Link outline</Label>
          <div className="flex gap-2">
            <Input value={outlineLink} onChange={(e) => setOutlineLink(e.target.value)} placeholder="https://..." />
            <Button
              disabled={!outlineLink.trim()}
              onClick={() => apply({ to: "Chờ duyệt outline", action: "Gửi duyệt outline", extra: { outlineLink } })}
            >Gửi duyệt outline</Button>
          </div>
        </div>
      ) : <NoPerm />;
    case "Chờ duyệt outline": {
      const canApprove = canAct("web.outline_approve");
      const canReject = canAct("web.outline_reject");
      if (!canApprove && !canReject) return <NoPerm />;
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {canApprove && (
              <ActionButton onClick={() => apply({ to: "Outline đã duyệt", action: "Duyệt outline", extra: { outlineReviewNotes: undefined } })}>
                <Check className="h-4 w-4" />Duyệt outline
              </ActionButton>
            )}
            {canReject && (
              <ActionButton variant="destructive" onClick={() => {
                if (!reviewNote.trim()) { toast.error("Vui lòng nhập ghi chú yêu cầu sửa."); return; }
                apply({
                  to: "Cần sửa outline",
                  action: "Yêu cầu sửa outline",
                  note: reviewNote,
                  extra: {
                    outlineReviewNotes: reviewNote,
                    outlineRevisions: (c.outlineRevisions || 0) + 1,
                  },
                });
                setReviewNote("");
              }}><X className="h-4 w-4" />Yêu cầu sửa outline</ActionButton>
            )}
          </div>
          {canReject && (
            <Textarea rows={2} placeholder="Ghi chú yêu cầu sửa outline (bắt buộc nếu yêu cầu sửa)..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
          )}
        </div>
      );
    }
    case "Cần sửa outline":
      return canAct("web.outline_resubmit", true) ? (
        <div className="space-y-2">
          {c.outlineReviewNotes && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <div className="text-xs font-semibold text-destructive mb-1">Yêu cầu sửa outline (lần {c.outlineRevisions}):</div>
              {c.outlineReviewNotes}
            </div>
          )}
          <Label className="text-xs">Cập nhật link outline</Label>
          <div className="flex gap-2">
            <Input value={outlineLink} onChange={(e) => setOutlineLink(e.target.value)} />
            <Button onClick={() => apply({ to: "Chờ duyệt outline", action: "Gửi duyệt lại outline", extra: { outlineLink } })}>
              Gửi duyệt lại outline
            </Button>
          </div>
        </div>
      ) : <NoPerm />;
    case "Outline đã duyệt":
      return canAct("web.post_write_start", true) ? (
        <ActionButton onClick={() => apply({ to: "Đang viết bài", action: "Bắt đầu viết bài" })}>
          <ArrowRight className="h-4 w-4" />Bắt đầu viết bài
        </ActionButton>
      ) : <NoPerm />;
    case "Đang viết bài":
      return canAct("web.post_submit", true) ? (
        <div className="space-y-2">
          <Label className="text-xs">Link bài viết</Label>
          <Input value={draftLink} onChange={(e) => setDraftLink(e.target.value)} placeholder="https://..." />
          <Label className="text-xs">Link ảnh (nếu có)</Label>
          <Input value={imageLink} onChange={(e) => setImageLink(e.target.value)} />
          <Button disabled={!draftLink.trim()} onClick={() => apply({ to: "Chờ duyệt bài", action: "Gửi duyệt bài", extra: { draftLink, imageLink } })}>
            Gửi duyệt bài
          </Button>
        </div>
      ) : <NoPerm />;
    case "Chờ duyệt bài": {
      const canApprove = canAct("web.post_approve");
      const canReject = canAct("web.post_reject");
      if (!canApprove && !canReject) return <NoPerm />;
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {canApprove && (
              <ActionButton onClick={() => apply({ to: "Bài viết đã duyệt", action: "Duyệt bài", extra: { draftReviewNotes: undefined } })}>
                <Check className="h-4 w-4" />Duyệt bài
              </ActionButton>
            )}
            {canReject && (
              <ActionButton variant="destructive" onClick={() => {
                if (!reviewNote.trim()) { toast.error("Vui lòng nhập ghi chú yêu cầu sửa."); return; }
                apply({
                  to: "Cần sửa bài",
                  action: "Yêu cầu sửa bài",
                  note: reviewNote,
                  extra: {
                    draftReviewNotes: reviewNote,
                    draftRevisions: (c.draftRevisions || 0) + 1,
                  },
                });
                setReviewNote("");
              }}><X className="h-4 w-4" />Yêu cầu sửa bài</ActionButton>
            )}
          </div>
          {canReject && (
            <Textarea rows={2} placeholder="Ghi chú yêu cầu sửa bài..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
          )}
        </div>
      );
    }
    case "Cần sửa bài":
      return canAct("web.post_resubmit", true) ? (
        <div className="space-y-2">
          {c.draftReviewNotes && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <div className="text-xs font-semibold text-destructive mb-1">Yêu cầu sửa bài (lần {c.draftRevisions}):</div>
              {c.draftReviewNotes}
            </div>
          )}
          <Label className="text-xs">Cập nhật link bài viết</Label>
          <div className="flex gap-2">
            <Input value={draftLink} onChange={(e) => setDraftLink(e.target.value)} />
            <Button onClick={() => apply({ to: "Chờ duyệt bài", action: "Gửi duyệt lại bài", extra: { draftLink } })}>
              Gửi duyệt lại bài
            </Button>
          </div>
        </div>
      ) : <NoPerm />;
    case "Bài viết đã duyệt":
      return canAct("web.start_web_draft_layout") ? (
        <ActionButton onClick={() => apply({ to: "Đang trình bày nháp web", action: "Bắt đầu trình bày nháp web" })}>
          <ArrowRight className="h-4 w-4" />Bắt đầu trình bày nháp web
        </ActionButton>
      ) : <NoPerm />;
    case "Đang trình bày nháp web": {
      const canEditUrl = can("web.edit_web_draft_url");
      const canSubmit = canAct("web.submit_web_draft_review");
      if (!canSubmit && !canEditUrl) return <NoPerm />;
      return (
        <div className="space-y-2">
          <Label className="text-xs">Link bản nháp web</Label>
          <Input
            value={webDraftLink}
            onChange={(e) => setWebDraftLink(e.target.value)}
            placeholder="https://... (URL preview/draft)"
            readOnly={!canEditUrl}
            disabled={!canEditUrl}
          />
          {canSubmit && (
            <Button
              disabled={!webDraftLink.trim()}
              onClick={() => apply({
                to: "Chờ duyệt bản nháp web",
                action: "Gửi duyệt bản nháp web",
                extra: { webDraftLink, webDraftSubmittedAt: new Date().toISOString() },
              })}
            >Gửi duyệt bản nháp web</Button>
          )}
        </div>
      );
    }
    case "Chờ duyệt bản nháp web": {
      const canApprove = canAct("web.approve_web_draft");
      const canReject = canAct("web.request_web_draft_revision");
      if (!canApprove && !canReject) return <NoPerm />;
      return (
        <div className="space-y-2">
          {c.webDraftLink && (
            <div className="text-xs">
              Bản nháp:{" "}
              <a href={c.webDraftLink} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                {c.webDraftLink} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {canApprove && (
              <ActionButton onClick={() => apply({
                to: "Bản nháp web đã duyệt",
                action: "Duyệt bản nháp web",
                extra: { webDraftReviewNotes: undefined, webDraftApprovedAt: new Date().toISOString() },
              })}>
                <Check className="h-4 w-4" />Duyệt bản nháp web
              </ActionButton>
            )}
            {canReject && (
              <ActionButton variant="destructive" onClick={() => {
                if (!reviewNote.trim()) { toast.error("Vui lòng nhập ghi chú yêu cầu sửa."); return; }
                apply({
                  to: "Cần sửa bản nháp web",
                  action: "Yêu cầu sửa bản nháp web",
                  note: reviewNote,
                  extra: {
                    webDraftReviewNotes: reviewNote,
                    webDraftRevisions: (c.webDraftRevisions || 0) + 1,
                  },
                });
                setReviewNote("");
              }}><X className="h-4 w-4" />Yêu cầu sửa bản nháp web</ActionButton>
            )}
          </div>
          {canReject && (
            <Textarea rows={2} placeholder="Ghi chú yêu cầu sửa bản nháp web (bắt buộc)..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
          )}
        </div>
      );
    }
    case "Cần sửa bản nháp web":
      return canAct("web.resubmit_web_draft_review") ? (
        <div className="space-y-2">
          {c.webDraftReviewNotes && can("web.view_web_draft_revision_note") && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <div className="text-xs font-semibold text-destructive mb-1">Yêu cầu sửa bản nháp web (lần {c.webDraftRevisions}):</div>
              {c.webDraftReviewNotes}
            </div>
          )}
          <Label className="text-xs">Cập nhật link bản nháp web</Label>
          <Input
            value={webDraftLink}
            onChange={(e) => setWebDraftLink(e.target.value)}
            readOnly={!can("web.edit_web_draft_url")}
            disabled={!can("web.edit_web_draft_url")}
          />
          <Button
            disabled={!webDraftLink.trim()}
            onClick={() => apply({
              to: "Chờ duyệt bản nháp web",
              action: "Gửi duyệt lại bản nháp web",
              extra: { webDraftLink, webDraftSubmittedAt: new Date().toISOString() },
            })}
          >Gửi duyệt lại bản nháp web</Button>
        </div>
      ) : <NoPerm />;
    case "Bản nháp web đã duyệt":
      return canAct("web.move_pending_publish") ? (
        <ActionButton onClick={() => apply({ to: "Chờ đăng web", action: "Chuyển sang chờ đăng" })}>
          <ArrowRight className="h-4 w-4" />Chuyển sang chờ đăng
        </ActionButton>
      ) : <NoPerm />;
    case "Chờ đăng web":
      return canAct("web.publish") ? (
        <div className="space-y-2">
          <Label className="text-xs">Link bài đã đăng</Label>
          <Input value={publishedLink} onChange={(e) => setPublishedLink(e.target.value)} placeholder="https://..." />
          <Label className="text-xs">Ngày đăng thực tế</Label>
          <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
          <Button disabled={!publishedLink.trim()} onClick={() => apply({ to: "Đã đăng web", action: "Xác nhận đã đăng web", extra: { publishedLink, publishedAt } })}>
            Xác nhận đã đăng
          </Button>
        </div>
      ) : <NoPerm />;
    case "Đã đăng web":
      return canAct("web.update_index") ? (
        <div className="space-y-2">
          <Label className="text-xs">Trạng thái index</Label>
          <Select value={c.indexStatus} onValueChange={(v) => apply({ to: c.status, action: `Cập nhật index: ${v}`, extra: { indexStatus: v as any } })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s) =>
                <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => apply({ to: "Kiểm tra index", action: "Chuyển sang kiểm tra index" })}>
            <ArrowRight className="h-4 w-4" />Chuyển sang kiểm tra index
          </Button>
        </div>
      ) : <NoPerm />;
    case "Kiểm tra index": {
      const canIndex = canAct("web.update_index");
      const canComplete = canAct("web.complete");
      if (!canIndex && !canComplete) return <NoPerm />;
      return (
        <div className="space-y-2">
          {canIndex && (
            <>
              <Label className="text-xs">Trạng thái index</Label>
              <Select value={c.indexStatus} onValueChange={(v) => apply({ to: c.status, action: `Cập nhật index: ${v}`, extra: { indexStatus: v as any } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s) =>
                    <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Ghi chú index..." defaultValue={c.indexNotes || ""} onBlur={(e) => { if (e.target.value !== (c.indexNotes || "")) apply({ to: c.status, action: "Cập nhật ghi chú index", note: e.target.value, extra: { indexNotes: e.target.value } }); }} />
            </>
          )}
          {canComplete && (
            <Button onClick={() => apply({ to: "Hoàn thành", action: "Hoàn thành content web", extra: { completedAt: todayISO() } })}>
              <Check className="h-4 w-4" />Hoàn thành
            </Button>
          )}
        </div>
      );
    }
    case "Hoàn thành":
      return (
        <div className="rounded-md bg-success/10 border border-success/30 p-3 text-sm text-success font-medium">
          Bài đã hoàn thành{c.completedAt ? ` ngày ${fmtDate(c.completedAt)}` : ""}.
        </div>
      );
  }
}

function ForceStatusPanel({
  c,
  apply,
}: {
  c: WebContent;
  apply: (t: Transition & { forced?: boolean }) => void;
}) {
  const [target, setTarget] = useState<ContentStatus>(c.status);
  const [reason, setReason] = useState("");
  return (
    <div className="rounded-md border border-warning/40 bg-warning/5 p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-warning-foreground">
        <ShieldAlert className="h-4 w-4 text-warning" />
        Ép chuyển trạng thái (Admin)
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Trạng thái mới</Label>
          <Select value={target} onValueChange={(v) => setTarget(v as ContentStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Lý do (bắt buộc)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do ép chuyển..." />
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          if (!reason.trim()) { toast.error("Vui lòng nhập lý do ép chuyển."); return; }
          if (target === c.status) { toast.error("Trạng thái mới phải khác trạng thái hiện tại."); return; }
          apply({ to: target, action: "Ép chuyển trạng thái", note: reason, forced: true });
          setReason("");
        }}
      >Ép chuyển</Button>
    </div>
  );
}

function HistoryList({ history }: { history?: WebContentHistoryEntry[] }) {
  if (!history || history.length === 0) {
    return <div className="text-xs text-muted-foreground">Chưa có lịch sử xử lý.</div>;
  }
  return (
    <div className="space-y-2">
      {[...history].reverse().map((h, idx) => (
        <div key={idx} className="rounded-md border bg-card p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium flex items-center gap-2">
              {h.forced && <ShieldAlert className="h-3.5 w-3.5 text-warning" />}
              {h.byName || "—"} <span className="text-muted-foreground font-normal">· {h.action}</span>
            </div>
            <div className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString("vi-VN")}</div>
          </div>
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
  );
}

function isWriterOwned(c: WebContent, currentName?: string): boolean {
  if (!currentName) return false;
  return !!c.writer && c.writer.trim() === currentName.trim();
}

export function ContentDetail({
  content, open, onClose,
}: {
  content: WebContent | null;
  open: boolean;
  onClose: () => void;
}) {
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [orderFormOpen, setOrderFormOpen] = useState(false);

  if (!content) return null;
  const c = s.webContents.find((x) => x.id === content.id) || content;
  const website = s.websites.find((w) => w.id === c.websiteId);
  const brand = s.brands.find((b) => b.id === c.brandId);
  const linkedOrders = s.orders.filter((o) => o.contentId === c.id || (c.designOrderId && o.id === c.designOrderId));

  const writerOwned = isWriterOwned(c, user?.fullName) || isWriterOwned(c, user?.username);

  const canAct = (perm: PermissionKey, writerDefault = false) => {
    if (isAdmin) return true;
    if (can(perm)) return true;
    if (writerDefault && writerOwned) return true;
    return false;
  };

  const apply = (t: Transition & { forced?: boolean }) => {
    const fromStatus = c.status;
    const entry: WebContentHistoryEntry = {
      at: new Date().toISOString(),
      byId: user?.id,
      byName: user?.fullName || user?.username || "—",
      action: t.action,
      fromStatus,
      toStatus: t.to,
      note: t.note,
      forced: t.forced,
    };
    const history = [...(c.history || []), entry];
    s.update("webContents", c.id, {
      status: t.to,
      ...(t.extra || {}),
      history,
    });
  };

  const createDesignOrder = () => {
    if (!can("order.create")) { toast.error("Bạn không có quyền tạo Order thiết kế"); return; }
    const o = {
      id: uid(),
      title: `Ảnh cho bài: ${c.title}`,
      brandId: c.brandId,
      type: "Ảnh bài web" as const,
      source: "Web" as const,
      requester: c.assigner || c.writer,
      assignee: undefined,
      reviewer: c.draftReviewer,
      deadline: c.deadline,
      brief: `Thiết kế ảnh cho bài viết: ${c.title}\nTừ khoá: ${c.mainKeyword || "—"}`,
      status: "Mới tạo" as const,
      contentId: c.id,
    };
    s.add("orders", o);
    s.update("webContents", c.id, { designOrderId: o.id, needsDesign: true });
  };

  const cancelContent = () => {
    if (!can("web.content_cancel")) { toast.error("Bạn không có quyền hủy Content Web"); return; }
    if (!confirm(`Hủy bài "${c.title}"? Hành động này sẽ xóa bài khỏi danh sách.`)) return;
    s.remove("webContents", c.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && (setEditing(false), onClose())}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            <span>{c.title}</span>
            <StatusBadge value={c.status} />
            <StatusBadge value={c.indexStatus} />
          </DialogTitle>
          <div className="text-xs text-muted-foreground">
            {website?.name} · {brand?.name} · {c.type}
          </div>
        </DialogHeader>

        {editing ? (
          <ContentForm
            initial={c}
            websiteId={c.websiteId}
            brandId={c.brandId}
            onSubmit={(updated) => s.update("webContents", c.id, updated)}
            onClose={() => setEditing(false)}
          />
        ) : (
          <Tabs defaultValue="workflow">
            <TabsList>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="links">Tài liệu</TabsTrigger>
              <TabsTrigger value="history"><History className="h-3.5 w-3.5 mr-1" />Lịch sử</TabsTrigger>
              {c.type === "Bài tối ưu lại" && <TabsTrigger value="optimize">Tối ưu</TabsTrigger>}
            </TabsList>

            <TabsContent value="workflow" className="mt-3 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Hành động tiếp theo</div>
                <Card><CardContent className="p-4"><WorkflowActions c={c} apply={apply} canAct={canAct} can={can} /></CardContent></Card>
              </div>
              {can("web.force_status") && c.status !== "Hoàn thành" && (
                <ForceStatusPanel c={c} apply={apply} />
              )}
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <FieldRow k="Người viết" v={c.writer} />
                <FieldRow k="Người duyệt outline" v={c.outlineReviewer} />
                <FieldRow k="Người duyệt bài" v={c.draftReviewer} />
                <FieldRow k="Người đăng" v={c.publisher} />
                <FieldRow k="Người trình bày nháp web" v={c.webDraftLayoutBy || c.publisher} />
                <FieldRow k="Người duyệt bản nháp web" v={c.webDraftReviewer} />
                <FieldRow k="Deadline outline" v={fmtDate(c.outlineDeadline)} />
                <FieldRow k="Deadline bài viết" v={fmtDate(c.deadline)} />
                <FieldRow k="Số lần sửa outline" v={c.outlineRevisions || 0} />
                <FieldRow k="Số lần sửa bài" v={c.draftRevisions || 0} />
                <FieldRow k="Số lần sửa nháp web" v={c.webDraftRevisions || 0} />
                <FieldRow k="Ngày gửi duyệt nháp web" v={c.webDraftSubmittedAt ? new Date(c.webDraftSubmittedAt).toLocaleString("vi-VN") : "—"} />
                <FieldRow k="Ngày duyệt nháp web" v={c.webDraftApprovedAt ? new Date(c.webDraftApprovedAt).toLocaleString("vi-VN") : "—"} />
              </div>
              {c.outlineReviewNotes && (
                <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                  <div className="text-xs font-semibold mb-1">Ghi chú sửa outline gần nhất</div>
                  {c.outlineReviewNotes}
                </div>
              )}
              {c.draftReviewNotes && (
                <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                  <div className="text-xs font-semibold mb-1">Ghi chú sửa bài gần nhất</div>
                  {c.draftReviewNotes}
                </div>
              )}
              {c.webDraftReviewNotes && can("web.view_web_draft_revision_note") && (
                <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                  <div className="text-xs font-semibold mb-1">Ghi chú sửa bản nháp web gần nhất</div>
                  {c.webDraftReviewNotes}
                </div>
              )}
            </TabsContent>

            <TabsContent value="info" className="mt-3">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <FieldRow k="Loại bài" v={c.type} />
                <FieldRow k="Search intent" v={c.searchIntent} />
                <FieldRow k="Cụm chủ đề" v={c.cluster} />
                <FieldRow k="URL dự kiến" v={c.url} />
                <FieldRow k="Từ khóa chính" v={c.mainKeyword} />
                <FieldRow k="Từ khóa phụ" v={c.subKeywords} />
                <FieldRow k="Ngày dự kiến đăng" v={fmtDate(c.publishDate)} />
                <FieldRow k="Ngày đăng thực tế" v={fmtDate(c.publishedAt)} />
                <FieldRow k="Plan" v={c.plan} />
                <FieldRow k="Topic" v={c.topic} />
                <FieldRow k="Người giao việc" v={c.assigner} />
                <FieldRow k="Hoàn thành" v={fmtDate(c.completedAt)} />
              </div>
              {c.brief && <div className="mt-3"><div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Brief</div><div className="rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">{c.brief}</div></div>}
              {c.notes && <div className="mt-3"><div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ghi chú</div><div className="rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">{c.notes}</div></div>}
            </TabsContent>

            <TabsContent value="links" className="mt-3 space-y-3">
              {[
                { label: "Outline", v: c.outlineLink },
                { label: "Bài viết", v: c.draftLink },
                { label: "Ảnh", v: c.imageLink },
                { label: "Bản nháp web", v: can("web.view_web_draft_url") ? c.webDraftLink : undefined },
                { label: "Bài đã đăng", v: c.publishedLink },
                { label: "Bài cũ (tối ưu)", v: c.oldLink },
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
              <div className="rounded-md border bg-card px-3 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Order thiết kế</div>
                  {!order && can("order.create") && (
                    <Button size="sm" variant="outline" onClick={createDesignOrder}>
                      <Palette className="h-4 w-4" />Tạo Order Thiết Kế
                    </Button>
                  )}
                </div>
                {order ? (
                  <div className="text-sm text-muted-foreground flex items-center justify-between">
                    <span>{order.title} — <StatusBadge value={order.status} /></span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {can("order.create") ? "Chưa có order thiết kế nào liên kết." : "Chưa có order thiết kế và bạn không được cấp quyền tạo order."}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-3">
              <HistoryList history={c.history} />
            </TabsContent>

            {c.type === "Bài tối ưu lại" && (
              <TabsContent value="optimize" className="mt-3">
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <FieldRow k="Lý do tối ưu" v={c.optimizeReason} />
                  <FieldRow k="Mục tiêu tối ưu" v={c.optimizeGoal} />
                  <FieldRow k="Link bài cũ" v={c.oldLink ? <a href={c.oldLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">Mở</a> : "—"} />
                </div>
                {c.optimizeNotes && <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">{c.optimizeNotes}</div>}
              </TabsContent>
            )}
          </Tabs>
        )}

        {!editing && (
          <DialogFooter>
            {can("web.content_cancel") && c.status !== "Hoàn thành" && (
              <Button variant="ghost" onClick={cancelContent}>Hủy bài</Button>
            )}
            {can("web.content_delete") && (
              <Button variant="ghost" onClick={() => s.remove("webContents", c.id)}>Xoá</Button>
            )}
            {can("web.content_edit") && (
              <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Chỉnh sửa</Button>
            )}
            <Button onClick={onClose}>Đóng</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({ k, v }: { k: string; v?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0">
      <span className="text-muted-foreground text-sm">{k}</span>
      <span className="font-medium text-right text-sm">{v ?? "—"}</span>
    </div>
  );
}
