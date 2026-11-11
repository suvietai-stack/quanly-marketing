import { useState } from 'react';
import { Search, ShieldAlert, Plus } from 'lucide-react';
import { PERMISSIONS, allDependencies } from '@/lib/auth';
import type { EditorPolicy } from '@/lib/basePermissions/permissionEditor';
import { scopeLabels } from '@/lib/basePermissions/permissionEditor';
import { permissionRisk } from '@/lib/basePermissions/permissionRisk';
import { BIZ_GROUP, bizSubgroups, bizSourceNote, bizViewNote } from '@/lib/basePermissions/bizPermissionGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PermissionChecklist({ value, onChange, policy, disabled = false, personal = false, baseline = [] }: {
  value: string[]; onChange: (v: string[]) => void; policy: EditorPolicy[]; disabled?: boolean; personal?: boolean; baseline?: string[];
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const available = policy.filter(p => !personal || p.personal);
  const lookup = new Map(available.map(p => [p.key, p]));
  const definitions = [...PERMISSIONS, ...baseline.filter(k => !PERMISSIONS.some(p => p.key === k)).map(key => ({ key, label: key, group: 'Quyền đang giữ' }))];
  const permitted = definitions.filter(p => !personal || lookup.has(p.key) || baseline.includes(p.key));
  const rows = permitted.filter(p => `${p.label} ${p.group} ${p.key}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')) && (filter === 'all' || (filter === 'sensitive' ? !!permissionRisk(p.key) : filter === 'selected' ? value.includes(p.key) : !value.includes(p.key))));
  const groups = [...new Set(rows.map(p => p.group))];
  const missing = value.flatMap(key => { const parents = allDependencies(key).filter(k => !value.includes(k)); return parents.length ? [{ key, parents }] : []; });
  const label = (key: string) => definitions.find(p => p.key === key)?.label ?? key;
  const toggle = (key: string, checked: boolean) => onChange(checked ? [...new Set([...value, key])] : value.filter(k => k !== key));
  return <div className="min-w-0 space-y-3">
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-background py-3">
      <div className="relative min-w-0 basis-full sm:basis-auto sm:flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input className="pl-9" aria-label={personal ? 'Tìm quyền bổ sung' : 'Tìm quyền trong ma trận'} placeholder="Tìm chức năng, quyền…" value={search} onChange={e => setSearch(e.target.value)}/></div>
      <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-36" aria-label="Lọc quyền đã chọn"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="selected">Đã chọn</SelectItem><SelectItem value="unselected">Chưa chọn</SelectItem><SelectItem value="sensitive">Nhạy cảm</SelectItem></SelectContent></Select>
      <Badge variant="secondary">{value.length} quyền đã tích</Badge>
    </div>
    {missing.length > 0 && <details open className="border-l-2 border-warning bg-warning/10 px-3 py-2 text-sm"><summary className="cursor-pointer font-medium">{missing.length} quyền cần quyền truy cập đi kèm</summary><div className="space-y-2 pt-2">{missing.map(m => <div key={m.key}><p>{label(m.key)}: cần {m.parents.map(label).join(', ')}.</p><p className="text-xs text-muted-foreground">Có thể không dùng được chức năng nếu thiếu quyền truy cập. Điều kiện nghiệp vụ vẫn được kiểm tra riêng.</p><Button size="sm" variant="ghost" disabled={disabled || m.parents.some(k => !lookup.has(k))} onClick={() => onChange([...new Set([...value, ...m.parents])])}><Plus className="mr-1 size-3"/>Chọn quyền đi kèm</Button>{m.parents.some(k => !lookup.has(k)) && <p className="text-xs text-muted-foreground">Quyền đi kèm cần cấu hình an toàn trước.</p>}</div>)}</div></details>}
    <div className="divide-y border-y">{groups.map(group => {
      const groupAll = permitted.filter(p => p.group === group);
      const bulkSafe = groupAll.length > 0 && groupAll.every(p => lookup.has(p.key) && lookup.get(p.key)?.scope !== 'unit' && !permissionRisk(p.key));
      return <details key={group} open={!!search || filter === 'selected' || groupAll.some(p => value.includes(p.key))} className="group">
        <summary className="cursor-pointer py-4 text-sm font-semibold">{group}<span className="ml-2 font-normal text-muted-foreground">{groupAll.filter(p => value.includes(p.key)).length}/{groupAll.length}</span></summary>
        <div className="pb-4">{bulkSafe && <Button size="sm" variant="outline" disabled={disabled} className="mb-3" onClick={() => onChange([...new Set([...value, ...groupAll.map(p => p.key)])])}>Chọn tất cả trong nhóm</Button>}
          {(group === BIZ_GROUP ? [...bizSubgroups.map(g => ({ name: g.name as string, keys: g.keys as readonly string[] })), { name: 'Khác', keys: [] as readonly string[] }] : [{ name: '', keys: [] as readonly string[] }]).map(sub => {
          const items = rows.filter(p => p.group === group && (group !== BIZ_GROUP || (sub.name === 'Khác' ? !bizSubgroups.some(g => (g.keys as readonly string[]).includes(p.key)) : sub.keys.includes(p.key))));
          if (!items.length) return null;
          const grid = <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{items.map(p => {
            const safe = lookup.get(p.key); const checked = value.includes(p.key); const held = baseline.includes(p.key);
            return <label key={p.key} className="flex min-w-0 items-start gap-3 rounded-md px-2 py-3 hover:bg-muted/40">
              <Checkbox className="mt-0.5 shrink-0" aria-label={p.label} checked={checked} disabled={disabled || (!safe && !held && !checked)} onCheckedChange={v => toggle(p.key, v === true)}/>
              <span className="min-w-0 text-sm"><span className="block break-words font-medium">{p.label}</span><span className="mt-1 block text-xs text-muted-foreground">{safe ? scopeLabels[safe.scope] : held ? 'Đang giữ · cần đối chiếu phạm vi' : p.group === BIZ_GROUP ? 'Theo bổ nhiệm Kinh doanh · chưa nhận từ Role' : 'Cần cấu hình / Chưa an toàn'}</span>{permissionRisk(p.key) && <span className="mt-1 block text-xs text-warning">{permissionRisk(p.key)}</span>}{!safe && <ShieldAlert className="mt-1 size-3 text-muted-foreground"/>}</span>
            </label>;
          })}</div>;
          return sub.name ? <details key={sub.name} open className="border-l pl-3"><summary className="cursor-pointer py-2 text-sm font-medium">{sub.name}<span className="ml-2 font-normal text-muted-foreground">{items.filter(p => value.includes(p.key)).length}/{items.length}</span></summary>{grid}</details> : <div key="all">{grid}</div>;
          })}
          {group === BIZ_GROUP && <p className="mt-2 text-xs text-muted-foreground">{bizSourceNote} {bizViewNote}</p>}
        </div>
      </details>;
    })}</div>
    {!rows.length && <p className="py-8 text-center text-sm text-muted-foreground">Không có quyền phù hợp.</p>}
  </div>;
}