import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListChecks, Settings2, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { k3SettingsQuery } from '@/lib/biz/k3Queries';
import { cn } from '@/lib/utils';
import { Biz3KMyDay } from './Biz3KMyDay';
import { Biz3KManage } from './Biz3KManage';
import { Biz3KSettings } from './Biz3KSettings';

type Section = 'mine' | 'manage' | 'settings';

export function Biz3K() {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const { data: settings, isLoading, error, refetch } = useQuery({ ...k3SettingsQuery(uid), enabled: !!uid });
  const [section, setSection] = useState<Section>('mine');

  if (isLoading) return <p className="py-8 text-center text-sm text-muted-foreground">Đang tải cấu hình 3K…</p>;
  if (error || !settings) {
    return (
      <div className="py-8 text-center space-y-3">
        <p className="text-sm text-destructive">Không tải được cấu hình 3K.</p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>Thử lại</button>
      </div>
    );
  }

  const tabs: { key: Section; label: string; icon: typeof ListChecks; show: boolean }[] = [
    { key: 'mine', label: '3K của tôi', icon: ListChecks, show: settings.can_use },
    { key: 'manage', label: 'Trong phạm vi quản lý', icon: Users, show: settings.can_view_scope },
    { key: 'settings', label: 'Cài đặt 3K', icon: Settings2, show: settings.can_settings },
  ];
  const visible = tabs.filter((t) => t.show);
  const active = visible.some((t) => t.key === section) ? section : (visible[0]?.key ?? 'mine');

  return (
    <div className="space-y-4">
      {visible.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {visible.map((t) => (
            <button
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
            </button>
          ))}
        </div>
      )}
      {!settings.enabled && active === 'mine' && (
        <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Module 3K chưa được kích hoạt{settings.effective_from ? ` (áp dụng từ ${settings.effective_from})` : ''}. Vui lòng liên hệ quản trị viên.
        </div>
      )}
      {(settings.enabled || active !== 'mine') && (
        <>
          {active === 'mine' && <Biz3KMyDay settings={settings} />}
          {active === 'manage' && <Biz3KManage settings={settings} />}
          {active === 'settings' && <Biz3KSettings settings={settings} />}
        </>
      )}
    </div>
  );
}
