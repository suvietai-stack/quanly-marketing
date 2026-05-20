import { createFileRoute } from "@tanstack/react-router";
import {
  useStore, fmtDate, isOverdue, uid, todayISO,
  type Task, type TaskStatus, type TaskPriority, type TaskHistoryEntry,
} from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus, Pencil, Trash2, LayoutGrid, Table as TableIcon, Eye,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Task To-do List — Base Marketing" }] }),
  component: () => (
    <RequirePermission perm="task.view">
      <TasksPage />
    </RequirePermission>
  ),
});

const PRIORITIES: TaskPriority[] = ["Thấp", "Trung bình", "Cao", "Gấp"];
const STATUSES: TaskStatus[] = [
  "Mới tạo", "Đã giao", "Đang làm", "Chờ xác nhận", "Cần sửa", "Hoàn thành", "Đã hủy",
];

// ============ Helpers ============

function appendHistory(t: Task, entry: TaskHistoryEntry): Task {
  return { ...t, history: [...(t.history ?? []), entry] };
}

function denyToast() {
  toast.error("Bạn không có quyền thực hiện hành động này.");
}

// ============ Form ============

function TaskForm({ initial, onSubmit, onClose, mode }: {
  initial?: Partial<Task>;
  onSubmit: (t: Task) => void;
  onClose: () => void;
  mode: "create" | "edit";
}) {
  const { brands, people, plans, topics } = useStore();
  const { can } = useCurrentUser();
  const canEditAssignee = mode === "create" ? can("task.create") : can("task.edit_assignee") || can("task.edit");
  const canEditDeadline = mode === "create" ? can("task.create") : can("task.edit_deadline") || can("task.edit");
  const canEditPriority = mode === "create" ? can("task.create") : can("task.edit_priority") || can("task.edit");
  const canEditCore = mode === "create" ? can("task.create") : can("task.edit");

  const [t, setT] = useState<Task>({
    id: initial?.id || uid(),
    title: initial?.title || "",
    description: initial?.description || "",
    brandId: initial?.brandId,
    module: initial?.module,
    relatedLink: initial?.relatedLink,
    assignee: initial?.assignee,
    reporter: initial?.reporter,
    approver: initial?.approver,
    relatedPeople: initial?.relatedPeople ?? [],
    deadline: initial?.deadline,
    priority: initial?.priority || "Trung bình",
    status: initial?.status || "Mới tạo",
    notes: initial?.notes,
    link: initial?.link,
    plan: initial?.plan,
    topic: initial?.topic,
    inputLink: initial?.inputLink,
    resultLink: initial?.resultLink,
    handoverLink: initial?.handoverLink,
    processNote: initial?.processNote,
    revisionNote: initial?.revisionNote,
    revisions: initial?.revisions ?? 0,
    createdAt: initial?.createdAt ?? todayISO(),
    acceptedAt: initial?.acceptedAt,
    submittedAt: initial?.submittedAt,
    completedAt: initial?.completedAt,
    cancelledAt: initial?.cancelledAt,
    history: initial?.history ?? [],
  });
  const set = (p: Partial<Task>) => setT({ ...t, ...p });

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 max-h-[70vh] overflow-y-auto pr-1">
        <div className="sm:col-span-2">
          <Label>Tên task *</Label>
          <Input
            value={t.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="VD: Sửa banner trang chủ"
            disabled={!canEditCore}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Mô tả / Yêu cầu công việc</Label>
          <Textarea
            value={t.description || ""}
            onChange={(e) => set({ description: e.target.value })}
            rows={3}
            disabled={!canEditCore}
          />
        </div>
        <div>
          <Label>Thương hiệu</Label>
          <Select value={t.brandId || "_"} onValueChange={(v) => set({ brandId: v === "_" ? undefined : v })} disabled={!canEditCore}>
            <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">— Không —</SelectItem>
              {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Module liên quan</Label>
          <Select value={t.module || "_"} onValueChange={(v) => set({ module: v === "_" ? undefined : v })} disabled={!canEditCore}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">— Không —</SelectItem>
              {["Dự án Web", "Social", "Local", "Video", "Thiết kế", "Khác"].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Deadline</Label>
          <Input type="date" value={t.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} disabled={!canEditDeadline} />
        </div>
        <div>
          <Label>Mức ưu tiên</Label>
          <Select value={t.priority} onValueChange={(v) => set({ priority: v as TaskPriority })} disabled={!canEditPriority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Người phụ trách</Label>
          <Select value={t.assignee || "_"} onValueChange={(v) => set({ assignee: v === "_" ? undefined : v })} disabled={!canEditAssignee}>
            <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">— Không —</SelectItem>
              {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Người giao việc</Label>
          <Select value={t.reporter || "_"} onValueChange={(v) => set({ reporter: v === "_" ? undefined : v })} disabled={!canEditCore}>
            <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">— Không —</SelectItem>
              {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Người xác nhận / duyệt</Label>
          <Select value={t.approver || "_"} onValueChange={(v) => set({ approver: v === "_" ? undefined : v })} disabled={!canEditCore}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">— Không —</SelectItem>
              {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Plan liên quan</Label>
          <Select value={t.plan || "_"} onValueChange={(v) => set({ plan: v === "_" ? undefined : v })} disabled={!canEditCore}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">—</SelectItem>
              {plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Topic</Label>
          <Select value={t.topic || "_"} onValueChange={(v) => set({ topic: v === "_" ? undefined : v })} disabled={!canEditCore}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_">—</SelectItem>
              {topics.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Link tài liệu đầu vào</Label>
          <Input value={t.inputLink || ""} onChange={(e) => set({ inputLink: e.target.value })} placeholder="https://..." disabled={!canEditCore} />
        </div>
        <div className="sm:col-span-2">
          <Label>Link kết quả</Label>
          <Input value={t.resultLink || ""} onChange={(e) => set({ resultLink: e.target.value })} placeholder="https://..." disabled={!canEditCore} />
        </div>
        <div className="sm:col-span-2">
          <Label>Link bàn giao</Label>
          <Input value={t.handoverLink || ""} onChange={(e) => set({ handoverLink: e.target.value })} placeholder="https://..." disabled={!canEditCore} />
        </div>
        <div className="sm:col-span-2">
          <Label>Ghi chú</Label>
          <Textarea value={t.notes || ""} onChange={(e) => set({ notes: e.target.value })} rows={2} disabled={!canEditCore} />
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Huỷ</Button>
        <Button
          onClick={() => {
            if (!canEditCore) { denyToast(); return; }
            if (t.title.trim()) { onSubmit(t); onClose(); }
          }}
        >Lưu</Button>
      </DialogFooter>
    </>
  );
}

// ============ Detail with workflow + history ============

function WorkflowButtons({ task, onChange, onClose }: {
  task: Task; onChange: (t: Task) => void; onClose?: () => void;
}) {
  const { user, can, isSuperAdmin } = useCurrentUser();
  const meName = user?.fullName || user?.username || "";
  const [revOpen, setRevOpen] = useState(false);
  const [revNote, setRevNote] = useState("");

  const transition = (
    permKey: string,
    toStatus: TaskStatus,
    action: string,
    extra: Partial<Task> = {},
    note?: string,
    forced?: boolean,
  ) => {
    if (!isSuperAdmin && !can(permKey)) { denyToast(); return; }
    const entry: TaskHistoryEntry = {
      at: new Date().toISOString(),
      byId: user?.id,
      byName: meName,
      action,
      fromStatus: task.status,
      toStatus,
      note,
      forced,
    };
    const next = appendHistory({ ...task, status: toStatus, ...extra }, entry);
    onChange(next);
  };

  const s = task.status;
  const canForce = isSuperAdmin || can("task.force_status") || can("task.force_change_status");

  const buttons: React.ReactNode[] = [];

  if (s === "Mới tạo") {
    buttons.push(
      <Button key="assign" size="sm" onClick={() => {
        if (!task.assignee) { toast.error("Cần chọn người phụ trách trước khi giao."); return; }
        transition("task.assign", "Đã giao", "Giao task");
      }}>Giao task</Button>,
      <Button key="cancel" size="sm" variant="outline" onClick={() =>
        transition("task.cancel", "Đã hủy", "Hủy task", { cancelledAt: todayISO() })
      }>Hủy</Button>,
    );
  }
  if (s === "Đã giao") {
    buttons.push(
      <Button key="start" size="sm" onClick={() =>
        transition("task.start", "Đang làm", "Bắt đầu làm", { acceptedAt: todayISO() })
      }>Bắt đầu làm</Button>,
      <Button key="cancel" size="sm" variant="outline" onClick={() =>
        transition("task.cancel", "Đã hủy", "Hủy task", { cancelledAt: todayISO() })
      }>Hủy</Button>,
    );
  }
  if (s === "Đang làm") {
    buttons.push(
      <Button key="submit" size="sm" onClick={() =>
        transition("task.submit_completion", "Chờ xác nhận", "Gửi hoàn thành", { submittedAt: todayISO() })
      }>Gửi hoàn thành</Button>,
    );
  }
  if (s === "Chờ xác nhận") {
    buttons.push(
      <Button key="approve" size="sm" onClick={() =>
        transition("task.approve_completion", "Hoàn thành", "Xác nhận hoàn thành", { completedAt: todayISO() })
      }>Xác nhận hoàn thành</Button>,
      <Button key="reject" size="sm" variant="outline" onClick={() => {
        if (!isSuperAdmin && !can("task.request_revision")) { denyToast(); return; }
        setRevOpen(true);
      }}>Yêu cầu sửa</Button>,
    );
  }
  if (s === "Cần sửa") {
    buttons.push(
      <Button key="resubmit" size="sm" onClick={() =>
        transition("task.resubmit_completion", "Chờ xác nhận", "Gửi lại hoàn thành", { submittedAt: todayISO() })
      }>Gửi lại hoàn thành</Button>,
    );
  }
  if (s === "Hoàn thành") {
    if (can("task.reopen_completed") || isSuperAdmin) {
      buttons.push(
        <Button key="reopen" size="sm" variant="outline" onClick={() =>
          transition("task.reopen_completed", "Đang làm", "Mở lại task hoàn thành", { completedAt: undefined })
        }>Mở lại task</Button>,
      );
    }
  }
  if (s === "Đã hủy") {
    if (can("task.restore") || isSuperAdmin) {
      buttons.push(
        <Button key="restore" size="sm" variant="outline" onClick={() =>
          transition("task.restore", "Mới tạo", "Khôi phục task", { cancelledAt: undefined })
        }>Khôi phục</Button>,
      );
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {buttons}
        {canForce && (
          <Select onValueChange={(v) =>
            transition("task.force_status", v as TaskStatus, `Ép trạng thái → ${v}`, {}, undefined, true)
          }>
            <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue placeholder="Ép chuyển trạng thái…" /></SelectTrigger>
            <SelectContent>
              {STATUSES.filter((x) => x !== s).map((st) => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {onClose && <Button size="sm" variant="ghost" onClick={onClose}>Đóng</Button>}
      </div>

      <Dialog open={revOpen} onOpenChange={setRevOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yêu cầu sửa task</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Ghi chú yêu cầu sửa *</Label>
            <Textarea value={revNote} onChange={(e) => setRevNote(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevOpen(false)}>Huỷ</Button>
            <Button
              onClick={() => {
                if (!revNote.trim()) { toast.error("Vui lòng nhập ghi chú sửa."); return; }
                transition("task.request_revision", "Cần sửa", "Yêu cầu sửa", {
                  revisionNote: revNote.trim(),
                  revisions: (task.revisions ?? 0) + 1,
                }, revNote.trim());
                setRevNote("");
                setRevOpen(false);
              }}
            >Gửi yêu cầu sửa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TaskDetailDialog({ task, open, onOpenChange }: {
  task: Task | null; open: boolean; onOpenChange: (o: boolean) => void;
}) {
  const { update } = useStore();
  const { can, isSuperAdmin } = useCurrentUser();
  const { brands } = useStore();
  if (!task) return null;
  const canHistory = isSuperAdmin || can("task.view_history");
  const brand = brands.find((b) => b.id === task.brandId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{task.title}</span>
            <StatusBadge value={task.status} />
            <StatusBadge value={task.priority} />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="docs">Tài liệu</TabsTrigger>
            {canHistory && <TabsTrigger value="history">Lịch sử xử lý</TabsTrigger>}
          </TabsList>

          <TabsContent value="info" className="space-y-3 text-sm">
            {task.description && (
              <div><div className="text-xs text-muted-foreground">Mô tả</div><div className="whitespace-pre-wrap">{task.description}</div></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Thương hiệu" value={brand?.name} />
              <Field label="Module" value={task.module} />
              <Field label="Người giao" value={task.reporter} />
              <Field label="Người phụ trách" value={task.assignee} />
              <Field label="Người xác nhận" value={task.approver} />
              <Field label="Deadline" value={fmtDate(task.deadline)} />
              <Field label="Plan" value={task.plan} />
              <Field label="Topic" value={task.topic} />
              <Field label="Số lần sửa" value={String(task.revisions ?? 0)} />
              <Field label="Ngày tạo" value={fmtDate(task.createdAt)} />
              <Field label="Nhận việc" value={fmtDate(task.acceptedAt)} />
              <Field label="Gửi hoàn thành" value={fmtDate(task.submittedAt)} />
              <Field label="Hoàn thành" value={fmtDate(task.completedAt)} />
            </div>
            {task.revisionNote && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2">
                <div className="text-xs font-medium text-destructive">Ghi chú yêu cầu sửa gần nhất</div>
                <div className="whitespace-pre-wrap text-sm mt-1">{task.revisionNote}</div>
              </div>
            )}
            <div className="pt-2 border-t">
              <WorkflowButtons task={task} onChange={(t) => update("tasks", t.id, t)} />
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-2 text-sm">
            <DocRow label="Tài liệu đầu vào" url={task.inputLink} />
            <DocRow label="Link kết quả" url={task.resultLink} />
            <DocRow label="File bàn giao" url={task.handoverLink} />
            <DocRow label="Link liên quan" url={task.link || task.relatedLink} />
          </TabsContent>

          {canHistory && (
            <TabsContent value="history">
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {(task.history ?? []).length === 0 && (
                  <div className="text-sm text-muted-foreground">Chưa có lịch sử.</div>
                )}
                {(task.history ?? []).slice().reverse().map((h, i) => (
                  <div key={i} className="rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{h.byName || "—"}</span>
                      <span className="text-muted-foreground">{h.action}</span>
                      {h.fromStatus && h.toStatus && (
                        <span className="text-xs text-muted-foreground">
                          {h.fromStatus} → {h.toStatus}
                        </span>
                      )}
                      {h.forced && <span className="text-xs text-destructive">(ép)</span>}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(h.at).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    {h.note && <div className="text-xs mt-1 whitespace-pre-wrap">{h.note}</div>}
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{value || "—"}</div>
    </div>
  );
}

function DocRow({ label, url }: { label: string; url?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-primary underline break-all">{url}</a>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </div>
  );
}

// ============ Page ============

function TasksPage() {
  const { tasks, brands, add, update, remove } = useStore();
  const { user, can, scopeList, isSuperAdmin } = useCurrentUser();
  const canCreate = can("task.create");
  const canEdit = can("task.edit");
  const canDelete = can("task.delete");
  const canViewAll = isSuperAdmin || can("task.view_all");

  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fScope, setFScope] = useState<"all" | "mine" | "assigned" | "overdue" | "done">(canViewAll ? "all" : "mine");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [editing, setEditing] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Task | null>(null);

  const ME = user?.fullName || user?.username || "";

  const isInvolved = (t: Task) =>
    !!ME && (t.assignee === ME || t.reporter === ME || t.approver === ME || (t.relatedPeople ?? []).includes(ME));
  const isCreatedByMe = (t: Task) => !!ME && (t.reporter === ME);

  const scopedTasks = useMemo(
    () => scopeList(tasks, "task.view_all", "task.view_mine", isInvolved),
    [tasks, scopeList, ME]
  );

  // Always-fresh view for "Đang xem":
  const currentDetail = detail ? tasks.find((t) => t.id === detail.id) ?? detail : null;

  const filtered = useMemo(() => {
    return scopedTasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (fBrand !== "all" && t.brandId !== fBrand) return false;
      if (fAssignee !== "all" && t.assignee !== fAssignee) return false;
      if (fStatus !== "all" && t.status !== fStatus) return false;
      if (fPriority !== "all" && t.priority !== fPriority) return false;
      if (fScope === "mine" && !isInvolved(t)) return false;
      if (fScope === "assigned" && !isCreatedByMe(t)) return false;
      if (fScope === "overdue" && !isOverdue(t.deadline, t.status)) return false;
      if (fScope === "done" && t.status !== "Hoàn thành") return false;
      return true;
    });
  }, [scopedTasks, search, fBrand, fAssignee, fStatus, fPriority, fScope, ME]);

  const assignees = useMemo(
    () => Array.from(new Set(scopedTasks.map((t) => t.assignee).filter(Boolean))) as string[],
    [scopedTasks]
  );

  // ---- guarded mutations ----
  const guardedAdd = (t: Task) => {
    if (!canCreate && !isSuperAdmin) { denyToast(); return; }
    const created: Task = appendHistory({ ...t, createdAt: t.createdAt ?? todayISO() }, {
      at: new Date().toISOString(),
      byId: user?.id, byName: ME,
      action: "Tạo task",
      toStatus: t.status,
    });
    add("tasks", created);
  };
  const guardedUpdate = (t: Task) => {
    if (!canEdit && !isSuperAdmin) { denyToast(); return; }
    update("tasks", t.id, t);
  };
  const guardedDelete = (id: string) => {
    if (!canDelete && !isSuperAdmin) { denyToast(); return; }
    remove("tasks", id);
  };

  const scopeButtons: { v: typeof fScope; l: string; show: boolean }[] = [
    { v: "all", l: "Tất cả task", show: canViewAll },
    { v: "mine", l: "Việc của tôi", show: true },
    { v: "assigned", l: "Việc tôi giao", show: true },
    { v: "overdue", l: "Quá hạn", show: true },
    { v: "done", l: "Hoàn thành", show: true },
  ];

  return (
    <>
      <PageHeader
        title="Task To-do List"
        description="Việc lẻ, việc nhanh, việc phát sinh hằng ngày — có workflow & phân quyền."
        actions={canCreate ? (
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1.5" />Thêm task</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader><DialogTitle>Tạo task mới</DialogTitle></DialogHeader>
              <TaskForm
                mode="create"
                initial={{ reporter: ME }}
                onSubmit={guardedAdd}
                onClose={() => setAdding(false)}
              />
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {scopeButtons.filter((s) => s.show).map((s) => (
          <Button
            key={s.v}
            variant={fScope === s.v ? "default" : "outline"}
            size="sm"
            onClick={() => setFScope(s.v)}
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
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
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
                    <th className="text-right font-medium px-4 py-2.5">Hành động</th>
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
                          <button className="text-left hover:underline" onClick={() => setDetail(t)}>
                            {t.title}
                          </button>
                          {(t.plan || t.topic || t.module) && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {t.module && <>Module: {t.module}</>}
                              {t.module && (t.plan || t.topic) && " · "}
                              {t.plan && <>Plan: {t.plan}</>}
                              {t.plan && t.topic && " · "}
                              {t.topic && <>Topic: {t.topic}</>}
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
                            <Button size="icon" variant="ghost" onClick={() => setDetail(t)} title="Xem">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {canEdit && (
                              <Button size="icon" variant="ghost" onClick={() => setEditing(t)} title="Sửa">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button size="icon" variant="ghost" onClick={() => guardedDelete(t.id)} title="Xóa">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
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
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {STATUSES.map((status) => {
            const items = filtered.filter((t) => t.status === status);
            return (
              <div key={status} className="rounded-xl bg-muted/40 p-3 min-h-[120px]">
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
                      onClick={() => setDetail(t)}
                      className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 transition-colors shadow-soft"
                    >
                      <div className="font-medium text-sm">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {brands.find((b) => b.id === t.brandId)?.name || "—"} · {t.assignee || "—"}
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

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Chỉnh sửa task</DialogTitle></DialogHeader>
          {editing && (
            <TaskForm
              mode="edit"
              initial={editing}
              onSubmit={guardedUpdate}
              onClose={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail + workflow */}
      <TaskDetailDialog
        task={currentDetail}
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
      />
    </>
  );
}
