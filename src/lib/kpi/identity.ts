/**
 * KPI V2 — match nhân sự (pure). Exact id / fullName / username; trim + case-insensitive.
 * KHÔNG fuzzy, KHÔNG match một phần tên.
 */
export interface KpiEmployee {
  id: string;
  fullName?: string | null;
  username?: string | null;
}

function norm(v: string | null | undefined): string {
  return (v ?? "").normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}

export function matchesEmployee(value: string | null | undefined, employee: KpiEmployee): boolean {
  const v = norm(value);
  if (!v) return false;
  if (employee.id && v === norm(employee.id)) return true;
  if (employee.fullName && v === norm(employee.fullName)) return true;
  if (employee.username && v === norm(employee.username)) return true;
  return false;
}
