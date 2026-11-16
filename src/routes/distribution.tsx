import { createFileRoute } from '@tanstack/react-router';
import { DistributionAccessGate } from '@/components/distribution/AreaAccessGate';
import { DistributionOverview } from '@/components/distribution/DistributionOverview';

export const Route = createFileRoute('/distribution')({
  head: () => ({ meta: [{ title: 'Phân Phối — Base Sứ Việt' },
    { name: 'description', content: 'Tổng quan Phân Phối độc lập, sử dụng cùng hồ sơ gốc và lịch sử trong Base.' }] }),
  component: () => <DistributionAccessGate><DistributionOverview /></DistributionAccessGate>,
});
