export interface EffectiveBizAccess {
  user_id: string;
  permissions: string[];
  server_now: string;
  next_change: string | null;
  super_admin: boolean;
  appointments: AccessAppointment[];
  legacy_assignments: AccessAppointment[];
  exceptions: { id: string; permission: string; scope_kind: string; reason: string; granted_by: string; ended_at: string | null }[];
}
export interface AccessAppointment { id: string; position: string; scope: string; unit_name: string; started_at: string; ended_at: string | null }