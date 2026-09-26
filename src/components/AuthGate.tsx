import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

const PUBLIC_PATHS = ["/login", "/register"];
const PENDING_PATH = "/pending";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const currentUserId = useAuth((s) => s.currentUserId);
  const initialized = useAuth((s) => s.initialized);
  const loaded = useAuth((s) => s.loaded);
  const init = useAuth((s) => s.init);
  const touchPresence = useAuth((s) => s.touchPresence);
  const currentUser = useAuth((s) =>
    s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) : null
  );

  const initStore = useStore((s) => s.init);

  useEffect(() => {
    init();
    initStore();
  }, [init, initStore]);

  // Presence heartbeat: ping every 60s while signed-in; also on focus/visibility.
  useEffect(() => {
    if (!currentUserId) return;
    touchPresence();
    const iv = setInterval(() => touchPresence(), 60_000);
    const onVis = () => { if (!document.hidden) touchPresence(); };
    window.addEventListener("focus", onVis);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(iv);
      window.removeEventListener("focus", onVis);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [currentUserId, touchPresence]);

  const isPublic = PUBLIC_PATHS.includes(path);
  const isPending = path === PENDING_PATH;

  useEffect(() => {
    if (!initialized) return;
    if (!currentUserId && !isPublic && !isPending) {
      try {
        const back = window.location.pathname + window.location.search;
        if (back !== "/" ) sessionStorage.setItem("after_login", back);
      } catch { /* ignore */ }
      navigate({ to: "/login" });
      return;
    }
    if (currentUserId && loaded && currentUser?.status === "Chờ duyệt" && !isPending) {
      navigate({ to: "/pending" });
      return;
    }
    if (currentUserId && loaded && currentUser?.status === "Đang hoạt động" && isPending) {
      navigate({ to: "/" });
    }
  }, [currentUserId, isPublic, isPending, navigate, initialized, loaded, currentUser?.status]);

  if (isPublic) return <>{children}</>;
  if (!initialized) return null;
  if (!currentUserId) return null;
  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải dữ liệu hệ thống…
      </div>
    );
  }
  // Pending users: only render /pending page
  if (currentUser?.status === "Chờ duyệt") {
    if (isPending) return <>{children}</>;
    return null;
  }
  return <>{children}</>;
}
