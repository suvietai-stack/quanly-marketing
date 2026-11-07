import { supabase } from '@/integrations/supabase/client';
import type { DesignOrder } from '@/lib/store';
export function orderPayload(o: Partial<DesignOrder>) {
  const { id, recordCreatedAt, recordUpdatedAt, recordCreatedBy, ...data } = o;
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}
export async function saveDesignOrder(id: string, patch: Partial<DesignOrder>, expected?: DesignOrder) {
  const { data, error } = await supabase.rpc('design_order_save', {
    _id: id, _patch: orderPayload(patch) as never, _expected: expected ? orderPayload(expected) as never : undefined,
  });
  if (error) throw new Error(error.message);
  return data as unknown as DesignOrder;
}