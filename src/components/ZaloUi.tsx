import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  zaloAdminStatus, zaloConnectUrl, zaloCheck, zaloSendTest, zaloDisconnect, zaloSetAuto, zaloRetryFailed,
  zaloMyLink, zaloCreateLinkCode, zaloUnlink,
} from "@/lib/zalo.functions";

const LABEL: Record<string, string> = {
  signal_new: "Có tín hiệu mới đang cần xử lý.",
  signal_assigned: "Bạn vừa được giao một tín hiệu cơ hội mới.",
};
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1 ? "vừa xong" : m < 60 ? `${m} phút trước` : m < 1440 ? `${Math.round(m / 60)} giờ trước` : `${Math.round(m / 1440)} ngày trước`;
};

export function NotificationBell() {
  const uid = useAuth((st) => st.currentUserId) || undefined;
  const qc = useQueryClient();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["notifications", uid],
    enabled: !!uid,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data } = await (supabase as any).from("notifications").select("id,kind,signal_id,read_at,created_at")
        .eq("recipient_id", uid).order("created_at", { ascending: false }).limit(30);
      return (data ?? []) as { id: string; kind: string; signal_id: string; read_at: string | null; created_at: string }[];
    },
  });
  if (!uid) return null;
  const unread = data.filter((n) => !n.read_at).length;
  const openOne = async (n: (typeof data)[number]) => {
    setOpen(false);
    if (!n.read_at) {
      await (supabase as any).from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
      qc.invalidateQueries({ queryKey: ["notifications", uid] });
    }
    window.location.href = `/signals?open=${n.signal_id}`;
  };
  const readAll = async () => {
    await (supabase as any).from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", uid).is("read_at", null);
    qc.invalidateQueries({ queryKey: ["notifications", uid] });
  };
  void nav;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded hover:bg-accent" aria-label="Thông báo">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-4 text-center">{unread > 9 ? "9+" : unread}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm font-medium">Thông báo</span>
          {unread > 0 && <button className="text-xs text-primary" onClick={readAll}>Đánh dấu đã đọc</button>}
        </div>
        <div className="max-h-96 overflow-auto">
          {data.length === 0 && <p className="p-4 text-sm text-muted-foreground">Chưa có thông báo.</p>}
          {data.map((n) => (
            <button key={n.id} onClick={() => openOne(n)} className={`w-full text-left px-3 py-2.5 border-b last:border-0 hover:bg-accent ${n.read_at ? "" : "bg-primary/5"}`}>
              <div className="text-sm">{LABEL[n.kind] ?? "Thông báo mới"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{ago(n.created_at)}</div>
            </button>
          ))}
        </div>
        <div className="border-t p-2">
          {showLink ? <ZaloLinkCard /> : <button className="w-full text-xs text-primary py-1" onClick={() => setShowLink(true)}>Nhận thông báo qua Zalo</button>}
        </div>
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

export function ZaloAdminCard() {
  const status = useServerFn(zaloAdminStatus);
  const connect = useServerFn(zaloConnectUrl);
  const check = useServerFn(zaloCheck);
  const test = useServerFn(zaloSendTest);
  const disc = useServerFn(zaloDisconnect);
  const setAuto = useServerFn(zaloSetAuto);
  const retry = useServerFn(zaloRetryFailed);
  const [s, setS] = useState<Awaited<ReturnType<typeof zaloAdminStatus>> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = () => status().then(setS).catch((e) => setErr(e.message));
  useEffect(() => {
    load();
    const r = new URLSearchParams(window.location.search).get("zalo");
    if (r === "connected") toast.success("Đã kết nối Zalo OA");
    if (r === "error") toast.error("Kết nối Zalo OA thất bại — thử lại");
  }, []);
  if (err) return null;
  if (!s) return null;
  const run = (p: Promise<any>) => p.then((r) => { if (r?.message) (r.ok ? toast.success : toast.error)(r.message); load(); }).catch((e) => toast.error(e.message));
  const stLabel = s.status === "connected" ? "Đã kết nối" : s.status === "expired" ? "Hết hiệu lực — cần kết nối lại" : "Chưa kết nối";
  return (
    <Card><CardContent className="p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Tích hợp Zalo OA (Admin)</h3>
        <Badge variant={s.status === "connected" ? "default" : "secondary"}>{stLabel}</Badge>
      </div>
      {!s.secretsReady && <p className="text-sm text-destructive">Chưa có đủ thông tin ứng dụng Zalo (App ID, App Secret, OA Secret Key) ở hệ thống.</p>}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-muted-foreground">Tên OA</div><div>{s.oaName ?? "—"}</div>
        <div className="text-muted-foreground">Quyền gửi tin</div><div>{s.status === "connected" ? "Tin tư vấn (trong khung tương tác)" : "—"}</div>
        <div className="text-muted-foreground">Nhân viên đã liên kết</div><div>{s.linkedCount}</div>
        <div className="text-muted-foreground">7 ngày qua</div>
        <div>Đã gửi {s.stats7d.sent ?? 0} · Thất bại {s.stats7d.failed ?? 0} · Không đủ ĐK {s.stats7d.ineligible ?? 0} · Chưa gửi {s.stats7d.pending ?? 0}</div>
      </div>
      {s.lastError && <p className="text-xs text-destructive">{s.lastError}</p>}
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <div className="text-sm font-medium">Gửi tự động</div>
          <div className="text-xs text-muted-foreground">Chỉ bật sau khi đã gửi tin thử thành công.</div>
        </div>
        <Switch checked={s.autoSend} disabled={s.status !== "connected"} onCheckedChange={(on) => run(setAuto({ data: { on } }))} />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button disabled={!s.secretsReady} onClick={() => connect().then((r) => { window.location.href = r.url; }).catch((e) => toast.error(e.message))}>
          {s.status === "connected" ? "Kết nối lại" : "Kết nối OA"}
        </Button>
        <Button variant="outline" onClick={() => run(check())}>Kiểm tra kết nối</Button>
        <Button variant="outline" onClick={() => run(test())}>Gửi tin thử</Button>
        <Button variant="outline" onClick={() => run(retry().then((r) => ({ ok: true, message: `Đã xử lý ${r.processed} thông báo` })))}>Thử gửi lại</Button>
        {s.status !== "disconnected" && <Button variant="ghost" onClick={() => confirm("Ngắt kết nối Zalo OA?") && run(disc())}>Ngắt kết nối</Button>}
      </div>
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">Thông tin cấu hình trên Zalo for Developers</summary>
        <div className="mt-2 space-y-1 break-all">
          <div>Callback URL: <code>{s.callbackUrl}</code></div>
          <div>Webhook URL: <code>{s.webhookUrl}</code> (sự kiện: người dùng gửi tin nhắn văn bản)</div>
        </div>
      </details>
    </CardContent></Card>
  );
}

export function ZaloSettingsTab({ isAdmin }: { isAdmin: boolean }) {
  return <div className="space-y-4 max-w-2xl">{isAdmin && <ZaloAdminCard />}<ZaloLinkCard /></div>;
}
