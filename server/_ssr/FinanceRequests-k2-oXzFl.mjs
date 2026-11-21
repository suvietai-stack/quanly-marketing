import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useRegisterAiRecord, o as openRecordAi } from "./useRecordContext-MOIepqyQ.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { u as useCurrentUser, P as PageHeader, B as Button, I as Input, l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, L as Label, a as useServerFn, c as createSsrRpc } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { q as quickFilterStatuses, F as FR_KIND_LABEL, b as FR_QUICK_FILTERS, a as FR_STATUS_LABEL, c as FR_STATUS_VARIANT, v as vnd, p as parseAmount, f as fmtAmountInput, e as emptyLine, l as linesTotal, d as frRemainingToPay, g as frAdvanceRemaining, h as frSalaryRemaining, i as frEditable, j as frCancellable, k as isBlankLine, m as lineTotal, n as validateLines, o as frValidate } from "./logic-DH2fjerh.mjs";
import { F as FR_ZALO_EVENTS, c as frZaloEventsForKind, f as frGroupMessage } from "./zaloGroupMessage-BHPF7ZYB.mjs";
import { a6 as Plus, f as Search, af as Download, j as ArrowUp, k as ArrowDown, ap as Trash2, ac as Paperclip, X, F as FileText, ad as Send, aC as RefreshCw, b7 as Copy, ao as Pencil } from "../_libs/lucide-react.mjs";
import { o as objectType, r as recordType, s as stringType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
const kindSchema = enumType(["advance", "payment", "salary_advance"]);
const frGroupStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema
}).parse(d)).handler(createSsrRpc("63f03e261920d3c5e5410e1fdadc53c73c3d6d46b6cd10f735738c7240b98231"));
const frGroupListGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema
}).parse(d)).handler(createSsrRpc("d8e0ca35874fbea344a87570d2fb1b8114c5c807504ce9851193340c06b87903"));
const frGroupSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema,
  groupId: stringType().trim().max(100),
  groupName: stringType().trim().max(200),
  enabled: booleanType(),
  intro: stringType().trim().max(300),
  toggles: recordType(stringType(), booleanType())
}).parse(d)).handler(createSsrRpc("f57fd0b7f4e4d56700ce15b25a00afe72fcbd082ab9f468767e76d01767832d4"));
const frGroupSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema
}).parse(d)).handler(createSsrRpc("17d5b2afa0c66de4802bf679f33cb4ff50953e4feaf65760e3af6a8d9b4a7254"));
const frGroupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema
}).parse(d)).handler(createSsrRpc("0a42b1cb005cd29f8efb7fa5122273131b5a0974b83df3e4ba31d2df4eb193a0"));
const frGroupRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema,
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c987dfb3afb4f42f772a5b769c611b53a78dba13a99bf55cb8762fb6f81e05a6"));
const frGroupDispatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("561e31ce3cfcbfd0111dcce569ccb72210bb2712f75f8cf5d5f6212889bc4f5a"));
const db = supabase;
const wakeZaloGroup = () => {
  frGroupDispatch().catch(() => {
  });
};
async function rpc(fn, args, wake = false) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  if (wake) wakeZaloGroup();
  return data;
}
async function sel(q) {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}
const frApi = {
  list: (kind, opts = {}) => {
    let q = db.from("fr_requests").select("*").eq("kind", kind).order("created_at", { ascending: false }).limit(opts.limit ?? 200);
    if (opts.statuses?.length) q = q.in("status", opts.statuses);
    if (opts.mine && opts.uid) q = q.eq("requester_id", opts.uid);
    if (opts.q) q = q.or(`code.ilike.%${opts.q}%,title.ilike.%${opts.q}%`);
    return sel(q);
  },
  detail: (id) => sel(db.from("fr_requests").select("*").eq("id", id).maybeSingle()),
  steps: (id) => sel(db.from("fr_steps").select("*").eq("request_id", id).order("step_no")),
  pendingSteps: () => sel(db.from("fr_steps").select("*").eq("status", "pending")),
  events: (id) => sel(db.from("fr_events").select("*").eq("request_id", id).order("created_at", { ascending: false })),
  paymentTypes: (kind = "payment") => sel(db.from("fr_payment_types").select("*").eq("kind", kind).order("sort").order("name")),
  typesWithUsage: (kind) => rpc("fr_types_with_usage", { _kind: kind }),
  saveType: (id, kind, name, description, active, sort) => rpc("fr_type_save", { _id: id, _kind: kind, _name: name, _description: description, _active: active, _sort: sort }),
  deleteType: (id) => rpc("fr_type_delete", { _id: id }),
  lines: (requestId) => sel(db.from("fr_request_lines").select("*").eq("request_id", requestId).order("line_no")),
  lineCatalog: () => sel(db.from("fr_line_catalog").select("*").order("sort").order("name")),
  saveLineCatalog: (id, name, active, sort) => rpc("fr_line_catalog_save", { _id: id, _name: name, _active: active, _sort: sort }),
  deleteLineCatalog: (id) => rpc("fr_line_catalog_delete", { _id: id }),
  lineCatalogUsage: () => rpc("fr_line_catalog_usage", {}),
  settings: () => sel(db.from("fr_settings").select("*")),
  settleOptions: () => rpc("fr_settle_options", {}),
  save: (id, kind, payload, requestKey) => rpc("fr_save", { _id: id, _kind: kind, _payload: payload, _request_key: requestKey }),
  submit: (id) => rpc("fr_submit", { _id: id }, true),
  decide: (id, action, comment) => rpc("fr_decide", { _id: id, _action: action, _comment: comment }, true),
  cancel: (id) => rpc("fr_cancel", { _id: id }),
  pay: (id, amount, method, ref, note) => rpc("fr_pay", { _id: id, _amount: amount, _method: method, _ref: ref, _note: note }, true),
  deduct: (id, amount, note) => rpc("fr_deduct", { _id: id, _amount: amount, _note: note }, true),
  saveSettings: (kind, flow, limits) => rpc("fr_settings_save", { _kind: kind, _flow: flow, _limits: limits }),
  report: (kind, from, to) => rpc("fr_report", { _kind: kind, _from: from, _to: to }),
  /** Toàn bộ đề nghị theo bộ lọc, đọc từng trang 1000 dòng (giới hạn mỗi lần đọc của máy chủ). */
  listAll: async (kind, opts = {}) => {
    const out = [];
    for (let from = 0; from < 2e4; from += 1e3) {
      let q = db.from("fr_requests").select("*").eq("kind", kind).order("created_at", { ascending: false }).order("id").range(from, from + 999);
      if (opts.statuses?.length) q = q.in("status", opts.statuses);
      if (opts.mine && opts.uid) q = q.eq("requester_id", opts.uid);
      if (opts.q) q = q.or(`code.ilike.%${opts.q}%,title.ilike.%${opts.q}%`);
      const page = await sel(q);
      out.push(...page);
      if (page.length < 1e3) break;
    }
    return out;
  },
  /** Bảng kê của nhiều đề nghị (RLS fr_can_view vẫn lọc). */
  linesFor: async (requestIds) => {
    const out = [];
    for (let i = 0; i < requestIds.length; i += 200)
      out.push(...await sel(db.from("fr_request_lines").select("*").in("request_id", requestIds.slice(i, i + 200))));
    return out;
  },
  profiles: (ids) => ids.length ? sel(db.from("profiles").select("id,full_name").in("id", ids)) : Promise.resolve([])
};
const cell = (value) => String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
function expenseLinesTsv(lines) {
  const header = ["STT", "Tên khoản chi", "ĐVT", "SL", "Đơn giá", "Thành tiền"];
  const body = lines.map((line, index) => [
    index + 1,
    line.name,
    line.unit ?? "",
    line.qty,
    line.unit_price,
    line.line_total ?? Math.round(line.qty * line.unit_price)
  ]);
  return [header, ...body].map((row) => row.map(cell).join("	")).join("\r\n");
}
const fmtQty = (q) => Number.isInteger(q) ? String(q) : String(q);
async function copyExpenseTable(lines) {
  if (!lines.length) {
    toast.error("Bảng kê chưa có khoản chi để sao chép.");
    return;
  }
  try {
    await navigator.clipboard.writeText(expenseLinesTsv(lines));
    toast.success("Đã sao chép bảng kê. Mở Excel và dán vào ô A1 (Ctrl+V).");
  } catch {
    toast.error("Không thể sao chép. Hãy cấp quyền clipboard cho trình duyệt.");
  }
}
const matchCatalog = (name, catalog) => catalog.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase())?.id ?? null;
function ExpenseLinesEditor({ lines, onChange, catalog }) {
  const [editIdx, setEditIdx] = reactExports.useState(null);
  const set = (i, patch) => onChange(lines.map((l, j) => j === i ? { ...l, ...patch } : l));
  const remove = (i) => {
    const l = lines[i];
    if (!isBlankLine(l) && !window.confirm(`Xóa khoản chi "${l.name || "chưa đặt tên"}"?`)) return;
    onChange(lines.filter((_, j) => j !== i));
  };
  const add = () => onChange([...lines, emptyLine()]);
  const total = linesTotal(lines);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fr-expense-lines space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => copyExpenseTable(lines.filter((l) => !isBlankLine(l)).map((l) => ({ ...l, line_total: lineTotal(l) }))), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4 mr-1.5" }),
      "Sao chép bảng"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:block rounded-lg border overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/50 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-8 px-2 py-2 text-center font-medium", children: "#" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Tên khoản chi *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-20 px-2 py-2 text-left font-medium", children: "ĐVT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-20 px-2 py-2 text-right font-medium", children: "SL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-32 px-2 py-2 text-right font-medium", children: "Đơn giá" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-32 px-2 py-2 text-right font-medium", children: "Thành tiền" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-10 px-1 py-2" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lines.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1 text-center text-muted-foreground", children: i + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "h-9 border-0 shadow-none focus-visible:ring-1",
              list: "fr-line-catalog",
              maxLength: 300,
              placeholder: "VD: In catalogue",
              value: l.name,
              onChange: (e) => set(i, { name: e.target.value, catalog_id: matchCatalog(e.target.value, catalog) })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "h-9 border-0 shadow-none focus-visible:ring-1",
              maxLength: 30,
              placeholder: "Khoản",
              value: l.unit,
              onChange: (e) => set(i, { unit: e.target.value })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "h-9 border-0 shadow-none text-right focus-visible:ring-1",
              inputMode: "decimal",
              value: fmtQty(l.qty),
              onChange: (e) => {
                const v = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
                const n = Number(v);
                set(i, { qty: v === "" ? 0 : Number.isFinite(n) ? n : l.qty });
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "h-9 border-0 shadow-none text-right focus-visible:ring-1",
              inputMode: "numeric",
              placeholder: "0",
              value: l.unit_price ? fmtAmountInput(String(l.unit_price)) : "",
              onChange: (e) => set(i, { unit_price: parseAmount(e.target.value) })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1 text-right font-semibold tabular-nums", children: isBlankLine(l) ? "—" : vnd(lineTotal(l)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", variant: "ghost", className: "h-8 w-8", "aria-label": `Xóa dòng ${i + 1}`, onClick: () => remove(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-muted-foreground" }) }) })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "fr-line-catalog", children: catalog.filter((c) => c.active).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.name }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-2", children: lines.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fr-expense-card rounded-2xl border bg-card p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium leading-snug", children: [
          i + 1,
          ". ",
          l.name || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa đặt tên" })
        ] }),
        !isBlankLine(l) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
          fmtQty(l.qty),
          l.unit ? ` ${l.unit}` : "",
          " × ",
          vnd(l.unit_price)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold tabular-nums", children: isBlankLine(l) ? "—" : vnd(lineTotal(l)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mt-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", variant: "ghost", className: "h-8 w-8", "aria-label": `Sửa khoản ${i + 1}`, onClick: () => setEditIdx(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", variant: "ghost", className: "h-8 w-8", "aria-label": `Xóa khoản ${i + 1}`, onClick: () => remove(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-muted-foreground" }) })
        ] })
      ] })
    ] }) }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        type: "button",
        variant: "outline",
        size: "sm",
        className: "w-full sm:w-auto",
        onClick: () => {
          if (window.matchMedia("(max-width: 767px)").matches) {
            onChange([...lines, emptyLine()]);
            setEditIdx(lines.length);
          } else add();
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Thêm khoản chi"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
        lines.filter((l) => !isBlankLine(l)).length,
        " khoản chi"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
        "Tổng tiền: ",
        vnd(total)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LineDialog,
      {
        line: editIdx !== null ? lines[editIdx] : null,
        catalog,
        onClose: () => setEditIdx(null),
        onSave: (l) => {
          if (editIdx === null) return;
          set(editIdx, l);
          setEditIdx(null);
        }
      }
    )
  ] });
}
function LineDialog({ line, catalog, onClose, onSave }) {
  const [name, setName] = reactExports.useState("");
  const [unit, setUnit] = reactExports.useState("");
  const [qty, setQty] = reactExports.useState("1");
  const [price, setPrice] = reactExports.useState("");
  const [err, setErr] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!line) return;
    setName(line.name);
    setUnit(line.unit);
    setQty(line.qty ? fmtQty(line.qty) : "1");
    setPrice(line.unit_price ? fmtAmountInput(String(line.unit_price)) : "");
    setErr("");
  }, [line]);
  if (!line) return null;
  const q = Number(qty.replace(",", ".")) || 0;
  const p = parseAmount(price);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "fr-mobile-dialog fr-expense-dialog max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Khoản chi" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên khoản chi *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            list: "fr-line-catalog-mobile",
            maxLength: 300,
            value: name,
            autoFocus: true,
            onChange: (e) => setName(e.target.value),
            placeholder: "VD: Vận chuyển"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "fr-line-catalog-mobile", children: catalog.filter((c) => c.active).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.name }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ĐVT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 30, value: unit, onChange: (e) => setUnit(e.target.value), placeholder: "Khoản" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số lượng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "decimal", value: qty, onChange: (e) => setQty(e.target.value.replace(/[^\d.,]/g, "")) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 md:col-span-1 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đơn giá *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "numeric", value: price, onChange: (e) => setPrice(fmtAmountInput(e.target.value)), placeholder: "0" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Thành tiền" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: vnd(Math.round(q * p)) })
      ] }),
      err && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: err }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => {
        if (!name.trim()) return setErr("Vui lòng nhập tên khoản chi.");
        if (!(q > 0)) return setErr("Số lượng phải lớn hơn 0.");
        if (!(p > 0)) return setErr("Đơn giá phải lớn hơn 0.");
        onSave({ ...line, name: name.trim(), unit: unit.trim(), qty: q, unit_price: p, catalog_id: matchCatalog(name, catalog) });
      }, children: "Lưu khoản chi" })
    ] })
  ] }) });
}
function ExpenseLinesView({ lines }) {
  if (!lines.length) return null;
  const total = lines.reduce((s, l) => s + Number(l.line_total), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fr-expense-lines space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Bảng kê khoản chi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => copyExpenseTable(lines.map((l) => ({ name: l.name, unit: l.unit, qty: Number(l.qty), unit_price: Number(l.unit_price), line_total: Number(l.line_total) }))), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4 mr-1.5" }),
        "Sao chép bảng"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/50 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-8 px-2 py-2 text-center font-medium", children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Tên khoản chi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-20 px-2 py-2 text-left font-medium", children: "ĐVT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-16 px-2 py-2 text-right font-medium", children: "SL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-28 px-2 py-2 text-right font-medium", children: "Đơn giá" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-28 px-2 py-2 text-right font-medium", children: "Thành tiền" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lines.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-center text-muted-foreground", children: l.line_no }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5", children: l.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-muted-foreground", children: l.unit ?? "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right tabular-nums", children: fmtQty(Number(l.qty)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right tabular-nums", children: vnd(Number(l.unit_price)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right font-semibold tabular-nums", children: vnd(Number(l.line_total)) })
      ] }, l.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-2", children: lines.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fr-expense-card rounded-2xl border bg-card p-3 flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium leading-snug", children: [
          l.line_no,
          ". ",
          l.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
          fmtQty(Number(l.qty)),
          l.unit ? ` ${l.unit}` : "",
          " × ",
          vnd(Number(l.unit_price))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold tabular-nums shrink-0", children: vnd(Number(l.line_total)) })
    ] }, l.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end rounded-lg bg-muted/50 px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
      "Tổng tiền: ",
      vnd(total)
    ] }) })
  ] });
}
const errMsg$1 = (e) => e instanceof Error ? e.message : String(e);
const fmtDateTime$1 = (s) => s ? new Date(s).toLocaleString("vi-VN") : "—";
const STATUS_LABEL = {
  pending: "Đang chờ",
  sent: "Đã gửi",
  failed: "Lỗi",
  unknown: "Không rõ",
  skipped: "Đã bỏ qua"
};
const STATUS_VARIANT = {
  pending: "secondary",
  sent: "default",
  failed: "destructive",
  unknown: "secondary",
  skipped: "outline"
};
function FinanceZaloSettings({ kind }) {
  const qc = useQueryClient();
  const fnStatus = useServerFn(frGroupStatus);
  const fnGroups = useServerFn(frGroupListGroups);
  const fnSave = useServerFn(frGroupSave);
  const fnTest = useServerFn(frGroupSendTest);
  const fnHistory = useServerFn(frGroupHistory);
  const fnRetry = useServerFn(frGroupRetry);
  const [enabled, setEnabled] = reactExports.useState(false);
  const [groupId, setGroupId] = reactExports.useState("");
  const [groupName, setGroupName] = reactExports.useState("");
  const [intro, setIntro] = reactExports.useState("");
  const [toggles, setToggles] = reactExports.useState({});
  const [groupQuery, setGroupQuery] = reactExports.useState("");
  const [groups, setGroups] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const status = useQuery({
    queryKey: ["fr-zalo", kind, "status"],
    queryFn: () => fnStatus({ data: { kind } })
  });
  const history = useQuery({
    queryKey: ["fr-zalo", kind, "history"],
    queryFn: () => fnHistory({ data: { kind } })
  });
  reactExports.useEffect(() => {
    const s2 = status.data;
    if (!s2) return;
    setEnabled(s2.enabled);
    setGroupId(s2.groupId);
    setGroupName(s2.groupName);
    setIntro(s2.intro);
    setToggles(s2.toggles);
  }, [status.data]);
  const events = reactExports.useMemo(() => FR_ZALO_EVENTS.filter((e) => frZaloEventsForKind(kind).includes(e.key)), [kind]);
  const preview = frGroupMessage("submitted", {
    kind,
    code: kind === "advance" ? "TU-0001" : kind === "payment" ? "TT-0001" : "UL-0001",
    title: kind === "salary_advance" ? "" : "Ví dụ nội dung đề nghị",
    amount: 22e5,
    requester_name: "Nguyễn Văn A",
    status: "pending",
    lines_count: 3
  }, "https://base.suviet.vn/finance/...", intro);
  const loadGroups = async () => {
    setBusy(true);
    try {
      const r = await fnGroups({ data: { kind } });
      if (!r.ok) {
        toast.error(r.message || "Không lấy được danh sách nhóm");
        setGroups([]);
      } else setGroups(r.groups);
    } catch (e) {
      toast.error(errMsg$1(e));
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    setBusy(true);
    try {
      const r = await fnSave({ data: { kind, groupId, groupName, enabled, intro, toggles } });
      if (!r.ok) return toast.error(r.message);
      toast.success(r.message);
      qc.invalidateQueries({ queryKey: ["fr-zalo", kind] });
    } catch (e) {
      toast.error(errMsg$1(e));
    } finally {
      setBusy(false);
    }
  };
  const sendTest = async () => {
    setBusy(true);
    try {
      const r = await fnTest({ data: { kind } });
      r.ok ? toast.success(r.message) : toast.error(r.message);
      qc.invalidateQueries({ queryKey: ["fr-zalo", kind, "history"] });
    } catch (e) {
      toast.error(errMsg$1(e));
    } finally {
      setBusy(false);
    }
  };
  if (status.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải cài đặt Zalo…" });
  const s = status.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Thông báo Zalo nhóm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gửi tự động vào nhóm Zalo do OA quản lý khi đề nghị có biến động. Dùng chung kết nối OA của Base." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: s?.oaConnected ? "default" : "secondary", children: s?.oaConnected ? `OA đã kết nối${s.oaName ? `: ${s.oaName}` : ""}` : "OA chưa kết nối" })
    ] }),
    !s?.oaConnected && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Chưa đủ điều kiện gửi tin nhóm Zalo — cần kết nối OA và cấp quyền nhóm ở khu vực quản lý kết nối Zalo chung." }),
    kind === "salary_advance" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm rounded-md bg-muted/50 px-3 py-2", children: "Bảo mật nhân sự: tin nhóm Tạm Ứng Lương chỉ gồm mã đề nghị và trạng thái — không tên nhân viên, số tiền, lý do hay kỳ lương." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "h-4 w-4", checked: enabled, onChange: (e) => setEnabled(e.target.checked) }),
      "Gửi thông báo vào nhóm Zalo"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhóm Zalo nhận thông báo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Group ID (nhập thủ công hoặc chọn từ danh sách)",
            value: groupId,
            onChange: (e) => setGroupId(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "shrink-0", disabled: busy, onClick: loadGroups, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 mr-1" }),
          "Tải nhóm"
        ] })
      ] }),
      groupName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Đang chọn: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: groupName }),
        " (",
        groupId,
        ")"
      ] }),
      groups !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border max-h-48 overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm nhóm…", value: groupQuery, onChange: (e) => setGroupQuery(e.target.value), className: "h-9" }) }),
        groups.filter((g) => !groupQuery || g.name.toLowerCase().includes(groupQuery.toLowerCase())).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: `w-full text-left px-3 py-2 text-sm hover:bg-accent ${g.id === groupId ? "bg-accent" : ""}`,
            onClick: () => {
              setGroupId(g.id);
              setGroupName(g.name);
            },
            children: [
              g.name,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                "— ",
                g.id
              ] })
            ]
          },
          g.id
        )),
        groups.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-3 text-sm text-muted-foreground", children: "Không lấy được nhóm — kiểm tra quyền OA hoặc nhập Group ID thủ công." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sự kiện gửi thông báo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-1.5", children: events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            className: "h-4 w-4",
            checked: toggles[e.key] !== false,
            onChange: (ev) => setToggles({ ...toggles, [e.key]: ev.target.checked })
          }
        ),
        e.label
      ] }, e.key)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lời dẫn tùy chỉnh (tùy chọn, tối đa 300 ký tự)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          rows: 2,
          maxLength: 300,
          value: intro,
          onChange: (e) => setIntro(e.target.value),
          placeholder: "VD: Kính gửi anh/chị kế toán,"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Xem trước mẫu tin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm", children: preview })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: save, children: busy ? "Đang lưu…" : "Lưu cài đặt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: busy || !groupId, onClick: sendTest, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-1" }),
        "Gửi tin kiểm tra"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lịch sử gửi gần nhất" }),
        (s?.failed ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
          s.failed,
          " lỗi cần xử lý"
        ] })
      ] }),
      (history.data?.events ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có lượt gửi nào." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: (history.data?.events ?? []).map((ev) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: STATUS_VARIANT[ev.status] ?? "outline", children: STATUS_LABEL[ev.status] ?? ev.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate", children: ev.summary ?? ev.event }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            fmtDateTime$1(ev.created_at),
            ev.error ? ` — ${ev.error}` : ""
          ] })
        ] }),
        (ev.status === "failed" || ev.status === "unknown") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: async () => {
          const r = await fnRetry({ data: { kind, id: ev.id } });
          r.ok ? toast.success(r.message) : toast.error(r.message);
          qc.invalidateQueries({ queryKey: ["fr-zalo", kind, "history"] });
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1" }),
          "Gửi lại"
        ] })
      ] }, ev.id)) })
    ] })
  ] });
}
const day = (s) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
};
const num = (n) => Number(n ?? 0);
function frExportRows(kind, rows, lk) {
  const typeName = (r) => {
    const id = kind === "payment" ? r.payment_type_id : r.advance_type_id;
    const n = id ? lk.types[id] ?? "" : "";
    return r.other_label ? `${n} — ${r.other_label}` : n;
  };
  const head = [
    "Mã",
    "Ngày tạo",
    "Người đề nghị",
    kind === "salary_advance" ? "Phân loại" : kind === "advance" ? "Loại tạm ứng" : "Loại thanh toán",
    kind === "salary_advance" ? "Lý do" : kind === "advance" ? "Mục đích" : "Nội dung",
    "Số tiền",
    "Trạng thái",
    "Ngày gửi",
    "Ngày duyệt",
    "Đã chi",
    "Ngày chi",
    "Hình thức chi",
    "Mã giao dịch chi"
  ];
  if (kind === "advance") head.push("Đã quyết toán", "Còn phải quyết toán");
  if (kind === "salary_advance") head.push("Kỳ lương khấu trừ", "Đã khấu trừ/hoàn trả", "Còn lại");
  if (kind === "payment") head.push("Còn phải trả", "Đối tượng nhận", "Thông tin nhận tiền", "Nhà cung cấp", "MST", "Số hóa đơn", "Ngân hàng NCC");
  if (kind === "advance") head.push("Người/đơn vị nhận", "Thông tin nhận tiền", "Chi tiết");
  head.push("Ngày mong muốn", "Ghi chú");
  const body = rows.map((r) => {
    const row = [
      r.code,
      day(r.created_at),
      lk.names[r.requester_id] ?? "",
      typeName(r),
      r.title,
      num(r.amount),
      FR_STATUS_LABEL[r.status] ?? r.status,
      day(r.submitted_at),
      day(r.approved_at),
      num(r.paid_amount),
      day(r.paid_at),
      r.pay_method ?? "",
      r.pay_ref ?? ""
    ];
    if (kind === "advance") row.push(num(r.settled_amount), Math.max(0, num(r.paid_amount) - num(r.settled_amount)));
    if (kind === "salary_advance") row.push(r.salary_period ?? "", num(r.deducted_amount), Math.max(0, num(r.paid_amount) - num(r.deducted_amount)));
    if (kind === "payment") row.push(Math.max(0, num(r.amount) - num(r.paid_amount)), r.payee_name ?? "", r.payee_info ?? "", r.supplier_name ?? "", r.supplier_tax ?? "", r.invoice_no ?? "", r.supplier_bank ?? "");
    if (kind === "advance") row.push(r.payee_name ?? "", r.payee_info ?? "", r.detail ?? "");
    row.push(day(r.desired_date), r.note ?? "");
    return row;
  });
  return [head, ...body];
}
function frExportLineRows(rows, lines) {
  const code = new Map(rows.map((r) => [r.id, r.code]));
  const body = lines.filter((l) => code.has(l.request_id)).sort((a, b) => code.get(a.request_id) < code.get(b.request_id) ? -1 : code.get(a.request_id) > code.get(b.request_id) ? 1 : a.line_no - b.line_no).map((l) => [code.get(l.request_id), l.line_no, l.name, l.unit ?? "", num(l.qty), num(l.unit_price), num(l.line_total)]);
  return [["Mã đề nghị", "STT", "Khoản chi", "Đơn vị", "Số lượng", "Đơn giá", "Thành tiền"], ...body];
}
function frExportFileName(kind, now = /* @__PURE__ */ new Date()) {
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now);
  const slug = { advance: "de-nghi-tam-ung", payment: "de-nghi-thanh-toan", salary_advance: "tam-ung-luong" }[kind];
  return `${slug}-${d}.xlsx`;
}
const frExportTitle = (kind) => FR_KIND_LABEL[kind];
const errMsg = (e) => e instanceof Error ? e.message : String(e);
const fmtDate = (s) => s ? new Date(s).toLocaleDateString("vi-VN") : "—";
const fmtDateTime = (s) => s ? new Date(s).toLocaleString("vi-VN") : "—";
const chip = (on) => `shrink-0 h-9 px-3 rounded-full border text-sm whitespace-nowrap transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"}`;
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    children
  ] });
}
function FinanceRequests({ kind }) {
  const qc = useQueryClient();
  const { user, can, isSuperAdmin } = useCurrentUser();
  const uid = user?.id ?? "";
  const scopePerm = `fr.${kind === "salary_advance" ? "salary" : kind}.view_scope`;
  const payPerm = `fr.${kind === "salary_advance" ? "salary" : kind}.pay`;
  const reportPerm = `fr.${kind === "salary_advance" ? "salary" : kind}.report`;
  const settingsPerm = `fr.${kind === "salary_advance" ? "salary" : kind}.settings`;
  const deductPerm = "fr.salary.deduct";
  const canScope = can(scopePerm);
  const canPay = can(payPerm);
  const canReport = can(reportPerm);
  const canSettings = can(settingsPerm);
  const canDeduct = kind === "salary_advance" && can(deductPerm);
  const [tab, setTab] = reactExports.useState("mine");
  const [filter, setFilter] = reactExports.useState("");
  const [q, setQ] = reactExports.useState("");
  const [qText, setQText] = reactExports.useState("");
  reactExports.useEffect(() => {
    const h = setTimeout(() => setQ(qText), 350);
    return () => clearTimeout(h);
  }, [qText]);
  const [createOpen, setCreateOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [detailId, setDetailId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const open = new URLSearchParams(window.location.search).get("open");
    if (open) setDetailId(open);
  }, []);
  const invalidate = () => qc.invalidateQueries({ predicate: (qr) => String(qr.queryKey[0]) === "fr" });
  const statuses = quickFilterStatuses(filter);
  const mine = useQuery({
    queryKey: ["fr", kind, "mine", uid, filter, q],
    queryFn: () => frApi.list(kind, { mine: true, uid, statuses, q: q || void 0 }),
    enabled: !!uid && tab === "mine"
  });
  const all = useQuery({
    queryKey: ["fr", kind, "all", filter, q],
    queryFn: () => frApi.list(kind, { statuses, q: q || void 0 }),
    enabled: tab === "all" && canScope
  });
  const pendingSteps = useQuery({
    queryKey: ["fr", kind, "todo", uid],
    queryFn: () => frApi.pendingSteps(),
    enabled: tab === "todo" && !!uid
  });
  const todoIds = reactExports.useMemo(() => {
    const steps = (pendingSteps.data ?? []).filter((s) => s.approver_id === uid || s.perm && can(s.perm));
    return steps.map((s) => s.request_id);
  }, [pendingSteps.data, uid]);
  const todo = useQuery({
    queryKey: ["fr", kind, "todo-reqs", todoIds.join(",")],
    queryFn: async () => {
      if (!todoIds.length) return [];
      const reqs = await Promise.all(todoIds.map((id) => frApi.detail(id)));
      return reqs.filter((r) => !!r && r.kind === kind && r.status === "pending");
    },
    enabled: tab === "todo" && todoIds.length >= 0 && pendingSteps.isSuccess
  });
  const rows = tab === "mine" ? mine.data ?? [] : tab === "all" ? all.data ?? [] : tab === "todo" ? todo.data ?? [] : [];
  const loading = tab === "mine" && mine.isLoading || tab === "all" && all.isLoading || tab === "todo" && (pendingSteps.isLoading || todo.isLoading);
  const [exporting, setExporting] = reactExports.useState(false);
  const exportExcel = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const list = tab === "todo" ? rows : await frApi.listAll(kind, { statuses, q: q || void 0, mine: tab === "mine", uid });
      if (!list.length) {
        toast.error("Không có đề nghị nào để xuất.");
        return;
      }
      const [names, types, lines] = await Promise.all([
        frApi.profiles([...new Set(list.map((r) => r.requester_id))]),
        frApi.paymentTypes(kind),
        kind === "payment" ? frApi.linesFor(list.map((r) => r.id)) : Promise.resolve([])
      ]);
      const lk = {
        names: Object.fromEntries(names.map((p) => [p.id, p.full_name ?? ""])),
        types: Object.fromEntries(types.map((t) => [t.id, t.name]))
      };
      const XLSX = await import("../_libs/xlsx.mjs");
      const wb = XLSX.utils.book_new();
      const tabLabel = tab === "mine" ? "Đề nghị của tôi" : tab === "all" ? "Tất cả" : "Chờ tôi xử lý";
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(frExportRows(kind, list, lk)), "Đề nghị");
      if (kind === "payment") XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(frExportLineRows(list, lines)), "Bảng kê");
      wb.Props = { Title: `${frExportTitle(kind)} — ${tabLabel}` };
      XLSX.writeFile(wb, frExportFileName(kind));
      toast.success(`Đã xuất ${list.length} đề nghị`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setExporting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "finance-requests-mobile space-y-4 pb-24 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: FR_KIND_LABEL[kind] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setCreateOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Tạo đề nghị"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fr-mobile-tabs flex gap-1 overflow-x-auto max-w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(tab === "mine"), onClick: () => setTab("mine"), children: "Đề nghị của tôi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(tab === "todo"), onClick: () => setTab("todo"), children: "Chờ tôi xử lý" }),
        canScope && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(tab === "all"), onClick: () => setTab("all"), children: "Tất cả" }),
        canReport && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(tab === "report"), onClick: () => setTab("report"), children: "Báo cáo" }),
        canSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(tab === "settings"), onClick: () => setTab("settings"), children: "Cài đặt" })
      ] })
    ] }),
    (tab === "mine" || tab === "all" || tab === "todo") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-9", placeholder: "Tìm theo mã, nội dung…", value: qText, onChange: (e) => setQText(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: exporting || loading, onClick: exportExcel, "aria-label": "Xuất Excel", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 sm:mr-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: exporting ? "Đang xuất…" : "Xuất Excel" })
        ] })
      ] }),
      tab !== "todo" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: FR_QUICK_FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(filter === f.key), onClick: () => setFilter(f.key), children: f.label }, f.key)) }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" }),
      !loading && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Chưa có đề nghị nào." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(RequestCard, { r, uid, onOpen: () => setDetailId(r.id) }, r.id)) })
    ] }),
    tab === "report" && canReport && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportTab, { kind }),
    tab === "settings" && canSettings && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, { kind, onSaved: invalidate }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RequestForm,
      {
        kind,
        open: createOpen,
        editing,
        onClose: () => {
          setCreateOpen(false);
          setEditing(null);
        },
        onSaved: () => {
          setCreateOpen(false);
          setEditing(null);
          invalidate();
        }
      }
    ),
    detailId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RequestDetail,
      {
        id: detailId,
        kind,
        uid,
        canPay,
        canDeduct,
        isSuperAdmin,
        onClose: () => setDetailId(null),
        onChanged: () => invalidate(),
        onEdit: (r) => {
          setDetailId(null);
          setEditing(r);
          setCreateOpen(true);
        },
        canDecidePerm: (perm) => can(perm)
      }
    )
  ] });
}
function RequestCard({ r, uid, onOpen }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpen, className: "fr-request-card text-left rounded-2xl border bg-card p-4 space-y-2 hover:bg-accent/50 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-semibold", children: r.code }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: FR_STATUS_VARIANT[r.status], children: FR_STATUS_LABEL[r.status] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium line-clamp-2", children: r.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: vnd(r.amount) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtDate(r.created_at) }),
      r.requester_id !== uid && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Người đề nghị khác" }),
      r.paid_amount > 0 && r.paid_amount < r.amount && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Đã chi ",
        vnd(r.paid_amount)
      ] })
    ] })
  ] });
}
function RequestForm({ kind, open, editing, onClose, onSaved }) {
  const { user } = useCurrentUser();
  const uid = user?.id ?? "";
  const [amount, setAmount] = reactExports.useState("");
  const [title, setTitle] = reactExports.useState("");
  const [detail, setDetail] = reactExports.useState("");
  const [desiredDate, setDesiredDate] = reactExports.useState("");
  const [payeeName, setPayeeName] = reactExports.useState("");
  const [payeeInfo, setPayeeInfo] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const [typeId, setTypeId] = reactExports.useState("");
  const [advanceId, setAdvanceId] = reactExports.useState("");
  const [supplierName, setSupplierName] = reactExports.useState("");
  const [supplierTax, setSupplierTax] = reactExports.useState("");
  const [supplierBank, setSupplierBank] = reactExports.useState("");
  const [invoiceNo, setInvoiceNo] = reactExports.useState("");
  const [salaryPeriod, setSalaryPeriod] = reactExports.useState("");
  const [otherLabel, setOtherLabel] = reactExports.useState("");
  const [attachments, setAttachments] = reactExports.useState([]);
  const [files, setFiles] = reactExports.useState([]);
  const [lines, setLines] = reactExports.useState([]);
  const [linkUrl, setLinkUrl] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const requestKey = reactExports.useRef(crypto.randomUUID());
  const typeKind = kind;
  const types = useQuery({ queryKey: ["fr", "types", typeKind], queryFn: () => frApi.paymentTypes(typeKind), enabled: open });
  const settleOpts = useQuery({ queryKey: ["fr", "settle-opts"], queryFn: frApi.settleOptions, enabled: open && kind === "payment" });
  const catalog = useQuery({ queryKey: ["fr", "line-catalog"], queryFn: frApi.lineCatalog, enabled: open && kind === "payment" });
  const selectedType = (types.data ?? []).find((t) => t.id === typeId);
  const isSettle = selectedType?.sys_code === "settle";
  const isSupplier = selectedType?.sys_code === "supplier";
  const isOther = selectedType?.sys_code === "other";
  const typeOptions = (types.data ?? []).filter((t) => t.active || t.id === typeId);
  reactExports.useEffect(() => {
    if (!open) return;
    requestKey.current = crypto.randomUUID();
    setFiles([]);
    if (editing) {
      setAmount(fmtAmountInput(String(editing.amount)));
      setTitle(editing.title);
      setDetail(editing.detail ?? "");
      setDesiredDate(editing.desired_date ?? "");
      setPayeeName(editing.payee_name ?? "");
      setPayeeInfo(editing.payee_info ?? "");
      setNote(editing.note ?? "");
      setTypeId((kind === "payment" ? editing.payment_type_id : editing.advance_type_id) ?? "");
      setAdvanceId(editing.advance_id ?? "");
      setOtherLabel(editing.other_label ?? "");
      setSupplierName(editing.supplier_name ?? "");
      setSupplierTax(editing.supplier_tax ?? "");
      setSupplierBank(editing.supplier_bank ?? "");
      setInvoiceNo(editing.invoice_no ?? "");
      setSalaryPeriod(editing.salary_period ?? "");
      setAttachments(editing.attachments?.filter((a) => a?.path || a?.url) ?? []);
      setLines([]);
    } else {
      setAmount("");
      setTitle("");
      setDetail("");
      setDesiredDate("");
      setPayeeName("");
      setPayeeInfo("");
      setNote("");
      setTypeId("");
      setAdvanceId("");
      setSupplierName("");
      setSupplierTax("");
      setSupplierBank("");
      setInvoiceNo("");
      setSalaryPeriod("");
      setOtherLabel("");
      setAttachments([]);
      setLines(kind === "payment" ? [emptyLine()] : []);
    }
    setLinkUrl("");
  }, [open, editing]);
  reactExports.useEffect(() => {
    if (!(open && kind === "payment" && editing)) return;
    frApi.lines(editing.id).then((ls) => setLines(ls.length ? ls.map((l) => ({ id: l.id, name: l.name, catalog_id: l.catalog_id, unit: l.unit ?? "", qty: Number(l.qty), unit_price: Number(l.unit_price) })) : [emptyLine()])).catch(() => {
    });
  }, [open, editing, kind]);
  const effectiveAmount = kind === "payment" ? linesTotal(lines) : parseAmount(amount);
  const payload = () => ({
    amount: effectiveAmount,
    title,
    detail,
    desired_date: desiredDate || null,
    payee_name: payeeName,
    payee_info: payeeInfo,
    note,
    payment_type_id: kind === "payment" ? typeId || null : null,
    advance_type_id: kind !== "payment" ? typeId || null : null,
    other_label: isOther ? otherLabel.trim() : null,
    advance_id: isSettle ? advanceId || null : null,
    supplier_name: supplierName,
    supplier_tax: supplierTax,
    supplier_bank: supplierBank,
    invoice_no: invoiceNo,
    salary_period: salaryPeriod,
    attachments,
    // Backend tự tính lại thành tiền/tổng tiền từ bảng kê, không tin số client gửi.
    ...kind === "payment" ? { lines: lines.filter((l) => !isBlankLine(l)).map((l) => ({
      name: l.name,
      catalog_id: l.catalog_id ?? null,
      unit: l.unit,
      qty: l.qty,
      unit_price: l.unit_price
    })) } : {}
  });
  const save = async (submitAfter) => {
    if (kind === "payment") {
      const lineErr = validateLines(lines);
      if (lineErr) return toast.error(lineErr);
    }
    const err = frValidate(kind, {
      amount: effectiveAmount,
      title,
      paymentTypeId: typeId,
      payeeName,
      salaryPeriod,
      isOther,
      otherLabel,
      salaryTypeRequired: kind === "salary_advance" && (types.data ?? []).some((t) => t.active)
    });
    if (err) return toast.error(err);
    setBusy(true);
    try {
      const id = await frApi.save(editing?.id ?? null, kind, payload(), requestKey.current);
      if (files.length) {
        const uploaded = [...attachments];
        for (const f of files) {
          const path = `${uid}/${id}/${Date.now()}_${f.name}`;
          const { error } = await supabase.storage.from("fr-attachments").upload(path, f);
          if (error) throw new Error(`Tải tệp ${f.name} thất bại: ${error.message}`);
          uploaded.push({ name: f.name, path });
        }
        await frApi.save(id, kind, { ...payload(), attachments: uploaded }, requestKey.current);
        setAttachments(uploaded);
        setFiles([]);
      }
      if (submitAfter) {
        const result = await frApi.submit(id);
        if (result === "needs_config") toast.warning("Đề nghị đã gửi nhưng chưa có quy trình duyệt. Người quản trị cần cấu hình trong mục Cài đặt.");
        else toast.success("Đã gửi đề nghị");
      } else {
        toast.success("Đã lưu nháp");
      }
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: `fr-mobile-dialog ${kind === "payment" ? "sm:max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? `Sửa ${FR_KIND_LABEL[kind]}` : `Tạo ${FR_KIND_LABEL[kind]}` }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      kind !== "payment" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: kind === "salary_advance" ? "Số tiền muốn tạm ứng *" : "Số tiền đề nghị *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "numeric", value: amount, onChange: (e) => setAmount(fmtAmountInput(e.target.value)), placeholder: "VD: 5.000.000" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: kind === "advance" ? "Mục đích tạm ứng *" : kind === "salary_advance" ? "Lý do *" : "Nội dung thanh toán *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 300, value: title, onChange: (e) => setTitle(e.target.value), placeholder: kind === "advance" ? "VD: Tạm ứng mua vật tư" : "" }) }),
      kind === "advance" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nội dung chi tiết", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, maxLength: 3e3, value: detail, onChange: (e) => setDetail(e.target.value) }) }),
      kind === "payment" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Loại thanh toán *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: typeId, onChange: (e) => setTypeId(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn loại —" }),
          typeOptions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: t.id, children: [
            t.name,
            t.active ? "" : " (đã ngừng)"
          ] }, t.id))
        ] }) }),
        isOther && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhập loại cụ thể *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 200, value: otherLabel, onChange: (e) => setOtherLabel(e.target.value), placeholder: "VD: Chi phí thuê thiết bị" }) }),
        isSettle && /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Liên kết khoản tạm ứng (không bắt buộc)", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: advanceId, onChange: (e) => setAdvanceId(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Không liên kết khoản tạm ứng —" }),
            (settleOpts.data ?? []).map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: o.id, children: [
              o.code,
              " — ",
              o.title,
              " (còn ",
              vnd(o.remaining),
              ")"
            ] }, o.id))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Không liên kết vẫn có thể gửi hoàn ứng; chỉ khi liên kết, số tiền mới được tự động đối trừ vào khoản tạm ứng đã chọn sau khi chi xong." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Đối tượng nhận tiền *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 200, value: payeeName, onChange: (e) => setPayeeName(e.target.value) }) }),
        isSupplier && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên đơn vị nhà cung cấp", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 200, value: supplierName, onChange: (e) => setSupplierName(e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mã số thuế", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 50, value: supplierTax, onChange: (e) => setSupplierTax(e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Số hóa đơn/chứng từ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 100, value: invoiceNo, onChange: (e) => setInvoiceNo(e.target.value) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thông tin ngân hàng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 300, value: supplierBank, onChange: (e) => setSupplierBank(e.target.value), placeholder: "Ngân hàng — STK — Chủ TK" }) })
        ] })
      ] }),
      kind === "advance" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Loại tạm ứng *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: typeId, onChange: (e) => setTypeId(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn loại —" }),
          typeOptions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: t.id, children: [
            t.name,
            t.active ? "" : " (đã ngừng)"
          ] }, t.id))
        ] }) }),
        isOther && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhập loại cụ thể *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 200, value: otherLabel, onChange: (e) => setOtherLabel(e.target.value), placeholder: "VD: Tạm ứng phục vụ khai trương showroom" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người/đơn vị nhận tiền (nếu khác người đề nghị)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 200, value: payeeName, onChange: (e) => setPayeeName(e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thông tin nhận tiền (nếu cần)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 300, value: payeeInfo, onChange: (e) => setPayeeInfo(e.target.value), placeholder: "Ngân hàng — STK — Chủ TK" }) })
      ] }),
      kind === "payment" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thông tin tài khoản nhận tiền (nếu cần)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 300, value: payeeInfo, onChange: (e) => setPayeeInfo(e.target.value), placeholder: "Ngân hàng — STK — Chủ TK" }) }),
      kind === "payment" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bảng kê khoản chi *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpenseLinesEditor, { lines, onChange: setLines, catalog: catalog.data ?? [] }) }),
      kind === "salary_advance" && typeOptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phân loại tạm ứng lương *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: typeId, onChange: (e) => setTypeId(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn loại —" }),
          typeOptions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: t.id, children: [
            t.name,
            t.active ? "" : " (đã ngừng)"
          ] }, t.id))
        ] }) }),
        isOther && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhập loại cụ thể *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 200, value: otherLabel, onChange: (e) => setOtherLabel(e.target.value) }) })
      ] }),
      kind === "salary_advance" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Kỳ lương dự kiến khấu trừ *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "month", value: salaryPeriod, onChange: (e) => setSalaryPeriod(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: kind === "payment" ? "Ngày đề nghị thanh toán" : "Ngày mong muốn nhận tiền", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: desiredDate, onChange: (e) => setDesiredDate(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Chứng từ & tài liệu đính kèm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "file", multiple: true, accept: "image/*,application/pdf", onChange: (e) => setFiles(Array.from(e.target.files ?? [])) }),
        files.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3" }),
          f.name,
          " (chưa tải lên)"
        ] }, i)),
        attachments.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 truncate", children: [
            a.name,
            a.url ? " (liên kết)" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "ghost", "aria-label": `Xóa đính kèm ${a.name}`, onClick: () => setAttachments(attachments.filter((_, j) => j !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
        ] }, a.path ?? a.url ?? i)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Dán liên kết tài liệu (Google Drive…)", value: linkUrl, onChange: (e) => setLinkUrl(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "shrink-0", onClick: () => {
            const u = linkUrl.trim();
            if (!u) return;
            if (!/^https?:\/\//i.test(u)) return toast.error("Liên kết phải bắt đầu bằng http:// hoặc https://");
            setAttachments([...attachments, { name: u.replace(/^https?:\/\//i, "").slice(0, 80), url: u }]);
            setLinkUrl("");
          }, children: "Thêm liên kết" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, maxLength: 1e3, value: note, onChange: (e) => setNote(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fr-form-actions flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", disabled: busy, onClick: () => save(false), children: "Lưu nháp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "flex-1", disabled: busy, onClick: () => save(true), children: busy ? "Đang lưu…" : "Gửi đề nghị" })
      ] })
    ] })
  ] }) });
}
function RequestDetail({ id, kind, uid, canPay, canDeduct, isSuperAdmin, onClose, onChanged, onEdit, canDecidePerm }) {
  useRegisterAiRecord("finance", id);
  const detail = useQuery({ queryKey: ["fr", "detail", id], queryFn: () => frApi.detail(id) });
  const steps = useQuery({ queryKey: ["fr", "steps", id], queryFn: () => frApi.steps(id) });
  const events = useQuery({ queryKey: ["fr", "events", id], queryFn: () => frApi.events(id) });
  const reqLines = useQuery({ queryKey: ["fr", "lines", id], queryFn: () => frApi.lines(id), enabled: kind === "payment" });
  const detailTypeKind = kind;
  const types = useQuery({ queryKey: ["fr", "types", detailTypeKind], queryFn: () => frApi.paymentTypes(detailTypeKind) });
  const [comment, setComment] = reactExports.useState("");
  const [payOpen, setPayOpen] = reactExports.useState(false);
  const [deductOpen, setDeductOpen] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const r = detail.data;
  const act = async (fn, ok) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      await Promise.all([detail.refetch(), steps.refetch(), events.refetch()]);
      onChanged();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  if (!r) return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { className: "fr-mobile-sheet w-full sm:max-w-xl overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-muted-foreground", children: "Đang tải…" }) }) });
  const isOwner = r.requester_id === uid;
  const typeName = (types.data ?? []).find((t) => t.id === (kind === "payment" ? r.payment_type_id : r.advance_type_id))?.name;
  const currentStep = (steps.data ?? []).find((s) => s.step_no === r.current_step);
  const canDecide = r.status === "pending" && !!currentStep && (currentStep.approver_id === uid || (currentStep.perm ? canDecidePerm(currentStep.perm) : false)) && (isOwner ? false : true);
  const showPay = canPay && (r.status === "awaiting_payment" || r.status === "paid" && r.paid_amount < r.amount);
  const showDeduct = canDeduct && r.status === "paid" && r.deducted_amount < r.paid_amount;
  const openAttachment = async (a) => {
    if (a.url) return window.open(a.url, "_blank", "noopener");
    if (!a.path) return;
    const { data, error } = await supabase.storage.from("fr-attachments").createSignedUrl(a.path, 120);
    if (error || !data?.signedUrl) return toast.error("Không mở được tệp đính kèm");
    window.open(data.signedUrl, "_blank", "noopener");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "fr-mobile-sheet w-full sm:max-w-xl overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: r.code }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: FR_STATUS_VARIANT[r.status], children: FR_STATUS_LABEL[r.status] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "w-full sm:w-auto", onClick: openRecordAi, children: "Hỏi Đốm về hồ sơ này" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: vnd(r.amount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: r.title }),
        r.detail && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: r.detail }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Ngày tạo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtDateTime(r.created_at) }),
          typeName && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: FR_TYPE_LABEL[kind] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              typeName,
              r.other_label ? ` — ${r.other_label}` : ""
            ] })
          ] }),
          r.desired_date && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Ngày mong muốn" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtDate(r.desired_date) })
          ] }),
          r.payee_name && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người nhận tiền" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.payee_name })
          ] }),
          r.payee_info && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Thông tin nhận" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.payee_info })
          ] }),
          r.supplier_name && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nhà cung cấp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.supplier_name })
          ] }),
          r.supplier_tax && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Mã số thuế" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.supplier_tax })
          ] }),
          r.invoice_no && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Số HĐ/chứng từ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.invoice_no })
          ] }),
          r.salary_period && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Kỳ lương khấu trừ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.salary_period })
          ] })
        ] }),
        r.attachments?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 pt-1", children: r.attachments.filter((a) => a?.path || a?.url).map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => openAttachment(a), className: "flex items-center gap-1 text-sm text-primary hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3" }),
          a.name,
          a.url ? " (liên kết)" : ""
        ] }, a.path ?? a.url ?? i)) }),
        r.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Ghi chú: ",
          r.note
        ] })
      ] }),
      kind === "payment" && (reqLines.data ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ExpenseLinesView, { lines: reqLines.data }),
      (r.paid_amount > 0 || r.status === "awaiting_payment") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Tình trạng chi tiền" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Đã chi: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: vnd(r.paid_amount) }),
          " / ",
          vnd(r.amount),
          r.paid_amount < r.amount && r.paid_amount > 0 ? ` (còn ${vnd(frRemainingToPay(r))})` : ""
        ] }),
        r.paid_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          "Lần chi gần nhất: ",
          fmtDateTime(r.paid_at),
          r.pay_method ? ` — ${r.pay_method}` : "",
          r.pay_ref ? ` — Mã tham chiếu: ${r.pay_ref}` : ""
        ] }),
        r.kind === "advance" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Đã quyết toán: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: vnd(r.settled_amount) }),
          " — còn ",
          vnd(frAdvanceRemaining(r))
        ] }),
        r.kind === "salary_advance" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Đã khấu trừ/hoàn trả: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: vnd(r.deducted_amount) }),
          " — còn ",
          vnd(frSalaryRemaining(r))
        ] })
      ] }),
      (steps.data ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Quy trình phê duyệt" }),
        (steps.data ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm rounded-md border p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : s.status === "info_requested" ? "secondary" : "outline", children: s.step_no }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              s.label,
              " ",
              s.step_no === r.current_step && r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "(đang chờ)" })
            ] }),
            s.comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
              "“",
              s.comment,
              "”"
            ] }),
            s.decided_at && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: fmtDateTime(s.decided_at) })
          ] })
        ] }, s.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        isOwner && frEditable(r.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: () => onEdit(r), children: "Sửa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "flex-1", disabled: busy, onClick: () => act(async () => {
            const res = await frApi.submit(r.id);
            if (res === "needs_config") toast.warning("Chưa có quy trình duyệt — đề nghị chuyển sang Chờ cấu hình.");
          }, "Đã gửi đề nghị"), children: "Gửi duyệt" })
        ] }),
        isOwner && frCancellable(r.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full", disabled: busy, onClick: () => act(() => frApi.cancel(r.id), "Đã hủy đề nghị"), children: "Hủy đề nghị" }),
        canDecide && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Xử lý phê duyệt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, maxLength: 1e3, placeholder: "Ý kiến / lý do (bắt buộc khi từ chối hoặc yêu cầu bổ sung)", value: comment, onChange: (e) => setComment(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fr-decision-actions grid grid-cols-1 sm:grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: () => act(() => frApi.decide(r.id, "approve", comment), "Đã phê duyệt"), children: "Phê duyệt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", disabled: busy, onClick: () => act(() => frApi.decide(r.id, "info", comment), "Đã yêu cầu bổ sung"), children: "Yêu cầu bổ sung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: busy, onClick: () => act(() => frApi.decide(r.id, "reject", comment), "Đã từ chối"), children: "Từ chối" })
          ] })
        ] }),
        showPay && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => setPayOpen(true), children: "Xác nhận chi tiền" }),
        showDeduct && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => setDeductOpen(true), children: "Xác nhận khấu trừ/hoàn trả" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Lịch sử" }),
        (events.data ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fr-history-event text-sm flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: fmtDateTime(e.created_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            FR_EVENT_LABEL[e.action] ?? e.action,
            e.payload?.comment ? ` — “${e.payload.comment}”` : "",
            e.action === "pay" ? ` — ${vnd(e.payload?.amount)}` : "",
            e.action === "deduct" ? ` — ${vnd(e.payload?.amount)}` : ""
          ] })
        ] }, e.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PayDialog,
      {
        open: payOpen,
        onClose: () => setPayOpen(false),
        remaining: frRemainingToPay(r),
        onConfirm: (amount, method, ref, note) => act(() => frApi.pay(r.id, amount, method, ref, note), "Đã xác nhận chi tiền")
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeductDialog,
      {
        open: deductOpen,
        onClose: () => setDeductOpen(false),
        remaining: frSalaryRemaining(r),
        onConfirm: (amount, note) => act(() => frApi.deduct(r.id, amount, note), "Đã xác nhận khấu trừ")
      }
    )
  ] }) });
}
const FR_EVENT_LABEL = {
  create: "Tạo đề nghị",
  update: "Cập nhật",
  submit: "Gửi duyệt",
  needs_config: "Chờ cấu hình quy trình",
  approve_step: "Duyệt bước",
  approved: "Phê duyệt xong",
  reject: "Từ chối",
  info: "Yêu cầu bổ sung",
  cancel: "Hủy đề nghị",
  pay: "Xác nhận chi",
  settle: "Quyết toán tạm ứng",
  deduct: "Khấu trừ/hoàn trả"
};
function PayDialog({ open, onClose, remaining, onConfirm }) {
  const [amount, setAmount] = reactExports.useState("");
  const [method, setMethod] = reactExports.useState("Chuyển khoản");
  const [ref, setRef] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (open) {
      setAmount(fmtAmountInput(String(remaining)));
      setRef("");
      setNote("");
    }
  }, [open, remaining]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "fr-mobile-dialog max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Xác nhận chi tiền" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `Số tiền thực chi (còn phải chi: ${vnd(remaining)}) *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "numeric", value: amount, onChange: (e) => setAmount(fmtAmountInput(e.target.value)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Hình thức chi", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: method, onChange: (e) => setMethod(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Chuyển khoản" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Tiền mặt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Khác" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mã tham chiếu / số chứng từ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 100, value: ref, onChange: (e) => setRef(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, maxLength: 500, value: note, onChange: (e) => setNote(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => {
        const a = parseAmount(amount);
        if (!a || a <= 0) return toast.error("Số tiền chi phải lớn hơn 0");
        if (a > remaining) return toast.error("Số tiền chi vượt số còn phải chi");
        onConfirm(a, method, ref, note);
        onClose();
      }, children: "Xác nhận" })
    ] })
  ] }) });
}
function DeductDialog({ open, onClose, remaining, onConfirm }) {
  const [amount, setAmount] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (open) {
      setAmount(fmtAmountInput(String(remaining)));
      setNote("");
    }
  }, [open, remaining]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "fr-mobile-dialog max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Xác nhận khấu trừ/hoàn trả" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `Số tiền khấu trừ lần này (còn lại: ${vnd(remaining)}) *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "numeric", value: amount, onChange: (e) => setAmount(fmtAmountInput(e.target.value)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, maxLength: 500, value: note, onChange: (e) => setNote(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => {
        const a = parseAmount(amount);
        if (!a || a <= 0) return toast.error("Số tiền phải lớn hơn 0");
        if (a > remaining) return toast.error("Vượt số dư chưa tất toán");
        onConfirm(a, note);
        onClose();
      }, children: "Xác nhận" })
    ] })
  ] }) });
}
function ReportTab({ kind }) {
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const report = useQuery({
    queryKey: ["fr", kind, "report", from, to],
    queryFn: () => frApi.report(kind, from || null, to || null)
  });
  const d = report.data;
  const requesterIds = reactExports.useMemo(() => (d?.by_requester ?? []).map((r) => r.requester_id), [d]);
  const names = useQuery({
    queryKey: ["fr", "names", requesterIds.join(",")],
    queryFn: () => frApi.profiles(requesterIds),
    enabled: requesterIds.length > 0
  });
  const nameOf = (id) => (names.data ?? []).find((p) => p.id === id)?.full_name ?? "—";
  if (report.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải báo cáo…" });
  if (!d) return null;
  const cards = [
    { label: "Tổng số đề nghị", value: String(d.total) },
    { label: "Tổng tiền đề nghị", value: vnd(d.amount) },
    { label: "Tổng đã duyệt", value: vnd(d.approved_amount) },
    { label: "Tổng đã chi", value: vnd(d.paid_amount) },
    { label: "Đang chờ duyệt", value: String(d.pending_count) },
    { label: "Đang chờ chi", value: String(d.awaiting_pay_count) }
  ];
  if (kind === "advance") {
    cards.push({ label: "Chưa hoàn ứng", value: vnd(d.paid_amount - d.settled_amount) });
    cards.push({ label: "Chưa quyết toán", value: String(d.open_settle_count) });
  }
  if (kind === "payment") cards.push({ label: "Còn phải trả", value: vnd(d.approved_amount - d.paid_amount) });
  if (kind === "salary_advance") {
    cards.push({ label: "Đã khấu trừ/hoàn trả", value: vnd(d.deducted_amount) });
    cards.push({ label: "Chưa tất toán", value: vnd(d.paid_amount - d.deducted_amount) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Từ ngày", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Đến ngày", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2", children: cards.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: c.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: c.value })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Theo trạng thái" }),
        Object.entries(d.by_status).map(([st, c]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: FR_STATUS_LABEL[st] ?? st }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: c })
        ] }, st)),
        Object.keys(d.by_status).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có dữ liệu." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Theo nhân viên" }),
        d.by_requester.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: nameOf(r.requester_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: r.count }),
            " đề nghị — ",
            vnd(r.amount)
          ] })
        ] }, r.requester_id)),
        d.by_requester.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có dữ liệu." })
      ] })
    ] }),
    Array.isArray(d.by_type) && d.by_type.some((t) => t.name !== "Chưa phân loại") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Theo loại" }),
      d.by_type.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: t.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: t.count }),
            " đề nghị — ",
            vnd(t.amount),
            " (",
            Number(d.amount) > 0 ? Math.round(Number(t.amount) / Number(d.amount) * 100) : 0,
            "%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Đã duyệt ",
            vnd(t.approved)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Đã chi ",
            vnd(t.paid)
          ] })
        ] })
      ] }, t.name))
    ] }),
    kind === "payment" && Array.isArray(d.by_line) && d.by_line.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Theo khoản chi" }),
      d.by_line.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: l.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: l.count }),
          " khoản — ",
          vnd(l.amount)
        ] })
      ] }, l.name))
    ] })
  ] });
}
function SettingsTab({ kind, onSaved }) {
  const settings = useQuery({ queryKey: ["fr", "settings"], queryFn: frApi.settings });
  const cfg = (settings.data ?? []).find((s) => s.kind === kind);
  const permPrefix = kind === "salary_advance" ? "fr.salary" : `fr.${kind}`;
  const [flow, setFlow] = reactExports.useState([]);
  const [limits, setLimits] = reactExports.useState({});
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (cfg) {
      setFlow((cfg.flow ?? []).map((s) => ({ label: s.label ?? "", perm: s.position === "executive_director" ? "position:executive_director" : s.user_id ? `user:${s.user_id}` : s.perm ?? `${permPrefix}.approve` })));
      setLimits(cfg.limits ?? {});
    }
  }, [cfg, permPrefix]);
  const save = async () => {
    setBusy(true);
    try {
      await frApi.saveSettings(kind, flow.map((s, i) => ({ label: s.label || `Cấp duyệt ${i + 1}`, ...s.perm === "position:executive_director" ? { position: "executive_director" } : s.perm.startsWith("user:") ? { user_id: s.perm.slice(5) } : { perm: s.perm } })), limits);
      toast.success("Đã lưu cài đặt");
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  if (settings.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải cài đặt…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Quy trình phê duyệt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mỗi cấp duyệt gán theo chức danh hoặc quyền được chọn. Đề nghị đi qua từng cấp theo thứ tự." }),
      flow.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-mono w-6", children: [
          i + 1,
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            className: "flex-1 min-w-32",
            placeholder: "Tên cấp duyệt",
            value: s.label,
            onChange: (e) => setFlow(flow.map((x, j) => j === i ? { ...x, label: e.target.value } : x))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "h-10 rounded-md border bg-background px-2 text-sm",
            value: s.perm,
            onChange: (e) => setFlow(flow.map((x, j) => j === i ? { ...x, perm: e.target.value } : x)),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "position:executive_director", children: "Giám đốc điều hành (theo bổ nhiệm hiện tại)" }),
              s.perm.startsWith("user:") && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.perm, children: "Người duyệt được chỉ định" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: `${permPrefix}.approve`, children: "Người có quyền Phê duyệt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: `${permPrefix}.view_scope`, children: "Người có quyền Xem phạm vi" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: `${permPrefix}.settings`, children: "Người có quyền Cài đặt" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", disabled: i === 0, onClick: () => {
          const f = [...flow];
          [f[i - 1], f[i]] = [f[i], f[i - 1]];
          setFlow(f);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", disabled: i === flow.length - 1, onClick: () => {
          const f = [...flow];
          [f[i + 1], f[i]] = [f[i], f[i + 1]];
          setFlow(f);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setFlow(flow.filter((_, j) => j !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, i)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setFlow([...flow, { label: "", perm: `${permPrefix}.approve` }]), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Thêm cấp duyệt"
      ] }),
      flow.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Chưa có cấp duyệt — đề nghị gửi lên sẽ chuyển sang “Chờ cấu hình duyệt”." })
    ] }),
    kind === "salary_advance" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Giới hạn tạm ứng lương" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Số tiền tối đa mỗi lần (VNĐ)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            inputMode: "numeric",
            value: limits.max_amount ? fmtAmountInput(String(limits.max_amount)) : "",
            onChange: (e) => setLimits({ ...limits, max_amount: parseAmount(e.target.value) || null })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Số lượt tối đa mỗi kỳ lương", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            inputMode: "numeric",
            value: limits.max_per_period ?? "",
            onChange: (e) => setLimits({ ...limits, max_per_period: parseAmount(e.target.value) || null })
          }
        ) })
      ] }),
      [["require_reason", "Bắt buộc nhập lý do"], ["block_open", "Chặn khi còn đề nghị chưa tất toán"], ["allow_self_approve", "Cho phép người tạo tự duyệt (ngoại lệ có kiểm soát)"]].map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "h-4 w-4", checked: !!limits[k], onChange: (e) => setLimits({ ...limits, [k]: e.target.checked }) }),
        label
      ] }, k))
    ] }),
    kind !== "salary_advance" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "checkbox",
          className: "h-4 w-4",
          checked: !!limits.allow_self_approve,
          onChange: (e) => setLimits({ ...limits, allow_self_approve: e.target.checked })
        }
      ),
      "Cho phép người tạo tự duyệt (ngoại lệ có kiểm soát)"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TypeCatalogManager, { kind }),
    kind === "payment" && /* @__PURE__ */ jsxRuntimeExports.jsx(LineCatalogManager, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FinanceZaloSettings, { kind }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: save, children: busy ? "Đang lưu…" : "Lưu cài đặt" })
  ] });
}
const FR_TYPE_LABEL = { advance: "Loại tạm ứng", payment: "Loại thanh toán", salary_advance: "Phân loại tạm ứng lương" };
function TypeCatalogManager({ kind }) {
  const qc = useQueryClient();
  const types = useQuery({ queryKey: ["fr", "types-usage", kind], queryFn: () => frApi.typesWithUsage(kind) });
  const [editing, setEditing] = reactExports.useState(null);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["fr", "types-usage", kind] });
    qc.invalidateQueries({ queryKey: ["fr", "types"] });
  };
  const label = FR_TYPE_LABEL[kind].replace(/^\S+/, (w) => w.toLowerCase());
  const move = async (t, dir) => {
    const list = types.data ?? [];
    const i = list.findIndex((x) => x.id === t.id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    try {
      await frApi.saveType(t.id, kind, t.name, t.description ?? "", t.active, list[j].sort);
      await frApi.saveType(list[j].id, kind, list[j].name, list[j].description ?? "", list[j].active, t.sort);
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const toggle = async (t) => {
    try {
      await frApi.saveType(t.id, kind, t.name, t.description ?? "", !t.active, t.sort);
      refresh();
      toast.success(t.active ? "Đã ngừng sử dụng" : "Đã kích hoạt lại");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const remove = async (t) => {
    if (!window.confirm(`Xóa ${label} "${t.name}"?`)) return;
    try {
      await frApi.deleteType(t.id);
      refresh();
      toast.success("Đã xóa loại");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
      "Danh mục ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Danh mục động — thêm/sửa xong biểu mẫu và báo cáo tự nhận, không cần sửa hệ thống." }),
    (types.data ?? []).map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm rounded-md border p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-32", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t.active ? "" : "line-through text-muted-foreground", children: t.name }),
        t.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: t.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground shrink-0", children: [
        t.usage,
        " đề nghị"
      ] }),
      !t.active && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "shrink-0", children: "Ngừng dùng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", "aria-label": "Lên", disabled: i === 0, onClick: () => move(t, -1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", "aria-label": "Xuống", disabled: i === (types.data ?? []).length - 1, onClick: () => move(t, 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditing(t), children: "Sửa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => toggle(t), children: t.active ? "Ngừng" : "Dùng lại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            disabled: t.usage > 0 || !!t.sys_code,
            title: t.sys_code ? "Loại gắn nghiệp vụ hệ thống — chỉ ngừng sử dụng" : t.usage > 0 ? "Đã có đề nghị sử dụng — chỉ ngừng sử dụng" : "Xóa loại",
            onClick: () => remove(t),
            children: "Xóa"
          }
        )
      ] })
    ] }, t.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setEditing("new"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
      "Thêm loại"
    ] }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TypeEditDialog,
      {
        kind,
        editing: editing === "new" ? null : editing,
        count: (types.data ?? []).length,
        onClose: () => setEditing(null),
        onSaved: () => {
          setEditing(null);
          refresh();
        }
      }
    )
  ] });
}
function TypeEditDialog({ kind, editing, count, onClose, onSaved }) {
  const [name, setName] = reactExports.useState(editing?.name ?? "");
  const [description, setDescription] = reactExports.useState(editing?.description ?? "");
  const [busy, setBusy] = reactExports.useState(false);
  const save = async () => {
    if (!name.trim()) return toast.error("Vui lòng nhập tên loại");
    setBusy(true);
    try {
      await frApi.saveType(editing?.id ?? null, kind, name.trim(), description.trim(), editing?.active ?? true, editing?.sort ?? count + 1);
      toast.success(editing ? "Đã cập nhật loại" : "Đã thêm loại");
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "fr-mobile-dialog max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      editing ? "Sửa" : "Thêm",
      " ",
      FR_TYPE_LABEL[kind].replace(/^\S+/, (w) => w.toLowerCase())
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên loại *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 200, value: name, onChange: (e) => setName(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mô tả (nếu cần)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 500, value: description, onChange: (e) => setDescription(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", disabled: busy, onClick: save, children: busy ? "Đang lưu…" : "Lưu" })
    ] })
  ] }) });
}
function LineCatalogManager() {
  const qc = useQueryClient();
  const catalog = useQuery({ queryKey: ["fr", "line-catalog"], queryFn: frApi.lineCatalog });
  const usage = useQuery({ queryKey: ["fr", "line-catalog-usage"], queryFn: frApi.lineCatalogUsage });
  const [name, setName] = reactExports.useState("");
  const [renaming, setRenaming] = reactExports.useState({});
  const [busy, setBusy] = reactExports.useState(false);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["fr", "line-catalog"] });
    qc.invalidateQueries({ queryKey: ["fr", "line-catalog-usage"] });
  };
  const remove = async (c) => {
    if (!window.confirm(`Xóa khoản chi mẫu "${c.name}"?`)) return;
    try {
      await frApi.deleteLineCatalog(c.id);
      refresh();
      toast.success("Đã xóa khoản chi mẫu");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await frApi.saveLineCatalog(null, name, true, (catalog.data ?? []).length + 1);
      setName("");
      refresh();
      toast.success("Đã thêm khoản chi mẫu");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (c) => {
    try {
      await frApi.saveLineCatalog(c.id, c.name, !c.active, c.sort);
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const rename = async (c) => {
    const n = (renaming[c.id] ?? c.name).trim();
    if (!n || n === c.name) return;
    try {
      await frApi.saveLineCatalog(c.id, n, c.active, c.sort);
      setRenaming((m) => ({ ...m, [c.id]: "" }));
      refresh();
      toast.success("Đã đổi tên");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Danh mục khoản chi thường dùng" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gợi ý chọn nhanh khi nhập bảng kê. Nhân viên vẫn tự nhập tên khác khi cần." }),
    (catalog.data ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          className: `h-9 flex-1 ${c.active ? "" : "line-through text-muted-foreground"}`,
          value: renaming[c.id] ?? c.name,
          onChange: (e) => setRenaming((m) => ({ ...m, [c.id]: e.target.value }))
        }
      ),
      (renaming[c.id] ?? c.name).trim() !== c.name && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => rename(c), children: "Lưu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => toggle(c), children: c.active ? "Ẩn" : "Hiện" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          variant: "outline",
          disabled: (usage.data?.[c.id] ?? 0) > 0,
          title: (usage.data?.[c.id] ?? 0) > 0 ? "Đã dùng trong bảng kê — chỉ có thể ẩn" : "Xóa khoản chi mẫu",
          onClick: () => remove(c),
          children: "Xóa"
        }
      )
    ] }, c.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tên khoản chi mới", value: name, onChange: (e) => setName(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: busy, onClick: add, children: "Thêm" })
    ] })
  ] });
}
export {
  FinanceRequests as F
};
