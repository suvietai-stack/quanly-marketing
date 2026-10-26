import { createFileRoute } from "@tanstack/react-router";

/** Plugin WordPress đăng ký/cập nhật cấu trúc Form. Form mới mặc định Tắt; đổi schema không xóa mapping hợp lệ. */
export const Route = createFileRoute("/api/public/wf/register-forms")({
  server: { handlers: { POST: async ({ request }) => {
    const s = await import("@/lib/webForms/wf.server");
    const raw = await request.text();
    if (raw.length > s.MAX_BODY_BYTES) return Response.json({ ok: false, code: "too_large" }, { status: 413 });
    const auth = await s.authenticate(request, raw);
    if (!auth.ok) return Response.json({ ok: false, code: auth.code, message: auth.message }, { status: auth.status });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return Response.json({ ok: false, code: "bad_json" }, { status: 400 }); }
    const parsed = s.registerSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, code: "invalid_payload", message: "Cấu trúc Form không hợp lệ" }, { status: 400 });
    try {
      const r = await s.registerForms(auth.auth.website.id, parsed.data);
      return Response.json({ ok: true, code: "registered", ...r });
    } catch (e: any) {
      console.error("[wf] register failed", e?.message);
      return Response.json({ ok: false, code: "retry_later", message: "Lỗi tạm thời, thử lại sau" }, { status: 500 });
    }
  } } },
});
