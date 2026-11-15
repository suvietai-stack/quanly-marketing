import { createFileRoute } from '@tanstack/react-router';
import { WebChatWorkspace } from '@/components/webChat/WebChatWorkspace';
export const Route = createFileRoute('/web-chat')({
  head: () => ({ meta: [{ title: 'Chat Web — Base Sứ Việt' }] }),
  component: WebChatWorkspace,
});

