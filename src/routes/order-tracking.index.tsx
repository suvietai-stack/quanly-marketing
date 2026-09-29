import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/order-tracking/")({
  head: () => ({ meta: [
    { title: "Theo Dõi Đơn Hàng — Base" },
    { name: "description", content: "Theo Dõi Đơn Hàng đang được phát triển trên Base." },
    { property: "og:title", content: "Theo Dõi Đơn Hàng — Base" },
    { property: "og:description", content: "Theo Dõi Đơn Hàng đang được phát triển trên Base." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: OrderTracking,
});

function OrderTracking() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-2 py-12 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-md bg-primary/10 text-primary"><Truck className="size-8" aria-hidden="true" /></div>
      <Badge variant="secondary" className="mb-4">Sắp ra mắt</Badge>
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">THEO DÕI ĐƠN HÀNG</h1>
      <p className="mt-5 text-lg font-medium text-foreground">Chức năng đang được phát triển.</p>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">Sắp tới, bạn có thể theo dõi hành trình thực hiện và giao hàng ngay trên Base.</p>
    </div>
  );
}