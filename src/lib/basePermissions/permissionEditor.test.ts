import { expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client',()=>({supabase:{}}));
import { isGrantable, permissionPresets, presetPermissions, permissionDelta, rolePermissionPolicy, permissionAvailability, permissionControl, unsupportedPermissionAdditions, type EditorPolicy } from './permissionEditor';
const policy:EditorPolicy[]=[{key:'leave.create',scope:'own',personal:true,position_ready:true,task_ready:true},{key:'leave.view_unit',scope:'unit',personal:false,position_ready:true,task_ready:false},{key:'web.view',scope:'assigned',personal:false,position_ready:false,task_ready:true}];
it('preset intersects existing verified source capabilities, never grants missing key',()=>{expect(presetPermissions(['leave.create','web.view','settings.role'],policy,'position')).toEqual(['leave.create']);expect(presetPermissions(['web.view','leave.view_unit'],policy,'marketing_task')).toEqual(['web.view']);});
it('draft preset never mutates stored Role permissions',()=>{const stored=['settings.role','leave.create'];const before=[...stored];const suggested=presetPermissions(['leave.create'],policy,'position');expect(stored).toEqual(before);expect(permissionDelta(stored,suggested)).toEqual({added:[],removed:['settings.role']});});
it('director and team presets do not include privileged operations',()=>{const director=permissionPresets.find(p=>p.id==='director');expect(director?.keys).toEqual(['leave.create','leave.view_own','att.create','att.view_own','leave.view_unit','ot.view_unit']);expect(permissionPresets.find(p=>p.id==='team')?.keys).toEqual(['leave.create','leave.view_own','att.create','att.view_own']);});
it('all five Marketing presets are separate and explicit',()=>{expect(permissionPresets.filter(p=>p.kind==='marketing_task').map(p=>p.id)).toEqual(['content','seo','local','social','video']);});
it('common only admits explicitly server-ready own keys, never infers readiness from position or personal',()=>{expect(rolePermissionPolicy(policy,'common')).toEqual([]);expect(rolePermissionPolicy([{...policy[0],common_ready:true},{...policy[1],common_ready:true}],'common').map(p=>p.key)).toEqual(['leave.create']);});
it('source readiness never follows module or Role naming',()=>{expect(permissionAvailability(policy,'web.view','position').ready).toBe(false);expect(permissionAvailability(policy,'web.view','marketing_task').ready).toBe(true);expect(permissionAvailability(policy,'web.view','personal').ready).toBe(false);});
it('unpublished capabilities and unit sources remain locked',()=>{expect(permissionAvailability(policy,'settings.role','position').ready).toBe(false);expect(permissionAvailability(policy,'leave.view_unit','common').ready).toBe(false);expect(permissionAvailability(policy,'leave.view_unit','personal').ready).toBe(false);});
it('same server-supported key is selectable from Common, sales position, SEO task and individual',()=>{
 const p=[{...policy[0],common_ready:true}];
 for(const source of ['common','position','marketing_task','personal'])expect(permissionControl(p,'leave.create',source,[],[])).toMatchObject({ready:true,editable:true,state:'selectable'});
});
it('stale unsupported selected draft cannot enable its checkbox or be sent as a new grant',()=>{
 expect(permissionControl(policy,'settings.role','position',[],['settings.role'])).toMatchObject({editable:false,state:'unavailable'});
 expect(unsupportedPermissionAdditions(policy,'position',[],['settings.role','leave.create'])).toEqual(['settings.role']);
});
it('historic unsupported keys can be retained or removed, never inferred as ready',()=>{
 expect(permissionControl(policy,'settings.role','position',['settings.role'],[])).toMatchObject({ready:false,editable:true,state:'retained'});
 expect(unsupportedPermissionAdditions(policy,'position',['settings.role'],['settings.role'])).toEqual([]);
});
it('unit-only capability shows scope requirement for personal rather than fake selector',()=>{
 expect(permissionControl(policy,'leave.view_unit','personal',[],[])).toMatchObject({ready:false,editable:false,state:'scope_required'});
});
it('isGrantable has no source argument and explicit backend readiness works identically in all editors',()=>{
 const p:EditorPolicy[]=[{key:'safe.native',scope:'unit',personal:false,position_ready:false,task_ready:false,grantable:true}];
 expect(isGrantable('safe.native',p)).toBe(true);
 for(const source of ['common','position','marketing_task','personal'])expect(permissionControl(p,'safe.native',source,[],[]).editable).toBe(true);
 expect(isGrantable('settings.role',p)).toBe(false);
});
it('legacy common/task/personal intersection is universal but a source-only key is not',()=>{
 expect(isGrantable('leave.create',[{...policy[0],common_ready:true}])).toBe(true);
 expect(isGrantable('web.view',policy)).toBe(false);
 expect(isGrantable('leave.create',[{...policy[0],common_ready:true,grantable:false}])).toBe(false);
});
