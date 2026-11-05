# Trạng thái KG/KF tự động — 05/11/2026

## Đã triển khai
- 0235–0238: `private.k3_entity_state` là nguồn KG/KF, bộ đếm và quá hạn. Giờ Việt Nam; trước giờ bắt đầu chưa bắt đầu, đến giờ đang thực hiện dù chưa nhập KPI.
- KF phải đủ KPI bắt buộc và nghiệm thu đúng revision. KG ưu tiên KPI bắt buộc riêng; nếu không có thì tất cả KF bắt buộc. Optional KPI/KF không chặn. Không tạo KPI trùng.
- `k3_goal_activate` kiểm quyền/khóa/revision/cấu trúc hợp lệ; quick-create lưu nháp rồi kích hoạt nguyên tử khi Lưu công việc. KF mới có KPI hợp lệ tự vận hành. API trạng thái thường và manual_progress bị chặn; quyết định đặc biệt cần lý do.
- Danh sách/bộ lọc/KF done, chi tiết, ngày, nguồn tổng kết và chốt mới dùng nguồn chung. Cache sau KPI/nghiệm thu được invalidation; danh sách/chi tiết/ngày tải lại mỗi 30 giây.
- Bỏ Sẵn sàng, Bắt đầu thực hiện, Bắt đầu KF, Mở lại thủ công, Lưu và bắt đầu khỏi luồng chính. Giữ Lưu nháp/Lưu công việc, cập nhật KPI, tổng kết; ngoại lệ ở menu phụ.

## Dữ liệu và đối soát
Không chuyển đổi hay sửa số liệu/trạng thái/timestamp lịch sử. Trước và sau: 8 KG, 4 KF, 3 KPI, 2 kết quả, 1 chốt, 38 sự kiện. Stored Done không được dùng làm bằng chứng hoàn thành. Không gửi Zalo hoặc Publish.
Không thay chốt/measurement/report snapshot cũ hoặc fingerprint xác nhận. Kết quả quá khứ dùng ngày đánh giá, revision/bản ghi và thời điểm nghiệm thu có sẵn; đây không phải phục dựng đầy đủ lịch sử cấu hình đã thay đổi.

## Kiểm thử và giới hạn
Bộ 3K đạt 174/174 trước test KF mới; lượt cuối ghi trong roadmap. Test cơ sở dữ liệu cô lập có thời điểm 05/11/2026 08:00/09:00/10:30/11:00/13:00, ngày-only, Done legacy, nhiều KPI, nghiệm thu, KG riêng, 1/1 và filter.
Phiên trình duyệt được khôi phục nhưng /biz/3k chuyển về /login. Chưa nghiệm thu desktop/mobile hoặc ghi→đọc UI thật; không tự chọn tài khoản khác hay tạo dữ liệu thử trên backend chung.
Chưa nghiệm thu chốt và gửi Zalo thật; test tự động hóa hồi quy giữ nguyên lịch 18:00/18:05. Lịch sử công việc ngày cũ tiếp tục chỉ đọc; không tự diễn giải dữ liệu thiếu KPI. Ma trận vai trò và phục hồi legacy thật còn cần hồ sơ được người dùng cho phép.