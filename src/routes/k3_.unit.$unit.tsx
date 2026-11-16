import { createFileRoute } from '@tanstack/react-router';
import { K3CommonWorkspace } from '@/components/k3Hub/K3CommonWorkspace';

export const Route = createFileRoute('/k3_/unit/$unit')({
  head: () => ({ meta: [{ title: '3K theo đơn vị — Base Sứ Việt' }] }),
  component: UnitK3Page,
});

function UnitK3Page() {
  const { unit } = Route.useParams();
  return <K3CommonWorkspace key={unit} title="3K theo đơn vị" initialUnit={unit} />;
}
