import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Cfg = { zalo: Record<string, boolean>; remind: { enabled: boolean; hours: number } };
const EVENTS: [string, string][] = [
  ["content_assigned", "Giao bài mới"],
  ["content_review", "Gửi bài chờ duyệt"],
  ["content_revise", "Yêu cầu chỉnh sửa"],
  ["content_approved", "Bài được duyệt"],
  ["content_published", "Bài đã đăng"],
];

/** Cài đặt → Thông báo → Content Web. Công tắc chỉ ảnh hưởng Zalo; thông báo trong Base luôn được tạo. */
const ORDER_EVENTS: [string, string][] = [
  ["order_new", "Order mới chưa phân công"],
  ["order_assigned", "Phân công thiết kế"],
  ["order_taken", "Nhân viên nhận việc"],
  ["order_review", "Thiết kế gửi duyệt"],
  ["order_revise", "Yêu cầu chỉnh sửa"],
  ["order_approved", "Thiết kế được duyệt"],
  ["order_delivered", "Bàn giao thiết kế"],
];

/** Cài đặt → Thông báo → Order Thiết kế. Chỉ ảnh hưởng Zalo. */
export function OrderNotifySettings({ canEdit }: { canEdit: boolean }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    (supabase as any).from("content_notify_settings").select("data").eq("id", 1).maybeSingle().then(({ data }: any) => {
      const d = data?.data?.order ?? {};
      setCfg({ zalo: d.zalo ?? {}, remind: { enabled: !!d.remind?.enabled, hours: Number(d.remind?.hours) || 24 } });
    });
  }, []);
  if (!cfg) return null;
  const save = async () => {
    setBusy(true);
    const order = { zalo: { ...cfg.zalo, order_remind: cfg.remind.enabled }, remind: cfg.remind };
    const { error } = await (supabase as any).rpc("content_notify_save", { _data: { order } });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Đã lưu cài đặt thông báo Order Thiết kế");
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Thông báo Order Thiết kế</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-xs text-muted-foreground">Thông báo trong Base và trên thiết bị luôn được gửi. Các công tắc dưới đây chỉ bật/tắt gửi qua Zalo.</p>
        {ORDER_EVENTS.map(([k, label]) => (
          <div key={k} className="flex items-center justify-between border-t pt-2">
            <span>{label}</span>
            <Switch disabled={!canEdit} checked={!!cfg.zalo[k]} onCheckedChange={(v) => setCfg({ ...cfg, zalo: { ...cfg.zalo, [k]: v } })} />
          </div>
        ))}
        <div className="border-t pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span>Nhắc việc tự động</span>
            <Switch disabled={!canEdit} checked={cfg.remind.enabled} onCheckedChange={(v) => setCfg({ ...cfg, remind: { ...cfg.remind, enabled: v } })} />
          </div>
          {cfg.remind.enabled && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              Nhắc sau
              <Input type="number" min={1} max={168} className="w-20 h-8" disabled={!canEdit} value={cfg.remind.hours}
                onChange={(e) => setCfg({ ...cfg, remind: { ...cfg.remind, hours: Math.max(1, Math.min(168, Number(e.target.value) || 24)) } })} />
              giờ: chưa nhận việc (nhắc người được giao), chờ duyệt (nhắc người duyệt), đã bàn giao chưa xác nhận (nhắc người xác nhận). Tối đa 1 lần/ngày/order, 08:00–17:59.
            </div>
          )}
        </div>
        {canEdit && <Button size="sm" disabled={busy} onClick={save}>Lưu</Button>}
      </CardContent>
    </Card>
  );
}

export function ContentNotifySettings({ canEdit }: { canEdit: boolean }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    (supabase as any).from("content_notify_settings").select("data").eq("id", 1).maybeSingle().then(({ data }: any) => {
      const d = data?.data ?? {};
      setCfg({ zalo: d.zalo ?? {}, remind: { enabled: !!d.remind?.enabled, hours: Number(d.remind?.hours) || 24 } });
    });
  }, []);
  if (!cfg) return null;
  const save = async () => {
    setBusy(true);
    const data = { zalo: { ...cfg.zalo, content_remind: cfg.remind.enabled }, remind: cfg.remind };
    const { error } = await (supabase as any).rpc("content_notify_save", { _data: data });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Đã lưu cài đặt thông báo Content Web");
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Thông báo Content Web</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-xs text-muted-foreground">Thông báo trong Base và trên thiết bị luôn được gửi. Các công tắc dưới đây chỉ bật/tắt gửi qua Zalo.</p>
        {EVENTS.map(([k, label]) => (
          <div key={k} className="flex items-center justify-between border-t pt-2">
            <span>{label}</span>
            <Switch disabled={!canEdit} checked={!!cfg.zalo[k]} onCheckedChange={(v) => setCfg({ ...cfg, zalo: { ...cfg.zalo, [k]: v } })} />
          </div>
        ))}
        <div className="border-t pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span>Nhắc bài viết chưa được duyệt</span>
            <Switch disabled={!canEdit} checked={cfg.remind.enabled} onCheckedChange={(v) => setCfg({ ...cfg, remind: { ...cfg.remind, enabled: v } })} />
          </div>
          {cfg.remind.enabled && (
            <div className="flex items-center gap-2 text-xs">
              Nhắc người duyệt sau
              <Input type="number" min={1} max={168} className="w-20 h-8" disabled={!canEdit} value={cfg.remind.hours}
                onChange={(e) => setCfg({ ...cfg, remind: { ...cfg.remind, hours: Math.max(1, Math.min(168, Number(e.target.value) || 24)) } })} />
              giờ kể từ lần gửi duyệt gần nhất (tối đa 1 lần/ngày/bài, 08:00–17:59).
            </div>
          )}
        </div>
        {canEdit && <Button size="sm" disabled={busy} onClick={save}>Lưu</Button>}
      </CardContent>
    </Card>
  );
}
