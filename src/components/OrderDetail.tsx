import { useState } from "react";
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

export function OrderDetailDialog({ orderId, open, onOpenChange }: { orderId: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const found = orderId ? s.orders.find((o) => o.id === orderId) : null;
  const [draft, setDraft] = useState<Partial<DesignOrder>>({});
  const [reviewNote, setReviewNote] = useState("");

  if (!found) return null;
  const order: DesignOrder = found;

  const o: DesignOrder = { ...order, ...draft };
  const setField = (patch: Partial<DesignOrder>) => setDraft((d) => ({ ...d, ...patch }));
  const userName = user?.fullName || user?.username || "—";
  const isOwner = !!user && (o.assignee === userName || o.assignee === user.username);
  const isReviewer = !!user && (o.reviewer === userName || o.reviewer === user.username);
  const isRequester = !!user && (o.requester === userName || o.requester === user.username);
  // Default reviewer = requester if no reviewer specified
  const isApprover = isReviewer || (!o.reviewer && isRequester);

  const allow = (perm: PermissionKey, defaultRoleOk = false) => {
    if (isAdmin) return true;
    if (can(perm)) return true;
    return defaultRoleOk;
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

  function transition(toStatus: OrderStatus, action: string, extra: Partial<DesignOrder> = {}, note?: string, forced?: boolean) {
    const history = pushHistory(action, order.status, toStatus, note, forced);
    s.update("orders", order.id, { ...draft, status: toStatus, history, ...extra });
    setDraft({});
    setReviewNote("");
    toast.success(action);
  }

  function saveOnly() {
    if (Object.keys(draft).length === 0) {
      toast.info("Không có thay đổi");
      return;
    }
    s.update("orders", order.id, draft);
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

  if (status === "Mới tạo") {
    actions.push({
      label: "Gửi yêu cầu",
      onClick: () => transition("Chờ nhận việc", "Gửi yêu cầu"),
      show: allow("order.send_request", isRequester),
    });
  }
  if (status === "Chờ nhận việc") {
    actions.push({
      label: "Nhận việc",
      onClick: () => transition("Đang thực hiện", "Nhận việc", { takenAt: new Date().toISOString(), assignee: o.assignee || userName }),
      show: allow("order.take", isOwner || (!o.assignee)),
    });
  }
  if (status === "Đang thực hiện") {
    actions.push({
      label: "Gửi duyệt",
      onClick: () => transition("Chờ duyệt", "Gửi duyệt", { submittedAt: new Date().toISOString() }),
      show: allow("order.submit", isOwner),
    });
  }
  if (status === "Chờ duyệt") {
    actions.push({
      label: "Duyệt",
      onClick: () => transition("Đã duyệt", "Duyệt order"),
      show: allow("order.approve", isApprover),
    });
    actions.push({
      label: "Yêu cầu sửa",
      variant: "outline",
      onClick: requestChanges,
      show: allow("order.request_changes", isApprover),
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
        const earlyStages = status === "Mới tạo" || status === "Chờ nhận việc";
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
      onClick: () => transition("Mới tạo", "Khôi phục order"),
      show: allow("order.restore", false),
    });
  }
  if (status === "Đã hủy") {
    actions.push({
      label: "Khôi phục",
      onClick: () => transition("Mới tạo", "Khôi phục order"),
      show: allow("order.restore", false),
    });
  }

  const canEdit = isAdmin || can("order.edit") || isRequester || isOwner;
  const canForce = isAdmin || can("order.force_status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            <span>{order.title}</span>
            <StatusBadge value={order.status} />
            {order.priority && <StatusBadge value={order.priority} />}
            {order.revisions ? <span className="text-xs text-muted-foreground">Sửa: {order.revisions} lần</span> : null}
          </DialogTitle>
          <div className="text-xs text-muted-foreground">
            {s.brands.find((b) => b.id === order.brandId)?.name} · {order.type} · Nguồn: {order.source}
          </div>
        </DialogHeader>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="history">Lịch sử ({order.history?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><Label>Tên order</Label>
                <Input value={o.title} disabled={!canEdit} onChange={(e) => setField({ title: e.target.value })} /></div>
              <div><Label>Thương hiệu</Label>
                <Select value={o.brandId} onValueChange={(v) => setField({ brandId: v })} disabled={!canEdit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label>Loại</Label>
                <Select value={o.type} onValueChange={(v) => setField({ type: v as any })} disabled={!canEdit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select></div>
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
              <PersonSelect label="Người phụ trách" value={o.assignee} onChange={(v) => setField({ assignee: v })} disabled={!(isAdmin || can("order.assign") || isRequester)} />
              <PersonSelect label="Người duyệt" value={o.reviewer} onChange={(v) => setField({ reviewer: v })} disabled={!canEdit} />
              <PersonSelect label="Người giao việc" value={o.assigner} onChange={(v) => setField({ assigner: v })} disabled={!canEdit} />

              <div className="sm:col-span-2"><Label>Brief</Label>
                <Textarea rows={3} value={o.brief || ""} disabled={!canEdit} onChange={(e) => setField({ brief: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Yêu cầu phong cách</Label>
                <Textarea rows={2} value={o.styleNote || ""} disabled={!canEdit} onChange={(e) => setField({ styleNote: e.target.value })} /></div>

              <div><Label>Link tư liệu đầu vào</Label>
                <Input value={o.refLink || ""} disabled={!canEdit} onChange={(e) => setField({ refLink: e.target.value })} /></div>
              <div><Label>Link file nháp</Label>
                <Input value={o.draftLink || ""} disabled={!(isAdmin || can("order.update_draft") || isOwner)} onChange={(e) => setField({ draftLink: e.target.value })} /></div>
              <div><Label>Link file bàn giao</Label>
                <Input value={o.deliverLink || ""} disabled={!(isAdmin || can("order.deliver") || isOwner)} onChange={(e) => setField({ deliverLink: e.target.value })} /></div>
              <div><Label>Link file chỉnh sửa</Label>
                <Input value={o.reviseLink || ""} disabled={!(isAdmin || can("order.update_draft") || isOwner)} onChange={(e) => setField({ reviseLink: e.target.value })} /></div>
              <div><Label>Link sản phẩm đã dùng</Label>
                <Input value={o.usedLink || ""} disabled={!canEdit} onChange={(e) => setField({ usedLink: e.target.value })} /></div>
              <div><Label>Link đối tượng liên quan</Label>
                <Input value={o.refLinkObject || ""} disabled={!canEdit} onChange={(e) => setField({ refLinkObject: e.target.value })} /></div>

              <div className="sm:col-span-2"><Label>Ghi chú nội bộ</Label>
                <Textarea rows={2} value={o.notes || ""} disabled={!canEdit} onChange={(e) => setField({ notes: e.target.value })} /></div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-muted-foreground">
                Tạo: {fmtDate(order.takenAt) === "—" ? "—" : ""}
                {order.takenAt && <>Nhận: {fmtDate(order.takenAt)} · </>}
                {order.submittedAt && <>Gửi duyệt: {fmtDate(order.submittedAt)} · </>}
                {order.deliveredAt && <>Bàn giao: {fmtDate(order.deliveredAt)} · </>}
                {order.completedAt && <>Hoàn thành: {fmtDate(order.completedAt)}</>}
              </div>
              <Button onClick={saveOnly} disabled={!canEdit || Object.keys(draft).length === 0}>Lưu thay đổi</Button>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4 mt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                Trạng thái hiện tại: <StatusBadge value={order.status} />
              </div>
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
              {(status === "Mới tạo" || status === "Chờ nhận việc") && (
                <div>
                  <Label>Lý do hủy (nếu hủy)</Label>
                  <Input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Lý do..." />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {actions.filter((a) => a.show).map((a) => (
                  <Button key={a.label} variant={a.variant || "default"} onClick={a.onClick}>{a.label}</Button>
                ))}
                {actions.filter((a) => a.show).length === 0 && (
                  <p className="text-sm text-muted-foreground">Không có hành động khả dụng cho trạng thái này (hoặc bạn không có quyền).</p>
                )}
              </div>

              {canForce && (
                <div className="border-t pt-3">
                  <Label className="text-xs">Ép chuyển trạng thái (Admin)</Label>
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

          <TabsContent value="history" className="mt-4">
            <div className="space-y-2">
              {!order.history?.length && <p className="text-sm text-muted-foreground">Chưa có lịch sử.</p>}
              {(order.history || []).slice().reverse().map((h, i) => (
                <div key={i} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <strong>{h.byName}</strong>
                      <span className="text-muted-foreground">{h.action}</span>
                      {h.forced && <span className="text-xs text-destructive">(ép)</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString("vi-VN")}</span>
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
