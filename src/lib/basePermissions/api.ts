import { supabase } from '@/integrations/supabase/client';
import { PERMISSIONS, PERMISSION_DEPENDS, useAuth } from '@/lib/auth';
import type { Json } from '@/integrations/supabase/types';
import type { EffectiveAccess, OrgConfig, OrgRead, Preview } from './types';
import { organizationCommands, type OrgCommand } from './commands';
export const baseOrgApi = {
  async read(context?: { signal?: AbortSignal }): Promise<OrgRead> {
    const started = performance.now();
    const request = supabase.rpc('org_workspace_read');
    const { data, error, status } = await (context?.signal ? request.abortSignal(context.signal) : request);
    // No identities, config, permissions, request arguments or response payload in diagnostics.
    console.info('organization-read', { rpc: 'org_workspace_read', status, code: error?.code ?? null, durationMs: Math.round(performance.now() - started) });
    if (error) throw Object.assign(new Error(error.message), { code: error.code, status });
    return data as unknown as OrgRead;
  },
  async applyMemberships(revision: number, memberships: OrgConfig['memberships'], reason: string): Promise<void> { const { error } = await supabase.rpc('base_org_membership_apply', { _revision: revision, _memberships: memberships as unknown as Json, _reason: reason }); if (error) throw new Error(error.message); },
  async effective(user: string, signal?: AbortSignal): Promise<EffectiveAccess> { const request = supabase.rpc('base_permissions_effective', { _user: user }); const { data, error } = await (signal ? request.abortSignal(signal) : request); if (error) throw new Error(error.message); return data as unknown as EffectiveAccess; },
  async catalog(): Promise<void> { const { error } = await supabase.rpc('base_permission_catalog_sync', { _catalog: PERMISSIONS.map(p => ({ key: p.key, label: p.label, module: p.group, dependencies: PERMISSION_DEPENDS[p.key] ?? [] })) as Json }); if (error) throw new Error(error.message); },
  async preview(revision: number, config: OrgConfig, before: OrgConfig, extra: OrgCommand[] = []): Promise<Preview> { const { data, error } = await supabase.rpc('org_change', { _phase: 'preview', _revision: revision, _change: [...organizationCommands(before, config), ...extra] as unknown as Json }); if (error) throw new Error(error.message); return data as unknown as Preview; },
  async apply(id: string, confirmation: string, reason: string): Promise<void> {
    const { error } = await supabase.rpc('org_change', {
      _phase: 'apply', _preview: id, _confirmation: confirmation, _reason: reason,
    });
    if (error) throw new Error(error.message);
    // Immediately re-read this actor's verified rights after an audited change.
    // Do not delay successful organization writes while navigation/report RPCs refresh.
    void useAuth.getState().refreshBaseAccess(true).catch(() => undefined);
    void useAuth.getState().refreshBizAccess(true).catch(() => undefined);
  },
};