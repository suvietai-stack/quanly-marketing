import { useMemo, useState } from "react";
import {
  useStore, uid, fmtDate,
  type SocialChannel, type SocialPost, type SocialStatus, type SocialPostHistoryEntry,
  SOCIAL_CONTENT_TYPES, SOCIAL_STATUSES,
} from "@/lib/store";
import { useCurrentUser, type PermissionKey } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Send, Check, X, RotateCcw, CheckCheck, Play, Undo2, AlertTriangle, History as HistoryIcon } from "lucide-react";

function makeEmptyPost(channel: SocialChannel): SocialPost {
  return {
    id: uid(), title: "", brandId: channel.brandId, channelId: channel.id,
    platform: channel.platform, contentType: "Bài ảnh đơn",
    status: "Kế hoạch", revisions: 0, history: [],
  };
}

function InfoFields({ value, onChange }: { value: SocialPost; onChange: (p: SocialPost) => void }) {
  const { people, plans, topics } = useStore();
  const set = (x: Partial<SocialPost>) => onChange({ ...value, ...x });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><Label>Tên bài đăng *</Label>
        <Input value={value.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div><Label>Loại nội dung</Label>
        <Select value={value.contentType} onValueChange={(v) => set({ contentType: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{SOCIAL_CONTENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Chủ đề triển khai</Label>
        <Select value={value.topic || "_"} onValueChange={(v) => set({ topic: v === "_" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{topics.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Plan liên quan</Label>
        <Select value={value.plan || "_"} onValueChange={(v) => set({ plan: v === "_" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{plans.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Người viết</Label>
        <SpecialtyStaffPicker specialty="social" value={value.writer} onChange={(v) => set({ writer: v })} people={people} /></div>
      <div><Label>Người duyệt</Label>
        <Select value={value.reviewer || "_"} onValueChange={(v) => set({ reviewer: v === "_" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((x) => <SelectItem key={x.id} value={x.name}>{x.name}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Người đăng</Label>
        <Select value={value.publisher || "_"} onValueChange={(v) => set({ publisher: v === "_" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((x) => <SelectItem key={x.id} value={x.name}>{x.name}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Thiết kế / Video</Label>
        <SpecialtyStaffPicker specialty="design" value={value.designer} onChange={(v) => set({ designer: v })} people={people} /></div>
      <div><Label>Ngày dự kiến đăng</Label>
        <Input type="date" value={value.scheduledDate || ""} onChange={(e) => set({ scheduledDate: e.target.value })} /></div>
      <div><Label>Ngày đăng thực tế</Label>
        <Input type="date" value={value.publishedDate || ""} onChange={(e) => set({ publishedDate: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Caption / Nội dung</Label>
        <Textarea rows={3} value={value.caption || ""} onChange={(e) => set({ caption: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Ghi chú</Label>
        <Textarea rows={2} value={value.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>
    </div>
  );
}

function DocsFields({ value, onChange }: { value: SocialPost; onChange: (p: SocialPost) => void }) {
  const set = (x: Partial<SocialPost>) => onChange({ ...value, ...x });
  return (
    <div className="grid gap-3">
      <div><Label>Link ảnh / video</Label>
        <Input value={value.mediaLink || ""} onChange={(e) => set({ mediaLink: e.target.value })} placeholder="https://drive.google.com/..." /></div>
      <div><Label>Link bài đã đăng</Label>
        <Input value={value.publishedLink || ""} onChange={(e) => set({ publishedLink: e.target.value })} placeholder="https://facebook.com/..." /></div>
    </div>
  );
}

function PostFormFields({ value, onChange }: { value: SocialPost; onChange: (p: SocialPost) => void }) {
  return (
    <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
      <InfoFields value={value} onChange={onChange} />
      <DocsFields value={value} onChange={onChange} />
    </div>
  );
}


/** Dialog tạo bài mới — dùng từ trang danh sách kênh và workspace */
export function PostFormDialog({
  open, onOpenChange, channel, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  channel: SocialChannel;
  initial?: SocialPost;
  onSubmit: (p: SocialPost) => void;
}) {
  const [p, setP] = useState<SocialPost>(initial ?? makeEmptyPost(channel));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Chỉnh sửa bài social" : `Tạo bài cho ${channel.name}`}</DialogTitle>
        </DialogHeader>
        <PostFormFields value={p} onChange={setP} />
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={() => {
            if (!p.title) { toast.error("Nhập tên bài đăng"); return; }
            onSubmit({ ...p, channelId: channel.id, brandId: channel.brandId, platform: channel.platform });
            onOpenChange(false);
          }}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Dialog chi tiết bài + workflow + lịch sử */
export function PostDetailDialog({
  open, onOpenChange, channel, post,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  channel: SocialChannel;
  post: SocialPost;
}) {
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const [draft, setDraft] = useState<SocialPost>(post);
  const [reviewNote, setReviewNote] = useState("");
  const [forceTo, setForceTo] = useState<SocialStatus>(post.status);
  const [forceReason, setForceReason] = useState("");

  const userName = user?.fullName || user?.username || "Hệ thống";
  const isWriter = !!user && (post.writer === userName);

  // Mặc định: người viết được "Bắt đầu làm", "Gửi duyệt", "Gửi duyệt lại" mà không cần permission riêng.
  const canAct = (perm: PermissionKey, byWriter = false) =>
    isAdmin || can(perm) || (byWriter && isWriter);

  function pushHistory(entry: Omit<SocialPostHistoryEntry, "at" | "byId" | "byName">) {
    const history = [...(post.history || []), {
      ...entry, at: new Date().toISOString(), byId: user?.id, byName: userName,
    }];
    return history;
  }

  function transition(toStatus: SocialStatus, action: string, opts?: { note?: string; bumpRevisions?: boolean; forced?: boolean; extra?: Partial<SocialPost> }) {
    const history = pushHistory({
      action, fromStatus: post.status, toStatus, note: opts?.note, forced: opts?.forced,
    });
    const patch: Partial<SocialPost> = {
      status: toStatus, history,
      reviewNotes: opts?.note ?? post.reviewNotes,
      ...(opts?.bumpRevisions ? { revisions: (post.revisions || 0) + 1 } : {}),
      ...(opts?.extra || {}),
    };
    s.update("socialPosts", post.id, patch);
    toast.success(action);
    onOpenChange(false);
  }

  function saveDraft() {
    s.update("socialPosts", post.id, {
      title: draft.title, contentType: draft.contentType, topic: draft.topic, plan: draft.plan,
      writer: draft.writer, reviewer: draft.reviewer, publisher: draft.publisher, designer: draft.designer,
      scheduledDate: draft.scheduledDate, publishedDate: draft.publishedDate,
      caption: draft.caption, mediaLink: draft.mediaLink, publishedLink: draft.publishedLink,
      notes: draft.notes,
    });
    toast.success("Đã lưu thay đổi");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{post.title}</span>
            <StatusBadge value={post.status} />
            {!!post.revisions && <span className="text-xs text-muted-foreground">Sửa {post.revisions} lần</span>}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="workflow">
          <TabsList>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="docs">Tài liệu</TabsTrigger>
            <TabsTrigger value="history"><HistoryIcon className="h-3.5 w-3.5 mr-1" />Lịch sử xử lý</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-3">
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <InfoFields value={draft} onChange={setDraft} />
            </div>
            <div className="flex justify-end mt-3">
              <Button onClick={saveDraft} variant="outline">Lưu thay đổi</Button>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="mt-3">
            <DocsFields value={draft} onChange={setDraft} />
            <div className="flex justify-end mt-3">
              <Button onClick={saveDraft} variant="outline">Lưu tài liệu</Button>
            </div>
          </TabsContent>


          <TabsContent value="workflow" className="mt-3 space-y-4">
            {(post.status === "Chờ duyệt" || post.status === "Đang làm" || post.status === "Cần sửa") && (
              <div>
                <Label>Ghi chú duyệt / sửa</Label>
                <Textarea rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Ghi chú gửi cho người liên quan..." />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {post.status === "Kế hoạch" && canAct("social.post_start", true) && (
                <Button onClick={() => transition("Đang làm", "Bắt đầu làm bài")}>
                  <Play className="h-4 w-4 mr-1" />Bắt đầu làm
                </Button>
              )}
              {post.status === "Đang làm" && canAct("social.post_submit", true) && (
                <Button onClick={() => transition("Chờ duyệt", "Gửi duyệt", { note: reviewNote })}>
                  <Send className="h-4 w-4 mr-1" />Gửi duyệt
                </Button>
              )}
              {post.status === "Chờ duyệt" && (
                <>
                  {canAct("social.post_approve") && (
                    <Button onClick={() => transition("Đã duyệt", "Duyệt bài", { note: reviewNote })}>
                      <Check className="h-4 w-4 mr-1" />Duyệt bài
                    </Button>
                  )}
                  {canAct("social.post_request_changes") && (
                    <Button variant="outline" onClick={() => {
                      if (!reviewNote.trim()) { toast.error("Nhập ghi chú yêu cầu sửa"); return; }
                      transition("Cần sửa", "Yêu cầu sửa bài", { note: reviewNote });
                    }}>
                      <RotateCcw className="h-4 w-4 mr-1" />Yêu cầu sửa
                    </Button>
                  )}
                </>
              )}
              {post.status === "Cần sửa" && canAct("social.post_resubmit", true) && (
                <Button onClick={() => transition("Chờ duyệt", "Gửi duyệt lại", { note: reviewNote, bumpRevisions: true })}>
                  <Send className="h-4 w-4 mr-1" />Gửi duyệt lại
                </Button>
              )}
              {post.status === "Đã duyệt" && canAct("social.post_move_pending_publish") && (
                <Button onClick={() => transition("Chờ đăng", "Chuyển sang chờ đăng")}>
                  Chuyển sang chờ đăng
                </Button>
              )}
              {post.status === "Chờ đăng" && canAct("social.post_confirm_published") && (
                <Button onClick={() => {
                  if (!draft.publishedLink) { toast.error("Nhập link bài đã đăng trước"); return; }
                  saveDraft();
                  transition("Đã đăng", "Xác nhận đã đăng", {
                    extra: {
                      publishedDate: draft.publishedDate || new Date().toISOString().slice(0, 10),
                      publishedLink: draft.publishedLink,
                    },
                  });
                }}>
                  <CheckCheck className="h-4 w-4 mr-1" />Xác nhận đã đăng
                </Button>
              )}
              {post.status === "Đã đăng" && canAct("social.post_complete") && (
                <Button onClick={() => transition("Hoàn thành", "Hoàn thành bài")}>
                  <Check className="h-4 w-4 mr-1" />Hoàn thành
                </Button>
              )}
              {post.status === "Đã hủy" && canAct("social.post_restore") && (
                <Button variant="outline" onClick={() => transition("Kế hoạch", "Khôi phục bài đã hủy")}>
                  <Undo2 className="h-4 w-4 mr-1" />Khôi phục
                </Button>
              )}
              {post.status !== "Đã hủy" && post.status !== "Hoàn thành" && canAct("social.post_cancel") && (
                <Button variant="destructive" onClick={() => {
                  const earlyStages = post.status === "Kế hoạch" || post.status === "Đang làm";
                  if (!earlyStages && !reviewNote.trim()) { toast.error("Nhập lý do hủy"); return; }
                  transition("Đã hủy", "Hủy bài", { note: reviewNote });
                }}>
                  <X className="h-4 w-4 mr-1" />Hủy bài
                </Button>
              )}
            </div>

            {canAct("social.post_force_status") && (
              <div className="rounded-lg border border-dashed p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" />Ép chuyển trạng thái (chỉ dùng khi cần)
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={forceTo} onValueChange={(v) => setForceTo(v as SocialStatus)}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{SOCIAL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="flex-1 min-w-[200px]" placeholder="Lý do bắt buộc..." value={forceReason} onChange={(e) => setForceReason(e.target.value)} />
                  <Button variant="secondary" onClick={() => {
                    if (!forceReason.trim()) { toast.error("Nhập lý do ép trạng thái"); return; }
                    if (forceTo === post.status) { toast.error("Trạng thái không thay đổi"); return; }
                    transition(forceTo, `Ép chuyển sang "${forceTo}"`, { note: forceReason, forced: true });
                  }}>Ép chuyển</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            {(post.history || []).length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">Chưa có lịch sử xử lý.</div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {[...(post.history || [])].reverse().map((h, i) => (
                  <div key={i} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{h.byName || "—"}</span>
                      <span className="text-muted-foreground">— {h.action}</span>
                      {h.forced && <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">Ép</span>}
                      <span className="ml-auto text-xs text-muted-foreground">{fmtDate(h.at)}</span>
                    </div>
                    {(h.fromStatus || h.toStatus) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {h.fromStatus || "—"} → <span className="text-foreground">{h.toStatus || "—"}</span>
                      </div>
                    )}
                    {h.note && <div className="mt-1 text-sm">{h.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/** Helper hook chỉ trả posts của 1 kênh */
export function useChannelPosts(channelId: string) {
  const posts = useStore((s) => s.socialPosts);
  return useMemo(() => posts.filter((p) => p.channelId === channelId), [posts, channelId]);
}
