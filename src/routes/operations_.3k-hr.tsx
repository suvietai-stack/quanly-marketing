import { createFileRoute } from '@tanstack/react-router';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';
export const Route = createFileRoute('/operations_/3k-hr')({
  head: () => ({ meta: [{ title: '3K Hành chính & Nhân sự — Base Sứ Việt' }] }),
  component: () => <K3CommonWorkspace title="3K Hành chính & Nhân sự" initialUnit="b5e00000-0000-4000-8000-000000000021" />,
});
