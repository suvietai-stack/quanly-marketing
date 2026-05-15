import { useMemo, useState } from "react";
import {
  useStore, fmtDate, uid,
  BACKLINK_TYPES, BACKLINK_STATUSES,
  type Backlink, type BacklinkType, type BacklinkStatus,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, ExternalLink, Pencil, Trash2, Link2 } from "lucide-react";

function TopicSelect({ websiteId, value, onChange }: { websiteId: string; value?: string; onChange: (v: string | undefined) => void }) {
  const list = useStore((st) => st.webTopics).filter((t) => t.websiteId === websiteId);
  if (list.length === 0) {
    return <div className="text-xs text-muted-foreground">Chưa có Topic. Hãy tạo tại tab <strong>Nghiên Cứu Keyword</strong>.</div>;
  }
  return (
    <Select value={value || "_"} onValueChange={(v) => onChange(v === "_" ? undefined : v)}>
      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="_">—</SelectItem>
        {list.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

const fmtMoney = (n?: number) =>
  n == null ? "—" : n.toLocaleString("vi-VN") + " đ";

export function BacklinksTab({ websiteId }: { websiteId: string }) {
  const s = useStore();
  const all = s.backlinks.filter((b) => b.websiteId === websiteId);
  const publishedContents = s.webContents.filter(
    (c) => c.websiteId === websiteId && c.publishedLink
  );

  const [editing, setEditing] = useState<Backlink | null>(null);
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [fTarget, setFTarget] = useState("all");
  const [fKeyword, setFKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quick, setQuick] = useState("all");

  const targetOptions = useMemo(
    () => Array.from(new Set([
      ...publishedContents.map((c) => c.publishedLink!),
      ...all.map((b) => b.targetUrl).filter(Boolean) as string[],
    ])),
    [publishedContents, all]
  );

  const filtered = all.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !b.name.toLowerCase().includes(q) &&
        !(b.sourceSite || "").toLowerCase().includes(q) &&
        !(b.anchorText || "").toLowerCase().includes(q)
      ) return false;
    }
    if (fStatus !== "all" && b.status !== fStatus) return false;
    if (fType !== "all" && b.type !== fType) return false;
    if (fTarget !== "all" && b.targetUrl !== fTarget) return false;
    if (fKeyword && !(b.keyword || "").toLowerCase().includes(fKeyword.toLowerCase())) return false;
    if (dateFrom && (!b.publishDate || b.publishDate < dateFrom)) return false;
    if (dateTo && (!b.publishDate || b.publishDate > dateTo)) return false;
    if (quick === "not_published" && (b.status === "Đã đăng" || b.status === "Đã kiểm tra link")) return false;
    if (quick === "published" && !(b.status === "Đã đăng" || b.status === "Đã kiểm tra link")) return false;
    if (quick === "not_checked" && b.status !== "Đã đăng") return false;
    if (quick === "broken" && b.status !== "Lỗi / mất link") return false;
    return true;
  });

  const counts = {
    all: all.length,
    not_published: all.filter((b) => b.status !== "Đã đăng" && b.status !== "Đã kiểm tra link").length,
    published: all.filter((b) => b.status === "Đã đăng" || b.status === "Đã kiểm tra link").length,
    not_checked: all.filter((b) => b.status === "Đã đăng").length,
    broken: all.filter((b) => b.status === "Lỗi / mất link").length,
  };

  const QF = ({ id, label, count }: { id: string; label: string; count: number }) => (
    <button
      onClick={() => setQuick(id)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        quick === id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
      }`}
    >
      {label} <span className={quick === id ? "opacity-80" : "text-muted-foreground"}>({count})</span>
    </button>
  );

  const totalCost = filtered.reduce((sum, b) => sum + (b.cost || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          <QF id="all" label="Tất cả" count={counts.all} />
          <QF id="not_published" label="Chưa đăng" count={counts.not_published} />
          <QF id="published" label="Đã đăng" count={counts.published} />
          <QF id="not_checked" label="Chưa kiểm tra link" count={counts.not_checked} />
          <QF id="broken" label="Lỗi / mất link" count={counts.broken} />
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Thêm backlink
        </Button>
      </div>

      <Card><CardContent className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <Input className="h-9" placeholder="Tìm tên / nguồn / anchor..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Trạng thái: Tất cả</SelectItem>
              {BACKLINK_STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fType} onValueChange={setFType}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Loại" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Loại: Tất cả</SelectItem>
              {BACKLINK_TYPES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fTarget} onValueChange={setFTarget}>
            <SelectTrigger className="h-9"><SelectValue placeholder="URL đích" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">URL đích: Tất cả</SelectItem>
              {targetOptions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input className="h-9" placeholder="Từ khóa..." value={fKeyword} onChange={(e) => setFKeyword(e.target.value)} />
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Đăng:</span>
            <Input className="h-9" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input className="h-9" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-3 py-2.5">Tên bài / backlink</th>
                <th className="text-left font-medium px-3 py-2.5">Website nguồn</th>
                <th className="text-left font-medium px-3 py-2.5">Loại</th>
                <th className="text-left font-medium px-3 py-2.5">URL đích</th>
                <th className="text-left font-medium px-3 py-2.5">Anchor</th>
                <th className="text-left font-medium px-3 py-2.5">Từ khóa</th>
                <th className="text-right font-medium px-3 py-2.5">Chi phí</th>
                <th className="text-left font-medium px-3 py-2.5">Ngày đăng</th>
                <th className="text-left font-medium px-3 py-2.5">Phụ trách</th>
                <th className="text-left font-medium px-3 py-2.5">Trạng thái</th>
                <th className="text-center font-medium px-3 py-2.5">Link</th>
                <th className="text-right font-medium px-3 py-2.5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">Không có backlink nào khớp bộ lọc.</td></tr>
              )}
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium max-w-[220px]">{b.name}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{b.sourceSite || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{b.type}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs max-w-[180px] truncate" title={b.targetUrl}>{b.targetUrl || "—"}</td>
                  <td className="px-3 py-2 text-xs">{b.anchorText || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{b.keyword || "—"}</td>
                  <td className="px-3 py-2 text-right text-xs">{fmtMoney(b.cost)}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{fmtDate(b.publishDate)}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{b.owner || "—"}</td>
                  <td className="px-3 py-2"><StatusBadge value={b.status} /></td>
                  <td className="px-3 py-2 text-center">
                    {b.publishedLink ? (
                      <a href={b.publishedLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center text-primary hover:underline" title="Mở link bài đã đăng">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground"><Link2 className="h-4 w-4 inline opacity-40" /></span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(b)} title="Sửa"><Pencil className="h-4 w-4" /></Button>
                    <Button
                      size="icon" variant="ghost"
                      onClick={() => { if (confirm(`Xóa backlink "${b.name}"?`)) s.remove("backlinks", b.id); }}
                      title="Xóa"
                    ><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-muted/30">
                <tr>
                  <td colSpan={6} className="px-3 py-2 text-xs text-muted-foreground text-right">Tổng chi phí ({filtered.length} backlink):</td>
                  <td className="px-3 py-2 text-right text-sm font-semibold">{fmtMoney(totalCost)}</td>
                  <td colSpan={5}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </CardContent></Card>

      <BacklinkDialog
        open={adding || !!editing}
        initial={editing}
        websiteId={websiteId}
        targetSuggestions={targetOptions}
        onClose={() => { setAdding(false); setEditing(null); }}
        onSave={(b) => {
          if (editing) s.update("backlinks", editing.id, b);
          else s.add("backlinks", { ...b, id: uid(), websiteId });
          setAdding(false); setEditing(null);
        }}
      />
    </div>
  );
}

function BacklinkDialog({
  open, initial, websiteId, targetSuggestions, onClose, onSave,
}: {
  open: boolean;
  initial: Backlink | null;
  websiteId: string;
  targetSuggestions: string[];
  onClose: () => void;
  onSave: (b: Backlink) => void;
}) {
  const empty: Backlink = {
    id: "", websiteId, name: "", type: "Bài PR báo chí", status: "Dự kiến",
  };
  const [form, setForm] = useState<Backlink>(initial || empty);
  const [targetMode, setTargetMode] = useState<"pick" | "manual">(
    initial?.targetUrl && !targetSuggestions.includes(initial.targetUrl) ? "manual" : "pick"
  );

  // Reset form when dialog opens with new data
  const key = (initial?.id || "new") + (open ? "-open" : "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    if (open) {
      setForm(initial || { ...empty });
      setTargetMode(initial?.targetUrl && !targetSuggestions.includes(initial.targetUrl) ? "manual" : "pick");
    }
  }, [key]);

  const set = <K extends keyof Backlink>(k: K, v: Backlink[K]) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Sửa backlink" : "Thêm backlink mới"}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Tên bài PR / backlink *">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Website nguồn">
            <Input value={form.sourceSite || ""} onChange={(e) => set("sourceSite", e.target.value)} placeholder="vd: dantri.com.vn" />
          </Field>

          <Field label="Link bài đã đăng">
            <Input value={form.publishedLink || ""} onChange={(e) => set("publishedLink", e.target.value)} placeholder="https://..." />
          </Field>

          <Field label="URL đích trỏ về">
            <div className="space-y-1.5">
              <div className="inline-flex rounded-md border bg-card p-0.5">
                <button type="button" onClick={() => setTargetMode("pick")} className={`px-2.5 py-1 text-xs rounded ${targetMode === "pick" ? "bg-secondary" : ""}`}>Chọn từ bài đã đăng</button>
                <button type="button" onClick={() => setTargetMode("manual")} className={`px-2.5 py-1 text-xs rounded ${targetMode === "manual" ? "bg-secondary" : ""}`}>Nhập thủ công</button>
              </div>
              {targetMode === "pick" ? (
                <Select value={form.targetUrl || ""} onValueChange={(v) => set("targetUrl", v)}>
                  <SelectTrigger><SelectValue placeholder="Chọn URL đích..." /></SelectTrigger>
                  <SelectContent>
                    {targetSuggestions.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">Chưa có bài đã đăng</div>}
                    {targetSuggestions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.targetUrl || ""} onChange={(e) => set("targetUrl", e.target.value)} placeholder="https://..." />
              )}
            </div>
          </Field>

          <Field label="Anchor text">
            <Input value={form.anchorText || ""} onChange={(e) => set("anchorText", e.target.value)} />
          </Field>
          <Field label="Từ khóa liên quan">
            <Input value={form.keyword || ""} onChange={(e) => set("keyword", e.target.value)} />
          </Field>
          <Field label="Topic (chọn từ tab Nghiên Cứu Keyword)" className="md:col-span-2">
            <TopicSelect websiteId={websiteId} value={form.topic} onChange={(v) => set("topic", v)} />
          </Field>

          <Field label="Loại backlink">
            <Select value={form.type} onValueChange={(v) => set("type", v as BacklinkType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BACKLINK_TYPES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Trạng thái">
            <Select value={form.status} onValueChange={(v) => set("status", v as BacklinkStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BACKLINK_STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Chi phí (VNĐ)">
            <Input type="number" value={form.cost ?? ""} onChange={(e) => set("cost", e.target.value === "" ? undefined : Number(e.target.value))} />
          </Field>
          <Field label="Ngày đăng">
            <Input type="date" value={form.publishDate || ""} onChange={(e) => set("publishDate", e.target.value)} />
          </Field>

          <Field label="Người phụ trách">
            <Input value={form.owner || ""} onChange={(e) => set("owner", e.target.value)} />
          </Field>

          <Field label="Ghi chú" className="md:col-span-2">
            <Textarea rows={3} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit} disabled={!form.name.trim()}>{initial ? "Lưu thay đổi" : "Thêm backlink"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
