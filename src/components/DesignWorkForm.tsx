import { useState } from 'react';
import { useStore, uid, ORDER_TYPES, type DesignOrder } from '@/lib/store';
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
  const [id]=useState(uid); const [title,setTitle]=useState(''); const [brand,setBrand]=useState(store.brands[0]?.id || '');
  const [type,setType]=useState<DesignOrder['type']>('Khác'); const [brief,setBrief]=useState(''); const [deadline,setDeadline]=useState(''); const [ref,setRef]=useState('');
  const [specialty,setSpecialty]=useState<Record<string,string>>({}); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const fields=kind==='photo' ? ['Produit ou objet','Loại hình chụp','Mục đích sử dụng','Concept','Địa điểm','Thời gian dự kiến'].map(x=>x==='Produit ou objet'?'Sản phẩm / Đối tượng':x) : kind==='order_mockup' ? ['Khách hàng / Đơn vị','Mã đơn hàng','Sản phẩm','Logo khách hàng','Nội dung in','Vị trí in / trang trí','Yêu cầu kỹ thuật'] : ['Mục đích sử dụng','Kênh sử dụng','Nội dung thiết kế','Kích thước / Định dạng'];
  async function save(){
    if(!kind || !title.trim() || !brand){setError('Chọn luồng, nhập tên công việc và thương hiệu.');return;}
    if(busy)return;setBusy(true);setError('');
    const name=user?.fullName || user?.username || '';
    try {await saveDesignOrder(id,{id,title:title.trim(),brandId:brand,workflowKind:kind,type,source:'Task lẻ',requester:name,reviewer:name,status:'Chờ phân công',brief,deadline:deadline || undefined,refLink:ref || undefined,specialty,revisions:0,history:[{at:new Date().toISOString(),byId:user?.id,byName:name,action:'Tạo yêu cầu',toStatus:'Chờ phân công'}]});await store.reload();onClose();}
    catch(e){setError(e instanceof Error?e.message:'Không lưu được yêu cầu');}finally{setBusy(false);}
  }
  return <div className="space-y-4">
    {!flow && <div><Label>Luồng công việc *</Label><Select value={kind || ''} onValueChange={v=>{setKind(v as DesignFlow);setSpecialty({});}}><SelectTrigger><SelectValue placeholder="Chọn luồng"/></SelectTrigger><SelectContent>{DESIGN_FLOWS.filter(f=>designCan(can,f.key,'create')).map(f=><SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}</SelectContent></Select></div>}
    {kind && <>
      <section className="space-y-3"><h3 className="text-sm font-semibold">Thông tin chính · {designLabel(kind)}</h3><div><Label>Tên công việc *</Label><Input value={title} onChange={e=>setTitle(e.target.value)}/></div><div className="grid gap-3 sm:grid-cols-2"><div><Label>Thương hiệu *</Label><Select value={brand} onValueChange={setBrand}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{store.brands.map(b=><SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Loại sản phẩm</Label><Select value={type} onValueChange={v=>setType(v as DesignOrder['type'])}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ORDER_TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div></div></section>
      <section><Label>Yêu cầu chi tiết</Label><Textarea value={brief} onChange={e=>setBrief(e.target.value)} rows={3}/></section>
      <details className="border-t pt-3"><summary className="cursor-pointer text-sm font-medium">Thông tin nâng cao</summary><div className="grid gap-3 sm:grid-cols-2 mt-3">{fields.map(field=><div key={field}><Label>{field}</Label><Input value={specialty[field] || ''} onChange={e=>setSpecialty({...specialty,[field]:e.target.value})}/></div>)}<div><Label>Số lượng / Khối lượng</Label><Input type="number" min={0} value={specialty['Khối lượng'] || ''} onChange={e=>setSpecialty({...specialty,'Khối lượng':e.target.value})}/></div></div></details>
      <div><Label>File / Hình tham khảo</Label><Input type="url" value={ref} onChange={e=>setRef(e.target.value)} placeholder="https://"/></div><div><Label>Deadline</Label><Input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></div>
    </>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="sticky bottom-0 flex justify-end gap-2 bg-background pt-3"><Button variant="ghost" disabled={busy} onClick={onClose}>Bỏ thay đổi</Button><Button disabled={busy || !kind} onClick={save}>{busy?'Đang lưu…':'Tạo yêu cầu'}</Button></div>
  </div>;
}