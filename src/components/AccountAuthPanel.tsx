import { useQuery } from '@tanstack/react-query';
import { accountAuthStatus, resendConfirmation } from '@/lib/accounts.functions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isFakeEmail } from '@/lib/password';

export function AccountAuthPanel({ userId, email }: { userId: string; email?: string }) {
  const query = useQuery({ queryKey: ['account-auth-status', userId], queryFn: () => accountAuthStatus({ data: { userId } }), staleTime: 0, retry: false });
  const [sending, setSending] = useState(false);
  const state = query.data;
  const needsCheck = state && (!state.authExists || !state.profileExists || !state.emailMatches);
  return <div className="space-y-3 border-b border-border pb-4">
    <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium">Trạng thái xác thực</span>
      <Badge variant={needsCheck || query.isError ? 'destructive' : 'secondary'}>{query.isPending ? 'Đang kiểm tra…' : query.isError || needsCheck ? 'Hồ sơ/Auth cần kiểm tra' : state?.banned ? 'Xác thực đang bị hạn chế' : state?.emailConfirmed ? 'Email đã xác nhận' : 'Email chưa xác nhận'}</Badge>
      <Button size="icon" variant="ghost" title="Kiểm tra lại trạng thái xác thực" aria-label="Kiểm tra lại trạng thái xác thực" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw className="size-4" /></Button>
    </div>
    {state && !state.emailConfirmed && <p className="text-sm text-muted-foreground">Duyệt hoặc đặt lại mật khẩu không thay thế xác nhận email. Nhân viên cần mở liên kết xác nhận trước khi đăng nhập.</p>}
    {state?.banned && <p className="text-sm text-destructive">Tài khoản xác thực đang bị hạn chế; mở khóa hồ sơ không tự bỏ hạn chế này.</p>}
    {email && !isFakeEmail(email) && state?.authExists && !state.emailConfirmed && <Button size="sm" variant="outline" disabled={sending} onClick={async () => {
      setSending(true);
      try { await resendConfirmation({ data: { email, redirect: `${window.location.origin}/login` } }); toast.success('Đã yêu cầu gửi liên kết xác nhận. Vui lòng kiểm tra hộp thư.'); }
      catch (e) { toast.error(e instanceof Error ? e.message : 'Không gửi được email.'); }
      finally { setSending(false); }
    }}><Mail className="size-4" />{sending ? 'Đang gửi…' : 'Gửi lại email xác nhận'}</Button>}
  </div>;
}