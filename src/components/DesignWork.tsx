import { useState } from "react";
import {
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Settings,
  Search,
  ArrowUpRight,
  CalendarDays,
  UserRound,
  X,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Inbox,
} from "lucide-react";
import {
  useStore,
  fmtDate,
  ORDER_STATUSES,
  type DesignOrder,
} from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import {
  DESIGN_FLOWS,
  designAny,
  designCan,
  designLabel,
  designOverdue,
  type DesignFlow,
} from "@/lib/orders/design";
import {
  DESIGN_STAGES,
  designStage,
  designClosed,
  designQueueMatches,
  sortDesignOrders,
  type DesignQueue,
  type DesignSort,
} from "@/lib/orders/workboard";
import { OrderDetailDialog } from "@/components/OrderDetail";
import { OrderReport } from "@/components/OrderReport";
import { DesignCatalogSettings } from "./DesignCatalogSettings";
import { DesignZaloSettings } from './DesignZaloSettings';
import {supabase} from '@/integrations/supabase/client';
import {useQuery} from '@tanstack/react-query';
import { useDesignCatalogs, workLabel } from "@/lib/orders/catalogs";
import { DesignWorkForm } from "@/components/DesignWorkForm";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 40;
const queues: { key: DesignQueue; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "assigned", label: "Tôi phụ trách" },
  { key: "review", label: "Chờ tôi duyệt" },
  { key: "mine", label: "Tôi yêu cầu" },
];
export function DesignWork({
  flow,
  reportOnly = false,
  openId,
  onCloseDeepLink,
}: {
  flow?: DesignFlow;
  reportOnly?: boolean;
  openId?: string;
  onCloseDeepLink?: () => void;
}) {
  const s = useStore();
  const { user, can } = useCurrentUser();
  const [report, setReport] = useState(reportOnly);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");
  const [queue, setQueue] = useState<DesignQueue>("all");
  const [selectedFlow, setFlow] = useState("all");
  const [person, setPerson] = useState("all");
  const [deadline, setDeadline] = useState("");
  const [filters, setFilters] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [kanban, setKanban] = useState(false);
  const [sort, setSort] = useState<DesignSort>("attention");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const catalogs = useDesignCatalogs();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [settingsTab,setSettingsTab]=useState<'catalogs'|'zalo'>('catalogs');
  const designTeam=useQuery({queryKey:['design-team-access',user?.id],enabled:!!user?.id,
    queryFn:async()=>{const {data,error}=await (supabase as any).rpc('design_team_access');if(error)throw error;return !!data;},staleTime:60000,retry:1});
  const [category, setCategory] = useState("all");
  const [product, setProduct] = useState("all");
  const actor = user ?? {};
  const update = (change: () => void) => {
    change();
    setLimit(PAGE_SIZE);
  };
  const chooseQueue = (value: DesignQueue) =>
    update(() => {
      setQueue(value);
      setStage("all");
      setStatus("all");
    });
  const clearFilters = () =>
    update(() => {
      setCategory("all");
      setProduct("all");
      setFlow("all");
      setPerson("all");
      setDeadline("");
      setStatus("all");
      setStage("all");
      setQueue("all");
      setSearch("");
    });
  if (!flow && !designTeam.data) return openId ? <div className="p-4"><OrderDetailDialog orderId={openId} open onOpenChange={v=>{if(!v)onCloseDeepLink?.();}}/></div> : <p className="p-4 text-sm text-muted-foreground">Trang Tất cả thiết kế dành riêng cho bộ phận Thiết kế.</p>;
  if (!designAny(can, "view") && !designAny(can, "report_view") && !designAny(can,"create"))
    return (
      <p className="text-muted-foreground">
        Bạn không có quyền truy cập Thiết Kế.
      </p>
    );
  if (
    flow &&
    !designCan(can, flow, "view") &&
    !designCan(can, flow, "report_view") &&
    !designCan(can, flow, "create")
  )
    return (
      <p className="text-muted-foreground">
        Bạn không có quyền truy cập luồng này.
      </p>
    );
  const source = s.orders.filter((o) => !flow || o.workflowKind === flow);
  const query = search.trim().toLocaleLowerCase("vi");
  const base = source.filter(
    (o) =>
      (category === "all" || o.workCategoryId === category) &&
      (product === "all" || o.productIds?.includes(product)) &&
      (selectedFlow === "all" ||
        (selectedFlow === "unknown"
          ? !o.workflowKind
          : o.workflowKind === selectedFlow)) &&
      (!query ||
        `${o.title} ${o.id} ${o.assignee ?? ""} ${o.requester ?? ""}`
          .toLocaleLowerCase("vi")
          .includes(query)) &&
      (person === "all" || o.assignee === person) &&
      (!deadline || o.deadline === deadline),
  );
  const scoped = base.filter((o) => designQueueMatches(o, queue, actor));
  const rows = sortDesignOrders(
    scoped.filter(
      (o) =>
        (stage === "all" || designStage(o.status) === stage) &&
        (status === "all" || o.status === status),
    ),
    sort,
  );
  const visible = rows.slice(0, limit);
  const target = selected || openId || null;
  const advancedCount =
    [category, product, selectedFlow, person].filter((v) => v !== "all")
      .length +
    Number(!!deadline) +
    Number(status !== "all");
  const hasFilters =
    advancedCount > 0 || stage !== "all" || queue !== "all" || !!query;
  const title = reportOnly
    ? "Báo cáo & Phân tích"
    : flow
      ? designLabel(flow)
      : "Tất cả công việc";
  const metrics = [
    {
      key: "open" as const,
      label: "Đang mở",
      count: base.filter((o) => !designClosed(o)).length,
      icon: Clock3,
      note: "Công việc chưa kết thúc",
    },
    {
      key: "review" as const,
      label: "Chờ tôi duyệt",
      count: base.filter((o) => designQueueMatches(o, "review", actor)).length,
      icon: CheckCircle2,
      note: "Đúng người được chỉ định",
    },
    {
      key: "overdue" as const,
      label: "Quá hạn",
      count: base.filter((o) => designOverdue(o)).length,
      icon: AlertCircle,
      note: "Cần ưu tiên xử lý",
    },
    {
      key: "unassigned" as const,
      label: "Chưa phân công",
      count: base.filter((o) => designQueueMatches(o, "unassigned", actor))
        .length,
      icon: Inbox,
      note: "Chưa có người thực hiện",
    },
  ];
  const controls = (
    <div className="space-y-5">
      <div>
        <Label>Loại công việc</Label>
        <Select
          value={category}
          onValueChange={(v) => update(() => setCategory(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {(catalogs.data || [])
              .filter(
                (c) => c.kind === "work" && (!flow || c.workflow_kind === flow),
              )
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {(!flow || flow === "order_mockup") && (
        <div>
          <Label>Sản phẩm áp dụng</Label>
          <Select
            value={product}
            onValueChange={(v) => update(() => setProduct(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sản phẩm</SelectItem>
              {(catalogs.data || [])
                .filter((c) => c.kind === "product")
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {!flow && (
        <div>
          <Label>Luồng công việc</Label>
          <Select
            value={selectedFlow}
            onValueChange={(v) => update(() => setFlow(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả luồng</SelectItem>
              {DESIGN_FLOWS.filter((f) => designCan(can, f.key, "view")).map(
                (f) => (
                  <SelectItem key={f.key} value={f.key}>
                    {f.label}
                  </SelectItem>
                ),
              )}
              <SelectItem value="unknown">Chưa phân loại luồng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label>Người thực hiện</Label>
        <Select
          value={person}
          onValueChange={(v) => update(() => setPerson(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[
              ...new Set(
                source.map((o) => o.assignee).filter((n): n is string => !!n),
              ),
            ]
              .sort()
              .map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Trạng thái chi tiết</Label>
        <Select
          value={status}
          onValueChange={(v) =>
            update(() => {
              setStatus(v);
              setStage("all");
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {ORDER_STATUSES.map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Deadline</Label>
        <Input
          type="date"
          value={deadline}
          onChange={(e) => update(() => setDeadline(e.target.value))}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={clearFilters}>
          Xóa bộ lọc
        </Button>
        <Button className="flex-1" onClick={() => setFilters(false)}>
          Xem {rows.length} công việc
        </Button>
      </div>
    </div>
  );
  const card = (o: DesignOrder) => (
    <article
      key={o.id}
      className={`min-w-0 rounded-xl border bg-card p-4 shadow-sm ${designOverdue(o) ? "border-l-4 border-l-destructive" : ""}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <StatusBadge value={o.status} />
        {(o.priority === "Gấp" || o.priority === "Cao") && (
          <StatusBadge value={o.priority} />
        )}
      </div>
      <button
        type="button"
        className="mb-1 block w-full break-words text-left text-sm font-semibold leading-6 hover:text-primary focus-visible:outline-primary"
        onClick={() => setSelected(o.id)}
      >
        {o.title || "Công việc chưa đặt tên"}
      </button>
      <p className="mb-4 text-xs text-muted-foreground">
        {flow ? workLabel(o, catalogs.data || []) : designLabel(o.workflowKind)}
      </p>
      <div className="space-y-2 text-xs">
        <p className="flex items-center gap-2">
          <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{o.assignee || "Chưa phân công"}</span>
        </p>
        <p
          className={`flex items-center gap-2 ${designOverdue(o) ? "font-medium text-destructive" : "text-muted-foreground"}`}
        >
          <CalendarDays className="size-3.5 shrink-0" />
          {o.deadline ? fmtDate(o.deadline) : "Chưa có deadline"}
          {designOverdue(o) && " · Quá hạn"}
        </p>
      </div>
      {o.status === "Cần sửa" && o.reviewNotes && (
        <p className="mt-3 line-clamp-2 rounded-md bg-destructive/5 p-2 text-xs text-destructive">
          {o.reviewNotes}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <span className="min-w-0 truncate text-xs text-muted-foreground">
          Yêu cầu: {o.requester || "—"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 text-primary"
          onClick={() => setSelected(o.id)}
        >
          Mở việc
          <ArrowUpRight className="ml-1 size-3.5" />
        </Button>
      </div>
    </article>
  );
  return (
    <div className="design-workspace min-w-0 w-full max-w-full space-y-5 pb-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Không gian Thiết kế
          </p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {title}
          </h1>
          <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
            Theo dõi đầu việc, phản hồi và bàn giao trên cùng một luồng.
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {can("settings.role") && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cài đặt Thiết kế"
              onClick={() => setCatalogOpen(true)}
            >
              <Settings className="size-4" />
            </Button>
          )}
          {!reportOnly &&
            (flow
              ? designCan(can, flow, "create")
              : designAny(can, "create")) && (
              <Button onClick={() => setAdding(true)}>
                <Plus className="size-4 sm:mr-1" />
                <span className="hidden sm:inline">Tạo công việc</span>
                <span className="sr-only sm:hidden">Tạo công việc</span>
              </Button>
            )}
        </div>
      </header>
      {flow && (
        <div className="flex gap-1 border-b pb-2">
          <Button
            variant={!report ? "secondary" : "ghost"}
            onClick={() => setReport(false)}
          >
            Công việc
          </Button>
          {designCan(can, flow, "report_view") && (
            <Button
              variant={report ? "secondary" : "ghost"}
              onClick={() => setReport(true)}
            >
              Báo cáo
            </Button>
          )}
        </div>
      )}
      {report ? (
        designAny(can, "report_view") && <OrderReport flow={flow} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {metrics.map((m) => (
              <button
                key={m.key}
                type="button"
                aria-pressed={queue === m.key}
                onClick={() => chooseQueue(m.key)}
                className={`min-w-0 rounded-xl border bg-card p-3 text-left transition-colors sm:p-4 hover:border-primary/50 focus-visible:outline-primary ${queue === m.key ? "border-primary/60 ring-1 ring-primary/10" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 text-xs font-medium leading-5 text-muted-foreground">
                    {m.label}
                  </span>
                  <m.icon
                    className={`size-4 ${m.key === "overdue" && m.count ? "text-destructive" : "text-muted-foreground"}`}
                  />
                </div>
                <p
                  className={`my-2 text-2xl font-semibold tabular-nums ${m.key === "overdue" && m.count ? "text-destructive" : ""}`}
                >
                  {s.loaded ? m.count : "—"}
                </p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {m.note}
                </p>
              </button>
            ))}
          </div>
          <section className="min-w-0 rounded-xl border bg-card">
            <div
              className="flex gap-1 overflow-x-auto border-b px-3 pt-2"
              aria-label="Phạm vi công việc"
            >
              {queues.map((q) => (
                <button
                  key={q.key}
                  type="button"
                  aria-pressed={queue === q.key}
                  onClick={() => chooseQueue(q.key)}
                  className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium ${queue === q.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {q.label}
                  <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums">
                    {
                      base.filter((o) => designQueueMatches(o, q.key, actor))
                        .length
                    }
                  </span>
                </button>
              ))}
            </div>
            <div className="space-y-3 p-3 md:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-0 basis-full flex-1 sm:basis-48">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    aria-label="Tìm công việc thiết kế"
                    className="pl-9"
                    placeholder="Tìm tên việc, người thực hiện…"
                    value={search}
                    onChange={(e) => update(() => setSearch(e.target.value))}
                  />
                </div>
                <Button variant="outline" onClick={() => setFilters(true)}>
                  <SlidersHorizontal className="mr-1 size-4" />
                  Bộ lọc
                  {advancedCount > 0 && (
                    <span className="ml-1 rounded bg-primary px-1.5 text-xs text-primary-foreground">
                      {advancedCount}
                    </span>
                  )}
                </Button>
                <div
                  className="ml-auto flex shrink-0 rounded-lg border p-0.5 sm:ml-0"
                  aria-label="Cách hiển thị"
                >
                  <Button
                    variant={!kanban ? "secondary" : "ghost"}
                    size="icon"
                    className="size-9"
                    aria-label="Danh sách"
                    aria-pressed={!kanban}
                    onClick={() => setKanban(false)}
                  >
                    <List className="size-4" />
                  </Button>
                  <Button
                    variant={kanban ? "secondary" : "ghost"}
                    size="icon"
                    className="size-9"
                    aria-label="Kanban"
                    aria-pressed={kanban}
                    onClick={() => setKanban(true)}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                </div>
              </div>
              <div
                className="flex gap-1 overflow-x-auto pb-1"
                aria-label="Chặng xử lý"
              >
                <Button
                  size="sm"
                  variant={stage === "all" ? "secondary" : "ghost"}
                  onClick={() =>
                    update(() => {
                      setStage("all");
                      setStatus("all");
                    })
                  }
                >
                  Mọi chặng{" "}
                  <span className="ml-1 tabular-nums">{scoped.length}</span>
                </Button>
                {DESIGN_STAGES.map((st) => (
                  <Button
                    key={st.key}
                    size="sm"
                    variant={stage === st.key ? "secondary" : "ghost"}
                    className="shrink-0"
                    onClick={() =>
                      update(() => {
                        setStage(st.key);
                        setStatus("all");
                      })
                    }
                  >
                    {st.label}
                    <span className="ml-1 text-xs tabular-nums">
                      {
                        scoped.filter((o) => designStage(o.status) === st.key)
                          .length
                      }
                    </span>
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{rows.length} công việc</span>
                  {(queue === "open" ||
                    queue === "overdue" ||
                    queue === "unassigned") && (
                    <span className="rounded bg-muted px-2 py-1">
                      {queue === "open"
                        ? "Đang mở"
                        : queue === "overdue"
                          ? "Quá hạn"
                          : "Chưa phân công"}
                    </span>
                  )}
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-primary"
                    >
                      <X className="size-3" />
                      Xóa lọc
                    </button>
                  )}
                </div>
                <Select
                  value={sort}
                  onValueChange={(v) => update(() => setSort(v as DesignSort))}
                >
                  <SelectTrigger
                    className="h-8 w-44 text-xs"
                    aria-label="Sắp xếp công việc"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attention">Ưu tiên xử lý</SelectItem>
                    <SelectItem value="deadline">Deadline gần nhất</SelectItem>
                    <SelectItem value="newest">Mới tạo gần nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
          {!s.loaded ? (
            <div
              className="rounded-xl border p-10 text-center text-sm text-muted-foreground"
              role="status"
            >
              Đang tải công việc…
            </div>
          ) : !rows.length ? (
            <div className="rounded-xl border border-dashed bg-card px-5 py-12 text-center">
              <Inbox className="mx-auto mb-3 size-8 text-muted-foreground" />
              <h2 className="font-medium">
                {hasFilters
                  ? "Không có công việc phù hợp"
                  : "Chưa có công việc"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {hasFilters
                  ? "Thử đổi phạm vi hoặc bỏ bộ lọc để xem thêm."
                  : "Tạo yêu cầu đầu tiên để bắt đầu theo dõi."}
              </p>
              {hasFilters && (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={clearFilters}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : kanban ? (
            <div
              className="flex snap-x gap-3 overflow-x-auto pb-4"
              aria-label="Bảng tiến độ thiết kế"
            >
              {DESIGN_STAGES.filter(
                (st) => stage === "all" || stage === st.key,
              ).map((st) => {
                const items = rows.filter(
                  (o) => designStage(o.status) === st.key,
                );
                return (
                  <section
                    key={st.key}
                    className="w-[min(80vw,320px)] shrink-0 snap-start rounded-xl bg-muted/50 p-3"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2 px-1">
                      <h2 className="text-sm font-semibold">{st.label}</h2>
                      <span className="rounded-md bg-background px-2 py-1 text-xs tabular-nums">
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {items.slice(0, limit).map(card)}
                      {!items.length && (
                        <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                          Chưa có công việc
                        </p>
                      )}
                      {items.length > limit && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setLimit((v) => v + PAGE_SIZE)}
                        >
                          Xem thêm {Math.min(PAGE_SIZE, items.length - limit)}{" "}
                          việc
                        </Button>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">{visible.map(card)}</div>
              <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
                <table className="w-full min-w-[780px] text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      {[
                        "Công việc",
                        "Thực hiện / Người duyệt",
                        "Tiến độ",
                        "Deadline",
                        "",
                      ].map((t, i) => (
                        <th key={i} className="px-4 py-3 text-left font-medium">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {visible.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/25">
                        <td className="max-w-80 px-4 py-4">
                          <button
                            type="button"
                            className="break-words text-left font-medium hover:text-primary"
                            onClick={() => setSelected(o.id)}
                          >
                            {o.title}
                          </button>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {!flow && `${designLabel(o.workflowKind)} · `}
                            {workLabel(o, catalogs.data || [])}
                            {o.priority === "Gấp" && " · Ưu tiên gấp"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p>
                            {o.assignee || (
                              <span className="text-muted-foreground">
                                Chưa phân công
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Duyệt: {o.reviewer || o.requester || "Chưa chọn"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge value={o.status} />
                          {!!o.revisions && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {o.revisions} lần sửa
                            </p>
                          )}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-4 ${designOverdue(o) ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {o.deadline ? fmtDate(o.deadline) : "Chưa đặt"}
                          {designOverdue(o) && (
                            <p className="mt-1 text-xs">Quá hạn</p>
                          )}
                        </td>
                        <td className="px-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Mở ${o.title}`}
                            onClick={() => setSelected(o.id)}
                          >
                            <ArrowUpRight className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > limit && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setLimit((v) => v + PAGE_SIZE)}
                  >
                    Xem thêm {Math.min(PAGE_SIZE, rows.length - limit)} công
                    việc
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Đang hiển thị {visible.length} / {rows.length}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="design-mobile-dialog max-h-[85dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cài đặt Thiết kế</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 border-b pb-3"><Button size="sm" variant={settingsTab==='catalogs'?'secondary':'outline'} onClick={()=>setSettingsTab('catalogs')}>Danh mục</Button><Button size="sm" variant={settingsTab==='zalo'?'secondary':'outline'} onClick={()=>setSettingsTab('zalo')}>Thông báo Zalo Group</Button></div>
          {settingsTab==='catalogs'?<DesignCatalogSettings/>:<DesignZaloSettings/>}
        </DialogContent>
      </Dialog>
      <Sheet open={filters} onOpenChange={setFilters}>
        <SheetContent className="design-mobile-sheet overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bộ lọc công việc</SheetTitle>
          </SheetHeader>
          <div className="mt-5">{controls}</div>
        </SheetContent>
      </Sheet>
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="design-mobile-dialog max-h-[85dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tạo {flow ? designLabel(flow) : "công việc"}
            </DialogTitle>
          </DialogHeader>
          <DesignWorkForm
            key={`${flow}-${adding}`}
            flow={flow}
            onClose={() => setAdding(false)}
          />
        </DialogContent>
      </Dialog>
      {target && s.loaded && !s.orders.some((o) => o.id === target) && (
        <p role="alert" className="text-destructive">
          Order không tồn tại hoặc bạn không có quyền xem.
        </p>
      )}
      <OrderDetailDialog
        key={target}
        orderId={target}
        open={!!target}
        onOpenChange={(v) => {
          if (!v) {
            setSelected(null);
            onCloseDeepLink?.();
          }
        }}
      />
    </div>
  );
}
