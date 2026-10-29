import { createFileRoute } from '@tanstack/react-router';
import { Trophy } from 'lucide-react';
import { SaoNav } from '@/components/sao/SaoPages';
import { Leaderboard } from '@/components/sao/Leaderboard';

export const Route = createFileRoute('/sao/leaderboard')({
  head: () => ({
    meta: [
      { title: 'Bảng thành tích — Sao Sứ Việt' },
      { name: 'description', content: 'Bảng xếp hạng thành tích Sao Sứ Việt của nhân viên theo tuần, tháng, quý, năm.' },
      { property: 'og:title', content: 'Bảng thành tích — Sao Sứ Việt' },
      { property: 'og:description', content: 'Bảng xếp hạng thành tích Sao Sứ Việt của nhân viên theo tuần, tháng, quý, năm.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <div className="pb-44 max-w-6xl mx-auto">
      <header className="mb-5">
        <p className="text-sm text-chipi-orange font-medium mb-1">Sao Sứ Việt</p>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-warning" />Bảng thành tích
        </h1>
      </header>
      <SaoNav />
      <Leaderboard />
    </div>
  );
}
