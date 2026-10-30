import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Pencil, Plus, Target, Timer, UserPlus, X } from "lucide-react";
import { useAuth, useCurrentUser } from "@/lib/auth";
import { RolePermissionMatrix } from "@/components/leave/FunctionSettings";
import { BIZ_PERM_CATEGORIES } from "@/lib/biz/permCategories";
import {
  bizDeadlineQuery, bizDepartmentsQuery, bizKrMetricsQuery, bizMembersQuery,
  useBizDeadlineSave, useBizDeptSave, useBizKrSave, useBizMemberEnd, useBizMemberSave,
} from "@/lib/biz/queries";
import {
  AGGREGATION_LABELS, DEADLINE_KINDS, DIRECTION_LABELS, VALUE_KIND_LABELS,
  type BizDeadlineData, type BizDepartment, type BizKrMetric,
} from "@/lib/biz/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Trang Cài đặt trong module Quản trị Kinh doanh — mỗi tab kiểm tra quyền riêng, backend kiểm tra lại khi lưu. */
export function BizSettings() {
  const { can, isSuperAdmin } = useCurrentUser();
  const canDept = isSuperAdmin || can("biz.dept_manage");
  const canKr = isSuperAdmin || can("biz.kr_manage");
  const canDeadline = isSuperAdmin || can("biz.deadline_manage");
  const firstTab = canDept ? "dept" : canKr ? "kr" : canDeadline ? "deadline" : "perm";

  return (
    <Tabs defaultValue={firstTab}>
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="dept"><Building2 className="h-4 w-4 mr-1.5" />Phòng ban</TabsTrigger>
        <TabsTrigger value="kr"><Target className="h-4 w-4 mr-1.5" />Chỉ số KR</TabsTrigger>
        <TabsTrigger value="deadline"><Timer className="h-4 w-4 mr-1.5" />Deadline</TabsTrigger>
        <TabsTrigger value="perm">Phân quyền</TabsTrigger>
      </TabsList>
      <TabsContent value="dept" className="mt-4"><DeptTab canEdit={canDept} /></TabsContent>
      <TabsContent value="kr" className="mt-4"><KrTab canEdit={canKr} /></TabsContent>
      <TabsContent value="deadline" className="mt-4"><DeadlineTab canEdit={canDeadline} /></TabsContent>
      <TabsContent value="perm" className="mt-4">
        <RolePermissionMatrix categories={BIZ_PERM_CATEGORIES} personal={["biz.view_own"]} />
      </TabsContent>
    </Tabs>
  );
}

// ============ Phòng ban & thành viên ============
function DeptTab({ canEdit }: { canEdit: boolean }) {
  const { data: depts } = useQuery(bizDepartmentsQuery);
  const { data: members } = useQuery(bizMembersQuery);
  const users = useAuth((s) => s.users);
  const memberSave = useBizMemberSave();
  const memberEnd = useBizMemberEnd();
  const [editDept, setEditDept] = useState<BizDepartment | null | "new">(null);
  const [addMemberDept, setAddMemberDept] = useState<string | null>(null);
  const [memberUser, setMemberUser] = useState("");
  const [memberManager, setMemberManager] = useState(false);

  const nameOf = (id: string) => users.find((u) => u.id === id)?.fullName || "—";
  const activeMembers = (deptId: string) => (members ?? []).filter((m) => m.department_id === deptId && !m.effective_to);

  const addMember = async () => {
    if (!addMemberDept || !memberUser) return;
    try {
      await memberSave.mutateAsync({ _department_id: addMemberDept, _user_id: memberUser, _is_manager: memberManager });
      toast.success("Đã cập nhật thành viên phòng.");
      setAddMemberDept(null); setMemberUser(""); setMemberManager(false);
    } catch (e: any) {
      toast.error(e?.message || "Không lưu được thành viên.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Quản lý phòng kinh doanh và thành viên. Nhân viên chuyển phòng vẫn giữ lịch sử phòng cũ.</p>
        {canEdit && <Button size="sm" onClick={() => setEditDept("new")}><Plus className="h-4 w-4 mr-1" />Thêm phòng</Button>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(depts ?? []).map((d) => {
          const ms = activeMembers(d.id);
          return (
            <div key={d.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold flex items-center gap-2">{d.name}{!d.active && <Badge variant="secondary">Ngừng</Badge>}</div>
                  {d.description && <div className="text-xs text-muted-foreground mt-0.5">{d.description}</div>}
                </div>
                {canEdit && <Button variant="ghost" size="icon" aria-label={`Sửa ${d.name}`} onClick={() => setEditDept(d)}><Pencil className="h-4 w-4" /></Button>}
              </div>
              <div className="space-y-1.5">
                {ms.length === 0 && <div className="text-xs text-muted-foreground">Chưa có thành viên.</div>}
                {ms.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">{nameOf(m.user_id)}</span>
                    {m.is_manager && <Badge variant="outline" className="text-xs">Trưởng phòng</Badge>}
                    {canEdit && (
                      <button className="text-muted-foreground hover:text-destructive" aria-label={`Xóa ${nameOf(m.user_id)} khỏi phòng`}
                        onClick={async () => { try { await memberEnd.mutateAsync({ _id: m.id }); toast.success("Đã chuyển nhân viên ra khỏi phòng."); } catch (e: any) { toast.error(e?.message || "Không cập nhật được."); } }}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {canEdit && (
                addMemberDept === d.id ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
                    <Select value={memberUser} onValueChange={setMemberUser}>
                      <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
                      <SelectContent>
                        {users.filter((u) => u.status === "Đang hoạt động").map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <label className="flex items-center gap-1.5 text-sm"><Checkbox checked={memberManager} onCheckedChange={(v) => setMemberManager(v === true)} />Trưởng phòng</label>
                    <Button size="sm" disabled={!memberUser || memberSave.isPending} onClick={addMember}>Lưu</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddMemberDept(null)}>Hủy</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => { setAddMemberDept(d.id); setMemberUser(""); setMemberManager(false); }}>
                    <UserPlus className="h-4 w-4 mr-1" />Thêm thành viên
                  </Button>
                )
              )}
            </div>
          );
        })}
      </div>
      <DeptDialog dept={editDept} onClose={() => setEditDept(null)} />
    </div>
  );
}

function DeptDialog({ dept, onClose }: { dept: BizDepartment | null | "new"; onClose: () => void }) {
  const isNew = dept === "new";
  const d = isNew ? null : dept;
  const [name, setName] = useState(d?.name ?? "");
  const [desc, setDesc] = useState(d?.description ?? "");
  const [sort, setSort] = useState(String(d?.sort_order ?? 0));
  const [active, setActive] = useState(d?.active ?? true);
  const save = useBizDeptSave();
  if (dept === null) return null;

  const submit = async () => {
    try {
      await save.mutateAsync({ _id: d?.id ?? null, _name: name, _description: desc, _active: active, _sort_order: Number(sort) || 0 });
      toast.success(isNew ? "Đã thêm phòng ban." : "Đã cập nhật phòng ban.");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Không lưu được phòng ban.");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isNew ? "Thêm phòng ban" : "Sửa phòng ban"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Tên phòng</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Kinh doanh Sứ Quà Tặng" /></div>
          <div className="space-y-1.5"><Label>Mô tả</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Không bắt buộc" /></div>
          <div className="space-y-1.5"><Label>Thứ tự hiển thị</Label><Input type="number" value={sort} onChange={(e) => setSort(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={active} onCheckedChange={(v) => setActive(v === true)} />Đang hoạt động</label>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>Hủy</Button>
            <Button disabled={!name.trim() || save.isPending} onClick={submit}>Lưu</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Chỉ số KR ============
function KrTab({ canEdit }: { canEdit: boolean }) {
  const { data: depts } = useQuery(bizDepartmentsQuery);
  const { data: metrics } = useQuery(bizKrMetricsQuery);
  const [editKr, setEditKr] = useState<BizKrMetric | null | { new: string }>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Chỉ số KR theo từng phòng. Chỉ số không còn dùng chỉ được <b>ngừng áp dụng</b>, không xóa — dữ liệu lịch sử được bảo toàn.
      </p>
      {(depts ?? []).map((d) => {
        const ms = (metrics ?? []).filter((m) => m.department_id === d.id);
        return (
          <div key={d.id} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">{d.name}</div>
              {canEdit && d.active && <Button size="sm" variant="outline" onClick={() => setEditKr({ new: d.id })}><Plus className="h-4 w-4 mr-1" />Thêm KR</Button>}
            </div>
            {ms.length === 0 && <div className="text-xs text-muted-foreground">Chưa có chỉ số nào.</div>}
            <div className="divide-y">
              {ms.map((m) => (
                <div key={m.id} className="py-2 flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium flex items-center gap-2">{m.name}{!m.active && <Badge variant="secondary">Ngừng áp dụng</Badge>}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.unit} · {VALUE_KIND_LABELS[m.value_kind]} · {AGGREGATION_LABELS[m.aggregation]} · {DIRECTION_LABELS[m.direction]}
                      {m.description ? ` · ${m.description}` : ""}
                    </div>
                  </div>
                  {canEdit && <Button variant="ghost" size="icon" aria-label={`Sửa ${m.name}`} onClick={() => setEditKr(m)}><Pencil className="h-4 w-4" /></Button>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <KrDialog kr={editKr} onClose={() => setEditKr(null)} />
    </div>
  );
}

function KrDialog({ kr, onClose }: { kr: BizKrMetric | { new: string } | null; onClose: () => void }) {
  const isNew = kr !== null && "new" in kr;
  const m = isNew ? null : kr;
  const [name, setName] = useState(m?.name ?? "");
  const [desc, setDesc] = useState(m?.description ?? "");
  const [unit, setUnit] = useState(m?.unit ?? "");
  const [kind, setKind] = useState(m?.value_kind ?? "count");
  const [agg, setAgg] = useState(m?.aggregation ?? "sum");
  const [dir, setDir] = useState(m?.direction ?? "higher");
  const [sort, setSort] = useState(String(m?.sort_order ?? 0));
  const [active, setActive] = useState(m?.active ?? true);
  const save = useBizKrSave();
  if (kr === null) return null;

  const submit = async () => {
    try {
      await save.mutateAsync({
        _id: m?.id ?? null, _department_id: isNew ? kr.new : m!.department_id,
        _name: name, _description: desc, _unit: unit,
        _value_kind: kind, _aggregation: agg, _direction: dir, _sort_order: Number(sort) || 0, _active: active,
      });
      toast.success(isNew ? "Đã thêm chỉ số KR." : "Đã cập nhật chỉ số KR.");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Không lưu được chỉ số KR.");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "Thêm chỉ số KR" : "Sửa chỉ số KR"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Tên chỉ số</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Doanh số" /></div>
          <div className="space-y-1.5"><Label>Mô tả / định nghĩa nghiệp vụ</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Không bắt buộc" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Đơn vị</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="VNĐ, Đơn, Đại lý…" /></div>
            <div className="space-y-1.5"><Label>Thứ tự</Label><Input type="number" value={sort} onChange={(e) => setSort(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kiểu giá trị</Label>
              <Select value={kind} onValueChange={setKind}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                {Object.entries(VALUE_KIND_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent></Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cách tổng hợp</Label>
              <Select value={agg} onValueChange={setAgg}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                {Object.entries(AGGREGATION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent></Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Chiều đánh giá</Label>
            <Select value={dir} onValueChange={setDir}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              {Object.entries(DIRECTION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent></Select>
          </div>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={active} onCheckedChange={(v) => setActive(v === true)} />Đang áp dụng</label>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>Hủy</Button>
            <Button disabled={!name.trim() || !unit.trim() || save.isPending} onClick={submit}>Lưu</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Deadline ============
function DeadlineTab({ canEdit }: { canEdit: boolean }) {
  const { data } = useQuery(bizDeadlineQuery);
  const save = useBizDeadlineSave();
  const [form, setForm] = useState<BizDeadlineData | null>(null);
  const cur = form ?? data ?? {};

  const setDay = (key: string, v: string) => {
    const n = Number(v);
    setForm({ ...cur, [key]: v === "" ? {} : { day: n } });
  };

  const invalid = DEADLINE_KINDS.some(({ key }) => {
    const d = cur[key]?.day;
    return d !== undefined && (!Number.isInteger(d) || d < 1 || d > 31);
  });

  const submit = async () => {
    try {
      await save.mutateAsync({ _data: cur });
      toast.success("Đã lưu cấu hình deadline.");
      setForm(null);
    } catch (e: any) {
      toast.error(e?.message || "Không lưu được cấu hình.");
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <p className="text-sm text-muted-foreground">
        Hạn nộp là <b>ngày trong tháng đầu của kỳ</b> (giờ Việt Nam). Để trống nếu chưa áp dụng deadline cho loại đó.
      </p>
      <div className="rounded-xl border bg-card divide-y">
        {DEADLINE_KINDS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 text-sm font-medium">{label}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Ngày</span>
              <Input
                type="number" min={1} max={31} className="w-20 h-9" disabled={!canEdit}
                value={cur[key]?.day ?? ""} onChange={(e) => setDay(key, e.target.value)}
                aria-label={`Deadline ${label}`}
              />
            </div>
          </div>
        ))}
      </div>
      {canEdit && (
        <Button disabled={invalid || save.isPending || form === null} onClick={submit}>
          {invalid ? "Ngày phải từ 1 đến 31" : "Lưu cấu hình deadline"}
        </Button>
      )}
    </div>
  );
}
