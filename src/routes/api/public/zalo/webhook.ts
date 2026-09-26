import { createFileRoute } from "@tanstack/react-router";

// Zalo yêu cầu Webhook luôn trả HTTP 200 (kể cả lần "kiểm tra Webhook" không có chữ ký).
// Bảo mật: chỉ xử lý sự kiện khi chữ ký X-ZEvent-Signature hợp lệ; request không hợp lệ bị bỏ qua, không liên kết gì.
const ok = () => new Response("ok", { status: 200 });

export const Route = createFileRoute("/api/public/zalo/webhook")({
  server: {
    handlers: {
      GET: async () => ok(),
      POST: async ({ request }) => {
        const raw = await request.text();
        if (raw.length > 20000) return ok();
        let body: any;
        try { body = JSON.parse(raw); } catch { return ok(); }
        const s = await import("@/lib/zalo.server");
        const sig = request.headers.get("x-zevent-signature");
        if (!sig) return ok(); // yêu cầu kiểm tra của Zalo hoặc request lạ → không xử lý
        const valid = await s.verifyWebhook(raw, sig, String(body?.timestamp ?? ""), String(body?.app_id ?? ""));
        if (!valid) {
          console.warn("[zalo-webhook] rejected: invalid signature", body?.event_name ?? "");
          return ok();
        }
        // Chỉ dùng tin nhắn để nhận mã liên kết; không lưu nội dung tin nhắn.
        if (body?.event_name === "user_send_text" && typeof body?.sender?.id === "string") {
          const result = await s.handleLinkMessage(body.sender.id, String(body?.message?.text ?? "").slice(0, 200));
          console.log("[zalo-webhook] link result:", result ?? "no-code");
          if (result === "linked") {
            await s.sendCs(body.sender.id, "Đã liên kết Zalo với tài khoản Base. Bạn sẽ nhận thông báo tín hiệu tại đây.", `${await s.baseUrl()}/settings`).catch(() => {});
          } else if (result === "invalid") {
            await s.sendCs(body.sender.id, "Mã liên kết không đúng hoặc đã hết hạn. Vui lòng tạo mã mới trong Base.", `${await s.baseUrl()}/settings`).catch(() => {});
          }
        }
        return ok();
      },
    },
  },
});
