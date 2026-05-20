import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, uid, type Brand } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, EmptyState } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Globe, Share2, MapPin, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/brands/")({
  head: () => ({ meta: [{ title: "Thương Hiệu — Base Marketing" }] }),
  component: () => (
    <RequirePermission perm="brand.view">
      <BrandsPage />
    </RequirePermission>
  ),
});

const BRAND_STATUS = ["Đang xây dựng", "Đang vận hành", "Đang tối ưu", "Tạm dừng", "Lưu trữ"] as const;

function BrandForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Brand>; onSubmit: (b: Brand) => void; onClose: () => void;
}) {
  const { people } = useStore();
  const [b, setB] = useState<Brand>({
    id: initial?.id || uid(),
    name: initial?.name || "",
    field: initial?.field,
    website: initial?.website,
    description: initial?.description,
    usp: initial?.usp,
    owner: initial?.owner,
    status: initial?.status || "Đang xây dựng",
    docLink: initial?.docLink,
    notes: initial?.notes,
  });
  const set = (p: Partial<Brand>) => setB({ ...b, ...p });
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label>Tên thương hiệu *</Label>
          <Input value={b.name} onChange={(e) => set({ name: e.target.value })} /></div>
        <div><Label>Lĩnh vực</Label><Input value={b.field || ""} onChange={(e) => set({ field: e.target.value })} /></div>
        <div><Label>Website chính</Label><Input value={b.website || ""} onChange={(e) => set({ website: e.target.value })} /></div>
        <div><Label>Người phụ trách</Label>
          <Select value={b.owner || "_"} onValueChange={(v) => set({ owner: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">—</SelectItem>
              {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select></div>
        <div><Label>Trạng thái</Label>
          <Select value={b.status} onValueChange={(v) => set({ status: v as Brand["status"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{BRAND_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="sm:col-span-2"><Label>Mô tả ngắn</Label>
          <Textarea value={b.description || ""} onChange={(e) => set({ description: e.target.value })} rows={2} /></div>
        <div className="sm:col-span-2"><Label>USP / Điểm mạnh</Label>
          <Textarea value={b.usp || ""} onChange={(e) => set({ usp: e.target.value })} rows={2} /></div>
        <div className="sm:col-span-2"><Label>Link tài liệu thương hiệu</Label>
          <Input value={b.docLink || ""} onChange={(e) => set({ docLink: e.target.value })} placeholder="https://..." /></div>
        <div className="sm:col-span-2"><Label>Ghi chú</Label>
          <Textarea value={b.notes || ""} onChange={(e) => set({ notes: e.target.value })} rows={2} /></div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Huỷ</Button>
        <Button onClick={() => { if (b.name.trim()) { onSubmit(b); onClose(); } }}>Lưu</Button>
      </DialogFooter>
    </>
  );
}

function BrandsPage() {
  const { brands, websites, socials, places, add, update, remove } = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("brand.create");
  const canEdit = can("brand.edit");
  const canDelete = can("brand.delete");
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [editing, setEditing] = useState<Brand | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => brands.filter((b) =>
    (!search || b.name.toLowerCase().includes(search.toLowerCase()) || b.field?.toLowerCase().includes(search.toLowerCase())) &&
    (fStatus === "all" || b.status === fStatus)
  ), [brands, search, fStatus]);

  return (
    <>
      <PageHeader
        title="Thương Hiệu"
        description="Hồ sơ gốc của từng thương hiệu / dự án marketing."
        actions={canCreate ? (
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1.5" />Thêm thương hiệu</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Tạo thương hiệu</DialogTitle></DialogHeader>
              <BrandForm onSubmit={(b) => add("brands", b)} onClose={() => setAdding(false)} />
            </DialogContent>
          </Dialog>
        ) : undefined}
      />
      <FilterBar>
        <Input placeholder="Tìm theo tên / lĩnh vực..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {BRAND_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-5 w-5" />}
          title={brands.length === 0 ? "Chưa có thương hiệu" : "Không có thương hiệu phù hợp bộ lọc"}
          hint={brands.length === 0 ? "Tạo thương hiệu đầu tiên để bắt đầu quản lý dự án marketing." : "Thử bỏ bộ lọc hoặc tìm với từ khoá khác."}
          action={brands.length === 0 && canCreate ? (
            <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Tạo thương hiệu đầu tiên</Button>
          ) : undefined}
        />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => {
          const wCount = websites.filter((w) => w.brandId === b.id).length;
          const sCount = socials.filter((s) => s.brandId === b.id).length;
          const pCount = places.filter((p) => p.brandId === b.id).length;
          return (
            <Card key={b.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to="/brands/$id" params={{ id: b.id }} className="text-base font-semibold hover:text-primary">
                      {b.name}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">{b.field || "—"}</div>
                  </div>
                  <StatusBadge value={b.status} />
                </div>
                {b.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{b.description}</p>}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="rounded-md bg-muted/50 py-2">
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Globe className="h-3 w-3" />Web</div>
                    <div className="font-semibold text-sm mt-0.5">{wCount}</div>
                  </div>
                  <div className="rounded-md bg-muted/50 py-2">
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Share2 className="h-3 w-3" />Social</div>
                    <div className="font-semibold text-sm mt-0.5">{sCount}</div>
                  </div>
                  <div className="rounded-md bg-muted/50 py-2">
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><MapPin className="h-3 w-3" />Map</div>
                    <div className="font-semibold text-sm mt-0.5">{pCount}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">PT: {b.owner || "—"}</span>
                  <div className="flex gap-1">
                    {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditing(b)}><Pencil className="h-3.5 w-3.5" /></Button>}
                    {canDelete && <Button size="icon" variant="ghost" onClick={() => remove("brands", b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/brands/$id" params={{ id: b.id }}>Mở<ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa thương hiệu</DialogTitle></DialogHeader>
          {editing && (
            <BrandForm initial={editing} onSubmit={(b) => update("brands", b.id, b)} onClose={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
