import { beforeEach, describe, expect, it, vi } from "vitest";
const fake = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: fake }));
import { processEvent } from "./fb.server";
const event = { id: "event", lease_token: "lease", page_id: "222", form_id: "333", leadgen_id: "111", received_at: "2026-10-23T01:00:00Z", lead_created_at: "2026-10-23T01:00:00Z", backfill: false };
function tableResult(data: unknown, error: unknown = null) {
  const query: any = { select: () => query, eq: () => query, maybeSingle: async () => ({ data, error }) };
  return query;
}
describe("durable Facebook event worker", () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it("does not fetch or create for an already claimed job", async () => {
    fake.rpc.mockResolvedValue({ data: null, error: null });
    expect(await processEvent("event")).toBe("busy");
    expect(fake.from).not.toHaveBeenCalled();
  });
  it("records unexpected database failures for retry instead of leaving pending", async () => {
    fake.rpc.mockResolvedValueOnce({ data: event, error: null }).mockResolvedValue({ data: true, error: null });
    fake.from.mockReturnValue(tableResult(null, { code: "unexpected" }));
    expect(await processEvent("event")).toBe("failed");
    expect(fake.rpc).toHaveBeenCalledWith("fbl_finish_event", { p_id: "event", p_lease: "lease", p_patch: { status: "failed", error: "Xử lý bị gián đoạn — hệ thống sẽ thử lại" } });
  });
  it("never imports a disabled Form even for explicit backfill events", async () => {
    fake.rpc.mockResolvedValueOnce({ data: { ...event, backfill: true }, error: null }).mockResolvedValue({ data: true, error: null });
    fake.from.mockImplementation((table: string) => tableResult(table === "fbl_pages" ? { status: "connected", source: "Facebook" } : { enabled: false }));
    expect(await processEvent("event")).toBe("skipped");
    expect(fake.rpc).toHaveBeenCalledWith("fbl_finish_event", { p_id: "event", p_lease: "lease", p_patch: { status: "skipped", error: "Form đang tắt đồng bộ" } });
    expect(fake.rpc.mock.calls.some(([name]) => name === "fbl_complete_event")).toBe(false);
  });
});