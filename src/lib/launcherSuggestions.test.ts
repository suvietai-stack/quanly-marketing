import { describe, expect, it } from 'vitest';
import { LayoutGrid } from 'lucide-react';
import { suggestedLauncherApps } from './launcher';
import type { NavGroup } from './navigation';
const group = (routes: string[]): NavGroup[] => [{ label: 'Test', items: routes.map(to => ({ to, label: to, icon: LayoutGrid })) }];
describe('Home suggestions respect visible navigation', () => {
  it('never introduces routes missing from the visible catalog', () => {
    expect(suggestedLauncherApps(group(['/leave', '/biz/3k'])).map(i => i.to)).toEqual(['/leave', '/biz/3k']);
    expect(suggestedLauncherApps([])).toEqual([]);
  });
  it('deduplicates destinations, omits dashboard and honors the limit', () => {
    expect(suggestedLauncherApps(group(['/', '/leave', '/leave', '/tasks']), 2).map(i => i.to)).toEqual(['/tasks', '/leave']);
    expect(suggestedLauncherApps(group(['/tasks']), 0)).toEqual([]);
  });
  it('excludes unavailable items without mutating navigation', () => {
    const groups = group(['/tasks', '/leave']);
    groups[0].items[0].comingSoon = true;
    const original = JSON.stringify(groups);
    expect(suggestedLauncherApps(groups).map(i => i.to)).toEqual(['/leave']);
    expect(JSON.stringify(groups)).toBe(original);
  });
});
