import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
const BUCKET = "order-quotes";
export const MAX_IMG = 10 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

export type ListParams = { page: number; size: number; tab: "all" | "price" | "progress"; q?: string; status?: string; creator?: string; assignee?: string; from?: string; to?: string };

async function rpc<T = any>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const oqApi = {
  async save(id: string | null, data: any) { const rid = await rpc<string>("oq_save", { _id: id, _data: data }); void oqApi.flushCleanup(); return rid; },
  async deleteDraft(id: string) { await rpc("oq_delete_draft", { _id: id }); await oqApi.flushCleanup(); },
  submit: (id: string) => rpc<string>("oq_submit", { _id: id }),
  assignees: (kind: "price" | "progress") => rpc<{ id: string; full_name: string }[]>("oq_assignees", { _kind: kind }),
  accept: (flow: string) => rpc("oq_accept", { _flow: flow }),
  saveResponse: (flow: string, target: string, content: any) => rpc("oq_save_response", { _flow: flow, _target: target, _content: content }),
  publish: (flow: string, target: string, content: any) => rpc<number>("oq_publish_response", { _flow: flow, _target: target, _content: content }),
  complete: (flow: string) => rpc("oq_complete", { _flow: flow }),
  missing: (flow: string) => rpc<string[]>("oq_missing", { _flow: flow }),
  requestInfo: (flow: string, q: string) => rpc("oq_request_info", { _flow: flow, _question: q }),
  answerInfo: (flow: string, a: string) => rpc("oq_answer_info", { _flow: flow, _answer: a }),
  reask: (flow: string, note: string, config: any, snapshot: any) => rpc<number>("oq_reask", { _flow: flow, _note: note, _config: config, _snapshot: snapshot }),
  reassign: (flow: string, user: string) => rpc("oq_reassign", { _flow: flow, _user: user }),
  setChoice: (item: string, choice: string | null) => rpc("oq_set_choice", { _item: item, _choice: choice }),
  cancel: (id: string, flow: string | null, reason: string) => rpc("oq_cancel", { _id: id, _flow: flow, _reason: reason }),
  comment: (flow: string, text: string) => rpc("oq_comment", { _flow: flow, _text: text }),

  /** Danh sách có phân trang + lọc tại máy chủ; không tải phản hồi/ảnh. */
  async list(p: ListParams) {
    const flowSel = "id,request_id,kind,code,assignee_id,status,waiting_info,current_round,updated_at";
    const needFlowFilter = p.tab !== "all" || (p.status && !["draft", "cancelled"].includes(p.status)) || !!p.assignee;
    let q = db.from("oq_requests")
      .select(`id,code,title,order_type,status,creator_id,want_price,want_progress,created_at,submitted_at,updated_at,oq_items(count),flows:oq_flows(${flowSel})${needFlowFilter ? ",ff:oq_flows!inner(id)" : ""}`, { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(p.page * p.size, p.page * p.size + p.size - 1);
    const s = p.q?.trim().replace(/[%,()]/g, " ");
    if (s) q = q.or(`title.ilike.%${s}%,code.ilike.%${s}%`);
    if (p.creator) q = q.eq("creator_id", p.creator);
    if (p.from) q = q.gte("created_at", `${p.from}T00:00:00+07:00`);
    if (p.to) q = q.lte("created_at", `${p.to}T23:59:59.999+07:00`);
    if (p.status === "draft" || p.status === "cancelled") q = q.eq("status", p.status);
    if (p.tab !== "all") q = q.eq("ff.kind", p.tab);
    if (p.assignee) q = q.eq("ff.assignee_id", p.assignee);
    if (p.status === "waiting") q = q.eq("ff.waiting_info", true).eq("ff.status", "processing");
    else if (p.status && !["draft", "cancelled"].includes(p.status)) q = q.eq("ff.status", p.status);
    const { data, error, count } = await q;
    if (error) throw new Error(error.message);
    return { requests: (data ?? []) as any[], total: count ?? 0 };
  },

  async people() {
    const { data, error } = await db.from("oq_flows").select("assignee_id");
    if (error) throw new Error(error.message);
    const r = await db.from("oq_requests").select("creator_id");
    if (r.error) throw new Error(r.error.message);
    return { a: [...new Set((data ?? []).map((x: any) => x.assignee_id))] as string[], c: [...new Set((r.data ?? []).map((x: any) => x.creator_id))] as string[] };
  },

  async detail(id: string) {
    const chk = (r: any, what: string) => { if (r.error) throw new Error(`Không tải được ${what}: ${r.error.message}`); return r.data ?? []; };
    const { data: req, error } = await db.from("oq_requests").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!req) return null;
    const [items, images, flows, events] = await Promise.all([
      db.from("oq_items").select("*").eq("request_id", id).order("position"),
      db.from("oq_item_images").select("*").eq("request_id", id).order("created_at"),
      db.from("oq_flows").select("*").eq("request_id", id).order("kind"),
      db.from("oq_events").select("*").eq("request_id", id).order("created_at"),
    ]);
    const flowIds = (flows.data ?? []).map((f: any) => f.id);
    const [rounds, resps, infos] = flowIds.length
      ? await Promise.all([
          db.from("oq_rounds").select("*").in("flow_id", flowIds).order("no"),
          db.from("oq_responses").select("*").in("flow_id", flowIds).order("created_at"),
          db.from("oq_info_requests").select("*").in("flow_id", flowIds).order("asked_at"),
        ])
      : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];
    chk(flows, "luồng xử lý");
    return { req, items: chk(items, "sản phẩm"), images: chk(images, "ảnh"), flows: chk(flows, "luồng xử lý"), events: chk(events, "lịch sử"), rounds: chk(rounds, "lượt xử lý"), resps: chk(resps, "phản hồi"), infos: chk(infos, "yêu cầu bổ sung") };
  },

  async uploadImage(requestId: string, itemId: string, file: File, category: string, caption: string) {
    if (!OK_TYPES.includes(file.type)) throw new Error("Chỉ nhận ảnh JPG, PNG, WEBP, GIF, HEIC.");
    if (file.size > MAX_IMG) throw new Error("Ảnh vượt quá 10 MB.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${requestId}/${itemId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (up.error) throw new Error(up.error.message);
    try { return await rpc<string>("oq_image_add", { _item: itemId, _path: path, _category: category, _caption: caption }); }
    catch (e) { await supabase.storage.from(BUCKET).remove([path]); throw e; }
  },
  updateImage: (id: string, category: string, caption: string) => rpc("oq_image_update", { _id: id, _category: category, _caption: caption, _delete: false }),
  async deleteImage(id: string) {
    await rpc<string>("oq_image_update", { _id: id, _category: null, _caption: null, _delete: true });
    await oqApi.flushCleanup();
  },
  /** Ảnh bổ sung khi Cung ứng yêu cầu: gắn đúng lần bổ sung, luồng, lượt, sản phẩm. */
  async uploadInfoImage(requestId: string, infoId: string, itemId: string, file: File, category: string, caption: string) {
    if (!OK_TYPES.includes(file.type)) throw new Error("Chỉ nhận ảnh JPG, PNG, WEBP, GIF, HEIC.");
    if (file.size > MAX_IMG) throw new Error("Ảnh vượt quá 10 MB.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${requestId}/${itemId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (up.error) throw new Error(up.error.message);
    try { return await rpc<string>("oq_info_image_add", { _info: infoId, _item: itemId, _path: path, _category: category, _caption: caption }); }
    catch (e) { await supabase.storage.from(BUCKET).remove([path]); throw e; }
  },
  async deleteInfoImage(id: string) { await rpc("oq_info_image_delete", { _id: id }); await oqApi.flushCleanup(); },
  /** Xóa file vật lý của ảnh không còn bản ghi nào dùng; lỗi được ghi lại để thử lại lần sau. */
  async flushCleanup() {
    try {
      const paths = (await rpc<string[]>("oq_cleanup_pending", {})) ?? [];
      if (!paths.length) return;
      const { error } = await supabase.storage.from(BUCKET).remove(paths);
      await rpc("oq_cleanup_done", { _paths: paths, _error: error ? error.message : null });
    } catch { /* sẽ thử lại ở lần sau */ }
  },
  async signedUrls(paths: string[]) {
    if (!paths.length) return {} as Record<string, string>;
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
    return Object.fromEntries((data ?? []).filter((x) => x.signedUrl).map((x) => [x.path!, x.signedUrl]));
  },
};
