# Roadmap — Nâng cấp giao diện Mục tiêu KR & quản lý bản nháp (31/10/2026)

- [ ] 1. Khảo sát BizGoals hiện tại: tab Của tôi/Trong phạm vi, form 12 tháng, RPC biz_goals_read/biz_goal_save/biz_goal_start, luồng duyệt nhiều cấp.
- [ ] 2. Tách hai khu vực trên một trang: "Mục tiêu KR của tôi" trên, "Trong phạm vi quản lý" dưới (chỉ hiện khi có quyền/scope); bỏ tab chuyển đổi.
- [ ] 3. Card tổng quan chỉ đọc: KR × Năm × 4 Quý, trạng thái, cấp duyệt, cập nhật gần nhất; nút theo trạng thái (Lập/Xem/Tiếp tục/Gửi duyệt/Lịch sử/Yêu cầu điều chỉnh).
- [ ] 4. Chi tiết 12 tháng chỉ mở khi bấm Xem chi tiết (đọc) hoặc Chỉnh sửa (form); desktop 4 Quý × 3 tháng, mobile card theo Quý thu gọn.
- [ ] 5. Khu vực Bản nháp: thu gọn mặc định, liệt kê loại/năm/cập nhật, Tiếp tục chỉnh sửa + Xóa bản nháp (xác nhận); không tự tạo nháp khi mở trang/đổi năm/xem chi tiết.
- [ ] 6. RPC xóa bản nháp an toàn: chỉ nháp chưa trình duyệt của chính mình (hoặc quản trị hợp lệ), chặn chờ duyệt/đã duyệt/có lịch sử, nguyên tử, giữ mục tiêu chính thức khi xóa nháp điều chỉnh.
- [ ] 7. Khu vực quản lý: thống kê card (tổng/đã lập/chưa lập/chờ duyệt/đã duyệt/cần sửa, không đếm trùng), danh sách nhân sự + tìm kiếm/lọc Hệ-Phòng-Nhóm-trạng thái-năm, xem tổng Năm/Quý, liên kết Trung tâm Phê duyệt.
- [ ] 8. Kiểm thử 24 trường hợp trong spec; desktop + mobile 360/375/390/430; không đổi nghiệp vụ KR, không dữ liệu demo; chưa Publish.
