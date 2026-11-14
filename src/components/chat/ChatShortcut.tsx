import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { MessagesSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { chatUnreadTotal } from '@/lib/chat/api';
import { Button } from '@/components/ui/button';

export function ChatUnreadBadge(){
  const uid=useAuth(s=>s.currentUserId);
  const active=useAuth(s=>s.users.some(u=>u.id===s.currentUserId && u.status==='Đang hoạt động'));
  const unread=useQuery({
    queryKey:['chat','unread',uid],
    queryFn:chatUnreadTotal,
    enabled:!!uid&&active,staleTime:30_000,refetchInterval:60_000,
    refetchOnWindowFocus:true,retry:1,
  });
  const count=unread.data||0;
  return count>0?<span aria-label={`${count} tin chưa đọc`} className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-semibold text-white">
    {count>99?'99+':count}
  </span>:null;
}

export function ChatShortcut(){
  return <Button variant="ghost" size="icon" asChild className="relative hidden shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:inline-flex" title="Sứ Việt Chat">
    <Link to="/community" search={{tab:'chat',thread:undefined}} aria-label="Mở Chat nội bộ">
      <MessagesSquare className="h-5 w-5"/>
      <ChatUnreadBadge/>
    </Link>
  </Button>;
}
