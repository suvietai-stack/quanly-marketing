import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/AppShell';
import { BizApprovals } from '@/components/biz/BizApprovals';
export const Route = createFileRoute('/biz/approvals')({
 head: () => ({ meta: [
  { title: 'Phê duyệt Kinh doanh — Base Sứ Việt' },
  { name: 'description', content: 'Hồ sơ KR và Báo cáo Kinh doanh đến lượt xử lý, các cấp phê duyệt và lịch sử theo phạm vi được giao.' },
  { property: 'og:title', content: 'Phê duyệt Kinh doanh — Base Sứ Việt' },
  { property: 'og:description', content: 'Trung tâm xử lý hồ sơ KR và Báo cáo Kinh doanh của Base Sứ Việt.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
 ] }),
 component: () => <div><PageHeader title="Phê duyệt" description="Quản trị Kinh doanh" /><BizApprovals /></div>,
});