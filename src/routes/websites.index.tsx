import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useStore, uid, ensureSeoChecks,
  type Website, type WebsiteType, type WebsiteStatus,
} from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, EmptyState } from "@/components/Common";
import { ContentForm } from "@/components/ContentForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, ExternalLink, FileText, ArrowRight, Globe, FilePlus2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/websites/")({
  head: () => ({ meta: [{ title: "Dự Án Web — Base Marketing" }] }),
  component: () => (
    <RequirePermission perm={["web.view", "web.view_all", "web.view_mine"]}>
      <WebsitesPage />
    </RequirePermission>
  ),
});

const TYPES: WebsiteType[] = [
  "Website thương hiệu", "Website bán hàng", "Website blog/SEO",
  "Landing page", "Website vệ tinh", "Khác",
];
const STATUSES: WebsiteStatus[] = [
  "Đang xây dựng", "Đang vận hành", "Đang tối ưu", "Tạm dừng", "Lưu trữ",
];

function WebsiteForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Website>; onSubmit: (w: Website) => void; onClose: () => void;
}) {
  const { brands, people } = useStore();
  const [w, setW] = useState<Website>({
    id: initial?.id || uid(),
    name: initial?.name || "",
    url: initial?.url || "",
    brandId: initial?.brandId || brands[0]?.id || "",
    type: initial?.type || "Website thương hiệu",
    seoOwner: initial?.seoOwner,
    contentOwner: initial?.contentOwner,
    techOwner: initial?.techOwner,
    status: initial?.status || "Đang xây dựng",
    goal: initial?.goal,
    notes: initial?.notes,
  });
  const set = (p: Partial<Website>) => setW({ ...w, ...p });
  const ps = (val: string | undefined, on: (v?: string) => void) => (
    <Select value={val || "_"} onValueChange={(v) => on(v === "_" ? undefined : v)}>
      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="_">—</SelectItem>
        {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
        <div><Label>Tên website *</Label><Input value={w.name} onChange={(e) => set({ name: e.target.value })} /></div>
        <div><Label>Link website</Label><Input value={w.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://..." /></div>
        <div>
          <Label>Thuộc thương hiệu *</Label>
          <Select value={w.brandId} onValueChange={(v) => set({ brandId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Loại website</Label>
          <Select value={w.type} onValueChange={(v) => set({ type: v as WebsiteType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Trạng thái</Label>
          <Select value={w.status} onValueChange={(v) => set({ status: v as WebsiteStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>SEO phụ trách</Label>{ps(w.seoOwner, (v) => set({ seoOwner: v }))}</div>
        <div><Label>Content phụ trách</Label>{ps(w.contentOwner, (v) => set({ contentOwner: v }))}</div>
        <div><Label>Kỹ thuật phụ trách</Label>{ps(w.techOwner, (v) => set({ techOwner: v }))}</div>
        <div className="sm:col-span-2"><Label>Mục tiêu website</Label><Input value={w.goal || ""} onChange={(e) => set({ goal: e.target.value })} placeholder="Ví dụ: Tăng đơn quà tặng doanh nghiệp" /></div>
        <div className="sm:col-span-2"><Label>Ghi chú</Label><Textarea rows={2} value={w.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Huỷ</Button>
        <Button onClick={() => { if (w.name && w.brandId) { onSubmit(w); onClose(); } }}>Lưu</Button>
      </DialogFooter>
    </>
  );
}

function WebsitesPage() {
  const s = useStore();
  const navigate = useNavigate();
  const { websites, brands, webContents, seoChecks } = s;
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [editing, setEditing] = useState<Website | null>(null);
  const [adding, setAdding] = useState(false);
  const [addContentFor, setAddContentFor] = useState<Website | null>(null);

  const filtered = useMemo(() => websites.filter((w) =>
    (!search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.url || "").toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || w.brandId === fBrand) &&
    (fStatus === "all" || w.status === fStatus) &&
    (fType === "all" || w.type === fType)
  ), [websites, search, fBrand, fStatus, fType]);

  const stats = (id: string) => {
    const list = webContents.filter((c) => c.websiteId === id);
    const published = list.filter((c) => ["Đã đăng web", "Kiểm tra index", "Hoàn thành"].includes(c.status));
    return {
      producing: list.filter((c) =>
        ["Đã giao", "Đang làm outline", "Outline đã duyệt", "Đang viết bài"].includes(c.status)
      ).length,
      pendingReview: list.filter((c) => c.status === "Chờ duyệt outline" || c.status === "Chờ duyệt bài").length,
      needFix: list.filter((c) => c.status === "Cần sửa outline" || c.status === "Cần sửa bài").length,
      published: published.length,
      notIndexed: published.filter((c) => (c.indexStatus || "Chưa kiểm tra") !== "Đã index").length,
    };
  };

  const totalSites = websites.length;
  const operating = websites.filter((w) => w.status === "Đang vận hành").length;
  const totalContents = webContents.length;
  const pendingAll = webContents.filter((c) => c.status === "Chờ duyệt outline" || c.status === "Chờ duyệt bài").length;

  return (
    <>
      <PageHeader
        title="Dự Án Web"
        description="Mỗi dự án web là một workspace riêng — bấm vào ô để mở chi tiết và quản lý nội dung."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/web-contents"><FileText className="h-4 w-4" />Tất cả Content Web</Link>
            </Button>
            <Dialog open={adding} onOpenChange={setAdding}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Thêm Website</Button></DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Tạo Website</DialogTitle></DialogHeader>
                <WebsiteForm onSubmit={(w) => {
                  s.add("websites", w);
                  ensureSeoChecks(seoChecks, w.id).forEach((c) => s.add("seoChecks", c));
                }} onClose={() => setAdding(false)} />
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Tổng dự án web</div><div className="text-2xl font-semibold mt-1.5">{totalSites}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Đang vận hành</div><div className="text-2xl font-semibold mt-1.5 text-success">{operating}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Tổng content</div><div className="text-2xl font-semibold mt-1.5">{totalContents}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Chờ duyệt</div><div className="text-2xl font-semibold mt-1.5 text-[oklch(0.45_0.13_75)]">{pendingAll}</div></CardContent></Card>
      </div>

      <FilterBar>
        <Input placeholder="Tìm dự án web..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={fBrand} onValueChange={setFBrand}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fType} onValueChange={setFType}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Loại" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả loại</SelectItem>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-5 w-5" />}
          title={s.websites.length === 0 ? "Chưa có dự án web" : "Không có dự án phù hợp bộ lọc"}
          hint={s.websites.length === 0 ? "Tạo dự án web đầu tiên để bắt đầu quản lý nội dung, SEO và tăng trưởng." : "Thử bỏ bộ lọc."}
          action={s.websites.length === 0 ? (
            <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Tạo dự án web đầu tiên</Button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((w) => {
            const st = stats(w.id);
            const brand = brands.find((b) => b.id === w.brandId);
            return (
              <Card key={w.id} className="flex flex-col hover:border-primary/40 transition-colors">
                <CardContent className="p-5 flex-1 flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate({ to: "/websites/$id", params: { id: w.id } })}
                        className="text-left font-semibold leading-tight hover:text-primary truncate block w-full"
                        title={w.name}
                      >
                        {w.name}
                      </button>
                      {w.url && (
                        <a href={w.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary truncate max-w-full">
                          <span className="truncate">{w.url.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      )}
                    </div>
                    <StatusBadge value={w.status} />
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div><span className="text-muted-foreground">Thương hiệu:</span> <span className="font-medium">{brand?.name || "—"}</span></div>
                    <div><span className="text-muted-foreground">Loại:</span> <span className="font-medium">{w.type}</span></div>
                    <div><span className="text-muted-foreground">SEO:</span> <span className="font-medium">{w.seoOwner || "—"}</span></div>
                    <div><span className="text-muted-foreground">Content:</span> <span className="font-medium">{w.contentOwner || "—"}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Kỹ thuật:</span> <span className="font-medium">{w.techOwner || "—"}</span></div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-5 gap-1.5 rounded-lg bg-muted/40 p-2">
                    <Stat n={st.producing} label="SX" tone="info" />
                    <Stat n={st.pendingReview} label="Duyệt" tone="warn" />
                    <Stat n={st.needFix} label="Sửa" tone="danger" />
                    <Stat n={st.published} label="Đăng" tone="success" />
                    <Stat n={st.notIndexed} label="Chưa idx" tone="warn" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-1">
                    <Button size="sm" className="flex-1" onClick={() => navigate({ to: "/websites/$id", params: { id: w.id } })}>
                      Mở dự án <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAddContentFor(w)} title="Thêm content">
                      <FilePlus2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(w)} title="Chỉnh sửa">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa Website</DialogTitle></DialogHeader>
          {editing && <WebsiteForm initial={editing} onSubmit={(w) => s.update("websites", w.id, w)} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!addContentFor} onOpenChange={(o) => !o && setAddContentFor(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Thêm content cho: {addContentFor?.name}</DialogTitle></DialogHeader>
          {addContentFor && (
            <ContentForm
              websiteId={addContentFor.id}
              brandId={addContentFor.brandId}
              onSubmit={(c) => s.add("webContents", c)}
              onClose={() => setAddContentFor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone: "info" | "warn" | "danger" | "success" }) {
  const colors: Record<string, string> = {
    info: "text-info",
    warn: "text-[oklch(0.45_0.13_75)]",
    danger: "text-destructive",
    success: "text-success",
  };
  return (
    <div className="text-center">
      <div className={`text-base font-semibold leading-none ${colors[tone]}`}>{n}</div>
      <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
