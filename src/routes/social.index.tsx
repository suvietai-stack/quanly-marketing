import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStore, uid, type SocialChannel, type SocialPost, SOCIAL_PLATFORMS, SOCIAL_CHANNEL_STATUSES } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, EmptyState } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, ExternalLink, Share2, FilePlus2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PostFormDialog } from "@/components/SocialPostDetail";

export const Route = createFileRoute("/social/")({
  head: () => ({ meta: [{"title": "Kênh Social — Base Sứ Việt"}, {"name": "description", "content": "Kênh Social: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:title", "content": "Kênh Social — Base Sứ Việt"}, {"property": "og:description", "content": "Kênh Social: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => (
    <RequirePermission perm="social.view">
      <SocialPage />
    </RequirePermission>
  ),
});

function ChannelForm({ initial, onSubmit, onClose }: { initial?: Partial<SocialChannel>; onSubmit: (c: SocialChannel) => void; onClose: () => void }) {
  const { brands, people } = useStore();
  const [c, setC] = useState<SocialChannel>({
    id: initial?.id || uid(), name: initial?.name || "",
    platform: initial?.platform || "Facebook Page", url: initial?.url,
    brandId: initial?.brandId || brands[0]?.id || "", owner: initial?.owner,
    frequency: initial?.frequency, goal: initial?.goal,
    status: initial?.status || "Đang xây", notes: initial?.notes,
  });
  const set = (p: Partial<SocialChannel>) => setC({ ...c, ...p });
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <div><Label>Tên kênh *</Label><Input value={c.name} onChange={(e) => set({ name: e.target.value })} /></div>
      <div><Label>Nền tảng</Label>
        <Select value={c.platform} onValueChange={(v) => set({ platform: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{SOCIAL_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Thương hiệu *</Label>
        <Select value={c.brandId} onValueChange={(v) => set({ brandId: v })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Người phụ trách</Label>
        <Select value={c.owner || "_"} onValueChange={(v) => set({ owner: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Link kênh</Label><Input value={c.url || ""} onChange={(e) => set({ url: e.target.value })} placeholder="https://..." /></div>
      <div><Label>Tần suất đăng</Label><Input value={c.frequency || ""} onChange={(e) => set({ frequency: e.target.value })} placeholder="VD: 5 bài/tuần" /></div>
      <div><Label>Trạng thái</Label>
        <Select value={c.status} onValueChange={(v) => set({ status: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{SOCIAL_CHANNEL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div className="sm:col-span-2"><Label>Mục tiêu kênh</Label><Textarea rows={2} value={c.goal || ""} onChange={(e) => set({ goal: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Ghi chú vận hành</Label><Textarea rows={2} value={c.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (c.name && c.brandId) { onSubmit(c); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
}

function SocialPage() {
  const s = useStore();
  const { user, can, scopeList } = useCurrentUser();
  const navigate = useNavigate();
  const canCreate = can("social.create");
  const canEdit = can("social.edit");
  const canPostCreate = can("social.post_create");
  const ME = user?.fullName || user?.username || "";

  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fPlatform, setFPlatform] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [editingCh, setEditingCh] = useState<SocialChannel | null>(null);
  const [addingCh, setAddingCh] = useState(false);
  const [addingPostFor, setAddingPostFor] = useState<SocialChannel | null>(null);

  const scopedSocials = useMemo(
    () => scopeList(s.socials, "social.view_all", "social.view_mine", (c) => !!ME && c.owner === ME),
    [s.socials, scopeList, ME]
  );

  const channels = useMemo(() => scopedSocials.filter((c) =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || c.brandId === fBrand) &&
    (fPlatform === "all" || c.platform === fPlatform) &&
    (fStatus === "all" || c.status === fStatus) &&
    (fOwner === "all" || c.owner === fOwner)
  ), [scopedSocials, search, fBrand, fPlatform, fStatus, fOwner]);

  const owners = useMemo(() => Array.from(new Set(s.socials.map((c) => c.owner).filter(Boolean) as string[])), [s.socials]);

  const countByStatus = (channelId: string) => {
    const list = s.socialPosts.filter((p) => p.channelId === channelId);
    return {
      producing: list.filter((p) => ["Kế hoạch", "Đang làm", "Cần sửa"].includes(p.status)).length,
      pending: list.filter((p) => p.status === "Chờ duyệt").length,
      waitingPublish: list.filter((p) => ["Đã duyệt", "Chờ đăng"].includes(p.status)).length,
      published: list.filter((p) => ["Đã đăng", "Hoàn thành"].includes(p.status)).length,
    };
  };

  return <>
    <PageHeader
      title="Kênh Social"
      description="Quản lý nhiều kênh social như những workspace riêng. Mở một kênh để vào sản xuất nội dung và theo dõi tăng trưởng."
      actions={canCreate ? (
        <Dialog open={addingCh} onOpenChange={setAddingCh}>
          <Button onClick={() => setAddingCh(true)}><Plus className="h-4 w-4 mr-1.5" />Thêm kênh</Button>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Tạo kênh social</DialogTitle></DialogHeader>
            <ChannelForm onSubmit={(c) => s.add("socials", c)} onClose={() => setAddingCh(false)} /></DialogContent>
        </Dialog>
      ) : undefined}
    />

    <FilterBar>
      <Input placeholder="Tìm kênh..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      <Select value={fBrand} onValueChange={setFBrand}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
      <Select value={fPlatform} onValueChange={setFPlatform}><SelectTrigger className="w-[170px]"><SelectValue placeholder="Nền tảng" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả nền tảng</SelectItem>{SOCIAL_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
      <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{SOCIAL_CHANNEL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      <Select value={fOwner} onValueChange={setFOwner}><SelectTrigger className="w-[170px]"><SelectValue placeholder="Người phụ trách" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả PT</SelectItem>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
    </FilterBar>

    {channels.length === 0 ? (
      <EmptyState
        icon={<Share2 className="h-5 w-5" />}
        title={s.socials.length === 0 ? "Chưa có kênh social" : "Không có kênh phù hợp bộ lọc"}
        hint={s.socials.length === 0 ? "Tạo kênh social đầu tiên để bắt đầu quản lý nội dung đa nền tảng." : undefined}
        action={s.socials.length === 0 && canCreate ? (
          <Button onClick={() => setAddingCh(true)}><Plus className="h-4 w-4 mr-1.5" />Tạo kênh social đầu tiên</Button>
        ) : undefined}
      />
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((c) => {
          const brand = s.brands.find((b) => b.id === c.brandId);
          const k = countByStatus(c.id);
          return <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <button onClick={() => navigate({ to: "/social/$id", params: { id: c.id } })}
                    className="font-semibold text-left hover:text-primary truncate block w-full">{c.name}</button>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.platform} · {brand?.name || "—"}</div>
                </div>
                <StatusBadge value={c.status} />
              </div>
              {c.url && <a href={c.url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate">
                <ExternalLink className="h-3 w-3 shrink-0" /><span className="truncate">{c.url}</span>
              </a>}
              <div className="text-xs text-muted-foreground">PT: <span className="text-foreground">{c.owner || "—"}</span> · {c.frequency || "Chưa đặt tần suất"}</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <Stat label="Đang làm" v={k.producing} />
                <Stat label="Chờ duyệt" v={k.pending} tone="warn" />
                <Stat label="Chờ đăng" v={k.waitingPublish} tone="info" />
                <Stat label="Đã đăng" v={k.published} tone="ok" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => navigate({ to: "/social/$id", params: { id: c.id } })}>Mở kênh</Button>
                <div className="flex gap-1">
                  {canPostCreate && <Button size="sm" variant="ghost" onClick={() => setAddingPostFor(c)}>
                    <FilePlus2 className="h-3.5 w-3.5 mr-1" />Thêm bài
                  </Button>}
                  {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditingCh(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>}
                </div>
              </div>
            </CardContent>
          </Card>;
        })}
      </div>
    )}

    <Dialog open={!!editingCh} onOpenChange={(o) => !o && setEditingCh(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Chỉnh sửa kênh social</DialogTitle></DialogHeader>
        {editingCh && <ChannelForm initial={editingCh} onSubmit={(c) => s.update("socials", c.id, c)} onClose={() => setEditingCh(null)} />}
      </DialogContent>
    </Dialog>

    {addingPostFor && (
      <PostFormDialog
        open={!!addingPostFor}
        onOpenChange={(o) => !o && setAddingPostFor(null)}
        channel={addingPostFor}
        onSubmit={(p: SocialPost) => { s.add("socialPosts", p); setAddingPostFor(null); }}
      />
    )}
  </>;
}

function Stat({ label, v, tone }: { label: string; v: number; tone?: "ok" | "warn" | "info" }) {
  const toneCls =
    tone === "ok" ? "text-success" :
    tone === "warn" ? "text-[oklch(0.55_0.13_75)]" :
    tone === "info" ? "text-info" : "text-foreground";
  return (
    <div className="rounded-md bg-muted/40 py-1.5">
      <div className={`text-base font-semibold leading-none ${toneCls}`}>{v}</div>
      <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
