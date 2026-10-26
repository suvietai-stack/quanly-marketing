import { describe, it, expect } from "vitest";
import { generateKey, sha256, hmacHex, timingSafeEq, RATE_LIMIT_PER_MIN, TIMESTAMP_WINDOW_MS } from "./wf.server";

describe("wf key & HMAC", () => {
  it("sinh khóa đúng định dạng wf_<prefix>_<secret>, prefix 8 ký tự", () => {
    const { key, prefix } = generateKey();
    expect(key.startsWith(`wf_${prefix}_`)).toBe(true);
    expect(prefix).toHaveLength(8);
    expect(key.length).toBeGreaterThan(50);
  });
  it("hai khóa sinh ra khác nhau", () => {
    expect(generateKey().key).not.toBe(generateKey().key);
  });
  it("sha256 ổn định và hex 64 ký tự", async () => {
    const h = await sha256("abc");
    expect(h).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("HMAC-SHA256 khớp giữa hai lần ký cùng thông điệp", async () => {
    const { key } = generateKey();
    const msg = "1761448800000.{\"form_id\":\"contact\"}";
    const a = await hmacHex(key, msg);
    const b = await hmacHex(key, msg);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
  it("timingSafeEq chấp nhận chuỗi giống, từ chối chuỗi khác/khác độ dài", async () => {
    const a = await hmacHex("k", "m");
    const b = await hmacHex("k", "m2");
    expect(timingSafeEq(a, a)).toBe(true);
    expect(timingSafeEq(a, b)).toBe(false);
    expect(timingSafeEq(a, a.slice(2))).toBe(false);
  });
  it("ký với khóa khác cho chữ ký khác", async () => {
    const a = await hmacHex(generateKey().key, "m");
    const b = await hmacHex(generateKey().key, "m");
    expect(a).not.toBe(b);
  });
  it("giới hạn cấu hình đúng tài liệu: 60 request/phút, timestamp ±5 phút", () => {
    expect(RATE_LIMIT_PER_MIN).toBe(60);
    expect(TIMESTAMP_WINDOW_MS).toBe(5 * 60_000);
  });
});
