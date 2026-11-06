import { useEffect,useRef,useState } from 'react';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { Plus,Pencil,EyeOff,Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet,SheetContent,SheetHeader,SheetTitle } from '@/components/ui/sheet';
import { listSignalLabels,saveSignalLabel,saveSignalEnrichment,errMsg } from '@/lib/signals/api';
import { POTENTIAL_LABEL,potentialOf,type Potential,type SignalLabel } from '@/lib/signals/potential';
import type { Signal } from '@/lib/signals/catalog';

export function useSignalLabels(uid: string|null) {
  return useQuery({queryKey:['sig:labels',uid],queryFn:listSignalLabels,enabled:!!uid});
}
export function PotentialPill({s}:{s:Signal}) {
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${potentialOf(s)==='high'?'bg-warning/20 text-warning-foreground':'bg-muted text-muted-foreground'}`}>{POTENTIAL_LABEL[potentialOf(s)]}</span>;
}
export function SignalLabelPills({s,labels}:{s:Signal;labels:SignalLabel[]}) {
  const selected=labels.filter(l=>s.label_ids?.includes(l.id));
  return <>{selected.slice(0,2).map(l=><span key={l.id} className="max-w-36 truncate rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground" title={l.name}>{l.name}</span>)}{selected.length>2&&<span className="text-xs text-muted-foreground">+{selected.length-2}</span>}</>;
}
export function SignalLabelManager({uid,catalog,sale,personalOnly=false}:{uid:string|null;catalog:boolean;sale:boolean;personalOnly?:boolean}) {
  const q=useSignalLabels(uid); const qc=useQueryClient();
  const [edit,setEdit]=useState<SignalLabel|null>(null); const [name,setName]=useState('');
  const [personal,setPersonal]=useState(personalOnly||!catalog); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const lock=useRef(false);
  const run=async(id:string|null,n:string,p:boolean,active=true)=>{
    if(lock.current) return; lock.current=true;setBusy(true);setError('');
    try {await saveSignalLabel(id,n,p,active);await qc.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith('sig:')});setEdit(null);setName('');}
    catch(e){setError(errMsg(e));}finally{lock.current=false;setBusy(false);}
  };
  const rows=(q.data??[]).filter(l=>personalOnly?l.owner_id===uid:(l.owner_id===uid||catalog));
  return <section className="space-y-3 min-w-0">
    <h3 className="font-semibold">{personalOnly?'Nhãn cá nhân':'Nhãn tín hiệu'}</h3>
    {q.error&&<p className="text-sm text-destructive">{errMsg(q.error)}</p>}
    {(sale||catalog)&&<form className="space-y-2" onSubmit={e=>{e.preventDefault();void run(edit?.id??null,name,edit?!!edit.owner_id:personal,edit?.active??true);}}>
      <Input aria-label="Tên nhãn" value={name} maxLength={100} onChange={e=>setName(e.target.value)} placeholder="Tên nhãn" />
      <div className="flex gap-2 items-center">
        {!personalOnly&&catalog&&sale&&!edit&&<select aria-label="Loại nhãn" className="h-11 rounded-md border bg-background px-2 text-sm" value={personal?'personal':'common'} onChange={e=>setPersonal(e.target.value==='personal')}><option value="personal">Cá nhân</option><option value="common">Chung</option></select>}
        <Button type="submit" disabled={busy||!name.trim()}><Plus className="h-4 w-4 mr-1"/>{edit?'Lưu tên':'Thêm nhãn'}</Button>
        {edit&&<Button variant="ghost" type="button" onClick={()=>{setEdit(null);setName('');}}>Hủy</Button>}
      </div>
    </form>}
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    <ul className="divide-y">{rows.map(l=><li key={l.id} className="flex gap-2 items-center py-2 text-sm"><span className={`min-w-0 flex-1 break-words ${!l.active?'text-muted-foreground line-through':''}`}>{l.name}<span className="block text-xs text-muted-foreground">{l.owner_id?'Cá nhân':'Chung'}</span></span><Button variant="ghost" size="icon" title="Đổi tên" aria-label={`Đổi tên ${l.name}`} disabled={busy} onClick={()=>{setEdit(l);setName(l.name);}}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" title={l.active?'Ẩn':'Dùng lại'} aria-label={`${l.active?'Ẩn':'Dùng lại'} ${l.name}`} disabled={busy} onClick={()=>void run(l.id,l.name,!!l.owner_id,!l.active)}>{l.active?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</Button></li>)}</ul>
  </section>;
}
export function SignalEnrichment({s,uid,canEdit,catalog,sale,onSaved}:{s:Signal;uid:string|null;canEdit:boolean;catalog:boolean;sale:boolean;onSaved:()=>void}) {
  const q=useSignalLabels(uid);const [open,setOpen]=useState(false);
  const [potential,setPotential]=useState<Potential>(potentialOf(s));const [ids,setIds]=useState<string[]>(s.label_ids??[]);
  const [next,setNext]=useState(s.next_contact_on??'');const [hour,setHour]=useState('');
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const lock=useRef(false);const request=useRef<{payload:string;id:string}|null>(null);
  const [manage,setManage]=useState(false);
  useEffect(()=>{if(open){setPotential(potentialOf(s));setIds(s.label_ids??[]);setNext(s.next_contact_on??'');setHour(s.next_contact_at?new Date(Date.parse(s.next_contact_at)+7*3600000).toISOString().slice(11,16):'');setError('');}},[open,s.id]);
  const save=async()=>{
    if(lock.current||q.isPending||q.error)return;
    if(hour&&!next){setError('Chọn ngày theo dõi trước khi nhập giờ');return;}
    const nextAt=next&&hour?new Date(`${next}T${hour}:00+07:00`).toISOString():null;
    const payload=JSON.stringify([s.id,potential,[...ids].sort(),next,nextAt]);
    if(request.current?.payload!==payload) request.current={payload,id:crypto.randomUUID()};
    lock.current=true;setBusy(true);setError('');
    try{await saveSignalEnrichment(s.id,request.current.id,potential,ids,next||null,nextAt);onSaved();setOpen(false);}
    catch(e){setError(errMsg(e));}finally{lock.current=false;setBusy(false);}
  };
  const close=(value:boolean)=>{if(busy)return;if(!value&&(potential!==potentialOf(s)||JSON.stringify([...ids].sort())!==JSON.stringify([...(s.label_ids??[])].sort())||next!==(s.next_contact_on??'')||hour!==(s.next_contact_at?new Date(Date.parse(s.next_contact_at)+7*3600000).toISOString().slice(11,16):''))&&!window.confirm('Bỏ các thay đổi chưa lưu?'))return;setOpen(value);};
  return <section className="space-y-2">
    <div className="flex flex-wrap gap-1.5 items-center"><PotentialPill s={s}/><SignalLabelPills s={s} labels={q.data??[]}/>{canEdit&&<Button variant="outline" size="sm" className="min-h-11" onClick={()=>setOpen(true)}><Pencil className="h-3.5 w-3.5 mr-1"/>Tiềm năng · Nhãn · Lịch</Button>}</div>
    {s.potential_updated_at&&<p className="text-xs text-muted-foreground">Đánh giá {new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'short',timeStyle:'short'}).format(new Date(s.potential_updated_at))}</p>}
    <Sheet open={open} onOpenChange={close}><SheetContent side="bottom" className="signal-mobile-sheet max-h-[90dvh] overflow-y-auto p-0 sm:max-w-xl sm:mx-auto"><SheetHeader className="p-4"><SheetTitle>Tiềm năng, nhãn và lịch theo dõi</SheetTitle></SheetHeader><div className="px-4 pb-4 space-y-4">
      <label className="block space-y-1 text-sm">Mức độ tiềm năng<select aria-label="Mức độ tiềm năng" className="h-11 w-full rounded-md border bg-background px-2" value={potential} onChange={e=>setPotential(e.target.value as Potential)}>{Object.entries(POTENTIAL_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <fieldset className="space-y-2"><legend className="text-sm font-medium mb-2">Nhãn</legend>{q.isPending?<p>Đang tải nhãn…</p>:q.error?<p className="text-destructive">{errMsg(q.error)}</p>:(q.data??[]).filter(l=>(l.active||ids.includes(l.id))&&(!l.owner_id||s.assigned_to===uid||ids.includes(l.id))).map(l=><label key={l.id} className="flex gap-2 items-center min-h-11 text-sm"><Checkbox checked={ids.includes(l.id)} onCheckedChange={v=>setIds(x=>v?[...x,l.id]:x.filter(i=>i!==l.id))}/><span>{l.name}{l.owner_id?' · Cá nhân':''}{!l.active?' · Đã ẩn':''}</span></label>)}</fieldset>
      {(sale||catalog)&&<Button type="button" variant="outline" onClick={()=>setManage(v=>!v)}>Quản lý nhãn</Button>}
      {manage&&<SignalLabelManager uid={uid} catalog={catalog} sale={sale}/>}
      <div className="grid grid-cols-2 gap-3"><label className="block space-y-1 text-sm">Ngày theo dõi<Input aria-label="Ngày theo dõi" type="date" value={next} disabled={s.status==='won'||s.status==='lost'} onChange={e=>setNext(e.target.value)}/></label><label className="block space-y-1 text-sm">Giờ (tùy chọn)<Input aria-label="Giờ theo dõi" type="time" value={hour} disabled={s.status==='won'||s.status==='lost'} onChange={e=>setHour(e.target.value)}/></label></div>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    </div><div className="sticky bottom-0 bg-background border-t p-3"><Button className="w-full min-h-12" disabled={busy||q.isPending||!!q.error} onClick={()=>void save()}>{busy?'Đang lưu…':'Lưu thay đổi'}</Button></div></SheetContent></Sheet>
  </section>;
}