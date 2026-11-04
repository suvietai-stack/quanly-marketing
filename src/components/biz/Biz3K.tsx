import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListChecks, Settings2, Target, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { k3SettingsQuery } from '@/lib/biz/k3Queries';
import { cn } from '@/lib/utils';
import { Biz3KMyDay } from './Biz3KMyDay';
import { Biz3KManage } from './Biz3KManage';
import { Biz3KSettings } from './Biz3KSettings';
import { Biz3KPeriod } from './Biz3KPeriod';
import { Biz3KGoals } from './Biz3KGoals';
import { Button } from '@/components/ui/button';

type Section = 'mine' | 'team' | 'settings';
type Mode = 'day' | 'week' | 'month' | 'quarter';
type TeamView = 'members' | 'goals';

const MODE_LABEL: Record<Mode, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng', quarter: 'Quý' };

export function Biz3K() {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const { data: settings, isLoading, error, refetch } = useQuery({ ...k3SettingsQuery(uid), enabled: !!uid });
  const [section, setSection] = useState<Section>('mine');
  const [mode, setMode] = useState<Mode>('day');
  const [date, setDate] = useState<string | null>(null);
  const [teamView, setTeamView] = useState<TeamView>('members');

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
    { key: 'team', label: '3K Nhóm/Phòng Ban', icon: Users, show: settings.can_view_scope },
    { key: 'settings', label: 'Cài đặt 3K', icon: Settings2, show: settings.can_settings },
  ];
  const visible = tabs.filter((t) => t.show);
  const active = visible.some((t) => t.key === section) ? section : (visible[0]?.key ?? 'mine');

  return (
    <div className="space-y-4">
      {visible.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {visible.map((t) => (
            <Button variant="ghost"
              key={t.key}
              type="button"
              onClick={() => setSection(t.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active === t.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Button>
          ))}
        </div>
      )}
      {!settings.enabled && active === 'mine' && (
        <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Module 3K chưa được kích hoạt{settings.effective_from ? ` (áp dụng từ ${settings.effective_from})` : ''}. Vui lòng liên hệ quản trị viên.
        </div>
      )}

      {active === 'mine' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-primary" />Mục tiêu KG của tôi</div>
            <Biz3KGoals settings={settings} variant="personal" />
          </section>
          <section className="space-y-3 border-t border-border pt-4">
            <div className="flex gap-1 border-b border-border pb-3">
              {(['day', 'week', 'month', 'quarter'] as const).map((v) => (
                <Button key={v} variant={mode === v ? 'default' : 'ghost'} size="sm" onClick={() => setMode(v)}>{MODE_LABEL[v]}</Button>
              ))}
            </div>
            {mode === 'day' && <Biz3KMyDay settings={settings} selectedDate={date ?? settings.today} onDateChange={setDate} />}
            {mode !== 'day' && <Biz3KPeriod settings={settings} type={mode} date={date ?? settings.today} onDateChange={setDate} manage={false} />}
          </section>
        </div>
      )}

      {active === 'team' && (
        <div className="space-y-4">
          <div className="flex gap-1 border-b border-border pb-3">
            <Button variant={teamView === 'members' ? 'default' : 'ghost'} size="sm" onClick={() => setTeamView('members')}>Theo nhân viên</Button>
            <Button variant={teamView === 'goals' ? 'default' : 'ghost'} size="sm" onClick={() => setTeamView('goals')}>Theo KG</Button>
          </div>
          {teamView === 'goals' && <Biz3KGoals settings={settings} variant="scope" />}
          {teamView === 'members' && (
            <div className="space-y-3">
              <div className="flex gap-1 border-b border-border pb-3">
                {(['day', 'week', 'month', 'quarter'] as const).map((v) => (
                  <Button key={v} variant={mode === v ? 'default' : 'ghost'} size="sm" onClick={() => setMode(v)}>{MODE_LABEL[v]}</Button>
                ))}
              </div>
              {mode === 'day' && <Biz3KManage settings={settings} selectedDate={date ?? settings.today} onDateChange={setDate} />}
              {mode !== 'day' && <Biz3KPeriod settings={settings} type={mode} date={date ?? settings.today} onDateChange={setDate} manage />}
            </div>
          )}
        </div>
      )}

      {active === 'settings' && <Biz3KSettings settings={settings} />}
    </div>
  );
}
