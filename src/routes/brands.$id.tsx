import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, uid, type Website, type SocialChannel, type LocalPlace, type Brand, type BrandDocument, type BrandNote } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Share2, MapPin, Plus, ExternalLink, ArrowLeft, Pencil, Trash2, FileText, StickyNote, Save } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/brands/$id")({
  head: () => ({ meta: [{ title: "Chi tiết thương hiệu — Base Marketing" }] }),
  component: BrandDetail,
  notFoundComponent: () => <div className="p-10 text-center">Không tìm thấy thương hiệu.</div>,
});

const BRAND_STATUS = ["Đang xây dựng", "Đang vận hành", "Đang tối ưu", "Tạm dừng", "Lưu trữ"] as const;
const DOC_TYPES: BrandDocument["type"][] = ["Brand guideline", "Content guideline", "SEO guideline", "Social guideline", "Hình ảnh sản phẩm", "Catalogue/Profile", "Báo giá", "Tài liệu khác"];
const NOTE_IMPORTANCE: BrandNote["importance"][] = ["Thông thường", "Quan trọng", "Cần chú ý"];
const NOTE_STATUS: BrandNote["status"][] = ["Mở", "Đã xử lý", "Đóng"];

function BrandDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const s = useStore();
  const { can, user } = useCurrentUser();
  const brand = s.brands.find((b) => b.id === id);

  if (!brand) {
    return (
      <div className="p-10 text-center">
        <p>Không tìm thấy thương hiệu.</p>
        <Button variant="link" onClick={() => navigate({ to: "/brands" })}>Quay lại danh sách</Button>
      </div>
    );
  }

  const canEdit = can("brand.edit");
  const canProfile = canEdit || can("brand.profile");
  const canContact = canEdit || can("brand.contact");
  const canIdentity = canEdit || can("brand.identity");
  const canDocs = canEdit || can("brand.docs");
  const canNotes = canEdit || can("brand.notes");
  const canChannels = canEdit || can("brand.view_channels");

  const websites = s.websites.filter((w) => w.brandId === brand.id);
  const socials = s.socials.filter((c) => c.brandId === brand.id);
  const places = s.places.filter((p) => p.brandId === brand.id);
  const tasks = s.tasks.filter((t) => t.brandId === brand.id);
  const contents = s.webContents.filter((c) => c.brandId === brand.id);
  const orders = s.orders.filter((o) => o.brandId === brand.id);

  const openTasks = tasks.filter((t) => t.status !== "Hoàn thành" && t.status !== "Đã hủy").length;
  const producingContents = contents.filter((c) => c.status !== "Hoàn thành").length;
  const openOrders = orders.filter((o) => o.status !== "Đã duyệt" && o.status !== "Đã hủy").length;

  const update = (patch: Partial<Brand>) => s.update("brands", brand.id, { ...brand, ...patch });

  return (
    <>
      <Link to="/brands" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" />Tất cả thương hiệu
      </Link>
      <PageHeader
        title={brand.name}
        description={[brand.field, brand.projectName].filter(Boolean).join(" • ") || undefined}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge value={brand.status} />
            <span className="text-xs text-muted-foreground hidden sm:inline">PT: {brand.owner || "—"}</span>
          </div>
        }
      />

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profile">Thông tin dự án</TabsTrigger>
          <TabsTrigger value="contact">Thông tin liên hệ</TabsTrigger>
          <TabsTrigger value="channels">Hệ sinh thái kênh</TabsTrigger>
          <TabsTrigger value="identity">Nhận diện</TabsTrigger>
          <TabsTrigger value="docs">Tài liệu</TabsTrigger>
          <TabsTrigger value="notes">Ghi chú</TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: PROFILE ===== */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <ProfileTab brand={brand} update={update} canEdit={canProfile} people={s.people} />
          <Card>
            <CardHeader><CardTitle className="text-base">Tổng quan liên kết</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatBox icon={Globe} label="Website" value={websites.length} />
                <StatBox icon={Share2} label="Social" value={socials.length} />
                <StatBox icon={MapPin} label="Local Map" value={places.length} />
                <StatBox icon={FileText} label="Task mở" value={openTasks} />
                <StatBox icon={FileText} label="Content SX" value={producingContents} />
                <StatBox icon={FileText} label="Order mở" value={openOrders} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: CONTACT ===== */}
        <TabsContent value="contact" className="mt-4">
          <ContactTab brand={brand} update={update} canEdit={canContact} />
        </TabsContent>

        {/* ===== TAB 3: CHANNELS ===== */}
        <TabsContent value="channels" className="mt-4 space-y-4">
          <ChannelsTab
            brand={brand}
            websites={websites}
            socials={socials}
            places={places}
            canManage={canChannels}
          />
        </TabsContent>

        {/* ===== TAB 4: IDENTITY ===== */}
        <TabsContent value="identity" className="mt-4">
          <IdentityTab brand={brand} update={update} canEdit={canIdentity} />
        </TabsContent>

        {/* ===== TAB 5: DOCS ===== */}
        <TabsContent value="docs" className="mt-4">
          <DocsTab brand={brand} update={update} canEdit={canDocs} meName={user?.fullName || ""} />
        </TabsContent>

        {/* ===== TAB 6: NOTES ===== */}
        <TabsContent value="notes" className="mt-4">
          <NotesTab brand={brand} update={update} canEdit={canNotes} meName={user?.fullName || ""} />
        </TabsContent>
      </Tabs>
    </>
  );
}

/* ---------------- Tab 1: Profile ---------------- */
function ProfileTab({ brand, update, canEdit, people }: {
  brand: Brand; update: (p: Partial<Brand>) => void; canEdit: boolean; people: any[];
}) {
  const [draft, setDraft] = useState<Brand>(brand);
  const set = (p: Partial<Brand>) => setDraft({ ...draft, ...p });
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(brand), [draft, brand]);

  const save = () => {
    if (!canEdit) { toast.error("Bạn không có quyền chỉnh sửa."); return; }
    if (!draft.name.trim()) { toast.error("Tên thương hiệu bắt buộc."); return; }
    update(draft);
    toast.success("Đã lưu hồ sơ thương hiệu.");
  };

  const ro = !canEdit;
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Hồ sơ dự án</CardTitle>
        {canEdit && <Button size="sm" disabled={!dirty} onClick={save}><Save className="h-4 w-4 mr-1.5" />Lưu thay đổi</Button>}
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label="Tên thương hiệu *"><Input value={draft.name} readOnly={ro} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Tên dự án"><Input value={draft.projectName || ""} readOnly={ro} onChange={(e) => set({ projectName: e.target.value })} /></Field>
        <Field label="Lĩnh vực / Ngành hàng"><Input value={draft.field || ""} readOnly={ro} onChange={(e) => set({ field: e.target.value })} /></Field>
        <Field label="Website chính"><Input value={draft.website || ""} readOnly={ro} onChange={(e) => set({ website: e.target.value })} placeholder="https://..." /></Field>
        <Field label="Người phụ trách">
          {ro ? <Input value={draft.owner || ""} readOnly /> : (
            <Select value={draft.owner || "_"} onValueChange={(v) => set({ owner: v === "_" ? undefined : v })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_">—</SelectItem>
                {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </Field>
        <Field label="Trạng thái">
          {ro ? <Input value={draft.status} readOnly /> : (
            <Select value={draft.status} onValueChange={(v) => set({ status: v as Brand["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BRAND_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </Field>
        <Field label="Ngày bắt đầu"><Input type="date" value={draft.startDate || ""} readOnly={ro} onChange={(e) => set({ startDate: e.target.value })} /></Field>
        <Field label="Mô tả ngắn" full><Textarea rows={2} value={draft.description || ""} readOnly={ro} onChange={(e) => set({ description: e.target.value })} /></Field>
        <Field label="Mô tả chi tiết dự án" full><Textarea rows={3} value={draft.longDescription || ""} readOnly={ro} onChange={(e) => set({ longDescription: e.target.value })} /></Field>
        <Field label="Mục tiêu marketing" full><Textarea rows={2} value={draft.marketingGoal || ""} readOnly={ro} onChange={(e) => set({ marketingGoal: e.target.value })} /></Field>
        <Field label="Tệp khách hàng mục tiêu" full><Textarea rows={2} value={draft.targetAudience || ""} readOnly={ro} onChange={(e) => set({ targetAudience: e.target.value })} /></Field>
        <Field label="Sản phẩm / dịch vụ chính" full><Textarea rows={2} value={draft.mainProducts || ""} readOnly={ro} onChange={(e) => set({ mainProducts: e.target.value })} /></Field>
        <Field label="USP / Điểm khác biệt" full><Textarea rows={2} value={draft.usp || ""} readOnly={ro} onChange={(e) => set({ usp: e.target.value })} /></Field>
        <Field label="Ghi chú" full><Textarea rows={2} value={draft.notes || ""} readOnly={ro} onChange={(e) => set({ notes: e.target.value })} /></Field>
      </CardContent>
    </Card>
  );
}

/* ---------------- Tab 2: Contact ---------------- */
function ContactTab({ brand, update, canEdit }: { brand: Brand; update: (p: Partial<Brand>) => void; canEdit: boolean }) {
  const [d, setD] = useState<Brand>(brand);
  const set = (p: Partial<Brand>) => setD({ ...d, ...p });
  const dirty = JSON.stringify(d) !== JSON.stringify(brand);
  const ro = !canEdit;
  const save = () => { if (!canEdit) return toast.error("Không có quyền."); update(d); toast.success("Đã lưu thông tin liên hệ."); };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Thông tin liên hệ thống nhất</CardTitle>
        {canEdit && <Button size="sm" disabled={!dirty} onClick={save}><Save className="h-4 w-4 mr-1.5" />Lưu</Button>}
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label="Tên pháp lý / đơn vị"><Input value={d.legalName || ""} readOnly={ro} onChange={(e) => set({ legalName: e.target.value })} /></Field>
        <Field label="Người đại diện / đầu mối"><Input value={d.contactPerson || ""} readOnly={ro} onChange={(e) => set({ contactPerson: e.target.value })} /></Field>
        <Field label="Số điện thoại chính"><Input value={d.mainPhone || ""} readOnly={ro} onChange={(e) => set({ mainPhone: e.target.value })} /></Field>
        <Field label="Hotline"><Input value={d.hotline || ""} readOnly={ro} onChange={(e) => set({ hotline: e.target.value })} /></Field>
        <Field label="Email"><Input value={d.email || ""} readOnly={ro} onChange={(e) => set({ email: e.target.value })} /></Field>
        <Field label="Website chính"><Input value={d.website || ""} readOnly={ro} onChange={(e) => set({ website: e.target.value })} /></Field>
        <Field label="Zalo"><Input value={d.zalo || ""} readOnly={ro} onChange={(e) => set({ zalo: e.target.value })} /></Field>
        <Field label="Fanpage chính"><Input value={d.fanpage || ""} readOnly={ro} onChange={(e) => set({ fanpage: e.target.value })} /></Field>
        <Field label="Google Map chính" full><Input value={d.mapLink || ""} readOnly={ro} onChange={(e) => set({ mapLink: e.target.value })} placeholder="https://maps..." /></Field>
        <Field label="Địa chỉ showroom / VP" full><Input value={d.officeAddress || ""} readOnly={ro} onChange={(e) => set({ officeAddress: e.target.value })} /></Field>
        <Field label="Địa chỉ xưởng / kho" full><Input value={d.warehouseAddress || ""} readOnly={ro} onChange={(e) => set({ warehouseAddress: e.target.value })} /></Field>
        <Field label="Khu vực phục vụ"><Input value={d.serviceArea || ""} readOnly={ro} onChange={(e) => set({ serviceArea: e.target.value })} /></Field>
        <Field label="Mã số thuế"><Input value={d.taxCode || ""} readOnly={ro} onChange={(e) => set({ taxCode: e.target.value })} /></Field>
        <Field label="Ghi chú liên hệ" full><Textarea rows={2} value={d.contactNotes || ""} readOnly={ro} onChange={(e) => set({ contactNotes: e.target.value })} /></Field>
      </CardContent>
    </Card>
  );
}

/* ---------------- Tab 3: Channels ---------------- */
function ChannelsTab({ brand, websites, socials, places, canManage }: {
  brand: Brand; websites: Website[]; socials: SocialChannel[]; places: LocalPlace[]; canManage: boolean;
}) {
  const [open, setOpen] = useState<null | "web" | "social" | "local">(null);
  return (
    <>
      <ChannelGroup
        icon={Globe} title="Website"
        items={websites.map((w) => ({ id: w.id, name: w.name, sub: w.url, extra: `SEO: ${w.seoOwner || "—"} • Content: ${w.contentOwner || "—"}`, status: w.status, href: { to: "/websites/$id" as const, params: { id: w.id } } }))}
        onAdd={canManage ? () => setOpen("web") : undefined}
        emptyHint="Chưa có dự án web cho thương hiệu này."
      />
      <ChannelGroup
        icon={Share2} title="Social"
        items={socials.map((c) => ({ id: c.id, name: c.name, sub: c.url, extra: `${c.platform} • PT: ${c.owner || "—"}`, status: c.status, href: { to: "/social/$id" as const, params: { id: c.id } } }))}
        onAdd={canManage ? () => setOpen("social") : undefined}
        emptyHint="Chưa có kênh social cho thương hiệu này."
      />
      <ChannelGroup
        icon={MapPin} title="Local Map"
        items={places.map((p) => ({ id: p.id, name: p.name, sub: p.address || p.mapLink, extra: `PT: ${(p as any).owner || "—"}`, status: p.verifyStatus, href: { to: "/local/$id" as const, params: { id: p.id } } }))}
        onAdd={canManage ? () => setOpen("local") : undefined}
        emptyHint="Chưa có địa điểm Local Map cho thương hiệu này."
      />
      <QuickAddDialog open={open} onClose={() => setOpen(null)} brandId={brand.id} />
    </>
  );
}

function ChannelGroup({ icon: Icon, title, items, onAdd, emptyHint }: {
  icon: any; title: string;
  items: { id: string; name: string; sub?: string; extra?: string; status: string; href: any }[];
  onAdd?: () => void; emptyHint: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title} ({items.length})</CardTitle>
        {onAdd && <Button size="sm" variant="outline" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" />Thêm {title.toLowerCase()}</Button>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {items.length === 0 && <div className="px-5 py-6 text-sm text-muted-foreground">{emptyHint}</div>}
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                {it.sub && <div className="text-xs text-muted-foreground mt-0.5 truncate">{it.sub}</div>}
                {it.extra && <div className="text-xs text-muted-foreground mt-0.5 truncate">{it.extra}</div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge value={it.status} />
                <Button size="sm" variant="outline" asChild>
                  <Link {...it.href}>Mở</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAddDialog({ open, onClose, brandId }: { open: null | "web" | "social" | "local"; onClose: () => void; brandId: string }) {
  const { add } = useStore();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<SocialChannel["platform"]>("Facebook Page");
  const [address, setAddress] = useState("");
  const reset = () => { setName(""); setUrl(""); setAddress(""); setPlatform("Facebook Page"); };
  const submit = () => {
    if (!name.trim()) return;
    if (open === "web") add("websites", { id: uid(), name, url, brandId, type: "Website thương hiệu", status: "Đang xây dựng" } as Website);
    else if (open === "social") add("socials", { id: uid(), name, url, platform, brandId, status: "Đang xây" } as SocialChannel);
    else if (open === "local") add("places", { id: uid(), name, mapLink: url, address, brandId, verifyStatus: "Chưa xác minh" } as LocalPlace);
    toast.success("Đã thêm.");
    reset(); onClose();
  };
  return (
    <Dialog open={!!open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>
          {open === "web" && "Thêm website cho thương hiệu"}
          {open === "social" && "Thêm kênh social cho thương hiệu"}
          {open === "local" && "Thêm Local Map cho thương hiệu"}
        </DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Tên *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          {open === "social" && (
            <div><Label>Nền tảng</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as SocialChannel["platform"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Facebook Page", "Facebook Group", "TikTok", "YouTube", "Instagram", "Zalo OA", "LinkedIn", "Khác"].map((p) =>
                    <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div><Label>{open === "local" ? "Link Google Map" : "URL"}</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
          {open === "local" && <div><Label>Địa chỉ</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Huỷ</Button>
          <Button onClick={submit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Tab 4: Identity ---------------- */
function IdentityTab({ brand, update, canEdit }: { brand: Brand; update: (p: Partial<Brand>) => void; canEdit: boolean }) {
  const [d, setD] = useState<Brand>(brand);
  const set = (p: Partial<Brand>) => setD({ ...d, ...p });
  const dirty = JSON.stringify(d) !== JSON.stringify(brand);
  const ro = !canEdit;
  const save = () => { if (!canEdit) return toast.error("Không có quyền."); update(d); toast.success("Đã lưu nhận diện."); };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Nhận diện thương hiệu</CardTitle>
        {canEdit && <Button size="sm" disabled={!dirty} onClick={save}><Save className="h-4 w-4 mr-1.5" />Lưu</Button>}
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label="Logo chính (URL/Drive)" full><Input value={d.logoMain || ""} readOnly={ro} onChange={(e) => set({ logoMain: e.target.value })} placeholder="https://..." /></Field>
        <Field label="Logo phụ (URL/Drive)" full><Input value={d.logoSecondary || ""} readOnly={ro} onChange={(e) => set({ logoSecondary: e.target.value })} /></Field>
        <Field label="Màu chính">
          <div className="flex gap-2 items-center">
            <Input value={d.colorPrimary || ""} readOnly={ro} onChange={(e) => set({ colorPrimary: e.target.value })} placeholder="#000000" />
            {d.colorPrimary && <div className="h-9 w-9 rounded border" style={{ background: d.colorPrimary }} />}
          </div>
        </Field>
        <Field label="Màu phụ">
          <div className="flex gap-2 items-center">
            <Input value={d.colorSecondary || ""} readOnly={ro} onChange={(e) => set({ colorSecondary: e.target.value })} placeholder="#ffffff" />
            {d.colorSecondary && <div className="h-9 w-9 rounded border" style={{ background: d.colorSecondary }} />}
          </div>
        </Field>
        <Field label="Font chữ thương hiệu"><Input value={d.brandFont || ""} readOnly={ro} onChange={(e) => set({ brandFont: e.target.value })} /></Field>
        <Field label="Slogan / Tagline"><Input value={d.slogan || ""} readOnly={ro} onChange={(e) => set({ slogan: e.target.value })} /></Field>
        <Field label="Tone giọng nội dung" full><Textarea rows={2} value={d.toneOfVoice || ""} readOnly={ro} onChange={(e) => set({ toneOfVoice: e.target.value })} /></Field>
        <Field label="Phong cách hình ảnh" full><Textarea rows={2} value={d.imageStyle || ""} readOnly={ro} onChange={(e) => set({ imageStyle: e.target.value })} /></Field>
        <Field label="Từ khóa thương hiệu" full><Textarea rows={2} value={d.brandKeywords || ""} readOnly={ro} onChange={(e) => set({ brandKeywords: e.target.value })} /></Field>
        <Field label="Quy chuẩn sử dụng logo" full><Textarea rows={2} value={d.logoUsage || ""} readOnly={ro} onChange={(e) => set({ logoUsage: e.target.value })} /></Field>
        <Field label="Ghi chú nhận diện" full><Textarea rows={2} value={d.identityNotes || ""} readOnly={ro} onChange={(e) => set({ identityNotes: e.target.value })} /></Field>
      </CardContent>
    </Card>
  );
}

/* ---------------- Tab 5: Docs ---------------- */
function DocsTab({ brand, update, canEdit, meName }: { brand: Brand; update: (p: Partial<Brand>) => void; canEdit: boolean; meName: string }) {
  const docs = brand.documents || [];
  const [editing, setEditing] = useState<BrandDocument | null>(null);
  const [adding, setAdding] = useState(false);

  const saveDoc = (doc: BrandDocument) => {
    const next = docs.some((x) => x.id === doc.id)
      ? docs.map((x) => (x.id === doc.id ? doc : x))
      : [...docs, doc];
    update({ documents: next });
    toast.success("Đã lưu tài liệu.");
  };
  const removeDoc = (id: string) => {
    update({ documents: docs.filter((x) => x.id !== id) });
    toast.success("Đã xóa tài liệu.");
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Tài liệu / Guideline ({docs.length})</CardTitle>
        {canEdit && <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-3.5 w-3.5 mr-1" />Thêm tài liệu</Button>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {docs.length === 0 && <div className="px-5 py-6 text-sm text-muted-foreground">Chưa có tài liệu nào.</div>}
          {docs.map((d) => (
            <div key={d.id} className="px-5 py-3 flex items-start justify-between gap-3 hover:bg-muted/30">
              <div className="min-w-0">
                <div className="font-medium flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />{d.name}
                  {d.type && <Badge variant="secondary" className="text-xs">{d.type}</Badge>}
                </div>
                {d.notes && <div className="text-xs text-muted-foreground mt-1">{d.notes}</div>}
                <div className="text-xs text-muted-foreground mt-1">
                  {d.updatedAt && <>Cập nhật: {new Date(d.updatedAt).toLocaleDateString("vi-VN")} </>}
                  {d.updatedBy && <>• {d.updatedBy}</>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {d.url && <Button size="sm" variant="outline" asChild><a href={d.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Mở</a></Button>}
                {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditing(d)}><Pencil className="h-3.5 w-3.5" /></Button>}
                {canEdit && <Button size="icon" variant="ghost" onClick={() => removeDoc(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <DocDialog
        open={adding || !!editing}
        initial={editing || undefined}
        onClose={() => { setAdding(false); setEditing(null); }}
        onSave={(d) => saveDoc({ ...d, updatedAt: new Date().toISOString(), updatedBy: meName })}
      />
    </Card>
  );
}

function DocDialog({ open, initial, onClose, onSave }: {
  open: boolean; initial?: BrandDocument; onClose: () => void; onSave: (d: BrandDocument) => void;
}) {
  const [d, setD] = useState<BrandDocument>(initial || { id: uid(), name: "", type: "Tài liệu khác" });
  const set = (p: Partial<BrandDocument>) => setD({ ...d, ...p });
  // Reset on open change
  useMemo(() => { if (open) setD(initial || { id: uid(), name: "", type: "Tài liệu khác" }); }, [open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Sửa tài liệu" : "Thêm tài liệu"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Tên tài liệu *</Label><Input value={d.name} onChange={(e) => set({ name: e.target.value })} /></div>
          <div><Label>Loại</Label>
            <Select value={d.type || "Tài liệu khác"} onValueChange={(v) => set({ type: v as BrandDocument["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t!}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Link tài liệu</Label><Input value={d.url || ""} onChange={(e) => set({ url: e.target.value })} placeholder="https://..." /></div>
          <div><Label>Ghi chú</Label><Textarea rows={2} value={d.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button onClick={() => { if (!d.name.trim()) return toast.error("Tên bắt buộc."); onSave(d); onClose(); }}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Tab 6: Notes ---------------- */
function NotesTab({ brand, update, canEdit, meName }: { brand: Brand; update: (p: Partial<Brand>) => void; canEdit: boolean; meName: string }) {
  const notes = brand.operationalNotes || [];
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BrandNote | null>(null);

  const saveNote = (n: BrandNote) => {
    const next = notes.some((x) => x.id === n.id) ? notes.map((x) => (x.id === n.id ? n : x)) : [...notes, n];
    update({ operationalNotes: next });
    toast.success("Đã lưu ghi chú.");
  };
  const removeNote = (id: string) => {
    update({ operationalNotes: notes.filter((x) => x.id !== id) });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Ghi chú vận hành ({notes.length})</CardTitle>
        {canEdit && <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-3.5 w-3.5 mr-1" />Thêm ghi chú</Button>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {notes.length === 0 && <div className="px-5 py-6 text-sm text-muted-foreground">Chưa có ghi chú vận hành.</div>}
          {notes.map((n) => (
            <div key={n.id} className="px-5 py-3 flex items-start justify-between gap-3 hover:bg-muted/30">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  {n.importance && (
                    <Badge variant={n.importance === "Cần chú ý" ? "destructive" : n.importance === "Quan trọng" ? "default" : "secondary"} className="text-xs">
                      {n.importance}
                    </Badge>
                  )}
                  {n.status && <Badge variant="outline" className="text-xs">{n.status}</Badge>}
                </div>
                <div className="text-sm mt-2 whitespace-pre-wrap">{n.content}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {n.createdBy || "—"}{n.createdAt && ` • ${new Date(n.createdAt).toLocaleString("vi-VN")}`}
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(n)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => removeNote(n.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <NoteDialog
        open={adding || !!editing}
        initial={editing || undefined}
        meName={meName}
        onClose={() => { setAdding(false); setEditing(null); }}
        onSave={saveNote}
      />
    </Card>
  );
}

function NoteDialog({ open, initial, meName, onClose, onSave }: {
  open: boolean; initial?: BrandNote; meName: string; onClose: () => void; onSave: (n: BrandNote) => void;
}) {
  const blank = (): BrandNote => ({ id: uid(), content: "", importance: "Thông thường", status: "Mở", createdBy: meName, createdAt: new Date().toISOString() });
  const [n, setN] = useState<BrandNote>(initial || blank());
  const set = (p: Partial<BrandNote>) => setN({ ...n, ...p });
  useMemo(() => { if (open) setN(initial || blank()); }, [open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Sửa ghi chú" : "Thêm ghi chú"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Nội dung *</Label><Textarea rows={4} value={n.content} onChange={(e) => set({ content: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Mức độ</Label>
              <Select value={n.importance || "Thông thường"} onValueChange={(v) => set({ importance: v as BrandNote["importance"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{NOTE_IMPORTANCE.map((s) => <SelectItem key={s} value={s!}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Trạng thái</Label>
              <Select value={n.status || "Mở"} onValueChange={(v) => set({ status: v as BrandNote["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{NOTE_STATUS.map((s) => <SelectItem key={s} value={s!}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button onClick={() => { if (!n.content.trim()) return toast.error("Nội dung bắt buộc."); onSave(n); onClose(); }}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- shared bits ---------------- */
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-3 text-center">
      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Icon className="h-3 w-3" />{label}</div>
      <div className="font-semibold text-lg mt-1">{value}</div>
    </div>
  );
}
