import { describe,expect,it } from 'vitest';
import { checkJobChatFile, nextJobChatPage } from './api';

const fakeFile=(type:string,size=1200,name='tep-dinh-kem')=>({type,size,name}) as File;
describe('Chat từng Job thiết kế',()=>{
  it('chấp nhận ảnh và tài liệu công việc',()=>{
    for(const mime of ['image/jpeg','image/png','image/webp','image/gif',
      'application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]) expect(()=>checkJobChatFile(fakeFile(mime))).not.toThrow();
  });
  it('chặn file nguy hiểm, rỗng và vượt 15 MB',()=>{
    expect(()=>checkJobChatFile(fakeFile('application/x-msdownload'))).toThrow();
    expect(()=>checkJobChatFile(fakeFile('application/pdf',0))).toThrow();
    expect(()=>checkJobChatFile(fakeFile('image/jpeg',16*1024*1024))).toThrow();
  });
  it('phân trang lịch sử Job theo 30 tin',()=>{
    expect(nextJobChatPage(Array(30).fill({}),[Array(30).fill({})] as never)).toBe(1);
    expect(nextJobChatPage(Array(29).fill({}),[Array(29).fill({})] as never)).toBeUndefined();
  });
});