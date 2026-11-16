import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUp, ArrowDown, ArrowUpRight, Sparkles, Pin, PinOff, Search, X, LayoutGrid, SlidersHorizontal, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { allowedPins, launcherApps, movePin, pinStorageKey, reconcilePins, searchLauncher, suggestedLauncherApps, storedPins } from '@/lib/launcher';
import type { NavGroup, NavItem } from '@/lib/navigation';
import { launcherGreetingAt } from '@/lib/launcherGreeting';

const tones: Record<string, string> = {
  'Điều hành': 'launcher-tone-primary', 'Kinh doanh': 'launcher-tone-success', 'Showroom': 'launcher-tone-muted',
  'Marketing': 'launcher-tone-info', 'Thiết Kế': 'launcher-tone-design', 'Mua Hàng & Giao Vận': 'launcher-tone-primary',
  'Kế Toán & Tài Chính': 'launcher-tone-success', 'Hành Chính & Nhân Sự': 'launcher-tone-info', 'Sao Sứ Việt': 'launcher-tone-reward', 'Hệ thống': 'launcher-tone-muted',
};
export function MobileLauncher({ groups, userId, area, accessReady = true, name }: { groups: NavGroup[]; userId: string; area?: string; accessReady?: boolean; name?: string }) {
  const [query, setQuery] = useState('');
  const [localNow, setLocalNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setLocalNow(new Date());
    // Resolve the clock after mount so server/client hydration remains stable.
    update();
    const timer = window.setInterval(update, 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') update(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
  const greeting = localNow ? launcherGreetingAt(localNow, name, userId) : null;
  const [saved, setSaved] = useState<{ uid: string; pins: string[] }>();
  const [showAll, setShowAll] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [editing, setEditing] = useState<{ uid: string; pins: string[] }>();
  const pins = allowedPins(saved?.uid === userId ? saved.pins : [], groups);
  const signature = launcherApps(groups).map(i => i.to).join('|');
  useEffect(() => {
    let value: unknown = [];
    try { value = JSON.parse(localStorage.getItem(pinStorageKey(userId)) ?? '[]'); } catch { /* malformed preferences are ignored */ }
    setSaved({ uid: userId, pins: storedPins(value) });
    setQuery('');
  }, [userId]);
  useEffect(() => {
    if (saved?.uid !== userId || !accessReady) return;
    const clean = reconcilePins(saved.pins, groups, accessReady);
    try { localStorage.setItem(pinStorageKey(userId), JSON.stringify(clean)); setStorageError(false); }
    catch { setStorageError(true); }
    if (clean.join('|') !== saved.pins.join('|')) setSaved({ uid: userId, pins: clean });
  }, [saved, userId, signature, accessReady]);
  useEffect(() => { setQuery(''); }, [area]);
  const draft = allowedPins(editing?.uid === userId ? editing.pins : [], groups);
  const updateDraft = (next: string[]) => { if (accessReady) setEditing({ uid: userId, pins: allowedPins(next, groups) }); };
  const savePins = () => {
    if (editing?.uid !== userId || !accessReady) return;
    try {
      localStorage.setItem(pinStorageKey(userId), JSON.stringify(draft));
      setSaved({ uid: userId, pins: draft });
      setStorageError(false);
      setEditing(undefined);
    } catch { setStorageError(true); }
  };
  const apps = launcherApps(groups);
  const group = groups.find(g => g.label === area);
  const results = searchLauncher(groups, query);
  const quickApps = pins.length ? pins.map(path => apps.find(i => i.to === path)).filter((i): i is NavItem => !!i) : suggestedLauncherApps(groups);
  const tile = (item: NavItem) => {
    const parent = groups.find(g => g.items.some(i => i.to === item.to));
    const Icon = item.icon;
    return <div key={item.to || item.label} className="launcher-app relative min-w-0">
      <Button asChild variant="ghost" className="launcher-tile h-full min-h-32 w-full flex-col justify-start gap-2 whitespace-normal rounded-2xl px-2 pb-3 pt-3 text-center">
        {item.comingSoon ? <span aria-disabled="true"><span className="launcher-icon launcher-tone-muted"><Icon /></span><span className="block mt-3 text-sm leading-snug">{item.label}</span><span className="block text-[10px] text-muted-foreground mt-1">Sắp ra mắt</span></span> :
          <Link to={item.to} search={item.to === '/' ? { view: 'dashboard' } : {}}><span className={`launcher-icon ${tones[parent?.label ?? ''] ?? 'launcher-tone-primary'}`}><Icon /></span><span className="text-sm leading-snug font-medium break-words">{item.label}</span></Link>}
      </Button>
    </div>;
  };
  return <div className="mobile-launcher launcher-home space-y-5" data-testid="mobile-launcher">
    {!area && !query.trim() && <section className="launcher-welcome" data-period={greeting?.period ?? 'morning'} aria-label="Lời chào theo thời điểm trong ngày">
      <div className="launcher-welcome-content"><span className="launcher-eyebrow"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> {greeting?.eyebrow ?? 'KHÔNG GIAN LÀM VIỆC'}</span>
        <h2>{greeting?.title ?? `Xin chào${name?.trim() ? `, ${name.trim()}` : ''}!`}</h2><p>{greeting?.subtitle ?? 'Mọi công việc, trong một không gian.'}</p>
        {apps.some(item => item.to === '/') && <Link to="/" search={{ view: 'dashboard' }} className="launcher-dashboard-link">Xem tổng quan <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>}
      </div><span className="launcher-welcome-orbit" aria-hidden="true" />
    </section>}
    <div className="launcher-search relative"><Search className="absolute left-4 top-5 h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm chức năng trong Base" placeholder="Tìm chức năng trong Base..." className="h-14 rounded-2xl bg-card pl-11 pr-12 text-base" value={query} onChange={e => setQuery(e.target.value)} />{query && <Button variant="ghost" size="icon" className="absolute right-1 top-2 h-10 w-10" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm"><X /></Button>}</div>
    {storageError && <p role="status" className="text-xs text-muted-foreground">Chưa lưu được ghim trên thiết bị này.</p>}
    {query.trim() ? <section className="launcher-panel" aria-label="Kết quả tìm kiếm"><h2 className="launcher-section-title">Kết quả tìm kiếm</h2>{results.length ? <div className="launcher-app-grid">{results.map(i => tile(i))}</div> : <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy chức năng.</p>}</section> : group ? <section className="launcher-panel" aria-label={`Chức năng ${group.label}`}><h2 className="launcher-section-title">{group.label}</h2><div className="launcher-app-grid">{group.items.map(i => tile(i))}</div>{group.comingSoon && <p className="py-8 text-center text-sm text-muted-foreground">Sắp ra mắt</p>}</section> : <>
      <section className="launcher-panel" aria-label="Truy cập nhanh"><div className="flex items-center justify-between gap-2 mb-3"><div><h2 className="launcher-section-title mb-0">Truy cập nhanh</h2><p className="launcher-section-caption">{pins.length ? 'Các chức năng bạn đã ghim' : 'Gợi ý dành cho bạn'}</p></div><Button variant="ghost" size="sm" className="min-h-11 rounded-xl text-primary" disabled={saved?.uid !== userId || !accessReady} onClick={() => { setStorageError(false); setEditing({ uid: userId, pins: [...pins] }); }}><SlidersHorizontal className="h-4 w-4" />Tùy chỉnh</Button></div>{quickApps.length ? <><div className="launcher-app-grid">{(showAll ? quickApps : quickApps.slice(0, 6)).map(i => tile(i))}</div>{quickApps.length > 6 && <Button variant="ghost" size="sm" className="mt-2 min-h-11 w-full rounded-xl text-primary" onClick={() => setShowAll(v => !v)}>{showAll ? 'Thu gọn' : 'Xem thêm'}</Button>}</> : <div className="flex items-center gap-3 border border-dashed rounded-2xl p-4 text-muted-foreground"><Pin className="h-5 w-5 shrink-0" /><span className="text-sm">{accessReady ? 'Chưa có chức năng ghim.' : 'Đang tải truy cập nhanh…'}</span></div>}</section>
      <section aria-label="Các khu vực của bạn"><div className="mb-4"><h2 className="launcher-section-title mb-1">Khám phá Base</h2><p className="launcher-section-caption">Mọi công việc, trong một không gian</p></div><div className="grid grid-cols-2 gap-3">{groups.map(g => { const Icon = g.icon ?? LayoutGrid; return <Button key={g.label} asChild={!g.comingSoon} variant="outline" disabled={g.comingSoon} className={`launcher-area ${tones[g.label] ?? 'launcher-tone-primary'} h-auto min-h-40 min-w-0 items-start justify-between flex-col gap-4 rounded-3xl bg-card p-4 whitespace-normal text-left shadow-soft`}>
        {g.comingSoon ? <><span className={`launcher-icon ${tones[g.label]}`}><Icon /></span><span className="text-sm leading-relaxed">{g.label}<span className="block text-[10px] text-muted-foreground mt-1">Sắp ra mắt</span></span></> : <Link to="/" search={{ area: g.label }}><span className={`launcher-icon ${tones[g.label]}`}><Icon /></span><span className="w-full min-w-0"><span className="block text-sm leading-relaxed font-semibold break-words">{g.label}</span><span className="mt-1 flex items-center justify-between text-xs text-muted-foreground">{g.items.filter(i => !i.comingSoon && !!i.to).length} chức năng<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></span></span></Link>}
      </Button>; })}</div></section>
    </>}
    <Dialog open={editing?.uid === userId} onOpenChange={open => { if (!open) setEditing(undefined); }}>
      <DialogContent aria-describedby={undefined} className="launcher-customize w-[calc(100%-2rem)] min-w-0 max-h-[85dvh] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] rounded-3xl p-4">
        <DialogHeader className="pr-7 text-left"><DialogTitle className="tracking-normal">Tùy chỉnh truy cập nhanh</DialogTitle></DialogHeader>
        <div className="min-h-0 overflow-y-auto space-y-5">
          <section aria-label="Ứng dụng đã ghim"><h3 className="mb-2 text-sm font-semibold">Đã ghim ({draft.length})</h3>
            {draft.length ? <ol className="divide-y">{draft.map((path, index) => {
              const item = apps.find(i => i.to === path);
              if (!item) return null;
              const Icon = item.icon;
              return <li key={path} className="flex items-center gap-2 py-2"><Icon className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0 flex-1 break-words text-sm">{item.label}</span><div className="flex shrink-0">
                <Button variant="ghost" size="icon" className="h-11 w-11" title={`Đưa ${item.label} lên trước`} aria-label={`Đưa ${item.label} lên trước`} disabled={index === 0} onClick={() => updateDraft(movePin(draft, path, -1))}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-11 w-11" title={`Đưa ${item.label} ra sau`} aria-label={`Đưa ${item.label} ra sau`} disabled={index === draft.length - 1} onClick={() => updateDraft(movePin(draft, path, 1))}><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-11 w-11" title={`Bỏ ghim ${item.label}`} aria-label={`Bỏ ghim ${item.label}`} onClick={() => updateDraft(draft.filter(p => p !== path))}><PinOff className="h-4 w-4" /></Button>
              </div></li>;
            })}</ol> : <p className="text-sm text-muted-foreground">Chưa có chức năng ghim.</p>}
          </section>
          {groups.map(g => { const items = g.items.filter(i => !i.comingSoon && !!i.to); return items.length ? <section key={g.label} aria-label={`Chọn ứng dụng ${g.label}`}><h3 className="text-sm font-semibold mb-2">{g.label}</h3><div className="divide-y">{items.map(item => { const Icon = item.icon; return <label key={item.to} className="flex min-h-12 items-center gap-3 py-2 cursor-pointer"><Checkbox aria-label={`Ghim ${item.label}`} checked={draft.includes(item.to)} onCheckedChange={checked => updateDraft(checked === true ? [...draft, item.to] : draft.filter(p => p !== item.to))} /><Icon className="h-5 w-5 shrink-0 text-muted-foreground" /><span className="text-sm break-words">{item.label}</span></label>; })}</div></section> : null; })}
        </div>
        <DialogFooter className="gap-2 border-t pt-3">
          {storageError && <p role="alert" className="text-sm text-destructive">Chưa lưu được. Vui lòng thử lại.</p>}
          <Button variant="outline" onClick={() => setEditing(undefined)}>Hủy</Button><Button disabled={!accessReady} onClick={savePins}><Save className="h-4 w-4" />Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
