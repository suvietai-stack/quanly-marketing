import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RoleCatalog } from '@/lib/basePermissions/roleCatalog';
import type { Preview } from '@/lib/basePermissions/types';
import { baseOrgApi } from '@/lib/basePermissions/api';
import { useAuth } from '@/lib/auth';
import { isCanonicalRole } from '@/lib/basePermissions/defaultRolePresets';

export function SlotRoleReplacement({ catalog }: { catalog: RoleCatalog }) {
  const qc = useQueryClient();
  const [slotId,setSlotId]=useState(''); const [roleId,setRoleId]=useState('');
  const [preview,setPreview]=useState<Preview|null>(null); const [reason,setReason]=useState('');
  const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const run=async(fn:()=>Promise<void>)=>{setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'Không thực hiện được.');}finally{setBusy(false);}};
  if(!catalog.slots.some(s=>s.active)) return null;
  return <div className="space-y-2 border-t pt-3"><h3 className="font-medium">Thay Role ô vị trí</h3><div className="flex flex-wrap gap-2"><Select value={slotId} onValueChange={v=>{setSlotId(v);setRoleId('');}}><SelectTrigger className="sm:w-72" aria-label="Ô thay Role"><SelectValue placeholder="Chọn ô"/></SelectTrigger><SelectContent>{catalog.slots.filter(s=>s.active).map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><Select value={roleId} onValueChange={setRoleId}><SelectTrigger className="sm:w-72" aria-label="Role thay thế ô"><SelectValue placeholder="Role thay thế"/></SelectTrigger><SelectContent>{catalog.roles.filter(r=>isCanonicalRole(r)&&r.role_kind==='position'&&r.catalog_state==='standard'&&!r.is_system&&r.id!==catalog.slots.find(s=>s.id===slotId)?.role_id).map(r=><SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><Button disabled={busy||!slotId||!roleId} onClick={()=>run(async()=>{const org=await baseOrgApi.read();setPreview(await baseOrgApi.preview(org.revision,org.config,org.config,[{action:'replace_slot_role',data:{id:slotId,role_id:roleId}}]));setReason('');})}>Xem trước thay Role</Button></div>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Dialog open={!!preview} onOpenChange={v=>!busy&&!v&&setPreview(null)}><DialogContent className="max-h-[85dvh] overflow-auto"><DialogHeader><DialogTitle>Thay Role — giữ lịch sử ô cũ</DialogTitle></DialogHeader>{preview?.impact.map(i=><div className="border-b py-2" key={i.user_id}><p className="font-medium">{i.name}</p>{i.changes.map(c=><p className="text-sm" key={c.key}>{c.label}: {c.before.allowed?'Có':'Không'} → {c.after.allowed?'Có':'Không'}</p>)}</div>)}<Label>Lý do</Label><Input value={reason} onChange={e=>setReason(e.target.value)}/>{error&&<p className="text-destructive">{error}</p>}<Button disabled={busy||!reason.trim()} onClick={()=>run(async()=>{if(!preview)return;await baseOrgApi.apply(preview.id,'ÁP DỤNG CƠ CẤU',reason);setPreview(null);await qc.invalidateQueries();await useAuth.getState().reload();})}>Xác nhận thay Role</Button></DialogContent></Dialog></div>;
}