const FIELDS = [
  { key: "customer_name", label: "Đơn vị / Khách hàng", kind: "text", required: true, max: 200 },
  { key: "phone", label: "Số điện thoại", kind: "text", required: true, max: 20 },
  { key: "address", label: "Địa chỉ", kind: "text", required: false, max: 500 },
  { key: "products", label: "Sản phẩm quan tâm", kind: "multi", required: false, catalog: "products", max: 0 },
  { key: "need_groups", label: "Nhóm nhu cầu", kind: "multi", required: false, catalog: "need_groups", max: 0 },
  { key: "need_detail", label: "Chi tiết nhu cầu", kind: "text", required: false, max: 3e3 },
  { key: "marketing_note", label: "Ghi chú Marketing", kind: "text", required: false, max: 3e3 }
];
function validateMapping(m, fields, cat, source) {
  const errs = [];
  if (!source) errs.push("Website chưa chọn Nguồn tín hiệu");
  if (!m) return [...errs, "Form chưa được cấu hình"];
  const keys = new Set(fields.map((f) => f.key));
  const used = /* @__PURE__ */ new Map();
  for (const f of FIELDS) {
    const r = m[f.key];
    if (!r || r.mode === "empty") {
      if (f.required) errs.push(`${f.label} là trường bắt buộc, không thể để trống`);
      continue;
    }
    if (r.mode === "website") {
      if (!keys.has(r.key)) {
        errs.push(`${f.label}: trường Website không còn trong Form`);
        continue;
      }
      if (f.kind === "text" && used.has(r.key)) errs.push(`${f.label} và ${used.get(r.key)} dùng chung một trường`);
      used.set(r.key, f.label);
      if (f.catalog) {
        for (const v of Object.values(r.valueMap ?? {})) if (v && !cat[f.catalog].includes(v)) errs.push(`${f.label}: giá trị "${v}" không còn trong danh mục`);
      }
    } else if (r.mode === "compose") {
      if (f.kind !== "text") {
        errs.push(`${f.label}: chế độ ghép chỉ áp dụng cho trường văn bản`);
        continue;
      }
      if (!r.keys.length) {
        errs.push(`${f.label}: chưa chọn trường để ghép`);
        continue;
      }
      for (const k of r.keys) {
        if (!keys.has(k)) {
          errs.push(`${f.label}: trường "${k}" không còn trong Form`);
          continue;
        }
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
const valsOf = (data, key) => {
  const v = data[key];
  return (Array.isArray(v) ? v : v == null ? [] : [v]).map((x) => String(x).trim()).filter(Boolean);
};
function applyMapping(m, data, fields, cat, source, createdAt) {
  const labels = new Map(fields.map((f) => [f.key, f.label || f.key]));
  const out = {};
  const errs = [];
  for (const f of FIELDS) {
    const r = m[f.key];
    let vals = [];
    if (r?.mode === "website") {
      vals = valsOf(data, r.key);
      if (f.catalog) {
        vals = vals.map((v2) => r.valueMap?.[v2] ?? (cat[f.catalog].includes(v2) ? v2 : "")).filter(Boolean);
        vals = vals.filter((v2) => cat[f.catalog].includes(v2));
      }
    } else if (r?.mode === "compose") {
      const lines = r.keys.map((k) => ({ label: labels.get(k) ?? k, vals: valsOf(data, k) })).filter((x) => x.vals.length).map((x) => `${x.label}: ${x.vals.join(", ")}`);
      vals = lines.length ? [lines.join("\n")] : [];
    } else if (r?.mode === "default") {
      vals = (Array.isArray(r.value) ? r.value : [r.value]).map((x) => String(x).trim()).filter(Boolean);
      if (f.catalog) vals = vals.filter((v2) => cat[f.catalog].includes(v2));
    }
    if (f.kind === "multi") {
      out[f.key] = Array.from(new Set(vals));
      continue;
    }
    let v = vals.join(r?.mode === "compose" ? "\n" : ", ");
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
  { key: "customer_name", keys: ["company", "company_name", "full_name", "name", "your_name"], words: ["cong ty", "don vi", "ho ten", "ten khach", "ho va ten", "ten"] },
  { key: "phone", keys: ["phone", "phone_number", "mobile", "tel"], words: ["dien thoai", "sdt", "so dt", "zalo"] },
  { key: "address", keys: ["address", "street_address", "city", "province"], words: ["dia chi", "tinh", "thanh pho"] },
  { key: "products", keys: ["product", "products"], words: ["san pham"] },
  { key: "need_groups", keys: ["need", "needs", "topic"], words: ["nhu cau", "muc dich", "nhom"] },
  { key: "need_detail", keys: ["message", "note", "content", "detail"], words: ["chi tiet", "mo ta", "so luong", "yeu cau", "loi nhan", "noi dung"] }
];
function suggestMapping(current, fields) {
  const out = { ...current };
  const used = new Set(Object.values(out).flatMap((r) => r?.mode === "website" ? [r.key] : r?.mode === "compose" ? r.keys : []));
  for (const h of HINTS) {
    if (out[h.key] && out[h.key].mode !== "empty") continue;
    const q = h.keys.map((k) => fields.find((x) => x.key === k)).find((x) => x && !used.has(x.key)) ?? fields.find((x) => !used.has(x.key) && h.words.some((w) => fold(`${x.label} ${x.key}`).includes(w)));
    if (q) {
      out[h.key] = { mode: "website", key: q.key };
      used.add(q.key);
    }
  }
  return out;
}
function copyMapping(m, targetFields) {
  const keys = new Set(targetFields.map((f) => f.key));
  const out = {};
  const dropped = [];
  for (const f of FIELDS) {
    const r = m[f.key];
    if (!r) continue;
    if (r.mode === "website" && !keys.has(r.key)) {
      dropped.push(f.label);
      continue;
    }
    if (r.mode === "compose") {
      const kept = r.keys.filter((k) => keys.has(k));
      if (!kept.length) {
        dropped.push(f.label);
        continue;
      }
      out[f.key] = { ...r, keys: kept };
      continue;
    }
    out[f.key] = r;
  }
  return { mapping: out, dropped };
}
export {
  FIELDS,
  applyMapping,
  copyMapping,
  normalizePhone,
  suggestMapping,
  validateMapping,
  vnDate
};
