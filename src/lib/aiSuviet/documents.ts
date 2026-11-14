import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
const db=supabase as unknown as SupabaseClient;
export const AI_KNOWLEDGE_BUCKET='suviet-ai-knowledge';

export type AiDocument={id:string;title:string;original_name:string;mime_type:string;storage_path:string;visibility:'admin'|'company';status:'ready'|'pending'|'failed';content:string;indexed_at:string|null;created_at:string;uploaded_by:string};
const mimes:Record<string,string>={
 '.txt':'text/plain','.md':'text/markdown','.csv':'text/csv',
 '.pdf':'application/pdf',
 '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 '.xls':'application/vnd.ms-excel',
};
export function knowledgeMime(filename:string):string|undefined{
  const ext=filename.toLowerCase().match(/\.[^.]+$/)?.[0]||'';
  return mimes[ext];
}
async function docxText(file:File):Promise<string>{
  const bytes=new Uint8Array(await file.arrayBuffer());
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const has=(offset:number,magic:number)=>offset>=0 && offset+4<=bytes.length && view.getUint32(offset,true)===magic;
  let end=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){
    if(has(i,0x06054b50)){end=i;break;}
  }
  if(end<0)throw new Error('File Word không đúng định dạng .docx.');
  const entryCount=view.getUint16(end+10,true);
  let offset=view.getUint32(end+16,true);
  let xmlBytes:Uint8Array|undefined;
  const decoder=new TextDecoder();
  for(let i=0;i<entryCount;i++){
    if(!has(offset,0x02014b50))throw new Error('Cấu trúc file Word không hợp lệ.');
    const method=view.getUint16(offset+10,true),size=view.getUint32(offset+20,true);
    const nameLen=view.getUint16(offset+28,true),extraLen=view.getUint16(offset+30,true),commentLen=view.getUint16(offset+32,true);
    const local=view.getUint32(offset+42,true);
    const name=decoder.decode(bytes.slice(offset+46,offset+46+nameLen));
    if(name==='word/document.xml'){
      if(view.getUint32(offset+24,true)>2_000_000)throw new Error('Nội dung Word vượt giới hạn xử lý an toàn.');
      if(!has(local,0x04034b50))throw new Error('Không đọc được nội dung Word.');
      const start=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true);
      if(start+size>bytes.length)throw new Error('File Word bị lỗi.');
      const compressed=bytes.slice(start,start+size);
      if(method===0)xmlBytes=compressed;
      else if(method===8){
        if(typeof DecompressionStream==='undefined')throw new Error('Thiết bị chưa hỗ trợ đọc Word. Hãy thử trên Chrome hoặc cập nhật trình duyệt.');
        const decompressor=new DecompressionStream('deflate-raw' as CompressionFormat);
        const stream=new Blob([compressed]).stream().pipeThrough(decompressor);
        xmlBytes=new Uint8Array(await new Response(stream).arrayBuffer());
      }else throw new Error('Định dạng nén Word chưa hỗ trợ.');
      break;
    }
    offset+=46+nameLen+extraLen+commentLen;
  }
  if(!xmlBytes)throw new Error('Không tìm thấy nội dung văn bản trong file Word.');
  const xml=decoder.decode(xmlBytes);
  const document=new DOMParser().parseFromString(xml,'application/xml');
  if(document.getElementsByTagName('parsererror').length)throw new Error('Nội dung XML của Word bị lỗi.');
  const paragraphs=Array.from(document.getElementsByTagName('w:p'));
  return paragraphs.map(p=>Array.from(p.getElementsByTagName('w:t')).map(t=>t.textContent||'').join('')).filter(Boolean).join('\n');
}
export async function extractKnowledgeText(file:File):Promise<string>{
  if(file.size>6*1024*1024||file.size<=0)throw new Error('Tệp phải có dung lượng từ 1 byte đến 6 MB.');
  const mime=knowledgeMime(file.name);
  if(!mime)throw new Error('Chỉ hỗ trợ PDF, Word DOCX, Excel XLS/XLSX, TXT, MD hoặc CSV.');
  if(mime==='application/pdf')return ''; // Private upload; administrator triggers PDF indexing on server.
  let text='';
  if(mime.startsWith('text/'))text=await file.text();
  else if(mime.includes('wordprocessingml'))text=await docxText(file);
  else {
    const XLSX=await import('xlsx');
    const workbook=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false});
    text=workbook.SheetNames.map(name=>{
      const sheet=workbook.Sheets[name];
      return `Bảng: ${name}\n${XLSX.utils.sheet_to_csv(sheet,{blankrows:false})}`;
    }).join('\n\n');
  }
  if(text.trim().length<8)throw new Error('Không tìm thấy đủ chữ trong tài liệu. Hãy kiểm tra tệp.');
  return text.replace(/\u0000/g,'').slice(0,160000);
}

export async function knowledgeDocuments():Promise<AiDocument[]>{
  const {data,error}=await db.from('ai_sv_documents').select('id,title,original_name,mime_type,storage_path,visibility,status,content,indexed_at,created_at,uploaded_by').order('created_at',{ascending:false}).limit(100);
  if(error)throw new Error(error.message);
  return (data||[]) as AiDocument[];
}
export async function uploadKnowledgeDocument(file:File,title:string,uid:string):Promise<{id:string;requiresIndex:boolean}>{
  const mime=knowledgeMime(file.name);
  if(!mime)throw new Error('Định dạng file không hỗ trợ.');
  if(title.trim().length<2||title.trim().length>180)throw new Error('Tên tài liệu cần 2–180 ký tự.');
  const content=await extractKnowledgeText(file);
  const path=`${uid}/${crypto.randomUUID()}-${encodeURIComponent(file.name.slice(0,75))}`;
  const {error:uploadError}=await supabase.storage.from(AI_KNOWLEDGE_BUCKET).upload(path,file,{upsert:false,contentType:mime});
  if(uploadError)throw new Error(uploadError.message);
  try{
    const {data,error}=await db.from('ai_sv_documents').insert({
      title:title.trim(),original_name:file.name.slice(0,200),mime_type:mime,
      storage_path:path,content,
      status:mime==='application/pdf'?'pending':'ready',
      visibility:'admin',uploaded_by:uid,
      indexed_at:mime==='application/pdf'?null:new Date().toISOString(),
    }).select('id').single();
    if(error||!data)throw new Error(error?.message||'Chưa lưu được tài liệu.');
    return {id:data.id as string,requiresIndex:mime==='application/pdf'};
  }catch(e){
    await supabase.storage.from(AI_KNOWLEDGE_BUCKET).remove([path]);
    throw e;
  }
}
export async function setKnowledgeVisibility(id:string,visibility:'admin'|'company') {
  const {error}=await db.from('ai_sv_documents').update({visibility,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)throw new Error(error.message);
}
export async function removeKnowledgeDocument(doc:AiDocument){
  const {error:storageError}=await supabase.storage.from(AI_KNOWLEDGE_BUCKET).remove([doc.storage_path]);
  if(storageError)throw new Error(storageError.message);
  const {error}=await db.from('ai_sv_documents').delete().eq('id',doc.id);
  if(error)throw new Error(error.message);
}
