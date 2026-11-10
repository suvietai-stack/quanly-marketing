import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import {
  approvalCenterQuery, filterItems, sortTodo, sourceGroup, waitingText, vnd, dateText,
  parseApprovalUrl, GROUP_LABELS, type ApprovalGroup, type ApprovalItem,
} from '@/lib/approvals/api';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tab = 'todo' | 'mine' | 'done';

const TAB_LABELS: Record<Tab, string> = { todo: 'Chờ tôi', mine: 'Đang trình', done: 'Đã xử lý' };

function ItemCard({ item, now, tab }: { item: ApprovalItem; now: string; tab: Tab }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{item.title}</p>
          <p className="font-medium break-words">{[item.requester, item.code].filter(Boolean).join(' · ')}</p>
        </div>
        {item.overdue && tab === 'todo' && <Badge variant="destructive" className="shrink-0">Quá hạn</Badge>}
      </div>
      {item.summary && <p className="text-sm text-muted-foreground line-clamp-2 break-words">{item.summary}</p>}
      {item.amount != null && <p className="text-lg font-semibold tabular-nums">{vnd(item.amount)}</p>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {tab === 'done' ? (
          <>{item.action && <span className="font-medium text-foreground">{item.action}</span>}{item.acted_at && <span>{dateText(item.acted_at)}</span>}</>
        ) : (
          <>{item.step_label && <span>{item.step_label}</span>}{item.waiting_since && <span>Chờ {waitingText(item.waiting_since, now)}</span>}</>
        )}
      </div>
      <Button size="sm" variant={tab === 'todo' ? 'default' : 'outline'} className="w-full sm:w-auto" asChild>
        <a href={item.url}>Xem & xử lý</a>
      </Button>
    </div>
  );
}

function ItemRow({ item, now, tab }: { item: ApprovalItem; now: string; tab: Tab }) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4 align-top">
        <p className="font-medium whitespace-nowrap">{item.title}</p>
        <p className="text-xs text-muted-foreground">{GROUP_LABELS[sourceGroup(item.source)]}</p>
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
          <>{item.action && <p className="font-medium">{item.action}</p>}<p className="text-xs text-muted-foreground">{dateText(item.acted_at)}</p></>
        ) : (
          <>{item.step_label && <p>{item.step_label}</p>}<p className="text-xs text-muted-foreground">Chờ {waitingText(item.waiting_since, now)}</p></>
        )}
      </td>
      <td className="py-3 pr-4 align-top">
        {item.overdue && tab === 'todo' ? <Badge variant="destructive">Quá hạn</Badge> : tab === 'todo' ? <Badge variant="secondary">Chờ duyệt</Badge> : null}
      </td>
      <td className="py-3 align-top text-right">
        <Button size="sm" variant={tab === 'todo' ? 'default' : 'outline'} asChild><a href={item.url}>Xem & xử lý</a></Button>
      </td>
    </tr>
  );
}

export function ApprovalCenter() {
  const { user } = useCurrentUser();
  const query = useQuery({ ...approvalCenterQuery(user?.id ?? ''), enabled: !!user?.id });
  const [tab, setTab] = useState<Tab>('todo');
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<ApprovalGroup | 'all'>('all');

  const data = query.data;
  const now = data?.server_now ?? new Date().toISOString();
  const rawItems = useMemo(() => {
    if (!data) return [];
    const list = tab === 'todo' ? data.todo : tab === 'mine' ? data.mine : data.done;
    return tab === 'todo' ? sortTodo(list) : list;
  }, [data, tab]);
  const items = useMemo(() => filterItems(rawItems, search, group), [rawItems, search, group]);
  const groups = useMemo(() => {
    if (!data) return [];
    const all = [...data.todo, ...data.mine, ...data.done];
    return [...new Set(all.map((i) => sourceGroup(i.source)))];
  }, [data]);

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Phê duyệt</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.todo.length} việc đang chờ bạn xử lý` : 'Đang tải…'}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Làm mới" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} />
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full sm:w-auto grid grid-cols-3">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <TabsTrigger key={t} value={t}>
              {TAB_LABELS[t]}{t === 'todo' && data && data.todo.length > 0 ? ` (${data.todo.length})` : ''}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Tìm hồ sơ" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm người gửi, mã, nội dung…" className="pl-8" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <Button size="sm" variant={group === 'all' ? 'default' : 'outline'} className="shrink-0" onClick={() => setGroup('all')}>Tất cả</Button>
          {groups.map((g) => (
            <Button key={g} size="sm" variant={group === g ? 'default' : 'outline'} className="shrink-0" onClick={() => setGroup(g)}>{GROUP_LABELS[g]}</Button>
          ))}
        </div>
      </div>

      {query.isPending && <p className="text-muted-foreground py-10 text-center">Đang tải hồ sơ…</p>}
      {query.error && (
        <p role="alert" className="flex items-center gap-2 text-destructive py-6">
          <AlertCircle className="h-4 w-4" /> Không tải được danh sách phê duyệt. {(query.error as Error).message}
        </p>
      )}
      {!query.isPending && !query.error && items.length === 0 && (
        <p className="text-muted-foreground py-10 text-center border rounded-lg">
          {tab === 'todo' ? 'Không có việc cần phê duyệt.' : tab === 'mine' ? 'Bạn chưa có hồ sơ nào đang trình duyệt.' : 'Chưa có hồ sơ đã xử lý.'}
        </p>
      )}

      {/* Mobile: card gọn */}
      <div className="grid gap-3 md:hidden">
        {items.map((i) => <ItemCard key={`${i.source}:${i.id}`} item={i} now={now} tab={tab} />)}
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
              {items.map((i) => <ItemRow key={`${i.source}:${i.id}`} item={i} now={now} tab={tab} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
