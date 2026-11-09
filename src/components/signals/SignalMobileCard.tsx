import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Check, Copy, MessageCircle, Phone, UserRound, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Signal } from '@/lib/signals/catalog';
import type { DeadlineRow } from '@/lib/signals/deadlines';
import { mobileNeed, signalContact } from '@/lib/signals/mobileList';
import { potentialOf, type SignalLabel } from '@/lib/signals/potential';
import { signalSurfaceClick, signalNameClick, signalNameKeyDown } from '@/lib/signals/detailInteraction';
import { PotentialPill } from './SignalEnrichment';
import { cn } from '@/lib/utils';

export function SignalMobileCard({ s, status, owner, deadline, labels, onOpen }: {
  s: Signal; status: ReactNode; owner: string; deadline?: DeadlineRow; labels: SignalLabel[]; onOpen: () => void;
}) {
  const contact = signalContact(s.phone ?? '');
  const need = mobileNeed(s);
  const selected = labels.filter(l => s.label_ids?.includes(l.id));
  const [zalo, setZalo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const copy = async () => {
    if (!contact) return;
    try { await navigator.clipboard.writeText(contact.phone); setCopied(true); setError(''); }
    catch { setError('Chưa sao chép được. Bạn có thể chọn và sao chép số bên trên.'); }
  };
  return <article aria-label={`Tín hiệu: ${s.customer_name}`} onClick={signalSurfaceClick(onOpen)} className="signal-card min-w-0 rounded-lg border bg-card p-3 space-y-2">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
      <Button asChild variant="link" className="signal-mobile-name h-auto min-h-0 min-w-0 justify-start whitespace-normal p-0 text-left text-sm font-semibold leading-5">
        <span role="button" tabIndex={0} aria-label={`Mở chi tiết tín hiệu: ${s.customer_name}`} onClick={signalNameClick(onOpen)} onKeyDown={signalNameKeyDown(onOpen)} className="line-clamp-2 break-words">{s.customer_name}</span>
      </Button>
      <div className="signal-mobile-status shrink-0">{status}</div>
    </div>
    {contact ? <a data-signal-interactive href={contact.tel} className="inline-flex min-h-8 items-center gap-2 text-base font-semibold tabular-nums text-primary"><Phone className="h-3.5 w-3.5 shrink-0"/>{s.phone}</a> : <p className="text-sm text-muted-foreground">{s.phone || 'Chưa có số điện thoại'}{s.phone && <span className="block text-xs">Số điện thoại không hợp lệ</span>}</p>}
    <p className="line-clamp-2 text-sm leading-5"><span className="text-muted-foreground">Nhu cầu: </span>{need || <span className="text-muted-foreground">Chưa có thông tin</span>}</p>
    {(potentialOf(s) !== 'unrated' || selected.length > 0) && <div className="flex min-w-0 items-center gap-1.5">
      {potentialOf(s) !== 'unrated' && <PotentialPill s={s}/>}
      {selected[0] && <span className="min-w-0 truncate text-xs text-muted-foreground" title={selected[0].name}>{selected[0].name}</span>}
      {selected.length > 1 && <span className="shrink-0 text-xs text-muted-foreground">+{selected.length - 1}</span>}
    </div>}
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex min-w-0 items-center gap-1"><UserRound className="h-3 w-3 shrink-0"/>{owner}</span>
    </div>
    <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-1.5 border-t pt-2" data-signal-interactive>
      {contact ? <Button asChild variant="outline" className="h-11 px-2 gap-1"><a href={contact.tel}><Phone className="h-3.5 w-3.5"/>Gọi</a></Button> : <Button variant="outline" disabled title="Không có số điện thoại hợp lệ" className="h-11 px-2 gap-1"><Phone className="h-3.5 w-3.5"/>Gọi</Button>}
      <Button variant="outline" className="h-11 px-2 gap-1" disabled={!contact} title={!contact ? 'Không có số điện thoại hợp lệ' : 'Liên hệ trên Zalo'} onClick={() => { setCopied(false); setError(''); setZalo(true); }}><MessageCircle className="h-3.5 w-3.5"/>Zalo</Button>
      <Button className="h-11 min-w-0 px-2 gap-1" onClick={onOpen}><span className="signal-mobile-action-long">Xem / Cập nhật</span><span className="signal-mobile-action-short">Chi tiết</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0"/></Button>
    </div>
    <Dialog open={zalo} onOpenChange={setZalo}><DialogContent className="max-w-sm" onClick={e => e.stopPropagation()}><DialogHeader><DialogTitle>Liên hệ Zalo</DialogTitle><DialogDescription>Sao chép số rồi tìm trong Zalo. Khách có thể chưa dùng Zalo hoặc không cho phép tìm bằng số điện thoại.</DialogDescription></DialogHeader><p className="select-text text-xl font-semibold tabular-nums">{contact?.phone}</p><Button onClick={() => void copy()}>{copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}{copied ? 'Đã sao chép số' : 'Sao chép số điện thoại'}</Button>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</DialogContent></Dialog>
  </article>;
}