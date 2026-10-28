export type SendResult = { ok: boolean; code: number; message: string; messageId?: string | null; ambiguous?: boolean };
export type SendErrorGroup = "token" | "recipient" | "format" | "quota" | "permission" | "network" | "unknown";

export function sendErrorGroup(code: number): SendErrorGroup {
  if ([-216, -220, -1].includes(code)) return "token";
  if ([-213, -230, -232, -201].includes(code)) return "recipient";
  if ([-233, -204].includes(code)) return "format";
  if ([-320, -224].includes(code) || code === 403) return "permission";
  if (code === 429 || [-210, -211].includes(code)) return "quota";
  if (code === -9) return "network";
  return "unknown";
}

export function sendRetryable(r: SendResult) {
  // Only an explicit throttling rejection is safe to retry automatically.
  return !r.ok && !r.ambiguous && sendErrorGroup(r.code) === "quota";
}

/** CS text is the primary format: no unsupported template or paid fallback. */
export async function sendConsultation(
  userId: string, text: string, link: string, header: string, button: string,
  getToken: (force?: boolean) => Promise<string | null>, request: typeof fetch = fetch,
): Promise<SendResult> {
  const body = { recipient: { user_id: userId }, message: { text: `${header}\n${text}\n\n👉 ${button}:\n${link}` } };
  let token = await getToken();
  if (!token) return { ok: false, code: -1, message: "Chưa có Token OA dùng được" };
  for (let attempt = 0; attempt < 2; attempt++) {
    let res: Response;
    let j: any;
    try {
      res = await request("https://openapi.zalo.me/v3.0/oa/message/cs", {
        method: "POST", headers: { "Content-Type": "application/json", access_token: token },
        body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
      });
      j = await res.json();
    } catch {
      return { ok: false, code: -9, message: "Mất hoặc sai phản hồi gửi — chưa rõ Zalo đã nhận; cần đối soát", ambiguous: true };
    }
    if (res.ok && j?.error === 0) return { ok: true, code: 0, message: "", messageId: j.data?.message_id ?? null };
    // A missing/non-numeric provider code or gateway 5xx does not prove rejection.
    if (res.status >= 500 || typeof j?.error !== "number" || j.error === 0) {
      return { ok: false, code: -9, message: "Phản hồi không xác nhận kết quả gửi; cần đối soát", ambiguous: true };
    }
    if ([-216, -220].includes(j.error) && attempt === 0) {
      const renewed = await getToken(true);
      if (renewed) { token = renewed; continue; }
    }
    return { ok: false, code: j.error, message: `Zalo từ chối gửi (${j.error}) · ${sendErrorGroup(j.error)}` };
  }
  return { ok: false, code: -1, message: "Chưa phục hồi Token OA" };
}