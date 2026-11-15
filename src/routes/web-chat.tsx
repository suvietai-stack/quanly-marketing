import { createFileRoute } from '@tanstack/react-router';
import { WebChatComingSoon } from '@/components/inbox/WebChatComingSoon';
export const Route = createFileRoute('/web-chat')({
  head: () => ({ meta: [{ title: 'Chat Web — Base Sứ Việt' }] }),
  component: WebChatComingSoon,
});
