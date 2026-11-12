import { supabase } from '@/integrations/supabase/client';
export interface EditorPolicy { key: string; scope: 'own' | 'assigned' | 'unit'; personal: boolean; position_ready: boolean; task_ready: boolean; common_ready?: boolean; grantable?: boolean; reason?: string; deny_ready?: boolean; unit_binding?: string | null }
export const permissionEditorApi = {
  async read(): Promise<EditorPolicy[]> {
    const { data, error } = await supabase.rpc('permission_editor_read');
    if (error) throw error;
    return data as unknown as EditorPolicy[];
  },
};
export const permissionPresets = [
  { id: 'staff', name: 'Nhân viên', kind: 'position', keys: ['leave.create','leave.view_own','att.create','att.view_own','order.view','order.view_mine','order.take','order.update_draft','order.submit','order.history'], note: 'Tác vụ của mình hoặc được giao.' },
  { id: 'team', name: 'Trưởng nhóm', kind: 'position', keys: ['leave.create','leave.view_own','att.create','att.view_own'], note: 'Cần cấu hình: quyền quản lý nhóm chưa đủ phạm vi an toàn để gợi ý.' },
  { id: 'department', name: 'Trưởng phòng', kind: 'position', keys: ['leave.create','leave.view_own','att.create','att.view_own','leave.view_unit','ot.view_unit'], note: 'Chỉ xem trong đơn vị của chính nguồn bổ nhiệm. Duyệt/sửa hộ chưa được gợi ý.' },
  { id: 'director', name: 'Giám đốc', kind: 'position', keys: ['leave.create','leave.view_own','att.create','att.view_own','leave.view_unit','ot.view_unit'], note: 'Không có siêu quyền; phạm vi đơn vị theo nguồn bổ nhiệm. Điều hành rộng cần cấu hình.' },
  { id: 'content', name: 'Content Web', kind: 'marketing_task', keys: ['web.view','web.content_view','web.content_view_mine','web.outline_start','web.outline_submit','web.post_write_start','web.post_submit'], note: 'Viết và gửi bài được giao; không duyệt hay xuất rộng.' },
  { id: 'seo', name: 'SEO', kind: 'marketing_task', keys: ['web.view','web.keyword_view','web.keyword_open_sheet'], note: 'Xem từ khóa và mở bảng liên kết; SEO kỹ thuật cần cấu hình.' },
  { id: 'local', name: 'Local SEO', kind: 'marketing_task', keys: ['local.view','local.view_mine','local.post_create','local.post_edit'], note: 'Tác vụ Local trong phạm vi nghiệp vụ hiện có.' },
  { id: 'social', name: 'Social', kind: 'marketing_task', keys: ['social.view','social.post_view','social.post_view_mine','social.post_create','social.post_edit','social.post_start','social.post_submit'], note: 'Làm và gửi bài; giữ đúng người phụ trách và trạng thái.' },
  { id: 'video', name: 'Video', kind: 'marketing_task', keys: ['video.view','video.view_mine','video.create','video.script_start','video.script_submit','video.submit'], note: 'Làm và gửi video; không duyệt hoặc can thiệp trạng thái.' },
] as const;
export function presetPermissions(keys: readonly string[], policy: EditorPolicy[], kind: string): string[] {
  const allowed = new Set(rolePermissionPolicy(policy,kind).map(p => p.key));
  return [...new Set(keys.filter(k => allowed.has(k)))];
}
export function rolePermissionPolicy(policy:EditorPolicy[],kind:string):EditorPolicy[]{
  return policy.filter(p=>permissionAvailability(policy,p.key,kind).ready);
}
export function permissionDelta(before: string[], after: string[]) {
  return { added: [...new Set(after)].filter(k => !before.includes(k)), removed: [...new Set(before)].filter(k => !after.includes(k)) };
}
export const scopeLabels = { own: 'Của mình / được giao', assigned: 'Theo công việc được giao', unit: 'Đơn vị của nguồn bổ nhiệm' };
/** Universal backend contract. No Role kind, module or department participates. */
export function isGrantable(key: string, policy: EditorPolicy[]): boolean {
  const row = policy.find(p=>p.key===key);
  return row?.grantable === true || (!!row && row.grantable === undefined && row.personal && row.position_ready && row.task_ready && row.common_ready === true && row.scope === 'own');
}
/** Capability metadata is authoritative; never infer grants from a module or Role name. */
export function permissionAvailability(policy: EditorPolicy[], key: string, source: string) {
  const row = policy.find(p => p.key === key);
  // Unified server contract (deny_ready present): each source flag is authoritative, no client-side Role-kind narrowing.
  // Older contract: conservative legacy intersection until the staged SQL is approved.
  const unified = row?.deny_ready !== undefined;
  const ready = unified ? !!row && sourceFlag(row, source) : isGrantable(key,policy) || row && (source === 'personal' ? row.personal : source === 'common' ? row.common_ready === true && row.scope === 'own' : source === 'marketing_task' ? row.task_ready : row.position_ready);
  if (ready && row) return { ready: true, reason: row.scope === 'unit' && source !== 'position' ? `${scopeLabels.unit} · nguồn này không gắn đơn vị nên không mở thêm dữ liệu đơn vị` : scopeLabels[row.scope] };
  if (row?.reason) return { ready: false, reason: row.reason };
  if (row?.scope === 'unit' && source !== 'position') return { ready: false, reason: 'Nguồn này chưa truyền phạm vi đơn vị tới cổng kiểm tra quyền; chưa thể cấp.' };
  if (row) return { ready: false, reason: 'Quyền có trong chính sách máy chủ nhưng nguồn cấp này chưa được kiểm chứng; chưa thể cấp.' };
  return { ready: false, reason: 'Máy chủ chưa công bố quyền này trong chính sách cấp quyền đã kiểm chứng; chưa thể cấp.' };
}
export function permissionControl(policy: EditorPolicy[], key: string, source: string, baseline: string[], value: string[]) {
  const availability = permissionAvailability(policy,key,source);
  const row = policy.find(p=>p.key===key);
  const held = baseline.includes(key);
  return { ...availability, selected: value.includes(key), editable: availability.ready || held,
    state: availability.ready ? 'selectable' : held ? 'retained' : row?.scope === 'unit' ? 'scope_required' : 'unavailable',
    reason: availability.ready ? availability.reason : held ? `Đang giữ · có thể giữ hoặc thu hồi. ${availability.reason}` : availability.reason };
}
/** Only additions need capability readiness; retained historic keys stay subject to server validation. */
export function unsupportedPermissionAdditions(policy: EditorPolicy[], source: string, baseline: string[], value: string[]) {
  return [...new Set(value)].filter(key=>!baseline.includes(key)&&!permissionAvailability(policy,key,source).ready);
}function sourceFlag(row: EditorPolicy, source: string): boolean {
  return source === 'personal' ? row.personal : source === 'common' ? row.common_ready === true : source === 'marketing_task' ? row.task_ready : row.position_ready;
}
/** Personal three-state model: inherit (Role sources decide), explicit ALLOW, explicit DENY (wins over every Role). */
export type PersonalState = 'inherit' | 'allow' | 'deny';
export function personalState(key: string, allow: string[], deny: string[]): PersonalState {
  return deny.includes(key) ? 'deny' : allow.includes(key) ? 'allow' : 'inherit';
}
export function setPersonalState(key: string, state: PersonalState, allow: string[], deny: string[]) {
  const a = allow.filter(k => k !== key), d = deny.filter(k => k !== key);
  return { allow: state === 'allow' ? [...a, key] : a, deny: state === 'deny' ? [...d, key] : d };
}
/** DENY is offered only where the server confirms the gate reads the shared resolver; retained denies can always be removed. */
export function canDeny(policy: EditorPolicy[], key: string, baselineDeny: string[]): boolean {
  return policy.find(p => p.key === key)?.deny_ready === true || baselineDeny.includes(key);
}
