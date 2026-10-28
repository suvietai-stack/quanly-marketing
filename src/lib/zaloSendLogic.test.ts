import { expect, it, vi } from "vitest";
import { sendConsultation, sendErrorGroup, sendRetryable } from "./zaloSend";

it("CS sends full text and Base URL without promotion attachment", async () => {
  const request = vi.fn(async () => Response.json({ error: 0, data: { message_id: "ok" } }));
  await sendConsultation("user", "Full content", "https://base.suviet.vn/signals?open=1", "BASE", "OPEN", async () => "token", request);
  const [url, init] = request.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("https://openapi.zalo.me/v3.0/oa/message/cs");
  expect(JSON.parse(String(init.body))).toEqual({ recipient: { user_id: "user" }, message: { text: "BASE\nFull content\n\n👉 OPEN:\nhttps://base.suviet.vn/signals?open=1" } });
});
for (const code of [-233, -230, -232, -320, -224]) it(`${code} stops without fallback or repeated sending`, async () => {
  const request = vi.fn(async () => Response.json({ error: code }));
  const getToken = vi.fn(async () => "token");
  const r = await sendConsultation("u", "t", "https://base.suviet.vn", "h", "b", getToken, request);
  expect(sendRetryable(r)).toBe(false);
  expect(request).toHaveBeenCalledTimes(1);
  expect(getToken).toHaveBeenCalledTimes(1);
});
for (const code of [-216, -220]) it(`${code} rotates once only after explicit rejection`, async () => {
  const request = vi.fn().mockResolvedValueOnce(Response.json({ error: code })).mockResolvedValueOnce(Response.json({ error: 0 }));
  const getToken = vi.fn(async () => "token");
  expect((await sendConsultation("u", "t", "https://base.suviet.vn", "h", "b", getToken, request)).ok).toBe(true);
  expect(getToken.mock.calls).toEqual([[], [true]]);
  expect(request).toHaveBeenCalledTimes(2);
});
for (const response of [() => Response.json({}), () => new Response("bad JSON"), () => Response.json({ error: 0 }, { status: 502 })]) it("unknown response is held without retry", async () => {
  const request = vi.fn(async () => response());
  const r = await sendConsultation("u", "t", "https://base.suviet.vn", "h", "b", async () => "token", request);
  expect(r.ambiguous).toBe(true); expect(sendRetryable(r)).toBe(false); expect(request).toHaveBeenCalledTimes(1);
});
it("timeout never retries", async () => {
  const request = vi.fn(async () => { throw new Error("timeout"); });
  const r = await sendConsultation("u", "t", "https://base.suviet.vn", "h", "b", async () => "token", request);
  expect(r.ambiguous).toBe(true); expect(sendRetryable(r)).toBe(false); expect(request).toHaveBeenCalledTimes(1);
});
it("error groups are independent of OAuth connection state", () => {
  expect(sendErrorGroup(-233)).toBe("format"); expect(sendErrorGroup(-232)).toBe("recipient");
  expect(sendErrorGroup(-220)).toBe("token"); expect(sendErrorGroup(-320)).toBe("permission");
  expect(sendErrorGroup(-9)).toBe("network"); expect(sendErrorGroup(429)).toBe("quota");
  expect(sendRetryable({ ok: false, code: 429, message: "rejected" })).toBe(true);
});