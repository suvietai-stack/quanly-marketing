import { openRecordAi, useRegisterAiRecord } from '@/lib/aiSuviet/useRecordContext';
import { useEffect, useState } from "react";
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
import {DesignReviewerPicker} from './DesignReviewerPicker';
import {reviewerIsAssignee} from '@/lib/orders/reviewer';
import { DesignJobChat, DesignJobChatTab } from '@/components/design/DesignJobChat';
import {validDocumentUrl} from '@/lib/orders/catalogs';
import {Sparkles} from 'lucide-react';

export function OrderDetailDialog({ orderId, open, onOpenChange }: { orderId: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  useRegisterAiRecord('design',open?orderId:null);
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const found = orderId ? s.orders.find((o) => o.id === orderId) : null;
  const [draft, setDraft] = useState<Partial<DesignOrder>>({});
  const [reviewNote, setReviewNote] = useState("");
  const [forceTarget, setForceTarget] = useState<OrderStatus | "">("");
  const [forceReason, setForceReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploading,setUploading]=useState(false);
  const [activeTab, setActiveTab] = useState("workflow");

  useEffect(() => {
    setDraft({});
    setForceTarget("");
    setForceReason("");
    setSaveError("");
    setActiveTab("workflow");
  }, [orderId]);
  const team=useQuery({queryKey:['design-team-access',user?.id],enabled:!!user?.id,
    queryFn:async()=>{const {data,error}=await (supabase as any).rpc('design_team_access');if(error)throw error;return !!data;},staleTime:60000,retry:1});

  if (!found) return null;
  const order: DesignOrder = found;

  const o: DesignOrder = { ...order, ...draft };
  const setField = (patch: Partial<DesignOrder>) => setDraft((d) => ({ ...d, ...patch }));
  const userName = user?.fullName || user?.username || "—";
  const isOwner = !!user && (o.assigneeId ? o.assigneeId === user.id : (o.assignee === userName || o.assignee === user.username));
  const isReviewer = !!user && (o.reviewerId
    ? o.reviewerId === user.id
    : (o.reviewer === userName || o.reviewer === user.username));
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
    catch(e){
      const message = e instanceof Error ? e.message : 'Không lưu được Job';
      setSaveError(message);
      toast.error('Không lưu được Job', { description: message });
      return false;
    }finally{setSaving(false);}
  }
  async function transition(toStatus: OrderStatus, action: string, extra: Partial<DesignOrder> = {}, note?: string, forced?: boolean) {
    const history = pushHistory(action, order.status, toStatus, note, forced);
    // A forced transition is a single auditable state change, not a save of unrelated
    // unsaved form fields. It must not be rejected due to a stale draft.
    if(!await persist({ ...(forced ? {} : draft), status: toStatus, history, ...extra }))return false;
    setDraft({});
    setReviewNote("");
    toast.success(action);
    return true;
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
  const selfApproval = reviewerIsAssignee(o.reviewerId || (!o.reviewer?order.recordCreatedBy:undefined),
    o.assigneeId,effectiveReviewer,o.assignee);

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
  const extraInfoCount = [o.styleNote,o.notes,o.refLink,o.draftLink,o.deliverLink,o.reviseLink,o.usedLink,o.refLinkObject].filter(v=>typeof v==='string'&&v.trim()).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="design-mobile-dialog max-h-[94dvh] w-[calc(100vw-1rem)] max-w-4xl gap-3 overflow-x-hidden overflow-y-auto p-3 sm:p-5">
        <DialogHeader className="space-y-1.5 border-b pb-3 pr-7 text-left">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <DialogTitle className="design-dialog-title min-w-0 break-words text-left text-lg font-semibold leading-6 sm:text-xl">
              {order.title}
            </DialogTitle>
            <StatusBadge value={order.status} />
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <div className="design-dialog-meta min-w-0 text-xs leading-5 text-muted-foreground">
              {[
                designLabel(order.workflowKind),
                s.brands.find(b => b.id === order.brandId)?.name,
                order.workCategoryName || order.type,
                order.priority && order.priority !== 'Trung bình' ? `Ưu tiên ${order.priority}` : undefined,
              ].filter(Boolean).join(' · ')}
            </div>
            <Button type="button" variant="ghost" size="sm" className="min-h-10 shrink-0 gap-1.5 px-2 text-xs text-muted-foreground sm:min-h-8" onClick={openRecordAi}>
              <Sparkles className="size-3.5"/> Hỏi Đốm
            </Button>
          </div>
        </DialogHeader>

        <DesignWorkflowSummary order={order} />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="design-job-tabs sticky top-0 z-10 flex h-auto w-full items-center gap-1 rounded-lg bg-background/95 p-1 shadow-sm backdrop-blur [&>[role=tab]]:min-w-0 [&>[role=tab]]:flex-1 [&>[role=tab]]:px-2">
            <TabsTrigger value="info" className="min-h-9 text-xs sm:text-sm">Thông tin</TabsTrigger>
            <TabsTrigger value="workflow" className="min-h-9 text-xs sm:text-sm">Xử lý</TabsTrigger>
            <DesignJobChatTab jobId={order.id} active={open} />
            <TabsTrigger value="history" className="min-h-9 text-xs sm:text-sm">Lịch sử ({order.history?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <Label>Tên Job</Label>
                <Input value={o.title} disabled={!canEdit} onChange={e=>setField({title:e.target.value})}/>
              </div>
              <div className="min-w-0">
                <Label>Hệ Thiết kế</Label>
                <Select value={o.workflowKind || 'unknown'}
                  disabled={saving || !(isAdmin || designCan(can,order.workflowKind,'assign'))}
                  onValueChange={v=>setField({workflowKind:v as DesignOrder['workflowKind']})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {!o.workflowKind && <SelectItem value="unknown">Chưa phân loại luồng</SelectItem>}
                    {DESIGN_FLOWS.filter(f=>isAdmin||designCan(can,f.key,'assign')).map(f=>
                      <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {o.workflowKind
                ? <DesignClassification flow={o.workflowKind} value={o} onChange={setField} disabled={!canEdit}/>
                : <p className="text-sm">Loại lịch sử: {o.type}</p>}

              <div>
                <Label>Hạn hoàn thành</Label>
                <Input type="date" value={o.deadline||""} disabled={!canEdit}
                  onChange={e=>setField({deadline:e.target.value})}/>
              </div>
              <div>
                <Label>Mức ưu tiên</Label>
                <Select value={o.priority||"Trung bình"} disabled={!canEdit}
                  onValueChange={v=>setField({priority:v as DesignOrder['priority']})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{ORDER_PRIORITIES.map(p=>
                    <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 border-t pt-3">
                <p className="mb-2 text-sm font-semibold">Phân công</p>
                <div className="grid gap-3 sm:grid-cols-2">
                <DesignAssigneePicker flow={o.workflowKind} value={order.assignee} valueId={order.assigneeId}
                  onChange={(name,id)=>{
                    if(!name||!id)return;
                    if(reviewerIsAssignee(o.reviewerId || (!o.reviewer?order.recordCreatedBy:undefined),
                        id,o.reviewer||o.requester,name)){
                      toast.error('Người thực hiện trùng người duyệt. Hãy chọn người duyệt khác trước khi phân công.');
                      return;
                    }
                    if(name===order.assignee && id===order.assigneeId)return;
                    const now=new Date().toISOString();
                    const action=order.assignee
                      ? 'Chuyển Job: '+order.assignee+' → '+name
                      : 'Bổ sung người thực hiện: '+name;
                    const next='Chờ nhận việc' as OrderStatus;
                    const history=pushHistory(action,order.status,next);
                    void persist({
                      ...(draft.reviewer !== undefined ? {reviewer:draft.reviewer,reviewerId:draft.reviewerId} : {}),
                      assignee:name,assigneeId:id,assignedBy:userName,assignedAt:now,status:next,history,
                    })
                      .then(ok => { if (ok) toast.success('Đã phân công người thực hiện'); });
                  }}
                  required disabled={saving||uploading||!canTransfer} label={order.assignee?'Chuyển người thực hiện':'Chọn người thực hiện'}/>
              <DesignReviewerPicker
                valueId={o.reviewerId || (!o.reviewer ? order.recordCreatedBy : undefined)}
                valueName={o.reviewer || o.requester}
                assigneeId={o.assigneeId}
                onChange={(name,id) => setField({ reviewer:name, reviewerId:id })}
                disabled={saving || !(isAdmin || designCan(can,order.workflowKind,'edit_reviewer') || (isRequester && (order.status === "Cần giao người" || order.status === "Chờ nhận việc")))}
                required
              />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Chuyển người thực hiện sẽ được ghi vào lịch sử Job.
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label>Brief · Nội dung yêu cầu</Label>
                <Textarea rows={3} value={o.brief||""} disabled={!canEdit}
                  onChange={e=>setField({brief:e.target.value})}/>
              </div>
              <DesignAttachments orderId={order.id} flow={o.workflowKind}
                value={o.inputAttachments||[]} onChange={inputAttachments=>setField({inputAttachments})}
                disabled={!canEdit} onBusy={setUploading}/>

              <details key={order.id} className="sm:col-span-2 overflow-hidden rounded-lg border">
                <summary className="cursor-pointer select-none px-3 py-3 text-sm font-medium sm:px-4">
                  Thông tin bổ sung (tùy chọn)
                  {extraInfoCount>0&&<span className="ml-2 font-normal text-muted-foreground">· {extraInfoCount} mục đã lưu</span>}
                </summary>
                <div className="grid gap-3 border-t bg-muted/10 p-3 sm:grid-cols-2 sm:p-4">
                  <div>
                    <Label>Nguồn yêu cầu</Label>
                    <Select value={o.source} onValueChange={v=>setField({source:v as DesignOrder['source']})} disabled={!canEdit}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{ORDER_SOURCES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Kích thước</Label>
                    <Input value={o.size || ""} disabled={!canEdit}
                      onChange={e=>setField({size:e.target.value})} placeholder="VD: 1920x1080"/>
                  </div>
                  <div>
                    <Label>Số lượng</Label>
                    <Input type="number" value={o.quantity ?? ""} disabled={!canEdit}
                      onChange={e=>setField({quantity:e.target.value?Number(e.target.value):undefined})}/>
                  </div>
                  <PersonSelect label="Người yêu cầu" value={o.requester}
                    onChange={v=>setField({requester:v})} disabled={!canEdit}/>

                  <div className="sm:col-span-2">
                    <Label>Yêu cầu phong cách</Label>
                    <Textarea rows={2} value={o.styleNote||''} disabled={!canEdit}
                      onChange={e=>setField({styleNote:e.target.value})} placeholder="Có thể ghi chung trong Brief"/>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Ghi chú nội bộ</Label>
                    <Textarea rows={2} value={o.notes||''} disabled={!canEdit}
                      onChange={e=>setField({notes:e.target.value})}/>
                  </div>
                  <div className="sm:col-span-2 border-t pt-3">
                    <p className="text-sm font-medium">Liên kết riêng của Job cũ</p>
                    <p className="text-xs text-muted-foreground">Job mới thêm tài liệu, ảnh hoặc link ở mục đính kèm phía trên. Link cũ vẫn được giữ và chỉnh sửa tại đây.</p>
                  </div>
                  <div><Label>Link tư liệu đầu vào</Label>
                    <Input value={o.refLink||''} disabled={!canEdit} onChange={e=>setField({refLink:e.target.value})}/></div>
                  <div><Label>Link file nháp</Label>
                    <Input value={o.draftLink||''} disabled={!(isAdmin||designCan(can,order.workflowKind,'update_draft')||isOwner)}
                      onChange={e=>setField({draftLink:e.target.value})}/></div>
                  <div><Label>Link file bàn giao</Label>
                    <Input value={o.deliverLink||''} disabled={!(isAdmin||designCan(can,order.workflowKind,'deliver')||isOwner)}
                      onChange={e=>setField({deliverLink:e.target.value})}/></div>
                  <div><Label>Link file chỉnh sửa</Label>
                    <Input value={o.reviseLink||''} disabled={!(isAdmin||designCan(can,order.workflowKind,'update_draft')||isOwner)}
                      onChange={e=>setField({reviseLink:e.target.value})}/></div>
                  <div><Label>Link sản phẩm đã dùng</Label>
                    <Input value={o.usedLink||''} disabled={!canEdit} onChange={e=>setField({usedLink:e.target.value})}/></div>
                  <div><Label>Link đối tượng liên quan</Label>
                    <Input value={o.refLinkObject||''} disabled={!canEdit} onChange={e=>setField({refLinkObject:e.target.value})}/></div>
                </div>
              </details>
            </div>

            <div className="flex flex-col items-stretch justify-between gap-2 border-t pt-3 sm:flex-row sm:items-center">
              <div className="text-xs text-muted-foreground">
                {order.takenAt && <>Nhận: {fmtDate(order.takenAt)} · </>}
                {order.submittedAt && <>Gửi duyệt: {fmtDate(order.submittedAt)} · </>}
                {order.deliveredAt && <>Bàn giao: {fmtDate(order.deliveredAt)} · </>}
                {order.completedAt && <>Hoàn thành: {fmtDate(order.completedAt)}</>}
              </div>
              <Button onClick={saveOnly} disabled={saving||uploading||Object.keys(draft).length===0}>
                {saving?'Đang lưu…':'Lưu thay đổi'}
              </Button>
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
                <div className="space-y-2 border-t pt-3">
                  <Label htmlFor="design-force-status" className="text-xs">Ép chuyển trạng thái (có ghi lịch sử)</Label>
                  <Select value={forceTarget} onValueChange={(v) => setForceTarget(v as OrderStatus)} disabled={saving || uploading}>
                    <SelectTrigger id="design-force-status" aria-label="Trạng thái muốn chuyển"><SelectValue placeholder="Chọn trạng thái đích" /></SelectTrigger>
                    <SelectContent>{ORDER_STATUSES.filter(st => st !== order.status).map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input
                    value={forceReason}
                    onChange={(e) => setForceReason(e.target.value)}
                    placeholder="Lý do ép trạng thái (bắt buộc)"
                    aria-label="Lý do ép chuyển trạng thái"
                    disabled={saving || uploading}
                  />
                  <Button className="min-h-11 w-full sm:w-auto" variant="destructive"
                    disabled={saving || uploading || !forceTarget || forceTarget === order.status || forceReason.trim().length < 3}
                    onClick={async () => {
                      if (!forceTarget || forceReason.trim().length < 3) return;
                      if (await transition(forceTarget, 'Ép chuyển trạng thái', {}, forceReason.trim(), true)) {
                        setForceTarget('');
                        setForceReason('');
                      }
                    }}>
                    Xác nhận ép chuyển trạng thái
                  </Button>
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


