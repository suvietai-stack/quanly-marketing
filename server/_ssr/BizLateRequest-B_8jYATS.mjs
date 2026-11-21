import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, B as Button, F as useAuth } from "./router-CkmTURa-.mjs";
import { a as useBizLateRequestCreate, c as bizMilestonesQuery, b as bizLateRequestsQuery } from "./queries-D_iIARlF.mjs";
import { L as LATE_STATUS_LABELS, p as phaseFromIso } from "./deadline-D2Kxczjd.mjs";
import { p as periodLabel } from "./documents-RNnMLtSC.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { ad as Send, aO as CalendarClock } from "../_libs/lucide-react.mjs";
const dateText = (v) => v ? new Date(v).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "Không áp dụng";
function LateRequestPanel({ kind, periodKind, year, period, submitted }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const milestones = useQuery(bizMilestonesQuery(`${kind}_${periodKind}`, year, period));
  const late = useQuery(bizLateRequestsQuery(kind, periodKind, year, period));
  const [asking, setAsking] = reactExports.useState(false);
  if (submitted || !milestones.data || !late.data) return null;
  const phase = phaseFromIso(milestones.data, late.data.server_now);
  const mine = late.data.requests.find((r) => r.user_id === uid);
  if (phase === "none" || phase === "open") return null;
  const label = kind === "plan" ? "Kế hoạch" : "Báo cáo";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2 text-sm bg-muted/30", children: [
    phase === "not_open" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "Chưa mở nộp · Mở từ ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: dateText(milestones.data.open) }),
      " (giờ Việt Nam)."
    ] }),
    phase === "closed" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Kỳ nộp đã đóng. Liên hệ quản trị nếu cần xử lý đặc biệt." }),
    phase === "overdue" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      !mine && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-destructive", children: [
          "Đã quá hạn nộp trực tiếp (",
          dateText(milestones.data.due),
          ")."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setAsking(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4 mr-2" }),
          "Xin nộp bù"
        ] })
      ] }),
      mine?.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-warning", children: [
        "Đang chờ duyệt yêu cầu nộp bù · Gửi ",
        dateText(mine.created_at),
        "."
      ] }),
      mine?.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-success", children: [
        "Yêu cầu nộp bù đã được duyệt",
        mine.decider_name ? ` bởi ${mine.decider_name}` : "",
        " · Hãy nộp trước ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: dateText(milestones.data.late_close) }),
        ". Hồ sơ sẽ được ghi nhận Nộp muộn."
      ] }),
      mine?.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-destructive", children: [
          "Yêu cầu nộp bù bị từ chối",
          mine.decision_comment ? `: ${mine.decision_comment}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setAsking(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4 mr-2" }),
          "Gửi lại yêu cầu"
        ] })
      ] })
    ] }),
    asking && /* @__PURE__ */ jsxRuntimeExports.jsx(LateRequestDialog, { kind, periodKind, year, period, due: milestones.data.due, label, onClose: () => setAsking(false) })
  ] });
}
function LateRequestDialog({ kind, periodKind, year, period, due, label, onClose }) {
  const [reason, setReason] = reactExports.useState("");
  const create = useBizLateRequestCreate();
  const send = async () => {
    try {
      await create.mutateAsync({ _kind: kind, _period_kind: periodKind, _year: year, _period: period, _reason: reason });
      toast.success("Đã gửi yêu cầu nộp bù. Vui lòng chờ lãnh đạo phê duyệt.");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Xin nộp bù · ",
      label,
      " ",
      periodLabel(periodKind, year, period)
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Deadline đã qua: ",
      dateText(due),
      ". Yêu cầu được duyệt chỉ mở quyền nộp cho đúng kỳ này và hồ sơ sẽ được ghi nhận Nộp muộn."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do xin nộp bù (bắt buộc)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Nêu rõ lý do quá hạn…" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !reason.trim() || create.isPending, onClick: send, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2" }),
      "Gửi yêu cầu"
    ] })
  ] }) });
}
function LateStatusBadge({ status }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: status === "approved" ? "text-success border-success/40" : status === "pending" ? "text-warning border-warning/40" : status === "rejected" || status === "expired" ? "text-destructive border-destructive/40" : "", children: LATE_STATUS_LABELS[status] });
}
export {
  LateStatusBadge as L,
  LateRequestDialog as a,
  LateRequestPanel as b
};
