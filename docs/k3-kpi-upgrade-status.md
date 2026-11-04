# KPI 3K — trạng thái triển khai 04/11/2026

## Đã triển khai
- Migrations 0202–0208: kết quả KPI/người/ngày, một tổng hiện hành thay thế khi sửa; request key, revision và khóa giao dịch; lịch sử kết quả và bản chốt ngày bất biến.
- Cộng dồn/thời lượng: tổng giá trị; không trùng: định danh duy nhất; hiện tại: quan sát mới nhất theo ngày/thời điểm; tỷ lệ: tổng tử / tổng mẫu × 100; trung bình: tổng giá trị / tổng số quan sát; mốc: tiêu chí cấu hình không trùng. Điều kiện ≥, ≤, =, trong khoảng. Phần trăm chỉ có cơ sở với mục tiêu dương và ≥; hiển thị vượt 100%.
- KPI bắt buộc quyết định KF; KPI riêng quyết định KG, không tự hoàn thành từ một KF. Trạng thái tính khi đọc, giữ trạng thái lịch sử đã lưu.
- Form chung Biz3KKpiResult, query/mutation k3KpiResultQueries; màn ngày Biz3KKpiDay; kết nối chi tiết KG/KF/nhóm; giao diện Thùng lưu trữ và kiểm kê Biz3KArchive.
- Chính thức chỉ tính kết quả hiện hành khớp phiên bản chốt gần nhất; sửa sau chốt yêu cầu xác nhận lại, bản cũ còn nguyên. Thông tin ghi chú/bằng chứng và lịch sử người khác chỉ cấp cho chủ trì/Admin/quản lý đúng phạm vi; thành viên thường chỉ thấy đóng góp đo lường chung.
- Cấu hình và cập nhật dùng khóa KPI chung; đường k3_kpi_save cũ chuyển qua cấu hình chuẩn, không cho manual_actual; KPI có thực tế legacy không được đổi công thức hồi tố.
- Thùng rác không purge cha có canonical results hoặc dữ liệu chờ rà soát; canonical đã chốt bảo vệ thao tác xóa KG/KF.

## Dữ liệu thật
Kiểm kê ban đầu: 2 KG, 1 KF, 2 KPI, 3 công việc cũ, 3 ngày, 2 ngày tổng kết; cả 3 công việc chưa có KPI ID và 2 chưa có KF. Không đoán liên kết, không đổi số liệu/timestamp, không tạo dữ liệu giả.
Số chuyển đổi: **0**. Số cách ly tự động: **0**. Đã bổ sung tạo bản sao riêng tư kiểm đếm, nhưng chưa chạy hoặc kiểm tra khôi phục; không coi tồn tại RPC là sao lưu đã xác minh.

## Kiểm tra đã chạy
123/123 kiểm thử 3K đạt, gồm chốt tự động không actor giả, điều chỉnh sau chốt, phạm vi ngày, lease chống gửi lại, bản sao khớp nguyên bản, lưu trữ/khôi phục/purge 15 ngày và chặn xóa lịch sử chốt. Kiểm tra biên dịch thành công. Admin thật đã đọc màn ngày (30/200=15%), cài đặt (18:00/18:05, Zalo Tắt) và theo dõi nhân viên. Desktop và mobile 390px không tràn. Không ghi kết quả thử, không chốt/sửa hồ sơ thật, không gửi Zalo thử.

## Bổ sung 0209–0215
- SQL tự chốt ngày, k3_daily_closes source=auto actor NULL; không tạo xác nhận nhân viên giả. Công thức chính thức dùng snapshot chốt, sửa cần lý do và xác nhận lại.
- Kỳ/quản lý dùng k3_measured_period_read và scoped range metrics; không dùng task legacy làm số KPI chính thức.
- Cài đặt Zalo riêng, outbox và claim không reclaim, kết quả mơ hồ không gửi lại; dispatch nối cron pulse hiện hữu. Gửi chưa bật và chưa nghiệm thu OA thật.
- Task cũ chưa chốt thiếu KPI có lưu trữ/khôi phục 15 ngày sau backup đối chiếu; bảo vệ chốt và giữ private backup/audit. Chưa chuyển bản ghi thật.

## Chưa hoàn tất
- Chưa thực hiện chuyển đổi A/B/C; KG/KF/KPI legacy có quan hệ mơ hồ cần quyết định hồ sơ, không tự cascade hoặc đoán liên kết.
- Chưa hoàn tất kiểm thử purge/concurrency thật và giao diện bảy kích thước.
- Chưa nghiệm thu ghi/chốt qua UI và gửi OA: cần cho phép thao tác hồ sơ thật và chọn nhóm/bật gửi; không tự ghi dữ liệu thử vào hệ thống dùng chung.
- Spec 670 dòng về deadline tới giờ/phút và lộ trình định kỳ còn trong roadmap; không tự đặt lịch vận hành.

Không Publish. Các thay đổi lưu trữ chạy trên hệ thống dùng chung, không chuyển đổi/xóa dữ liệu thật trong lượt này.