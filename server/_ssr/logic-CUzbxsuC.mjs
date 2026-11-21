import { q as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
async function allRows(table, userId) {
  const rows = [];
  for (let from = 0; ; from += 500) {
    let q = supabase.from(table).select("*").order("created_at", { ascending: false }).order("id").range(from, from + 499);
    if (userId) q = q.eq("user_id", userId);
    const { data, error } = await q;
    if (error) throw error;
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}
async function loadSao(userId, admin = false) {
  const [wallet, gifts, ledger, requests, rules, events] = await Promise.all([
    supabase.from("sao_wallets").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("sao_gifts").select("*").order("name"),
    allRows("sao_ledger", admin ? void 0 : userId),
    allRows("sao_redemptions", admin ? void 0 : userId),
    supabase.from("sao_programs").select("*").order("created_at", { ascending: false }),
    admin ? supabase.from("sao_admin_events").select("id,kind,created_at").order("created_at", { ascending: false }).limit(100) : Promise.resolve({ data: [], error: null })
  ]);
  const error = wallet.error || gifts.error || rules.error || events.error;
  if (error) throw error;
  const resolvedGifts = await Promise.all((gifts.data ?? []).map(async (gift) => {
    if (!gift.image_url.startsWith("storage:")) return gift;
    const image = await supabase.storage.from("sao-gifts").createSignedUrl(gift.image_url.slice(8), 3600);
    if (image.error) throw image.error;
    return { ...gift, image_url: image.data.signedUrl, image_ref: gift.image_url };
  }));
  return { balance: wallet.data?.balance ?? 0, held: wallet.data?.held ?? 0, gifts: resolvedGifts, ledger, requests, rules: rules.data ?? [], events: events.data ?? [] };
}
const saoOptions = (userId, admin = false) => queryOptions({ queryKey: ["sao", userId, admin], queryFn: () => loadSao(userId, admin), staleTime: 0, refetchOnWindowFocus: true, refetchInterval: 15e3 });
async function redeem(gift, request) {
  const r = await supabase.rpc("sao_redeem", { _gift: gift, _request: request });
  if (r.error) throw r.error;
  return r.data;
}
async function decide(id, status, reason = "") {
  const r = await supabase.rpc("sao_redemption_decide", { _id: id, _status: status, _reason: reason });
  if (r.error) throw r.error;
}
async function saveProgram(p) {
  const r = await supabase.rpc("sao_program_save", { _id: p.id, _name: p.name, _source: p.source, _field: p.field, _condition: p.condition, _threshold: p.threshold, _stars: p.stars, _enabled: p.enabled, _starts: p.starts_at ?? void 0, _ends: p.ends_at ?? void 0 });
  if (r.error) throw r.error;
  return r.data;
}
async function saveGift(gift) {
  const r = await supabase.rpc("sao_gift_save", { _id: gift.id, _name: gift.name, _image: gift.image_url, _price: gift.price, _stock: gift.stock, _enabled: gift.enabled });
  if (r.error) throw r.error;
}
async function grant(user, stars, reason, request) {
  const r = await supabase.rpc("sao_manual_grant", { _user: user, _stars: stars, _reason: reason, _request: request });
  if (r.error) throw r.error;
}
async function claimCelebration() {
  const r = await supabase.rpc("sao_celebration_claim");
  if (r.error) throw r.error;
  return r.data;
}
async function uploadGift(file, userId) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Chọn ảnh JPG, PNG hoặc WebP tối đa 5 MB");
  const path = `${userId}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
  const r = await supabase.storage.from("sao-gifts").upload(path, file, { contentType: file.type, upsert: false });
  if (r.error) throw r.error;
  return `storage:${path}`;
}
const availableStars = (balance, held) => Math.max(0, balance - held);
const giftAvailable = (stock, reserved) => Math.max(0, stock - reserved);
const mayRedeem = (balance, held, price, stock, reserved, enabled) => enabled && price > 0 && availableStars(balance, held) >= price && giftAvailable(stock, reserved) > 0;
const mayCelebrate = (visible, editing, modalOpen) => visible && !editing && !modalOpen;
const REWARD_CHECK_INTERVAL_MS = 6e4;
const rewardCheckDue = (lastAttempt, now) => lastAttempt <= 0 || now < lastAttempt || now - lastAttempt >= REWARD_CHECK_INTERVAL_MS;
const friendlyReward = (source) => source === "signal" ? "Bạn vừa chốt thành công một tín hiệu!" : source === "task" ? "Công việc của bạn đã được xác nhận hoàn thành!" : source === "kpi" ? "Bạn đã hoàn thành KPI xuất sắc!" : "Bạn vừa đạt một thành tích mới!";
const programActive = (p, now = Date.now()) => p.enabled && (!p.starts_at || Date.parse(p.starts_at) <= now) && (!p.ends_at || Date.parse(p.ends_at) > now);
export {
  REWARD_CHECK_INTERVAL_MS as R,
  availableStars as a,
  mayRedeem as b,
  claimCelebration as c,
  decide as d,
  saveProgram as e,
  friendlyReward as f,
  giftAvailable as g,
  redeem as h,
  saveGift as i,
  grant as j,
  mayCelebrate as m,
  programActive as p,
  rewardCheckDue as r,
  saoOptions as s,
  uploadGift as u
};
