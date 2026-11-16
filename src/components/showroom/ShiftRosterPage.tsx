import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeftRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, Copy, HelpCircle, Loader2, Settings2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { showroomOverviewRead } from '@/lib/showroom/api';
import {
  readShowroomRoster, showroomRosterAction, SHIFT_LABELS, SHIFT_OPTIONS,
  upcomingWeek, mondayOf, vnToday, dateAdd, weekLabel, restCount, shiftDateLabel,
  type ShiftRoster, type ShiftPolicy, type ShowroomShift, type ShiftPerson, type ShiftChange,
} from '@/lib/showroom/shifts';

type View = 'mine' | 'team' | 'changes' | 'approve' | 'settings';
const weekdays=['T2','T3','T4','T5','T6','T7','CN'];
const weekdayFull=['Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy','Chủ nhật'];
const classSelect='h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const statusLabel:Record<ShiftChange['status'],string>={
  pending_peer:'Chờ đồng nghiệp',pending_manager:'Chờ quản lý',approved:'Đã duyệt',
  rejected:'Từ chối',cancelled:'Đã thu hồi',
};
const codeColor:Record<ShowroomShift,string>={
  early:'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200',
  late:'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200',
  full:'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200',
  off:'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
};
const HelpButton=({question}:{question:string})=><Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={()=>{
  window.dispatchEvent(new CustomEvent('suviet-ai-open',{detail:{question}}));
}}><HelpCircle className="h-4 w-4"/>Hỏi Đốm</Button>;

function ShiftTag({code}:{code:ShowroomShift|null|undefined}){
  if(!code)return <span className="text-xs text-muted-foreground">Chưa chọn</span>;
  return <span className={`inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${codeColor[code]}`}>{SHIFT_LABELS[code]}</span>;
}
function DayAlert({item,policy}:{item:ShiftRoster['days'][number];policy:ShiftPolicy}){
  if(item.holiday)return <Badge variant="outline">Nghỉ lễ</Badge>;
  const ok=item.missing_early===0&&item.missing_late===0;
  return ok?<span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5"/>Đủ ca</span>:
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><AlertTriangle className="h-3.5 w-3.5"/>
      {item.full>0?'Ca Full · ngoại lệ':`Thiếu ${item.missing_early?('Ca 1'+(item.missing_late?' + ':'')):''}${item.missing_late?'Ca 2':''}`}
    </span>;
}
function WeekButtons({week,setWeek}:{week:string;setWeek:(week:string)=>void}){
  return <div className="flex min-h-11 items-center justify-between gap-2 rounded-xl border bg-card px-2 py-1.5">
    <Button type="button" variant="ghost" size="icon" aria-label="Tuần trước" onClick={()=>setWeek(dateAdd(week,-7))}><ChevronLeft className="h-5 w-5"/></Button>
    <div className="min-w-0 text-center"><p className="text-sm font-semibold">Tuần {weekLabel(week)}</p><p className="text-[11px] text-muted-foreground">{week===upcomingWeek()?'Tuần kế tiếp':week===mondayOf(vnToday())?'Tuần hiện tại':'Lịch theo tuần'}</p></div>
    <Button type="button" variant="ghost" size="icon" aria-label="Tuần sau" onClick={()=>setWeek(dateAdd(week,7))}><ChevronRight className="h-5 w-5"/></Button>
  </div>;
}

function Registration({roster,week,mutate,loading,onChange}:{roster:ShiftRoster;week:string;mutate:(action:string,payload:Record<string,unknown>)=>Promise<void>;loading:boolean;onChange:(open:boolean,day?:string)=>void}){
  const mine=roster.entries.filter(e=>e.staff_id===roster.actor_id);
  const [draft,setDraft]=useState<ShowroomShift[]>(Array(7).fill('early'));
  const saved=Array.from({length:7},(_,i)=>mine.find(e=>e.date===dateAdd(week,i)));
  useEffect(()=>{
    setDraft(Array.from({length:7},(_,i)=>roster.entries.find(e=>e.date===dateAdd(week,i)&&e.staff_id===roster.actor_id)?.requested??(roster.policy.holidays.includes(dateAdd(week,i))?'off':'early')));
  },[roster,week]);
  const now=new Date(roster.server_now).getTime();
  const open=now>=new Date(roster.window.open_at).getTime()&&now<new Date(roster.window.close_at).getTime()&&roster.week_status==='draft';
  const canEdit=roster.can_register&&open;
  const rest=restCount(draft,week,roster.policy.holidays);
  const submitted=saved.every(Boolean);
  const closeText=new Date(roster.window.close_at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
  const openText=new Date(roster.window.open_at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
  const reset=async()=>{
    try{
      const previous=await readShowroomRoster(roster.store_id,dateAdd(week,-7));
      const codes=Array.from({length:7},(_,i)=>previous.entries.find(e=>e.staff_id===roster.actor_id&&e.date===dateAdd(week,-7+i))?.requested??'early');
      setDraft(codes);
      toast.success('Đã sao chép. Kiểm tra lại trước khi gửi.');
    }catch(e){toast.error(e instanceof Error?e.message:'Chưa sao chép được lịch.');}
  };
  return <div className="space-y-3">
    <div className="flex items-start justify-between gap-2 rounded-xl border bg-card p-3">
      <div className="space-y-1"><p className="text-sm font-semibold">{roster.week_status==='published'?'Lịch đã công bố':open?'Đang mở đăng ký':'Đăng ký chưa mở / đã khóa'}</p>
        <p className="text-xs leading-5 text-muted-foreground">Mở: {openText} · Khóa: {closeText}</p>
        {submitted&&<p className="text-xs text-emerald-700">Đã có đăng ký của bạn trong tuần này.</p>}
      </div>
      {canEdit&&<Button type="button" size="sm" variant="outline" className="shrink-0 gap-1" onClick={()=>void reset()}><Copy className="h-3.5 w-3.5"/>Tuần trước</Button>}
    </div>
    <div className="space-y-2">
      {weekdays.map((day,i)=>{
        const date=dateAdd(week,i),e=saved[i],current=roster.week_status==='published'?(e?.shift??null):draft[i];
        return <div key={date} className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3">
          <div className="w-16 shrink-0 text-center"><p className="text-sm font-bold">{day}</p><p className="text-xs text-muted-foreground">{shiftDateLabel(date)}</p></div>
          <div className="min-w-0 flex-1">
            {canEdit?<select aria-label={`Ca ${day}`} className={classSelect} value={draft[i]} onChange={e=>setDraft(x=>x.map((v,j)=>j===i?e.target.value as ShowroomShift:v))}>
              {SHIFT_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
            </select>:<div className="min-h-11 flex items-center"><ShiftTag code={current}/></div>}
            {roster.policy.holidays.includes(date)&&<p className="mt-1 text-xs text-muted-foreground">Ngày nghỉ lễ</p>}
          </div>
          {roster.week_status==='published'&&roster.can_swap&&e&&<Button type="button" variant="outline" size="sm" className="min-h-10 shrink-0" onClick={()=>onChange(true,date)}>Đổi</Button>}
        </div>;
      })}
    </div>
    {canEdit&&<>
      <div className={`rounded-xl px-3 py-2 text-sm ${rest===roster.policy.rest_days?'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100':'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100'}`}>
        {rest===roster.policy.rest_days?<span className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4"/>Đã chọn {rest} ngày nghỉ/tuần.</span>:`Cần chọn đúng ${roster.policy.rest_days} ngày nghỉ/tuần (không tính ngày lễ). Hiện có ${rest}.`}
      </div>
      <Button type="button" className="h-12 w-full text-base" disabled={loading||rest!==roster.policy.rest_days} onClick={()=>void mutate('register',{shifts:draft})}>
        {loading?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:null}{submitted?'Cập nhật đăng ký':'Gửi đăng ký tuần'}
      </Button>
    </>}
    {!open&&roster.week_status!=='published'&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">Đã ngoài thời gian đăng ký trực tiếp. Bạn có thể liên hệ quản lý để xử lý thay đổi.</p>}
    <p className="text-xs leading-5 text-muted-foreground">Ca 1: {roster.policy.early_start}–12:00, 13:15–{roster.policy.early_end} · Ca 2: {roster.policy.late_start}–12:00, 13:15–{roster.policy.late_end}. Ca Full phải được quản lý kiểm tra thời giờ làm việc và nghỉ giữa giờ.</p>
  </div>;
}

function TeamSchedule({roster,week}:{roster:ShiftRoster;week:string}){
  const [day,setDay]=useState(0);
  useEffect(()=>setDay(0),[week,roster.store_id]);
  const date=dateAdd(week,day),summary=roster.days[day];
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Nhân viên tự phối hợp để mỗi ngày đủ ít nhất 1 Ca 1 và 1 Ca 2. Base không tự xếp ca.</p>
    <div className="grid grid-cols-7 gap-1.5">
      {weekdays.map((d,i)=>{
        const s=roster.days[i];
        return <button type="button" key={d} onClick={()=>setDay(i)} aria-pressed={day===i}
          className={`min-h-14 rounded-xl border px-1 py-2 text-center ${day===i?'border-primary bg-primary/10 ring-1 ring-primary':'bg-card'}`}>
          <p className="text-xs font-semibold">{d}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{dateAdd(week,i).slice(-2)}</p>
          <span className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${s.holiday?'bg-slate-400':s.missing_early||s.missing_late?'bg-amber-500':'bg-emerald-500'}`}/>
        </button>;
      })}
    </div>
    <Card>
      <CardHeader className="pb-2"><div className="flex items-start justify-between gap-2"><div><CardTitle className="text-base">{weekdayFull[day]}, {shiftDateLabel(date)}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{summary?.working??0} người đi làm</p></div>{summary&&<DayAlert item={summary} policy={roster.policy}/>}</div></CardHeader>
      <CardContent className="space-y-2">
        {roster.staff.map(person=>{
          const e=roster.entries.find(x=>x.staff_id===person.id&&x.date===date);
          return <div key={person.id} className="flex min-h-12 items-center justify-between gap-2 border-b py-2 last:border-0">
            <div className="min-w-0"><p className="truncate text-sm font-medium">{person.name}</p>{e?.assigned&&e?.assigned!==e?.requested&&<p className="text-[11px] text-muted-foreground">Quản lý đã điều chỉnh</p>}</div><ShiftTag code={e?.shift}/>
          </div>;
        })}
        {summary&&!summary.holiday&&summary.lunch_needs_confirmation&&<p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:bg-amber-950 dark:text-amber-100">Giờ nghỉ trưa 12:00–13:15 cần được bố trí nghỉ lệch hoặc có người trực thay. Đủ Ca 1/Ca 2 chưa có nghĩa là đã phủ trọn giờ mở cửa.</p>}
      </CardContent>
    </Card>
  </div>;
}
function ChangePanel({roster,week,mutate,loading,open,onOpenChange,pickDate}:{roster:ShiftRoster;week:string;mutate:(action:string,payload:Record<string,unknown>)=>Promise<void>;loading:boolean;open:boolean;onOpenChange:(o:boolean)=>void;pickDate:string}){
  const [date,setDate]=useState(pickDate);
  const [kind,setKind]=useState<'swap'|'emergency'>('swap');
  const [partner,setPartner]=useState('');
  const [partnerDate,setPartnerDate]=useState(pickDate);
  const [reason,setReason]=useState('');
  useEffect(()=>{if(open){setDate(pickDate);setPartnerDate(pickDate);setKind('swap');setReason('');setPartner('');}},[open,pickDate]);
  const personName=(id:string|null)=>roster.staff.find(p=>p.id===id)?.name??'Nhân viên';
  const currentChanges=roster.changes;
  const send=async()=>{
    if(kind==='swap'&&!partner){toast.error('Hãy chọn đồng nghiệp nhận ca.');return;}
    if(kind==='emergency'&&!reason.trim()){toast.error('Cần ghi lý do nghỉ khẩn cấp.');return;}
    try{await mutate('change_create',{date,kind,partner_id:partner,partner_date:partnerDate,reason});onOpenChange(false);}catch{/* mutation already shows error */}
  };
  return <div className="space-y-3">
    <div className="flex items-start justify-between gap-2"><p className="text-sm text-muted-foreground">Đổi ca sau chốt: đồng nghiệp xác nhận, quản lý duyệt thì lịch mới có hiệu lực.</p>{roster.can_swap&&<Button size="sm" onClick={()=>onOpenChange(true)}>+ Đề nghị</Button>}</div>
    {currentChanges.length===0&&<div className="rounded-xl border bg-card p-5 text-center text-sm text-muted-foreground">Chưa có yêu cầu đổi ca trong tuần.</div>}
    {currentChanges.map(change=>{
      const mine=change.requester_id===roster.actor_id;
      const isPeer=change.partner_id===roster.actor_id&&change.status==='pending_peer';
      const canApprove=roster.can_approve&&change.status==='pending_manager';
      const pending=change.status==='pending_peer'||change.status==='pending_manager';
      return <div key={change.id} className="space-y-2 rounded-xl border bg-card p-3">
        <div className="flex items-start justify-between gap-2">
          <div><p className="text-sm font-semibold">{change.kind==='emergency'?'Báo nghỉ khẩn cấp':'Yêu cầu đổi ca'}</p><p className="text-xs text-muted-foreground">{personName(change.requester_id)} · {shiftDateLabel(change.work_date)}</p></div>
          <Badge variant={change.status==='approved'?'default':'secondary'}>{statusLabel[change.status]}</Badge>
        </div>
        <div className="text-sm"><ShiftTag code={change.original_shift}/>{change.partner_id&&<span className="ml-2 text-muted-foreground">↔ {personName(change.partner_id)} · {change.partner_date&&shiftDateLabel(change.partner_date)} ({change.partner_shift&&SHIFT_LABELS[change.partner_shift]})</span>}</div>
        {change.reason&&<p className="text-xs text-muted-foreground">Lý do: {change.reason}</p>}
        {change.decision_note&&<p className="text-xs text-muted-foreground">Phản hồi: {change.decision_note}</p>}
        {(isPeer||canApprove||(mine&&pending))&&<div className="flex flex-wrap gap-2 pt-1">
          {isPeer&&<><Button size="sm" disabled={loading} onClick={()=>void mutate('change_reply',{id:change.id,accept:true})}>Đồng ý nhận ca</Button><Button size="sm" variant="outline" disabled={loading} onClick={()=>void mutate('change_reply',{id:change.id,accept:false})}>Từ chối</Button></>}
          {canApprove&&<><Button size="sm" disabled={loading} onClick={()=>void mutate('change_review',{id:change.id,accept:true,reason:change.kind==='emergency'?'Quản lý tiếp nhận báo nghỉ khẩn và điều phối người thay.':'Đồng ý đổi ca'})}>Duyệt</Button><Button variant="outline" size="sm" disabled={loading} onClick={()=>void mutate('change_review',{id:change.id,accept:false,reason:'Yêu cầu chưa phù hợp lịch trực'})}>Từ chối</Button></>}
          {mine&&pending&&<Button size="sm" variant="ghost" disabled={loading} onClick={()=>void mutate('change_cancel',{id:change.id})}>Thu hồi</Button>}
        </div>}
      </div>;
    })}
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] max-w-[min(95vw,440px)] overflow-y-auto">
        <DialogHeader><DialogTitle>Đề nghị đổi ca</DialogTitle><DialogDescription>Sau khi được duyệt, lịch mới mới có hiệu lực.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={kind==='swap'?'default':'outline'} onClick={()=>setKind('swap')}>Đổi với đồng nghiệp</Button>
            <Button variant={kind==='emergency'?'default':'outline'} onClick={()=>setKind('emergency')}>Báo khẩn</Button>
          </div>
          <div><Label>Ngày của bạn</Label><Input className="mt-1 min-h-11" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
          {kind==='swap'&&<>
            <div><Label>Đồng nghiệp nhận / đổi ca</Label><select className={classSelect+' mt-1'} value={partner} onChange={e=>setPartner(e.target.value)}>
              <option value="">Chọn đồng nghiệp</option>{roster.staff.filter(p=>p.id!==roster.actor_id).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
            <div><Label>Ngày ca của đồng nghiệp</Label><Input className="mt-1 min-h-11" type="date" value={partnerDate} onChange={e=>setPartnerDate(e.target.value)}/></div>
          </>}
          {kind==='emergency'&&<p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Báo khẩn không cần người nhận trước. Quản lý phải xử lý thiếu ca; nếu xin nghỉ phép, vẫn làm đơn nghỉ theo quy định.</p>}
          <div><Label>Lý do {kind==='emergency'?'(bắt buộc)':'(tùy chọn)'}</Label><Input className="mt-1 min-h-11" value={reason} maxLength={400} onChange={e=>setReason(e.target.value)} placeholder="Nhập ngắn gọn..." /></div>
          <Button className="h-12 w-full" disabled={loading} onClick={()=>void send()}>Gửi yêu cầu</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>;
}
function Approvals({roster,week,mutate,loading}:{roster:ShiftRoster;week:string;mutate:(action:string,payload:Record<string,unknown>)=>Promise<void>;loading:boolean}){
  const [day,setDay]=useState(0);
  const [reason,setReason]=useState('');
  const date=dateAdd(week,day);
  useEffect(()=>setDay(0),[week,roster.store_id]);
  const pending=roster.changes.filter(c=>c.status==='pending_manager');
  return <div className="space-y-4">
    {pending.length>0&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{pending.length} yêu cầu đổi ca đang chờ duyệt. Mở mục <strong>Đổi ca</strong> để xử lý.</div>}
    <div className="grid grid-cols-7 gap-1.5">
      {weekdays.map((dayName,i)=><button type="button" key={dayName} aria-pressed={i===day} onClick={()=>setDay(i)}
        className={`min-h-12 rounded-lg border text-xs font-semibold ${i===day?'border-primary bg-primary/10':'bg-card'}`}>{dayName}<span className="block text-[10px] text-muted-foreground">{dateAdd(week,i).slice(-2)}</span></button>)}
    </div>
    <Card>
      <CardHeader className="pb-3"><div className="flex items-center justify-between gap-2"><CardTitle className="text-base">{weekdayFull[day]} · {shiftDateLabel(date)}</CardTitle><DayAlert item={roster.days[day]} policy={roster.policy}/></div></CardHeader>
      <CardContent className="space-y-3">
        {roster.staff.map(person=>{
          const e=roster.entries.find(x=>x.date===date&&x.staff_id===person.id);
          return <div key={person.id} className="flex min-w-0 items-center gap-3">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{person.name}</span>
            <select className={classSelect+' max-w-[175px]'} aria-label={`Phân ca ${person.name}`}
              value={e?.assigned??e?.requested??''} disabled={loading||roster.week_status==='published'}
              onChange={ev=>void mutate('assign',{staff_id:person.id,date,shift:ev.target.value})}>
              <option value="">Chưa có</option>{SHIFT_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>;
        })}
      </CardContent>
    </Card>
    {roster.week_status==='published'?<div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Lịch đã công bố. Điều chỉnh tiếp theo phải qua yêu cầu đổi ca.</div>:<>
      <div className="space-y-2"><Label htmlFor="roster-publish-note">Lý do nếu có ngày phải dùng Ca Full / ngoại lệ</Label>
        <Input id="roster-publish-note" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ghi rõ phương án xử lý thiếu ca..." maxLength={500}/>
      </div>
      <Button className="h-12 w-full" disabled={loading} onClick={()=>void mutate('publish',{reason})}><ClipboardCheck className="mr-2 h-4 w-4"/>Chốt & công bố lịch tuần</Button>
      <p className="text-xs leading-5 text-muted-foreground">Cần đủ lịch 7 ngày của mọi nhân viên và đúng định mức nghỉ. Nếu thiếu Ca 1/Ca 2, quản lý phải xử lý hoặc ghi rõ lý do ngoại lệ Ca Full. Chú ý bố trí người trực giờ nghỉ trưa.</p>
    </>}
  </div>;
}
function PolicySettings({roster,mutate,loading}:{roster:ShiftRoster;mutate:(action:string,payload:Record<string,unknown>)=>Promise<void>;loading:boolean}){
  const [form,setForm]=useState<ShiftPolicy>(roster.policy);
  const [holidays,setHolidays]=useState(roster.policy.holidays.join(', '));
  const [reason,setReason]=useState('Điều chỉnh chính sách lịch trực');
  useEffect(()=>{setForm(roster.policy);setHolidays(roster.policy.holidays.join(', '));},[roster.policy,roster.store_id]);
  const update=<K extends keyof ShiftPolicy>(key:K,value:ShiftPolicy[K])=>setForm(x=>({...x,[key]:value}));
  const weekdaysOptions=weekdays.map((_,i)=><option key={i} value={i+1}>{weekdayFull[i]}</option>);
  const field=(title:string,dayKey:'open_day'|'close_day'|'publish_day',timeKey:'open_time'|'close_time'|'publish_time')=><div className="space-y-1.5"><Label>{title}</Label><div className="grid grid-cols-2 gap-2">
    <select className={classSelect} value={form[dayKey]} onChange={e=>update(dayKey,Number(e.target.value))}>{weekdaysOptions}</select>
    <Input type="time" className="h-11" value={form[timeKey]} onChange={e=>update(timeKey,e.target.value)}/>
  </div></div>;
  return <div className="space-y-5">
    <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground">Chính sách phiên bản {roster.policy_version}. Thời hạn đăng ký áp dụng cho <strong>tuần kế tiếp</strong>, giờ Việt Nam. Lịch đã công bố không tự thay đổi.</div>
    <section className="space-y-3"><h3 className="text-sm font-bold">Đăng ký lịch tuần</h3>
      {field('Bắt đầu mở đăng ký','open_day','open_time')}
      {field('Khóa đăng ký','close_day','close_time')}
      {field('Hạn công bố lịch','publish_day','publish_time')}
    </section>
    <section className="space-y-3 border-t pt-4"><h3 className="text-sm font-bold">Định mức và ngày nghỉ</h3>
      <div className="grid grid-cols-3 gap-2">
        {([{key:'min_early',label:'Tối thiểu Ca 1',max:10},{key:'min_late',label:'Tối thiểu Ca 2',max:10},{key:'rest_days',label:'Nghỉ / tuần',max:3}] as const).map(x=><div key={x.key} className="space-y-1.5"><Label className="text-xs">{x.label}</Label><Input className="h-11" type="number" min={x.key==='rest_days'?0:1} max={x.max} value={form[x.key]} onChange={e=>update(x.key,Number(e.target.value))}/></div>)}
      </div>
      <label className="flex items-center gap-3 rounded-lg border p-3 text-sm"><Checkbox checked={form.allow_full_exception} onCheckedChange={v=>update('allow_full_exception',v===true)}/>Cho xét ngoại lệ Ca Full khi thiếu người (phải ghi lý do)</label>
      <label className="flex items-center gap-3 rounded-lg border p-3 text-sm"><Checkbox checked={form.remind} onCheckedChange={v=>update('remind',v===true)}/>Bật chính sách nhắc đăng ký trước hạn</label>
    </section>
    <section className="space-y-3 border-t pt-4"><h3 className="text-sm font-bold">Khung giờ ca (24 giờ)</h3>
      <div className="grid grid-cols-2 gap-3">
        {([{key:'early_start',label:'Ca 1 bắt đầu'},{key:'early_end',label:'Ca 1 kết thúc'},{key:'late_start',label:'Ca 2 bắt đầu'},{key:'late_end',label:'Ca 2 kết thúc'},{key:'noon_break_start',label:'Nghỉ trưa từ'},{key:'noon_break_end',label:'Nghỉ trưa đến'},{key:'open_store',label:'Showroom mở'},{key:'close_store',label:'Showroom đóng'}] as const).map(f=><div className="space-y-1" key={f.key}><Label className="text-xs">{f.label}</Label><Input className="h-11" type="time" value={form[f.key]} onChange={e=>update(f.key,e.target.value)}/></div>)}
      </div>
      <div className="space-y-1"><Label>Ngày nghỉ lễ (YYYY-MM-DD, ngăn bởi dấu phẩy)</Label>
        <Input value={holidays} onChange={e=>setHolidays(e.target.value)} placeholder="2027-01-01, 2027-..."/>
        <p className="text-xs text-muted-foreground">Cần cập nhật theo lịch nghỉ lễ, nghỉ bù thực tế từng năm. Không tự suy đoán ngày nghỉ.</p>
      </div>
    </section>
    <section className="space-y-2 border-t pt-4"><Label>Lý do thay đổi chính sách</Label>
      <Input value={reason} onChange={e=>setReason(e.target.value)} maxLength={300}/>
      <Button className="h-12 w-full" disabled={loading||reason.trim().length<4} onClick={()=>void mutate('save_policy',{config:{...form,holidays:holidays.split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean)},reason})}>Lưu chính sách</Button>
      <p className="text-xs text-muted-foreground">Mọi thay đổi có phiên bản, thời điểm và người sửa. Chỉ người được cấp Role cài đặt mới lưu được.</p>
    </section>
  </div>;
}
export function ShiftRosterPage(){
  const {user,can,isSuperAdmin}=useCurrentUser();
  const queryClient=useQueryClient();
  const [week,setWeek]=useState(upcomingWeek);
  const [store,setStore]=useState('');
  const [view,setView]=useState<View>('mine');
  const [dialog,setDialog]=useState(false);
  const [pickDate,setPickDate]=useState(dateAdd(upcomingWeek(),0));
  const active=!!user&&user.status==='Đang hoạt động'&&(isSuperAdmin||can('showroom.shift.view')||can('showroom.shift.view_all'));
  const overview=useQuery({queryKey:['showroom-roster-stores',user?.id],queryFn:showroomOverviewRead,enabled:active,staleTime:60_000,retry:1});
  useEffect(()=>{const stores=overview.data?.stores??[];if(stores.length&&!stores.some(s=>s.id===store))setStore(stores[0].id);},[overview.data,store]);
  const data=useQuery({queryKey:['showroom-roster',user?.id,store,week],queryFn:()=>readShowroomRoster(store,week),enabled:active&&!!store,staleTime:10_000,retry:1,refetchOnWindowFocus:true});
  const mutation=useMutation({mutationFn:({action,payload}:{action:string;payload:Record<string,unknown>})=>showroomRosterAction(store,week,action,payload)});
  const doAction=async(action:string,payload:Record<string,unknown>)=>{
    try{
      const result=await mutation.mutateAsync({action,payload});
      toast.success(result.message||'Đã cập nhật.');
      await queryClient.invalidateQueries({queryKey:['showroom-roster',user?.id,store]});
    }catch(e){toast.error(e instanceof Error?e.message:'Chưa cập nhật được lịch.');throw e;}
  };
  const roster=data.data;
  const sections=useMemo(()=>{
    const base:{id:View;label:string;icon:typeof CalendarDays}[]=[
      {id:'mine',label:'Lịch của tôi',icon:CalendarDays},{id:'team',label:'Lịch cửa hàng',icon:Users},
      {id:'changes',label:'Đổi ca',icon:ArrowLeftRight},
    ];
    if(roster?.can_approve)base.push({id:'approve',label:'Duyệt lịch',icon:ClipboardCheck});
    if(roster?.can_settings)base.push({id:'settings',label:'Cài đặt',icon:Settings2});
    return base;
  },[roster?.can_approve,roster?.can_settings]);
  const currentView=sections.some(s=>s.id===view)?view:'mine';
  const showSwap=(o:boolean,date?:string)=>{if(date)setPickDate(date);setDialog(o);if(o)setView('changes');};
  return <div className="mx-auto min-w-0 max-w-5xl space-y-4 pb-14">
    <PageHeader title="Lịch trực Showroom" description="Tự đăng ký · Cùng cân ca · Quản lý chốt lịch" />
    {!active&&<div role="alert" className="rounded-xl border p-5 text-sm">Tài khoản chưa được cấp quyền Lịch trực Showroom. Kiểm tra Role vị trí trong Cơ cấu tổ chức.</div>}
    {active&&<>
      <div className="flex flex-wrap items-end gap-2">
        {overview.data&&overview.data.stores.length>1&&<div className="min-w-[210px] flex-1 space-y-1"><Label>Cửa hàng</Label><select className={classSelect} value={store} onChange={e=>{setStore(e.target.value);setView('mine');}}>{overview.data.stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
        <div className="min-w-[205px] flex-1"><WeekButtons week={week} setWeek={setWeek}/></div>
        <Button type="button" size="sm" variant="outline" className="h-11" disabled={data.isFetching} onClick={()=>void data.refetch()}>{data.isFetching?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Clock3 className="mr-2 h-4 w-4"/>}Làm mới</Button>
      </div>
      {overview.isPending&&<div className="rounded-xl border p-6 text-sm text-muted-foreground">Đang tải cửa hàng của bạn...</div>}
      {overview.isError&&<div role="alert" className="rounded-xl border border-destructive p-4 text-sm">{overview.error.message}</div>}
      {data.isPending&&store&&<div className="flex items-center gap-2 rounded-xl border bg-card p-5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Đang tải lịch tuần...</div>}
      {data.isError&&<div role="alert" className="space-y-2 rounded-xl border border-destructive/50 p-4 text-sm"><p>Không tải được lịch: {data.error.message}</p><Button size="sm" variant="outline" onClick={()=>void data.refetch()}>Thử lại</Button></div>}
      {roster&&<>
        <div className="flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-sm">
          <div className="flex min-w-0 items-center gap-2"><CalendarDays className="h-4 w-4 text-primary"/><span className="truncate">{overview.data?.stores.find(s=>s.id===store)?.name??'Showroom'}</span></div>
          <Badge variant={roster.week_status==='published'?'default':'secondary'}>{roster.week_status==='published'?'Đã công bố':'Chưa chốt'}</Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Chức năng lịch trực">
          {sections.map(x=><button key={x.id} type="button" role="tab" aria-selected={currentView===x.id} onClick={()=>setView(x.id)}
            className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium ${currentView===x.id?'border-primary bg-primary text-primary-foreground':'bg-card text-foreground'}`}>
            <x.icon className="h-4 w-4"/>{x.label}</button>)}
        </div>
        {currentView==='mine'&&<Registration roster={roster} week={week} mutate={doAction} loading={mutation.isPending} onChange={showSwap}/>}
        {currentView==='team'&&<TeamSchedule roster={roster} week={week}/>}
        {currentView==='changes'&&<ChangePanel roster={roster} week={week} mutate={doAction} loading={mutation.isPending} open={dialog} onOpenChange={setDialog} pickDate={pickDate}/>}
        {currentView==='approve'&&roster.can_approve&&<Approvals roster={roster} week={week} mutate={doAction} loading={mutation.isPending}/>}
        {currentView==='settings'&&roster.can_settings&&<PolicySettings roster={roster} mutate={doAction} loading={mutation.isPending}/>}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2">
          <span className="text-xs text-muted-foreground">Cần hướng dẫn đăng ký, đổi ca hay duyệt lịch?</span>
          <HelpButton question={currentView==='settings'?'Hướng dẫn cài đặt chính sách lịch trực Showroom':currentView==='changes'?'Hướng dẫn đổi ca trực Showroom khi đã chốt lịch':currentView==='approve'?'Hướng dẫn quản lý duyệt và công bố lịch trực Showroom':'Hướng dẫn đăng ký lịch trực Showroom tuần sau trên điện thoại'}/>
        </div>
      </>}
    </>}
  </div>;
}
