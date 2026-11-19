import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Base initial bundle boundaries', () => {
  it('does not eagerly import the entire Signals workspace at application root', () => {
    const root = readFileSync('src/routes/__root.tsx','utf8');
    const guard = readFileSync('src/components/signals/SignalCacheGuard.tsx','utf8');
    expect(root).toContain('@/components/signals/SignalCacheGuard');
    expect(root).not.toContain('components/signals/SignalsUi');
    expect(guard).not.toContain('SignalsUi');
    expect(guard).not.toMatch(/SignalEnrichment|SignalsReport|signal_list_page/);
  });
  it('loads chat threads only after opening the chat drawer', () => {
    const shell = readFileSync('src/components/AppShell.tsx','utf8');
    expect(shell).toMatch(/lazy\(\(\)\s*=>\s*import\(['"]@\/components\/chat\/ChatPanel['"]\)/);
    expect(shell).toContain('chatOpen && user');
  });
  it('does not block navigation on optional AI, Zalo and rewards modules', () => {
    const shell = readFileSync('src/components/AppShell.tsx','utf8');
    for (const name of ['ChipiAssistant','ZaloInteractionReminder','RewardPopup']) {
      expect(shell).toContain(`import('@/components/${name === 'RewardPopup' ? 'sao/' : ''}${name}')`);
      expect(shell).not.toMatch(new RegExp(`import \\{ ${name} \\} from`));
    }
    expect(shell).toContain('backgroundReadyFor === user.id');
    expect(shell).toContain('1_200');
    expect(shell).toContain("document.visibilityState === 'visible'");
  });
  it('loads notification settings and Excel only when requested', () => {
    const shell = readFileSync('src/components/AppShell.tsx', 'utf8');
    const bell = readFileSync('src/components/NotificationBell.tsx', 'utf8');
    const report = readFileSync('src/routes/order-quotes.report.tsx', 'utf8');
    expect(shell).toContain('from "@/components/NotificationBell"');
    expect(bell).not.toMatch(/from ["']@\/components\/(ZaloUi|PushSettings)["']/);
    expect(bell).toContain('import("@/components/PushSettings")');
    expect(bell).toContain('import("@/components/ZaloUi")');
    expect(report).not.toMatch(/from ["']xlsx["']/);
    expect(report).toContain('await import("xlsx")');
  });
  it('keeps session-token polling and employee presence independent', () => {
    const auth = readFileSync('src/components/AuthGate.tsx','utf8');
    const signal = readFileSync('src/components/signals/SignalsUi.tsx','utf8');
    expect(auth).toContain('shouldTouchPresence');
    expect(auth).not.toContain('last = 0; touch()');
    expect(signal).toContain('SIGNAL_TOKEN_POLL_INTERVAL_MS');
    expect(signal).toContain('refetchIntervalInBackground:false');
  });
});
