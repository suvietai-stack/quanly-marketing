import {describe,it,expect} from 'vitest';
import {fileError,validDocumentUrl,normalizeProducts,productBreakdown,type DesignCatalog} from './catalogs';
import type {DesignOrder} from '@/lib/store';
const catalogs=[{id:'other',workflow_kind:'order_mockup',kind:'product',name:'Khác',active:true,position:1,is_other:true}] as DesignCatalog[];
describe('Order form data rules',()=>{
 it('removing Other removes local product names',()=>{expect(normalizeProducts([],['Bình hoa'],catalogs)).toEqual([]);});
 it('Other keeps multiple nonempty Order-local names',()=>{expect(normalizeProducts(['other'],[' Bình hoa ','Kỷ niệm chương'],catalogs)).toEqual(['Bình hoa','Kỷ niệm chương']);});
 it('multi-product report distinguishes unique Orders from product links',()=>{const order={id:'one',productIds:['cup','box']} as DesignOrder;const result=productBreakdown([order,order],[]);expect(result.map(p=>p.value)).toEqual([1,1]);expect(new Set(result.flatMap(p=>p.rows.map(o=>o.id))).size).toBe(1);expect(result.reduce((n,p)=>n+p.value,0)).toBe(2);});
 it('accepts AI and PSD design files without image conversion',()=>{expect(fileError({name:'logo.ai',size:2000})).toBe('');expect(fileError({name:'art.psd',size:2000})).toBe('');});
 it('rejects files over 20MB and executable formats',()=>{expect(fileError({name:'brief.pdf',size:20*1024*1024+1})).toBeTruthy();expect(fileError({name:'malware.exe',size:12})).toBeTruthy();});
 it('external links are http(s) URLs, not executable or credential URLs',()=>{expect(validDocumentUrl('https://drive.google.com/document')).toBe(true);expect(validDocumentUrl('javascript:alert(1)')).toBe(false);expect(validDocumentUrl('https://user:password@example.com')).toBe(false);});
});