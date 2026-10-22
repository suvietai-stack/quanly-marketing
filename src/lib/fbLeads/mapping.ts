/** Facebook Lead Ads → Tín hiệu: ánh xạ thuần, dùng chung cho UI (kiểm tra) và máy chủ (tạo tín hiệu). */
export type FieldKey = "customer_name" | "phone" | "address" | "products" | "need_groups" | "need_detail" | "marketing_note";
export type FieldRule =
  | { mode: "facebook"; key: string; valueMap?: Record<string, string> }
  | { mode: "default"; value: string | string[] }
  | { mode: "empty" };
export type Mapping = Partial<Record<FieldKey, FieldRule>>;
export interface Question { key: string; label: string; type?: string; options?: { key?: string; value: string }[] }
export interface FieldData { name: string; values?: string[] }

export const FIELDS: { key: FieldKey; label: string; kind: "text" | "multi"; required: boolean; catalog?: "products" | "need_groups"; max: number }[] = [
  { key: "customer_name", label: "Đơn vị / Khách hàng", kind: "text", required: true, max: 200 },
  { key: "phone", label: "Số điện thoại", kind: "text", required: true, max: 20 },
  { key: "address", label: "Địa chỉ", kind: "text", required: false, max: 500 },
  { key: "products", label: "Sản phẩm quan tâm", kind: "multi", required: false, catalog: "products", max: 0 },
  { key: "need_groups", label: "Nhóm nhu cầu", kind: "multi", required: false, catalog: "need_groups", max: 0 },
  { key: "need_detail", label: "Chi tiết nhu cầu", kind: "text", required: false, max: 3000 },
  { key: "marketing_note", label: "Ghi chú Marketing", kind: "text", required: false, max: 3000 },
];

export interface Catalogs { products: string[]; need_groups: string[] }

/** Lỗi cấu hình; rỗng = có thể bật đồng bộ. */
export function validateMapping(m: Mapping | null | undefined, questions: Question[], cat: Catalogs, source: string | null): string[] {
  const errs: string[] = [];
  if (!source) errs.push("Page chưa chọn Nguồn tín hiệu");
  if (!m) return [...errs, "Form chưa được cấu hình"];
  const keys = new Set(questions.map((q) => q.key));
  const used = new Map<string, string>();
  for (const f of FIELDS) {
    const r = m[f.key];
    if (!r || r.mode === "empty") { if (f.required) errs.push(`${f.label} là trường bắt buộc, không thể để trống`); continue; }
    if (r.mode === "facebook") {
      if (!keys.has(r.key)) { errs.push(`${f.label}: câu hỏi Facebook không còn trong Form`); continue; }
      if (f.kind === "text" && used.has(r.key)) errs.push(`${f.label} và ${used.get(r.key)} dùng chung một câu hỏi`);
      used.set(r.key, f.label);
      if (f.catalog) {
        for (const v of Object.values(r.valueMap ?? {})) if (v && !cat[f.catalog].includes(v)) errs.push(`${f.label}: giá trị "${v}" không còn trong danh mục`);
      }
    } else {
      const vals = Array.isArray(r.value) ? r.value : [r.value];
      if (f.catalog) {
        if (!vals.length) errs.push(`${f.label}: chưa chọn giá trị mặc định`);
        for (const v of vals) if (!cat[f.catalog].includes(v)) errs.push(`${f.label}: giá trị "${v}" không còn trong danh mục`);
      } else if (!String(vals[0] ?? "").trim()) errs.push(`${f.label}: giá trị mặc định đang trống`);
    }
  }
  return errs;
}

export function normalizePhone(v: string): string {
  let s = v.replace(/[^\d+]/g, "");
  if (s.startsWith("+84")) s = "0" + s.slice(3);
  else if (s.startsWith("84") && s.length >= 11) s = "0" + s.slice(2);
  return s;
}

/** Ngày theo giờ Việt Nam (UTC+7). */
export function vnDate(iso: string | Date): string {
  const d = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return d.toISOString().slice(0, 10);
}

export interface SignalDraft {
  customer_name: string; phone: string; address: string | null; products: string[]; need_groups: string[]; need_group: string | null;
  need_detail: string | null; marketing_note: string | null; source: string; detected_on: string;
}

export function applyMapping(m: Mapping, data: FieldData[], cat: Catalogs, source: string, createdAt: string): { ok: true; draft: SignalDraft } | { ok: false; error: string } {
  const answers = new Map(data.map((d) => [d.name, (d.values ?? []).map((x) => String(x).trim()).filter(Boolean)]));
  const out: Record<string, any> = {};
  const errs: string[] = [];
  for (const f of FIELDS) {
    const r = m[f.key];
    let vals: string[] = [];
    if (r?.mode === "facebook") {
      vals = answers.get(r.key) ?? [];
      if (f.catalog) {
        vals = vals.map((v) => r.valueMap?.[v] ?? (cat[f.catalog!].includes(v) ? v : "")).filter(Boolean);
        vals = vals.filter((v) => cat[f.catalog!].includes(v));
      }
    } else if (r?.mode === "default") {
      vals = (Array.isArray(r.value) ? r.value : [r.value]).map((x) => String(x).trim()).filter(Boolean);
      if (f.catalog) vals = vals.filter((v) => cat[f.catalog!].includes(v));
    }
    if (f.kind === "multi") { out[f.key] = Array.from(new Set(vals)); continue; }
    let v = vals.join(", ");
    if (f.key === "phone") v = normalizePhone(v);
    if (f.max && v.length > f.max) v = v.slice(0, f.max);
    if (f.required && !v) errs.push(`Thiếu ${f.label}`);
    out[f.key] = v || null;
  }
  if (out.phone && !/^\+?[0-9 .-]{8,20}$/.test(out.phone)) errs.push("Số điện thoại không hợp lệ");
  if (errs.length) return { ok: false, error: errs.join("; ") };
  return { ok: true, draft: {
    customer_name: out.customer_name, phone: out.phone, address: out.address, products: out.products, need_groups: out.need_groups,
    need_group: out.need_groups[0] ?? null, need_detail: out.need_detail, marketing_note: out.marketing_note,
    source, detected_on: vnDate(createdAt),
  } };
}
