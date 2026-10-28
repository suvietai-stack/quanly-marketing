# Diễn biến khách hàng — bàn giao Preview

## Đã triển khai
- Nhiều gợi ý và ghi chú ghép thành một nội dung chỉnh sửa/xem trước được; maket chỉ cho Sứ quà tặng.
- Không yêu cầu chọn kênh liên hệ, gợi ý không tự Chốt hoặc tạo Job.
- Mốc ban đầu 5, tiếp tục không giới hạn; Chốt/Trượt không bị yêu cầu đủ mốc.
- Tóm tắt số lượt/gần nhất và cảnh báo quá 7 ngày; chi tiết có lịch sử diễn biến riêng, nhật ký đầy đủ vẫn giữ.
- Sáu KPI, bảng Sale sắp xếp/lọc, điện thoại hai cột và thẻ Sale; dành khoảng trống bên phải cho Chipi, không sửa Chipi.

## File
- `src/lib/signals/progression.ts`, `progression.test.ts`, `progression.database.test.ts`
- `src/lib/signals/api.ts`
- `src/components/signals/ProgressionSummary.tsx`, `ProgressionReport.tsx`
- `src/components/signals/SignalsUi.tsx`, `SignalsReport.tsx`
- `src/routes/signals.index.tsx`, `signals.report.tsx`
- `drizzle/migrations/0069_signal_progression_tracking.sql`, journal tự sinh và `src/integrations/supabase/types.ts` tự sinh
- `AGENTS.md`, `roadmap.md`, tài liệu này.

## Thay đổi dữ liệu
Đã áp dụng bổ sung được duyệt trên backend dùng chung: ba trường nullable vào lịch sử hiện có, chỉ mục mã request và ba hàm. Không thêm bảng, không sửa/xóa/backfill lịch sử, không đổi RPC lưu cũ hay quyền hiện có. Giao diện chưa Publish.

Một request có UUID duy nhất; khóa tín hiệu trước ghi. Retry cùng mã/nội dung trả ID cũ; đổi nội dung với cùng mã bị từ chối. Nội dung/payload giống nhau của cùng người trên cùng tín hiệu trong 60 giây trả bản ghi cũ. Chốt/Trượt vẫn kiểm doanh số/lý do, không kiểm mốc 5. Đổi trạng thái không có nội dung lưu nhật ký nhưng `is_progression=false`.

## Số lượt và lịch sử
Máy chủ tổng hợp dưới quyền đọc hiện có (SECURITY INVOKER). Bản mới theo dấu diễn biến do hàm lưu đặt. Bản cũ: loại `Đã tiếp nhận`; tính ghi chú không trống hoặc gợi ý tư vấn không trống khác `Khác`; không tính sự kiện phân công/sửa/hủy/mở lại hoặc thay trạng thái trống nội dung. Không xác minh được sự thật nội dung hay retry trước nâng cấp, không tự lọc/xóa lịch sử.

Đối soát chỉ đọc ngày 28/10: 788 nhật ký, 289 được phân loại diễn biến; 428 nhật ký tiếp nhận bị loại. Các con số là ảnh chụp tại thời điểm kiểm tra.

## Công thức
- Đang chăm sóc = tín hiệu mở/chưa hủy trong tập theo toàn bộ bộ lọc báo cáo hiện có.
- Gần đây = các tín hiệu mở này có diễn biến hợp lệ trong 7 × 24 giờ đến hiện tại.
- Tỷ lệ = gần đây / đang chăm sóc × 100%; mẫu số 0: “—”.
- Lâu chưa cập nhật = tín hiệu mở quá 7 × 24 giờ từ mốc lớn hơn giữa diễn biến gần nhất và giao Sale; thiếu cả hai mốc không cảnh báo. Giao mới không bị đánh quá hạn ngay.
- Dưới mốc = tín hiệu mở có tổng lịch sử hợp lệ < 5.
- Lượt trong kỳ = diễn biến tạo trong khoảng ngày chọn theo giờ Việt Nam trên tín hiệu thỏa bộ lọc nghiệp vụ, không giới hạn bởi ngày tạo tín hiệu. Sale lọc người thực sự viết cho chỉ số lượt; các chỉ số trạng thái lọc Sale hiện phụ trách. Vì vậy lượt cũ không bị chuyển sang Sale mới.
- Không đưa chỉ số chụp trạng thái vào xu hướng lịch sử, không đổi tỷ lệ chốt/giờ tiếp nhận/nhắc Zalo.

## Kiểm thử và giới hạn
- Kiểm thử quy tắc thuần, công thức và hồi quy toàn module Tín hiệu; kiểm tĩnh ràng buộc hàm lưu/quyền/60 giây và bảo toàn lịch sử.
- UI thật bằng Super Admin: 405 tín hiệu; mở chi tiết, hai chip ghép đúng, maket xuất hiện ở nhóm quà tặng, thống kê đọc thành công, lọc Đào Thanh Hoan: 5 đang mở / 0 gần đây / 0% / 5 lâu / 5 dưới mốc / 22 lượt tháng 10.
- Toàn báo cáo tháng 10 lúc kiểm: 322 / 50 / 15,5% / 134 / 321 / 265 theo thứ tự trên UI.
- Desktop 1280, mobile 360/390: không tràn ngang, không lỗi runtime; ảnh nội bộ ở `/tmp/browser/progression/`.
- Chưa thử lưu diễn biến thành công hoặc hai request thật đồng thời, vì dữ liệu dùng chung và không có nội dung chăm sóc thật được chỉ định. Không tạo diễn biến giả, không thử Chốt/Trượt trên khách thật. Quyền Sale ngoài phạm vi chưa được kiểm bằng phiên Sale thật.
- Liên kết trực tiếp có lỗi chuyển về Tổng quan từ trước; điều hướng qua menu nội bộ đã kiểm được, không sửa Auth ngoài phạm vi.

## Cách xem
Trong Preview đã đăng nhập: menu Danh sách tín hiệu → tên khách/Chi tiết → Cập nhật. Báo cáo tín hiệu → Hiệu suất cập nhật diễn biến. Thu gọn Gợi ý diễn biến khi cần nhập nhanh trên điện thoại. Chưa Publish.