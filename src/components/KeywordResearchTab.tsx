import { useEffect, useState } from "react";
import { useStore, uid, fmtDate, todayISO, type WebTopic } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink, Search } from "lucide-react";

export function KeywordResearchTab({ websiteId }: { websiteId: string }) {
  const s = useStore();
  const list = s.webTopics.filter((t) => t.websiteId === websiteId);

  const [editing, setEditing] = useState<WebTopic | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = list.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.mainKeyword || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground">
          Tab nguồn quản lý <strong>Topic</strong> cho dự án web. Các tab khác (Sản xuất Content, Bài đã đăng,
          Backlink, Check TOP, Tối ưu lại) sẽ chọn Topic từ danh sách này.
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Thêm Topic
        </Button>
      </div>

      <Card><CardContent className="p-3">
        <div className="relative max-w-sm">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Tìm Topic / từ khóa chủ đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-3 py-2.5 w-[28%]">Topic</th>
                <th className="text-left font-medium px-3 py-2.5 w-[28%]">Từ khóa chủ đề</th>
                <th className="text-left font-medium px-3 py-2.5">Link Sheet</th>
                <th className="text-left font-medium px-3 py-2.5 whitespace-nowrap">Ngày cập nhật</th>
                <th className="text-right font-medium px-3 py-2.5 w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Chưa có Topic nào. Bấm <strong>Thêm Topic</strong> để tạo Topic đầu tiên cho dự án web này.
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-medium">{t.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{t.mainKeyword || "—"}</td>
                  <td className="px-3 py-2.5">
                    {t.sheetLink ? (
                      <a href={t.sheetLink} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                        Mở Sheet <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{fmtDate(t.updatedAt)}</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(t)} title="Sửa">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      onClick={() => {
                        if (confirm(`Xóa Topic "${t.name}"?\nLưu ý: các bài content / backlink đang dùng topic này sẽ vẫn giữ tên topic cũ.`))
                          s.remove("webTopics", t.id);
                      }}
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      <TopicDialog
        open={adding || !!editing}
        initial={editing}
        websiteId={websiteId}
        onClose={() => { setAdding(false); setEditing(null); }}
        onSave={(t) => {
          if (editing) s.update("webTopics", editing.id, t);
          else s.add("webTopics", { ...t, id: uid(), websiteId });
          setAdding(false); setEditing(null);
        }}
      />
    </div>
  );
}

export function TopicDialog({
  open, initial, websiteId, onClose, onSave,
}: {
  open: boolean;
  initial: WebTopic | null;
  websiteId: string;
  onClose: () => void;
  onSave: (t: WebTopic) => void;
}) {
  const empty: WebTopic = {
    id: "", websiteId, name: "", mainKeyword: "", sheetLink: "", updatedAt: todayISO(),
  };
  const [form, setForm] = useState<WebTopic>(initial || empty);
  useEffect(() => {
    if (open) setForm(initial || { ...empty, updatedAt: todayISO() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);
  const set = <K extends keyof WebTopic>(k: K, v: WebTopic[K]) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Sửa Topic" : "Thêm Topic mới"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Topic *</label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="vd: Tượng Phật gốm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Từ khóa chủ đề</label>
            <Input value={form.mainKeyword || ""} onChange={(e) => set("mainKeyword", e.target.value)} placeholder="vd: tượng Phật gốm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Link Sheet</label>
            <Input value={form.sheetLink || ""} onChange={(e) => set("sheetLink", e.target.value)} placeholder="https://docs.google.com/spreadsheets/..." />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Ngày cập nhật</label>
            <Input type="date" value={form.updatedAt || ""} onChange={(e) => set("updatedAt", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Ghi chú</label>
            <Textarea rows={2} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            disabled={!form.name.trim()}
            onClick={() => onSave({ ...form, updatedAt: form.updatedAt || todayISO() })}
          >
            {initial ? "Lưu thay đổi" : "Thêm Topic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
