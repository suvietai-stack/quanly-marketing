import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as chipiAssets } from "./states-C0pL4afS.mjs";
import { u as useQueryClient, a as useQuery, c as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, B as Button } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { l as listCommunityMemberNames, a as listCommunityPosts, c as createCommunityPost, v as validateCommunityFiles, C as COMMUNITY_BUCKET, b as listCommunityComments, d as deleteCommunityComment, e as addCommunityComment, f as editCommunityPost, p as pinCommunityPost, g as deleteCommunityPost, t as toggleCommunityLike } from "./api-DcMIOSaq.mjs";
import { aF as UsersRound, a7 as ShieldCheck, O as Megaphone, a9 as LoaderCircle, n as ChevronDown, X, aG as ImagePlus, ad as Send, h as Pin, ao as Pencil, ap as Trash2, aH as Heart, aI as MessageCircle, aJ as Play } from "../_libs/lucide-react.mjs";
function shortTime(iso) {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}
function errorText(e) {
  return e instanceof Error ? e.message : "Có lỗi kết nối. Vui lòng thử lại.";
}
function InitialAvatar({ name, size = "md" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: `flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 font-bold text-blue-800 dark:from-blue-900 dark:to-teal-950 dark:text-blue-100 ${size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm"}`, children: name.trim().slice(0, 2).toUpperCase() || "SV" });
}
function PrivateMedia({ media }) {
  const element = reactExports.useRef(null);
  const [visible, setVisible] = reactExports.useState(false);
  const [requested, setRequested] = reactExports.useState(false);
  const [objectUrl, setObjectUrl] = reactExports.useState("");
  const [failure, setFailure] = reactExports.useState(false);
  const shouldLoad = media.kind === "image" ? visible : requested;
  reactExports.useEffect(() => {
    if (media.kind === "video") return;
    const node = element.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [media.path, media.kind]);
  reactExports.useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    let url = "";
    setFailure(false);
    void supabase.storage.from(COMMUNITY_BUCKET).download(media.path).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data) {
        setFailure(true);
        return;
      }
      url = URL.createObjectURL(data);
      setObjectUrl(url);
    }).catch(() => {
      if (!cancelled) setFailure(true);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      setObjectUrl("");
    };
  }, [media.path, shouldLoad]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: element, className: "relative min-h-36 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800", children: failure ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-36 items-center justify-center px-3 text-center text-xs text-muted-foreground", children: "Không tải được tệp. Hãy thử lại." }) : media.kind === "video" ? objectUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { controls: true, playsInline: true, preload: "metadata", src: objectUrl, className: "max-h-96 w-full rounded-xl bg-black", "aria-label": "Video nội bộ" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setRequested(true), disabled: requested, className: "flex min-h-40 w-full flex-col items-center justify-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200", children: [
    requested ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-7 w-7" }),
    requested ? "Đang tải video riêng tư…" : "Chạm để xem video"
  ] }) : objectUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: objectUrl, alt: "Ảnh chia sẻ trong Cộng đồng Sứ Việt", loading: "lazy", className: "max-h-[440px] w-full object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "status", className: "flex min-h-40 items-center justify-center text-xs text-muted-foreground", children: "Đang tải ảnh…" }) });
}
function CommunityComposer({ userId, authorName, moderator, onCreated }) {
  const [body, setBody] = reactExports.useState("");
  const [publisher, setPublisher] = reactExports.useState("self");
  const publication = reactExports.useRef({ signature: "", id: crypto.randomUUID() });
  const asDom = moderator && publisher === "dom";
  const [files, setFiles] = reactExports.useState([]);
  const [busy, setBusy] = reactExports.useState(false);
  const picker = reactExports.useRef(null);
  const choose = (chosen) => {
    if (!chosen) return;
    const next = [...files, ...Array.from(chosen)];
    try {
      validateCommunityFiles(next);
      setFiles(next);
    } catch (err) {
      toast.error(errorText(err));
    }
    if (picker.current) picker.current.value = "";
  };
  const publish = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!body.trim()) {
      toast.error("Hãy viết vài dòng để chia sẻ với đồng nghiệp.");
      return;
    }
    if (body.trim().length > 5e3) {
      toast.error("Bài đăng tối đa 5.000 ký tự.");
      return;
    }
    setBusy(true);
    try {
      const signature = JSON.stringify([userId, body.trim(), asDom, files.map((f) => [f.name, f.size, f.lastModified])]);
      if (publication.current.signature !== signature) publication.current = { signature, id: crypto.randomUUID() };
      await createCommunityPost(body, files, userId, asDom ? "dom" : "self", publication.current.id);
      setBody("");
      setFiles([]);
      publication.current = { signature: "", id: crypto.randomUUID() };
      onCreated();
      toast.success("Đã chia sẻ với Cộng đồng Sứ Việt.");
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: publish, className: "overflow-hidden rounded-2xl border bg-card p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      asDom ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: chipiAssets.hello.url, alt: "Đốm", width: 44, height: 44, className: "h-11 w-11 shrink-0 object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(InitialAvatar, { name: authorName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        moderator ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-2 block text-xs text-muted-foreground", children: [
          "Đăng với tên",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { "aria-label": "Danh tính đăng bài", disabled: busy, value: publisher, onChange: (e) => setPublisher(e.target.value), className: "mt-1 min-h-11 w-full rounded-xl border bg-background px-3 text-sm font-semibold text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "self", children: authorName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "dom", children: "Đốm - AI Sứ Việt" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm font-semibold", children: authorName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, maxLength: 5e3, value: body, onChange: (e) => setBody(e.target.value), placeholder: "Hôm nay bạn muốn chia sẻ điều gì với Sứ Việt?", className: "min-h-24 resize-y rounded-xl border-slate-200 bg-slate-50 text-base dark:bg-slate-900" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1 block text-right text-[11px] text-muted-foreground", children: [
          body.length,
          "/5000"
        ] })
      ] })
    ] }),
    files.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2 rounded-xl bg-muted/50 p-2.5", children: files.map((file, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 truncate", children: [
        file.type.startsWith("video/") ? "🎬" : "🖼️",
        " ",
        file.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "h-8 w-8 shrink-0", "aria-label": `Gỡ ${file.name}`, onClick: () => setFiles((prev) => prev.filter((_, i) => i !== index)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }, `${file.name}-${index}`)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-2 border-t pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", multiple: true, accept: "image/jpeg,image/png,image/webp,video/mp4,video/webm", className: "hidden", ref: picker, onChange: (e) => choose(e.target.files), "aria-label": "Chọn ảnh hoặc video" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", className: "min-h-11 rounded-xl text-emerald-700 dark:text-emerald-300", onClick: () => picker.current?.click(), disabled: busy, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-4 w-4" }),
        "Ảnh / video"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "min-h-11 rounded-xl bg-blue-700 px-5 text-white hover:bg-blue-800", disabled: busy || !body.trim(), children: [
        busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
        busy ? "Đang đăng…" : asDom ? "Đốm đăng bài" : "Đăng bài"
      ] })
    ] })
  ] });
}
function Comments({ post, nameOf, meId, moderator, onChange }) {
  const cache = useQueryClient();
  const [input, setInput] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const comments = useQuery({ queryKey: ["community", "comments", meId, post.id], queryFn: () => listCommunityComments(post.id), staleTime: 2e4, retry: 1 });
  const reply = async (e) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    setBusy(true);
    try {
      await addCommunityComment(post.id, input);
      setInput("");
      await cache.invalidateQueries({ queryKey: ["community", "comments", meId, post.id] });
      onChange();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await deleteCommunityComment(id);
      await cache.invalidateQueries({ queryKey: ["community", "comments", meId, post.id] });
      onChange();
    } catch (err) {
      toast.error(errorText(err));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t bg-slate-50/70 p-3 dark:bg-slate-900/50", children: [
    comments.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-xs text-muted-foreground", children: "Đang tải bình luận…" }),
    comments.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", type: "button", onClick: () => void comments.refetch(), children: "Chưa tải được bình luận · Thử lại" }),
    comments.data?.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InitialAvatar, { name: nameOf(comment.author_id), size: "sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 rounded-xl bg-white px-3 py-2 dark:bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-xs", children: nameOf(comment.author_id) }),
          (comment.author_id === meId || moderator) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Xóa bình luận", className: "text-muted-foreground", onClick: () => void remove(comment.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap break-words text-sm", children: comment.body }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-[10px] text-muted-foreground", children: shortTime(comment.created_at) })
      ] })
    ] }, comment.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: reply, className: "flex items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 1, maxLength: 1e3, placeholder: "Viết bình luận…", value: input, onChange: (e) => setInput(e.target.value), className: "min-h-11 resize-none rounded-xl text-base" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", className: "h-11 w-11 shrink-0 rounded-xl", disabled: !input.trim() || busy, "aria-label": "Gửi bình luận", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
    ] }),
    comments.data && comments.data.length === 100 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hiển thị 100 bình luận đầu tiên." })
  ] });
}
function CommunityPostCard({ post, meId, moderator, nameOf, onChange }) {
  const [commentsOpen, setCommentsOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState(post.body);
  const [busy, setBusy] = reactExports.useState(false);
  const liked = post.community_likes.some((l) => l.user_id === meId);
  const owner = post.author_id === meId;
  const mascot = post.community_mascot_posts?.mascot === "dom";
  const doAction = async (action, success) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      if (success) toast.success(success);
      onChange();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "overflow-hidden rounded-2xl border bg-card shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4 pb-2", children: [
      mascot ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: chipiAssets.hello.url, alt: "Đốm", width: 44, height: 44, className: "h-11 w-11 shrink-0 object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(InitialAvatar, { name: nameOf(post.author_id) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "break-words text-sm font-bold", children: mascot ? "Đốm - AI Sứ Việt" : nameOf(post.author_id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-muted-foreground", children: [
          shortTime(post.created_at),
          " · Nội bộ Sứ Việt"
        ] })
      ] }),
      post.is_pinned && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3 w-3" }),
        "Ghim"
      ] })
    ] }),
    editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 px-4 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: draft, maxLength: 5e3, onChange: (e) => setDraft(e.target.value), rows: 3, className: "text-base" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setEditing(false), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", disabled: !draft.trim() || busy, onClick: () => void doAction(async () => {
          await editCommunityPost(post.id, draft);
          setEditing(false);
        }, "Đã cập nhật bài viết."), children: "Lưu" })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words px-4 pb-3 pt-2 text-[14px] leading-6", children: post.body }),
    post.community_media.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid gap-1 px-3 pb-3 ${post.community_media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`, children: post.community_media.map((media) => /* @__PURE__ */ jsxRuntimeExports.jsx(PrivateMedia, { media }, media.id)) }),
    (owner || moderator) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-end gap-1 border-t px-3 py-1", children: [
      owner && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "h-9 text-xs", type: "button", onClick: () => {
        setDraft(post.body);
        setEditing(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
        "Sửa"
      ] }),
      moderator && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", type: "button", disabled: busy, className: "h-9 text-xs", onClick: () => void doAction(() => pinCommunityPost(post.id, !post.is_pinned)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3.5 w-3.5" }),
        post.is_pinned ? "Bỏ ghim" : "Ghim"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", type: "button", disabled: busy, className: "h-9 text-xs text-rose-700", onClick: () => {
        if (window.confirm("Bạn chắc chắn muốn xóa bài viết này?")) void doAction(() => deleteCommunityPost(post), "Đã xóa bài viết.");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
        "Xóa"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        post.community_likes.length,
        " lượt thích"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        post.community_comments.length,
        " bình luận"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 border-t p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", type: "button", disabled: busy, className: `min-h-11 rounded-xl ${liked ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : ""}`, onClick: () => void doAction(() => toggleCommunityLike(post.id, meId, liked)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `h-4 w-4 ${liked ? "fill-current" : ""}` }),
        liked ? "Đã thích" : "Thích"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", type: "button", className: "min-h-11 rounded-xl", onClick: () => setCommentsOpen((v) => !v), "aria-expanded": commentsOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
        "Bình luận"
      ] })
    ] }),
    commentsOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Comments, { post, nameOf, meId, moderator, onChange })
  ] });
}
function CommunityFeed({ mineOnly = false }) {
  const { user, isSuperAdmin } = useCurrentUser();
  const cache = useQueryClient();
  const uid = user?.id ?? "";
  const active = !!uid && user?.status === "Đang hoạt động";
  const members = useQuery({
    queryKey: ["community", "names", uid],
    queryFn: listCommunityMemberNames,
    enabled: active,
    staleTime: 5 * 6e4,
    retry: 1
  });
  const names = reactExports.useMemo(() => new Map((members.data ?? []).map((p) => [p.id, p.full_name])), [members.data]);
  const nameOf = (id) => names.get(id) || (id === uid ? user?.fullName || "Tôi" : "Thành viên Sứ Việt");
  const feed = useInfiniteQuery({
    queryKey: ["community", "posts", uid, mineOnly ? "mine" : "all"],
    initialPageParam: 0,
    enabled: active,
    queryFn: ({ pageParam }) => listCommunityPosts(pageParam, mineOnly ? uid : void 0),
    getNextPageParam: (last, page) => last.length === 10 ? page.length : void 0,
    staleTime: 3e4,
    retry: 1
  });
  const posts = feed.data?.pages.flat() ?? [];
  const refresh = () => void cache.invalidateQueries({ queryKey: ["community"] });
  if (!active) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mx-auto max-w-xl rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground", children: "Chỉ nhân viên đang hoạt động được truy cập Cộng đồng Sứ Việt." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-[720px] space-y-4 pb-8", children: [
    !mineOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl bg-gradient-to-r from-[#12355c] via-[#1a5279] to-[#237980] p-5 text-white shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "h-4 w-4" }),
        "Chỉ dành cho nhân viên Sứ Việt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-xl font-bold text-white", children: "Cộng đồng Sứ Việt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm leading-6 text-blue-100", children: "Chia sẻ chuyện công việc, thành quả và những khoảnh khắc cùng đồng nghiệp." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 text-[11px] text-white/85", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
        "Bảng tin riêng tư, không công khai ra Internet."
      ] })
    ] }),
    !mineOnly && !!uid && /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityComposer, { userId: uid, authorName: user?.fullName || "Thành viên Sứ Việt", moderator: isSuperAdmin, onCreated: refresh }),
    mineOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Bài viết của tôi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/community", search: { tab: "feed", thread: void 0 }, children: "Đến cộng đồng" }) })
    ] }),
    feed.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "status", className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 animate-pulse rounded-2xl bg-muted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 animate-pulse rounded-2xl bg-muted" })
    ] }),
    feed.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-3 rounded-2xl border bg-card p-5 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Chưa tải được bảng tin nội bộ. Hãy kiểm tra kết nối." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", type: "button", onClick: () => void feed.refetch(), children: "Thử lại" })
    ] }),
    feed.isSuccess && posts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "mx-auto h-8 w-8 text-blue-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-semibold", children: mineOnly ? "Bạn chưa đăng bài nào." : "Chưa có bài đăng nào trong cộng đồng." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: mineOnly ? "Hãy chia sẻ tại bảng tin để lưu giữ những khoảnh khắc đáng nhớ." : "Hãy trở thành người đầu tiên chia sẻ với Sứ Việt." })
    ] }),
    posts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityPostCard, { post, meId: uid, moderator: isSuperAdmin, nameOf, onChange: refresh }, post.id)),
    feed.hasNextPage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "min-h-11 w-full rounded-xl", onClick: () => void feed.fetchNextPage(), disabled: feed.isFetchingNextPage, children: [
      feed.isFetchingNextPage ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }),
      feed.isFetchingNextPage ? "Đang tải…" : "Xem thêm bài viết"
    ] })
  ] });
}
export {
  CommunityFeed as C
};
