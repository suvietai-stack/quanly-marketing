import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResetPreview { goals:number;goal_versions:number;goal_items:number;goal_events:number;plans:number;reports:number;document_versions:number;document_events:number;document_views:number;late_requests:number;approval_runs:number;approval_events:number;notifications:number;le_minh_ngoc:number;backups:number }

const ROWS:[keyof ResetPreview,string][]=[
 ['plans','Kế hoạch (mọi kỳ, gồm bản nháp và phiên bản)'],
 ['reports','Báo cáo (mọi kỳ, gồm số thực tế KR)'],
 ['goals','Mục tiêu KR năm do nhân viên lập'],
 ['goal_versions','Phiên bản mục tiêu KR'],
 ['document_versions','Phiên bản Kế hoạch/Báo cáo'],
 ['late_requests','Yêu cầu và quyền nộp bù'],
 ['approval_runs','Luồng phê duyệt đang chạy/đã chạy'],
 ['approval_events','Bước xét duyệt của các luồng trên'],
 ['document_views','Trạng thái đã mở tài liệu'],
 ['notifications','Thông báo gắn với hồ sơ bị reset'],
];

/** Reset sạch dữ liệu nghiệp vụ Quản trị Kinh doanh — chỉ Super Admin, có sao lưu riêng tư và nhật ký. */
export function BizReset() {
  const uid=useAuth(s=>s.currentUserId)??'';
  const qc=useQueryClient();
  const [confirm,setConfirm]=useState('');
  const [busy,setBusy]=useState(false);
  const preview=useQuery({queryKey:['biz_reset_preview',uid],enabled:!!uid,queryFn:async()=>{const {data,error}=await supabase.rpc('biz_reset_preview');if(error)throw error;return data as unknown as ResetPreview;}});

  const run=async()=>{
    setBusy(true);
    try{
      const {data,error}=await supabase.rpc('biz_reset_execute',{_confirm:confirm});
      if(error)throw error;
      const r=data as {counts:Record<string,number>};
      toast.success(`Đã reset ${r.counts.plans+r.counts.reports} hồ sơ Kế hoạch/Báo cáo, ${r.counts.goals} mục tiêu KR. Dữ liệu cũ đã được sao lưu an toàn.`);
      setConfirm('');
      await qc.invalidateQueries();
      await preview.refetch();
    }catch(e){toast.error(e instanceof Error?e.message:String(e));}
    finally{setBusy(false);}
  };

  const p=preview.data;
  const total=p?p.plans+p.reports+p.goals:0;
  return <section className="rounded-xl border border-destructive/40 bg-card p-4 space-y-4">
    <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive"/><h3 className="font-semibold">Reset dữ liệu nghiệp vụ Quản trị Kinh doanh</h3></div>
    <p className="text-sm text-muted-foreground">Đưa toàn bộ Kế hoạch, Mục tiêu KR, Báo cáo, yêu cầu nộp bù và hồ sơ phê duyệt liên quan về trạng thái chưa sử dụng. <strong>Cơ cấu tổ chức, chức vụ, bổ nhiệm, phân quyền, danh mục KR, deadline và quy trình phê duyệt được giữ nguyên.</strong> Dữ liệu cũ được sao lưu riêng tư trước khi xóa và có nhật ký thao tác.</p>
    {preview.isPending&&<p className="text-sm text-muted-foreground">Đang thống kê dữ liệu…</p>}
    {preview.error&&<p role="alert" className="text-sm text-destructive">{preview.error.message}</p>}
    {p&&<><div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
      {ROWS.map(([k,label])=><div key={k} className="flex justify-between gap-3 border-b py-1.5"><span className="text-muted-foreground">{label}</span><strong className="tabular-nums">{p[k]}</strong></div>)}
    </div>
    {p.le_minh_ngoc>0&&<p className="text-sm text-warning">Có {p.le_minh_ngoc} hồ sơ của Lê Minh Ngọc nằm trong phạm vi reset.</p>}
    <p className="text-xs text-muted-foreground">Bản sao lưu hiện có: {p.backups} · Tổng hồ sơ chính sẽ reset: {total}</p>
    <div className="space-y-2 border-t pt-4">
      <Label htmlFor="biz-reset-confirm">Nhập <strong>RESET KINH DOANH</strong> để xác nhận</Label>
      <Input id="biz-reset-confirm" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="RESET KINH DOANH" autoComplete="off"/>
      <Button variant="destructive" disabled={busy||confirm!=='RESET KINH DOANH'} onClick={run}><Trash2 className="h-4 w-4 mr-2"/>{busy?'Đang reset…':'Reset sạch dữ liệu nghiệp vụ'}</Button>
    </div></>}
  </section>;
}
