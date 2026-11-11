import { useState } from "react";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { useAuth, useCurrentUser, PERMISSION_BY_KEY, SUPER_ADMIN_ID, type Role } from "@/lib/auth";
import { categoryState, toggleCategory, type PermCategory } from "@/lib/leave/permCategories";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Gear button shown in a function page header — only rendered when the caller has the settings permission. */
export function FunctionSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="icon" aria-label="Cài đặt" title="Cài đặt" onClick={onClick}>
      <Settings className="h-4 w-4" />
    </Button>
  );
}

/**
 * In-function settings surface: Phân quyền (simple 4-category view over the
 * shared Role/Permission system) + Quy định nghiệp vụ (existing settings UI).
 * Role edits go through the same useAuth().updateRole store as the shared
 * Role page, so both stay in sync; only users with settings.role (or Super
 * Admin) can edit — everyone else sees a read-only matrix.
 */
export function FunctionSettingsDialog({ title, categories, personal, rules, open, onClose }: {
  title: string;
  categories: PermCategory[];
  personal: string[];
  rules: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-6">
          <RolePermissionMatrix categories={categories} personal={personal} />
          <section className="space-y-3">
            <h3 className="font-semibold text-sm">Quy định nghiệp vụ</h3>
            {rules}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Role × category matrix over the shared Role/Permission store; editable only with settings.role or Super Admin. */
export function RolePermissionMatrix({ categories, personal }: { categories: PermCategory[]; personal: string[] }) {
  const roles = useAuth((s) => s.roles);
  const updateRole = useAuth((s) => s.updateRole);
  const { isSuperAdmin, can } = useCurrentUser();
  const canEdit = isSuperAdmin || can("settings.role");
  const [busy, setBusy] = useState<string | null>(null);
  const editable = roles.filter((r) => r.id !== SUPER_ADMIN_ID && r.catalogState === 'standard');

  const toggle = async (role: Role, cat: PermCategory) => {
    const turnOn = categoryState(role.permissions, cat) !== "on";
    setBusy(role.id + ":" + cat.key);
    try {
      await updateRole(role.id, { permissions: toggleCategory(role.permissions, cat, turnOn) });
      toast.success(`Đã cập nhật quyền cho "${role.name}".`);
    } catch (e: any) {
      toast.error(e?.message || "Không lưu được phân quyền.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-3">
            <h3 className="font-semibold text-sm">Phân quyền</h3>
            <p className="text-xs text-muted-foreground">
              Quyền lưu trên Role dùng chung của hệ thống — thay đổi tại đây đồng bộ ngay với Cài đặt → Tài khoản &amp; Phân quyền.
              {!canEdit && " Bạn chỉ có quyền xem; chỉ người quản trị phân quyền mới được thay đổi."}
            </p>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Role</th>
                    {categories.map((c) => (
                      <th key={c.key} className="text-center font-medium px-3 py-2 whitespace-nowrap">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {roles.filter((r) => r.id === SUPER_ADMIN_ID).map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td colSpan={categories.length} className="px-3 py-2 text-center text-xs text-muted-foreground">
                        Toàn quyền hệ thống — không thể giảm.
                      </td>
                    </tr>
                  ))}
                  {editable.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      {categories.map((c) => {
                        const st = categoryState(r.permissions, c);
                        return (
                          <td key={c.key} className="px-3 py-2 text-center">
                            <Checkbox
                              checked={st === "on" ? true : st === "partial" ? "indeterminate" : false}
                              disabled={!canEdit || busy === r.id + ":" + c.key}
                              onCheckedChange={() => toggle(r, c)}
                              aria-label={`${c.label} — ${r.name}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              {personal.length > 0 && <>Quyền cá nhân luôn được giữ nguyên: {personal.map((k) => PERMISSION_BY_KEY[k]?.label || k).join(", ")}. </>}
              Chỉnh chi tiết hơn tại Cài đặt → Tài khoản &amp; Phân quyền.
            </p>
          </section>
  );
}
