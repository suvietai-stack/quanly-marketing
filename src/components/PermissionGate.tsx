import { ReactNode, cloneElement, isValidElement } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentUser, type PermissionKey } from "@/lib/auth";
import { ShieldOff } from "lucide-react";

interface GateProps {
  perm: PermissionKey | PermissionKey[];
  /** "any" (default): pass if user has ANY of the perms. "all": must have all. */
  mode?: "any" | "all";
  /** When true, render children but disabled (with tooltip). When false (default), hide entirely. */
  disable?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ perm, mode = "any", disable = false, fallback = null, children }: GateProps) {
  const { canAny, canAll } = useCurrentUser();
  const keys = Array.isArray(perm) ? perm : [perm];
  const ok = mode === "all" ? canAll(...keys) : canAny(...keys);
  if (ok) return <>{children}</>;
  if (!disable) return <>{fallback}</>;
  // Disabled mode: clone the single child and force disabled=true, wrap with tooltip.
  if (isValidElement(children)) {
    const cloned = cloneElement(children as any, { disabled: true, "aria-disabled": true });
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block cursor-not-allowed">{cloned}</span>
          </TooltipTrigger>
          <TooltipContent>Bạn không có quyền thực hiện hành động này</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return <>{fallback}</>;
}

/** Page-level guard. Renders children only if user has the permission, otherwise a 403 panel. */
export function RequirePermission({ perm, children }: { perm: PermissionKey | PermissionKey[]; children: ReactNode }) {
  const { canAny } = useCurrentUser();
  const keys = Array.isArray(perm) ? perm : [perm];
  if (canAny(...keys)) return <>{children}</>;
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShieldOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-1">Bạn không có quyền truy cập</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Trang/chức năng này yêu cầu quyền chưa được cấp cho tài khoản của bạn.
        Vui lòng liên hệ Admin nếu bạn cho rằng đây là nhầm lẫn.
      </p>
    </div>
  );
}
