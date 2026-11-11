import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderBySpecialty, type PersonLite, type SpecialtyCandidate } from '@/lib/marketingSpecialties';

/**
 * Shared assignment picker: lists staff with the matching specialty first
 * (unit/title shown for context), then all other active staff. It only
 * suggests — the person assigning always decides.
 *
 * Định danh ổn định là ID tài khoản (valueId); tên hiển thị (value) chỉ phục vụ
 * giao diện và tương thích bản ghi cũ. Hai nhân sự trùng tên vẫn chọn riêng biệt.
 * Bản ghi cũ chỉ có tên: nếu tên khớp đúng một người thì tự gắn ID khi lưu lại;
 * nếu trùng tên hoặc không xác định, giữ trạng thái legacy để đối chiếu sau.
 */
export function SpecialtyStaffPicker({
  specialty,
  value,
  valueId,
  onChange,
  people,
  placeholder = '—',
}: {
  specialty: string;
  value: string | undefined;
  valueId?: string;
  onChange: (name?: string, id?: string) => void;
  people: PersonLite[];
  placeholder?: string;
}) {
  const q = useQuery({
    queryKey: ['mkt-candidates', specialty],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('mkt_specialty_candidates', { _specialty: specialty });
      if (error) throw error;
      return (data ?? []) as SpecialtyCandidate[];
    },
    staleTime: 60_000,
  });
  const candidates = q.data ?? [];
  const { matched, rest } = orderBySpecialty(people, candidates);
  // Đối chiếu theo ID ổn định — hai người trùng tên vẫn hiển thị và lọc chính xác.
  const candInfo = (id: string) => candidates.find(c => c.user_id === id);

  const byId = new Map(people.map((p) => [p.id, p]));
  const nameMatches = value ? people.filter((p) => p.name === value) : [];
  const selectedId =
    valueId && byId.has(valueId)
      ? valueId
      : !valueId && value && nameMatches.length === 1
        ? nameMatches[0].id
        : undefined;
  const legacyUnknown = !!value && !selectedId;

  return (
    <div className="space-y-1">
      <Select
        value={selectedId ?? (legacyUnknown ? '_legacy' : '_')}
        onValueChange={(v) => {
          if (v === '_legacy') return;
          if (v === '_') return onChange(undefined, undefined);
          const p = byId.get(v);
          if (p) onChange(p.name, p.id);
        }}
      >
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_">{placeholder}</SelectItem>
          {legacyUnknown && (
            <SelectItem value="_legacy">{value} (chưa định danh — chọn lại để gắn ID)</SelectItem>
          )}
          {matched.length > 0 && (
            <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chuyên môn phù hợp</div>
          )}
          {matched.map((p) => {
            const info = candInfo(p.id);
            const ctx = [info?.unit_name, info?.title_name].filter(Boolean).join(' · ');
            return <SelectItem key={p.id} value={p.id}>{p.name}{ctx ? ` (${ctx})` : ''}</SelectItem>;
          })}
          {matched.length > 0 && rest.length > 0 && (
            <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nhân sự khác</div>
          )}
          {rest.map((p) => {
            const info = candInfo(p.id);
            const ctx = [info?.unit_name, info?.title_name].filter(Boolean).join(' · ');
            return <SelectItem key={p.id} value={p.id}>{p.name}{ctx ? ` (${ctx})` : ''}</SelectItem>;
          })}
        </SelectContent>
      </Select>
      {!q.isPending && !q.error && matched.length === 0 && (
        <p className="text-[11px] text-muted-foreground">Chưa có nhân sự phù hợp — bạn vẫn có thể chọn người khác.</p>
      )}
    </div>
  );
}
