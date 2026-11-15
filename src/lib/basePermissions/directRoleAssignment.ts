/**
 * Staff receive Common permissions from their active account and position/task
 * permissions from the audited organization chart. Direct user_roles grants are
 * not part of the employee workflow. Protected Super Admin bootstrap is managed
 * exclusively by the existing server-side authorization.
 */
export function assertNoDirectRoleAssignment(roleId?: string | null): void {
  if (roleId !== undefined && roleId !== null) {
    throw new Error('Không gán Role trực tiếp khi duyệt tài khoản. Hãy bổ nhiệm nhân viên trên sơ đồ tổ chức.');
  }
}

export function rejectManualRoleAssignment(): never {
  throw new Error('Không hỗ trợ gán Role trực tiếp. Role vị trí và nhiệm vụ phải qua sơ đồ tổ chức.');
}
