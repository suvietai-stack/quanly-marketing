const SIGNAL_PRODUCTS = ["Ấm chén", "Ly cốc", "Bát đĩa", "Bình hoa", "Bộ đồ ăn", "Quà tặng gốm sứ", "Khác"];
const SIGNAL_NEED_GROUPS = ["Sứ quà tặng", "Bát đĩa nhà hàng", "Sản xuất theo yêu cầu", "Xuất khẩu", "Nhập sỉ", "Khác"];
const SIGNAL_SOURCES = ["Website", "Facebook", "TikTok", "Zalo", "Google Maps", "Hotline", "Marketing chủ động tìm kiếm", "Giới thiệu", "Khác"];
const SIGNAL_LOST_REASONS = [
  "Số điện thoại sai",
  "Không liên lạc được",
  "Không còn nhu cầu",
  "Nhu cầu không phù hợp",
  "Giá không phù hợp",
  "Đã chọn nhà cung cấp khác",
  "Không đáp ứng yêu cầu sản phẩm",
  "Không đáp ứng thời gian giao hàng",
  "Khác"
];
const SIGNAL_STATUSES = ["waiting", "contacting", "consulting", "quoted", "deposit", "won", "lost"];
const OPEN_STATUSES = ["waiting", "contacting", "consulting", "quoted", "deposit"];
const STATUS_LABEL = {
  waiting: "Chờ nhận",
  contacting: "Đang liên hệ",
  consulting: "Đang tư vấn",
  quoted: "Đã báo giá",
  deposit: "Chờ xác nhận / cọc",
  won: "Chốt",
  lost: "Trượt"
};
const STATUS_TONE = {
  none: "bg-muted text-muted-foreground",
  waiting: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  contacting: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  consulting: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  quoted: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  deposit: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  won: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  lost: "bg-destructive/15 text-destructive"
};
const statusLabel = (s) => s ? STATUS_LABEL[s] ?? s : "—";
function normalizePhone(v) {
  const s = v.trim().replace(/[\s.\-()]/g, "");
  if (!/^\+?\d{9,15}$/.test(s)) return null;
  return s;
}
function zaloLink(phone) {
  const d = phone.replace(/[^\d]/g, "");
  return `https://zalo.me/${d.startsWith("0") ? "84" + d.slice(1) : d}`;
}
const fmtVnd = (n) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " ₫";
function todayKey(d = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
}
const DEFAULT_OPTIONS = { signal_sources: SIGNAL_SOURCES, signal_products: SIGNAL_PRODUCTS, signal_need_groups: SIGNAL_NEED_GROUPS };
const normName = (s) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
const cleanName = (s) => s.trim().replace(/\s+/g, " ");
function resolveOptions(stored, scope) {
  const list = Array.isArray(stored) && stored.length ? stored.filter((x) => x && typeof x.name === "string").map((x) => ({ name: x.name, active: x.active !== false })) : DEFAULT_OPTIONS[scope].map((name) => ({ name, active: true }));
  return list;
}
function addOption(list, name) {
  const n = cleanName(name);
  if (!n) throw new Error("Tên không được để trống");
  if (list.some((o) => normName(o.name) === normName(n))) throw new Error("Lựa chọn này đã có trong danh mục");
  return [...list, { name: n, active: true }];
}
function renameOption(list, from, to) {
  const n = cleanName(to);
  if (!n) throw new Error("Tên không được để trống");
  if (list.some((o) => o.name !== from && normName(o.name) === normName(n))) throw new Error("Tên này đã tồn tại");
  return list.map((o) => o.name === from ? { ...o, name: n } : o);
}
function moveOption(list, name, dir) {
  const i = list.findIndex((o) => o.name === name);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
const removeOption = (list, name) => list.filter((o) => o.name !== name);
const toggleOption = (list, name) => list.map((o) => o.name === name ? { ...o, active: !o.active } : o);
const needGroupsOf = (s) => s.need_groups && s.need_groups.length ? s.need_groups : s.need_group ? [s.need_group] : [];
export {
  OPEN_STATUSES as O,
  STATUS_LABEL as S,
  addOption as a,
  removeOption as b,
  todayKey as c,
  STATUS_TONE as d,
  SIGNAL_LOST_REASONS as e,
  fmtVnd as f,
  resolveOptions as g,
  SIGNAL_STATUSES as h,
  normalizePhone as i,
  normName as j,
  moveOption as m,
  needGroupsOf as n,
  renameOption as r,
  statusLabel as s,
  toggleOption as t,
  zaloLink as z
};
