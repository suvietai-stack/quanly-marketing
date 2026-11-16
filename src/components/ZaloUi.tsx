import { PushSettings } from "@/components/PushSettings";
import { useEffect, useState, type ReactNode } from "react";
import type { ChipiNotice } from "@/lib/chipi";
import { deadlineLink } from '@/lib/signals/deadlines';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bell, CheckCheck, X } from "lucide-react";
import { ChipiNoticeIcon } from "@/components/ChipiNoticeIcon";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  zaloAdminStatus, zaloConnectUrl, zaloCheck, zaloSendTest, zaloDisconnect, zaloSetAuto, zaloRetryFailed,
  zaloMyLink, zaloCreateLinkCode, zaloUnlink, zaloSaveAppConfig, zaloSaveBaseUrl, zaloSaveWebhookSecret,
  zaloCareGet, zaloCareSave,
} from "@/lib/zalo.functions";

import { CONTENT_LABEL, contentLink } from "@/lib/content/notifyMessage";
import { ORDER_LABEL, orderLink } from "@/lib/orders/notifyMessage";
import { OQ_LABEL, oqLink } from "@/lib/orderQuotes/notify";
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
  const nav = useNavigate();
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
  void nav;
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
          {showPush ? <div className="p-1"><PushSettings /></div> : <button className="w-full text-xs text-primary py-1" onClick={() => setShowPush(true)}>Thông báo trên thiết bị</button>}
          {showLink ? <ZaloLinkCard /> : <button className="w-full text-xs text-primary py-1" onClick={() => setShowLink(true)}>Nhận thông báo qua Zalo</button>}
        </div>
        </>}
      </PopoverContent>
    </Popover>
  );
}

export function ZaloLinkCard() {
  const my = useServerFn(zaloMyLink);
  const create = useServerFn(zaloCreateLinkCode);
  const unlink = useServerFn(zaloUnlink);
  const [link, setLink] = useState<any>(undefined);
  const [code, setCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const load = () => my().then(setLink).catch(() => setLink(null));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!code) return;
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [code]);
  useEffect(() => { if (link && code) setCode(null); }, [link]);
  const st = link === undefined ? "…" : !link ? "Chưa liên kết" : link.status === "active" ? "Đã liên kết" : "Không còn hiệu lực";
  return (
    <Card><CardContent className="p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Thông báo Zalo</h3>
        <Badge variant={link?.status === "active" ? "default" : "secondary"}>{st}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">Nhận thông báo tín hiệu cơ hội qua Zalo OA Sứ Việt. Tin nhắn chỉ có lời nhắc và nút mở Base, không chứa thông tin khách hàng.</p>
      {code ? (
        <div className="rounded-md border p-3 space-y-2 text-sm">
          <div>1. Mở Zalo, tìm và <b>Quan tâm</b> OA <b>Sứ Việt</b>.</div>
          <div>2. Nhắn cho OA đúng mã sau:</div>
          <div className="text-2xl font-mono font-semibold tracking-wider select-all">{code.code}</div>
          <div className="text-xs text-muted-foreground">Mã hết hạn lúc {new Date(code.expiresAt).toLocaleTimeString("vi-VN")}. Trang này tự cập nhật khi liên kết xong.</div>
          <div className="text-xs text-muted-foreground">Lưu ý: Zalo chỉ cho OA gửi tin trong một khoảng thời gian sau lần bạn nhắn OA gần nhất. Thỉnh thoảng nhắn OA để tiếp tục nhận thông báo.</div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => create().then(setCode).catch((e) => toast.error(e.message))}>{link ? "Liên kết lại" : "Liên kết Zalo"}</Button>
          {link && <Button variant="outline" onClick={() => unlink().then(load)}>Hủy liên kết</Button>}
        </div>
      )}
    </CardContent></Card>
  );
}

function CopyRow({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium">{label}</div>
      <div className="flex gap-2">
        <Input readOnly value={value} className="font-mono text-xs" />
        <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(value).then(() => toast.success("Đã sao chép"))}>Sao chép</Button>
      </div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

const STATE: Record<string, { label: string; tone: "default" | "secondary" | "destructive" }> = {
  unconfigured: { label: "Chưa cấu hình", tone: "secondary" },
  disconnected: { label: "Chưa kết nối", tone: "secondary" },
  connected: { label: "Đã kết nối", tone: "default" },
  refresh_review: { label: "Gia hạn cần kiểm tra", tone: "destructive" },
  reconnect: { label: "Cần kết nối lại", tone: "destructive" },
};

export function ZaloAdminCard() {
  const status = useServerFn(zaloAdminStatus);
  const connect = useServerFn(zaloConnectUrl);
  const check = useServerFn(zaloCheck);
  const test = useServerFn(zaloSendTest);
  const disc = useServerFn(zaloDisconnect);
  const setAuto = useServerFn(zaloSetAuto);
  const retry = useServerFn(zaloRetryFailed);
  const saveApp = useServerFn(zaloSaveAppConfig);
  const saveBase = useServerFn(zaloSaveBaseUrl);
  const saveHook = useServerFn(zaloSaveWebhookSecret);
  const [s, setS] = useState<Awaited<ReturnType<typeof zaloAdminStatus>> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [appId, setAppId] = useState("");
  const [secret, setSecret] = useState("");
  const [base, setBase] = useState("");
  const [hook, setHook] = useState("");
  const load = () => status().then((r) => { setS(r); setAppId(r.appId); setBase(r.baseUrl); }).catch((e) => setErr(e.message));
  useEffect(() => {
    load();
    const r = new URLSearchParams(window.location.search).get("zalo");
    if (r === "connected") toast.success("Đã kết nối Zalo OA");
    if (r === "error") toast.error("Kết nối Zalo OA thất bại — thử lại");
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);
  if (err || !s) return null;
  const run = (p: Promise<any>) => p.then((r) => { if (r?.message) (r.ok ? toast.success : toast.error)(r.message); load(); }).catch((e) => {
    const m = String(e?.message ?? e);
    const zod = m.match(/"message":\s*"([^"]+)"/);
    toast.error(zod ? zod[1] : m);
  });
  const st = STATE[s.state] ?? STATE.disconnected;
  return (
    <div className="space-y-4">
      <Card><CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">Cấu hình ứng dụng Zalo</h3>
          <Badge variant={s.configured ? "default" : "secondary"}>{s.configured ? "Đã cấu hình" : "Chưa cấu hình"}</Badge>
        </div>
        {!s.dbReady && <p className="text-xs text-destructive">Chưa lưu được từ giao diện: cơ sở dữ liệu cần một cập nhật nhỏ đang chờ phê duyệt. Trong lúc chờ, có thể nhập App ID / App Secret qua mục Bí mật (Secrets) của hệ thống.</p>}
        <div className="space-y-1"><Label>Zalo App ID</Label><Input value={appId} onChange={(e) => setAppId(e.target.value)} inputMode="numeric" /></div>
        <div className="space-y-1">
          <Label>App Secret</Label>
          <PasswordInput autoComplete="new-password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={s.appSecretSet ? `Đã lưu (${s.appSecretHint}) — để trống nếu không đổi` : "Nhập App Secret"} />
          <div className="text-xs text-muted-foreground">App Secret không bao giờ hiển thị lại. Đổi App ID/Secret sẽ yêu cầu kết nối lại OA.</div>
        </div>
        <Button disabled={!s.dbReady} onClick={() => {
          if (!/^\d{5,30}$/.test(appId.trim())) { toast.error("App ID chỉ gồm chữ số (5–30 ký tự)"); return; }
          run(saveApp({ data: { appId: appId.trim(), appSecret: secret || undefined } }).then((r) => { setSecret(""); return r; }));
        }}>Lưu cấu hình</Button>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-3">
        <h3 className="font-semibold">Đường dẫn ứng dụng Base</h3>
        <div className="flex gap-2">
          <Input value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://base.suviet.vn" />
          <Button variant="outline" disabled={!s.dbReady} onClick={() => run(saveBase({ data: { url: base } }))}>Lưu</Button>
        </div>
        <div className="text-xs text-muted-foreground">Mọi nút "Xem tín hiệu" trong Zalo mở trên tên miền này. Đổi tên miền không làm mất kết nối OA.</div>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">Kết nối Zalo OA</h3>
          <Badge variant={st.tone}>{st.label}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Tên OA</div><div>{s.oaName ?? "—"}</div>
          <div className="text-muted-foreground">Kết nối OAuth</div><div>{s.oauthActive ? "Hoạt động" : "Mất kết nối hoặc cần kiểm tra"}</div>
          <div className="text-muted-foreground">Gửi thông báo</div><div>{s.sendState === "active" ? "Hoạt động" : s.sendState === "error" ? "Có lỗi" : "Chưa xác minh"}</div>
          <div className="text-muted-foreground">Mã lỗi gửi gần nhất</div><div>{s.sendErrorCode ?? "—"}{s.sendErrorGroup && ` · ${{ token: "Token", recipient: "Điều kiện tương tác", format: "Loại tin không hỗ trợ", quota: "Hạn mức", permission: "Quyền OA", network: "Mạng / cần đối soát", unknown: "Cần kiểm tra" }[s.sendErrorGroup]}`}</div>
          <div className="text-muted-foreground">Gửi thành công gần nhất</div><div>{s.lastSendSuccess ? new Date(s.lastSendSuccess).toLocaleString("vi-VN") : "Chưa ghi nhận"}</div>
          <div className="text-muted-foreground">Nhân viên đã liên kết</div><div>{s.linkedCount}</div>
          <div className="text-muted-foreground">Gia hạn thành công</div><div>{s.refreshLast ? new Date(s.refreshLast).toLocaleString("vi-VN") : "Chưa ghi nhận"}</div>
          <div className="text-muted-foreground">Dự kiến gia hạn</div><div>{s.refreshNext ? new Date(s.refreshNext).toLocaleString("vi-VN") : "—"}</div>
          <div className="text-muted-foreground">Lịch chạy nền</div><div>{s.schedulerHealthy ? "Đang hoạt động · mỗi giờ" : "Chưa ghi nhận hoặc gián đoạn"}</div>
          <div className="text-muted-foreground">Xử lý hàng đợi gần nhất</div><div>{s.queueLast ? new Date(s.queueLast).toLocaleString("vi-VN") : "—"}</div>
          <div className="text-muted-foreground">Gửi tự động</div><div>{s.autoSend ? "Đã bật" : "Chưa bật"}</div>
          <div className="text-muted-foreground">Gửi thử</div><div>{s.testOk ? "Đã thành công" : "Chưa thành công"}</div>
          <div className="text-muted-foreground">7 ngày qua</div>
          <div>Đã gửi {s.stats7d.sent ?? 0} · Thất bại {s.stats7d.failed ?? 0} · Không đủ ĐK {s.stats7d.ineligible ?? 0} · Chưa gửi {s.stats7d.pending ?? 0}</div>
        </div>
        {s.refreshError && <p className="text-xs text-destructive">{s.refreshError}</p>}
        {s.lastError && <p className="text-xs text-destructive">{s.lastError}</p>}
        <div className="flex gap-2 flex-wrap">
          <Button disabled={!s.configured} onClick={() => connect().then((r) => { window.location.href = r.url; }).catch((e) => toast.error(e.message))}>
            {s.status === "disconnected" ? "Kết nối OA" : "Kết nối lại"}
          </Button>
          <Button variant="outline" onClick={() => run(check())}>Kiểm tra kết nối</Button>
          <Button variant="outline" onClick={() => run(test())}>Gửi thử</Button>
          <Button variant="outline" disabled={s.sendState !== "active"} onClick={() => run(retry().then((r) => ({ ok: true, message: `Đã xử lý ${r.processed} thông báo đủ điều kiện; không gửi lại hàng loạt tin lỗi cũ` })))}>Kiểm tra hàng đợi</Button>
          {s.status !== "disconnected" && <Button variant="ghost" onClick={() => confirm("Ngắt kết nối Zalo OA?") && run(disc())}>Ngắt kết nối</Button>}
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <div className="text-sm font-medium">Gửi tự động</div>
            <div className="text-xs text-muted-foreground">{s.testOk ? "Có thể bật." : "Chỉ bật được sau khi Gửi thử thành công."}</div>
          </div>
          <Switch checked={s.autoSend} disabled={s.status !== "connected" || (!s.testOk && !s.autoSend)} onCheckedChange={(on) => run(setAuto({ data: { on } }))} />
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-semibold">Khai báo trên Zalo for Developers</h3>
        <CopyRow label="OAuth Callback URL" value={s.callbackUrl} hint="Dán vào mục Official Account → Callback URL. Cố định, không đổi khi đổi tên miền Base." />
        <CopyRow label="Webhook URL" value={s.webhookUrl} hint="Dùng để nhân viên liên kết Zalo bằng mã. Bật sự kiện “Người dùng gửi tin nhắn văn bản”." />
        <div className="space-y-1">
          <Label>Khóa Webhook (OA Secret Key)</Label>
          <div className="flex gap-2">
            <PasswordInput autoComplete="new-password" value={hook} onChange={(e) => setHook(e.target.value)} placeholder={s.webhookReady ? "Đã lưu — để trống nếu không đổi" : "Chỉ cần để nhân viên liên kết Zalo"} />
            <Button variant="outline" disabled={!s.dbReady || !hook} onClick={() => run(saveHook({ data: { secret: hook } }).then((r) => { setHook(""); return r; }))}>Lưu</Button>
          </div>
        </div>
      </CardContent></Card>
      <CareCard />
    </div>
  );
}

function CareCard() {
  const get = useServerFn(zaloCareGet);
  const save = useServerFn(zaloCareSave);
  const [c, setC] = useState<{ enabled: boolean; waitHours: number; staleDays: number; hour: number; lastRun: string | null } | null>(null);
  useEffect(() => { get().then(setC).catch(() => {}); }, []);
  if (!c) return null;
  const num = (k: "waitHours" | "staleDays" | "hour") => (e: any) => setC({ ...c, [k]: Number(e.target.value) || 0 });
  return (
    <Card><CardContent className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Nhắc chăm sóc tín hiệu</h3>
          <p className="text-xs text-muted-foreground">Mỗi Sale nhận tối đa 1 tin tổng hợp/ngày nếu có tín hiệu cần chú ý. Công tắc riêng, không ảnh hưởng 2 thông báo hiện có.</p>
        </div>
        <Switch checked={c.enabled} onCheckedChange={(enabled) => setC({ ...c, enabled })} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1"><Label>Chưa tiếp nhận (giờ)</Label><Input type="number" min={1} value={c.waitHours} onChange={num("waitHours")} /></div>
        <div className="space-y-1"><Label>Lâu chưa cập nhật (ngày)</Label><Input type="number" min={1} value={c.staleDays} onChange={num("staleDays")} /></div>
        <div className="space-y-1"><Label>Giờ gửi (0–23)</Label><Input type="number" min={0} max={23} value={c.hour} onChange={num("hour")} /></div>
      </div>
      {c.lastRun && <p className="text-xs text-muted-foreground">Lần chạy gần nhất: {c.lastRun}</p>}
      <Button onClick={() => save({ data: { enabled: c.enabled, waitHours: c.waitHours, staleDays: c.staleDays, hour: c.hour } })
        .then((r) => toast.success(r.message)).catch((e) => toast.error(String(e?.message ?? e)))}>Lưu cài đặt nhắc</Button>
    </CardContent></Card>
  );
}

export function ZaloSettingsTab({ isAdmin }: { isAdmin: boolean }) {
  return <div className="space-y-4 max-w-2xl">{isAdmin && <ZaloAdminCard />}<ZaloLinkCard /></div>;
}
