export interface Catalog {
  id: string;
  kind: string;
  parent_id: string | null;
  name: string;
  description: string;
  sort_order: number;
  active: boolean;
  config: Record<string, unknown>;
}
export interface Customer {
  id: string;
  code: string;
  owner_id: string;
  name: string;
  profile_kind: string;
  phone: string;
  email: string;
  website: string;
  tax_code: string;
  legal_name: string;
  province_code: string | null;
  ward_code: string | null;
  address: string;
  group_id: string | null;
  segment_id: string | null;
  priority_id: string | null;
  relationship_id: string | null;
  source_id: string | null;
  related_ids: string[];
  details: Record<string, string>;
  note: string;
  revision: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}
export interface Contact {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  zalo: string;
  email: string;
  title: string;
  department: string;
  role_ids: string[];
  preferred_channel: string;
  note: string;
  active: boolean;
  is_primary: boolean;
}
export interface Location {
  id: string;
  customer_id: string;
  label: string;
  province_code: string | null;
  ward_code: string | null;
  address: string;
  is_primary: boolean;
  active: boolean;
}
export interface Schedule {
  id: string;
  customer_id: string;
  contact_id: string | null;
  kind: string;
  goal: string;
  content: string;
  channel: string;
  interval_days: number | null;
  fixed_weekday: number | null;
  due_at: string;
  original_due_at: string;
  status: string;
  processed_at: string | null;
  completed_at: string | null;
  owner_id: string;
  department_id: string | null;
  attributed_at: string;
  revision: number;
  reminder_days: number;
  created_at: string;
}
export interface Interaction {
  id: string;
  customer_id: string;
  schedule_id: string | null;
  contact_id: string | null;
  actor_id: string;
  owner_id: string;
  channel: string;
  outcome_id: string;
  connected: boolean;
  completed: boolean;
  content: string;
  happened_at: string;
  next_schedule_id: string | null;
}
export interface CrmEvent {
  id: string;
  action: string;
  created_at: string;
  reason: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
}
export interface ReadData {
  customers: Customer[];
  schedules: Schedule[];
  contacts: Contact[];
  server_now: string;
}
export interface DetailData {
  customer: Customer;
  contacts: Contact[];
  locations: Location[];
  schedules: Schedule[];
  interactions: Interaction[];
  events: CrmEvent[];
  can_edit: boolean;
}
export interface Person {
  id: string;
  name: string;
  department_id: string | null;
  department: string | null;
  system_id: string | null;
  system: string | null;
  team_id: string | null;
  team: string | null;
}
export interface Template {
  id: string;
  owner_id: string | null;
  name: string;
  group_id: string | null;
  goal: string;
  channel: string;
  interval_days: number;
  active: boolean;
}
export interface ReportData {
  customers: Customer[];
  schedules: Schedule[];
  interactions: Interaction[];
  totals: Record<string, number>;
  start: string;
  end: string;
  as_of: string;
  server_now: string;
}
export const CHANNELS = {
  phone: "Gọi điện",
  zalo: "Zalo / Nhắn tin",
  meeting: "Gặp trực tiếp",
  email: "Email",
  other: "Khác",
};
export const KINDS: Record<string, string> = {
  group: "Nhóm / Mảng",
  block: "Khối khách",
  segment: "Tệp khách",
  trait: "Đặc điểm",
  product: "Sản phẩm",
  need: "Nhu cầu",
  priority: "Ưu tiên",
  relationship: "Tình trạng hợp tác",
  source: "Nguồn khách",
  goal: "Mục tiêu chăm sóc",
  outcome: "Kết quả chăm sóc",
  contact_role: "Vai trò liên hệ",
  channel: "Kênh bán hàng",
  cooperation: "Hình thức hợp tác",
  occasion: "Dịp mua hàng",
};
