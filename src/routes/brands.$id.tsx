import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, uid, type Website, type SocialChannel, type LocalPlace } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Globe, Share2, MapPin, Plus, ExternalLink, ArrowLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/brands/$id")({
  head: () => ({ meta: [{ title: "Hồ sơ thương hiệu — Base Marketing" }] }),
  component: BrandDetail,
  notFoundComponent: () => <div className="p-10">Không tìm thấy.</div>,
});

function BrandDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const s = useStore();
  const brand = s.brands.find((b) => b.id === id);
  const [open, setOpen] = useState<null | "web" | "social" | "local">(null);

  if (!brand) return (
    <div className="p-10 text-center">
      <p>Không tìm thấy thương hiệu.</p>
      <Button variant="link" onClick={() => navigate({ to: "/brands" })}>Quay lại</Button>
    </div>
  );

  const websites = s.websites.filter((w) => w.brandId === brand.id);
  const socials = s.socials.filter((c) => c.brandId === brand.id);
  const places = s.places.filter((p) => p.brandId === brand.id);
  const tasks = s.tasks.filter((t) => t.brandId === brand.id);

  return (
    <>
      <Link to="/brands" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" />Tất cả thương hiệu
      </Link>
      <PageHeader
        title={brand.name}
        description={brand.field}
        actions={<StatusBadge value={brand.status} />}
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Hồ sơ</TabsTrigger>
          <TabsTrigger value="channels">Kênh liên kết</TabsTrigger>
          <TabsTrigger value="people">Nhân sự</TabsTrigger>
          <TabsTrigger value="docs">Tài liệu</TabsTrigger>
          <TabsTrigger value="tasks">Task ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Thông tin chung</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <Row label="Lĩnh vực" v={brand.field} />
              <Row label="Website chính" v={brand.website} />
              <Row label="Người phụ trách" v={brand.owner} />
              <Row label="Trạng thái" v={<StatusBadge value={brand.status} />} />
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-base">Mô tả & USP</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><div className="text-muted-foreground text-xs">Mô tả</div><div className="mt-1">{brand.description || "—"}</div></div>
              <div><div className="text-muted-foreground text-xs">USP / Điểm mạnh</div><div className="mt-1">{brand.usp || "—"}</div></div>
              <div><div className="text-muted-foreground text-xs">Ghi chú vận hành</div><div className="mt-1">{brand.notes || "—"}</div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-4 space-y-4">
          <ChannelGroup
            icon={Globe} title="Website" items={websites.map((w) => ({ id: w.id, name: w.name, sub: w.url, status: w.status, href: { to: "/websites/$id", params: { id: w.id } } }))}
            onAdd={() => setOpen("web")}
          />
          <ChannelGroup
            icon={Share2} title="Social" items={socials.map((c) => ({ id: c.id, name: c.name, sub: c.platform, status: c.status, href: { to: "/social/$id", params: { id: c.id } } }))}
            onAdd={() => setOpen("social")}
          />
          <ChannelGroup
            icon={MapPin} title="Local Map" items={places.map((p) => ({ id: p.id, name: p.name, sub: p.address, status: p.verifyStatus, href: { to: "/local/$id", params: { id: p.id } } }))}
            onAdd={() => setOpen("local")}
          />
        </TabsContent>

        <TabsContent value="people" className="mt-4">
          <Card><CardContent className="p-5 text-sm text-muted-foreground">
            Người phụ trách chính: <span className="text-foreground font-medium">{brand.owner || "—"}</span>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <Card><CardContent className="p-5 text-sm">
            {brand.docLink ? (
              <a href={brand.docLink} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                {brand.docLink} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : <span className="text-muted-foreground">Chưa có tài liệu / guideline.</span>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Task</th>
                  <th className="text-left font-medium px-4 py-2.5">PT</th>
                  <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tasks.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-8">Chưa có task.</td></tr>}
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{t.title}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{t.assignee || "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge value={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <QuickAddDialog open={open} onClose={() => setOpen(null)} brandId={brand.id} />
    </>
  );
}

function Row({ label, v }: { label: string; v?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium text-right">{v || "—"}</div>
    </div>
  );
}

function ChannelGroup({ icon: Icon, title, items, onAdd }: {
  icon: any; title: string;
  items: { id: string; name: string; sub?: string; status: string; href: any }[];
  onAdd: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title} ({items.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" />Thêm {title.toLowerCase()}</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {items.length === 0 && <div className="px-5 py-6 text-sm text-muted-foreground">Chưa có {title.toLowerCase()}.</div>}
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30">
              <div>
                <Link {...it.href} className="font-medium hover:text-primary">{it.name}</Link>
                {it.sub && <div className="text-xs text-muted-foreground mt-0.5">{it.sub}</div>}
              </div>
              <StatusBadge value={it.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAddDialog({ open, onClose, brandId }: {
  open: null | "web" | "social" | "local"; onClose: () => void; brandId: string;
}) {
  const { add } = useStore();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<SocialChannel["platform"]>("Facebook Page");
  const [address, setAddress] = useState("");
  const reset = () => { setName(""); setUrl(""); setAddress(""); setPlatform("Facebook Page"); };

  const submit = () => {
    if (!name.trim()) return;
    if (open === "web") {
      const w: Website = { id: uid(), name, url, brandId, status: "Đang xây dựng" };
      add("websites", w);
    } else if (open === "social") {
      const c: SocialChannel = { id: uid(), name, url, platform, brandId, status: "Đang xây" };
      add("socials", c);
    } else if (open === "local") {
      const p: LocalPlace = { id: uid(), name, mapLink: url, address, brandId, verifyStatus: "Chưa xác minh" };
      add("places", p);
    }
    reset(); onClose();
  };

  return (
    <Dialog open={!!open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>
          {open === "web" && "Thêm website"}
          {open === "social" && "Thêm kênh social"}
          {open === "local" && "Thêm địa điểm Local Map"}
        </DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Tên *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          {open === "social" && (
            <div><Label>Nền tảng</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as SocialChannel["platform"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Facebook Page", "Facebook Group", "TikTok", "YouTube", "Instagram", "Zalo OA", "Khác"].map((p) =>
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          <div><Label>{open === "local" ? "Link Google Map" : "URL"}</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
          {open === "local" && (
            <div><Label>Địa chỉ</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Huỷ</Button>
          <Button onClick={submit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
