import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { status: "connected", access_token: "test-access-token", token_expires_at: new Date(Date.now() + 86400000).toISOString(), refresh_blocked: false } }) }) }) }) } }));
import { sendCs } from "./zalo.server";
afterEach(() => vi.unstubAllGlobals());
it("never sends again after a confirmed success", async () => {
  const f = vi.fn(async () => Response.json({ error: 0, data: { message_id: "confirmed" } })); vi.stubGlobal("fetch", f);
  expect((await sendCs("test-user", "test", "https://base.suviet.vn", { header: "Test" })).messageId).toBe("confirmed"); expect(f).toHaveBeenCalledTimes(1);
});
it("never falls back or retries when delivery is unknown", async () => {
  const f = vi.fn(async () => { throw new Error("timeout"); }); vi.stubGlobal("fetch", f);
  expect((await sendCs("test-user", "test", "https://base.suviet.vn", { header: "Test" })).ambiguous).toBe(true); expect(f).toHaveBeenCalledTimes(1);
});
it("recipient ineligibility does not trigger token rotation or fallback", async () => {
  const f = vi.fn(async () => Response.json({ error: -230 })); vi.stubGlobal("fetch", f);
  expect((await sendCs("test-user", "test", "https://base.suviet.vn", { header: "Test" })).code).toBe(-230); expect(f).toHaveBeenCalledTimes(1);
});