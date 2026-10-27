import { useBranding, BrandMark } from "@/lib/branding";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, LockKeyhole, UserRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

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

  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId) goBack(navigate);
  }, [currentUserId, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await login(username.trim(), password);
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
                  <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                  <Input id="login-password" className="login-input h-12 rounded-xl pl-11" type="password" value={password} onChange={(e) => setP(e.target.value)} required />
                </div>
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
                <span className="inline-flex min-h-10 cursor-not-allowed items-center text-muted-foreground transition-colors hover:text-foreground" title="Sắp ra mắt" aria-disabled="true">Quên mật khẩu</span>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">{brand.org_name}</p>
      </div>
    </main>
  );
}
