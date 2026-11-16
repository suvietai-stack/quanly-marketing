import { PageHeader } from '@/components/AppShell';
import { DistributionAreaGuard } from './DistributionAreaGuard';
import { BizGoals } from '@/components/biz/BizGoals';
import { BizDocuments } from '@/components/biz/BizDocuments';
import type { DocKind } from '@/lib/biz/documents';

export function DistributionGoals() {
  return <DistributionAreaGuard>{access => <div className="space-y-4">
    <PageHeader title="Mục tiêu KR Phân Phối" description="Dùng lại mục tiêu và lịch sử duyệt theo phòng Phân Phối" />
    <BizGoals scopeDepartmentIds={access.distribution_units}/>
  </div>}</DistributionAreaGuard>;
}

export function DistributionDocuments({kind}:{kind:DocKind}) {
  return <DistributionAreaGuard>{access => <div className="space-y-4">
    <PageHeader title={kind==='plan'?'Kế hoạch Phân Phối':'Báo cáo Phân Phối'}
      description="Dùng hồ sơ gốc, chỉ hiển thị dữ liệu thuộc phòng Phân Phối trong khu vực này" />
    <BizDocuments kind={kind} scopeDepartmentIds={access.distribution_units}/>
  </div>}</DistributionAreaGuard>;
}
