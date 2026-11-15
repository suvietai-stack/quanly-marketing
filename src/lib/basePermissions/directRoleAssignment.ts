/** A staff account receives Common rights automatically and position/task rights via org assignments.
 * Direct user_roles edits are retired. Super Admin bootstrap uses protected server paths.
 */
export function assertNoDirectRoleAssignment(roleId?: string | null): void {
  if (roleId !== undefined && roleId !== null) {
    throw new Error('Không gán Role trực tiếp khi duyệt tài khoản. Hãy bổ nhiệm trong Cơ cấu tổ chức.');
  }
}
