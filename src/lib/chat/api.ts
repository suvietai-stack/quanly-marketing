import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const db = supabase as unknown as SupabaseClient;
export const CHAT_BUCKET = 'suviet-chat';
export const CHAT_REFRESH_MS = 12_000;

export type ChatThread = {
  thread_id: string;
  kind: 'direct'|'group';
  title: string|null;
  member_ids: string[];
  last_message: string|null;
  last_sender: string|null;
  last_at: string;
  unread_count: number;
  my_last_read: string;
};
export type ChatMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  attachment_path: string|null;
  attachment_name: string|null;
  attachment_mime: string|null;
  attachment_size: number|null;
  recalled_at: string|null;
  created_at: string;
};
export type ChatParticipant = { thread_id:string; user_id:string; last_read_at:string; role:string };

function unwrap<T>(result: { data: T|null; error: { message: string }|null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}
export async function chatInbox(): Promise<ChatThread[]> {
  const data = unwrap(await db.rpc('sv_chat_inbox'));
  return (data as ChatThread[]).map(t=>({ ...t,unread_count:Number(t.unread_count) || 0,member_ids:t.member_ids ?? [] }));
}
export async function chatUnreadTotal(): Promise<number> {
  const data = unwrap(await db.rpc('sv_chat_unread_total'));
  return Number(data) || 0;
}
export async function openDirectChat(otherId:string): Promise<string> {
  return unwrap(await db.rpc('sv_chat_open_direct',{p_other:otherId})) as string;
}
export async function createChatGroup(title:string,memberIds:string[]): Promise<string> {
  return unwrap(await db.rpc('sv_chat_create_group',{p_title:title.trim(),p_users:memberIds})) as string;
}
export async function chatMessages(threadId:string): Promise<ChatMessage[]> {
  const result = await db.from('sv_chat_messages')
    .select('id,thread_id,sender_id,body,attachment_path,attachment_name,attachment_mime,attachment_size,recalled_at,created_at')
    .eq('thread_id',threadId).order('created_at',{ascending:false})
    .order('id',{ascending:false}).limit(60);
  const data = unwrap(result) as ChatMessage[];
  return data.reverse();
}
export async function chatParticipants(threadId:string): Promise<ChatParticipant[]> {
  return unwrap(await db.from('sv_chat_members')
    .select('thread_id,user_id,last_read_at,role').eq('thread_id',threadId)) as ChatParticipant[];
}
export async function markChatRead(threadId:string): Promise<void> {
  unwrap(await db.rpc('sv_chat_mark_read',{p_thread:threadId}));
}
export async function recallChatMessage(id:string) {
  return unwrap(await db.rpc('sv_chat_recall',{p_message:id})) as boolean;
}

export const CHAT_MIME = new Set([
  'image/jpeg','image/png','image/webp','image/gif','application/pdf',
  'text/plain','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
const CHAT_MAX_BYTES=20*1024*1024;
export function validateChatAttachment(file: Pick<File,'size'|'type'|'name'>) {
  if (!CHAT_MIME.has(file.type)) throw new Error('Định dạng tệp chưa hỗ trợ. Hãy chọn ảnh, PDF, Word, Excel hoặc PowerPoint.');
  if (!file.size || file.size>CHAT_MAX_BYTES) throw new Error('Tệp phải nhỏ hơn hoặc bằng 20 MB.');
  if (!file.name.trim() || file.name.length>180) throw new Error('Tên tệp cần có 1–180 ký tự.');
}
export function chatFileExtension(file: Pick<File,'type'|'name'>) {
  const map:Record<string,string>={
    'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif',
    'application/pdf':'pdf','text/plain':'txt','application/msword':'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx',
    'application/vnd.ms-excel':'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':'pptx'
  };
  return map[file.type];
}
/** Upload goes into private storage. The message row is authoritative,
 * and the RLS download policy requires the exact unrecalled message path. */
export async function sendChatMessage(threadId:string,uid:string,body:string,attachment?:File) {
  const trimmed = body.trim();
  if (trimmed.length>4000) throw new Error('Tin nhắn tối đa 4.000 ký tự.');
  if (!trimmed && !attachment) throw new Error('Hãy nhập tin nhắn hoặc chọn tệp.');
  let uploadedPath:string|null=null;
  if (attachment) {
    validateChatAttachment(attachment);
    uploadedPath=`${threadId}/${uid}/${crypto.randomUUID()}.${chatFileExtension(attachment)}`;
    const { error }=await supabase.storage.from(CHAT_BUCKET).upload(uploadedPath,attachment,{
      upsert:false,contentType:attachment.type,
    });
    if (error) throw new Error(error.message);
  }
  try {
    unwrap(await db.from('sv_chat_messages').insert({
      thread_id:threadId,body:trimmed,
      ...(attachment && uploadedPath ? {
        attachment_path:uploadedPath,
        attachment_name:attachment.name,
        attachment_mime:attachment.type,
        attachment_size:attachment.size,
      } : {}),
    }));
  } catch(err) {
    if(uploadedPath) await supabase.storage.from(CHAT_BUCKET).remove([uploadedPath]);
    throw err;
  }
}
export async function downloadChatAttachment(path:string) {
  const {data,error}=await supabase.storage.from(CHAT_BUCKET).download(path);
  if(error || !data) throw new Error(error?.message ?? 'Không tải được tệp.');
  return data;
}
export async function deleteChatAttachment(path:string) {
  const { error }=await supabase.storage.from(CHAT_BUCKET).remove([path]);
  if(error) throw new Error(error.message);
}
