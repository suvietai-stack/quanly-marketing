import { createFileRoute } from "@tanstack/react-router";

// Casso Webhook V2 → bank_transactions. Bảo mật bằng chữ ký X-Casso-Signature (HMAC-SHA512, key CASSO_WEBHOOK_SECRET).
// Không log nội dung giao dịch.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const MAX_SKEW_MS = 10 * 60 * 1000;

// Giống hệt sortObjDataByKey trong mã mẫu chính thức của Casso.
function sortObj(data: any): any {
  const out: any = {};
  Object.keys(data).sort().forEach((k) => {
    out[k] = data[k] !== null && typeof data[k] === "object" ? sortObj(data[k]) : data[k];
  });
  return out;
}

async function hmacHex(key: string, msg: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const digits = (s: unknown) => String(s ?? "").replace(/\D/g, "");

function toIso(v: unknown): string | null {
  const s = String(v ?? "").trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/);
  const d = new Date(m ? `${m[1]}T${m[2]}+07:00` : s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const Route = createFileRoute("/api/public/casso/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CASSO_WEBHOOK_SECRET"];
        if (!secret) return json({ success: false, error: "not_configured" }, 503);
        const raw = await request.text();
        if (raw.length > 100_000) return json({ success: false }, 413);
        let body: any;
        try { body = JSON.parse(raw); } catch { return json({ success: false }, 400); }

        const header = request.headers.get("x-casso-signature") ?? "";
        const [, tStr, v1] = header.match(/t=(\d+),v1=([a-f0-9]+)/) || [];
        if (!tStr || !v1) return json({ success: false, error: "invalid_signature" }, 401);
        const t = parseInt(tStr, 10);
        const expected = await hmacHex(secret, t + "." + JSON.stringify(sortObj(body)));
        if (!safeEq(expected, v1)) {
          console.warn("[casso] rejected: invalid signature");
          return json({ success: false, error: "invalid_signature" }, 401);
        }
        if (Math.abs(Date.now() - t) > MAX_SKEW_MS) {
          console.warn("[casso] rejected: stale timestamp");
          return json({ success: false, error: "stale" }, 401);
        }
        if (body?.error !== 0 || !body?.data) return json({ success: true, ignored: "no_data" });

        const allowed = String(process.env["CASSO_ALLOWED_ACCOUNTS"] ?? "").split(",").map(digits).filter(Boolean);
        const list: any[] = Array.isArray(body.data) ? body.data : [body.data];
        const rows = list
          .filter((d) => d && d.id != null && Number(d.amount) > 0)
          .filter((d) => allowed.includes(digits(d.accountNumber)))
          .map((d) => ({
            provider: "casso",
            provider_transaction_id: String(d.id),
            bank_name: String(d.bankAbbreviation || d.bankName || "").slice(0, 100) || null,
            bank_account_identifier: digits(d.accountNumber) || null,
            transaction_date: d.transactionDateTime != null ? String(d.transactionDateTime) : null,
            transaction_at: toIso(d.transactionDateTime),
            amount: Math.round(Number(d.amount)),
            description: d.description != null ? String(d.description).slice(0, 1000) : null,
            reference_number: d.reference != null ? String(d.reference).slice(0, 200) : null,
          }));
        if (!rows.length) return json({ success: true, ignored: "filtered" });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("bank_transactions")
          .upsert(rows, { onConflict: "provider,provider_transaction_id", ignoreDuplicates: true });
        if (error) {
          console.error("[casso] db error", error.code);
          return json({ success: false, error: "db_error" }, 500);
        }
        return json({ success: true });
      },
    },
  },
});
