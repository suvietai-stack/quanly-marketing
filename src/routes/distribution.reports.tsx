import { createFileRoute } from '@tanstack/react-router';
import { DistributionAccessGate } from '@/components/distribution/AreaAccessGate';
import { RequirePermission } from '@/components/PermissionGate';
import { BizDocuments } from '@/components/biz/BizDocuments';
import { PageHeader } from '@/components/AppShell';

export const Route = createFileRoute('/distribution/reports')({
  head: () => ({ meta: [{ title: 'Báo cáo Phân Phối — Base Sứ Việt' }] }),
  component: () => <DistributionAccessGate>
    <RequirePermission perm={['biz.report_submit','biz.report_approve','biz.view_dept','biz.view_all']}>
      <PageHeader title="Báo cáo Phân Phối" description="Báo cáo theo kỳ, giữ nguyên hồ sơ và lịch sử nộp."/>
      <BizDocuments kind="report"/>
    </RequirePermission>
  </DistributionAccessGate>,
});
