import type { OrgData } from './organization';
export const UNIT_KINDS = { system: 'Hệ', department: 'Phòng', team: 'Nhóm', individual: 'Cá nhân' } as const;
export const ROLE_SCOPES = { assigned: 'Theo phân công hiện có', individual: 'Cá nhân / hồ sơ được chỉ định', team: 'Nhóm', department: 'Phòng', system: 'Hệ', all: 'Toàn bộ' } as const;
export type UnitKind = keyof typeof UNIT_KINDS;
export interface BizPosition { id: string; code: string | null; name: string; description: string; level: number; unit_kind: UnitKind; sort_order: number; active: boolean; business_policy?: 'personal' | 'manager' | 'executive'; all_business?: boolean }
export interface Appointment { id: string; position_id: string; user_id: string; system_id: string | null; department_id: string | null; team_id: string | null; scope_kind: UnitKind; started_at: string; ended_at: string | null; status: 'active' | 'ended' | 'cancelled'; position_snapshot: BizPosition; replaces_id: string | null }
export interface PositionsData { positions: BizPosition[]; appointments: Appointment[]; server_now: string }
export interface PreviewReviewer { department: string; team: string; label: string; user_id: string | null; substitute_id: string | null; missing: boolean }
export function appointmentCurrent(a: Pick<Appointment, 'status' | 'started_at' | 'ended_at'>, now: string) { return a.status !== 'cancelled' && Date.parse(a.started_at) <= Date.parse(now) && (!a.ended_at || Date.parse(a.ended_at) > Date.parse(now)); }
export function appointmentStatus(a: Appointment, now: string) { return a.status === 'cancelled' ? 'Đã hủy' : Date.parse(a.started_at) > Date.parse(now) ? 'Sắp hiệu lực' : appointmentCurrent(a, now) ? 'Đang hiệu lực' : 'Đã kết thúc'; }
export function appointmentUnit(a: Pick<Appointment, 'system_id' | 'department_id' | 'team_id' | 'scope_kind'>, org: OrgData) { return a.scope_kind === 'system' ? a.system_id ? org.systems.find(s => s.id === a.system_id)?.name : 'Toàn Khối Kinh doanh Sứ Việt' : a.scope_kind === 'team' ? org.teams.find(t => t.id === a.team_id)?.name : org.departments.find(d => d.id === a.department_id)?.name; }
export interface AppointmentContext { positionCode?: string; systemId?: string; departmentId?: string; teamId?: string; replacesId?: string; legacyReplacesId?: string }
export const DEFAULT_BUSINESS_POSITIONS = [
 { code: 'executive_director', name: 'Giám Đốc Điều hành', level: 5, scope: 'Toàn Khối' },
 { code: 'deputy_executive_director', name: 'Phó Giám Đốc Điều hành', level: 4, scope: 'Toàn Khối' },
 { code: 'director', name: 'Giám Đốc Hệ', level: 3, scope: 'Hệ phụ trách' },
 { code: 'department_head', name: 'Trưởng Phòng', level: 2, scope: 'Phòng phụ trách' },
 { code: 'team_lead', name: 'Trưởng Nhóm', level: 1, scope: 'Nhóm phụ trách' },
 { code: 'employee', name: 'Nhân viên Kinh doanh', level: 0, scope: 'Cá nhân' },
] as const;
export function vietnamInput(iso: string) { return new Date(Date.parse(iso) + 7 * 3600000).toISOString().slice(0, 16); }
export function vietnamTimestamp(input: string) { return `${input}:00+07:00`; }