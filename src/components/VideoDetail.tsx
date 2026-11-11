import { useState } from "react";
import {
  useStore, uid, fmtDate,
  type Video, type VideoStatus, type VideoHistoryEntry,
  VIDEO_STATUSES, VIDEO_TYPES, VIDEO_USE_CHANNELS,
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
import { SpecialtyStaffPicker } from "@/components/SpecialtyStaffPicker";
import { toast } from "sonner";
import { saveDesignOrder } from '@/lib/orders/api';
import { designCan } from '@/lib/orders/design';
import { Send, Check, X, RotateCcw, CheckCheck, Play, Undo2, AlertTriangle, History as HistoryIcon, Camera, Scissors, Package, Palette } from "lucide-react";

export function emptyVideo(brandId: string): Video {
  return {
    id: uid(), title: "", brandId,
    status: "Kế hoạch", revisions: 0, history: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function VideoFormFields({ value, onChange }: { value: Video; onChange: (v: Video) => void }) {
  const { brands, people, plans, topics, socialPosts } = useStore();
  const set = (x: Partial<Video>) => onChange({ ...value, ...x });
  const personSelect = (val: string | undefined, on: (v?: string) => void) => (
    <Select value={val || "_"} onValueChange={(v) => on(v === "_" ? undefined : v)}>
      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent><SelectItem value="_">—</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
    </Select>
  );
  return (
    <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="sm:col-span-2"><Label>Tên video *</Label>
        <Input value={value.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div><Label>Thương hiệu *</Label>
        <Select value={value.brandId} onValueChange={(v) => set({ brandId: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Loại video</Label>
        <Select value={value.videoType || "_"} onValueChange={(v) => set({ videoType: v === "_" ? undefined : (v as any) })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{VIDEO_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select></div>
      <div className="sm:col-span-2"><Label>Kênh sử dụng</Label>
        <Input value={value.channels || ""} onChange={(e) => set({ channels: e.target.value })} placeholder={VIDEO_USE_CHANNELS.join(", ")} /></div>
      <div><Label>Mục đích video</Label>
        <Input value={value.purpose || ""} onChange={(e) => set({ purpose: e.target.value })} /></div>
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
      <div className="sm:col-span-2"><Label>Mô tả / brief</Label>
        <Textarea rows={2} value={value.description || ""} onChange={(e) => set({ description: e.target.value })} /></div>

      <div><Label>Người giao việc</Label>{personSelect(value.assigner, (v) => set({ assigner: v }))}</div>
      <div><Label>Người phụ trách</Label><SpecialtyStaffPicker specialty="video" value={value.owner} valueId={value.ownerId} onChange={(v, id) => set({ owner: v, ownerId: id })} people={people} /></div>
      <div><Label>Người duyệt</Label>{personSelect(value.reviewer, (v) => set({ reviewer: v }))}</div>
      <div><Label>Deadline kịch bản</Label>
        <Input type="date" value={value.scriptDeadline || ""} onChange={(e) => set({ scriptDeadline: e.target.value })} /></div>
      <div><Label>Deadline video *</Label>
        <Input type="date" value={value.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} /></div>
      <div><Label>Ngày dự kiến đăng</Label>
        <Input type="date" value={value.scheduledPublishDate || ""} onChange={(e) => set({ scheduledPublishDate: e.target.value })} /></div>

      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2 border-t pt-3">
        <div className="sm:col-span-2 text-xs font-medium text-muted-foreground">Tài liệu</div>
        <div><Label>Link kịch bản</Label>
          <Input value={value.scriptLink || ""} onChange={(e) => set({ scriptLink: e.target.value })} /></div>
        <div><Label>Link footage</Label>
          <Input value={value.footageLink || ""} onChange={(e) => set({ footageLink: e.target.value })} /></div>
        <div><Label>Link bản dựng</Label>
          <Input value={value.editLink || ""} onChange={(e) => set({ editLink: e.target.value })} /></div>
        <div><Label>Link video hoàn thiện</Label>
          <Input value={value.finalLink || ""} onChange={(e) => set({ finalLink: e.target.value })} /></div>
        <div><Label>Link video đã đăng</Label>
          <Input value={value.publishedLink || ""} onChange={(e) => set({ publishedLink: e.target.value })} /></div>
        <div><Label>Link tài nguyên</Label>
          <Input value={value.resourcesLink || ""} onChange={(e) => set({ resourcesLink: e.target.value })} /></div>
      </div>

      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2 border-t pt-3">
        <div className="sm:col-span-2 text-xs font-medium text-muted-foreground">Liên kết Social</div>
        <div><Label>Bài social liên quan</Label>
          <Select value={value.socialPostId || "_"} onValueChange={(v) => set({ socialPostId: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">—</SelectItem>
              {socialPosts.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select></div>
        <div><Label>Kênh social sử dụng</Label>
          <Input value={value.socialChannel || ""} onChange={(e) => set({ socialChannel: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Link bài social đã đăng</Label>
          <Input value={value.socialPublishedLink || ""} onChange={(e) => set({ socialPublishedLink: e.target.value })} /></div>
      </div>

      <div className="sm:col-span-2"><Label>Ghi chú nội bộ</Label>
        <Textarea rows={2} value={value.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>
    </div>
  );
}

export function VideoFormDialog({
  open, onOpenChange, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Video;
  onSubmit: (v: Video) => void;
}) {
  const { brands } = useStore();
  const [v, setV] = useState<Video>(initial ?? emptyVideo(brands[0]?.id || ""));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{initial ? "Chỉnh sửa video" : "Tạo video mới"}</DialogTitle></DialogHeader>
        <VideoFormFields value={v} onChange={setV} />
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={() => {
            if (!v.title.trim()) { toast.error("Nhập tên video"); return; }
            if (!v.brandId) { toast.error("Chọn thương hiệu"); return; }
            onSubmit(v); onOpenChange(false);
          }}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VideoDetailDialog({
  open, onOpenChange, video,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  video: Video;
}) {
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const [draft, setDraft] = useState<Video>(video);
  const [reviewNote, setReviewNote] = useState("");
  const [forceTo, setForceTo] = useState<VideoStatus>(video.status);
  const [forceReason, setForceReason] = useState("");

  const userName = user?.fullName || user?.username || "Hệ thống";
  const isOwner = !!user && (video.ownerId === user.id || video.owner === userName);
  const canAct = (perm: PermissionKey, byOwner = false) =>
    isAdmin || can(perm) || (byOwner && isOwner);

  function pushHistory(entry: Omit<VideoHistoryEntry, "at" | "byId" | "byName">): VideoHistoryEntry[] {
    return [...(video.history || []), {
      ...entry, at: new Date().toISOString(), byId: user?.id, byName: userName,
    }];
  }

  function transition(toStatus: VideoStatus, action: string, opts?: { note?: string; bumpRevisions?: boolean; forced?: boolean; extra?: Partial<Video> }) {
    const history = pushHistory({ action, fromStatus: video.status, toStatus, note: opts?.note, forced: opts?.forced });
    const patch: Partial<Video> = {
      status: toStatus, history,
      reviewNotes: opts?.note ?? video.reviewNotes,
      ...(opts?.bumpRevisions ? { revisions: (video.revisions || 0) + 1 } : {}),
      ...(opts?.extra || {}),
    };
    if (toStatus === "Hoàn thành" && !video.completedAt) patch.completedAt = new Date().toISOString().slice(0, 10);
    s.update("videos", video.id, patch);
    toast.success(action);
    onOpenChange(false);
  }

  function saveDraft() {
    const { id, status, history, revisions, reviewNotes, ...rest } = draft;
    s.update("videos", video.id, rest);
    toast.success("Đã lưu thay đổi");
  }

  async function createDesignOrderForThumbnail() {
    if (!designCan(can,'marketing_design','create')) {toast.error('Không có quyền tạo Ấn phẩm Marketing');return;}
    if (s.orders.some(o=>o.videoId===video.id && o.type==='Thumbnail video')) {toast.info('Video đã có yêu cầu Thumbnail');return;}
    const brand = s.brands.find((b) => b.id === video.brandId);
    try { await saveDesignOrder(uid(), {
      title: `Thumbnail / ảnh cho video ${video.title}`,
      brandId: video.brandId,
      type: "Thumbnail video",
      source: "Video",
      workflowKind: 'marketing_design',
      videoId: video.id,
      reviewer: userName,
      requester: userName,
      refLink: video.finalLink || video.editLink,
      status: "Chờ phân công",
      history: [{at:new Date().toISOString(),byId:user?.id,byName:userName,action:'Tạo Order Thumbnail từ Video',toStatus:'Chờ phân công'}],
      brief: `Cần thumbnail / ảnh cho video "${video.title}"${brand ? ` của ${brand.name}` : ""}.`,
    }); await s.reload();
    toast.success("Đã tạo Order Thiết Kế cho video");
    } catch(e) {toast.error(e instanceof Error?e.message:'Không tạo được Order');}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            <span>{video.title}</span>
            <StatusBadge value={video.status} />
            {!!video.revisions && <span className="text-xs text-muted-foreground">Sửa {video.revisions} lần</span>}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="history"><HistoryIcon className="h-3.5 w-3.5 mr-1" />Lịch sử</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-3">
            <VideoFormFields value={draft} onChange={setDraft} />
            <div className="flex justify-between mt-3">
              <Button variant="outline" onClick={createDesignOrderForThumbnail}>
                <Palette className="h-4 w-4 mr-1" />+ Tạo Order Thiết Kế
              </Button>
              <Button onClick={saveDraft} variant="outline">Lưu thay đổi</Button>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="mt-3 space-y-4">
            <div className="rounded-md border p-3 bg-muted/30 text-sm grid sm:grid-cols-3 gap-2">
              <div><span className="text-muted-foreground">Phụ trách:</span> {video.owner || "—"}</div>
              <div><span className="text-muted-foreground">Người duyệt:</span> {video.reviewer || "—"}</div>
              <div><span className="text-muted-foreground">Deadline:</span> {fmtDate(video.deadline)}</div>
            </div>

            {(video.status === "Chờ duyệt kịch bản" || video.status === "Chờ duyệt video" ||
              video.status === "Cần sửa kịch bản" || video.status === "Cần sửa video" ||
              video.status === "Đang làm kịch bản" || video.status === "Đang dựng") && (
              <div>
                <Label>Ghi chú duyệt / sửa</Label>
                <Textarea rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Ghi chú gửi cho người liên quan..." />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {video.status === "Kế hoạch" && canAct("video.assign") && (
                <Button onClick={() => {
                  if (!draft.owner || !draft.deadline) { toast.error("Cần có người phụ trách & deadline trước khi giao"); return; }
                  saveDraft();
                  transition("Đã giao", "Giao video");
                }}><Send className="h-4 w-4 mr-1" />Giao video</Button>
              )}

              {video.status === "Đã giao" && canAct("video.script_start", true) && (
                <Button onClick={() => transition("Đang làm kịch bản", "Bắt đầu làm kịch bản")}>
                  <Play className="h-4 w-4 mr-1" />Bắt đầu làm kịch bản
                </Button>
              )}

              {video.status === "Đang làm kịch bản" && canAct("video.script_submit", true) && (
                <Button onClick={() => {
                  if (!draft.scriptLink) { toast.error("Cần nhập link kịch bản"); return; }
                  saveDraft();
                  transition("Chờ duyệt kịch bản", "Gửi duyệt kịch bản", { note: reviewNote });
                }}><Send className="h-4 w-4 mr-1" />Gửi duyệt kịch bản</Button>
              )}

              {video.status === "Chờ duyệt kịch bản" && (
                <>
                  {canAct("video.script_approve") && (
                    <Button onClick={() => transition("Kịch bản đã duyệt", "Duyệt kịch bản", { note: reviewNote })}>
                      <Check className="h-4 w-4 mr-1" />Duyệt kịch bản
                    </Button>
                  )}
                  {canAct("video.script_reject") && (
                    <Button variant="outline" onClick={() => {
                      if (!reviewNote.trim()) { toast.error("Nhập ghi chú yêu cầu sửa"); return; }
                      transition("Cần sửa kịch bản", "Yêu cầu sửa kịch bản", { note: reviewNote });
                    }}><RotateCcw className="h-4 w-4 mr-1" />Yêu cầu sửa kịch bản</Button>
                  )}
                </>
              )}

              {video.status === "Cần sửa kịch bản" && canAct("video.script_resubmit", true) && (
                <Button onClick={() => {
                  saveDraft();
                  transition("Chờ duyệt kịch bản", "Gửi duyệt lại kịch bản", { note: reviewNote, bumpRevisions: true });
                }}><Send className="h-4 w-4 mr-1" />Gửi duyệt lại kịch bản</Button>
              )}

              {video.status === "Kịch bản đã duyệt" && canAct("video.move_shooting") && (
                <Button onClick={() => transition("Đang quay / thu tư liệu", "Chuyển sang quay / thu tư liệu")}>
                  <Camera className="h-4 w-4 mr-1" />Chuyển sang quay / thu tư liệu
                </Button>
              )}

              {video.status === "Đang quay / thu tư liệu" && canAct("video.move_editing", true) && (
                <Button onClick={() => { saveDraft(); transition("Đang dựng", "Chuyển sang đang dựng"); }}>
                  <Scissors className="h-4 w-4 mr-1" />Chuyển sang đang dựng
                </Button>
              )}

              {video.status === "Đang dựng" && canAct("video.submit", true) && (
                <Button onClick={() => {
                  if (!draft.editLink) { toast.error("Cần nhập link bản dựng"); return; }
                  saveDraft();
                  transition("Chờ duyệt video", "Gửi duyệt video", { note: reviewNote });
                }}><Send className="h-4 w-4 mr-1" />Gửi duyệt video</Button>
              )}

              {video.status === "Chờ duyệt video" && (
                <>
                  {canAct("video.approve") && (
                    <Button onClick={() => transition("Video đã duyệt", "Duyệt video", { note: reviewNote })}>
                      <Check className="h-4 w-4 mr-1" />Duyệt video
                    </Button>
                  )}
                  {canAct("video.reject") && (
                    <Button variant="outline" onClick={() => {
                      if (!reviewNote.trim()) { toast.error("Nhập ghi chú yêu cầu sửa"); return; }
                      transition("Cần sửa video", "Yêu cầu sửa video", { note: reviewNote });
                    }}><RotateCcw className="h-4 w-4 mr-1" />Yêu cầu sửa video</Button>
                  )}
                </>
              )}

              {video.status === "Cần sửa video" && canAct("video.resubmit", true) && (
                <Button onClick={() => {
                  saveDraft();
                  transition("Chờ duyệt video", "Gửi duyệt lại video", { note: reviewNote, bumpRevisions: true });
                }}><Send className="h-4 w-4 mr-1" />Gửi duyệt lại video</Button>
              )}

              {video.status === "Video đã duyệt" && canAct("video.deliver") && (
                <Button onClick={() => {
                  if (!draft.finalLink) { toast.error("Cần nhập link video hoàn thiện"); return; }
                  saveDraft();
                  transition("Đã bàn giao", "Bàn giao video");
                }}><Package className="h-4 w-4 mr-1" />Bàn giao video</Button>
              )}

              {video.status === "Đã bàn giao" && (
                <>
                  {canAct("video.confirm_published") && (
                    <Button onClick={() => {
                      saveDraft();
                      transition("Đã đăng", "Xác nhận đã đăng video");
                    }}><CheckCheck className="h-4 w-4 mr-1" />Xác nhận đã đăng</Button>
                  )}
                  {canAct("video.complete") && (
                    <Button variant="secondary" onClick={() => transition("Hoàn thành", "Hoàn thành video")}>
                      <Check className="h-4 w-4 mr-1" />Hoàn thành
                    </Button>
                  )}
                </>
              )}

              {video.status === "Đã đăng" && canAct("video.complete") && (
                <Button onClick={() => transition("Hoàn thành", "Hoàn thành video")}>
                  <Check className="h-4 w-4 mr-1" />Hoàn thành
                </Button>
              )}

              {video.status === "Đã hủy" && canAct("video.restore") && (
                <Button variant="outline" onClick={() => transition("Kế hoạch", "Khôi phục video đã hủy")}>
                  <Undo2 className="h-4 w-4 mr-1" />Khôi phục
                </Button>
              )}

              {video.status !== "Đã hủy" && video.status !== "Hoàn thành" && canAct("video.cancel") && (
                <Button variant="destructive" onClick={() => {
                  const earlyStages = video.status === "Kế hoạch" || video.status === "Đã giao";
                  if (!earlyStages && !reviewNote.trim()) { toast.error("Nhập lý do hủy"); return; }
                  transition("Đã hủy", "Hủy video", { note: reviewNote });
                }}><X className="h-4 w-4 mr-1" />Hủy video</Button>
              )}
            </div>

            {canAct("video.force_status") && (
              <div className="rounded-lg border border-dashed p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" />Ép chuyển trạng thái (chỉ dùng khi cần)
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={forceTo} onValueChange={(v) => setForceTo(v as VideoStatus)}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{VIDEO_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="flex-1 min-w-[200px]" placeholder="Lý do bắt buộc..." value={forceReason} onChange={(e) => setForceReason(e.target.value)} />
                  <Button variant="secondary" onClick={() => {
                    if (!forceReason.trim()) { toast.error("Nhập lý do ép trạng thái"); return; }
                    if (forceTo === video.status) { toast.error("Trạng thái không thay đổi"); return; }
                    transition(forceTo, `Ép chuyển sang "${forceTo}"`, { note: forceReason, forced: true });
                  }}>Ép chuyển</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            {(video.history || []).length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">Chưa có lịch sử xử lý.</div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {[...(video.history || [])].reverse().map((h, i) => (
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
