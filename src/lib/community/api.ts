import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Community is NOT connected to Marketing's public social publishing modules.
// The database policies and private bucket independently enforce active staff access.
const db = supabase as unknown as SupabaseClient;
export const COMMUNITY_BUCKET = 'suviet-community';

/** One-purpose internal directory, available to every active employee.
 * Exposes name and id only; no personnel or private profile records. */
export async function listCommunityMemberNames(): Promise<{ id: string; full_name: string }[]> {
  return unwrap(await db.rpc('community_member_names')) as { id: string; full_name: string }[];
}

export type CommunityMedia = { id: string; path: string; kind: 'image' | 'video'; position: number };
export type CommunityPost = {
  id: string;
  author_id: string;
  community_mascot_posts?: { mascot: 'dom' } | null;
  body: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  community_media: CommunityMedia[];
  community_likes: { user_id: string }[];
  community_comments: { id: string }[];
};
export type CommunityComment = { id: string; post_id: string; author_id: string; body: string; created_at: string };

const FIELDS = 'id,author_id,body,is_pinned,created_at,updated_at,community_mascot_posts(mascot),community_media(id,path,kind,position),community_likes(user_id),community_comments(id)';
function unwrap<T>(value: { data: T | null; error: { message: string } | null }): T {
  if (value.error) throw new Error(value.error.message);
  return value.data as T;
}

export async function listCommunityPosts(page: number, userId?: string) {
  const start = page * 10;
  let query = db.from('community_posts').select(FIELDS)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(start, start + 9);
  if (userId) query = query.eq('author_id', userId);
  const data = unwrap(await query);
  return (data as unknown as CommunityPost[]).map(p => ({
    ...p,
    community_media: [...(p.community_media ?? [])].sort((a, b) => a.position - b.position),
    community_likes: p.community_likes ?? [],
    community_comments: p.community_comments ?? [],
  }));
}

export async function listCommunityComments(postId: string): Promise<CommunityComment[]> {
  return unwrap(await db.from('community_comments')
    .select('id,post_id,author_id,body,created_at').eq('post_id',postId)
    .order('created_at', { ascending: true }).limit(100)) as CommunityComment[];
}

export async function addCommunityComment(postId: string, body: string) {
  unwrap(await db.from('community_comments').insert({ post_id: postId, body: body.trim() }));
}
export async function deleteCommunityComment(id: string) {
  unwrap(await db.from('community_comments').delete().eq('id', id));
}
export async function toggleCommunityLike(postId: string, userId: string, liked: boolean) {
  if (liked) unwrap(await db.from('community_likes').delete().eq('post_id',postId).eq('user_id',userId));
  else unwrap(await db.from('community_likes').insert({ post_id: postId }));
}
export async function editCommunityPost(id: string, body: string) {
  unwrap(await db.from('community_posts').update({ body: body.trim() }).eq('id',id));
}
export async function pinCommunityPost(id: string, pinned: boolean) {
  const result = unwrap(await db.rpc('community_set_pin', { p_post_id: id, p_pinned: pinned }));
  if (!result) throw new Error('Không tìm thấy bài viết để ghim.');
}

export function validateCommunityFiles(files: File[]) {
  if (files.length > 4) throw new Error('Tối đa 4 ảnh hoặc 1 video cho mỗi bài đăng.');
  if (files.some(f => !['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(f.type)))
    throw new Error('Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc video MP4, WebM.');
  if (files.some(f => f.size > (f.type.startsWith('video/') ? 25 : 8) * 1024 * 1024))
    throw new Error('Mỗi ảnh tối đa 8 MB, video tối đa 25 MB.');
  if (files.some(f => f.type.startsWith('video/')) && (files.length !== 1))
    throw new Error('Mỗi bài chỉ được đăng 1 video, không kèm ảnh.');
}

export async function createCommunityPost(body: string, files: File[], userId: string, publisher: 'self' | 'dom' = 'self', requestId = crypto.randomUUID()) {
  validateCommunityFiles(files);
  const created = publisher === 'dom'
    ? { id: unwrap(await db.rpc('community_dom_publish', { p_body: body.trim(), p_request_id: requestId })) as string }
    : unwrap(await db.from('community_posts').insert({ body: body.trim() }).select('id').single()) as { id: string };
  const uploaded: string[] = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'} as Record<string,string>)[file.type];
      const path = `${userId}/${created.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(COMMUNITY_BUCKET).upload(path,file,{ upsert:false,contentType:file.type });
      if (error) throw new Error(error.message);
      uploaded.push(path);
    }
    if (uploaded.length) {
      unwrap(await db.from('community_media').insert(uploaded.map((path, position) => ({
        post_id: created.id, path, kind: files[position].type.startsWith('video/') ? 'video' : 'image', position,
      }))));
    }
    return created.id;
  } catch (err) {
    if (uploaded.length) await supabase.storage.from(COMMUNITY_BUCKET).remove(uploaded);
    await db.from('community_posts').delete().eq('id',created.id);
    throw err;
  }
}

export async function deleteCommunityPost(post: CommunityPost) {
  // Attempt to remove media while the author's storage path still resolves.
  const paths = post.community_media.map(m => m.path);
  if (paths.length) {
    const { error } = await supabase.storage.from(COMMUNITY_BUCKET).remove(paths);
    if (error) throw new Error('Chưa xóa được tệp đính kèm. Vui lòng thử lại.');
  }
  unwrap(await db.from('community_posts').delete().eq('id',post.id));
}
