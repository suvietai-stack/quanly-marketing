/** Website Forms → Tín hiệu: ánh xạ thuần, dùng chung cho UI (kiểm tra) và máy chủ (tạo tín hiệu). */
export type FieldKey = "customer_name" | "phone" | "address" | "products" | "need_groups" | "need_detail" | "marketing_note";
export type FieldRule =
  | { mode: "website"; key: string; valueMap?: Record<string, string> }
  | { mode: "default"; value: string | string[] }
  | { mode: "compose"; keys: string[] }
  | { mode: "empty" };
export type Mapping = Partial<Record<FieldKey, FieldRule>>;
export interface FormField { key: string; label: string; type?: string; options?: { key?: string; value: string }[] }
/** Dữ liệu submission: key trường → giá trị (chuỗi hoặc mảng chuỗi). */
export type SubmissionData = Record<string, string | string[] | null | undefined>;

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
export function validateMapping(m: Mapping | null | undefined, fields: FormField[], cat: Catalogs, source: string | null): string[] {
  const errs: string[] = [];
  if (!source) errs.push("Website chưa chọn Nguồn tín hiệu");
  if (!m) return [...errs, "Form chưa được cấu hình"];
  const keys = new Set(fields.map((f) => f.key));
  const used = new Map<string, string>();
  for (const f of FIELDS) {
    const r = m[f.key];
    if (!r || r.mode === "empty") { if (f.required) errs.push(`${f.label} là trường bắt buộc, không thể để trống`); continue; }
    if (r.mode === "website") {
      if (!keys.has(r.key)) { errs.push(`${f.label}: trường Website không còn trong Form`); continue; }
      if (f.kind === "text" && used.has(r.key)) errs.push(`${f.label} và ${used.get(r.key)} dùng chung một trường`);
      used.set(r.key, f.label);
      if (f.catalog) {
        for (const v of Object.values(r.valueMap ?? {})) if (v && !cat[f.catalog].includes(v)) errs.push(`${f.label}: giá trị "${v}" không còn trong danh mục`);
      }
    } else if (r.mode === "compose") {
      if (f.kind !== "text") { errs.push(`${f.label}: chế độ ghép chỉ áp dụng cho trường văn bản`); continue; }
      if (!r.keys.length) { errs.push(`${f.label}: chưa chọn trường để ghép`); continue; }
      for (const k of r.keys) {
        if (!keys.has(k)) { errs.push(`${f.label}: trường "${k}" không còn trong Form`); continue; }
        if (used.has(k)) errs.push(`${f.label} và ${used.get(k)} dùng chung một trường`);
        used.set(k, f.label);
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

const valsOf = (data: SubmissionData, key: string): string[] => {
  const v = data[key];
  return (Array.isArray(v) ? v : v == null ? [] : [v]).map((x) => String(x).trim()).filter(Boolean);
};

export function applyMapping(m: Mapping, data: SubmissionData, fields: FormField[], cat: Catalogs, source: string, createdAt: string): { ok: true; draft: SignalDraft } | { ok: false; error: string } {
  const labels = new Map(fields.map((f) => [f.key, f.label || f.key]));
  const out: Record<string, any> = {};
  const errs: string[] = [];
  for (const f of FIELDS) {
    const r = m[f.key];
    let vals: string[] = [];
    if (r?.mode === "website") {
      vals = valsOf(data, r.key);
      if (f.catalog) {
        vals = vals.map((v) => r.valueMap?.[v] ?? (cat[f.catalog!].includes(v) ? v : "")).filter(Boolean);
        vals = vals.filter((v) => cat[f.catalog!].includes(v));
      }
    } else if (r?.mode === "compose") {
      // Ghép nhiều trường: mỗi dòng "Nhãn: trả lời", bỏ trường rỗng.
      const lines = r.keys
        .map((k) => ({ label: labels.get(k) ?? k, vals: valsOf(data, k) }))
        .filter((x) => x.vals.length)
        .map((x) => `${x.label}: ${x.vals.join(", ")}`);
      vals = lines.length ? [lines.join("\n")] : [];
    } else if (r?.mode === "default") {
      vals = (Array.isArray(r.value) ? r.value : [r.value]).map((x) => String(x).trim()).filter(Boolean);
      if (f.catalog) vals = vals.filter((v) => cat[f.catalog!].includes(v));
    }
    if (f.kind === "multi") { out[f.key] = Array.from(new Set(vals)); continue; }
    let v = vals.join(r?.mode === "compose" ? "\n" : ", ");
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

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase();
const HINTS: { key: FieldKey; keys: string[]; words: string[] }[] = [
  { key: "customer_name", keys: ["company", "company_name", "full_name", "name", "your_name"], words: ["cong ty", "don vi", "ho ten", "ten khach", "ho va ten", "ten"] },
  { key: "phone", keys: ["phone", "phone_number", "mobile", "tel"], words: ["dien thoai", "sdt", "so dt", "zalo"] },
  { key: "address", keys: ["address", "street_address", "city", "province"], words: ["dia chi", "tinh", "thanh pho"] },
  { key: "products", keys: ["product", "products"], words: ["san pham"] },
  { key: "need_groups", keys: ["need", "needs", "topic"], words: ["nhu cau", "muc dich", "nhom"] },
  { key: "need_detail", keys: ["message", "note", "content", "detail"], words: ["chi tiet", "mo ta", "so luong", "yeu cau", "loi nhan", "noi dung"] },
];
/** Gợi ý mapping cho trường còn trống; không ghi đè trường đã cấu hình, không dùng một trường cho hai mục văn bản. */
export function suggestMapping(current: Mapping, fields: FormField[]): Mapping {
  const out: Mapping = { ...current };
  const used = new Set(Object.values(out).flatMap((r) => (r?.mode === "website" ? [r.key] : r?.mode === "compose" ? r.keys : [])));
  for (const h of HINTS) {
    if (out[h.key] && out[h.key]!.mode !== "empty") continue;
    const q = h.keys.map((k) => fields.find((x) => x.key === k)).find((x) => x && !used.has(x.key))
      ?? fields.find((x) => !used.has(x.key) && h.words.some((w) => fold(`${x.label} ${x.key}`).includes(w)));
    if (q) { out[h.key] = { mode: "website", key: q.key }; used.add(q.key); }
  }
  return out;
}

/** Sao chép mapping sang Form khác: chỉ giữ tham chiếu trường tồn tại ở Form đích. Trả mapping đã lọc + các trường bị bỏ. */
export function copyMapping(m: Mapping, targetFields: FormField[]): { mapping: Mapping; dropped: string[] } {
  const keys = new Set(targetFields.map((f) => f.key));
  const out: Mapping = {};
  const dropped: string[] = [];
  for (const f of FIELDS) {
    const r = m[f.key];
    if (!r) continue;
    if (r.mode === "website" && !keys.has(r.key)) { dropped.push(f.label); continue; }
    if (r.mode === "compose") {
      const kept = r.keys.filter((k) => keys.has(k));
      if (!kept.length) { dropped.push(f.label); continue; }
      out[f.key] = { ...r, keys: kept };
      continue;
    }
    out[f.key] = r;
  }
  return { mapping: out, dropped };
}
