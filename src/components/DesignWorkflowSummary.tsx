import { CalendarDays, UserRound, Check } from "lucide-react";
import { fmtDate, type DesignOrder } from "@/lib/store";
import { designOverdue } from "@/lib/orders/design";
import { DESIGN_STAGES, designStage, designNextStep } from "@/lib/orders/workboard";

/** Read-only progress guide; mobile focuses on the current step rather than five tiny boxes. */
export function DesignWorkflowSummary({ order }: { order: DesignOrder }) {
  const stage = designStage(order.status);
  const stages = DESIGN_STAGES.filter((s) => s.key !== "cancelled");
  const current = stages.findIndex((s) => s.key === stage);
  const index = Math.max(0, current);
  const cancelled = order.status === "Đã hủy";
  return (
    <section
      className="min-w-0 space-y-3 rounded-xl border bg-muted/25 p-3 sm:p-4"
      aria-label="Tiến trình công việc"
    >
      <div className="space-y-2 sm:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">
            {cancelled ? "Job đã hủy" : `Bước ${index + 1}/${stages.length}: ${stages[index]?.label ?? "Nhận việc"}`}
          </p>
          <span className="rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground">
            {order.status}
          </span>
        </div>
        <div className="flex gap-1.5" role="img" aria-label={cancelled ? "Job đã hủy" : `Tiến độ: bước ${index + 1} trên ${stages.length}`}>
          {stages.map((s, i) => (
            <span
              key={s.key}
              className={`h-2 min-w-0 flex-1 rounded-full ${!cancelled && i <= index ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
      <div className="hidden overflow-x-auto pb-1 sm:block">
        <ol className="grid min-w-0 grid-cols-5 gap-2">
          {stages.map((s, i) => (
            <li
              key={s.key}
              aria-current={s.key === stage ? "step" : undefined}
              className={`flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-xs ${s.key === stage ? "bg-primary font-semibold text-primary-foreground" : i < index ? "text-primary" : "text-muted-foreground"}`}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${s.key === stage ? "border-primary-foreground/50" : "border-current/25"}`}
              >
                {i < index || order.status === "Hoàn thành" ? <Check className="size-3" /> : i + 1}
              </span>
              {s.label}
            </li>
          ))}
        </ol>
      </div>
      <div className="grid min-w-0 gap-2 text-sm leading-6 sm:grid-cols-3 sm:text-xs">
        <p className="flex min-w-0 items-start gap-2">
          <UserRound className="mt-1 size-4 shrink-0 text-muted-foreground sm:size-3.5" />
          <span className="min-w-0 break-words">
            Thực hiện: <strong className="font-medium">{order.assignee || "Cần giao người"}</strong>
          </span>
        </p>
        <p className="min-w-0 break-words">
          Người duyệt: <strong className="font-medium">{order.reviewer || order.requester || "Chưa chọn"}</strong>
        </p>
        <p className={`flex min-w-0 items-start gap-2 ${designOverdue(order) ? "text-destructive" : ""}`}>
          <CalendarDays className="mt-1 size-4 shrink-0 sm:size-3.5" />
          <span>{order.deadline ? `Hạn: ${fmtDate(order.deadline)}` : "Chưa đặt deadline"}{designOverdue(order) && " · Quá hạn"}</span>
        </p>
      </div>
      <p className="border-t pt-3 text-sm leading-6">
        <span className="mr-1 font-semibold">
          {order.status === "Hoàn thành" || cancelled ? "Kết quả:" : "Tiếp theo:"}
        </span>
        {designNextStep(order)}
      </p>
    </section>
  );
}
