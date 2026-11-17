import { useMemo, useState } from "react";
import {
  useStore, uid,
  ORDER_TYPES, ORDER_PRIORITIES,
  type WebContent, type DesignOrder, type OrderType, type OrderPriority,
} from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DesignAssigneePicker } from "@/components/DesignAssigneePicker";
import { DesignReviewerPicker } from "@/components/DesignReviewerPicker";
import {useDesignCatalogs} from '@/lib/orders/catalogs';
import { saveDesignOrder } from '@/lib/orders/api';
import { designCan } from '@/lib/orders/design';

function suggestDeadline(publishDate?: string): string {
  if (!publishDate) return "";
  const d = new Date(publishDate);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function DesignOrderFormFromContent({
  content, open, onClose,
}: {
  content: WebContent;
  open: boolean;
  onClose: () => void;
}) {
  const s = useStore();
  const { user, can } = useCurrentUser();


  const brand = s.brands.find((b) => b.id === content.brandId);
  const designCatalogs=useDesignCatalogs();


  const defaultCreator = user?.fullName || user?.username || "";
  // The creator is always the default approver. Content drafts do not override the account identity.

  const [title, setTitle] = useState(`Ảnh cho bài: ${content.title}`);
  const [type, setType] = useState<OrderType>("Ảnh bài web");
  const [priority, setPriority] = useState<OrderPriority>("Trung bình");
  const [deadline, setDeadline] = useState(
    suggestDeadline(content.publishDate) || content.deadline || "",
  );
  const [assignee, setAssignee] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [reviewerOverride,setReviewerOverride]=useState<{id:string;name:string}|null>(null);
  const reviewerId=reviewerOverride?.id || user?.id || '';
  const reviewer=reviewerOverride?.name || defaultCreator;
  const [brief, setBrief] = useState(
    `Thiết kế/chọn ảnh minh họa phục vụ bài content web "${content.title}".\n` +
    `Yêu cầu: ảnh phù hợp nội dung bài, đúng nhận diện thương hiệu${brand?.name ? ` "${brand.name}"` : ""}, có thể dùng để đăng lên website.\n` +
    `Từ khoá chính: ${content.mainKeyword || "—"}`,
  );
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [styleNote, setStyleNote] = useState("");
  const [textInImage, setTextInImage] = useState("");
  const [notes, setNotes] = useState("");

  const [refLink, setRefLink] = useState("");
  const [draftLink, setDraftLink] = useState(content.draftLink || "");
  const [outlineLinkRef, setOutlineLinkRef] = useState(content.outlineLink || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (saving) return;
    if (!designCan(can,'marketing_design','create')) {
      toast.error("Bạn không có quyền tạo Order thiết kế");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên order");
      return;
    }
    const now = new Date().toISOString();
    const composedBrief =
      brief +
      (textInImage.trim() ? `\n\nChữ cần đưa vào ảnh:\n${textInImage}` : "") +
      (outlineLinkRef ? `\n\nLink outline: ${outlineLinkRef}` : "") +
      (draftLink ? `\nLink bài viết: ${draftLink}` : "");

    if (!assignee || !assigneeId) {toast.error('Bắt buộc chọn nhân viên Thiết kế thực hiện.');return;}
    if (!reviewerId) {toast.error('Cần chọn tài khoản người duyệt hợp lệ.');return;}
    if (reviewerId === assigneeId) {toast.error('Người duyệt phải khác người thực hiện.');return;}
    const categoryName:Record<string,string>={'Banner website':'Banner Website','Ảnh bài web':'Ảnh bài Web','Ảnh social':'Ảnh Social','Thumbnail video':'Thumbnail Video','Ảnh sản phẩm':'Ảnh sản phẩm','Catalogue / profile':'Catalogue / Profile','Ảnh Google Map':'Ảnh Google Map'};
    const cat=designCatalogs.data?.find(c=>c.workflow_kind==='marketing_design'&&c.kind==='work'&&c.active&&c.name===(categoryName[type]||'Khác'));
    if(!cat){toast.error('Không tải được loại ấn phẩm phù hợp.');return;}
    const finalAssignee = assignee;
    const status = "Chờ nhận việc";

    const order: DesignOrder = {
      id: uid(),
      title: title.trim(),
      brandId: content.brandId,
      type,
      workCategoryId:cat.id,workCategoryName:cat.name,
      source: "Web",
      sourceModule: "Content Web",
      workflowKind: 'marketing_design',
      refLinkObject: content.title,
      requester: defaultCreator,
      assignee: finalAssignee,
      assigneeId: finalAssignee && assigneeId ? assigneeId : undefined,
      reviewer, reviewerId,
      deadline: deadline || undefined,
      priority,
      brief: composedBrief,
      styleNote: styleNote || undefined,
      size: size || undefined,
      quantity: quantity || undefined,
      refLink: refLink || undefined,
      notes: notes || undefined,
      status,
      contentId: content.id,
      history: [{
        at: now,
        byId: user?.id,
        byName: defaultCreator || "—",
        action: "Tạo order từ Content Web",
        toStatus: status,
      }],
    };

    setSaving(true);
    try {
    if (content.designOrderId && s.orders.some(o=>o.id===content.designOrderId)) {toast.error('Bài viết đã có Order thiết kế');return;}
    await saveDesignOrder(order.id, order);
    await s.reload();
    s.update("webContents", content.id, { designOrderId: order.id, needsDesign: true });
    toast.success("Đã tạo order thiết kế và liên kết với bài content.");
    onClose();
    } catch(e) {toast.error(e instanceof Error?e.message:'Không tạo được Order');} finally {setSaving(false);}
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Order Thiết Kế từ Content Web</DialogTitle>
          <DialogDescription>
            Form đã tự điền sẵn thông tin liên quan đến bài content. Bạn có thể chỉnh sửa trước khi tạo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              1. Thông tin order
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Tên order *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Thương hiệu</Label>
                <Input value={brand?.name || "—"} disabled />
              </div>
              <div>
                <Label>Nguồn yêu cầu</Label>
                <Input value="Web" disabled />
              </div>
              <div>
                <Label>Module liên quan</Label>
                <Input value="Content Web" disabled />
              </div>
              <div>
                <Label>Bài content liên quan</Label>
                <Input value={content.title} disabled />
              </div>
              <div>
                <Label>Loại order</Label>
                <Select value={type} onValueChange={(v) => setType(v as OrderType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mức ưu tiên</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as OrderPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              2. Nội dung yêu cầu
            </h3>
            <div>
              <Label>Brief thiết kế</Label>
              <Textarea rows={5} value={brief} onChange={(e) => setBrief(e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Kích thước</Label>
                <Input value={size} onChange={e=>setSize(e.target.value)} placeholder="VD: 1200x630"/>
              </div>
              <div>
                <Label>Số lượng ảnh/file</Label>
                <Input type="number" min={1} value={quantity}
                  onChange={e=>setQuantity(Number(e.target.value)||1)}/>
              </div>
            </div>
          </section>

          <details className="rounded-lg border p-3 sm:p-4">
            <summary className="cursor-pointer text-sm font-medium">Phong cách, ghi chú và tài liệu tham khảo (tùy chọn)</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Yêu cầu phong cách</Label>
                <Input value={styleNote} onChange={e=>setStyleNote(e.target.value)}
                  placeholder="Có thể mô tả trong Brief"/>
              </div>
              <div className="sm:col-span-2">
                <Label>Chữ cần đưa vào ảnh</Label>
                <Textarea rows={2} value={textInImage} onChange={e=>setTextInImage(e.target.value)}/>
              </div>
              <div className="sm:col-span-2">
                <Label>Ghi chú nội bộ</Label>
                <Textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}/>
              </div>
              <div><Label>Link bài viết</Label>
                <Input value={draftLink} onChange={e=>setDraftLink(e.target.value)}/></div>
              <div><Label>Link outline</Label>
                <Input value={outlineLinkRef} onChange={e=>setOutlineLinkRef(e.target.value)}/></div>
              <div className="sm:col-span-2"><Label>Link tài nguyên tham khảo</Label>
                <Input value={refLink} onChange={e=>setRefLink(e.target.value)}/></div>
            </div>
          </details>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              3. Phân công &amp; deadline
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Người tạo order</Label>
                <Input value={defaultCreator} disabled />
              </div>
              <div>
                <DesignReviewerPicker valueId={reviewerId} valueName={reviewer}
                  onChange={(name,id)=>setReviewerOverride({name,id})}
                  assigneeId={assigneeId} disabled={saving} required />
                {!reviewerOverride&&<p className="mt-1 text-xs text-muted-foreground">Mặc định là người tạo Order.</p>}
              </div>
              <div>
                <DesignAssigneePicker flow="marketing_design" value={assignee} valueId={assigneeId} onChange={(v,id)=>{setAssignee(v||'');setAssigneeId(id||'');}} required disabled={saving} />
              </div>
              <div>
                <Label>Deadline</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                {content.publishDate && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Gợi ý: trước ngày đăng ({content.publishDate}).
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button disabled={saving || !assigneeId || !reviewerId || reviewerId===assigneeId} onClick={handleSubmit}>{saving?'Đang lưu…':'Tạo order'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
