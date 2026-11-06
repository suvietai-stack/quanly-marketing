import { Button } from '@/components/ui/button';
import { DEADLINE_QUICK, type DeadlineQuick } from '@/lib/signals/deadlineFilters';

export function SignalDeadlineFilters({ value, counts, loading, error, onChange }: {
  value: DeadlineQuick | null;
  counts: { all: number; today: number; soon: number; overdue: number };
  loading: boolean;
  error?: string;
  onChange: (value: DeadlineQuick | null) => void;
}) {
  return <section className="min-w-0 space-y-2" aria-label="Hạn cập nhật diễn biến">
    <h2 className="text-xs font-medium text-muted-foreground">Hạn cập nhật diễn biến</h2>
    <div className="flex min-w-0 max-w-full gap-1.5 overflow-x-auto pb-1">
      {DEADLINE_QUICK.map(({ key, label }) => <Button key={key ?? 'all'} size="sm"
        variant={value === key ? 'default' : 'outline'} aria-pressed={value === key}
        className={`h-10 shrink-0 whitespace-nowrap rounded-full ${key === 'overdue' && value !== key ? 'border-destructive/30 text-destructive' : ''}`}
        onClick={() => onChange(value === key ? null : key)}>
        {label} <span className="ml-1 tabular-nums opacity-75">({key && (loading || error) ? '—' : counts[key ?? 'all']})</span>
      </Button>)}
    </div>
    {error && <p role="alert" className="text-xs text-destructive">Không tải được hạn cập nhật: {error}</p>}
  </section>;
}