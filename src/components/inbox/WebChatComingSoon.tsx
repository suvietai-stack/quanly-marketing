import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function WebChatComingSoon() {
  return <div className="min-w-0 space-y-5">
    <header><h1 className="text-xl font-semibold sm:text-2xl">Chat Web</h1><p className="mt-2 text-sm text-muted-foreground">Khu vực trò chuyện với khách hàng trên website.</p></header>
    <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border bg-card px-5 text-center">
      <div className="rounded-3xl bg-primary/10 p-6 text-primary"><Globe className="size-12" /></div>
      <Badge className="mt-6" variant="secondary">Sắp ra mắt</Badge>
      <h2 className="mt-4 text-xl font-semibold">Trò chuyện với khách ngay từ website</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Tiếp nhận và chăm sóc khách ghé website tại một khu vực riêng. Chức năng đang được chuẩn bị.</p>
    </section>
  </div>;
}
