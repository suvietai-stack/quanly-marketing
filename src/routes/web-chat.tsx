import { createFileRoute } from '@tanstack/react-router';
import { WebChatWorkspace } from '@/components/webChat/WebChatWorkspace';
export const Route = createFileRoute('/web-chat')({
  head: () => ({ meta: [{ title: 'Tư vấn Website — Base Sứ Việt' }] }),
  component: WebChatWorkspace,
});

