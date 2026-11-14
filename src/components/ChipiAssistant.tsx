import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, EyeOff, Settings2, X, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CHIPI_SIZES, CHIPI_CHAT_LINES, validChipiSize, chipiGreeting, chipiGreetingPose, chipiChatDelay, nextChipiLine, type ChipiSize } from "@/lib/chipiChat";
import { ChipiNoticeIcon } from "@/components/ChipiNoticeIcon";
import { ChipiAiPanel } from "@/components/ai/ChipiAiPanel";
import { Button } from "@/components/ui/button";
import { NotificationBell, notificationText } from "@/components/ZaloUi";
import { chipiAssets } from "@/assets/chipi/states";
import { chipiState, chipiDisplayState, CHIPI_PLAY_INTERVAL_MS, CHIPI_PLAY_DURATION_MS, currentChipiNotice, newChipiNotice, type ChipiNotice, type ChipiDecoration } from "@/lib/chipi";

export function ChipiAssistant({ userId }: { userId: string }) {
  const [mode, setMode] = useState<"full" | "small" | "hidden">("full");
  const [ready, setReady] = useState(false);
  const [hello, setHello] = useState(true);
  const [notice, setNotice] = useState<ChipiNotice>();
  const [bubble, setBubble] = useState(false);
  const [decoration, setDecoration] = useState<"hello" | "thinking">();
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [size, setSize] = useState<ChipiSize>(150);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [chat, setChat] = useState<string>();
  const [chatPose, setChatPose] = useState<ChipiDecoration>("thankyou");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const lastLine = useRef(-1);
  const lastActive = useRef(0);
  const chatTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const preferencesKey = `chipi-preferences:${userId}`;
  const seen = useRef(new Set<string>());
  const lastBubble = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const key = `chipi:${userId}`;
  const business = chipiState(notice);

  const canChat = useCallback(() => document.visibilityState === "visible" && !document.querySelector('[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]') && !(document.activeElement?.closest('form, input, textarea, select, [contenteditable="true"]')), []);
  const say = useCallback((text: string, pose: ChipiDecoration = "thankyou") => {
    setChatPose(pose);
    setChat(text);
    clearTimeout(chatTimer.current);
    chatTimer.current = setTimeout(() => setChat(undefined), 7000);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(preferencesKey, JSON.stringify({ size, chatEnabled })); } catch { /* Optional browser preferences. */ }
  }, [ready, preferencesKey, size, chatEnabled]);

  useEffect(() => {
    if (business !== "idle" || !chatEnabled || mode !== "full") setChat(undefined);
  }, [business, chatEnabled, mode]);

  useEffect(() => {
    const active = () => { lastActive.current = Date.now(); };
    active();
    window.addEventListener("pointerdown", active, { passive: true });
    window.addEventListener("keydown", active);
    return () => { window.removeEventListener("pointerdown", active); window.removeEventListener("keydown", active); clearTimeout(chatTimer.current); };
  }, []);

  useEffect(() => {
    if (!ready || !chatEnabled || mode !== "full" || business !== "idle") return;
    let next: ReturnType<typeof setTimeout>;
    const schedule = () => { next = setTimeout(() => {
      if (Date.now() - lastActive.current < 5 * 60_000 && canChat()) {
        lastLine.current = nextChipiLine(lastLine.current, Math.random());
        say(CHIPI_CHAT_LINES[lastLine.current] ?? CHIPI_CHAT_LINES[0]);
      }
      schedule();
    }, chipiChatDelay(Math.random())); };
    schedule();
    return () => clearTimeout(next);
  }, [ready, chatEnabled, mode, business, canChat, say]);

  useEffect(() => {
    if (!ready || !hello || !chatEnabled || mode !== "full" || business !== "idle") return;
    const greet = setTimeout(() => { if (canChat()) { const now = new Date(); say(chipiGreeting(now), chipiGreetingPose(now)); } }, 700);
    return () => clearTimeout(greet);
  }, [ready, hello, chatEnabled, mode, business, canChat, say]);

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
      if (!canChat()) return;
      setDecoration(count++ % 2 === 0 ? "hello" : "thinking");
      clearTimeout(end);
      end = setTimeout(() => setDecoration(undefined), CHIPI_PLAY_DURATION_MS);
    }, CHIPI_PLAY_INTERVAL_MS);
    return () => { clearInterval(play); clearTimeout(end); };
  }, [ready, motionAllowed, mode, business, canChat]);

  useEffect(() => {
    try {
      const preferences = JSON.parse(localStorage.getItem(preferencesKey) ?? "{}");
      setSize(validChipiSize(preferences.size));
      setChatEnabled(preferences.chatEnabled !== false);
      const saved = JSON.parse(sessionStorage.getItem(key) ?? "{}");
      if (["full", "small", "hidden"].includes(saved.mode)) setMode(saved.mode);
      seen.current = new Set(Array.isArray(saved.seen) ? saved.seen : []);
      lastBubble.current = typeof saved.lastBubble === "number" ? saved.lastBubble : 0;
      setHello(!saved.visited);
    } catch { /* Storage can be unavailable. */ }
    setReady(true);
    const greeting = setTimeout(() => setHello(false), 4500);
    return () => { clearTimeout(greeting); clearTimeout(timer.current); };
  }, [key, preferencesKey]);

  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(key, JSON.stringify({ mode, visited: true, lastBubble: lastBubble.current, seen: [...seen.current].slice(-100) })); } catch { /* Session-only preference. */ }
  }, [key, mode, ready, notice]);

  const onNotifications = useCallback((data: ChipiNotice[]) => {
    const fresh = newChipiNotice(data, seen.current);
    seen.current = new Set([...seen.current, ...data.map((n) => n.id)].slice(-100));
    if (!fresh) { setNotice((old) => currentChipiNotice(data, old?.id)); return; }
    setNotice(fresh);
    setChat(undefined);
    if (Date.now() - lastBubble.current < 60_000) return;
    lastBubble.current = Date.now();
    setHello(false);
    setBubble(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(false), 7000);
  }, []);

  if (!ready) return null;
  if (mode === "hidden") return <div className="chipi-assistant chipi-hidden"><Button variant="outline" size="icon" title="Hiện Chipi" aria-label="Hiện Chipi" onClick={() => setMode("small")}><ChevronUp /></Button></div>;
  const state = chipiDisplayState(business, chat ? chatPose : !chatEnabled ? "quiet" : decoration);
  return (
    <div className={`chipi-assistant chipi-size-${size} ${mode === "small" ? "chipi-small" : ""}`} data-state={state}>
      <ChipiAiPanel open={aiOpen} onOpenChange={setAiOpen} />
      {chat && business === "idle" && mode === "full" && <div className="chipi-bubble p-4" role="status"><div className="flex items-start gap-2"><Smile className="h-4 w-4 text-chipi-orange shrink-0 mt-0.5" /><p className="text-sm flex-1">{chat}</p><Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" aria-label="Đóng lời chào Chipi" onClick={() => setChat(undefined)}><X /></Button></div></div>}
      {bubble && mode === "full" && notice && <div className="chipi-bubble p-4" role="status">
        <div className="flex items-start gap-2.5"><span className="chipi-notice-icon"><ChipiNoticeIcon kind={notice.kind} className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold break-words">{notificationText(notice)}</p><p className="text-xs text-muted-foreground mt-1.5">Chipi nhắc bạn kiểm tra nhé!</p></div><Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 -mr-1 -mt-1" aria-label="Đóng lời nhắc Chipi" onClick={() => setBubble(false)}><X /></Button></div>
      </div>}
      <div className="chipi-tools flex justify-end gap-1">
        <NotificationBell onNotifications={onNotifications} />
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}><PopoverTrigger asChild><Button size="icon" variant="ghost" className="h-7 w-7 bg-background/90" title="Cài đặt Chipi" aria-label="Cài đặt Chipi"><Settings2 /></Button></PopoverTrigger><PopoverContent align="end" collisionPadding={12} className="w-72 max-w-[calc(100vw-24px)] space-y-4"><h3 className="font-semibold text-sm">Cài đặt Chipi · AI Sứ Việt</h3><div><p className="text-xs text-muted-foreground mb-2">Kích thước máy tính</p><div className="grid grid-cols-2 gap-2">{CHIPI_SIZES.map((value, index) => <Button key={value} size="sm" variant={size === value ? "default" : "outline"} onClick={() => setSize(value)} aria-pressed={size === value}>{["Nhỏ", "Vừa", "Lớn", "Rất lớn"][index]} · {value}px</Button>)}</div></div><div className="flex items-center justify-between gap-3"><label htmlFor={`chipi-chat-${userId}`} className="text-sm">Lời chào vui tự động</label><Switch id={`chipi-chat-${userId}`} checked={chatEnabled} onCheckedChange={setChatEnabled} /></div>{!chatEnabled && <p className="text-xs text-muted-foreground">Yên tĩnh · chỉ thông báo công việc</p>}</PopoverContent></Popover>
        <Button size="icon" variant="ghost" className="h-7 w-7 bg-background/90" title={mode === "small" ? "Mở rộng Chipi" : "Thu nhỏ Chipi"} aria-label={mode === "small" ? "Mở rộng Chipi" : "Thu nhỏ Chipi"} onClick={() => { setMode(mode === "small" ? "full" : "small"); setBubble(false); }}>{mode === "small" ? <ChevronUp /> : <ChevronDown />}</Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 bg-background/90" title="Ẩn Chipi trong phiên này" aria-label="Ẩn Chipi" onClick={() => { setMode("hidden"); setBubble(false); }}><EyeOff /></Button>
      </div>
      <button type="button" className="chipi-trigger relative h-auto border-0 bg-transparent p-0 hover:bg-transparent" title="Hỏi AI Sứ Việt" aria-label="Mở trợ lý AI Sứ Việt" onClick={() => {setBubble(false);setAiOpen(true);setChat(undefined);}}>
        <span className={bubble ? "chipi-art chipi-bounce" : "chipi-art"}>
          <span className={decoration ? "chipi-pose chipi-play" : "chipi-pose"}>
            <img key={state} src={chipiAssets[state].url} alt="Chipi · AI Sứ Việt" width={size} height={size} draggable={false}/>
          </span>
        </span>
      </button>
    </div>
  );
}