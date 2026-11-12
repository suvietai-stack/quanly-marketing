import { PERMISSIONS } from '@/lib/auth';
import type { EditorPolicy } from './permissionEditor';
import { permissionControl } from './permissionEditor';
import type { EffectivePermission } from './types';
import { mergePermissionCatalog, type CatalogPermission, type ChecklistDefinition } from './permissionCatalog';

export function personalChecklistRows(policy: EditorPolicy[], baseline: string[], value: string[], effective: EffectivePermission[] = [], catalog: CatalogPermission[] = [], local: ChecklistDefinition[] = PERMISSIONS) {
  const policies = new Map(policy.filter(p => p.personal).map(p => [p.key, p]));
  const selected = new Set(value);
  const held = new Set(baseline);
  const actual = new Map(effective.map(p => [p.key, p]));
  const merged = mergePermissionCatalog(catalog, local);
  const definitions = [...merged, ...baseline.filter(k => !merged.some(p => p.key === k)).map(key => ({ key, label: key, group: 'Quyền đang giữ', description: undefined, subGroup: undefined }))];
  return definitions.map(p => {
    const permission = actual.get(p.key);
    const control = permissionControl(policy,p.key,'personal',baseline,value);
    return { ...p, selected: selected.has(p.key), held: held.has(p.key), policy: policies.get(p.key),
      grantable: control.ready, editable: control.editable,
      availability: control,
      effective: permission,
      roleSources: permission?.sources.filter(s => s.effect === 'ALLOW' && ['common', 'appointment_role', 'marketing_appointment', 'marketing_specialty', 'role'].includes(s.source_kind)) ?? [],
    };
  });
}