import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, uid, fmtDate, type WebContent, type ContentStatus } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { ComingSoon } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ExternalLink, Plus, Pencil, Trash2, LayoutGrid, Table as TableIcon } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/websites/$id")({
  head: () => ({ meta: [{ title: "Chi tiết website — Base Marketing" }] }),
  component: WebsiteDetail,
});

const C_STATUS: ContentStatus[] = ["Kế hoạch", "Đã giao", "Đang viết", "Chờ duyệt", "Cần sửa", "Đã duyệt", "Chờ đăng", "Đã đăng", "Hoàn thành"];

function ContentForm({ initial, websiteId, brandId, onSubmit, onClose }: {
  initial?: Partial<WebContent>; websiteId: string; brandId: string;
  onSubmit: (c: WebContent) => void; onClose: () => void;
}) {
  const { people, plans, topics } = useStore();
  const [c, setC] = useState<WebContent>({
    id: initial?.id || uid(),
    websiteId, brandId,
    type: initial?.type || "Bài SEO",
    cluster: initial?.cluster, mainKeyword: initial?.mainKeyword, subKeywords: initial?.subKeywords,
    title: initial?.title || "", brief: initial?.brief,
    writer: initial?.writer, reviewer: initial?.reviewer,
    deadline: initial?.deadline, publishDate: initial?.publishDate,
    outlineLink: initial?.outlineLink, draftLink: initial?.draftLink,
    imageLink: initial?.imageLink, publishedLink: initial?.publishedLink,
    indexStatus: initial?.indexStatus || "Chưa kiểm tra",
    status: initial?.status || "Kế hoạch",
    plan: initial?.plan, topic: initial?.topic, notes: initial?.notes,
  });
  const set = (p: Partial<WebContent>) => setC({ ...c, ...p });
  const ps = (val: string | undefined, on: (v?: string) => void) => (
    <Select value={val || "_"} onValueChange={(v) => on(v === "_" ? undefined : v)}>
      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent><SelectItem value="_">—</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
    </Select>
  );
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
        <div className="sm:col-span-2"><Label>Tiêu đề dự kiến *</Label><Input value={c.title} onChange={(e) => set({ title: e.target.value })} /></div>
        <div><Label>Loại bài</Label>
          <Select value={c.type} onValueChange={(v) => set({ type: v as WebContent["type"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Bài SEO","Bài blog","Landing page","Bài danh mục","Bài sản phẩm","Bài tối ưu lại"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Cụm chủ đề</Label><Input value={c.cluster || ""} onChange={(e) => set({ cluster: e.target.value })} /></div>
        <div><Label>Từ khóa chính</Label><Input value={c.mainKeyword || ""} onChange={(e) => set({ mainKeyword: e.target.value })} /></div>
        <div><Label>Từ khóa phụ</Label><Input value={c.subKeywords || ""} onChange={(e) => set({ subKeywords: e.target.value })} /></div>
        <div><Label>Người viết</Label>{ps(c.writer, (v) => set({ writer: v }))}</div>
        <div><Label>Người duyệt</Label>{ps(c.reviewer, (v) => set({ reviewer: v }))}</div>
        <div><Label>Deadline</Label><Input type="date" value={c.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} /></div>
        <div><Label>Ngày dự kiến đăng</Label><Input type="date" value={c.publishDate || ""} onChange={(e) => set({ publishDate: e.target.value })} /></div>
        <div><Label>Trạng thái</Label>
          <Select value={c.status} onValueChange={(v) => set({ status: v as ContentStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{C_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Trạng thái index</Label>
          <Select value={c.indexStatus} onValueChange={(v) => set({ indexStatus: v as WebContent["indexStatus"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Chưa kiểm tra","Chưa index","Đã index"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Plan</Label>
          <Select value={c.plan || "_"} onValueChange={(v) => set({ plan: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent><SelectItem value="_">—</SelectItem>{plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Topic</Label>
          <Select value={c.topic || "_"} onValueChange={(v) => set({ topic: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent><SelectItem value="_">—</SelectItem>{topics.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Link outline</Label><Input value={c.outlineLink || ""} onChange={(e) => set({ outlineLink: e.target.value })} /></div>
        <div><Label>Link bài viết</Label><Input value={c.draftLink || ""} onChange={(e) => set({ draftLink: e.target.value })} /></div>
        <div><Label>Link ảnh</Label><Input value={c.imageLink || ""} onChange={(e) => set({ imageLink: e.target.value })} /></div>
        <div><Label>Link bài đã đăng</Label><Input value={c.publishedLink || ""} onChange={(e) => set({ publishedLink: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Brief</Label><Textarea rows={3} value={c.brief || ""} onChange={(e) => set({ brief: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Ghi chú</Label><Textarea rows={2} value={c.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Huỷ</Button>
        <Button onClick={() => { if (c.title.trim()) { onSubmit(c); onClose(); } }}>Lưu</Button>
      </DialogFooter>
    </>
  );
}

function WebsiteDetail() {
  const { id } = Route.useParams();
  const s = useStore();
  const w = s.websites.find((x) => x.id === id);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [editing, setEditing] = useState<WebContent | null>(null);
  const [adding, setAdding] = useState(false);
  const [fStatus, setFStatus] = useState("all");
  const [fWriter, setFWriter] = useState("all");

  if (!w) return <div className="p-10 text-center">Không tìm thấy website. <Link to="/websites" className="text-primary">Quay lại</Link></div>;

  const brand = s.brands.find((b) => b.id === w.brandId);
  const checks = s.seoChecks.filter((c) => c.websiteId === w.id);
  const groups = Array.from(new Set(checks.map((c) => c.group)));
  const contents = s.webContents.filter((c) => c.websiteId === w.id);
  const filteredContents = contents.filter((c) =>
    (fStatus === "all" || c.status === fStatus) &&
    (fWriter === "all" || c.writer === fWriter)
  );
  const writers = Array.from(new Set(contents.map((c) => c.writer).filter(Boolean))) as string[];
  const published = contents.filter((c) => c.status === "Đã đăng" || c.status === "Hoàn thành");

  return (
    <>
      <Link to="/websites" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" />Tất cả website
      </Link>
      <PageHeader
        title={w.name}
        description={brand?.name}
        actions={<>
          {w.url && <Button variant="outline" asChild><a href={w.url} target="_blank" rel="noreferrer">Mở website <ExternalLink className="h-3.5 w-3.5 ml-1.5" /></a></Button>}
          <StatusBadge value={w.status} />
        </>}
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="seo">Technical SEO</TabsTrigger>
          <TabsTrigger value="content">Sản xuất Content ({contents.length})</TabsTrigger>
          <TabsTrigger value="published">Bài đã đăng / Index ({published.length})</TabsTrigger>
          <TabsTrigger value="report">Báo cáo Web</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Thông tin</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row k="Tên" v={w.name} /><Row k="Link" v={w.url} /><Row k="Thương hiệu" v={brand?.name} />
              <Row k="SEO" v={w.seoOwner} /><Row k="Content" v={w.contentOwner} /><Row k="Kỹ thuật" v={w.techOwner} />
              <Row k="Trạng thái" v={<StatusBadge value={w.status} />} />
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-base">Tiến độ</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Stat label="Số bài content" v={contents.length} />
              <Stat label="Bài đã đăng" v={published.length} />
              <Stat label="SEO checklist hoàn thành" v={`${checks.filter((c) => c.done).length}/${checks.length}`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4">
          {groups.map((g) => {
            const items = checks.filter((c) => c.group === g);
            const done = items.filter((c) => c.done).length;
            return (
              <Card key={g}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">{g}</CardTitle>
                  <span className="text-xs text-muted-foreground">{done}/{items.length}</span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {items.map((it) => (
                      <label key={it.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 cursor-pointer">
                        <Checkbox checked={it.done} onCheckedChange={(v) => s.update("seoChecks", it.id, { done: !!v })} />
                        <span className={`text-sm flex-1 ${it.done ? "line-through text-muted-foreground" : ""}`}>{it.name}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {C_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fWriter} onValueChange={setFWriter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Người viết" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả người viết</SelectItem>
                {writers.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
              <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><TableIcon className="h-4 w-4 mr-1" />Table</Button>
              <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4 mr-1" />Kanban</Button>
            </div>
            <Dialog open={adding} onOpenChange={setAdding}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm bài</Button></DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Tạo bài content</DialogTitle></DialogHeader>
                <ContentForm websiteId={w.id} brandId={w.brandId} onSubmit={(c) => s.add("webContents", c)} onClose={() => setAdding(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {view === "table" ? (
            <Card><CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground bg-muted/40">
                    <tr>
                      <th className="text-left font-medium px-4 py-2.5">Tiêu đề</th>
                      <th className="text-left font-medium px-4 py-2.5">Loại</th>
                      <th className="text-left font-medium px-4 py-2.5">Người viết</th>
                      <th className="text-left font-medium px-4 py-2.5">Deadline</th>
                      <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                      <th className="text-right font-medium px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredContents.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Chưa có bài content.</td></tr>}
                    {filteredContents.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-4 py-2.5 font-medium">{c.title}{c.mainKeyword && <div className="text-xs text-muted-foreground mt-0.5">KW: {c.mainKeyword}</div>}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.type}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.writer || "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.deadline)}</td>
                        <td className="px-4 py-2.5"><StatusBadge value={c.status} /></td>
                        <td className="px-4 py-2.5 text-right">
                          <Button size="icon" variant="ghost" onClick={() => setEditing(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => s.remove("webContents", c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
              {C_STATUS.map((status) => {
                const items = filteredContents.filter((c) => c.status === status);
                return (
                  <div key={status} className="rounded-xl bg-muted/40 p-3">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <StatusBadge value={status} /><span className="text-xs text-muted-foreground">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((c) => (
                        <button key={c.id} onClick={() => setEditing(c)} className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 shadow-soft">
                          <div className="font-medium text-sm">{c.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{c.writer || "—"} · {fmtDate(c.deadline)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-4">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr><th className="text-left font-medium px-4 py-2.5">Bài viết</th><th className="text-left font-medium px-4 py-2.5">Link</th><th className="text-left font-medium px-4 py-2.5">Index</th><th className="text-left font-medium px-4 py-2.5">Ngày đăng</th></tr>
              </thead>
              <tbody className="divide-y">
                {published.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Chưa có bài đăng.</td></tr>}
                {published.map((c) => (
                  <tr key={c.id}><td className="px-4 py-2.5 font-medium">{c.title}</td>
                    <td className="px-4 py-2.5">{c.publishedLink ? <a href={c.publishedLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">Mở</a> : "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge value={c.indexStatus} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.publishDate)}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <ComingSoon title="Báo cáo Web" items={["Lưu lượng truy cập", "Top từ khóa", "Tỉ lệ index", "Hiệu suất bài viết"]} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Chỉnh sửa bài</DialogTitle></DialogHeader>
          {editing && <ContentForm initial={editing} websiteId={w.id} brandId={w.brandId} onSubmit={(c) => s.update("webContents", c.id, c)} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ k, v }: { k: string; v?: React.ReactNode }) {
  return <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0">
    <span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v || "—"}</span>
  </div>;
}
function Stat({ label, v }: { label: string; v: any }) {
  return <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
    <span className="text-sm text-muted-foreground">{label}</span><span className="text-lg font-semibold">{v}</span>
  </div>;
}
