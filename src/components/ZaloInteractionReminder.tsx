import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ZaloLinkCard } from "@/components/ZaloUi";
import { zaloMyLink, zaloReminderHealth } from "@/lib/zalo.functions";
import { interactionState, reminderDue, reminderStorageKey, REMINDER_SNOOZE } from "@/lib/zaloReminder";

export function ZaloInteractionReminder({ userId }: { userId: string }) {
  const myLink = useServerFn(zaloMyLink);
  const getHealth = useServerFn(zaloReminderHealth);
  const [clock, setClock] = useState<number | null>(null);
  const [snoozedAt, setSnoozedAt] = useState(NaN);
  const [linkOpen, setLinkOpen] = useState(false);
  const link = useQuery({ queryKey: ["zalo-reminder-link", userId], queryFn: () => myLink(), refetchInterval: 30_000, refetchOnWindowFocus: "always", retry: 1 });
  const health = useQuery({ queryKey: ["zalo-reminder-health", userId], queryFn: () => getHealth(), refetchInterval: 60_000, refetchOnWindowFocus: "always", retry: 1 });

  useEffect(() => {
    const sync = () => {
      setClock(Date.now());
      try { const value = localStorage.getItem(reminderStorageKey(userId)); setSnoozedAt(value ? Number(value) : NaN); } catch { /* Keep the in-memory dismissal if storage is unavailable. */ }
    };
    sync();
    const timer = window.setInterval(sync, 30_000);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => { window.clearInterval(timer); window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); };
  }, [userId]);

  const later = () => {
    const at = Date.now();
    setSnoozedAt(at);
    try { localStorage.setItem(reminderStorageKey(userId), String(at)); } catch { /* Dismissal still works for this visit. */ }
  };
  if (clock === null || link.isPending || health.isPending) return null;
  const state = link.isError || health.isError ? "unknown" : interactionState(link.data ?? null, health.data ?? { connected: false, webhookConfigured: false }, clock);
  const snoozed = Number.isFinite(snoozedAt) && clock < snoozedAt + REMINDER_SNOOZE;
  if (state === "fresh" || snoozed) return null;
  const popup = reminderDue(state, snoozedAt, clock);
  const oaUrl = health.data?.oaUrl;
  const message = state === "unlinked" ? "Chưa liên kết Zalo cá nhân." : state === "soon" ? "Sắp đủ 7 ngày từ lần tương tác Zalo OA được Base ghi nhận. Hãy nhắn BASE để duy trì khả năng nhận tin cá nhân." : state === "overdue" ? "Đã lâu bạn chưa tương tác với Zalo OA Sứ Việt. Thông báo Zalo cá nhân có thể không gửi được." : state === "unavailable" ? "Zalo OA hoặc liên kết cá nhân chưa sẵn sàng. Chưa thể xác minh khả năng nhận tin; vui lòng liên hệ quản trị viên." : "Chưa xác minh được lần tương tác Zalo OA. Nếu đã gửi BASE, hãy chờ Base nhận được tin; nếu chưa cập nhật, liên hệ quản trị viên kiểm tra kết nối nhận tin.";

  return <>
    {popup ? <section role="dialog" aria-modal="false" aria-labelledby="zalo-interaction-title" aria-describedby="zalo-interaction-description" className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-lg border bg-card p-5 text-card-foreground shadow-lg max-h-[calc(100dvh-2rem)] overflow-y-auto">
      <div className="flex items-start justify-between gap-3">
        <h2 id="zalo-interaction-title" className="text-base font-semibold leading-6">🔔 NHẮC TƯƠNG TÁC ZALO OA</h2>
        <Button variant="ghost" size="icon" className="shrink-0" aria-label="Để sau 24 giờ" onClick={later}><X className="h-4 w-4" /></Button>
      </div>
      <p id="zalo-interaction-description" className="mt-2 text-sm text-muted-foreground">{message}</p>
      <ol className="my-4 space-y-2 text-sm">
        <li>Bước 1: Mở Zalo OA Sứ Việt.</li>
        <li>Bước 2: Gửi tin nhắn <strong>BASE</strong> cho OA.</li>
        <li>Bước 3: Quay lại Base, hệ thống tự kiểm tra trạng thái.</li>
      </ol>
      {!oaUrl && <p className="mb-3 text-xs text-muted-foreground">Chưa có đường dẫn OA đã xác minh. Vui lòng liên hệ quản trị viên.</p>}
      <div className="flex flex-wrap gap-2">
        {oaUrl && <Button asChild><a href={oaUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Mở Zalo OA</a></Button>}
        <Button variant="outline" onClick={later}>Để sau</Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Theo lần tương tác Base ghi nhận; không áp dụng cho thông báo nhóm GMF.</p>
    </section> : <div role="status" className="mb-4 flex flex-wrap items-center gap-3 border-b pb-3 text-sm">
      <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 min-w-40 text-muted-foreground">{message}</p>
      {state === "unlinked" ? <Button size="sm" variant="outline" onClick={() => setLinkOpen(true)}>Liên kết Zalo</Button> : oaUrl && state === "soon" ? <Button size="sm" variant="outline" asChild><a href={oaUrl} target="_blank" rel="noopener noreferrer">Mở Zalo OA</a></Button> : null}
      <Button variant="ghost" size="icon" aria-label="Để sau 24 giờ" onClick={later}><X className="h-4 w-4" /></Button>
    </div>}
    <Dialog open={linkOpen} onOpenChange={setLinkOpen}><DialogContent className="max-w-md w-[calc(100%-2rem)] rounded-lg"><DialogTitle>Liên kết Zalo cá nhân</DialogTitle><DialogDescription>Liên kết với OA Sứ Việt để nhận thông báo cá nhân.</DialogDescription><ZaloLinkCard /></DialogContent></Dialog>
  </>;
}