import { PERMISSIONS } from '@/lib/auth';
import type { EditorPolicy } from './permissionEditor';
import type { EffectivePermission } from './types';

export function personalChecklistRows(policy: EditorPolicy[], baseline: string[], value: string[], effective: EffectivePermission[] = []) {
  const policies = new Map(policy.filter(p => p.personal).map(p => [p.key, p]));
  const selected = new Set(value);
  const held = new Set(baseline);
  const actual = new Map(effective.map(p => [p.key, p]));
  const definitions = [...PERMISSIONS, ...baseline.filter(k => !PERMISSIONS.some(p => p.key === k)).map(key => ({ key, label: key, group: 'Quyền đang giữ', description: undefined, subGroup: undefined }))];
  return definitions.map(p => {
    const permission = actual.get(p.key);
    return { ...p, selected: selected.has(p.key), held: held.has(p.key), policy: policies.get(p.key),
      grantable: policies.has(p.key), editable: policies.has(p.key) || held.has(p.key),
      effective: permission,
      roleSources: permission?.sources.filter(s => s.effect === 'ALLOW' && ['common', 'appointment_role', 'marketing_appointment', 'marketing_specialty', 'role'].includes(s.source_kind)) ?? [],
    };
  });
}