import { chipiAssets } from '@/assets/chipi/states';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Heart, MessageCircle, ImagePlus, Send, Pin, Trash2, Pencil, X, Play, UsersRound, LoaderCircle, Megaphone, ChevronDown, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  COMMUNITY_BUCKET, type CommunityPost, type CommunityMedia,
  listCommunityPosts, listCommunityComments, addCommunityComment, deleteCommunityComment,
  toggleCommunityLike, editCommunityPost, pinCommunityPost, validateCommunityFiles,
  createCommunityPost, deleteCommunityPost, listCommunityMemberNames,
} from '@/lib/community/api';

function shortTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}
function errorText(e: unknown) { return e instanceof Error ? e.message : 'Có lỗi kết nối. Vui lòng thử lại.'; }

function InitialAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'sm' }) {
  return <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 font-bold text-blue-800 dark:from-blue-900 dark:to-teal-950 dark:text-blue-100 ${size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm'}`}>
    {name.trim().slice(0, 2).toUpperCase() || 'SV'}
  </span>;
}

/** Private object downloads require the active employee's JWT and RLS.
 * Do not replace with getPublicUrl/createSignedUrl: those share outside Base. */
function PrivateMedia({ media }: { media: CommunityMedia }) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [requested, setRequested] = useState(false);
  const [objectUrl, setObjectUrl] = useState('');
  const [failure, setFailure] = useState(false);
  const shouldLoad = media.kind === 'image' ? visible : requested;

  useEffect(() => {
    if (media.kind === 'video') return;
    const node = element.current;
    if (!node || !('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '240px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [media.path, media.kind]);

  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    let url = '';
    setFailure(false);
    void supabase.storage.from(COMMUNITY_BUCKET).download(media.path).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data) { setFailure(true); return; }
      url = URL.createObjectURL(data);
      setObjectUrl(url);
    }).catch(() => { if (!cancelled) setFailure(true); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); setObjectUrl(''); };
  }, [media.path, shouldLoad]);

  return <div ref={element} className="relative min-h-36 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
    {failure ? <div className="flex min-h-36 items-center justify-center px-3 text-center text-xs text-muted-foreground">Không tải được tệp. Hãy thử lại.</div>
      : media.kind === 'video'
        ? objectUrl
          ? <video controls playsInline preload="metadata" src={objectUrl} className="max-h-96 w-full rounded-xl bg-black" aria-label="Video nội bộ" />
          : <button type="button" onClick={() => setRequested(true)} disabled={requested} className="flex min-h-40 w-full flex-col items-center justify-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
            {requested ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Play className="h-7 w-7" />}
            {requested ? 'Đang tải video riêng tư…' : 'Chạm để xem video'}
          </button>
        : objectUrl
          ? <img src={objectUrl} alt="Ảnh chia sẻ trong Cộng đồng Sứ Việt" loading="lazy" className="max-h-[440px] w-full object-contain" />
          : <div role="status" className="flex min-h-40 items-center justify-center text-xs text-muted-foreground">Đang tải ảnh…</div>}
  </div>;
}

function CommunityComposer({ userId, authorName, moderator, onCreated }: { userId: string; authorName: string; moderator: boolean; onCreated: () => void }) {
  const [body, setBody] = useState('');
  const [publisher, setPublisher] = useState<'self' | 'dom'>('self');
  const publication = useRef({ signature: '', id: crypto.randomUUID() });
  const asDom = moderator && publisher === 'dom';
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const choose = (chosen: FileList | null) => {
    if (!chosen) return;
    const next = [...files,...Array.from(chosen)];
    try { validateCommunityFiles(next); setFiles(next); }
    catch (err) { toast.error(errorText(err)); }
    if (picker.current) picker.current.value = '';
  };
  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!body.trim()) { toast.error('Hãy viết vài dòng để chia sẻ với đồng nghiệp.'); return; }
    if (body.trim().length > 5000) { toast.error('Bài đăng tối đa 5.000 ký tự.'); return; }
    setBusy(true);
    try {
      const signature = JSON.stringify([userId, body.trim(), asDom, files.map(f => [f.name, f.size, f.lastModified])]);
      if (publication.current.signature !== signature) publication.current = { signature, id: crypto.randomUUID() };
      await createCommunityPost(body, files, userId, asDom ? 'dom' : 'self', publication.current.id);
      setBody(''); setFiles([]); publication.current = { signature: '', id: crypto.randomUUID() }; onCreated();
      toast.success('Đã chia sẻ với Cộng đồng Sứ Việt.');
    } catch(err) { toast.error(errorText(err)); }
    finally { setBusy(false); }
  };
  return <form onSubmit={publish} className="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
    <div className="flex items-start gap-3">
      {asDom ? <img src={chipiAssets.hello.url} alt="Đốm" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" /> : <InitialAvatar name={authorName} />}
      <div className="min-w-0 flex-1">
        {moderator ? <label className="mb-2 block text-xs text-muted-foreground">Đăng với tên
          <select aria-label="Danh tính đăng bài" disabled={busy} value={publisher} onChange={e => setPublisher(e.target.value as 'self' | 'dom')} className="mt-1 min-h-11 w-full rounded-xl border bg-background px-3 text-sm font-semibold text-foreground">
            <option value="self">{authorName}</option><option value="dom">Đốm - AI Sứ Việt</option>
          </select>
        </label> : <p className="mb-2 text-sm font-semibold">{authorName}</p>}
        <Textarea rows={3} maxLength={5000} value={body} onChange={e => setBody(e.target.value)} placeholder="Hôm nay bạn muốn chia sẻ điều gì với Sứ Việt?" className="min-h-24 resize-y rounded-xl border-slate-200 bg-slate-50 text-base dark:bg-slate-900" />
        <span className="mt-1 block text-right text-[11px] text-muted-foreground">{body.length}/5000</span>
      </div>
    </div>
    {files.length > 0 && <div className="mt-3 space-y-2 rounded-xl bg-muted/50 p-2.5">
      {files.map((file,index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 truncate">{file.type.startsWith('video/') ? '🎬' : '🖼️'} {file.name}</span>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Gỡ ${file.name}`} onClick={() => setFiles(prev => prev.filter((_,i) => i !== index))}><X className="h-4 w-4" /></Button>
      </div>)}
    </div>}
    <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
      <input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="hidden" ref={picker} onChange={e => choose(e.target.files)} aria-label="Chọn ảnh hoặc video" />
      <Button type="button" variant="ghost" className="min-h-11 rounded-xl text-emerald-700 dark:text-emerald-300" onClick={() => picker.current?.click()} disabled={busy}><ImagePlus className="h-4 w-4" />Ảnh / video</Button>
      <Button type="submit" className="min-h-11 rounded-xl bg-blue-700 px-5 text-white hover:bg-blue-800" disabled={busy || !body.trim()}>
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{busy ? 'Đang đăng…' : asDom ? 'Đốm đăng bài' : 'Đăng bài'}
      </Button>
    </div>
  </form>;
}

function Comments({ post, nameOf, meId, moderator, onChange }: {
  post: CommunityPost; nameOf: (id: string) => string; meId: string; moderator: boolean; onChange: () => void;
}) {
  const cache = useQueryClient();
  const [input,setInput] = useState('');
  const [busy,setBusy] = useState(false);
  const comments = useQuery({ queryKey: ['community','comments',meId,post.id], queryFn: () => listCommunityComments(post.id), staleTime: 20_000, retry: 1 });
  const reply = async(e: React.FormEvent) => {
    e.preventDefault(); if (!input.trim() || busy) return;
    setBusy(true);
    try {
      await addCommunityComment(post.id,input);
      setInput(''); await cache.invalidateQueries({ queryKey:['community','comments',meId,post.id] }); onChange();
    } catch(err) { toast.error(errorText(err)); }
    finally { setBusy(false); }
  };
  const remove = async(id:string) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await deleteCommunityComment(id);
      await cache.invalidateQueries({ queryKey:['community','comments',meId,post.id] }); onChange();
    } catch(err) { toast.error(errorText(err)); }
  };
  return <div className="space-y-3 border-t bg-slate-50/70 p-3 dark:bg-slate-900/50">
    {comments.isLoading && <p role="status" className="text-xs text-muted-foreground">Đang tải bình luận…</p>}
    {comments.isError && <Button variant="outline" size="sm" type="button" onClick={() => void comments.refetch()}>Chưa tải được bình luận · Thử lại</Button>}
    {comments.data?.map(comment => <div key={comment.id} className="flex items-start gap-2">
      <InitialAvatar name={nameOf(comment.author_id)} size="sm" />
      <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 dark:bg-card">
        <div className="flex items-start justify-between gap-2"><strong className="text-xs">{nameOf(comment.author_id)}</strong>
          {(comment.author_id===meId || moderator) && <button type="button" aria-label="Xóa bình luận" className="text-muted-foreground" onClick={() => void remove(comment.id)}><Trash2 className="h-3.5 w-3.5" /></button>}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.body}</p>
        <span className="mt-1 block text-[10px] text-muted-foreground">{shortTime(comment.created_at)}</span>
      </div>
    </div>)}
    <form onSubmit={reply} className="flex items-end gap-2">
      <Textarea rows={1} maxLength={1000} placeholder="Viết bình luận…" value={input} onChange={e=>setInput(e.target.value)} className="min-h-11 resize-none rounded-xl text-base" />
      <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" disabled={!input.trim() || busy} aria-label="Gửi bình luận"><Send className="h-4 w-4" /></Button>
    </form>
    {comments.data && comments.data.length===100 && <p className="text-xs text-muted-foreground">Hiển thị 100 bình luận đầu tiên.</p>}
  </div>;
}

function CommunityPostCard({ post, meId, moderator, nameOf, onChange }: {
 post: CommunityPost; meId: string; moderator: boolean; nameOf: (id:string)=>string; onChange:()=>void;
}) {
  const [commentsOpen,setCommentsOpen] = useState(false);
  const [editing,setEditing] = useState(false);
  const [draft,setDraft] = useState(post.body);
  const [busy,setBusy] = useState(false);
  const liked = post.community_likes.some(l => l.user_id === meId);
  const owner = post.author_id === meId;
  const mascot = post.community_mascot_posts?.mascot === 'dom';
  const doAction = async (action:()=>Promise<unknown>,success?:string) => {
    if (busy) return;
    setBusy(true);
    try { await action(); if(success) toast.success(success); onChange(); }
    catch(err) { toast.error(errorText(err)); }
    finally { setBusy(false); }
  };
  return <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
    <div className="flex items-start gap-3 p-4 pb-2">
      {mascot ? <img src={chipiAssets.hello.url} alt="Đốm" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" /> : <InitialAvatar name={nameOf(post.author_id)} />}
      <div className="min-w-0 flex-1">
        <h3 className="break-words text-sm font-bold">{mascot ? 'Đốm - AI Sứ Việt' : nameOf(post.author_id)}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{shortTime(post.created_at)} · Nội bộ Sứ Việt</p>
      </div>
      {post.is_pinned && <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800"><Pin className="h-3 w-3" />Ghim</span>}
    </div>
    {editing ? <div className="space-y-2 px-4 pb-3">
      <Textarea value={draft} maxLength={5000} onChange={e => setDraft(e.target.value)} rows={3} className="text-base" />
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={()=>setEditing(false)}>Hủy</Button>
        <Button type="button" size="sm" disabled={!draft.trim()||busy} onClick={()=>void doAction(async()=>{await editCommunityPost(post.id,draft);setEditing(false);},'Đã cập nhật bài viết.')}>Lưu</Button></div>
    </div> : <p className="whitespace-pre-wrap break-words px-4 pb-3 pt-2 text-[14px] leading-6">{post.body}</p>}
    {post.community_media.length > 0 && <div className={`grid gap-1 px-3 pb-3 ${post.community_media.length>1?'grid-cols-2':'grid-cols-1'}`}>
      {post.community_media.map(media => <PrivateMedia key={media.id} media={media} />)}
    </div>}
    {(owner || moderator) && <div className="flex flex-wrap justify-end gap-1 border-t px-3 py-1">
      {owner && <Button variant="ghost" size="sm" className="h-9 text-xs" type="button" onClick={()=>{setDraft(post.body);setEditing(true);}}><Pencil className="h-3.5 w-3.5" />Sửa</Button>}
      {moderator && <Button variant="ghost" size="sm" type="button" disabled={busy} className="h-9 text-xs" onClick={()=>void doAction(()=>pinCommunityPost(post.id,!post.is_pinned))}><Pin className="h-3.5 w-3.5" />{post.is_pinned?'Bỏ ghim':'Ghim'}</Button>}
      <Button variant="ghost" size="sm" type="button" disabled={busy} className="h-9 text-xs text-rose-700" onClick={() => {
        if (window.confirm('Bạn chắc chắn muốn xóa bài viết này?')) void doAction(()=>deleteCommunityPost(post),'Đã xóa bài viết.');
      }}><Trash2 className="h-3.5 w-3.5" />Xóa</Button>
    </div>}
    <div className="flex justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
      <span>{post.community_likes.length} lượt thích</span><span>{post.community_comments.length} bình luận</span>
    </div>
    <div className="grid grid-cols-2 gap-2 border-t p-2">
      <Button variant="ghost" type="button" disabled={busy} className={`min-h-11 rounded-xl ${liked?'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300':''}`} onClick={()=>void doAction(()=>toggleCommunityLike(post.id,meId,liked))}>
        <Heart className={`h-4 w-4 ${liked?'fill-current':''}`} />{liked?'Đã thích':'Thích'}
      </Button>
      <Button variant="ghost" type="button" className="min-h-11 rounded-xl" onClick={()=>setCommentsOpen(v=>!v)} aria-expanded={commentsOpen}>
        <MessageCircle className="h-4 w-4" />Bình luận
      </Button>
    </div>
    {commentsOpen && <Comments post={post} nameOf={nameOf} meId={meId} moderator={moderator} onChange={onChange} />}
  </article>;
}

export function CommunityFeed({ mineOnly = false }: { mineOnly?: boolean }) {
  const { user, isSuperAdmin } = useCurrentUser();
  const cache = useQueryClient();
  const uid = user?.id ?? '';
  const active = !!uid && user?.status === 'Đang hoạt động';
  const members = useQuery({
    queryKey: ['community','names',uid],
    queryFn: listCommunityMemberNames,
    enabled: active,
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const names = useMemo(()=>new Map((members.data ?? []).map(p => [p.id,p.full_name])),[members.data]);
  const nameOf = (id:string) => names.get(id) || (id === uid ? user?.fullName || 'Tôi' : 'Thành viên Sứ Việt');
  const feed = useInfiniteQuery({
    queryKey: ['community','posts',uid,mineOnly?'mine':'all'],
    initialPageParam: 0,
    enabled: active,
    queryFn: ({pageParam}) => listCommunityPosts(pageParam,mineOnly?uid:undefined),
    getNextPageParam: (last,page) => last.length===10 ? page.length : undefined,
    staleTime: 30_000,
    retry: 1,
  });
  const posts = feed.data?.pages.flat() ?? [];
  const refresh = () => void cache.invalidateQueries({ queryKey:['community'] });

  if (!active) return <div role="alert" className="mx-auto max-w-xl rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">Chỉ nhân viên đang hoạt động được truy cập Cộng đồng Sứ Việt.</div>;

  return <div className="mx-auto w-full max-w-[720px] space-y-4 pb-8">
    {!mineOnly && <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#12355c] via-[#1a5279] to-[#237980] p-5 text-white shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-100"><UsersRound className="h-4 w-4" />Chỉ dành cho nhân viên Sứ Việt</div>
      <h2 className="mt-2 text-xl font-bold text-white">Cộng đồng Sứ Việt</h2>
      <p className="mt-1 text-sm leading-6 text-blue-100">Chia sẻ chuyện công việc, thành quả và những khoảnh khắc cùng đồng nghiệp.</p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-white/85"><ShieldCheck className="h-4 w-4" />Bảng tin riêng tư, không công khai ra Internet.</div>
    </section>}
    {!mineOnly && !!uid && <CommunityComposer userId={uid} authorName={user?.fullName || 'Thành viên Sứ Việt'} moderator={isSuperAdmin} onCreated={refresh} />}
    {mineOnly && <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-bold">Bài viết của tôi</h2><Button asChild variant="outline" className="min-h-11 rounded-xl"><Link to="/community" search={{tab:"feed",thread:undefined}}>Đến cộng đồng</Link></Button></div>}
    {feed.isLoading && <div role="status" className="space-y-3"><div className="h-48 animate-pulse rounded-2xl bg-muted" /><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>}
    {feed.isError && <div role="alert" className="space-y-3 rounded-2xl border bg-card p-5 text-center"><p className="text-sm">Chưa tải được bảng tin nội bộ. Hãy kiểm tra kết nối.</p><Button variant="outline" type="button" onClick={()=>void feed.refetch()}>Thử lại</Button></div>}
    {feed.isSuccess && posts.length===0 && <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
      <Megaphone className="mx-auto h-8 w-8 text-blue-500" />
      <p className="mt-3 text-sm font-semibold">{mineOnly?'Bạn chưa đăng bài nào.':'Chưa có bài đăng nào trong cộng đồng.'}</p>
      <p className="mt-1 text-xs text-muted-foreground">{mineOnly?'Hãy chia sẻ tại bảng tin để lưu giữ những khoảnh khắc đáng nhớ.':'Hãy trở thành người đầu tiên chia sẻ với Sứ Việt.'}</p>
    </div>}
    {posts.map(post=><CommunityPostCard key={post.id} post={post} meId={uid} moderator={isSuperAdmin} nameOf={nameOf} onChange={refresh} />)}
    {feed.hasNextPage && <Button type="button" variant="outline" className="min-h-11 w-full rounded-xl" onClick={()=>void feed.fetchNextPage()} disabled={feed.isFetchingNextPage}>
      {feed.isFetchingNextPage?<LoaderCircle className="h-4 w-4 animate-spin" />:<ChevronDown className="h-4 w-4" />}
      {feed.isFetchingNextPage?'Đang tải…':'Xem thêm bài viết'}
    </Button>}
  </div>;
}
