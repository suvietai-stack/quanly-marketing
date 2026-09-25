import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/zalo/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        if (raw.length > 20000) return new Response("too large", { status: 413 });
        let body: any;
        try { body = JSON.parse(raw); } catch { return new Response("bad", { status: 400 }); }
        const s = await import("@/lib/zalo.server");
        if (!(await s.verifyWebhook(raw, request.headers.get("x-zevent-signature"), String(body?.timestamp ?? "")))) {
          return new Response("invalid signature", { status: 401 });
        }
        // Chỉ dùng tin nhắn để nhận mã liên kết; không lưu nội dung tin nhắn.
        if (body?.event_name === "user_send_text" && typeof body?.sender?.id === "string") {
          const result = await s.handleLinkMessage(body.sender.id, String(body?.message?.text ?? "").slice(0, 200));
          if (result === "linked") {
            await s.sendCs(body.sender.id, "Đã liên kết Zalo với tài khoản Base. Bạn sẽ nhận thông báo tín hiệu tại đây.", `${await s.baseUrl()}/settings`);
          }
        }
        return new Response("ok");
      },
    },
  },
});
