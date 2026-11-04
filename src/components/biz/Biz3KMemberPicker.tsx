import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { K3MemberSearchRow } from '@/lib/biz/k3Goals';
import { k3MemberSearchQuery } from '@/lib/biz/k3GoalQueries';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

/** Chọn thành viên tham gia KG nhóm (tìm theo tên nhân sự trong Cơ cấu tổ chức). */
export function MemberPicker({ selected, onChange, exclude }: { selected: K3MemberSearchRow[]; onChange: (rows: K3MemberSearchRow[]) => void; exclude?: string[] }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const [q, setQ] = useState('');
  const { data } = useQuery({ ...k3MemberSearchQuery(uid, q), enabled: !!uid });
  const options = (data ?? []).filter((r) => !selected.some((s) => s.id === r.id) && !exclude?.includes(r.id));
  return (
    <div className="space-y-2">
      <Input placeholder="Tìm theo tên nhân sự…" value={q} onChange={(e) => setQ(e.target.value)} />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <Badge key={s.id} variant="secondary" className="gap-1">
              {s.full_name}
              <button type="button" aria-label={`Bỏ ${s.full_name}`} onClick={() => onChange(selected.filter((x) => x.id !== s.id))}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      )}
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-1">
        {options.map((r) => (
          <button key={r.id} type="button" onClick={() => onChange([...selected, r])}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-secondary">
            <span>{r.full_name}</span>
            <span className="text-xs text-muted-foreground">{r.departments.join(' · ') || '—'}</span>
          </button>
        ))}
        {options.length === 0 && <p className="px-2 py-1 text-xs text-muted-foreground">Không có nhân sự phù hợp.</p>}
      </div>
    </div>
  );
}
