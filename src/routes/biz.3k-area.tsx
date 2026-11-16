import { createFileRoute } from '@tanstack/react-router';
import { CommercialAreaGate } from '@/components/distribution/AreaAccessGate';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';

export const Route = createFileRoute('/biz/3k-area')({
  head: () => ({ meta: [{ title: '3K Kinh doanh — Base Sứ Việt' }] }),
  component: () => <CommercialAreaGate area="orders"><K3CommonWorkspace title="3K Kinh doanh Đơn Hàng" initialUnit="biz-block" areaBlock="biz-block" /></CommercialAreaGate>,
});
