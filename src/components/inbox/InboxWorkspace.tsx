import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, Check, CheckCheck, CheckCircle2, Inbox, Info, MessageCircle, RefreshCw, Send, Settings2, ShieldCheck, UserRound, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { inboxAccessSave, inboxChange, inboxOverview, inboxRead, inboxSend } from '@/lib/inbox/inbox.functions';
import type { Conversation, InboxMessage, InboxStaff, InboxThread } from '@/lib/inbox/model';
import { safeAttachmentUrl } from '@/lib/inbox/model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
const ConnectButton = lazy(() => import('@/components/FbLeadsSettings').then(m => ({ default: m.ConnectButton })));
const FbLeadsSettings = lazy(() => import('@/components/FbLeadsSettings').then(m => ({ default: m.FbLeadsSettings })));
const date = (s: string) => new Date(s).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
const initials = (name: string) => name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toLocaleUpperCase('vi');
const stateLabel: Record<string,string> = { received: 'Đã nhận', sending: 'Đang gửi', accepted: 'Meta đã nhận', delivered: 'Đã giao', read: 'Đã xem', failed: 'Gửi thất bại', unknown: 'Chưa xác định kết quả gửi' };
type Filter = 'all' | 'unread' | 'reply' | 'resolved';
type Cursor = { before: string; beforeId: string } | undefined;

export function InboxWorkspace() {
  const { user } = useCurrentUser();
  if (!user || user.status !== 'Đang hoạt động') return <p role="alert">Vui lòng đăng nhập bằng tài khoản đang hoạt động.</p>;
  return <Workspace key={user.id} userId={user.id} />;
}
function Workspace({ userId }: { userId: string }) {
  const { can, isSuperAdmin } = useCurrentUser();
  const qc = useQueryClient();
  const overview = useServerFn(inboxOverview), read = useServerFn(inboxRead), change = useServerFn(inboxChange), send = useServerFn(inboxSend), accessSave = useServerFn(inboxAccessSave);
  const [pageId,setPageId] = useState('all');
  const [filter,setFilter] = useState<Filter>('all');
  const [selected,setSelected] = useState<string | null>(null);
  const [details,setDetails] = useState(false);
  const [connections,setConnections] = useState(false);
  const [managePage,setManagePage] = useState<string | null>(null);
  const [draft,setDraft] = useState('');
  const [busy,setBusy] = useState(false);
  const [pending,setPending] = useState<{ requestId: string; conversationId: string; text: string } | null>(null);
  const [live,setLive] = useState<'connecting'|'live'|'offline'>('connecting');
  const listRef = useRef<HTMLDivElement>(null);
  const active = true;
  const canConnect = isSuperAdmin || can('integration.facebook_leads');
  const baseKey = useMemo(() => ['inbox',userId] as const,[userId]);
  const ov = useQuery({ queryKey: [...baseKey,'overview'], queryFn: () => overview(), retry: false, staleTime: 30000, refetchInterval: active ? 30000 : false, refetchIntervalInBackground: false });
  const available = !!ov.data?.available && !!ov.data?.can_view;
  const reload = () => qc.invalidateQueries({ queryKey: baseKey });
  const list = useInfiniteQuery({
    queryKey: [...baseKey,'list',pageId,filter], initialPageParam: undefined as Cursor,
    queryFn: async ({ pageParam }) => await read({ data: { kind: 'list', pageId: pageId === 'all' ? undefined : pageId, filter, ...pageParam } }) as Conversation[],
    getNextPageParam: rows => rows.length === 50 ? { before: rows[rows.length-1].last_at, beforeId: rows[rows.length-1].id } : undefined,
    enabled: active && available, retry: false,
    refetchInterval: active && available ? 30000 : false, refetchIntervalInBackground: false,
  });
  const thread = useInfiniteQuery({
    queryKey: [...baseKey,'thread',selected], initialPageParam: undefined as Cursor,
    queryFn: async ({ pageParam }) => await read({ data: { kind: 'thread', conversationId: selected!, ...pageParam } }) as InboxThread,
    getNextPageParam: data => data.messages.length === 50 ? { before: data.messages[0].event_at, beforeId: data.messages[0].id } : undefined,
    enabled: active && available && !!selected, retry: false,
    refetchInterval: active && selected && available ? 30000 : false, refetchIntervalInBackground: false,
  });
  const current = thread.data?.pages[0];
  const messages = [...new Map((thread.data?.pages ?? []).flatMap(p => p.messages).map(m => [m.id,m])).values()].sort((a,b) => a.event_at.localeCompare(b.event_at) || a.id.localeCompare(b.id));
  const conversations = [...new Map((list.data?.pages ?? []).flat().map(c => [c.id,c])).values()];
  const staffPage = managePage ?? current?.conversation.page_id;
  const staff = useQuery({ queryKey: [...baseKey,'staff',staffPage], queryFn: async () => await read({ data: { kind: 'staff', pageId: staffPage! } }) as InboxStaff[], enabled: active && !!staffPage && (!!managePage || !!current?.can_assign), retry: false });
  // RLS filters every realtime row. No unscoped broadcast or service token reaches the browser.
  useEffect(() => {
    if (!active || !available) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let mounted = true;
    const update = () => { if (!timer) timer = setTimeout(() => { timer=undefined; if (mounted) void qc.invalidateQueries({ queryKey: baseKey }); },200); };
    const channel = supabase.channel(`inbox:${userId}:${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbox_conversations', ...(pageId !== 'all' ? { filter: `page_id=eq.${pageId}` } : {}) },update)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbox_page_access', filter: `user_id=eq.${userId}` },update);
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'inbox_page_capabilities', ...(pageId !== 'all' ? { filter: `page_id=eq.${pageId}` } : {}) },update);
    if (selected) channel.on('postgres_changes', { event: '*', schema: 'public', table: 'inbox_messages', filter: `conversation_id=eq.${selected}` },update);
    setLive('connecting');
    channel.subscribe(status => { if (!mounted) return; setLive(status === 'SUBSCRIBED' ? 'live' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED' ? 'offline' : 'connecting'); if (status === 'SUBSCRIBED') update(); });
    const wake = () => { if (document.visibilityState === 'visible') update(); };
    window.addEventListener('online',wake);document.addEventListener('visibilitychange',wake);
    return () => { mounted=false;if (timer) clearTimeout(timer);window.removeEventListener('online',wake);document.removeEventListener('visibilitychange',wake);void supabase.removeChannel(channel); };
  },[active,available,userId,pageId,selected,qc,baseKey]);
  // On revocation, clear details immediately when authoritative reads no longer authorize the Page.
  useEffect(() => { if (ov.data && !ov.data.can_view) { setSelected(null); setManagePage(null); } },[ov.data]);
  const lastIncoming = current?.conversation.last_incoming_at;
  const threadReady = !!current;
  const lastMessageId = messages.at(-1)?.id;
  useEffect(() => { if (!selected || !threadReady || thread.isError || !active) return; let live=true;
    change({ data: { conversationId: selected, action: 'read' } }).then(() => { if (live) void qc.invalidateQueries({ queryKey: [...baseKey,'list'] }); }).catch(() => {});
    return () => { live=false; };
  },[selected,lastIncoming,threadReady,active,thread.isError,change,qc,baseKey]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); },[selected,lastMessageId]);
  const select = (id: string) => { setSelected(id);setDetails(false);setDraft(''); };
  const mutate = async (action: 'assign'|'resolve'|'reopen', user?: string) => {
    if (!current || busy) return;setBusy(true);
    try { await change({ data: { conversationId: current.conversation.id, action, userId: user || null, version: current.conversation.version } }); await reload(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Chưa cập nhật được'); } finally { setBusy(false); }
  };
  const sendNow = async (existing = false) => {
    if (!current || busy) return;
    const request = existing ? pending : { requestId: crypto.randomUUID(), conversationId: current.conversation.id, text: draft.trim() };
    if (!request || !request.text) return;
    setPending(request);setBusy(true);
    try {
      const result = await send({ data: request });
      if (['accepted','delivered','read'].includes(result.state)) { setPending(null);setDraft(''); }
      else if (result.state === 'failed') { setPending(null);toast.error('Meta từ chối gửi. Kiểm tra kết nối Page và cửa sổ trả lời.'); }
      else toast.info('Chưa xác định kết quả gửi. Không gửi lại nội dung; hãy kiểm tra hội thoại.');
      await reload();
    } catch { toast.error('Chưa xác định yêu cầu đã được xử lý hay chưa. Bấm kiểm tra kết quả; hệ thống không tự gửi lại.'); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    if (!pending) return;
    const confirmed = messages.find(m => m.request_id === pending.requestId && ['accepted','delivered','read'].includes(m.state));
    if (confirmed) { setPending(null);setDraft(old => old.trim() === pending.text ? '' : old); }
  }, [pending,messages]);
  const pageName = (id: string) => ov.data?.pages.find(p => p.page_id === id)?.name ?? 'Facebook Page';
  const page = current ? ov.data?.pages.find(p => p.page_id === current.conversation.page_id) : undefined;
  const pageReady = !!page?.ready && !!page.checked_at && Date.now() - Date.parse(page.checked_at) < 86400000;
  const expired = current && (!current.window_open || Date.now() - thread.dataUpdatedAt + Date.parse(current.server_now) - Date.parse(current.conversation.last_incoming_at ?? '') >= 86400000);
  return <div className="min-w-0 w-full space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><div className="flex items-center gap-2"><div className="rounded-xl bg-primary/10 p-2.5 text-primary"><MessageCircle className="size-6" /></div><h1 className="text-xl sm:text-2xl font-semibold">Messenger Fanpage</h1></div><p className="mt-2 text-sm text-muted-foreground">Các Page cùng một nơi, mỗi cuộc trò chuyện đều có người theo sát.</p></div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Làm mới Messenger Fanpage" onClick={() => void reload()}><RefreshCw className={cn('size-4',ov.isFetching && 'animate-spin')} /></Button>
        {canConnect && <><Button variant="outline" onClick={() => setConnections(true)}><Settings2 className="mr-2 size-4" />Quản lý Page</Button><Suspense fallback={<Button disabled>Kết nối Page</Button>}><ConnectButton disabled={ov.isPending || ov.isError} messaging={ov.data?.available ?? false} /></Suspense></>}
      </div>
    </header>
    {ov.isPending ? <div aria-busy="true" className="grid gap-4 sm:grid-cols-[300px_1fr]"><Skeleton className="h-96" /><Skeleton className="h-96" /></div> : ov.isError ? <ErrorBox message="Chưa tải được Hộp thư. Kiểm tra kết nối và thử lại." onRetry={() => void ov.refetch()} /> : !ov.data?.available ? <Empty icon="setup" title="Hộp thư đang chờ kích hoạt" text="Khu vực Hộp thư đã sẵn sàng về giao diện. Phần dữ liệu và quyền truy cập cần được kích hoạt trước khi nhận tin nhắn thật." /> : !ov.data.can_view ? <Empty icon="setup" title="Chưa có quyền Hộp thư" text="Nhờ quản trị cấp quyền Hộp thư và phân các Page anh/chị phụ trách." /> : <>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">{live === 'live' ? <Wifi className="size-3.5 text-emerald-600" /> : <WifiOff className="size-3.5" />}{live === 'live' ? 'Đang nhận cập nhật trực tiếp' : live === 'connecting' ? 'Đang kết nối cập nhật trực tiếp…' : 'Kết nối trực tiếp gián đoạn · đang đối chiếu định kỳ'}</span><span>{ov.data.pages.length} Page được cấp quyền</span>
      </div>
      <div className="grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_260px]">
        <aside className={cn('min-w-0 border-r',selected && 'hidden lg:block')}>
          <div className="space-y-3 border-b p-4">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="inbox-page">Page phụ trách</label>
            <select id="inbox-page" className="h-11 w-full rounded-lg border bg-background px-3 text-sm" value={pageId} onChange={e => {setPageId(e.target.value);setSelected(null);}}><option value="all">Tất cả Page</option>{ov.data.pages.map(p => <option key={p.page_id} value={p.page_id}>{p.name}{!p.enabled ? ' · Đang tắt' : !p.ready ? ' · Cần kết nối lại' : ''}</option>)}</select>
            <div className="flex flex-wrap gap-1.5">{([['all','Đang mở'],['unread','Chưa đọc'],['reply','Cần trả lời'],['resolved','Đã đóng']] as const).map(([key,label]) => <Button key={key} size="sm" className="h-9 px-2.5 text-xs" variant={filter === key ? 'secondary' : 'ghost'} aria-pressed={filter === key} onClick={() => {setFilter(key);setSelected(null);}}>{label}</Button>)}</div>
          </div>
          <div className="min-h-[360px] max-h-[65dvh] overflow-y-auto lg:h-[580px]">
            {list.isPending ? <p role="status" className="p-5 text-sm text-muted-foreground">Đang tải hội thoại…</p> : list.isError ? <ErrorBox message="Không đọc được danh sách hội thoại." onRetry={() => void list.refetch()} /> : !conversations.length ? <div className="p-8 text-center"><Inbox className="mx-auto size-9 text-muted-foreground/50" /><p className="mt-3 text-sm font-medium">Chưa có hội thoại phù hợp</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Tin nhắn mới của Page đã bật nhận sẽ xuất hiện tại đây.</p></div> : conversations.map(c => <button key={c.id} onClick={() => select(c.id)} className={cn('flex w-full gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50',selected === c.id && 'bg-primary/5')}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(c.customer_name ?? 'Khách hàng')}</span>
              <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className={cn('truncate text-sm',c.unread ? 'font-bold' : 'font-medium')}>{c.customer_name ?? `Khách ${c.customer_id.slice(-6)}`}</span>{c.unread && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Chưa đọc" />}</span><span className="mt-1 block truncate text-xs text-primary/80">{pageName(c.page_id)}</span><span className="mt-1.5 block truncate text-sm text-muted-foreground">{c.last_text || 'Tệp đính kèm / tin nhắn'}</span><span className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground"><span>{date(c.last_at)}</span>{c.needs_reply && !c.resolved && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300">Cần trả lời</span>}</span></span>
            </button>)}
            {list.hasNextPage && <Button className="m-3" variant="outline" disabled={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()}>Tải thêm hội thoại</Button>}
          </div>
        </aside>
        <main className={cn('min-w-0 flex flex-col',!selected && 'hidden lg:flex')}>
          {!selected ? <Empty icon="chat" title="Chọn một cuộc trò chuyện" text="Tin nhắn và thông tin khách sẽ hiển thị ở đây. Chọn Page hoặc lọc các cuộc trò chuyện cần trả lời ở cột bên trái." /> : thread.isPending ? <div className="p-6"><Skeleton className="h-96" /></div> : thread.isError || !current ? <ErrorBox message="Không đọc được hội thoại hoặc quyền truy cập đã thay đổi." onRetry={() => void thread.refetch()} /> : <>
            <div className="flex items-center gap-2 border-b p-3 sm:p-4">
              <Button className="lg:hidden shrink-0" variant="ghost" size="icon" aria-label="Quay lại danh sách" onClick={() => setSelected(null)}><ArrowLeft className="size-5" /></Button>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold text-sm">{current.conversation.customer_name ?? `Khách ${current.conversation.customer_id.slice(-6)}`}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{pageName(current.conversation.page_id)}</p></div>
              {current.can_resolve && <Button variant="outline" size="sm" disabled={busy} onClick={() => void mutate(current.conversation.resolved ? 'reopen':'resolve')}><CheckCircle2 className="mr-1.5 size-4" />{current.conversation.resolved ? 'Mở lại':'Đóng'}</Button>}
              <Button variant="ghost" size="icon" aria-label="Thông tin khách hàng" onClick={() => setDetails(true)}><Info className="size-4" /></Button>
            </div>
            {thread.hasNextPage && <Button variant="ghost" disabled={thread.isFetchingNextPage} onClick={() => void thread.fetchNextPage()}>Xem tin nhắn trước</Button>}
            <div ref={listRef} className="flex h-[48dvh] min-h-[260px] flex-col gap-4 overflow-y-auto bg-muted/15 p-4 lg:h-[440px]" aria-label="Nội dung hội thoại">
              {messages.map(m => <Message key={m.id} message={m} />)}
              {!messages.length && <p className="m-auto text-sm text-muted-foreground">Hội thoại chưa có nội dung tin nhắn.</p>}
            </div>
            <div className="border-t p-3 sm:p-4 space-y-2">
              {(!current.can_send || expired || !page?.enabled || !pageReady) && <p className="text-xs leading-5 text-muted-foreground">{!current.can_send ? 'Anh/chị chưa được cấp quyền trả lời Page này.' : !page?.enabled ? 'Page đang tắt nhận tin nhắn.' : !pageReady ? 'Page cần kiểm tra quyền hoặc kết nối lại.' : 'Đã ngoài cửa sổ trả lời 24 giờ. Khách cần nhắn lại trước khi trả lời.'}</p>}
              {pending && <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5">Có một yêu cầu gửi đang chờ xác nhận. Không gửi lại nội dung để tránh trùng.<Button size="sm" variant="link" disabled={busy} onClick={() => void sendNow(true)}>Kiểm tra kết quả</Button></div>}
              <div className="flex items-end gap-2"><Textarea aria-label="Nội dung trả lời" placeholder="Nhập lời nhắn cho khách…" value={draft} maxLength={2000} disabled={busy || !!pending || !current.can_send || !!expired || !page?.enabled || !pageReady} onChange={e => setDraft(e.target.value)} className="min-h-20 resize-none" /><Button aria-label="Gửi tin nhắn" className="h-11 w-11 shrink-0" disabled={!draft.trim() || busy || !!pending || !current.can_send || !!expired || !page?.enabled || !pageReady} onClick={() => void sendNow()}><Send className="size-4" /></Button></div>
              <p className="text-[10px] text-muted-foreground">{draft.length}/2000 · Tin nhắn được gửi dưới tên Page.</p>
            </div>
          </>}
        </main>
        <aside className="hidden xl:block border-l p-5">
          {current && !thread.isError ? <CustomerDetails conversation={current.conversation} pageName={pageName(current.conversation.page_id)} staff={staff.data} canAssign={current.can_assign} busy={busy} onAssign={id => void mutate('assign',id)} /> : <div className="pt-12 text-center text-sm text-muted-foreground"><UserRound className="mx-auto mb-3 size-8 opacity-30" />Thông tin khách hàng</div>}
          {ov.data.can_manage && <div className="mt-8 border-t pt-4"><p className="text-xs font-medium text-muted-foreground mb-2">Quyền truy cập Page</p>{ov.data.pages.map(p => <Button key={p.page_id} variant="ghost" className="h-auto min-h-11 w-full justify-start text-left whitespace-normal" onClick={() => setManagePage(p.page_id)}><Settings2 className="mr-2 size-4 shrink-0" />{p.name}</Button>)}</div>}
        </aside>
      </div>
      {ov.data.can_manage && <Button variant="outline" className="xl:hidden" onClick={() => setManagePage(pageId === 'all' ? ov.data.pages[0]?.page_id ?? null : pageId)} disabled={!ov.data.pages.length}><ShieldCheck className="mr-2 size-4" />Phân quyền Page</Button>}
    </>}
    <Dialog open={connections} onOpenChange={setConnections}><DialogContent className="max-w-4xl max-h-[88dvh] overflow-y-auto"><DialogHeader><DialogTitle>Page Facebook dùng chung</DialogTitle></DialogHeader><Suspense fallback={<Skeleton className="h-64" />}><FbLeadsSettings /></Suspense></DialogContent></Dialog>
    <Dialog open={details} onOpenChange={setDetails}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Thông tin hội thoại</DialogTitle></DialogHeader>{current && !thread.isError && <CustomerDetails conversation={current.conversation} pageName={pageName(current.conversation.page_id)} staff={staff.data} canAssign={current.can_assign} busy={busy} onAssign={id => void mutate('assign',id)} />}</DialogContent></Dialog>
    <Dialog open={!!managePage} onOpenChange={open => !open && setManagePage(null)}><DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Quyền truy cập · {pageName(managePage ?? '')}</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Nhân sự cần cả quyền Hộp thư trong Role và quyền truy cập Page này.</p>{staff.isPending ? <p>Đang tải nhân sự…</p> : staff.isError ? <ErrorBox message="Không đọc được nhân sự Page." onRetry={() => void staff.refetch()} /> : staff.data?.map(s => <div key={s.id} className="flex items-center justify-between gap-2 border-b py-3"><span className="text-sm">{s.name}</span><Button size="sm" variant={s.access ? 'secondary':'outline'} disabled={busy} onClick={async () => { if (!managePage) return;setBusy(true);try { await accessSave({ data: { pageId: managePage,userId: s.id,enabled: !s.access } });await reload(); } catch { toast.error('Không cập nhật được quyền Page'); } finally { setBusy(false); } }}>{s.access ? 'Thu hồi':'Cấp quyền'}</Button></div>)}</DialogContent></Dialog>
  </div>;
}
function Message({ message: m }: { message: InboxMessage }) {
  const outgoing = m.direction === 'out';
  return <div className={cn('flex flex-col max-w-[88%] sm:max-w-[80%]',outgoing ? 'self-end items-end':'self-start items-start')}>
    <div className={cn('rounded-2xl p-3 text-sm leading-6',outgoing ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border bg-card')}>
      {m.text && <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.text}</p>}
      {m.attachments.map((a,i) => { const url=safeAttachmentUrl(a.url); if (!url) return <p key={i} className="text-xs italic">Tệp đính kèm không hỗ trợ hoặc liên kết đã hết hạn.</p>;return a.type === 'image' ? <a key={i} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="Ảnh khách gửi" className="max-h-64 max-w-full rounded-lg" loading="lazy" referrerPolicy="no-referrer" /></a> : <a key={i} className="block underline break-all" href={url} target="_blank" rel="noopener noreferrer">Mở tệp {a.type}</a>; })}
    </div>
    <p className={cn('mt-1 flex items-center gap-1 text-[10px] text-muted-foreground',m.state === 'failed' && 'text-destructive')}>{date(m.event_at)}{outgoing && <> · {m.state === 'read' ? <CheckCheck className="size-3" /> : m.state === 'accepted' || m.state === 'delivered' ? <Check className="size-3" /> : null}{stateLabel[m.state] ?? m.state}</>}</p>
    {m.failure && <p className="mt-1 text-xs text-destructive">{m.failure}</p>}
  </div>;
}
function CustomerDetails({ conversation: c, pageName, staff, canAssign, busy, onAssign }: { conversation: Conversation; pageName: string; staff?: InboxStaff[]; canAssign: boolean; busy: boolean; onAssign: (id: string) => void }) {
  const selectId = useId();
  return <div className="space-y-5"><div className="text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">{initials(c.customer_name ?? 'Khách hàng')}</div><h2 className="mt-3 font-semibold">{c.customer_name ?? `Khách ${c.customer_id.slice(-6)}`}</h2><p className="mt-1 text-xs text-muted-foreground">{pageName}</p></div><div className="space-y-3 text-sm"><p className="flex justify-between gap-2"><span className="text-muted-foreground">Trạng thái</span><span>{c.resolved ? 'Đã đóng':'Đang mở'}</span></p><p className="text-xs text-muted-foreground break-all">Mã khách theo Page: {c.customer_id}</p>{c.last_incoming_at && <p className="text-xs text-muted-foreground">Khách nhắn gần nhất: {date(c.last_incoming_at)}</p>}</div><div><label htmlFor={selectId} className="text-xs font-medium text-muted-foreground">Người phụ trách</label>{canAssign ? <select id={selectId} className="mt-2 h-11 w-full rounded-lg border bg-background px-2 text-sm" value={c.assignee_id ?? ''} disabled={busy || !staff} onChange={e => onAssign(e.target.value)}><option value="">Chưa phân công</option>{staff?.filter(s => s.access).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select> : <p className="mt-2 text-sm">{staff?.find(s => s.id === c.assignee_id)?.name ?? (c.assignee_id ? 'Đã phân công':'Chưa phân công')}</p>}</div></div>;
}
function Empty({ title, text, icon }: { title: string; text: string; icon: 'setup'|'chat' }) { return <section className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-2xl border-dashed p-7 text-center"><div className="rounded-3xl bg-primary/5 p-5 text-primary/50">{icon === 'setup' ? <ShieldCheck className="size-12" /> : <MessageCircle className="size-12" />}</div><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p></section>; }
function ErrorBox({ message,onRetry }: { message: string; onRetry: () => void }) { return <div role="alert" className="space-y-3 p-5 text-sm"><p className="text-destructive">{message}</p><Button variant="outline" size="sm" onClick={onRetry}>Thử lại</Button></div>; }
