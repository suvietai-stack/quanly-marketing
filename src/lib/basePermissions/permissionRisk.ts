// Editor warnings only. These classifications NEVER participate in permission resolution.
export function permissionRisk(key: string): string | undefined {
  if (/(^|\.)(settings|delete|export|force_status)(\.|$)/.test(key) || key.startsWith('settings.')) return 'Nhạy cảm · cấu hình / xóa / xuất';
  if (/(approve|cancel|assign|reassign|reconcile|manage)/.test(key)) return 'Trách nhiệm duyệt / quản lý';
  if (/(view_all|report_all|all_dept)/.test(key)) return 'Phạm vi rộng';
  return undefined;
}