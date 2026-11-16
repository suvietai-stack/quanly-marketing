import { createFileRoute } from '@tanstack/react-router';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';

export const Route = createFileRoute('/operations_/3k')({
  head: () => ({ meta: [{ title: '3K Vận hành — Base Sứ Việt' }] }),
  component: () => <K3CommonWorkspace title="3K Vận hành" initialUnit="b5e00000-0000-4000-8000-000000000002" />,
});
