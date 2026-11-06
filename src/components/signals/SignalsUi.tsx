import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone, Plus, Search, RotateCcw, MessageCircle, PencilLine, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Ban, Trash2, Undo2, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useCurrentUser } from "@/lib/auth";
import {
  OPEN_STATUSES, SIGNAL_CHANNELS, SIGNAL_EVENTS, SIGNAL_LOST_REASONS, SIGNAL_NEED_GROUPS, SIGNAL_PRODUCTS, SIGNAL_SOURCES,
  STATUS_LABEL, STATUS_TONE, fmtVnd, isOpen, isOverdue, normalizePhone, statusLabel, todayKey, zaloLink,
  addOption, renameOption, toggleOption, needGroupsOf, type CatOption, type OptionScope,
  type LastNote, type Signal, type SignalStatus,
} from "@/lib/signals/catalog";
import {
  assignSignal, createSignal, errMsg, findSamePhone, listLastNotes, listSignals, reopenSignal, saleUpdate, salesList,
  signalHistory, updateSignalInfo, deleteSignal, cancelSignal, getCustomLostReasons, setCustomLostReasons, getOptions, saveOptions, renameOptionEverywhere, type SignalInput,
  listCareNotes, listProgression, saveProgression, listDeadlines, deadlineHistory,
} from "@/lib/signals/api";
import { applyDetailFilter, applyListFilter, lastActivity, type ListFilter, type Quick } from "@/lib/signals/report";
import { careFlag, daysSince, lastCareActivity, DEFAULT_CARE } from "@/lib/signals/care";
import { useServerFn } from "@tanstack/react-start";
import { zaloCareCounts } from "@/lib/zalo.functions";
import { ProgressionSummary } from "./ProgressionSummary";
import { composeProgression, progressionSuggestions, validProgression } from "@/lib/signals/progression";
import { signalSurfaceClick, signalNameClick, signalNameKeyDown } from "@/lib/signals/detailInteraction";
import { SignalEnrichment, SignalLabelManager, PotentialPill, SignalLabelPills, useSignalLabels } from './SignalEnrichment';
import { POTENTIAL_LABEL, STAGES, matchWork, sortSignals, type WorkQuick, type SignalSort } from '@/lib/signals/potential';
import { suggestedProgressionStatus } from '@/lib/signals/deadlines';

import { SignalDeadlineFilters } from './SignalDeadlineFilters';
import { deadlineCounts, type DeadlineQuick } from '@/lib/signals/deadlineFilters';

function SignalCustomerName({ name, onOpen }: { name: string; onOpen: () => void }) {
  return <Button asChild variant="link" className="h-auto min-h-11 md:min-h-0 justify-start whitespace-normal p-0 text-left font-semibold leading-tight select-text">
    <span role="button" tabIndex={0} aria-label={`Mở chi tiết tín hiệu: ${name}`} onClick={signalNameClick(onOpen)} onKeyDown={signalNameKeyDown(onOpen)}>{name}</span>
  </Button>;
}

export function useSignalPerms() {
  const { user, can } = useCurrentUser();
  return {
    userId: user?.id ?? null,
    create: can("signal.create") || can("signal.manage"),
    viewAll: can("signal.view_all") || can("signal.manage"),
    assign: can("signal.assign") || can("signal.reassign") || can("signal.manage"),
    assignNew: can("signal.assign"),
    reassign: can("signal.reassign"),
    manage: can("signal.manage"),
    edit: can("signal.edit") || can("signal.manage"),
    del: can("signal.delete") || can("signal.manage"),
    sale: can("signal.sale"),
    report: can("signal.report") || can("signal.manage"),
    catalog: can("signal.catalog") || can("signal.manage"),
  };
}

/** Mọi khóa bộ nhớ tạm của module đều bắt đầu bằng "sig:" và gắn mã người dùng. */
const SIG = "sig:";
export const signalsKey = (uid: string | null) => [`${SIG}list`, uid] as const;
export function useSignals(enabled = true) {
  const { userId } = useSignalPerms();
  return useQuery({ queryKey: signalsKey(userId), queryFn: listSignals, enabled: enabled && !!userId, refetchInterval: 10000, refetchIntervalInBackground: false, refetchOnWindowFocus: "always" });
}
export function useLastNotes(enabled = true) {
  const { userId } = useSignalPerms();
  return useQuery({ queryKey: [`${SIG}last`, userId], queryFn: listLastNotes, enabled: enabled && !!userId });
}
/** 9 lý do mặc định + lý do quản lý bổ sung ("Khác" luôn ở cuối). */
export function useLostReasons() {
  const { userId } = useSignalPerms();
  const q = useQuery({ queryKey: [`${SIG}lostReasons`, userId], queryFn: getCustomLostReasons, enabled: !!userId });
  const custom = q.data ?? [];
  const base = SIGNAL_LOST_REASONS.filter((x) => x !== "Khác");
  return { custom, all: [...base, ...custom.filter((c) => !(base as readonly string[]).includes(c)), "Khác"] };
}
/** Danh mục Nhóm sản phẩm / Nhóm nhu cầu (dùng chung, có cập nhật ngay). */
export function useOptions(scope: OptionScope) {
  const { userId } = useSignalPerms();
  const q = useQuery({ queryKey: [`${SIG}opt:${scope}`, userId], queryFn: () => getOptions(scope), enabled: !!userId });
  const all = q.data ?? [];
  return { all, active: all.filter((o) => o.active).map((o) => o.name), names: all.map((o) => o.name) };
}
const invalidateSig = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith(SIG) });

/** Xóa dữ liệu tín hiệu khi đăng xuất hoặc đổi tài khoản (không cần tải lại trang). */
export function SignalCacheGuard() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const prev = useRef<string | null | undefined>(undefined);
  const uid = user?.id ?? null;
  useEffect(() => {
    if (prev.current !== undefined && prev.current !== uid) {
      qc.removeQueries({ predicate: (q) => String(q.queryKey[0]).startsWith(SIG) });
    }
    prev.current = uid;
  }, [uid, qc]);
  return null;
}

export function useUserName() {
  const users = useAuth((s) => s.users);
  return (id: string | null | undefined) => (id ? users.find((u) => u.id === id)?.fullName || "—" : "—");
}

export function StatusPill({ s }: { s: Pick<Signal, "status" | "assigned_to"> }) {
  const key = (s.status ?? "none") as keyof typeof STATUS_TONE;
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS_TONE[key] ?? STATUS_TONE.none)}>
      {s.status ? statusLabel(s.status) : "Chưa phân công"}
    </span>
  );
}

const fmtDate = (d: string | null | undefined) => (d ? d.split("-").reverse().join("/") : "—");
const fmtTime = (iso: string) => new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const fmtNext = (s: Pick<Signal, "next_contact_on" | "next_contact_at">) =>
  s.next_contact_at ? fmtTime(s.next_contact_at) : fmtDate(s.next_contact_on);
const lastText = (n?: LastNote) => (n ? [n.event_type, n.note].filter(Boolean).join(" — ") || "Đã cập nhật" : null);

const QUICK: { k: Quick; label: string }[] = [
  { k: "all", label: "Tất cả" },
  ...(Object.entries(STATUS_LABEL) as [SignalStatus, string][]).map(([k, label]) => ({ k, label })),
];
const emptyFilter = (): ListFilter => ({ quick: "all", time: "" });

export function SignalsPage() {
  const p = useSignalPerms();
  const name = useUserName();
  const { data = [], isLoading, error } = useSignals();
  const { data: last = {} } = useLastNotes();
  const { data: careNotes = {} } = useQuery({ queryKey: [`${SIG}care`, p.userId], queryFn: listCareNotes, enabled: !!p.userId });
  const progression = useQuery({ queryKey: [`${SIG}progression`, p.userId], queryFn: () => listProgression(), enabled: !!p.userId, refetchInterval: 10000, refetchOnWindowFocus: "always" });
  const deadlines = useQuery({queryKey:[`${SIG}deadlines`,p.userId],queryFn:listDeadlines,enabled:!!p.userId,refetchInterval:10000,refetchOnWindowFocus:'always'});
  const [deadlineFilter,setDeadlineFilter]=useState<DeadlineQuick|null>(null);
  const careFn = useServerFn(zaloCareCounts);
  const { data: careCfg } = useQuery({ queryKey: [`${SIG}carecfg`], queryFn: () => careFn(), staleTime: 600000 });
  const [care, setCare] = useState<{ on: boolean; kind?: "unaccepted" | "stale"; sale?: string }>({ on: false });
  const labels = useSignalLabels(p.userId);
  const [workQuick,setWorkQuick]=useState<WorkQuick>('all');
  const [sort,setSort]=useState<SignalSort>('work');
  const [labelsOpen,setLabelsOpen]=useState(false);
  const [f, setF] = useState<ListFilter>(emptyFilter());
  const restored=useRef<string|null>(null);
  useEffect(()=>{
    if(!p.userId)return;
    try {const saved=JSON.parse(sessionStorage.getItem(`sig:filters:${p.userId}`)||'null');if(saved){setF(saved.f??emptyFilter());setWorkQuick(saved.workQuick??'all');setSort(saved.sort??'work');setDeadlineFilter(saved.deadlineFilter??null);}}catch{}
    restored.current=p.userId;
  },[p.userId]);
  useEffect(()=>{if(p.userId&&restored.current===p.userId){try{sessionStorage.setItem(`sig:filters:${p.userId}`,JSON.stringify({f,workQuick,sort,deadlineFilter}));}catch{}}},[f,workQuick,sort,deadlineFilter,p.userId]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const id = sp.get("open");
    const deadline=sp.get('deadline');
    if(deadline==='today'||deadline==='soon'||deadline==='overdue') {
      setDeadlineFilter(deadline);
      const sale=sp.get('sale');
      setF(x=>({...x,saleId:sale&&/^[0-9a-f-]{36}$/i.test(sale)?sale:undefined,needGroup:sp.get('group')||undefined,source:sp.get('source')||undefined}));
    }
    if (id && /^[0-9a-f-]{36}$/i.test(id)) setOpenId(id);
    if (sp.get("care") === "1") {
      const sale = sp.get("sale"); const kind = sp.get("kind");
      setCare({ on: true, sale: sale && /^[0-9a-f-]{36}$/i.test(sale) ? sale : undefined, kind: kind === "unaccepted" || kind === "stale" ? kind : undefined });
    }
  }, []);
  const [creating, setCreating] = useState(false);
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const today = todayKey();
  const saleOnly = p.sale && !p.viewAll && !p.create;

  const mine = useMemo(() => data.filter((s) => s.assigned_to === p.userId), [data, p.userId]);
  const careAll = useMemo(() => {
    const cfg = careCfg ?? DEFAULT_CARE; const now = Date.now();
    return data.map((s) => ({ s, flag: careFlag(s, careNotes[s.id] ?? [], now, cfg) === "unaccepted" ? "unaccepted" : deadlines.data?.[s.id]?.deadline_state==='overdue' ? "stale_contact" : null, since: deadlines.data?.[s.id]?.overdue_days ?? daysSince(s.assigned_at ? Date.parse(s.assigned_at) : null, now) }))
      .filter((x) => x.flag);
  }, [data, careNotes, careCfg, deadlines.data]);
  // Sale chỉ thấy tín hiệu đang giao cho chính mình; quản lý thấy trong phạm vi được xem
  const careScope = useMemo(() => (p.viewAll || p.assign || p.manage ? careAll : careAll.filter((x) => x.s.assigned_to === p.userId)), [careAll, p]);
  const careList = useMemo(() => careScope.filter((x) => (!care.sale || x.s.assigned_to === care.sale)
    && (!care.kind || (care.kind === "unaccepted" ? x.flag === "unaccepted" : x.flag !== "unaccepted")) && applyDetailFilter([x.s], f, today).length > 0
    && (f.quick === 'all' || x.s.status === f.quick)), [careScope, care, f, today]);
  const list = useMemo(() => {
    const filtered=applyListFilter(data,f,today,last);
    const rows=filtered.filter(s=>(!deadlineFilter||deadlines.data?.[s.id]?.deadline_state===deadlineFilter)&&matchWork(s,workQuick,deadlines.data?.[s.id],today));
    return sort==='activity'?rows:sortSignals(rows,sort,deadlines.data??{},today);
  }, [data, f, today, last,deadlineFilter,deadlines.data,workQuick,sort]);
  const base = useMemo(() => applyDetailFilter(data, f, today).filter(s=>matchWork(s,workQuick,deadlines.data?.[s.id],today)&&(!deadlineFilter||deadlines.data?.[s.id]?.deadline_state===deadlineFilter)), [data, f, today,workQuick,deadlines.data,deadlineFilter]);
  const deadlineBase = useMemo(() => applyListFilter(data,f,today,last).filter(s=>matchWork(s,workQuick,deadlines.data?.[s.id],today)), [data,f,today,last,workQuick,deadlines.data]);
  const dueCounts = deadlineCounts(deadlineBase,deadlines.data??{});
  const pickDeadline = (value: DeadlineQuick|null) => {setCare({on:false});setDeadlineFilter(value);};
  const count = (k: Quick) => (k === "all" ? base.length : base.filter((s) => s.status === k).length);
  const needOpts = useOptions("signal_need_groups");
  // Đếm nhóm nhu cầu: áp dụng mọi điều kiện khác (kể cả trạng thái) trừ chính nhóm nhu cầu
  const needBase = useMemo(() => {
    const b = applyDetailFilter(data, { ...f, needGroup: undefined }, today);
    return b.filter(s=>(f.quick==='all'||s.status===f.quick)&&matchWork(s,workQuick,deadlines.data?.[s.id],today)&&(!deadlineFilter||deadlines.data?.[s.id]?.deadline_state===deadlineFilter));
  }, [data, f, today,workQuick,deadlines.data,deadlineFilter]);
  const needCount = (g?: string) => (g ? needBase.filter((s) => needGroupsOf(s).includes(g)).length : needBase.length);
  const open = data.find((s) => s.id === openId) || null;
  const denied = !!openId && !isLoading && !open;
  const extra = Object.entries(f).filter(([k, v]) => !["q", "quick", "time"].includes(k) && v).length + (f.time ? 1 : 0);


  return (
    <div className="signals-page space-y-4 pb-[calc(13rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="hidden md:flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{saleOnly ? "Tín hiệu của tôi" : "Tín hiệu cơ hội"}</h1>
          <p className="text-sm text-muted-foreground">Tín hiệu có khả năng phát sinh đơn hàng, giao Kinh doanh tư vấn.</p>
        </div>
        <div className="flex gap-2">
          {p.manage && <Button variant="outline" onClick={() => setReasonsOpen(true)}><ListPlus className="h-4 w-4 mr-1" />Lý do trượt</Button>}
          {p.create && <Button size="lg" onClick={() => setCreating(true)} className="hidden md:inline-flex"><Plus className="h-4 w-4 mr-1" />Thêm tín hiệu</Button>}
        </div>
      </div>

      {p.sale && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Stat label="Chờ nhận" v={mine.filter((s) => s.status === "waiting").length} onClick={() => setF({ ...emptyFilter(), quick: "waiting" })} />
          <Stat label="Đang xử lý" v={mine.filter((s) => isOpen(s.status) && s.status !== "waiting").length} />
          <Stat label="Đã báo giá" v={mine.filter((s) => s.status === "quoted").length} onClick={() => setF({ ...emptyFilter(), quick: "quoted" })} />
          <Stat label="Đã chốt tháng này" v={mine.filter((s) => s.status === "won" && s.closed_at && todayKey(new Date(s.closed_at)).slice(0, 7) === today.slice(0, 7)).length} />
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={f.q ?? ""} onChange={(e) => setF((x) => ({ ...x, q: e.target.value }))} placeholder="Tìm khách hàng hoặc SĐT" className="pl-9 h-11" />
        </div>
        <Button variant="outline" className="h-11" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal className="h-4 w-4 mr-1" />Bộ lọc{extra ? ` (${extra})` : ""}
        </Button>
        {p.create&&<Button className="h-11 w-11 shrink-0 md:hidden" size="icon" aria-label="Thêm tín hiệu" onClick={()=>setCreating(true)}><Plus className="h-4 w-4"/></Button>}
      </div>
      <div className="hidden md:flex flex-wrap items-center justify-between gap-2"><label className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Sắp xếp</span><select aria-label="Sắp xếp tín hiệu" className="h-11 max-w-52 rounded-md border bg-background px-2 text-sm" value={sort} onChange={e=>setSort(e.target.value as SignalSort)}>{[['work','Ưu tiên công việc'],['newest','Mới nhất'],['oldest','Cũ nhất'],['soonest','Cần xử lý sớm'],['potential','Tiềm năng cao trước'],['value','Giá trị đã ghi nhận'],['activity','Cập nhật mới nhất']].map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>{p.sale&&<Button variant="ghost" size="sm" className="min-h-11" onClick={()=>setLabelsOpen(true)}>Nhãn cá nhân</Button>}</div>
      {careScope.length > 0 && !care.on && (
        <Button variant="outline" onClick={() => setCare({ on: true })} className="hidden md:block h-auto w-full text-left rounded-lg border-warning/40 bg-warning/10 px-3 py-2 text-sm font-medium">
          ⚠️ CẦN KIỂM TRA: {careScope.length} <span className="font-normal text-muted-foreground">— bấm để xem</span>
        </Button>
      )}
      <div className="md:hidden min-w-0 space-y-2">
        <SignalDeadlineFilters value={deadlineFilter} counts={dueCounts} loading={deadlines.isPending} error={deadlines.error?errMsg(deadlines.error):undefined} onChange={pickDeadline}/>
        <ActiveFilters f={f} name={name} onChange={setF} />
      </div>
      <div className="hidden md:block rounded-2xl border bg-card p-3 shadow-sm space-y-2.5">
        <ChipRow label="Nhóm nhu cầu" items={[{ k: "", label: "Tất cả", n: needCount(undefined) }, ...needOpts.names.filter((n) => n === f.needGroup || needCount(n) > 0).map((n) => ({ k: n, label: n, n: needCount(n) }))]}
          active={f.needGroup ?? ""} onPick={(k) => { setCare({ on: false }); setF((y) => ({ ...y, needGroup: k || undefined })); }} />
        <ChipRow label="Trạng thái" items={QUICK.map((x) => ({ k: x.k, label: x.label, n: count(x.k) }))}
          active={care.on ? "__care__" : f.quick} onPick={(k) => { setCare({ on: false }); setF((y) => ({ ...y, quick: k as Quick })); }}
          />
        <SignalDeadlineFilters value={deadlineFilter} counts={dueCounts} loading={deadlines.isPending} error={deadlines.error?errMsg(deadlines.error):undefined} onChange={pickDeadline}/>
        <ActiveFilters f={f} name={name} onChange={setF} />
      </div>
      {care.on && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">⚠️ Cần kiểm tra{care.kind === "unaccepted" ? " — Chưa tiếp nhận" : care.kind === "stale" ? " — Quá hạn cập nhật" : ""}{care.sale ? ` — ${name(care.sale)}` : ""}: {careList.length}</span>
            <Button variant="ghost" size="sm" onClick={() => setCare({ on: false })}>Xem tất cả</Button>
          </div>
          {careList.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-card">Không có tín hiệu cần kiểm tra.</p>
            : careList.map(({ s, flag, since }) => (
              <div key={s.id} onClick={signalSurfaceClick(() => setOpenId(s.id))} className="signal-card rounded-xl border bg-card p-3.5 space-y-1.5 cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <SignalCustomerName name={s.customer_name} onOpen={() => setOpenId(s.id)} />
                  <StatusPill s={s} />
                </div>
                <div className="text-sm"><span className="text-muted-foreground">Diễn biến gần nhất: </span>{lastText(last[s.id]) ?? "Chưa có"}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className={flag === "unaccepted" ? "text-destructive" : "text-amber-700 dark:text-amber-300"}>
                    {flag === "unaccepted" ? `Chưa tiếp nhận: ${since} ngày` : `Quá hạn cập nhật: ${since} ngày`}{!saleOnly && s.assigned_to ? ` · ${name(s.assigned_to)}` : ""}
                  </span>
                  <Button size="sm" variant="outline" className="min-h-11 md:min-h-0" onClick={() => setOpenId(s.id)}>Xem tín hiệu</Button>
                </div>
              </div>
            ))}
        </div>
      )}


      {care.on ? null : isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Đang tải…</p>
        : error ? <p className="text-sm text-destructive py-8 text-center">{errMsg(error)}</p>
        : list.length === 0 ? <p className="text-sm text-muted-foreground py-12 text-center border rounded-lg bg-card">Không có tín hiệu phù hợp.</p>
        : (
          <>
            <div className="md:hidden space-y-2">
              {list.map((s) => (
                <div key={s.id} onClick={signalSurfaceClick(() => setOpenId(s.id))} className="signal-card w-full text-left rounded-xl border bg-card p-3.5 space-y-1.5 cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <SignalCustomerName name={s.customer_name} onOpen={() => setOpenId(s.id)} />
                    <StatusPill s={s} />
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{needGroupsOf(s).join(", ") || s.products.join(", ") || s.need_detail || "—"}</div>
                  {s.revenue!=null&&<div className="text-sm font-medium">{fmtVnd(s.revenue)}</div>}
                  <div className="flex flex-wrap items-center gap-1.5"><PotentialPill s={s}/><SignalLabelPills s={s} labels={labels.data??[]}/></div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground"><span>{!saleOnly&&(s.assigned_to?name(s.assigned_to):'Chưa phân công')}</span><span>{s.next_contact_on?`Theo dõi ${fmtNext(s)}`:deadlines.data?.[s.id]?`Hạn cập nhật ${fmtDate(deadlines.data[s.id].due_on)}`:'Chưa có lịch theo dõi'}</span></div>
                  <div className="grid grid-cols-2 gap-2 pt-1" data-signal-interactive><Button asChild variant="outline" className="min-h-11"><a href={`tel:${s.phone}`}><Phone className="h-4 w-4 mr-1"/>Gọi</a></Button><Button variant="secondary" className="min-h-11" onClick={()=>setOpenId(s.id)}>Xem / Cập nhật</Button></div>
                </div>
              ))}
            </div>
            <div className="hidden md:block rounded-2xl border bg-card overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-primary/5 text-left text-xs text-muted-foreground">
                  <tr>{["Ngày", "Khách hàng", "Nhu cầu", "Nguồn", "Sale phụ trách", "Trạng thái", "Diễn biến gần nhất", "Chi tiết nhu cầu", ""].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s.id} onClick={signalSurfaceClick(() => setOpenId(s.id))} className="border-t cursor-pointer hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">{fmtDate(s.detected_on)}</td>
                      <td className="px-4 py-2.5 min-w-[160px]"><SignalCustomerName name={s.customer_name} onOpen={() => setOpenId(s.id)} /><div className="text-xs text-muted-foreground font-mono">{s.phone}</div></td>
                      <td className="px-4 py-2.5 max-w-[180px] truncate">{needGroupsOf(s).join(", ") || s.products.join(", ") || "—"}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{s.source}</td>
                      <td className="px-4 py-2.5 min-w-[140px] whitespace-nowrap">{s.assigned_to ? name(s.assigned_to) : <span className="text-muted-foreground">Chưa phân công</span>}</td>
                      <td className="px-4 py-2.5"><StatusPill s={s} /><div className="mt-1"><PotentialPill s={s}/></div>{s.status === "won" && s.revenue ? <div className="text-xs mt-0.5">{fmtVnd(s.revenue)}</div> : null}</td>
                      <td className="px-4 py-2.5 max-w-[240px]"><div className="line-clamp-2">{lastText(last[s.id]) ?? <span className="text-muted-foreground italic">Chưa có</span>}</div>{progression.data && <ProgressionSummary s={s} row={progression.data[s.id]} deadline={deadlines.data?.[s.id]} compact />}</td>
                      <td className="px-4 py-2.5 max-w-[260px] min-w-[180px]">{s.need_detail?.trim()
                        ? <div className="line-clamp-2 whitespace-pre-line" title={s.need_detail}>{s.need_detail}</div>
                        : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-2.5 text-right"><Button size="sm" variant="outline" onClick={() => setOpenId(s.id)}>Chi tiết</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      <FilterSheet open={filterOpen} onOpenChange={setFilterOpen} value={f} onApply={setF} data={data} showPeople={p.viewAll || p.assign} workQuick={workQuick} sort={sort} onOptions={(work,order)=>{setCare({on:false});setWorkQuick(work);setSort(order);}} />
      <Sheet open={labelsOpen} onOpenChange={setLabelsOpen}><SheetContent side="bottom" className="signal-mobile-sheet max-h-[85dvh] overflow-y-auto sm:max-w-xl sm:mx-auto"><SheetHeader className="mb-4"><SheetTitle>Nhãn cá nhân</SheetTitle></SheetHeader><SignalLabelManager uid={p.userId} catalog={false} sale={p.sale} personalOnly/></SheetContent></Sheet>
      {p.manage && <LostReasonsSheet open={reasonsOpen} onOpenChange={setReasonsOpen} />}
      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent side="right" className="signal-mobile-sheet w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>Thêm tín hiệu</SheetTitle></SheetHeader>
          <SignalForm onDone={() => setCreating(false)} />
        </SheetContent>
      </Sheet>
      <Sheet open={!!open || denied} onOpenChange={(o) => {
        if (o) return;
        setOpenId(null);
        const u = new URL(window.location.href);
        if (u.searchParams.has("open")) { u.searchParams.delete("open"); window.history.replaceState(null, "", u.pathname + u.search); }
      }}>
        <SheetContent side="right" className="signal-mobile-sheet w-full h-full max-w-none sm:max-w-xl overflow-y-auto p-0">
          {open && <SignalDetail key={open.id} s={open} last={last[open.id]} />}
          {denied && (
            <div className="p-6 pt-12 space-y-2">
              <SheetHeader><SheetTitle>Không thể mở tín hiệu</SheetTitle></SheetHeader>
              <p className="text-sm text-muted-foreground">Bạn không còn quyền xem tín hiệu này — có thể tín hiệu đã được chuyển cho người khác hoặc không còn tồn tại.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterSheet({ open, onOpenChange, value, onApply, data, showPeople, workQuick, sort, onOptions }: {
  open: boolean; onOpenChange: (o: boolean) => void; value: ListFilter; onApply: (f: ListFilter) => void; data: Signal[]; showPeople: boolean; workQuick:WorkQuick; sort:SignalSort; onOptions:(work:WorkQuick,sort:SignalSort)=>void;
}) {
  const name = useUserName();
  const prodOpts = useOptions("signal_products");
  const needOpts = useOptions("signal_need_groups");
  const srcOpts = useOptions("signal_sources");
  const lr = useLostReasons();
  const p=useSignalPerms();const labels=useSignalLabels(p.userId);
  const [work,setWork]=useState(workQuick);const [order,setOrder]=useState(sort);
  const [f, setF] = useState<ListFilter>(value);
  useEffect(() => { if (open) {setF(value);setWork(workQuick);setOrder(sort);} }, [open, value,workQuick,sort]);
  const set = (k: keyof ListFilter, v: any) => setF((x) => ({ ...x, [k]: v || undefined }));
  const people = (ids: (string | null)[]) => [...new Set(ids.filter(Boolean) as string[])].map((id) => [id, name(id)] as [string, string]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="signal-mobile-sheet max-h-[85dvh] overflow-y-auto p-0 sm:max-w-xl sm:mx-auto sm:rounded-t-xl">
        <SheetHeader className="p-4 pb-2"><SheetTitle>Bộ lọc</SheetTitle></SheetHeader>
        <div className="px-4 grid grid-cols-2 gap-3 pb-4">
          <Field label="Lọc nhanh"><Pick value={work} onChange={v=>setWork((v||'all') as WorkQuick)} opts={[["all","Tất cả"],["high","Tiềm năng cao"],["action","Cần xử lý"],["overdue","Quá hạn xử lý"],["won","Đã chốt"]]}/></Field>
          <Field label="Sắp xếp"><Pick value={order} onChange={v=>setOrder((v||'work') as SignalSort)} opts={[["work","Ưu tiên công việc"],["newest","Mới nhất"],["oldest","Cũ nhất"],["soonest","Cần xử lý sớm"],["potential","Tiềm năng cao trước"],["value","Giá trị đã ghi nhận"],["activity","Cập nhật mới nhất"]]}/></Field>
          <Field label="Giai đoạn"><Pick value={f.stage} onChange={v=>set('stage',v)} opts={Object.entries(STAGES)}/></Field>
          <Field label="Trạng thái"><Pick value={f.quick==='all'?'':f.quick} onChange={v=>setF(x=>({...x,quick:(v||'all') as Quick}))} opts={Object.entries(STATUS_LABEL)}/></Field>
          <Field label="Mức độ tiềm năng"><Pick value={f.potential} onChange={v=>set('potential',v)} opts={Object.entries(POTENTIAL_LABEL)}/></Field>
          <Field label="Nhãn"><Pick value={f.labelId} onChange={v=>set('labelId',v)} opts={(labels.data??[]).map(l=>[l.id,l.name])}/></Field>
          <Field label="Theo dõi từ"><Input type="date" value={f.nextFrom??''} onChange={e=>set('nextFrom',e.target.value)}/></Field>
          <Field label="Theo dõi đến"><Input type="date" value={f.nextTo??''} onChange={e=>set('nextTo',e.target.value)}/></Field>
          <Field label="Thời gian (ngày tạo)"><Pick value={f.time} onChange={(v) => setF((x) => ({ ...x, time: (v || "") as any }))} opts={[["today", "Hôm nay"], ["7d", "7 ngày"], ["month", "Tháng này"], ["custom", "Tùy chỉnh"]]} /></Field>
          {f.time === "custom" && <>
            <Field label="Từ ngày"><Input type="date" value={f.from ?? ""} onChange={(e) => set("from", e.target.value)} /></Field>
            <Field label="Đến ngày"><Input type="date" value={f.to ?? ""} onChange={(e) => set("to", e.target.value)} /></Field>
          </>}
          <Field label="Nguồn"><Pick value={f.source} onChange={(v) => set("source", v)} opts={srcOpts.names.map((x) => [x, x])} /></Field>
          <Field label="Sản phẩm"><Pick value={f.product} onChange={(v) => set("product", v)} opts={prodOpts.names.map((x) => [x, x])} /></Field>
          <Field label="Nhóm nhu cầu"><Pick value={f.needGroup} onChange={(v) => set("needGroup", v)} opts={needOpts.names.map((x) => [x, x])} /></Field>
          <Field label="Lý do trượt"><Pick value={f.lostReason} onChange={(v) => set("lostReason", v)} opts={lr.all.map((x) => [x, x])} /></Field>
          {showPeople && <>
            <Field label="Sale phụ trách"><SearchPick value={f.saleId} onChange={(v) => set("saleId", v)} opts={people(data.map((s) => s.assigned_to))} placeholder="Tất cả Sale" /></Field>
            <Field label="Người tạo"><SearchPick value={f.creatorId} onChange={(v) => set("creatorId", v)} opts={people(data.map((s) => s.created_by))} placeholder="Tất cả người tạo" /></Field>
            <label className="col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" checked={!!f.unassigned} onChange={(e) => set("unassigned", e.target.checked)} />
              Chỉ tín hiệu chưa phân công
            </label>
            <label className="col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" checked={!!f.cancelled} onChange={(e) => set("cancelled", e.target.checked)} />
              Xem tín hiệu đã hủy
            </label>
          </>}
        </div>
        <div className="sticky bottom-0 bg-background border-t p-3 grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" onClick={() => { onApply({ ...emptyFilter(), q: value.q }); onOptions("all",sort); onOpenChange(false); }}>Xóa bộ lọc</Button>
          <Button size="lg" onClick={() => { onApply(f); onOptions(work,order); onOpenChange(false); }}>Áp dụng</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, v, onClick, tone }: { label: string; v: number; onClick?: () => void; tone?: "warn" }) {
  return (
    <button onClick={onClick} className={cn("rounded-xl border bg-card p-3 text-left", tone === "warn" && v > 0 && "border-amber-500/50")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-0.5">{v}</div>
    </button>
  );
}

/** Hàng chip lọc nhanh có nhãn; quá nhiều lựa chọn thì gọn lại sau "Xem thêm". */
function ChipRow({ label, items, active, onPick, extra, max = 6 }: {
  label: string; items: { k: string; label: string; n: number }[]; active: string; onPick: (k: string) => void; extra?: React.ReactNode; max?: number;
}) {
  const [more, setMore] = useState(false);
  const shown = more ? items : items.slice(0, max);
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 pt-1.5 text-xs font-medium text-muted-foreground w-24">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((x) => (
          <button key={x.k || "all"} onClick={() => onPick(x.k)}
            className={cn("shrink-0 rounded-full border px-3 py-1 text-[13px]", active === x.k ? "bg-primary text-primary-foreground border-primary font-medium" : "bg-background hover:bg-muted/60")}>
            {x.label} <span className="opacity-70">{x.n}</span>
          </button>
        ))}
        {items.length > max && (
          <button onClick={() => setMore((v) => !v)} className="shrink-0 rounded-full border border-dashed px-3 py-1 text-[13px] text-muted-foreground">
            {more ? "Thu gọn" : `Xem thêm (${items.length - max})`}
          </button>
        )}
        {extra}
      </div>
    </div>
  );
}

/** Vùng hiển thị các điều kiện đang áp dụng (có thể gỡ từng cái) + nút Xóa lọc. */
function ActiveFilters({ f, name, onChange }: { f: ListFilter; name: (id: string | null) => string; onChange: (f: ListFilter) => void }) {
  const timeLabel: Record<string, string> = { today: "Hôm nay", "7d": "7 ngày", month: "Tháng này", custom: "Tùy chỉnh" };
  const chips: { key: keyof ListFilter; label: string }[] = [];
  if (f.potential) chips.push({key:'potential',label:`Tiềm năng: ${POTENTIAL_LABEL[f.potential]}`});
  if (f.stage) chips.push({key:'stage',label:`Giai đoạn: ${STAGES[f.stage]}`});
  if (f.labelId) chips.push({key:'labelId',label:'Nhãn đã chọn'});
  if (f.quick!=='all') chips.push({key:'quick',label:STATUS_LABEL[f.quick]});
  if (f.nextFrom) chips.push({key:'nextFrom',label:`Theo dõi từ ${f.nextFrom}`});
  if (f.nextTo) chips.push({key:'nextTo',label:`Theo dõi đến ${f.nextTo}`});
  if (f.time) chips.push({ key: "time", label: `Thời gian: ${timeLabel[f.time] ?? f.time}${f.time === "custom" && (f.from || f.to) ? ` ${f.from ?? "…"}→${f.to ?? "…"}` : ""}` });
  if (f.source) chips.push({ key: "source", label: `Nguồn: ${f.source}` });
  if (f.product) chips.push({ key: "product", label: `Sản phẩm: ${f.product}` });
  if (f.needGroup) chips.push({ key: "needGroup", label: `Nhóm nhu cầu: ${f.needGroup}` });
  if (f.lostReason) chips.push({ key: "lostReason", label: `Lý do trượt: ${f.lostReason}` });
  if (f.saleId) chips.push({ key: "saleId", label: `Sale: ${name(f.saleId)}` });
  if (f.creatorId) chips.push({ key: "creatorId", label: `Người tạo: ${name(f.creatorId)}` });
  if (f.unassigned) chips.push({ key: "unassigned", label: "Chưa phân công" });
  if (f.cancelled) chips.push({ key: "cancelled", label: "Đã hủy" });
  if (chips.length === 0) return null;
  const clear = (k: keyof ListFilter) => onChange({ ...f, [k]: k==='quick'?'all':undefined, ...(k === "time" ? { from: undefined, to: undefined } : {}) });
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t pt-2.5">
      <span className="text-xs text-muted-foreground">Đang lọc:</span>
      {chips.map((c) => (
        <button key={c.key} onClick={() => clear(c.key)} title="Bấm để gỡ điều kiện"
          className="rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium hover:bg-primary/20">
          {c.label} ×
        </button>
      ))}
      <button onClick={() => onChange({ ...emptyFilter(), q: f.q })} className="text-xs text-muted-foreground underline ml-1">Xóa lọc</button>
    </div>
  );
}

/** Combobox có tìm kiếm — dùng cho Sale phụ trách / Người tạo thay vì danh sách dài. */
function SearchPick({ value, onChange, opts, placeholder }: { value?: string; onChange: (v: string) => void; opts: [string, string][]; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = opts.find(([v]) => v === value)?.[1];
  const shown = opts.filter(([, l]) => l.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="h-11 w-full rounded-md border bg-background px-3 text-sm text-left flex items-center justify-between gap-2">
        <span className={cn("truncate", !current && "text-muted-foreground")}>{current ?? placeholder}</span>
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-2 shadow-md space-y-1.5">
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên…" className="h-9" />
          <div className="max-h-44 overflow-y-auto space-y-0.5">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className={cn("w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted", !value && "font-medium text-primary")}>Tất cả</button>
            {shown.map(([v, l]) => (
              <button type="button" key={v} onClick={() => { onChange(v); setOpen(false); setQ(""); }}
                className={cn("w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted", v === value && "font-medium text-primary")}>{l}</button>
            ))}
            {shown.length === 0 && <p className="px-2 py-1.5 text-xs text-muted-foreground">Không có kết quả.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

const emptyInput = (): SignalInput => ({ detected_on: todayKey(), customer_name: "", phone: "", address: null, need_detail: null, products: [], need_group: null, need_groups: [], source: "", marketing_note: null });

function SignalForm({ initial, id, onDone }: { initial?: SignalInput; id?: string; onDone: () => void }) {
  const p = useSignalPerms();
  const qc = useQueryClient();
  const [f, setF] = useState<SignalInput>(initial ?? emptyInput());
  const [sale, setSale] = useState("");
  const [busy, setBusy] = useState(false);
  const submitLock=useRef(false);
  const [createdId, setCreatedId] = useState<string | null>(null); // đã tạo, chờ phân công lại
  const [dups, setDups] = useState<{ id: string; customer_name: string; status: string | null; detected_on: string }[]>([]);
  const sales = useQuery({ queryKey: [`${SIG}sales`, p.userId], queryFn: salesList, enabled: p.assign && !id });
  const set = <K extends keyof SignalInput>(k: K, v: SignalInput[K]) => setF((x) => ({ ...x, [k]: v }));

  const checkDup = async () => {
    const phone = normalizePhone(f.phone);
    setDups(phone ? await findSamePhone(phone, id) : []);
  };

  const retryAssign = async () => {
    if (!createdId || !sale) return;
    setBusy(true);
    try { await assignSignal(createdId, sale); await invalidateSig(qc); toast.success("Đã phân công"); onDone(); }
    catch (e) { toast.error(`Chưa phân công được: ${errMsg(e)}`); } finally { setBusy(false); }
  };

  const submit = async () => {
    const name = f.customer_name.trim();
    const phone = normalizePhone(f.phone);
    if (!name) return toast.error("Nhập tên khách hàng");
    if (!phone) return toast.error("Số điện thoại không hợp lệ (9–15 chữ số)");
    if (!f.source) return toast.error("Chọn nguồn tín hiệu");
    if (!f.detected_on) return toast.error("Chọn ngày phát hiện");
    const clean: SignalInput = { ...f, need_group: f.need_groups[0] ?? null, customer_name: name, phone, address: f.address?.trim() || null, need_detail: f.need_detail?.trim() || null, marketing_note: f.marketing_note?.trim() || null };
    if (submitLock.current) return;
    submitLock.current=true;
    setBusy(true);
    try {
      if (id) {
        await updateSignalInfo(id, clean);
      } else {
        if(!p.userId) throw new Error('Bạn cần đăng nhập');
        const s = await createSignal(clean, p.userId);
        if (sale) {
          try { await assignSignal(s.id, sale); }
          catch (e) {
            setCreatedId(s.id);
            await invalidateSig(qc);
            toast.error(`Đã tạo tín hiệu, chưa phân công thành công: ${errMsg(e)}`);
            return;
          }
        }
      }
      await invalidateSig(qc);
      toast.success(id ? "Đã cập nhật tín hiệu" : "Đã thêm tín hiệu");
      onDone();
    } catch (e) { toast.error(errMsg(e)); } finally { submitLock.current=false; setBusy(false); }
  };

  if (createdId) return (
    <div className="space-y-4 p-4 pt-2">
      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
        <b>Đã tạo tín hiệu, chưa phân công thành công.</b> Tín hiệu đã được lưu — thử phân công lại, không tạo thêm bản trùng.
      </div>
      <Field label="Sale phụ trách">
        <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={sale} onChange={(e) => setSale(e.target.value)}>
          <option value="">— Chọn Sale —</option>
          {(sales.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="lg" onClick={onDone}>Để sau</Button>
        <Button size="lg" disabled={busy || !sale} onClick={retryAssign}>{busy ? "Đang lưu…" : "Thử phân công lại"}</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-4 pt-2">
      <Section title="Khách hàng">
        <Field label="Ngày phát hiện"><Input type="date" value={f.detected_on} onChange={(e) => set("detected_on", e.target.value)} /></Field>
        <Field label="Đơn vị / Khách hàng *"><Input value={f.customer_name} maxLength={200} onChange={(e) => set("customer_name", e.target.value)} /></Field>
        <Field label="Số điện thoại *">
          <Input type="tel" inputMode="tel" value={f.phone} maxLength={20} onChange={(e) => { set("phone", e.target.value); setDups([]); }} onBlur={checkDup} placeholder="0965..." />
          {dups.length > 0 && (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-2 text-xs space-y-0.5">
              <div className="flex items-center gap-1 font-medium"><AlertTriangle className="h-3.5 w-3.5" />SĐT này đã có trong tín hiệu khác. Vẫn có thể tạo nếu là nhu cầu mới.</div>
              {dups.map((d) => <div key={d.id}>• {d.customer_name} · {fmtDate(d.detected_on)} · {d.status ? statusLabel(d.status) : "Chưa phân công"}</div>)}
            </div>
          )}
        </Field>
        <Field label="Địa chỉ"><Input value={f.address ?? ""} maxLength={500} onChange={(e) => set("address", e.target.value)} /></Field>
      </Section>
      <Section title="Nhu cầu">
        <Field label="Sản phẩm quan tâm"><MultiPick scope="signal_products" value={f.products} onChange={(v) => set("products", v)} /></Field>
        <Field label="Nhóm nhu cầu"><MultiPick scope="signal_need_groups" value={f.need_groups} onChange={(v) => setF((x) => ({ ...x, need_groups: v, need_group: v[0] ?? null }))} /></Field>
        <Field label="Chi tiết nhu cầu"><Textarea rows={3} maxLength={3000} value={f.need_detail ?? ""} onChange={(e) => set("need_detail", e.target.value)} /></Field>
      </Section>
      <Section title="Nguồn & ghi chú">
        <Field label="Nguồn tín hiệu *"><SourcePick value={f.source} onChange={(v) => set("source", v)} /></Field>
        <Field label="Ghi chú Marketing"><Textarea rows={2} maxLength={3000} value={f.marketing_note ?? ""} onChange={(e) => set("marketing_note", e.target.value)} /></Field>
        {!id && p.assignNew && (
          <Field label="Sale phụ trách">
            <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={sale} onChange={(e) => setSale(e.target.value)}>
              <option value="">Chưa phân công</option>
              {(sales.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </Field>
        )}
      </Section>
      <div className="sticky bottom-0 border-t bg-background py-3"><Button size="lg" className="w-full" disabled={busy} onClick={submit}>{busy ? "Đang lưu…" : id ? "Lưu thay đổi" : "Thêm tín hiệu"}</Button></div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-3"><div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label>{children}</div>;
}
/** Nguồn: chọn một; chỉ lựa chọn đang dùng, nhưng giữ giá trị cũ đã ngừng dùng. */
function SourcePick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const o = useOptions("signal_sources");
  const opts = value && !o.active.includes(value) ? [...o.active, value] : o.active;
  return <Select value={value} onChange={onChange} opts={opts} />;
}
function Select({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: readonly string[] }) {
  return (
    <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— Chọn —</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Pick({ value, onChange, opts }: { value?: string; onChange: (v: string) => void; opts: [string, string][] }) {
  return (
    <select className="h-11 w-full rounded-md border bg-background px-2 text-sm" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Tất cả</option>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function SignalDetail({ s, last }: { s: Signal; last?: LastNote }) {
  const p = useSignalPerms();
  const name = useUserName();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const hist = useQuery({ queryKey: [`${SIG}hist`, p.userId, s.id, s.updated_at], queryFn: () => signalHistory(s.id) });
  const progression = useQuery({ queryKey: [`${SIG}progression`, p.userId], queryFn: () => listProgression(), enabled: !!p.userId, refetchOnWindowFocus: "always" });
  const deadlines=useQuery({queryKey:[`${SIG}deadlines`,p.userId],queryFn:listDeadlines,enabled:!!p.userId,refetchInterval:10000,refetchOnWindowFocus:'always'});
  const periods=useQuery({queryKey:[`${SIG}periods`,p.userId,s.id,s.updated_at],queryFn:()=>deadlineHistory(s.id),enabled:!!p.userId,refetchInterval:10000,refetchOnWindowFocus:'always'});
  const [showProgression, setShowProgression] = useState(false);
  const sales = useQuery({ queryKey: [`${SIG}sales`, p.userId], queryFn: salesList, enabled: p.assign });
  const closed = s.status === "won" || s.status === "lost";
  const cancelled = !!s.cancelled_at;
  const canEditInfo = !closed && !cancelled && (p.edit || (p.create && s.created_by === p.userId && (!s.status || s.status === "waiting" || s.status === "consulting")));
  const canDelete = p.del && !closed && (hist.data ? hist.data.notes.length === 0 : false);
  const canConsult = !closed && !cancelled && !!s.assigned_to && ((p.sale && s.assigned_to === p.userId) || p.manage);
  const refresh = () => invalidateSig(qc);

  const doAssign = async (uid: string) => {
    try { await assignSignal(s.id, uid || null); await refresh(); toast.success(uid ? "Đã phân công" : "Đã bỏ phân công"); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const doReopen = async () => {
    const r = window.prompt("Lý do mở lại tín hiệu?");
    if (!r?.trim()) return;
    try { await reopenSignal(s.id, r.trim()); await refresh(); toast.success("Đã mở lại — lịch sử chốt/trượt cũ vẫn giữ trong nhật ký"); } catch (e) { toast.error(errMsg(e)); }
  };
  const doDelete = async () => {
    if (!window.confirm(`Xóa tín hiệu "${s.customer_name}"? Không thể hoàn tác.`)) return;
    try {
      const ok = await deleteSignal(s.id);
      if (!ok) return toast.error("Không xóa được: tín hiệu đã có nhật ký tư vấn hoặc kết quả. Hãy dùng Hủy.");
      toast.success("Đã xóa tín hiệu"); refresh();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const doCancel = async (undo: boolean) => {
    const r = undo ? (window.confirm("Bỏ hủy tín hiệu này?") ? "" : null) : window.prompt("Lý do hủy (nhập nhầm, trùng lặp…)?");
    if (r === null || (!undo && !r.trim())) return;
    try { await cancelSignal(s.id, r.trim(), undo); refresh(); toast.success(undo ? "Đã bỏ hủy" : "Đã hủy — lịch sử vẫn được giữ"); } catch (e) { toast.error(errMsg(e)); }
  };
  const accept = async () => {
    try {
      await saleUpdate(s.id, { status: "contacting", note: "", event: "Đã tiếp nhận", channel: "Zalo", next: s.next_contact_on, nextAt: s.next_contact_at ?? null, revenue: null, lostReason: null });
      toast.success("Đã tiếp nhận"); refresh();
    } catch (e) { toast.error(errMsg(e)); }
  };

  if (editing) return (
    <div><SheetHeader className="p-4 pb-0"><SheetTitle>Sửa thông tin tín hiệu</SheetTitle></SheetHeader>
      <SignalForm id={s.id} initial={{ detected_on: s.detected_on, customer_name: s.customer_name, phone: s.phone, address: s.address, need_detail: s.need_detail, products: s.products, need_group: s.need_group, need_groups: needGroupsOf(s), source: s.source, marketing_note: s.marketing_note }} onDone={() => setEditing(false)} />
    </div>
  );

  const timeline = [
    ...(hist.data?.notes ?? []).map((n) => ({ t: n.created_at, who: n.author_id, body: (
      <>
        <div className="text-xs text-muted-foreground">{fmtTime(n.created_at)} · <b className="text-foreground uppercase">{name(n.author_id)}</b>{n.channel ? ` | ${n.channel.toUpperCase()}` : ""}</div>
        {n.event_type && <div className="font-semibold uppercase text-[13px]">{n.event_type}</div>}
        {n.status_from !== n.status_to && n.status_to && <div className="text-xs text-muted-foreground">{statusLabel(n.status_from)} → <b>{statusLabel(n.status_to)}</b>{n.revenue ? ` · ${fmtVnd(n.revenue)}` : ""}{n.lost_reason ? ` · ${n.lost_reason}` : ""}</div>}
        {n.note && <div className="whitespace-pre-wrap">{n.note}</div>}
      </>
    ) })),
    ...(hist.data?.events ?? []).map((e) => ({ t: e.created_at, who: e.actor_id, body: (
      <>
        <div className="text-xs text-muted-foreground">{fmtTime(e.created_at)} · <b className="text-foreground uppercase">{name(e.actor_id)}</b></div>
        <div className="text-xs text-muted-foreground italic">
          {e.kind === "assign" ? `Phân công: ${e.detail?.from ? name(e.detail.from) : "Chưa phân công"} → ${e.detail?.to ? name(e.detail.to) : "Chưa phân công"}`
            : e.kind === "reopen" ? `Mở lại tín hiệu (trước: ${statusLabel(e.detail?.prev_status)}${e.detail?.prev_revenue ? ` · ${fmtVnd(e.detail.prev_revenue)}` : ""}${e.detail?.prev_lost_reason ? ` · ${e.detail.prev_lost_reason}` : ""}). Lý do: ${e.detail?.reason}`
            : e.kind === "cancel" ? `Hủy tín hiệu. Lý do: ${e.detail?.reason ?? ""}`
            : e.kind === "uncancel" ? `Bỏ hủy tín hiệu${e.detail?.prev_reason ? ` (lý do hủy trước: ${e.detail.prev_reason})` : ""}`
            : e.kind === 'enrichment' ? `Tiềm năng: ${POTENTIAL_LABEL[e.detail?.potential_from as keyof typeof POTENTIAL_LABEL]??'Chưa đánh giá'} → ${POTENTIAL_LABEL[e.detail?.potential_to as keyof typeof POTENTIAL_LABEL]??'Chưa đánh giá'}${e.detail && ('next_from' in e.detail || 'next_to' in e.detail) ? ` · Theo dõi: ${fmtDate(e.detail.next_from)} → ${fmtDate(e.detail.next_to)}` : ''}`
            : "Cập nhật thông tin khách hàng"}
        </div>
      </>
    ) })),
  ].sort((a, b) => b.t.localeCompare(a.t));
  const shown = showAll ? timeline : timeline.slice(0, 3);

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-4 border-b space-y-2">
        <div className="flex items-start justify-between gap-2 pr-8">
          <h2 className="text-lg font-semibold leading-tight">{s.customer_name}</h2>
          <div className="flex items-center gap-1">
            <StatusPill s={s} />
            {(canEditInfo || canDelete || p.manage) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label="Thao tác"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditInfo && <DropdownMenuItem onClick={() => setEditing(true)}><PencilLine className="h-4 w-4 mr-2" />Sửa tín hiệu</DropdownMenuItem>}
                  {canDelete && <DropdownMenuItem onClick={doDelete} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Xóa tín hiệu</DropdownMenuItem>}
                  {p.manage && (cancelled
                    ? <DropdownMenuItem onClick={() => doCancel(true)}><Undo2 className="h-4 w-4 mr-2" />Bỏ hủy</DropdownMenuItem>
                    : <DropdownMenuItem onClick={() => doCancel(false)}><Ban className="h-4 w-4 mr-2" />Hủy tín hiệu</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {cancelled && <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">Đã hủy {fmtTime(s.cancelled_at ?? s.updated_at)}: {s.cancel_reason}. Không tính vào báo cáo.</div>}
        <a href={`tel:${s.phone}`} className="block font-mono text-base text-primary">{s.phone}</a>
        <div className="text-sm">{[s.products.join(", "), needGroupsOf(s).join(", ")].filter(Boolean).join(" · ") || "—"}</div>
        <div className="text-sm text-muted-foreground">Gần nhất: {lastText(last) ?? "Chưa có diễn biến"}</div>
        <div className="text-sm text-muted-foreground">
          Sale: {s.assigned_to ? name(s.assigned_to) : "Chưa phân công"}
          {s.status === "won" && s.revenue ? ` · Doanh số ${fmtVnd(s.revenue)}` : ""}{s.lost_reason ? ` · ${s.lost_reason}` : ""}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button asChild size="lg" className="h-12 px-2"><a href={zaloLink(s.phone)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4 mr-1" />Zalo</a></Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-2"><a href={`tel:${s.phone}`}><Phone className="h-4 w-4 mr-1" />Gọi</a></Button>
          <Button size="lg" variant="secondary" className="h-12 px-2" disabled={!canConsult} onClick={() => setUpdating(true)}><PencilLine className="h-4 w-4 mr-1" />Cập nhật</Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Nút Zalo mở trang Zalo theo số điện thoại; tùy thiết lập của khách, có thể không mở thẳng được cuộc trò chuyện.</p>
        {canConsult && s.status === "waiting" && <Button size="lg" className="w-full" onClick={accept}>Tiếp nhận tín hiệu</Button>}
      </div>

      <div className="p-4 space-y-5 flex-1">
        <SignalEnrichment key={s.id} s={s} uid={p.userId} canEdit={!cancelled&&((p.sale&&s.assigned_to===p.userId)||p.manage)} catalog={p.catalog} sale={p.sale} onSaved={()=>void refresh()}/>
        {s.next_contact_on&&<p className="text-sm">Lịch theo dõi: <b>{fmtNext(s)}</b></p>}
        {progression.error || deadlines.error ? <p className="text-sm text-destructive">Không tải được diễn biến: {errMsg(progression.error||deadlines.error)}</p> : progression.isPending ? <p className="text-sm text-muted-foreground">Đang tải diễn biến…</p> : <ProgressionSummary s={s} row={progression.data?.[s.id]} deadline={deadlines.data?.[s.id]} onUpdate={canConsult?()=>setUpdating(true):undefined} />}
        {!!periods.data?.length && <Section title="Lịch sử kỳ cập nhật"><ol className="space-y-3 border-l pl-4">{periods.data.slice(0,showProgression?undefined:3).map(r=><li key={`${r.assignment_id}:${r.sequence}`} className="text-sm"><p className="font-medium">Kỳ {r.sequence} · {name(r.sale_id)}</p><p className="text-xs text-muted-foreground">Hạn {r.due_on.split('-').reverse().join('/')} · {({pending:'Chưa đến hạn',on_time:'Đúng hạn',missed:'Trễ hạn',exempt:'Miễn — kết thúc trách nhiệm trước hạn'})[r.outcome]}</p></li>)}</ol></Section>}
        {periods.error && <p className="text-xs text-destructive">Không tải được lịch sử kỳ: {errMsg(periods.error)}</p>}
        <Section title="Lịch sử diễn biến">
          {hist.error ? <p className="text-sm text-destructive">{errMsg(hist.error)}</p> : <>
            <ol className="space-y-3 border-l pl-4">
              {(hist.data?.notes ?? []).filter(validProgression).slice(0, showProgression ? undefined : 3).map(n => <li key={n.id} className="text-sm space-y-1"><div className="text-xs text-muted-foreground">{fmtTime(n.created_at)} · {name(n.author_id)}</div><p className="whitespace-pre-wrap">{[n.event_type,n.note].filter(Boolean).join(' — ')}</p></li>)}
            </ol>
            {(hist.data?.notes ?? []).filter(validProgression).length > 3 && <Button variant="ghost" size="sm" onClick={() => setShowProgression(v => !v)}>{showProgression ? 'Thu gọn' : 'Xem thêm diễn biến'}</Button>}
            <p className="text-xs text-muted-foreground">Lịch sử cũ tính nội dung và gợi ý tư vấn xác định được; không tính tiếp nhận hoặc đổi trạng thái đơn thuần. Chưa thể xác minh các lần retry cũ.</p>
          </>}
        </Section>
        <Section title="Nhật ký tư vấn">
          {hist.isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : timeline.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có diễn biến.</p> : (
            <>
              <ol className="space-y-3 border-l pl-4">
                {shown.map((x, i) => <li key={i} className="text-sm space-y-0.5">{x.body}</li>)}
              </ol>
              {timeline.length > 3 && <Button variant="ghost" size="sm" onClick={() => setShowAll((v) => !v)}>{showAll ? "Thu gọn" : `Xem toàn bộ nhật ký (${timeline.length})`}</Button>}
            </>
          )}
        </Section>

        <Section title="Thông tin khách hàng">
          <div className="rounded-lg border bg-muted/20 p-3 text-sm space-y-1.5">
            <Row k="Địa chỉ">{s.address || "—"}</Row>
            <Row k="Ngày phát hiện">{fmtDate(s.detected_on)}</Row>
            <Row k="Nguồn">{s.source}</Row>
            <Row k="Chi tiết nhu cầu"><span className="whitespace-pre-wrap">{s.need_detail || "—"}</span></Row>
            <Row k="Ghi chú Marketing"><span className="whitespace-pre-wrap">{s.marketing_note || "—"}</span></Row>
            <Row k="Người tạo">{name(s.created_by)} · {fmtTime(s.created_at)}</Row>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEditInfo && <Button variant="outline" onClick={() => setEditing(true)}>Sửa thông tin</Button>}
            {closed && p.manage && <Button variant="outline" onClick={doReopen}><RotateCcw className="h-4 w-4 mr-1" />Mở lại</Button>}
          </div>
          {(s.assigned_to ? p.reassign : p.assignNew) && !closed && (
            <Field label="Sale phụ trách">
              <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={s.assigned_to ?? ""} onChange={(e) => doAssign(e.target.value)}>
                <option value="">Chưa phân công</option>
                {s.assigned_to && !(sales.data ?? []).some((u) => u.id === s.assigned_to) && <option value={s.assigned_to}>{name(s.assigned_to)}</option>}
                {(sales.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </Field>
          )}
        </Section>
      </div>

      <Sheet open={updating} onOpenChange={setUpdating}>
        <SheetContent side="bottom" className="signal-mobile-sheet max-h-[90dvh] overflow-y-auto p-0 sm:max-w-xl sm:mx-auto sm:rounded-t-xl">
          <SheetHeader className="p-4 pb-2"><SheetTitle>Cập nhật diễn biến</SheetTitle></SheetHeader>
          {updating && <UpdateForm s={s} onSaved={() => { setUpdating(false); refresh(); }} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="grid grid-cols-[120px_1fr] gap-2"><span className="text-muted-foreground">{k}</span><span>{children}</span></div>;
}


/** "YYYY-MM-DDTHH:mm" (giờ Việt Nam) → ISO */
const vnLocalToIso = (v: string) => new Date(`${v}:00+07:00`).toISOString();

function UpdateForm({ s, onSaved }: { s: Signal; onSaved: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [extra, setExtra] = useState("");
  const [preview, setPreview] = useState(false);
  const saving = useRef(false);
  const request = useRef<{ id: string; payload: string } | null>(null);
  const [note, setNote] = useState("");

  const [status, setStatus] = useState<SignalStatus>(s.status as SignalStatus);
  const [revenue, setRevenue] = useState("");
  const [reason, setReason] = useState("");
  const lr = useLostReasons();
  const [reasonOther, setReasonOther] = useState("");
  const [busy, setBusy] = useState(false);
  const compose = (items: string[], text: string) => { setNote(composeProgression(items,text)); setPreview(false); };
  const suggested=suggestedProgressionStatus(s.status,selected);
  const [dismissed,setDismissed]=useState<string|null>(null);
  const closing = status === "won" || status === "lost";

  const save = async () => {
    if (saving.current) return;
    const rev = status === "won" ? Number(revenue.replace(/[^\d]/g, "")) : null;
    if (status === "won" && (!rev || rev <= 0)) return toast.error("Chốt bắt buộc nhập doanh số");
    const lost = status === "lost" ? (reason === "Khác" ? (reasonOther.trim() ? `Khác: ${reasonOther.trim()}` : "") : reason) : null;
    if (status === "lost" && !lost) return toast.error(reason === "Khác" ? "Nhập lý do trượt cụ thể" : "Trượt bắt buộc chọn lý do");
    if (status === s.status && !note.trim()) return toast.error("Chọn diễn biến hoặc nhập nội dung");
    saving.current = true;
    setBusy(true);
    try {
      const payload = JSON.stringify([s.id,status,note,rev,lost]);
      if (request.current?.payload !== payload) request.current = { id: crypto.randomUUID(), payload };
      // Không còn lịch hẹn trên giao diện; giữ nguyên giá trị cũ trong dữ liệu.
      await saveProgression(s.id, request.current.id, {
        status, note, event: null, channel: "Zalo",
        next: closing ? null : s.next_contact_on, nextAt: closing ? null : s.next_contact_at ?? null,
        revenue: rev, lostReason: lost,
      });

      toast.success("Đã lưu diễn biến");
      onSaved();
    } catch (e) { toast.error(errMsg(e)); } finally { saving.current = false; setBusy(false); }
  };

  return (
    <div>
      <div className="px-4 space-y-4 pb-4">
        <details open className="space-y-3">
          <summary className="cursor-pointer text-sm font-medium">Gợi ý diễn biến</summary>
          {progressionSuggestions(needGroupsOf(s)).map(group => <div key={group.label} className="space-y-1.5"><div className="text-xs font-semibold text-muted-foreground">{group.label}</div><div className="flex flex-wrap gap-2">{group.items.map(item => <Button key={item} type="button" variant={selected.includes(item) ? "default" : "outline"} size="sm" className="h-auto min-h-10 whitespace-normal rounded-full px-3 py-2 text-left" aria-pressed={selected.includes(item)} onClick={() => { const next=selected.includes(item) ? selected.filter(x=>x!==item) : [...selected,item]; setSelected(next); compose(next,extra); }}>{item}</Button>)}</div></div>)}
        </details>
        <Field label="Ghi chú bổ sung"><Textarea rows={3} maxLength={3000} value={extra} onChange={e => {setExtra(e.target.value); compose(selected,e.target.value);}} placeholder="Diễn biến thực tế của khách…" /></Field>
        <div className="flex items-center justify-between"><Label>Nội dung sẽ lưu</Label><Button variant="ghost" size="sm" onClick={() => setPreview(v=>!v)}>{preview ? 'Chỉnh sửa' : 'Xem trước'}</Button></div>
        {preview ? <p className="min-h-24 whitespace-pre-wrap rounded-md border p-3 text-sm">{note || 'Chưa có nội dung'}</p> : <Textarea aria-label="Nội dung sẽ lưu" rows={4} maxLength={3000} value={note} onChange={e=>setNote(e.target.value)} />}
        {suggested && status===s.status && dismissed!==suggested && <div className="border-l-2 border-primary pl-3 space-y-2"><p className="text-sm">Diễn biến đã chọn phù hợp với “{STATUS_LABEL[suggested]}”. Bạn có muốn chuyển trạng thái không?</p><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={()=>setStatus(suggested)}>Chuyển sang {STATUS_LABEL[suggested]}</Button><Button variant="outline" onClick={()=>setDismissed(suggested)}>Giữ nguyên</Button></div></div>}
        {selected.includes('Khách đồng ý đặt hàng') && status!=='won' && <p className="text-sm text-muted-foreground">Khách đồng ý đặt hàng — xem xét chuyển Chốt theo quy trình và nhập doanh số.</p>}
        <Field label="Trạng thái (mặc định giữ nguyên)">
          <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as SignalStatus)}>
            {[...OPEN_STATUSES, "won", "lost"].map((o) => <option key={o} value={o}>{STATUS_LABEL[o as SignalStatus]}{o === s.status ? " (hiện tại)" : ""}</option>)}
          </select>
        </Field>
        {status === "won" && <Field label="Doanh số chốt (VNĐ) *"><Input inputMode="numeric" value={revenue} onChange={(e) => setRevenue(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, "."))} placeholder="VD: 15.000.000" /></Field>}
        {status === "lost" && <>
          <Field label="Lý do trượt *"><Select value={reason} onChange={setReason} opts={lr.all} /></Field>
          {reason === "Khác" && <Field label="Lý do cụ thể *"><Input maxLength={300} value={reasonOther} onChange={(e) => setReasonOther(e.target.value)} /></Field>}
          <p className="text-xs text-muted-foreground">Khách chưa phản hồi chưa phải Trượt — có thể giữ "Đang liên hệ".</p>
        </>}
        {closing && <p className="text-xs text-muted-foreground">Sau khi Chốt/Trượt, tín hiệu khóa lại. Chỉ Quản lý mới mở lại được. Doanh số là số Sale khai báo, chưa phải doanh thu kế toán.</p>}
      </div>
      <div className="sticky bottom-0 bg-background border-t p-3">
        <Button size="lg" className="w-full h-12 text-base" disabled={busy} onClick={save}>{busy ? "Đang lưu…" : "Lưu cập nhật"}</Button>
      </div>
    </div>
  );
}

function LostReasonsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const lr = useLostReasons();
  const qc = useQueryClient();
  const [v, setV] = useState("");
  const save = async (items: string[]) => {
    try { await setCustomLostReasons(items); await invalidateSig(qc); toast.success("Đã lưu danh sách lý do"); } catch (e) { toast.error(errMsg(e)); }
  };
  const add = () => {
    const x = v.trim();
    if (!x || lr.all.includes(x)) return toast.error("Lý do trống hoặc đã có");
    setV(""); save([...lr.custom, x]);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto sm:max-w-xl sm:mx-auto sm:rounded-t-xl">
        <SheetHeader><SheetTitle>Lý do trượt</SheetTitle></SheetHeader>
        <p className="text-xs text-muted-foreground mt-1">9 lý do mặc định luôn có. Bỏ lý do tùy chỉnh không làm thay đổi lịch sử đã ghi.</p>
        <ul className="mt-3 space-y-1 text-sm">
          {SIGNAL_LOST_REASONS.filter((x) => x !== "Khác").map((x) => <li key={x} className="text-muted-foreground">{x}</li>)}
          {lr.custom.map((x) => (
            <li key={x} className="flex items-center justify-between rounded border px-2 py-1">
              <span>{x}</span>
              <Button size="sm" variant="ghost" onClick={() => save(lr.custom.filter((y) => y !== x))}>Bỏ</Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-3">
          <Input value={v} maxLength={200} onChange={(e) => setV(e.target.value)} placeholder="Thêm lý do mới" />
          <Button onClick={add}>Thêm</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Chọn nhiều có tìm kiếm; "+ Thêm mới" và quản lý chỉ với người có quyền danh mục. */
function MultiPick({ scope, value, onChange }: { scope: OptionScope; value: string[]; onChange: (v: string[]) => void }) {
  const p = useSignalPerms();
  const qc = useQueryClient();
  const o = useOptions(scope);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [manage, setManage] = useState(false);
  const [other, setOther] = useState("");
  const toggle = (x: string) => onChange(value.includes(x) ? value.filter((y) => y !== x) : [...value, x]);
  const shown = o.active.filter((x) => x.toLowerCase().includes(q.trim().toLowerCase()));
  const persist = async (items: CatOption[]) => { await saveOptions(scope, items); await qc.invalidateQueries({ queryKey: [`${SIG}opt:${scope}`] }); };
  const add = async () => {
    try { const items = addOption(o.all, q); await persist(items); toggle(items[items.length - 1].name); setQ(""); toast.success("Đã thêm vào danh mục"); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const addOther = () => { const t = other.trim(); if (!t) return; const v = `Khác: ${t}`; if (!value.includes(v)) onChange([...value.filter((x) => x !== "Khác"), v]); setOther(""); };
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {value.map((x) => <button type="button" key={x} onClick={() => toggle(x)} className="rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-xs">{x} ×</button>)}
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-full border px-2.5 py-1 text-xs bg-card">{open ? "Đóng" : value.length ? "Thay đổi" : "Chọn…"}</button>
      </div>
      {open && (
        <div className="rounded-md border bg-card p-2 space-y-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm…" className="h-9" />
          <div className="max-h-48 overflow-y-auto flex flex-wrap gap-1.5">
            {shown.map((x) => { const on = value.includes(x); return <button type="button" key={x} onClick={() => toggle(x)} className={cn("rounded-full border px-3 py-1.5 text-sm", on ? "bg-primary text-primary-foreground border-primary" : "bg-background")}>{x}</button>; })}
            {shown.length === 0 && <span className="text-xs text-muted-foreground">Không có lựa chọn phù hợp.</span>}
          </div>
          {value.includes("Khác") && (
            <div className="flex gap-1"><Input className="h-9" value={other} onChange={(e) => setOther(e.target.value)} placeholder="Nội dung riêng cho tín hiệu này" maxLength={100} /><Button type="button" size="sm" variant="outline" onClick={addOther}>Ghi</Button></div>
          )}
          {p.catalog && (
            <div className="flex flex-wrap gap-2 border-t pt-2">
              <Button type="button" size="sm" variant="outline" disabled={!q.trim()} onClick={add}><Plus className="h-3.5 w-3.5 mr-1" />Thêm mới{q.trim() ? ` "${q.trim()}"` : ""}</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setManage((v) => !v)}>Quản lý danh mục</Button>
            </div>
          )}
          {p.catalog && manage && (
            <ul className="space-y-1 text-sm">
              {o.all.map((it) => (
                <li key={it.name} className="flex items-center gap-2">
                  <span className={cn("flex-1", !it.active && "line-through text-muted-foreground")}>{it.name}</span>
                  <button type="button" className="text-xs underline" onClick={async () => {
                    const to = window.prompt("Tên mới", it.name); if (!to || to.trim() === it.name) return;
                    try { const items = renameOption(o.all, it.name, to); const renamed = items.find((x, i) => o.all[i].name === it.name); if(!renamed)return;const nn=renamed.name; await renameOptionEverywhere(scope, it.name, nn, items); await qc.invalidateQueries({ queryKey: [`${SIG}opt:${scope}`] }); await invalidateSig(qc); onChange(value.map((v) => (v === it.name ? nn : v))); toast.success("Đã đổi tên, tín hiệu cũ được cập nhật theo"); }
                    catch (e) { toast.error(errMsg(e)); }
                  }}>Đổi tên</button>
                  <button type="button" className="text-xs underline" onClick={async () => { try { await persist(toggleOption(o.all, it.name)); } catch (e) { toast.error(errMsg(e)); } }}>{it.active ? "Ngừng dùng" : "Dùng lại"}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
