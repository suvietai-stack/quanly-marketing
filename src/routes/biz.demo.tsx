import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/components/PermissionGate';
import { BizDemo } from '@/components/biz/BizDemo';
export const Route = createFileRoute('/biz/demo')({
 head: () => ({ meta: [{ title: 'DEMO Quản trị Kinh doanh — Base Sứ Việt' }, { name: 'description', content: 'Trải nghiệm dữ liệu mô phỏng Kinh doanh riêng biệt, không ảnh hưởng hồ sơ vận hành Base Sứ Việt.' }, { property: 'og:title', content: 'DEMO Quản trị Kinh doanh — Base Sứ Việt' }, { property: 'og:description', content: 'Dashboard, kế hoạch, mục tiêu và báo cáo mô phỏng an toàn.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
 component: () => <RequirePermission perm="biz.demo_manage"><BizDemo /></RequirePermission>,
});