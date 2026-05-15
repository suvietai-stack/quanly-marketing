import { createFileRoute } from "@tanstack/react-router";
import { useStore, fmtDate, isOverdue, uid, type Task, type TaskStatus, type TaskPriority } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, EmptyState } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, LayoutGrid, Table as TableIcon } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Task To-do List — Base Marketing" }] }),
  component: TasksPage,
});

const PRIORITIES: TaskPriority[] = ["Thấp", "Trung bình", "Cao", "Gấp"];
const STATUSES: TaskStatus[] = ["Chưa làm", "Đang làm", "Hoàn thành"];

function TaskForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Task>; onSubmit: (t: Task) => void; onClose: () => void;
}) {
  const { brands, people, plans, topics } = useStore();
  const [t, setT] = useState<Task>({
    id: initial?.id || uid(),
    title: initial?.title || "",
    brandId: initial?.brandId,
    assignee: initial?.assignee,
    reporter: initial?.reporter,
    deadline: initial?.deadline,
    priority: initial?.priority || "Trung bình",
    status: initial?.status || "Chưa làm",
    notes: initial?.notes,
    link: initial?.link,
    plan: initial?.plan,
    topic: initial?.topic,
    completedAt: initial?.completedAt,
  });
  const set = (p: Partial<Task>) => setT({ ...t, ...p });
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Tên task *</Label>
          <Input value={t.title} onChange={(e) => set({ title: e.target.value })} placeholder="VD: Sửa banner trang chủ" />
        </div>
        <div>
          <Label>Thương hiệu</Label>
          <Select value={t.brandId || "_"} onValueChange={(v) => set({ brandId: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">— Không —</SelectItem>
              {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Deadline</Label>
          <Input type="date" value={t.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} />
        </div>
        <div>
          <Label>Người phụ trách</Label>
          <Select value={t.assignee || "_"} onValueChange={(v) => set({ assignee: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">— Không —</SelectItem>
              {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Người giao việc</Label>
          <Select value={t.reporter || "_"} onValueChange={(v) => set({ reporter: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">— Không —</SelectItem>
              {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Mức ưu tiên</Label>
          <Select value={t.priority} onValueChange={(v) => set({ priority: v as TaskPriority })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Trạng thái</Label>
          <Select value={t.status} onValueChange={(v) => set({ status: v as TaskStatus, completedAt: v === "Hoàn thành" ? new Date().toISOString().slice(0,10) : undefined })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Plan liên quan</Label>
          <Select value={t.plan || "_"} onValueChange={(v) => set({ plan: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">—</SelectItem>
              {plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Topic</Label>
          <Select value={t.topic || "_"} onValueChange={(v) => set({ topic: v === "_" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">—</SelectItem>
              {topics.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Link liên quan</Label>
          <Input value={t.link || ""} onChange={(e) => set({ link: e.target.value })} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <Label>Ghi chú</Label>
          <Textarea value={t.notes || ""} onChange={(e) => set({ notes: e.target.value })} rows={3} />
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Huỷ</Button>
        <Button onClick={() => { if (t.title.trim()) { onSubmit(t); onClose(); } }}>Lưu</Button>
      </DialogFooter>
    </>
  );
}

function TasksPage() {
  const { tasks, brands, add, update, remove } = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("task.create");
  const canEdit = can("task.edit");
  const canDelete = can("task.delete");
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fScope, setFScope] = useState<"all" | "mine" | "assigned" | "overdue" | "done">("all");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [editing, setEditing] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);

  const ME = "Nguyễn Văn A";

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (fBrand !== "all" && t.brandId !== fBrand) return false;
      if (fAssignee !== "all" && t.assignee !== fAssignee) return false;
      if (fStatus !== "all" && t.status !== fStatus) return false;
      if (fPriority !== "all" && t.priority !== fPriority) return false;
      if (fScope === "mine" && t.assignee !== ME) return false;
      if (fScope === "assigned" && t.reporter !== ME) return false;
      if (fScope === "overdue" && !isOverdue(t.deadline, t.status)) return false;
      if (fScope === "done" && t.status !== "Hoàn thành") return false;
      return true;
    });
  }, [tasks, search, fBrand, fAssignee, fStatus, fPriority, fScope]);

  const assignees = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean))) as string[],
    [tasks]
  );

  return (
    <>
      <PageHeader
        title="Task To-do List"
        description="Việc lẻ, việc nhanh, việc phát sinh hằng ngày."
        actions={canCreate ? (
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1.5" />Thêm task</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Tạo task mới</DialogTitle></DialogHeader>
              <TaskForm onSubmit={(t) => add("tasks", t)} onClose={() => setAdding(false)} />
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          { v: "all", l: "Tất cả task" },
          { v: "mine", l: "Việc của tôi" },
          { v: "assigned", l: "Việc tôi giao" },
          { v: "overdue", l: "Quá hạn" },
          { v: "done", l: "Hoàn thành" },
        ].map((s) => (
          <Button
            key={s.v}
            variant={fScope === (s.v as any) ? "default" : "outline"}
            size="sm"
            onClick={() => setFScope(s.v as any)}
          >
            {s.l}
          </Button>
        ))}
        <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
          <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}>
            <TableIcon className="h-4 w-4 mr-1" />Table
          </Button>
          <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}>
            <LayoutGrid className="h-4 w-4 mr-1" />Kanban
          </Button>
        </div>
      </div>

      <FilterBar>
        <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={fBrand} onValueChange={setFBrand}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thương hiệu</SelectItem>
            {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fAssignee} onValueChange={setFAssignee}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Người phụ trách" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả người</SelectItem>
            {assignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fPriority} onValueChange={setFPriority}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Ưu tiên" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ưu tiên</SelectItem>
            {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      {view === "table" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Tên task</th>
                    <th className="text-left font-medium px-4 py-2.5">Thương hiệu</th>
                    <th className="text-left font-medium px-4 py-2.5">Phụ trách</th>
                    <th className="text-left font-medium px-4 py-2.5">Deadline</th>
                    <th className="text-left font-medium px-4 py-2.5">Ưu tiên</th>
                    <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                    <th className="text-right font-medium px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12">
                      <EmptyState
                        icon={<Plus className="h-5 w-5" />}
                        title={tasks.length === 0 ? "Chưa có task" : "Không có task phù hợp bộ lọc"}
                        hint={tasks.length === 0 ? "Tạo task đầu tiên để bắt đầu quản lý công việc." : undefined}
                        action={tasks.length === 0 && canCreate ? (
                          <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Tạo task đầu tiên</Button>
                        ) : undefined}
                      />
                    </td></tr>
                  )}
                  {filtered.map((t) => {
                    const brand = brands.find((b) => b.id === t.brandId);
                    const overdue = isOverdue(t.deadline, t.status);
                    return (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="px-4 py-2.5 font-medium">
                          {t.title}
                          {(t.plan || t.topic) && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {t.plan && <>Plan: {t.plan}</>}{t.plan && t.topic && " · "}{t.topic && <>Topic: {t.topic}</>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{brand?.name || "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{t.assignee || "—"}</td>
                        <td className={`px-4 py-2.5 whitespace-nowrap ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {fmtDate(t.deadline)}
                        </td>
                        <td className="px-4 py-2.5"><StatusBadge value={t.priority} /></td>
                        <td className="px-4 py-2.5"><StatusBadge value={t.status} /></td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setEditing(t)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => remove("tasks", t.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {STATUSES.map((status) => {
            const items = filtered.filter((t) => t.status === status);
            return (
              <div key={status} className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge value={status} />
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditing(t)}
                      className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 transition-colors shadow-soft"
                    >
                      <div className="font-medium text-sm">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {brands.find((b) => b.id === t.brandId)?.name || "—"}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge value={t.priority} />
                        <span className={`text-xs ${isOverdue(t.deadline, t.status) ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {fmtDate(t.deadline)}
                        </span>
                      </div>
                    </button>
                  ))}
                  {items.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-6">Trống</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa task</DialogTitle></DialogHeader>
          {editing && (
            <TaskForm
              initial={editing}
              onSubmit={(t) => update("tasks", t.id, t)}
              onClose={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
