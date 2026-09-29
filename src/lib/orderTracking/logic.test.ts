import { describe, it, expect } from "vitest";
import { packBlocker, sendable, isOverdue, journey, taskDue, type OtTask } from "./logic";

const t = (p: Partial<OtTask>): OtTask => ({ id: "x", order_id: "o", kind: "blank", position: 0, supplier_id: null, assignee_id: null, qty: 100, proc_type: null, planned_date: null, planned_arrival: null, ordered_at: null, mail_due: null, mail_sent_at: null, send_planned: null, sent_at: null, sent_qty: 0, shipped_at: null, status: "todo", done_at: null, note: null, ...p });

describe("order tracking rules", () => {
  it("packing needs full blanks and box", () => {
    const tasks = [t({ id: "b" }), t({ id: "h", kind: "box" })];
    expect(packBlocker(tasks, [{ id: "1", task_id: "b", qty: 100, received_at: "", actor_id: "" }])).toMatch(/Hộp/);
    expect(packBlocker(tasks, [{ id: "1", task_id: "b", qty: 60, received_at: "", actor_id: "" }])).toMatch(/Phôi/);
    expect(packBlocker([t({ id: "b" }), t({ id: "h", kind: "box", status: "skipped" })], [{ id: "1", task_id: "b", qty: 100, received_at: "", actor_id: "" }])).toBeNull();
  });
  it("partial send limited by received blanks", () => {
    const tasks = [t({ id: "b" })];
    const p = t({ id: "p", kind: "proc", qty: 100, sent_qty: 20 });
    expect(sendable(p, tasks, [{ id: "1", task_id: "b", qty: 50, received_at: "", actor_id: "" }])).toBe(30);
  });
  it("overdue is a warning, not a status", () => {
    expect(isOverdue("2026-09-01", false, "2026-09-02")).toBe(true);
    expect(isOverdue("2026-09-01", true, "2026-09-02")).toBe(false);
    expect(isOverdue("2026-09-02", false, "2026-09-02")).toBe(false);
  });
  it("due follows the current step", () => {
    expect(taskDue(t({ planned_date: "a", planned_arrival: "b" }))).toBe("a");
    expect(taskDue(t({ planned_date: "a", planned_arrival: "b", ordered_at: "x" }))).toBe("b");
    expect(taskDue(t({ kind: "proc", mail_due: "m" }))).toBe("m");
  });
  it("journey skips optional stages", () => {
    const j = journey({ status: "in_progress", has_box: false, has_processing: false, planned: true }, [t({ status: "done" })]);
    expect(j.steps.map((s) => s.key)).toEqual(["intake", "blank", "packing", "delivery"]);
    expect(j.current).toBe("packing");
  });
});

import { reminders as _rem, monthGrid as _mg } from "./logic";
describe("GĐ2", () => {
  const base = { order_id: "o", position: 0, supplier_id: null, assignee_id: null, qty: 10, proc_type: null, planned_arrival: null, ordered_at: null, mail_due: null, mail_sent_at: null, send_planned: null, sent_at: null, sent_qty: 0, shipped_at: null, done_at: null, note: null } as any;
  it("nhắc việc: quá hạn > hôm nay > liên hệ lại, bỏ việc xong", () => {
    const r = _rem([
      { ...base, id: "a", kind: "packing", status: "todo", planned_date: "2026-09-29" },
      { ...base, id: "b", kind: "packing", status: "doing", planned_date: "2026-09-20" },
      { ...base, id: "c", kind: "packing", status: "waiting", planned_date: "2026-10-05", contact_date: "2026-09-28" },
      { ...base, id: "d", kind: "packing", status: "done", planned_date: "2026-09-01" },
    ], "2026-09-29");
    expect(r.map((x) => `${x.task.id}:${x.type}`)).toEqual(["b:overdue", "a:today", "c:contact"]);
  });
  it("lưới tháng bắt đầu Thứ Hai", () => {
    const g = _mg(2026, 8); // Tháng 9/2026, 1/9 là Thứ Ba
    expect(g[0]).toBe("2026-08-31"); expect(g.length).toBe(42);
  });
});
