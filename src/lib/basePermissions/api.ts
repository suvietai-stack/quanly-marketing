import { supabase } from '@/integrations/supabase/client';
import { PERMISSIONS, PERMISSION_DEPENDS } from '@/lib/auth';
import type { Json } from '@/integrations/supabase/types';
import type { EffectiveAccess, OrgConfig, OrgRead, Preview } from './types';
export const baseOrgApi = {
  async read(): Promise<OrgRead> { const { data, error } = await supabase.rpc('base_org_read'); if (error) throw new Error(error.message); return data as unknown as OrgRead; },
  async effective(user: string): Promise<EffectiveAccess> { const { data, error } = await supabase.rpc('base_permissions_effective', { _user: user }); if (error) throw new Error(error.message); return data as unknown as EffectiveAccess; },
  async catalog(): Promise<void> { const { error } = await supabase.rpc('base_permission_catalog_sync', { _catalog: PERMISSIONS.map(p => ({ key: p.key, label: p.label, module: p.group, dependencies: PERMISSION_DEPENDS[p.key] ?? [] })) as Json }); if (error) throw new Error(error.message); },
  async preview(revision: number, config: OrgConfig): Promise<Preview> { const { data, error } = await supabase.rpc('base_org_preview', { _revision: revision, _config: config as unknown as Json }); if (error) throw new Error(error.message); return data as unknown as Preview; },
  async apply(id: string, confirmation: string): Promise<void> { const { error } = await supabase.rpc('base_org_apply', { _preview: id, _confirmation: confirmation }); if (error) throw new Error(error.message); },
};