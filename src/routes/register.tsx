import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Đăng ký — Base Marketing" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [f, setF] = useState({
    fullName: "", email: "", phone: "", desiredPosition: "", notes: "",
    username: "", password: "", confirm: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (p: Partial<typeof f>) => setF({ ...f, ...p });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (f.password.length < 6) return setErr("Mật khẩu tối thiểu 6 ký tự.");
    if (f.password !== f.confirm) return setErr("Mật khẩu xác nhận không khớp.");
    setLoading(true);
    const res = await register({
      username: f.username.trim(), fullName: f.fullName.trim(),
      email: f.email.trim() || undefined, phone: f.phone.trim() || undefined,
      desiredPosition: f.desiredPosition.trim() || undefined,
      notes: f.notes.trim() || undefined, password: f.password,
    });
    setLoading(false);
    if (!res.ok) return setErr(res.error || "Đăng ký thất bại.");
    toast.success("Đăng ký thành công. Tài khoản của bạn đang chờ Admin phê duyệt.");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-3">B</div>
          <h1 className="text-2xl font-semibold tracking-tight">Đăng ký tài khoản</h1>
          <p className="text-sm text-muted-foreground mt-1">Tài khoản mới sẽ chờ Admin duyệt trước khi sử dụng.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Họ tên *</Label><Input value={f.fullName} onChange={(e) => set({ fullName: e.target.value })} required /></div>
              <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} /></div>
              <div><Label>Số điện thoại</Label><Input value={f.phone} onChange={(e) => set({ phone: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Bộ phận / vị trí mong muốn</Label><Input value={f.desiredPosition} onChange={(e) => set({ desiredPosition: e.target.value })} placeholder="VD: Content Web" /></div>
              <div className="sm:col-span-2"><Label>Ghi chú</Label><Textarea rows={2} value={f.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
              <div><Label>Tên đăng nhập *</Label><Input value={f.username} onChange={(e) => set({ username: e.target.value })} required /></div>
              <div></div>
              <div><Label>Mật khẩu *</Label><Input type="password" value={f.password} onChange={(e) => set({ password: e.target.value })} required /></div>
              <div><Label>Xác nhận mật khẩu *</Label><Input type="password" value={f.confirm} onChange={(e) => set({ confirm: e.target.value })} required /></div>
              {err && <div className="sm:col-span-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">{err}</div>}
              <div className="sm:col-span-2 flex items-center justify-between gap-3 pt-2">
                <Link to="/login" className="text-sm text-primary hover:underline">Đã có tài khoản? Đăng nhập</Link>
                <Button type="submit" disabled={loading}><UserPlus className="h-4 w-4 mr-1.5" />{loading ? "Đang xử lý..." : "Đăng ký"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
