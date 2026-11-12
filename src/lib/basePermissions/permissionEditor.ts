import { supabase } from '@/integrations/supabase/client';
export interface EditorPolicy { key: string; scope: 'own' | 'assigned' | 'unit'; personal: boolean; position_ready: boolean; task_ready: boolean; common_ready?: boolean; reason?: string }
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
  return policy.filter(p=>kind==='common'?p.common_ready===true&&p.scope==='own':kind==='marketing_task'?p.task_ready:p.position_ready);
}
export function permissionDelta(before: string[], after: string[]) {
  return { added: [...new Set(after)].filter(k => !before.includes(k)), removed: [...new Set(before)].filter(k => !after.includes(k)) };
}
export const scopeLabels = { own: 'Của mình / được giao', assigned: 'Theo công việc được giao', unit: 'Đơn vị của nguồn bổ nhiệm' };
/** Capability metadata is authoritative; never infer grants from a module or Role name. */
export function permissionAvailability(policy: EditorPolicy[], key: string, source: string) {
  const row = policy.find(p => p.key === key);
  const ready = row && (source === 'personal' ? row.personal : source === 'common' ? row.common_ready === true && row.scope === 'own' : source === 'marketing_task' ? row.task_ready : row.position_ready);
  if (ready && row) return { ready: true, reason: scopeLabels[row.scope] };
  if (row?.reason) return { ready: false, reason: row.reason };
  if (row?.scope === 'unit' && source !== 'position') return { ready: false, reason: 'Nguồn này chưa truyền phạm vi đơn vị tới cổng kiểm tra quyền; chưa thể cấp.' };
  if (row) return { ready: false, reason: 'Quyền có trong chính sách máy chủ nhưng nguồn cấp này chưa được kiểm chứng; chưa thể cấp.' };
  return { ready: false, reason: 'Máy chủ chưa công bố quyền này trong chính sách cấp quyền đã kiểm chứng; chưa thể cấp.' };
}