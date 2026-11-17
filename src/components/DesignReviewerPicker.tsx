import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useCurrentUser } from '@/lib/auth';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reviewerAccountId } from '@/lib/orders/reviewer';

interface Props {
  valueId?: string;
  valueName?: string;
  onChange: (name: string, id: string) => void;
  assigneeId?: string;
  disabled?: boolean;
  required?: boolean;
}

/** Always chooses an actual, active account ID, never editable free text. */
export function DesignReviewerPicker({ valueId, valueName, onChange, assigneeId, disabled, required = false }: Props) {
  const people = useStore(s => s.people);
  const { user } = useCurrentUser();
  const accounts = useMemo(() => {
    const items = people
      .filter(p => p.accountStatus === 'Đang hoạt động')
      .map(p => ({ id: p.id, name: p.name, username: '' }));
    // Authentication and the staff directory may resolve in different frames.
    // The creator must always be available as the default reviewer.
    if (user?.id && !items.some(p => p.id === user.id)) {
      items.push({ id: user.id, name: user.fullName || user.username || 'Tài khoản của tôi', username: user.username || '' });
    }
    return items.sort((a, b) => a.name.localeCompare(b.name, 'vi') || a.id.localeCompare(b.id));
  }, [people, user?.id, user?.fullName, user?.username]);
  const selectedId = reviewerAccountId(accounts, valueId, valueName);
  const unresolved = !!(valueId || valueName) && !accounts.some(p => p.id === selectedId);
  const value = unresolved ? '__legacy__' : (selectedId || '__empty__');

  return <div className="min-w-0 space-y-1.5">
    <Label>Người duyệt {required && '*'}</Label>
    <Select value={value} disabled={disabled} onValueChange={id => {
      const account = accounts.find(p => p.id === id);
      if (account && account.id !== assigneeId) onChange(account.name, account.id);
    }}>
      <SelectTrigger className="min-h-11 w-full min-w-0 text-left" aria-label="Chọn người duyệt từ danh sách tài khoản">
        <SelectValue placeholder="Chọn tài khoản người duyệt"/>
      </SelectTrigger>
      <SelectContent className="max-h-80">
        <SelectItem value="__empty__" disabled>— Chọn tài khoản người duyệt —</SelectItem>
        {unresolved && <SelectItem value="__legacy__" disabled>
          Người duyệt cũ: {valueName || 'Tài khoản không còn hoạt động'} — cần chọn lại
        </SelectItem>}
        {accounts.map(p => <SelectItem key={p.id} value={p.id} disabled={p.id === assigneeId}>
          <span className="block truncate">{p.name}{p.username && p.username !== p.name ? ` · ${p.username}` : ''}{p.id === assigneeId ? ' (đang thực hiện)' : ''}</span>
        </SelectItem>)}
      </SelectContent>
    </Select>
    {unresolved && <p role="status" className="text-xs text-amber-700 dark:text-amber-300">
      Người duyệt của Job cũ chưa khớp duy nhất với tài khoản đang hoạt động. Chọn lại từ danh sách để cập nhật.
    </p>}
    {selectedId && selectedId === assigneeId && <p role="alert" className="text-xs text-destructive">
      Người duyệt phải khác người thực hiện.
    </p>}
    {!accounts.length && <p role="status" className="text-xs text-muted-foreground">Đang tải tài khoản nhân viên…</p>}
  </div>;
}
