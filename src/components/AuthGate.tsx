import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

const PUBLIC_PATHS = ["/login", "/register", "/chinh-sach-bao-mat", "/reset-password"];
const PENDING_PATH = "/pending";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const currentUserId = useAuth((s) => s.currentUserId);
  const initialized = useAuth((s) => s.initialized);
  const loaded = useAuth((s) => s.loaded);
  const init = useAuth((s) => s.init);
  const touchPresence = useAuth((s) => s.touchPresence);
  const refreshBizAccess = useAuth(s => s.refreshBizAccess);
  const nextBizChange = useAuth(s => s.bizAccess?.next_change);
  const qc = useQueryClient();
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
    if (!currentUserId || currentUser?.status !== 'Đang hoạt động') return;
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
  }, [currentUserId, currentUser?.status, touchPresence]);

  useEffect(() => {
    if (!currentUserId) return;
    let active = true;
    const refresh = async (force = false) => {
      const before = useAuth.getState().bizAccess;
      const previous = JSON.stringify([before?.permissions,before?.appointments,before?.legacy_assignments,before?.exceptions]);
      await refreshBizAccess(force);
      if (!active) return;
      const after = useAuth.getState().bizAccess;
      const changed = previous !== JSON.stringify([after?.permissions,after?.appointments,after?.legacy_assignments,after?.exceptions]);
      // Chỉ tải lại dữ liệu Kinh doanh khi quyền thực sự đổi.
      if (changed) { qc.removeQueries({ predicate: q => String(q.queryKey[0]).startsWith('biz_') }); await qc.invalidateQueries({ predicate: q => String(q.queryKey[0]).startsWith('biz_') }); }
    };
    const visible = () => { if (!document.hidden) void refresh(); };
    const interval = window.setInterval(visible, 120000);
    const boundary = nextBizChange ? window.setTimeout(() => void refresh(true), Math.max(0, Math.min(2147483647, Date.parse(nextBizChange) - Date.now() + 100))) : undefined;
    window.addEventListener('focus', visible);
    document.addEventListener('visibilitychange', visible);
    return () => { active = false; clearInterval(interval); clearTimeout(boundary); window.removeEventListener('focus', visible); document.removeEventListener('visibilitychange', visible); };
  }, [currentUserId, nextBizChange, refreshBizAccess, qc]);

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
    if (currentUserId && loaded && currentUser?.status === "Chờ duyệt" && !isPending && !isPublic) {
      navigate({ to: "/pending" });
      return;
    }
    if (currentUserId && loaded && currentUser?.status === "Đang hoạt động" && isPending) {
      navigate({ to: "/" });
    }
  }, [currentUserId, isPublic, isPending, navigate, initialized, loaded, currentUser?.status]);

  if (isPublic) return <>{children}</>;
  // Phiên đang được khôi phục/xác minh — chưa kết luận chưa đăng nhập.
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang khôi phục phiên đăng nhập…
      </div>
    );
  }
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
  if (currentUser?.status !== 'Đang hoạt động') return <div className="flex min-h-screen items-center justify-center px-4"><div className="max-w-md space-y-4 text-center"><p role="alert" className="text-sm text-muted-foreground">{currentUser ? 'Tài khoản hiện không được phép truy cập. Vui lòng liên hệ quản trị viên.' : 'Không kiểm tra được hồ sơ tài khoản. Vui lòng tải lại hoặc liên hệ quản trị viên.'}</p><div className="flex justify-center gap-2"><Button variant="outline" onClick={() => void useAuth.getState().reload()}>Thử lại</Button><Button onClick={() => void useAuth.getState().logout()}>Đăng xuất</Button></div></div></div>;
  return <>{children}</>;
}
