import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  // Success / completed
  "Hoàn thành": "bg-success/15 text-success border-success/30",
  "Đã đăng": "bg-success/15 text-success border-success/30",
  "Đã đăng web": "bg-[oklch(0.7_0.13_180)]/15 text-[oklch(0.45_0.13_180)] border-[oklch(0.7_0.13_180)]/30",
  "Đã bàn giao": "bg-[oklch(0.7_0.12_180)]/15 text-[oklch(0.45_0.13_180)] border-[oklch(0.7_0.12_180)]/30",
  "Đã duyệt": "bg-success/15 text-success border-success/30",
  "Outline đã duyệt": "bg-success/15 text-success border-success/30",
  "Bài đã duyệt": "bg-success/15 text-success border-success/30",
  "Đã xác minh": "bg-success/15 text-success border-success/30",
  "Đã phản hồi": "bg-success/15 text-success border-success/30",
  "Đã index": "bg-success/15 text-success border-success/30",
  "Đang vận hành": "bg-success/15 text-success border-success/30",

  // In progress / info
  "Đang làm": "bg-info/15 text-info border-info/30",
  "Đang viết": "bg-info/15 text-info border-info/30",
  "Đang viết bài": "bg-info/15 text-info border-info/30",
  "Đang làm outline": "bg-info/15 text-info border-info/30",
  "Đang sản xuất": "bg-info/15 text-info border-info/30",
  "Đang xây": "bg-info/15 text-info border-info/30",
  "Đang xây dựng": "bg-info/15 text-info border-info/30",
  "Đang tối ưu": "bg-info/15 text-info border-info/30",
  "Đang xử lý": "bg-info/15 text-info border-info/30",
  "Đã giao": "bg-info/15 text-info border-info/30",

  // Waiting / review
  "Chờ duyệt": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Chờ duyệt outline": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Chờ duyệt bài": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Đã lên lịch": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Chờ đăng": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Chờ đăng web": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Chưa phản hồi": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",

  // Needs fix / urgent
  "Cần sửa": "bg-destructive/15 text-destructive border-destructive/30",
  "Cần sửa outline": "bg-destructive/15 text-destructive border-destructive/30",
  "Cần sửa bài": "bg-destructive/15 text-destructive border-destructive/30",
  "Cần sửa kịch bản": "bg-destructive/15 text-destructive border-destructive/30",
  "Cần sửa video": "bg-destructive/15 text-destructive border-destructive/30",
  "Cần xử lý": "bg-destructive/15 text-destructive border-destructive/30",
  "Quá hạn": "bg-destructive/15 text-destructive border-destructive/30",

  // Video workflow extras
  "Đang làm kịch bản": "bg-info/15 text-info border-info/30",
  "Đang quay / thu tư liệu": "bg-info/15 text-info border-info/30",
  "Đang dựng": "bg-info/15 text-info border-info/30",
  "Chờ duyệt kịch bản": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Chờ duyệt video": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Kịch bản đã duyệt": "bg-success/15 text-success border-success/30",
  "Video đã duyệt": "bg-success/15 text-success border-success/30",
  "Đã hủy": "bg-muted text-muted-foreground border-border",

  // Index check (purple)
  "Kiểm tra index": "bg-[oklch(0.7_0.15_300)]/15 text-[oklch(0.45_0.18_300)] border-[oklch(0.7_0.15_300)]/30",

  // Muted
  "Tạm dừng": "bg-muted text-muted-foreground border-border",
  "Tạm nghỉ": "bg-muted text-muted-foreground border-border",
  "Lưu trữ": "bg-muted text-muted-foreground border-border",
  "Chưa làm": "bg-muted text-muted-foreground border-border",
  "Chưa kiểm tra": "bg-muted text-muted-foreground border-border",
  "Chưa index": "bg-muted text-muted-foreground border-border",
  "Chưa xác minh": "bg-muted text-muted-foreground border-border",

  // Plan / idea
  "Mới tạo": "bg-accent text-accent-foreground border-border",
  "Ý tưởng": "bg-accent text-accent-foreground border-border",
  "Kế hoạch": "bg-accent text-accent-foreground border-border",

  // Entity / share / rank
  "Đang dùng": "bg-success/15 text-success border-success/30",
  "Chưa dùng": "bg-muted text-muted-foreground border-border",
  "Lỗi đăng nhập": "bg-destructive/15 text-destructive border-destructive/30",
  "Đã share": "bg-success/15 text-success border-success/30",
  "Chưa share": "bg-muted text-muted-foreground border-border",
  "Cần share lại": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
  "Top 3": "bg-success/15 text-success border-success/30",
  "Top 10": "bg-success/15 text-success border-success/30",
  "Top 20": "bg-info/15 text-info border-info/30",
  "Top 50": "bg-info/15 text-info border-info/30",
  "Ngoài top 50": "bg-muted text-muted-foreground border-border",
  "Tăng hạng": "bg-success/15 text-success border-success/30",
  "Tụt hạng": "bg-destructive/15 text-destructive border-destructive/30",
  "Mất top": "bg-destructive/15 text-destructive border-destructive/30",
  "Chưa check": "bg-muted text-muted-foreground border-border",

  // Backlink statuses
  "Dự kiến": "bg-accent text-accent-foreground border-border",
  "Đã đặt": "bg-info/15 text-info border-info/30",
  "Đã kiểm tra link": "bg-success/15 text-success border-success/30",
  "Lỗi / mất link": "bg-destructive/15 text-destructive border-destructive/30",

  // Priorities
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
