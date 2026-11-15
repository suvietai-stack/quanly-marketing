import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from '@/lib/auth';
import { canDeny, permissionAvailability, personalState, setPersonalState } from './permissionEditor';
import { assertNoDirectRoleAssignment, rejectManualRoleAssignment } from './directRoleAssignment';

const designFlows = ['photo','marketing_design','order_mockup'] as const;
const designActions = ['view','view_all','create','edit','assign','take','submit','resubmit',
  'approve','request_changes','deliver','complete','cancel','restore','report_view',
  'edit_reviewer','send_request','update_draft','force_status','delete'] as const;
const inbox = ['inbox.view','inbox.send','inbox.assign','inbox.resolve','inbox.manage'] as const;

describe('515-key frontend registry and backend capability contract', () => {
  it('contains exactly 515 unique permissions, including dynamically generated design actions', () => {
    const keys = PERMISSIONS.map(p=>p.key);
    expect(keys).toHaveLength(515);
    expect(new Set(keys).size).toBe(515);
    for (const flow of designFlows) for (const action of designActions) {
      expect(keys).toContain(`order.${flow}.${action}`);
    }
    for (const key of inbox) expect(keys).toContain(key);
  });

  it('never silently narrows the 515 available keys by Role kind on a unified policy', () => {
    const policy = PERMISSIONS.map(p=>({
      key:p.key,scope:'native' as const,personal:true,
      position_ready:true,task_ready:true,common_ready:true,
      grantable:true,deny_ready:true,
    }));
    for (const source of ['common','position','marketing_task','personal']) {
      const enabled = policy.filter(p=>permissionAvailability(policy,p.key,source).ready);
      expect(enabled).toHaveLength(515);
    }
    expect(policy.filter(p=>canDeny(policy,p.key,[]))).toHaveLength(515);
  });

  it('personal DENY beats ALLOW in the client draft and can be restored to inherited', () => {
    const key = 'inbox.send';
    const disabled = setPersonalState(key,'deny',[key],[]);
    expect(personalState(key,disabled.allow,disabled.deny)).toBe('deny');
    expect(disabled.allow).not.toContain(key);
    const inherited = setPersonalState(key,'inherit',disabled.allow,disabled.deny);
    expect(personalState(key,inherited.allow,inherited.deny)).toBe('inherit');
  });
});

describe('no direct staff Role assignment', () => {
  it('approves only without manual role', () => {
    expect(()=>assertNoDirectRoleAssignment()).not.toThrow();
    expect(()=>assertNoDirectRoleAssignment(null)).not.toThrow();
  });
  it('rejects all manual role IDs, including legacy default, admin and empty string', () => {
    for(const role of ['role-nhan-su-moi','role-seo','role-v2-sales-staff','role-super-admin','role-admin','']) {
      expect(()=>assertNoDirectRoleAssignment(role)).toThrow('Không gán Role trực tiếp');
    }
  });
  it('disables the old destructive delete-then-insert role setter unconditionally', () => {
    expect(()=>rejectManualRoleAssignment()).toThrow('Không hỗ trợ gán Role trực tiếp');
  });
});
