import { type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/lib/auth';
import { commercialAreaAccessQuery, type CommercialAreaAccess } from '@/lib/distribution/api';
import { Button } from '@/components/ui/button';

type Area = 'orders' | 'distribution';
type GateChildren = ReactNode | ((scope: CommercialAreaAccess) => ReactNode);
const names: Record<Area,string> = {orders:'Kinh doanh Đơn Hàng',distribution:'Phân Phối'};

/** Actor-matched server membership. The existing specialized RPCs still guard data. */
export function CommercialAreaGate({ area, children }: { area: Area; children: GateChildren }) {
  const { user } = useCurrentUser();
  const query = useQuery(commercialAreaAccessQuery(user?.id ?? ''));
  if (!user || user.status !== 'Đang hoạt động') {
    return <p className="p-4 text-sm text-muted-foreground">Cần đăng nhập tài khoản đang hoạt động.</p>;
  }
  if (query.isPending) {
    return <p role="status" className="rounded-xl border p-5 text-sm text-muted-foreground">Đang kiểm tra quyền {names[area]}…</p>;
  }
  if (query.isError) {
    return <div role="alert" className="space-y-3 rounded-xl border p-5 text-sm">
      <p>Chưa tải được quyền {names[area]}: {query.error.message}</p>
      <Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button>
    </div>;
  }
  if (!query.data[area]) {
    return <div role="alert" className="rounded-xl border p-5 text-sm text-muted-foreground">
      Tài khoản không có quyền vào {names[area]}. Phạm vi được cấp theo bổ nhiệm trên sơ đồ tổ chức.
    </div>;
  }
  return <>{typeof children === 'function' ? children(query.data) : children}</>;
}

export function DistributionAccessGate({children}:{children:GateChildren}){
  return <CommercialAreaGate area="distribution">{children}</CommercialAreaGate>;
}
