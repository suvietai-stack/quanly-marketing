/** Web Push phía trình duyệt. Chỉ gọi trong event handler / useEffect. */
import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY } from "./config";

export type PushState = "on" | "off" | "denied" | "unsupported" | "ios_install" | "preview";

export function isPreviewContext() {
  if (typeof window === "undefined") return true;
  const h = location.hostname;
  let framed = false; try { framed = window.self !== window.top; } catch { framed = true; }
  return framed || h === "localhost" || h.startsWith("id-preview--") || h.startsWith("preview--") || h.endsWith("lovableproject.com") || h.endsWith("lovableproject-dev.com");
}
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const standalone = () => window.matchMedia?.("(display-mode: standalone)").matches || (navigator as any).standalone === true;

function deviceName() {
  const ua = navigator.userAgent;
  const os = /Android/.test(ua) ? "Android" : isIOS() ? "iPhone/iPad" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Khác";
  const br = /Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /Firefox|FxiOS/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Trình duyệt";
  return `${br} · ${os}`;
}
const keyBytes = (b64: string) => { const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (b64.length % 4)) % 4)); return Uint8Array.from(s, (c) => c.charCodeAt(0)); };

async function registration() {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing?.active?.scriptURL.endsWith("/push-sw.js")) return existing;
  return navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
}

export async function currentState(): Promise<PushState> {
  if (isPreviewContext()) return "preview";
  if (isIOS() && !standalone()) return "ios_install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

export async function enablePush(): Promise<PushState> {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return perm === "denied" ? "denied" : "off";
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) });
  const j = sub.toJSON() as any;
  const { error } = await (supabase as any).rpc("push_subscribe", { _endpoint: j.endpoint, _p256dh: j.keys.p256dh, _auth: j.keys.auth, _device: deviceName() });
  if (error) throw error;
  return "on";
}

/** Tắt trên thiết bị hiện tại (gọi cả khi đăng xuất). Không bao giờ ném lỗi. */
export async function disablePush() {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await (supabase as any).rpc("push_unsubscribe", { _endpoint: sub.endpoint, _id: null });
    await sub.unsubscribe();
  } catch { /* bỏ qua */ }
}

export async function listDevices(): Promise<{ id: string; device: string | null; created_at: string; last_used_at: string | null; endpoint: string }[]> {
  const { data } = await (supabase as any).from("push_subscriptions").select("id,device,created_at,last_used_at,endpoint").eq("status", "active").order("created_at", { ascending: false });
  return data ?? [];
}
export async function revokeDevice(id: string) {
  const { error } = await (supabase as any).rpc("push_unsubscribe", { _endpoint: null, _id: id });
  if (error) throw error;
}
export async function currentEndpoint() {
  try { return (await (await navigator.serviceWorker.getRegistration("/"))?.pushManager.getSubscription())?.endpoint ?? null; } catch { return null; }
}
