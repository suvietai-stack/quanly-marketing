import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, isOverdue, fmtDate } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ListChecks, AlertTriangle, Clock, CheckCircle2, Globe, Share2,
  MapPin, Video, Palette,
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Tổng Quan — Base Marketing" }] }),
  component: Dashboard,
});

function Stat({ label, value, icon: Icon, tone = "default" }: {
  label: string; value: number | string; icon: any; tone?: "default" | "warn" | "danger" | "success" | "info";
}) {
  const tones: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground",
    warn: "bg-warning/15 text-[oklch(0.45_0.13_75)]",
    danger: "bg-destructive/10 text-destructive",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
  };
  return (
    <Card>
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold mt-1.5 tracking-tight">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const s = useStore();
  const stats = useMemo(() => {
    const openTasks = s.tasks.filter((t) => t.status !== "Hoàn thành");
    const overdue = openTasks.filter((t) => isOverdue(t.deadline, t.status));
    const startWeek = new Date();
    startWeek.setDate(startWeek.getDate() - 7);
    const doneWeek = s.tasks.filter(
      (t) => t.status === "Hoàn thành" && t.completedAt && new Date(t.completedAt) >= startWeek
    );
    return {
      open: openTasks.length,
      overdue: overdue.length,
      pending:
        s.tasks.filter((t) => t.status === "Đang làm").length +
        s.webContents.filter((c) => c.status === "Chờ duyệt outline" || c.status === "Chờ duyệt bài").length +
        s.socialPosts.filter((p) => p.status === "Chờ duyệt").length +
        s.orders.filter((o) => o.status === "Chờ duyệt").length +
        s.videos.filter((v) => v.status === "Chờ duyệt").length,
      doneWeek: doneWeek.length,
      sites: s.websites.filter((w) => w.status === "Đang vận hành").length,
      socials: s.socials.filter((c) => c.status === "Đang vận hành").length,
      places: s.places.length,
      videosProd: s.videos.filter((v) => v.status === "Đang sản xuất").length,
      ordersWip: s.orders.filter((o) => o.status === "Đang làm" || o.status === "Mới tạo").length,
    };
  }, [s]);

  const attention = useMemo(() => {
    const items: { type: string; title: string; status: string; due?: string; brand?: string; href?: string }[] = [];
    s.tasks.filter((t) => isOverdue(t.deadline, t.status)).forEach((t) =>
      items.push({ type: "Task quá hạn", title: t.title, status: t.priority, due: t.deadline, brand: s.brands.find(b => b.id === t.brandId)?.name, href: "/tasks" })
    );
    s.orders.filter((o) => o.status === "Chờ duyệt").forEach((o) =>
      items.push({ type: "Order thiết kế", title: o.title, status: o.status, due: o.deadline, brand: s.brands.find(b => b.id === o.brandId)?.name, href: "/orders" })
    );
    s.videos.filter((v) => v.status === "Chờ duyệt").forEach((v) =>
      items.push({ type: "Video chờ duyệt", title: v.title, status: v.status, due: v.deadline, brand: s.brands.find(b => b.id === v.brandId)?.name, href: "/videos" })
    );
    s.socialPosts.filter((p) => p.status === "Chờ duyệt" || p.status === "Chờ đăng").forEach((p) =>
      items.push({ type: "Bài social", title: p.title, status: p.status, due: p.scheduledDate, brand: s.brands.find(b => b.id === p.brandId)?.name, href: "/social" })
    );
    s.webContents.filter((c) => c.status.startsWith("Chờ duyệt") || c.status.startsWith("Cần sửa")).forEach((c) =>
      items.push({ type: "Nội dung web", title: c.title, status: c.status, due: c.deadline, brand: s.brands.find(b => b.id === c.brandId)?.name, href: "/websites" })
    );
    return items.slice(0, 12);
  }, [s]);

  return (
    <>
      <PageHeader
        title="Tổng Quan"
        description="Tình hình vận hành phòng Digital Marketing — cập nhật theo thời gian thực."
      />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Công việc đang mở" value={stats.open} icon={ListChecks} tone="info" />
        <Stat label="Công việc quá hạn" value={stats.overdue} icon={AlertTriangle} tone="danger" />
        <Stat label="Chờ duyệt" value={stats.pending} icon={Clock} tone="warn" />
        <Stat label="Hoàn thành / 7 ngày" value={stats.doneWeek} icon={CheckCircle2} tone="success" />
        <Stat label="Website vận hành" value={stats.sites} icon={Globe} />
        <Stat label="Kênh social vận hành" value={stats.socials} icon={Share2} />
        <Stat label="Local Map quản lý" value={stats.places} icon={MapPin} />
        <Stat label="Video đang sản xuất" value={stats.videosProd} icon={Video} />
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Việc cần chú ý</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Loại</th>
                    <th className="text-left font-medium px-4 py-2.5">Nội dung</th>
                    <th className="text-left font-medium px-4 py-2.5">Thương hiệu</th>
                    <th className="text-left font-medium px-4 py-2.5">Hạn</th>
                    <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attention.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Không có việc cần chú ý.</td></tr>
                  )}
                  {attention.map((it, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{it.type}</td>
                      <td className="px-4 py-2.5 font-medium">
                        {it.href ? <Link to={it.href} className="hover:text-primary">{it.title}</Link> : it.title}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{it.brand || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(it.due)}</td>
                      <td className="px-4 py-2.5"><StatusBadge value={it.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Truy cập nhanh</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { to: "/tasks", icon: ListChecks, label: "Task" },
              { to: "/brands", icon: Globe, label: "Thương hiệu" },
              { to: "/websites", icon: Globe, label: "Website" },
              { to: "/social", icon: Share2, label: "Social" },
              { to: "/local", icon: MapPin, label: "Local Map" },
              { to: "/videos", icon: Video, label: "Video" },
              { to: "/orders", icon: Palette, label: "Thiết kế" },
            ].map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="flex flex-col items-start gap-2 rounded-lg border bg-card p-3 hover:border-primary/40 hover:bg-accent/40 transition-colors"
              >
                <q.icon className="h-5 w-5 text-primary" />
                <div className="text-sm font-medium">{q.label}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
