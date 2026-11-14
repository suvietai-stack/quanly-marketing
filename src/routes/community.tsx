import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { MessageCircleHeart, MessagesSquare, Newspaper } from 'lucide-react';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { chatUnreadTotal } from '@/lib/chat/api';
import { useCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/community')({
  validateSearch: (search:Record<string,unknown>) => ({
    tab: search.tab==='chat' ? 'chat' as const : 'feed' as const,
    thread: typeof search.thread==='string' && /^[0-9a-f-]{36}$/i.test(search.thread) ? search.thread : undefined,
  }),
  head: () => ({ meta: [
    { title: 'Cộng đồng & Tin nhắn nội bộ — Base Sứ Việt' },
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'description', content: 'Bảng tin và trò chuyện dành riêng cho nhân viên Sứ Việt.' },
  ] }),
  component: CommunityWorkspace,
});

function CommunityWorkspace(){
  const {user}=useCurrentUser();
  const uid=user?.id||'';
  const {tab,thread}=Route.useSearch();
  const navigate=useNavigate({from:Route.fullPath});
  const unread=useQuery({
    queryKey:['chat','unread',uid],
    queryFn:chatUnreadTotal,
    enabled:!!uid&&user?.status==='Đang hoạt động',
    staleTime:20_000,refetchInterval:60_000,retry:1,
  });
  const change=(next:'feed'|'chat')=>void navigate({
    to:'/community',search:{tab:next,thread:undefined},replace:true,
  });
  return <div className="mx-auto w-full max-w-6xl space-y-4 pb-8">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300"><MessageCircleHeart className="h-4 w-4"/> Nội bộ Sứ Việt</div>
        <h1 className="mt-1 text-xl font-bold md:text-2xl">Cộng đồng & Tin nhắn</h1>
      </div>
    </div>
    <nav aria-label="Chọn bảng tin hoặc tin nhắn" className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1.5">
      <Button type="button" variant={tab==='feed'?'default':'ghost'} aria-pressed={tab==='feed'} onClick={()=>change('feed')} className={`min-h-12 rounded-xl text-sm ${tab==='feed'?'bg-blue-700 text-white hover:bg-blue-800':'bg-card text-slate-800 dark:text-white'}`}><Newspaper className="h-4 w-4"/>Bảng tin</Button>
      <Button type="button" variant={tab==='chat'?'default':'ghost'} aria-pressed={tab==='chat'} onClick={()=>change('chat')} className={`min-h-12 rounded-xl text-sm ${tab==='chat'?'bg-blue-700 text-white hover:bg-blue-800':'bg-card text-slate-800 dark:text-white'}`}>
        <MessagesSquare className="h-4 w-4"/>Tin nhắn
        {!!unread.data && unread.data>0 && <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{unread.data>99?'99+':unread.data}</span>}
      </Button>
    </nav>
    {tab==='feed'?<CommunityFeed/>:<ChatPanel initialThreadId={thread} onThreadChange={id=>void navigate({to:'/community',search:{tab:'chat',thread:id},replace:true})}/>}
  </div>;
}
