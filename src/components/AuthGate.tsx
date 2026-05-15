import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const currentUserId = useAuth((s) => s.currentUserId);
  const ensureSeed = useAuth((s) => s.ensureSeed);

  useEffect(() => { ensureSeed(); }, [ensureSeed]);

  const isPublic = PUBLIC_PATHS.includes(path);

  useEffect(() => {
    if (!currentUserId && !isPublic) navigate({ to: "/login" });
  }, [currentUserId, isPublic, navigate]);

  if (isPublic) return <>{children}</>;
  if (!currentUserId) return null;
  return <>{children}</>;
}
