import { createFileRoute } from "@tanstack/react-router";

/** Plugin WordPress gửi submission: lưu bền vững → xử lý ngay → trả mã trạng thái rõ ràng. */
export const Route = createFileRoute("/api/public/wf/submit")({
  server: { handlers: { POST: async ({ request }) => {
    const s = await import("@/lib/webForms/wf.server");
    const raw = await request.text();
    if (raw.length > s.MAX_BODY_BYTES) return Response.json({ ok: false, code: "too_large" }, { status: 413 });
    const auth = await s.authenticate(request, raw);
    if (!auth.ok) return Response.json({ ok: false, code: auth.code, message: auth.message }, { status: auth.status });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return Response.json({ ok: false, code: "bad_json" }, { status: 400 }); }
    const parsed = s.submitSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, code: "invalid_payload", message: "Dữ liệu submission không hợp lệ" }, { status: 400 });
    try {
      const r = await s.intakeSubmission(auth.auth.website.id, parsed.data);
      const http = r.code === "accepted" ? 200 : r.code === "duplicate" ? 200 : r.code === "form_disabled" ? 202 : r.code === "mapping_invalid" ? 422 : 503;
      return Response.json({ ok: r.code === "accepted" || r.code === "duplicate", code: r.code, event_id: r.eventId, signal_id: r.signalId }, { status: http });
    } catch (e: any) {
      console.error("[wf] submit failed", e?.message);
      return Response.json({ ok: false, code: "retry_later", message: "Lỗi tạm thời, plugin nên gửi lại" }, { status: 503 });
    }
  } } },
});
