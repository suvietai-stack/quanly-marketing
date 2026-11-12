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
/** Personal three-state control: follow Roles, explicit ALLOW, or explicit DENY (wins over every Role source). */
export function PersonalStateToggle({ permissionKey, label, state, canAllow, canDeny, disabled, onChange, children }: {
  permissionKey: string; label: string; state: 'inherit' | 'allow' | 'deny'; canAllow: boolean; canDeny: boolean; disabled: boolean;
  onChange: (state: 'inherit' | 'allow' | 'deny') => void; children?: ReactNode;
}) {
  const options = [
    { value: 'inherit' as const, text: 'Theo Role', enabled: true },
    { value: 'allow' as const, text: 'Cho phép', enabled: canAllow || state === 'allow' },
    { value: 'deny' as const, text: 'Chặn', enabled: canDeny || state === 'deny' },
  ];
  return <div className="flex min-w-0 flex-col gap-2 rounded-md px-2 py-3 hover:bg-muted/40" data-permission-key={permissionKey} data-personal-state={state}>
    <span className="min-w-0 space-y-1 text-sm"><span className="block break-words font-medium">{label}</span>
      <span className="block break-all text-xs text-muted-foreground">{permissionKey}</span>{children}</span>
    <div role="radiogroup" aria-label={`Trạng thái riêng ${permissionKey}`} className="inline-flex w-fit overflow-hidden rounded-md border text-xs">
      {options.map(o => <button key={o.value} type="button" role="radio" aria-checked={state === o.value} disabled={disabled || !o.enabled}
        onClick={() => { if (!disabled && o.enabled && state !== o.value) onChange(o.value); }}
        className={`px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${state === o.value ? (o.value === 'deny' ? 'bg-destructive text-destructive-foreground' : o.value === 'allow' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground') : 'bg-background text-muted-foreground hover:bg-muted'}`}>{o.text}</button>)}
    </div>
  </div>;
}
