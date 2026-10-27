import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, EyeOff, X } from "lucide-react";
import { ChipiNoticeIcon } from "@/components/ChipiNoticeIcon";
import { Button } from "@/components/ui/button";
import { NotificationBell, NOTIFICATION_LABEL } from "@/components/ZaloUi";
import { chipiAssets } from "@/assets/chipi/states";
import { chipiState, chipiDisplayState, CHIPI_PLAY_INTERVAL_MS, CHIPI_PLAY_DURATION_MS, currentChipiNotice, newChipiNotice, type ChipiNotice } from "@/lib/chipi";

export function ChipiAssistant({ userId }: { userId: string }) {
  const [mode, setMode] = useState<"full" | "small" | "hidden">("full");
  const [ready, setReady] = useState(false);
  const [hello, setHello] = useState(true);
  const [notice, setNotice] = useState<ChipiNotice>();
  const [bubble, setBubble] = useState(false);
  const [decoration, setDecoration] = useState<"hello" | "thinking">();
  const [motionAllowed, setMotionAllowed] = useState(false);
  const seen = useRef(new Set<string>());
  const lastBubble = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const key = `chipi:${userId}`;
  const business = chipiState(notice);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!ready || !motionAllowed || mode !== "full" || business !== "idle") { setDecoration(undefined); return; }
    let count = 0;
    let end: ReturnType<typeof setTimeout> | undefined;
    const play = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setDecoration(count++ % 2 === 0 ? "hello" : "thinking");
      clearTimeout(end);
      end = setTimeout(() => setDecoration(undefined), CHIPI_PLAY_DURATION_MS);
    }, CHIPI_PLAY_INTERVAL_MS);
    return () => { clearInterval(play); clearTimeout(end); };
  }, [ready, motionAllowed, mode, business]);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) ?? "{}");
      if (["full", "small", "hidden"].includes(saved.mode)) setMode(saved.mode);
      seen.current = new Set(Array.isArray(saved.seen) ? saved.seen : []);
      lastBubble.current = typeof saved.lastBubble === "number" ? saved.lastBubble : 0;
      setHello(!saved.visited);
    } catch { /* Storage can be unavailable. */ }
    setReady(true);
    const greeting = setTimeout(() => setHello(false), 4500);
    return () => { clearTimeout(greeting); clearTimeout(timer.current); };
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(key, JSON.stringify({ mode, visited: true, lastBubble: lastBubble.current, seen: [...seen.current].slice(-100) })); } catch { /* Session-only preference. */ }
  }, [key, mode, ready, notice]);

  const onNotifications = useCallback((data: ChipiNotice[]) => {
    const fresh = newChipiNotice(data, seen.current);
    seen.current = new Set([...seen.current, ...data.map((n) => n.id)].slice(-100));
    if (!fresh) { setNotice((old) => currentChipiNotice(data, old?.id)); return; }
    setNotice(fresh);
    if (Date.now() - lastBubble.current < 60_000) return;
    lastBubble.current = Date.now();
    setHello(false);
    setBubble(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(false), 7000);
  }, []);

  if (!ready) return null;
  if (mode === "hidden") return <div className="chipi-assistant chipi-hidden"><Button variant="outline" size="icon" title="Hiện Chipi" aria-label="Hiện Chipi" onClick={() => setMode("small")}><ChevronUp /></Button></div>;
  const state = chipiDisplayState(business, hello ? "hello" : decoration);
  return (
    <div className={`chipi-assistant ${mode === "small" ? "chipi-small" : ""}`} data-state={state}>
      {bubble && mode === "full" && notice && <div className="chipi-bubble p-4" role="status">
        <div className="flex items-start gap-2.5"><span className="chipi-notice-icon"><ChipiNoticeIcon kind={notice.kind} className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold break-words">{NOTIFICATION_LABEL[notice.kind] ?? "Bạn có thông báo mới."}</p><p className="text-xs text-muted-foreground mt-1.5">Chipi nhắc bạn kiểm tra nhé!</p></div><Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 -mr-1 -mt-1" aria-label="Đóng lời nhắc Chipi" onClick={() => setBubble(false)}><X /></Button></div>
      </div>}
      <div className="chipi-tools flex justify-end gap-1">
        <Button size="icon" variant="ghost" className="h-7 w-7 bg-background/90" title={mode === "small" ? "Mở rộng Chipi" : "Thu nhỏ Chipi"} aria-label={mode === "small" ? "Mở rộng Chipi" : "Thu nhỏ Chipi"} onClick={() => { setMode(mode === "small" ? "full" : "small"); setBubble(false); }}>{mode === "small" ? <ChevronUp /> : <ChevronDown />}</Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 bg-background/90" title="Ẩn Chipi trong phiên này" aria-label="Ẩn Chipi" onClick={() => { setMode("hidden"); setBubble(false); }}><EyeOff /></Button>
      </div>
      <NotificationBell onNotifications={onNotifications} trigger={<span onClick={() => setBubble(false)} className={bubble ? "chipi-art chipi-bounce" : "chipi-art"}><span className={decoration ? "chipi-pose chipi-play" : "chipi-pose"}><img key={state} src={chipiAssets[state].url} alt="Chipi Sứ Việt" width={128} height={128} draggable={false} /></span></span>} />
    </div>
  );
}