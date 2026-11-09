import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/biz/products")({
  head: () => ({
    meta: [
      { title: "Kho Sản Phẩm — Base Sứ Việt" },
      { name: "description", content: "Nền tảng tra cứu và quản lý sản phẩm Sứ Việt đang được chuẩn bị kết nối." },
      { property: "og:title", content: "Kho Sản Phẩm — Base Sứ Việt" },
      { property: "og:description", content: "Kho Sản Phẩm Sứ Việt — sắp ra mắt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-4">
      <PageHeader title="Kho Sản Phẩm" description="Kinh doanh" />
      <div className="max-w-lg mx-auto rounded-xl border bg-card p-8 text-center space-y-3">
        <Package className="h-10 w-10 mx-auto text-muted-foreground" />
        <Badge variant="secondary">Sắp ra mắt</Badge>
        <p className="text-sm text-muted-foreground">Nền tảng tra cứu và quản lý sản phẩm Sứ Việt đang được chuẩn bị kết nối.</p>
      </div>
    </div>
  ),
});
