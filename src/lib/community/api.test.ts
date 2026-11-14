import { describe, expect, it } from 'vitest';
import { validateCommunityFiles } from './api';

const fakeFile = (mime:string, bytes:number):File => ({ type:mime,size:bytes,name:'internal' } as File);
describe('Cộng đồng Sứ Việt: media constraints', () => {
  it('allows photos for everyone, up to four', () => {
    expect(() => validateCommunityFiles(Array.from({length:4},()=>fakeFile('image/webp',35000)))).not.toThrow();
  });
  it('rejects five attachments', () => {
    expect(() => validateCommunityFiles(Array.from({length:5},()=>fakeFile('image/jpeg',1500)))).toThrow();
  });
  it('rejects video and images together', () => {
    expect(() => validateCommunityFiles([fakeFile('video/mp4',5000),fakeFile('image/png',500)])).toThrow();
  });
  it('blocks unsupported and oversize media', () => {
    expect(() => validateCommunityFiles([fakeFile('text/html',50)])).toThrow();
    expect(() => validateCommunityFiles([fakeFile('image/jpeg',9*1024*1024)])).toThrow();
    expect(() => validateCommunityFiles([fakeFile('video/webm',26*1024*1024)])).toThrow();
  });
});