import { DistributionAreaGuard } from './DistributionAreaGuard';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';
import { DISTRIBUTION_SYSTEM_ID } from '@/lib/distribution/access';

export function Distribution3K() {
  return <DistributionAreaGuard>{() =>
    <K3CommonWorkspace title="3K Phân Phối" initialUnit={DISTRIBUTION_SYSTEM_ID}
      fixedUnit={DISTRIBUTION_SYSTEM_ID}/>
  }</DistributionAreaGuard>;
}
