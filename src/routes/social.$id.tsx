import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, uid, fmtDate, todayISO,
  type SocialPost, type SocialStatus, type GrowthMetric, type GrowthPeriodType,
  SOCIAL_STATUSES, SOCIAL_CONTENT_TYPES, GROWTH_PERIOD_TYPES,
} from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, EmptyState } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, ExternalLink, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useMemo, useState } from "react";
import { PostFormDialog, PostDetailDialog } from "@/components/SocialPostDetail";

export const Route = createFileRoute("/social/$id")({
  head: () => ({ meta: [{ title: "Workspace kênh social — Base Marketing" }] }),
  component: ChannelWorkspace,
});

function ChannelWorkspace() {
  const { id } = Route.useParams();
  const s = useStore();
  const { can } = useCurrentUser();
  const navigate = useNavigate();
  const c = s.socials.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="p-10 text-center">
        Không tìm thấy kênh. <Link to="/social" className="text-primary">Quay lại</Link>
      </div>
    );
  }

  const brand = s.brands.find((b) => b.id === c.brandId);
  const posts = s.socialPosts.filter((p) => p.channelId === c.id);
  const [adding, setAdding] = useState(false);
  const [editPost, setEditPost] = useState<SocialPost | null>(null);
  const [openPost, setOpenPost] = useState<SocialPost | null>(null);

  const canPostCreate = can("social.post_create");
  const canPostEdit = can("social.post_edit");
  const canPostDelete = can("social.post_delete");

  return (
    <>
      <button onClick={() => navigate({ to: "/social" })}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" />Tất cả kênh social
      </button>
      <PageHeader
        title={c.name}
        description={`${c.platform} · ${brand?.name || "—"}${c.owner ? ` · PT: ${c.owner}` : ""}${c.frequency ? ` · ${c.frequency}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            {c.url && (
              <a href={c.url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" />Mở kênh
              </a>
            )}
            <StatusBadge value={c.status} />
          </div>
        }
      />

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin dự án</TabsTrigger>
          <TabsTrigger value="production">Sản xuất nội dung ({posts.length})</TabsTrigger>
          <TabsTrigger value="growth">Theo dõi tăng trưởng</TabsTrigger>
        </TabsList>

        {/* TAB 1 */}
        <TabsContent value="info" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Thông tin kênh</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row k="Tên kênh" v={c.name} />
              <Row k="Nền tảng" v={c.platform} />
              <Row k="Link kênh" v={c.url} />
              <Row k="Thương hiệu" v={brand?.name} />
              <Row k="Người phụ trách" v={c.owner} />
              <Row k="Tần suất đăng" v={c.frequency} />
              <Row k="Trạng thái" v={<StatusBadge value={c.status} />} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Mục tiêu & ghi chú</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Mục tiêu kênh</div>
                <div className="whitespace-pre-wrap">{c.goal || "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Ghi chú vận hành</div>
                <div className="whitespace-pre-wrap">{c.notes || "—"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Tổng quan bài đăng</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
              <Mini label="Tổng" v={posts.length} />
              <Mini label="Đang sản xuất" v={posts.filter((p) => ["Đang làm"].includes(p.status)).length} />
              <Mini label="Chờ duyệt" v={posts.filter((p) => p.status === "Chờ duyệt").length} />
              <Mini label="Cần sửa" v={posts.filter((p) => p.status === "Cần sửa").length} />
              <Mini label="Chờ đăng" v={posts.filter((p) => ["Đã duyệt", "Chờ đăng"].includes(p.status)).length} />
              <Mini label="Đã đăng" v={posts.filter((p) => p.status === "Đã đăng").length} />
              <Mini label="Hoàn thành" v={posts.filter((p) => p.status === "Hoàn thành").length} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2 */}
        <TabsContent value="production" className="mt-4">
          <ProductionTab
            posts={posts}
            onAdd={() => setAdding(true)}
            onEdit={(p) => setEditPost(p)}
            onOpen={(p) => setOpenPost(p)}
            onDelete={(p) => s.remove("socialPosts", p.id)}
            canCreate={canPostCreate}
            canEdit={canPostEdit}
            canDelete={canPostDelete}
          />
        </TabsContent>

        {/* TAB 3 */}
        <TabsContent value="growth" className="mt-4">
          <GrowthTab channelId={c.id} />
        </TabsContent>
      </Tabs>

      {adding && (
        <PostFormDialog open={adding} onOpenChange={setAdding} channel={c}
          onSubmit={(p) => s.add("socialPosts", p)} />
      )}
      {editPost && (
        <PostFormDialog open={!!editPost} onOpenChange={(o) => !o && setEditPost(null)}
          channel={c} initial={editPost}
          onSubmit={(p) => s.update("socialPosts", p.id, p)} />
      )}
      {openPost && (
        <PostDetailDialog open={!!openPost} onOpenChange={(o) => !o && setOpenPost(null)}
          channel={c}
          post={s.socialPosts.find((x) => x.id === openPost.id) || openPost} />
      )}
    </>
  );
}

function Row({ k, v }: { k: string; v?: any }) {
  return (
    <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right break-all">{v ?? "—"}</span>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3 text-center">
      <div className="text-2xl font-semibold leading-none">{v}</div>
      <div className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}

/* ============ Production tab ============ */
function ProductionTab({
  posts, onAdd, onEdit, onOpen, onDelete, canCreate, canEdit, canDelete,
}: {
  posts: SocialPost[]; onAdd: () => void;
  onEdit: (p: SocialPost) => void; onOpen: (p: SocialPost) => void; onDelete: (p: SocialPost) => void;
  canCreate: boolean; canEdit: boolean; canDelete: boolean;
}) {
  const { people, plans, topics } = useStore();
  const [view, setView] = useState<"table" | "kanban" | "calendar">("table");
  const [fStatus, setFStatus] = useState("all");
  const [fWriter, setFWriter] = useState("all");
  const [fReviewer, setFReviewer] = useState("all");
  const [fType, setFType] = useState("all");
  const [fTopic, setFTopic] = useState("all");
  const [fPlan, setFPlan] = useState("all");
  const [fDate, setFDate] = useState("");

  const filtered = useMemo(() => posts.filter((p) =>
    (fStatus === "all" || p.status === fStatus) &&
    (fWriter === "all" || p.writer === fWriter) &&
    (fReviewer === "all" || p.reviewer === fReviewer) &&
    (fType === "all" || p.contentType === fType) &&
    (fTopic === "all" || p.topic === fTopic) &&
    (fPlan === "all" || p.plan === fPlan) &&
    (!fDate || p.scheduledDate === fDate || p.publishedDate === fDate)
  ), [posts, fStatus, fWriter, fReviewer, fType, fTopic, fPlan, fDate]);

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="inline-flex rounded-md border bg-card p-0.5">
          {(["table", "kanban", "calendar"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs rounded ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {v === "table" ? "Bảng" : v === "kanban" ? "Kanban" : "Lịch đăng"}
            </button>
          ))}
        </div>
        {canCreate && (
          <Button onClick={onAdd}><Plus className="h-4 w-4 mr-1.5" />Thêm bài</Button>
        )}
      </div>

      <FilterBar>
        <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{SOCIAL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Select value={fType} onValueChange={setFType}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Loại nội dung" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả loại</SelectItem>{SOCIAL_CONTENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        <Select value={fWriter} onValueChange={setFWriter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Người viết" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả người viết</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select>
        <Select value={fReviewer} onValueChange={setFReviewer}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Người duyệt" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả người duyệt</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select>
        <Select value={fTopic} onValueChange={setFTopic}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Chủ đề" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả chủ đề</SelectItem>{topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        <Select value={fPlan} onValueChange={setFPlan}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Plan" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả plan</SelectItem>{plans.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="w-[160px]" />
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-5 w-5" />}
          title={posts.length === 0 ? "Chưa có bài social" : "Không có bài phù hợp bộ lọc"}
          hint={posts.length === 0 ? "Tạo bài đầu tiên cho kênh này." : undefined}
          action={posts.length === 0 && canCreate ? <Button onClick={onAdd}><Plus className="h-4 w-4 mr-1.5" />Tạo bài đầu tiên</Button> : undefined}
        />
      ) : view === "table" ? (
        <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
            <th className="text-left font-medium px-4 py-2.5">Tên bài</th>
            <th className="text-left font-medium px-4 py-2.5">Loại</th>
            <th className="text-left font-medium px-4 py-2.5">Người viết</th>
            <th className="text-left font-medium px-4 py-2.5">Người duyệt</th>
            <th className="text-left font-medium px-4 py-2.5">Dự kiến</th>
            <th className="text-left font-medium px-4 py-2.5">Đã đăng</th>
            <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
            <th className="text-left font-medium px-4 py-2.5">Link</th>
            <th className="text-right font-medium px-4 py-2.5"></th>
          </tr></thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5"><button onClick={() => onOpen(p)} className="font-medium hover:text-primary text-left">{p.title}</button></td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.contentType}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.writer || "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.reviewer || "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(p.scheduledDate)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(p.publishedDate)}</td>
                <td className="px-4 py-2.5"><StatusBadge value={p.status} /></td>
                <td className="px-4 py-2.5">{p.publishedLink ? <a href={p.publishedLink} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />Xem</a> : "—"}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {canEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>}
                  {canDelete && <Button size="icon" variant="ghost" onClick={() => onDelete(p)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></CardContent></Card>
      ) : view === "kanban" ? (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
          {SOCIAL_STATUSES.map((st) => {
            const list = filtered.filter((p) => p.status === st);
            return (
              <div key={st} className="rounded-lg border bg-muted/30 p-2">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-medium">{st}</span>
                  <span className="text-xs text-muted-foreground">{list.length}</span>
                </div>
                <div className="space-y-2">
                  {list.map((p) => (
                    <button key={p.id} onClick={() => onOpen(p)}
                      className="block w-full text-left bg-card rounded-md border p-2 hover:shadow-sm">
                      <div className="text-xs font-medium line-clamp-2">{p.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{p.writer || "—"} · {fmtDate(p.scheduledDate)}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="p-5">
          <div className="space-y-2">
            {filtered.filter((p) => p.scheduledDate || p.publishedDate)
              .sort((a, b) => (a.scheduledDate || a.publishedDate || "").localeCompare(b.scheduledDate || b.publishedDate || ""))
              .map((p) => (
                <button key={p.id} onClick={() => onOpen(p)} className="w-full flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 text-left">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.contentType} · {p.writer || "—"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Dự kiến: {fmtDate(p.scheduledDate)}{p.publishedDate ? ` · Đăng: ${fmtDate(p.publishedDate)}` : ""}
                    </span>
                    <StatusBadge value={p.status} />
                  </div>
                </button>
              ))}
          </div>
        </CardContent></Card>
      )}
    </>
  );
}

/* ============ Growth tab ============ */
function GrowthTab({ channelId }: { channelId: string }) {
  const s = useStore();
  const { can, user } = useCurrentUser();
  const canEdit = can("social.growth_update");
  const all = s.growth.filter((g) => g.channelId === channelId);
  const [fType, setFType] = useState<"all" | GrowthPeriodType>("all");
  const filtered = useMemo(() => all.filter((g) => fType === "all" || g.periodType === fType)
    .sort((a, b) => (b.periodKey || b.updatedAt || "").localeCompare(a.periodKey || a.updatedAt || "")),
  [all, fType]);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<GrowthMetric | null>(null);

  const latest = filtered[0];
  const prev = filtered[1];

  const diff = (a?: number, b?: number) => {
    if (a == null || b == null) return null;
    return a - b;
  };
  const followerDelta = diff(latest?.followerEnd, prev?.followerEnd);
  const viewsDelta = diff(latest?.totalViews, prev?.totalViews);
  const engDelta = diff(latest?.totalEngagements, prev?.totalEngagements);
  const inboxDelta = diff(latest?.inboxes, prev?.inboxes);

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <Select value={fType} onValueChange={(v) => setFType(v as any)}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả kỳ</SelectItem>
            {GROWTH_PERIOD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        {canEdit && <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Thêm kỳ báo cáo</Button>}
      </div>

      {latest && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-4">
          <CompareCard label="Follower" current={latest.followerEnd} delta={followerDelta} />
          <CompareCard label="Lượt xem" current={latest.totalViews} delta={viewsDelta} />
          <CompareCard label="Tương tác" current={latest.totalEngagements} delta={engDelta} />
          <CompareCard label="Inbox" current={latest.inboxes} delta={inboxDelta} />
          <CompareCard label="Bài đăng kỳ này" current={latest.postsInPeriod} delta={null} />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="Chưa có kỳ báo cáo"
          hint="Thêm kỳ báo cáo đầu tiên để theo dõi tăng trưởng kênh."
          action={canEdit ? <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Thêm kỳ báo cáo</Button> : undefined}
        />
      ) : (
        <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
            <th className="text-left font-medium px-4 py-2.5">Kỳ</th>
            <th className="text-left font-medium px-4 py-2.5">Loại</th>
            <th className="text-left font-medium px-4 py-2.5">Cập nhật</th>
            <th className="text-right font-medium px-4 py-2.5">Follower đầu</th>
            <th className="text-right font-medium px-4 py-2.5">Follower cuối</th>
            <th className="text-right font-medium px-4 py-2.5">Bài</th>
            <th className="text-right font-medium px-4 py-2.5">Lượt xem</th>
            <th className="text-right font-medium px-4 py-2.5">Tương tác</th>
            <th className="text-right font-medium px-4 py-2.5">Inbox</th>
            <th className="text-right font-medium px-4 py-2.5"></th>
          </tr></thead>
          <tbody className="divide-y">
            {filtered.map((g) => (
              <tr key={g.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-medium">{g.period}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{g.periodType}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(g.updatedAt)}</td>
                <td className="px-4 py-2.5 text-right">{g.followerStart ?? "—"}</td>
                <td className="px-4 py-2.5 text-right">{g.followerEnd ?? "—"}</td>
                <td className="px-4 py-2.5 text-right">{g.postsInPeriod ?? "—"}</td>
                <td className="px-4 py-2.5 text-right">{g.totalViews ?? "—"}</td>
                <td className="px-4 py-2.5 text-right">{g.totalEngagements ?? "—"}</td>
                <td className="px-4 py-2.5 text-right">{g.inboxes ?? "—"}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditing(g)}><Pencil className="h-3.5 w-3.5" /></Button>}
                  {canEdit && <Button size="icon" variant="ghost" onClick={() => s.remove("growth", g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></CardContent></Card>
      )}

      {(adding || editing) && (
        <GrowthDialog
          open
          onOpenChange={(o) => { if (!o) { setAdding(false); setEditing(null); } }}
          channelId={channelId}
          initial={editing || undefined}
          updatedByDefault={user?.fullName || user?.username}
          onSubmit={(g) => {
            if (editing) s.update("growth", g.id, g);
            else s.add("growth", g);
            setAdding(false); setEditing(null);
          }}
        />
      )}
    </>
  );
}

function CompareCard({ label, current, delta }: { label: string; current?: number; delta: number | null }) {
  const tone = delta == null ? "muted" : delta > 0 ? "ok" : delta < 0 ? "down" : "muted";
  const Icon = tone === "ok" ? ArrowUp : tone === "down" ? ArrowDown : Minus;
  const cls = tone === "ok" ? "text-success bg-success/10"
    : tone === "down" ? "text-destructive bg-destructive/10"
    : "text-muted-foreground bg-muted";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-semibold mt-1">{current ?? "—"}</div>
        {delta != null && (
          <div className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cls}`}>
            <Icon className="h-3 w-3" />{delta > 0 ? "+" : ""}{delta}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GrowthDialog({
  open, onOpenChange, channelId, initial, updatedByDefault, onSubmit,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  channelId: string; initial?: GrowthMetric;
  updatedByDefault?: string;
  onSubmit: (g: GrowthMetric) => void;
}) {
  const [g, setG] = useState<GrowthMetric>(initial || {
    id: uid(), channelId, period: "", periodType: "Tháng",
    updatedAt: todayISO(), updatedBy: updatedByDefault,
  });
  const set = (p: Partial<GrowthMetric>) => setG({ ...g, ...p });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{initial ? "Cập nhật kỳ báo cáo" : "Thêm kỳ báo cáo"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
          <div><Label>Kỳ báo cáo *</Label><Input value={g.period} onChange={(e) => set({ period: e.target.value })} placeholder="VD: Tháng 5/2026" /></div>
          <div><Label>Loại kỳ</Label>
            <Select value={g.periodType} onValueChange={(v) => set({ periodType: v as GrowthPeriodType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GROWTH_PERIOD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select></div>
          <div><Label>Ngày cập nhật</Label><Input type="date" value={g.updatedAt || ""} onChange={(e) => set({ updatedAt: e.target.value })} /></div>
          <div><Label>Người cập nhật</Label><Input value={g.updatedBy || ""} onChange={(e) => set({ updatedBy: e.target.value })} /></div>
          <div><Label>Follower đầu kỳ</Label><Input type="number" value={g.followerStart ?? ""} onChange={(e) => set({ followerStart: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Follower cuối kỳ</Label><Input type="number" value={g.followerEnd ?? ""} onChange={(e) => set({ followerEnd: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Số bài đã đăng</Label><Input type="number" value={g.postsInPeriod ?? ""} onChange={(e) => set({ postsInPeriod: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Tổng lượt xem</Label><Input type="number" value={g.totalViews ?? ""} onChange={(e) => set({ totalViews: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Tổng tương tác</Label><Input type="number" value={g.totalEngagements ?? ""} onChange={(e) => set({ totalEngagements: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Like</Label><Input type="number" value={g.likes ?? ""} onChange={(e) => set({ likes: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Comment</Label><Input type="number" value={g.comments ?? ""} onChange={(e) => set({ comments: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Share</Label><Input type="number" value={g.shares ?? ""} onChange={(e) => set({ shares: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Inbox / Tin nhắn</Label><Input type="number" value={g.inboxes ?? ""} onChange={(e) => set({ inboxes: e.target.value ? +e.target.value : undefined })} /></div>
          <div><Label>Link báo cáo</Label><Input value={g.reportLink || ""} onChange={(e) => set({ reportLink: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Ghi chú</Label><Textarea rows={2} value={g.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>
        </div>
        <DialogFooter className="mt-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={() => { if (!g.period) return; onSubmit({ ...g, channelId, periodKey: g.periodKey || g.period }); }}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
