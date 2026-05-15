import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const currentUserId = useAuth((s) => s.currentUserId);
  const initialized = useAuth((s) => s.initialized);
  const loaded = useAuth((s) => s.loaded);
  const init = useAuth((s) => s.init);

  const initStore = useStore((s) => s.init);

  useEffect(() => {
    init();
    initStore();
  }, [init, initStore]);

  const isPublic = PUBLIC_PATHS.includes(path);

  useEffect(() => {
    if (!initialized) return;
    if (!currentUserId && !isPublic) navigate({ to: "/login" });
  }, [currentUserId, isPublic, navigate, initialized]);

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
  return <>{children}</>;
}
