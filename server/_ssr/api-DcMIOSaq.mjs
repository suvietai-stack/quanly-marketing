import { s as supabase } from "./client-DfPXH9B8.mjs";
const db = supabase;
const COMMUNITY_BUCKET = "suviet-community";
async function listCommunityMemberNames() {
  return unwrap(await db.rpc("community_member_names"));
}
const FIELDS = "id,author_id,body,is_pinned,created_at,updated_at,community_mascot_posts(mascot),community_media(id,path,kind,position),community_likes(user_id),community_comments(id)";
function unwrap(value) {
  if (value.error) throw new Error(value.error.message);
  return value.data;
}
async function listCommunityPosts(page, userId) {
  const start = page * 10;
  let query = db.from("community_posts").select(FIELDS).order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).range(start, start + 9);
  if (userId) query = query.eq("author_id", userId);
  const data = unwrap(await query);
  return data.map((p) => ({
    ...p,
    community_media: [...p.community_media ?? []].sort((a, b) => a.position - b.position),
    community_likes: p.community_likes ?? [],
    community_comments: p.community_comments ?? []
  }));
}
async function listCommunityComments(postId) {
  return unwrap(await db.from("community_comments").select("id,post_id,author_id,body,created_at").eq("post_id", postId).order("created_at", { ascending: true }).limit(100));
}
async function addCommunityComment(postId, body) {
  unwrap(await db.from("community_comments").insert({ post_id: postId, body: body.trim() }));
}
async function deleteCommunityComment(id) {
  unwrap(await db.from("community_comments").delete().eq("id", id));
}
async function toggleCommunityLike(postId, userId, liked) {
  if (liked) unwrap(await db.from("community_likes").delete().eq("post_id", postId).eq("user_id", userId));
  else unwrap(await db.from("community_likes").insert({ post_id: postId }));
}
async function editCommunityPost(id, body) {
  unwrap(await db.from("community_posts").update({ body: body.trim() }).eq("id", id));
}
async function pinCommunityPost(id, pinned) {
  const result = unwrap(await db.rpc("community_set_pin", { p_post_id: id, p_pinned: pinned }));
  if (!result) throw new Error("Không tìm thấy bài viết để ghim.");
}
function validateCommunityFiles(files) {
  if (files.length > 4) throw new Error("Tối đa 4 ảnh hoặc 1 video cho mỗi bài đăng.");
  if (files.some((f) => !["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(f.type)))
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc video MP4, WebM.");
  if (files.some((f) => f.size > (f.type.startsWith("video/") ? 25 : 8) * 1024 * 1024))
    throw new Error("Mỗi ảnh tối đa 8 MB, video tối đa 25 MB.");
  if (files.some((f) => f.type.startsWith("video/")) && files.length !== 1)
    throw new Error("Mỗi bài chỉ được đăng 1 video, không kèm ảnh.");
}
async function createCommunityPost(body, files, userId, publisher = "self", requestId = crypto.randomUUID()) {
  validateCommunityFiles(files);
  const created = publisher === "dom" ? { id: unwrap(await db.rpc("community_dom_publish", { p_body: body.trim(), p_request_id: requestId })) } : unwrap(await db.from("community_posts").insert({ body: body.trim() }).select("id").single());
  const uploaded = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm" }[file.type];
      const path = `${userId}/${created.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(COMMUNITY_BUCKET).upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw new Error(error.message);
      uploaded.push(path);
    }
    if (uploaded.length) {
      unwrap(await db.from("community_media").insert(uploaded.map((path, position) => ({
        post_id: created.id,
        path,
        kind: files[position].type.startsWith("video/") ? "video" : "image",
        position
      }))));
    }
    return created.id;
  } catch (err) {
    if (uploaded.length) await supabase.storage.from(COMMUNITY_BUCKET).remove(uploaded);
    await db.from("community_posts").delete().eq("id", created.id);
    throw err;
  }
}
async function deleteCommunityPost(post) {
  const paths = post.community_media.map((m) => m.path);
  if (paths.length) {
    const { error } = await supabase.storage.from(COMMUNITY_BUCKET).remove(paths);
    if (error) throw new Error("Chưa xóa được tệp đính kèm. Vui lòng thử lại.");
  }
  unwrap(await db.from("community_posts").delete().eq("id", post.id));
}
export {
  COMMUNITY_BUCKET as C,
  listCommunityPosts as a,
  listCommunityComments as b,
  createCommunityPost as c,
  deleteCommunityComment as d,
  addCommunityComment as e,
  editCommunityPost as f,
  deleteCommunityPost as g,
  listCommunityMemberNames as l,
  pinCommunityPost as p,
  toggleCommunityLike as t,
  validateCommunityFiles as v
};
