import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Archive, ClipboardList, ListChecks, Settings2, Users, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { k3SettingsQuery } from '@/lib/biz/k3Queries';
import { cn } from '@/lib/utils';
// 3K critical workspaces are imported together with their route to avoid a
// second on-demand JS chunk request stalling mobile tab switches after publish.
// Expensive DATA remains on-demand inside the components (KPI, legacy and audit).
import { Biz3KMyDay } from './Biz3KMyDay';
import { Biz3KSettings } from './Biz3KSettings';
import { Biz3KMeasuredPeriod } from './Biz3KMeasuredPeriod';
import { Biz3KGoals } from './Biz3KGoals';
import { Biz3KKpiDay } from './Biz3KKpiDay';
import { Biz3KArchive } from './Biz3KArchive';

import { Button } from '@/components/ui/button';
import { K3DeleteProvider } from './Biz3KDelete';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Section = 'mine' | 'collab' | 'monitor' | 'settings' | 'archive';
type Mode = 'day' | 'week' | 'month' | 'quarter' | 'all';

const MODE_LABEL: Record<Mode, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng', quarter: 'Quý', all: 'Tất cả' };

export function Biz3K({ personalOnly = false }: { personalOnly?: boolean }) {
  return <K3DeleteProvider><Biz3KScreen personalOnly={personalOnly} /></K3DeleteProvider>;
}

function Biz3KScreen({ personalOnly }: { personalOnly: boolean }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const { data: settings, isLoading, error, refetch } = useQuery({ ...k3SettingsQuery(uid), enabled: !!uid });
  const [section, setSection] = useState<Section>('mine');
  const [mode, setMode] = useState<Mode>('day');
  const [date, setDate] = useState<string | null>(null);
  const [legacyDayOpen, setLegacyDayOpen] = useState(false);
  const chooseSection = (next: Section) => {
    if (next === 'monitor' && mode === 'all') setMode('day');
    if (next !== 'mine') setLegacyDayOpen(false);
    setSection(next);
  };

  if (isLoading) return <p className="py-8 text-center text-sm text-muted-foreground">Đang tải cấu hình 3K…</p>;
  if (error || !settings) {
    return (
      <div className="py-8 text-center space-y-3">
        <p className="text-sm text-destructive">Không tải được cấu hình 3K.</p>
        <Button variant="ghost" onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  const tabs: { key: Section; label: string; mobileLabel: string; icon: typeof ListChecks; show: boolean }[] = [
    { key: 'mine', label: '3K Của Tôi', mobileLabel: 'Của tôi', icon: ListChecks, show: settings.can_use },
    { key: 'collab', label: '3K phối hợp', mobileLabel: 'Phối hợp', icon: Users, show: !personalOnly && settings.can_use },
    { key: 'monitor', label: 'Theo Dõi Nhân Viên', mobileLabel: 'Nhân viên', icon: ClipboardList, show: !personalOnly && settings.can_view_scope },
  ];
  const visible = tabs.filter((t) => t.show);
  if (!settings.can_use && !settings.can_view_scope && !settings.can_settings) return <p className="py-8 text-center text-sm text-destructive">Bạn không có quyền sử dụng 3K.</p>;
  const active = section === 'archive' ? 'archive' : section === 'settings'
    ? (settings.can_settings ? 'settings' : (visible[0]?.key ?? 'mine'))
    : visible.some((t) => t.key === section) ? section : (visible[0]?.key ?? 'mine');

  return (
    <div className="k3-mobile space-y-4 min-w-0">
      <section className="k3-mobile-navigation md:hidden rounded-2xl border bg-card p-3 space-y-3">
        <div className="flex items-center justify-between gap-2"><div><h2 className="font-semibold">Không gian 3K</h2><p className="text-xs text-muted-foreground mt-1">Lập việc · Cập nhật · Tổng kết</p></div>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl" aria-label="Thao tác phụ 3K"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => chooseSection('archive')}><Archive />Thùng lưu trữ</DropdownMenuItem>{!personalOnly && settings.can_settings && <DropdownMenuItem onSelect={() => chooseSection('settings')}><Settings2 />Cài đặt 3K</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></div>
        <div className="k3-section-tabs grid gap-1.5" style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }} aria-label="Khu vực 3K">{visible.map(t => <Button key={t.key} variant={active === t.key ? 'default' : 'outline'} className={cn('min-h-12 min-w-0 flex-col gap-1 rounded-xl px-1.5 py-2 text-[11px] leading-tight', active !== t.key && (t.key === 'collab' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' : t.key === 'monitor' ? 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200' : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200'))} aria-label={t.label} aria-pressed={active === t.key} onClick={() => chooseSection(t.key)}><t.icon className="h-4 w-4 shrink-0" /><span>{t.mobileLabel}</span></Button>)}</div>
        {(active === 'archive' || active === 'settings') && <p className="text-sm font-medium">{active === 'archive' ? 'Thùng lưu trữ' : 'Cài đặt 3K'}</p>}
      </section>
      <div className="hidden md:flex flex-wrap items-center gap-2">
        <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:flex-1">
          {visible.map((t) => (
            <Button variant="ghost"
              key={t.key}
              type="button"
              onClick={() => chooseSection(t.key)}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active === t.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => chooseSection('archive')}><Archive className="mr-1 h-4 w-4" />Thùng lưu trữ</Button>
        {!personalOnly && settings.can_settings && (
          <Button variant="ghost" type="button" onClick={() => chooseSection('settings')}
            className={cn(
              'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              active === 'settings' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}>
            <Settings2 className="h-4 w-4" />
            Cài đặt 3K
          </Button>
        )}
      </div>
      {!settings.enabled && active === 'mine' && (
        <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Module 3K chưa được kích hoạt{settings.effective_from ? ` (áp dụng từ ${settings.effective_from})` : ''}. Vui lòng liên hệ quản trị viên.
        </div>
      )}


      {active === 'mine' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="k3-period-tabs flex min-w-0 gap-1 overflow-x-auto border-b border-border pb-2">
              {(['day', 'week', 'month', 'quarter', 'all'] as const).map((v) => (
                <Button key={v} variant={mode === v ? 'default' : 'ghost'} size="sm" className="shrink-0 whitespace-nowrap max-md:min-h-11" aria-pressed={mode === v} onClick={() => { if (v !== 'day') setLegacyDayOpen(false); setMode(v); }}>{MODE_LABEL[v]}</Button>
              ))}
            </div>
            {mode === 'day' && <><Biz3KKpiDay settings={settings} date={date ?? settings.today} today={settings.today} onDateChange={setDate} /><details className="border-t border-border pt-2" onToggle={e => setLegacyDayOpen(e.currentTarget.open)}><summary className="text-sm text-muted-foreground">Dữ liệu công việc cũ (chỉ xem khi cần)</summary>{legacyDayOpen && <div className="mt-3"><Biz3KMyDay settings={{ ...settings, enabled: false }} selectedDate={date ?? settings.today} onDateChange={setDate} /></div>}</details></>}
            {(mode === 'week' || mode === 'month' || mode === 'quarter') && <><Biz3KGoals settings={settings} variant="personal" compact /><Biz3KMeasuredPeriod type={mode} date={date ?? settings.today} onDateChange={setDate} /></>}
            {mode === 'all' && <Biz3KGoals settings={settings} variant="personal" />}
          </section>
        </div>
      )}

      {!personalOnly && active === 'collab' && <Biz3KGoals settings={settings} variant="collab" />}

      {!personalOnly && active === 'monitor' && (
        <div className="space-y-3">
          <div className="k3-period-tabs flex gap-1 overflow-x-auto border-b border-border pb-3">
            {(['day', 'week', 'month', 'quarter'] as const).map((v) => (
              <Button key={v} variant={mode === v ? 'default' : 'ghost'} size="sm" className="whitespace-nowrap" aria-pressed={mode === v} onClick={() => { if (v !== 'day') setLegacyDayOpen(false); setMode(v); }}>{MODE_LABEL[v]}</Button>
            ))}
          </div>
          {(mode === 'day' || mode === 'week' || mode === 'month' || mode === 'quarter') && <Biz3KMeasuredPeriod type={mode} date={date ?? settings.today} onDateChange={setDate} manage />}
        </div>
      )}

      {!personalOnly && active === 'settings' && <Biz3KSettings settings={settings} />}
      {active === 'archive' && <Biz3KArchive admin={!personalOnly && settings.can_settings} />}

    </div>
  );
}

