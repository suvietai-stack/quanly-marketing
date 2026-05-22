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
  const canAssign = can("order.assign");

  const brand = s.brands.find((b) => b.id === content.brandId);
  const activePeople = useMemo(
    () => s.people.filter((p) => p.accountStatus === "Đang hoạt động" || p.status === "Đang làm"),
    [s.people],
  );

  const defaultCreator = user?.fullName || user?.username || "";
  const defaultReviewer = content.draftReviewer || defaultCreator;

  const [title, setTitle] = useState(`Ảnh cho bài: ${content.title}`);
  const [type, setType] = useState<OrderType>("Ảnh bài web");
  const [priority, setPriority] = useState<OrderPriority>("Trung bình");
  const [deadline, setDeadline] = useState(
    suggestDeadline(content.publishDate) || content.deadline || "",
  );
  const [requester, setRequester] = useState(defaultCreator);
  const [assignee, setAssignee] = useState<string>("");
  const [reviewer, setReviewer] = useState<string>(defaultReviewer);
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

  const handleSubmit = () => {
    if (!can("order.create")) {
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

    const finalAssignee = canAssign ? (assignee || undefined) : undefined;
    const status = finalAssignee ? "Chờ nhận việc" : "Mới tạo";

    const order: DesignOrder = {
      id: uid(),
      title: title.trim(),
      brandId: content.brandId,
      type,
      source: "Web",
      sourceModule: "Content Web",
      refLinkObject: content.title,
      requester: requester || defaultCreator,
      assignee: finalAssignee,
      reviewer: reviewer || requester || defaultCreator || undefined,
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

    s.add("orders", order);
    s.update("webContents", content.id, { designOrderId: order.id, needsDesign: true });
    toast.success("Đã tạo order thiết kế và liên kết với bài content.");
    onClose();
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
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>Kích thước</Label>
                <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="VD: 1200x630" />
              </div>
              <div>
                <Label>Số lượng ảnh/file</Label>
                <Input type="number" min={1} value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
              </div>
              <div>
                <Label>Yêu cầu phong cách</Label>
                <Input value={styleNote} onChange={(e) => setStyleNote(e.target.value)}
                  placeholder="VD: tối giản, hiện đại..." />
              </div>
            </div>
            <div>
              <Label>Chữ cần đưa vào ảnh (nếu có)</Label>
              <Textarea rows={2} value={textInImage} onChange={(e) => setTextInImage(e.target.value)} />
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              3. Tài liệu liên quan
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Link bài viết</Label>
                <Input value={draftLink} onChange={(e) => setDraftLink(e.target.value)} />
              </div>
              <div>
                <Label>Link outline</Label>
                <Input value={outlineLinkRef} onChange={(e) => setOutlineLinkRef(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Link ảnh tham khảo / tài nguyên đầu vào</Label>
                <Input value={refLink} onChange={(e) => setRefLink(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              4. Phân công &amp; deadline
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Người tạo order</Label>
                <Input value={requester} onChange={(e) => setRequester(e.target.value)} />
              </div>
              <div>
                <Label>Người duyệt / xác nhận</Label>
                <Input value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
              </div>
              <div>
                <Label>
                  Người phụ trách thiết kế {canAssign ? "" : "(cần quyền order.assign)"}
                </Label>
                {canAssign ? (
                  <Select value={assignee || "__none__"} onValueChange={(v) => setAssignee(v === "__none__" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Chưa phân công" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Chưa phân công —</SelectItem>
                      {activePeople.map((p) => (
                        <SelectItem key={p.id} value={p.name}>{p.name}{p.role ? ` · ${p.role}` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value="Sẽ ở trạng thái Mới tạo / Chờ phân công" disabled />
                )}
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
          <Button onClick={handleSubmit}>Tạo order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
