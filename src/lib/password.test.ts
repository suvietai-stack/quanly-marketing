import { describe, expect, it } from "vitest";
import {
  canResetPassword,
  canResetTarget,
  changePasswordError,
  isFakeEmail,
  passwordIssues,
} from "./password";

describe("isFakeEmail", () => {
  it("chặn email nội bộ/giả", () => {
    expect(isFakeEmail("nguyen@user.local")).toBe(true);
    expect(isFakeEmail("admin@local")).toBe(true);
    expect(isFakeEmail("a@x.local")).toBe(true);
    expect(isFakeEmail("khong-co-at")).toBe(true);
    expect(isFakeEmail("")).toBe(true);
  });
  it("chấp nhận email thật", () => {
    expect(isFakeEmail("sale@suviet.vn")).toBe(false);
    expect(isFakeEmail("a@gmail.com")).toBe(false);
  });
});

describe("passwordIssues", () => {
  it("bắt mật khẩu yếu", () => {
    expect(passwordIssues("abc123").length).toBeGreaterThan(0); // < 8 ký tự
    expect(passwordIssues("abcdefgh")).toContain("Mật khẩu mới cần có ít nhất một chữ số.");
    expect(passwordIssues("12345678")).toContain("Mật khẩu mới cần có ít nhất một chữ cái.");
  });
  it("chấp nhận mật khẩu đủ mạnh", () => {
    expect(passwordIssues("suviet2026")).toEqual([]);
    expect(passwordIssues("Matkhau1")).toEqual([]);
  });
  it('new password limit is identical at the shared maximum', () => {
    expect(passwordIssues('a1' + 'a'.repeat(198))).toEqual([]);
    expect(passwordIssues('a1' + 'a'.repeat(199))).toContain('Mật khẩu tối đa 200 ký tự.');
  });
});

describe("changePasswordError", () => {
  it("bắt thiếu mật khẩu hiện tại", () => {
    expect(changePasswordError("", "suviet2026", "suviet2026")).toBe("Vui lòng nhập mật khẩu hiện tại.");
  });
  it("bắt xác nhận không khớp", () => {
    expect(changePasswordError("oldpass1", "suviet2026", "suviet2027")).toBe("Mật khẩu xác nhận không khớp.");
  });
  it("bắt mật khẩu mới trùng mật khẩu cũ", () => {
    expect(changePasswordError("suviet2026", "suviet2026", "suviet2026")).toBe("Mật khẩu mới phải khác mật khẩu hiện tại.");
  });
  it("hợp lệ khi đủ điều kiện", () => {
    expect(changePasswordError("oldpass1", "suviet2026", "suviet2026")).toBeNull();
  });
});

describe("canResetPassword / canResetTarget", () => {
  const superActor = { isSuperAdmin: true, isAdmin: false, hasResetPermission: false };
  const adminActor = { isSuperAdmin: false, isAdmin: true, hasResetPermission: false };
  const permActor = { isSuperAdmin: false, isAdmin: false, hasResetPermission: true };
  const staffActor = { isSuperAdmin: false, isAdmin: false, hasResetPermission: false };
  const normalTarget = { isSystemAdmin: false, isSuperAdmin: false };
  const superTarget = { isSystemAdmin: false, isSuperAdmin: true };
  const systemTarget = { isSystemAdmin: true, isSuperAdmin: false };

  it("chỉ người có quyền mới được reset", () => {
    expect(canResetPassword(superActor)).toBe(true);
    expect(canResetPassword(adminActor)).toBe(true);
    expect(canResetPassword(permActor)).toBe(true);
    expect(canResetPassword(staffActor)).toBe(false);
  });

  it("admin thường không reset được Super Admin / tài khoản hệ thống", () => {
    expect(canResetTarget(adminActor, superTarget)).toBe(false);
    expect(canResetTarget(adminActor, systemTarget)).toBe(false);
    expect(canResetTarget(permActor, superTarget)).toBe(false);
    expect(canResetTarget(adminActor, normalTarget)).toBe(true);
  });

  it("Super Admin reset được mọi tài khoản", () => {
    expect(canResetTarget(superActor, superTarget)).toBe(true);
    expect(canResetTarget(superActor, systemTarget)).toBe(true);
    expect(canResetTarget(superActor, normalTarget)).toBe(true);
  });

  it("nhân viên thường không reset được ai", () => {
    expect(canResetTarget(staffActor, normalTarget)).toBe(false);
  });
});
