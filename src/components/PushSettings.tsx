import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { pushTest } from "@/lib/push.functions";
import { currentEndpoint, currentState, disablePush, enablePush, listDevices, revokeDevice, type PushState } from "@/lib/push/client";

const LABEL: Record<PushState, string> = {
  on: "Đã bật", off: "Chưa bật", denied: "Trình duyệt đã chặn", unsupported: "Thiết bị chưa hỗ trợ",
  ios_install: "Cần thêm Base vào màn hình chính", preview: "Chỉ dùng được trên trang chính thức",
};

export function PushSettings() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [devices, setDevices] = useState<Awaited<ReturnType<typeof listDevices>>>([]);
  const [mine, setMine] = useState<string | null>(null);
  const test = useServerFn(pushTest);
  const refresh = async () => {
    setState(await currentState());
    setDevices(await listDevices());
    setMine(await currentEndpoint());
  };
  useEffect(() => { refresh(); }, []);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { toast.error(e?.message || "Có lỗi xảy ra"); }
    finally { setBusy(false); refresh(); }
  };
  if (!state) return null;
  return (
    <div className="space-y-2 text-sm">
      <div className="font-medium">Thông báo trên thiết bị</div>
      <div className="text-xs">Trạng thái: <span className={state === "on" ? "text-primary font-medium" : "text-muted-foreground"}>{LABEL[state]}</span></div>
      {state === "off" && <Button size="sm" className="w-full" disabled={busy} onClick={() => run(async () => { const s = await enablePush(); if (s === "on") toast.success("Đã bật thông báo trên thiết bị này"); })}>Bật thông báo trên thiết bị này</Button>}
      {state === "on" && <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" disabled={busy} onClick={() => run(async () => { const r = await test(); toast.success(`Đã gửi thử tới ${r.sent}/${r.total} thiết bị`); })}>Gửi thử</Button>
        <Button size="sm" variant="outline" className="flex-1" disabled={busy} onClick={() => run(disablePush)}>Tắt trên thiết bị này</Button>
      </div>}
      {state === "denied" && <p className="text-xs text-muted-foreground">Bạn đã chặn thông báo. Mở cài đặt trang web của trình duyệt (biểu tượng ổ khóa cạnh địa chỉ) → cho phép Thông báo, rồi tải lại trang.</p>}
      {state === "ios_install" && <p className="text-xs text-muted-foreground">Trên iPhone/iPad (iOS 16.4 trở lên): mở Base bằng Safari → bấm nút Chia sẻ → "Thêm vào MH chính". Sau đó mở Base từ biểu tượng mới và bật thông báo tại đây.</p>}
      {state === "unsupported" && <p className="text-xs text-muted-foreground">Trình duyệt này chưa hỗ trợ thông báo đẩy. Hãy dùng Chrome, Edge hoặc Safari mới.</p>}
      {state === "preview" && <p className="text-xs text-muted-foreground">Mở Base tại base.suviet.vn để bật thông báo.</p>}
      {devices.length > 0 && <div className="pt-1">
        <div className="text-xs text-muted-foreground mb-1">Thiết bị đã bật ({devices.length})</div>
        {devices.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-2 py-1 text-xs border-t">
            <span>{d.device || "Thiết bị"}{d.endpoint === mine ? " (máy này)" : ""}</span>
            <button className="text-destructive" disabled={busy} onClick={() => run(async () => { if (d.endpoint === mine) await disablePush(); else await revokeDevice(d.id); })}>Tắt</button>
          </div>
        ))}
      </div>}
    </div>
  );
}
