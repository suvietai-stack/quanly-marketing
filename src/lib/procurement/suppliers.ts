import { supabase } from '@/integrations/supabase/client';

// Canonical supplier master = ot_suppliers (also consumed by Order Tracking).
export type SupplierStatus = 'potential' | 'active' | 'paused' | 'archived';
export type SupplierContactChannel = 'call' | 'zalo' | 'email' | 'meeting' | 'other';
export type SupplierProductGroup = { code:string; name:string };


export type MasterSupplier = {
  id: string; code: string; name: string;
  category: string[];
  contact_name: string | null; phone: string | null; email: string | null;
  website: string | null; address: string | null;
  status: SupplierStatus; active: boolean;
  next_follow_up: string | null; last_contact_at: string | null;
  updated_at: string; created_at: string; created_by: string | null;
  product_count: number; can_edit: boolean;
};
export type SupplierFull = Omit<MasterSupplier,'product_count'|'can_edit'|'active'> & {
  notes: string | null; tax_code: string | null; revision: number;
};
export type SupplierProduct = {
  id: string; supplier_id: string; name: string; sku: string | null;
  category: string | null; specification: string | null;
  unit: string; origin: string | null; min_order_qty: number | null;
  purchase_price: number | null; currency: 'VND'|'USD'|'CNY'|null;
  lead_days: number | null; note: string | null; active: boolean;
  created_by: string; revision: number; created_at: string; updated_at: string;
  can_edit: boolean;
};
export type SupplierContact = {
  id: string; channel: SupplierContactChannel; summary: string;
  actor_name: string; next_follow_up: string|null; created_at: string;
};
export type SupplierList = {
  suppliers: MasterSupplier[]; limit: number; server_now: string;
  can_create: boolean; can_manage: boolean; can_view_cost: boolean;
  can_manage_groups: boolean; groups: SupplierProductGroup[];
};
export type SupplierDetail = {
  supplier: SupplierFull; can_edit: boolean; can_manage: boolean;
  can_product_edit: boolean; can_contact_log: boolean; can_view_cost: boolean;
  products: SupplierProduct[]; contacts: SupplierContact[];
};
export type SupplierSavePayload = {
  name: string; status?: SupplierStatus; category: string[];
  contact_name: string; phone: string; email: string; website: string;
  address: string; tax_code: string; notes: string; next_follow_up: string;
  revision?: number;
};
export type ProductSavePayload = {
  name: string; sku: string; category: string; specification: string;
  unit: string; origin: string; min_order_qty: string; lead_days: string;
  note: string; active?: boolean; revision?: number;
  purchase_price?: string; currency?: 'VND'|'USD'|'CNY';
};
async function rpc<T>(name:string,args:Record<string,unknown>):Promise<T>{
  const {data,error} = await supabase.rpc(name as never,args as never);
  if(error) throw new Error(error.message);
  return data as unknown as T;
}
export const supplierListRead = (search?:string,status?:string,category?:string) =>
  rpc<SupplierList>('supplier_master_list_read',{
    _search:search||null,_status:status||null,_category:category||null,
  });
export const supplierProductGroupAdd = (name:string) =>
  rpc<SupplierProductGroup>('supplier_product_group_add',{_name:name});
export const supplierDetailRead = (id:string) =>
  rpc<SupplierDetail>('supplier_master_detail_read',{_id:id});
export const supplierSave = (id:string|null,data:SupplierSavePayload) =>
  rpc<string>('supplier_master_save',{_id:id,_data:data});
export const supplierProductSave = (supplierId:string,id:string|null,data:ProductSavePayload) =>
  rpc<string>('supplier_master_product_save',{_supplier_id:supplierId,_id:id,_data:data});
export const supplierContactAdd = (supplierId:string,channel:SupplierContactChannel,summary:string,date:string) =>
  rpc<string>('supplier_master_contact_add',{
    _supplier_id:supplierId,_channel:channel,_summary:summary,_next_follow_up:date||null,
  });
export const supplierGroupNames = (codes:string[],groups:SupplierProductGroup[]) =>
  codes.map(code=>groups.find(g=>g.code===code)?.name??code);
export const supplierStatusLabels:Record<SupplierStatus,string> = {
  potential:'Đang tìm hiểu',active:'Đang hợp tác',paused:'Tạm dừng',archived:'Đã lưu trữ',
};
export const supplierChannelLabels:Record<SupplierContactChannel,string> = {
  call:'Điện thoại',zalo:'Zalo',email:'Email',meeting:'Gặp trực tiếp',other:'Khác',
};
export const supplierStatusTone = (s:SupplierStatus):'default'|'secondary'|'outline' =>
  s==='active'?'default':s==='archived'?'outline':'secondary';
export function vietnamDateToday(){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',
    year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const v=(type:string)=>parts.find(p=>p.type===type)?.value??'';
  return `${v('year')}-${v('month')}-${v('day')}`;
}
export const supplierFollowUpOverdue = (s:Pick<MasterSupplier,'status'|'next_follow_up'>,
  today=vietnamDateToday())=>s.status!=='archived'&&!!s.next_follow_up&&s.next_follow_up<today;
export const supplierStats=(items:MasterSupplier[],today=vietnamDateToday())=>({
  total:items.length,
  active:items.filter(x=>x.status==='active').length,
  potential:items.filter(x=>x.status==='potential').length,
  overdue:items.filter(x=>supplierFollowUpOverdue(x,today)).length,
  products:items.reduce((n,x)=>n+x.product_count,0),
});
export const formatSupplierPrice=(value:number|null,currency?:string|null)=>
  value==null?'—':new Intl.NumberFormat('vi-VN',{maximumFractionDigits:2}).format(value)+' '+(currency||'VND');
