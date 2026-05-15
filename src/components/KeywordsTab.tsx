import { useMemo, useState } from "react";
import {
  useStore, uid, fmtDate, todayISO,
  KEYWORD_TYPES, KEYWORD_RANK_STATUSES, SEARCH_INTENTS,
  type KeywordTrack, type KeywordRankStatus,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Pencil, Trash2, RefreshCw, ArrowUp, ArrowDown, Minus, ExternalLink } from "lucide-react";

function deriveStatus(cur?: number, prev?: number): KeywordRankStatus {
  if (cur == null || cur === 0) {
    if (prev != null && prev > 0) return "Mất top";
    return "Chưa check";
  }
  if (cur <= 3) return "Top 3";
  if (cur <= 10) return "Top 10";
  if (cur <= 20) return "Top 20";
  if (cur <= 50) return "Top 50";
  return "Ngoài top 50";
}

function RankChange({ cur, prev }: { cur?: number; prev?: number }) {
  if (cur == null || prev == null) return <span className="text-xs text-muted-foreground">—</span>;
  if (cur === 0 && prev > 0) return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><ArrowDown className="h-3 w-3" />Mất top</span>;
  if (cur === prev) return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3 w-3" />Không đổi</span>;
  // Lower number = better rank
  if (cur < prev) return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><ArrowUp className="h-3 w-3" />Tăng +{prev - cur}</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><ArrowDown className="h-3 w-3" />Giảm -{cur - prev}</span>;
}

export function KeywordsTab({ websiteId }: { websiteId: string }) {
  const s = useStore();
  const list = s.keywords.filter((k) => k.websiteId === websiteId);
  const publishedContents = s.webContents.filter((c) => c.websiteId === websiteId && c.publishedLink);

  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [fTopic, setFTopic] = useState("all");
  const [quick, setQuick] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<KeywordTrack | null>(null);
  const [updating, setUpdating] = useState<KeywordTrack | null>(null);

  const owners = Array.from(new Set(list.map((k) => k.owner).filter(Boolean))) as string[];
  const topics = Array.from(new Set(list.map((k) => k.topic).filter(Boolean))) as string[];

  const filtered = useMemo(() => list.filter((k) => {
    if (search && !k.keyword.toLowerCase().includes(search.toLowerCase())) return false;
    if (fStatus !== "all" && k.status !== fStatus) return false;
    if (fOwner !== "all" && k.owner !== fOwner) return false;
    if (fTopic !== "all" && k.topic !== fTopic) return false;
    if (quick === "top3" && (k.currentTop == null || k.currentTop > 3 || k.currentTop === 0)) return false;
    if (quick === "top10" && (k.currentTop == null || k.currentTop > 10 || k.currentTop === 0)) return false;
    if (quick === "up" && k.status !== "Tăng hạng" && !(k.currentTop != null && k.previousTop != null && k.currentTop > 0 && k.currentTop < k.previousTop)) return false;
    if (quick === "down" && k.status !== "Tụt hạng" && !(k.currentTop != null && k.previousTop != null && k.currentTop > k.previousTop)) return false;
    if (quick === "lost" && k.status !== "Mất top") return false;
    if (quick === "unchecked" && k.status !== "Chưa check") return false;
    return true;
  }), [list, search, fStatus, fOwner, fTopic, quick]);

  const QF = ({ id, label, count }: { id: string; label: string; count: number }) => (
    <button
      onClick={() => setQuick(id)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${quick === id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
    >
      {label} <span className={quick === id ? "opacity-80" : "text-muted-foreground"}>({count})</span>
    </button>
  );

  const counts = {
    all: list.length,
    top3: list.filter((k) => k.currentTop != null && k.currentTop > 0 && k.currentTop <= 3).length,
    top10: list.filter((k) => k.currentTop != null && k.currentTop > 0 && k.currentTop <= 10).length,
    up: list.filter((k) => k.currentTop != null && k.previousTop != null && k.currentTop > 0 && k.currentTop < k.previousTop).length,
    down: list.filter((k) => k.currentTop != null && k.previousTop != null && k.currentTop > k.previousTop).length,
    lost: list.filter((k) => k.status === "Mất top").length,
    unchecked: list.filter((k) => k.status === "Chưa check").length,
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <QF id="all" label="Tất cả" count={counts.all} />
        <QF id="top3" label="Top 3" count={counts.top3} />
        <QF id="top10" label="Top 10" count={counts.top10} />
        <QF id="up" label="Tăng hạng" count={counts.up} />
        <QF id="down" label="Tụt hạng" count={counts.down} />
        <QF id="lost" label="Mất top" count={counts.lost} />
        <QF id="unchecked" label="Chưa check" count={counts.unchecked} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-xs" placeholder="Tìm từ khóa..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {KEYWORD_RANK_STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fOwner} onValueChange={setFOwner}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Người phụ trách" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phụ trách</SelectItem>
            {owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        {topics.length > 0 && (
          <Select value={fTopic} onValueChange={setFTopic}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Topic" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả topic</SelectItem>
              {topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild><Button className="ml-auto"><Plus className="h-4 w-4" />Thêm từ khóa</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Thêm từ khóa</DialogTitle></DialogHeader>
            <KeywordForm
              websiteId={websiteId}
              publishedContents={publishedContents}
              onSubmit={(k) => { s.add("keywords", k); setAdding(false); }}
              onClose={() => setAdding(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Từ khóa</th>
                <th className="text-left font-medium px-4 py-2.5">Topic</th>
                <th className="text-left font-medium px-4 py-2.5">URL đích</th>
                <th className="text-center font-medium px-4 py-2.5">TOP hiện tại</th>
                <th className="text-center font-medium px-4 py-2.5">TOP kỳ trước</th>
                <th className="text-left font-medium px-4 py-2.5">Thay đổi</th>
                <th className="text-left font-medium px-4 py-2.5">Ngày check</th>
                <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                <th className="text-left font-medium px-4 py-2.5">Phụ trách</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">Chưa có từ khóa nào.</td></tr>}
              {filtered.map((k) => (
                <tr key={k.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">
                    {k.keyword}
                    {k.plan && <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">[{k.plan}]</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{k.topic || "—"}</td>
                  <td className="px-4 py-2.5 max-w-[220px] truncate">
                    {k.targetUrl ? (
                      <a href={k.targetUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                        {k.targetUrl.replace(/^https?:\/\//, "").slice(0, 32)} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center font-semibold">{k.currentTop ?? "—"}</td>
                  <td className="px-4 py-2.5 text-center text-muted-foreground">{k.previousTop ?? "—"}</td>
                  <td className="px-4 py-2.5"><RankChange cur={k.currentTop} prev={k.previousTop} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{fmtDate(k.lastCheckDate)}</td>
                  <td className="px-4 py-2.5"><StatusBadge value={k.status} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{k.owner || "—"}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <Button size="sm" variant="outline" onClick={() => setUpdating(k)}><RefreshCw className="h-3.5 w-3.5" />Cập nhật TOP</Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(k)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Xóa "${k.keyword}"?`)) s.remove("keywords", k.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa từ khóa</DialogTitle></DialogHeader>
          {editing && (
            <KeywordForm
              websiteId={websiteId}
              publishedContents={publishedContents}
              initial={editing}
              onSubmit={(k) => { s.update("keywords", editing.id, k); setEditing(null); }}
              onClose={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Update TOP dialog */}
      <Dialog open={!!updating} onOpenChange={(o) => !o && setUpdating(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Cập nhật TOP</DialogTitle></DialogHeader>
          {updating && <UpdateTopForm initial={updating} onSubmit={(patch) => { s.update("keywords", updating.id, patch); setUpdating(null); }} onClose={() => setUpdating(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UpdateTopForm({
  initial, onSubmit, onClose,
}: {
  initial: KeywordTrack;
  onSubmit: (patch: Partial<KeywordTrack>) => void;
  onClose: () => void;
}) {
  const [cur, setCur] = useState<string>(initial.currentTop?.toString() || "");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState(initial.notes || "");

  const submit = () => {
    const newCur = cur === "" ? undefined : Math.max(0, parseInt(cur, 10) || 0);
    const prev = initial.currentTop;
    const status = deriveStatus(newCur, prev);
    // Tăng/Tụt overrides if changed
    let finalStatus: KeywordRankStatus = status;
    if (newCur != null && prev != null && newCur > 0 && prev > 0) {
      if (newCur < prev) finalStatus = "Tăng hạng";
      else if (newCur > prev) finalStatus = "Tụt hạng";
    }
    onSubmit({ currentTop: newCur, previousTop: prev, lastCheckDate: date, status: finalStatus, notes: note });
  };

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <div className="text-muted-foreground">Từ khóa</div>
        <div className="font-medium">{initial.keyword}</div>
      </div>
      <div className="text-xs text-muted-foreground">TOP hiện tại lưu: <span className="font-semibold text-foreground">{initial.currentTop ?? "—"}</span> sẽ chuyển sang TOP kỳ trước.</div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="TOP mới"><Input type="number" min={0} value={cur} onChange={(e) => setCur(e.target.value)} placeholder="0 = mất top" /></Field>
        <Field label="Ngày check"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      </div>
      <Field label="Ghi chú"><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button onClick={submit}>Lưu</Button>
      </DialogFooter>
    </div>
  );
}

function KeywordForm({
  websiteId, publishedContents, initial, onSubmit, onClose,
}: {
  websiteId: string;
  publishedContents: { id: string; title: string; publishedLink?: string }[];
  initial?: Partial<KeywordTrack>;
  onSubmit: (k: KeywordTrack) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState<KeywordTrack>({
    id: initial?.id || uid(),
    websiteId,
    keyword: initial?.keyword || "",
    topic: initial?.topic || "",
    targetUrl: initial?.targetUrl || "",
    type: initial?.type || "Từ khóa chính",
    searchIntent: initial?.searchIntent,
    owner: initial?.owner || "",
    lastCheckDate: initial?.lastCheckDate,
    currentTop: initial?.currentTop,
    previousTop: initial?.previousTop,
    status: initial?.status || "Chưa check",
    notes: initial?.notes || "",
    plan: initial?.plan || "",
  });
  const set = (k: keyof KeywordTrack, val: any) => setV({ ...v, [k]: val });

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Từ khóa *" className="sm:col-span-2"><Input value={v.keyword} onChange={(e) => set("keyword", e.target.value)} /></Field>
        <Field label="Topic / Nhóm chủ đề"><Input value={v.topic} onChange={(e) => set("topic", e.target.value)} /></Field>
        <Field label="Loại từ khóa">
          <Select value={v.type} onValueChange={(x) => set("type", x)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{KEYWORD_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="URL đích" className="sm:col-span-2">
          <div className="space-y-1.5">
            <Input value={v.targetUrl} onChange={(e) => set("targetUrl", e.target.value)} placeholder="https://..." />
            {publishedContents.length > 0 && (
              <Select value="" onValueChange={(x) => set("targetUrl", x)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Hoặc chọn từ bài đã đăng..." /></SelectTrigger>
                <SelectContent>
                  {publishedContents.map((c) => (
                    <SelectItem key={c.id} value={c.publishedLink!}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </Field>
        <Field label="Search intent">
          <Select value={v.searchIntent || ""} onValueChange={(x) => set("searchIntent", x)}>
            <SelectTrigger><SelectValue placeholder="Chọn intent" /></SelectTrigger>
            <SelectContent>{SEARCH_INTENTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Người phụ trách"><Input value={v.owner} onChange={(e) => set("owner", e.target.value)} /></Field>
        <Field label="TOP hiện tại"><Input type="number" min={0} value={v.currentTop ?? ""} onChange={(e) => set("currentTop", e.target.value === "" ? undefined : parseInt(e.target.value, 10))} /></Field>
        <Field label="TOP kỳ trước"><Input type="number" min={0} value={v.previousTop ?? ""} onChange={(e) => set("previousTop", e.target.value === "" ? undefined : parseInt(e.target.value, 10))} /></Field>
        <Field label="Ngày check"><Input type="date" value={v.lastCheckDate || ""} onChange={(e) => set("lastCheckDate", e.target.value)} /></Field>
        <Field label="Trạng thái">
          <Select value={v.status} onValueChange={(x) => set("status", x)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{KEYWORD_RANK_STATUSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Plan liên quan"><Input value={v.plan} onChange={(e) => set("plan", e.target.value)} /></Field>
        <Field label="Ghi chú" className="sm:col-span-2"><Textarea value={v.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button onClick={() => { if (!v.keyword.trim()) return; onSubmit(v); }}>Lưu</Button>
      </DialogFooter>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className || ""}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
