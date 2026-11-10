export type CleanupAccount = {
  user_id: string;
  name: string;
  group: 'A' | 'B' | 'C' | 'D';
  status: 'protected_super' | 'protected' | 'needs_confirm' | 'ready' | 'review';
  unit: string | null;
  title: string | null;
  roles: { role_id: string; name: string; protected: boolean }[];
  removable: string[];
  lost: string[];
  appointment_sources: number;
  specialty_sources: number;
  has_custom_override: boolean;
};

export type CleanupPreview = {
  fingerprint: string;
  server_now: string;
  accounts: CleanupAccount[];
  totals: { accounts: number; ready: number; review: number; needs_confirm: number; protected: number; removable_roles: number };
};

export type CleanupRun = {
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
  review: 'Cần xem lại',
  needs_confirm: 'Cần xác nhận',
  protected: 'Được bảo vệ',
  protected_super: 'Super Admin',
};

export const CLEANUP_GROUP_LABELS: Record<CleanupAccount['group'], string> = {
  A: 'Quản trị',
  B: 'Kinh doanh',
  C: 'Ngoài Kinh doanh',
  D: 'Kiêm nhiệm',
};

/** Accounts the admin may select for execution: only ready or review, never protected/needs_confirm. */
export function selectableAccounts(accounts: CleanupAccount[]) {
  return accounts.filter(a => a.status === 'ready' || a.status === 'review');
}

export function cleanupStatusTone(status: CleanupAccount['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'ready') return 'default';
  if (status === 'review' || status === 'needs_confirm') return 'destructive';
  return 'secondary';
}
