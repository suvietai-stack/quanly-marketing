import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, RefreshCw, Search, ClipboardCheck, Clock3 } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import {
  approvalCenterQuery, filterItems, sortTodo, sortRecent, sourceGroup, waitingText, vnd, dateText,
  parseApprovalUrl, groupLabel, type ApprovalGroup, type ApprovalItem,
} from '@/lib/approvals/api';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tab = 'todo' | 'mine' | 'done';

/** Hiển thị dần để danh sách dài (hàng trăm hồ sơ) không dựng cả nghìn thẻ/dòng một lúc. */
const PAGE_SIZE = 60;

const TAB_LABELS: Record<Tab, string> = { todo: 'Chờ tôi', mine: 'Đang trình', done: 'Đã xử lý' };

/** Nút mở hồ sơ: điều hướng nội bộ TanStack Router, không tải lại ứng dụng. */
function OpenButton({ item, tab, full }: { item: ApprovalItem; tab: Tab; full?: boolean }) {
  const navigate = useNavigate();
  const label = tab === 'todo' ? 'Mở hồ sơ để duyệt' : 'Xem chi tiết';
  const parsed = parseApprovalUrl(item.url);
  if (!parsed) {
    return (
      <Button size="sm" variant={tab === 'todo' ? 'default' : 'outline'} className={full ? 'approval-open-button w-full min-h-11 rounded-xl' : 'min-h-11'} asChild>
        <a href={item.url}>{label}</a>
      </Button>
    );
  }
  return (
    <Button
      size="sm"
      variant={tab === 'todo' ? 'default' : 'outline'}
      className={full ? 'approval-open-button w-full min-h-11 rounded-xl' : 'min-h-11'}
      onClick={() => navigate({ to: parsed.to as '/', search: parsed.search as never })}
    >
      {label}
    </Button>
  );
}

function ItemCard({ item, now, tab }: { item: ApprovalItem; now: string; tab: Tab }) {
  return (
    <article className={cn("approval-item-card rounded-2xl border bg-card p-4 space-y-3 shadow-soft", item.overdue && tab === "todo" && "border-destructive/30")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary break-words">{item.title}</p>
          <p className="mt-1 text-base font-semibold leading-6 break-words">{[item.requester, item.code].filter(Boolean).join(' · ')}</p>
        </div>
        {item.overdue && tab === 'todo' && <Badge variant="destructive" className="shrink-0">Quá hạn</Badge>}
      </div>
      {item.summary && <p className="text-sm text-muted-foreground line-clamp-3 break-words leading-6">{item.summary}</p>}
      {item.amount != null && <p className="approval-amount rounded-xl bg-primary/5 px-3 py-2 text-xl font-bold tabular-nums break-words">{vnd(item.amount)}</p>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {tab === 'done' ? (
          <>{item.action && <span className="font-medium text-foreground">{item.action}</span>}{item.acted_at && <span>{dateText(item.acted_at)}</span>}</>
        ) : (
          <>{item.step_label && <span>{item.step_label}</span>}{waitingText(item.waiting_since, now) && <span>Chờ {waitingText(item.waiting_since, now)}</span>}</>
        )}
      </div>
      <OpenButton item={item} tab={tab} full />
    </article>
  );
}

function ItemRow({ item, now, tab }: { item: ApprovalItem; now: string; tab: Tab }) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4 align-top">
        <p className="font-medium whitespace-nowrap">{item.title}</p>
        <p className="text-xs text-muted-foreground">{groupLabel(sourceGroup(item.source))}</p>
      </td>
      <td className="py-3 pr-4 align-top">
        <p className="break-words">{item.requester}</p>
        {item.code && <p className="text-xs text-muted-foreground">{item.code}</p>}
      </td>
      <td className="py-3 pr-4 align-top max-w-md">
        <p className="text-sm line-clamp-2 break-words">{item.summary}</p>
        {item.amount != null && <p className="text-sm font-semibold tabular-nums">{vnd(item.amount)}</p>}
      </td>
      <td className="py-3 pr-4 align-top whitespace-nowrap text-sm">
        {tab === 'done' ? (
          <>{item.action && <p className="font-medium">{item.action}</p>}{item.acted_at && <p className="text-xs text-muted-foreground">{dateText(item.acted_at)}</p>}</>
        ) : (
          <>{item.step_label && <p>{item.step_label}</p>}{waitingText(item.waiting_since, now) && <p className="text-xs text-muted-foreground">Chờ {waitingText(item.waiting_since, now)}</p>}</>
        )}
      </td>
      <td className="py-3 pr-4 align-top">
        {item.overdue && tab === 'todo' ? <Badge variant="destructive">Quá hạn</Badge> : tab === 'todo' ? <Badge variant="secondary">Chờ duyệt</Badge> : null}
      </td>
      <td className="py-3 align-top text-right">
        <OpenButton item={item} tab={tab} />
      </td>
    </tr>
  );
}

export function ApprovalCenter() {
  const { user, can } = useCurrentUser();
  // Only executives with cross-business visibility and HR approval capability
  // request the server-verified partial fallback. Other roles retain the full feed.
  const executiveFallback = can('leave.approve') && can('biz.view_all');
  const query = useQuery({ ...approvalCenterQuery(user?.id ?? '', executiveFallback), enabled: !!user?.id });
  const [tab, setTab] = useState<Tab>('todo');
  const [search, setSearch] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [group, setGroup] = useState<ApprovalGroup | 'all'>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const data = query.data;
  const now = data?.server_now ?? new Date().toISOString();
  const rawItems = useMemo(() => {
    if (!data) return [];
    const list = tab === 'todo' ? data.todo : tab === 'mine' ? data.mine : data.done;
    return tab === 'todo' ? sortTodo(list) : sortRecent(list, tab === 'mine' ? 'waiting_since' : 'acted_at');
  }, [data, tab]);
  const items = useMemo(() => filterItems(rawItems, search, group).filter(i => tab !== 'todo' || !overdueOnly || i.overdue), [rawItems, search, group, overdueOnly, tab]);
  useEffect(() => setLimit(PAGE_SIZE), [tab, search, group, overdueOnly]);
  const visible = useMemo(() => items.slice(0, limit), [items, limit]);
  const hasFilters = !!search.trim() || group !== 'all' || (tab === 'todo' && overdueOnly);
  const resetFilters = () => {setSearch('');setGroup('all');setOverdueOnly(false);};
  const chooseTab = (next: Tab) => {setTab(next);setGroup('all');setOverdueOnly(false);};
  const groups = useMemo(() => [...new Set(rawItems.map(i => sourceGroup(i.source)))], [rawItems]);
  const groupCount = (g: string) => rawItems.filter(i => sourceGroup(i.source) === g).length;
  const overdueCount = data?.todo.filter(i => i.overdue).length ?? 0;


  return (
    <div className="approval-center-mobile min-w-0 space-y-4 pb-24 md:pb-8">
      <div className="approval-center-heading flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Phê duyệt</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.todo.length} việc chờ xử lý${data.errors?.length ? ' từ nguồn đã tải' : ''}` : query.error ? 'Chưa tải được dữ liệu' : 'Đang tải…'}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Làm mới" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} />
        </Button>
      </div>

      {data && <section className="approval-overview rounded-3xl p-4 md:hidden" aria-label="Tổng quan phê duyệt">
        <p className="flex items-center gap-2 text-xs font-medium"><ClipboardCheck className="h-4 w-4" />TRUNG TÂM ĐIỀU HÀNH</p>
        <h2 className="mt-3 text-xl font-semibold">{data.todo.length ? 'Các hồ sơ đang chờ bạn' : data.errors?.length ? 'Kiểm tra các nguồn chưa tải' : 'Bạn đã xử lý hết việc chờ'}</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="approval-stat" onClick={() => {resetFilters();chooseTab('todo');}}><strong>{data.todo.length}</strong><span>Chờ xử lý</span></button>
          <button className="approval-stat" onClick={() => {resetFilters();chooseTab('todo');setOverdueOnly(true);}}><strong>{overdueCount}</strong><span>Quá hạn</span></button>
          <button className="approval-stat" onClick={() => {resetFilters();chooseTab('mine');}}><strong>{data.mine.length}</strong><span>Đang trình</span></button>
        </div>
        {data.errors?.length ? <p className="mt-3 text-xs leading-5">Số liệu chưa đầy đủ vì một số nguồn chưa tải được.</p> : <p className="mt-3 text-xs leading-5">Hồ sơ quá hạn và chờ lâu được ưu tiên hiển thị.</p>}
      </section>}
      <Tabs value={tab} onValueChange={(v) => chooseTab(v as Tab)}>
        <TabsList className="approval-main-tabs w-full md:w-auto grid grid-cols-3">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <TabsTrigger key={t} value={t}>
              {TAB_LABELS[t]}{data ? ` (${data[t].length})` : ''}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="approval-filter-panel flex flex-col gap-3 rounded-2xl border bg-card p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Tìm hồ sơ" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm người gửi, mã, nội dung…" className="h-11 rounded-xl pl-10 pr-3 text-base" />
        </div>
        <div className="approval-group-filters flex gap-1.5 overflow-x-auto pb-1">
          <Button size="sm" variant={group === 'all' ? 'default' : 'outline'} className="min-h-11 shrink-0 rounded-xl" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>Tất cả ({rawItems.length})</Button>
          {groups.map((g) => (
            <Button key={g} size="sm" variant={group === g ? 'default' : 'outline'} className="min-h-11 shrink-0 rounded-xl" aria-pressed={group === g} onClick={() => setGroup(g)}>{groupLabel(g)} ({groupCount(g)})</Button>
          ))}
        </div>
      </div>

      {data && <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">{items.length} hồ sơ hiển thị{tab === 'todo' ? ' · Ưu tiên quá hạn, chờ lâu' : ''}</p><div className="flex items-center gap-2">{tab === 'todo' && <Button size="sm" className="min-h-11 rounded-xl" variant={overdueOnly ? 'secondary' : 'outline'} aria-pressed={overdueOnly} onClick={() => setOverdueOnly(v => !v)}><Clock3 className="h-4 w-4" />Quá hạn ({overdueCount})</Button>}{hasFilters && <Button size="sm" variant="ghost" className="min-h-11" onClick={resetFilters}>Đặt lại</Button>}</div></div>}
      {!!data?.errors?.length && (
        <p role="alert" className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Một số nguồn chưa tải được ({data.errors.map((e) => groupLabel(sourceGroup(e.source))).filter((v, i, a) => a.indexOf(v) === i).join(', ')}).
          Danh sách bên dưới có thể chưa đầy đủ — bấm nút làm mới để thử lại.
        </p>
      )}
      {query.isPending && <p className="text-muted-foreground py-10 text-center">Đang tải hồ sơ…</p>}
      {query.error && (
        <p role="alert" className="flex items-center gap-2 text-destructive py-6">
          <AlertCircle className="h-4 w-4" /> Không tải được danh sách phê duyệt. {(query.error as Error).message}
        </p>
      )}
      {!query.isPending && !query.error && items.length === 0 && (
        <p className="text-muted-foreground py-10 text-center border rounded-lg">
          {hasFilters ? 'Không có hồ sơ phù hợp bộ lọc. Bấm Đặt lại để xem toàn bộ.' : data?.errors?.length ? 'Chưa tìm thấy hồ sơ trong các nguồn đã tải. Hãy thử làm mới.' : tab === 'todo' ? 'Không có việc cần phê duyệt.' : tab === 'mine' ? 'Bạn chưa có hồ sơ nào đang trình duyệt.' : 'Chưa có hồ sơ đã xử lý.'}
        </p>
      )}

      {/* Mobile: card gọn */}
      <div className="grid gap-3 md:hidden">
        {visible.map((i) => <ItemCard key={`${i.source}:${i.id}`} item={i} now={now} tab={tab} />)}
      </div>

      {/* Desktop: bảng gọn */}
      {items.length > 0 && (
        <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2.5 px-4 font-medium">Loại yêu cầu</th>
                <th className="py-2.5 px-4 font-medium">Người đề nghị</th>
                <th className="py-2.5 px-4 font-medium">Nội dung</th>
                <th className="py-2.5 px-4 font-medium">{tab === 'done' ? 'Kết quả' : 'Thời gian chờ'}</th>
                <th className="py-2.5 px-4 font-medium">Trạng thái</th>
                <th className="py-2.5 px-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {visible.map((i) => <ItemRow key={`${i.source}:${i.id}`} item={i} now={now} tab={tab} />)}
            </tbody>
          </table>
        </div>
      )}
      {items.length > visible.length && (
        <div className="flex justify-center">
          <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
            Xem thêm ({items.length - visible.length} hồ sơ)
          </Button>
        </div>
      )}
    </div>
  );
}

