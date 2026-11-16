import { createFileRoute } from '@tanstack/react-router';
import { DistributionAccessGate } from '@/components/distribution/AreaAccessGate';
import { RequirePermission } from '@/components/PermissionGate';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';

export const Route = createFileRoute('/distribution/3k')({
  head: () => ({ meta: [{ title: '3K Phân Phối — Base Sứ Việt' }] }),
  component: () => <DistributionAccessGate>
    <RequirePermission perm={['k3.use','k3hub.biz','k3hub.center']}>
      <K3CommonWorkspace title="3K Phân Phối" initialUnit="distribution-block" areaBlock="distribution-block"/>
    </RequirePermission>
  </DistributionAccessGate>,
});
