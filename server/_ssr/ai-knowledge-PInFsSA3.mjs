import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, R as Route$1q, a as useServerFn, I as Input, B as Button } from "./router-CkmTURa-.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as extractAiPdf, d as getAiSuvietConfiguration, t as testAiSuvietConnection, s as saveAiSuvietKey } from "./assistant.functions-B6_3tk2k.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import "../_libs/seroval.mjs";
import { a5 as BookOpenText, av as PlugZap, ar as CircleCheck, aw as CircleAlert, a9 as LoaderCircle, a7 as ShieldCheck, ax as CloudUpload, ay as FileSpreadsheet, F as FileText, w as Users, az as LockKeyhole, aA as FileCheckCorner, aB as FileSearch, ap as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "node:stream";
import "../_libs/isbot.mjs";
import "./server-DpZ_OgFb.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./auth-middleware-B14nd7Va.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./auth-errors-CN_iHaBn.mjs";
import "./branding-Bpuupoin.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "./navigation-BcdDdvEu.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "./config-DnDqLpRb.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "./notifyMessage-DnoA8PJG.mjs";
import "./notifyMessage-CLuxtttz.mjs";
import "./notify-CzSXyhJl.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./storeRead-Ci9Vlcxx.mjs";
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
const db = supabase;
const AI_KNOWLEDGE_BUCKET = "suviet-ai-knowledge";
const mimes = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".csv": "text/csv",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel"
};
function knowledgeMime(filename) {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
  return mimes[ext];
}
async function docxText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const has = (offset2, magic) => offset2 >= 0 && offset2 + 4 <= bytes.length && view.getUint32(offset2, true) === magic;
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (has(i, 101010256)) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("File Word không đúng định dạng .docx.");
  const entryCount = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  let xmlBytes;
  const decoder = new TextDecoder();
  for (let i = 0; i < entryCount; i++) {
    if (!has(offset, 33639248)) throw new Error("Cấu trúc file Word không hợp lệ.");
    const method = view.getUint16(offset + 10, true), size = view.getUint32(offset + 20, true);
    const nameLen = view.getUint16(offset + 28, true), extraLen = view.getUint16(offset + 30, true), commentLen = view.getUint16(offset + 32, true);
    const local = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLen));
    if (name === "word/document.xml") {
      if (view.getUint32(offset + 24, true) > 2e6) throw new Error("Nội dung Word vượt giới hạn xử lý an toàn.");
      if (!has(local, 67324752)) throw new Error("Không đọc được nội dung Word.");
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
      if (start + size > bytes.length) throw new Error("File Word bị lỗi.");
      const compressed = bytes.slice(start, start + size);
      if (method === 0) xmlBytes = compressed;
      else if (method === 8) {
        if (typeof DecompressionStream === "undefined") throw new Error("Thiết bị chưa hỗ trợ đọc Word. Hãy thử trên Chrome hoặc cập nhật trình duyệt.");
        const decompressor = new DecompressionStream("deflate-raw");
        const stream = new Blob([compressed]).stream().pipeThrough(decompressor);
        xmlBytes = new Uint8Array(await new Response(stream).arrayBuffer());
      } else throw new Error("Định dạng nén Word chưa hỗ trợ.");
      break;
    }
    offset += 46 + nameLen + extraLen + commentLen;
  }
  if (!xmlBytes) throw new Error("Không tìm thấy nội dung văn bản trong file Word.");
  const xml = decoder.decode(xmlBytes);
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.getElementsByTagName("parsererror").length) throw new Error("Nội dung XML của Word bị lỗi.");
  const paragraphs = Array.from(document.getElementsByTagName("w:p"));
  return paragraphs.map((p) => Array.from(p.getElementsByTagName("w:t")).map((t) => t.textContent || "").join("")).filter(Boolean).join("\n");
}
async function extractKnowledgeText(file) {
  if (file.size > 6 * 1024 * 1024 || file.size <= 0) throw new Error("Tệp phải có dung lượng từ 1 byte đến 6 MB.");
  const mime = knowledgeMime(file.name);
  if (!mime) throw new Error("Chỉ hỗ trợ PDF, Word DOCX, Excel XLS/XLSX, TXT, MD hoặc CSV.");
  if (mime === "application/pdf") return "";
  let text = "";
  if (mime.startsWith("text/")) text = await file.text();
  else if (mime.includes("wordprocessingml")) text = await docxText(file);
  else {
    const XLSX = await import("../_libs/xlsx.mjs");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
    text = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      return `Bảng: ${name}
${XLSX.utils.sheet_to_csv(sheet, { blankrows: false })}`;
    }).join("\n\n");
  }
  if (text.trim().length < 8) throw new Error("Không tìm thấy đủ chữ trong tài liệu. Hãy kiểm tra tệp.");
  return text.replace(/\u0000/g, "").slice(0, 16e4);
}
async function knowledgeDocuments() {
  const { data, error } = await db.from("ai_sv_documents").select("id,title,original_name,mime_type,storage_path,visibility,status,content,indexed_at,created_at,uploaded_by").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data || [];
}
async function uploadKnowledgeDocument(file, title, uid) {
  const mime = knowledgeMime(file.name);
  if (!mime) throw new Error("Định dạng file không hỗ trợ.");
  if (title.trim().length < 2 || title.trim().length > 180) throw new Error("Tên tài liệu cần 2–180 ký tự.");
  const content = await extractKnowledgeText(file);
  const extension = file.name.toLowerCase().match(/\.[a-z0-9]{2,5}$/)?.[0] || ".txt";
  const path = `${uid}/${crypto.randomUUID()}${extension}`;
  const { error: uploadError } = await supabase.storage.from(AI_KNOWLEDGE_BUCKET).upload(path, file, { upsert: false, contentType: mime });
  if (uploadError) throw new Error(uploadError.message);
  try {
    const { data, error } = await db.from("ai_sv_documents").insert({
      title: title.trim(),
      original_name: file.name.slice(0, 200),
      mime_type: mime,
      storage_path: path,
      content,
      status: mime === "application/pdf" ? "pending" : "ready",
      visibility: "admin",
      uploaded_by: uid,
      indexed_at: mime === "application/pdf" ? null : (/* @__PURE__ */ new Date()).toISOString()
    }).select("id").single();
    if (error || !data) throw new Error(error?.message || "Chưa lưu được tài liệu.");
    return { id: data.id, requiresIndex: mime === "application/pdf" };
  } catch (e) {
    await supabase.storage.from(AI_KNOWLEDGE_BUCKET).remove([path]);
    throw e;
  }
}
async function setKnowledgeVisibility(id, visibility) {
  const { error } = await db.from("ai_sv_documents").update({ visibility, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}
async function removeKnowledgeDocument(doc) {
  const { error: storageError } = await supabase.storage.from(AI_KNOWLEDGE_BUCKET).remove([doc.storage_path]);
  if (storageError) throw new Error(storageError.message);
  const { error } = await db.from("ai_sv_documents").delete().eq("id", doc.id);
  if (error) throw new Error(error.message);
}
function err(e) {
  return e instanceof Error ? e.message : "Có lỗi kết nối, vui lòng thử lại.";
}
function KnowledgePage() {
  const {
    user,
    isSuperAdmin
  } = useCurrentUser();
  const {
    doc: focused
  } = Route$1q.useSearch();
  const uid = user?.id || "";
  const qc = useQueryClient();
  const pdfExtract = useServerFn(extractAiPdf);
  const readConfiguration = useServerFn(getAiSuvietConfiguration);
  const testConnection = useServerFn(testAiSuvietConnection);
  const saveKey = useServerFn(saveAiSuvietKey);
  const [apiKey, setApiKey] = reactExports.useState("");
  const [keyBusy, setKeyBusy] = reactExports.useState(false);
  const [testBusy, setTestBusy] = reactExports.useState(false);
  const [testMessage, setTestMessage] = reactExports.useState("");
  const [file, setFile] = reactExports.useState(null);
  const [title, setTitle] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [running, setRunning] = reactExports.useState("");
  const [expanded, setExpanded] = reactExports.useState(focused ?? null);
  const picker = reactExports.useRef(null);
  const config = useQuery({
    queryKey: ["ai-suviet", "configuration", uid],
    queryFn: () => readConfiguration(),
    enabled: !!uid && isSuperAdmin,
    staleTime: 3e4,
    retry: 1
  });
  const verifyConnection = async () => {
    if (testBusy) return;
    setTestBusy(true);
    try {
      const result = await testConnection();
      setTestMessage(result.message);
      if (result.connected) toast.success("Kết nối OpenAI đã được xác nhận.");
      else toast.error(result.message);
      void config.refetch();
    } catch (error) {
      setTestMessage(err(error));
      toast.error(err(error));
    } finally {
      setTestBusy(false);
    }
  };
  const {
    data: docs = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["ai-suviet", "documents", uid],
    queryFn: knowledgeDocuments,
    enabled: !!uid && user?.status === "Đang hoạt động",
    staleTime: 2e4,
    retry: 1
  });
  const refresh = () => void qc.invalidateQueries({
    queryKey: ["ai-suviet", "documents", uid]
  });
  const selectFile = (next) => {
    setFile(next);
    if (next) setTitle(next.name.replace(/\.[^.]+$/, "").slice(0, 180));
  };
  const upload = async (e) => {
    e.preventDefault();
    if (!file || busy || !isSuperAdmin) return;
    setBusy(true);
    try {
      const result = await uploadKnowledgeDocument(file, title, uid);
      setFile(null);
      setTitle("");
      if (picker.current) picker.current.value = "";
      refresh();
      toast.success(result.requiresIndex ? "Đã lưu PDF riêng tư. Chọn “Đọc PDF” để xử lý nội dung." : "Đã thêm tài liệu. Mặc định chỉ quản trị viên xem.");
    } catch (error) {
      toast.error(err(error));
    } finally {
      setBusy(false);
    }
  };
  const doExtract = async (d) => {
    setRunning(d.id);
    try {
      await pdfExtract({
        data: {
          id: d.id
        }
      });
      refresh();
      toast.success("Đã trích xuất nội dung PDF.");
    } catch (error) {
      toast.error(err(error));
    } finally {
      setRunning("");
    }
  };
  const toggle = async (d) => {
    setRunning(d.id);
    try {
      await setKnowledgeVisibility(d.id, d.visibility === "company" ? "admin" : "company");
      refresh();
      toast.success(d.visibility === "company" ? "Đã chuyển tài liệu về chỉ quản trị." : "Đã chia sẻ nội dung tài liệu cho nhân viên.");
    } catch (error) {
      toast.error(err(error));
    } finally {
      setRunning("");
    }
  };
  const remove = async (d) => {
    if (!window.confirm(`Xóa vĩnh viễn tài liệu “${d.title}” khỏi kho AI?`)) return;
    setRunning(d.id);
    try {
      await removeKnowledgeDocument(d);
      refresh();
      toast.success("Đã xóa tài liệu.");
    } catch (error) {
      toast.error(err(error));
    } finally {
      setRunning("");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-4xl space-y-5 pb-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "rounded-2xl border bg-gradient-to-br from-blue-50 to-teal-50 p-5 dark:from-slate-900 dark:to-teal-950", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpenText, { className: "h-5 w-5" }),
        " AI Sứ Việt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-xl font-bold", children: "Kho kiến thức AI" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm leading-6 text-muted-foreground", children: "Tài liệu hướng dẫn và quy trình để Đốm trả lời đúng thông tin. Tệp gốc luôn riêng tư; chỉ nội dung được quản trị viên chia sẻ mới được nhân viên dùng để hỏi đáp." })
    ] }),
    isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-2xl border bg-card p-4 shadow-sm", "aria-label": "Trạng thái kết nối AI", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-blue-50 p-2.5 text-blue-700 dark:bg-slate-800 dark:text-blue-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlugZap, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Kết nối OpenAI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Chỉ Super Admin được thay khóa. Khóa được mã hóa trong kho bí mật máy chủ và không hiển thị lại sau khi lưu." })
        ] })
      ] }),
      config.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-xs text-muted-foreground", children: "Đang kiểm tra cấu hình máy chủ…" }),
      config.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-xs text-rose-600", children: "Chưa đọc được cấu hình. Kiểm tra kết nối tài khoản quản trị." }),
      config.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        config.data.configured ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
          "Đã nhận API Key — chưa xác minh kết nối"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
          "Chưa thêm API Key"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground", children: [
          "Model: ",
          config.data.model
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-3 rounded-xl border p-3", autoComplete: "off", onSubmit: async (e) => {
        e.preventDefault();
        if (keyBusy || !apiKey.trim()) return;
        setKeyBusy(true);
        try {
          await saveKey({
            data: {
              key: apiKey.trim()
            }
          });
          setApiKey("");
          setTestMessage("");
          await config.refetch();
          toast.success("Đã lưu API Key. Bấm Kiểm tra kết nối để xác minh.");
        } catch (error) {
          toast.error(err(error));
        } finally {
          setKeyBusy(false);
        }
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "ai-provider-key", className: "text-sm font-medium", children: "OpenAI API Key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "ai-provider-key", type: "password", autoComplete: "new-password", spellCheck: false, maxLength: 500, value: apiKey, onChange: (e) => setApiKey(e.target.value), placeholder: config.data?.configured ? "Nhập key mới để thay key hiện tại" : "Dán API Key bắt đầu bằng sk-…", className: "min-h-11 text-base", disabled: keyBusy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-5 text-muted-foreground", children: "Để trống sẽ giữ nguyên key hiện tại. Lưu xong có thể dùng ngay, không cần Publish lại." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: keyBusy || apiKey.trim().length < 20, className: "min-h-11 rounded-xl", children: keyBusy ? "Đang lưu…" : config.data?.configured ? "Thay API Key" : "Lưu API Key" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", type: "button", variant: "outline", className: "min-h-10 rounded-xl", onClick: () => void verifyConnection(), disabled: !config.data?.configured || testBusy, children: [
          testBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
          "Kiểm tra kết nối"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "min-h-10", onClick: () => {
          setTestMessage("");
          void config.refetch();
        }, children: "Làm mới trạng thái" })
      ] }),
      !!testMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "rounded-xl bg-muted px-3 py-2 text-xs", children: testMessage })
    ] }),
    isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => void upload(e), className: "space-y-3 rounded-2xl border bg-card p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: "Tải tài liệu lên" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hỗ trợ PDF, Word DOCX, Excel XLS/XLSX, TXT, MD, CSV · tối đa 6 MB mỗi tệp. Tài liệu mặc định chỉ quản trị viên được xem." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: picker, className: "block w-full max-w-full text-sm", type: "file", accept: ".pdf,.docx,.xlsx,.xls,.txt,.md,.csv", onChange: (e) => selectFile(e.target.files?.[0] ?? null), "aria-label": "Chọn tài liệu" }),
      file && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, maxLength: 180, onChange: (e) => setTitle(e.target.value), placeholder: "Tên tài liệu", className: "min-h-11 text-base" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: !file || busy || title.trim().length < 2, className: "min-h-11 rounded-xl bg-blue-700 text-white hover:bg-blue-800", children: [
        busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "h-4 w-4" }),
        busy ? "Đang tải…" : "Thêm vào kho"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Tài liệu hiện có" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", type: "button", onClick: () => void refetch(), children: "Làm mới" })
      ] }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-sm text-muted-foreground", children: "Đang tải kho tài liệu…" }),
      isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "rounded-xl border p-4 text-sm", children: "Chưa tải được tài liệu, hãy kiểm tra kết nối hoặc quyền truy cập." }),
      !isLoading && !isError && docs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground", children: "Chưa có tài liệu nào được chia sẻ với bạn." }),
      docs.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { id: `doc-${d.id}`, className: "space-y-3 rounded-2xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-xl bg-blue-50 p-2.5 text-blue-700 dark:bg-slate-800 dark:text-blue-200", children: d.mime_type.includes("sheet") || d.mime_type.includes("excel") ? /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "break-words text-sm font-semibold", children: d.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 break-all text-xs text-muted-foreground", children: d.original_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-2 text-[11px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 ${d.status === "ready" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`, children: d.status === "ready" ? "Đã đọc nội dung" : "Chưa xử lý nội dung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-full bg-muted px-2 py-0.5", children: [
                d.visibility === "company" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LockKeyhole, { className: "h-3 w-3" }),
                d.visibility === "company" ? "Nhân viên" : "Chỉ quản trị"
              ] })
            ] })
          ] })
        ] }),
        d.status === "ready" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", type: "button", className: "rounded-lg text-xs", onClick: () => setExpanded((v) => v === d.id ? null : d.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheckCorner, { className: "h-4 w-4" }),
            expanded === d.id ? "Ẩn nội dung" : "Xem nội dung đã đọc"
          ] }),
          expanded === d.id && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted p-3 font-sans text-xs leading-5", children: d.content.slice(0, 12e3) })
        ] }),
        isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 border-t pt-3", children: [
          d.mime_type === "application/pdf" && d.status !== "ready" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", type: "button", variant: "outline", disabled: !!running, onClick: () => void doExtract(d), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileSearch, { className: "h-4 w-4" }),
            running === d.id ? "Đang đọc…" : "Đọc PDF"
          ] }),
          d.status === "ready" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", type: "button", variant: "outline", disabled: !!running, onClick: () => void toggle(d), children: [
            d.visibility === "company" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LockKeyhole, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
            d.visibility === "company" ? "Chỉ quản trị" : "Chia sẻ cho nhân viên"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", type: "button", variant: "ghost", className: "text-rose-600", disabled: !!running, onClick: () => void remove(d), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
            "Xóa"
          ] })
        ] })
      ] }, d.id))
    ] })
  ] });
}
export {
  KnowledgePage as component
};
