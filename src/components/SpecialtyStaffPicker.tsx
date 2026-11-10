import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderBySpecialty, type PersonLite, type SpecialtyCandidate } from '@/lib/marketingSpecialties';

/**
 * Shared assignment picker: lists staff with the matching specialty first
 * (unit/title shown for context), then all other active staff. It only
 * suggests — the person assigning always decides. Values stay as display
 * names for compatibility with existing workflow records.
 */
export function SpecialtyStaffPicker({
  specialty,
  value,
  onChange,
  people,
  placeholder = '—',
}: {
  specialty: string;
  value: string | undefined;
  onChange: (v?: string) => void;
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
  const candInfo = (name: string) => candidates.find(c => c.name === name);
  return (
    <div className="space-y-1">
      <Select value={value || '_'} onValueChange={(v) => onChange(v === '_' ? undefined : v)}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_">{placeholder}</SelectItem>
          {matched.length > 0 && (
            <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chuyên môn phù hợp</div>
          )}
          {matched.map((p) => {
            const info = candInfo(p.name);
            const ctx = [info?.unit_name, info?.title_name].filter(Boolean).join(' · ');
            return <SelectItem key={p.id} value={p.name}>{p.name}{ctx ? ` (${ctx})` : ''}</SelectItem>;
          })}
          {matched.length > 0 && rest.length > 0 && (
            <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nhân sự khác</div>
          )}
          {rest.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {!q.isPending && !q.error && matched.length === 0 && (
        <p className="text-[11px] text-muted-foreground">Chưa có nhân sự phù hợp — bạn vẫn có thể chọn người khác.</p>
      )}
    </div>
  );
}
