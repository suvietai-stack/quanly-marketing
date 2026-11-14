import { createFileRoute } from '@tanstack/react-router';
import { CommunityFeed } from '@/components/community/CommunityFeed';

export const Route = createFileRoute('/community')({
  head: () => ({ meta: [
    { title: 'Cộng đồng nội bộ — Base Sứ Việt' },
    { name: 'description', content: 'Bảng tin riêng dành cho nhân viên Sứ Việt đang sử dụng Base.' },
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
  ] }),
  component: () => <CommunityFeed />,
});
