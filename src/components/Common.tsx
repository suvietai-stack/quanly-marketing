import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <Card className="p-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </Card>
  );
}

export function EmptyState({
  title,
  hint,
  icon,
  action,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card/40 py-16 px-6 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="font-medium text-foreground">{title}</div>
      {hint && <div className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">{hint}</div>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ComingSoon({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="rounded-xl border bg-card p-10 text-center">
      <div className="inline-block rounded-full bg-warning/15 text-[oklch(0.45_0.13_75)] px-3 py-1 text-xs font-semibold mb-4">
        Sắp ra mắt
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
        Module này sẽ được phát triển ở giai đoạn sau. Hệ thống đã chuẩn bị sẵn nền tảng dữ liệu để mở rộng.
      </p>
      {items && (
        <ul className="mt-5 inline-flex flex-col gap-1.5 text-sm text-left text-muted-foreground">
          {items.map((i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" /> {i}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
