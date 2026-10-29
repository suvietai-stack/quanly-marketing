import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Gift, Star, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { chipiAssets } from '@/assets/chipi/states';
import { claimCelebration, type Celebration } from '@/lib/sao/api';
import { mayCelebrate } from '@/lib/sao/logic';

export function RewardPopup({ userId }: { userId: string }) {
  const [reward, setReward] = useState<Celebration | null>(null);
  const busy = useRef(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    let live = true;
    const check = async () => {
      const editing = Boolean(document.activeElement?.matches('input,textarea,[contenteditable="true"]'));
      const modal = Boolean(document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"]'));
      if (busy.current || !mayCelebrate(document.visibilityState === 'visible', editing, modal)) return;
      busy.current = true;
      try {
        const result = await claimCelebration();
        if (live && result.stars > 0) { setReward(result); void queryClient.invalidateQueries({ queryKey: ['sao', userId] }); }
      } catch { /* Leave unread rewards for the next successful request. */ }
      finally { busy.current = false; }
    };
    const timer = window.setInterval(check, 15000);
    const initial = window.setTimeout(check, 1800);
    document.addEventListener('visibilitychange', check);
    return () => { live = false; clearInterval(timer); clearTimeout(initial); document.removeEventListener('visibilitychange', check); };
  }, [userId, queryClient]);
  return <Dialog open={Boolean(reward)} onOpenChange={(open) => { if (!open) setReward(null); }}>
    <DialogContent className="sao-reward-popup w-[calc(100%-32px)] max-w-md rounded-2xl bg-card text-center max-h-[calc(100dvh-32px)] overflow-y-auto gap-3 p-6">
      <div className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60">
        <img src={chipiAssets.celebrate.url} alt="Chipi chúc mừng" className="sao-celebrate h-full w-full object-contain" />
        <Star className="sao-spark sao-spark-one absolute left-0 top-9 h-7 w-7 text-warning fill-warning" aria-hidden />
        <Star className="sao-spark sao-spark-two absolute right-0 top-20 h-5 w-5 text-warning fill-warning" aria-hidden />
        <Sparkles className="sao-spark absolute right-5 top-3 h-7 w-7 text-chipi-orange" aria-hidden />
      </div>
      <DialogTitle className="text-2xl">Chúc mừng bạn!</DialogTitle>
      <div className="flex justify-center items-center gap-2 text-4xl font-bold text-chipi-orange">+{reward?.stars.toLocaleString('vi-VN')} <Star className="h-8 w-8 text-warning fill-warning" /></div>
      <DialogDescription className="text-center">{reward?.rewards.length === 1 ? reward.rewards[0]?.reason : `Bạn vừa nhận thưởng từ ${reward?.rewards.length ?? 0} thành tích!`}</DialogDescription>
      <p className="text-sm">Chipi tặng bạn {reward?.stars.toLocaleString('vi-VN')} Sao Sứ Việt nhé!</p>
      <p className="text-sm text-muted-foreground">Sao hiện có: <strong className="text-primary">{reward?.balance.toLocaleString('vi-VN')}</strong></p>
      <Button className="min-h-11 mt-2" onClick={() => { setReward(null); void navigate({ to: '/sao/shop' }); }}><Gift className="h-4 w-4" />Khám phá gian hàng</Button>
      <Button variant="ghost" className="min-h-11" onClick={() => setReward(null)}>Để sau</Button>
    </DialogContent>
  </Dialog>;
}