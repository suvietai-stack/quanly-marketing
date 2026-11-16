import { createFileRoute } from '@tanstack/react-router';
import { Showroom3K } from '@/components/showroom/Showroom3K';

export const Route = createFileRoute('/showroom/3k')({
  head: () => ({ meta: [
    { title: '3K Showroom — Base Sứ Việt' },
    { name: 'description', content: 'Mục tiêu KG, việc KF, kết quả KPI và theo dõi nhân sự Khối Showroom.' },
  ] }),
  component: Showroom3K,
});
