import { useMemo, useState, Fragment } from "react";
import {
  useStore, uid, fmtDate, todayISO,
  KEYWORD_RANK_STATUSES,
  type KeywordTrack, type KeywordRankStatus, type WebContent,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ChevronDown, ChevronRight, RefreshCw, ArrowUp, ArrowDown, Minus,
  ExternalLink, Plus, AlertTriangle, Trash2,
} from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

// ----- helpers -----
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
  if (cur == null && prev == null) return <span className="text-xs text-muted-foreground">—</span>;
  if (cur == null) return <span className="text-xs text-muted-foreground">Chưa check</span>;
  if (cur === 0 && prev != null && prev > 0) return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><ArrowDown className="h-3 w-3" />Mất top</span>;
  if (cur === 0) return <span className="text-xs text-muted-foreground">Chưa có TOP</span>;
  if (prev == null || prev === 0) return <span className="text-xs text-muted-foreground">Lần đầu</span>;
  if (cur === prev) return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3 w-3" />Không đổi</span>;
  if (cur < prev) return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><ArrowUp className="h-3 w-3" />Tăng +{prev - cur}</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><ArrowDown className="h-3 w-3" />Giảm -{cur - prev}</span>;
}

const splitSubs = (s?: string) =>
  (s || "")
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

type Row = {
  key: string;
  keyword: string;
  isMain: boolean;
  track?: KeywordTrack;
  // for main rows
  content?: WebContent;
  // for sub rows
  contentId?: string;
};

type Group = {
  contentId: string;
  content: WebContent;
  mainRow: Row;
  subRows: Row[];
};

function matchesQuick(quick: string, t?: KeywordTrack): boolean {
  if (quick === "all") return true;
  if (!t) return quick === "unchecked";
  const cur = t.currentTop, prev = t.previousTop;
  switch (quick) {
    case "top3": return cur != null && cur > 0 && cur <= 3;
    case "top10": return cur != null && cur > 0 && cur <= 10;
    case "up": return cur != null && prev != null && cur > 0 && prev > 0 && cur < prev;
    case "down": return cur != null && prev != null && cur > prev;
    case "lost": return t.status === "Mất top";
    case "unchecked": return t.status === "Chưa check" || cur == null;
  }
  return true;
}

export function KeywordsTab({ websiteId }: { websiteId: string }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const canPrimary = can("web.checktop_primary");
  const canSecondary = can("web.checktop_secondary");
  const canKwCreate = can("web.checktop_kw_create");
  const canKwDelete = can("web.checktop_kw_delete");
  const canOpenUrl = can("web.checktop_open_url");
  const allKw = s.keywords.filter((k) => k.websiteId === websiteId);
  const indexedContents = s.webContents.filter(
    (c) => c.websiteId === websiteId && c.indexStatus === "Đã index",
  );

  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [fTopic, setFTopic] = useState("all");
  const [fPlan, setFPlan] = useState("all");
  const [fDate, setFDate] = useState("");
  const [quick, setQuick] = useState("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState<{ row: Row; contentId?: string } | null>(null);
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [newSub, setNewSub] = useState("");
  const [showExtras, setShowExtras] = useState(true);
  const [addingKw, setAddingKw] = useState(false);

  // Build groups from indexed contents
  const groups: Group[] = useMemo(() => {
    return indexedContents.map((c) => {
      const mainKw = (c.mainKeyword || "").trim();
      const mainTrack = allKw.find(
        (k) => k.contentId === c.id && (k.isMain || (mainKw && k.keyword === mainKw)),
      );
      const mainRow: Row = {
        key: `${c.id}::__main`,
        keyword: mainKw,
        isMain: true,
        content: c,
        contentId: c.id,
        track: mainTrack,
      };
      // sub keywords from content + extra tracks linked to this content
      const subKws = splitSubs(c.subKeywords);
      const subRows: Row[] = [];
      const seen = new Set<string>();
      subKws.forEach((kw) => {
        const t = allKw.find((k) => k.contentId === c.id && k.keyword === kw && !k.isMain);
        seen.add(kw.toLowerCase());
        subRows.push({ key: `${c.id}::${kw}`, keyword: kw, isMain: false, contentId: c.id, track: t });
      });
      // extra sub tracks added manually (contentId match, not in subKws and not main)
      allKw
        .filter((k) => k.contentId === c.id && !k.isMain && !seen.has(k.keyword.toLowerCase()))
        .forEach((k) => {
          subRows.push({ key: `${c.id}::${k.keyword}`, keyword: k.keyword, isMain: false, contentId: c.id, track: k });
        });
      return { contentId: c.id, content: c, mainRow, subRows };
    });
  }, [indexedContents, allKw]);

  // Standalone (extra) keywords not linked to any indexed content
  const extras = allKw.filter((k) => !k.contentId);

  // Filtering
  const owners = Array.from(new Set(allKw.map((k) => k.owner).filter(Boolean))) as string[];
  const topics = Array.from(new Set(allKw.map((k) => k.topic).filter(Boolean))) as string[];
  const plans = Array.from(new Set(allKw.map((k) => k.plan).filter(Boolean))) as string[];

  const rowMatchesFilters = (kwText: string, t?: KeywordTrack) => {
    if (search && !kwText.toLowerCase().includes(search.toLowerCase())) return false;
    if (fStatus !== "all" && (t?.status || "Chưa check") !== fStatus) return false;
    if (fOwner !== "all" && (t?.owner || "") !== fOwner) return false;
    if (fTopic !== "all" && (t?.topic || "") !== fTopic) return false;
    if (fPlan !== "all" && (t?.plan || "") !== fPlan) return false;
    if (fDate && t?.lastCheckDate !== fDate) return false;
    if (!matchesQuick(quick, t)) return false;
    return true;
  };

  const filteredGroups = useMemo(() => {
    return groups
      .map((g) => {
        const mainPass = rowMatchesFilters(g.mainRow.keyword, g.mainRow.track);
        const subPass = g.subRows.filter((r) => rowMatchesFilters(r.keyword, r.track));
        return { g, mainPass, subPass };
      })
      .filter(({ mainPass, subPass }) => mainPass || subPass.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, search, fStatus, fOwner, fTopic, fPlan, fDate, quick]);

  const filteredExtras = extras.filter((k) => rowMatchesFilters(k.keyword, k));

  // Auto-expand groups whose match was triggered by sub
  const isExpanded = (cid: string) => {
    const fg = filteredGroups.find((x) => x.g.contentId === cid);
    if (fg && !fg.mainPass && fg.subPass.length > 0) return true;
    return !!expanded[cid];
  };
  const toggle = (cid: string) => setExpanded((e) => ({ ...e, [cid]: !e[cid] }));

  // Quick filter counts (across all rows: main + sub + extras)
  const allRowTracks: (KeywordTrack | undefined)[] = [
    ...groups.flatMap((g) => [g.mainRow.track, ...g.subRows.map((r) => r.track)]),
    ...extras,
  ];
  const cnt = (id: string) => allRowTracks.filter((t) => matchesQuick(id, t)).length;
  const counts = {
    all: allRowTracks.length,
    top3: cnt("top3"), top10: cnt("top10"),
    up: cnt("up"), down: cnt("down"),
    lost: cnt("lost"), unchecked: cnt("unchecked"),
  };

  const QF = ({ id, label, count }: { id: string; label: string; count: number }) => (
    <button
      onClick={() => setQuick(id)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${quick === id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
    >
      {label} <span className={quick === id ? "opacity-80" : "text-muted-foreground"}>({count})</span>
    </button>
  );

  // ----- Save TOP update -----
  const saveTop = (row: Row, payload: { cur?: number; date: string; note: string; targetUrl?: string }) => {
    const existing = row.track;
    const prev = existing?.currentTop;
    const finalStatus: KeywordRankStatus = (() => {
      const base = deriveStatus(payload.cur, prev);
      if (payload.cur != null && prev != null && payload.cur > 0 && prev > 0) {
        if (payload.cur < prev) return "Tăng hạng";
        if (payload.cur > prev) return "Tụt hạng";
      }
      return base;
    })();

    if (existing) {
      s.update("keywords", existing.id, {
        currentTop: payload.cur,
        previousTop: prev,
        lastCheckDate: payload.date,
        status: finalStatus,
        notes: payload.note,
        targetUrl: payload.targetUrl ?? existing.targetUrl,
      });
    } else {
      // Create new track for this row
      const content = row.contentId ? s.webContents.find((c) => c.id === row.contentId) : undefined;
      const track: KeywordTrack = {
        id: uid(),
        websiteId,
        keyword: row.keyword,
        contentId: row.contentId,
        isMain: row.isMain,
        type: row.isMain ? "Từ khóa chính" : "Từ khóa phụ",
        targetUrl: payload.targetUrl ?? content?.publishedLink,
        topic: content?.topic,
        plan: content?.plan,
        owner: row.isMain ? content?.publisher || content?.writer : undefined,
        currentTop: payload.cur,
        previousTop: undefined,
        lastCheckDate: payload.date,
        status: finalStatus,
        notes: payload.note,
      };
      s.add("keywords", track);
    }
  };

  const addSub = (cid: string) => {
    if (!canKwCreate) { toast.error("Bạn không có quyền thêm từ khóa phụ."); return; }
    const kw = newSub.trim();
    if (!kw) return;
    // append to content's subKeywords so it persists as part of the article
    const c = s.webContents.find((x) => x.id === cid);
    if (c) {
      const cur = splitSubs(c.subKeywords);
      if (!cur.some((x) => x.toLowerCase() === kw.toLowerCase())) {
        s.update("webContents", cid, { subKeywords: [...cur, kw].join(", ") });
      }
    }
    setNewSub("");
    setAddingSubFor(null);
    setExpanded((e) => ({ ...e, [cid]: true }));
  };

  const deleteSub = (cid: string, kw: string, trackId?: string) => {
    if (!canKwDelete) { toast.error("Bạn không có quyền xóa từ khóa phụ."); return; }
    if (!confirm(`Xóa từ khóa phụ "${kw}"?`)) return;
    const c = s.webContents.find((x) => x.id === cid);
    if (c) {
      const remaining = splitSubs(c.subKeywords).filter((k) => k.toLowerCase() !== kw.toLowerCase());
      s.update("webContents", cid, { subKeywords: remaining.join(", ") });
    }
    if (trackId) s.remove("keywords", trackId);
  };

  const deleteMain = (cid: string, kw: string, trackId?: string) => {
    if (!canKwDelete) { toast.error("Bạn không có quyền xóa từ khóa chính."); return; }
    if (!confirm(`Xóa từ khóa chính "${kw}" khỏi bài viết?`)) return;
    s.update("webContents", cid, { mainKeyword: "" });
    if (trackId) s.remove("keywords", trackId);
  };


  const addManualKeyword = (p: { contentId?: string; isMain: boolean; keyword: string; targetUrl?: string }) => {
    const kw = p.keyword.trim();
    if (!kw) return;
    if (p.contentId) {
      const c = s.webContents.find((x) => x.id === p.contentId);
      if (!c) return;
      if (p.isMain) {
        s.update("webContents", p.contentId, { mainKeyword: kw });
      } else {
        const cur = splitSubs(c.subKeywords);
        if (!cur.some((x) => x.toLowerCase() === kw.toLowerCase())) {
          s.update("webContents", p.contentId, { subKeywords: [...cur, kw].join(", ") });
        }
      }
      setExpanded((e) => ({ ...e, [p.contentId!]: true }));
    } else {
      s.add("keywords", {
        id: uid(),
        websiteId,
        keyword: kw,
        isMain: p.isMain,
        type: p.isMain ? "Từ khóa chính" : "Từ khóa phụ",
        targetUrl: p.targetUrl,
        status: "Chưa check",
      });
    }
  };


  // ===== Render =====
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
        {topics.length > 0 && (
          <Select value={fTopic} onValueChange={setFTopic}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Topic" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả topic</SelectItem>
              {topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {owners.length > 0 && (
          <Select value={fOwner} onValueChange={setFOwner}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Phụ trách" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phụ trách</SelectItem>
              {owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {plans.length > 0 && (
          <Select value={fPlan} onValueChange={setFPlan}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Plan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả plan</SelectItem>
              {plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Input type="date" className="w-[150px]" value={fDate} onChange={(e) => setFDate(e.target.value)} />
        {(search || fStatus !== "all" || fOwner !== "all" || fTopic !== "all" || fPlan !== "all" || fDate || quick !== "all") && (
          <Button size="sm" variant="ghost" onClick={() => {
            setSearch(""); setFStatus("all"); setFOwner("all"); setFTopic("all"); setFPlan("all"); setFDate(""); setQuick("all");
          }}>Xóa lọc</Button>
        )}
        <Button size="sm" className="ml-auto" onClick={() => setAddingKw(true)}>
          <Plus className="h-4 w-4" />Thêm từ khóa
        </Button>
      </div>

      {filteredGroups.length === 0 && filteredExtras.length === 0 && (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
          Chưa có bài viết nào được đánh dấu <span className="font-medium text-foreground">"Đã index"</span>.
          Khi bài đã đăng có trạng thái Index = Đã index, sẽ tự xuất hiện ở đây.
        </CardContent></Card>
      )}

      {filteredGroups.length > 0 && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-3 py-2.5 w-8"></th>
                  <th className="text-left font-medium px-3 py-2.5">Từ khóa chính</th>
                  <th className="text-left font-medium px-3 py-2.5">URL đích</th>
                  <th className="text-left font-medium px-3 py-2.5">Topic</th>
                  <th className="text-center font-medium px-3 py-2.5">TOP hiện tại</th>
                  <th className="text-center font-medium px-3 py-2.5">TOP kỳ trước</th>
                  <th className="text-left font-medium px-3 py-2.5">Thay đổi</th>
                  <th className="text-left font-medium px-3 py-2.5">Ngày check</th>
                  <th className="text-left font-medium px-3 py-2.5">Trạng thái</th>
                  <th className="text-left font-medium px-3 py-2.5">Phụ trách</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredGroups.map(({ g, subPass }) => {
                  const open = isExpanded(g.contentId);
                  const subsToShow = subPass.length > 0 || (search || quick !== "all" || fStatus !== "all") ? subPass : g.subRows;
                  const t = g.mainRow.track;
                  const noMain = !g.mainRow.keyword;
                  return (
                    <Fragment key={g.contentId}>
                      <tr className="hover:bg-muted/30 bg-card">
                        <td className="px-3 py-2.5 align-top">
                          <button onClick={() => toggle(g.contentId)} className="p-1 -m-1 rounded hover:bg-muted" aria-label="toggle subs">
                            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div className="font-semibold">{g.mainRow.keyword || <span className="text-muted-foreground italic">(chưa có)</span>}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{g.content.title}</div>
                          {noMain && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-warning">
                              <AlertTriangle className="h-3 w-3" />
                              Bài đã index nhưng chưa có từ khóa chính.
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {g.subRows.length} từ khóa phụ
                          </div>
                        </td>
                        <td className="px-3 py-2.5 align-top max-w-[220px]">
                          {g.content.publishedLink ? (
                            <a href={g.content.publishedLink} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                              <span className="truncate max-w-[180px]">{g.content.publishedLink.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2.5 align-top text-muted-foreground text-xs">{t?.topic || g.content.topic || "—"}</td>
                        <td className="px-3 py-2.5 align-top text-center font-semibold">{t?.currentTop ?? "—"}</td>
                        <td className="px-3 py-2.5 align-top text-center text-muted-foreground">{t?.previousTop ?? "—"}</td>
                        <td className="px-3 py-2.5 align-top"><RankChange cur={t?.currentTop} prev={t?.previousTop} /></td>
                        <td className="px-3 py-2.5 align-top text-muted-foreground text-xs">{fmtDate(t?.lastCheckDate)}</td>
                        <td className="px-3 py-2.5 align-top"><StatusBadge value={t?.status || "Chưa check"} /></td>
                        <td className="px-3 py-2.5 align-top text-muted-foreground text-xs">{t?.owner || "—"}</td>
                        <td className="px-3 py-2.5 align-top text-right whitespace-nowrap">
                          <Button size="sm" variant="outline" onClick={() => setUpdating({ row: g.mainRow })} disabled={noMain}>
                            <RefreshCw className="h-3.5 w-3.5" />Cập nhật TOP
                          </Button>
                          {!noMain && (
                            <Button size="icon" variant="ghost" title="Xóa từ khóa chính" onClick={() => deleteMain(g.contentId, g.mainRow.keyword, g.mainRow.track?.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          )}
                        </td>
                      </tr>

                      {open && (
                        <>
                          {subsToShow.map((r) => (
                            <tr key={r.key} className="bg-muted/20 border-l-2 border-l-primary/40">
                              <td className="px-3 py-2"></td>
                              <td className="px-3 py-2 pl-8 text-sm">
                                <span className="text-muted-foreground mr-1.5">↳</span>
                                {r.keyword}
                              </td>
                              <td className="px-3 py-2 text-xs text-muted-foreground" colSpan={2}>—</td>
                              <td className="px-3 py-2 text-center font-medium">{r.track?.currentTop ?? "—"}</td>
                              <td className="px-3 py-2 text-center text-muted-foreground">{r.track?.previousTop ?? "—"}</td>
                              <td className="px-3 py-2"><RankChange cur={r.track?.currentTop} prev={r.track?.previousTop} /></td>
                              <td className="px-3 py-2 text-muted-foreground text-xs">{fmtDate(r.track?.lastCheckDate)}</td>
                              <td className="px-3 py-2"><StatusBadge value={r.track?.status || "Chưa check"} /></td>
                              <td className="px-3 py-2 text-muted-foreground text-xs">{r.track?.notes ? <span title={r.track.notes}>📝</span> : "—"}</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                <Button size="sm" variant="ghost" onClick={() => setUpdating({ row: r })}>
                                  <RefreshCw className="h-3.5 w-3.5" />Cập nhật
                                </Button>
                                {r.contentId && (
                                  <Button size="icon" variant="ghost" title="Xóa từ khóa phụ" onClick={() => deleteSub(r.contentId!, r.keyword, r.track?.id)}>
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-muted/10 border-l-2 border-l-primary/40">
                            <td colSpan={11} className="px-3 py-2 pl-8">
                              {addingSubFor === g.contentId ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    autoFocus
                                    value={newSub}
                                    onChange={(e) => setNewSub(e.target.value)}
                                    placeholder="Nhập từ khóa phụ..."
                                    className="max-w-xs h-8"
                                    onKeyDown={(e) => { if (e.key === "Enter") addSub(g.contentId); if (e.key === "Escape") { setAddingSubFor(null); setNewSub(""); } }}
                                  />
                                  <Button size="sm" onClick={() => addSub(g.contentId)}>Thêm</Button>
                                  <Button size="sm" variant="ghost" onClick={() => { setAddingSubFor(null); setNewSub(""); }}>Hủy</Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setAddingSubFor(g.contentId)}>
                                  <Plus className="h-3.5 w-3.5" />Thêm từ khóa phụ
                                </Button>
                              )}
                            </td>
                          </tr>
                        </>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {/* Standalone extras */}
      {extras.length > 0 && (
        <Card>
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <button className="text-sm font-medium inline-flex items-center gap-1.5" onClick={() => setShowExtras((v) => !v)}>
              {showExtras ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Từ khóa khác (chưa gắn bài) <span className="text-muted-foreground font-normal">({filteredExtras.length}/{extras.length})</span>
            </button>
          </div>
          {showExtras && (
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground bg-muted/40">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Từ khóa</th>
                      <th className="text-left font-medium px-3 py-2">Topic</th>
                      <th className="text-center font-medium px-3 py-2">TOP</th>
                      <th className="text-center font-medium px-3 py-2">Trước</th>
                      <th className="text-left font-medium px-3 py-2">Thay đổi</th>
                      <th className="text-left font-medium px-3 py-2">Ngày check</th>
                      <th className="text-left font-medium px-3 py-2">Trạng thái</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredExtras.map((k) => {
                      const row: Row = { key: k.id, keyword: k.keyword, isMain: !!k.isMain, track: k };
                      return (
                        <tr key={k.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium">{k.keyword}</td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">{k.topic || "—"}</td>
                          <td className="px-3 py-2 text-center font-semibold">{k.currentTop ?? "—"}</td>
                          <td className="px-3 py-2 text-center text-muted-foreground">{k.previousTop ?? "—"}</td>
                          <td className="px-3 py-2"><RankChange cur={k.currentTop} prev={k.previousTop} /></td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">{fmtDate(k.lastCheckDate)}</td>
                          <td className="px-3 py-2"><StatusBadge value={k.status} /></td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            <Button size="sm" variant="ghost" onClick={() => setUpdating({ row })}>
                              <RefreshCw className="h-3.5 w-3.5" />Cập nhật
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Xóa "${k.keyword}"?`)) s.remove("keywords", k.id); }}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Update TOP dialog */}
      <Dialog open={!!updating} onOpenChange={(o) => !o && setUpdating(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Cập nhật TOP</DialogTitle></DialogHeader>
          {updating && <UpdateForm row={updating.row} onSubmit={(p) => { saveTop(updating.row, p); setUpdating(null); }} onClose={() => setUpdating(null)} />}
        </DialogContent>
      </Dialog>

      {/* Add keyword dialog */}
      <Dialog open={addingKw} onOpenChange={setAddingKw}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Thêm từ khóa theo dõi</DialogTitle></DialogHeader>
          <AddKeywordForm
            contents={indexedContents}
            onSubmit={(p) => { addManualKeyword(p); setAddingKw(false); }}
            onClose={() => setAddingKw(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UpdateForm({
  row, onSubmit, onClose,
}: {
  row: Row;
  onSubmit: (p: { cur?: number; date: string; note: string; targetUrl?: string }) => void;
  onClose: () => void;
}) {
  const t = row.track;
  const defaultUrl = t?.targetUrl || (row.contentId ? undefined : undefined);
  const [cur, setCur] = useState<string>(t?.currentTop?.toString() ?? "");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState(t?.notes || "");
  const [url, setUrl] = useState(defaultUrl || "");

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <div className="text-muted-foreground text-xs mb-0.5">Từ khóa {row.isMain ? "chính" : "phụ"}</div>
        <div className="font-semibold">{row.keyword}</div>
      </div>
      {(t?.currentTop != null) && (
        <div className="text-xs text-muted-foreground">
          TOP hiện tại lưu: <span className="font-semibold text-foreground">{t.currentTop}</span> sẽ chuyển thành TOP kỳ trước.
        </div>
      )}
      <Field label="URL đích">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="TOP mới"><Input type="number" min={0} value={cur} onChange={(e) => setCur(e.target.value)} placeholder="0 = mất top" /></Field>
        <Field label="Ngày check"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      </div>
      <Field label="Ghi chú"><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></Field>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button onClick={() => onSubmit({
          cur: cur === "" ? undefined : Math.max(0, parseInt(cur, 10) || 0),
          date, note, targetUrl: url || undefined,
        })}>Lưu</Button>
      </DialogFooter>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}

function AddKeywordForm({
  contents, onSubmit, onClose,
}: {
  contents: WebContent[];
  onSubmit: (p: { contentId?: string; isMain: boolean; keyword: string; targetUrl?: string }) => void;
  onClose: () => void;
}) {
  const [contentId, setContentId] = useState<string>("__none");
  const [isMain, setIsMain] = useState<string>("sub");
  const [keyword, setKeyword] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const linkedContent = contentId !== "__none" ? contents.find((c) => c.id === contentId) : undefined;
  const mainTaken = !!(linkedContent && (linkedContent.mainKeyword || "").trim() && isMain === "main");

  return (
    <div className="space-y-3">
      <Field label="Gắn với bài đã index (tùy chọn)">
        <Select value={contentId} onValueChange={setContentId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">— Không gắn (từ khóa độc lập) —</SelectItem>
            {contents.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Loại từ khóa">
        <Select value={isMain} onValueChange={setIsMain}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Từ khóa chính</SelectItem>
            <SelectItem value="sub">Từ khóa phụ</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {mainTaken && (
        <div className="text-xs text-warning inline-flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Bài đang có từ khóa chính "{linkedContent?.mainKeyword}". Lưu sẽ ghi đè.
        </div>
      )}
      <Field label="Từ khóa">
        <Input autoFocus value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Nhập từ khóa..." />
      </Field>
      {contentId === "__none" && (
        <Field label="URL đích (tùy chọn)">
          <Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://..." />
        </Field>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button
          disabled={!keyword.trim()}
          onClick={() => onSubmit({
            contentId: contentId === "__none" ? undefined : contentId,
            isMain: isMain === "main",
            keyword: keyword.trim(),
            targetUrl: targetUrl.trim() || undefined,
          })}
        >Thêm</Button>
      </DialogFooter>
    </div>
  );
}
