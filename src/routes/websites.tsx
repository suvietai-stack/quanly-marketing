import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, uid, type Website } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/websites")({
  head: () => ({ meta: [{ title: "Dự Án Web — Base Marketing" }] }),
  component: WebsitesPage,
});

const STATUS = ["Đang xây dựng", "Đang vận hành", "Đang tối ưu", "Tạm dừng"] as const;

function WebsiteForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Website>; onSubmit: (w: Website) => void; onClose: () => void;
}) {
  const { brands, people } = useStore();
  const [w, setW] = useState<Website>({
    id: initial?.id || uid(),
    name: initial?.name || "",
    url: initial?.url || "",
    brandId: initial?.brandId || brands[0]?.id || "",
    seoOwner: initial?.seoOwner,
    contentOwner: initial?.contentOwner,
    techOwner: initial?.techOwner,
    status: initial?.status || "Đang xây dựng",
    notes: initial?.notes,
  });
  const set = (p: Partial<Website>) => setW({ ...w, ...p });
  const personSelect = (val: string | undefined, onChange: (v?: string) => void) => (
    <Select value={val || "_"} onValueChange={(v) => onChange(v === "_" ? undefined : v)}>
      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="_">—</SelectItem>
        {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Tên website *</Label><Input value={w.name} onChange={(e) => set({ name: e.target.value })} /></div>
        <div><Label>Link website</Label><Input value={w.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://..." /></div>
        <div><Label>Thuộc thương hiệu *</Label>
          <Select value={w.brandId} onValueChange={(v) => set({ brandId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Trạng thái</Label>
          <Select value={w.status} onValueChange={(v) => set({ status: v as Website["status"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>SEO</Label>{personSelect(w.seoOwner, (v) => set({ seoOwner: v }))}</div>
        <div><Label>Content</Label>{personSelect(w.contentOwner, (v) => set({ contentOwner: v }))}</div>
        <div className="sm:col-span-2"><Label>Kỹ thuật</Label>{personSelect(w.techOwner, (v) => set({ techOwner: v }))}</div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Huỷ</Button>
        <Button onClick={() => { if (w.name && w.brandId) { onSubmit(w); onClose(); } }}>Lưu</Button>
      </DialogFooter>
    </>
  );
}

function WebsitesPage() {
  const { websites, brands, add, update, remove } = useStore();
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [editing, setEditing] = useState<Website | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => websites.filter((w) =>
    (!search || w.name.toLowerCase().includes(search.toLowerCase()) || w.url.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || w.brandId === fBrand) &&
    (fStatus === "all" || w.status === fStatus)
  ), [websites, search, fBrand, fStatus]);

  return (
    <>
      <PageHeader
        title="Dự Án Web"
        description="Quản lý các website và quy trình triển khai nội dung / SEO."
        actions={
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm website</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Tạo website</DialogTitle></DialogHeader>
              <WebsiteForm onSubmit={(w) => add("websites", w)} onClose={() => setAdding(false)} />
            </DialogContent>
          </Dialog>
        }
      />
      <FilterBar>
        <Input placeholder="Tìm..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={fBrand} onValueChange={setFBrand}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thương hiệu</SelectItem>
            {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Tên website</th>
                <th className="text-left font-medium px-4 py-2.5">Link</th>
                <th className="text-left font-medium px-4 py-2.5">Thương hiệu</th>
                <th className="text-left font-medium px-4 py-2.5">SEO</th>
                <th className="text-left font-medium px-4 py-2.5">Content</th>
                <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                <th className="text-right font-medium px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Chưa có website.</td></tr>}
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">
                    <Link to="/websites/$id" params={{ id: w.id }} className="hover:text-primary">{w.name}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {w.url ? <a href={w.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">{w.url.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" /></a> : "—"}
                  </td>
                  <td className="px-4 py-2.5">{brands.find((b) => b.id === w.brandId)?.name || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{w.seoOwner || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{w.contentOwner || "—"}</td>
                  <td className="px-4 py-2.5"><StatusBadge value={w.status} /></td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove("websites", w.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa website</DialogTitle></DialogHeader>
          {editing && <WebsiteForm initial={editing} onSubmit={(w) => update("websites", w.id, w)} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
