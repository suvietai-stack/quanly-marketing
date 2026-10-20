import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn(), queueAndSend: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => options }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: mocks.from } }));
vi.mock("@/lib/finance/gmf.server", () => ({ queueAndSend: mocks.queueAndSend }));
import { Route } from "@/routes/api/public/casso/webhook";

const post = (Route as unknown as { server: { handlers: { POST: (args: { request: Request }) => Promise<Response> } } }).server.handlers.POST;
const account = { id: "account-test", bank_name: "VietinBank", account_number: "0000002320" };
const fixtures = [
  { id: 16186727, amount: 2750000, reference: "106D61020U0J6RU3", transactionDateTime: "2026-10-20 09:12:00" },
  { id: 16178097, amount: 15000000, reference: "106T26A0WA9LTLOD", transactionDateTime: "2026-10-19 09:12:00" },
];
// Synthetic dates/content test the handler only; these are not recovery payloads.
function sort(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sort((value as Record<string, unknown>)[key])]));
}
function request(data: unknown, timestamp = Date.now(), signed = true) {
  const body = { error: 0, data };
  const signature = createHmac("sha512", "test-only-signing-key").update(`${timestamp}.${JSON.stringify(sort(body))}`).digest("hex");
  return new Request("https://example.test/api/public/casso/webhook", { method: "POST", body: JSON.stringify(body), headers: signed ? { "x-casso-signature": `t=${timestamp},v1=${signature}` } : {} });
}
function setupDatabase(error: unknown = null) {
  const stored = new Map<string, Record<string, unknown>>();
  const upsert = vi.fn((rows: Record<string, unknown>[]) => ({ select: async () => {
    if (error) return { data: null, error };
    const inserted = rows.filter((row) => !stored.has(String(row.provider_transaction_id)));
    inserted.forEach((row) => stored.set(String(row.provider_transaction_id), row));
    return { data: inserted.map((row) => ({ id: `tx-${row.provider_transaction_id}` })), error: null };
  } }));
  mocks.from.mockImplementation((table: string) => table === "bank_accounts"
    ? { select: () => ({ eq: async () => ({ data: [account], error: null }) }) }
    : { upsert });
  return { stored, upsert };
}
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.clearAllMocks(); });

describe("Casso webhook recovery invariants", () => {
  it("accepts the two requested IDs once, keeps amount/reference and only queues new rows", async () => {
    vi.stubEnv("CASSO_WEBHOOK_SECRET", "test-only-signing-key");
    const { stored, upsert } = setupDatabase();
    const payload = fixtures.map((row) => ({ ...row, accountNumber: account.account_number, description: "Original customer content (0842672888)" }));
    expect((await post({ request: request(payload) })).status).toBe(200);
    expect((await post({ request: request(payload) })).status).toBe(200);
    expect(stored.size).toBe(2);
    expect([...stored.values()].reduce((sum, row) => sum + Number(row.amount), 0)).toBe(17750000);
    for (const fixture of fixtures) {
      expect(stored.get(String(fixture.id))).toMatchObject({ provider: "casso", amount: fixture.amount, reference_number: fixture.reference, description: payload[0].description });
    }
    expect(upsert).toHaveBeenCalledWith(expect.any(Array), { onConflict: "provider,provider_transaction_id", ignoreDuplicates: true });
    expect(mocks.queueAndSend.mock.calls).toEqual([[['tx-16186727', 'tx-16178097']], [[]]]);
  });
  it("rejects missing signatures without reaching the database", async () => {
    vi.stubEnv("CASSO_WEBHOOK_SECRET", "test-only-signing-key");
    expect((await post({ request: request(fixtures, Date.now(), false) })).status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("rejects a valid but stale signature", async () => {
    vi.stubEnv("CASSO_WEBHOOK_SECRET", "test-only-signing-key");
    expect((await post({ request: request(fixtures, Date.now() - 11 * 60 * 1000) })).status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("logs stage and SQLSTATE without leaking PostgreSQL row contents", async () => {
    vi.stubEnv("CASSO_WEBHOOK_SECRET", "test-only-signing-key");
    setupDatabase({ code: "42501", message: "permission denied for schema private", details: "sensitive bank row" });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await post({ request: request([{ ...fixtures[0], accountNumber: account.account_number }]) })).status).toBe(500);
    expect(log).toHaveBeenCalledWith("[casso] db error", { stage: "upsert", sqlstate: "42501", database_object: "private" });
    expect(mocks.queueAndSend).not.toHaveBeenCalled();
  });
});