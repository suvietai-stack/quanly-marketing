import { type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/lib/auth';
import { commercialAreaAccessQuery } from '@/lib/distribution/api';
import { Button } from '@/components/ui/button';

/** Server-checked membership in Distribution; roles still gate each child workflow. */
export function DistributionAccessGate({ children }: { children: ReactNode }) {
  const { user } = useCurrentUser();
  const query = useQuery(commercialAreaAccessQuery(user?.id ?? ''));
  if (!user || user.status !== 'Đang hoạt động') {
    return <p className="p-4 text-sm text-muted-foreground">Cần đăng nhập tài khoản đang hoạt động.</p>;
  }
  if (query.isPending) {
    return <p role="status" className="rounded-xl border p-5 text-sm text-muted-foreground">Đang kiểm tra quyền Phân Phối…</p>;
  }
  if (query.isError) {
    return <div role="alert" className="space-y-3 rounded-xl border p-5 text-sm">
      <p>Chưa tải được quyền Phân Phối: {query.error.message}</p>
      <Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button>
    </div>;
  }
  if (!query.data.distribution) {
    return <div role="alert" className="rounded-xl border p-5 text-sm text-muted-foreground">
      Tài khoản chưa thuộc Hệ Phân Phối hoặc chưa có quyền quản lý. Quyền được cấp theo bổ nhiệm trên sơ đồ tổ chức.
    </div>;
  }
  return <>{children}</>;
}
