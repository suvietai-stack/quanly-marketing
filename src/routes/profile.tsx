import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { isFakeEmail } from "@/lib/password";
import { PageHeader } from "@/components/AppShell";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Hồ sơ cá nhân — Base Sứ Việt" },
    { name: "description", content: "Bảo mật tài khoản: đổi mật khẩu và email khôi phục trên Base Sứ Việt." },
    { property: "og:title", content: "Hồ sơ cá nhân — Base Sứ Việt" },
    { property: "og:description", content: "Bảo mật tài khoản: đổi mật khẩu và email khôi phục trên Base Sứ Việt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ProfilePage,
});

function RecoveryEmailCard() {
  const me = useAuth((s) => (s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) : null));
  const reload = useAuth((s) => s.reload);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const next = email.trim().toLowerCase();
    if (isFakeEmail(next)) {
      toast.error("Địa chỉ email nội bộ không nhận được thư. Vui lòng dùng email thật.");
      return;
    }
    setLoading(true);
    try {
      // Supabase Auth gửi thư xác minh tới địa chỉ mới; email chỉ đổi sau khi xác minh.
      const { error } = await supabase.auth.updateUser({ email: next });
      if (error) {
        toast.error("Không gửi được thư xác minh. Vui lòng thử lại sau.");
        return;
      }
      toast.success("Đã gửi thư xác minh tới địa chỉ mới. Vui lòng mở hộp thư và bấm liên kết xác nhận.");
      setEmail("");
      await reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="max-w-md space-y-4 p-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Email khôi phục</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Email hiện tại: <strong>{me?.email || "—"}</strong>. Email này dùng để nhận liên kết khôi phục mật khẩu.
            Khi đổi, hệ thống gửi thư xác minh tới địa chỉ mới — email chỉ đổi sau khi bạn xác nhận.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email mới</Label>
            <Input id="recovery-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@congty.vn" required />
          </div>
          <Button type="submit" variant="outline" disabled={loading}>
            {loading ? <LoaderCircle aria-hidden="true" className="mr-1.5 h-4 w-4 motion-safe:animate-spin" /> : <Mail className="mr-1.5 h-4 w-4" />}
            {loading ? "Đang gửi xác minh..." : "Gửi xác minh đổi email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProfilePage() {
  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" description="Bảo mật tài khoản của bạn: đổi mật khẩu và quản lý email khôi phục." />
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Bảo mật — Đổi mật khẩu</h2>
          <ChangePasswordForm />
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Khôi phục tài khoản</h2>
          <RecoveryEmailCard />
        </section>
      </div>
    </>
  );
}
