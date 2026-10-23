import { createFileRoute } from "@tanstack/react-router";
import { OtSettings } from "@/components/orderTracking/OtSettings";
import { useStore } from "@/lib/store";
import { useAuth, useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ShieldCheck, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AccountsSettings } from "@/components/AccountsSettings";
import { ZaloSettingsTab } from "@/components/ZaloUi";
import { SignalCatalogSettings } from "@/components/signals/SignalCatalogSettings";
import { LeaveSettings } from "@/components/leave/LeaveSettings";
import { SystemInfoSettings } from "@/components/SystemInfoSettings";
import { FbLeadsSettings } from "@/components/FbLeadsSettings";
import { ContentNotifySettings, OrderNotifySettings } from "@/components/ContentNotifySettings";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Cài Đặt — Base Marketing Sứ Việt" },
    { name: "description", content: "Quản lý vai trò, danh mục và các kết nối của Base Marketing Sứ Việt." },
    { property: "og:title", content: "Cài Đặt — Base Marketing Sứ Việt" },
    { property: "og:description", content: "Quản lý vai trò, danh mục và các kết nối của Base Marketing Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <RequirePermission perm="settings.view">
      <SettingsPage />
    </RequirePermission>
  ),
});

interface PersonEdit {
  id: string;
  fullName: string;
  phone: string;
  position: string;
  notes: string;
  status: "Đang hoạt động" | "Tạm khóa" | "Lưu trữ" | "Chờ duyệt" | "Từ chối";
}

function ListEditor({ items, onAdd, onRemove }: { items: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void }) {
  const [val, setVal] = useState("");
  return <>
    <div className="flex gap-2 mb-3"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Thêm mới..." />
      <Button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); }}}><Plus className="h-4 w-4" /></Button></div>
    <div className="flex flex-wrap gap-2">{items.map((i) => (
      <span key={i} className="inline-flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
        {i}<button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
      </span>))}{items.length === 0 && <span className="text-sm text-muted-foreground">Trống.</span>}</div>
  </>;
}

const STATUS_COLOR: Record<string, string> = {
  "Đang hoạt động": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "Chờ duyệt": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "Tạm khóa": "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  "Từ chối": "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  "Lưu trữ": "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

function isOnline(lastSeenAt?: string) {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}

function timeAgo(iso?: string) {
  if (!iso) return "chưa đăng nhập";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}

function PresenceCell({ lastSeenAt }: { lastSeenAt?: string }) {
  const online = isOnline(lastSeenAt);
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-zinc-400"}`}
          aria-hidden
        />
        <span className={`text-xs font-medium ${online ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
          {online ? "Online" : "Offline"}
        </span>
      </div>
      {!online && (
        <span className="text-[11px] text-muted-foreground">
          Hoạt động lần cuối: {timeAgo(lastSeenAt)}
        </span>
      )}
    </div>
  );
}

function PersonEditDialog({ edit, onClose }: { edit: PersonEdit; onClose: () => void }) {
  const auth = useAuth();
  const user = auth.users.find((u) => u.id === edit.id);
  const [form, setForm] = useState(edit);
  const isSystem = !!user?.system;
  const save = async () => {
    await auth.updateUser(edit.id, {
      fullName: form.fullName,
      phone: form.phone || undefined,
      desiredPosition: form.position || undefined,
      notes: form.notes || undefined,
    });
    if (!isSystem && form.status !== edit.status) {
      await auth.setStatus(edit.id, form.status);
    }
    toast.success("Đã lưu hồ sơ nhân sự");
    onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Hồ sơ nhân sự — {edit.fullName}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Họ tên</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><Label>SĐT</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Vị trí / bộ phận</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <Label>Trạng thái làm việc</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PersonEdit["status"] })} disabled={isSystem}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Đang hoạt động","Tạm khóa","Lưu trữ"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {isSystem && <p className="text-xs text-muted-foreground mt-1">Tài khoản hệ thống không thể đổi trạng thái.</p>}
          </div>
          <div className="sm:col-span-2"><Label>Ghi chú</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={save}>Lưu</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsPage() {
  const s = useStore();
  const auth = useAuth();
  const [editing, setEditing] = useState<PersonEdit | null>(null);
  const { can } = useCurrentUser();
  const showAccounts = can("settings.user_view") || can("settings.role") || can("settings.permission");
  const showPeople = can("settings.people");
  const showCatalog = can("settings.catalog") || can("settings.plan_topic");
  const showInfo = can("settings.system_view") || can("system.branding");
  const showSigCat = can("signal.catalog") || can("signal.manage");
  const showLeave = can("leave.settings");
  const canPresence = can("settings.view_presence");
  const initialTab = showAccounts ? "accounts" : showPeople ? "people" : showCatalog ? "plans" : "info";
  const me = auth.users.find((u) => u.id === auth.currentUserId);
  const zaloAdmin = !!me && (me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin");
  const showFbl = can("integration.facebook_leads");
  const [tab, setTab] = useState(() => {
    if (typeof window === "undefined") return initialTab;
    const q = new URLSearchParams(window.location.search);
    return q.get("zalo") ? "zalo" : q.get("tab") || initialTab;
  });
  const [presenceFilter, setPresenceFilter] = useState<"all" | "online" | "offline">("all");
  const setPlans = (next: string[]) => s.setCatalog("plans", next);
  const setTopics = (next: string[]) => s.setCatalog("topics", next);

  // Tick every 30s so "x phút trước" stays fresh without a full reload.
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(iv);
  }, []);

  const filteredUsers = auth.users.filter((u) => {
    if (!canPresence || presenceFilter === "all") return true;
    const online = isOnline(u.lastSeenAt);
    return presenceFilter === "online" ? online : !online;
  });
  const colSpan = canPresence ? 8 : 7;

  return <>
    <PageHeader title="Cài Đặt" description="Tài khoản, phân quyền, hồ sơ nhân sự và danh mục dùng chung." />
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="flex-wrap h-auto">
        {showAccounts && <TabsTrigger value="accounts">Tài khoản & Phân quyền</TabsTrigger>}
        {showPeople && <TabsTrigger value="people">Nhân sự</TabsTrigger>}
        {showCatalog && <TabsTrigger value="plans">Plan</TabsTrigger>}
        {showCatalog && <TabsTrigger value="topics">Topic</TabsTrigger>}
        {showInfo && <TabsTrigger value="info">Thông tin hệ thống</TabsTrigger>}
        {showSigCat && <TabsTrigger value="sigcat">Danh mục tín hiệu</TabsTrigger>}
        {showLeave && <TabsTrigger value="leave">Đơn từ & Phê duyệt</TabsTrigger>}
        {can("ot.settings") && <TabsTrigger value="ot">Theo dõi đơn hàng</TabsTrigger>}
        <TabsTrigger value="zalo">Thông báo Zalo</TabsTrigger>
        {showFbl && <TabsTrigger value="fbleads">Tích hợp Marketing · Facebook Lead Ads</TabsTrigger>}
      </TabsList>
      {showFbl && <TabsContent value="fbleads" className="mt-4"><FbLeadsSettings /></TabsContent>}
      {showSigCat && <TabsContent value="sigcat" className="mt-4"><SignalCatalogSettings /></TabsContent>}
      {showLeave && <TabsContent value="leave" className="mt-4"><LeaveSettings /></TabsContent>}
      {can("ot.settings") && <TabsContent value="ot" className="mt-4"><OtSettings /></TabsContent>}
      <TabsContent value="zalo" className="mt-4 space-y-4"><ZaloSettingsTab isAdmin={zaloAdmin} /><ContentNotifySettings canEdit={zaloAdmin || can("settings.system_edit")} /><OrderNotifySettings canEdit={zaloAdmin || can("settings.system_edit")} /></TabsContent>

      {showAccounts && <TabsContent value="accounts" className="mt-4">
        <AccountsSettings />
      </TabsContent>}

      <TabsContent value="people" className="mt-4">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Mỗi tài khoản đã duyệt là một nhân sự. Tạo mới hoặc duyệt tài khoản tại tab <strong>Tài khoản & Phân quyền</strong>.
          </p>
          <div className="flex items-center gap-2">
            {canPresence && (
              <Select value={presenceFilter} onValueChange={(v) => setPresenceFilter(v as typeof presenceFilter)}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="online">Đang online</SelectItem>
                  <SelectItem value="offline">Đang offline</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={() => setTab("accounts")}>
              <UserPlus className="h-4 w-4 mr-1.5" />Tạo tài khoản mới
            </Button>
          </div>
        </div>
        <Card><CardContent className="p-0 overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
            <th className="text-left font-medium px-4 py-2.5">Họ tên</th>
            <th className="text-left font-medium px-4 py-2.5">Vị trí</th>
            <th className="text-left font-medium px-4 py-2.5">Email</th>
            <th className="text-left font-medium px-4 py-2.5">SĐT</th>
            <th className="text-left font-medium px-4 py-2.5">Role</th>
            <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
            {canPresence && <th className="text-left font-medium px-4 py-2.5">Hoạt động</th>}
            <th className="text-right font-medium px-4 py-2.5"></th>
          </tr></thead><tbody className="divide-y">
            {filteredUsers.map((u) => {
              const role = auth.roles.find((r) => r.id === u.roleId);
              return (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">
                    <div className="flex items-center gap-2">
                      {u.fullName || u.username}
                      {u.system && <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" />Tài khoản hệ thống</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.desiredPosition || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.email || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.phone || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{role?.name || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[u.status] || ""}`}>{u.status}</span>
                  </td>
                  {canPresence && (
                    <td className="px-4 py-2.5">
                      <PresenceCell lastSeenAt={u.lastSeenAt} />
                    </td>
                  )}
                  <td className="px-4 py-2.5 text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing({
                      id: u.id, fullName: u.fullName, phone: u.phone || "",
                      position: u.desiredPosition || "", notes: u.notes || "",
                      status: u.status,
                    })}><Pencil className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-muted-foreground text-sm">Không có nhân sự phù hợp.</td></tr>}
          </tbody></table></CardContent></Card>
      </TabsContent>


      <TabsContent value="plans" className="mt-4"><Card><CardContent className="p-5">
        <ListEditor items={s.plans} onAdd={(v) => setPlans([...s.plans, v])} onRemove={(v) => setPlans(s.plans.filter((x) => x !== v))} />
      </CardContent></Card></TabsContent>

      <TabsContent value="topics" className="mt-4"><Card><CardContent className="p-5">
        <ListEditor items={s.topics} onAdd={(v) => setTopics([...s.topics, v])} onRemove={(v) => setTopics(s.topics.filter((x) => x !== v))} />
      </CardContent></Card></TabsContent>

      <TabsContent value="info" className="mt-4 space-y-4">
        <SystemInfoSettings />
        <Card><CardContent className="p-5 text-sm text-muted-foreground space-y-2">
          <p>Dữ liệu được lưu trên Lovable Cloud — chia sẻ giữa tất cả người dùng và thiết bị.</p>
          <p>Tài khoản đang hoạt động sẽ tự động xuất hiện trong các dropdown chọn người phụ trách trong toàn app.</p>
        </CardContent></Card>
      </TabsContent>
    </Tabs>

    {editing && <PersonEditDialog edit={editing} onClose={() => setEditing(null)} />}
  </>;
}
