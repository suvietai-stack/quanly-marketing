import { describe, expect, it } from 'vitest';
import { restoredTaskPermissions } from './marketingTaskRestore';
const contentReady = ['web.view', 'web.content_view', 'web.outline_start', 'task.view', 'leave.create', 'social.post_create', 'order.create'];
describe('Marketing task restore after legacy reset (proposed rule)', () => {
  it('Content Web staff in Marketing regains web.view/content_view/outline_start', () => {
    const r = restoredTaskPermissions({ roleId: 'role-content-web', standard: true, marketingEligible: true, readyPermissions: contentReady });
    expect(r).toEqual(expect.arrayContaining(['web.view', 'web.content_view', 'web.outline_start']));
  });
  it('Content Web does not leak social.* or order.*', () => {
    const r = restoredTaskPermissions({ roleId: 'role-content-web', standard: true, marketingEligible: true, readyPermissions: contentReady });
    expect(r).not.toContain('social.post_create'); expect(r).not.toContain('order.create');
  });
  it('another Marketing task (Video) only gets video + basics', () => {
    const r = restoredTaskPermissions({ roleId: 'role-video', standard: true, marketingEligible: true, readyPermissions: ['video.view', 'web.view', 'local.view'] });
    expect(r).toEqual(['video.view']);
  });
  it('staff outside Marketing or after last Marketing appointment ends gets nothing', () => {
    expect(restoredTaskPermissions({ roleId: 'role-content-web', standard: true, marketingEligible: false, readyPermissions: contentReady })).toEqual([]);
  });
  it('legacy (non-standard) Role is never restored', () => {
    expect(restoredTaskPermissions({ roleId: 'role-content-web', standard: false, marketingEligible: true, readyPermissions: contentReady })).toEqual([]);
  });
});
