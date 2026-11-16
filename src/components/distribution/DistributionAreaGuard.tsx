import type { ReactNode } from 'react';
import { useBizAreaAccess, type BizAreaAccess } from '@/lib/distribution/access';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';

export function DistributionAreaGuard({ children }: { children: (scope: BizAreaAccess) => ReactNode }) {
  const access = useBizAreaAccess();
  if (access.isPending) return <div role="status" className="rounded-xl border p-6 text-sm text-muted-foreground">Đang xác minh phạm vi Phân Phối…</div>;
  if (access.isError) return <div role="alert" className="space-y-3 rounded-xl border p-5 text-sm text-destructive">
    <p>Không tải được quyền Hệ Phân Phối: {access.error.message}</p>
    <Button variant="outline" onClick={() => access.refetch()}>Thử lại</Button>
  </div>;
  if (!access.data?.distribution) return <div className="rounded-xl border p-8 text-center space-y-3">
    <ShieldOff className="mx-auto size-9 text-muted-foreground"/>
    <h2 className="font-semibold">Không có quyền vào Hệ Phân Phối</h2>
    <p className="text-sm text-muted-foreground">Quyền được xác định theo vị trí đang hoạt động trong cơ cấu tổ chức.</p>
  </div>;
  return <>{children(access.data)}</>;
}
