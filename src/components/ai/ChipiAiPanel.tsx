import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Bot, BookOpen, Database, Send, Sparkles, LoaderCircle, FileText, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { askAiSuviet } from '@/lib/aiSuviet/assistant.functions';
import type { AiReply, AiSource } from '@/lib/aiSuviet/assistant.server';

type Bubble={id:number;role:'user'|'assistant';text:string;sources?:AiSource[];mode?:AiReply['mode']};
const sampleQuestions=[
  'Cách tạo Job thiết kế trên Base?',
  'Gửi duyệt Job ở đâu?',
  'Phân công tín hiệu cho Sale thế nào?',
  'Hướng dẫn lập 3K của tôi',
];
function errorText(e:unknown){return e instanceof Error?e.message:'AI chưa trả lời được. Hãy thử lại.';}
export function ChipiAiPanel({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
  const mobile=useIsMobile();
  const ask=useServerFn(askAiSuviet);
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState<Bubble[]>([]);
  const [busy,setBusy]=useState(false);
  const bottom=useRef<HTMLDivElement>(null);
  const nextId=useRef(1);
  useEffect(()=>{if(open)bottom.current?.scrollIntoView({block:'end'});},[messages.length,busy,open]);
  const send=async(text:string)=>{
    const message=text.trim();
    if(!message||busy)return;
    if(message.length>900){toast.error('Câu hỏi tối đa 900 ký tự.');return;}
    const history=messages.slice(-6).map(m=>({role:m.role,content:m.text}));
    setMessages(old=>[...old,{id:nextId.current++,role:'user',text:message}]);
    setInput('');setBusy(true);
    try{
      const answer=await ask({data:{question:message,history}});
      setMessages(old=>[...old,{
        id:nextId.current++,role:'assistant',text:answer.answer,
        sources:answer.sources,mode:answer.mode,
      }]);
    }catch(error){
      setMessages(old=>[...old,{id:nextId.current++,role:'assistant',text:'Chipi chưa kết nối được lúc này. Bạn thử hỏi lại sau nhé!'}]);
      toast.error(errorText(error));
    }finally{setBusy(false);}
  };
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side={mobile?'bottom':'right'}
      className={`flex flex-col gap-0 overflow-hidden rounded-t-3xl p-0 ${mobile?'h-[min(86dvh,780px)] w-full':'h-full w-[min(96vw,480px)] sm:max-w-[480px]'}`}>
      <SheetHeader className="shrink-0 border-b bg-gradient-to-r from-[#123a67] via-[#21547f] to-[#157985] px-5 py-4 pr-12 text-left text-white">
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-white/15 p-2"><Bot className="h-5 w-5 text-white"/></span>
          <div>
            <SheetTitle className="text-base font-bold text-white">Chipi · AI Sứ Việt</SheetTitle>
            <SheetDescription className="mt-1 text-xs text-blue-100">Giải đáp Base, hướng dẫn quy trình và trò chuyện vui 🧡</SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/75 p-4 dark:bg-slate-950/70" aria-label="Lịch sử hỏi đáp AI" role="log">
        {messages.length===0&&<div className="space-y-4">
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500"/><strong className="text-sm">Xin chào! Chipi đây!</strong></div>
            <p className="mt-2 text-sm leading-6">Bạn muốn biết cách dùng Base, tìm thông tin công việc hay chỉ muốn tâm sự một chút? Cứ hỏi mình nhé. 🌼</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"><Database className="h-3 w-3"/>Dữ liệu Base</span>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"><BookOpen className="h-3 w-3"/>Kho tài liệu AI</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold text-muted-foreground">Thử hỏi Chipi</p>
            {sampleQuestions.map(q=><button type="button" key={q} onClick={()=>void send(q)}
              className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-left text-sm hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800">
              <span>{q}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-blue-600"/>
            </button>)}
          </div>
        </div>}
        {messages.map(m=><div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
          <div className={`max-w-[94%] space-y-2 rounded-2xl px-3.5 py-3 text-[13px] leading-6 shadow-sm ${m.role==='user'?'rounded-br-md bg-blue-700 text-white':'rounded-bl-md border bg-card text-foreground'}`}>
            <p className="whitespace-pre-wrap break-words">{m.text}</p>
            {m.role==='assistant'&&!!m.sources?.length&&<div className="space-y-1.5 border-t pt-2">
              <p className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"><FileText className="h-3.5 w-3.5"/>Căn cứ tham khảo</p>
              {m.sources.slice(0,5).map((s,i)=><a key={`${s.kind}-${i}`} href={s.href.startsWith('/')?s.href:'#'}
                className="flex items-center gap-1.5 break-words text-xs font-medium text-blue-700 hover:underline dark:text-sky-300">
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0"/>{s.title}
              </a>)}
            </div>}
          </div>
        </div>)}
        {busy&&<div className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin"/>Chipi đang tìm thông tin…</div>}
        <div ref={bottom}/>
      </div>
      <form onSubmit={e=>{e.preventDefault();void send(input);}} className="shrink-0 space-y-2 border-t bg-card p-3">
        <div className="flex items-end gap-2">
          <Textarea rows={1} maxLength={900} value={input} onChange={e=>setInput(e.target.value)}
            className="min-h-12 max-h-28 flex-1 resize-none rounded-xl text-base" placeholder="Hỏi Chipi điều gì đó…"
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&window.innerWidth>=768){e.preventDefault();e.currentTarget.form?.requestSubmit();}}}/>
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800" disabled={!input.trim()||busy} aria-label="Gửi câu hỏi">
            {busy?<LoaderCircle className="h-5 w-5 animate-spin"/>:<Send className="h-5 w-5"/>}
          </Button>
        </div>
        <p className="flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground"><ShieldCheck className="h-3 w-3"/>Chipi chỉ xem dữ liệu trong quyền của bạn; không tự sửa Base.</p>
      </form>
    </SheetContent>
  </Sheet>;
}
