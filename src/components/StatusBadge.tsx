import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  // Generic green = success/done
  "Hoàn thành": "bg-success/15 text-success border-success/30",
  "Đã đăng": "bg-success/15 text-success border-success/30",
  "Đã bàn giao": "bg-success/15 text-success border-success/30",
  "Đã duyệt": "bg-success/15 text-success border-success/30",
  "Đã xác minh": "bg-success/15 text-success border-success/30",
  "Đã phản hồi": "bg-success/15 text-success border-success/30",
  "Đã index": "bg-success/15 text-success border-success/30",
  "Đang vận hành": "bg-success/15 text-success border-success/30",
  "Đang làm": "bg-info/15 text-info border-info/30",
  "Đang viết": "bg-info/15 text-info border-info/30",
  "Đang sản xuất": "bg-info/15 text-info border-info/30",
  "Đang xây": "bg-info/15 text-info border-info/30",
  "Đang xây dựng": "bg-info/15 text-info border-info/30",
  "Đang tối ưu": "bg-info/15 text-info border-info/30",
  "Đang xử lý": "bg-info/15 text-info border-info/30",
  "Chờ duyệt": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Đã lên lịch": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Chờ đăng": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Cần sửa": "bg-destructive/15 text-destructive border-destructive/30",
  "Quá hạn": "bg-destructive/15 text-destructive border-destructive/30",
  "Tạm dừng": "bg-muted text-muted-foreground border-border",
  "Tạm nghỉ": "bg-muted text-muted-foreground border-border",
  "Lưu trữ": "bg-muted text-muted-foreground border-border",
  "Chưa làm": "bg-muted text-muted-foreground border-border",
  "Chưa kiểm tra": "bg-muted text-muted-foreground border-border",
  "Chưa index": "bg-muted text-muted-foreground border-border",
  "Chưa xác minh": "bg-muted text-muted-foreground border-border",
  "Chưa phản hồi": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Mới tạo": "bg-accent text-accent-foreground border-border",
  "Ý tưởng": "bg-accent text-accent-foreground border-border",
  "Kế hoạch": "bg-accent text-accent-foreground border-border",
  "Đã giao": "bg-info/15 text-info border-info/30",
  // priorities
  "Thấp": "bg-muted text-muted-foreground border-border",
  "Trung bình": "bg-info/15 text-info border-info/30",
  "Cao": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Gấp": "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const cls = map[value] || "bg-secondary text-secondary-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        cls,
        className
      )}
    >
      {value}
    </span>
  );
}
