import { supabaseAdmin } from "./client.server-D5ro3rAQ.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
async function providerKey() {
  const db = supabaseAdmin;
  const { data, error } = await db.rpc("ai_sv_key_server_read");
  if (error) throw new Error("Chưa đọc được cấu hình khóa AI trên máy chủ.");
  return (typeof data === "string" ? data.trim() : "") || process.env.OPENAI_API_KEY?.trim() || "";
}
export {
  providerKey
};
