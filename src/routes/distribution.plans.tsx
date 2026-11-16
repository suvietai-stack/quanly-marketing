import { createFileRoute } from '@tanstack/react-router';
import { DistributionAccessGate } from '@/components/distribution/AreaAccessGate';
import { RequirePermission } from '@/components/PermissionGate';
import { BizDocuments } from '@/components/biz/BizDocuments';
import { PageHeader } from '@/components/AppShell';

export const Route = createFileRoute('/distribution/plans')({
  head: () => ({ meta: [{ title: 'Kế hoạch Phân Phối — Base Sứ Việt' }] }),
  component: () => <DistributionAccessGate>
    <RequirePermission perm={['biz.plan_submit','biz.plan_request_revision','biz.plan_approve','biz.view_dept','biz.view_all']}>
      <PageHeader title="Kế hoạch Phân Phối" description="Kế hoạch và các phiên bản trước đây vẫn nằm trong hồ sơ gốc."/>
      <BizDocuments kind="plan"/>
    </RequirePermission>
  </DistributionAccessGate>,
});
