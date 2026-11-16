import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Phone,
  Search,
  CalendarDays,
  SlidersHorizontal,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { catalogsQuery, crmReadQuery, crmPeopleQuery } from "@/lib/crm/queries";
import { formatDate, vnDay, scheduleStatus } from "@/lib/crm/logic";
import type { Customer, Schedule } from "@/lib/crm/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pick, Field, SearchPick } from "./CrmControls";
import { segmentOptions } from '@/lib/crm/classification';
import { CrmModal, CustomerForm, InteractionForm } from "./CrmForms";
import { CrmDetail } from "./CrmDetail";
import { CrmReports } from "./CrmReports";
import { CrmSettings } from "./CrmSettings";
import { DynamicFilters } from './CrmFields';
import type { DynamicFilter } from '@/lib/crm/fields';
export function Crm() {
  const { user: u, can } = useCurrentUser();
  const uid = u?.id || "";
  const [area, setArea] = useState("mine");
  const [view, setView] = useState("today");
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("");
  const [filter, setFilter] = useState("all");
  const [group, setGroup] = useState("");
  const [segment,setSegment]=useState('');
  const [dynamic,setDynamic]=useState<DynamicFilter[]>([]);
  const [priority, setPriority] = useState("");
  const [archived, setArchived] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [open, setOpen] = useState("");
  useEffect(() => {
    const customer = new URLSearchParams(window.location.search).get("customer");
    if (customer && /^[0-9a-f-]{36}$/i.test(customer)) setOpen(customer);
  }, []);
  const [create, setCreate] = useState(false);
  const [care, setCare] = useState<{ customer: Customer; schedule?: Schedule }>();
  const catalogs = useQuery(catalogsQuery(uid));
  const people = useQuery(crmPeopleQuery(uid));
  const read = useQuery(
    crmReadQuery(uid, area === "mine", area === "manage" ? owner : "", search, archived,group,segment,priority,dynamic),
  );
  const cats = catalogs.data || [];
  const data = read.data;
  const now = data?.server_now || new Date().toISOString();
  const today = vnDay(now);
  const schedules = data?.schedules || [];
  const due = schedules.filter((s) => s.status === "pending" && vnDay(s.due_at) === today);
  const overdue = schedules.filter((s) => s.status === "pending" && vnDay(s.due_at) < today);
  const processed = schedules.filter((s) => s.processed_at && vnDay(s.processed_at) === today);
  const label = (id: string | null) => cats.find((c) => c.id === id)?.name || "";
  const selectedSchedules = schedules
    .filter((s) =>
      view === "today"
        ? s.status === "pending" && vnDay(s.due_at) <= today
        : view === "history"
          ? !!s.processed_at
          : view === "calendar"
            ? true
            : false,
    )
    .filter(
      (s) =>
        filter === "all" ||
        (filter === "overdue" && s.status === "pending" && s.due_at < now) ||
        (filter === "today" && vnDay(s.due_at) === today) ||
        (filter === "done" && !!s.processed_at),
    );
  const customers = (data?.customers || []).filter(
    (c) => (!group || c.group_id === group) && (!segment || c.segment_id===segment) && (!priority || c.priority_id === priority),
  );
  return (
    <div className="crm-module space-y-5 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold">CRM Khách Hàng</h1>
        </div>
        <div className="w-full md:w-64">
          <Pick
            label="Khu vực CRM"
            value={area}
            onChange={(v) => {
              setArea(v);
              setSearch("");
              setOwner("");
            }}
            options={[
              { id: "mine", name: "CRM Của Tôi" },
              ...(can("biz.crm_view_scope")
                ? [
                    { id: "manage", name: "Theo Dõi Nhân Viên" },
                    { id: "reports", name: "Báo cáo & Phân tích" },
                  ]
                : []),
              ...(can("biz.crm_settings") ? [{ id: "settings", name: "Cài đặt CRM" }] : []),
            ]}
          />
        </div>
      </div>
      {area === "settings" ? (
        <CrmSettings uid={uid} catalogs={cats} />
      ) : area === "reports" || view === "report" ? (
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setArea("mine");
              setView("today");
            }}
          >
            <CalendarDays className="h-4 w-4" />
            Chăm sóc hôm nay
          </Button>
          <CrmReports uid={uid} catalogs={cats} mine={area === "mine"} onOpen={setOpen} />
        </>
      ) : (
        <>
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="h-auto w-full justify-start overflow-x-auto">
              {[
                ["today", "Hôm nay"],
                ["customers", "Khách hàng"],
                ["calendar", "Lịch chăm sóc"],
                ["history", "Lịch sử"],
                ["report", "Báo cáo"],
              ].map(([v, l]) => (
                <TabsTrigger className="shrink-0" value={v} key={v}>
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {view === "today" && (
            <div className="grid grid-cols-3 divide-x rounded-lg border bg-card">
              {[
                [due.length, "Hôm nay", "today"],
                [overdue.length, "Quá hạn", "overdue"],
                [processed.length, "Đã xử lý", "done"],
              ].map(([n, l, v]) => (
                <Button
                  key={String(v)}
                  variant="ghost"
                  className="h-auto flex-col gap-1 rounded-none py-4"
                  onClick={() => {
                    setFilter(String(v));
                    if (v === "done") setView("history");
                  }}
                >
                  <strong
                    className={`text-xl ${v === "overdue" ? "text-destructive" : v === "done" ? "text-success" : "text-primary"}`}
                  >
                    {n}
                  </strong>
                  <span className="text-[11px] text-muted-foreground">{l}</span>
                </Button>
              ))}
            </div>
          )}
          {area === "manage" && (
            <Field label="Nhân viên trong phạm vi">
              <Pick
                label="Tất cả nhân viên"
                value={owner}
                onChange={setOwner}
                options={(people.data || []).filter((p) => p.id !== uid)}
              />
            </Field>
          )}
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Tìm khách hàng"
                className="pl-9"
                placeholder="Tìm khách hàng, điện thoại…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Bộ lọc khách hàng"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            {area === "mine" && (
              <Button onClick={() => setCreate(true)}>
                <Plus className="h-4 w-4" />
                <span>Thêm khách</span>
              </Button>
            )}
          </div>
          {view !== "customers" && (
            <div className="flex gap-2 overflow-x-auto">
              {[
                ["all", "Tất cả"],
                ["today", "Hôm nay"],
                ["overdue", "Quá hạn"],
                ["done", "Đã xử lý"],
              ].map(([v, l]) => (
                <Button
                  key={v}
                  size="sm"
                  variant={filter === v ? "default" : "outline"}
                  onClick={() => setFilter(v)}
                >
                  {l}
                </Button>
              ))}
            </div>
          )}
          {read.error && (
            <div role="alert" className="text-sm text-destructive">
              {read.error.message}
              <Button variant="link" onClick={() => read.refetch()}>
                Thử lại
              </Button>
            </div>
          )}
          {read.isPending && <p className="text-sm text-muted-foreground">Đang tải khách hàng…</p>}
          <div className="grid gap-3 lg:grid-cols-2">
            {(view === "customers"
              ? customers.map((c) => ({ c, s: undefined as Schedule | undefined }))
              : selectedSchedules.flatMap((s) => {
                  const c = customers.find((c) => c.id === s.customer_id);
                  return c ? [{ c, s }] : [];
                })
            ).map(({ c, s }) => {
              const contact =
                data?.contacts.find((ct) => ct.id === s?.contact_id) ||
                data?.contacts.find((ct) => ct.customer_id === c.id && ct.is_primary);
              const phone = contact?.phone || c.phone;
              return (
                <article key={s?.id || c.id} className="space-y-3 rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Button
                      variant="link"
                      className="h-auto min-w-0 justify-start whitespace-normal p-0 text-left text-base font-semibold"
                      onClick={() => setOpen(c.id)}
                    >
                      {c.name}
                    </Button>
                    {c.priority_id && (
                      <Badge className="shrink-0" variant="outline">
                        {label(c.priority_id)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[label(c.segment_id) || label(c.group_id), contact?.name]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {s ? (
                    <>
                      <p className="text-sm font-medium">{s.goal || "Chăm sóc khách hàng"}</p>
                      {s.content && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{s.content}</p>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(s.due_at)}
                        </span>
                        <Badge
                          variant={
                            s.status === "pending" && s.due_at < now ? "destructive" : "secondary"
                          }
                        >
                          {scheduleStatus(s, now)}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {schedules.find((s) => s.customer_id === c.id && s.status === "pending")
                        ? `Lịch tiếp theo: ${formatDate(schedules.find((s) => s.customer_id === c.id && s.status === "pending")?.due_at || now)}`
                        : "Chưa đặt lịch chăm sóc"}
                    </p>
                  )}
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                    {phone ? (
                      <Button asChild variant="outline">
                        <a href={`tel:${phone}`}>
                          <Phone className="h-4 w-4" />
                          Gọi
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setOpen(c.id)}>
                        <Users className="h-4 w-4" />
                        Liên hệ
                      </Button>
                    )}
                    {(c.owner_id === uid || can("biz.crm_edit_other")) &&
                    (!s || s.status === "pending") ? (
                      <Button onClick={() => setCare({ customer: c, schedule: s })}>
                        Cập nhật chăm sóc
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setOpen(c.id)}>
                        Xem hồ sơ
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {data &&
            (view === "customers" ? customers.length === 0 : selectedSchedules.length === 0) && (
              <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-muted-foreground">
                <CalendarDays className="h-9 w-9" />
                <p className="text-sm">
                  {view === "customers"
                    ? "Chưa có khách hàng trong danh sách"
                    : "Không có lịch chăm sóc trong danh sách"}
                </p>
              </div>
            )}
        </>
      )}
      {filterOpen && (
        <CrmModal title="Bộ lọc khách hàng" onClose={() => setFilterOpen(false)}>
          <Field label="Nhóm khách">
            <SearchPick
              label="Tất cả nhóm khách"
              value={group}
              onChange={v=>{setGroup(v);setSegment('');}}
              options={cats.filter((c) => c.kind === "group").map(c=>({code:c.id,name:c.name}))}
            />
          </Field>
          <Field label="Tệp khách"><SearchPick label="Tất cả tệp khách" value={segment} onChange={setSegment} options={(group?segmentOptions(cats,group):cats.filter(c=>c.kind==='segment')).map(c=>({code:c.id,name:c.name}))}/></Field>
          <Field label="Mức độ ưu tiên">
            <Pick
              label="Tất cả mức ưu tiên"
              value={priority}
              onChange={setPriority}
              options={cats.filter((c) => c.kind === "priority")}
            />
          </Field>
          <Pick
            label="Trạng thái hồ sơ"
            value={archived ? "archived" : "active"}
            onChange={(v) => setArchived(v === "archived")}
            options={[
              { id: "active", name: "Đang quản lý" },
              { id: "archived", name: "Đã lưu trữ" },
            ]}
          />
          <DynamicFilters catalogs={cats} group={group} segment={segment} filters={dynamic} onChange={setDynamic}/>
          <div className="crm-form-footer flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setGroup("");
                setSegment('');
                setPriority("");
                setArchived(false);
                setDynamic([]);
              }}
            >
              Xóa bộ lọc
            </Button>
            <Button onClick={() => setFilterOpen(false)}>Áp dụng</Button>
          </div>
        </CrmModal>
      )}
      {create && (
        <CustomerForm
          catalogs={cats}
          onClose={() => setCreate(false)}
          onSaved={(id) => {
            setCreate(false);
            setOpen(id);
          }}
        />
      )}
      {open && <CrmDetail uid={uid} id={open} catalogs={cats} onClose={() => setOpen("")} />}
      {care && (
        <InteractionForm
          customer={care.customer}
          schedule={care.schedule}
          contacts={data?.contacts.filter((c) => c.customer_id === care.customer.id) || []}
          catalogs={cats}
          onClose={() => setCare(undefined)}
        />
      )}
    </div>
  );
}
