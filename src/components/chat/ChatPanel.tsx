import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/lib/auth';
import { listCommunityMemberNames } from '@/lib/community/api';
import {
  type ChatMessage,type ChatThread, CHAT_REFRESH_MS, chatInbox, chatMessages,
  chatParticipants,openDirectChat,createChatGroup,markChatRead,sendChatMessage,
  recallChatMessage,downloadChatAttachment,deleteChatAttachment,
  validateChatAttachment,
} from '@/lib/chat/api';
import {
  Users, UserRound, MessagesSquare, Search, Plus, ArrowLeft, Send, Paperclip,
  X, LoaderCircle, CheckCheck, FileText, Image, Download, RotateCcw, ShieldCheck,
  ChevronDown, HeartHandshake, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function errorText(e:unknown) {return e instanceof Error?e.message:'Không kết nối được, hãy thử lại.';}
function initials(s:string) {return s.trim().split(/\s+/).slice(-2).map(p=>p.charAt(0).toUpperCase()).join('')||'SV';}
function when(s?:string|null) {
  if(!s) return '';
  return new Date(s).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
}

function ChatAvatar({name,group=false}: {name:string;group?:boolean}) {
  return <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100 text-sm font-bold text-blue-800 dark:from-slate-700 dark:to-teal-900 dark:text-blue-100">
    {group?<Users className="h-5 w-5"/>:initials(name)}
  </div>;
}

function ChatAttachment({msg}: {msg:ChatMessage}) {
  const [url,setUrl]=useState('');
  const element=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(false);
  const path=msg.attachment_path;
  const image=!!msg.attachment_mime?.startsWith('image/');
  useEffect(()=>{
    if(!image)return;
    const node=element.current;
    if(!node || !('IntersectionObserver' in window)){setVisible(true);return;}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}
    },{rootMargin:'200px'});
    observer.observe(node);
    return ()=>observer.disconnect();
  },[image,path]);
  useEffect(()=>{
    if(!path||!image||!visible)return;
    let cancelled=false; let created='';
    setError(false);
    void downloadChatAttachment(path).then(blob=>{
      if(cancelled)return;
      created=URL.createObjectURL(blob);setUrl(created);
    }).catch(()=>{if(!cancelled)setError(true);});
    return()=>{cancelled=true;if(created)URL.revokeObjectURL(created);setUrl('');};
  },[path,image,visible]);
  if(!path)return null;
  const download=async()=>{
    if(loading)return;
    setLoading(true);
    try{
      const blob=await downloadChatAttachment(path);
      const objectUrl=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=objectUrl;a.download=msg.attachment_name||'tep-noi-bo';a.click();
      window.setTimeout(()=>URL.revokeObjectURL(objectUrl),30_000);
    }catch(e){toast.error(errorText(e));}
    finally{setLoading(false);}
  };
  return <div ref={element} className="mt-2 max-w-full rounded-xl border border-blue-100 bg-white/90 p-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
    {image && (url
      ? <button type="button" onClick={()=>void download()} className="block max-w-full" aria-label="Tải ảnh đính kèm"><img src={url} alt={msg.attachment_name||'Ảnh nội bộ'} className="max-h-60 max-w-full rounded-lg object-contain"/></button>
      : <div className="flex min-h-20 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">{error?'Không tải được ảnh':'Đang tải ảnh…'}</div>)}
    <button type="button" onClick={()=>void download()} disabled={loading} className="mt-1 flex min-h-10 max-w-full items-center gap-2 rounded-lg px-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
      {image?<Image className="h-4 w-4 shrink-0"/>:<FileText className="h-5 w-5 shrink-0 text-blue-700"/>}
      <span className="min-w-0 flex-1 break-all">{msg.attachment_name||'Tệp đính kèm'}</span>
      {loading?<LoaderCircle className="h-4 w-4 shrink-0 animate-spin"/>:<Download className="h-4 w-4 shrink-0"/>}
    </button>
  </div>;
}

function ChatCreate({ me, people, close, openThread }: {
  me:string;people:{id:string;full_name:string}[];
  close:()=>void;openThread:(id:string)=>void;
}) {
  const [group,setGroup]=useState(false);
  const [filter,setFilter]=useState('');
  const [chosen,setChosen]=useState<string[]>([]);
  const [title,setTitle]=useState('');
  const [busy,setBusy]=useState(false);
  const filtered=people.filter(p=>p.id!==me&&p.full_name.toLocaleLowerCase('vi').includes(filter.toLocaleLowerCase('vi'))).slice(0,100);
  const openOne=async(id:string)=>{
    if(busy)return;setBusy(true);
    try{const thread=await openDirectChat(id);openThread(thread);close();}
    catch(e){toast.error(errorText(e));}finally{setBusy(false);}
  };
  const openGroup=async()=>{
    if(busy)return;
    if(chosen.length<2){toast.error('Hãy chọn ít nhất 2 đồng nghiệp để tạo nhóm.');return;}
    setBusy(true);
    try{const thread=await createChatGroup(title,chosen);openThread(thread);close();toast.success('Đã tạo nhóm chat.');}
    catch(e){toast.error(errorText(e));}finally{setBusy(false);}
  };
  return <div className="space-y-3 rounded-2xl border bg-card p-3 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold">{group?'Tạo nhóm chat':'Nhắn tin cho đồng nghiệp'}</h3>
      <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={close} aria-label="Đóng"><X className="h-4 w-4"/></Button>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" size="sm" variant={group?'outline':'default'} className="min-h-10 rounded-xl" onClick={()=>setGroup(false)}><UserRound className="h-4 w-4"/>Cá nhân</Button>
      <Button type="button" size="sm" variant={group?'default':'outline'} className="min-h-10 rounded-xl" onClick={()=>setGroup(true)}><Users className="h-4 w-4"/>Nhóm chat</Button>
    </div>
    {group && <Input value={title} maxLength={80} onChange={e=>setTitle(e.target.value)} placeholder="Tên nhóm, ví dụ: Team Marketing" className="min-h-11 text-base"/>}
    <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input value={filter} onChange={e=>setFilter(e.target.value)} className="min-h-11 pl-9 text-base" placeholder="Tìm tên đồng nghiệp…"/></div>
    <div className="max-h-56 space-y-1 overflow-y-auto">
      {filtered.map(p=><button key={p.id} type="button" disabled={busy} onClick={()=>{
        if(!group){void openOne(p.id);return;}
        setChosen(prev=>prev.includes(p.id)?prev.filter(id=>id!==p.id):[...prev,p.id]);
      }} className="flex min-h-12 w-full items-center gap-2.5 rounded-xl px-2 text-left hover:bg-muted">
        {group?<span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${chosen.includes(p.id)?'border-blue-600 bg-blue-600 text-white':'border-muted-foreground/30'}`}>{chosen.includes(p.id)&&<Check className="h-4 w-4"/>}</span>:<ChatAvatar name={p.full_name}/>}
        <span className="min-w-0 flex-1 truncate text-sm">{p.full_name}</span>
      </button>)}
      {!filtered.length && <p className="p-4 text-center text-xs text-muted-foreground">Không có đồng nghiệp phù hợp.</p>}
    </div>
    {group && <Button type="button" className="min-h-11 w-full rounded-xl" disabled={busy||chosen.length<2||title.trim().length<2} onClick={()=>void openGroup()}>
      {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Plus className="h-4 w-4"/>} Tạo nhóm với {chosen.length+1} thành viên
    </Button>}
  </div>;
}

function ChatConversation({ thread, me, names, onBack, onSent, compact=false }: {
  thread:ChatThread;me:string;names:Map<string,string>;
  onBack:()=>void;onSent:()=>void;compact?:boolean;
}) {
  const client=useQueryClient();
  const [body,setBody]=useState('');
  const [visibleLimit,setVisibleLimit]=useState(60);
  const [attachment,setAttachment]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const fileInput=useRef<HTMLInputElement>(null);
  const scrollBottom=useRef<HTMLDivElement>(null);
  const nameOf=(id:string)=>names.get(id)||'Thành viên Sứ Việt';
  const label=thread.kind==='group'?(thread.title||'Nhóm chat'):nameOf(thread.member_ids.find(x=>x!==me)||'');
  const messages=useQuery({
    queryKey:['chat','messages',me,thread.thread_id,visibleLimit],
    queryFn:()=>chatMessages(thread.thread_id,visibleLimit),
    staleTime:3_000,refetchInterval:9_000,refetchOnWindowFocus:true,retry:1
  });
  const participants=useQuery({
    queryKey:['chat','participants',me,thread.thread_id],
    queryFn:()=>chatParticipants(thread.thread_id),
    staleTime:10_000,refetchInterval:15_000,retry:1
  });
  useEffect(()=>{
    const channel=supabase.channel('sv-chat-thread-'+thread.thread_id)
      .on('postgres_changes',{event:'*',schema:'public',table:'sv_chat_messages',filter:`thread_id=eq.${thread.thread_id}`},()=>{
        void client.invalidateQueries({queryKey:['chat','messages',me,thread.thread_id]});
        void client.invalidateQueries({queryKey:['chat','inbox',me]});
        void client.invalidateQueries({queryKey:['chat','unread',me]});
      }).subscribe();
    return()=>{void supabase.removeChannel(channel);};
  },[thread.thread_id,me,client]);
  const lastReceived=messages.data?.filter(msg=>msg.sender_id!==me && !msg.recalled_at).at(-1);
  useEffect(()=>{
    if(!lastReceived||document.visibilityState!=='visible')return;
    const own=participants.data?.find(p=>p.user_id===me);
    if(!own || new Date(own.last_read_at).getTime()>=new Date(lastReceived.created_at).getTime())return;
    void markChatRead(thread.thread_id).then(()=>{
      void client.invalidateQueries({queryKey:['chat','inbox',me]});
      void client.invalidateQueries({queryKey:['chat','unread',me]});
      void client.invalidateQueries({queryKey:['chat','participants',me,thread.thread_id]});
    }).catch(()=>{});
  },[thread.thread_id,lastReceived?.id,lastReceived?.created_at,participants.data,me,client]);
  useEffect(()=>{scrollBottom.current?.scrollIntoView({block:'end',behavior:'instant'});},[thread.thread_id,messages.data?.at(-1)?.id]);
  const send=async(e:React.FormEvent)=>{
    e.preventDefault();if(busy)return;
    setBusy(true);
    try{
      await sendChatMessage(thread.thread_id,me,body,attachment??undefined);
      setBody('');setAttachment(null);if(fileInput.current)fileInput.current.value='';
      await Promise.all([
        client.invalidateQueries({queryKey:['chat','messages',me,thread.thread_id]}),
        client.invalidateQueries({queryKey:['chat','inbox',me]}),
      ]);
      onSent();
    }catch(err){toast.error(errorText(err));}
    finally{setBusy(false);}
  };
  const recall=async(msg:ChatMessage)=>{
    if(!window.confirm('Thu hồi tin nhắn này với mọi người?'))return;
    try{
      if(!await recallChatMessage(msg.id)) throw new Error('Không thể thu hồi tin nhắn.');
      if(msg.attachment_path) await deleteChatAttachment(msg.attachment_path).catch(()=>{});
      await client.invalidateQueries({queryKey:['chat','messages',me,thread.thread_id]});
      await client.invalidateQueries({queryKey:['chat','inbox',me]});
    }catch(err){toast.error(errorText(err));}
  };
  return <section className={`flex ${compact?'h-[min(74dvh,700px)]':'h-[calc(100dvh-var(--mobile-header-height,64px)-var(--mobile-nav-height,72px)-200px)] md:h-[min(78dvh,780px)]'} min-h-[285px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card ${compact?'':'md:min-h-[480px]'}`}>
    <header className="flex min-h-16 items-center gap-2 border-b bg-card px-3 py-2">
      <Button type="button" variant="ghost" size="icon" className={`h-11 w-10 shrink-0 ${compact?'':'md:hidden'}`} onClick={onBack} aria-label="Quay lại danh sách chat"><ArrowLeft className="h-5 w-5"/></Button>
      <ChatAvatar name={label} group={thread.kind==='group'}/>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold">{label}</h3>
        <p className="text-[11px] text-muted-foreground">{thread.kind==='group'?`${thread.member_ids.length} thành viên`:'Nhắn tin riêng tư · Nội bộ Base'}</p>
      </div>
      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Chỉ thành viên hội thoại"/>
    </header>
    <div className="flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-slate-50 to-sky-50/50 px-3 py-4 dark:from-slate-950 dark:to-slate-900" role="log" aria-label="Tin nhắn">
      {messages.isLoading && <div className="space-y-3" role="status"><div className="ml-auto h-14 w-3/5 animate-pulse rounded-xl bg-blue-100"/><div className="h-14 w-2/3 animate-pulse rounded-xl bg-muted"/></div>}
      {messages.isError && <Button type="button" variant="outline" className="w-full" onClick={()=>void messages.refetch()}>Chưa tải được tin nhắn · Thử lại</Button>}
      {messages.isSuccess && messages.data.length===0 && <div className="mx-auto max-w-xs py-12 text-center">
        <HeartHandshake className="mx-auto h-9 w-9 text-sky-600"/><p className="mt-3 text-sm font-semibold">Bắt đầu cuộc trò chuyện</p><p className="mt-1 text-xs text-muted-foreground">Lời chào đầu tiên có thể bắt đầu sự hợp tác tuyệt vời.</p>
      </div>}
      {(messages.data?.length ?? 0) >= visibleLimit && <Button type="button" variant="outline" className="mx-auto flex min-h-9 rounded-xl text-xs" onClick={()=>setVisibleLimit(n=>n+60)}><ChevronDown className="h-4 w-4 rotate-180"/>Xem tin nhắn cũ</Button>}
      {messages.data?.map(msg=>{
        const mine=msg.sender_id===me;
        const readers=participants.data?.filter(p=>p.user_id!==me && new Date(p.last_read_at).getTime()>=new Date(msg.created_at).getTime()).length||0;
        return <div key={msg.id} className={`flex ${mine?'justify-end':'justify-start'}`}>
          <div className={`max-w-[88%] space-y-1 sm:max-w-[78%] ${mine?'items-end':'items-start'}`}>
            {!mine && thread.kind==='group' && <span className="ml-2 text-[10px] text-muted-foreground">{nameOf(msg.sender_id)}</span>}
            <div className={`rounded-2xl px-3 py-2 shadow-sm ${mine?'rounded-br-md bg-blue-700 text-white':'rounded-bl-md border bg-white text-foreground dark:bg-slate-800'}`}>
              {msg.recalled_at?<p className="text-xs italic opacity-75">Tin nhắn đã được thu hồi</p>:<>
                {msg.body && <p className="whitespace-pre-wrap break-words text-[13px] leading-6">{msg.body}</p>}
                {msg.attachment_path && <ChatAttachment msg={msg}/>}
              </>}
              <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine?'text-blue-100':'text-muted-foreground'}`}>
                {when(msg.created_at)}
                {mine && readers>0 && <CheckCheck className="h-3 w-3" aria-label={`${readers} người đã xem`}/>}
              </div>
            </div>
            {mine && !msg.recalled_at && <button type="button" className="mr-1 flex min-h-7 items-center gap-1 text-[10px] text-muted-foreground hover:text-primary" onClick={()=>void recall(msg)}><RotateCcw className="h-3 w-3"/>Thu hồi</button>}
          </div>
        </div>;
      })}
      <div ref={scrollBottom}/>
    </div>
    <form onSubmit={e=>void send(e)} className="shrink-0 space-y-2 border-t bg-card px-3 py-3">
      {attachment && <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs text-blue-900 dark:bg-blue-950 dark:text-blue-100">
        <Paperclip className="h-4 w-4"/><span className="min-w-0 flex-1 truncate">{attachment.name}</span>
        <button type="button" aria-label="Bỏ tệp" onClick={()=>setAttachment(null)}><X className="h-4 w-4"/></button>
      </div>}
      <div className="flex items-end gap-2">
        <input type="file" className="hidden" ref={fileInput} accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.pptx,.txt" aria-label="Chọn tệp đính kèm"
          onChange={e=>{const f=e.target.files?.[0];if(!f)return;try{validateChatAttachment(f);setAttachment(f);}catch(err){toast.error(errorText(err));}if(fileInput.current)fileInput.current.value='';}}/>
        <Button type="button" size="icon" variant="outline" className="h-11 w-11 shrink-0 rounded-xl" aria-label="Đính kèm tệp" onClick={()=>fileInput.current?.click()} disabled={busy}><Paperclip className="h-5 w-5"/></Button>
        <Textarea rows={1} maxLength={4000} placeholder="Nhắn tin trong Base…" className="max-h-28 min-h-11 flex-1 resize-none rounded-xl text-base" value={body} onChange={e=>setBody(e.target.value)} onKeyDown={e=>{
          if(e.key==='Enter'&&!e.shiftKey&&window.innerWidth>=768){e.preventDefault();void send(e);}
        }}/>
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800" disabled={busy||(!body.trim()&&!attachment)} aria-label="Gửi tin nhắn">
          {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Send className="h-5 w-5"/>}
        </Button>
      </div>
    </form>
  </section>;
}

export function ChatPanel({ initialThreadId, onThreadChange, compact=false }: {
  initialThreadId?:string;
  onThreadChange?:(id:string|undefined)=>void;compact?:boolean;
}) {
  const {user}=useCurrentUser();
  const uid=user?.id||'';
  const active=!!uid&&user?.status==='Đang hoạt động';
  const [threadId,setThreadId]=useState<string|undefined>(initialThreadId);
  const [newOpen,setNewOpen]=useState(false);
  const [filter,setFilter]=useState('');
  const client=useQueryClient();
  useEffect(()=>{setThreadId(initialThreadId);},[initialThreadId]);
  const members=useQuery({
    queryKey:['community','names',uid],queryFn:listCommunityMemberNames,
    staleTime:5*60_000,enabled:active,retry:1,
  });
  const names=useMemo(()=>new Map((members.data??[]).map(p=>[p.id,p.full_name])),[members.data]);
  const inbox=useQuery({
    queryKey:['chat','inbox',uid],queryFn:chatInbox,
    enabled:active,staleTime:5_000,refetchInterval:CHAT_REFRESH_MS,retry:1,
  });
  useEffect(()=>{
    if(!active)return;
    const channel=supabase.channel('sv-chat-inbox-'+uid).on('postgres_changes',{
      event:'UPDATE',schema:'public',table:'sv_chat_threads'
    },()=>{void client.invalidateQueries({queryKey:['chat','inbox',uid]});void client.invalidateQueries({queryKey:['chat','unread',uid]});}).subscribe();
    return()=>{void supabase.removeChannel(channel);};
  },[uid,active,client]);
  const nameOf=(id:string)=>names.get(id)||'Thành viên Sứ Việt';
  const titleOf=(t:ChatThread)=>t.kind==='group'?t.title||'Nhóm chat':nameOf(t.member_ids.find(x=>x!==uid)||'');
  const choose=(id:string|undefined)=>{
    setThreadId(id);setNewOpen(false);onThreadChange?.(id);
    if(id)void markChatRead(id).then(()=>{
      void client.invalidateQueries({queryKey:['chat','inbox',uid]});
      void client.invalidateQueries({queryKey:['chat','unread',uid]});
    }).catch(()=>{});
  };
  const threads=inbox.data??[];
  const selected=threads.find(x=>x.thread_id===threadId);
  const filtered=threads.filter(t=>titleOf(t).toLocaleLowerCase('vi').includes(filter.toLocaleLowerCase('vi')));
  if(!active) return <p role="alert" className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Chat chỉ dành cho nhân viên Base đang hoạt động.</p>;
  return <div className={`grid min-w-0 grid-cols-1 gap-3 ${compact?'':'md:grid-cols-[minmax(240px,310px)_minmax(0,1fr)]'}`}>
    <aside className={`${selected?(compact?'hidden':'hidden md:flex'):'flex'} min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-3 shadow-sm`}>
      <div className="flex items-center justify-between gap-2">
        <div><h2 className="text-lg font-bold">Tin nhắn</h2><p className="text-xs text-muted-foreground">Trao đổi riêng trong Sứ Việt</p></div>
        <Button type="button" size="icon" aria-label="Tạo cuộc trò chuyện" title="Nhắn tin mới" className="h-11 w-11 rounded-xl bg-blue-700 hover:bg-blue-800" onClick={()=>setNewOpen(v=>!v)}><Plus className="h-5 w-5"/></Button>
      </div>
      {newOpen?<ChatCreate me={uid} people={members.data??[]} close={()=>setNewOpen(false)} openThread={id=>{choose(id);void inbox.refetch();}}/>:<>
        <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground"/><Input className="min-h-11 pl-9 text-base" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Tìm cuộc trò chuyện…"/></div>
        <div className="max-h-[min(65dvh,640px)] space-y-1 overflow-y-auto">
          {inbox.isLoading && <div role="status" className="space-y-2"><div className="h-16 animate-pulse rounded-xl bg-muted"/><div className="h-16 animate-pulse rounded-xl bg-muted"/></div>}
          {inbox.isError && <Button type="button" variant="outline" className="w-full" onClick={()=>void inbox.refetch()}>Không tải được Chat · Thử lại</Button>}
          {inbox.isSuccess && filtered.length===0 && <div className="py-10 text-center">
            <MessagesSquare className="mx-auto h-8 w-8 text-sky-500"/><p className="mt-2 text-sm font-medium">{filter?'Không có cuộc trò chuyện phù hợp.':'Chưa có cuộc trò chuyện nào.'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{filter?'Hãy thử tìm tên khác.':'Bấm + để nhắn tin với đồng nghiệp.'}</p>
          </div>}
          {filtered.map(t=><button type="button" key={t.thread_id} onClick={()=>choose(t.thread_id)}
            className={`flex min-h-20 w-full items-center gap-2.5 rounded-xl px-2 text-left transition ${selected?.thread_id===t.thread_id?'bg-sky-100 dark:bg-blue-950':'hover:bg-muted'}`}>
            <ChatAvatar name={titleOf(t)} group={t.kind==='group'}/>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{titleOf(t)}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{t.last_message||'Bắt đầu trò chuyện'}</span>
              <span className="block text-[10px] text-muted-foreground">{when(t.last_at)}</span>
            </span>
            {t.unread_count>0 && <span className="min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">{t.unread_count>99?'99+':t.unread_count}</span>}
          </button>)}
        </div>
      </>}
      <div className="flex items-center gap-1 border-t pt-3 text-[10px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600"/>Chỉ thành viên hội thoại được xem tin nhắn</div>
    </aside>
    <div className={`${selected?'block':compact?'hidden':'hidden md:block'} min-w-0`}>
      {selected
        ? <ChatConversation key={selected.thread_id} thread={selected} me={uid} names={names} compact={compact} onBack={()=>choose(undefined)} onSent={()=>void inbox.refetch()}/>
        : <div className="flex h-[min(74dvh,760px)] flex-col items-center justify-center rounded-2xl border bg-gradient-to-br from-blue-50 to-teal-50 p-6 text-center dark:from-slate-900 dark:to-teal-950">
          <MessagesSquare className="h-12 w-12 text-blue-700"/><h3 className="mt-4 text-base font-bold">Sứ Việt Chat</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">Chọn một cuộc trò chuyện để trao đổi công việc và chia sẻ tài liệu với đồng nghiệp.</p>
          <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">Không công khai ra ngoài Base</p>
        </div>}
    </div>
  </div>;
}
