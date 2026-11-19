import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import type { ChipiNotice } from "@/lib/chipi";
import { deadlineLink } from '@/lib/signals/deadlines';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, X } from "lucide-react";
import { ChipiNoticeIcon } from "@/components/ChipiNoticeIcon";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CONTENT_LABEL, contentLink } from "@/lib/content/notifyMessage";
import { ORDER_LABEL, orderLink } from "@/lib/orders/notifyMessage";
import { OQ_LABEL, oqLink } from "@/lib/orderQuotes/notify";

const PushSettings = lazy(() => import("@/components/PushSettings").then((module) => ({ default: module.PushSettings })));
const ZaloLinkCard = lazy(() => import("@/components/ZaloUi").then((module) => ({ default: module.ZaloLinkCard })));

function SettingsLoading() {
  return <p role="status" className="p-1 text-xs text-muted-foreground">Đang tải cài đặt…</p>;
}

export const NOTIFICATION_LABEL: Record<string, string> = {
  fin_pending: "Tiền Về: có giao dịch chờ đối soát.",
  fin_needs_info: "Tiền Về: Kế toán yêu cầu chỉnh sửa thông tin.",
  signal_new: "Có tín hiệu mới đang cần xử lý.",
  signal_assigned: "Bạn vừa được giao một tín hiệu cơ hội mới.",
  signal_care: "Nhắc chăm sóc: có tín hiệu cần kiểm tra.",
  leave_pending: "Có đơn từ cần bạn duyệt.",
  leave_result: "Đơn từ của bạn có kết quả mới.",
  leave_cancel_request: "Có yêu cầu hủy đơn cần bạn duyệt.",
  leave_remind: "Nhắc duyệt: có đơn đang chờ bạn.",
  leave_cc: "Có đơn từ vừa được phê duyệt/hủy (thông báo CC).",
  att_witness: "Bạn được chọn làm người làm chứng cho một giải trình chấm công.",
  att_new: "Có giải trình chấm công mới cần đối chiếu.",
  att_changed: "Một giải trình chấm công vừa được sửa ngày/giờ.",
  att_result: "Người làm chứng đã phản hồi giải trình chấm công của bạn.",
  att_submitted: "Giải trình chấm công của bạn đã được ghi nhận.",
  ...CONTENT_LABEL,
  ...ORDER_LABEL,
  ...OQ_LABEL,
  ot_reschedule: "Có đề xuất điều chỉnh ngày khách nhận cần bạn phản hồi.",
  ot_reschedule_result: "Đề xuất điều chỉnh ngày khách nhận của bạn đã có phản hồi.",
  shift_open: "Đã mở đăng ký lịch trực tuần tới.",
  shift_deadline: "Sắp hết hạn đăng ký ca trực.",
  shift_published: "Lịch trực đã được công bố.",
  shift_peer: "Có yêu cầu đổi ca đang chờ bạn.",
  shift_manager: "Có lịch trực đang chờ duyệt.",
  shift_result: "Có kết quả đổi ca mới.",
};
export const notificationText=(n:ChipiNotice)=>(n.kind.startsWith('biz_') || n.kind.startsWith('shift_') || (n.kind==='signal_care' && n.payload?.progression===true)) && typeof n.payload?.message==='string' ? n.payload.message : NOTIFICATION_LABEL[n.kind] ?? 'Thông báo mới';
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1 ? "vừa xong" : m < 60 ? `${m} phút trước` : m < 1440 ? `${Math.round(m / 60)} giờ trước` : `${Math.round(m / 1440)} ngày trước`;
};

export function NotificationBell({ trigger, onNotifications }: { trigger?: ReactNode; onNotifications?: (data: ChipiNotice[]) => void } = {}) {
  const uid = useAuth((st) => st.currentUserId) || undefined;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const { data: notifications } = useQuery({
    queryKey: ["notifications", uid],
    enabled: !!uid,
    // Đốm observes the same cache; existing header/sidebar bells own polling.
    refetchInterval: onNotifications ? false : 60_000,
    staleTime: onNotifications ? 60_000 : 0,
    queryFn: async () => {
      type AlertRow = {id:string;kind:string;signal_id:string|null;leave_request_id:string|null;attendance_id:string|null;content_id:string|null;order_id:string|null;oq_flow_id:string|null;ot_order_id:string|null;bank_tx_id:string|null;payload:any;read_at:string|null;created_at:string;source?:'shift'};
      // Shift reminders use their own RLS-protected outbox. Keep the global
      // notifications schema untouched and merge both feeds at presentation.
      const [regular, shifts] = await Promise.all([
        (supabase as any).from("notifications").select("id,kind,signal_id,leave_request_id,attendance_id,content_id,order_id,oq_flow_id,ot_order_id,bank_tx_id,payload,read_at,created_at")
          .eq("recipient_id", uid).order("created_at", { ascending: false }).limit(30),
        (supabase as any).from("showroom_shift_alerts").select("id,kind,store_id,week_start,message,read_at,created_at")
          .eq("recipient_id",uid).order("created_at",{ascending:false}).limit(30),
      ]);
      const base=(regular.data??[]) as AlertRow[];
      const roster:AlertRow[]=(shifts.data??[]).map((item:{id:string;kind:string;store_id:string;week_start:string;message:string;read_at:string|null;created_at:string})=>({
        id:'shift:'+item.id,kind:item.kind,source:'shift' as const,signal_id:null,leave_request_id:null,attendance_id:null,
        content_id:null,order_id:null,oq_flow_id:null,ot_order_id:null,bank_tx_id:null,
        payload:{message:item.message,store_id:item.store_id,week_start:item.week_start},
        read_at:item.read_at,created_at:item.created_at,
      }));
      return [...base,...roster].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,30);
    },
  });
  const data = notifications ?? [];
  useEffect(() => { if (uid && onNotifications && notifications) onNotifications(notifications); }, [notifications, uid, onNotifications]);
  if (!uid) return null;
  const unread = data.filter((n) => !n.read_at).length;
  const openOne = async (n: (typeof data)[number]) => {
    setOpen(false);
    if (!n.read_at) {
      if(n.source==='shift')await (supabase as any).from("showroom_shift_alerts").update({read_at:new Date().toISOString()}).eq("id",n.id.slice(6));
      else await (supabase as any).from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
      qc.invalidateQueries({ queryKey: ["notifications", uid] });
    }
    if (n.source==='shift') { window.location.href='/showroom/shifts'; return; }
    if (n.kind.startsWith('biz_')) {
      if (n.payload?.module === 'crm') { window.location.href = '/biz/crm'; return; }
      if (n.payload?.module === 'k3') { window.location.href = '/biz/3k'; return; }
      if (n.payload?.approval_run_id) { window.location.href = '/biz/approvals'; return; }
      const params = new URLSearchParams({ year: String(n.payload?.year ?? ''), period: String(n.payload?.period ?? ''), period_kind: String(n.payload?.period_kind ?? ''), user: String(n.payload?.user_id ?? '') });
      window.location.href = `/biz/${n.payload?.kind === 'plan' ? 'plans' : 'reports'}?${params}`;
      return;
    }
    window.location.href = n.kind==='signal_care' && n.payload?.progression===true ? deadlineLink(n.payload.deadline,n.payload.sale_id) : n.kind.startsWith("fin_") ? `/finance/incoming/${n.bank_tx_id ?? ""}` : n.kind.startsWith("ot_") ? `/order-tracking/${n.ot_order_id ?? ""}` : n.kind.startsWith("oq_") ? oqLink(n.payload?.request_id ?? "", n.payload?.both ? null : n.oq_flow_id) : n.kind.startsWith("order_") ? orderLink(n.order_id ?? "") : n.kind.startsWith("content_") ? contentLink(n.content_id ?? "") : n.kind.startsWith("att_") ? `/attendance?att=${n.attendance_id}` : n.kind === "leave_remind" ? "/leave?tab=approve" : n.kind.startsWith("leave_") ? `/leave?open=${n.leave_request_id}` : n.kind === "signal_care" || !n.signal_id ? "/signals?care=1" : `/signals?open=${n.signal_id}`;
  };
  const readAll = async () => {
    await Promise.all([
      (supabase as any).from("notifications").update({read_at:new Date().toISOString()}).eq("recipient_id",uid).is("read_at",null),
      (supabase as any).from("showroom_shift_alerts").update({read_at:new Date().toISOString()}).eq("recipient_id",uid).is("read_at",null),
    ]);
    qc.invalidateQueries({ queryKey: ["notifications", uid] });
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={trigger ? "chipi-trigger relative h-auto p-0 hover:bg-transparent" : "relative h-auto p-2"} aria-label={trigger ? "Đốm — mở thông báo" : "Thông báo"}>
          {trigger ?? <Bell className="h-5 w-5" />}
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-4 text-center">{unread > 9 ? "9+" : unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={12} className={trigger ? "chipi-notifications w-80 max-w-[calc(100vw-24px)] max-h-[70dvh] overflow-auto p-0" : "w-80 max-w-[calc(100vw-24px)] max-h-[70dvh] overflow-auto p-0"}>
        {trigger ? <>
          <div className="chipi-panel-header flex items-center gap-2 px-4 py-3">
            <Bell className="h-4 w-4 text-chipi-orange" /><span className="font-semibold text-sm flex-1">Đốm nhắc bạn</span>
            {unread > 0 && <Button variant="ghost" size="icon" title="Đánh dấu tất cả đã đọc" aria-label="Đánh dấu tất cả đã đọc" onClick={readAll}><CheckCheck /></Button>}
            <Button variant="ghost" size="icon" aria-label="Đóng bảng thông báo Đốm" onClick={() => setOpen(false)}><X /></Button>
          </div>
          <div className="max-h-96 overflow-auto p-3 space-y-2">
            {data.length === 0 && <div className="py-8 text-center"><Bell className="h-6 w-6 mx-auto mb-3 text-chipi-orange" /><p className="text-sm font-medium">Bạn đã xem hết rồi!</p><p className="text-xs text-muted-foreground mt-1">Đốm sẽ nhắc khi có thông báo mới.</p></div>}
            {data.map((n) => <Button key={n.id} variant="ghost" onClick={() => openOne(n)} className={`chipi-notice-card ${n.read_at ? "" : "chipi-unread"} h-auto w-full items-start justify-start whitespace-normal text-left p-3 gap-3`}>
              <span className="chipi-notice-icon"><ChipiNoticeIcon kind={n.kind} className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1"><span className={`block text-sm break-words ${n.read_at ? "font-normal" : "font-semibold"}`}>{notificationText(n)}</span><span className="block text-xs text-muted-foreground mt-1.5">{ago(n.created_at)}</span></span>
              {!n.read_at && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-chipi-orange mt-1.5" />}
            </Button>)}
          </div>
        </> : <>
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm font-medium">Thông báo</span>
          {unread > 0 && <button className="text-xs text-primary" onClick={readAll}>Đánh dấu đã đọc</button>}
        </div>
        <div className="max-h-96 overflow-auto">
          {data.length === 0 && <p className="p-4 text-sm text-muted-foreground">Chưa có thông báo.</p>}
          {data.map((n) => (
            <button key={n.id} onClick={() => openOne(n)} className={`w-full text-left px-3 py-2.5 border-b last:border-0 hover:bg-accent ${n.read_at ? "" : "bg-primary/5"}`}>
              <div className="text-sm">{notificationText(n)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{ago(n.created_at)}</div>
            </button>
          ))}
        </div>
        <div className="border-t p-2">
          {showPush ? <div className="p-1"><Suspense fallback={<SettingsLoading />}><PushSettings /></Suspense></div> : <button className="w-full text-xs text-primary py-1" onClick={() => setShowPush(true)}>Thông báo trên thiết bị</button>}
          {showLink ? <Suspense fallback={<SettingsLoading />}><ZaloLinkCard /></Suspense> : <button className="w-full text-xs text-primary py-1" onClick={() => setShowLink(true)}>Nhận thông báo qua Zalo</button>}
        </div>
        </>}
      </PopoverContent>
    </Popover>
  );
}
