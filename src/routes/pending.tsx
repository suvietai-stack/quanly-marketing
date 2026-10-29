import { useBranding, BrandMark } from "@/lib/branding";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Clock } from "lucide-react";

export const Route = createFileRoute("/pending")({
  head: () => ({ meta: [{"title": "Tài khoản đang chờ duyệt — Base Sứ Việt"}, {"name": "description", "content": "Tài khoản đang chờ duyệt: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:title", "content": "Tài khoản đang chờ duyệt — Base Sứ Việt"}, {"property": "og:description", "content": "Tài khoản đang chờ duyệt: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: PendingPage,
});

function PendingPage() {
  const brand = useBranding();
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const { user } = useCurrentUser();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <BrandMark b={brand} className="h-12 w-12 rounded-xl text-xl mb-3" />
          <h1 className="text-xl font-semibold tracking-tight">{brand.app_name}</h1>
        </div>
        <Card className="border-amber-200/60 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-4">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Tài khoản đang chờ duyệt</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Tài khoản của bạn đã được tạo thành công và đang chờ Admin duyệt, gán role và phân quyền truy cập.
                Sau khi được duyệt, bạn sẽ có thể sử dụng app theo quyền được cấp.
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 divide-y">
              <Row label="Họ tên" value={user?.fullName || "—"} />
              <Row label="Email" value={user?.email || "—"} />
              <Row label="Tên đăng nhập" value={user?.username || "—"} />
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200">
                  Chờ duyệt
                </Badge>
              </div>
            </div>

            <Button onClick={handleLogout} variant="outline" className="w-full mt-6">
              <LogOut className="h-4 w-4 mr-1.5" /> Đăng xuất
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground truncate ml-3 max-w-[60%]">{value}</span>
    </div>
  );
}
