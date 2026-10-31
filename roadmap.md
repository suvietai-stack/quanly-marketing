# Roadmap — Nâng cấp giao diện Mục tiêu KR & quản lý bản nháp (31/10/2026)

- [x] 1. Khảo sát BizGoals: tab Của tôi/Trong phạm vi, form 12 tháng mở ngay; RPC biz_goals_read/biz_goal_start/biz_goal_save/biz_goal_decide giữ nguyên.
- [x] 2. Hai khu vực một trang: "Mục tiêu KR của tôi" trên, "Trong phạm vi quản lý" dưới (chỉ khi có quyền view_dept/view_all/goal_approve); bỏ tab chuyển đổi.
- [x] 3. Card tổng quan chỉ đọc KR × Năm × 4 Quý + trạng thái + cập nhật; nút theo trạng thái (Lập/Xem chi tiết/Tiếp tục chỉnh sửa/Lịch sử/Yêu cầu điều chỉnh).
- [x] 4. Chi tiết 12 tháng chỉ mở khi bấm (dialog đọc, không ô nhập); chỉnh sửa mở form trong dialog; mobile theo Quý thu gọn.
- [x] 5. Khu vực Bản nháp thu gọn mặc định, loại Lập mới/Điều chỉnh, Tiếp tục chỉnh sửa + Xóa bản nháp có xác nhận; không tự tạo nháp (biz_goal_start vốn trả về bản đang dở, không trùng).
- [x] 6. RPC biz_goal_draft_delete (migration 0134): chỉ nháp draft chưa từng gửi, chặn pending/approved/official/có approval run, nguyên tử, xóa hồ sơ năm khi không còn phiên bản, giữ nguyên bản chính thức khi xóa nháp điều chỉnh.
- [x] 7. Khu vực quản lý: 6 thẻ thống kê (bấm lọc nhanh), tìm tên/lọc phòng/trạng thái, bảng desktop + card mobile, Xem (chỉ đọc) / Lịch sử / Duyệt (liên kết Trung tâm Phê duyệt).
- [x] 8. Kiểm thử: 151/151 test Biz (5 test mới cho xóa nháp); build OK; Playwright desktop/mobile 390px không lỗi console, không tràn ngang; xóa nháp thật của Admin thành công end-to-end.
- [ ] Chưa kiểm: tài khoản Sale/Trưởng phòng thật (phiên hiện tại là Super Admin); chưa Publish.

## Chuẩn hóa quyền tự động theo chức vụ
- [ ] Rà soát Role cũ, bổ nhiệm hiệu lực và mọi đường đọc/duyệt/tổng hợp.
- [ ] Chốt phương án chuyển đổi an toàn quyền chi tiết và ngoại lệ, không ảnh hưởng module khác.
- [ ] Tự động quyền nghiệp vụ/phạm vi từ cơ cấu; tách Dashboard tổng hợp; đúng lượt phê duyệt.
- [ ] Đơn giản hóa bổ nhiệm, xem trước/xem quyền thực tế và làm mới quyền.
- [ ] Kiểm thử từng cấp, kiêm nhiệm/hết hiệu lực, API ngoài phạm vi, Super Admin, desktop/mobile.
