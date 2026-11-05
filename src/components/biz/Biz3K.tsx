import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Archive, ClipboardList, ListChecks, Settings2, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { k3SettingsQuery } from '@/lib/biz/k3Queries';
import { cn } from '@/lib/utils';
import { Biz3KMyDay } from './Biz3KMyDay';
import { Biz3KSettings } from './Biz3KSettings';
import { Biz3KMeasuredPeriod } from './Biz3KMeasuredPeriod';
import { Biz3KGoals } from './Biz3KGoals';
import { Biz3KKpiDay } from './Biz3KKpiDay';
import { Biz3KArchive } from './Biz3KArchive';
import { Button } from '@/components/ui/button';

type Section = 'mine' | 'collab' | 'monitor' | 'settings' | 'archive';
type Mode = 'day' | 'week' | 'month' | 'quarter' | 'all';

const MODE_LABEL: Record<Mode, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng', quarter: 'Quý', all: 'Tất cả' };

export function Biz3K() {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const { data: settings, isLoading, error, refetch } = useQuery({ ...k3SettingsQuery(uid), enabled: !!uid });
  const [section, setSection] = useState<Section>('mine');
  const [mode, setMode] = useState<Mode>('day');
  const [date, setDate] = useState<string | null>(null);

  if (isLoading) return <p className="py-8 text-center text-sm text-muted-foreground">Đang tải cấu hình 3K…</p>;
  if (error || !settings) {
    return (
      <div className="py-8 text-center space-y-3">
        <p className="text-sm text-destructive">Không tải được cấu hình 3K.</p>
        <Button variant="ghost" onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  const tabs: { key: Section; label: string; icon: typeof ListChecks; show: boolean }[] = [
    { key: 'mine', label: '3K Của Tôi', icon: ListChecks, show: settings.can_use },
    { key: 'collab', label: '3K Nhóm/Phòng Ban', icon: Users, show: settings.can_use || settings.can_view_scope },
    { key: 'monitor', label: 'Theo Dõi Nhân Viên', icon: ClipboardList, show: settings.can_view_scope },
  ];
  const visible = tabs.filter((t) => t.show);
  const active = section === 'archive' ? 'archive' : section === 'settings'
    ? (settings.can_settings ? 'settings' : (visible[0]?.key ?? 'mine'))
    : visible.some((t) => t.key === section) ? section : (visible[0]?.key ?? 'mine');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:flex-1">
          {visible.map((t) => (
            <Button variant="ghost"
              key={t.key}
              type="button"
              onClick={() => setSection(t.key)}
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
        <Button variant="outline" size="sm" onClick={() => setSection('archive')}><Archive className="mr-1 h-4 w-4" />Thùng lưu trữ</Button>
        {settings.can_settings && (
          <Button variant="ghost" type="button" onClick={() => setSection('settings')}
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
            <div className="flex gap-1 overflow-x-auto border-b border-border pb-3">
              {(['day', 'week', 'month', 'quarter', 'all'] as const).map((v) => (
                <Button key={v} variant={mode === v ? 'default' : 'ghost'} size="sm" className="whitespace-nowrap" onClick={() => setMode(v)}>{MODE_LABEL[v]}</Button>
              ))}
            </div>
            {mode === 'day' && <><Biz3KKpiDay settings={settings} date={date ?? settings.today} today={settings.today} onDateChange={setDate} /><details className="border-t border-border pt-3"><summary className="text-sm text-muted-foreground">Dữ liệu công việc ngày cũ</summary><div className="mt-3"><Biz3KMyDay settings={{ ...settings, enabled: false }} selectedDate={date ?? settings.today} onDateChange={setDate} /></div></details></>}
            {(mode === 'week' || mode === 'month' || mode === 'quarter') && <><Biz3KGoals settings={settings} variant="personal" compact /><Biz3KMeasuredPeriod type={mode} date={date ?? settings.today} onDateChange={setDate} /></>}
            {mode === 'all' && <Biz3KGoals settings={settings} variant="personal" />}
          </section>
        </div>
      )}

      {active === 'collab' && <Biz3KGoals settings={settings} variant="collab" />}

      {active === 'monitor' && (
        <div className="space-y-3">
          <div className="flex gap-1 overflow-x-auto border-b border-border pb-3">
            {(['day', 'week', 'month', 'quarter'] as const).map((v) => (
              <Button key={v} variant={mode === v ? 'default' : 'ghost'} size="sm" className="whitespace-nowrap" onClick={() => setMode(v)}>{MODE_LABEL[v]}</Button>
            ))}
          </div>
          {(mode === 'day' || mode === 'week' || mode === 'month' || mode === 'quarter') && <Biz3KMeasuredPeriod type={mode} date={date ?? settings.today} onDateChange={setDate} manage />}
        </div>
      )}

      {active === 'settings' && <Biz3KSettings settings={settings} />}
      {active === 'archive' && <Biz3KArchive admin={settings.can_settings} />}
    </div>
  );
}
