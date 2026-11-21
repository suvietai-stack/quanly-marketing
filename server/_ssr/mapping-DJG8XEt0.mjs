const FIELDS = [
  { key: "customer_name", label: "Đơn vị / Khách hàng", kind: "text", required: true, max: 200 },
  { key: "phone", label: "Số điện thoại", kind: "text", required: true, max: 20 },
  { key: "address", label: "Địa chỉ", kind: "text", required: false, max: 500 },
  { key: "products", label: "Sản phẩm quan tâm", kind: "multi", required: false, catalog: "products", max: 0 },
  { key: "need_groups", label: "Nhóm nhu cầu", kind: "multi", required: false, catalog: "need_groups", max: 0 },
  { key: "need_detail", label: "Chi tiết nhu cầu", kind: "text", required: false, max: 3e3 },
  { key: "marketing_note", label: "Ghi chú Marketing", kind: "text", required: false, max: 3e3 }
];
function validateMapping(m, questions, cat, source) {
  const errs = [];
  if (!source) errs.push("Page chưa chọn Nguồn tín hiệu");
  if (!m) return [...errs, "Form chưa được cấu hình"];
  const keys = new Set(questions.map((q) => q.key));
  const used = /* @__PURE__ */ new Map();
  for (const f of FIELDS) {
    const r = m[f.key];
    if (!r || r.mode === "empty") {
      if (f.required) errs.push(`${f.label} là trường bắt buộc, không thể để trống`);
      continue;
    }
    if (r.mode === "facebook") {
      if (!keys.has(r.key)) {
        errs.push(`${f.label}: câu hỏi Facebook không còn trong Form`);
        continue;
      }
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
function normalizePhone(v) {
  let s = v.replace(/[^\d+]/g, "");
  if (s.startsWith("+84")) s = "0" + s.slice(3);
  else if (s.startsWith("84") && s.length >= 11) s = "0" + s.slice(2);
  return s;
}
function vnDate(iso) {
  const d = new Date(new Date(iso).getTime() + 7 * 36e5);
  return d.toISOString().slice(0, 10);
}
function applyMapping(m, data, cat, source, createdAt) {
  const answers = new Map(data.map((d) => [d.name, (d.values ?? []).map((x) => String(x).trim()).filter(Boolean)]));
  const out = {};
  const errs = [];
  for (const f of FIELDS) {
    const r = m[f.key];
    let vals = [];
    if (r?.mode === "facebook") {
      vals = answers.get(r.key) ?? [];
      if (f.catalog) {
        vals = vals.map((v2) => r.valueMap?.[v2] ?? (cat[f.catalog].includes(v2) ? v2 : "")).filter(Boolean);
        vals = vals.filter((v2) => cat[f.catalog].includes(v2));
      }
    } else if (r?.mode === "default") {
      vals = (Array.isArray(r.value) ? r.value : [r.value]).map((x) => String(x).trim()).filter(Boolean);
      if (f.catalog) vals = vals.filter((v2) => cat[f.catalog].includes(v2));
    }
    if (f.kind === "multi") {
      out[f.key] = Array.from(new Set(vals));
      continue;
    }
    let v = vals.join(", ");
    if (f.key === "phone") v = normalizePhone(v);
    if (f.max && v.length > f.max) v = v.slice(0, f.max);
    if (f.required && !v) errs.push(`Thiếu ${f.label}`);
    out[f.key] = v || null;
  }
  if (out.phone && !/^\+?[0-9 .-]{8,20}$/.test(out.phone)) errs.push("Số điện thoại không hợp lệ");
  if (errs.length) return { ok: false, error: errs.join("; ") };
  return { ok: true, draft: {
    customer_name: out.customer_name,
    phone: out.phone,
    address: out.address,
    products: out.products,
    need_groups: out.need_groups,
    need_group: out.need_groups[0] ?? null,
    need_detail: out.need_detail,
    marketing_note: out.marketing_note,
    source,
    detected_on: vnDate(createdAt)
  } };
}
const fold = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase();
const HINTS = [
  { key: "customer_name", keys: ["company_name", "full_name", "first_name"], words: ["cong ty", "don vi", "ho ten", "ten khach", "ho va ten", "ten"] },
  { key: "phone", keys: ["phone_number", "phone"], words: ["dien thoai", "sdt", "so dt", "zalo"] },
  { key: "address", keys: ["street_address", "city", "province"], words: ["dia chi", "tinh", "thanh pho"] },
  { key: "products", keys: [], words: ["san pham"] },
  { key: "need_groups", keys: [], words: ["nhu cau", "muc dich", "nhom"] },
  { key: "need_detail", keys: [], words: ["chi tiet", "mo ta", "so luong", "yeu cau"] }
];
function suggestMapping(current, questions) {
  const out = { ...current };
  const used = new Set(Object.values(out).flatMap((r) => r?.mode === "facebook" ? [r.key] : []));
  for (const h of HINTS) {
    if (out[h.key] && out[h.key].mode !== "empty") continue;
    const q = h.keys.map((k) => questions.find((x) => x.key === k)).find((x) => x && !used.has(x.key)) ?? questions.find((x) => !used.has(x.key) && h.words.some((w) => fold(`${x.label} ${x.key}`).includes(w)));
    if (q) {
      out[h.key] = { mode: "facebook", key: q.key };
      used.add(q.key);
    }
  }
  return out;
}
export {
  FIELDS,
  applyMapping,
  normalizePhone,
  suggestMapping,
  validateMapping,
  vnDate
};
