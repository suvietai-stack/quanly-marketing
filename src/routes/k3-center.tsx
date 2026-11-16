import { createFileRoute } from '@tanstack/react-router';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';

export const Route = createFileRoute('/k3-center')({
  head: () => ({ meta: [{ title: 'Trung tâm 3K — Điều hành Sứ Việt' }] }),
  component: () => <K3CommonWorkspace title="Trung tâm 3K" initialUnit="org-company" central />,
});
