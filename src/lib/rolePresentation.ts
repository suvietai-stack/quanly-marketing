export const ROLE_FUNCTION_GROUPS = [
  'B2B', 'Phân Phối', 'BTC', 'Showroom', 'Kinh doanh',
  'Marketing', 'Thiết kế', 'Vận hành', 'Quản trị & Điều hành', 'Khác',
] as const;

// Current V2 names are for presentation only. Never infer a permission
// from a role name: effective authorization uses role IDs and appointments.
const names: Record<string, readonly string[]> = {
  'B2B': ['Giám đốc Trung tâm Kinh doanh B2B','Trưởng phòng Kinh doanh B2B','Trưởng nhóm Kinh doanh B2B','Nhân viên Kinh doanh B2B'],
  'Phân Phối': ['Giám đốc Trung tâm Kinh doanh Phân Phối','Trưởng phòng Kinh doanh Phân Phối','Trưởng nhóm Kinh doanh Phân Phối','Nhân viên Kinh doanh Phân Phối'],
  'BTC': ['Giám đốc Trung tâm Kinh doanh BTC'],
  'Showroom': ['Cửa hàng trưởng','Nhân viên Showroom'],
  'Kinh doanh': ['Giám đốc Kinh doanh','Trưởng phòng Kinh doanh','Trưởng nhóm Kinh doanh','Nhân viên Kinh doanh'],
  'Marketing': ['Giám đốc Marketing','Trưởng phòng Marketing','Nhân viên Marketing','Content Web','SEO','Local SEO','Social','Video'],
  'Thiết kế': ['Trưởng phòng Thiết kế','Nhân viên Thiết kế'],
  'Vận hành': ['Hành chính Nhân sự','Kế toán','Kế toán trưởng','Kế toán kho','Nhân viên Cung ứng','Quản lý Mua hàng & Giao vận','Thu mua','Đóng hàng','Giao vận'],
  'Quản trị & Điều hành': ['Giám đốc Điều hành','Phó Giám đốc Điều hành','Super Admin','Admin'],
};
export function roleFunctionGroup(name: string) {
  return ROLE_FUNCTION_GROUPS.find(group => names[group]?.includes(name)) ?? 'Khác';
}
export function organizationSettingsAccess(superAdmin: boolean, structure: boolean, role: boolean, permission: boolean) {
  return { settings: superAdmin || structure || role || permission, structure: superAdmin || structure, roles: superAdmin || role || permission, editRoles: superAdmin || role, matrix: superAdmin || permission };
}
