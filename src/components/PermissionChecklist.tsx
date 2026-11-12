import { useState } from 'react';
import { Search, ShieldAlert, Plus } from 'lucide-react';
import { PERMISSIONS, allDependencies } from '@/lib/auth';
import type { EditorPolicy } from '@/lib/basePermissions/permissionEditor';
import { permissionControl, rolePermissionPolicy, personalState, setPersonalState, canDeny } from '@/lib/basePermissions/permissionEditor';
import { permissionRisk } from '@/lib/basePermissions/permissionRisk';
import { BIZ_GROUP, bizSubgroups, bizSourceNote, bizViewNote } from '@/lib/basePermissions/bizPermissionGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionToggle, PersonalStateToggle } from './PermissionToggle';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EffectivePermission } from '@/lib/basePermissions/types';
import { mergePermissionCatalog, type CatalogPermission } from '@/lib/basePermissions/permissionCatalog';

export function PermissionChecklist(props: {
  value: string[]; onChange: (v: string[]) => void; policy: EditorPolicy[]; source?: string; disabled?: boolean; personal?: boolean; baseline?: string[]; effective?: EffectivePermission[]; catalog?: CatalogPermission[]; checks?: {key:string;ready:boolean;reason:string}[];
  denied?: string[]; baselineDenied?: string[]; onPersonalChange?: (allow: string[], deny: string[]) => void;
}) {
  return <RolePermissionChecklist {...props} source={props.personal ? 'personal' : props.source}/>;
}
function RolePermissionChecklist({ value, onChange, policy, source = 'position', disabled = false, personal = false, baseline = [], catalog = [], checks = [], effective, denied, baselineDenied = [], onPersonalChange }: {
  value: string[]; onChange: (v: string[]) => void; policy: EditorPolicy[]; source?: string; disabled?: boolean; personal?: boolean; baseline?: string[]; catalog?: CatalogPermission[]; checks?: {key:string;ready:boolean;reason:string}[];
  effective?: EffectivePermission[]; denied?: string[]; baselineDenied?: string[]; onPersonalChange?: (allow: string[], deny: string[]) => void;
}) {
  const triState = personal && !!denied && !!onPersonalChange;
  const deny = denied ?? [];
  const effectiveNote = (key: string) => { const e = effective?.find(x => x.key === key); if (!e) return ''; const names = [...new Set(e.sources.filter(x => x.effect === e.decision || e.decision === 'DENY').map(x => x.source_name ?? x.source_kind))]; return `Hiện tại: ${e.allowed ? 'có quyền' : 'không có quyền'}${names.length ? ` · ${names.join(', ')}` : ''}`; };
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const available = rolePermissionPolicy(policy,source);
  const lookup = new Map(available.map(p => [p.key, p]));
  const merged = mergePermissionCatalog(catalog, PERMISSIONS);
  const definitions = [...merged, ...baseline.filter(k => !merged.some(p => p.key === k)).map(key => ({ key, label: key, group: 'Quyền đang giữ' }))];
  const permitted = definitions;
  const rows = permitted.filter(p => `${p.label} ${p.group} ${p.key}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')) && (filter === 'all' || (filter === 'sensitive' ? !!permissionRisk(p.key) : filter === 'selected' ? value.includes(p.key) || deny.includes(p.key) : filter === 'denied' ? deny.includes(p.key) : !value.includes(p.key) && !deny.includes(p.key))));
  const groups = [...new Set(rows.map(p => p.group))];
  const missing = value.flatMap(key => { const parents = allDependencies(key).filter(k => !value.includes(k)); return parents.length ? [{ key, parents }] : []; });
  const label = (key: string) => definitions.find(p => p.key === key)?.label ?? key;
  const toggle = (key: string, checked: boolean) => { if(disabled || !permissionControl(policy,key,source,baseline,value).editable)return; onChange(checked ? [...new Set([...value, key])] : value.filter(k => k !== key)); };
  return <div className="min-w-0 space-y-3" aria-label={personal ? 'Danh mục quyền bổ sung cá nhân' : 'Danh mục quyền Role'}>
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-background py-3">
      <div className="relative min-w-0 basis-full sm:basis-auto sm:flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input className="pl-9" aria-label={personal ? 'Tìm quyền bổ sung' : 'Tìm quyền trong ma trận'} placeholder="Tìm chức năng, quyền…" value={search} onChange={e => setSearch(e.target.value)}/></div>
      <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-36" aria-label="Lọc quyền đã chọn"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="selected">Đã chọn</SelectItem><SelectItem value="unselected">Chưa chọn</SelectItem><SelectItem value="sensitive">Nhạy cảm</SelectItem>{triState && <SelectItem value="denied">Đang chặn</SelectItem>}</SelectContent></Select>
      <Badge variant="secondary">{value.length} quyền đã tích</Badge>{triState && <Badge variant="destructive">{deny.length} quyền chặn riêng</Badge>}
      <Badge variant="outline">{new Set(definitions.map(p => p.group)).size} module · {definitions.length} quyền</Badge>
      <Badge variant="outline">{definitions.filter(p=>lookup.has(p.key)).length} có thể cấp · {definitions.filter(p=>!lookup.has(p.key)).length} chưa khả dụng</Badge>
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
            const safe = lookup.get(p.key); const checked = value.includes(p.key); const control = permissionControl(policy,p.key,source,baseline,value);
            if (triState) {
              const st = personalState(p.key, value, deny); const denyOk = canDeny(policy, p.key, baselineDenied);
              return <PersonalStateToggle key={p.key} permissionKey={p.key} label={p.label} state={st} canAllow={control.editable} canDeny={denyOk} disabled={disabled}
                onChange={next => { const r = setPersonalState(p.key, next, value, deny); onPersonalChange!(r.allow, r.deny); }}>
                <span className="block text-xs text-muted-foreground">{effectiveNote(p.key) || control.reason}</span>
                {!denyOk && st !== 'deny' && <span className="block text-xs text-muted-foreground">Chưa chặn riêng được: cổng kiểm tra của chức năng này chưa đọc quyền chung.</span>}
                {permissionRisk(p.key) && <span className="block text-xs text-warning">{permissionRisk(p.key)}</span>}
              </PersonalStateToggle>;
            }
            return <PermissionToggle key={p.key} permissionKey={p.key} label={p.label} checked={checked} editable={control.editable} disabled={disabled} state={control.state} onChange={v=>toggle(p.key,v)}>
              <span className="block text-xs text-muted-foreground">{control.reason}{!control.ready && checks.find(c => c.key === p.key)?.reason ? ` · ${checks.find(c => c.key === p.key)?.reason}` : ''}</span>{permissionRisk(p.key) && <span className="block text-xs text-warning">{permissionRisk(p.key)}</span>}{!safe && <ShieldAlert className="size-3 text-muted-foreground"/>}
            </PermissionToggle>;
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