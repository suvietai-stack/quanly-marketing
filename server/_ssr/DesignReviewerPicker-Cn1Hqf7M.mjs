import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { F as useAuth, u as useCurrentUser, L as Label } from "./router-CkmTURa-.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
function reviewerAccountId(accounts, storedId, storedName) {
  if (storedId) return storedId;
  if (!storedName) return void 0;
  const matches = accounts.filter((a) => a.name === storedName || a.username === storedName);
  return matches.length === 1 ? matches[0].id : void 0;
}
function reviewerIsAssignee(reviewerId, assigneeId, reviewerName, assigneeName) {
  if (reviewerId && assigneeId) return reviewerId === assigneeId;
  return !!reviewerName && !!assigneeName && reviewerName === assigneeName;
}
function DesignReviewerPicker({ valueId, valueName, onChange, assigneeId, disabled, required = false }) {
  const users = useAuth((s) => s.users);
  const { user } = useCurrentUser();
  const accounts = reactExports.useMemo(() => {
    const items = users.filter((p) => p.status === "Đang hoạt động").map((p) => ({ id: p.id, name: p.fullName || p.username, username: p.username }));
    if (user?.id && !items.some((p) => p.id === user.id)) {
      items.push({ id: user.id, name: user.fullName || user.username || "Tài khoản của tôi", username: user.username || "" });
    }
    return items.sort((a, b) => a.name.localeCompare(b.name, "vi") || a.id.localeCompare(b.id));
  }, [users, user?.id, user?.fullName, user?.username]);
  const selectedId = reviewerAccountId(accounts, valueId, valueName);
  const unresolved = !!(valueId || valueName) && !accounts.some((p) => p.id === selectedId);
  const value = unresolved ? "__legacy__" : selectedId || "__empty__";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
      "Người duyệt ",
      required && "*"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value, disabled, onValueChange: (id) => {
      const account = accounts.find((p) => p.id === id);
      if (account && account.id !== assigneeId) onChange(account.name, account.id);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "min-h-11 w-full min-w-0 text-left", "aria-label": "Chọn người duyệt từ danh sách tài khoản", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn tài khoản người duyệt" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__empty__", disabled: true, children: "— Chọn tài khoản người duyệt —" }),
        unresolved && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "__legacy__", disabled: true, children: [
          "Người duyệt cũ: ",
          valueName || "Tài khoản không còn hoạt động",
          " — cần chọn lại"
        ] }),
        accounts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, disabled: p.id === assigneeId, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block truncate", children: [
          p.name,
          p.username && p.username !== p.name ? ` · ${p.username}` : "",
          p.id === assigneeId ? " (đang thực hiện)" : ""
        ] }) }, p.id))
      ] })
    ] }),
    unresolved && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-xs text-amber-700 dark:text-amber-300", children: "Người duyệt của Job cũ chưa khớp duy nhất với tài khoản đang hoạt động. Chọn lại từ danh sách để cập nhật." }),
    selectedId && selectedId === assigneeId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-xs text-destructive", children: "Người duyệt phải khác người thực hiện." }),
    !accounts.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-xs text-muted-foreground", children: "Đang tải tài khoản nhân viên…" })
  ] });
}
export {
  DesignReviewerPicker as D,
  reviewerIsAssignee as r
};
