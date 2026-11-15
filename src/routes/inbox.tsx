import { createFileRoute } from '@tanstack/react-router';
import { InboxWorkspace } from '@/components/inbox/InboxWorkspace';
export const Route = createFileRoute('/inbox')({
  head: () => ({ meta: [{ title: 'Facebook Messenger — Base Sứ Việt' }] }),
  component: InboxWorkspace,
});
