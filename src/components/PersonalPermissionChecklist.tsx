import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { allDependencies } from '@/lib/auth';
import { personalChecklistRows } from '@/lib/basePermissions/personalChecklist';
import { scopeLabels, type EditorPolicy } from '@/lib/basePermissions/permissionEditor';
import type { EffectivePermission } from '@/lib/basePermissions/types';
import { permissionRisk } from '@/lib/basePermissions/permissionRisk';
import { bizSubgroups, BIZ_GROUP } from '@/lib/basePermissions/bizPermissionGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PersonalPermissionChecklist({ value, onChange, policy, baseline, disabled, effective = [] }: {
  value: string[]; onChange: (v: string[]) => void; policy: EditorPolicy[]; baseline: string[]; disabled: boolean; effective?: EffectivePermission[];
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const rows = useMemo(() => personalChecklistRows(policy, baseline, value, effective), [policy, baseline, value, effective]);
  const groups = useMemo(() => [...new Set(rows.map(p => p.group))], [rows]);
  const query = search.trim().toLocaleLowerCase('vi');
  const visible = rows.filter(p => `${p.key} ${p.label} ${p.group} ${p.description ?? ''}`.toLocaleLowerCase('vi').includes(query) &&
    (filter === 'all' || (filter === 'selected' && p.selected) || (filter === 'unselected' && !p.selected) || (filter === 'unsupported' && !p.grantable)));
  const missing = rows.filter(p => p.selected).map(p => ({ row: p, keys: allDependencies(p.key).filter(k => !value.includes(k) && !effective.find(e => e.key === k)?.allowed) })).filter(p => p.keys.length);
  const label = (key: string) => rows.find(p => p.key === key)?.label ?? key;
  return <div className="min-w-0 space-y-3" aria-label="Danh mục quyền bổ sung cá nhân">
    <div className="flex flex-wrap gap-2 border-y bg-background py-3">
      <div className="relative basis-full sm:flex-1 sm:basis-auto min-w-0"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input className="pl-9" aria-label="Tìm quyền bổ sung" placeholder="Tìm tên hoặc mã quyền…" value={search} onChange={e => setSearch(e.target.value)}/></div>
      <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-40" aria-label="Lọc quyền bổ sung"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="selected">Đã cấp thêm</SelectItem><SelectItem value="unselected">Chưa cấp</SelectItem><SelectItem value="unsupported">Chưa hỗ trợ</SelectItem></SelectContent></Select>
      <div className="flex basis-full flex-wrap gap-2 text-xs"><Badge variant="secondary">{value.length}/{rows.length} đã cấp riêng</Badge><Badge variant="outline">{groups.length} module · {visible.length}/{rows.length} quyền</Badge><Badge variant="outline">{rows.filter(p => p.grantable).length} có thể cấp riêng</Badge><Badge variant="outline">{rows.filter(p => !p.grantable).length} chưa hỗ trợ</Badge></div>
    </div>
    {missing.length > 0 && <details className="border-l-2 border-warning px-3 py-2 text-sm"><summary className="cursor-pointer">{missing.length} quyền cần quyền đi kèm</summary>{missing.map(p => <p className="py-1 break-words" key={p.row.key}>{p.row.label}: cần {p.keys.map(label).join(', ')}.</p>)}</details>}
    <div className="divide-y border-y">{groups.map(group => {
      const items = visible.filter(p => p.group === group);
      if (!items.length) return null;
      const groupRows = rows.filter(p => p.group === group);
      const open = !!query || filter !== 'all' || expanded.has(group);
      const subgroups = [...new Set(items.map(p => p.subGroup ?? (group === BIZ_GROUP ? bizSubgroups.find(s => (s.keys as readonly string[]).includes(p.key))?.name : undefined) ?? ''))];
      return <section key={group} className="min-w-0">
        <Button variant="ghost" className="h-auto w-full justify-between gap-3 whitespace-normal py-4 text-left" aria-expanded={open} onClick={() => setExpanded(previous => { const next = new Set(previous); if (open) next.delete(group); else next.add(group); return next; })}>
          <span className="min-w-0 break-words font-semibold">{group}</span><span className="shrink-0 text-xs text-muted-foreground">{groupRows.filter(p => p.selected).length}/{groupRows.length} · {open ? '−' : '+'}</span>
        </Button>
        {open && <div className="pb-4">{subgroups.map(sub => <div key={sub}>{sub && <h4 className="px-2 py-2 text-sm font-semibold">{sub}</h4>}<div className="grid gap-x-4 sm:grid-cols-2">{items.filter(p => (p.subGroup ?? (group === BIZ_GROUP ? bizSubgroups.find(s => (s.keys as readonly string[]).includes(p.key))?.name : undefined) ?? '') === sub).map(p => <label key={p.key} className="flex min-w-0 items-start gap-3 rounded-md px-2 py-3 hover:bg-muted/40">
          <Checkbox className="mt-1 shrink-0" aria-label={p.key} checked={p.selected} disabled={disabled || !p.editable} onCheckedChange={checked => { if (!disabled && p.editable) onChange(checked === true ? [...new Set([...value, p.key])] : value.filter(k => k !== p.key)); }}/>
          <span className="min-w-0 space-y-1 text-sm"><span className="block break-words font-medium">{p.label}</span><span className="block break-all text-xs text-muted-foreground">{p.key}</span>{p.description && <span className="block break-words text-xs text-muted-foreground">{p.description}</span>}
            {p.selected && <span className="block text-xs text-primary">Đã cấp riêng{!p.grantable ? ' · có thể thu hồi' : ''}</span>}
            {p.roleSources.length > 0 && <span className="block break-words text-xs text-muted-foreground">Đang có từ Role: {p.roleSources.map(s => s.source_name ?? ({ common: 'Quyền chung', appointment_role: 'Vị trí', marketing_appointment: 'Nhiệm vụ', marketing_specialty: 'Chuyên môn', role: 'Role' }[s.source_kind] ?? s.source_kind)).join(', ')}</span>}
            {p.effective && <span className="block text-xs text-muted-foreground">Quyền hiệu lực: {p.effective.allowed ? 'Được phép' : 'Không được phép'}{p.effective.decision === 'DENY' ? ' · ưu tiên từ chối' : ''}</span>}
            <span className="block break-words text-xs text-muted-foreground">{p.policy ? scopeLabels[p.policy.scope] : 'Chưa thể cấp riêng — backend chưa hỗ trợ/phạm vi chưa kiểm chứng'}</span>
            {permissionRisk(p.key) && <span className="block break-words text-xs text-warning">{permissionRisk(p.key)}</span>}
          </span>
        </label>)}</div></div>)}</div>}
      </section>;
    })}</div>
    {!visible.length && <p className="py-6 text-center text-sm text-muted-foreground">Không có quyền phù hợp.</p>}
  </div>;
}