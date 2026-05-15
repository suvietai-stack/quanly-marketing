import { useState } from "react";
import {
  useStore, uid, todayISO, CONTENT_TYPES, CONTENT_STATUSES, SEARCH_INTENTS,
  INDEX_STATUSES, OPTIMIZE_REASONS,
  type WebContent, type ContentStatus, type ContentType, type WebTopic,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { ExternalLink, Plus } from "lucide-react";
import { TopicDialog } from "@/components/KeywordResearchTab";

export function ContentForm({
  initial, websiteId, brandId, onSubmit, onClose, lockWebsite = true,
}: {
  initial?: Partial<WebContent>;
  websiteId?: string;
  brandId?: string;
  onSubmit: (c: WebContent) => void;
  onClose: () => void;
  lockWebsite?: boolean;
}) {
  const { people, plans, websites, brands, webTopics } = useStore();
  const [c, setC] = useState<WebContent>({
    id: initial?.id || uid(),
    websiteId: initial?.websiteId || websiteId || websites[0]?.id || "",
    brandId: initial?.brandId || brandId || websites.find(w => w.id === (initial?.websiteId || websiteId))?.brandId || brands[0]?.id || "",
    type: initial?.type || "Bài SEO",
    cluster: initial?.cluster,
    mainKeyword: initial?.mainKeyword,
    subKeywords: initial?.subKeywords,
    searchIntent: initial?.searchIntent,
    title: initial?.title || "",
    url: initial?.url,
    brief: initial?.brief,
    assigner: initial?.assigner,
    writer: initial?.writer,
    outlineReviewer: initial?.outlineReviewer,
    draftReviewer: initial?.draftReviewer,
    publisher: initial?.publisher,
    outlineDeadline: initial?.outlineDeadline,
    deadline: initial?.deadline,
    publishDate: initial?.publishDate,
    publishedAt: initial?.publishedAt,
    completedAt: initial?.completedAt,
    outlineLink: initial?.outlineLink,
    draftLink: initial?.draftLink,
    imageLink: initial?.imageLink,
    designOrderId: initial?.designOrderId,
    publishedLink: initial?.publishedLink,
    status: initial?.status || "Kế hoạch",
    outlineReviewNotes: initial?.outlineReviewNotes,
    draftReviewNotes: initial?.draftReviewNotes,
    outlineRevisions: initial?.outlineRevisions || 0,
    draftRevisions: initial?.draftRevisions || 0,
    indexStatus: initial?.indexStatus || "Chưa kiểm tra",
    indexNotes: initial?.indexNotes,
    plan: initial?.plan,
    topic: initial?.topic,
    notes: initial?.notes,
    needsDesign: initial?.needsDesign || false,
    optimizeReason: initial?.optimizeReason,
    optimizeGoal: initial?.optimizeGoal,
    oldLink: initial?.oldLink,
    optimizeNotes: initial?.optimizeNotes,
  });
  const set = (p: Partial<WebContent>) => setC({ ...c, ...p });

  const ps = (val: string | undefined, on: (v?: string) => void) => (
    <Select value={val || "_"} onValueChange={(v) => on(v === "_" ? undefined : v)}>
      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="_">—</SelectItem>
        {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  const isOptimize = c.type === "Bài tối ưu lại";

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 max-h-[65vh] overflow-y-auto pr-1">
        {!lockWebsite && (
          <div className="sm:col-span-2">
            <Label>Website *</Label>
            <Select
              value={c.websiteId}
              onValueChange={(v) => {
                const w = websites.find((x) => x.id === v);
                set({ websiteId: v, brandId: w?.brandId || c.brandId });
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {websites.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="sm:col-span-2">
          <Label>Tiêu đề dự kiến *</Label>
          <Input value={c.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div>
          <Label>Loại bài</Label>
          <Select value={c.type} onValueChange={(v) => set({ type: v as ContentType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CONTENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Search intent</Label>
          <Select value={c.searchIntent || "_"} onValueChange={(v) => set({ searchIntent: v === "_" ? undefined : (v as any) })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">—</SelectItem>
              {SEARCH_INTENTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Cụm chủ đề</Label><Input value={c.cluster || ""} onChange={(e) => set({ cluster: e.target.value })} /></div>
        <div><Label>URL dự kiến</Label><Input value={c.url || ""} onChange={(e) => set({ url: e.target.value })} placeholder="/duong-dan-bai-viet" /></div>
        <div><Label>Từ khóa chính</Label><Input value={c.mainKeyword || ""} onChange={(e) => set({ mainKeyword: e.target.value })} /></div>
        <div><Label>Từ khóa phụ</Label><Input value={c.subKeywords || ""} onChange={(e) => set({ subKeywords: e.target.value })} placeholder="Cách nhau bằng dấu phẩy" /></div>

        <div className="sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Phân công</div>
        <div><Label>Người giao việc</Label>{ps(c.assigner, (v) => set({ assigner: v }))}</div>
        <div><Label>Người viết</Label>{ps(c.writer, (v) => set({ writer: v }))}</div>
        <div><Label>Người duyệt outline</Label>{ps(c.outlineReviewer, (v) => set({ outlineReviewer: v }))}</div>
        <div><Label>Người duyệt bài</Label>{ps(c.draftReviewer, (v) => set({ draftReviewer: v }))}</div>
        <div><Label>Người đăng web</Label>{ps(c.publisher, (v) => set({ publisher: v }))}</div>
        <div>
          <Label>Trạng thái</Label>
          <Select value={c.status} onValueChange={(v) => set({ status: v as ContentStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CONTENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Deadline</div>
        <div><Label>Deadline outline</Label><Input type="date" value={c.outlineDeadline || ""} onChange={(e) => set({ outlineDeadline: e.target.value })} /></div>
        <div><Label>Deadline bài viết</Label><Input type="date" value={c.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} /></div>
        <div><Label>Ngày dự kiến đăng</Label><Input type="date" value={c.publishDate || ""} onChange={(e) => set({ publishDate: e.target.value })} /></div>
        <div><Label>Ngày đăng thực tế</Label><Input type="date" value={c.publishedAt || ""} onChange={(e) => set({ publishedAt: e.target.value })} /></div>

        <div className="sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Tài liệu & link</div>
        <div><Label>Link outline</Label><Input value={c.outlineLink || ""} onChange={(e) => set({ outlineLink: e.target.value })} /></div>
        <div><Label>Link bài viết</Label><Input value={c.draftLink || ""} onChange={(e) => set({ draftLink: e.target.value })} /></div>
        <div><Label>Link ảnh</Label><Input value={c.imageLink || ""} onChange={(e) => set({ imageLink: e.target.value })} /></div>
        <div><Label>Link bài đã đăng</Label><Input value={c.publishedLink || ""} onChange={(e) => set({ publishedLink: e.target.value })} /></div>

        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
          <Switch checked={!!c.needsDesign} onCheckedChange={(v) => set({ needsDesign: v })} />
          <Label className="!mt-0">Cần thiết kế ảnh</Label>
        </div>

        <div className="sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">SEO sau đăng</div>
        <div>
          <Label>Trạng thái index</Label>
          <Select value={c.indexStatus} onValueChange={(v) => set({ indexStatus: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{INDEX_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Ghi chú index</Label><Input value={c.indexNotes || ""} onChange={(e) => set({ indexNotes: e.target.value })} /></div>

        <div className="sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Liên kết</div>
        <div>
          <Label>Plan</Label>
          <Select value={c.plan || "_"} onValueChange={(v) => set({ plan: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent><SelectItem value="_">—</SelectItem>{plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Topic</Label>
          <TopicPicker
            websiteId={c.websiteId}
            value={c.topic}
            onChange={(v) => set({ topic: v })}
            webTopics={webTopics}
          />
        </div>

        <div className="sm:col-span-2"><Label>Brief</Label><Textarea rows={3} value={c.brief || ""} onChange={(e) => set({ brief: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Ghi chú</Label><Textarea rows={2} value={c.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>

        {isOptimize && (
          <>
            <div className="sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Tối ưu lại</div>
            <div>
              <Label>Lý do tối ưu</Label>
              <Select value={c.optimizeReason || "_"} onValueChange={(v) => set({ optimizeReason: v === "_" ? undefined : (v as any) })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">—</SelectItem>
                  {OPTIMIZE_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Link bài cũ</Label><Input value={c.oldLink || ""} onChange={(e) => set({ oldLink: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Mục tiêu tối ưu</Label><Input value={c.optimizeGoal || ""} onChange={(e) => set({ optimizeGoal: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Ghi chú cần sửa</Label><Textarea rows={2} value={c.optimizeNotes || ""} onChange={(e) => set({ optimizeNotes: e.target.value })} /></div>
          </>
        )}
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Huỷ</Button>
        <Button onClick={() => {
          if (!c.title.trim() || !c.websiteId) return;
          // Auto-set completedAt when status becomes Hoàn thành
          if (c.status === "Hoàn thành" && !c.completedAt) c.completedAt = todayISO();
          if (c.status === "Đã đăng web" && !c.publishedAt) c.publishedAt = todayISO();
          onSubmit(c);
          onClose();
        }}>Lưu</Button>
      </DialogFooter>
    </>
  );
}
