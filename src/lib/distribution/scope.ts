/** Identical source data, strict UI projection by canonical department ID.
 *  undefined = original Biz view; [] = deliberately empty scoped area.
 *  Server RLS/RPC still independently enforces read/write permissions.
 */
export function scopeDepartmentRows<T extends { department_id: string }>(
  rows: readonly T[], allowedDepartmentIds?: readonly string[],
): T[] {
  return allowedDepartmentIds === undefined
    ? [...rows]
    : rows.filter(row => allowedDepartmentIds.includes(row.department_id));
}
