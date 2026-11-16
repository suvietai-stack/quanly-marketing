import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  event: {
    id: "event-1", request_id: "request-1", event: "new", attempts: 0,
    status: "pending", started_at: null as string | null, error: null as string | null,
    summary: null as string | null, sent_at: null as string | null,
    created_at: "2026-11-16T00:00:00Z",
  },
  calls: 0,
}));

vi.mock("@/lib/finance/gmf.server", () => ({
  postGroup: async () => {
    state.calls += 1;
    await Promise.resolve(); // Allow overlapping dispatchers to compete for the same event.
    return { ok: true, code: 0, message: "" };
  },
}));
vi.mock("@/lib/zalo.server", () => ({ baseUrl: async () => "https://base.suviet.vn" }));

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from(table: string) {
      let patch: Record<string, unknown> | null = null;
      const predicates: Array<(row: any) => boolean> = [];
      const q: any = {
        select: () => q,
        update: (p: Record<string, unknown>) => { patch = p; return q; },
        eq: (key: string, value: unknown) => {
          predicates.push((row) => row[key] === value); return q;
        },
        lt: (key: string, value: unknown) => {
          predicates.push((row) => row[key] != null && row[key] < value); return q;
        },
        is: (key: string, value: unknown) => {
          predicates.push((row) => row[key] === value); return q;
        },
        in: (key: string, values: unknown[]) => {
          predicates.push((row) => values.includes(row[key])); return q;
        },
        order: () => q,
        limit: () => q,
        maybeSingle: async () => {
          const result = execute();
          return { data: result.data[0] ?? null };
        },
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
          Promise.resolve().then(execute).then(resolve, reject),
      };
      function execute() {
        const request = {
          id: "request-1", status: "pending", owner_id: "owner-1",
          approver_id: "approver-1", decided_by: null, type: "leave",
          payload: { start_date: "2026-11-16", end_date: "2026-11-16" },
          calc: { days: 1 }, is_late: false, submitted_at: "2026-11-16T00:00:00Z",
        };
        const tables: Record<string, any[]> = {
          leave_zalo_group_config: [{
            id: 1, enabled: true, group_id: "group-test",
            on_new: true, on_approved: true, on_reassign: true, on_rejected: true,
          }],
          leave_zalo_group_events: [state.event],
          leave_requests: [request],
          profiles: [
            { id: "owner-1", full_name: "Nhân viên thử" },
            { id: "approver-1", full_name: "Người duyệt thử" },
          ],
          biz_department_members: [],
        };
        const rows = (tables[table] ?? []).filter((r) => predicates.every((fn) => fn(r)));
        if (patch) rows.forEach((r) => Object.assign(r, patch));
        return { data: rows.map((r) => ({ ...r })) };
      }
      return q;
    },
  },
}));

import { processLeaveGroup } from "./zaloGroup.server";

describe("leave group delivery claim", () => {
  beforeEach(() => {
    Object.assign(state.event, {
      attempts: 0, status: "pending", started_at: null,
      error: null, summary: null, sent_at: null,
    });
    state.calls = 0;
  });

  it("sends once when three dispatchers race for the same event", async () => {
    await Promise.all([processLeaveGroup(), processLeaveGroup(), processLeaveGroup()]);
    expect(state.calls).toBe(1);
    expect(state.event.attempts).toBe(1);
    expect(state.event.status).toBe("sent");
  });

  it("does not automatically resend an unknown delivery", async () => {
    state.event.status = "unknown";
    await processLeaveGroup();
    expect(state.calls).toBe(0);
    expect(state.event.status).toBe("unknown");
  });

  it("quarantines a stale sending claim without sending again", async () => {
    state.event.status = "sending";
    state.event.started_at = "2026-01-01T00:00:00Z";
    await processLeaveGroup();
    expect(state.calls).toBe(0);
    expect(state.event.status).toBe("unknown");
  });
});
