import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, fmtDate } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { ComingSoon } from "@/components/Common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/social/$id")({
  head: () => ({ meta: [{ title: "Chi tiết kênh social — Base Marketing" }] }),
  component: SocialDetail,
});

function SocialDetail() {
  const { id } = Route.useParams();
  const s = useStore();
  const c = s.socials.find((x) => x.id === id);
  if (!c) return <div className="p-10 text-center">Không tìm thấy. <Link to="/social" className="text-primary">Quay lại</Link></div>;
  const brand = s.brands.find((b) => b.id === c.brandId);
  const posts = s.socialPosts.filter((p) => p.channelId === c.id);
  const published = posts.filter((p) => p.status === "Đã đăng" || p.status === "Hoàn thành");

  return <>
    <Link to="/social" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3">
      <ArrowLeft className="h-4 w-4 mr-1" />Tất cả kênh
    </Link>
    <PageHeader title={c.name} description={`${c.platform} · ${brand?.name || "—"}`} actions={<StatusBadge value={c.status} />} />
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="profile">Hồ sơ kênh</TabsTrigger>
        <TabsTrigger value="posts">Bài đăng ({posts.length})</TabsTrigger>
        <TabsTrigger value="schedule">Lịch đăng</TabsTrigger>
        <TabsTrigger value="published">Bài đã đăng ({published.length})</TabsTrigger>
        <TabsTrigger value="report">Báo cáo Social</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Thông tin</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <Row k="Nền tảng" v={c.platform} /><Row k="Thương hiệu" v={brand?.name} /><Row k="PT" v={c.owner} /><Row k="Tần suất" v={c.frequency} />
          <Row k="Link" v={c.url} /><Row k="Trạng thái" v={<StatusBadge value={c.status} />} />
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Hoạt động</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <Row k="Tổng bài" v={posts.length} /><Row k="Đã đăng" v={published.length} /><Row k="Chờ duyệt" v={posts.filter(p=>p.status==="Chờ duyệt").length} />
        </CardContent></Card>
      </TabsContent>
      <TabsContent value="profile" className="mt-4"><Card><CardContent className="p-5 text-sm">{c.goal || "Chưa có mục tiêu kênh."}</CardContent></Card></TabsContent>
      <TabsContent value="posts" className="mt-4"><Card><CardContent className="p-0"><PostsTable posts={posts} /></CardContent></Card></TabsContent>
      <TabsContent value="schedule" className="mt-4"><Card><CardContent className="p-5"><ScheduleList posts={posts} /></CardContent></Card></TabsContent>
      <TabsContent value="published" className="mt-4"><Card><CardContent className="p-0"><PostsTable posts={published} /></CardContent></Card></TabsContent>
      <TabsContent value="report" className="mt-4"><ComingSoon title="Báo cáo Social" items={["Reach / Impression", "Engagement", "Followers", "Top bài đăng"]} /></TabsContent>
    </Tabs>
  </>;
}
function Row({ k, v }: { k: string; v?: any }) { return <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v ?? "—"}</span></div>; }
function PostsTable({ posts }: { posts: any[] }) {
  return <table className="w-full text-sm"><thead className="text-xs text-muted-foreground bg-muted/40"><tr>
    <th className="text-left font-medium px-4 py-2.5">Bài</th><th className="text-left font-medium px-4 py-2.5">Loại</th>
    <th className="text-left font-medium px-4 py-2.5">Lịch đăng</th><th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
  </tr></thead><tbody className="divide-y">
    {posts.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Trống.</td></tr>}
    {posts.map((p) => <tr key={p.id} className="hover:bg-muted/30">
      <td className="px-4 py-2.5 font-medium">{p.title}</td><td className="px-4 py-2.5 text-muted-foreground">{p.contentType}</td>
      <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(p.scheduledDate)}</td><td className="px-4 py-2.5"><StatusBadge value={p.status} /></td>
    </tr>)}
  </tbody></table>;
}
function ScheduleList({ posts }: { posts: any[] }) {
  const list = posts.filter(p => p.scheduledDate).sort((a,b) => (a.scheduledDate||"").localeCompare(b.scheduledDate||""));
  if (list.length === 0) return <div className="text-center text-muted-foreground py-6">Chưa có bài lên lịch.</div>;
  return <div className="space-y-2">{list.map(p => (
    <div key={p.id} className="flex items-center justify-between rounded-lg border p-3"><div><div className="font-medium">{p.title}</div><div className="text-xs text-muted-foreground">{p.contentType}</div></div>
      <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{fmtDate(p.scheduledDate)}</span><StatusBadge value={p.status} /></div></div>
  ))}</div>;
}
