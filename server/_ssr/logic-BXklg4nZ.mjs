import { s as supabase } from "./client-DfPXH9B8.mjs";
const db = supabase;
const BUCKET = "order-quotes";
const MAX_IMG = 10 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
async function rpc(fn, args) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
}
const oqApi = {
  async save(id, data) {
    const rid = await rpc("oq_save", { _id: id, _data: data });
    void oqApi.flushCleanup();
    return rid;
  },
  async deleteDraft(id) {
    await rpc("oq_delete_draft", { _id: id });
    await oqApi.flushCleanup();
  },
  async deleteCancelled(id) {
    await rpc("oq_delete_cancelled", { _id: id });
    await oqApi.flushCleanup();
  },
  submit: (id) => rpc("oq_submit", { _id: id }),
  assignees: (kind) => rpc("oq_assignees", { _kind: kind }),
  accept: (flow) => rpc("oq_accept", { _flow: flow }),
  saveResponse: (flow, target, content) => rpc("oq_save_response", { _flow: flow, _target: target, _content: content }),
  publish: (flow, target, content) => rpc("oq_publish_response", { _flow: flow, _target: target, _content: content }),
  complete: (flow) => rpc("oq_complete", { _flow: flow }),
  missing: (flow) => rpc("oq_missing", { _flow: flow }),
  requestInfo: (flow, q) => rpc("oq_request_info", { _flow: flow, _question: q }),
  answerInfo: (flow, a) => rpc("oq_answer_info", { _flow: flow, _answer: a }),
  reask: (flow, note, config, snapshot) => rpc("oq_reask", { _flow: flow, _note: note, _config: config, _snapshot: snapshot }),
  reassign: (flow, user) => rpc("oq_reassign", { _flow: flow, _user: user }),
  setChoice: (item, choice) => rpc("oq_set_choice", { _item: item, _choice: choice }),
  cancel: (id, flow, reason) => rpc("oq_cancel", { _id: id, _flow: flow, _reason: reason }),
  comment: (flow, text) => rpc("oq_comment", { _flow: flow, _text: text }),
  /** Báo cáo: máy chủ kiểm quyền (report_own/report_all/report_export) và tính thời lượng. */
  report: (from, to, basis, exp = false) => rpc("oq_report_rows", { _from: from, _to: to, _basis: basis, _export: exp }),
  /** Thời gian từng lượt của các luồng người dùng được xem (cùng công thức với báo cáo). */
  jobTimes: (flows) => flows.length ? rpc("oq_job_times", { _flows: flows }) : Promise.resolve([]),
  /** Danh sách có phân trang + lọc tại máy chủ; không tải phản hồi/ảnh. */
  async list(p) {
    const { data, error, count } = await listQuery(p, false);
    if (error) throw new Error(error.message);
    return { requests: data ?? [], total: count ?? 0 };
  },
  /** Số yêu cầu theo từng trạng thái, cùng bộ lọc và phạm vi quyền (RLS) với danh sách. */
  async counts(p) {
    const keys = ["", ...LIST_STATUSES.map((s) => s.value)];
    const res = await Promise.all(keys.map((k) => listQuery({ ...p, page: 0, size: 1, status: k || void 0 }, true)));
    const out = {};
    res.forEach((r, i) => {
      if (r.error) throw new Error(r.error.message);
      out[keys[i] || "all"] = r.count ?? 0;
    });
    return out;
  },
  async people() {
    const { data, error } = await db.from("oq_flows").select("assignee_id");
    if (error) throw new Error(error.message);
    const r = await db.from("oq_requests").select("creator_id");
    if (r.error) throw new Error(r.error.message);
    return { a: [...new Set((data ?? []).map((x) => x.assignee_id))], c: [...new Set((r.data ?? []).map((x) => x.creator_id))] };
  },
  async detail(id) {
    const chk = (r, what) => {
      if (r.error) throw new Error(`Không tải được ${what}: ${r.error.message}`);
      return r.data ?? [];
    };
    const { data: req, error } = await db.from("oq_requests").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!req) return null;
    const [items, images, flows, events] = await Promise.all([
      db.from("oq_items").select("*").eq("request_id", id).order("position"),
      db.from("oq_item_images").select("*").eq("request_id", id).order("created_at"),
      db.from("oq_flows").select("*").eq("request_id", id).order("kind"),
      db.from("oq_events").select("*").eq("request_id", id).order("created_at")
    ]);
    const flowIds = (flows.data ?? []).map((f) => f.id);
    const [rounds, resps, infos] = flowIds.length ? await Promise.all([
      db.from("oq_rounds").select("*").in("flow_id", flowIds).order("no"),
      db.from("oq_responses").select("*").in("flow_id", flowIds).order("created_at"),
      db.from("oq_info_requests").select("*").in("flow_id", flowIds).order("asked_at")
    ]) : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];
    chk(flows, "luồng xử lý");
    return { req, items: chk(items, "sản phẩm"), images: chk(images, "ảnh"), flows: chk(flows, "luồng xử lý"), events: chk(events, "lịch sử"), rounds: chk(rounds, "lượt xử lý"), resps: chk(resps, "phản hồi"), infos: chk(infos, "yêu cầu bổ sung") };
  },
  async uploadImage(requestId, itemId, file, category, caption) {
    if (!OK_TYPES.includes(file.type)) throw new Error("Chỉ nhận ảnh JPG, PNG, WEBP, GIF, HEIC.");
    if (file.size > MAX_IMG) throw new Error("Ảnh vượt quá 10 MB.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${requestId}/${itemId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (up.error) throw new Error(up.error.message);
    try {
      return await rpc("oq_image_add", { _item: itemId, _path: path, _category: category, _caption: caption });
    } catch (e) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw e;
    }
  },
  updateImage: (id, category, caption) => rpc("oq_image_update", { _id: id, _category: category, _caption: caption, _delete: false }),
  async deleteImage(id) {
    await rpc("oq_image_update", { _id: id, _category: null, _caption: null, _delete: true });
    await oqApi.flushCleanup();
  },
  /** Ảnh bổ sung khi Cung ứng yêu cầu: gắn đúng lần bổ sung, luồng, lượt, sản phẩm. */
  async uploadInfoImage(requestId, infoId, itemId, file, category, caption) {
    if (!OK_TYPES.includes(file.type)) throw new Error("Chỉ nhận ảnh JPG, PNG, WEBP, GIF, HEIC.");
    if (file.size > MAX_IMG) throw new Error("Ảnh vượt quá 10 MB.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${requestId}/${itemId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (up.error) throw new Error(up.error.message);
    try {
      return await rpc("oq_info_image_add", { _info: infoId, _item: itemId, _path: path, _category: category, _caption: caption });
    } catch (e) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw e;
    }
  },
  async deleteInfoImage(id) {
    await rpc("oq_info_image_delete", { _id: id });
    await oqApi.flushCleanup();
  },
  /** Xóa file vật lý của ảnh không còn bản ghi nào dùng; lỗi được ghi lại để thử lại lần sau. */
  async flushCleanup() {
    try {
      const paths = await rpc("oq_cleanup_pending", {}) ?? [];
      if (!paths.length) return;
      const { error } = await supabase.storage.from(BUCKET).remove(paths);
      await rpc("oq_cleanup_done", { _paths: paths, _error: error ? error.message : null });
    } catch {
    }
  },
  async signedUrls(paths) {
    if (!paths.length) return {};
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
    return Object.fromEntries((data ?? []).filter((x) => x.signedUrl).map((x) => [x.path, x.signedUrl]));
  }
};
const LIST_STATUSES = [
  { value: "draft", label: "Bản nháp" },
  { value: "pending", label: "Chưa nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "waiting", label: "Đang chờ Sale bổ sung" },
  { value: "answered", label: "Đã trả lời" },
  { value: "cancelled", label: "Yêu cầu đã hủy" }
];
function listQuery(p, head) {
  const flowSel = "id,request_id,kind,code,assignee_id,status,waiting_info,current_round,updated_at";
  const needFlowFilter = p.tab !== "all" || p.status && !["draft", "cancelled"].includes(p.status) || !!p.assignee;
  let q = db.from("oq_requests").select(head ? `id${needFlowFilter ? ",ff:oq_flows!inner(id)" : ""}` : `id,code,title,order_type,status,creator_id,want_price,want_progress,delivery_date,created_at,submitted_at,updated_at,oq_items(count),flows:oq_flows(${flowSel})${needFlowFilter ? ",ff:oq_flows!inner(id)" : ""}`, { count: "exact", head });
  if (!head) {
    q = p.status === "pending" ? q.order("submitted_at", { ascending: true, nullsFirst: false }) : q.order("updated_at", { ascending: false });
    q = q.range(p.page * p.size, p.page * p.size + p.size - 1);
  }
  const s = p.q?.trim().replace(/[%,()]/g, " ");
  if (s) q = q.or(`title.ilike.%${s}%,code.ilike.%${s}%`);
  if (p.creator) q = q.eq("creator_id", p.creator);
  if (p.from) q = q.gte("created_at", `${p.from}T00:00:00+07:00`);
  if (p.to) q = q.lte("created_at", `${p.to}T23:59:59.999+07:00`);
  if (p.status === "draft" || p.status === "cancelled") q = q.eq("status", p.status);
  else q = q.neq("status", "cancelled");
  if (p.tab !== "all") q = q.eq("ff.kind", p.tab);
  if (p.assignee) q = q.eq("ff.assignee_id", p.assignee);
  if (p.status === "waiting") q = q.eq("ff.waiting_info", true).eq("ff.status", "processing");
  else if (p.status && !["draft", "cancelled"].includes(p.status)) q = q.eq("ff.status", p.status);
  return q;
}
const PRICE_CATS = [
  { key: "product", label: "Giá sản phẩm" },
  { key: "processing", label: "Giá gia công" },
  { key: "box", label: "Giá hộp" },
  { key: "shipping", label: "Giá vận chuyển" }
];
const catLabel = (k) => PRICE_CATS.find((c) => c.key === k)?.label ?? k;
function requestedCats(cfg, itemId) {
  const c = cfg.items?.[itemId] ?? {};
  return PRICE_CATS.map((x) => x.key).filter((k) => c[k]?.on && !(k === "shipping" && cfg.shipping_mode === "common"));
}
function latestPublished(resps, target) {
  return resps.filter((r) => r.is_published && r.target === target).sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0] ?? null;
}
function targets(kind, items, cfg) {
  if (kind === "progress") return items.map((i) => i.id);
  const t = items.filter((i) => requestedCats(cfg, i.id).length > 0).map((i) => i.id);
  if (cfg.shipping_mode === "common") t.push("shipping");
  return t;
}
function missing(kind, items, cfg, resps) {
  const out = [];
  for (const it of items) {
    const pub = latestPublished(resps, it.id)?.content;
    if (kind === "progress") {
      if (!pub || !String(pub.reply ?? "").trim()) out.push(`${it.code} ${it.name}: phản hồi tiến độ`);
      continue;
    }
    for (const k of requestedCats(cfg, it.id)) if (!pub || !String(pub[k] ?? "").trim()) out.push(`${it.code} ${it.name}: ${catLabel(k)}`);
  }
  if (kind === "price" && cfg.shipping_mode === "common") {
    const pub = latestPublished(resps, "shipping")?.content;
    if (!pub || !String(pub.shipping ?? "").trim()) out.push("Giá vận chuyển chung");
  }
  return out;
}
function progressCount(kind, items, cfg, resps) {
  const t = targets(kind, items, cfg).filter((id) => id !== "shipping");
  const miss = missing(kind, items, cfg, resps);
  const done = t.filter((id) => {
    const it = items.find((i) => i.id === id);
    return !miss.some((m) => m.startsWith(`${it.code} ${it.name}:`));
  }).length;
  const shipping = kind === "price" && cfg.shipping_mode === "common" ? !miss.includes("Giá vận chuyển chung") : null;
  return { done, total: t.length, shipping };
}
function qtySummary(mode, items) {
  const n = items.length;
  if (mode === "option") return `${n} phương án để khách chọn (không cộng số lượng)`;
  const byUnit = /* @__PURE__ */ new Map();
  for (const i of items) {
    const u = (i.unit ?? "").trim().toLowerCase() || "(chưa có ĐVT)";
    byUnit.set(u, (byUnit.get(u) ?? 0) + (Number(i.qty) || 0));
  }
  const parts = [...byUnit].map(([u, q]) => `${q.toLocaleString("vi-VN")} ${u}`);
  return `${n} dòng sản phẩm · ${parts.join(" + ")}`;
}
const FLOW_STATUS = { pending: "Chờ xác nhận", processing: "Đang xử lý", answered: "Đã trả lời", cancelled: "Đã hủy" };
function flowStatusLabel(kind, status) {
  if (status === "answered") return kind === "price" ? "Đã báo giá" : "Đã phản hồi tiến độ";
  return FLOW_STATUS[status] ?? status;
}
const CHOICE_LABEL = { considering: "Đang cân nhắc", chosen: "Khách chọn", rejected: "Khách không chọn" };
const IMG_CAT = { product: "Ảnh sản phẩm", logo: "Ảnh logo / gia công", box: "Ảnh hộp", other: "Ảnh khác" };
const EVENT_LABEL = {
  draft_created: "Tạo bản nháp",
  submitted: "Gửi yêu cầu",
  flow_created: "Tạo luồng",
  assigned: "Giao người phụ trách",
  accepted: "Xác nhận tiếp nhận",
  processing_started: "Bắt đầu xử lý",
  published: "Công bố kết quả",
  completed: "Hoàn tất luồng",
  info_requested: "Yêu cầu bổ sung thông tin",
  info_answered: "Sale bổ sung thông tin",
  reasked: "Hỏi lại",
  reassigned: "Đổi người phụ trách",
  choice: "Cập nhật lựa chọn của khách",
  flow_cancelled: "Hủy luồng",
  cancelled: "Hủy yêu cầu",
  message: "Trao đổi"
};
const vnDateTime = (iso) => iso ? new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const vnDate = (d) => {
  const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
};
function copyText(kind, items, cfg, resps, conclusion) {
  const lines = [];
  for (const it of items) {
    const pub = latestPublished(resps, it.id)?.content;
    if (!pub) continue;
    lines.push(`${it.code} — ${it.name}${it.qty ? ` (${it.qty} ${it.unit ?? ""})` : ""}`);
    if (kind === "price") {
      for (const k of requestedCats(cfg, it.id)) if (pub[k]) lines.push(`${catLabel(k)}: ${pub[k]}`);
      if (pub.note) lines.push(`Ghi chú: ${pub.note}`);
    } else {
      if (pub.reply) lines.push(pub.reply);
      if (pub.capability) lines.push(`Khả năng đáp ứng: ${pub.capability}`);
      if (pub.eta) lines.push(`Ngày dự kiến giao: ${vnDate(pub.eta)}`);
      if (pub.note) lines.push(`Ghi chú: ${pub.note}`);
    }
    lines.push("");
  }
  const ship = latestPublished(resps, "shipping")?.content;
  if (kind === "price" && ship?.shipping) lines.push(`Vận chuyển chung: ${ship.shipping}`);
  if (conclusion) lines.push(`Kết luận: ${conclusion}`);
  return lines.join("\n").trim();
}
export {
  CHOICE_LABEL as C,
  EVENT_LABEL as E,
  IMG_CAT as I,
  LIST_STATUSES as L,
  PRICE_CATS as P,
  vnDate as a,
  catLabel as b,
  copyText as c,
  flowStatusLabel as f,
  latestPublished as l,
  missing as m,
  oqApi as o,
  progressCount as p,
  qtySummary as q,
  requestedCats as r,
  vnDateTime as v
};
