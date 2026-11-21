import { s as supabase } from "./client-DfPXH9B8.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function orderPayload(o) {
  const { id, recordCreatedAt, recordUpdatedAt, recordCreatedBy, ...data } = o;
  return JSON.parse(JSON.stringify(data));
}
async function saveDesignOrder(id, patch, expected) {
  const { data, error } = await supabase.rpc("design_order_save", {
    _id: id,
    _patch: orderPayload(patch),
    _expected: expected ? orderPayload(expected) : void 0
  });
  if (error) throw new Error(error.message);
  return data;
}
export {
  orderPayload,
  saveDesignOrder
};
