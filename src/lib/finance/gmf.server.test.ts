import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/zalo.server", () => ({
  baseUrl: async () => "https://base.suviet.vn",
  getAccessToken: vi.fn(),
  getConfig: vi.fn(),
}));

import { manualMessage, txMessage } from "./gmf.server";

describe("GMF preserves original financial content", () => {
  it.each([
    "12B cọc (0842672888)",
    "REF123 12B cọc (0842672888)",
    "0842672888 Nguyễn Văn An",
    "REF123 " + "Nội dung gốc ".repeat(40),
  ])("keeps uncertain prefixes, names and phone numbers intact", async (description) => {
    const tx = { id: "test-id", amount: 1000000, transaction_at: "2026-10-19T02:12:00Z", description };
    const original = { ...tx };
    const text = await txMessage(tx, { label: "Viettinbank Ngọc", bank: "VietinBank", last4: "2320" });
    expect(text.includes(description)).toBe(true);
    expect(tx).toEqual(original);
  });

  it.each(["cash", "other_account"])("preserves accountant note without substituting Sale note for %s", async (source) => {
    const description = "Nguyễn Văn An (0842672888) " + "Ghi chú gốc ".repeat(40);
    const tx = { id: "test-id", amount: 1000000, source, received_date: "2026-10-19", description, note: "Ghi chú Sale riêng" };
    const original = { ...tx };
    const text = await manualMessage(tx);
    expect(text.includes(description)).toBe(true);
    expect(text.includes(tx.note)).toBe(false);
    expect(tx).toEqual(original);
  });
});