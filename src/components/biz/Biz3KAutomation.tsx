import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { k3ReportGroups } from '@/lib/biz/k3Automation.functions';
import { k3Error } from '@/lib/biz/k3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { k3DailyReport, type K3ReportPerson } from '@/lib/biz/k3DailyReport';

interface Config { auto_close: boolean; close_time: string; zalo_enabled: boolean; send_time: string; group_id?: string; group_name?: string; scope_kind: 'all'|'system'|'department'; scope_id?: string; employee_review_enabled: boolean; review_reminders: boolean; review_remind_time: string; review_second_reminder: boolean; review_second_time: string }
export function Biz3KAutomation() {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const query = useQuery({ queryKey: ['k3_automation',uid], queryFn: async () => { const { data, error } = await supabase.rpc('k3_automation_read'); if (error) throw error; return data as unknown as Config; } });
  if (query.error) return <div><p className="text-sm text-destructive">{k3Error(query.error)}</p><Button variant="outline" onClick={() => query.refetch()}>Thử lại</Button></div>;
  return query.data ? <AutomationForm key={JSON.stringify(query.data)} config={query.data} /> : <p className="text-sm text-muted-foreground">Đang tải cấu hình tự động…</p>;
}
function AutomationForm({ config }: { config: Config }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const qc = useQueryClient();
  const [f,setF] = useState(config);
  const [busy,setBusy] = useState(false);
  const [preview,setPreview] = useState<string | null>(null);
  const [previewDate,setPreviewDate] = useState(new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));
  const [groups,setGroups] = useState<{id:string;name:string}[]>(config.group_id ? [{id:config.group_id,name:config.group_name ?? config.group_id}] : []);
  const listGroups = useServerFn(k3ReportGroups);
  const units = useQuery({ queryKey: ['k3_report_units',uid], queryFn: async () => {
    const [systems,deps] = await Promise.all([supabase.from('biz_systems').select('id,name'),supabase.from('biz_departments').select('id,name')]);
    if (systems.error || deps.error) throw systems.error ?? deps.error;
    return { system:systems.data ?? [],department:deps.data ?? [] };
  } });
  const history = useQuery({ queryKey: ['k3_report_history',uid], queryFn: async () => { const {data,error} = await supabase.from('k3_zalo_reports').select('id,work_date,status,error,sent_at').order('created_at',{ascending:false}).limit(20); if(error) throw error; return data; } });
  return <section className="space-y-4 border-t border-border pt-4">
    <h3 className="font-medium">Tổng kết nhân viên</h3>
    <label className="flex items-center justify-between gap-3 text-sm"><span>Tổng kết thủ công</span><Switch checked={f.employee_review_enabled} onCheckedChange={(v) => setF({...f,employee_review_enabled:v})} /></label>
    <label className="flex items-center justify-between gap-3 text-sm"><span>Nhắc tổng kết trong Base</span><Switch checked={f.review_reminders} onCheckedChange={(v) => setF({...f,review_reminders:v})} /></label>
    <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="k3-review-time">Giờ nhắc</Label><Input id="k3-review-time" type="time" value={f.review_remind_time?.slice(0,5) ?? '17:00'} onChange={(e)=>setF({...f,review_remind_time:e.target.value})}/></div><div><Label htmlFor="k3-review-second">Giờ nhắc lần hai</Label><Input id="k3-review-second" type="time" value={f.review_second_time?.slice(0,5) ?? '17:30'} onChange={(e)=>setF({...f,review_second_time:e.target.value})}/></div></div>
    <label className="flex items-center justify-between gap-3 text-sm"><span>Nhắc lần thứ hai</span><Switch checked={f.review_second_reminder} onCheckedChange={(v)=>setF({...f,review_second_reminder:v})}/></label>
    <h3 className="border-t border-border pt-3 font-medium">Chốt dữ liệu tự động</h3>
    <label className="flex items-center justify-between gap-3 text-sm"><span>Tự động chốt sổ ngày</span><Switch checked={f.auto_close} onCheckedChange={(v) => setF({...f,auto_close:v})} /></label>
    <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><Label htmlFor="k3-auto-time">Giờ tự chốt sổ</Label><Input id="k3-auto-time" type="time" value={f.close_time.slice(0,5)} onChange={(e) => setF({...f,close_time:e.target.value})} /></div><div className="space-y-1"><Label htmlFor="k3-zalo-time">Giờ gửi Zalo</Label><Input id="k3-zalo-time" type="time" value={f.send_time.slice(0,5)} onChange={(e) => setF({...f,send_time:e.target.value})} /></div></div>
    <h3 className="border-t border-border pt-3 font-medium">Báo cáo Zalo</h3>
    <label className="flex items-center justify-between gap-3 text-sm"><span>Gửi báo cáo Zalo cuối ngày</span><Switch checked={f.zalo_enabled} onCheckedChange={(v) => setF({...f,zalo_enabled:v})} /></label>
    <div className="space-y-2"><Label>Nhóm Zalo nhận báo cáo</Label><Select value={f.group_id ?? ''} onValueChange={(v) => setF({...f,group_id:v,group_name:groups.find((g) => g.id === v)?.name})}><SelectTrigger className="w-full"><SelectValue placeholder="Chọn nhóm Zalo" /></SelectTrigger><SelectContent>{groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="sm" disabled={busy} onClick={async () => { setBusy(true); try { const result = await listGroups(); if(!result.ok) throw new Error(result.message); setGroups(result.groups); } catch(e) { toast.error(k3Error(e)); } finally { setBusy(false); } }}>Tải danh sách nhóm</Button></div>
    <div className="space-y-2"><Label>Phạm vi báo cáo</Label><Select value={f.scope_kind} onValueChange={(v: Config['scope_kind']) => setF({...f,scope_kind:v,scope_id:undefined})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Toàn Khối</SelectItem><SelectItem value="system">Theo Hệ</SelectItem><SelectItem value="department">Theo Phòng</SelectItem></SelectContent></Select>{f.scope_kind !== 'all' && <Select value={f.scope_id ?? ''} onValueChange={(v) => setF({...f,scope_id:v})}><SelectTrigger><SelectValue placeholder={f.scope_kind==='system'?'Chọn Hệ':'Chọn Phòng'} /></SelectTrigger><SelectContent>{units.data?.[f.scope_kind].map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select>}{units.error && <p className="text-sm text-destructive">{k3Error(units.error)}</p>}</div>
    <Button disabled={busy} onClick={async () => { setBusy(true); try { const {error} = await supabase.rpc('k3_automation_save',{_payload:f as never}); if(error) throw error; await qc.invalidateQueries({predicate:(q) => String(q.queryKey[0]).startsWith('k3_')}); toast.success('Đã lưu tự động chốt sổ và báo cáo Zalo.'); } catch(e) { toast.error(k3Error(e)); } finally { setBusy(false); } }}>Lưu cài đặt tự động</Button>
    <div className="flex flex-wrap gap-2"><Input aria-label="Ngày xem trước báo cáo" type="date" value={previewDate} onChange={(e)=>setPreviewDate(e.target.value)} className="w-40"/><Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true);try{const {data,error}=await supabase.rpc('k3_zalo_report_preview',{_date:previewDate});if(error)throw error;const people=data as unknown as K3ReportPerson[];setPreview(people.length?k3DailyReport(previewDate,people):'Chưa có bản chốt hệ thống trong phạm vi đã lưu.');}catch(e){toast.error(k3Error(e));}finally{setBusy(false);}}}>Xem trước báo cáo đã chốt</Button></div>
    {preview&&<pre className="whitespace-pre-wrap break-words border-y border-border py-3 text-sm">{preview}</pre>}
    <div className="space-y-2"><h4 className="text-sm font-medium">Lịch sử gửi báo cáo</h4>{history.error && <p className="text-sm text-destructive">{k3Error(history.error)}</p>}{!history.data?.length && <p className="text-sm text-muted-foreground">Chưa có báo cáo gửi.</p>}{history.data?.map((r) => <div key={r.id} className="border-b border-border py-2 text-sm"><p>{r.work_date} · {({pending:'Chờ gửi',sending:'Đang gửi',sent:'Đã gửi',failed:'Gửi lỗi',unknown:'Cần đối soát',skipped:'Bỏ qua'} as Record<string,string>)[r.status]}</p>{r.error && <p className="text-xs text-destructive">{r.error}</p>}</div>)}</div>
  </section>;
}