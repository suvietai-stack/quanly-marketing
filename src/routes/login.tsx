import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Đăng nhập — Base Marketing" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const currentUserId = useAuth((s) => s.currentUserId);

  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId) navigate({ to: "/" });
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
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-3">B</div>
          <h1 className="text-2xl font-semibold tracking-tight">Base Marketing</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý công việc</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Tên đăng nhập hoặc email</Label>
                <Input value={username} onChange={(e) => setU(e.target.value)} autoFocus required />
              </div>
              <div>
                <Label>Mật khẩu</Label>
                <Input type="password" value={password} onChange={(e) => setP(e.target.value)} required />
              </div>
              {err && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">{err}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4 mr-1.5" />{loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Link to="/register" className="text-primary hover:underline">Đăng ký tài khoản mới</Link>
                <span className="text-muted-foreground cursor-not-allowed" title="Sắp ra mắt">Quên mật khẩu</span>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Tài khoản hệ thống mặc định: <span className="font-mono">Admin / Suviet888@@@</span>
        </p>
      </div>
    </div>
  );
}
