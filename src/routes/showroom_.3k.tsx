import { createFileRoute } from '@tanstack/react-router';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';

export const Route = createFileRoute('/showroom_/3k')({
  head: () => ({ meta: [{ title: '3K Showroom — Base Sứ Việt' }] }),
  component: () => <K3CommonWorkspace title="3K Showroom" initialUnit="showroom-block" />,
});
