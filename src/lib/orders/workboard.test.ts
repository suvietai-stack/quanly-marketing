import { describe, expect, it } from "vitest";
import type { DesignOrder } from "@/lib/store";
import {
  DESIGN_STAGES,
  designQueueMatches,
  designStage,
  sortDesignOrders,
} from "./workboard";
const job = (id: string, patch: Partial<DesignOrder> = {}): DesignOrder => ({
  id,
  title: id,
  brandId: "",
  type: "Khác",
  source: "Task lẻ",
  status: "Đang thực hiện",
  recordCreatedAt: "2026-11-01T08:00:00+07:00",
  recordUpdatedAt: "2026-11-01T08:00:00+07:00",
  ...patch,
});
const actor = { id: "me", fullName: "Người dùng", username: "user" };
const now = Date.parse("2026-11-12T12:00:00+07:00");
describe("design workboard", () => {
  it("keeps all nine existing statuses in exactly one stage", () => {
    const statuses = DESIGN_STAGES.flatMap((s) => [...s.statuses]);
    expect(new Set(statuses).size).toBe(9);
    expect(statuses.length).toBe(9);
    expect(designStage("Cần sửa")).toBe("doing");
    expect(designStage("Đã bàn giao")).toBe("delivery");
  });
  it("prefers stable assignee identity over a duplicate display name", () => {
    expect(
      designQueueMatches(
        job("a", { assigneeId: "other", assignee: actor.fullName }),
        "assigned",
        actor,
      ),
    ).toBe(false);
    expect(
      designQueueMatches(job("a", { assigneeId: "me" }), "assigned", actor),
    ).toBe(true);
    expect(
      designQueueMatches(job("a", { assignee: "user" }), "assigned", actor),
    ).toBe(true);
  });
  it("only queues pending reviews for the designated reviewer or requester fallback", () => {
    expect(
      designQueueMatches(
        job("a", { status: "Chờ duyệt", requester: "user" }),
        "review",
        actor,
      ),
    ).toBe(true);
    expect(
      designQueueMatches(
        job("a", { status: "Chờ duyệt", requester: "user", reviewer: "other" }),
        "review",
        actor,
      ),
    ).toBe(false);
    expect(
      designQueueMatches(
        job("a", { status: "Đã duyệt", reviewer: "user" }),
        "review",
        actor,
      ),
    ).toBe(false);
  });
  it("does not put finished or cancelled jobs in the unassigned queue", () => {
    expect(
      designQueueMatches(
        job("a", { status: "Hoàn thành" }),
        "unassigned",
        actor,
      ),
    ).toBe(false);
    expect(designQueueMatches(job("a"), "unassigned", actor)).toBe(true);
  });
  it("sorts overdue first and preserves the input order array", () => {
    const rows = [
      job("future", { deadline: "2026-11-20", priority: "Gấp" }),
      job("late", { deadline: "2026-11-11" }),
      job("done", { status: "Hoàn thành", deadline: "2026-11-01" }),
    ];
    expect(sortDesignOrders(rows, "attention", now).map((o) => o.id)).toEqual([
      "late",
      "future",
      "done",
    ]);
    expect(rows[0].id).toBe("future");
  });
  it("handles undated jobs deterministically", () => {
    expect(
      sortDesignOrders([job("b"), job("a")], "deadline", now).map((o) => o.id),
    ).toEqual(["a", "b"]);
  });
});
