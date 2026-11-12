import { supabase } from '@/integrations/supabase/client';
import { PERMISSIONS } from '@/lib/auth';

export type CatalogPermission = { key: string; label: string; module: string };
export type ChecklistDefinition = { key: string; label: string; group: string; subGroup?: string; description?: string };

export function mergePermissionCatalog(catalog: CatalogPermission[], local: ChecklistDefinition[] = PERMISSIONS): ChecklistDefinition[] {
  const byKey = new Map<string, ChecklistDefinition>(local.map(p => [p.key, p]));
  for (const p of catalog) {
    const existing = byKey.get(p.key);
    byKey.set(p.key, { key: p.key, label: existing?.label || p.label || p.key, group: p.module || existing?.group || 'Khác', subGroup: existing?.subGroup, description: existing?.description });
  }
  return [...byKey.values()];
}

export async function readPermissionCatalog(signal?: AbortSignal): Promise<CatalogPermission[]> {
  let query = supabase.from('base_permission_catalog').select('key,label,module').order('key');
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}