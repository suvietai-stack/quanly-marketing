import { openRecordAi, useRegisterAiRecord } from '@/lib/aiSuviet/useRecordContext';
import { useState } from "react";
import {useQuery} from '@tanstack/react-query';
import { useStore, fmtDate, type DesignOrder, type OrderStatus, type OrderHistoryEntry, ORDER_STATUSES, ORDER_TYPES, ORDER_SOURCES, ORDER_PRIORITIES } from "@/lib/store";
import { useCurrentUser, type PermissionKey } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveDesignOrder } from '@/lib/orders/api';
import { designCan, designLabel, DESIGN_FLOWS } from '@/lib/orders/design';
import { DesignWorkflowSummary } from './DesignWorkflowSummary';
import {DesignClassification} from './DesignClassification';
import {DesignAttachments} from './DesignAttachments';
import {DesignAssigneePicker} from './DesignAssigneePicker';
import { DesignJobChat, DesignJobChatTab } from '@/components/design/DesignJobChat';
import {validDocumentUrl} from '@/lib/orders/catalogs';

export function OrderDetailDialog({ orderId, open, onOpenChange }: { orderId: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  useRegisterAiRecord('design',open?orderId:null);
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const found = orderId ? s.orders.find((o) => o.id === orderId) : null;
  const [draft, setDraft] = useState<Partial<DesignOrder>>({});
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploading,setUploading]=useState(false);
  const [activeTab, setActiveTab] = useState("workflow");
  const team=useQuery({queryKey:['design-team-access',user?.id],enabled:!!user?.id,
    queryFn:async()=>{const {data,error}=await (supabase as any).rpc('design_team_access');if(error)throw error;return !!data;},staleTime:60000,retry:1});

  if (!found) return null;
  const order: DesignOrder = found;

  const o: DesignOrder = { ...order, ...draft };
  const setField = (patch: Partial<DesignOrder>) => setDraft((d) => ({ ...d, ...patch }));
  const userName = user?.fullName || user?.username || "—";
  const isOwner = !!user && (o.assigneeId ? o.assigneeId === user.id : (o.assignee === userName || o.assignee === user.username));
  const isReviewer = !!user && (o.reviewer === userName || o.reviewer === user.username);
  const isRequester = !!user && (o.requester === userName || o.requester === user.username);
  // Default reviewer = requester if no reviewer specified
  const isApprover = isReviewer || (!o.reviewer && isRequester);

  const allow = (perm: PermissionKey, defaultRoleOk = false) => {
    if (isAdmin) return true;
    const action=perm.replace('order.','');
    const scoped=designCan(can,order.workflowKind,action);
    return scoped && defaultRoleOk;
  };

  function pushHistory(action: string, fromStatus?: OrderStatus, toStatus?: OrderStatus, note?: string, forced?: boolean) {
    const entry: OrderHistoryEntry = {
      at: new Date().toISOString(),
      byId: user?.id,
      byName: userName,
      action,
      fromStatus,
      toStatus,
      note,
      forced,
    };
    return [...(order.history || []), entry];
  }

  async function persist(patch: Partial<DesignOrder>) {
    if(saving)return false;setSaving(true);setSaveError('');
    try {await saveDesignOrder(order.id,patch,order);await s.reload();setDraft({});return true;}
    catch(e){setSaveError(e instanceof Error?e.message:'Không lưu được Order');return false;}finally{setSaving(false);}
  }
  async function transition(toStatus: OrderStatus, action: string, extra: Partial<DesignOrder> = {}, note?: string, forced?: boolean) {
    const history = pushHistory(action, order.status, toStatus, note, forced);
    if(!await persist({ ...draft, status: toStatus, history, ...extra }))return;
    setDraft({});
    setReviewNote("");
    toast.success(action);
  }

  async function saveOnly() {
    if (Object.keys(draft).length === 0) {
      toast.info("Không có thay đổi");
      return;
    }
    if(!await persist(draft))return;
    setDraft({});
    toast.success("Đã lưu");
  }

  function requestChanges() {
    if (!reviewNote.trim()) {
      toast.error("Vui lòng nhập ghi chú sửa");
      return;
    }
    transition(
      "Cần sửa",
      "Yêu cầu sửa",
      { reviewNotes: reviewNote, revisions: (order.revisions || 0) + 1 },
      reviewNote,
    );
  }

  // Workflow buttons by status
  const status = order.status;
  const actions: { label: string; onClick: () => void; variant?: "default" | "outline" | "destructive" | "secondary"; show: boolean }[] = [];

  if (status === "Cần giao người") {
    actions.push({
      label: "Chọn người thực hiện để tiếp tục",
      onClick: () => setActiveTab("info"),
      show: isRequester || !!team.data || isAdmin,
    });
  }
  if (status === "Chờ nhận việc") {
    actions.push({
      label: "Nhận việc",
      onClick: () => transition("Đang thực hiện", "Nhận việc", { takenAt: new Date().toISOString(), assignee: o.assignee || userName }),
      show: allow("order.take", isOwner || (!o.assignee)),
    });
  }
  const effectiveReviewer = o.reviewer || o.requester;
  const selfApproval = !!o.assignee && !!effectiveReviewer && o.assignee === effectiveReviewer;

  if (status === "Đang thực hiện") {
    actions.push({
      label: "Gửi duyệt",
      onClick: () => {
        if (selfApproval) {
          toast.error("Người phụ trách không thể đồng thời là người duyệt Order. Vui lòng chọn người duyệt khác.");
          return;
        }
        transition("Chờ duyệt", "Gửi duyệt", { submittedAt: new Date().toISOString() });
      },
      show: allow("order.submit", isOwner),
    });
  }
  if (status === "Chờ duyệt") {
    actions.push({
      label: "Duyệt",
      onClick: () => {
        if (selfApproval) {
          toast.error("Người phụ trách không thể đồng thời duyệt Order của chính mình.");
          return;
        }
        transition("Đã duyệt", "Duyệt order");
      },
      show: allow("order.approve", isApprover) && !selfApproval,
    });
    actions.push({
      label: "Yêu cầu sửa",
      variant: "outline",
      onClick: requestChanges,
      show: allow("order.request_changes", isApprover) && !selfApproval,
    });
  }
  if (status === "Cần sửa") {
    actions.push({
      label: "Gửi duyệt lại",
      onClick: () => transition("Chờ duyệt", "Gửi duyệt lại", { submittedAt: new Date().toISOString() }),
      show: allow("order.resubmit", isOwner),
    });
  }
  if (status === "Đã duyệt") {
    actions.push({
      label: "Bàn giao file",
      onClick: () => transition("Đã bàn giao", "Bàn giao file", { deliveredAt: new Date().toISOString() }),
      show: allow("order.deliver", isOwner),
    });
  }
  if (status === "Đã bàn giao") {
    actions.push({
      label: "Xác nhận hoàn thành",
      onClick: () => transition("Hoàn thành", "Xác nhận hoàn thành", { completedAt: new Date().toISOString() }),
      show: allow("order.complete", isApprover || isRequester),
    });
    actions.push({
      label: "Yêu cầu sửa lại",
      variant: "outline",
      onClick: requestChanges,
      show: allow("order.request_changes", isApprover || isRequester),
    });
  }
  // Single global cancel button — only shown when allowed and order is still active.
  if (status !== "Đã hủy" && status !== "Hoàn thành") {
    actions.push({
      label: "Hủy order",
      variant: "destructive",
      onClick: () => {
        const earlyStages = status === "Cần giao người" || status === "Chờ nhận việc";
        if (!earlyStages && !reviewNote.trim()) {
          toast.error("Nhập lý do hủy ở ô ghi chú trước");
          return;
        }
        transition("Đã hủy", "Hủy order", { cancelReason: reviewNote }, reviewNote);
      },
      show: allow("order.cancel", isRequester),
    });
  }
  if (status === "Đã hủy") {
    actions.push({
      label: "Khôi phục",
      onClick: () => {if(!order.assignee){toast.error("Cần người thực hiện trước khi khôi phục Job");return;}transition("Chờ nhận việc", "Khôi phục Job");},
      show: allow("order.restore", isRequester || designCan(can,order.workflowKind,'assign')),
    });
  }

  const canEdit = isAdmin || (designCan(can,order.workflowKind,'edit') && (isRequester || isOwner || designCan(can,order.workflowKind,'assign')));
  const canForce = isAdmin || (designCan(can,order.workflowKind,'force_status') && designCan(can,order.workflowKind,'assign'));
  const canTransfer = isAdmin || designCan(can,order.workflowKind,'assign') || (!!team.data && isOwner) || (!order.assignee && isRequester);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="design-mobile-dialog max-w-4xl max-h-[90dvh] overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="design-dialog-title flex min-w-0 flex-wrap items-center gap-2 pr-8 text-left sm:gap-3">
            <span className="min-w-0 break-words">{order.title}</span>
            <StatusBadge value={order.status} />
            {order.priority && <StatusBadge value={order.priority} />}
            {order.revisions ? <span className="text-xs text-muted-foreground">Sửa: {order.revisions} lần</span> : null}
          </DialogTitle>
          <div className="design-dialog-meta text-sm leading-6 text-muted-foreground">
            {designLabel(order.workflowKind)} · {s.brands.find((b) => b.id === order.brandId)?.name || 'Không gắn thương hiệu'} · {order.workCategoryName || order.type} · Nguồn: {order.source}
          </div>
        </DialogHeader>

        <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={openRecordAi}>Hỏi Đốm về hồ sơ này</Button>
        <DesignWorkflowSummary order={order} />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="design-job-tabs grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
            <TabsTrigger value="info" className="min-h-11 text-[13px] sm:text-sm">Thông tin</TabsTrigger>
            <TabsTrigger value="workflow" className="min-h-11 text-[13px] sm:text-sm">Xử lý</TabsTrigger>
            <DesignJobChatTab jobId={order.id} active={open} />
            <TabsTrigger value="history" className="min-h-11 text-[13px] sm:text-sm">Lịch sử ({order.history?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Nhóm Thiết kế</Label><Select value={o.workflowKind || 'unknown'} disabled={saving || !(isAdmin || designCan(can,order.workflowKind,'assign'))} onValueChange={v=>setField({workflowKind:v as DesignOrder['workflowKind']})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{!o.workflowKind && <SelectItem value="unknown">Chưa phân loại luồng</SelectItem>}{DESIGN_FLOWS.filter(f=>isAdmin || designCan(can,f.key,'assign')).map(f=><SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="sm:col-span-2"><Label>Tên Job</Label>
                <Input value={o.title} disabled={!canEdit} onChange={(e) => setField({ title: e.target.value })} /></div>
              {o.workflowKind ? <DesignClassification flow={o.workflowKind} value={o} onChange={setField} disabled={!canEdit}/> : <p className="text-sm">Loại lịch sử: {o.type}</p>}
              <div><Label>Nguồn yêu cầu</Label>
                <Select value={o.source} onValueChange={(v) => setField({ source: v as any })} disabled={!canEdit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_SOURCES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label>Mức ưu tiên</Label>
                <Select value={o.priority || "Trung bình"} onValueChange={(v) => setField({ priority: v as any })} disabled={!canEdit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label>Deadline</Label>
                <Input type="date" value={o.deadline || ""} disabled={!canEdit} onChange={(e) => setField({ deadline: e.target.value })} /></div>
              <div><Label>Kích thước</Label>
                <Input value={o.size || ""} disabled={!canEdit} onChange={(e) => setField({ size: e.target.value })} placeholder="VD: 1920x1080" /></div>
              <div><Label>Số lượng</Label>
                <Input type="number" value={o.quantity ?? ""} disabled={!canEdit} onChange={(e) => setField({ quantity: e.target.value ? Number(e.target.value) : undefined })} /></div>

              <PersonSelect label="Người yêu cầu" value={o.requester} onChange={(v) => setField({ requester: v })} disabled={!canEdit} />
              <div className="sm:col-span-2 rounded-md border p-3 space-y-2">
                <DesignAssigneePicker flow={o.workflowKind} value={order.assignee} valueId={order.assigneeId}
                  onChange={(name,id)=>{
                    if(!name||!id)return;
                    if(name === (o.reviewer||o.requester)){toast.error('Người thực hiện phải khác người duyệt.');return;}
                    if(name===order.assignee && id===order.assigneeId)return;
                    const now=new Date().toISOString();
                    const action=order.assignee
                      ? 'Chuyển Job: '+order.assignee+' → '+name
                      : 'Bổ sung người thực hiện: '+name;
                    const next='Chờ nhận việc' as OrderStatus;
                    const history=pushHistory(action,order.status,next);
                    void persist({assignee:name,assigneeId:id,assignedBy:userName,assignedAt:now,status:next,history});
                  }}
                  required disabled={saving||uploading||!canTransfer} label={order.assignee?'Chuyển người thực hiện':'Chọn người thực hiện'}/>
                <p className="text-xs text-muted-foreground">Người tạo phải chọn nhân viên khi tạo Job. Sau đó, nhân viên Thiết kế đang thực hiện được chuyển Job cho đồng nghiệp. Mọi lần chuyển đều lưu lịch sử.</p>
              </div>
              <PersonSelect
                label="Người duyệt"
                value={o.reviewer || o.requester}
                onChange={(v) => {
                  if (v && o.assignee && v === o.assignee) {
                    toast.error("Người duyệt không thể đồng thời là Người phụ trách. Vui lòng chọn người khác.");
                    return;
                  }
                  setField({ reviewer: v });
                }}
                disabled={!(isAdmin || designCan(can,order.workflowKind,'edit_reviewer') || (isRequester && (order.status === "Cần giao người" || order.status === "Chờ nhận việc")))}
              />

              <div className="sm:col-span-2"><Label>Brief</Label>
                <Textarea rows={3} value={o.brief || ""} disabled={!canEdit} onChange={(e) => setField({ brief: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Yêu cầu phong cách</Label>
                <Textarea rows={2} value={o.styleNote || ""} disabled={!canEdit} onChange={(e) => setField({ styleNote: e.target.value })} /></div>

              <div><Label>Link tư liệu đầu vào</Label>
                <Input value={o.refLink || ""} disabled={!canEdit} onChange={(e) => setField({ refLink: e.target.value })} /></div>
              <div><Label>Link file nháp</Label>
                <Input value={o.draftLink || ""} disabled={!(isAdmin || designCan(can,order.workflowKind,'update_draft') || isOwner)} onChange={(e) => setField({ draftLink: e.target.value })} /></div>
              <div><Label>Link file bàn giao</Label>
                <Input value={o.deliverLink || ""} disabled={!(isAdmin || designCan(can,order.workflowKind,'deliver') || isOwner)} onChange={(e) => setField({ deliverLink: e.target.value })} /></div>
              <div><Label>Link file chỉnh sửa</Label>
                <Input value={o.reviseLink || ""} disabled={!(isAdmin || designCan(can,order.workflowKind,'update_draft') || isOwner)} onChange={(e) => setField({ reviseLink: e.target.value })} /></div>
              <div><Label>Link sản phẩm đã dùng</Label>
                <Input value={o.usedLink || ""} disabled={!canEdit} onChange={(e) => setField({ usedLink: e.target.value })} /></div>
              <div><Label>Link đối tượng liên quan</Label>
                <Input value={o.refLinkObject || ""} disabled={!canEdit} onChange={(e) => setField({ refLinkObject: e.target.value })} /></div>

              <div className="sm:col-span-2"><Label>Ghi chú nội bộ</Label>
                <Textarea rows={2} value={o.notes || ""} disabled={!canEdit} onChange={(e) => setField({ notes: e.target.value })} /></div>
              <DesignAttachments orderId={order.id} flow={o.workflowKind} value={o.inputAttachments || []} onChange={inputAttachments=>setField({inputAttachments})} disabled={!canEdit} onBusy={setUploading}/>
            </div>

            <div className="flex flex-col items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
              <div className="text-xs text-muted-foreground">
                Tạo: {fmtDate(order.takenAt) === "—" ? "—" : ""}
                {order.takenAt && <>Nhận: {fmtDate(order.takenAt)} · </>}
                {order.submittedAt && <>Gửi duyệt: {fmtDate(order.submittedAt)} · </>}
                {order.deliveredAt && <>Bàn giao: {fmtDate(order.deliveredAt)} · </>}
                {order.completedAt && <>Hoàn thành: {fmtDate(order.completedAt)}</>}
              </div>
              <Button onClick={saveOnly} disabled={saving || uploading || Object.keys(draft).length === 0}>{saving?'Đang lưu…':'Lưu thay đổi'}</Button>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4 mt-4">
            <Card><CardContent className="space-y-4 p-3 sm:p-4">
              <div className="text-sm text-muted-foreground">
                Trạng thái hiện tại: <StatusBadge value={order.status} />
              </div>
              {!order.assignee && (isAdmin || isRequester || !!team.data) && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed p-3"><p className="text-sm text-muted-foreground">Công việc chưa có người thực hiện.</p><Button variant="outline" size="sm" onClick={() => setActiveTab('info')}>Phân công công việc</Button></div>}
              <div className="flex flex-wrap gap-2">{[{label:'Mở bản nháp',url:order.draftLink},{label:'Mở bản chỉnh sửa',url:order.reviseLink},{label:'Mở file bàn giao',url:order.deliverLink}].filter(item=>item.url && validDocumentUrl(item.url)).map(item=><a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-md border px-3 py-2 text-sm font-medium text-primary hover:bg-muted">{item.label} ↗</a>)}</div>
              {order.reviewNotes && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm">
                  <strong>Ghi chú sửa gần nhất:</strong> {order.reviewNotes}
                </div>
              )}
              {(status === "Chờ duyệt" || status === "Đã bàn giao") && (
                <div>
                  <Label>Ghi chú sửa (bắt buộc khi yêu cầu sửa)</Label>
                  <Textarea rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Mô tả phần cần chỉnh sửa..." />
                </div>
              )}
              {(status === "Cần giao người" || status === "Chờ nhận việc") && (
                <div>
                  <Label>Lý do hủy (nếu hủy)</Label>
                  <Input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Lý do..." />
                </div>
              )}

              <div className="grid gap-2 sm:flex sm:flex-wrap">
                {actions.filter((a) => a.show).map((a) => (
                  <Button key={a.label} className="min-h-11 w-full sm:w-auto" disabled={saving || uploading} variant={a.variant || "default"} onClick={a.onClick}>{a.label}</Button>
                ))}
                {actions.filter((a) => a.show).length === 0 && (
                  <p className="text-sm text-muted-foreground">Không có hành động khả dụng cho trạng thái này (hoặc bạn không có quyền).</p>
                )}
              </div>

              {canForce && (
                <div className="border-t pt-3">
                  <Label className="text-xs">Khôi phục nghiệp vụ (quản trị đặc biệt)</Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={order.status} onValueChange={(v) => transition(v as OrderStatus, "Ép chuyển trạng thái", {}, undefined, true)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ORDER_STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="job-chat" className="mt-4">
            <DesignJobChat key={order.id} jobId={order.id}/>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-2">
              {!order.history?.length && <p className="text-sm text-muted-foreground">Chưa có lịch sử.</p>}
              {(order.history || []).slice().reverse().map((h, i) => (
                <div key={i} className="min-w-0 rounded-md border p-3 text-sm">
                  <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                      <strong>{h.byName}</strong>
                      <span className="min-w-0 break-words text-muted-foreground">{h.action}</span>
                      {h.forced && <span className="text-xs text-destructive">(ép)</span>}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(h.at).toLocaleString("vi-VN")}</span>
                  </div>
                  {h.fromStatus && h.toStatus && (
                    <div className="mt-1 text-xs flex items-center gap-1">
                      <StatusBadge value={h.fromStatus} /> → <StatusBadge value={h.toStatus} />
                    </div>
                  )}
                  {h.note && <div className="mt-1 text-xs">{h.note}</div>}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        {Object.keys(o.specialty || {}).length>0 && <section className="border-t pt-3"><h3 className="text-sm font-semibold">Yêu cầu chuyên môn</h3><div className="grid gap-3 sm:grid-cols-2 mt-3">{Object.entries(o.specialty || {}).map(([key,value])=>key==='Logo khách hàng'?<p key={key} className="text-sm break-words"><span className="text-muted-foreground">{key} (lịch sử): </span>{validDocumentUrl(value)?<a href={value} target="_blank" rel="noopener noreferrer" className="text-primary underline">{value}</a>:value || '—'}</p>:<div key={key}><Label>{key}</Label><Input disabled={!canEdit} value={value || ''} onChange={e=>setField({specialty:{...o.specialty,[key]:e.target.value}})}/></div>)}</div></section>}
        {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
      </DialogContent>
    </Dialog>
  );
}

function PersonSelect({ label, value, onChange, disabled }: { label: string; value?: string; onChange: (v?: string) => void; disabled?: boolean }) {
  const { people } = useStore();
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value || "_"} onValueChange={(v) => onChange(v === "_" ? undefined : v)} disabled={disabled}>
        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_">—</SelectItem>
          {people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}


