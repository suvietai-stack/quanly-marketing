import { describe, it, expect } from 'vitest';
import { getUserPermissions, explainPermission, type User, type Role, type PermissionKey } from './auth';

const roles: Role[] = [
  { id: 'role-video', name: 'Video', permissions: ['video.create', 'video.approve'] as PermissionKey[] },
  { id: 'role-content', name: 'Content', permissions: ['web.content_create', 'web.content_view'] as PermissionKey[] },
];

function user(patch: Partial<User>): User {
  return {
    id: 'u1', username: 'u1', fullName: 'U Một', passwordHash: '', passwordSalt: '',
    status: 'Đang hoạt động', createdAt: '2026-01-01', ...patch,
  } as User;
}

describe('getUserPermissions — nhiều Role trên một tài khoản', () => {
  it('tổng hợp quyền từ tất cả Role trực tiếp, loại trùng', () => {
    const u = user({ roleId: 'role-video', roleIds: ['role-video', 'role-content', 'role-video'] });
    const perms = getUserPermissions(u, roles);
    expect([...perms].sort()).toEqual(['video.approve', 'video.create', 'web.content_create', 'web.content_view']);
  });

  it('tài khoản một Role (legacy, chỉ có roleId) vẫn đúng như trước', () => {
    const u = user({ roleId: 'role-video' });
    const perms = getUserPermissions(u, roles);
    expect([...perms].sort()).toEqual(['video.approve', 'video.create']);
  });

  it('chế độ replace: quyền riêng thay thế toàn bộ Role', () => {
    const u = user({ roleId: 'role-video', roleIds: ['role-video', 'role-content'], useCustom: true, overrideMode: 'replace', customPermissions: ['web.content_view'] as PermissionKey[] });
    const perms = getUserPermissions(u, roles);
    expect([...perms]).toEqual(['web.content_view']);
  });

  it('chế độ additive: Role + quyền bổ sung, không trùng', () => {
    const u = user({ roleId: 'role-video', roleIds: ['role-video', 'role-content'], useCustom: true, overrideMode: 'additive', customPermissions: ['web.content_view'] as PermissionKey[] });
    const perms = getUserPermissions(u, roles);
    expect(perms.size).toBe(4);
    expect(perms.has('video.create')).toBe(true);
    expect(perms.has('web.content_view')).toBe(true);
  });

  it('Role không còn tồn tại trong danh mục không cấp quyền', () => {
    const u = user({ roleId: 'role-video', roleIds: ['role-video', 'role-da-xoa'] });
    const perms = getUserPermissions(u, roles);
    expect([...perms].sort()).toEqual(['video.approve', 'video.create']);
  });
});

describe('explainPermission — nêu đúng Role cấp quyền', () => {
  it('quyền từ Role thứ hai vẫn được giải thích đúng tên nguồn', () => {
    const u = user({ roleId: 'role-video', roleIds: ['role-video', 'role-content'] });
    const e = explainPermission(u, roles, 'web.content_create' as PermissionKey);
    expect(e.ok).toBe(true);
    expect(e.roleName).toBe('Content');
  });

  it('quyền không có trong bất kỳ Role nào báo thiếu', () => {
    const u = user({ roleId: 'role-video', roleIds: ['role-video'] });
    const e = explainPermission(u, roles, 'web.content_create' as PermissionKey);
    expect(e.ok).toBe(false);
    expect(e.source).toBe('missing');
  });
});
