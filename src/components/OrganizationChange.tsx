import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AssignmentSpecialties } from './AppointmentPermissionSummary';
import { changeAppointmentSpecialties, endAppointment } from '@/lib/basePermissions/appointment';
import { orgConfigDiff } from '@/lib/orgStructure';
import type { OrgConfig, Preview } from '@/lib/basePermissions/types';

export function OrganizationChange({config,id,specialty=false,onClose,onPreview,onApply}:{config:OrgConfig;id:string;specialty?:boolean;onClose:()=>void;onPreview:(next:OrgConfig)=>Promise<Preview>;onApply:(p:Preview,reason:string)=>Promise<void>}) {
 const m=config.memberships.find(x=>x.id===id);
 const [selected,setSelected]=useState(m?.specialty_ids??[]);
 const [preview,setPreview]=useState<Preview|null>(null);
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [saved,setSaved]=useState(false);
 const run=async(fn:()=>Promise<void>)=>{setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}};
 const title=specialty?'Nhiệm vụ Marketing':'Miễn nhiệm';
 return <Dialog open onOpenChange={v=>!v&&!busy&&onClose()}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>{saved?<><p>Đã lưu và cập nhật sơ đồ.</p><Button onClick={onClose}>Đóng</Button></>:preview?<><div className="space-y-2">{orgConfigDiff(preview.before,preview.after).map((line,i)=><p key={i} className="text-sm">{line}</p>)}{preview.impact.map(p=><div key={p.user_id}><p className="font-medium">{p.name}</p>{p.changes.map(c=><p key={c.key} className="text-sm">{c.label}: {c.before.allowed?'Có':'Không'} → {c.after.allowed?'Có':'Không'}</p>)}</div>)}</div><Button disabled={busy} onClick={()=>run(async()=>{await onApply(preview,title);setSaved(true);})}>Xác nhận {title.toLocaleLowerCase('vi')}</Button></>:<>{specialty?<AssignmentSpecialties selected={selected} onChange={setSelected}/>:<p>Kết thúc phân công này; giữ lịch sử và quyền từ nguồn khác.</p>}<Button disabled={busy} onClick={()=>run(async()=>{const at=new Date(Date.now()-2000).toISOString();setPreview(await onPreview(specialty?changeAppointmentSpecialties(config,id,selected,at):endAppointment(config,id,at)));})}>Xem trước</Button></>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</DialogContent></Dialog>;
}