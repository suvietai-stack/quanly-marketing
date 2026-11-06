import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUp, ArrowDown, ChevronRight, MoreHorizontal, Pin, PinOff, Search, X, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { allowedPins, launcherApps, movePin, pinStorageKey, searchLauncher } from '@/lib/launcher';
import type { NavGroup, NavItem } from '@/lib/navigation';

const tones: Record<string, string> = {
  'Điều hành': 'launcher-tone-primary', 'Kinh doanh': 'launcher-tone-success', 'Showroom': 'launcher-tone-muted',
  'Marketing': 'launcher-tone-info', 'Thiết Kế': 'launcher-tone-design', 'Mua Hàng & Giao Vận': 'launcher-tone-primary',
  'Kế Toán & Tài Chính': 'launcher-tone-success', 'Hành Chính & Nhân Sự': 'launcher-tone-info', 'Sao Sứ Việt': 'launcher-tone-reward', 'Hệ thống': 'launcher-tone-muted',
};
export function MobileLauncher({ groups, userId, area }: { groups: NavGroup[]; userId: string; area?: string }) {
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<{ uid: string; pins: string[] }>();
  const [showAll, setShowAll] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const pins = allowedPins(saved?.uid === userId ? saved.pins : [], groups);
  const signature = launcherApps(groups).map(i => i.to).join('|');
  useEffect(() => {
    let value: unknown = [];
    try { value = JSON.parse(localStorage.getItem(pinStorageKey(userId)) ?? '[]'); } catch { /* malformed preferences are ignored */ }
    setSaved({ uid: userId, pins: allowedPins(value, groups) });
    setQuery('');
  }, [userId]);
  useEffect(() => {
    if (saved?.uid !== userId) return;
    const clean = allowedPins(saved.pins, groups);
    try { localStorage.setItem(pinStorageKey(userId), JSON.stringify(clean)); setStorageError(false); }
    catch { setStorageError(true); }
    if (clean.join('|') !== saved.pins.join('|')) setSaved({ uid: userId, pins: clean });
  }, [saved, userId, signature]);
  useEffect(() => { setQuery(''); }, [area]);
  const update = (next: string[]) => setSaved({ uid: userId, pins: allowedPins(next, groups) });
  const toggle = (path: string) => update(pins.includes(path) ? pins.filter(p => p !== path) : [...pins, path]);
  const apps = launcherApps(groups);
  const group = groups.find(g => g.label === area);
  const results = searchLauncher(groups, query);
  const tile = (item: NavItem, quick = false) => {
    const parent = groups.find(g => g.items.some(i => i.to === item.to));
    const Icon = item.icon;
    const pinned = pins.includes(item.to);
    return <div key={item.to || item.label} className="launcher-app relative min-w-0">
      <Button asChild variant="ghost" className="h-full min-h-28 w-full flex-col justify-start gap-2 whitespace-normal rounded-lg px-1 pb-2 pt-3 text-center">
        {item.comingSoon ? <span aria-disabled="true"><span className="launcher-icon launcher-tone-muted"><Icon /></span><span className="block text-xs mt-3 leading-relaxed">{item.label}</span><span className="block text-[10px] text-muted-foreground mt-1">Sắp ra mắt</span></span> :
          <Link to={item.to} search={item.to === '/' ? { view: 'dashboard' } : {}}><span className={`launcher-icon ${tones[parent?.label ?? ''] ?? 'launcher-tone-primary'}`}><Icon /></span><span className="text-xs leading-relaxed font-medium break-words">{item.label}</span></Link>}
      </Button>
      {!item.comingSoon && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="absolute -right-1 -top-1 h-11 w-11" aria-label={`Tùy chọn ${item.label}`}><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toggle(item.to)}>{pinned ? <PinOff /> : <Pin />}{pinned ? 'Bỏ ghim' : 'Ghim trang chủ'}</DropdownMenuItem>
        {quick && <><DropdownMenuItem disabled={pins.indexOf(item.to) === 0} onClick={() => update(movePin(pins, item.to, -1))}><ArrowUp />Đưa lên trước</DropdownMenuItem><DropdownMenuItem disabled={pins.indexOf(item.to) === pins.length - 1} onClick={() => update(movePin(pins, item.to, 1))}><ArrowDown />Đưa ra sau</DropdownMenuItem></>}
      </DropdownMenuContent></DropdownMenu>}
    </div>;
  };
  return <div className="mobile-launcher space-y-4" data-testid="mobile-launcher">
    <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm chức năng trong Base" placeholder="Tìm chức năng trong Base..." className="h-12 rounded-lg bg-card pl-10 pr-11 text-sm" value={query} onChange={e => setQuery(e.target.value)} />{query && <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-10 w-10" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm"><X /></Button>}</div>
    {storageError && <p role="status" className="text-xs text-muted-foreground">Chưa lưu được ghim trên thiết bị này.</p>}
    {query.trim() ? <section aria-label="Kết quả tìm kiếm"><h2 className="launcher-section-title">Kết quả tìm kiếm</h2>{results.length ? <div className="launcher-app-grid">{results.map(i => tile(i))}</div> : <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy chức năng.</p>}</section> : group ? <section aria-label={`Chức năng ${group.label}`}><div className="launcher-app-grid">{group.items.map(i => tile(i))}</div>{group.comingSoon && <p className="py-8 text-center text-sm text-muted-foreground">Sắp ra mắt</p>}</section> : <>
      <section aria-label="Truy cập nhanh"><div className="flex items-center justify-between mb-3"><h2 className="launcher-section-title mb-0">Truy cập nhanh</h2>{pins.length > 6 && <Button variant="ghost" size="sm" onClick={() => setShowAll(v => !v)}>{showAll ? 'Thu gọn' : 'Xem thêm'}</Button>}</div>{pins.length ? <div className="launcher-app-grid">{(showAll ? pins : pins.slice(0, 6)).map(path => apps.find(i => i.to === path)).filter((i): i is NavItem => !!i).map(i => tile(i, true))}</div> : <div className="flex items-center gap-3 border border-dashed rounded-lg p-4 text-muted-foreground"><Pin className="h-5 w-5 shrink-0" /><span className="text-sm">Chưa có chức năng ghim.</span></div>}</section>
      <section aria-label="Các khu vực của bạn"><h2 className="launcher-section-title">Các khu vực của bạn</h2><div className="grid grid-cols-2 gap-3">{groups.map(g => { const Icon = g.icon ?? LayoutGrid; return <Button key={g.label} asChild={!g.comingSoon} variant="outline" disabled={g.comingSoon} className="h-auto min-h-36 items-start justify-between flex-col gap-4 rounded-lg bg-card p-4 whitespace-normal text-left shadow-soft">
        {g.comingSoon ? <><span className={`launcher-icon ${tones[g.label]}`}><Icon /></span><span className="text-sm leading-relaxed">{g.label}<span className="block text-[10px] text-muted-foreground mt-1">Sắp ra mắt</span></span></> : <Link to="/" search={{ area: g.label }}><span className={`launcher-icon ${tones[g.label]}`}><Icon /></span><span className="flex w-full items-center justify-between gap-2"><span className="text-sm leading-relaxed font-semibold">{g.label}</span><ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" /></span></Link>}
      </Button>; })}</div></section>
    </>}
  </div>;
}