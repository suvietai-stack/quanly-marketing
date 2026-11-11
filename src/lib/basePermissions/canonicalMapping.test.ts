import { expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client',()=>({supabase:{}}));
import { canonicalMapping, canonicalRoleDrafts } from './canonicalMapping';
import { isCanonicalRole } from './defaultRolePresets';
import type { RoleCatalog } from './roleCatalog';
const catalog={roles:[],slots:[],unmapped:[
 {id:'head',title_id:'9cc8cdff-afcf-41eb-89b3-d8836d86ab84',unit_id:'sales',unit_name:'Kinh doanh'},
 {id:'mkt',title_id:'b5e00000-0000-4000-8000-000000000101',unit_id:'mkt',unit_name:'Marketing'},
],mapping:[]} as unknown as RoleCatalog;
it('legacy standard sales Role is not canonical',()=>expect(isCanonicalRole({id:'role-standard-sales-staff',role_kind:'position',role_code:'role-standard-sales-staff'})).toBe(false));
it('generic leader never inherits staff Role or Viewer',()=>{
 const row=canonicalMapping(catalog)[0];expect(row.roleId).toBeUndefined();expect(row.exception).toBeTruthy();
});
it('audited Marketing head receives head draft, not Design or staff',()=>expect(canonicalMapping(catalog)[1].roleId).toBe('role-canonical-v1-mkt-head'));
it('25 new drafts never claim stored Roles/slots when there are none',()=>{
 const drafts=canonicalRoleDrafts(catalog,[]);expect(drafts).toHaveLength(25);expect(drafts.every(d=>!d.stored&&d.permissions.length===0)).toBe(true);
});