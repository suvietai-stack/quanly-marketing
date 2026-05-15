import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
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
  component: SettingsPage,
});

function PersonForm({ initial, onSubmit, onClose }: { initial?: Partial<Person>; onSubmit: (p: Person) => void; onClose: () => void }) {
  const [p, setP] = useState<Person>({
    id: initial?.id || uid(), name: initial?.name || "", role: initial?.role,
    email: initial?.email, phone: initial?.phone, status: initial?.status || "Đang làm", notes: initial?.notes,
  });
  const set = (x: Partial<Person>) => setP({ ...p, ...x });
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><Label>Họ tên *</Label><Input value={p.name} onChange={(e) => set({ name: e.target.value })} /></div>
      <div><Label>Vai trò</Label><Input value={p.role || ""} onChange={(e) => set({ role: e.target.value })} /></div>
      <div><Label>Trạng thái</Label>
        <Select value={p.status} onValueChange={(v) => set({ status: v as Person["status"] })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["Đang làm","Tạm nghỉ"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Email</Label><Input value={p.email || ""} onChange={(e) => set({ email: e.target.value })} /></div>
      <div><Label>SĐT</Label><Input value={p.phone || ""} onChange={(e) => set({ phone: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (p.name.trim()) { onSubmit(p); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
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

function SettingsPage() {
  const s = useStore();
  const [editing, setEditing] = useState<Person | null>(null);
  const [adding, setAdding] = useState(false);
  const setPlans = (next: string[]) => s.setCatalog("plans", next);
  const setTopics = (next: string[]) => s.setCatalog("topics", next);

  return <>
    <PageHeader title="Cài Đặt" description="Quản lý danh mục dùng chung — nhân sự, plan, topic..." />
    <Tabs defaultValue="accounts">
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
        <div className="flex justify-end mb-3"><Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm nhân sự</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Thêm nhân sự</DialogTitle></DialogHeader>
            <PersonForm onSubmit={(p) => s.add("people", p)} onClose={() => setAdding(false)} /></DialogContent>
        </Dialog></div>
        <Card><CardContent className="p-0"><table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
            <th className="text-left font-medium px-4 py-2.5">Họ tên</th><th className="text-left font-medium px-4 py-2.5">Vai trò</th>
            <th className="text-left font-medium px-4 py-2.5">Email</th><th className="text-left font-medium px-4 py-2.5">SĐT</th>
            <th className="text-left font-medium px-4 py-2.5">Trạng thái</th><th className="text-right font-medium px-4 py-2.5"></th>
          </tr></thead><tbody className="divide-y">
            {s.people.map((p) => (<tr key={p.id} className="hover:bg-muted/30">
              <td className="px-4 py-2.5 font-medium">{p.name}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{p.role || "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{p.email || "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{p.phone || "—"}</td>
              <td className="px-4 py-2.5"><StatusBadge value={p.status} /></td>
              <td className="px-4 py-2.5 text-right">
                <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => s.remove("people", p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </td></tr>))}
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
          <p>Mọi thay đổi (thêm / sửa / xóa) được đồng bộ tức thời lên cơ sở dữ liệu.</p>
        </CardContent></Card>
      </TabsContent>
    </Tabs>

    <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
      <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Chỉnh sửa nhân sự</DialogTitle></DialogHeader>
        {editing && <PersonForm initial={editing} onSubmit={(p) => s.update("people", p.id, p)} onClose={() => setEditing(null)} />}</DialogContent>
    </Dialog>
  </>;
}
