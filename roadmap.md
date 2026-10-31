# Roadmap — Nâng cấp giao diện Mục tiêu KR & quản lý bản nháp (31/10/2026)

## Chuẩn hóa cơ cấu tổ chức cấp Khối
- [x] Bổ sung danh mục Giám Đốc Điều hành cấp 5 / Phó Giám Đốc Điều hành cấp 4; không bổ nhiệm tự động.
- [x] Cây tổ chức có lãnh đạo cấp Khối và bổ nhiệm/thay thế/miễn nhiệm theo vị trí, quyền tự động và kiêm nhiệm rõ ràng.
- [x] Admin hiện có quyền quản trị riêng Biz; Phó điều hành không vượt bước Giám Đốc; tinh gọn Phân quyền. 164/164 test Biz, dữ liệu hồ sơ/phân công giữ nguyên.
- [x] Playwright Super Admin thật, desktop/mobile 360/375/390/430; không tràn/lỗi runtime. Báo cáo docs/biz-block-leadership.md; chưa Publish.
- [ ] Nghiệm thu bổ nhiệm/thu hồi và duyệt từng chức vụ qua UI thật: chờ thông tin bổ nhiệm thực tế và phiên tài khoản tương ứng; không tạo nhân sự/hồ sơ test trong dữ liệu chung.

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
- [x] Rà soát Role cũ, bổ nhiệm hiệu lực và mọi đường đọc/duyệt/tổng hợp: biz_all_scope chấp nhận assigned + view_all; Role Giám Đốc Kinh Doanh có quyền cấu hình; nộp bù đọc chưa theo scope và chưa dùng luồng.
- [x] Chốt chuyển đổi: bỏ quyền cài đặt Kinh doanh Role Giám Đốc; giữ ngoại lệ xem chi tiết toàn Khối Admin/Viewer; không đổi quyền module khác.
- [x] Tự động quyền nghiệp vụ/phạm vi từ cơ cấu; Dashboard công bố riêng không trả hồ sơ nhân viên; luồng nộp bù nhiều cấp, đúng lượt, giữ yêu cầu cũ và chuyển luồng có xác nhận.
- [x] Xem trước quyền bổ nhiệm, quyền thực tế từng người, chức vụ điều hành cấu hình được, ngoại lệ cấp/thu hồi có nhật ký; làm mới quyền và cache khi thay phạm vi.
- [x] 159/159 kiểm thử Biz đạt; Admin thật xem Dashboard tổng hợp/chi tiết và cài đặt; desktop/mobile 390px không tràn, không lỗi console.
- [ ] Nghiệm thu bằng tài khoản Sale/Trưởng Phòng/Giám Đốc thật và duyệt nộp bù thật: phiên hiện tại chỉ là Super Admin; không tạo hồ sơ thử trong dữ liệu vận hành. Chưa Publish.
