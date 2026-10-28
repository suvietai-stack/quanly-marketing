import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { changePasswordError } from "@/lib/password";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Form đổi mật khẩu cá nhân — dùng chung cho trang Hồ sơ cá nhân và
 * tab Đổi mật khẩu trong Cài đặt. Không yêu cầu quyền quản trị.
 */
export function ChangePasswordForm() {
  const changeOwnPassword = useAuth((s) => s.changeOwnPassword);
  const [oldP, setOld] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // chống bấm gửi nhiều lần
    const msg = changePasswordError(oldP, n1, n2);
    if (msg) {
      setErr(msg);
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const res = await changeOwnPassword(oldP, n1);
      if (!res.ok) {
        setErr(res.error || "Không đổi được mật khẩu. Vui lòng thử lại.");
        return;
      }
      toast.success("Đã đổi mật khẩu thành công");
      setOld(""); setN1(""); setN2("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="max-w-md space-y-4 p-5">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cp-old">Mật khẩu hiện tại</Label>
            <PasswordInput id="cp-old" autoComplete="current-password" value={oldP} onChange={(e) => setOld(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-new">Mật khẩu mới</Label>
            <PasswordInput id="cp-new" autoComplete="new-password" value={n1} onChange={(e) => setN1(e.target.value)} required />
            <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự, gồm cả chữ cái và chữ số.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-confirm">Xác nhận mật khẩu mới</Label>
            <PasswordInput id="cp-confirm" autoComplete="new-password" value={n2} onChange={(e) => setN2(e.target.value)} required />
          </div>
          {err && <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive">{err}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? <LoaderCircle aria-hidden="true" className="mr-1.5 h-4 w-4 motion-safe:animate-spin" /> : <KeyRound className="mr-1.5 h-4 w-4" />}
            {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
