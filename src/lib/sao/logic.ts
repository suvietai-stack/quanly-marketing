export const availableStars = (balance: number, held: number) => Math.max(0, balance - held);
export const giftAvailable = (stock: number, reserved: number) => Math.max(0, stock - reserved);
export const mayRedeem = (balance: number, held: number, price: number, stock: number, reserved: number, enabled: boolean) => enabled && price > 0 && availableStars(balance, held) >= price && giftAvailable(stock, reserved) > 0;
export const mayCelebrate = (visible: boolean, editing: boolean, modalOpen: boolean) => visible && !editing && !modalOpen;