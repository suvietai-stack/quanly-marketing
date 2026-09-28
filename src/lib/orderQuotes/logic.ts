/** Logic thuần Hỏi Giá & Tiến Độ — khớp với private.oq_missing (backend là nguồn quyết định). */
export const PRICE_CATS = [
  { key: "product", label: "Giá sản phẩm" },
  { key: "processing", label: "Giá gia công" },
  { key: "box", label: "Giá hộp" },
  { key: "shipping", label: "Giá vận chuyển" },
] as const;
export type PriceCat = (typeof PRICE_CATS)[number]["key"];
export type SnapItem = { id: string; code: string; name: string; qty?: number | null; unit?: string | null; detail?: string | null; processing?: string | null; note?: string | null };
export type PriceConfig = { items?: Record<string, Partial<Record<PriceCat, { on?: boolean; note?: string }>>>; shipping_mode?: "per_item" | "common"; shipping_note?: string; shipping_items?: string[]; note?: string };
export type ProgressConfig = { check_type?: "capability" | "in_progress"; existing_code?: string; content?: string; per_item?: Record<string, string> };
export type Resp = { target: string; version: number | null; is_published: boolean; content: Record<string, any> };

export const catLabel = (k: string) => PRICE_CATS.find((c) => c.key === k)?.label ?? k;

/** Hạng mục Sale yêu cầu cho một sản phẩm (vận chuyển chung không tính vào từng sản phẩm). */
export function requestedCats(cfg: PriceConfig, itemId: string): PriceCat[] {
  const c = cfg.items?.[itemId] ?? {};
  return PRICE_CATS.map((x) => x.key).filter((k) => c[k]?.on && !(k === "shipping" && cfg.shipping_mode === "common"));
}

export function latestPublished(resps: Resp[], target: string) {
  return resps.filter((r) => r.is_published && r.target === target).sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0] ?? null;
}

/** Danh sách đích cần phản hồi của lượt. */
export function targets(kind: "price" | "progress", items: SnapItem[], cfg: PriceConfig): string[] {
  if (kind === "progress") return items.map((i) => i.id);
  const t = items.filter((i) => requestedCats(cfg, i.id).length > 0).map((i) => i.id);
  if (cfg.shipping_mode === "common") t.push("shipping");
  return t;
}

export function missing(kind: "price" | "progress", items: SnapItem[], cfg: PriceConfig, resps: Resp[]): string[] {
  const out: string[] = [];
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

/** "Đã báo giá 2/3 phương án": số đích đã đủ nội dung đã công bố. */
export function progressCount(kind: "price" | "progress", items: SnapItem[], cfg: PriceConfig, resps: Resp[]) {
  const t = targets(kind, items, cfg);
  const miss = missing(kind, items, cfg, resps);
  const done = t.filter((id) => {
    const it = items.find((i) => i.id === id);
    const prefix = it ? `${it.code} ${it.name}:` : "Giá vận chuyển chung";
    return !miss.some((m) => m.startsWith(prefix));
  }).length;
  return { done, total: t.length };
}

/** Phương án thay thế không cộng số lượng; chỉ sản phẩm đặt đồng thời mới cộng. */
export function totalQty(mode: "option" | "bundle", items: { qty?: number | null }[]) {
  if (mode === "option") return null;
  return items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
}

export const FLOW_STATUS: Record<string, string> = { pending: "Chờ xác nhận", processing: "Đang xử lý", answered: "Đã trả lời", cancelled: "Đã hủy" };
export function flowStatusLabel(kind: "price" | "progress", status: string) {
  if (status === "answered") return kind === "price" ? "Đã báo giá" : "Đã phản hồi tiến độ";
  return FLOW_STATUS[status] ?? status;
}
export const CHOICE_LABEL: Record<string, string> = { considering: "Đang cân nhắc", chosen: "Khách chọn", rejected: "Khách không chọn" };
export const IMG_CAT: Record<string, string> = { product: "Ảnh sản phẩm", logo: "Ảnh logo / gia công", box: "Ảnh hộp", other: "Ảnh khác" };
export const EVENT_LABEL: Record<string, string> = {
  draft_created: "Tạo bản nháp", submitted: "Gửi yêu cầu", flow_created: "Tạo luồng", assigned: "Giao người phụ trách",
  accepted: "Xác nhận tiếp nhận", processing_started: "Bắt đầu xử lý", published: "Công bố kết quả", completed: "Hoàn tất luồng",
  info_requested: "Yêu cầu bổ sung thông tin", info_answered: "Sale bổ sung thông tin", reasked: "Hỏi lại", reassigned: "Đổi người phụ trách",
  choice: "Cập nhật lựa chọn của khách", flow_cancelled: "Hủy luồng", cancelled: "Hủy yêu cầu", message: "Trao đổi",
};

export const vnDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
export const vnDate = (d?: string | null) => { const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null; return m ? `${m[3]}/${m[2]}/${m[1]}` : "—"; };

/** Văn bản sao chép kết quả đã công bố (không bao giờ lấy bản nháp). */
export function copyText(kind: "price" | "progress", items: SnapItem[], cfg: PriceConfig, resps: Resp[], conclusion?: string | null) {
  const lines: string[] = [];
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
