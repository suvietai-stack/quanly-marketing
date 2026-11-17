import { CalendarDays, UserRound, Check, ChevronDown } from "lucide-react";
import { fmtDate, type DesignOrder } from "@/lib/store";
import { designOverdue } from "@/lib/orders/design";
import { DESIGN_STAGES, designStage, designNextStep } from "@/lib/orders/workboard";

/** Compact, read-only progress strip. Details remain available on demand. */
export function DesignWorkflowSummary({ order }: { order: DesignOrder }) {
  const stage = designStage(order.status);
  const stages = DESIGN_STAGES.filter(s => s.key !== "cancelled");
  const current = stages.findIndex(s => s.key === stage);
  const index = Math.max(0, current);
  const cancelled = order.status === "Đã hủy";
  const overdue = designOverdue(order);
  const currentLabel = cancelled ? "Đã hủy" : stages[index]?.label ?? "Nhận việc";

  return (
    <section className="min-w-0 rounded-lg border border-border/75 px-3 py-2.5 sm:px-4 sm:py-3"
      aria-label="Tiến trình công việc">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-muted-foreground">Tiến độ</span>
          <strong className="font-semibold">
            {cancelled ? "Job đã hủy" : `Bước ${index + 1}/${stages.length} · ${currentLabel}`}
          </strong>
        </div>
        <details className="group text-xs text-muted-foreground">
          <summary className="flex cursor-pointer select-none items-center gap-1 rounded px-1 py-1 hover:text-foreground">
            Xem các bước <ChevronDown className="size-3.5 transition-transform group-open:rotate-180"/>
          </summary>
          <ol className="mt-1 grid gap-1.5 rounded-md border bg-muted/20 p-2 sm:grid-cols-5">
            {stages.map((s, i) => (
              <li key={s.key} aria-current={s.key === stage ? "step" : undefined}
                className={`flex min-w-0 items-center gap-1.5 rounded px-1 py-1 ${!cancelled && s.key === stage ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"}`}>
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-current/30 text-[10px]">
                  {!cancelled && (i < index || order.status === "Hoàn thành") ? <Check className="size-3"/> : i + 1}
                </span>
                <span className="break-words">{s.label}</span>
              </li>
            ))}
          </ol>
        </details>
      </div>
      <div className="mt-1.5 flex gap-1" role="img"
        aria-label={cancelled ? "Job đã hủy" : `Tiến độ: bước ${index + 1} trong ${stages.length}`}>
        {stages.map((s, i) => (
          <span key={s.key}
            className={`h-1.5 min-w-0 flex-1 rounded-full ${!cancelled && i <= index ? "bg-primary" : "bg-border"}`}/>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs leading-5">
        <span className="flex min-w-0 items-center gap-1.5">
          <UserRound className="size-3.5 shrink-0 text-muted-foreground"/>
          <span className="text-muted-foreground">Thực hiện:</span>
          <strong className="min-w-0 break-words font-medium">{order.assignee || "Cần giao người"}</strong>
        </span>
        <span className="min-w-0">
          <span className="text-muted-foreground">Duyệt:</span>{" "}
          <strong className="break-words font-medium">{order.reviewer || order.requester || "Chưa chọn"}</strong>
        </span>
        <span className={`flex items-center gap-1.5 ${overdue ? "text-destructive" : ""}`}>
          <CalendarDays className="size-3.5 shrink-0"/>
          {order.deadline ? fmtDate(order.deadline) : "Chưa đặt hạn"}
          {overdue && <strong className="font-medium">· Quá hạn</strong>}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
        <span className="font-medium text-foreground">
          {order.status === "Hoàn thành" || cancelled ? "Kết quả:" : "Tiếp theo:"}
        </span>{" "}{designNextStep(order)}
      </p>
    </section>
  );
}
