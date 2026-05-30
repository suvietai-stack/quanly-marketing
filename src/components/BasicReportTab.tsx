import { useMemo, useState } from "react";
import {
  useStore, fmtDate, isActiveKeywordTrack,
  type WebContent, type ContentStatus, type Backlink, type KeywordTrack,
} from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, FileEdit, Eye, Wrench, Send, CheckCircle2, ListChecks,
  Search, Share2, Link as LinkIcon, TrendingUp, TrendingDown,
  AlertTriangle, ExternalLink, Trophy, Activity, Settings2, AlertCircle,
} from "lucide-react";
import { GrowthSummary } from "@/components/GrowthTab";

type DateRange = { from?: string; to?: string };
type Quick = "all" | "week" | "month" | "custom";

const PRODUCING: ContentStatus[] = ["Đã giao", "Đang làm outline", "Outline đã duyệt", "Đang viết bài", "Đang trình bày nháp web"];
const REVIEW: ContentStatus[] = ["Chờ duyệt outline", "Chờ duyệt bài", "Chờ duyệt bản nháp web"];
const FIX: ContentStatus[] = ["Cần sửa outline", "Cần sửa bài", "Cần sửa bản nháp web"];
const WAIT_PUBLISH: ContentStatus[] = ["Bài viết đã duyệt", "Bản nháp web đã duyệt", "Chờ đăng web"];
const PUBLISHED_LIKE: ContentStatus[] = ["Đã đăng web", "Kiểm tra index", "Hoàn thành"];

// Optimize-only workflow buckets (loại trừ "Đã hủy" khỏi mọi cảnh báo & thống kê)
const OPT_OPEN: ContentStatus[] = ["Đã tạo", "Đã giao", "Đang tối ưu", "Chờ duyệt tối ưu", "Cần sửa tối ưu", "Đã duyệt tối ưu"];
const OPT_DOING: ContentStatus[] = ["Đã giao", "Đang tối ưu"];
const isOptimize = (c: WebContent) => c.type === "Bài tối ưu lại";

function startOfWeek(): Date {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday-based
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}
function startOfMonth(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}
function toISO(d: Date) { return d.toISOString().slice(0, 10); }

function inRange(iso: string | undefined, range: DateRange): boolean {
  if (!iso) return false;
  if (range.from && iso < range.from) return false;
  if (range.to && iso > range.to) return false;
  return true;
}

function StatCard({
  icon: Icon, label, value, accent = "default", hint,
}: {
  icon: any; label: string; value: number | string;
  accent?: "default" | "success" | "warning" | "info" | "danger";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-[oklch(0.45_0.13_75)]",
    info: "bg-info/15 text-info",
    danger: "bg-destructive/15 text-destructive",
  };
  return (
    <Card>
      <CardContent className="p-3.5 flex items-start gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${tones[accent]}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold leading-tight mt-0.5">{value}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">{children}</h3>;
}

export function BasicReportTab({
  websiteId,
  onOpenContent,
  onJumpTab,
}: {
  websiteId: string;
  onOpenContent?: (c: WebContent) => void;
  onJumpTab?: (tab: "seo" | "keywords" | "backlinks" | "published" | "content" | "growth") => void;
}) {
  const s = useStore();
  const contents = s.webContents.filter((c) => c.websiteId === websiteId);
  const checks = s.seoChecks.filter((c) => c.websiteId === websiteId);
  const backlinks = s.backlinks.filter((b) => b.websiteId === websiteId);
  const keywords = s.keywords.filter((k) => k.websiteId === websiteId && isActiveKeywordTrack(k, s.webContents));

  const [quick, setQuick] = useState<Quick>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [allOpen, setAllOpen] = useState(false);
  const [aSearch, setASearch] = useState("");
  const [aQuick, setAQuick] = useState<string>("Tất cả");
  const [aType, setAType] = useState<string>("all");
  const [aOwner, setAOwner] = useState<string>("all");
  const [aLevel, setALevel] = useState<string>("all");

  const range: DateRange = useMemo(() => {
    const today = toISO(new Date());
    if (quick === "week") return { from: toISO(startOfWeek()), to: today };
    if (quick === "month") return { from: toISO(startOfMonth()), to: today };
    if (quick === "custom") return { from: from || undefined, to: to || undefined };
    return {};
  }, [quick, from, to]);

  const hasRange = !!(range.from || range.to);

  // A content matches range if any of its dated fields fall inside.
  const contentInRange = (c: WebContent) => {
    if (!hasRange) return true;
    return [c.deadline, c.publishedAt, c.publishDate, c.completedAt]
      .some((d) => d && inRange(d, range));
  };
  const backlinkInRange = (b: Backlink) => !hasRange || inRange(b.publishDate, range);
  const keywordInRange = (k: KeywordTrack) => !hasRange || inRange(k.lastCheckDate, range);

  const fc = contents.filter(contentInRange);
  const fb = backlinks.filter(backlinkInRange);
  const fk = keywords.filter(keywordInRange);

  // ---- Content metrics ----
  const cnt = (arr: WebContent[], pred: (c: WebContent) => boolean) => arr.filter(pred).length;
  const contentStats = {
    total: fc.length,
    producing: cnt(fc, (c) => PRODUCING.includes(c.status)),
    reviewOutline: cnt(fc, (c) => c.status === "Chờ duyệt outline"),
    reviewDraft: cnt(fc, (c) => c.status === "Chờ duyệt bài"),
    fix: cnt(fc, (c) => FIX.includes(c.status)),
    waitPublish: cnt(fc, (c) => WAIT_PUBLISH.includes(c.status)),
    published: cnt(fc, (c) => PUBLISHED_LIKE.includes(c.status)),
    done: cnt(fc, (c) => c.status === "Hoàn thành"),
  };

  // ---- Optimize content metrics (loại Đã hủy) ----
  const todayISO0 = toISO(new Date());
  const optAll = fc.filter((c) => isOptimize(c) && c.status !== "Đã hủy");
  const optStats = {
    waitingAssign: cnt(optAll, (c) => c.status === "Đã tạo"),
    doing: cnt(optAll, (c) => OPT_DOING.includes(c.status)),
    pendingReview: cnt(optAll, (c) => c.status === "Chờ duyệt tối ưu"),
    needFix: cnt(optAll, (c) => c.status === "Cần sửa tối ưu"),
    overdue: cnt(optAll, (c) =>
      OPT_OPEN.includes(c.status) && !!c.deadline && c.deadline < todayISO0,
    ),
  };



  // ---- Index & share ----
  const publishedList = fc.filter((c) => !!c.publishedLink || PUBLISHED_LIKE.includes(c.status));
  const indexStats = {
    published: publishedList.length,
    indexed: publishedList.filter((c) => c.indexStatus === "Đã index").length,
    notIndexed: publishedList.filter((c) => c.indexStatus === "Chưa index").length,
    notChecked: publishedList.filter((c) => c.indexStatus === "Chưa kiểm tra").length,
    indexedNotShared: publishedList.filter((c) => c.indexStatus === "Đã index" && !c.shareSocial).length,
    shared: publishedList.filter((c) => !!c.shareSocial).length,
  };

  // ---- Technical SEO (no date filter) ----
  const seoTotal = checks.length;
  const seoDone = checks.filter((c) => c.done).length;
  const seoPct = seoTotal ? Math.round((seoDone / seoTotal) * 100) : 0;

  // ---- Backlinks ----
  const blStats = {
    total: fb.length,
    posted: fb.filter((b) => b.status === "Đã đăng" || b.status === "Đã kiểm tra link").length,
    notPosted: fb.filter((b) => b.status === "Dự kiến" || b.status === "Đã đặt").length,
    checked: fb.filter((b) => b.status === "Đã kiểm tra link").length,
    broken: fb.filter((b) => b.status === "Lỗi / mất link").length,
  };

  // ---- Keywords ----
  const main = fk.filter((k) => k.isMain);
  const sub = fk.filter((k) => !k.isMain);
  const kwStats = {
    main: main.length,
    sub: sub.length,
    top3: fk.filter((k) => k.currentTop != null && k.currentTop > 0 && k.currentTop <= 3).length,
    top10: fk.filter((k) => k.currentTop != null && k.currentTop > 0 && k.currentTop <= 10).length,
    up: fk.filter((k) => (k.currentTop ?? 0) > 0 && (k.previousTop ?? 0) > 0 && (k.currentTop! < k.previousTop!)).length,
    down: fk.filter((k) => (k.currentTop ?? 0) > 0 && (k.previousTop ?? 0) > 0 && (k.currentTop! > k.previousTop!)).length,
    lost: fk.filter((k) => k.status === "Mất top").length,
    unchecked: fk.filter((k) => k.status === "Chưa check" || k.currentTop == null).length,
  };

  // ---- Attention rows ----
  const today = toISO(new Date());
  type AttentionSource = "Sản xuất Content" | "Bài đã đăng / Index" | "Backlink / PR" | "Check TOP từ khóa" | "Technical SEO" | "Tối ưu lại Content";
  type AttentionRow = {
    type: string;
    severity: "warn" | "danger" | "info";
    source: AttentionSource;
    content: string;
    owner?: string;
    date?: string;
    status?: string;
    action?: { label: string; onClick: () => void };
  };
  const attention: AttentionRow[] = [];
  fc.forEach((c) => {
    const owner = c.writer || c.publisher || c.assigner;
    const open = () => onOpenContent?.(c);
    // Bỏ qua hoàn toàn item đã hủy
    if (c.status === "Đã hủy") return;
    // Việc tối ưu lại Content — cảnh báo riêng, không trộn với Sản xuất Content
    if (isOptimize(c)) {
      if (c.status === "Đã tạo" && !c.writer)
        attention.push({ type: "Tối ưu chưa phân công", severity: "warn", source: "Tối ưu lại Content", content: c.title, owner: undefined, date: c.deadline, status: c.status, action: { label: "Mở việc tối ưu", onClick: open } });
      if (c.deadline && c.deadline < today && OPT_OPEN.includes(c.status))
        attention.push({ type: "Tối ưu quá hạn", severity: "danger", source: "Tối ưu lại Content", content: c.title, owner, date: c.deadline, status: c.status, action: { label: "Mở việc tối ưu", onClick: open } });
      if (c.status === "Chờ duyệt tối ưu")
        attention.push({ type: "Tối ưu chờ duyệt", severity: "warn", source: "Tối ưu lại Content", content: c.title, owner: c.optimizeReviewer || owner, date: c.deadline, status: c.status, action: { label: "Mở việc tối ưu", onClick: open } });
      if (c.status === "Cần sửa tối ưu")
        attention.push({ type: "Tối ưu cần sửa", severity: "warn", source: "Tối ưu lại Content", content: c.title, owner, date: c.deadline, status: c.status, action: { label: "Mở việc tối ưu", onClick: open } });
      return;
    }
    if (c.deadline && c.deadline < today && !PUBLISHED_LIKE.includes(c.status))
      attention.push({ type: "Quá deadline", severity: "danger", source: "Sản xuất Content", content: c.title, owner, date: c.deadline, status: c.status, action: { label: "Mở content", onClick: open } });
    if (c.status === "Chờ duyệt outline")
      attention.push({ type: "Chờ duyệt outline", severity: "warn", source: "Sản xuất Content", content: c.title, owner: c.outlineReviewer || owner, date: c.outlineDeadline, status: c.status, action: { label: "Mở content", onClick: open } });
    if (c.status === "Chờ duyệt bài")
      attention.push({ type: "Chờ duyệt bài", severity: "warn", source: "Sản xuất Content", content: c.title, owner: c.draftReviewer || owner, date: c.deadline, status: c.status, action: { label: "Mở content", onClick: open } });
    if (FIX.includes(c.status))
      attention.push({ type: "Cần sửa", severity: "warn", source: "Sản xuất Content", content: c.title, owner, date: c.deadline, status: c.status, action: { label: "Mở content", onClick: open } });
    if ((c.publishedLink || PUBLISHED_LIKE.includes(c.status)) && c.indexStatus === "Chưa kiểm tra")
      attention.push({ type: "Chưa kiểm tra index", severity: "info", source: "Bài đã đăng / Index", content: c.title, owner: c.publisher || owner, date: c.publishedAt, status: c.indexStatus, action: { label: "Mở content", onClick: open } });
    if (c.indexStatus === "Đã index" && !c.shareSocial)
      attention.push({ type: "Index — chưa share social", severity: "info", source: "Bài đã đăng / Index", content: c.title, owner: c.publisher || owner, date: c.publishedAt, status: "Chưa share", action: { label: "Mở content", onClick: open } });
  });
  fk.forEach((k) => {
    if (k.status === "Tụt hạng")
      attention.push({ type: "Từ khóa tụt hạng", severity: "warn", source: "Check TOP từ khóa", content: k.keyword, owner: k.owner, date: k.lastCheckDate, status: `${k.previousTop ?? "?"} → ${k.currentTop ?? "?"}`, action: { label: "Mở Check TOP", onClick: () => onJumpTab?.("keywords") } });
    if (k.status === "Mất top")
      attention.push({ type: "Từ khóa mất top", severity: "danger", source: "Check TOP từ khóa", content: k.keyword, owner: k.owner, date: k.lastCheckDate, status: "Mất top", action: { label: "Mở Check TOP", onClick: () => onJumpTab?.("keywords") } });
  });
  fb.forEach((b) => {
    if (b.status === "Lỗi / mất link")
      attention.push({ type: "Backlink lỗi", severity: "danger", source: "Backlink / PR", content: b.name, owner: b.owner, date: b.publishDate, status: b.status, action: { label: "Mở Backlink", onClick: () => onJumpTab?.("backlinks") } });
  });
  if (seoTotal && seoDone < seoTotal) {
    attention.push({
      type: "Technical SEO chưa xong",
      severity: "info",
      source: "Technical SEO",
      content: `Còn ${seoTotal - seoDone}/${seoTotal} mục checklist chưa hoàn thành`,
      status: `${seoPct}%`,
      action: { label: "Mở Technical SEO", onClick: () => onJumpTab?.("seo") },
    });
  }

  // Priority order: lost rank > backlink broken > overdue > fix > pending review > index/no share > seo
  const typePriority: Record<string, number> = {
    "Từ khóa mất top": 1,
    "Backlink lỗi": 2,
    "Quá deadline": 3,
    "Cần sửa": 4,
    "Chờ duyệt outline": 5,
    "Chờ duyệt bài": 5,
    "Từ khóa tụt hạng": 6,
    "Index — chưa share social": 7,
    "Chưa kiểm tra index": 8,
    "Technical SEO chưa xong": 9,
  };
  const sevWeight = { danger: 0, warn: 1, info: 2 } as const;
  attention.sort((a, b) => {
    const sv = sevWeight[a.severity] - sevWeight[b.severity];
    if (sv !== 0) return sv;
    return (typePriority[a.type] ?? 99) - (typePriority[b.type] ?? 99);
  });
  const levelOf = (s: AttentionRow["severity"]) =>
    s === "danger" ? "Cao" : s === "warn" ? "Trung bình" : "Thấp";


  // ---- By owner ----
  const owners = Array.from(new Set(fc.map((c) => c.writer || c.publisher || c.assigner).filter(Boolean))) as string[];
  const ownerRows = owners.map((o) => {
    const mine = fc.filter((c) => (c.writer || c.publisher || c.assigner) === o);
    return {
      owner: o,
      assigned: mine.length,
      doing: mine.filter((c) => PRODUCING.includes(c.status)).length,
      review: mine.filter((c) => REVIEW.includes(c.status)).length,
      fix: mine.filter((c) => FIX.includes(c.status)).length,
      published: mine.filter((c) => PUBLISHED_LIKE.includes(c.status)).length,
      done: mine.filter((c) => c.status === "Hoàn thành").length,
      late: mine.filter((c) => c.deadline && c.deadline < today && !PUBLISHED_LIKE.includes(c.status)).length,
    };
  }).sort((a, b) => b.assigned - a.assigned);

  // ---- Render ----
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border bg-card p-0.5">
            {([
              ["all", "Tất cả"], ["week", "Tuần này"], ["month", "Tháng này"], ["custom", "Tùy chọn"],
            ] as [Quick, string][]).map(([id, label]) => (
              <Button key={id} size="sm" variant={quick === id ? "secondary" : "ghost"} onClick={() => setQuick(id)}>{label}</Button>
            ))}
          </div>
          {quick === "custom" && (
            <>
              <Input type="date" className="w-[150px]" value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-muted-foreground text-xs">đến</span>
              <Input type="date" className="w-[150px]" value={to} onChange={(e) => setTo(e.target.value)} />
            </>
          )}
          {hasRange && (
            <div className="text-xs text-muted-foreground ml-auto">
              Áp dụng cho ngày: {range.from || "—"} → {range.to || "—"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attention — summary only */}
      {attention.length > 0 && (() => {
        const summary = attention.slice(0, 6);
        const owners2 = Array.from(new Set(attention.map((a) => a.owner).filter(Boolean))) as string[];
        const types2 = Array.from(new Set(attention.map((a) => a.type)));
        const QUICKS = ["Tất cả", "Content", "Index / Share Social", "Check TOP", "Backlink", "Technical SEO", "Quá hạn", "Nghiêm trọng"];
        const matchesQuick = (a: AttentionRow) => {
          switch (aQuick) {
            case "Content": return a.source === "Sản xuất Content";
            case "Index / Share Social": return a.source === "Bài đã đăng / Index";
            case "Check TOP": return a.source === "Check TOP từ khóa";
            case "Backlink": return a.source === "Backlink / PR";
            case "Technical SEO": return a.source === "Technical SEO";
            case "Quá hạn": return a.type === "Quá deadline";
            case "Nghiêm trọng": return a.severity === "danger";
            default: return true;
          }
        };
        const filtered = attention.filter((a) => {
          if (!matchesQuick(a)) return false;
          if (aType !== "all" && a.type !== aType) return false;
          if (aOwner !== "all" && a.owner !== aOwner) return false;
          if (aLevel !== "all" && levelOf(a.severity) !== aLevel) return false;
          if (aSearch && !`${a.content} ${a.type}`.toLowerCase().includes(aSearch.toLowerCase())) return false;
          return true;
        });
        const toneOf = (s: AttentionRow["severity"]) =>
          s === "danger" ? "text-destructive" :
          s === "warn" ? "text-[oklch(0.45_0.13_75)]" : "text-info";
        const levelBadge = (s: AttentionRow["severity"]) => {
          const lvl = levelOf(s);
          const cls =
            s === "danger" ? "bg-destructive/15 text-destructive border-destructive/30" :
            s === "warn" ? "bg-warning/15 text-[oklch(0.45_0.13_75)] border-warning/40" :
                          "bg-muted text-muted-foreground border-border";
          return <Badge variant="outline" className={cls}>{lvl}</Badge>;
        };
        return (
          <>
            <Card className="border-warning/40">
              <CardContent className="p-0">
                <div className="px-4 py-2.5 border-b bg-warning/10 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[oklch(0.45_0.13_75)]" />
                  <h3 className="text-sm font-semibold">Việc cần chú ý</h3>
                  <Badge variant="outline" className="ml-1">{attention.length}</Badge>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setAllOpen(true)}>
                    Xem tất cả <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground bg-muted/30">
                      <tr>
                        <th className="text-left font-medium px-3 py-2">Loại</th>
                        <th className="text-left font-medium px-3 py-2">Nội dung</th>
                        <th className="text-left font-medium px-3 py-2">Phụ trách</th>
                        <th className="text-left font-medium px-3 py-2">Ngày</th>
                        <th className="text-left font-medium px-3 py-2">Trạng thái</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {summary.map((a, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className={`px-3 py-2 font-medium whitespace-nowrap ${toneOf(a.severity)}`}>{a.type}</td>
                          <td className="px-3 py-2">{a.content}</td>
                          <td className="px-3 py-2 text-muted-foreground">{a.owner || "—"}</td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">{fmtDate(a.date)}</td>
                          <td className="px-3 py-2">{a.status ? <StatusBadge value={a.status} /> : "—"}</td>
                          <td className="px-3 py-2 text-right">
                            {a.action && <Button size="sm" variant="ghost" onClick={a.action.onClick}>{a.action.label} <ExternalLink className="h-3 w-3" /></Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {attention.length > summary.length && (
                    <div className="px-3 py-2 border-t bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
                      <span>Còn {attention.length - summary.length} cảnh báo khác</span>
                      <Button size="sm" variant="link" className="h-auto p-0" onClick={() => setAllOpen(true)}>Xem tất cả →</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Sheet open={allOpen} onOpenChange={setAllOpen}>
              <SheetContent side="right" className="w-full sm:max-w-3xl lg:max-w-5xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[oklch(0.45_0.13_75)]" />
                    Tất cả việc cần chú ý
                    <Badge variant="outline">{filtered.length}/{attention.length}</Badge>
                  </SheetTitle>
                  <SheetDescription>Toàn bộ cảnh báo của website hiện tại.</SheetDescription>
                </SheetHeader>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {QUICKS.map((q) => (
                    <Button key={q} size="sm" variant={aQuick === q ? "secondary" : "outline"} onClick={() => setAQuick(q)}>{q}</Button>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <Input placeholder="Tìm theo nội dung…" value={aSearch} onChange={(e) => setASearch(e.target.value)} />
                  <Select value={aType} onValueChange={setAType}>
                    <SelectTrigger><SelectValue placeholder="Loại cảnh báo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      {types2.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={aOwner} onValueChange={setAOwner}>
                    <SelectTrigger><SelectValue placeholder="Phụ trách" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phụ trách</SelectItem>
                      {owners2.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={aLevel} onValueChange={setALevel}>
                    <SelectTrigger><SelectValue placeholder="Mức độ" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả mức độ</SelectItem>
                      <SelectItem value="Cao">Cao</SelectItem>
                      <SelectItem value="Trung bình">Trung bình</SelectItem>
                      <SelectItem value="Thấp">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 border rounded-md overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground bg-muted/40">
                      <tr>
                        <th className="text-left font-medium px-3 py-2">Loại</th>
                        <th className="text-left font-medium px-3 py-2">Nội dung</th>
                        <th className="text-left font-medium px-3 py-2">Nguồn</th>
                        <th className="text-left font-medium px-3 py-2">Phụ trách</th>
                        <th className="text-left font-medium px-3 py-2">Ngày</th>
                        <th className="text-left font-medium px-3 py-2">Trạng thái</th>
                        <th className="text-left font-medium px-3 py-2">Mức độ</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((a, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className={`px-3 py-2 font-medium whitespace-nowrap ${toneOf(a.severity)}`}>{a.type}</td>
                          <td className="px-3 py-2">{a.content}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{a.source}</td>
                          <td className="px-3 py-2 text-muted-foreground">{a.owner || "—"}</td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">{fmtDate(a.date)}</td>
                          <td className="px-3 py-2">{a.status ? <StatusBadge value={a.status} /> : "—"}</td>
                          <td className="px-3 py-2">{levelBadge(a.severity)}</td>
                          <td className="px-3 py-2 text-right">
                            {a.action && <Button size="sm" variant="ghost" onClick={() => { a.action!.onClick(); setAllOpen(false); }}>{a.action.label} <ExternalLink className="h-3 w-3" /></Button>}
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={8} className="text-center text-sm text-muted-foreground py-8">Không có cảnh báo nào khớp bộ lọc.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SheetContent>
            </Sheet>
          </>
        );
      })()}


      {/* Content */}
      <GroupTitle><FileText className="h-4 w-4" />Sản xuất Content</GroupTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Tổng content" value={contentStats.total} />
        <StatCard icon={FileEdit} label="Đang sản xuất" value={contentStats.producing} accent="info" />
        <StatCard icon={Eye} label="Chờ duyệt outline" value={contentStats.reviewOutline} accent="warning" />
        <StatCard icon={Eye} label="Chờ duyệt bài" value={contentStats.reviewDraft} accent="warning" />
        <StatCard icon={Wrench} label="Cần sửa" value={contentStats.fix} accent="danger" />
        <StatCard icon={Send} label="Chờ đăng" value={contentStats.waitPublish} accent="warning" />
        <StatCard icon={CheckCircle2} label="Đã đăng" value={contentStats.published} accent="success" />
        <StatCard icon={Trophy} label="Hoàn thành" value={contentStats.done} accent="success" />
      </div>

      {/* Index & share */}
      <GroupTitle><Search className="h-4 w-4" />Index & Share Social</GroupTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={Send} label="Bài đã đăng" value={indexStats.published} />
        <StatCard icon={CheckCircle2} label="Đã index" value={indexStats.indexed} accent="success" />
        <StatCard icon={AlertCircle} label="Chưa index" value={indexStats.notIndexed} accent="warning" />
        <StatCard icon={Eye} label="Chưa kiểm tra" value={indexStats.notChecked} />
        <StatCard icon={Share2} label="Index — chưa share" value={indexStats.indexedNotShared} accent="warning" />
        <StatCard icon={Share2} label="Đã share social" value={indexStats.shared} accent="success" />
      </div>

      {/* Technical SEO */}
      <GroupTitle><Settings2 className="h-4 w-4" />Technical SEO</GroupTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ListChecks} label="Tổng checklist" value={seoTotal} />
        <StatCard icon={CheckCircle2} label="Đã hoàn thành" value={seoDone} accent="success" />
        <StatCard icon={AlertCircle} label="Chưa hoàn thành" value={Math.max(0, seoTotal - seoDone)} accent="warning" />
        <StatCard icon={Activity} label="% hoàn thành" value={`${seoPct}%`} accent={seoPct >= 80 ? "success" : seoPct >= 40 ? "info" : "warning"} />
      </div>
      <Card><CardContent className="p-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Tiến độ Technical SEO</span><span>{seoDone}/{seoTotal}</span>
        </div>
        <Progress value={seoPct} />
      </CardContent></Card>

      {/* Backlinks */}
      <GroupTitle><LinkIcon className="h-4 w-4" />Backlink / PR</GroupTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={LinkIcon} label="Tổng backlink" value={blStats.total} />
        <StatCard icon={CheckCircle2} label="Đã đăng" value={blStats.posted} accent="success" />
        <StatCard icon={Eye} label="Chưa đăng" value={blStats.notPosted} accent="warning" />
        <StatCard icon={ListChecks} label="Đã kiểm tra" value={blStats.checked} accent="info" />
        <StatCard icon={AlertCircle} label="Lỗi / mất link" value={blStats.broken} accent="danger" />
      </div>

      {/* Keywords */}
      <GroupTitle><TrendingUp className="h-4 w-4" />Check TOP từ khóa</GroupTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <StatCard icon={Trophy} label="Từ khóa chính" value={kwStats.main} />
        <StatCard icon={ListChecks} label="Từ khóa phụ" value={kwStats.sub} />
        <StatCard icon={Trophy} label="Top 3" value={kwStats.top3} accent="success" />
        <StatCard icon={Trophy} label="Top 10" value={kwStats.top10} accent="success" />
        <StatCard icon={TrendingUp} label="Tăng hạng" value={kwStats.up} accent="success" />
        <StatCard icon={TrendingDown} label="Tụt hạng" value={kwStats.down} accent="warning" />
        <StatCard icon={AlertCircle} label="Mất top" value={kwStats.lost} accent="danger" />
        <StatCard icon={Eye} label="Chưa check" value={kwStats.unchecked} />
      </div>

      {/* Growth */}
      <GroupTitle><TrendingUp className="h-4 w-4" />Tăng Trưởng Website</GroupTitle>
      <GrowthSummary websiteId={websiteId} onJump={() => onJumpTab?.("growth")} />

      {/* By owner */}
      <GroupTitle><FileEdit className="h-4 w-4" />Theo người phụ trách</GroupTitle>
      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-3 py-2">Người phụ trách</th>
                <th className="text-center font-medium px-3 py-2">Được giao</th>
                <th className="text-center font-medium px-3 py-2">Đang làm</th>
                <th className="text-center font-medium px-3 py-2">Chờ duyệt</th>
                <th className="text-center font-medium px-3 py-2">Cần sửa</th>
                <th className="text-center font-medium px-3 py-2">Đã đăng</th>
                <th className="text-center font-medium px-3 py-2">Hoàn thành</th>
                <th className="text-center font-medium px-3 py-2">Quá hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ownerRows.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted-foreground py-6 text-sm">Chưa có dữ liệu</td></tr>
              )}
              {ownerRows.map((r) => (
                <tr key={r.owner} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{r.owner}</td>
                  <td className="px-3 py-2 text-center">{r.assigned}</td>
                  <td className="px-3 py-2 text-center text-info">{r.doing || "—"}</td>
                  <td className="px-3 py-2 text-center text-[oklch(0.45_0.13_75)]">{r.review || "—"}</td>
                  <td className="px-3 py-2 text-center text-destructive">{r.fix || "—"}</td>
                  <td className="px-3 py-2 text-center text-success">{r.published || "—"}</td>
                  <td className="px-3 py-2 text-center">{r.done || "—"}</td>
                  <td className="px-3 py-2 text-center text-destructive font-medium">{r.late || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  );
}
