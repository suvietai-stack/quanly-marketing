import { describe,expect,it } from 'vitest';
import { BASE_GUIDES, relevantBaseGuides, guideFallback } from './guides';
import { knowledgeMime } from './documents';

describe('AI Sứ Việt: hướng dẫn quy trình Base',()=>{
 it('has direct, internal Base paths and steps for each guide',()=>{
   expect(BASE_GUIDES.length).toBeGreaterThanOrEqual(10);
   for(const g of BASE_GUIDES){
     expect(g.path.startsWith('/')).toBe(true);
     expect(g.steps.length).toBeGreaterThanOrEqual(2);
     expect(g.steps.length).toBeLessThanOrEqual(6);
   }
 });
 it('understands Vietnamese with or without accents',()=>{
   expect(relevantBaseGuides('Cách tạo Job thiết kế trên Base?')[0]?.id).toBe('design-create');
   expect(relevantBaseGuides('huong dan gui duyet thiet ke')[0]?.id).toBe('design-review');
   expect(relevantBaseGuides('Phân công tín hiệu cho Sale thế nào?')[0]?.id).toBe('signal');
   expect(relevantBaseGuides('cách tạo đề nghị thanh toán')[0]?.id).toBe('finance');
 });
 it('uses the actual step sequence without pretending any action happened',()=>{
   const text=guideFallback(BASE_GUIDES.find(g=>g.id==='k3')!);
   expect(text).toContain('1. ');
   expect(text).not.toMatch(/đã (tạo|duyệt|cập nhật) thành công/i);
 });
 it('supports the requested file formats only',()=>{
   for(const name of ['quytrinh.pdf','tai-lieu.docx','bao-cao.xlsx','bao-cao.xls','quy-dinh.txt','noi-dung.md','bang.csv'])
     expect(knowledgeMime(name)).toBeTruthy();
   for(const name of ['run.exe','file.js','private.html','foo.zip'])
     expect(knowledgeMime(name)).toBeUndefined();
 });
});