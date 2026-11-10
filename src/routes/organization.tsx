import { createFileRoute } from '@tanstack/react-router';
import { BaseOrganization } from '@/components/BaseOrganization';

export const Route = createFileRoute('/organization')({
  head: () => ({ meta: [
    { title: 'Cơ cấu tổ chức & Phân quyền — Base Sứ Việt' },
    { name: 'description', content: 'Quản lý cơ cấu, quyền mặc định và quyền bổ sung của nhân sự Sứ Việt.' },
    { property: 'og:title', content: 'Cơ cấu tổ chức & Phân quyền — Base Sứ Việt' },
    { property: 'og:description', content: 'Quyền nhân sự theo nguồn cấp, phạm vi và hiệu lực.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: OrganizationRoute,
});

function OrganizationRoute() { return <BaseOrganization />; }
