import type { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
/** One guarded checkbox for Role drafts and personal supplemental drafts. */
export function PermissionToggle({ permissionKey, label, checked, editable, disabled, state, onChange, children }: {
  permissionKey: string; label: string; checked: boolean; editable: boolean; disabled: boolean; state: string;
  onChange: (checked: boolean) => void; children?: ReactNode;
}) {
  return <label className="flex min-w-0 items-start gap-3 rounded-md px-2 py-3 hover:bg-muted/40">
    <Checkbox className="mt-1 shrink-0" aria-label={permissionKey} data-permission-key={permissionKey} data-capability={state}
      checked={checked} disabled={disabled || !editable} onCheckedChange={value => { if (!disabled && editable) onChange(value === true); }}/>
    <span className="min-w-0 space-y-1 text-sm"><span className="block break-words font-medium">{label}</span>
      <span className="block break-all text-xs text-muted-foreground">{permissionKey}</span>{children}</span>
  </label>;
}