import {describe,it,expect} from 'vitest';
import {designGroupMessage,DESIGN_ZALO_EVENTS,FLOW_LABEL} from './zaloGroupMessage';
describe('design Zalo Group formatting',()=>{
 it('keeps all three channels independently named',()=>{
  expect(Object.values(FLOW_LABEL)).toEqual(['Chụp ảnh','Ấn phẩm Marketing','Ma-két đơn hàng']);
 });
 it('includes action, assignee and safe deep link',()=>{
  const m=designGroupMessage('marketing_design','transferred',{
   title:'Bộ ảnh mới',requester:'Người tạo',assignee:'Thiết kế B',
   old_assignee:'Thiết kế A',reviewer:'Người duyệt',status:'Chờ nhận việc',deadline:'2026-11-17'
  },'https://base.suviet.vn/orders?open=abc');
  expect(m).toContain('Thiết kế A');
  expect(m).toContain('Thiết kế B');
  expect(m).toContain('17/11/2026');
  expect(m).toContain('/orders?open=abc');
 });
 it('does not include private file descriptions or credentials',()=>{
  expect(Object.keys(DESIGN_ZALO_EVENTS)).toContain('created');
  const m=designGroupMessage('photo','created',{title:'Chụp sản phẩm',assignee:'NV'},'https://base.suviet.vn/orders?open=1');
  expect(m).not.toContain('brief');
  expect(m).not.toContain('access_token');
 });
});
