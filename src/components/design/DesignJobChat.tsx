import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, Download, Image as ImageIcon, FileText, LoaderCircle, MessageCircle, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/lib/auth';
import { TabsTrigger } from '@/components/ui/tabs';
import { listCommunityMemberNames } from '@/lib/community/api';
import {
  type JobChatMessage, canAccessJobChat, checkJobChatFile, jobChatDownload,
  jobChatUnreadCount, listJobChatMessages, nextJobChatPage, markJobChatRead,
  sendJobChatMessage,
} from '@/lib/designJobChat/api';

const textError=(e:unknown)=>e instanceof Error?e.message:'Không gửi được tin. Hãy thử lại.';
const clock=(s:string)=>new Date(s).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});

function JobChatFile({msg}:{msg:JobChatMessage}) {
  const path=msg.attachment_path;
  const [imageUrl,setImageUrl]=useState('');
  const [busy,setBusy]=useState(false);
  const [near,setNear]=useState(false);
  const element=useRef<HTMLDivElement>(null);
  const image=!!msg.attachment_mime?.startsWith('image/');
  useEffect(()=>{
    if(!image)return;
    const node=element.current;
    if(!node||!('IntersectionObserver' in window)){setNear(true);return;}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){setNear(true);observer.disconnect();}
    },{rootMargin:'120px'});
    observer.observe(node);
    return()=>observer.disconnect();
  },[image,path]);
  useEffect(()=>{
    if(!image||!path||!near)return;
    let cancelled=false;let objectUrl='';
    void jobChatDownload(path).then(blob=>{
      if(cancelled)return;
      objectUrl=URL.createObjectURL(blob);setImageUrl(objectUrl);
    }).catch(()=>{});
    return()=>{cancelled=true;if(objectUrl)URL.revokeObjectURL(objectUrl);setImageUrl('');};
  },[path,image,near]);
  if(!path)return null;
  const download=async()=>{
    if(busy)return;setBusy(true);
    try{
      const file=await jobChatDownload(path);
      const href=URL.createObjectURL(file);
      const a=document.createElement('a');
      a.href=href;a.download=msg.attachment_name||'tep-thiet-ke';
      a.click();window.setTimeout(()=>URL.revokeObjectURL(href),30_000);
    }catch(e){toast.error(textError(e));}finally{setBusy(false);}
  };
  return <div ref={element} className="mt-2 max-w-full rounded-xl border bg-background/95 p-2 text-foreground">
    {image&&imageUrl&&<button type="button" onClick={()=>void download()} aria-label="Tải ảnh" className="block max-w-full">
      <img src={imageUrl} alt={msg.attachment_name||'Ảnh trao đổi'} className="max-h-52 max-w-full rounded-lg object-contain"/>
    </button>}
    <Button type="button" variant="ghost" className="min-h-10 max-w-full gap-2 px-1 text-xs" onClick={()=>void download()} disabled={busy}>
      {image?<ImageIcon className="h-4 w-4 shrink-0"/>:<FileText className="h-4 w-4 shrink-0"/>}
      <span className="min-w-0 break-all text-left">{msg.attachment_name||'Tệp đính kèm'}</span>
      {busy?<LoaderCircle className="h-4 w-4 shrink-0 animate-spin"/>:<Download className="h-4 w-4 shrink-0"/>}
    </Button>
  </div>;
}

/** Only display the tab for people actually participating in this Job.
 * Database RLS separately enforces this for every message and attachment. */
export function DesignJobChatTab({jobId,active}:{jobId:string;active:boolean}) {
  const {user}=useCurrentUser();
  const uid=user?.id||'';
  const access=useQuery({
    queryKey:['design-job-chat','access',uid,jobId],
    queryFn:()=>canAccessJobChat(jobId),
    enabled:active&&!!uid&&user?.status==='Đang hoạt động',
    staleTime:15_000,retry:1,
  });
  if(!access.data)return null;
  return <TabsTrigger value="job-chat" className="min-h-10 gap-1 text-xs sm:text-sm">
    <MessageCircle className="h-4 w-4 shrink-0"/>Trao đổi
    <JobChatUnreadBadge jobId={jobId} active={active}/>
  </TabsTrigger>;
}

/** Badge in the Job detail tab. No global polling, only while the Job modal is open. */
export function JobChatUnreadBadge({jobId,active}:{jobId:string;active:boolean}) {
  const {user}=useCurrentUser();
  const uid=user?.id||'';
  const {data}=useQuery({
    queryKey:['design-job-chat','unread',uid,jobId],queryFn:()=>jobChatUnreadCount(jobId),
    enabled:active&&!!uid&&user?.status==='Đang hoạt động',
    staleTime:15_000,refetchInterval:30_000,retry:1,
  });
  return data&&data>0?<span aria-label={`${data} tin chưa đọc`} className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{data>99?'99+':data}</span>:null;
}

/** Intentionally simple: no group creation, assignments or workflow transitions. */
export function DesignJobChat({jobId}:{jobId:string}) {
  const {user}=useCurrentUser();
  const uid=user?.id||'';
  const client=useQueryClient();
  const [body,setBody]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const chooseFile=useRef<HTMLInputElement>(null);
  const latestRead=useRef('');
  const scrollEnd=useRef<HTMLDivElement>(null);
  const people=useQuery({
    queryKey:['community','names',uid],queryFn:listCommunityMemberNames,
    enabled:!!uid,staleTime:5*60_000,retry:1,
  });
  const names=useMemo(()=>new Map((people.data??[]).map(p=>[p.id,p.full_name])),[people.data]);
  const messages=useInfiniteQuery({
    queryKey:['design-job-chat','messages',uid,jobId],
    initialPageParam:0,
    queryFn:({pageParam})=>listJobChatMessages(jobId,pageParam),
    getNextPageParam:nextJobChatPage,
    enabled:!!uid&&user?.status==='Đang hoạt động',
    staleTime:4_000,refetchInterval:10_000,retry:1,
  });
  // Pages are newest-first; reverse once to render chat in chronological order.
  const all=messages.data?.pages.flat().reverse()??[];
  const latest=messages.data?.pages[0]?.[0]?.id;
  useEffect(()=>{
    if(!uid || !latest || document.visibilityState!=='visible'||latestRead.current===latest)return;
    latestRead.current=latest;
    void markJobChatRead(jobId).then(()=>{
      void client.invalidateQueries({queryKey:['design-job-chat','unread',uid,jobId]});
    }).catch(()=>{latestRead.current='';});
  },[latest,jobId,uid,client]);
  useEffect(()=>{scrollEnd.current?.scrollIntoView({block:'end'});},[jobId,latest]);
  const send=async(e:React.FormEvent)=>{
    e.preventDefault();if(busy)return;
    setBusy(true);
    try{
      await sendJobChatMessage(jobId,uid,body,file??undefined);
      setBody('');setFile(null);if(chooseFile.current)chooseFile.current.value='';
      await client.invalidateQueries({queryKey:['design-job-chat','messages',uid,jobId]});
      void client.invalidateQueries({queryKey:['design-job-chat','unread',uid,jobId]});
    }catch(err){toast.error(textError(err));}finally{setBusy(false);}
  };
  return <section className="overflow-hidden rounded-2xl border bg-card" aria-label="Trao đổi riêng theo Job">
    <div className="flex items-center gap-2 border-b bg-sky-50/60 px-3 py-3 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <MessageCircle className="h-4 w-4 text-blue-600"/>
      Trao đổi về Job này · Chỉ người liên quan được xem
    </div>
    <div className="max-h-[min(43dvh,340px)] min-h-48 space-y-3 overflow-y-auto bg-slate-50/60 p-3 dark:bg-slate-950/50" role="log" aria-label="Lịch sử trao đổi Job">
      {messages.isLoading&&<div role="status" className="space-y-3"><div className="h-12 w-3/5 animate-pulse rounded-xl bg-muted"/><div className="ml-auto h-12 w-3/5 animate-pulse rounded-xl bg-muted"/></div>}
      {messages.isError&&<div role="alert" className="space-y-2 text-center text-sm"><p>Chưa tải được trao đổi của Job. Có thể bạn không có quyền truy cập.</p><Button size="sm" variant="outline" onClick={()=>void messages.refetch()}>Thử lại</Button></div>}
      {messages.hasNextPage&&<Button type="button" variant="ghost" className="mx-auto flex h-9 text-xs" disabled={messages.isFetchingNextPage} onClick={()=>void messages.fetchNextPage()}>
        {messages.isFetchingNextPage?<LoaderCircle className="h-4 w-4 animate-spin"/>:<ChevronUp className="h-4 w-4"/>}Xem tin cũ hơn
      </Button>}
      {messages.isSuccess&&all.length===0&&<div className="py-10 text-center text-sm text-muted-foreground">Chưa có trao đổi. Hãy gửi tin nhắn đầu tiên.</div>}
      {all.map(msg=>{
        const mine=msg.sender_id===uid;
        const name=mine?'Bạn':names.get(msg.sender_id)||'Đồng nghiệp';
        return <div key={msg.id} className={`flex ${mine?'justify-end':'justify-start'}`}>
          <div className={`max-w-[90%] sm:max-w-[75%] ${mine?'text-right':'text-left'}`}>
            <span className="mb-1 block px-1 text-[10px] text-muted-foreground">{name} · {clock(msg.created_at)}</span>
            <div className={`rounded-2xl p-3 text-left text-[13px] leading-5 ${mine?'rounded-br-md bg-blue-700 text-white':'rounded-bl-md border bg-white dark:bg-slate-800'}`}>
              {!!msg.body&&<p className="whitespace-pre-wrap break-words">{msg.body}</p>}
              {!!msg.attachment_path&&<JobChatFile msg={msg}/>}
            </div>
          </div>
        </div>;
      })}
      <div ref={scrollEnd}/>
    </div>
    <form onSubmit={e=>void send(e)} className="space-y-2 border-t p-3">
      {file&&<div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2 text-xs dark:bg-slate-800">
        <Paperclip className="h-4 w-4 shrink-0"/><span className="min-w-0 flex-1 truncate">{file.name}</span>
        <button type="button" onClick={()=>setFile(null)} aria-label="Bỏ tệp"><X className="h-4 w-4"/></button>
      </div>}
      <div className="flex items-end gap-2">
        <input ref={chooseFile} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx" aria-label="Chọn ảnh hoặc tài liệu"
          onChange={e=>{const chosen=e.target.files?.[0];if(!chosen)return;
            try{checkJobChatFile(chosen);setFile(chosen);}catch(err){toast.error(textError(err));}
            if(chooseFile.current)chooseFile.current.value='';
          }}/>
        <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl" disabled={busy} onClick={()=>chooseFile.current?.click()} aria-label="Đính kèm ảnh hoặc tài liệu"><Paperclip className="h-4 w-4"/></Button>
        <Textarea rows={1} maxLength={3000} className="min-h-11 max-h-28 flex-1 resize-none rounded-xl text-base" value={body} onChange={e=>setBody(e.target.value)}
          placeholder="Trao đổi về công việc này…" onKeyDown={e=>{
            if(e.key==='Enter'&&!e.shiftKey&&window.innerWidth>=768){e.preventDefault();e.currentTarget.form?.requestSubmit();}
          }}/>
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800" disabled={busy||(!body.trim()&&!file)} aria-label="Gửi tin nhắn">
          {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">Gửi một ảnh/tài liệu tối đa 15 MB. Trao đổi này không thay đổi trạng thái Job.</p>
    </form>
  </section>;
}
