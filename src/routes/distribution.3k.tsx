import { createFileRoute } from '@tanstack/react-router';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';
import { DISTRIBUTION_UNIT } from '@/lib/k3Hub/area';

export const Route = createFileRoute('/distribution/3k')({
  head: () => ({ meta: [
    { title: '3K Phân Phối — Base Sứ Việt' },
    { name: 'description', content: 'KG, KF, KPI và theo dõi nhân sự trong phạm vi Phân Phối trên Base Sứ Việt.' },
    { property: 'og:title', content: '3K Phân Phối — Base Sứ Việt' },
    { property: 'og:description', content: '3K theo phân công và phạm vi tổ chức Phân Phối.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <K3CommonWorkspace title="3K Phân Phối" initialUnit={DISTRIBUTION_UNIT} restrictToArea />,
});