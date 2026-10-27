import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshDue, retryDelay, rotationResponse, tokenUsable } from "./zaloToken";
import { accessToken } from "./zaloToken.server";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const now = Date.parse("2026-10-27T07:00:00Z");
const config = () => ({ status: "connected", access_token: "old-access-token", refresh_token: "old-refresh-token", token_expires_at: new Date(now + 60000).toISOString(), token_version: 2, refresh_failures: 0 });
function harness() {
  const c: any = config();
  const patches: any[] = [];
  const builder: any = { update: (p: any) => { patches.push(p); return builder; }, eq: () => builder, is: () => builder, then: (resolve: any) => resolve({ error: null }) };
  const rpc = vi.fn(async (name: string, p: any) => {
    if (name === "zalo_refresh_claim") { if (c.refresh_lease) return { data: false }; c.refresh_lease = p.p_lease; c.refresh_started_at = new Date(now).toISOString(); return { data: true }; }
    if (p.p_version !== c.token_version || p.p_lease !== c.refresh_lease) return { data: false };
    Object.assign(c, { access_token: p.p_access, refresh_token: p.p_refresh, token_expires_at: p.p_expires, refresh_lease: null });
    return { data: true };
  });
  return { c, patches, rpc, deps: { config: async () => ({ ...c }), db: async () => ({ rpc, from: () => builder }), env: async () => ({ appId: "test-app", appSecret: "test-secret" }) } };
}
describe("Zalo single-use rotation", () => {
  it("refreshes two hours before expiry, including already expired tokens", () => {
    expect(refreshDue(config(), now)).toBe(true);
    expect(refreshDue({ ...config(), token_expires_at: new Date(now - 1).toISOString() }, now)).toBe(true);
    expect(refreshDue({ ...config(), token_expires_at: new Date(now + 3 * 3600000).toISOString() }, now)).toBe(false);
  });
  it("uses actual expires_in and rejects incomplete pairs", () => {
    expect(rotationResponse({ access_token: "new-access-token", refresh_token: "new-refresh-token", expires_in: 90000 }, now)?.token_expires_at).toBe("2026-10-28T08:00:00.000Z");
    expect(rotationResponse({ access_token: "new-access-token", expires_in: 90000 }, now)).toBeNull();
  });
  it("backs off and caps retries", () => { expect([1, 2, 3, 9].map(retryDelay)).toEqual([60000, 120000, 240000, 3600000]); });
  it("commits both tokens before returning to sender", async () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const h = harness();
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ access_token: "new-access-token", refresh_token: "new-refresh-token", expires_in: 90000 })));
    expect(await accessToken(h.deps)).toBe("new-access-token");
    expect(h.c.refresh_token).toBe("new-refresh-token");
    expect(h.rpc.mock.calls[1][0]).toBe("zalo_refresh_finish");
    vi.restoreAllMocks();
  });
  it("never destroys or retries a refresh token on timeout", async () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const h = harness(); const fetcher = vi.fn(async () => { throw new Error("timeout"); }); vi.stubGlobal("fetch", fetcher);
    expect(await accessToken(h.deps)).toBeNull();
    expect(h.c.refresh_token).toBe("old-refresh-token");
    expect(h.patches[0].refresh_blocked).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });
  it("blocks expired access and ambiguous or revoked refreshes", () => {
    expect(tokenUsable({ ...config(), refresh_blocked: true }, now)).toBe(false);
    expect(tokenUsable({ ...config(), token_expires_at: new Date(now - 1).toISOString() }, now)).toBe(false);
  });
  it("fences a late response after another OAuth connection", async () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const h = harness();
    vi.stubGlobal("fetch", vi.fn(async () => { h.c.token_version++; h.c.access_token = "newer-oauth-token"; h.c.refresh_lease = null; return Response.json({ access_token: "stale-access-token", refresh_token: "stale-refresh-token", expires_in: 90000 }); }));
    expect(await accessToken(h.deps)).toBe("newer-oauth-token");
    expect(h.c.access_token).not.toBe("stale-access-token"); vi.restoreAllMocks();
  });
  it("two simultaneous callers only invoke one token exchange", async () => {
    vi.useFakeTimers(); vi.setSystemTime(now); const h = harness(); const fetcher = vi.fn(async () => Response.json({ access_token: "new-access-token", refresh_token: "new-refresh-token", expires_in: 90000 })); vi.stubGlobal("fetch", fetcher);
    const both = Promise.all([accessToken(h.deps), accessToken(h.deps)]);
    await vi.runAllTimersAsync();
    expect(await both).toEqual(["new-access-token", "new-access-token"]); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not reclaim a stale lease after scheduler interruption", async () => {
    vi.spyOn(Date, "now").mockReturnValue(now + 120000); const h = harness(); h.c.refresh_lease = "lease"; h.c.refresh_started_at = new Date(now).toISOString(); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect(await accessToken(h.deps)).toBeNull(); expect(fetcher).not.toHaveBeenCalled(); expect(h.patches[0].refresh_blocked).toBe(true); vi.restoreAllMocks();
  });
});