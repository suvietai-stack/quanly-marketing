import { allDependencies, allDependents, type PermissionKey } from "@/lib/auth";

/**
 * Simple 4-category permission view for in-function settings (Nghỉ phép / Giải trình).
 * Categories are a presentation layer over the existing granular permissions —
 * toggling a category only adds/removes that category's keys (plus dependency
 * closure), never touches personal or unrelated permissions.
 */
export interface PermCategory {
  key: string;
  label: string;
  perms: PermissionKey[];
}

export const LEAVE_PERM_CATEGORIES: PermCategory[] = [
  { key: "create", label: "Tạo yêu cầu", perms: ["leave.create", "leave.create_for"] },
  { key: "approve", label: "Duyệt yêu cầu được giao", perms: ["leave.view_assigned", "leave.approve"] },
  {
    key: "manage",
    label: "Quản lý yêu cầu",
    perms: ["leave.view_all", "leave.edit_others", "leave.reassign", "leave.cancel_handle", "leave.exception", "leave.report", "leave.export"],
  },
  { key: "settings", label: "Quản lý cài đặt", perms: ["leave.settings"] },
];
/** Personal leave permissions — always preserved, edited only in the shared Role page. */
export const LEAVE_PERSONAL_PERMS: PermissionKey[] = ["leave.view_own", "leave.edit_own", "leave.recall"];

export const ATT_PERM_CATEGORIES: PermCategory[] = [
  { key: "create", label: "Tạo yêu cầu", perms: ["att.create"] },
  { key: "approve", label: "Duyệt yêu cầu được giao", perms: ["att.witness"] },
  { key: "manage", label: "Quản lý yêu cầu", perms: ["att.view_all", "att.reconcile", "att.report", "att.manage"] },
  { key: "settings", label: "Quản lý cài đặt", perms: ["att.settings"] },
];
/** Personal attendance permissions — always preserved, edited only in the shared Role page. */
export const ATT_PERSONAL_PERMS: PermissionKey[] = ["att.view_own", "att.edit_own"];

export type CategoryState = "on" | "off" | "partial";

export function categoryState(perms: Iterable<PermissionKey>, cat: PermCategory): CategoryState {
  const set = new Set(perms);
  const n = cat.perms.filter((k) => set.has(k)).length;
  return n === 0 ? "off" : n === cat.perms.length ? "on" : "partial";
}

/**
 * Toggle a whole category on/off. On: adds the category's keys plus their
 * required parent dependencies. Off: removes the category's keys plus anything
 * that depends on them (same rule as the shared permission matrix). Keys
 * outside the category are never added or removed.
 */
export function toggleCategory(current: PermissionKey[], cat: PermCategory, turnOn: boolean): PermissionKey[] {
  const next = new Set(current);
  if (turnOn) {
    for (const k of cat.perms) {
      next.add(k);
      for (const p of allDependencies(k)) next.add(p);
    }
  } else {
    for (const k of cat.perms) {
      next.delete(k);
      for (const d of allDependents(k)) next.delete(d);
    }
  }
  return [...next];
}

export const FIN_PERM_CATEGORIES: PermCategory[] = [
  { key: "view", label: "Xem Tiền về", perms: ["finance.incoming.view", "finance.incoming.manual_view"] },
  { key: "create", label: "Tạo/ghi nhận", perms: ["finance.incoming.manual_create"] },
  { key: "confirm", label: "Xác nhận", perms: ["finance.incoming.claim"] },
  { key: "remind", label: "Nhắc thủ công", perms: ["finance.incoming.remind"] },
  { key: "manage", label: "Quản lý", perms: ["finance.incoming.reconcile", "finance.incoming.manual_manage", "finance.incoming.manage", "finance.incoming.view_totals"] },
  { key: "settings", label: "Cài đặt Tiền về", perms: ["finance.incoming.gmf_config", "finance.incoming.bank_config"] },
];
