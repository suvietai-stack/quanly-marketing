import { useState } from 'react';
import { resendConfirmation } from '@/lib/accounts.functions';
import { isFakeEmail } from '@/lib/password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ConfirmationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  return <Dialog open={open} onOpenChange={value => { if (!value) { setSent(false); setError(''); onClose(); } }}>
    <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Xác nhận email tài khoản</DialogTitle></DialogHeader>
      {sent ? <p role="status" className="text-sm text-muted-foreground">Nếu email này có tài khoản cần xác nhận, liên kết đã được gửi. Vui lòng kiểm tra hộp thư và mục Spam. Xác nhận email không thay thế bước Admin duyệt.</p> :
        <form className="space-y-4" onSubmit={async event => {
          event.preventDefault(); if (busy) return;
          if (isFakeEmail(email)) { setError('Vui lòng nhập email thật đã đăng ký.'); return; }
          setBusy(true); setError('');
          try { await resendConfirmation({ data: { email, redirect: `${window.location.origin}/login` } }); setSent(true); }
          catch (e) { setError(e instanceof Error ? e.message : 'Không gửi được email. Vui lòng thử lại.'); }
          finally { setBusy(false); }
        }}>
          <div className="space-y-2"><Label htmlFor="confirmation-email">Email đã đăng ký</Label><Input id="confirmation-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi lại liên kết xác nhận'}</Button>
        </form>}
    </DialogContent>
  </Dialog>;
}