import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as DOM_AI_NAME, c as DOM_AI_CREATOR } from "./model-B_rsOxUC.mjs";
import { a as useRegisterAiRecord, o as openRecordAi } from "./useRecordContext-MOIepqyQ.mjs";
import { a as useQuery, c as useInfiniteQuery, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button, I as Input, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, u as useCurrentUser, F as useAuth, j as cn, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, bc as DialogDescription, af as DropdownMenu, ag as DropdownMenuTrigger, ah as DropdownMenuContent, ai as DropdownMenuItem, L as Label, E as DialogFooter, bd as suggestedProgressionStatus, z as zaloDispatch, n as pushDispatch } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { c as todayKey, n as needGroupsOf, f as fmtVnd, S as STATUS_LABEL, s as statusLabel, d as STATUS_TONE, e as SIGNAL_LOST_REASONS, z as zaloLink, g as resolveOptions, h as SIGNAL_STATUSES, i as normalizePhone, r as renameOption, t as toggleOption, O as OPEN_STATUSES, a as addOption, j as normName } from "./catalog-BGi2Ua05.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { bc as ListPlus, a6 as Plus, f as Search, g as SlidersHorizontal, bd as Phone, a8 as UserRound, aI as MessageCircle, e as ArrowUpRight, q as Check, b7 as Copy, ao as Pencil, E as EyeOff, r as Eye, aV as TriangleAlert, aK as Ellipsis, be as PencilLine, ap as Trash2, bf as Undo2, b8 as Ban, ab as RotateCcw, aC as RefreshCw, ar as CircleCheck, bg as UserRoundPlus } from "../_libs/lucide-react.mjs";
function dispatchZalo() {
  zaloDispatch().catch(() => {
  });
  pushDispatch().catch(() => {
  });
}
const db = supabase;
const PAGE = 1e3;
async function fetchAll(build) {
  const out = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...data ?? []);
    if (!data || data.length < PAGE) return out;
  }
}
async function listSignalLabels() {
  return fetchAll((a, b) => db.from("signal_labels").select("*").order("name").order("id").range(a, b));
}
async function saveSignalLabel(id, name, personal, active = true) {
  const { data, error } = await db.rpc("signal_label_save", { _id: id, _name: name, _personal: personal, _active: active });
  if (error) throw error;
  return data;
}
async function saveSignalEnrichment(id, requestId, potential, labels) {
  const { error } = await db.rpc("signal_assessment_save", { _id: id, _request_id: requestId, _potential: potential, _labels: labels });
  if (error) throw error;
}
async function createSignal(input, userId) {
  const { data, error } = await db.from("opportunity_signals").insert({ ...input, created_by: userId }).select("*").single();
  if (error) throw error;
  dispatchZalo();
  return data;
}
async function updateSignalInfo(id, input) {
  const { error } = await db.from("opportunity_signals").update(input).eq("id", id);
  if (error) throw error;
}
async function assignSignal(id, userId) {
  const { error } = await db.rpc("signal_assign", { _id: id, _user: userId });
  if (error) throw error;
  dispatchZalo();
}
async function saleUpdate(id, p) {
  const { error } = await db.rpc("signal_sale_update", {
    _id: id,
    _status: p.status,
    _note: p.note,
    _next: p.next,
    _revenue: p.revenue,
    _lost_reason: p.lostReason,
    _event: p.event,
    _channel: p.channel,
    _next_at: p.nextAt
  });
  if (error) throw error;
}
async function reopenSignal(id, reason) {
  const { error } = await db.rpc("signal_reopen", { _id: id, _reason: reason });
  if (error) throw error;
}
async function signalHistory(id, offset = 0) {
  const [n, e] = await Promise.all([
    db.from("opportunity_signal_notes").select("id,author_id,note,status_from,status_to,next_contact_on,next_contact_at,revenue,lost_reason,event_type,channel,created_at,is_progression").eq("signal_id", id).order("created_at", { ascending: false }).order("id").range(offset, offset + 29),
    db.from("opportunity_signal_events").select("id,actor_id,kind,detail,created_at").eq("signal_id", id).order("created_at", { ascending: false }).order("id").range(offset, offset + 29)
  ]);
  if (n.error) throw n.error;
  if (e.error) throw e.error;
  const { data: count, error } = await db.rpc("signal_note_count", { _id: id });
  if (error) throw error;
  return { notes: n.data, events: e.data, hasMore: n.data.length === 30 || e.data.length === 30, noteCount: Number(count) };
}
async function salesList() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12e3);
  try {
    const { data, error } = await db.rpc("signal_sales_list").abortSignal(controller.signal);
    if (error) throw new Error(error.message);
    return data ?? [];
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error("Dịch vụ danh sách Sale không phản hồi trong 12 giây. Kiểm tra kết nối rồi thử lại.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
async function findSamePhone(phone, exceptId) {
  let q = db.from("opportunity_signals").select("id,customer_name,status,detected_on").eq("phone", phone).limit(5);
  if (exceptId) q = q.neq("id", exceptId);
  const { data, error } = await q;
  if (error) return [];
  return data ?? [];
}
async function deleteSignal(id) {
  const { data, error } = await db.rpc("signal_delete", { _id: id });
  if (error) throw error;
  return data === true;
}
async function cancelSignal(id, reason, undo = false) {
  const { error } = await db.rpc("signal_cancel", { _id: id, _reason: reason, _undo: undo });
  if (error) throw error;
}
const LOST_REASON_SCOPE = "signal_lost_reasons";
async function getCustomLostReasons() {
  const { data } = await db.from("catalogs").select("items").eq("scope", LOST_REASON_SCOPE).maybeSingle();
  return Array.isArray(data?.items) ? data.items : [];
}
async function setCustomLostReasons(items) {
  const { error } = await db.from("catalogs").upsert({ scope: LOST_REASON_SCOPE, items }, { onConflict: "scope" });
  if (error) throw error;
}
const errMsg = (e) => e?.message || "Có lỗi xảy ra";
async function getOptions(scope) {
  const { data } = await db.from("catalogs").select("items").eq("scope", scope).maybeSingle();
  return resolveOptions(data?.items, scope);
}
async function saveOptions(scope, items) {
  const { error } = await db.from("catalogs").upsert({ scope, items }, { onConflict: "scope" });
  if (error) throw error;
}
async function renameOptionEverywhere(scope, from, to, items) {
  const { error } = await db.rpc("signal_catalog_rename", { _scope: scope, _old: from, _new: to });
  if (error) throw error;
  await saveOptions(scope, items);
}
async function optionUsage(scope, name) {
  const { data, error } = await db.rpc("signal_catalog_usage", { _scope: scope, _name: name });
  if (error) throw new Error(`Không kiểm tra được dữ liệu lịch sử nên chưa xóa: ${error.message || "lỗi không xác định"}`);
  return Number(data) || 0;
}
async function saveProgression(id, requestId, p) {
  const { data, error } = await db.rpc("signal_progression_save", { _id: id, _request_id: requestId, _status: p.status, _note: p.note, _next: p.next, _next_at: p.nextAt, _revenue: p.revenue, _lost_reason: p.lostReason });
  if (error) throw error;
  return data;
}
const SIGNAL_SORT_OPTIONS = [
  ["work", "Ưu tiên công việc"],
  ["newest", "Mới nhất"],
  ["oldest", "Cũ nhất"],
  ["soonest", "Cần xử lý sớm"],
  ["potential", "Tiềm năng cao trước"],
  ["value", "Giá trị đã ghi nhận"],
  ["activity", "Cập nhật mới nhất"]
];
function signalStatusTabs(canSeeUnassigned) {
  return [
    { k: "all", label: "Tất cả" },
    ...canSeeUnassigned ? [{ k: "unassigned", label: "Chờ phân công" }] : [],
    ...SIGNAL_STATUSES.map((k) => ({ k, label: STATUS_LABEL[k] }))
  ];
}
const POTENTIAL_LABEL = { high: "🔥 Cao", medium: "Trung bình", low: "Thấp", unrated: "Chưa đánh giá" };
const potentialOf = (s) => s.potential ?? "unrated";
const STAGES = { intake: "Tiếp nhận", advice: "Tư vấn", closing: "Chốt đơn", ended: "Kết thúc" };
function useSignalLabels(uid) {
  return useQuery({ queryKey: ["sig:labels", uid], queryFn: listSignalLabels, enabled: !!uid });
}
function PotentialPill({ s }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${potentialOf(s) === "high" ? "bg-warning/20 text-warning-foreground" : "bg-muted text-muted-foreground"}`, children: POTENTIAL_LABEL[potentialOf(s)] });
}
function SignalLabelPills({ s, labels }) {
  const selected = labels.filter((l) => s.label_ids?.includes(l.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    selected.slice(0, 2).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-36 truncate rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground", title: l.name, children: l.name }, l.id)),
    selected.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
      "+",
      selected.length - 2
    ] })
  ] });
}
function SignalLabelManager({ uid, catalog, sale, personalOnly = false }) {
  const q = useSignalLabels(uid);
  const qc = useQueryClient();
  const [edit, setEdit] = reactExports.useState(null);
  const [name, setName] = reactExports.useState("");
  const [personal, setPersonal] = reactExports.useState(personalOnly || !catalog);
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const lock = reactExports.useRef(false);
  const run = async (id, n, p, active = true) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await saveSignalLabel(id, n, p, active);
      await qc.invalidateQueries({ predicate: (q2) => String(q2.queryKey[0]).startsWith("sig:") });
      setEdit(null);
      setName("");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const rows = (q.data ?? []).filter((l) => personalOnly ? l.owner_id === uid : l.owner_id === uid || catalog);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: personalOnly ? "Nhãn cá nhân" : "Nhãn tín hiệu" }),
    q.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errMsg(q.error) }),
    (sale || catalog) && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-2", onSubmit: (e) => {
      e.preventDefault();
      void run(edit?.id ?? null, name, edit ? !!edit.owner_id : personal, edit?.active ?? true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên nhãn", value: name, maxLength: 100, onChange: (e) => setName(e.target.value), placeholder: "Tên nhãn" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        !personalOnly && catalog && sale && !edit && /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { "aria-label": "Loại nhãn", className: "h-11 rounded-md border bg-background px-2 text-sm", value: personal ? "personal" : "common", onChange: (e) => setPersonal(e.target.value === "personal"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "personal", children: "Cá nhân" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "common", children: "Chung" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !name.trim(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          edit ? "Lưu tên" : "Thêm nhãn"
        ] }),
        edit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", type: "button", onClick: () => {
          setEdit(null);
          setName("");
        }, children: "Hủy" })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: rows.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 items-center py-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `min-w-0 flex-1 break-words ${!l.active ? "text-muted-foreground line-through" : ""}`, children: [
        l.name,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: l.owner_id ? "Cá nhân" : "Chung" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Đổi tên", "aria-label": `Đổi tên ${l.name}`, disabled: busy, onClick: () => {
        setEdit(l);
        setName(l.name);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: l.active ? "Ẩn" : "Dùng lại", "aria-label": `${l.active ? "Ẩn" : "Dùng lại"} ${l.name}`, disabled: busy, onClick: () => void run(l.id, l.name, !!l.owner_id, !l.active), children: l.active ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) })
    ] }, l.id)) })
  ] });
}
function SignalEnrichment({ s, uid, canEdit, catalog, sale, onSaved }) {
  const q = useSignalLabels(uid);
  const [open, setOpen] = reactExports.useState(false);
  const [potential, setPotential] = reactExports.useState(potentialOf(s));
  const [ids, setIds] = reactExports.useState(s.label_ids ?? []);
  const [search, setSearch] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const lock = reactExports.useRef(false);
  const request = reactExports.useRef(null);
  const [manage, setManage] = reactExports.useState(false);
  const labelKey = JSON.stringify(s.label_ids ?? []);
  reactExports.useEffect(() => {
    if (open) {
      setPotential(potentialOf(s));
      setIds(s.label_ids ?? []);
      setSearch("");
      setManage(false);
      setError("");
    }
  }, [open, s.id, labelKey]);
  const save = async () => {
    if (lock.current || q.isPending || q.error) return;
    const payload = JSON.stringify([s.id, potential, [...ids].sort()]);
    if (request.current?.payload !== payload) request.current = { payload, id: crypto.randomUUID() };
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await saveSignalEnrichment(s.id, request.current.id, potential, ids);
      onSaved();
      setOpen(false);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const close = (value) => {
    if (busy) return;
    if (!value && (potential !== potentialOf(s) || JSON.stringify([...ids].sort()) !== JSON.stringify([...s.label_ids ?? []].sort())) && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;
    setOpen(value);
  };
  const available = (q.data ?? []).filter((l) => (l.active || ids.includes(l.id)) && (!l.owner_id || s.assigned_to === uid || ids.includes(l.id)));
  const matching = available.filter((l) => l.name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
  const toggle = (id) => setIds((x) => x.includes(id) ? x.filter((i) => i !== id) : [...x, id]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PotentialPill, { s }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SignalLabelPills, { s, labels: q.data ?? [] }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "min-h-11", onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
        "Đánh giá cơ hội"
      ] })
    ] }),
    s.potential_updated_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Đánh giá ",
      new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" }).format(new Date(s.potential_updated_at))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange: close, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "signal-mobile-sheet max-h-[90dvh] flex flex-col overflow-hidden p-0 sm:max-w-xl sm:mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "shrink-0 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Đánh giá cơ hội" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 overflow-y-auto px-4 pb-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1 text-sm", children: [
          "Mức độ tiềm năng",
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { "aria-label": "Mức độ tiềm năng", className: "h-11 w-full rounded-md border bg-background px-2", value: potential, onChange: (e) => setPotential(e.target.value), children: Object.entries(POTENTIAL_LABEL).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "min-w-0 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-sm font-medium mb-2", children: "Nhãn tín hiệu – Có thể chọn nhiều" }),
          available.length > 6 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm nhãn tín hiệu", placeholder: "Tìm nhãn", className: "pl-9 h-11", value: search, onChange: (e) => setSearch(e.target.value) })
          ] }),
          search && ids.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", "aria-label": "Nhãn đã chọn", children: available.filter((l) => ids.includes(l.id)).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "secondary", size: "sm", className: "h-auto max-w-full whitespace-normal text-left", "aria-label": `Bỏ nhãn ${l.name}`, disabled: busy, onClick: () => toggle(l.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 shrink-0" }),
            l.name
          ] }, l.id)) }),
          q.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải nhãn…" }) : q.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: errMsg(q.error) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-48 overflow-y-auto flex flex-wrap content-start gap-2", "aria-label": "Chọn nhãn tín hiệu", children: [
            matching.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: ids.includes(l.id) ? "secondary" : "outline", size: "sm", className: "h-auto min-h-11 max-w-full whitespace-normal text-left", role: "checkbox", "aria-checked": ids.includes(l.id), "aria-label": l.name, disabled: busy, onClick: () => toggle(l.id), children: [
              ids.includes(l.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                l.name,
                l.owner_id ? " · Cá nhân" : "",
                !l.active ? " · Đã ẩn" : ""
              ] })
            ] }, l.id)),
            !matching.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có nhãn phù hợp." })
          ] })
        ] }),
        (sale || catalog) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setManage((v) => !v), children: "Quản lý nhãn" }),
        manage && /* @__PURE__ */ jsxRuntimeExports.jsx(SignalLabelManager, { uid, catalog, sale }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-0 shrink-0 bg-background border-t p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full min-h-12", disabled: busy || q.isPending || !!q.error, onClick: () => void save(), children: busy ? "Đang lưu…" : "Lưu đánh giá" }) })
    ] }) })
  ] });
}
function validProgression(n) {
  return n.is_progression ?? (n.event_type?.trim() !== "Đã tiếp nhận" && (!!n.note?.trim() || !!n.event_type?.trim() && !["Đã tiếp nhận", "Khác"].includes(n.event_type.trim())));
}
const QUICK_PROGRESS = [
  { label: "Tư vấn", items: ["Đã kết nối Zalo với khách", "Đang tư vấn sản phẩm", "Đã gửi hình ảnh / mẫu", "Đã gửi báo giá"] },
  { label: "Phản hồi", items: ["Khách đang cân nhắc", "Khách chưa phản hồi", "Khách chê giá cao", "Khách cần trao đổi nội bộ", "Khách yêu cầu điều chỉnh", "Khách hẹn phản hồi sau", "Khách đang xem báo giá"] },
  { label: "Tiến triển", items: ["Đang thương lượng", "Đã nhắn nhắc khách", "Khách yêu cầu thêm thông tin", "Khách đang xác nhận đơn", "Khách đồng ý đặt hàng"] }
];
const GIFT_PROGRESS = { label: "Sứ quà tặng", items: ["Đang thiết kế maket", "Đã gửi maket cho khách", "Khách yêu cầu chỉnh sửa maket", "Đang chờ khách duyệt maket", "Khách đã duyệt maket", "Đang tư vấn mẫu và bao bì", "Đang tư vấn in logo"] };
const progressionSuggestions = (groups) => groups.some((g) => normName(g) === normName("Sứ quà tặng")) ? [...QUICK_PROGRESS, GIFT_PROGRESS] : QUICK_PROGRESS;
const composeProgression = (selected, extra) => [...selected, extra.trim()].filter(Boolean).join("\n");
const canSaveProgression = (note, statusChanged) => statusChanged || note.trim().length > 0;
const SIGNAL_INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="switch"], [role="combobox"], [role="slider"], [role="textbox"], [contenteditable]:not([contenteditable="false"]), [tabindex], [data-signal-interactive]';
function hasSelection(element) {
  const selection = element.ownerDocument.getSelection();
  return !!selection && !selection.isCollapsed;
}
function signalSurfaceClick(open) {
  return (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || hasSelection(event.currentTarget)) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest(SIGNAL_INTERACTIVE_SELECTOR)) return;
    open();
  };
}
function signalNameClick(open) {
  return (event) => {
    event.stopPropagation();
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || hasSelection(event.currentTarget)) return;
    open();
  };
}
function signalNameKeyDown(open) {
  return (event) => {
    if (event.target !== event.currentTarget || event.defaultPrevented || event.repeat || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    open();
  };
}
function mobileNeed(s) {
  return s.need_detail?.trim() || needGroupsOf(s).join(", ") || s.products.join(", ") || null;
}
function signalContact(phone) {
  const normalized = normalizePhone(phone);
  return normalized ? { phone: normalized, tel: `tel:${normalized}` } : null;
}
function appliedSignalFilters(f, deadline, work) {
  const fields = Object.entries(f).filter(([key, value]) => !["q", "quick", "time", "from", "to"].includes(key) && !!value).length;
  return fields + (f.quick !== "all" ? 1 : 0) + (f.time ? 1 : 0) + 0 + (work !== "all" ? 1 : 0);
}
function SignalMobileCard({ s, status, owner, deadline, labels, onOpen }) {
  const contact = signalContact(s.phone ?? "");
  const need = mobileNeed(s);
  const selected = labels.filter((l) => s.label_ids?.includes(l.id));
  const [zalo, setZalo] = reactExports.useState(false);
  const [copied, setCopied] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const copy = async () => {
    if (!contact) return;
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      setError("");
    } catch {
      setError("Chưa sao chép được. Bạn có thể chọn và sao chép số bên trên.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { "aria-label": `Tín hiệu: ${s.customer_name}`, onClick: signalSurfaceClick(onOpen), className: "signal-card min-w-0 rounded-lg border bg-card p-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "link", className: "signal-mobile-name h-auto min-h-0 min-w-0 justify-start whitespace-normal p-0 text-left text-sm font-semibold leading-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, "aria-label": `Mở chi tiết tín hiệu: ${s.customer_name}`, onClick: signalNameClick(onOpen), onKeyDown: signalNameKeyDown(onOpen), className: "line-clamp-2 break-words", children: s.customer_name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "signal-mobile-status shrink-0", children: status })
    ] }),
    contact ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { "data-signal-interactive": true, href: contact.tel, className: "inline-flex min-h-8 items-center gap-2 text-base font-semibold tabular-nums text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 shrink-0" }),
      s.phone
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      s.phone || "Chưa có số điện thoại",
      s.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs", children: "Số điện thoại không hợp lệ" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "line-clamp-2 text-sm leading-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nhu cầu: " }),
      need || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa có thông tin" })
    ] }),
    (potentialOf(s) !== "unrated" || selected.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-1.5", children: [
      potentialOf(s) !== "unrated" && /* @__PURE__ */ jsxRuntimeExports.jsx(PotentialPill, { s }),
      selected[0] && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 truncate text-xs text-muted-foreground", title: selected[0].name, children: selected[0].name }),
      selected.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 text-xs text-muted-foreground", children: [
        "+",
        selected.length - 1
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex min-w-0 items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-3 w-3 shrink-0" }),
      owner
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[auto_auto_minmax(0,1fr)] gap-1.5 border-t pt-2", "data-signal-interactive": true, children: [
      contact ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "h-11 px-2 gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: contact.tel, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
        "Gọi"
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: true, title: "Không có số điện thoại hợp lệ", className: "h-11 px-2 gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
        "Gọi"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "h-11 px-2 gap-1", disabled: !contact, title: !contact ? "Không có số điện thoại hợp lệ" : "Liên hệ trên Zalo", onClick: () => {
        setCopied(false);
        setError("");
        setZalo(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
        "Zalo"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-11 min-w-0 px-2 gap-1", onClick: onOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "signal-mobile-action-long", children: "Xem / Cập nhật" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "signal-mobile-action-short", children: "Chi tiết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 shrink-0" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: zalo, onOpenChange: setZalo, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Liên hệ Zalo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Sao chép số rồi tìm trong Zalo. Khách có thể chưa dùng Zalo hoặc không cho phép tìm bằng số điện thoại." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "select-text text-xl font-semibold tabular-nums", children: contact?.phone }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => void copy(), children: [
        copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }),
        copied ? "Đã sao chép số" : "Sao chép số điện thoại"
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error })
    ] }) })
  ] });
}
function SignalAssignmentDialog({ actorId, currentId, currentName, customerName, onClose, onConfirm }) {
  const [selected, setSelected] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const lock = reactExports.useRef(false);
  const sales = useQuery({ queryKey: ["sig:sales", actorId], queryFn: salesList, enabled: !!actorId, retry: 1, staleTime: 6e4 });
  const isRemoval = selected === "__unassign";
  const target = sales.data?.find((u) => u.id === selected);
  const valid = !!selected && !sales.isFetching && !sales.isError && (isRemoval ? !!currentId : !!target && target.id !== currentId);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (open) => {
    if (!open && !lock.current) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "w-[calc(100%-2rem)] max-w-md rounded-2xl grid-cols-[minmax(0,1fr)] max-h-[85dvh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "text-left pr-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: currentId ? "Đổi Sale phụ trách" : "Phân công Sale" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Chọn người nhận rồi bấm xác nhận. Chọn trong danh sách chưa làm thay đổi tín hiệu." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium break-words", children: customerName }),
    currentId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Hiện tại: ",
      currentName
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "min-w-0 space-y-4", onSubmit: async (e) => {
      e.preventDefault();
      if (lock.current || !valid) return;
      lock.current = true;
      setBusy(true);
      try {
        if (await onConfirm(isRemoval ? "" : selected)) onClose();
      } finally {
        lock.current = false;
        setBusy(false);
      }
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "signal-assignment-sale", children: "Sale nhận tín hiệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "signal-assignment-sale", className: "h-12 w-full min-w-0 rounded-xl border bg-background px-3 text-base", disabled: busy || sales.isFetching || sales.isError, value: selected, onChange: (e) => setSelected(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: sales.isFetching ? "Đang tải danh sách Sale…" : "— Chọn Sale —" }),
          (sales.data ?? []).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: u.id, disabled: u.id === currentId, children: [
            u.full_name,
            u.id === currentId ? " (hiện tại)" : ""
          ] }, u.id)),
          currentId && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__unassign", children: "Bỏ phân công — để trống người phụ trách" })
        ] })
      ] }),
      sales.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-2 rounded-xl border border-destructive/30 p-3 text-sm text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Không tải được danh sách Sale: ",
          sales.error instanceof Error ? sales.error.message : "Lỗi không xác định"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "min-h-11", onClick: () => void sales.refetch(), children: "Thử lại" })
      ] }),
      sales.isSuccess && !sales.data.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-sm text-muted-foreground", children: "Chưa có tài khoản đủ quyền nhận tín hiệu." }),
      valid && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl bg-muted p-3 text-sm break-words", children: isRemoval ? "Tín hiệu sẽ trở về chưa phân công." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Người nhận mới: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: target?.full_name })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "min-h-11", disabled: busy, onClick: onClose, children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "min-h-11", disabled: !valid || busy, children: busy ? "Đang lưu…" : isRemoval ? "Xác nhận bỏ phân công" : "Xác nhận phân công" })
      ] })
    ] })
  ] }) });
}
function SignalToCrm({
  signal,
  canPush,
  canOpenCrm
}) {
  const qc = useQueryClient();
  const lock = reactExports.useRef(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [duplicate, setDuplicate] = reactExports.useState(false);
  const link = useQuery({
    queryKey: ["signal-crm-link", signal.id],
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.from("signal_crm_links").select("customer_id").eq("signal_id", signal.id).maybeSingle();
      if (error) throw new Error(error.message);
      return data?.customer_id ?? null;
    }
  });
  async function register() {
    if (!canPush || lock.current || link.isPending || link.isError || link.data) return;
    lock.current = true;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("signal_crm_register", { _signal_id: signal.id });
      if (error) throw new Error(error.message);
      const result = data;
      if (result.status === "duplicate") {
        setDuplicate(true);
        toast.info("Khách đã có trong CRM");
        return;
      }
      if ((result.status === "created" || result.status === "linked") && result.customer_id) {
        qc.setQueryData(["signal-crm-link", signal.id], result.customer_id);
        await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("crm_") || q.queryKey[0] === "sig:hist" });
        toast.success(result.status === "created" ? "Đã lưu khách vào CRM" : "Khách đã được lưu vào CRM");
        return;
      }
      throw new Error("CRM trả về kết quả không hợp lệ.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể đưa khách vào CRM.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!canPush && !link.data) return null;
  if (link.isPending) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-12 w-full", variant: "outline", disabled: true, children: "Đang kiểm tra CRM…" });
  }
  if (link.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "min-h-12 w-full", variant: "outline", onClick: () => void link.refetch(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
      "Thử kiểm tra CRM lại"
    ] });
  }
  if (link.data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-2 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-sm font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600" }),
        "Đã lưu vào CRM"
      ] }),
      canOpenCrm && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "min-h-11 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/biz/crm?customer=${link.data}`, children: "Mở hồ sơ CRM" }) }),
      !canOpenCrm && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sale phụ trách sẽ quản lý và phân loại trong CRM." })
    ] });
  }
  if (duplicate) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "rounded-md border p-3 text-sm font-medium", children: "Khách đã có trong CRM" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-12 w-full", variant: "outline", disabled: !canPush || busy, onClick: () => void register(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(UserRoundPlus, { className: "mr-2 h-4 w-4" }),
    busy ? "Đang lưu vào CRM…" : "Lưu vào CRM Khách hàng"
  ] });
}
function weekStart(key) {
  const d = /* @__PURE__ */ new Date(key + "T00:00:00Z");
  const dow = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}
const INSIGHT_MIN_SAMPLE = 5;
function reportInsights(args) {
  const { sum, bySource, byNeed } = args;
  const min = args.minSample ?? INSIGHT_MIN_SAMPLE;
  const out = [];
  const topSrc = bySource[0];
  if (topSrc) out.push({ kind: "source", text: `Nguồn nhiều tín hiệu nhất: ${topSrc.key} (${topSrc.s.total} tín hiệu).` });
  const rated = bySource.filter((r) => r.s.total > 0 && r.s.closeRate != null);
  const best = [...rated].sort((a, b) => (b.s.closeRate ?? 0) - (a.s.closeRate ?? 0))[0];
  if (best) {
    const enough = best.s.total >= min;
    out.push({
      kind: "rate",
      text: `Tỷ lệ chốt cao nhất: ${best.key} (${best.s.closeRate.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% — ${best.s.won}/${best.s.total}).`,
      note: enough ? void 0 : `Mẫu nhỏ (${best.s.total} < ${min} tín hiệu) — chưa đủ căn cứ kết luận nguồn hiệu quả nhất.`
    });
  }
  const backlog = sum.unassigned + sum.waiting;
  if (backlog > 0) out.push({ kind: "backlog", text: `Tồn đọng cần xử lý: ${backlog} tín hiệu (${sum.unassigned} chưa phân công, ${sum.waiting} chờ nhận).` });
  const topNeed = byNeed[0];
  if (topNeed) out.push({ kind: "need", text: `Nhóm nhu cầu nổi bật: ${topNeed.key} (${topNeed.s.total} tín hiệu).` });
  return out;
}
function addDays(key, n) {
  const d = /* @__PURE__ */ new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function timeBounds(f, today) {
  switch (f.time) {
    case "today":
      return [today, today];
    case "7d":
      return [addDays(today, -6), today];
    case "month":
      return [today.slice(0, 7) + "-01", today];
    case "custom":
      return [f.from || void 0, f.to || void 0];
    default:
      return [];
  }
}
const SIGNAL_READ_TIMEOUT_MS = 15e3;
async function signalRead(run, parent, timeoutMs = SIGNAL_READ_TIMEOUT_MS) {
  const controller = new AbortController();
  let timer;
  let cancel;
  const stopped = new Promise((_, reject) => {
    cancel = () => {
      controller.abort();
      reject(new DOMException("Yêu cầu đã hủy", "AbortError"));
    };
    if (parent?.aborted) {
      cancel();
      return;
    }
    parent?.addEventListener("abort", cancel, { once: true });
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("Tải Tín hiệu quá lâu. Vui lòng thử tải lại."));
    }, timeoutMs);
  });
  try {
    if (controller.signal.aborted) return await stopped;
    return await Promise.race([Promise.resolve(run(controller.signal)), stopped]);
  } finally {
    clearTimeout(timer);
    if (cancel) parent?.removeEventListener("abort", cancel);
  }
}
const listParams = (f, work) => {
  const [from, to] = timeBounds(f, todayKey());
  return { ...f, from, to, work };
};
async function signalPage(filter, sort, offset, limit, signal) {
  const request = supabase.rpc("signal_list_page", { _filter: filter, _sort: sort, _offset: offset, _limit: limit });
  const { data, error } = await signalRead((s) => request.abortSignal(s), signal);
  if (error) throw error;
  if (!data || !Array.isArray(data.rows)) throw new Error("Không nhận được danh sách Tín hiệu. Vui lòng thử tải lại.");
  return data;
}
async function signalCounts(filter, signal) {
  const { data, error } = await signalRead((s) => supabase.rpc("signal_list_counts", { _filter: filter }).abortSignal(s), signal);
  if (error) throw error;
  if (!data || typeof data.total !== "number") throw new Error("Không nhận được số liệu Tín hiệu. Vui lòng thử tải lại.");
  return data;
}
async function signalById(id) {
  const [{ data, error }, { data: links, error: linkError }] = await Promise.all([
    supabase.from("opportunity_signals").select("*").eq("id", id).maybeSingle(),
    supabase.from("signal_label_links").select("label_id").eq("signal_id", id)
  ]);
  if (error) throw error;
  if (linkError) throw linkError;
  return data ? { ...data, label_ids: (links ?? []).map((l) => l.label_id) } : null;
}
async function changeToken(signal) {
  const { data, error } = await signalRead((s) => supabase.rpc("signal_change_token").abortSignal(s), signal);
  if (error) throw error;
  return data;
}
const SIGNAL_TOKEN_POLL_INTERVAL_MS = 9e4;
function observedSignalChange(previous, next) {
  return previous !== void 0 && next !== void 0 && previous !== next;
}
function SignalCustomerName({ name, onOpen }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "link", className: "h-auto min-h-11 md:min-h-0 justify-start whitespace-normal p-0 text-left font-semibold leading-tight select-text", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, "aria-label": `Mở chi tiết tín hiệu: ${name}`, onClick: signalNameClick(onOpen), onKeyDown: signalNameKeyDown(onOpen), children: name }) });
}
function useSignalPerms() {
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
    catalog: can("signal.catalog") || can("signal.manage")
  };
}
const SIG = "sig:";
function useLostReasons() {
  const { userId } = useSignalPerms();
  const q = useQuery({ queryKey: [`${SIG}lostReasons`, userId], queryFn: getCustomLostReasons, enabled: !!userId });
  const custom = q.data ?? [];
  const base = SIGNAL_LOST_REASONS.filter((x) => x !== "Khác");
  return { custom, all: [...base, ...custom.filter((c) => !base.includes(c)), "Khác"] };
}
function useOptions(scope) {
  const { userId } = useSignalPerms();
  const q = useQuery({ queryKey: [`${SIG}opt:${scope}`, userId], queryFn: () => getOptions(scope), enabled: !!userId });
  const all = q.data ?? [];
  return { all, active: all.filter((o) => o.active).map((o) => o.name), names: all.map((o) => o.name) };
}
const invalidateSig = (qc) => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith(SIG) });
const refreshSignals = async (qc) => {
  const erroredBefore = new Set(qc.getQueryCache().findAll().filter((q) => q.state.status === "error").map((q) => q.queryHash));
  await invalidateSig(qc);
  const failed = qc.getQueryCache().findAll().some((q) => q.isActive() && String(q.queryKey[0]).startsWith(SIG) && q.state.status === "error" && !erroredBefore.has(q.queryHash));
  if (failed) toast.error("Đã lưu nhưng chưa làm mới được danh sách.", { action: { label: "Thử lại", onClick: () => void refreshSignals(qc) } });
};
function useUserName() {
  const users = useAuth((s) => s.users);
  return (id) => id === DOM_AI_CREATOR ? DOM_AI_NAME : id ? users.find((u) => u.id === id)?.fullName || "—" : "—";
}
function StatusPill({ s }) {
  const key = s.status ?? "none";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS_TONE[key] ?? STATUS_TONE.none), children: s.status ? statusLabel(s.status) : "Chưa phân công" });
}
const fmtDate = (d) => d ? d.split("-").reverse().join("/") : "—";
const fmtTime = (iso) => new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const fmtNext = (s) => s.next_contact_at ? fmtTime(s.next_contact_at) : fmtDate(s.next_contact_on);
const lastText = (n) => n ? [n.event_type, n.note].filter(Boolean).join(" — ") || "Đã cập nhật" : null;
const emptyFilter = () => ({ quick: "all", time: "" });
function SignalsPage() {
  const p = useSignalPerms();
  useQuery({
    queryKey: [`${SIG}sales`, p.userId],
    queryFn: salesList,
    enabled: !!p.userId && (p.assignNew || p.reassign),
    staleTime: 6e4,
    refetchOnWindowFocus: false,
    retry: 1
  });
  const name = useUserName();
  const labels = useSignalLabels(p.userId);
  const [workQuick, setWorkQuick] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("work");
  const [labelsOpen, setLabelsOpen] = reactExports.useState(false);
  const [f, setF] = reactExports.useState(emptyFilter());
  const restored = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!p.userId) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(`sig:filters:${p.userId}`) || "null");
      if (saved) {
        setF(saved.f ?? emptyFilter());
        setWorkQuick(saved.workQuick ?? "all");
        setSort(saved.sort === "priority" ? "work" : saved.sort ?? "work");
      }
    } catch {
    }
    restored.current = p.userId;
  }, [p.userId]);
  reactExports.useEffect(() => {
    if (p.userId && restored.current === p.userId) {
      try {
        sessionStorage.setItem(`sig:filters:${p.userId}`, JSON.stringify({ f, workQuick, sort }));
      } catch {
      }
    }
  }, [f, workQuick, sort, p.userId]);
  const [filterOpen, setFilterOpen] = reactExports.useState(false);
  const [openId, setOpenId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const id = sp.get("open");
    if (id && /^[0-9a-f-]{36}$/i.test(id)) setOpenId(id);
    if (sp.get("care") === "1") {
      const sale = sp.get("sale");
      const kind = sp.get("kind");
      if (kind !== "stale") setF((x) => ({ ...x, quick: "waiting", saleId: sale && /^[0-9a-f-]{36}$/i.test(sale) ? sale : void 0 }));
    }
  }, []);
  const [creating, setCreating] = reactExports.useState(false);
  const [reasonsOpen, setReasonsOpen] = reactExports.useState(false);
  todayKey();
  const saleOnly = p.sale && !p.viewAll && !p.create;
  const [queryText, setQueryText] = reactExports.useState("");
  const [desktopPage, setDesktopPage] = reactExports.useState(0);
  const [mobile, setMobile] = reactExports.useState(false);
  const [viewportReady, setViewportReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setMobile(m.matches);
      setViewportReady(true);
    };
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  reactExports.useEffect(() => {
    const timer = setTimeout(() => setQueryText(f.q ?? ""), 300);
    return () => clearTimeout(timer);
  }, [f.q]);
  const params = reactExports.useMemo(() => listParams({ ...f, q: queryText }, workQuick), [JSON.stringify({ ...f, q: queryText }), workQuick]);
  const signature = JSON.stringify(params) + sort;
  reactExports.useEffect(() => setDesktopPage(0), [signature]);
  const counts = useQuery({ queryKey: ["sig:counts", p.userId, params], queryFn: ({ signal }) => signalCounts(params, signal), enabled: !!p.userId, staleTime: 3e4, retry: false, refetchOnWindowFocus: false });
  const pages = useInfiniteQuery({ queryKey: ["sig:page", p.userId, params, sort, mobile, desktopPage], initialPageParam: 0, queryFn: ({ pageParam, signal }) => signalPage(params, sort, mobile ? pageParam : desktopPage * 40, mobile ? 30 : 40, signal), getNextPageParam: (last2, all) => last2.rows.length === 30 ? all.length * 30 : void 0, enabled: !!p.userId && viewportReady, staleTime: 3e4, retry: false, refetchOnWindowFocus: false });
  const token = useQuery({ queryKey: ["sig:token", p.userId], queryFn: ({ signal }) => changeToken(signal), enabled: !!p.userId && pages.isSuccess && counts.isSuccess && !pages.isFetching && !counts.isFetching, staleTime: 6e4, refetchInterval: (q) => q.state.status === "error" ? false : SIGNAL_TOKEN_POLL_INTERVAL_MS, refetchIntervalInBackground: false, retry: false, refetchOnWindowFocus: true });
  const previousToken = reactExports.useRef({ userId: p.userId, token: void 0 });
  const qc = useQueryClient();
  reactExports.useEffect(() => {
    if (previousToken.current.userId !== p.userId) previousToken.current = { userId: p.userId, token: void 0 };
    if (observedSignalChange(previousToken.current.token, token.data)) void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("sig:") && q.queryKey[0] !== "sig:token" && q.queryKey[1] === p.userId });
    if (token.data !== void 0) previousToken.current.token = token.data;
  }, [token.data, p.userId, qc]);
  const data = pages.data?.pages.flatMap((page) => page.rows) ?? [];
  const list = data;
  const last = Object.fromEntries(data.filter((s) => s.last_note).map((s) => [s.id, s.last_note]));
  const isLoading = pages.isPending;
  const error = pages.error;
  const total = counts.data?.total;
  const canSeeUnassigned = p.assign || p.viewAll || p.create;
  const quickTabs = signalStatusTabs(canSeeUnassigned);
  const mine = counts.data?.mine;
  const count = (k) => counts.data ? counts.data.status[k] ?? 0 : "—";
  const needOpts = useOptions("signal_need_groups");
  const needCount = (g) => counts.data ? counts.data.needs[g ?? "all"] ?? 0 : "—";
  const selected = useQuery({ queryKey: ["sig:detail", p.userId, openId], queryFn: () => openId ? signalById(openId) : null, enabled: !!openId && !!p.userId });
  const open = selected.data ?? null;
  const denied = !!openId && !selected.isPending && !open;
  const extra = appliedSignalFilters(f, null, workQuick);
  const sentinel = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const el = sentinel.current;
    if (!el || !mobile || pages.isFetchNextPageError) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && pages.hasNextPage && !pages.isFetchingNextPage) void pages.fetchNextPage();
    }, { rootMargin: "250px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile, pages.hasNextPage, pages.isFetchingNextPage, pages.isFetchNextPageError, data.length]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "signals-page space-y-4 pb-[calc(13rem+env(safe-area-inset-bottom))] md:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: saleOnly ? "Tín hiệu của tôi" : "Tín hiệu cơ hội" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Tín hiệu có khả năng phát sinh đơn hàng, giao Kinh doanh tư vấn." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        p.manage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setReasonsOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListPlus, { className: "h-4 w-4 mr-1" }),
          "Lý do trượt"
        ] }),
        p.create && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", onClick: () => setCreating(true), className: "hidden md:inline-flex", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Thêm tín hiệu"
        ] })
      ] })
    ] }),
    p.sale && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Chờ nhận", v: mine?.waiting ?? "—", onClick: () => setF({ ...emptyFilter(), quick: "waiting" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đang xử lý", v: mine?.active ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đã báo giá", v: mine?.quoted ?? "—", onClick: () => setF({ ...emptyFilter(), quick: "quoted" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đã chốt tháng này", v: mine?.won ?? "—" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto_auto] gap-1.5 md:flex md:gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 md:flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm tín hiệu", value: f.q ?? "", onChange: (e) => setF((x) => ({ ...x, q: e.target.value })), placeholder: "Tìm khách, SĐT", className: "pl-9 h-11 min-w-0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "h-11 shrink-0 px-2 md:px-4 gap-1", onClick: () => setFilterOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4" }),
        "Bộ lọc",
        extra ? ` (${extra})` : ""
      ] }),
      p.create && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-11 w-11 shrink-0 md:hidden", size: "icon", "aria-label": "Thêm tín hiệu", onClick: () => setCreating(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sắp xếp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { "aria-label": "Sắp xếp tín hiệu", className: "h-11 max-w-52 rounded-md border bg-background px-2 text-sm", value: sort, onChange: (e) => setSort(e.target.value), children: SIGNAL_SORT_OPTIONS.map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k)) })
      ] }),
      p.sale && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "min-h-11", onClick: () => setLabelsOpen(true), children: "Nhãn cá nhân" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden min-w-0 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "signal-status-scroll flex gap-1.5 overflow-x-auto pb-1 pr-5", role: "group", "aria-label": "Trạng thái tín hiệu", children: quickTabs.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: f.quick === x.k && true ? "default" : "outline", "aria-pressed": f.quick === x.k && true, className: "h-9 shrink-0 rounded-full px-3 text-xs gap-1.5", onClick: () => {
        setF((y) => ({ ...y, quick: x.k }));
      }, children: [
        x.label,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums opacity-75", children: count(x.k) })
      ] }, x.k)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute right-0 top-0 grid h-9 w-4 place-items-center bg-background text-muted-foreground", "aria-hidden": "true", children: "›" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:block rounded-2xl border bg-card p-3 shadow-sm space-y-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChipRow,
        {
          label: "Nhóm nhu cầu",
          items: [{ k: "", label: "Tất cả", n: needCount(void 0) }, ...needOpts.names.filter((n) => n === f.needGroup || !counts.data || Number(needCount(n)) > 0).map((n) => ({ k: n, label: n, n: needCount(n) }))],
          active: f.needGroup ?? "",
          onPick: (k) => {
            setF((y) => ({ ...y, needGroup: k || void 0 }));
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChipRow,
        {
          label: "Trạng thái",
          max: quickTabs.length,
          items: quickTabs.map((x) => ({ k: x.k, label: x.label, n: count(x.k) })),
          active: f.quick,
          onPick: (k) => {
            setF((y) => ({ ...y, quick: k }));
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveFilters, { f, name, onChange: setF })
    ] }),
    counts.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "flex flex-wrap items-center gap-2 text-sm text-destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Không tải được số liệu thống kê: ",
        errMsg(counts.error)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: counts.isFetching, onClick: () => void counts.refetch(), children: "Thử tải lại số liệu" })
    ] }),
    error && list.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "flex flex-wrap items-center gap-2 text-sm text-destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Không tải được danh sách tiếp theo: ",
        errMsg(error)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: pages.isFetching, onClick: () => pages.isFetchNextPageError ? void pages.fetchNextPage() : void pages.refetch(), children: "Thử tải lại" })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Đang tải…" }) : error && list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "py-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-destructive", children: [
        "Không tải được danh sách Tín hiệu: ",
        errMsg(error)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: pages.isFetching, onClick: () => void pages.refetch(), children: "Thử tải lại" })
    ] }) : list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-12 text-center border rounded-lg bg-card", children: "Không có tín hiệu phù hợp." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden space-y-2", children: [
        list.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SignalMobileCard, { s, status: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { s }), owner: s.assigned_to ? name(s.assigned_to) : "Chưa phân công", labels: labels.data ?? [], onOpen: () => setOpenId(s.id) }, s.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: sentinel, className: "space-y-2 pt-2 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            list.length,
            " / ",
            total ?? "—",
            " tín hiệu"
          ] }),
          pages.hasNextPage && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "h-11 w-full", disabled: pages.isFetchingNextPage, onClick: () => void pages.fetchNextPage(), children: pages.isFetchingNextPage ? "Đang tải…" : "Tải thêm" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block rounded-2xl border bg-card overflow-x-auto shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-primary/5 text-left text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Ngày", "Khách hàng", "Nhu cầu", "Nguồn", "Sale phụ trách", "Trạng thái", "Diễn biến gần nhất", "Chi tiết nhu cầu", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: list.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: signalSurfaceClick(() => setOpenId(s.id)), className: "border-t cursor-pointer hover:bg-accent/50 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 whitespace-nowrap text-muted-foreground", children: fmtDate(s.detected_on) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 min-w-[160px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SignalCustomerName, { name: s.customer_name, onOpen: () => setOpenId(s.id) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-mono", children: s.phone })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 max-w-[180px] truncate", children: needGroupsOf(s).join(", ") || s.products.join(", ") || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 whitespace-nowrap", children: s.source }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 min-w-[140px] whitespace-nowrap", children: s.assigned_to ? name(s.assigned_to) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa phân công" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { s }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PotentialPill, { s }) }),
            s.status === "won" && s.revenue ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-0.5", children: fmtVnd(s.revenue) }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 max-w-[240px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-2", children: lastText(last[s.id]) ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "Chưa có" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              s.note_count,
              " lần cập nhật"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 max-w-[260px] min-w-[180px]", children: s.need_detail?.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-2 whitespace-pre-line", title: s.need_detail, children: s.need_detail }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setOpenId(s.id), children: "Chi tiết" }) })
        ] }, s.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center justify-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Trang ",
          desktopPage + 1,
          " · ",
          total ?? "—",
          " tín hiệu"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: desktopPage === 0, onClick: () => setDesktopPage((x) => x - 1), children: "Trước" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: pages.isFetching || (total !== void 0 ? (desktopPage + 1) * 40 >= total : list.length < 40), onClick: () => setDesktopPage((x) => x + 1), children: "Sau" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSheet, { open: filterOpen, onOpenChange: setFilterOpen, value: f, onApply: setF, data, peopleIds: counts.data, canSeeUnassigned, showPeople: p.viewAll || p.assign, workQuick, sort, onOptions: (work, order) => {
      setWorkQuick(work);
      setSort(order);
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: labelsOpen, onOpenChange: setLabelsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "signal-mobile-sheet max-h-[85dvh] overflow-y-auto sm:max-w-xl sm:mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Nhãn cá nhân" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SignalLabelManager, { uid: p.userId, catalog: false, sale: p.sale, personalOnly: true })
    ] }) }),
    p.manage && /* @__PURE__ */ jsxRuntimeExports.jsx(LostReasonsSheet, { open: reasonsOpen, onOpenChange: setReasonsOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: creating, onOpenChange: setCreating, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "signal-mobile-sheet w-full sm:max-w-lg overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Thêm tín hiệu" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SignalForm, { onDone: () => setCreating(false) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: !!open || denied, onOpenChange: (o) => {
      if (o) return;
      setOpenId(null);
      const u = new URL(window.location.href);
      if (u.searchParams.has("open")) {
        u.searchParams.delete("open");
        window.history.replaceState(null, "", u.pathname + u.search);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "signal-mobile-sheet w-full h-full max-w-none sm:max-w-xl overflow-y-auto p-0", children: [
      open && /* @__PURE__ */ jsxRuntimeExports.jsx(SignalDetail, { s: open, last: last[open.id], onDeleted: () => {
        setOpenId(null);
        const u = new URL(window.location.href);
        if (u.searchParams.has("open")) {
          u.searchParams.delete("open");
          window.history.replaceState(null, "", u.pathname + u.search);
        }
      } }, open.id),
      denied && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pt-12 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Không thể mở tín hiệu" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Bạn không còn quyền xem tín hiệu này — có thể tín hiệu đã được chuyển cho người khác hoặc không còn tồn tại." })
      ] })
    ] }) })
  ] });
}
function FilterSheet({ open, onOpenChange, value, onApply, data, showPeople, canSeeUnassigned, workQuick, sort, onOptions, peopleIds }) {
  const name = useUserName();
  const prodOpts = useOptions("signal_products");
  const needOpts = useOptions("signal_need_groups");
  const srcOpts = useOptions("signal_sources");
  const lr = useLostReasons();
  const p = useSignalPerms();
  const labels = useSignalLabels(p.userId);
  const [work, setWork] = reactExports.useState(workQuick);
  const [order, setOrder] = reactExports.useState(sort);
  const [f, setF] = reactExports.useState(value);
  reactExports.useEffect(() => {
    if (open) {
      setF(value);
      setWork(workQuick);
      setOrder(sort);
    }
  }, [open, value, workQuick, sort]);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v || void 0 }));
  const people = (ids) => [...new Set(ids.filter(Boolean))].map((id) => [id, name(id)]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "signal-mobile-sheet max-h-[85dvh] flex flex-col overflow-hidden p-0 sm:max-w-xl sm:mx-auto sm:rounded-t-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "p-4 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Bộ lọc" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 overflow-y-auto px-4 grid grid-cols-2 gap-3 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lọc nhanh", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: work, onChange: (v) => setWork(v || "all"), opts: [["all", "Tất cả"], ["high", "Tiềm năng cao"], ["action", "Cần xử lý"], ["overdue", "Quá hạn xử lý"], ["won", "Đã chốt"]] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sắp xếp", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: order, onChange: (v) => setOrder(v || "priority"), opts: SIGNAL_SORT_OPTIONS.map(([k, v]) => [k, v]) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Giai đoạn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.stage, onChange: (v) => set("stage", v), opts: Object.entries(STAGES) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Trạng thái", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.quick === "all" ? "" : f.quick, onChange: (v) => setF((x) => ({ ...x, quick: v || "all" })), opts: signalStatusTabs(canSeeUnassigned).filter((x) => x.k !== "all").map((x) => [x.k, x.label]) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mức độ tiềm năng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.potential, onChange: (v) => set("potential", v), opts: Object.entries(POTENTIAL_LABEL) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhãn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.labelId, onChange: (v) => set("labelId", v), opts: (labels.data ?? []).map((l) => [l.id, l.name]) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Theo dõi từ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.nextFrom ?? "", onChange: (e) => set("nextFrom", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Theo dõi đến", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.nextTo ?? "", onChange: (e) => set("nextTo", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thời gian (ngày tạo)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.time, onChange: (v) => setF((x) => ({ ...x, time: v || "" })), opts: [["today", "Hôm nay"], ["7d", "7 ngày"], ["month", "Tháng này"], ["custom", "Tùy chỉnh"]] }) }),
      f.time === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Từ ngày", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.from ?? "", onChange: (e) => set("from", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Đến ngày", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.to ?? "", onChange: (e) => set("to", e.target.value) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nguồn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.source, onChange: (v) => set("source", v), opts: srcOpts.names.map((x) => [x, x]) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sản phẩm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.product, onChange: (v) => set("product", v), opts: prodOpts.names.map((x) => [x, x]) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhóm nhu cầu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.needGroup, onChange: (v) => set("needGroup", v), opts: needOpts.names.map((x) => [x, x]) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lý do trượt", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { value: f.lostReason, onChange: (v) => set("lostReason", v), opts: lr.all.map((x) => [x, x]) }) }),
      showPeople && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sale phụ trách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchPick, { value: f.saleId, onChange: (v) => set("saleId", v), opts: people(peopleIds?.sales ?? data.map((s) => s.assigned_to)), placeholder: "Tất cả Sale" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người tạo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchPick, { value: f.creatorId, onChange: (v) => set("creatorId", v), opts: people(peopleIds?.creators ?? data.map((s) => s.created_by)), placeholder: "Tất cả người tạo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "col-span-2 flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "h-4 w-4", checked: !!f.unassigned, onChange: (e) => set("unassigned", e.target.checked) }),
          "Chỉ tín hiệu chưa phân công"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "col-span-2 flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "h-4 w-4", checked: !!f.cancelled, onChange: (e) => set("cancelled", e.target.checked) }),
          "Xem tín hiệu đã hủy"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 bg-background border-t p-3 pb-[max(12px,env(safe-area-inset-bottom))] grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "lg", onClick: () => {
        onApply({ ...emptyFilter(), q: value.q });
        onOptions("all", sort);
        onOpenChange(false);
      }, children: "Xóa bộ lọc" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", onClick: () => {
        onApply(f);
        onOptions(work, order);
        onOpenChange(false);
      }, children: "Áp dụng" })
    ] })
  ] }) });
}
function Stat({ label, v, onClick, tone }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: cn("rounded-xl border bg-card p-3 text-left", tone === "warn" && typeof v === "number" && v > 0 && "border-amber-500/50"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold mt-0.5", children: v })
  ] });
}
function ChipRow({ label, items, active, onPick, extra, max = 6 }) {
  const [more, setMore] = reactExports.useState(false);
  const shown = more ? items : items.slice(0, max);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 pt-1.5 text-xs font-medium text-muted-foreground w-24", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
      shown.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onPick(x.k),
          className: cn("shrink-0 rounded-full border px-3 py-1 text-[13px]", active === x.k ? "bg-primary text-primary-foreground border-primary font-medium" : "bg-background hover:bg-muted/60"),
          children: [
            x.label,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: x.n })
          ]
        },
        x.k || "all"
      )),
      items.length > max && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMore((v) => !v), className: "shrink-0 rounded-full border border-dashed px-3 py-1 text-[13px] text-muted-foreground", children: more ? "Thu gọn" : `Xem thêm (${items.length - max})` }),
      extra
    ] })
  ] });
}
function ActiveFilters({ f, name, onChange }) {
  const timeLabel = { today: "Hôm nay", "7d": "7 ngày", month: "Tháng này", custom: "Tùy chỉnh" };
  const chips = [];
  if (f.potential) chips.push({ key: "potential", label: `Tiềm năng: ${POTENTIAL_LABEL[f.potential]}` });
  if (f.stage) chips.push({ key: "stage", label: `Giai đoạn: ${STAGES[f.stage]}` });
  if (f.labelId) chips.push({ key: "labelId", label: "Nhãn đã chọn" });
  if (f.quick !== "all") chips.push({ key: "quick", label: f.quick === "unassigned" ? "Chờ phân công" : STATUS_LABEL[f.quick] });
  if (f.nextFrom) chips.push({ key: "nextFrom", label: `Theo dõi từ ${f.nextFrom}` });
  if (f.nextTo) chips.push({ key: "nextTo", label: `Theo dõi đến ${f.nextTo}` });
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
  const clear = (k) => onChange({ ...f, [k]: k === "quick" ? "all" : void 0, ...k === "time" ? { from: void 0, to: void 0 } : {} });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 border-t pt-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Đang lọc:" }),
    chips.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => clear(c.key),
        title: "Bấm để gỡ điều kiện",
        className: "rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium hover:bg-primary/20",
        children: [
          c.label,
          " ×"
        ]
      },
      c.key
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onChange({ ...emptyFilter(), q: f.q }), className: "text-xs text-muted-foreground underline ml-1", children: "Xóa lọc" })
  ] });
}
function SearchPick({ value, onChange, opts, placeholder }) {
  const [open, setOpen] = reactExports.useState(false);
  const [q, setQ] = reactExports.useState("");
  const current = opts.find(([v]) => v === value)?.[1];
  const shown = opts.filter(([, l]) => l.toLowerCase().includes(q.trim().toLowerCase()));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setOpen((v) => !v), className: "h-11 w-full rounded-md border bg-background px-3 text-sm text-left flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("truncate", !current && "text-muted-foreground"), children: current ?? placeholder }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute z-20 mt-1 w-full rounded-md border bg-popover p-2 shadow-md space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, value: q, onChange: (e) => setQ(e.target.value), placeholder: "Tìm theo tên…", className: "h-9" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-44 overflow-y-auto space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          onChange("");
          setOpen(false);
        }, className: cn("w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted", !value && "font-medium text-primary"), children: "Tất cả" }),
        shown.map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              onChange(v);
              setOpen(false);
              setQ("");
            },
            className: cn("w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted", v === value && "font-medium text-primary"),
            children: l
          },
          v
        )),
        shown.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-1.5 text-xs text-muted-foreground", children: "Không có kết quả." })
      ] })
    ] })
  ] });
}
const emptyInput = () => ({ detected_on: todayKey(), customer_name: "", phone: "", address: null, need_detail: null, products: [], need_group: null, need_groups: [], source: "", marketing_note: null });
function SignalForm({ initial, id, onDone }) {
  const p = useSignalPerms();
  const qc = useQueryClient();
  const [f, setF] = reactExports.useState(initial ?? emptyInput());
  const [sale, setSale] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const submitLock = reactExports.useRef(false);
  const [createdId, setCreatedId] = reactExports.useState(null);
  const [dups, setDups] = reactExports.useState([]);
  const sales = useQuery({ queryKey: [`${SIG}sales`, p.userId], queryFn: salesList, enabled: p.assign && !id });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const checkDup = async () => {
    const phone = normalizePhone(f.phone);
    setDups(phone ? await findSamePhone(phone, id) : []);
  };
  const retryAssign = async () => {
    if (!createdId || !sale) return;
    setBusy(true);
    try {
      await assignSignal(createdId, sale);
      await invalidateSig(qc);
      toast.success("Đã phân công");
      onDone();
    } catch (e) {
      toast.error(`Chưa phân công được: ${errMsg(e)}`);
    } finally {
      setBusy(false);
    }
  };
  const submit = async () => {
    const name = f.customer_name.trim();
    const phone = normalizePhone(f.phone);
    if (!name) return toast.error("Nhập tên khách hàng");
    if (!phone) return toast.error("Số điện thoại không hợp lệ (9–15 chữ số)");
    if (!f.source) return toast.error("Chọn nguồn tín hiệu");
    if (!f.detected_on) return toast.error("Chọn ngày phát hiện");
    const clean = { ...f, need_group: f.need_groups[0] ?? null, customer_name: name, phone, address: f.address?.trim() || null, need_detail: f.need_detail?.trim() || null, marketing_note: f.marketing_note?.trim() || null };
    if (submitLock.current) return;
    submitLock.current = true;
    setBusy(true);
    try {
      if (id) {
        await updateSignalInfo(id, clean);
      } else {
        if (!p.userId) throw new Error("Bạn cần đăng nhập");
        const s = await createSignal(clean, p.userId);
        if (sale) {
          try {
            await assignSignal(s.id, sale);
          } catch (e) {
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
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      submitLock.current = false;
      setBusy(false);
    }
  };
  if (createdId) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4 pt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Đã tạo tín hiệu, chưa phân công thành công." }),
      " Tín hiệu đã được lưu — thử phân công lại, không tạo thêm bản trùng."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sale phụ trách", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: sale, onChange: (e) => setSale(e.target.value), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn Sale —" }),
      (sales.data ?? []).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.full_name }, u.id))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "lg", onClick: onDone, children: "Để sau" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", disabled: busy || !sale, onClick: retryAssign, children: busy ? "Đang lưu…" : "Thử phân công lại" })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4 pt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Khách hàng", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ngày phát hiện", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.detected_on, onChange: (e) => set("detected_on", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Đơn vị / Khách hàng *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.customer_name, maxLength: 200, onChange: (e) => set("customer_name", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Số điện thoại *", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", inputMode: "tel", value: f.phone, maxLength: 20, onChange: (e) => {
          set("phone", e.target.value);
          setDups([]);
        }, onBlur: checkDup, placeholder: "0965..." }),
        dups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-500/50 bg-amber-500/10 p-2 text-xs space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
            "SĐT này đã có trong tín hiệu khác. Vẫn có thể tạo nếu là nhu cầu mới."
          ] }),
          dups.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "• ",
            d.customer_name,
            " · ",
            fmtDate(d.detected_on),
            " · ",
            d.status ? statusLabel(d.status) : "Chưa phân công"
          ] }, d.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Địa chỉ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.address ?? "", maxLength: 500, onChange: (e) => set("address", e.target.value) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Nhu cầu", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sản phẩm quan tâm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MultiPick, { scope: "signal_products", value: f.products, onChange: (v) => set("products", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhóm nhu cầu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MultiPick, { scope: "signal_need_groups", value: f.need_groups, onChange: (v) => setF((x) => ({ ...x, need_groups: v, need_group: v[0] ?? null })) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Chi tiết nhu cầu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, maxLength: 3e3, value: f.need_detail ?? "", onChange: (e) => set("need_detail", e.target.value) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Nguồn & ghi chú", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nguồn tín hiệu *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SourcePick, { value: f.source, onChange: (v) => set("source", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú Marketing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, maxLength: 3e3, value: f.marketing_note ?? "", onChange: (e) => set("marketing_note", e.target.value) }) }),
      !id && p.assignNew && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sale phụ trách", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: sale, onChange: (e) => setSale(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Chưa phân công" }),
        (sales.data ?? []).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.full_name }, u.id))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-0 border-t bg-background py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "w-full", disabled: busy, onClick: submit, children: busy ? "Đang lưu…" : id ? "Lưu thay đổi" : "Thêm tín hiệu" }) })
  ] });
}
function Section({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: title }),
    children
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: label }),
    children
  ] });
}
function SourcePick({ value, onChange }) {
  const o = useOptions("signal_sources");
  const opts = value && !o.active.includes(value) ? [...o.active, value] : o.active;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value, onChange, opts });
}
function Select({ value, onChange, opts }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value, onChange: (e) => onChange(e.target.value), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn —" }),
    opts.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o, children: o }, o))
  ] });
}
function Pick({ value, onChange, opts }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-2 text-sm", value: value ?? "", onChange: (e) => onChange(e.target.value), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả" }),
    opts.map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: v, children: l }, v))
  ] });
}
function SignalDetail({ s, last, onDeleted }) {
  useRegisterAiRecord("signal", s.id);
  const p = useSignalPerms();
  const { can } = useCurrentUser();
  const name = useUserName();
  const qc = useQueryClient();
  const [editing, setEditing] = reactExports.useState(false);
  const [updating, setUpdating] = reactExports.useState(false);
  const [showAll, setShowAll] = reactExports.useState(false);
  const history = useInfiniteQuery({ queryKey: [`${SIG}hist`, p.userId, s.id, s.updated_at], initialPageParam: 0, queryFn: ({ pageParam }) => signalHistory(s.id, pageParam), getNextPageParam: (last2, pages) => last2.hasMore ? pages.length * 30 : void 0 });
  const hist = { ...history, data: history.data ? { notes: history.data.pages.flatMap((p2) => p2.notes), events: history.data.pages.flatMap((p2) => p2.events), noteCount: history.data.pages[0]?.noteCount ?? 0 } : void 0 };
  const [showProgression, setShowProgression] = reactExports.useState(false);
  const closed = s.status === "won" || s.status === "lost";
  const cancelled = !!s.cancelled_at;
  const canEditInfo = !closed && !cancelled && (p.edit || p.create && s.created_by === p.userId && (!s.status || s.status === "waiting" || s.status === "consulting"));
  const canDelete = p.del && !closed && (hist.data ? hist.data.notes.length === 0 : false);
  const canConsult = !closed && !cancelled && !!s.assigned_to && (p.sale && s.assigned_to === p.userId || p.manage);
  const refresh = () => refreshSignals(qc);
  const [assigning, setAssigning] = reactExports.useState(false);
  const assignLock = reactExports.useRef(false);
  const deleteLock = reactExports.useRef(false);
  const [deleting, setDeleting] = reactExports.useState(false);
  const doAssign = async (uid) => {
    if (assignLock.current) return false;
    assignLock.current = true;
    try {
      await assignSignal(s.id, uid || null);
      qc.setQueryData([`${SIG}detail`, p.userId, s.id], (old) => old ? { ...old, assigned_to: uid || null, assigned_at: uid ? (/* @__PURE__ */ new Date()).toISOString() : null, status: uid ? "waiting" : null } : old);
      toast.success(uid ? "Đã phân công" : "Đã bỏ phân công");
      void refresh();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      assignLock.current = false;
    }
  };
  const doReopen = async () => {
    const r = window.prompt("Lý do mở lại tín hiệu?");
    if (!r?.trim()) return;
    try {
      await reopenSignal(s.id, r.trim());
      await refresh();
      toast.success("Đã mở lại — lịch sử chốt/trượt cũ vẫn giữ trong nhật ký");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const doDelete = async () => {
    if (deleteLock.current) return;
    if (!window.confirm(`Xóa tín hiệu "${s.customer_name}"? Không thể hoàn tác.`)) return;
    deleteLock.current = true;
    setDeleting(true);
    try {
      const ok = await deleteSignal(s.id);
      if (!ok) return toast.error("Không xóa được: tín hiệu đã có nhật ký tư vấn hoặc kết quả. Hãy dùng Hủy.");
      onDeleted?.();
      toast.success("Đã xóa tín hiệu");
      await refresh();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      deleteLock.current = false;
      setDeleting(false);
    }
  };
  const doCancel = async (undo) => {
    const r = undo ? window.confirm("Bỏ hủy tín hiệu này?") ? "" : null : window.prompt("Lý do hủy (nhập nhầm, trùng lặp…)?");
    if (r === null || !undo && !r.trim()) return;
    try {
      await cancelSignal(s.id, r.trim(), undo);
      refresh();
      toast.success(undo ? "Đã bỏ hủy" : "Đã hủy — lịch sử vẫn được giữ");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const accept = async () => {
    try {
      await saleUpdate(s.id, { status: "contacting", note: "", event: "Đã tiếp nhận", channel: "Zalo", next: s.next_contact_on, nextAt: s.next_contact_at ?? null, revenue: null, lostReason: null });
      toast.success("Đã tiếp nhận");
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  if (editing) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "p-4 pb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Sửa thông tin tín hiệu" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignalForm, { id: s.id, initial: { detected_on: s.detected_on, customer_name: s.customer_name, phone: s.phone, address: s.address, need_detail: s.need_detail, products: s.products, need_group: s.need_group, need_groups: needGroupsOf(s), source: s.source, marketing_note: s.marketing_note }, onDone: () => setEditing(false) })
  ] });
  const timeline = [
    ...(hist.data?.notes ?? []).map((n) => ({ t: n.created_at, who: n.author_id, body: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        fmtTime(n.created_at),
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-foreground uppercase", children: name(n.author_id) }),
        n.channel ? ` | ${n.channel.toUpperCase()}` : ""
      ] }),
      n.event_type && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold uppercase text-[13px]", children: n.event_type }),
      n.status_from !== n.status_to && n.status_to && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        statusLabel(n.status_from),
        " → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: statusLabel(n.status_to) }),
        n.revenue ? ` · ${fmtVnd(n.revenue)}` : "",
        n.lost_reason ? ` · ${n.lost_reason}` : ""
      ] }),
      n.note && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: n.note })
    ] }) })),
    ...(hist.data?.events ?? []).map((e) => ({ t: e.created_at, who: e.actor_id, body: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        fmtTime(e.created_at),
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-foreground uppercase", children: name(e.actor_id) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground italic", children: e.kind === "assign" ? `Phân công: ${e.detail?.from ? name(e.detail.from) : "Chưa phân công"} → ${e.detail?.to ? name(e.detail.to) : "Chưa phân công"}` : e.kind === "reopen" ? `Mở lại tín hiệu (trước: ${statusLabel(e.detail?.prev_status)}${e.detail?.prev_revenue ? ` · ${fmtVnd(e.detail.prev_revenue)}` : ""}${e.detail?.prev_lost_reason ? ` · ${e.detail.prev_lost_reason}` : ""}). Lý do: ${e.detail?.reason}` : e.kind === "cancel" ? `Hủy tín hiệu. Lý do: ${e.detail?.reason ?? ""}` : e.kind === "uncancel" ? `Bỏ hủy tín hiệu${e.detail?.prev_reason ? ` (lý do hủy trước: ${e.detail.prev_reason})` : ""}` : e.kind === "crm_import" ? "Đã lưu khách vào CRM để Sale chăm sóc dài hạn" : e.kind === "enrichment" ? `Tiềm năng: ${POTENTIAL_LABEL[e.detail?.potential_from] ?? "Chưa đánh giá"} → ${POTENTIAL_LABEL[e.detail?.potential_to] ?? "Chưa đánh giá"}${e.detail && ("next_from" in e.detail || "next_to" in e.detail) ? ` · Theo dõi: ${fmtDate(e.detail.next_from)} → ${fmtDate(e.detail.next_to)}` : ""}` : "Cập nhật thông tin khách hàng" })
    ] }) }))
  ].sort((a, b) => b.t.localeCompare(a.t));
  const shown = showAll ? timeline : timeline.slice(0, 3);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-4 pr-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "w-full sm:w-auto", onClick: openRecordAi, children: "Hỏi Đốm về hồ sơ này" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 pr-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold leading-tight", children: s.customer_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { s }),
          (canEditInfo || canDelete || p.manage) && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", "aria-label": "Thao tác", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
              canEditInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setEditing(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PencilLine, { className: "h-4 w-4 mr-2" }),
                "Sửa tín hiệu"
              ] }),
              canDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { disabled: deleting, onClick: doDelete, className: "text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                "Xóa tín hiệu"
              ] }),
              p.manage && (cancelled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => doCancel(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-4 w-4 mr-2" }),
                "Bỏ hủy"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => doCancel(false), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4 mr-2" }),
                "Hủy tín hiệu"
              ] }))
            ] })
          ] })
        ] })
      ] }),
      cancelled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2", children: [
        "Đã hủy ",
        fmtTime(s.cancelled_at ?? s.updated_at),
        ": ",
        s.cancel_reason,
        ". Không tính vào báo cáo."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${s.phone}`, className: "block font-mono text-base text-primary", children: s.phone }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: [s.products.join(", "), needGroupsOf(s).join(", ")].filter(Boolean).join(" · ") || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Gần nhất: ",
        lastText((hist.data?.notes ?? []).find(validProgression) ? { ...(hist.data?.notes ?? []).find(validProgression), signal_id: s.id } : last) ?? "Chưa có diễn biến"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Sale: ",
        s.assigned_to ? name(s.assigned_to) : "Chưa phân công",
        s.status === "won" && s.revenue ? ` · Doanh số ${fmtVnd(s.revenue)}` : "",
        s.lost_reason ? ` · ${s.lost_reason}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "h-12 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: zaloLink(s.phone), target: "_blank", rel: "noopener noreferrer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 mr-1" }),
          "Zalo"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", variant: "outline", className: "h-12 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${s.phone}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 mr-1" }),
          "Gọi"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Nút Zalo mở trang Zalo theo số điện thoại; tùy thiết lập của khách, có thể không mở thẳng được cuộc trò chuyện." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SignalToCrm, { signal: s, canOpenCrm: can("biz.crm_use"), canPush: !cancelled && !!s.assigned_to && (p.sale && s.assigned_to === p.userId || p.create && s.created_by === p.userId || p.manage) }),
      canConsult && s.status === "waiting" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "w-full", onClick: accept, children: "Tiếp nhận tín hiệu" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SignalEnrichment, { s, uid: p.userId, canEdit: !cancelled && (p.sale && s.assigned_to === p.userId || p.manage), catalog: p.catalog, sale: p.sale, onSaved: () => void refresh() }, s.id),
      s.next_contact_on && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Lịch theo dõi: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: fmtNext(s) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: `Diễn biến tín hiệu — ${hist.data?.noteCount ?? 0} lần cập nhật`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setUpdating(true), disabled: !canConsult, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Cập nhật diễn biến"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Lịch sử diễn biến", children: hist.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errMsg(hist.error) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-3 border-l pl-4", children: (hist.data?.notes ?? []).filter(validProgression).slice(0, showProgression ? void 0 : 3).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            fmtTime(n.created_at),
            " · ",
            name(n.author_id)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: [n.event_type, n.note].filter(Boolean).join(" — ") })
        ] }, n.id)) }),
        (hist.data?.notes ?? []).filter(validProgression).length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowProgression((v) => !v), children: showProgression ? "Thu gọn" : "Xem thêm diễn biến" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Lịch sử cũ tính nội dung và gợi ý tư vấn xác định được; không tính tiếp nhận hoặc đổi trạng thái đơn thuần. Chưa thể xác minh các lần retry cũ." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Nhật ký tư vấn", children: hist.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" }) : timeline.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có diễn biến." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-3 border-l pl-4", children: shown.map((x, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm space-y-0.5", children: x.body }, i)) }),
        timeline.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowAll((v) => !v), children: showAll ? "Thu gọn" : `Xem toàn bộ nhật ký (${timeline.length})` })
      ] }) }),
      history.hasNextPage && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: history.isFetchingNextPage, onClick: () => void history.fetchNextPage(), children: "Tải thêm nhật ký" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Thông tin khách hàng", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/20 p-3 text-sm space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Địa chỉ", children: s.address || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Ngày phát hiện", children: fmtDate(s.detected_on) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Nguồn", children: s.source }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Chi tiết nhu cầu", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap", children: s.need_detail || "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Ghi chú Marketing", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap", children: s.marketing_note || "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { k: "Người tạo", children: [
            name(s.created_by),
            " · ",
            fmtTime(s.created_at)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          canEditInfo && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditing(true), children: "Sửa thông tin" }),
          closed && p.manage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: doReopen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4 mr-1" }),
            "Mở lại"
          ] })
        ] }),
        (s.assigned_to ? p.reassign : p.assignNew) && !closed && !cancelled && /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Sale phụ trách", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: s.assigned_to ? name(s.assigned_to) : "Chưa phân công" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "min-h-11 w-full", onClick: () => setAssigning(true), children: s.assigned_to ? "Đổi Sale phụ trách" : "Phân công Sale" })
        ] }),
        assigning && (s.assigned_to ? p.reassign : p.assignNew) && !closed && !cancelled && /* @__PURE__ */ jsxRuntimeExports.jsx(SignalAssignmentDialog, { actorId: p.userId, currentId: s.assigned_to, currentName: name(s.assigned_to), customerName: s.customer_name, onClose: () => setAssigning(false), onConfirm: doAssign }, `${s.id}:${s.assigned_to}`)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: updating, onOpenChange: setUpdating, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "signal-mobile-sheet max-h-[90dvh] overflow-y-auto p-0 sm:max-w-xl sm:mx-auto sm:rounded-t-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "p-4 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Cập nhật diễn biến" }) }),
      updating && /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateForm, { s, onSaved: () => {
        setUpdating(false);
        refresh();
      } })
    ] }) })
  ] });
}
function Row({ k, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[120px_1fr] gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children })
  ] });
}
function UpdateForm({ s, onSaved }) {
  const [selected, setSelected] = reactExports.useState([]);
  const [extra, setExtra] = reactExports.useState("");
  const saving = reactExports.useRef(false);
  const request = reactExports.useRef(null);
  const [changeStatus, setChangeStatus] = reactExports.useState(false);
  const [status, setStatus] = reactExports.useState(s.status);
  const [revenue, setRevenue] = reactExports.useState("");
  const [reason, setReason] = reactExports.useState("");
  const lr = useLostReasons();
  const [reasonOther, setReasonOther] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const suggested = suggestedProgressionStatus(s.status, selected);
  const [dismissed, setDismissed] = reactExports.useState(null);
  const targetStatus = changeStatus ? status : s.status;
  const closing = targetStatus === "won" || targetStatus === "lost";
  const save = async () => {
    if (saving.current) return;
    const note = composeProgression(selected, extra);
    const rev = targetStatus === "won" ? Number(revenue.replace(/[^\d]/g, "")) : null;
    if (targetStatus === "won" && (!rev || rev <= 0)) return toast.error("Chốt bắt buộc nhập doanh số");
    const lost = targetStatus === "lost" ? reason === "Khác" ? reasonOther.trim() ? `Khác: ${reasonOther.trim()}` : "" : reason : null;
    if (targetStatus === "lost" && !lost) return toast.error(reason === "Khác" ? "Nhập lý do trượt cụ thể" : "Trượt bắt buộc chọn lý do");
    if (!canSaveProgression(note, targetStatus !== s.status)) return toast.error("Chọn diễn biến hoặc nhập ghi chú");
    saving.current = true;
    setBusy(true);
    try {
      const payload = JSON.stringify([s.id, targetStatus, note, rev, lost]);
      if (request.current?.payload !== payload) request.current = { id: crypto.randomUUID(), payload };
      await saveProgression(s.id, request.current.id, {
        status: targetStatus,
        note,
        event: null,
        channel: "Zalo",
        next: closing ? null : s.next_contact_on,
        nextAt: closing ? null : s.next_contact_at ?? null,
        revenue: rev,
        lostReason: lost
      });
      toast.success("Đã lưu diễn biến");
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 space-y-4 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chọn nhanh diễn biến" }),
        progressionSuggestions(needGroupsOf(s)).map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground", children: group.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: group.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: selected.includes(item) ? "default" : "outline", size: "sm", className: "h-auto min-h-10 whitespace-normal rounded-full px-3 py-2 text-left", "aria-pressed": selected.includes(item), onClick: () => setSelected(selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item]), children: item }, item)) })
        ] }, group.label))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú thêm (không bắt buộc)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, maxLength: 3e3, value: extra, onChange: (e) => setExtra(e.target.value), placeholder: "VD: Khách muốn tham khảo thêm mẫu màu xanh…" }) }),
      suggested && (!changeStatus || status === s.status) && dismissed !== suggested && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-l-2 border-primary pl-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          "Diễn biến đã chọn phù hợp với “",
          STATUS_LABEL[suggested],
          "”. Bạn có muốn chuyển trạng thái không?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: () => {
            setChangeStatus(true);
            setStatus(suggested);
          }, children: [
            "Chuyển sang ",
            STATUS_LABEL[suggested]
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDismissed(suggested), children: "Giữ nguyên" })
        ] })
      ] }),
      selected.includes("Khách đồng ý đặt hàng") && targetStatus !== "won" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Khách đồng ý đặt hàng — xem xét chuyển Chốt theo quy trình và nhập doanh số." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm font-medium cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "h-4 w-4", checked: changeStatus, onChange: (e) => {
            setChangeStatus(e.target.checked);
            if (!e.target.checked) setStatus(s.status);
          } }),
          "Thay đổi trạng thái tín hiệu (tùy chọn)"
        ] }),
        changeStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Trạng thái mới", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: status, onChange: (e) => setStatus(e.target.value), children: [...OPEN_STATUSES, "won", "lost"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: o, children: [
            STATUS_LABEL[o],
            o === s.status ? " (hiện tại)" : ""
          ] }, o)) }) }),
          status === "won" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Doanh số chốt (VNĐ) *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "numeric", value: revenue, onChange: (e) => setRevenue(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")), placeholder: "VD: 15.000.000" }) }),
          status === "lost" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lý do trượt *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: reason, onChange: setReason, opts: lr.all }) }),
            reason === "Khác" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lý do cụ thể *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 300, value: reasonOther, onChange: (e) => setReasonOther(e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'Khách chưa phản hồi chưa phải Trượt — có thể giữ "Đang liên hệ".' })
          ] }),
          closing && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sau khi Chốt/Trượt, tín hiệu khóa lại. Chỉ Quản lý mới mở lại được. Doanh số là số Sale khai báo, chưa phải doanh thu kế toán." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-0 bg-background border-t p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "w-full h-12 text-base", disabled: busy, onClick: save, children: busy ? "Đang lưu…" : "Lưu diễn biến" }) })
  ] });
}
function LostReasonsSheet({ open, onOpenChange }) {
  const lr = useLostReasons();
  const qc = useQueryClient();
  const [v, setV] = reactExports.useState("");
  const save = async (items) => {
    try {
      await setCustomLostReasons(items);
      await invalidateSig(qc);
      toast.success("Đã lưu danh sách lý do");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const add = () => {
    const x = v.trim();
    if (!x || lr.all.includes(x)) return toast.error("Lý do trống hoặc đã có");
    setV("");
    save([...lr.custom, x]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "max-h-[85vh] overflow-y-auto sm:max-w-xl sm:mx-auto sm:rounded-t-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Lý do trượt" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "9 lý do mặc định luôn có. Bỏ lý do tùy chỉnh không làm thay đổi lịch sử đã ghi." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-3 space-y-1 text-sm", children: [
      SIGNAL_LOST_REASONS.filter((x) => x !== "Khác").map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-muted-foreground", children: x }, x)),
      lr.custom.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between rounded border px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: x }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => save(lr.custom.filter((y) => y !== x)), children: "Bỏ" })
      ] }, x))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v, maxLength: 200, onChange: (e) => setV(e.target.value), placeholder: "Thêm lý do mới" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: add, children: "Thêm" })
    ] })
  ] }) });
}
function MultiPick({ scope, value, onChange }) {
  const p = useSignalPerms();
  const qc = useQueryClient();
  const o = useOptions(scope);
  const [open, setOpen] = reactExports.useState(false);
  const [q, setQ] = reactExports.useState("");
  const [manage, setManage] = reactExports.useState(false);
  const [other, setOther] = reactExports.useState("");
  const toggle = (x) => onChange(value.includes(x) ? value.filter((y) => y !== x) : [...value, x]);
  const shown = o.active.filter((x) => x.toLowerCase().includes(q.trim().toLowerCase()));
  const persist = async (items) => {
    await saveOptions(scope, items);
    await qc.invalidateQueries({ queryKey: [`${SIG}opt:${scope}`] });
  };
  const add = async () => {
    try {
      const items = addOption(o.all, q);
      await persist(items);
      toggle(items[items.length - 1].name);
      setQ("");
      toast.success("Đã thêm vào danh mục");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const addOther = () => {
    const t = other.trim();
    if (!t) return;
    const v = `Khác: ${t}`;
    if (!value.includes(v)) onChange([...value.filter((x) => x !== "Khác"), v]);
    setOther("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
      value.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => toggle(x), className: "rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-xs", children: [
        x,
        " ×"
      ] }, x)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setOpen((v) => !v), className: "rounded-full border px-2.5 py-1 text-xs bg-card", children: open ? "Đóng" : value.length ? "Thay đổi" : "Chọn…" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-card p-2 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Tìm…", className: "h-9" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-48 overflow-y-auto flex flex-wrap gap-1.5", children: [
        shown.map((x) => {
          const on = value.includes(x);
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggle(x), className: cn("rounded-full border px-3 py-1.5 text-sm", on ? "bg-primary text-primary-foreground border-primary" : "bg-background"), children: x }, x);
        }),
        shown.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Không có lựa chọn phù hợp." })
      ] }),
      value.includes("Khác") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", value: other, onChange: (e) => setOther(e.target.value), placeholder: "Nội dung riêng cho tín hiệu này", maxLength: 100 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: addOther, children: "Ghi" })
      ] }),
      p.catalog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 border-t pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", disabled: !q.trim(), onClick: add, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          "Thêm mới",
          q.trim() ? ` "${q.trim()}"` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => setManage((v) => !v), children: "Quản lý danh mục" })
      ] }),
      p.catalog && manage && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: o.all.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("flex-1", !it.active && "line-through text-muted-foreground"), children: it.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs underline", onClick: async () => {
          const to = window.prompt("Tên mới", it.name);
          if (!to || to.trim() === it.name) return;
          try {
            const items = renameOption(o.all, it.name, to);
            const renamed = items.find((x, i) => o.all[i].name === it.name);
            if (!renamed) return;
            const nn = renamed.name;
            await renameOptionEverywhere(scope, it.name, nn, items);
            await qc.invalidateQueries({ queryKey: [`${SIG}opt:${scope}`] });
            await invalidateSig(qc);
            onChange(value.map((v) => v === it.name ? nn : v));
            toast.success("Đã đổi tên, tín hiệu cũ được cập nhật theo");
          } catch (e) {
            toast.error(errMsg(e));
          }
        }, children: "Đổi tên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs underline", onClick: async () => {
          try {
            await persist(toggleOption(o.all, it.name));
          } catch (e) {
            toast.error(errMsg(e));
          }
        }, children: it.active ? "Ngừng dùng" : "Dùng lại" })
      ] }, it.name)) })
    ] })
  ] });
}
export {
  POTENTIAL_LABEL as P,
  SignalLabelManager as S,
  useOptions as a,
  SignalsPage as b,
  useUserName as c,
  useSignalLabels as d,
  errMsg as e,
  reportInsights as f,
  STAGES as g,
  optionUsage as o,
  renameOptionEverywhere as r,
  saveOptions as s,
  useSignalPerms as u,
  weekStart as w
};
