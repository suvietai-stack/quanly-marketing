import { useState } from "react";
import {
  useStore, uid, todayISO, fmtDate,
  type WebContent, type ContentStatus,
} from "@/lib/store";
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
  ExternalLink, Pencil, Palette, ArrowRight, Check, X,
} from "lucide-react";
import { ContentForm } from "@/components/ContentForm";

function ActionButton({ children, onClick, variant = "default" }: any) {
  return (
    <Button size="sm" variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}

function WorkflowActions({ c, onPatch }: { c: WebContent; onPatch: (p: Partial<WebContent>) => void }) {
  const [outlineLink, setOutlineLink] = useState(c.outlineLink || "");
  const [draftLink, setDraftLink] = useState(c.draftLink || "");
  const [imageLink, setImageLink] = useState(c.imageLink || "");
  const [publishedLink, setPublishedLink] = useState(c.publishedLink || "");
  const [publishedAt, setPublishedAt] = useState(c.publishedAt || todayISO());
  const [reviewNote, setReviewNote] = useState("");

  const next = (status: ContentStatus, extra: Partial<WebContent> = {}) =>
    onPatch({ status, ...extra });

  switch (c.status) {
    case "Kế hoạch":
      return (
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => next("Đã giao")}><ArrowRight className="h-4 w-4" />Giao việc</ActionButton>
        </div>
      );
    case "Đã giao":
      return (
        <ActionButton onClick={() => next("Đang làm outline")}><ArrowRight className="h-4 w-4" />Bắt đầu làm outline</ActionButton>
      );
    case "Đang làm outline":
      return (
        <div className="space-y-2">
          <Label className="text-xs">Link outline</Label>
          <div className="flex gap-2">
            <Input value={outlineLink} onChange={(e) => setOutlineLink(e.target.value)} placeholder="https://..." />
            <Button
              disabled={!outlineLink.trim()}
              onClick={() => next("Chờ duyệt outline", { outlineLink })}
            >Gửi duyệt outline</Button>
          </div>
        </div>
      );
    case "Chờ duyệt outline":
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => next("Outline đã duyệt", { outlineReviewNotes: undefined })}>
              <Check className="h-4 w-4" />Duyệt outline
            </ActionButton>
            <ActionButton variant="destructive" onClick={() => {
              if (!reviewNote.trim()) return;
              next("Cần sửa outline", {
                outlineReviewNotes: reviewNote,
                outlineRevisions: (c.outlineRevisions || 0) + 1,
              });
              setReviewNote("");
            }}><X className="h-4 w-4" />Yêu cầu sửa outline</ActionButton>
          </div>
          <Textarea rows={2} placeholder="Ghi chú yêu cầu sửa outline (bắt buộc nếu yêu cầu sửa)..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
        </div>
      );
    case "Cần sửa outline":
      return (
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
            <Button onClick={() => next("Chờ duyệt outline", { outlineLink })}>Gửi duyệt lại outline</Button>
          </div>
        </div>
      );
    case "Outline đã duyệt":
      return <ActionButton onClick={() => next("Đang viết bài")}><ArrowRight className="h-4 w-4" />Bắt đầu viết bài</ActionButton>;
    case "Đang viết bài":
      return (
        <div className="space-y-2">
          <Label className="text-xs">Link bài viết</Label>
          <Input value={draftLink} onChange={(e) => setDraftLink(e.target.value)} placeholder="https://..." />
          <Label className="text-xs">Link ảnh (nếu có)</Label>
          <Input value={imageLink} onChange={(e) => setImageLink(e.target.value)} />
          <Button disabled={!draftLink.trim()} onClick={() => next("Chờ duyệt bài", { draftLink, imageLink })}>
            Gửi duyệt bài
          </Button>
        </div>
      );
    case "Chờ duyệt bài":
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => next("Bài đã duyệt", { draftReviewNotes: undefined })}>
              <Check className="h-4 w-4" />Duyệt bài
            </ActionButton>
            <ActionButton variant="destructive" onClick={() => {
              if (!reviewNote.trim()) return;
              next("Cần sửa bài", {
                draftReviewNotes: reviewNote,
                draftRevisions: (c.draftRevisions || 0) + 1,
              });
              setReviewNote("");
            }}><X className="h-4 w-4" />Yêu cầu sửa bài</ActionButton>
          </div>
          <Textarea rows={2} placeholder="Ghi chú yêu cầu sửa bài..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
        </div>
      );
    case "Cần sửa bài":
      return (
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
            <Button onClick={() => next("Chờ duyệt bài", { draftLink })}>Gửi duyệt lại bài</Button>
          </div>
        </div>
      );
    case "Bài đã duyệt":
      return <ActionButton onClick={() => next("Chờ đăng web")}><ArrowRight className="h-4 w-4" />Chuyển sang chờ đăng</ActionButton>;
    case "Chờ đăng web":
      return (
        <div className="space-y-2">
          <Label className="text-xs">Link bài đã đăng</Label>
          <Input value={publishedLink} onChange={(e) => setPublishedLink(e.target.value)} placeholder="https://..." />
          <Label className="text-xs">Ngày đăng thực tế</Label>
          <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
          <Button disabled={!publishedLink.trim()} onClick={() => next("Đã đăng web", { publishedLink, publishedAt })}>
            Xác nhận đã đăng
          </Button>
        </div>
      );
    case "Đã đăng web":
      return (
        <div className="space-y-2">
          <Label className="text-xs">Trạng thái index</Label>
          <Select value={c.indexStatus} onValueChange={(v) => onPatch({ indexStatus: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s) =>
                <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => next("Kiểm tra index")}><ArrowRight className="h-4 w-4" />Chuyển sang kiểm tra index</Button>
        </div>
      );
    case "Kiểm tra index":
      return (
        <div className="space-y-2">
          <Label className="text-xs">Trạng thái index</Label>
          <Select value={c.indexStatus} onValueChange={(v) => onPatch({ indexStatus: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s) =>
                <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Ghi chú index..." value={c.indexNotes || ""} onChange={(e) => onPatch({ indexNotes: e.target.value })} />
          <Button onClick={() => next("Hoàn thành", { completedAt: todayISO() })}>
            <Check className="h-4 w-4" />Hoàn thành
          </Button>
        </div>
      );
    case "Hoàn thành":
      return (
        <div className="rounded-md bg-success/10 border border-success/30 p-3 text-sm text-success font-medium">
          Bài đã hoàn thành{c.completedAt ? ` ngày ${fmtDate(c.completedAt)}` : ""}.
        </div>
      );
  }
}

function FieldRow({ k, v }: { k: string; v?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0">
      <span className="text-muted-foreground text-sm">{k}</span>
      <span className="font-medium text-right text-sm">{v ?? "—"}</span>
    </div>
  );
}

export function ContentDetail({
  content, open, onClose,
}: {
  content: WebContent | null;
  open: boolean;
  onClose: () => void;
}) {
  const s = useStore();
  const [editing, setEditing] = useState(false);

  if (!content) return null;
  const c = s.webContents.find((x) => x.id === content.id) || content;
  const website = s.websites.find((w) => w.id === c.websiteId);
  const brand = s.brands.find((b) => b.id === c.brandId);
  const order = c.designOrderId ? s.orders.find((o) => o.id === c.designOrderId) : undefined;

  const patch = (p: Partial<WebContent>) => s.update("webContents", c.id, p);

  const createDesignOrder = () => {
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
    patch({ designOrderId: o.id, needsDesign: true });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && (setEditing(false), onClose())}>
      <DialogContent className="max-w-4xl">
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
              {c.type === "Bài tối ưu lại" && <TabsTrigger value="optimize">Tối ưu</TabsTrigger>}
            </TabsList>

            <TabsContent value="workflow" className="mt-3 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Hành động tiếp theo</div>
                <Card><CardContent className="p-4"><WorkflowActions c={c} onPatch={patch} /></CardContent></Card>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <FieldRow k="Người viết" v={c.writer} />
                <FieldRow k="Người duyệt outline" v={c.outlineReviewer} />
                <FieldRow k="Người duyệt bài" v={c.draftReviewer} />
                <FieldRow k="Người đăng" v={c.publisher} />
                <FieldRow k="Deadline outline" v={fmtDate(c.outlineDeadline)} />
                <FieldRow k="Deadline bài viết" v={fmtDate(c.deadline)} />
                <FieldRow k="Số lần sửa outline" v={c.outlineRevisions || 0} />
                <FieldRow k="Số lần sửa bài" v={c.draftRevisions || 0} />
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
                  {!order && (
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
                  <div className="text-xs text-muted-foreground">Chưa có order thiết kế nào liên kết.</div>
                )}
              </div>
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
            <Button variant="ghost" onClick={() => s.remove("webContents", c.id)}>Xoá</Button>
            <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Chỉnh sửa</Button>
            <Button onClick={onClose}>Đóng</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
