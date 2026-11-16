import { createFileRoute } from '@tanstack/react-router';
import { DistributionOverview } from '@/components/distribution/DistributionOverview';
export const Route = createFileRoute('/distribution/')({
  head: () => ({meta:[{title:'Hệ Phân Phối — Base Sứ Việt'}]}),
  component: DistributionOverview,
});
