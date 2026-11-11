export type CleanupAccount = {
  user_id: string;
  name: string;
  group: 'A' | 'B' | 'C' | 'D';
  status: 'protected' | 'ready' | 'review';
  unit: string | null;
  title: string | null;
  roles: { role_id: string; name: string; protected: boolean }[];
  removable: string[];
  lost: string[];
  reasons: string[];
  pending_work: number;
  appointment_sources: number;
  specialty_sources: number;
  has_custom_override: boolean;
};

export type CleanupPreview = {
  fingerprint: string;
  server_now: string;
  accounts: CleanupAccount[];
  totals: { accounts: number; ready: number; review: number; protected: number; removable_roles: number };
};

export type CleanupRun = {
  final_transition?: boolean;
  id: string;
  actor: string;
  fingerprint: string;
  removed: { user_id: string; role_id: string; role_name: string }[];
  restored: boolean;
  created_at: string;
  restored_at: string | null;
};

export const CLEANUP_STATUS_LABELS: Record<CleanupAccount['status'], string> = {
  ready: 'Sẵn sàng',
  review: 'Cần xử lý',
  protected: 'Được bảo vệ',
};

export const CLEANUP_GROUP_LABELS: Record<CleanupAccount['group'], string> = {
  A: 'Quản trị',
  B: 'Kinh doanh',
  C: 'Ngoài Kinh doanh',
  D: 'Kiêm nhiệm',
};

/** Chỉ tài khoản "Sẵn sàng" mới được chọn chuyển đổi; backend cũng từ chối mọi trạng thái khác. */
export function selectableAccounts(accounts: CleanupAccount[]) {
  return accounts.filter(a => a.status === 'ready');
}

export function cleanupStatusTone(status: CleanupAccount['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'ready') return 'default';
  if (status === 'review') return 'destructive';
  return 'secondary';
}
