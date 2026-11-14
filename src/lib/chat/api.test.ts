import { describe,expect,it } from 'vitest';
import { validateChatAttachment, chatFileExtension } from './api';

const file=(type:string,size:number,name='tailieu.pdf') => ({type,size,name}) as File;
describe('Sứ Việt Chat file protection',()=>{
 it('supports image, PDF, Word and Excel',()=>{
  for(const type of ['image/jpeg','image/png','application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']) {
    expect(()=>validateChatAttachment(file(type,1000))).not.toThrow();
  }
 });
 it('blocks executable files, empty files and files over 20 MB',()=>{
  expect(()=>validateChatAttachment(file('application/x-msdownload',300))).toThrow();
  expect(()=>validateChatAttachment(file('application/pdf',0))).toThrow();
  expect(()=>validateChatAttachment(file('application/pdf',21*1024*1024))).toThrow();
  expect(()=>validateChatAttachment(file('application/pdf',200,'a'.repeat(181)))).toThrow();
 });
 it('uses MIME-derived safe extensions instead of the user-supplied name',()=>{
  expect(chatFileExtension(file('image/png',100,'virus.exe'))).toBe('png');
  expect(chatFileExtension(file('application/pdf',100,'document.pdf'))).toBe('pdf');
 });
});