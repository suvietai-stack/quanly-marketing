import { describe,expect,it } from 'vitest';
import {
  supplierStats,supplierFollowUpOverdue,supplierStatusLabels,
  formatSupplierPrice,type MasterSupplier,
} from './suppliers';

function supplier(changes:Partial<MasterSupplier>={}):MasterSupplier {
  return {
    id:'s1',code:'NCC-000001',name:'NCC 1',category:[],
    contact_name:null,phone:null,email:null,website:null,address:null,
    status:'active',active:true,next_follow_up:null,last_contact_at:null,
    updated_at:'2026-11-16T00:00:00Z',created_at:'2026-11-16T00:00:00Z',
    created_by:null,product_count:0,can_edit:false,...changes,
  };
}
describe('shared procurement supplier master',()=>{
  it('keeps an existing supplier count and never duplicates suppliers across business units',()=>{
    expect(supplierStats([supplier()])).toEqual({
      total:1,active:1,potential:0,overdue:0,products:0,
    });
  });
  it('counts follow-up dates only for suppliers that are not archived',()=>{
    expect(supplierStats([
      supplier({status:'active',next_follow_up:'2026-11-13',product_count:2}),
      supplier({id:'s2',status:'potential',next_follow_up:'2026-11-20',product_count:3}),
      supplier({id:'s3',status:'archived',next_follow_up:'2026-11-10'}),
    ],'2026-11-16')).toMatchObject({total:3,active:1,potential:1,overdue:1,products:5});
    expect(supplierFollowUpOverdue(supplier({status:'archived',next_follow_up:'2026-11-11'}),'2026-11-16')).toBe(false);
  });
  it('keeps price formatting separate from unprivileged product views',()=>{
    expect(formatSupplierPrice(null,'VND')).toBe('—');
    expect(formatSupplierPrice(125000,'VND')).toContain('125.000');
    expect(Object.keys(supplierStatusLabels)).toEqual(['potential','active','paused','archived']);
  });
});
