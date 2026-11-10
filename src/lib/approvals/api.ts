import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ApprovalSource =
  | 'biz' | 'finance' | 'leave' | 'leave_cancel' | 'attendance' | 'design' | 'order_tracking' | 'account'
  | 'video' | 'web_content' | 'social_post' | 'task' | 'local_map'
  | (string & {});

export interface ApprovalItem {
  source: ApprovalSource;
  id: string;
  code?: string;
  title: string;
  requester?: string;
  summary?: string;
  amount?: number | string;
  dates?: Record<string, string>;
  step_label?: string;
  waiting_since?: string;
  acted_at?: string;
  action?: string;
  overdue?: boolean;
  url: string;
}

export interface ApprovalCenterData {
  server_now: string;
  eligible: boolean;
  todo: ApprovalItem[];
  mine: ApprovalItem[];
  done: ApprovalItem[];
  /** Nguồn tải lỗi (được cô lập phía máy chủ) — không coi như đã kiểm tra đầy đủ. */
  errors?: { source: string; message: string }[];
}

export const approvalCenterQuery = (uid: string) => queryOptions({
  queryKey: ['approval_center', uid],
  staleTime: 0,
  refetchInterval: 30000,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('approval_center_read');
    if (error) throw error;
    return data as unknown as ApprovalCenterData;
  },
});

export type ApprovalGroup = 'finance' | 'hr' | 'biz' | 'design' | 'order' | 'marketing' | 'task' | (string & {});

export const GROUP_LABELS: Record<string, string> = {
  finance: 'Tài chính',
  hr: 'Nhân sự',
  biz: 'Kinh doanh',
  design: 'Thiết kế',
  order: 'Đơn hàng',
  marketing: 'Marketing',
  task: 'Công việc',
};

export const groupLabel = (group: string) => GROUP_LABELS[group] ?? group;

export const sourceGroup = (source: ApprovalSource): ApprovalGroup =>
  source === 'finance' ? 'finance'
    : source === 'leave' || source === 'leave_cancel' || source === 'attendance' || source === 'account' ? 'hr'
      : source === 'biz' ? 'biz'
        : source === 'design' ? 'design'
          : source === 'video' || source === 'web_content' || source === 'social_post' || source === 'local_map' ? 'marketing'
            : source === 'task' ? 'task' : 'order';

const time = (v?: string) => {
  if (!v) return undefined;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : undefined;
};

/** Ưu tiên: quá hạn → chờ lâu nhất → mới hơn. */
export function sortTodo(items: ApprovalItem[]): ApprovalItem[] {
  return [...items].sort((a, b) => {
    if (!!a.overdue !== !!b.overdue) return a.overdue ? -1 : 1;
    return (time(a.waiting_since) ?? Infinity) - (time(b.waiting_since) ?? Infinity);
  });
}

export function filterItems(items: ApprovalItem[], search: string, group: ApprovalGroup | 'all'): ApprovalItem[] {
  const q = search.trim().toLocaleLowerCase('vi');
  return items.filter((i) =>
    (group === 'all' || sourceGroup(i.source) === group) &&
    (!q || [i.title, i.requester, i.summary, i.code].filter(Boolean).join(' ').toLocaleLowerCase('vi').includes(q)));
}

export function waitingText(since: string | undefined, now: string | number | Date): string {
  const from = time(since);
  const to = typeof now === 'string' ? time(now) : now instanceof Date ? now.getTime() : now;
  if (!from || !to) return '';
  const minutes = Math.max(0, Math.floor((to - from) / 60000));
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  return `${days} ngày`;
}

export const vnd = (n?: number | string) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  return new Intl.NumberFormat('vi-VN').format(v) + 'đ';
};

export const badgeText = (count: number) => (count <= 0 ? '' : count > 99 ? '99+' : String(count));

export const dateText = (v?: string) => {
  const t = time(v);
  if (!t) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(t));
};

/**
 * Tách URL nội bộ thành { to, search } cho điều hướng TanStack Router
 * (không tải lại ứng dụng). Trả null với URL ngoài/không hợp lệ.
 */
export function parseApprovalUrl(url: string): { to: string; search: Record<string, string> } | null {
  if (!url.startsWith('/') || url.startsWith('//')) return null;
  const q = url.indexOf('?');
  const to = q === -1 ? url : url.slice(0, q);
  const search = q === -1 ? {} : Object.fromEntries(new URLSearchParams(url.slice(q + 1)));
  return { to, search };
}
