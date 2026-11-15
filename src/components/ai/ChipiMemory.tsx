import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Brain, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { editAiPersonalMemory, forgetAiPersonalMemory } from '@/lib/aiSuviet/assistant.functions';
import type { PersonalMemory } from '@/lib/aiSuviet/personalContext.server';
export function ChipiMemory({memories,onChanged,onForgot,disabled}:{memories:PersonalMemory[];onChanged:()=>void;onForgot:()=>void;disabled:boolean}){
 const edit=useServerFn(editAiPersonalMemory),forget=useServerFn(forgetAiPersonalMemory);
 const [editing,setEditing]=useState<string|null>(null),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false);
 const [confirm,setConfirm]=useState<{id:string|null}|null>(null);
 const fail=(e:unknown)=>toast.error(e instanceof Error?e.message:'Chưa cập nhật được bộ nhớ.');
 return <details className="shrink-0 border-b bg-card px-4 py-2">
  <summary className="flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium"><Brain className="h-4 w-4"/>Đốm nhớ về bạn · {memories.length}</summary>
  <div className="max-h-[35dvh] space-y-3 overflow-y-auto pb-3">
   <p className="text-xs leading-5 text-muted-foreground">Riêng tài khoản của bạn. Đốm nhớ sở thích và chủ đề đã trao đổi; chức vụ, phòng ban luôn đọc lại từ Base. Trò chuyện được lưu từ bản cập nhật này.</p>
   {!memories.length&&<p className="text-xs text-muted-foreground">Chưa có ký ức cá nhân. Bạn có thể chia sẻ cách muốn Đốm hỗ trợ.</p>}
   {memories.map(m=><div key={m.id} className="rounded-xl border p-3">
    {editing===m.id?<div className="space-y-2"><Textarea value={draft} maxLength={600} onChange={e=>setDraft(e.target.value)} className="text-base" aria-label="Nội dung ký ức"/><div className="flex gap-2"><Button size="sm" disabled={busy||disabled||!draft.trim()} onClick={async()=>{setBusy(true);try{await edit({data:{id:m.id,content:draft}});setEditing(null);onChanged();}catch(e){fail(e);}finally{setBusy(false);}}}>Lưu</Button><Button size="sm" variant="ghost" onClick={()=>setEditing(null)}>Hủy</Button></div></div>:<><p className="whitespace-pre-wrap break-words text-xs leading-5">{m.content}</p><div className="mt-2 flex gap-2"><Button size="sm" variant="ghost" disabled={busy||disabled} onClick={()=>{setEditing(m.id);setDraft(m.content);}}><Pencil className="h-3 w-3"/>Sửa</Button><Button size="sm" variant="ghost" disabled={busy||disabled} onClick={()=>setConfirm({id:m.id})}><Trash2 className="h-3 w-3"/>Quên</Button></div></>}
   </div>)}
   <Button variant="outline" size="sm" disabled={busy||disabled} onClick={()=>setConfirm({id:null})}>Quên toàn bộ và xóa cuộc trò chuyện</Button>
   {confirm&&<div role="alert" className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-950 dark:bg-rose-950 dark:text-rose-100"><p className="text-xs leading-5">{confirm.id?'Quên ký ức này và xóa toàn bộ cuộc trò chuyện đã lưu để Đốm không học lại từ tin nhắn cũ. Các ký ức khác vẫn giữ nguyên.':'Xóa toàn bộ ký ức và cuộc trò chuyện của bạn. Không thể hoàn tác.'}</p><div className="flex flex-wrap gap-2"><Button size="sm" variant="destructive" disabled={busy||disabled} onClick={async()=>{setBusy(true);try{await forget({data:{id:confirm.id,confirmation:'QUEN'}});setConfirm(null);setEditing(null);onForgot();toast.success('Đốm đã quên theo yêu cầu.');}catch(e){fail(e);}finally{setBusy(false);}}}>Xác nhận quên</Button><Button size="sm" variant="outline" disabled={busy} onClick={()=>setConfirm(null)}>Giữ lại</Button></div></div>}
  </div>
 </details>;
}
