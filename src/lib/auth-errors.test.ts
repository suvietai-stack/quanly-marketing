import { describe, expect, it } from 'vitest';
import { accountAccess, authErrorMessage } from './auth-errors';
describe('account eligibility', () => {
  it('only active profiles grant business access', () => {
    expect(accountAccess('Đang hoạt động')).toBe('active');
    expect(accountAccess('Chờ duyệt')).toBe('pending');
    for (const status of ['Tạm khóa', 'Từ chối', 'Lưu trữ']) expect(accountAccess(status)).toBe('blocked');
    expect(accountAccess(undefined)).toBe('missing');
  });
  it('confirmation rejection is not invalid credentials', () => {
    expect(authErrorMessage({ code: 'email_not_confirmed' })).not.toBe(authErrorMessage({ code: 'invalid_credentials' }));
  });
  it('password policy rejection is not a consumed recovery link', () => {
    expect(authErrorMessage({ code: 'weak_password' }, 'password')).not.toBe(authErrorMessage({ code: 'otp_expired' }, 'password'));
  });
  it('transport errors do not claim successful email delivery', () => {
    expect(authErrorMessage(null, 'send')).toBe('Không gửi được email lúc này. Vui lòng thử lại.');
  });
});