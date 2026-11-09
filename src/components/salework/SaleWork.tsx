import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, EyeOff, ExternalLink, KeyRound, Search, Settings2, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { swApi, SW_ACTION_LABEL, type SwStaffRow } from "@/lib/saleWork/api";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));
const fmtDateTime = (s: string | null | undefined) => (s ? new Date(s).toLocaleString("vi-VN") : "—");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

async function copyText(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${what}`);
  } catch {
    toast.error(`Không sao chép được ${what}`);
  }
}

export function SaleWork() {
  const { can } = useCurrentUser();
  const canSettings = can("sale_work.manage_settings");
  const canCredentials = can("sale_work.manage_credentials");
  const canAudit = can("sale_work.view_audit");
  const [tab, setTab] = useState<"mine" | "settings">("mine");

  const config = useQuery({ queryKey: ["sw", "config"], queryFn: swApi.config });
  const mine = useQuery({ queryKey: ["sw", "mine"], queryFn: swApi.myCredential });

  const [password, setPassword] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  // Mật khẩu chỉ giữ trong state phiên hiện tại; đóng/ẩn là xóa khỏi bộ nhớ.
  const hidePassword = () => setPassword(null);
  useEffect(() => hidePassword, [mine.data?.updated_at]);

  const reveal = async () => {
    if (password) return hidePassword();
    setRevealing(true);
    try {
      setPassword(await swApi.revealPassword());
    } catch (e) { toast.error(errMsg(e)); } finally { setRevealing(false); }
  };

  const openApp = () => {
    const url = config.data?.url;
    if (!config.data?.enabled || !url || !/^https:\/\//.test(url)) {
      return toast.error("Liên kết Sale Work chưa được cấu hình hoặc đang tắt. Liên hệ người quản trị.");
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const cred = mine.data;
  return (
    <div className="space-y-4">
      <PageHeader title={config.data?.display_name || "Sale Work Zalo"} description="Thông tin truy cập phần mềm Sale Work của bạn" />
      {(canSettings || canCredentials || canAudit) && (
        <div className="flex gap-2">
          <Button variant={tab === "mine" ? "default" : "outline"} size="sm" onClick={() => setTab("mine")}>Tài khoản của tôi</Button>
          <Button variant={tab === "settings" ? "default" : "outline"} size="sm" onClick={() => setTab("settings")}>
            <Settings2 className="h-4 w-4 mr-1" />Cài đặt
          </Button>
        </div>
      )}

      {tab === "mine" && (
        <div className="max-w-lg mx-auto rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 font-semibold"><KeyRound className="h-5 w-5 text-primary" />Thông tin truy cập của bạn</div>
          {mine.isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : !cred ? (
            <p className="text-sm text-muted-foreground">Bạn chưa được cấp tài khoản Sale Work Zalo. Vui lòng liên hệ người quản trị.</p>
          ) : (
            <>
              {cred.status !== "active" && (
                <p className="text-sm rounded-md bg-destructive/10 text-destructive p-2">Thông tin truy cập đang bị tạm khóa. Liên hệ người quản trị.</p>
              )}
              <Field label="Tài khoản đăng nhập">
                <div className="flex gap-2">
                  <Input readOnly value={cred.username} className="font-mono" />
                  <Button variant="outline" size="icon" aria-label="Sao chép tài khoản" onClick={() => copyText(cred.username, "tài khoản")}><Copy className="h-4 w-4" /></Button>
                </div>
              </Field>
              <Field label="Mật khẩu">
                <div className="flex gap-2">
                  <Input readOnly type={password ? "text" : "password"} value={password ?? "••••••••"} className="font-mono" />
                  <Button variant="outline" size="icon" aria-label={password ? "Ẩn mật khẩu" : "Hiện mật khẩu"} disabled={revealing || cred.status !== "active"} onClick={reveal}>
                    {password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Sao chép mật khẩu" disabled={cred.status !== "active"}
                    onClick={async () => {
                      try {
                        const p = password ?? (await swApi.revealPassword());
                        await copyText(p, "mật khẩu");
                      } catch (e) { toast.error(errMsg(e)); }
                    }}><Copy className="h-4 w-4" /></Button>
                </div>
              </Field>
            </>
          )}
          <Button className="w-full h-12 text-base" onClick={openApp} disabled={!config.data?.enabled || !config.data?.url}>
            <ExternalLink className="h-5 w-5 mr-2" />Mở Sale Work Zalo
          </Button>
          {config.data?.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{config.data.description}</p>}
        </div>
      )}

      {tab === "settings" && (canSettings || canCredentials || canAudit) && (
        <div className="space-y-6 max-w-3xl">
          {canSettings && <ConfigSection />}
          {canCredentials && <StaffSection />}
          {canAudit && <AuditSection />}
        </div>
      )}
    </div>
  );
}

function ConfigSection() {
  const qc = useQueryClient();
  const config = useQuery({ queryKey: ["sw", "config"], queryFn: swApi.config });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (config.data) {
      setName(config.data.display_name ?? "Sale Work Zalo");
      setUrl(config.data.url ?? "");
      setDesc(config.data.description ?? "");
      setEnabled(!!config.data.enabled);
    }
  }, [config.data]);

  const save = async () => {
    const u = url.trim();
    if (u && !/^https:\/\/\S+$/.test(u)) return toast.error("URL phải bắt đầu bằng https:// và không chứa khoảng trắng");
    setBusy(true);
    try {
      await swApi.saveConfig(name.trim() || "Sale Work Zalo", u, desc.trim(), enabled);
      qc.invalidateQueries({ queryKey: ["sw", "config"] });
      toast.success("Đã lưu cấu hình");
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="font-semibold">Cấu hình phần mềm</div>
      <Field label="Tên hiển thị"><Input maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="URL truy cập phần mềm (https://)">
        <div className="flex gap-2">
          <Input inputMode="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Button variant="outline" className="shrink-0" disabled={!/^https:\/\/\S+$/.test(url.trim())}
            onClick={() => window.open(url.trim(), "_blank", "noopener,noreferrer")}>Mở thử</Button>
        </div>
      </Field>
      <Field label="Mô tả / hướng dẫn sử dụng"><Textarea rows={2} maxLength={1000} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" className="h-4 w-4" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Bật liên kết cho nhân viên
      </label>
      <Button disabled={busy} onClick={save}>{busy ? "Đang lưu…" : "Lưu cấu hình"}</Button>
    </div>
  );
}

function StaffSection() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [qText, setQText] = useState("");
  const [filter, setFilter] = useState<"" | "granted" | "not">("");
  useEffect(() => { const h = setTimeout(() => setQ(qText), 350); return () => clearTimeout(h); }, [qText]);
  const staff = useQuery({ queryKey: ["sw", "staff", q], queryFn: () => swApi.staffList(q) });
  const [editing, setEditing] = useState<SwStaffRow | null>(null);

  const rows = useMemo(() => (staff.data ?? []).filter((s) =>
    filter === "granted" ? s.granted : filter === "not" ? !s.granted : true), [staff.data, filter]);

  const revoke = async (s: SwStaffRow) => {
    if (!window.confirm(`Thu hồi thông tin truy cập Sale Work của ${s.full_name ?? "nhân sự này"}?`)) return;
    try {
      await swApi.revokeCredential(s.user_id);
      qc.invalidateQueries({ queryKey: ["sw", "staff"] });
      toast.success("Đã thu hồi");
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="font-semibold">Quản lý tài khoản nhân sự</div>
      <p className="text-sm text-muted-foreground">Mật khẩu được mã hóa và không bao giờ hiển thị lại cho quản trị — chỉ có thể thay thế bằng mật khẩu mới.</p>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm theo tên, tài khoản Base, email…" value={qText} onChange={(e) => setQText(e.target.value)} />
        </div>
        <select className="h-10 rounded-md border bg-background px-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="">Tất cả trạng thái</option>
          <option value="granted">Đã cấp</option>
          <option value="not">Chưa cấp</option>
        </select>
      </div>
      <div className="divide-y">
        {rows.map((s) => (
          <div key={s.user_id} className="py-2 flex flex-wrap items-center gap-2 text-sm">
            <div className="flex-1 min-w-40">
              <div className="font-medium">{s.full_name ?? s.base_username ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{s.position ?? s.base_username ?? ""}</div>
            </div>
            <div className="min-w-32 font-mono text-xs">{s.granted ? s.sw_username : "Chưa có tài khoản"}</div>
            {s.granted
              ? <Badge variant={s.sw_status === "active" ? "default" : "secondary"}>{s.sw_status === "active" ? "Đã cấp" : "Tạm khóa"}</Badge>
              : <Badge variant="outline">Chưa cấp</Badge>}
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                <UserPlus className="h-3.5 w-3.5 mr-1" />{s.granted ? "Sửa" : "Cấp tài khoản"}
              </Button>
              {s.granted && <Button size="sm" variant="outline" onClick={() => revoke(s)}>Thu hồi</Button>}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">Không có nhân sự phù hợp.</p>}
      </div>
      {editing && <CredentialDialog staff={editing} onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["sw", "staff"] }); }} />}
    </div>
  );
}

function CredentialDialog({ staff, onClose, onSaved }: { staff: SwStaffRow; onClose: () => void; onSaved: () => void }) {
  const [username, setUsername] = useState(staff.sw_username ?? "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"active" | "locked">(staff.sw_status ?? "active");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (username.trim().length < 3) return toast.error("Tên tài khoản tối thiểu 3 ký tự");
    if (!staff.granted && password.length < 6) return toast.error("Mật khẩu ban đầu tối thiểu 6 ký tự");
    if (password && password.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");
    setBusy(true);
    try {
      await swApi.saveCredential(staff.user_id, username.trim(), password, status);
      toast.success(staff.granted ? "Đã cập nhật" : "Đã cấp tài khoản");
      onSaved();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{staff.granted ? "Sửa" : "Cấp"} tài khoản Sale Work — {staff.full_name ?? ""}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Tên tài khoản Sale Work *"><Input maxLength={100} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="VD: sale.nguyenvana" /></Field>
          <Field label={staff.granted ? "Mật khẩu mới (để trống nếu giữ nguyên)" : "Mật khẩu ban đầu *"}>
            <Input type="password" autoComplete="new-password" maxLength={100} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Trạng thái">
            <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="active">Đang dùng</option>
              <option value="locked">Tạm khóa hiển thị</option>
            </select>
          </Field>
          <Button className="w-full" disabled={busy} onClick={save}>{busy ? "Đang lưu…" : "Lưu"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuditSection() {
  const audit = useQuery({ queryKey: ["sw", "audit"], queryFn: swApi.audit });
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Nhật ký quản trị</div>
      <p className="text-sm text-muted-foreground">Nhật ký không bao giờ chứa giá trị mật khẩu.</p>
      {(audit.data ?? []).map((e) => (
        <div key={e.id} className="text-sm flex flex-wrap gap-x-2">
          <span className="text-muted-foreground shrink-0">{fmtDateTime(e.created_at)}</span>
          <span className="font-medium">{e.actor_name ?? "—"}</span>
          <span>{SW_ACTION_LABEL[e.action] ?? e.action}</span>
          {e.target_name && e.target_name !== e.actor_name && <span className="text-muted-foreground">→ {e.target_name}</span>}
        </div>
      ))}
      {(audit.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Chưa có nhật ký.</p>}
    </div>
  );
}
