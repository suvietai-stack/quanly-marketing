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
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const STEPS = ['Loại công việc', 'Giao người thực hiện', 'Tài liệu & xác nhận'] as const;
type FormStep = 0 | 1 | 2;

/** Mobile-first, three-step Job creation. The server still enforces every rule. */
export function DesignWorkForm({ flow, onClose }: {flow?: DesignFlow; onClose:()=>void}) {
  const store=useStore();
  const {user,can}=useCurrentUser();
  const [step,setStep]=useState<FormStep>(0);
  const [kind,setKind]=useState<DesignFlow|undefined>(flow);
  const [id]=useState(uid);
  const [title,setTitle]=useState('');
  const [classification,setClassification]=useState<Partial<DesignOrder>>({});
  const [uploading,setUploading]=useState(false);
  const catalogs=useDesignCatalogs();
  const [brief,setBrief]=useState('');
  const [deadline,setDeadline]=useState('');
  const [assignee,setAssignee]=useState('');
  const [assigneeId,setAssigneeId]=useState('');
  const [reviewer,setReviewer]=useState(user?.fullName || user?.username || '');
  const [specialty,setSpecialty]=useState<Record<string,string>>({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const fields=kind==='photo'
    ? ['Sản phẩm / Đối tượng','Mục đích sử dụng','Concept','Địa điểm','Thời gian dự kiến']
    : kind==='order_mockup'
      ? ['Khách hàng / Đơn vị','Mã đơn hàng','Nội dung in','Vị trí in / trang trí','Yêu cầu kỹ thuật']
      : ['Mục đích sử dụng','Kênh sử dụng','Nội dung thiết kế','Kích thước / Định dạng'];
  const firstReady=!!kind && !!title.trim() && !!classification.workCategoryId && designCan(can,kind,'create');
  const reviewerReady=!!assigneeId && !!assignee && !!reviewer.trim() && reviewer.trim()!==assignee;
  function goNext() {
    setError('');
    if(step===0){
      if(!firstReady){setError('Chọn loại thiết kế, loại công việc và nhập tên Job.');return;}
      setStep(1);
    }else if(step===1){
      if(!reviewerReady){setError('Chọn nhân viên thực hiện và người duyệt khác nhau.');return;}
      setStep(2);
    }
  }
  async function save(){
    if(!firstReady){setStep(0);setError('Chọn loại, danh mục và tên Job.');return;}
    if(!reviewerReady){setStep(1);setError('Cần chọn người thực hiện và người duyệt khác nhau.');return;}
    if(!kind || busy || uploading)return;
    const other=normalizeProducts(classification.productIds || [],classification.otherProducts || [],catalogs.data || []);
    if((catalogs.data || []).some(c=>c.is_other && c.kind==='product' && classification.productIds?.includes(c.id)) && !other.length){
      setError('Nhập ít nhất một tên sản phẩm khác.');return;
    }
    const name=user?.fullName || user?.username || '';
    setBusy(true);setError('');
    try{
      await saveDesignOrder(id,{
        id,title:title.trim(),brandId:'',workflowKind:kind,type:'Khác',...classification,otherProducts:other,
        source:'Task lẻ',requester:name,reviewer:reviewer.trim(),assignee,assigneeId,
        status:'Chờ nhận việc',brief,deadline:deadline || undefined,specialty,revisions:0,
        history:[{at:new Date().toISOString(),byId:user?.id,byName:name,action:'Tạo Job và giao trực tiếp',toStatus:'Chờ nhận việc'}],
      });
      await store.reload();
      onClose();
    }catch(e){setError(e instanceof Error?e.message:'Không lưu được Job.');}
    finally{setBusy(false);}
  }
  return <div className="min-w-0 space-y-4">
    <nav aria-label="Các bước tạo Job">
      <ol className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {STEPS.map((label,i)=><li key={label}>
          <button type="button" disabled={busy||uploading||i>step} onClick={()=>{setError('');setStep(i as FormStep);}}
            aria-current={i===step?'step':undefined}
            className={`flex min-h-12 w-full items-center gap-1.5 rounded-lg border p-2 text-left text-xs sm:text-sm ${i===step?'border-primary bg-primary/10 font-semibold':i<step?'border-primary/40 text-foreground':'text-muted-foreground'}`}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current/30">{i<step?<Check className="size-4"/>:i+1}</span>
            <span className="min-w-0 leading-tight">{label}</span>
          </button>
        </li>)}
      </ol>
    </nav>

    {step===0&&<section className="space-y-4" aria-label="Bước 1: Loại công việc">
      {!flow&&<div className="space-y-1.5">
        <Label>Hệ Thiết kế *</Label>
        <Select disabled={uploading||!!classification.inputAttachments?.length} value={kind||''}
          onValueChange={v=>{setKind(v as DesignFlow);setSpecialty({});setClassification({});setAssignee('');setAssigneeId('');}}>
          <SelectTrigger className="min-h-11"><SelectValue placeholder="Chọn Chụp ảnh, Marketing hoặc Ma-két"/></SelectTrigger>
          <SelectContent>{DESIGN_FLOWS.filter(f=>designCan(can,f.key,'create')).map(f=>
            <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>}
      {kind&&<>
        <div className="space-y-1.5"><Label>Tên Job *</Label>
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ví dụ: Bộ ảnh sản phẩm tháng 11" className="min-h-11"/>
        </div>
        <DesignClassification flow={kind} value={classification} onChange={p=>setClassification(c=>({...c,...p}))}/>
      </>}
    </section>}

    {step===1&&kind&&<section className="space-y-4" aria-label="Bước 2: Giao người thực hiện">
      <p className="text-sm text-muted-foreground">Chọn người làm ngay khi tạo Job. Nhân viên Thiết kế có thể chuyển việc cho nhau sau đó.</p>
      <DesignAssigneePicker flow={kind} value={assignee} valueId={assigneeId}
        onChange={(name,id)=>{setAssignee(name||'');setAssigneeId(id||'');}}
        required disabled={busy||uploading}/>
      <div className="space-y-1.5"><Label>Người duyệt *</Label>
        <Input className="min-h-11" value={reviewer} onChange={e=>setReviewer(e.target.value)} placeholder="Chọn người xác nhận sản phẩm"/>
        {assignee && reviewer.trim()===assignee&&<p className="text-xs text-destructive">Người duyệt phải khác người thực hiện.</p>}
      </div>
      <div className="space-y-1.5"><Label>Hạn hoàn thành</Label>
        <Input className="min-h-11" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/>
      </div>
      <div className="space-y-1.5"><Label>Nội dung yêu cầu</Label>
        <Textarea value={brief} onChange={e=>setBrief(e.target.value)} rows={4}
          placeholder="Mô tả yêu cầu, mong muốn và kết quả cần bàn giao"/>
      </div>
    </section>}

    {step===2&&kind&&<section className="space-y-4" aria-label="Bước 3: Tài liệu và xác nhận">
      <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
        <h3 className="text-sm font-semibold">Kiểm tra trước khi tạo</h3>
        <p className="text-sm"><span className="text-muted-foreground">Hệ:</span> {designLabel(kind)}</p>
        <p className="text-sm"><span className="text-muted-foreground">Loại công việc:</span> {classification.workCategoryName||'—'}</p>
        <p className="text-sm"><span className="text-muted-foreground">Tên:</span> {title.trim()}</p>
        <p className="text-sm"><span className="text-muted-foreground">Người thực hiện:</span> <strong>{assignee}</strong></p>
        <p className="text-sm"><span className="text-muted-foreground">Người duyệt:</span> {reviewer}</p>
        <p className="text-sm"><span className="text-muted-foreground">Deadline:</span> {deadline||'Chưa đặt'}</p>
      </div>
      <div className="space-y-1.5">
        <Label>Tài liệu đầu vào (không bắt buộc)</Label>
        <DesignAttachments orderId={id} flow={kind} value={classification.inputAttachments||[]}
          onChange={inputAttachments=>setClassification(c=>({...c,inputAttachments}))} onBusy={setUploading}/>
      </div>
      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer text-sm font-medium">Thông tin bổ sung (tùy chọn)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {fields.map(field=><div key={field} className="space-y-1"><Label>{field}</Label>
            <Input value={specialty[field]||''} onChange={e=>setSpecialty({...specialty,[field]:e.target.value})}/>
          </div>)}
          <div className="space-y-1"><Label>Số lượng / Khối lượng</Label>
            <Input type="number" min={0} value={specialty['Khối lượng']||''}
              onChange={e=>setSpecialty({...specialty,'Khối lượng':e.target.value})}/>
          </div>
        </div>
      </details>
    </section>}

    {error&&<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t bg-background pt-3 pb-1">
      <Button variant="outline" disabled={busy||uploading} onClick={()=>step===0?onClose():(setStep((step-1) as FormStep),setError(''))}>
        {step===0?'Hủy':<><ArrowLeft className="mr-1 size-4"/>Quay lại</>}
      </Button>
      {step<2
        ? <Button disabled={busy||uploading||(step===0?!firstReady:!reviewerReady)} onClick={goNext}>
            Tiếp tục <ArrowRight className="ml-1 size-4"/>
          </Button>
        : <Button disabled={busy||uploading||!firstReady||!reviewerReady} onClick={save}>
            {busy?'Đang lưu…':'Tạo Job & giao việc'}
          </Button>}
    </div>
  </div>;
}
