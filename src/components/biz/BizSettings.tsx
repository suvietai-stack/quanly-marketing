import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Target, Timer } from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { RolePermissionMatrix } from "@/components/leave/FunctionSettings";
import { BizDeadlineEditor } from "./BizDeadlineEditor";
import { BizOrganization } from './BizOrganization';
import { BizWorkflows } from './BizWorkflows';
import { BizPositions } from './BizPositions';
import { BizRoleScopes } from './BizRoleScopes';
import { BIZ_PERM_CATEGORIES } from "@/lib/biz/permCategories";
import {
  bizDepartmentsQuery, bizKrMetricsQuery,
  useBizKrSave, useBizKrStandardSave,
} from "@/lib/biz/queries";
import {
  AGGREGATION_LABELS, DIRECTION_LABELS, VALUE_KIND_LABELS,
  type BizKrMetric,
} from "@/lib/biz/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Trang Cài đặt trong module Quản trị Kinh doanh — mỗi tab kiểm tra quyền riêng, backend kiểm tra lại khi lưu.
 *  Phòng/Nhóm/nhân sự/Trưởng Phòng quản lý thống nhất tại tab Cơ cấu tổ chức (không còn tab Phòng ban riêng). */
export function BizSettings() {
  const { can, isSuperAdmin } = useCurrentUser();
  const canOrg = isSuperAdmin || can('biz.org_manage');
  const canWorkflow = isSuperAdmin || can('biz.workflow_manage');
  const canKr = isSuperAdmin || can("biz.kr_manage");
  const canDeadline = isSuperAdmin || can("biz.deadline_manage");
  const canRole = isSuperAdmin || can("settings.role");
  const firstTab = canOrg ? 'org' : canWorkflow ? 'workflow' : canKr ? "kr" : canDeadline ? "deadline" : "perm";

  return (
    <Tabs defaultValue={firstTab}>
      <TabsList className="flex-wrap h-auto">
        {canOrg && <TabsTrigger value="org">Cơ cấu tổ chức</TabsTrigger>}
        {canOrg && <TabsTrigger value="positions">Chức vụ &amp; Cấp bậc</TabsTrigger>}
        {canWorkflow && <TabsTrigger value="workflow">Quy trình phê duyệt</TabsTrigger>}
        {canKr && <TabsTrigger value="kr"><Target className="h-4 w-4 mr-1.5" />Chỉ số KR</TabsTrigger>}
        {canDeadline && <TabsTrigger value="deadline"><Timer className="h-4 w-4 mr-1.5" />Deadline</TabsTrigger>}
        {canRole && <TabsTrigger value="perm">Phân quyền</TabsTrigger>}
      </TabsList>
      {canOrg && <TabsContent value="org" className="mt-4"><BizOrganization /></TabsContent>}
      {canOrg && <TabsContent value="positions" className="mt-4"><BizPositions /></TabsContent>}
      {canWorkflow && <TabsContent value="workflow" className="mt-4"><BizWorkflows /></TabsContent>}
      {canKr && <TabsContent value="kr" className="mt-4"><KrTab canEdit={canKr} /></TabsContent>}
      {canDeadline && <TabsContent value="deadline" className="mt-4"><BizDeadlineEditor /></TabsContent>}
      {canRole && <TabsContent value="perm" className="mt-4">
        <BizRoleScopes />
        <RolePermissionMatrix categories={BIZ_PERM_CATEGORIES} personal={["biz.view_own"]} />
      </TabsContent>}
    </Tabs>
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
        Chỉ số KR theo từng phòng. Gán <b>Mã gộp</b> giống nhau (vd. revenue, orders) cho các KR cùng định nghĩa để Dashboard Toàn Khối/Hệ cộng chung; KR khác đơn vị hoặc cách tổng hợp sẽ bị từ chối. Chỉ số không còn dùng chỉ được <b>ngừng áp dụng</b>, không xóa — dữ liệu lịch sử được bảo toàn.
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
                    <div className="font-medium flex items-center gap-2">{m.name}{!m.active && <Badge variant="secondary">Ngừng áp dụng</Badge>}{m.standard_code ? <Badge variant="outline" title="Dashboard Toàn Khối gộp các KR cùng mã chuẩn và cùng đơn vị/cách tổng hợp">Chỉ số chuẩn: {m.standard_label ?? m.standard_code} ({m.standard_code})</Badge> : <Badge variant="outline" className="text-muted-foreground">Chưa ánh xạ — không gộp</Badge>}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.unit} · {VALUE_KIND_LABELS[m.value_kind]} · {AGGREGATION_LABELS[m.aggregation]} · {DIRECTION_LABELS[m.direction]}
                      {m.description ? ` · ${m.description}` : ""}
                    </div>
                  </div>
                  {canEdit && <StandardCodeButton m={m} />}
                  {canEdit && <Button variant="ghost" size="icon" aria-label={`Sửa ${m.name}`} onClick={() => setEditKr(m)}><Pencil className="h-4 w-4" /></Button>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {editKr !== null && <KrDialog key={"new" in editKr ? `new-${editKr.new}` : editKr.id} kr={editKr} onClose={() => setEditKr(null)} />}
    </div>
  );
}

function StandardCodeButton({ m }: { m: BizKrMetric }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(m.standard_code ?? "");
  const [label, setLabel] = useState(m.standard_label ?? m.name);
  const save = useBizKrStandardSave();
  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Mã gộp</Button>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input aria-label="Mã chỉ số chuẩn" placeholder="vd. revenue" className="h-8 w-32" value={code} onChange={(e) => setCode(e.target.value)} />
      <Input aria-label="Tên hiển thị chuẩn" placeholder="Tên hiển thị" className="h-8 w-36" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Button size="sm" disabled={save.isPending} onClick={() => save.mutate({ _metric_id: m.id, _code: code, _label: label }, { onSuccess: () => { toast.success(code ? "Đã lưu mã chỉ số chuẩn" : "Đã bỏ ánh xạ"); setOpen(false); } })}>Lưu</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
    </div>
  );
}

function KrDialog({ kr, onClose }: { kr: BizKrMetric | { new: string } | null; onClose: () => void }) {
  const isNew = kr !== null && "new" in kr;
  const m = isNew ? null : kr;
  const [name, setName] = useState(m?.name ?? "");
  const [desc, setDesc] = useState(m?.description ?? "");
  const [unit, setUnit] = useState(m?.unit ?? "");
  const [kind, setKind] = useState<string>(m?.value_kind ?? "count");
  const [agg, setAgg] = useState<string>(m?.aggregation ?? "sum");
  const [dir, setDir] = useState<string>(m?.direction ?? "higher");
  const [sort, setSort] = useState(String(m?.sort_order ?? 0));
  const [active, setActive] = useState(m?.active ?? true);
  const save = useBizKrSave();
  if (kr === null) return null;

  const submit = async () => {
    try {
      await save.mutateAsync({
        _id: m?.id ?? null, _department_id: isNew ? kr.new : (m?.department_id ?? ""),
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
