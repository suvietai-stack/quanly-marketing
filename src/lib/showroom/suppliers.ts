import { supabase } from '@/integrations/supabase/client';

export type SupplierStatus = 'potential' | 'active' | 'paused' | 'archived';
export type SupplierContactChannel = 'call' | 'zalo' | 'email' | 'meeting' | 'other';

export type SupplierStore = {
  id: string;
  name: string;
  can_create: boolean;
  can_manage: boolean;
};

export type ShowroomSupplier = {
  id: string;
  code: string;
  store_id: string;
  store_name: string;
  name: string;
  category: string[];
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  status: SupplierStatus;
  next_follow_up: string | null;
  last_contact_at: string | null;
  product_count: number;
  updated_at: string;
  created_at: string;
  created_by: string;
  can_edit: boolean;
  can_manage: boolean;
};

export type SupplierFull = Omit<ShowroomSupplier,'store_name'|'product_count'|'can_edit'|'can_manage'> & {
  tax_code: string | null;
  notes: string | null;
  revision: number;
  updated_by: string;
};

export type SupplierProduct = {
  id: string;
  supplier_id: string;
  name: string;
  sku: string | null;
  category: string | null;
  specification: string | null;
  unit: string;
  origin: string | null;
  min_order_qty: number | null;
  purchase_price: number | null;
  currency: 'VND' | 'USD' | 'CNY' | null;
  lead_days: number | null;
  note: string | null;
  active: boolean;
  created_by: string;
  revision: number;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
};

export type SupplierContact = {
  id: string;
  channel: SupplierContactChannel;
  summary: string;
  actor_name: string;
  next_follow_up: string | null;
  created_at: string;
};

export type SupplierList = {
  stores: SupplierStore[];
  suppliers: ShowroomSupplier[];
  limit: number;
  server_now: string;
};

export type SupplierDetail = {
  supplier: SupplierFull;
  store_name: string;
  can_edit: boolean;
  can_manage: boolean;
  can_product_edit: boolean;
  can_contact_log: boolean;
  can_view_cost: boolean;
  products: SupplierProduct[];
  contacts: SupplierContact[];
};

export type SupplierSavePayload = {
  name: string;
  store_id: string;
  status?: SupplierStatus;
  category: string[];
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  tax_code: string;
  notes: string;
  next_follow_up: string;
  revision?: number;
};

export type ProductSavePayload = {
  name: string;
  sku: string;
  category: string;
  specification: string;
  unit: string;
  origin: string;
  min_order_qty: string;
  lead_days: string;
  note: string;
  active?: boolean;
  revision?: number;
  purchase_price?: string;
  currency?: 'VND' | 'USD' | 'CNY';
};

async function supplierRpc<T>(func: string, params: Record<string, unknown>): Promise<T> {
  const {data,error} = await supabase.rpc(func as never, params as never);
  if (error) throw new Error(error.message);
  return data as unknown as T;
}

export const supplierListRead = (store?: string, search?: string, status?: string) =>
  supplierRpc<SupplierList>('showroom_supplier_list_read',
    { _store: store || null, _search: search || null, _status: status || null });

export const supplierDetailRead = (id: string) =>
  supplierRpc<SupplierDetail>('showroom_supplier_detail_read', { _id: id });

export const supplierSave = (id: string | null, data: SupplierSavePayload) =>
  supplierRpc<string>('showroom_supplier_save', { _id: id, _data: data });

export const supplierProductSave = (supplierId: string, id: string | null, data: ProductSavePayload) =>
  supplierRpc<string>('showroom_supplier_product_save',
    { _supplier_id: supplierId, _id: id, _data: data });

export const supplierContactAdd = (supplierId: string,
  channel: SupplierContactChannel, summary: string, nextFollowUp: string) =>
  supplierRpc<string>('showroom_supplier_contact_add', {
    _supplier_id: supplierId, _channel: channel, _summary: summary,
    _next_follow_up: nextFollowUp || null,
  });

export const supplierStatusLabels: Record<SupplierStatus,string> = {
  potential: 'Đang tìm hiểu',
  active: 'Đang hợp tác',
  paused: 'Tạm dừng',
  archived: 'Đã lưu trữ',
};

export const supplierChannelLabels: Record<SupplierContactChannel,string> = {
  call: 'Điện thoại',
  zalo: 'Zalo',
  email: 'Email',
  meeting: 'Gặp trực tiếp',
  other: 'Khác',
};

export const supplierStatusTone = (status: SupplierStatus): 'default' | 'secondary' | 'outline' =>
  status === 'active' ? 'default' : status === 'archived' ? 'outline' : 'secondary';

export function vietnamDateToday(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const p = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${p('year')}-${p('month')}-${p('day')}`;
}

export const supplierFollowUpOverdue = (supplier: Pick<ShowroomSupplier,'next_follow_up'|'status'>,
  today: string = vietnamDateToday()) =>
  supplier.status !== 'archived' && !!supplier.next_follow_up && supplier.next_follow_up < today;

export const supplierStats = (suppliers: ShowroomSupplier[], today: string = vietnamDateToday()) => ({
  total: suppliers.length,
  active: suppliers.filter(s => s.status === 'active').length,
  potential: suppliers.filter(s => s.status === 'potential').length,
  overdue: suppliers.filter(s => supplierFollowUpOverdue(s,today)).length,
  products: suppliers.reduce((sum,s) => sum+s.product_count,0),
});

export const formatSupplierPrice = (value: number | null, currency?: string | null) =>
  value == null ? '—' : new Intl.NumberFormat('vi-VN',{maximumFractionDigits:2}).format(value) + ' ' + (currency || 'VND');
