import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Star, Gift as GiftIcon, Wallet, Settings, Plus, Upload, Pencil, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { useCurrentUser, useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { chipiAssets } from '@/assets/chipi/states';
import { saoOptions, redeem, decide, saveGift, grant, uploadGift, type Gift, type SaoData } from '@/lib/sao/api';
import { Programs } from './Programs';
import { EarnPrograms } from './EarnPrograms';
import { availableStars, giftAvailable, mayRedeem } from '@/lib/sao/logic';

const fmt = (n: number) => n.toLocaleString('vi-VN');
const when = (d: string) => new Date(d).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const statusLabel = { pending: 'Đang giữ Sao', fulfilled: 'Đã phát quà', cancelled: 'Đã hủy' };
export function SaoNav() {
  const { can } = useCurrentUser();
  return <nav className="flex flex-wrap gap-2 mb-6" aria-label="Sao Sứ Việt">
    <Button variant="outline" asChild><Link to="/sao"><Wallet className="h-4 w-4" />Ví Sao của tôi</Link></Button>
    <Button variant="outline" asChild><Link to="/sao/leaderboard"><Trophy className="h-4 w-4" />Bảng thành tích</Link></Button>
    <Button variant="outline" asChild><Link to="/sao/shop"><GiftIcon className="h-4 w-4" />Gian hàng đổi quà</Link></Button>
    <Button variant="outline" asChild><Link to="/sao/earn"><Sparkles className="h-4 w-4" />Cách kiếm Sao</Link></Button>
    {['sao.program_manage', 'sao.shop_manage', 'sao.manual_grant'].some(can) && <Button variant="outline" asChild><Link to="/sao/admin"><Settings className="h-4 w-4" />Quản lý thưởng Sao</Link></Button>}
  </nav>;
}
function Balance({ data }: { data: SaoData }) {
  return <section className="sao-wallet-band flex items-center justify-between gap-4 p-5 sm:p-8 mb-6 rounded-2xl">
    <div><p className="text-sm text-muted-foreground mb-2">Sao Sứ Việt của bạn</p><div className="flex items-center gap-3 text-4xl font-bold text-primary"><Star className="h-9 w-9 text-warning fill-warning" />{fmt(data.balance)}</div><div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-sm"><span>Khả dụng <strong>{fmt(availableStars(data.balance, data.held))}</strong></span><span className="text-muted-foreground">Đang giữ {fmt(data.held)}</span></div></div>
    <img src={chipiAssets.thankyou.url} className="w-24 h-28 sm:w-36 sm:h-40 object-contain shrink-0" alt="Chipi và Sao Sứ Việt" />
  </section>;
}
function Empty({ text }: { text: string }) { return <div className="py-10 text-center text-muted-foreground"><GiftIcon className="h-9 w-9 mx-auto mb-3 text-chipi-orange" /><p>{text}</p></div>; }
function History({ data, admin }: { data: SaoData; admin?: boolean }) {
  const users = useAuth((s) => s.users);
  return <div className="divide-y">{data.ledger.length === 0 ? <Empty text="Chưa có giao dịch Sao" /> : data.ledger.map((l) => <div key={l.id} className="py-4 flex gap-3 justify-between"><div className="min-w-0"><p className="font-medium text-sm break-words">{l.reason}</p><p className="text-xs text-muted-foreground mt-1">{when(l.created_at)}{admin && ` · ${users.find((u) => u.id === l.user_id)?.fullName ?? l.user_id}`}</p><p className="text-xs text-muted-foreground mt-1">Số dư sau giao dịch: {fmt(l.balance_after)}</p></div><span className={`font-semibold whitespace-nowrap ${l.amount > 0 ? 'text-success' : 'text-chipi-orange'}`}>{l.amount > 0 ? '+' : ''}{fmt(l.amount)} Sao</span></div>)}</div>;
}
function Requests({ data, admin, run, busy }: { data: SaoData; admin?: boolean; run: (fn: () => Promise<unknown>, message: string) => Promise<void>; busy: boolean }) {
  const users = useAuth((s) => s.users);
  return <div className="divide-y">{data.requests.length === 0 ? <Empty text="Chưa có yêu cầu đổi quà" /> : data.requests.map((r) => <div key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{r.gift_name} <span className="text-chipi-orange">· {fmt(r.price)} Sao</span></p><p className="text-sm text-muted-foreground">{statusLabel[r.status]} · {when(r.created_at)}</p>{admin && <p className="text-sm">{users.find((u) => u.id === r.user_id)?.fullName ?? r.user_id}</p>}{r.reason && <p className="text-sm text-muted-foreground">{r.reason}</p>}</div>{r.status === 'pending' && <div className="flex gap-2">{admin && <Button disabled={busy} onClick={() => { if (window.confirm(`Xác nhận đã phát “${r.gift_name}”? Trừ ${r.price} Sao đang giữ.`)) void run(() => decide(r.id, 'fulfilled'), 'Đã xác nhận phát quà'); }}>Đã phát quà</Button>}<Button variant="outline" disabled={busy} onClick={() => { if (window.confirm('Hủy yêu cầu và giải phóng Sao?')) void run(() => decide(r.id, 'cancelled'), 'Đã hủy và giải phóng Sao'); }}>Hủy yêu cầu</Button></div>}</div>)}</div>;
}
export function SaoPage({ mode }: { mode: 'wallet' | 'shop' | 'earn' | 'admin' }) {
  const { user, can } = useCurrentUser();
  const users = useAuth((s) => s.users);
  const queryClient = useQueryClient();
  const admin = mode === 'admin';
  const allowed = !admin || ['sao.program_manage', 'sao.shop_manage', 'sao.manual_grant'].some(can);
  const q = useQuery({ ...saoOptions(user?.id ?? '', admin), enabled: Boolean(user) && allowed });
  const [busy, setBusy] = useState(false);
  const [gift, setGift] = useState<(Gift & { image_ref?: string }) | null>(null);
  const [selected, setSelected] = useState<Gift | null>(null);
  const [requestId, setRequestId] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [stars, setStars] = useState('');
  const [reason, setReason] = useState('');
  const [manualId, setManualId] = useState('');
  async function run(fn: () => Promise<unknown>, message: string) { if (busy) return; setBusy(true); try { await fn(); toast.success(message); await queryClient.invalidateQueries({ queryKey: ['sao', user?.id] }); } catch (e) { toast.error(e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Không thực hiện được thao tác'); } finally { setBusy(false); } }
  if (!allowed) return <p>Bạn không có quyền quản lý Sao.</p>;
  const title = mode === 'wallet' ? 'Ví Sao của tôi' : mode === 'shop' ? 'Gian hàng đổi quà' : mode === 'earn' ? 'Cách kiếm Sao' : 'Quản lý thưởng Sao';
  return <div className="pb-44 max-w-6xl mx-auto"><header className="flex items-center justify-between gap-3 mb-5"><div><p className="text-sm text-chipi-orange font-medium mb-1">Sao Sứ Việt</p><h1 className="text-2xl font-bold">{title}</h1></div><Button size="icon" variant="ghost" aria-label="Tải lại Sao" onClick={() => q.refetch()}><RefreshCw className="h-4 w-4" /></Button></header><SaoNav />
    {q.isPending && <p className="text-muted-foreground">Đang tải Sao…</p>}{q.isError && <p role="alert" className="text-destructive">{q.error.message}</p>}
    {q.data && <>
      {!admin && <Balance data={q.data} />}
      {mode === 'wallet' && <><h2 className="text-lg font-semibold">Lịch sử Sao</h2><History data={q.data} /><h2 className="text-lg font-semibold mt-8">Quà của tôi</h2><Requests data={q.data} busy={busy} run={run} /></>}
      {mode === 'earn' && <EarnPrograms programs={q.data.rules} />}
      {(mode === 'shop' || admin && can('sao.shop_manage')) && <><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Quà tặng Sứ Việt</h2>{admin && <Button onClick={() => setGift({ id: crypto.randomUUID(), name: '', image_url: '', price: 1, stock: 0, reserved: 0, enabled: true })}><Plus className="h-4 w-4" />Thêm quà</Button>}</div>
        {q.data.gifts.length === 0 ? <Empty text="Gian hàng đang chuẩn bị những món quà đầu tiên" /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{q.data.gifts.map((g) => <article key={g.id} className="overflow-hidden rounded-xl border bg-card shadow-card"><img src={g.image_url} alt={g.name} className="w-full aspect-[4/3] object-contain bg-secondary p-3" /><div className="p-4"><h3 className="font-semibold text-lg break-words">{g.name}</h3><p className="flex items-center gap-2 mt-2 text-chipi-orange font-bold"><Star className="h-5 w-5 text-warning fill-warning" />{fmt(g.price)} Sao</p><p className="text-xs text-muted-foreground mt-2 mb-4">{!g.enabled ? 'Tạm ngừng' : `Còn ${giftAvailable(g.stock, g.reserved)} quà`}{admin && ` · Đang giữ ${g.reserved}`}</p>{admin ? <Button variant="outline" className="w-full min-h-11" onClick={() => setGift(g)}><Pencil className="h-4 w-4" />Sửa quà</Button> : <Button className="w-full min-h-11" disabled={!mayRedeem(q.data.balance, q.data.held, g.price, g.stock, g.reserved, g.enabled)} onClick={() => { setSelected(g); setRequestId(crypto.randomUUID()); }}><GiftIcon className="h-4 w-4" />{giftAvailable(g.stock, g.reserved) === 0 ? 'Hết quà' : availableStars(q.data.balance, q.data.held) < g.price ? 'Chưa đủ Sao' : 'Đổi quà'}</Button>}</div></article>)}</div>}
      </>}
      {mode === 'shop' && <section className="mt-8"><h2 className="text-lg font-semibold">Yêu cầu đổi quà của tôi</h2><Requests data={q.data} busy={busy} run={run} /></section>}
      {admin && can('sao.program_manage') && <Programs programs={q.data.rules} ledger={q.data.ledger} busy={busy} run={run} />}
      {admin && can('sao.manual_grant') && <section className="mt-8"><Button onClick={() => { setManualId(crypto.randomUUID()); setManualOpen(true); }}><Plus className="h-4 w-4" />Cộng Sao thủ công</Button></section>}
      {admin && can('sao.shop_manage') && <section className="mt-8"><h2 className="text-lg font-semibold">Yêu cầu đổi quà</h2><Requests data={q.data} admin busy={busy} run={run} /></section>}
      {admin && (can('sao.program_manage') || can('sao.manual_grant')) && <section className="mt-8"><h2 className="text-lg font-semibold">Lịch sử thưởng và sử dụng</h2><History data={q.data} admin /></section>}
      {admin && q.data.events.length > 0 && <section className="mt-8"><h2 className="text-lg font-semibold">Lịch sử quản lý</h2>{q.data.events.map((e) => <p key={e.id} className="text-sm py-2 border-b">{e.kind === 'rule' ? 'Cập nhật quy tắc thưởng' : 'Cập nhật quà'} · {when(e.created_at)}</p>)}</section>}
    </>}
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open && !busy) setSelected(null); }}><DialogContent className="w-[calc(100%-32px)] rounded-xl"><DialogTitle>Đổi {selected?.name}</DialogTitle><DialogDescription>Giữ {selected?.price} Sao cho yêu cầu này. Sao chỉ được trừ khi Admin xác nhận đã phát quà.</DialogDescription><Button disabled={busy} onClick={() => { if (!selected) return; void run(async () => { await redeem(selected.id, requestId); setSelected(null); }, 'Đã gửi yêu cầu đổi quà'); }}>Gửi yêu cầu đổi quà</Button></DialogContent></Dialog>
    <Dialog open={Boolean(gift)} onOpenChange={(open) => { if (!open && !busy) setGift(null); }}><DialogContent className="w-[calc(100%-32px)] rounded-xl max-h-[90dvh] overflow-y-auto"><DialogTitle>{gift?.name || 'Quà tặng mới'}</DialogTitle><DialogDescription>Thông tin quà tặng</DialogDescription>{gift && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void run(async () => { await saveGift({ ...gift, image_url: gift.image_ref ?? gift.image_url }); setGift(null); }, 'Đã lưu quà'); }}><Label htmlFor="gift-name">Tên quà</Label><Input id="gift-name" required maxLength={150} value={gift.name} onChange={(e) => setGift({ ...gift, name: e.target.value })} /><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="gift-price">Giá Sao</Label><Input id="gift-price" type="number" min={1} max={1000000} required value={gift.price} onChange={(e) => setGift({ ...gift, price: Number(e.target.value) })} /></div><div><Label htmlFor="gift-stock">Tổng số lượng còn lại</Label><Input id="gift-stock" type="number" min={gift.reserved} required value={gift.stock} onChange={(e) => setGift({ ...gift, stock: Number(e.target.value) })} /></div></div><Label htmlFor="gift-image" className="flex gap-2 items-center"><Upload className="h-4 w-4" />Ảnh quà</Label><Input id="gift-image" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; if (!file || !user) return; void run(async () => { const ref = await uploadGift(file, user.id); setGift({ ...gift, image_ref: ref }); }, 'Đã tải ảnh'); }} />{(gift.image_ref || gift.image_url) && <p className="text-sm text-success">Đã có ảnh quà</p>}<div className="flex items-center gap-3"><Switch id="gift-enabled" checked={gift.enabled} onCheckedChange={(enabled) => setGift({ ...gift, enabled })} /><Label htmlFor="gift-enabled">Mở đổi quà</Label></div><Button disabled={busy || !(gift.image_ref || gift.image_url)} type="submit" className="w-full">Lưu quà</Button></form>}</DialogContent></Dialog>
    <Dialog open={manualOpen} onOpenChange={(open) => { if (!busy) setManualOpen(open); }}><DialogContent className="w-[calc(100%-32px)] rounded-xl"><DialogTitle>Cộng Sao thủ công</DialogTitle><DialogDescription>Sao chỉ cộng sau khi xác nhận thành công.</DialogDescription><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void run(async () => { await grant(recipient, Number(stars), reason, manualId); setManualOpen(false); setRecipient(''); setStars(''); setReason(''); }, 'Đã cộng Sao'); }}><Label>Nhân viên</Label><Select value={recipient} onValueChange={setRecipient}><SelectTrigger><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger><SelectContent>{users.filter((u) => u.status === 'Đang hoạt động').map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}</SelectContent></Select><Label htmlFor="grant-stars">Số Sao</Label><Input id="grant-stars" type="number" min={1} max={100000} required value={stars} onChange={(e) => setStars(e.target.value)} /><Label htmlFor="grant-reason">Lý do</Label><Textarea id="grant-reason" required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} /><Button className="w-full" type="submit" disabled={busy || !recipient}>Xác nhận cộng Sao</Button></form></DialogContent></Dialog>
  </div>;
}