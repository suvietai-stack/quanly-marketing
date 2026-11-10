import { useBranding, BrandMark } from "@/lib/branding";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { readRememberChoice } from "@/lib/remember-session";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, LockKeyhole, UserRound, LoaderCircle, MailQuestion } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { isFakeEmail } from "@/lib/password";
import { toast } from "sonner";
import { authErrorMessage } from '@/lib/auth-errors';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

const FORGOT_COOLDOWN_MS = 60_000;
const FORGOT_COOLDOWN_KEY = "forgot_password_last_at";

function ForgotPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const value = email.trim().toLowerCase();
    if (isFakeEmail(value)) {
      toast.error("Địa chỉ email nội bộ không nhận được thư khôi phục. Vui lòng liên hệ Admin để được hỗ trợ.");
      return;
    }
    // Chống lạm dụng: tối thiểu 60 giây giữa hai lần gửi trên cùng trình duyệt.
    try {
      const last = Number(localStorage.getItem(FORGOT_COOLDOWN_KEY) || 0);
      if (Date.now() - last < FORGOT_COOLDOWN_MS) {
        toast.error("Bạn vừa yêu cầu khôi phục. Vui lòng đợi khoảng 1 phút rồi thử lại.");
        return;
      }
    } catch { /* ignore */ }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) { toast.error(authErrorMessage(error, 'send')); return; }
      try { localStorage.setItem(FORGOT_COOLDOWN_KEY, String(Date.now())); } catch { /* ignore */ }
      // Phản hồi trung tính: không tiết lộ email có tồn tại hay không.
      setSent(true);
    } catch { toast.error('Không gửi được email lúc này. Vui lòng thử lại.'); } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setSent(false); setEmail(""); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Khôi phục mật khẩu</DialogTitle></DialogHeader>
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nếu email này thuộc một tài khoản đang hoạt động, hệ thống đã gửi liên kết khôi phục.
              Vui lòng kiểm tra hộp thư (kể cả mục Spam) và làm theo hướng dẫn.
            </p>
            <DialogFooter><Button onClick={onClose}>Đã hiểu</Button></DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email khôi phục</Label>
              <Input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@congty.vn" required autoFocus />
              <p className="text-xs text-muted-foreground">Nhập email đã đăng ký với tài khoản của bạn.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Huỷ</Button>
              <Button type="submit" disabled={loading}>
                {loading && <LoaderCircle aria-hidden="true" className="mr-1.5 h-4 w-4 motion-safe:animate-spin" />}
                {loading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Đăng nhập — Base Sứ Việt" },
    { name: "description", content: "Đăng nhập Base Sứ Việt — nền tảng quản lý công việc và tín hiệu của Sứ Việt." },
    { property: "og:title", content: "Đăng nhập — Base Sứ Việt" },
    { property: "og:description", content: "Truy cập nền tảng quản lý công việc và tín hiệu Base Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LoginPage,
});

function goBack(navigate: ReturnType<typeof useNavigate>) {
  let back: string | null = null;
  try { back = sessionStorage.getItem("after_login"); sessionStorage.removeItem("after_login"); } catch { /* ignore */ }
  if (back && back.startsWith("/") && !back.startsWith("//") && !back.startsWith("/login")) {
    const [path, qs = ""] = back.split("?");
    navigate({ to: path as "/", search: Object.fromEntries(new URLSearchParams(qs)) as never });
  } else navigate({ to: "/" });
}

function LoginPage() {
  const brand = useBranding();
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const currentUserId = useAuth((s) => s.currentUserId);
  const loaded = useAuth(s => s.loaded);
  const status = useAuth(s => s.users.find(u => u.id === s.currentUserId)?.status);

  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [remember, setRemember] = useState(readRememberChoice);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (currentUserId && loaded && status === 'Đang hoạt động' && !loading) goBack(navigate);
  }, [currentUserId, loaded, status, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setLoading(true);
    const res = await login(username.trim(), password, remember);
    setLoading(false);
    if (!res.ok) {
      setErr(res.error || "Lỗi đăng nhập");
      return;
    }
    toast.success("Đăng nhập thành công");
    // Điều hướng do effect theo currentUserId đảm nhận (tránh điều hướng hai lần)
  };

  return (
    <main className="login-page flex min-h-svh items-center justify-center px-4 py-10 sm:py-14">
      <div className="relative w-full max-w-[440px]">
        <Card className="login-card overflow-hidden rounded-3xl">
          <CardContent className="px-6 py-8 sm:px-10 sm:py-10">
            <header className="mb-8 text-center">
              <BrandMark b={brand} className="mx-auto mb-5 h-16 w-28 rounded-none text-2xl" />
              <h1 className="login-title text-2xl font-semibold leading-snug">{brand.app_name === "Base Marketing" ? "Base Sứ Việt" : brand.app_name}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{brand.description}</p>
              <span className="mx-auto mt-5 block h-1 w-8 rounded-full bg-chipi-orange" aria-hidden="true" />
            </header>
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-sm font-medium">Tên đăng nhập hoặc email</Label>
                <div className="relative">
                  <UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                  <Input id="login-username" className="login-input h-12 rounded-xl pl-11" value={username} onChange={(e) => setU(e.target.value)} autoFocus required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium">Mật khẩu</Label>
                <div className="relative">
                  <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-[18px] -translate-y-1/2 text-muted-foreground" />
                  <PasswordInput id="login-password" className="login-input h-12 rounded-xl pl-11" value={password} onChange={(e) => setP(e.target.value)} required />
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="login-remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="login-remember" className="text-xs sm:text-sm font-normal leading-snug text-muted-foreground cursor-pointer">
                  Ghi nhớ đăng nhập trên thiết bị này (tối đa 90 ngày)
                </Label>
              </div>
              {err && <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive">{err}</div>}
              <Button type="submit" className="login-submit h-12 w-full rounded-xl text-sm font-semibold" disabled={loading}>
                {loading ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <LogIn aria-hidden="true" />}
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border/70 pt-4 text-xs sm:text-sm">
                <Button asChild variant="link" className="h-auto min-h-10 p-0 text-xs font-medium sm:text-sm">
                  <Link to="/register">Đăng ký tài khoản mới</Link>
                </Button>
                <Button type="button" variant="link" className="h-auto min-h-10 p-0 text-xs font-medium sm:text-sm" onClick={() => setForgotOpen(true)}>
                  <MailQuestion aria-hidden="true" className="mr-1 h-3.5 w-3.5" />Quên mật khẩu
                </Button>
              </div>
              <Button type="button" variant="link" className="h-auto w-full whitespace-normal text-xs" onClick={() => setConfirmationOpen(true)}>Gửi lại email xác nhận tài khoản</Button>
            </form>
            <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
            <ConfirmationDialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)} />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">{brand.org_name}</p>
      </div>
    </main>
  );
}
