import { useState, useMemo } from "react";
import {
  useAuth, useCurrentUser, type Role, type User, type AccountStatus,
  type PermissionKey, PERMISSIONS, PERMISSION_GROUPS, ALL_PERMS,
  SUPER_ADMIN_ID,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Pencil, Trash2, Lock, Unlock, KeyRound, Shield, ShieldCheck, X, Check,
} from "lucide-react";
import { toast } from "sonner";

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
  const canApprove = isSuperAdmin || can("settings.account_approve");
  const canLock = isSuperAdmin || can("settings.account_lock");

  const pending = s.users.filter((u) => u.status === "Chờ duyệt");
  const others = s.users.filter((u) => u.status !== "Chờ duyệt");

  return (
    <Tabs defaultValue="all">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="all">Tất cả tài khoản ({s.users.length})</TabsTrigger>
        <TabsTrigger value="pending">Chờ duyệt {pending.length > 0 && <Badge className="ml-1.5" variant="secondary">{pending.length}</Badge>}</TabsTrigger>
        <TabsTrigger value="roles">Role</TabsTrigger>
        <TabsTrigger value="matrix">Ma trận phân quyền</TabsTrigger>
        {me && <TabsTrigger value="me">Đổi mật khẩu</TabsTrigger>}
      </TabsList>

      <TabsContent value="all" className="mt-4">
        <AllAccountsTab users={others.concat(pending)} canLock={canLock} />
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <PendingTab users={pending} canApprove={canApprove} />
      </TabsContent>

      <TabsContent value="roles" className="mt-4">
        <RolesTab canManage={canManageRoles} />
      </TabsContent>

      <TabsContent value="matrix" className="mt-4">
        <MatrixTab canManage={canManageRoles} />
      </TabsContent>

      {me && (
        <TabsContent value="me" className="mt-4">
          <ChangePasswordTab />
        </TabsContent>
      )}
    </Tabs>
  );
}

// --------- All accounts ---------
function AllAccountsTab({ users, canLock }: { users: User[]; canLock: boolean }) {
  const s = useAuth();
  const [editing, setEditing] = useState<User | null>(null);

  return (
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
                      <Button size="icon" variant="ghost" title="Mở khóa" onClick={() => s.setStatus(u.id, "Đang hoạt động")}>
                        <Unlock className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" title="Khóa" onClick={() => s.setStatus(u.id, "Tạm khóa")}>
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
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({
    fullName: user.fullName, email: user.email || "", phone: user.phone || "",
    desiredPosition: user.desiredPosition || "", notes: user.notes || "",
    roleId: user.roleId || "", status: user.status,
    useCustom: !!user.useCustom,
  });
  const [perms, setPerms] = useState<PermissionKey[]>(user.customPermissions || []);
  const [newPwd, setNewPwd] = useState("");
  const isSystem = !!user.system;

  const save = () => {
    s.updateUser(user.id, {
      fullName: form.fullName, email: form.email || undefined, phone: form.phone || undefined,
      desiredPosition: form.desiredPosition || undefined, notes: form.notes || undefined,
    });
    if (!isSystem) {
      if (form.roleId && form.roleId !== user.roleId) s.setRole(user.id, form.roleId);
      if (form.status !== user.status) s.setStatus(user.id, form.status);
      s.setUseCustom(user.id, form.useCustom);
      if (form.useCustom) s.setCustomPerms(user.id, perms);
    }
    toast.success("Đã lưu");
    onClose();
  };

  const reset = async () => {
    if (newPwd.length < 6) return toast.error("Mật khẩu mới tối thiểu 6 ký tự");
    await s.resetPassword(user.id, newPwd);
    setNewPwd("");
    toast.success("Đã reset mật khẩu");
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
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>SĐT</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Vị trí</Label><Input value={form.desiredPosition} onChange={(e) => setForm({ ...form, desiredPosition: e.target.value })} /></div>
            <div>
              <Label>Role</Label>
              <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })} disabled={isSystem}>
                <SelectTrigger><SelectValue placeholder="Chọn role" /></SelectTrigger>
                <SelectContent>
                  {s.roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
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
                <div className="font-medium">Tùy chỉnh quyền riêng</div>
                <div className="text-xs text-muted-foreground">Quyền riêng sẽ ghi đè quyền mặc định của role.</div>
              </label>
            </div>
            {form.useCustom && (
              <PermissionMatrix value={perms} onChange={setPerms} />
            )}
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-4">
            <div className="text-sm text-muted-foreground">Mật khẩu được lưu dạng hash (SHA-256 + salt). Không hiển thị mật khẩu gốc.</div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-end">
              <div><Label>Mật khẩu mới</Label><Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="≥ 6 ký tự" /></div>
              <Button onClick={reset}><KeyRound className="h-4 w-4 mr-1.5" />Reset mật khẩu</Button>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Đóng</Button><Button onClick={save}>Lưu</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --------- Pending ---------
function PendingTab({ users, canApprove }: { users: User[]; canApprove: boolean }) {
  const s = useAuth();
  const [assignFor, setAssignFor] = useState<User | null>(null);
  const [roleId, setRoleId] = useState("");

  return (
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
                  <Button size="sm" variant="ghost" className="ml-1 text-emerald-700" onClick={() => { s.approve(u.id); toast.success("Đã duyệt"); }}>
                    <Check className="h-4 w-4 mr-1" />Duyệt
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-1 text-rose-700" onClick={() => { s.reject(u.id); toast.success("Đã từ chối"); }}>
                    <X className="h-4 w-4 mr-1" />Từ chối
                  </Button>
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
          <SelectContent>{s.roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setAssignFor(null)}>Huỷ</Button>
          <Button disabled={!roleId} onClick={() => {
            if (assignFor && roleId) { s.approve(assignFor.id, roleId); toast.success("Đã duyệt"); setAssignFor(null); }
          }}>Duyệt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

// --------- Roles ---------
function RolesTab({ canManage }: { canManage: boolean }) {
  const s = useAuth();
  const [editing, setEditing] = useState<Role | null>(null);
  const [adding, setAdding] = useState(false);

  return <>
    {canManage && (
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Thêm role</Button>
      </div>
    )}
    <Card><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
          <th className="text-left font-medium px-4 py-2.5">Tên role</th>
          <th className="text-left font-medium px-4 py-2.5">Mô tả</th>
          <th className="text-left font-medium px-4 py-2.5">Số tài khoản</th>
          <th className="text-left font-medium px-4 py-2.5">Quyền</th>
          <th className="text-right font-medium px-4 py-2.5"></th>
        </tr></thead>
        <tbody className="divide-y">
          {s.roles.map((r) => {
            const count = s.users.filter((u) => u.roleId === r.id).length;
            return (
              <tr key={r.id}>
                <td className="px-4 py-2.5 font-medium">
                  <div className="flex items-center gap-2">{r.name}{r.system && <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" />Hệ thống</Badge>}</div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-[420px]">{r.description || "—"}</td>
                <td className="px-4 py-2.5">{count}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{r.permissions.length === ALL_PERMS.length ? "Toàn quyền" : `${r.permissions.length} quyền`}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {canManage && <Button size="sm" variant="outline" onClick={() => setEditing(r)}>Chỉnh quyền</Button>}
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

  const save = () => {
    if (!name.trim()) return toast.error("Nhập tên role");
    if (role) {
      s.updateRole(role.id, { name: isSystem ? role.name : name.trim(), description: desc.trim() || undefined, permissions: isSuper ? ALL_PERMS : perms });
    } else {
      s.addRole({ name: name.trim(), description: desc.trim() || undefined, permissions: perms });
    }
    toast.success("Đã lưu");
    onClose();
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
            : <PermissionMatrix value={perms} onChange={setPerms} />}
        </div>
        <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={save}>Lưu</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --------- Matrix (read-only overview by role) ---------
function MatrixTab({ canManage: _canManage }: { canManage: boolean }) {
  const s = useAuth();
  const [group, setGroup] = useState<string>("ALL");
  const filtered = group === "ALL" ? PERMISSIONS : PERMISSIONS.filter((p) => p.group === group);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm">Nhóm quyền:</Label>
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            {PERMISSION_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">Bảng tổng hợp quyền theo từng role. Để chỉnh sửa, vào tab Role.</span>
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

// --------- Permission Matrix editor ---------
function PermissionMatrix({ value, onChange }: { value: PermissionKey[]; onChange: (v: PermissionKey[]) => void }) {
  const set = new Set(value);
  const toggle = (k: PermissionKey) => {
    const next = new Set(set);
    if (next.has(k)) next.delete(k); else next.add(k);
    onChange([...next]);
  };
  const groups = useMemo(() => {
    const m: Record<string, typeof PERMISSIONS> = {};
    for (const p of PERMISSIONS) (m[p.group] ||= []).push(p);
    return m;
  }, []);

  const toggleGroup = (g: string, on: boolean) => {
    const ks = (groups[g] || []).map((x) => x.key);
    const next = new Set(set);
    if (on) ks.forEach((k) => next.add(k)); else ks.forEach((k) => next.delete(k));
    onChange([...next]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onChange(ALL_PERMS)}>Chọn tất cả</Button>
        <Button size="sm" variant="outline" onClick={() => onChange([])}>Bỏ chọn tất cả</Button>
      </div>
      {PERMISSION_GROUPS.map((g) => {
        const ks = groups[g] || [];
        const allOn = ks.every((p) => set.has(p.key));
        return (
          <div key={g} className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b">
              <Checkbox checked={allOn} onCheckedChange={(c) => toggleGroup(g, !!c)} />
              <div className="font-medium text-sm">{g}</div>
              <div className="text-xs text-muted-foreground ml-auto">{ks.filter((p) => set.has(p.key)).length}/{ks.length}</div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 p-3">
              {ks.map((p) => (
                <label key={p.key} className="flex items-start gap-2 text-sm cursor-pointer">
                  <Checkbox checked={set.has(p.key)} onCheckedChange={() => toggle(p.key)} className="mt-0.5" />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --------- Change own password ---------
function ChangePasswordTab() {
  const s = useAuth();
  const [oldP, setOld] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");

  const submit = async () => {
    if (n1.length < 6) return toast.error("Mật khẩu mới tối thiểu 6 ký tự");
    if (n1 !== n2) return toast.error("Mật khẩu xác nhận không khớp");
    const res = await s.changeOwnPassword(oldP, n1);
    if (!res.ok) return toast.error(res.error);
    toast.success("Đã đổi mật khẩu");
    setOld(""); setN1(""); setN2("");
  };

  return (
    <Card><CardContent className="p-5 max-w-md space-y-3">
      <div><Label>Mật khẩu hiện tại</Label><Input type="password" value={oldP} onChange={(e) => setOld(e.target.value)} /></div>
      <div><Label>Mật khẩu mới</Label><Input type="password" value={n1} onChange={(e) => setN1(e.target.value)} /></div>
      <div><Label>Xác nhận mật khẩu mới</Label><Input type="password" value={n2} onChange={(e) => setN2(e.target.value)} /></div>
      <Button onClick={submit}><KeyRound className="h-4 w-4 mr-1.5" />Đổi mật khẩu</Button>
    </CardContent></Card>
  );
}
