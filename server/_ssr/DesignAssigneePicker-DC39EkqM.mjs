import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { u as useCurrentUser, L as Label, B as Button } from "./router-CkmTURa-.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { k as selectedDesignAssigneeId } from "./design-BrHT-rw4.mjs";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const FILE_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "webp", "gif", "heic", "ai", "psd", "eps", "svg", "tif", "tiff", "zip", "txt", "csv"];
function fileError(file) {
  return file.size > MAX_FILE_SIZE ? "Tệp vượt quá 20 MB." : !FILE_EXTENSIONS.includes(file.name.split(".").at(-1)?.toLowerCase() || "") ? "Định dạng tệp chưa được hỗ trợ." : file.size === 0 ? "Tệp không có nội dung." : "";
}
function validDocumentUrl(value) {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) && !!u.hostname && !u.username && !u.password;
  } catch {
    return false;
  }
}
function useDesignCatalogs() {
  const { user } = useCurrentUser();
  return useQuery({ queryKey: ["design-catalogs", user?.id], enabled: !!user, queryFn: async () => {
    const r = await supabase.from("design_catalogs").select("*").order("position").order("name");
    if (r.error) throw new Error(r.error.message);
    return r.data;
  } });
}
const workLabel = (o, c) => c.find((x) => x.id === o.workCategoryId)?.name || o.workCategoryName || o.type;
function normalizeProducts(ids, names, catalogs) {
  return catalogs.some((c) => c.is_other && ids.includes(c.id)) ? names.map((n) => n.trim()).filter(Boolean) : [];
}
function productBreakdown(orders, catalogs) {
  const rows = [...new Map(orders.map((o) => [o.id, o])).values()];
  const ids = [...new Set(rows.flatMap((o) => o.productIds || []))];
  return ids.map((id) => ({ id, name: catalogs.find((c) => c.id === id)?.name || rows.find((o) => o.productNames?.[id])?.productNames?.[id] || "Danh mục cũ", rows: rows.filter((o) => o.productIds?.includes(id)), value: rows.filter((o) => o.productIds?.includes(id)).length }));
}
function useDesignAssignees(flow) {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: ["design-assignable-staff", user?.id, flow],
    enabled: !!flow && !!user?.id,
    staleTime: 12e4,
    gcTime: 6e5,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async ({ signal }) => {
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal.addEventListener("abort", abort, { once: true });
      const timeout = setTimeout(() => controller.abort(), 12e3);
      try {
        const { data, error } = await supabase.rpc("design_assignable_staff", { _flow: flow }).abortSignal(controller.signal);
        if (error) throw new Error(error.message);
        return data ?? [];
      } catch (error) {
        if (controller.signal.aborted && !signal.aborted)
          throw new Error("Dịch vụ danh sách Thiết kế không phản hồi trong 12 giây. Kiểm tra kết nối rồi thử lại.");
        throw error;
      } finally {
        clearTimeout(timeout);
        signal.removeEventListener("abort", abort);
      }
    }
  });
}
function DesignAssigneePicker({ flow, valueId, value, onChange, required = false, disabled = false, label = "Người thực hiện" }) {
  const q = useDesignAssignees(flow);
  const { user } = useCurrentUser();
  const entries = q.data ?? [];
  const selectedId = selectedDesignAssigneeId(entries, valueId, value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
      label,
      required ? " *" : ""
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Select,
      {
        value: selectedId,
        disabled: disabled || !flow || q.isPending || q.isError,
        onValueChange: (id) => {
          if (id === "_") {
            onChange(void 0, void 0);
            return;
          }
          const person = entries.find((x) => x.user_id === id);
          if (person) onChange(person.name, person.user_id);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn nhân viên Thiết kế" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "— Chọn người thực hiện —" }),
            entries.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.user_id, children: p.name }, p.user_id)),
            valueId && !entries.some((p) => p.user_id === valueId) && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: valueId, disabled: true, children: [
              value || "Người cũ",
              " (không còn đủ điều kiện)"
            ] })
          ] })
        ]
      }
    ),
    flow && !!user?.id && q.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-xs text-muted-foreground", children: "Đang tải nhân viên phù hợp…" }),
    flow && !user?.id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-xs text-destructive", children: "Chưa có phiên đăng nhập hợp lệ. Tải lại trang hoặc đăng nhập lại để chọn nhân viên." }),
    !flow && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chọn hệ Thiết kế trước khi phân công." }),
    q.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-2 rounded-md border border-destructive/30 p-3 text-xs text-destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Không tải được danh sách nhân viên: ",
        q.error instanceof Error ? q.error.message : "Lỗi không xác định"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "min-h-10", onClick: () => void q.refetch(), children: "Tải lại nhân viên" })
    ] }),
    flow && q.isSuccess && entries.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Chưa có nhân viên Thiết kế phù hợp. Cần cập nhật chuyên môn/quyền nhận việc trước khi tạo Job." })
  ] });
}
export {
  DesignAssigneePicker as D,
  FILE_EXTENSIONS as F,
  fileError as f,
  normalizeProducts as n,
  productBreakdown as p,
  useDesignCatalogs as u,
  validDocumentUrl as v,
  workLabel as w
};
