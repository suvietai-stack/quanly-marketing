import { useMemo, useState } from "react";
import { useStore, uid, ENTITY_PLATFORMS, ENTITY_STATUSES, type EntitySocial } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, ExternalLink, Pencil, Trash2, Eye, EyeOff, ShieldAlert, Lock } from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

export function EntitySocialTab({ websiteId }: { websiteId: string }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("web.entity_create");
  const canEdit = can("web.entity_edit");
  const canDelete = can("web.entity_delete");
  const canOpenLink = can("web.entity_open_link");
  const canViewAccount = can("web.entity_view_account");
  const canRevealPassword = can("web.entity_reveal_password");

  const list = s.entities.filter((e) => e.websiteId === websiteId);
  const [search, setSearch] = useState("");
  const [fPlatform, setFPlatform] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [editing, setEditing] = useState<EntitySocial | null>(null);
  const [adding, setAdding] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => list.filter((e) =>
    (fPlatform === "all" || e.platform === fPlatform) &&
    (fStatus === "all" || e.status === fStatus) &&
    (!search || [e.name, e.url, e.email, e.account].some((x) => (x || "").toLowerCase().includes(search.toLowerCase())))
  ), [list, search, fPlatform, fStatus]);

  return (
    <div className="space-y-3">
      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="p-3 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-[oklch(0.45_0.13_75)] shrink-0 mt-0.5" />
          <span>Bản base hiện đang lưu mật khẩu dạng mock/demo trên trình duyệt. Khi triển khai thực tế cần chuyển sang lưu mã hoá phía server.</span>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-xs" placeholder="Tìm theo tên / link / mail..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={fPlatform} onValueChange={setFPlatform}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Nền tảng" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nền tảng</SelectItem>
            {ENTITY_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {ENTITY_STATUSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        {canCreate && (
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild><Button className="ml-auto"><Plus className="h-4 w-4" />Thêm Entity</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Thêm Entity / Social SEO</DialogTitle></DialogHeader>
              <EntityForm websiteId={websiteId} onSubmit={(e) => { s.add("entities", e); setAdding(false); }} onClose={() => setAdding(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Tên</th>
                <th className="text-left font-medium px-4 py-2.5">Nền tảng</th>
                <th className="text-left font-medium px-4 py-2.5">Link</th>
                <th className="text-left font-medium px-4 py-2.5">Tài khoản</th>
                <th className="text-left font-medium px-4 py-2.5">Mật khẩu</th>
                <th className="text-left font-medium px-4 py-2.5">Email</th>
                <th className="text-left font-medium px-4 py-2.5">SĐT</th>
                <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Chưa có entity nào.</td></tr>}
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{e.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{e.platform}</td>
                  <td className="px-4 py-2.5">
                    {e.url ? (
                      canOpenLink ? (
                        <a href={e.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Mở <ExternalLink className="h-3 w-3" /></a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Không có quyền mở link Entity"><Lock className="h-3 w-3" />Có link</span>
                      )
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {canViewAccount ? (e.account || "—") : (e.account ? <span className="inline-flex items-center gap-1 text-xs"><Lock className="h-3 w-3" />Ẩn</span> : "—")}
                  </td>
                  <td className="px-4 py-2.5">
                    {!e.password ? <span className="text-muted-foreground text-xs">—</span> : canRevealPassword ? (
                      <button
                        type="button"
                        onClick={() => setRevealed((r) => ({ ...r, [e.id]: !r[e.id] }))}
                        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-mono text-xs"
                      >
                        <span>{revealed[e.id] ? e.password : "••••••••"}</span>
                        {revealed[e.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Không có quyền xem mật khẩu Entity"><Lock className="h-3 w-3" />Ẩn</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{canViewAccount ? (e.email || "—") : (e.email ? "•••" : "—")}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{canViewAccount ? (e.phone || "—") : (e.phone ? "•••" : "—")}</td>
                  <td className="px-4 py-2.5"><StatusBadge value={e.status} /></td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditing(e)}><Pencil className="h-4 w-4" /></Button>}
                    {canDelete && (
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Xóa "${e.name}"?`)) s.remove("entities", e.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    {!canEdit && !canDelete && <span className="text-xs text-muted-foreground italic">Chỉ xem</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa Entity</DialogTitle></DialogHeader>
          {editing && (
            <EntityForm
              websiteId={websiteId}
              initial={editing}
              canRevealPassword={canRevealPassword}
              onSubmit={(e) => {
                if (!canEdit) { toast.error("Bạn không có quyền sửa Entity"); return; }
                s.update("entities", editing.id, e); setEditing(null);
              }}
              onClose={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EntityForm({
  websiteId, initial, onSubmit, onClose, canRevealPassword = true,
}: {
  websiteId: string;
  initial?: Partial<EntitySocial>;
  onSubmit: (e: EntitySocial) => void;
  onClose: () => void;
  canRevealPassword?: boolean;
}) {
  const [v, setV] = useState<EntitySocial>({
    id: initial?.id || uid(),
    websiteId,
    name: initial?.name || "",
    platform: initial?.platform || "Facebook",
    url: initial?.url || "",
    account: initial?.account || "",
    password: initial?.password || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    status: initial?.status || "Đang dùng",
    notes: initial?.notes || "",
  });
  const set = (k: keyof EntitySocial, val: any) => setV({ ...v, [k]: val });

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Tên social/entity *"><Input value={v.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Nền tảng *">
          <Select value={v.platform} onValueChange={(x) => set("platform", x)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ENTITY_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Link" className="sm:col-span-2"><Input value={v.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." /></Field>
        <Field label="Tài khoản"><Input value={v.account} onChange={(e) => set("account", e.target.value)} /></Field>
        <Field label="Mật khẩu">
          <PasswordInput allowReveal={canRevealPassword} value={v.password} onChange={(e) => set("password", e.target.value)} />
        </Field>
        <Field label="Email"><Input value={v.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="SĐT"><Input value={v.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Trạng thái" className="sm:col-span-2">
          <Select value={v.status} onValueChange={(x) => set("status", x)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ENTITY_STATUSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Ghi chú" className="sm:col-span-2"><Textarea value={v.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button onClick={() => { if (!v.name.trim()) return; onSubmit(v); }}>Lưu</Button>
      </DialogFooter>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className || ""}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
