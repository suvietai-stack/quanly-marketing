export const ROLE_FUNCTION_GROUPS = ['Kinh doanh', 'Marketing', 'Thiết kế', 'Vận hành', 'Quản trị & Điều hành', 'Khác'] as const;
const names: Record<string, string[]> = {
  'Kinh doanh': ['Kinh doanh Đơn Hàng', 'Kinh Doanh Phân Phối', 'Lead Kinh Doanh ĐH', 'Giám Đốc Kinh Doanh', 'Showroom'],
  'Marketing': ['Leader Marketing', 'Content Web', 'SEO', 'Local SEO', 'Social', 'Video'],
  'Thiết kế': ['Designer / Chụp ảnh'],
  'Vận hành': ['Kế Toán', 'Cung Ứng', 'Hành Chính Nhân Sự'],
  'Quản trị & Điều hành': ['Super Admin', 'Admin', 'Viewer / Ban Giám Đốc'],
};
/** Display classification only: names never determine permissions or assignments. */
export function roleFunctionGroup(name: string) {
  return ROLE_FUNCTION_GROUPS.find(group => names[group]?.includes(name)) ?? 'Khác';
}
export function organizationSettingsAccess(superAdmin: boolean, structure: boolean, role: boolean, permission: boolean) {
  return { settings: superAdmin || structure || role || permission, structure: superAdmin || structure, roles: superAdmin || role || permission, editRoles: superAdmin || role, matrix: superAdmin || permission };
}