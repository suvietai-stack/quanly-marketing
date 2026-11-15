import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const source=fs.readFileSync(new URL('../../src/lib/webChat/model.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("from 'zod'",`from '${pathToFileURL(require.resolve('zod')).href}'`);
const model=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('only a valid Vietnamese phone actually supplied by the visitor becomes contact',()=>{
 assert.equal(model.phoneFromEvidence('+84912345678',['Số Zalo của tôi là 0912 345 678']),'0912345678');
 assert.equal(model.phoneFromEvidence('0912345678',['Tôi cần 100 ly']),'');
 assert.equal(model.phoneFromEvidence('123',['Số 123']),'');
 assert.equal(model.phoneFromEvidence('0912345678',['SĐT 0987654321']),'');
});
test('page metadata rejects cross-site, non-HTTPS and strips query secrets',()=>{
 assert.equal(model.safePage('https://shop.vn/a?token=secret#private','shop.vn'),'https://shop.vn/a');
 for(const url of ['https://evil.vn/a','http://shop.vn/a','javascript:alert(1)'])assert.equal(model.safePage(url,'shop.vn'),'');
});
test('per-website settings are bounded and safe; protocol rejects empty sends',()=>{
 assert.equal(model.settingsSchema.parse({}).character,'Đốm');
 assert.equal(model.settingsSchema.safeParse({color:'url(evil)'}).success,false);
 assert.equal(model.settingsSchema.safeParse({avatar:'javascript:evil'}).success,false);
 assert.equal(model.settingsSchema.safeParse({knowledge:'x'.repeat(30001)}).success,false);
 assert.equal(model.guestSchema.safeParse({action:'send',token:'a'.repeat(64),request:'11111111-1111-4111-8111-111111111111',text:''}).success,false);
 assert.equal(model.DOM_AI_NAME,'Đốm AI');
 assert.notEqual(model.DOM_AI_CREATOR,'00000000-0000-0000-0000-00000000eb01');
});

test('phone correction blocks malformed numbers, preserves the need and resumes after a valid correction',()=>{
 for(const raw of ['08882229226','088822292','888222922','0281234567']) {
  assert.deepEqual(model.resolveContactPhone(raw,[raw]),{phone:'',correctionPending:true});
 }
 assert.equal(model.phoneFromEvidence('0888222922',['00888222922']),'');
 assert.equal(model.phoneFromEvidence('0888222922',['10888222922']),'');
 assert.deepEqual(model.resolveContactPhone('',['Cần đặt gấp'],'',true),{phone:'',correctionPending:true});
 assert.deepEqual(model.resolveContactPhone('0888222922',['0888222922','08882229226'],'0888222922'),{phone:'',correctionPending:true});
 assert.deepEqual(model.resolveContactPhone('0888222922',['08882229226','0888 222 922'],'',true),{phone:'0888222922',correctionPending:false});
 assert.deepEqual(model.resolveContactPhone('+84888222922',['+84 888 222 922'],'',true),{phone:'0888222922',correctionPending:false});
 assert.deepEqual(model.resolveContactPhone('',['200 bộ ấm chén'],'0888222922'),{phone:'0888222922',correctionPending:false});
 assert.deepEqual(model.resolveContactPhone('0888222922',['0888222922','Cần gấp'],'',true),{phone:'',correctionPending:true});
});

test('standalone valid correction does not depend on model extraction',()=>{
 assert.deepEqual(model.resolveContactPhone('',['08882229226','0888222922'],'',true),{phone:'0888222922',correctionPending:false});
});
