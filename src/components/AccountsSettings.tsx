import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { titleRolesApi } from '@/lib/basePermissions/titleRoles';
import { useState, useMemo, useRef } from "react";
import { ROLE_FUNCTION_GROUPS, roleFunctionGroup } from "@/lib/rolePresentation";
import { SignalScopeEditor, type SignalScopeHandle } from "@/components/signals/SignalScopeEditor";
import {
  useAuth, useCurrentUser, type Role, type User, type AccountStatus,
  type PermissionKey, PERMISSIONS, PERMISSION_GROUPS, ALL_PERMS,
  ROLE_PERMISSIONS, ROLE_ALL_PERMS, BIZ_ORG_GROUPS, isBizOrgPerm,
  SUPER_ADMIN_ID, allDependencies, allDependents,
  auditDependencies,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Pencil, Trash2, Lock, Unlock, KeyRound, Shield, ShieldCheck, X, Check, Search,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { toast } from "sonner";
import { passwordIssues } from '@/lib/password';
import { AccountAuthPanel } from '@/components/AccountAuthPanel';

const STATUSES: AccountStatus[] = ["Chờ duyệt","Đang hoạt động","Tạm khóa","Từ chối","Lưu trữ"];

function StatusBadge({ value }: { value: AccountStatus }) {
  const map: Record<AccountStatus, string> = {
    "Chờ duyệt": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    "Đang hoạt động": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    "Tạm khóa": "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    "Từ chối": "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    "Lưu trữ": "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[value]}`}>{value}</span>;
}

export function AccountsSettings() {
  const s = useAuth();
  const { user: me, isSuperAdmin, can } = useCurrentUser();
  const canManageRoles = isSuperAdmin || can("settings.role");
  const canManageMatrix = isSuperAdmin || can("settings.permission");
  const canApprove = isSuperAdmin || can("settings.account_approve");
  const canLock = isSuperAdmin || can("settings.account_lock");
  const canViewUsers = isSuperAdmin || can("settings.user_view");

  const pending = s.users.filter((u) => u.status === "Chờ duyệt");
  const others = s.users.filter((u) => u.status !== "Chờ duyệt");

  const defaultTab =
    pending.length > 0 && canApprove ? "pending"
    : canViewUsers ? "all"
    : "me";

  return (
    <div className="space-y-3">
    {(canManageRoles || canManageMatrix) && <p className="text-sm text-muted-foreground">Danh sách Role, ma trận phân quyền và debug quyền đã chuyển về Hành chính &amp; Nhân sự → Cơ cấu tổ chức → Cài đặt → Role &amp; Phân quyền.</p>}
    <Tabs defaultValue={defaultTab}>
      <TabsList className="flex-wrap h-auto">
        {canViewUsers && <TabsTrigger value="all">Tất cả tài khoản ({s.users.length})</TabsTrigger>}
        {canApprove && (
          <TabsTrigger value="pending" className={pending.length > 0 ? "data-[state=inactive]:text-amber-700 dark:data-[state=inactive]:text-amber-400" : ""}>
            Chờ duyệt {pending.length > 0 && <Badge className="ml-1.5 bg-amber-500 text-white hover:bg-amber-500">{pending.length}</Badge>}
          </TabsTrigger>
        )}
        {me && <TabsTrigger value="me">Đổi mật khẩu</TabsTrigger>}
      </TabsList>

      {canViewUsers && (
        <TabsContent value="all" className="mt-4">
          <AllAccountsTab users={others.concat(pending)} canLock={canLock} />
        </TabsContent>
      )}

      {canApprove && (
        <TabsContent value="pending" className="mt-4">
          <PendingTab users={pending} canApprove={canApprove} />
        </TabsContent>
      )}

      {me && (
        <TabsContent value="me" className="mt-4">
          <ChangePasswordTab />
        </TabsContent>
      )}
    </Tabs>
    </div>
  );
}

// --------- Permission Debug (Super Admin only) ---------
// Debug đọc kết quả giải thích quyền từ backend (account_permission_explain) —
// không tự duy trì thuật toán tính quyền riêng, đảm bảo luôn khớp resolver máy chủ.
type PermissionExplainRpc = {
  user_id: string;
  status: string;
  is_super_admin: boolean;
  use_custom: boolean;
  override_mode: "replace" | "additive";
  custom_permissions: string[];
  direct_roles: { role_id: string; name: string; permissions: string[] }[];
  rules: { permission: string; effect: string; source_kind: string; source_name: string | null; scope: string | null }[];
  effective: string[];
};

const SOURCE_KIND_LABEL: Record<string, string> = {
  appointment_role: "Chức vụ",
  marketing_specialty: "Nhiệm vụ Marketing",
  default: "Quyền mặc định",
  direct: "Quyền bổ sung trực tiếp",
  bundle: "Bộ quyền",
};

export function PermissionDebugTab() {
  const s = useAuth();
  const [uid, setUid] = useState<string>("");
  const [testKey, setTestKey] = useState<string>("");
  const target = useMemo(() => s.users.find((u) => u.id === uid), [s.users, uid]);

  const explainQ = useQuery({
    queryKey: ["perm-explain", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("account_permission_explain", { _target: uid });
      if (error) throw error;
      return data as unknown as PermissionExplainRpc;
    },
    staleTime: 15_000,
  });
  const info = explainQ.data;
  const effective = useMemo<Set<string>>(() => new Set(info?.effective ?? []), [info]);

  const testResult = useMemo(() => {
    if (!info || !testKey) return null;
    const ok = info.is_super_admin || effective.has(testKey);
    const sources: string[] = [];
    for (const r of info.direct_roles) if (r.permissions.includes(testKey)) sources.push(`Role "${r.name}"`);
    if (info.use_custom && info.custom_permissions.includes(testKey))
      sources.push(info.override_mode === "additive" ? "Quyền bổ sung cá nhân (cộng thêm)" : "Quyền riêng (thay thế Role)");
    for (const rule of info.rules.filter((x) => x.permission === testKey))
      sources.push(`${SOURCE_KIND_LABEL[rule.source_kind] ?? rule.source_kind}${rule.source_name ? `: ${rule.source_name}` : ""} (${rule.effect === "DENY" ? "CHẶN" : "cho phép"})`);
    const reason = info.is_super_admin
      ? "Super Admin — toàn quyền"
      : ok
        ? sources.length > 0 ? `Cấp qua: ${sources.join(" · ")}` : "Được cấp theo resolver backend"
        : sources.length > 0 && info.rules.some((x) => x.permission === testKey && x.effect === "DENY")
          ? `Bị chặn bởi: ${sources.join(" · ")}`
          : "Không có nguồn cấp nào cho quyền này";
    return { ok, reason };
  }, [info, testKey, effective]);

  // Audit across roles + users with custom perms
  const audit = useMemo(() => {
    const rows: { kind: string; name: string; issues: { key: string; missing: string[] }[] }[] = [];
    for (const r of s.roles) {
      if (r.id === SUPER_ADMIN_ID) continue;
      const issues = auditDependencies(r.permissions || []);
      if (issues.length) rows.push({ kind: "Role", name: r.name, issues });
    }
    for (const u of s.users) {
      if (!u.useCustom) continue;
      const issues = auditDependencies(u.customPermissions || []);
      if (issues.length) rows.push({ kind: "User (quyền riêng)", name: u.fullName || u.username, issues });
    }
    return rows;
  }, [s.roles, s.users]);

  return (
    <Card><CardContent className="p-5 space-y-4">
      <div className="text-sm text-muted-foreground">
        Công cụ này chỉ Super Admin xem được. Dùng để kiểm tra vì sao một tài khoản thấy/không thấy được một chức năng.
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Chọn tài khoản</Label>
          <Select value={uid} onValueChange={setUid}>
            <SelectTrigger><SelectValue placeholder="— chọn user —" /></SelectTrigger>
            <SelectContent>
              {s.users.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.fullName || u.username} ({u.username})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Test can(permissionKey)</Label>
          <Select value={testKey} onValueChange={setTestKey}>
            <SelectTrigger><SelectValue placeholder="— chọn quyền để test —" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {ROLE_PERMISSIONS.map((p) => (
                <SelectItem key={p.key} value={p.key}>{p.key} — {p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {target && (
        <div className="space-y-3">
          {explainQ.isPending && <div className="text-sm text-muted-foreground">Đang đọc kết quả từ máy chủ…</div>}
          {explainQ.error && <div className="text-sm text-rose-600">Không đọc được giải thích quyền: {explainQ.error instanceof Error ? explainQ.error.message : "lỗi"}</div>}
          {info && (
            <>
              <div className="text-sm">
                <span className="text-muted-foreground">Nguồn quyền: </span>
                <span className="font-medium">
                  {info.is_super_admin
                    ? "Super Admin / Tài khoản hệ thống — toàn quyền"
                    : info.use_custom
                      ? info.override_mode === "additive"
                        ? "Role + quyền bổ sung cá nhân (cộng thêm)"
                        : "Quyền riêng (thay thế Role)"
                      : info.direct_roles.length > 0
                        ? `Theo role: ${info.direct_roles.map((r) => r.name).join(", ")}`
                        : "Chưa gán Role"}
                </span>
              </div>
              {info.direct_roles.length > 1 && (
                <div className="text-xs text-muted-foreground">
                  Tài khoản có {info.direct_roles.length} Role trực tiếp — quyền hiệu lực là tổng hợp đã loại trùng.
                </div>
              )}
              {info.rules.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Nguồn theo chức vụ/nhiệm vụ: </span>
                  <span className="font-medium">
                    {[...new Set(info.rules.map((r) => `${SOURCE_KIND_LABEL[r.source_kind] ?? r.source_kind}${r.source_name ? ` (${r.source_name})` : ""}`))].join(" · ")}
                  </span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">Trạng thái: </span>
                <StatusBadge value={target.status} />
                {info.status !== "Đang hoạt động" && <span className="ml-2 text-xs text-rose-600">Tài khoản không hoạt động — mọi quyền vô hiệu.</span>}
              </div>
            </>
          )}
          {testKey && testResult && (
            <div className={`text-sm font-medium ${testResult.ok ? "text-emerald-600" : "text-rose-600"}`}>
              can("{testKey}") = {testResult.ok ? "TRUE — được phép" : "FALSE — bị chặn"}
              <div className="text-xs text-muted-foreground font-normal mt-0.5">Lý do: {testResult.reason}</div>
            </div>
          )}
          <div>
            <Label className="text-xs">Quyền hiệu lực ({effective.size}/{ALL_PERMS.length})</Label>
            <p className="text-xs text-muted-foreground mt-1">Quyền Quản trị Kinh doanh và Quản lý 3K không cấp qua Role tổng — quản lý tại Quản trị Kinh doanh → Cài đặt (Cơ cấu tổ chức & Bổ nhiệm).</p>
            <div className="mt-2 max-h-96 overflow-y-auto border rounded p-2">
              {PERMISSION_GROUPS.filter((g) => !BIZ_ORG_GROUPS.includes(g)).map((g) => {
                const items = ROLE_PERMISSIONS.filter((p) => p.group === g);
                const granted = items.filter((p) => effective.has(p.key));
                if (granted.length === 0) return null;
                return (
                  <div key={g} className="mb-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">{g} ({granted.length}/{items.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {items.map((p) => (
                        <span
                          key={p.key}
                          title={p.label}
                          className={`text-[11px] px-1.5 py-0.5 rounded border ${
                            effective.has(p.key)
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-muted/40 border-border text-muted-foreground line-through"
                          }`}
                        >
                          {p.key}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="text-sm font-semibold mb-2">Kiểm tra khớp quyền (toàn hệ thống)</div>
        {audit.length === 0 ? (
          <div className="text-xs text-emerald-600">✓ Tất cả role và quyền riêng đều khớp dependency.</div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {audit.map((row, i) => (
              <div key={i} className="rounded border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-2 text-xs">
                <div className="font-medium">{row.kind}: {row.name}</div>
                <ul className="mt-1 space-y-0.5 text-muted-foreground">
                  {row.issues.map((it) => (
                    <li key={it.key}>
                      <span className="font-mono">{it.key}</span> — thiếu quyền cha:{" "}
                      <span className="font-mono text-amber-700 dark:text-amber-400">{it.missing.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardContent></Card>
  );
}

// --------- All accounts ---------
function AllAccountsTab({ users, canLock }: { users: User[]; canLock: boolean }) {
  const s = useAuth();
  const [editing, setEditing] = useState<User | null>(null);

  return (<>
    <Card><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
          <th className="text-left font-medium px-4 py-2.5">Họ tên</th>
          <th className="text-left font-medium px-4 py-2.5">Tên đăng nhập</th>
          <th className="text-left font-medium px-4 py-2.5">Email</th>
          <th className="text-left font-medium px-4 py-2.5">SĐT</th>
          <th className="text-left font-medium px-4 py-2.5">Role</th>
          <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
          <th className="text-left font-medium px-4 py-2.5">Ngày tạo</th>
          <th className="text-right font-medium px-4 py-2.5"></th>
        </tr></thead>
        <tbody className="divide-y">
          {users.map((u) => {
            const role = s.roles.find((r) => r.id === u.roleId);
            return (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-medium">
                  <div className="flex items-center gap-2">
                    {u.fullName}
                    {u.system && <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" />Tài khoản hệ thống</Badge>}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.username}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.email || "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.phone || "—"}</td>
                <td className="px-4 py-2.5">{role?.name || <span className="text-muted-foreground italic">Chưa gán</span>}</td>
                <td className="px-4 py-2.5"><StatusBadge value={u.status} /></td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <Button size="icon" variant="ghost" title="Chi tiết / Sửa" onClick={() => setEditing(u)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {!u.system && canLock && (
                    u.status === "Tạm khóa" ? (
                      <Button size="icon" variant="ghost" title="Mở khóa" onClick={async () => { try { await s.setStatus(u.id,'Đang hoạt động'); toast.success('Đã mở khóa hồ sơ.'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Không mở khóa được.'); } }}>
                        <Unlock className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" title="Khóa" onClick={async () => { try { await s.setStatus(u.id,'Tạm khóa'); toast.success('Đã khóa tài khoản.'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Không khóa được.'); } }}>
                        <Lock className="h-3.5 w-3.5" />
                      </Button>
                    )
                  )}
                  {!u.system && (
                    <Button size="icon" variant="ghost" title="Xóa" onClick={() => {
                      if (confirm(`Xóa tài khoản ${u.username}?`)) s.removeUser(u.id);
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
          {users.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">Chưa có tài khoản.</td></tr>}
        </tbody>
      </table>
    </CardContent></Card>
    {editing && <UserEditDialog user={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

// --------- User Edit ---------
function UserEditDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const s = useAuth();
  const { isSuperAdmin, can } = useCurrentUser();
  const canReset = isSuperAdmin || can("settings.user_reset_password");
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({
    fullName: user.fullName, email: user.email || "", phone: user.phone || "",
    desiredPosition: user.desiredPosition || "", notes: user.notes || "",
    roleId: user.roleId || "", status: user.status,
    useCustom: !!user.useCustom,
  });
  const [perms, setPerms] = useState<PermissionKey[]>(user.customPermissions || []);
  const [newPwd, setNewPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const isSystem = !!user.system;

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
    await s.updateUser(user.id, {
      fullName: form.fullName, phone: form.phone || undefined,
      desiredPosition: form.desiredPosition || undefined, notes: form.notes || undefined,
    });
    if (!isSystem) {
      const approving = user.status === 'Chờ duyệt' && form.status === 'Đang hoạt động';
      if (!approving && form.roleId && form.roleId !== user.roleId) await s.setRole(user.id, form.roleId);
      if (form.status !== user.status) {
        if (user.status === 'Chờ duyệt' && form.status === 'Đang hoạt động') {
          const result = await s.approve(user.id, form.roleId !== user.roleId ? form.roleId || undefined : undefined);
          if (!result.emailConfirmed) toast.info('Đã duyệt hồ sơ; nhân viên vẫn cần xác nhận email trước khi đăng nhập.');
        } else await s.setStatus(user.id, form.status);
      }
      await s.setUseCustom(user.id, form.useCustom);
      if (form.useCustom) await s.setCustomPerms(user.id, perms);
    }
    toast.success("Đã lưu");
    onClose();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Không lưu được tài khoản.'); }
    finally { setSaving(false); }
  };

  const reset = async () => {
    if (resetting) return;
    const issues = passwordIssues(newPwd);
    if (issues.length) return toast.error(issues[0]);
    setResetting(true);
    try {
      const result = await s.resetPassword(user.id, newPwd);
      setNewPwd('');
      toast.success(result.ready ? 'Đã đặt lại mật khẩu cho tài khoản được chọn.' : 'Đã đặt lại mật khẩu; tài khoản vẫn cần hoàn tất xác nhận email hoặc điều kiện truy cập.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không reset được mật khẩu.");
    } finally { setResetting(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Chi tiết tài khoản — {user.fullName}</DialogTitle></DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="perms" disabled={isSystem}>Quyền</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><Label>Tên đăng nhập</Label><Input value={user.username} disabled /></div>
            <div><Label>Họ tên *</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><Label>Email đăng nhập</Label><Input value={form.email} readOnly /><p className="mt-1 text-xs text-muted-foreground">Email do hệ thống xác thực quản lý.</p></div>
            <div><Label>SĐT</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Vị trí</Label><Input value={form.desiredPosition} onChange={(e) => setForm({ ...form, desiredPosition: e.target.value })} /></div>
            <div>
              <Label>Role</Label>
              <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })} disabled={isSystem}>
                <SelectTrigger><SelectValue placeholder="Chọn role" /></SelectTrigger>
                <SelectContent>
                  {s.roles.filter(r=>r.catalogState!=='compatibility').map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AccountStatus })} disabled={isSystem}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label>Ghi chú</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </TabsContent>

          <TabsContent value="perms" className="mt-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded border bg-muted/30">
              <Checkbox checked={!form.useCustom} onCheckedChange={(c) => setForm({ ...form, useCustom: !c })} id="use-role" />
              <label htmlFor="use-role" className="text-sm cursor-pointer flex-1">
                <div className="font-medium">Dùng quyền theo role</div>
                <div className="text-xs text-muted-foreground">Tài khoản nhận toàn bộ quyền từ role đã chọn.</div>
              </label>
            </div>
            <div className="flex items-center gap-3 p-3 rounded border bg-muted/30">
              <Checkbox checked={form.useCustom} onCheckedChange={(c) => setForm({ ...form, useCustom: !!c })} id="use-custom" />
              <label htmlFor="use-custom" className="text-sm cursor-pointer flex-1">
                <div className="font-medium">Quyền bổ sung cá nhân</div>
                <div className="text-xs text-muted-foreground">Cộng thêm vào quyền của role, chạy song song — không thay thế hay ghi đè quyền role.</div>
              </label>
            </div>
            {form.useCustom && (
              <PermissionMatrix value={perms} onChange={setPerms} />
            )}
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-4">
            <AccountAuthPanel userId={user.id} email={user.email} />
            <div className="text-sm text-muted-foreground">Mật khẩu được lưu dạng hash an toàn. Không hiển thị mật khẩu gốc.</div>
            {canReset ? (
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-end">
                <div><Label htmlFor="admin-reset-password">Mật khẩu mới</Label><PasswordInput id="admin-reset-password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">8–200 ký tự, gồm chữ cái và chữ số.</p></div>
                <Button disabled={resetting || user.id === s.currentUserId} onClick={reset}><KeyRound className="h-4 w-4 mr-1.5" />{resetting ? 'Đang cập nhật…' : 'Đặt lại mật khẩu'}</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Bạn không có quyền reset mật khẩu tài khoản khác.</p>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Đóng</Button><Button disabled={saving} onClick={save}>{saving ? 'Đang lưu…' : 'Lưu'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --------- Pending ---------
function PendingTab({ users, canApprove }: { users: User[]; canApprove: boolean }) {
  const s = useAuth();
  const [assignFor, setAssignFor] = useState<User | null>(null);
  const [roleId, setRoleId] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState<User | null>(null);
  const approve = async (id: string, role?: string) => {
    if (busy) return;
    setBusy(true);
    try { const result = await s.approve(id, role); toast.success(result.ready ? 'Đã duyệt. Tài khoản có thể đăng nhập.' : 'Đã duyệt hồ sơ. Nhân viên cần xác nhận email trước khi đăng nhập.'); setAssignFor(null); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Không duyệt được tài khoản.'); }
    finally { setBusy(false); }
  };

  return (<>
    <Card><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
          <th className="text-left font-medium px-4 py-2.5">Họ tên</th>
          <th className="text-left font-medium px-4 py-2.5">Tên đăng nhập</th>
          <th className="text-left font-medium px-4 py-2.5">Email</th>
          <th className="text-left font-medium px-4 py-2.5">SĐT</th>
          <th className="text-left font-medium px-4 py-2.5">Vị trí mong muốn</th>
          <th className="text-left font-medium px-4 py-2.5">Ngày đăng ký</th>
          <th className="text-left font-medium px-4 py-2.5">Ghi chú</th>
          <th className="text-right font-medium px-4 py-2.5"></th>
        </tr></thead>
        <tbody className="divide-y">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-2.5 font-medium">{u.fullName}</td>
              <td className="px-4 py-2.5">{u.username}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{u.email || "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{u.phone || "—"}</td>
              <td className="px-4 py-2.5">{u.desiredPosition || "—"}</td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
              <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-[260px] truncate">{u.notes || "—"}</td>
              <td className="px-4 py-2.5 text-right whitespace-nowrap">
                {canApprove ? <>
                  <Button size="sm" variant="outline" onClick={() => { setAssignFor(u); setRoleId(""); }}>
                    Gán role rồi duyệt
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy} className="ml-1 text-emerald-700" onClick={() => void approve(u.id)}>
                    <Check className="h-4 w-4 mr-1" />Duyệt
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-1 text-rose-700" onClick={async () => { try { await s.reject(u.id); toast.success('Đã từ chối'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Không từ chối được tài khoản.'); } }}>
                    <X className="h-4 w-4 mr-1" />Từ chối
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setChecking(u)}>Kiểm tra xác thực</Button>
                </> : <span className="text-xs text-muted-foreground">Không có quyền</span>}
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">Không có tài khoản chờ duyệt.</td></tr>}
        </tbody>
      </table>
    </CardContent></Card>
    <Dialog open={!!assignFor} onOpenChange={(o) => !o && setAssignFor(null)}>
      <DialogContent>
        <DialogHeader><DialogTitle>Gán role cho {assignFor?.fullName}</DialogTitle></DialogHeader>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger><SelectValue placeholder="Chọn role" /></SelectTrigger>
          <SelectContent>{s.roles.filter(r=>r.catalogState!=='compatibility').map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setAssignFor(null)}>Huỷ</Button>
          <Button disabled={!roleId || busy} onClick={() => {
            if (assignFor && roleId) void approve(assignFor.id, roleId);
          }}>Duyệt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={!!checking} onOpenChange={open => !open && setChecking(null)}><DialogContent><DialogHeader><DialogTitle>Trạng thái xác thực — {checking?.fullName}</DialogTitle></DialogHeader>{checking && <AccountAuthPanel userId={checking.id} email={checking.email} />}</DialogContent></Dialog>
    </>
  );
}

// --------- Roles ---------
export function RolesTab({ canManage }: { canManage: boolean }) {
  const s = useAuth();
  const [editing, setEditing] = useState<Role | null>(null);
  const [adding, setAdding] = useState(false);
  const [functionGroup, setFunctionGroup] = useState("all");
  const linksQuery = useQuery({queryKey:["title-role-links",s.currentUserId],queryFn:titleRolesApi.read,retry:false});
  const positions = (roleId:string) => (linksQuery.data?.links??[]).filter(l=>l.role_id===roleId).map(l=>linksQuery.data?.titles.find(t=>t.id===l.title_id)?.name??"Chức vụ").join(", ") || "Chưa liên kết chức vụ";
  const me = s.users.find((u) => u.id === s.currentUserId) || null;
  const isSuperAdmin = !!me?.system || s.roles.find((r) => r.id === me?.roleId)?.name === "Super Admin";

  return <>
    <Select value={functionGroup} onValueChange={setFunctionGroup}><SelectTrigger aria-label="Nhóm chức năng Role" className="w-full sm:w-64 mb-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả nhóm chức năng</SelectItem>{ROLE_FUNCTION_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
    {canManage && (
      <div className="flex justify-end mb-3 gap-2">
        <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Thêm role</Button>
      </div>
    )}
    <div className="divide-y border-y md:hidden">{s.roles.filter(r => r.catalogState !== 'compatibility' && (functionGroup === 'all' || (r.catalogGroup ?? roleFunctionGroup(r.name)) === functionGroup)).map(r => <div key={r.id} className="py-4 space-y-2"><div className="flex items-start justify-between gap-3"><h3 className="font-medium">{r.name}</h3>{canManage && <Button size="sm" variant="outline" onClick={() => setEditing(r)}>Tùy chỉnh quyền</Button>}</div><p className="text-xs text-muted-foreground">{r.catalogGroup ?? roleFunctionGroup(r.name)} · {s.users.filter(u => u.roleId === r.id).length} tài khoản</p><p className="text-sm text-muted-foreground">{positions(r.id)}</p><p className="text-xs text-muted-foreground">{r.id === SUPER_ADMIN_ID ? 'Toàn quyền' : [...new Set(ROLE_PERMISSIONS.filter(p => r.permissions.includes(p.key)).map(p => p.group))].join(', ') || 'Chưa có chức năng'}</p></div>)}</div>
    <Card className="hidden md:block"><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
          <th className="text-left font-medium px-4 py-2.5">Tên role</th>
          <th className="text-left font-medium px-4 py-2.5">Vị trí áp dụng</th>
          <th className="text-left font-medium px-4 py-2.5">Số tài khoản</th>
          <th className="text-left font-medium px-4 py-2.5">Quyền</th>
          <th className="text-right font-medium px-4 py-2.5"></th>
        </tr></thead>
        <tbody className="divide-y">
          {s.roles.filter(r => r.catalogState !== 'compatibility' && (functionGroup === 'all' || (r.catalogGroup ?? roleFunctionGroup(r.name)) === functionGroup)).map((r) => {
            const count = s.users.filter((u) => u.roleIds?.includes(r.id) || u.roleId === r.id).length;
            return (
              <tr key={r.id}>
                <td className="px-4 py-2.5 font-medium">
                  <div className="flex items-center gap-2">{r.name}{r.system && <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" />Hệ thống</Badge>}</div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-[420px]">{r.catalogGroup ?? roleFunctionGroup(r.name)}<div className="mt-1">{positions(r.id)}</div>{!!r.catalogPending?.length && <p className="mt-1 text-destructive">{r.catalogPending.length} quyền chưa tự cấp: phạm vi/quy trình chưa được hỗ trợ.</p>}</td>
                <td className="px-4 py-2.5">{count}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{r.id === SUPER_ADMIN_ID ? "Toàn quyền" : [...new Set(ROLE_PERMISSIONS.filter(p => r.permissions.includes(p.key)).map(p => p.group))].join(", ") || "Chưa có chức năng"}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {canManage && <Button size="sm" variant="outline" onClick={() => setEditing(r)}>Tùy chỉnh quyền</Button>}
                  {canManage && !r.system && (
                    <Button size="icon" variant="ghost" className="ml-1" onClick={() => {
                      if (count > 0) return toast.error("Role đang có người dùng, không thể xóa.");
                      if (confirm("Xóa role này?")) s.removeRole(r.id);
                    }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CardContent></Card>
    {editing && <RoleEditDialog role={editing} onClose={() => setEditing(null)} />}
    {adding && <RoleEditDialog onClose={() => setAdding(false)} />}
    </>;
}

function RoleEditDialog({ role, onClose }: { role?: Role; onClose: () => void }) {
  const s = useAuth();
  const [name, setName] = useState(role?.name || "");
  const [desc, setDesc] = useState(role?.description || "");
  const [perms, setPerms] = useState<PermissionKey[]>(role?.permissions || []);
  const isSystem = !!role?.system;
  const isSuper = role?.id === SUPER_ADMIN_ID;

  const scopeRef = useRef<SignalScopeHandle>(null);
  const [savingRole, setSavingRole] = useState(false);
  const save = async () => {
    if (savingRole) return;
    if (!name.trim()) return toast.error("Nhập tên role");
    setSavingRole(true);
    try {
    if (role) {
      await s.updateRole(role.id, { name: isSystem ? role.name : name.trim(), description: desc.trim() || undefined, permissions: isSuper ? ALL_PERMS : perms });
      if (!isSuper) {
        try { await scopeRef.current?.save(); } catch (e: any) { return toast.error(e?.message || "Không lưu được phạm vi tín hiệu"); }
      }
    } else {
      await s.addRole({ name: name.trim(), description: desc.trim() || undefined, permissions: perms });
    }
    toast.success("Đã lưu");
    onClose();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Không lưu được Role."); } finally { setSavingRole(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{role ? `Chỉnh role: ${role.name}` : "Thêm role mới"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Tên role *</Label><Input value={name} onChange={(e) => setName(e.target.value)} disabled={isSystem} /></div>
          <div><Label>Mô tả</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        </div>
        <div className="mt-4">
          <Label className="mb-2 block">Phân quyền</Label>
          {isSuper ? <div className="text-sm p-3 rounded border bg-muted/30">Super Admin có toàn bộ quyền và không thể giảm quyền.</div>
            : <PermissionMatrix value={perms} onChange={setPerms} signalScope={<SignalScopeEditor ref={scopeRef} roleId={role?.id} />} />}
        </div>
        <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button disabled={savingRole} onClick={save}>{savingRole ? "Đang lưu…" : "Lưu"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --------- Matrix (read-only overview by role) ---------
export function MatrixTab({ canManage: _canManage }: { canManage: boolean }) {
  const s = useAuth();
  const [group, setGroup] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return ROLE_PERMISSIONS.filter((p) => {
      if (group !== "ALL" && p.group !== group) return false;
      if (!qq) return true;
      return p.label.toLowerCase().includes(qq) || p.key.toLowerCase().includes(qq) || (p.subGroup || "").toLowerCase().includes(qq);
    });
  }, [group, q]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Label className="text-sm">Nhóm quyền:</Label>
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            {PERMISSION_GROUPS.filter((g) => !BIZ_ORG_GROUPS.includes(g)).map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative w-[260px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm quyền..." className="pl-8 h-9" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} quyền · Chỉnh sửa ở tab Role.</span>
      </div>
      <Card><CardContent className="p-0 overflow-auto max-h-[70vh]">
        <table className="w-full text-xs">
          <thead className="text-[11px] text-muted-foreground bg-muted/60 sticky top-0">
            <tr>
              <th className="text-left font-medium px-3 py-2 sticky left-0 bg-muted/60 z-10 min-w-[260px]">Quyền</th>
              {s.roles.map((r) => <th key={r.id} className="text-center font-medium px-2 py-2 whitespace-nowrap">{r.name}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.key} className="hover:bg-muted/30">
                <td className="px-3 py-1.5 sticky left-0 bg-card z-10">
                  <div>{p.label}</div>
                  <div className="text-[10px] text-muted-foreground">{p.group} · <span className="font-mono">{p.key}</span></div>
                </td>
                {s.roles.map((r) => (
                  <td key={r.id} className="px-2 py-1.5 text-center">
                    {r.permissions.includes(p.key) ? <Check className="h-3.5 w-3.5 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground/40">·</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}

// --------- Permission Matrix editor (grouped + subgroup + search) ---------
function PermissionMatrix({ value, onChange, signalScope }: { value: PermissionKey[]; onChange: (v: PermissionKey[]) => void; signalScope?: React.ReactNode }) {
  const [q, setQ] = useState("");
  const set = new Set(value);
  const toggle = (k: PermissionKey) => {
    const next = new Set(set);
    if (next.has(k)) {
      // Untick: also untick all dependents (children that require this key)
      next.delete(k);
      for (const dep of allDependents(k)) next.delete(dep);
    } else {
      // Tick: also tick all parent dependencies
      next.add(k);
      for (const parent of allDependencies(k)) next.add(parent);
    }
    onChange([...next]);
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return ROLE_PERMISSIONS;
    return ROLE_PERMISSIONS.filter((p) =>
      p.label.toLowerCase().includes(qq) ||
      p.key.toLowerCase().includes(qq) ||
      p.group.toLowerCase().includes(qq) ||
      (p.subGroup || "").toLowerCase().includes(qq),
    );
  }, [q]);

  const groups = useMemo(() => {
    const m: Record<string, Record<string, typeof PERMISSIONS>> = {};
    for (const p of filtered) {
      const g = p.group;
      const sg = p.subGroup || "—";
      ((m[g] ||= {})[sg] ||= []).push(p);
    }
    // Keep the scope editor mounted while searching so unsaved selections survive.
    if (signalScope) m["Tín Hiệu Cơ Hội"] ||= {};
    return m;
  }, [filtered, signalScope]);

  const setMany = (keys: PermissionKey[], on: boolean) => {
    const next = new Set(set);
    if (on) {
      keys.forEach((k) => {
        next.add(k);
        for (const p of allDependencies(k)) next.add(p);
      });
    } else {
      keys.forEach((k) => {
        next.delete(k);
        for (const d of allDependents(k)) next.delete(d);
      });
    }
    onChange([...next]);
  };

  // Audit broken deps to surface visual warnings
  const broken = useMemo(() => new Map(auditDependencies(value).map((b) => [b.key, b.missing])), [value]);

  const totalSelected = value.filter((k) => !isBizOrgPerm(k)).length;
  const totalAll = ROLE_PERMISSIONS.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm quyền..." className="pl-8 h-9" />
        </div>
        <Button size="sm" variant="outline" onClick={() => onChange(ROLE_ALL_PERMS)}>Chọn tất cả</Button>
        <Button size="sm" variant="outline" onClick={() => onChange([])}>Bỏ chọn tất cả</Button>
        <Badge variant="secondary" className="ml-auto">{totalSelected}/{totalAll} quyền</Badge>
      </div>
      <p className="text-xs text-muted-foreground">Quyền Quản trị Kinh doanh (biz.*) và Quản lý 3K (k3.*) không cấp qua Role tổng — hệ thống tự cấp theo chức vụ và bổ nhiệm tại Quản trị Kinh doanh → Cài đặt → Cơ cấu tổ chức.</p>

      <Accordion type="multiple" className="space-y-2" defaultValue={Object.keys(groups)}>
        {Object.entries(groups).map(([g, subs]) => {
          const allKeys = Object.values(subs).flat().map((p) => p.key);
          const onCount = allKeys.filter((k) => set.has(k)).length;
          const allOn = onCount === allKeys.length && allKeys.length > 0;
          const someOn = onCount > 0 && !allOn;
          return (
            <AccordionItem key={g} value={g} className={`border rounded-lg overflow-hidden bg-card ${allKeys.length === 0 ? "hidden" : ""}`}>
              <div className="flex items-center gap-2 px-3 py-1 bg-muted/40 border-b">
                <Checkbox
                  checked={allOn ? true : (someOn ? "indeterminate" : false)}
                  onCheckedChange={(c) => setMany(allKeys, !!c)}
                  onClick={(e) => e.stopPropagation()}
                />
                <AccordionTrigger className="flex-1 hover:no-underline py-2 text-sm font-semibold">
                  <div className="flex items-center gap-2 w-full">
                    <span>{g}</span>
                    <Badge variant="outline" className="ml-auto mr-2 text-[10px] font-normal">{onCount}/{allKeys.length}</Badge>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className={`pb-0 ${g === "Tín Hiệu Cơ Hội" ? "data-[state=closed]:hidden" : ""}`} {...(g === "Tín Hiệu Cơ Hội" ? { forceMount: true as const } : {})}>
                {g === "Tín Hiệu Cơ Hội" && signalScope && <div className="px-3 pt-3 pb-2">{signalScope}</div>}
                {g === "Tín Hiệu Cơ Hội" ? (
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 px-4 py-3">
                    {[
                      "signal.create", "signal.view_all", "signal.assign", "signal.reassign", "signal.edit",
                      "signal.delete", "signal.manage", "signal.catalog", "signal.sale", "signal.report",
                    ].map((key) => Object.values(subs).flat().find((p) => p.key === key)).filter((p) => p !== undefined).map((p) => {
                      const miss = broken.get(p.key);
                      return (
                        <label key={p.key} className="flex items-start gap-2 text-sm cursor-pointer hover:text-foreground/90">
                          <Checkbox checked={set.has(p.key)} onCheckedChange={() => toggle(p.key)} className="mt-0.5" />
                          <span title={p.key} className={miss ? "text-amber-700 dark:text-amber-400" : ""}>
                            {p.label}
                            {miss && <span className="ml-1 text-[10px]" title={`Thiếu quyền cha: ${miss.join(", ")}`}>⚠</span>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : <div className="divide-y">
                  {Object.entries(subs).map(([sg, items]) => {
                    const ks = items.map((x) => x.key);
                    const subOn = ks.filter((k) => set.has(k)).length;
                    const subAll = subOn === ks.length;
                    const subSome = subOn > 0 && !subAll;
                    return (
                      <div key={sg} className="px-3 py-2.5">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            checked={subAll ? true : (subSome ? "indeterminate" : false)}
                            onCheckedChange={(c) => setMany(ks, !!c)}
                          />
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{sg}</div>
                          <span className="text-[10px] text-muted-foreground ml-auto">{subOn}/{ks.length}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 pl-6">
                          {items.map((p) => {
                            const miss = broken.get(p.key);
                            return (
                              <label key={p.key} className="flex items-start gap-2 text-sm cursor-pointer hover:text-foreground/90">
                                <Checkbox checked={set.has(p.key)} onCheckedChange={() => toggle(p.key)} className="mt-0.5" />
                                <span title={p.key} className={miss ? "text-amber-700 dark:text-amber-400" : ""}>
                                  {p.label}
                                  {miss && <span className="ml-1 text-[10px]" title={`Thiếu quyền cha: ${miss.join(", ")}`}>⚠</span>}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>}
              </AccordionContent>
            </AccordionItem>
          );
        })}
        {Object.keys(groups).length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">Không có quyền khớp với tìm kiếm.</div>
        )}
      </Accordion>
    </div>
  );
}

// --------- Change own password ---------
function ChangePasswordTab() {
  return <ChangePasswordForm />;
}
