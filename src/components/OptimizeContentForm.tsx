import { useMemo, useState } from "react";
import {
  useStore, uid,
  OPTIMIZE_REASONS, OPTIMIZE_SOURCES, OPTIMIZE_TARGETS, OPTIMIZE_RECURRING_PERIODS,
  type WebContent, type OptimizeReason, type OptimizeSource,
  type OptimizeTarget, type OptimizeRecurringPeriod,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

const DONE_STATUSES = new Set(["Đã đăng web", "Kiểm tra index", "Hoàn thành"]);

export function OptimizeContentForm({
  websiteId, brandId, onSubmit, onClose,
}: {
  websiteId: string;
  brandId: string;
  onSubmit: (c: WebContent) => void;
  onClose: () => void;
}) {
  const { webContents, websites, brands } = useStore();
  const website = websites.find((w) => w.id === websiteId);
  const brand = brands.find((b) => b.id === brandId);

  // Danh sách bài đã đăng / index của website hiện tại
  const publishedList = useMemo(
    () => webContents.filter((c) => c.websiteId === websiteId && DONE_STATUSES.has(c.status)),
    [webContents, websiteId],
  );

  const [sourceContentId, setSourceContentId] = useState<string>("");
  const [optimizeSource, setOptimizeSource] = useState<OptimizeSource>("Thủ công");
  const [title, setTitle] = useState("");
  const [oldLink, setOldLink] = useState("");
  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeywords, setSubKeywords] = useState("");

  const [reason, setReason] = useState<OptimizeReason | "">("");
  const [targets, setTargets] = useState<OptimizeTarget[]>([]);
  const [notes, setNotes] = useState("");
  const [refLink, setRefLink] = useState("");

  const [recurring, setRecurring] = useState(false);
  const [period, setPeriod] = useState<OptimizeRecurringPeriod>("Mỗi 3 tháng");

  const onPickSource = (v: string) => {
    setSourceContentId(v === "_" ? "" : v);
    if (v && v !== "_") {
      const src = publishedList.find((x) => x.id === v);
      if (src) {
        setTitle(src.title || "");
        setOldLink(src.publishedLink || src.url || "");
        setMainKeyword(src.mainKeyword || "");
        setSubKeywords(src.subKeywords || "");
      }
    }
  };

  const toggleTarget = (t: OptimizeTarget) => {
    setTargets((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const submit = () => {
    if (!title.trim()) { alert("Vui lòng nhập tiêu đề bài cần tối ưu"); return; }
    if (!sourceContentId && !oldLink.trim()) {
      alert("Vui lòng chọn bài gốc trong hệ thống hoặc nhập URL bài cần tối ưu");
      return;
    }
    if (!reason) { alert("Vui lòng chọn lý do tối ưu"); return; }

    const item: WebContent = {
      id: uid(),
      websiteId,
      brandId,
      type: "Bài tối ưu lại",
      title: title.trim(),
      status: "Đã tạo",
      indexStatus: "Chưa kiểm tra",
      mainKeyword: mainKeyword.trim() || undefined,
      subKeywords: subKeywords.trim() || undefined,
      oldLink: oldLink.trim() || undefined,
      sourceContentId: sourceContentId || undefined,
      optimizeSource,
      optimizeReason: reason as OptimizeReason,
      optimizeTargets: targets.length ? targets : undefined,
      optimizeNotes: notes.trim() || undefined,
      optimizeRefLink: refLink.trim() || undefined,
      optimizeRecurring: recurring || undefined,
      optimizeRecurringPeriod: recurring ? period : undefined,
    };
    onSubmit(item);
    onClose();
  };

  return (
    <>
      <div className="grid gap-4 max-h-[65vh] overflow-y-auto pr-1">
        {/* A. Bài cần tối ưu */}
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">A. Bài cần tối ưu</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nguồn tạo việc</Label>
              <Select value={optimizeSource} onValueChange={(v) => setOptimizeSource(v as OptimizeSource)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPTIMIZE_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bài gốc trong hệ thống</Label>
              <Select value={sourceContentId || "_"} onValueChange={onPickSource}>
                <SelectTrigger><SelectValue placeholder="— Không chọn —" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">— Không chọn —</SelectItem>
                  {publishedList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Tiêu đề bài cần tối ưu *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>URL bài cần tối ưu {sourceContentId ? "" : "*"}</Label>
              <Input value={oldLink} onChange={(e) => setOldLink(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={website?.name || ""} disabled />
            </div>
            <div>
              <Label>Thương hiệu</Label>
              <Input value={brand?.name || ""} disabled />
            </div>
            <div>
              <Label>Từ khóa chính</Label>
              <Input value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} />
            </div>
            <div>
              <Label>Từ khóa phụ</Label>
              <Input value={subKeywords} onChange={(e) => setSubKeywords(e.target.value)} placeholder="ngăn cách bằng dấu phẩy" />
            </div>
          </div>
        </div>

        {/* B. Yêu cầu tối ưu */}
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">B. Yêu cầu tối ưu</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Lý do tối ưu *</Label>
              <Select value={reason || "_"} onValueChange={(v) => setReason(v === "_" ? "" : (v as OptimizeReason))}>
                <SelectTrigger><SelectValue placeholder="Chọn lý do" /></SelectTrigger>
                <SelectContent>
                  {OPTIMIZE_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Hạng mục cần tối ưu</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {OPTIMIZE_TARGETS.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={targets.includes(t)} onCheckedChange={() => toggleTarget(t)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Ghi chú yêu cầu</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Link tài liệu tham khảo</Label>
              <Input value={refLink} onChange={(e) => setRefLink(e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* C. Theo dõi định kỳ */}
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">C. Theo dõi định kỳ sau lần tối ưu này</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center gap-3">
              <Switch checked={recurring} onCheckedChange={setRecurring} />
              <Label className="cursor-pointer" onClick={() => setRecurring(!recurring)}>
                Theo dõi tối ưu định kỳ sau lần này
              </Label>
            </div>
            {recurring && (
              <div>
                <Label>Chu kỳ</Label>
                <Select value={period} onValueChange={(v) => setPeriod(v as OptimizeRecurringPeriod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OPTIMIZE_RECURRING_PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button onClick={submit}>Tạo bài tối ưu</Button>
      </DialogFooter>
    </>
  );
}
