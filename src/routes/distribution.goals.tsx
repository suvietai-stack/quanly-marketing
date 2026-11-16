import { createFileRoute } from '@tanstack/react-router';
import { DistributionAccessGate } from '@/components/distribution/AreaAccessGate';
import { RequirePermission } from '@/components/PermissionGate';
import { BizGoals } from '@/components/biz/BizGoals';
import { PageHeader } from '@/components/AppShell';

export const Route = createFileRoute('/distribution/goals')({
  head: () => ({ meta: [{ title: 'Mục tiêu KR Phân Phối — Base Sứ Việt' }] }),
  component: () => <DistributionAccessGate>
    <RequirePermission perm={['biz.view_own','biz.goal_submit','biz.goal_approve','biz.view_dept','biz.view_all']}>
      <PageHeader title="Mục tiêu KR Phân Phối" description="Dùng dữ liệu và lịch sử KR đang có — theo phạm vi bổ nhiệm."/>
      <BizGoals/>
    </RequirePermission>
  </DistributionAccessGate>,
});
