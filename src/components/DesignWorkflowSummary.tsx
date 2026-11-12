import { CalendarDays, UserRound, Check } from "lucide-react";
import { fmtDate, type DesignOrder } from "@/lib/store";
import { designOverdue } from "@/lib/orders/design";
import {
  DESIGN_STAGES,
  designStage,
  designNextStep,
} from "@/lib/orders/workboard";

/** A read-only guide to the existing workflow, never a status-changing control. */
export function DesignWorkflowSummary({ order }: { order: DesignOrder }) {
  const stage = designStage(order.status);
  const stages = DESIGN_STAGES.filter((s) => s.key !== "cancelled");
  const index = stages.findIndex((s) => s.key === stage);
  return (
    <section
      className="min-w-0 space-y-3 rounded-xl border bg-muted/25 p-3 sm:p-4"
      aria-label="Tiến trình công việc"
    >
      <div className="overflow-x-auto pb-1">
        <ol className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-5">
          {stages.map((s, i) => (
            <li
              key={s.key}
              aria-current={s.key === stage ? "step" : undefined}
              className={`flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-xs ${s.key === stage ? "bg-primary text-primary-foreground font-semibold" : i < index ? "text-primary" : "text-muted-foreground"}`}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${s.key === stage ? "border-primary-foreground/50" : "border-current/25"}`}
              >
                {i < index || order.status === "Hoàn thành" ? (
                  <Check className="size-3" />
                ) : (
                  i + 1
                )}
              </span>
              {s.label}
            </li>
          ))}
        </ol>
      </div>
      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <p className="flex min-w-0 items-center gap-2">
          <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            Thực hiện:{" "}
            <strong className="font-medium">
              {order.assignee || "Chưa phân công"}
            </strong>
          </span>
        </p>
        <p className="truncate">
          Người duyệt:{" "}
          <strong className="font-medium">
            {order.reviewer || order.requester || "Chưa chọn"}
          </strong>
        </p>
        <p
          className={`flex min-w-0 items-center gap-2 ${designOverdue(order) ? "text-destructive" : ""}`}
        >
          <CalendarDays className="size-3.5 shrink-0" />
          {order.deadline
            ? `Hạn: ${fmtDate(order.deadline)}`
            : "Chưa đặt deadline"}
          {designOverdue(order) && " · Quá hạn"}
        </p>
      </div>
      <p className="border-t pt-3 text-sm leading-6">
        <span className="mr-1 font-medium">
          {order.status === "Hoàn thành" || order.status === "Đã hủy"
            ? "Kết quả:"
            : "Bước tiếp theo:"}
        </span>
        {designNextStep(order)}
      </p>
    </section>
  );
}
