import { createFileRoute } from "@tanstack/react-router";
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
import { useState } from "react";
import { toast } from "sonner";
import { AccountsSettings } from "@/components/AccountsSettings";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Cài Đặt — Base Marketing" }] }),
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
  const [tab, setTab] = useState("accounts");
  const setPlans = (next: string[]) => s.setCatalog("plans", next);
  const setTopics = (next: string[]) => s.setCatalog("topics", next);

  return <>
    <PageHeader title="Cài Đặt" description="Tài khoản, phân quyền, hồ sơ nhân sự và danh mục dùng chung." />
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="accounts">Tài khoản & Phân quyền</TabsTrigger>
        <TabsTrigger value="people">Nhân sự</TabsTrigger>
        <TabsTrigger value="plans">Plan</TabsTrigger>
        <TabsTrigger value="topics">Topic</TabsTrigger>
        <TabsTrigger value="info">Thông tin hệ thống</TabsTrigger>
      </TabsList>

      <TabsContent value="accounts" className="mt-4">
        <AccountsSettings />
      </TabsContent>

      <TabsContent value="people" className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">
            Mỗi tài khoản đã duyệt là một nhân sự. Tạo mới hoặc duyệt tài khoản tại tab <strong>Tài khoản & Phân quyền</strong>.
          </p>
          <Button variant="outline" onClick={() => setTab("accounts")}>
            <UserPlus className="h-4 w-4 mr-1.5" />Tạo tài khoản mới
          </Button>
        </div>
        <Card><CardContent className="p-0 overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
            <th className="text-left font-medium px-4 py-2.5">Họ tên</th>
            <th className="text-left font-medium px-4 py-2.5">Vị trí</th>
            <th className="text-left font-medium px-4 py-2.5">Email</th>
            <th className="text-left font-medium px-4 py-2.5">SĐT</th>
            <th className="text-left font-medium px-4 py-2.5">Role</th>
            <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
            <th className="text-right font-medium px-4 py-2.5"></th>
          </tr></thead><tbody className="divide-y">
            {auth.users.map((u) => {
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
            {auth.users.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">Chưa có tài khoản nào.</td></tr>}
          </tbody></table></CardContent></Card>
      </TabsContent>

      <TabsContent value="plans" className="mt-4"><Card><CardContent className="p-5">
        <ListEditor items={s.plans} onAdd={(v) => setPlans([...s.plans, v])} onRemove={(v) => setPlans(s.plans.filter((x) => x !== v))} />
      </CardContent></Card></TabsContent>

      <TabsContent value="topics" className="mt-4"><Card><CardContent className="p-5">
        <ListEditor items={s.topics} onAdd={(v) => setTopics([...s.topics, v])} onRemove={(v) => setTopics(s.topics.filter((x) => x !== v))} />
      </CardContent></Card></TabsContent>

      <TabsContent value="info" className="mt-4 space-y-4">
        <Card><CardContent className="p-5 text-sm text-muted-foreground space-y-2">
          <p>Dữ liệu được lưu trên Lovable Cloud — chia sẻ giữa tất cả người dùng và thiết bị.</p>
          <p>Tài khoản đang hoạt động sẽ tự động xuất hiện trong các dropdown chọn người phụ trách trong toàn app.</p>
        </CardContent></Card>
      </TabsContent>
    </Tabs>

    {editing && <PersonEditDialog edit={editing} onClose={() => setEditing(null)} />}
  </>;
}
