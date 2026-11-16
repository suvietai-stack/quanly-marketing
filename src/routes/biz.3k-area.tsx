import { createFileRoute } from '@tanstack/react-router';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';

export const Route = createFileRoute('/biz/3k-area')({
  head: () => ({ meta: [{ title: '3K Kinh doanh — Base Sứ Việt' }] }),
  component: () => <K3CommonWorkspace title="3K Kinh doanh" initialUnit="biz-block" />,
});
