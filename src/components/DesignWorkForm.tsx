import { useState } from 'react';
import { useStore, uid, type DesignOrder } from '@/lib/store';
import { DesignClassification } from './DesignClassification';
import { DesignAttachments } from './DesignAttachments';
import { DesignAssigneePicker } from './DesignAssigneePicker';
import { useDesignCatalogs, normalizeProducts } from '@/lib/orders/catalogs';
import { useCurrentUser } from '@/lib/auth';
import { DESIGN_FLOWS, designCan, designLabel, type DesignFlow } from '@/lib/orders/design';
import { saveDesignOrder } from '@/lib/orders/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DesignWorkForm({ flow, onClose }: {flow?: DesignFlow; onClose:()=>void}) {
  const store=useStore(); const {user,can}=useCurrentUser();
  const [kind,setKind]=useState<DesignFlow|undefined>(flow);
  const [id]=useState(uid); const [title,setTitle]=useState('');
  const [classification,setClassification]=useState<Partial<DesignOrder>>({}); const [uploading,setUploading]=useState(false); const catalogs=useDesignCatalogs();
  const [brief,setBrief]=useState(''); const [deadline,setDeadline]=useState('');
  const [assignee,setAssignee]=useState(''); const [assigneeId,setAssigneeId]=useState('');
  const [reviewer,setReviewer]=useState(user?.fullName || user?.username || '');
  const [specialty,setSpecialty]=useState<Record<string,string>>({}); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const fields=kind==='photo' ? ['Sản phẩm / Đối tượng','Mục đích sử dụng','Concept','Địa điểm','Thời gian dự kiến'] : kind==='order_mockup' ? ['Khách hàng / Đơn vị','Mã đơn hàng','Nội dung in','Vị trí in / trang trí','Yêu cầu kỹ thuật'] : ['Mục đích sử dụng','Kênh sử dụng','Nội dung thiết kế','Kích thước / Định dạng'];
  async function save(){
    if(!kind || !title.trim() || !classification.workCategoryId){setError('Chọn luồng, nhập tên và chọn loại công việc.');return;}
    if(!designCan(can,kind,'create')){setError('Bạn không có quyền tạo loại Thiết kế này.');return;}
    if(!assignee || !assigneeId){setError('Bắt buộc chọn nhân viên Thiết kế thực hiện.');return;}
    if(reviewer.trim()===assignee){setError('Người duyệt phải khác người thực hiện.');return;}
    const other=normalizeProducts(classification.productIds || [],classification.otherProducts || [],catalogs.data || []);
    if((catalogs.data || []).some(c=>c.is_other && c.kind==='product' && classification.productIds?.includes(c.id)) && !other.length){setError('Nhập ít nhất một tên sản phẩm khác.');return;}
    if(busy)return;setBusy(true);setError('');
    const name=user?.fullName || user?.username || '';
    try {await saveDesignOrder(id,{id,title:title.trim(),brandId:'',workflowKind:kind,type:'Khác',...classification,otherProducts:other,source:'Task lẻ',requester:name,reviewer:reviewer.trim() || name,assignee,assigneeId,status:'Chờ nhận việc',brief,deadline:deadline || undefined,specialty,revisions:0,history:[{at:new Date().toISOString(),byId:user?.id,byName:name,action:'Tạo Job và giao trực tiếp',toStatus:'Chờ nhận việc'}]});await store.reload();onClose();}
    catch(e){setError(e instanceof Error?e.message:'Không lưu được yêu cầu');}finally{setBusy(false);}
  }
  return <div className="space-y-4">
    {!flow && <div><Label>Luồng công việc *</Label><Select disabled={uploading || !!classification.inputAttachments?.length} value={kind || ''} onValueChange={v=>{setKind(v as DesignFlow);setSpecialty({});setClassification({});setAssignee('');setAssigneeId('');}}><SelectTrigger><SelectValue placeholder="Chọn luồng"/></SelectTrigger><SelectContent>{DESIGN_FLOWS.filter(f=>designCan(can,f.key,'create')).map(f=><SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}</SelectContent></Select></div>}
    {kind && <>
      <section className="space-y-3"><h3 className="text-sm font-semibold">Thông tin chính · {designLabel(kind)}</h3><div><Label>Tên công việc *</Label><Input value={title} onChange={e=>setTitle(e.target.value)}/></div><DesignClassification flow={kind} value={classification} onChange={p=>setClassification(c=>({...c,...p}))}/></section>
      <section><Label>Yêu cầu chi tiết</Label><Textarea value={brief} onChange={e=>setBrief(e.target.value)} rows={3}/></section>
      <details className="border-t pt-3"><summary className="cursor-pointer text-sm font-medium">Thông tin nâng cao</summary><div className="grid gap-3 sm:grid-cols-2 mt-3">{fields.map(field=><div key={field}><Label>{field}</Label><Input value={specialty[field] || ''} onChange={e=>setSpecialty({...specialty,[field]:e.target.value})}/></div>)}<div><Label>Số lượng / Khối lượng</Label><Input type="number" min={0} value={specialty['Khối lượng'] || ''} onChange={e=>setSpecialty({...specialty,'Khối lượng':e.target.value})}/></div></div></details>
      <div className="grid gap-3 sm:grid-cols-2"><DesignAssigneePicker flow={kind} value={assignee} valueId={assigneeId} onChange={(name,id)=>{setAssignee(name||'');setAssigneeId(id||'');}} required disabled={busy||uploading}/><div><Label>Người duyệt</Label><Input value={reviewer} onChange={e=>setReviewer(e.target.value)}/></div></div><DesignAttachments orderId={id} flow={kind} value={classification.inputAttachments || []} onChange={inputAttachments=>setClassification(c=>({...c,inputAttachments}))} onBusy={setUploading}/><div><Label>Deadline</Label><Input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></div>
    </>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="sticky bottom-0 flex justify-end gap-2 bg-background pt-3"><Button variant="ghost" disabled={busy || uploading} onClick={onClose}>Bỏ thay đổi</Button><Button disabled={busy || uploading || !kind || !assigneeId || !title.trim() || !classification.workCategoryId} onClick={save}>{busy?'Đang lưu…':'Tạo yêu cầu'}</Button></div>
  </div>;
}