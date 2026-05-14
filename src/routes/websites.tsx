import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useStore, uid, ensureSeoChecks,
  type Website, type WebsiteType, type WebsiteStatus,
} from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, ExternalLink, FileText, ListChecks } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/websites")({
  head: () => ({ meta: [{ title: "Dự Án Web — Base Marketing" }] }),
  component: WebsitesPage,
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
  const { websites, brands, webContents, seoChecks } = s;
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [fSeo, setFSeo] = useState("all");
  const [fContent, setFContent] = useState("all");
  const [editing, setEditing] = useState<Website | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => websites.filter((w) =>
    (!search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.url || "").toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || w.brandId === fBrand) &&
    (fStatus === "all" || w.status === fStatus) &&
    (fType === "all" || w.type === fType) &&
    (fSeo === "all" || w.seoOwner === fSeo) &&
    (fContent === "all" || w.contentOwner === fContent)
  ), [websites, search, fBrand, fStatus, fType, fSeo, fContent]);

  const seoOwners = Array.from(new Set(websites.map((w) => w.seoOwner).filter(Boolean))) as string[];
  const contentOwners = Array.from(new Set(websites.map((w) => w.contentOwner).filter(Boolean))) as string[];

  const stats = (id: string) => {
    const list = webContents.filter((c) => c.websiteId === id);
    return {
      producing: list.filter((c) =>
        ["Đã giao", "Đang làm outline", "Outline đã duyệt", "Đang viết bài", "Cần sửa outline", "Cần sửa bài"]
          .includes(c.status)
      ).length,
      pendingReview: list.filter((c) => c.status === "Chờ duyệt outline" || c.status === "Chờ duyệt bài").length,
      published: list.filter((c) => ["Đã đăng web", "Kiểm tra index", "Hoàn thành"].includes(c.status)).length,
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
        description="Quản lý website của các thương hiệu — kèm Technical SEO, sản xuất content và theo dõi index."
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
                  // Seed SEO checklist for new website
                  ensureSeoChecks(seoChecks, w.id).forEach((c) => s.add("seoChecks", c));
                }} onClose={() => setAdding(false)} />
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Tổng website</div><div className="text-2xl font-semibold mt-1.5">{totalSites}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Đang vận hành</div><div className="text-2xl font-semibold mt-1.5 text-success">{operating}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Tổng content</div><div className="text-2xl font-semibold mt-1.5">{totalContents}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Chờ duyệt</div><div className="text-2xl font-semibold mt-1.5 text-[oklch(0.45_0.13_75)]">{pendingAll}</div></CardContent></Card>
      </div>

      <FilterBar>
        <Input placeholder="Tìm website..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
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
        <Select value={fSeo} onValueChange={setFSeo}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="SEO phụ trách" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả SEO</SelectItem>{seoOwners.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fContent} onValueChange={setFContent}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Content phụ trách" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả Content</SelectItem>{contentOwners.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Tên website</th>
                <th className="text-left font-medium px-4 py-2.5">Thương hiệu</th>
                <th className="text-left font-medium px-4 py-2.5">Loại</th>
                <th className="text-left font-medium px-4 py-2.5">SEO</th>
                <th className="text-left font-medium px-4 py-2.5">Content</th>
                <th className="text-left font-medium px-4 py-2.5">Kỹ thuật</th>
                <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                <th className="text-center font-medium px-2 py-2.5" title="Đang sản xuất">SX</th>
                <th className="text-center font-medium px-2 py-2.5" title="Chờ duyệt">Duyệt</th>
                <th className="text-center font-medium px-2 py-2.5" title="Đã đăng">Đăng</th>
                <th className="text-right font-medium px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">Chưa có website nào.</td></tr>}
              {filtered.map((w) => {
                const st = stats(w.id);
                return (
                  <tr key={w.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">
                      <Link to="/websites/$id" params={{ id: w.id }} className="hover:text-primary">{w.name}</Link>
                      {w.url && (
                        <a href={w.url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center text-xs text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{brands.find((b) => b.id === w.brandId)?.name || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{w.type}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{w.seoOwner || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{w.contentOwner || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{w.techOwner || "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge value={w.status} /></td>
                    <td className="px-2 py-2.5 text-center font-medium">{st.producing}</td>
                    <td className="px-2 py-2.5 text-center font-medium text-[oklch(0.45_0.13_75)]">{st.pendingReview}</td>
                    <td className="px-2 py-2.5 text-center font-medium text-success">{st.published}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" asChild title="Mở chi tiết">
                          <Link to="/websites/$id" params={{ id: w.id }}><ListChecks className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditing(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => s.remove("websites", w.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa Website</DialogTitle></DialogHeader>
          {editing && <WebsiteForm initial={editing} onSubmit={(w) => s.update("websites", w.id, w)} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
