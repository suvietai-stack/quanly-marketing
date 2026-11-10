import { describe, expect, it } from 'vitest';
import { REMEMBER_MAX_MS, sessionPolicy } from './remember-session';

const NOW = 1_800_000_000_000;

describe('sessionPolicy', () => {
  it('giữ phiên khi còn cùng phiên trình duyệt (reload / tab mới)', () => {
    expect(sessionPolicy({ tabAlive: true, remember: '0', since: 0, now: NOW })).toBe('keep');
    expect(sessionPolicy({ tabAlive: true, remember: null, since: 0, now: NOW })).toBe('keep');
  });

  it('giữ phiên ghi nhớ còn trong 90 ngày', () => {
    expect(sessionPolicy({ tabAlive: false, remember: '1', since: NOW - REMEMBER_MAX_MS + 1000, now: NOW })).toBe('keep');
  });

  it('hủy phiên ghi nhớ đã quá 90 ngày', () => {
    expect(sessionPolicy({ tabAlive: false, remember: '1', since: NOW - REMEMBER_MAX_MS - 1, now: NOW })).toBe('drop');
  });

  it('hủy phiên khi không chọn ghi nhớ và trình duyệt đã đóng hẳn', () => {
    expect(sessionPolicy({ tabAlive: false, remember: '0', since: 0, now: NOW })).toBe('drop');
  });

  it('phiên cũ chưa có cờ được giữ (grandfather), cờ ghi ở lần đăng nhập tới', () => {
    expect(sessionPolicy({ tabAlive: false, remember: null, since: 0, now: NOW })).toBe('grandfather');
  });

  it('mốc đúng 90 ngày vẫn còn hiệu lực', () => {
    expect(sessionPolicy({ tabAlive: false, remember: '1', since: NOW - REMEMBER_MAX_MS, now: NOW })).toBe('keep');
  });
});
