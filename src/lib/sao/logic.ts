export const availableStars = (balance: number, held: number) => Math.max(0, balance - held);
export const giftAvailable = (stock: number, reserved: number) => Math.max(0, stock - reserved);
export const mayRedeem = (balance: number, held: number, price: number, stock: number, reserved: number, enabled: boolean) => enabled && price > 0 && availableStars(balance, held) >= price && giftAvailable(stock, reserved) > 0;
export const mayCelebrate = (visible: boolean, editing: boolean, modalOpen: boolean) => visible && !editing && !modalOpen;
export const friendlyReward = (source: string) =>
  source === 'signal' ? 'Bạn vừa chốt thành công một tín hiệu!'
  : source === 'task' ? 'Công việc của bạn đã được xác nhận hoàn thành!'
  : source === 'kpi' ? 'Bạn đã hoàn thành KPI xuất sắc!'
  : 'Bạn vừa đạt một thành tích mới!';
export const programActive = (p: { enabled: boolean; starts_at: string | null; ends_at: string | null }, now = Date.now()) =>
  p.enabled && (!p.starts_at || Date.parse(p.starts_at) <= now) && (!p.ends_at || Date.parse(p.ends_at) > now);