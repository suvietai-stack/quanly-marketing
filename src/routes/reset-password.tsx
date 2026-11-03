import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { passwordIssues } from "@/lib/password";
import { useBranding, BrandMark } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { hasRecoverySession, clearRecoverySession } from '@/lib/recovery-session';
import { authErrorMessage } from '@/lib/auth-errors';

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Đặt lại mật khẩu — Base Sứ Việt" },
    { name: "description", content: "Đặt lại mật khẩu tài khoản Base Sứ Việt bằng liên kết khôi phục." },
    { property: "og:title", content: "Đặt lại mật khẩu — Base Sứ Việt" },
    { property: "og:description", content: "Đặt lại mật khẩu tài khoản Base Sứ Việt bằng liên kết khôi phục." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPasswordPage,
});

type Phase = "checking" | "ready" | "invalid" | "done";

function ResetPasswordPage() {
  const brand = useBranding();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("checking");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only an SDK-accepted recovery event plus a revalidated matching user opens this form.
    let active = true;
    const check = async () => { if (await hasRecoverySession() && active) setPhase('ready'); };
    void check();
    const interval = setInterval(() => void check(), 300);
    const timer = setTimeout(() => {
      setPhase((p) => (p === "checking" ? "invalid" : p));
    }, 4000);
    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || phase !== 'ready') return;
    const issues = passwordIssues(n1);
    if (issues.length) {
      setErr(issues[0]);
      return;
    }
    if (n1 !== n2) {
      setErr("Mật khẩu xác nhận không khớp.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      if (!await hasRecoverySession()) { setPhase('invalid'); return; }
      // Trang khôi phục: không gửi current_password (phiên recovery được miễn).
      const { error } = await supabase.auth.updateUser({ password: n1 });
      if (error) {
        setErr(authErrorMessage(error, 'password'));
        return;
      }
      // Kết thúc phiên khôi phục — người dùng đăng nhập lại bằng mật khẩu mới.
      await supabase.auth.signOut();
      clearRecoverySession();
      setPhase("done");
      toast.success("Đã đặt lại mật khẩu thành công");
    } catch { setErr('Không cập nhật được mật khẩu lúc này. Vui lòng thử lại.'); } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page flex min-h-svh items-center justify-center px-4 py-10 sm:py-14">
      <div className="relative w-full max-w-[440px]">
        <Card className="login-card overflow-hidden rounded-3xl">
          <CardContent className="px-6 py-8 sm:px-10 sm:py-10">
            <header className="mb-8 text-center">
              <BrandMark b={brand} className="mx-auto mb-5 h-16 w-28 rounded-none text-2xl" />
              <h1 className="login-title text-2xl font-semibold leading-snug">Đặt lại mật khẩu</h1>
              <span className="mx-auto mt-5 block h-1 w-8 rounded-full bg-chipi-orange" aria-hidden="true" />
            </header>

            {phase === "checking" && (
              <p className="text-center text-sm text-muted-foreground">Đang kiểm tra liên kết khôi phục…</p>
            )}

            {phase === "invalid" && (
              <div className="space-y-4 text-center">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Liên kết khôi phục không hợp lệ, đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu liên kết mới từ màn hình đăng nhập.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Về trang đăng nhập</Link>
                </Button>
              </div>
            )}

            {phase === "done" && (
              <div className="space-y-4 text-center">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Mật khẩu của bạn đã được đặt lại. Vui lòng đăng nhập lại bằng mật khẩu mới.
                </p>
                <Button className="w-full" onClick={() => navigate({ to: "/login" })}>Đăng nhập lại</Button>
              </div>
            )}

            {phase === "ready" && (
              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="rp-new" className="text-sm font-medium">Mật khẩu mới</Label>
                  <PasswordInput id="rp-new" className="login-input h-12 rounded-xl" autoComplete="new-password" value={n1} onChange={(e) => setN1(e.target.value)} required autoFocus />
                  <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự, gồm cả chữ cái và chữ số.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp-confirm" className="text-sm font-medium">Xác nhận mật khẩu mới</Label>
                  <PasswordInput id="rp-confirm" className="login-input h-12 rounded-xl" autoComplete="new-password" value={n2} onChange={(e) => setN2(e.target.value)} required />
                </div>
                {err && <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive">{err}</div>}
                <Button type="submit" className="login-submit h-12 w-full rounded-xl text-sm font-semibold" disabled={loading}>
                  {loading ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <KeyRound aria-hidden="true" />}
                  {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">{brand.org_name}</p>
      </div>
    </main>
  );
}
