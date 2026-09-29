import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { otApi } from "@/lib/orderTracking/api";

export function OtSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["ot", "settings"], queryFn: otApi.settings });
  const toggle = async (v: boolean) => {
    try { await otApi.saveSettings(v); await qc.invalidateQueries({ queryKey: ["ot", "settings"] }); toast.success("Đã lưu cài đặt."); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Theo dõi đơn hàng</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium">Cho phép tạo đơn thủ công</div>
            <p className="text-sm text-muted-foreground">Tắt khi đã đồng bộ đơn từ CRM. Việc tắt không ảnh hưởng những đơn đã tạo.</p>
          </div>
          <Switch checked={!!data?.allow_manual} onCheckedChange={toggle} disabled={!data} />
        </label>
        <p className="text-xs text-muted-foreground">Nhắc việc, kênh thông báo và lý do điều chỉnh lịch sẽ có ở giai đoạn tiếp theo.</p>
      </CardContent>
    </Card>
  );
}
