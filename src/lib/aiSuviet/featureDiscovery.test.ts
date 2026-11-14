import { describe,expect,it } from 'vitest';
import { Lightbulb } from 'lucide-react';
import { discoverBaseFeatures,findBaseFeatures,baseFeatureHelp } from './featureDiscovery';
import type { NavGroup } from '@/lib/navigation';

const groups:Pick<NavGroup,'label'|'items'>[]=[
 {label:'Đội vận hành',items:[
  {to:'/new-job-feature',label:'Bàn giao mẫu mới',icon:Lightbulb,perm:'order.view'},
  {to:'/restricted-new',label:'Hồ sơ mật',icon:Lightbulb,perm:'finance.incoming.view'},
  {to:'/admin-only',label:'Cấu hình quản trị',icon:Lightbulb,adminOnly:true},
  {to:'/coming',label:'Chưa triển khai',icon:Lightbulb,comingSoon:true},
 ]},
];
describe('Chipi tự nhận biết chức năng mới',()=>{
 it('picks up new menu items without editing assistant guidance',()=>{
  const items=discoverBaseFeatures(groups,{permissions:[{key:'order.view',allowed:true}]});
  expect(items.map(i=>i.path)).toContain('/new-job-feature');
  expect(findBaseFeatures('Bàn giao mẫu mới nằm ở đâu?',items)[0]?.path).toBe('/new-job-feature');
 });
 it('never exposes restricted and not-yet-deployed sections to regular employees',()=>{
  const items=discoverBaseFeatures(groups,{permissions:[{key:'order.view',allowed:true},{key:'finance.incoming.view',allowed:false}]});
  expect(items.map(i=>i.path)).not.toContain('/restricted-new');
  expect(items.map(i=>i.path)).not.toContain('/admin-only');
  expect(items.map(i=>i.path)).not.toContain('/coming');
 });
 it('includes admin-only menus for super admin only',()=>{
  const items=discoverBaseFeatures(groups,null,true);
  expect(items.map(i=>i.path)).toContain('/admin-only');
  expect(items.map(i=>i.path)).not.toContain('/coming');
 });
 it('does not invent detailed instructions for unknown new functions',()=>{
  const feature=discoverBaseFeatures(groups,{permissions:[{key:'order.view',allowed:true}]})[0];
  const answer=baseFeatureHelp(feature);
  expect(answer).toContain('chưa có tài liệu đủ chi tiết');
  expect(answer).toContain('/new-job-feature');
  expect(answer).not.toMatch(/đã (gửi duyệt|tạo xong|hoàn thành)/i);
 });
});
