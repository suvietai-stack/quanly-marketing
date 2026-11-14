import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const db = supabase as unknown as SupabaseClient;
export const JOB_CHAT_BUCKET = 'suviet-design-job-chat';
const PAGE_SIZE = 30;

export type JobChatMessage = {
  id: string;
  job_id: string;
  sender_id: string;
  body: string;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_mime: string | null;
  created_at: string;
};
function value<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}
export async function listJobChatMessages(jobId: string, page = 0): Promise<JobChatMessage[]> {
  return value(await db.from('sv_design_job_chat_messages')
    .select('id,job_id,sender_id,body,attachment_path,attachment_name,attachment_mime,created_at')
    .eq('job_id',jobId)
    .order('created_at',{ascending:false})
    .order('id',{ascending:false})
    .range(page*PAGE_SIZE,page*PAGE_SIZE+PAGE_SIZE-1)) as JobChatMessage[];
}
export function nextJobChatPage(last: JobChatMessage[], pages: JobChatMessage[][]) {
  return last.length === PAGE_SIZE ? pages.length : undefined;
}
export async function canAccessJobChat(jobId: string): Promise<boolean> {
  return !!value(await db.rpc('sv_design_job_chat_access',{p_job_id:jobId}));
}
export async function jobChatUnreadCount(jobId: string): Promise<number> {
  return Number(value(await db.rpc('sv_design_job_chat_unread',{p_job_id:jobId}))) || 0;
}
export async function markJobChatRead(jobId: string) {
  value(await db.rpc('sv_design_job_chat_mark_read',{p_job_id:jobId}));
}

const MIME_EXT:Record<string,string> = {
 'image/jpeg':'jpg', 'image/png':'png','image/webp':'webp','image/gif':'gif',
 'application/pdf':'pdf','application/msword':'doc',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx',
 'application/vnd.ms-excel':'xls',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'xlsx'
};
export function checkJobChatFile(file: Pick<File,'size'|'name'|'type'>) {
  if (!MIME_EXT[file.type]) throw new Error('Chỉ hỗ trợ ảnh, PDF, Word hoặc Excel.');
  if (file.size < 1 || file.size > 15 * 1024 * 1024) throw new Error('Tệp tối đa 15 MB.');
  if (!file.name.trim() || file.name.length > 180) throw new Error('Tên tệp phải có 1–180 ký tự.');
}
export async function sendJobChatMessage(jobId:string,userId:string,body:string,file?:File) {
  const text=body.trim();
  if (!text && !file) throw new Error('Hãy viết tin nhắn hoặc chọn tệp.');
  if (text.length>3000) throw new Error('Tối đa 3.000 ký tự.');
  let path:string|undefined;
  if (file) {
    checkJobChatFile(file);
    path=`${jobId}/${userId}/${crypto.randomUUID()}.${MIME_EXT[file.type]}`;
    const {error}=await supabase.storage.from(JOB_CHAT_BUCKET).upload(path,file,{
      contentType:file.type,upsert:false,
    });
    if (error) throw new Error(error.message);
  }
  try {
    value(await db.from('sv_design_job_chat_messages').insert({
      job_id:jobId,body:text,
      ...(path && file ? {attachment_path:path,attachment_name:file.name,attachment_mime:file.type}:{}),
    }));
  } catch(err) {
    if (path) await supabase.storage.from(JOB_CHAT_BUCKET).remove([path]);
    throw err;
  }
}
export async function jobChatDownload(path:string): Promise<Blob> {
  const {data,error}=await supabase.storage.from(JOB_CHAT_BUCKET).download(path);
  if (error || !data) throw new Error(error?.message || 'Không tải được tệp.');
  return data;
}
