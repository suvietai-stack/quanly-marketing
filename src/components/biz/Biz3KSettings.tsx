import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useK3SettingsSave } from '@/lib/biz/k3Queries';
import { K3_STATUS, k3Error, type K3Settings, type K3Status } from '@/lib/biz/k3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { k3PeriodConfigQuery,useK3PeriodMutation } from '@/lib/biz/k3PeriodQueries';
import { useK3GoalMutation } from '@/lib/biz/k3GoalQueries';
import type { K3PeriodConfig } from '@/lib/biz/k3Periods';
import { Biz3KAutomation } from './Biz3KAutomation';

interface LogRow {
  id: number;
  changed_by: string | null;
  changed_at: string;
  snapshot: { old: unknown; new: { enabled: boolean; effective_from: string | null; plan_by: string; summary_by: string; max_focus: number } };
}

export function Biz3KSettings({ settings }: { settings: K3Settings }) {
  const save = useK3SettingsSave();
  const [f, setF] = useState({
    enabled: settings.enabled,
    effective_from: settings.effective_from ?? '',
    plan_by: settings.plan_by.slice(0, 5),
    summary_by: settings.summary_by.slice(0, 5),
    max_focus: settings.max_focus.toString(),
  });
  const { data: logs } = useQuery({
    queryKey: ['k3_settings_log'],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase.from('k3_settings_log').select('*').order('changed_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data as unknown as LogRow[];
    },
  });
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const submit = async () => {
    try {
      await save.mutateAsync({
        enabled: f.enabled,
        effective_from: f.effective_from || null,
        plan_by: f.plan_by,
        summary_by: f.summary_by,
        max_focus: Number(f.max_focus),
      });
      toast.success('Đã lưu cấu hình 3K.');
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h3 className="font-medium">Quy định thực thi</h3>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Áp dụng 3K hằng ngày</span>
          <Switch checked={f.enabled} onCheckedChange={(v) => set('enabled', v)} />
        </label>
        <div className="space-y-1">
          <Label htmlFor="k3s-from">Ngày bắt đầu áp dụng chính thức</Label>
          <Input id="k3s-from" type="date" value={f.effective_from} onChange={(e) => set('effective_from', e.target.value)} />
          <p className="text-xs text-muted-foreground">Nghĩa vụ 3K chỉ áp dụng từ ngày này; hệ thống không tạo ngày quá hạn trong lịch sử.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1"><Label htmlFor="k3s-plan">Giờ lập 3K đầu ngày</Label><Input id="k3s-plan" type="time" value={f.plan_by} onChange={(e) => set('plan_by', e.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="k3s-summary">Giờ tổng kết cuối ngày</Label><Input id="k3s-summary" type="time" value={f.summary_by} onChange={(e) => set('summary_by', e.target.value)} /></div>
        </div>
        {settings.discipline_from && <p className="text-xs text-muted-foreground">Kỷ luật đầu ngày áp dụng từ {settings.discipline_from.split('-').reverse().join('/')}.</p>}
        <div className="space-y-1">
          <Label htmlFor="k3s-focus">Số mũi khoan trọng tâm tối đa / ngày</Label>
          <Input id="k3s-focus" type="number" min={1} max={5} value={f.max_focus} onChange={(e) => set('max_focus', e.target.value)} className="w-28" />
        </div>
        <Button type="button" disabled={save.isPending} onClick={submit}>{save.isPending ? 'Đang lưu…' : 'Lưu cấu hình'}</Button>
      </div>

      <div className="space-y-4">
        <ModulePermissionSettings settings={settings} />
        <PeriodSettings/>
        <Biz3KAutomation />
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <h3 className="font-medium">Phân quyền</h3>
          <p className="text-sm text-muted-foreground">
            Phạm vi xem kế thừa từ Cơ cấu tổ chức: Trưởng Nhóm xem Nhóm, Trưởng Phòng xem Phòng, Giám Đốc Hệ xem Hệ, lãnh đạo điều hành xem toàn Khối.
            Quyền 3K chỉ đến từ bổ nhiệm hiệu lực trong Cơ cấu tổ chức; Role tổng không cấp quyền Kinh doanh. Cài đặt 3K dành cho Admin/Super Admin.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <h3 className="font-medium">Quy chuẩn trạng thái</h3>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(K3_STATUS) as K3Status[]).map((s) => <Badge key={s} variant="secondary">{K3_STATUS[s].label}</Badge>)}
          </div>
          <p className="text-xs text-muted-foreground">Công việc chưa hoàn thành khi tổng kết phải có đủ Vấn đề – Nguyên nhân – Giải pháp. Kết quả vượt kế hoạch vẫn được ghi nhận.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <h3 className="font-medium">Lịch sử cấu hình</h3>
          {!logs?.length && <p className="text-sm text-muted-foreground">Chưa có thay đổi nào được ghi nhận.</p>}
          <div className="space-y-2">
            {logs?.map((l) => (
              <div key={l.id} className="rounded-md border border-border p-2 text-xs">
                <p className="text-muted-foreground">{new Date(l.changed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
                <p>
                  {l.snapshot.new.enabled ? 'Bật' : 'Tắt'} · từ {l.snapshot.new.effective_from ?? '—'} · lập {l.snapshot.new.plan_by?.slice(0, 5)} · tổng kết {l.snapshot.new.summary_by?.slice(0, 5)} · tối đa {l.snapshot.new.max_focus} mũi khoan
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulePermissionSettings({ settings }: { settings: K3Settings }) {
  const mutation = useK3GoalMutation();
  const [f, setF] = useState({
    allow_personal_goal: settings.allow_personal_goal ?? true,
    allow_team_goal: settings.allow_team_goal ?? true,
    allow_invite: settings.allow_invite ?? true,
    allow_assign: settings.allow_assign ?? true,
  });
  const items: { key: keyof typeof f; label: string }[] = [
    { key: 'allow_personal_goal', label: 'Cho phép tạo KG cá nhân' },
    { key: 'allow_team_goal', label: 'Cho phép tạo KG nhóm / liên nhóm' },
    { key: 'allow_invite', label: 'Cho phép mời thành viên tham gia KG' },
    { key: 'allow_assign', label: 'Cho phép phân công KF cho thành viên' },
  ];
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h3 className="font-medium">Quyền nghiệp vụ 3K</h3>
      <p className="text-xs text-muted-foreground">Áp dụng cho người dùng thường; Admin/Super Admin luôn đủ quyền. Phạm vi xem vẫn theo Cơ cấu tổ chức.</p>
      {items.map((it) => (
        <label key={it.key} className="flex items-center justify-between gap-3 text-sm">
          <span>{it.label}</span>
          <Switch checked={f[it.key]} onCheckedChange={(v) => setF((p) => ({ ...p, [it.key]: v }))} />
        </label>
      ))}
      <Button type="button" size="sm" disabled={mutation.isPending} onClick={async () => {
        try {
          await mutation.mutateAsync({ kind: 'module_settings', payload: f });
          toast.success('Đã lưu quyền nghiệp vụ 3K.');
        } catch (e) {
          toast.error(k3Error(e));
        }
      }}>{mutation.isPending ? 'Đang lưu…' : 'Lưu quyền nghiệp vụ'}</Button>
    </div>
  );
}

function PeriodSettings() {
 const uid=useAuth(s=>s.currentUserId)??'';const query=useQuery(k3PeriodConfigQuery(uid));
 if(query.error)return <div><p className="text-destructive">{k3Error(query.error)}</p><Button variant="outline" onClick={()=>query.refetch()}>Thử lại</Button></div>;
 return query.data?<PeriodSettingsForm key={JSON.stringify(query.data)} config={query.data}/>:<p className="text-sm text-muted-foreground">Đang tải cài đặt Tuần/Tháng…</p>;
}
function PeriodSettingsForm({config}:{config:K3PeriodConfig}) {
 const save=useK3PeriodMutation();const [f,setF]=useState(config);
 return <section className="space-y-3 border-b border-border pb-4"><h3 className="font-medium">3K Tuần và Tháng</h3>
 {(['week','month'] as const).map(v=><label key={v} className="flex justify-between gap-2 text-sm"><span>Áp dụng 3K {v==='week'?'Tuần':'Tháng'}</span><Switch checked={f[v==='week'?'week_enabled':'month_enabled']} onCheckedChange={value=>setF({...f,[v==='week'?'week_enabled':'month_enabled']:value})}/></label>)}
 <div className="space-y-1"><Label htmlFor="k3-period-effective">Ngày bắt đầu áp dụng Tuần/Tháng</Label><Input id="k3-period-effective" type="date" value={f.period_effective_from??''} onChange={e=>setF({...f,period_effective_from:e.target.value||null})}/></div>
 <details><summary className="cursor-pointer text-sm text-primary">Deadline Tuần/Tháng</summary><div className="mt-2 space-y-3">{(['week_plan','week_summary','month_plan','month_summary'] as const).map(key=>{const d=f.period_deadlines[key];const set=(field:string,value:string)=>setF({...f,period_deadlines:{...f.period_deadlines,[key]:{offset:d?.offset??0,time:d?.time??'',effective_from:d?.effective_from??'', [field]:field==='offset'?Number(value):value}}});return <div key={key} className="space-y-2 border-b border-border pb-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!d} onChange={e=>{const next={...f.period_deadlines};if(e.target.checked)next[key]={offset:0,time:'',effective_from:''};else delete next[key];setF({...f,period_deadlines:next})}}/>{({week_plan:'Lập kế hoạch Tuần',week_summary:'Tổng kết Tuần',month_plan:'Lập kế hoạch Tháng',month_summary:'Tổng kết Tháng'})[key]}</label>{d&&<div className="grid grid-cols-2 gap-2"><div><Label>Ngày lệch từ đầu kỳ</Label><Input type="number" min={-31} max={62} value={d.offset} onChange={e=>set('offset',e.target.value)}/></div><div><Label>Giờ Việt Nam</Label><Input type="time" value={d.time} onChange={e=>set('time',e.target.value)}/></div><div className="col-span-2"><Label>Ngày hiệu lực deadline</Label><Input type="date" value={d.effective_from} onChange={e=>set('effective_from',e.target.value)}/></div></div>}</div>})}</div></details>
 <Button disabled={save.isPending} onClick={async()=>{try{await save.mutateAsync({kind:'settings',payload:{...f}});toast.success('Đã lưu cài đặt Tuần/Tháng.')}catch(e){toast.error(k3Error(e))}}}>Lưu Tuần/Tháng</Button>
 </section>;
}
