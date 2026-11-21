function sendErrorGroup(code) {
  if ([-216, -220, -1].includes(code)) return "token";
  if ([-213, -230, -232, -201].includes(code)) return "recipient";
  if ([-233, -204].includes(code)) return "format";
  if ([-320, -224].includes(code) || code === 403) return "permission";
  if (code === 429) return "quota";
  if (code === -9) return "network";
  return "unknown";
}
function sendRetryable(r) {
  return !r.ok && !r.ambiguous && sendErrorGroup(r.code) === "quota";
}
async function sendConsultation(userId, text, link, header, button, getToken, request = fetch) {
  const body = { recipient: { user_id: userId }, message: { text: `${header}
${text}

👉 ${button}:
${link}` } };
  let token = await getToken();
  if (!token) return { ok: false, code: -1, message: "Chưa có Token OA dùng được" };
  for (let attempt = 0; attempt < 2; attempt++) {
    let res;
    let j;
    try {
      res = await request("https://openapi.zalo.me/v3.0/oa/message/cs", {
        method: "POST",
        headers: { "Content-Type": "application/json", access_token: token },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15e3)
      });
      j = await res.json();
    } catch {
      return { ok: false, code: -9, message: "Mất hoặc sai phản hồi gửi — chưa rõ Zalo đã nhận; cần đối soát", ambiguous: true };
    }
    if (res.ok && j?.error === 0) return { ok: true, code: 0, message: "", messageId: j.data?.message_id ?? null };
    if (res.status >= 500 || typeof j?.error !== "number" || j.error === 0) {
      return { ok: false, code: -9, message: "Phản hồi không xác nhận kết quả gửi; cần đối soát", ambiguous: true };
    }
    if ([-216, -220].includes(j.error) && attempt === 0) {
      const renewed = await getToken(true);
      if (renewed) {
        token = renewed;
        continue;
      }
    }
    return { ok: false, code: j.error, message: `Zalo từ chối gửi (${j.error}) · ${sendErrorGroup(j.error)}` };
  }
  return { ok: false, code: -1, message: "Chưa phục hồi Token OA" };
}
export {
  sendConsultation as a,
  sendRetryable as b,
  sendErrorGroup as s
};
