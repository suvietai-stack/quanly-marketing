import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useRef, useState } from 'react';
import { BookOpenText, UploadCloud, FileText, FileSpreadsheet, FileCheck2, LockKeyhole, Users, Trash2, LoaderCircle, FileSearch } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/lib/auth';
import { extractAiPdf } from '@/lib/aiSuviet/assistant.functions';
import { knowledgeDocuments, uploadKnowledgeDocument, removeKnowledgeDocument, setKnowledgeVisibility, type AiDocument } from '@/lib/aiSuviet/documents';

export const Route=createFileRoute('/ai-knowledge')({
  validateSearch:(search:Record<string,unknown>)=>({doc:typeof search.doc==='string'?search.doc:undefined}),
  head:()=>({meta:[{title:'Kho kiến thức AI Sứ Việt — Base'},{name:'robots',content:'noindex,nofollow,noarchive'}]}),
  component:KnowledgePage,
});

function err(e:unknown){return e instanceof Error?e.message:'Có lỗi kết nối, vui lòng thử lại.';}
function KnowledgePage(){
  const {user,isSuperAdmin}=useCurrentUser();
  const {doc:focused}=Route.useSearch();
  const uid=user?.id||'';
  const qc=useQueryClient();
  const pdfExtract=useServerFn(extractAiPdf);
  const [file,setFile]=useState<File|null>(null);
  const [title,setTitle]=useState('');
  const [busy,setBusy]=useState(false);
  const [running,setRunning]=useState('');
  const [expanded,setExpanded]=useState<string|null>(focused??null);
  const picker=useRef<HTMLInputElement>(null);
  const {data:docs=[],isLoading,isError,refetch}=useQuery({
    queryKey:['ai-suviet','documents',uid],queryFn:knowledgeDocuments,
    enabled:!!uid&&user?.status==='Đang hoạt động',staleTime:20_000,retry:1,
  });
  const refresh=()=>void qc.invalidateQueries({queryKey:['ai-suviet','documents',uid]});
  const selectFile=(next:File|null)=>{
    setFile(next);
    if(next)setTitle(next.name.replace(/\.[^.]+$/,'').slice(0,180));
  };
  const upload=async(e:React.FormEvent)=>{
    e.preventDefault();if(!file||busy||!isSuperAdmin)return;
    setBusy(true);
    try{
      const result=await uploadKnowledgeDocument(file,title,uid);
      setFile(null);setTitle('');if(picker.current)picker.current.value='';
      refresh();
      toast.success(result.requiresIndex?'Đã lưu PDF riêng tư. Chọn “Đọc PDF” để xử lý nội dung.':'Đã thêm tài liệu. Mặc định chỉ quản trị viên xem.');
    }catch(error){toast.error(err(error));}finally{setBusy(false);}
  };
  const doExtract=async(d:AiDocument)=>{
    setRunning(d.id);
    try{await pdfExtract({data:{id:d.id}});refresh();toast.success('Đã trích xuất nội dung PDF.');}
    catch(error){toast.error(err(error));}finally{setRunning('');}
  };
  const toggle=async(d:AiDocument)=>{
    setRunning(d.id);
    try{
      await setKnowledgeVisibility(d.id,d.visibility==='company'?'admin':'company');
      refresh();toast.success(d.visibility==='company'?'Đã chuyển tài liệu về chỉ quản trị.':'Đã chia sẻ nội dung tài liệu cho nhân viên.');
    }catch(error){toast.error(err(error));}finally{setRunning('');}
  };
  const remove=async(d:AiDocument)=>{
    if(!window.confirm(`Xóa vĩnh viễn tài liệu “${d.title}” khỏi kho AI?`))return;
    setRunning(d.id);
    try{await removeKnowledgeDocument(d);refresh();toast.success('Đã xóa tài liệu.');}
    catch(error){toast.error(err(error));}finally{setRunning('');}
  };
  return <main className="mx-auto max-w-4xl space-y-5 pb-12">
    <header className="rounded-2xl border bg-gradient-to-br from-blue-50 to-teal-50 p-5 dark:from-slate-900 dark:to-teal-950">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300"><BookOpenText className="h-5 w-5"/> AI Sứ Việt</div>
      <h1 className="mt-2 text-xl font-bold">Kho kiến thức AI</h1>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">Tài liệu hướng dẫn và quy trình để Chipi trả lời đúng thông tin. Tệp gốc luôn riêng tư; chỉ nội dung được quản trị viên chia sẻ mới được nhân viên dùng để hỏi đáp.</p>
    </header>
    {isSuperAdmin&&<form onSubmit={e=>void upload(e)} className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
      <h2 className="text-base font-semibold">Tải tài liệu lên</h2>
      <p className="text-xs text-muted-foreground">Hỗ trợ PDF, Word DOCX, Excel XLS/XLSX, TXT, MD, CSV · tối đa 6 MB mỗi tệp. Tài liệu mặc định chỉ quản trị viên được xem.</p>
      <input ref={picker} className="block w-full max-w-full text-sm" type="file" accept=".pdf,.docx,.xlsx,.xls,.txt,.md,.csv" onChange={e=>selectFile(e.target.files?.[0]??null)} aria-label="Chọn tài liệu"/>
      {file&&<Input value={title} maxLength={180} onChange={e=>setTitle(e.target.value)} placeholder="Tên tài liệu" className="min-h-11 text-base"/>}
      <Button type="submit" disabled={!file||busy||title.trim().length<2} className="min-h-11 rounded-xl bg-blue-700 text-white hover:bg-blue-800">
        {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<UploadCloud className="h-4 w-4"/>}{busy?'Đang tải…':'Thêm vào kho'}
      </Button>
    </form>}
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-bold">Tài liệu hiện có</h2><Button variant="outline" size="sm" type="button" onClick={()=>void refetch()}>Làm mới</Button></div>
      {isLoading&&<p role="status" className="text-sm text-muted-foreground">Đang tải kho tài liệu…</p>}
      {isError&&<p role="alert" className="rounded-xl border p-4 text-sm">Chưa tải được tài liệu, hãy kiểm tra kết nối hoặc quyền truy cập.</p>}
      {!isLoading&&!isError&&docs.length===0&&<p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">Chưa có tài liệu nào được chia sẻ với bạn.</p>}
      {docs.map(d=><article key={d.id} id={`doc-${d.id}`} className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700 dark:bg-slate-800 dark:text-blue-200">{d.mime_type.includes('sheet')||d.mime_type.includes('excel')?<FileSpreadsheet className="h-5 w-5"/>:<FileText className="h-5 w-5"/>}</span>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-semibold">{d.title}</h3>
            <p className="mt-1 break-all text-xs text-muted-foreground">{d.original_name}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className={`rounded-full px-2 py-0.5 ${d.status==='ready'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}`}>{d.status==='ready'?'Đã đọc nội dung':'Chưa xử lý nội dung'}</span>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">{d.visibility==='company'?<Users className="h-3 w-3"/>:<LockKeyhole className="h-3 w-3"/>}{d.visibility==='company'?'Nhân viên':'Chỉ quản trị'}</span>
            </div>
          </div>
        </div>
        {d.status==='ready'&&<div>
          <Button variant="ghost" size="sm" type="button" className="rounded-lg text-xs" onClick={()=>setExpanded(v=>v===d.id?null:d.id)}><FileCheck2 className="h-4 w-4"/>{expanded===d.id?'Ẩn nội dung':'Xem nội dung đã đọc'}</Button>
          {expanded===d.id&&<pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted p-3 font-sans text-xs leading-5">{d.content.slice(0,12000)}</pre>}
        </div>}
        {isSuperAdmin&&<div className="flex flex-wrap gap-2 border-t pt-3">
          {d.mime_type==='application/pdf'&&d.status!=='ready'&&<Button size="sm" type="button" variant="outline" disabled={!!running} onClick={()=>void doExtract(d)}><FileSearch className="h-4 w-4"/>{running===d.id?'Đang đọc…':'Đọc PDF'}</Button>}
          {d.status==='ready'&&<Button size="sm" type="button" variant="outline" disabled={!!running} onClick={()=>void toggle(d)}>{d.visibility==='company'?<LockKeyhole className="h-4 w-4"/>:<Users className="h-4 w-4"/>}{d.visibility==='company'?'Chỉ quản trị':'Chia sẻ cho nhân viên'}</Button>}
          <Button size="sm" type="button" variant="ghost" className="text-rose-600" disabled={!!running} onClick={()=>void remove(d)}><Trash2 className="h-4 w-4"/>Xóa</Button>
        </div>}
      </article>)}
    </section>
  </main>;
}
