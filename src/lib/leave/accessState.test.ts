import { expect, it } from 'vitest';
import { leaveAccessState, validLeaveTab, LEAVE_ACCESS_KEYS } from './accessState';
it('common Role employee waits for actor-matched authoritative permission, not false denial', () => {
  expect(leaveAccessState('staff',true,false,undefined,false,false)).toBe('pending');
  expect(leaveAccessState('staff',true,false,'staff',true,false)).toBe('ready');
});
it('failed access read is retryable error, not granted or denied permission', () => {
  expect(leaveAccessState('staff',true,false,undefined,false,true)).toBe('error');
});
it('another actor cache never grants access', () => {
  expect(leaveAccessState('staff',true,false,'admin',true,false)).toBe('pending');
});
it('sign-out/inactive/authoritative deny remain closed', () => {
  expect(leaveAccessState(undefined,true,false,'staff',true,false)).toBe('denied');
  expect(leaveAccessState('staff',false,false,'staff',true,false)).toBe('denied');
  expect(leaveAccessState('staff',true,false,'staff',false,false)).toBe('denied');
});
it('late own permission selects own tab while valid deep links remain', () => {
  expect(validLeaveTab('report',['mine'])).toBe('mine');
  expect(validLeaveTab('approve',['mine','approve'])).toBe('approve');
});
it('unit-scoped manager may enter without view_all; backend still filters rows', () => {
  expect(LEAVE_ACCESS_KEYS).toContain('leave.view_unit');
  expect(validLeaveTab('mine',['manage'])).toBe('manage');
});