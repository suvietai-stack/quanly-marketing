import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { parseWebhook, verifySignature } from "./fb.server";

describe("meta lead webhook", () => {
  const raw = JSON.stringify({ object: "page", entry: [{ changes: [{ field: "leadgen", value: { leadgen_id: "111", page_id: "222", form_id: "333", created_time: 1761000000 } }, { field: "feed", value: {} }] }] });
  it("accepts valid sha256 signature", async () => {
    const sig = "sha256=" + createHmac("sha256", "s3cret").update(raw).digest("hex");
    expect(await verifySignature(raw, sig, "s3cret")).toBe(true);
  });
  it("rejects tampered body / missing header", async () => {
    const sig = "sha256=" + createHmac("sha256", "s3cret").update(raw).digest("hex");
    expect(await verifySignature(raw + " ", sig, "s3cret")).toBe(false);
    expect(await verifySignature(raw, null, "s3cret")).toBe(false);
  });
  it("extracts only leadgen changes", () => {
    expect(parseWebhook(JSON.parse(raw))).toEqual([{ leadgen_id: "111", page_id: "222", form_id: "333", ad_id: undefined, created_time: 1761000000 }]);
    expect(parseWebhook({ object: "user" })).toEqual([]);
  });
});
