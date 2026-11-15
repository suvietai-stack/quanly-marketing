import { createFileRoute } from '@tanstack/react-router';
import { InboxWorkspace } from '@/components/inbox/InboxWorkspace';
export const Route = createFileRoute('/inbox')({
  head: () => ({ meta: [{ title: 'Hộp thư — Base Sứ Việt' }] }),
  component: InboxWorkspace,
});
