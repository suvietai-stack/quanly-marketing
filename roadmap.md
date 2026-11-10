# Lộ trình hiện tại

## Trung tâm Phê duyệt toàn Base (xong phần code)
- [x] Mở rộng `approval_center_read` 15 nguồn, deep link, nhóm lọc, cô lập lỗi
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng đăng nhập

## Chuẩn hóa Cơ cấu tổ chức, Chức vụ, Cấp bậc toàn Base (spec mới)
- [ ] Rà soát code hiện tại (BaseOrganization, OrgChart, basePermissions, Biz) — đang chạy
- [ ] Chuẩn hóa cơ cấu mặc định: GĐĐH cấp 5 → Phó GĐĐH cấp 4 → 3 khối (Kinh doanh dùng Biz thật; Marketing: Marketing+Thiết kế; Vận hành: HCNS, Kế toán, Mua hàng & Giao vận), chức danh cấp 2/0, vị trí trống hiện "Chưa phân công"
- [ ] Chức danh có mã ổn định, cấp bậc, loại Quản lý/Nhân viên, số người đảm nhiệm — không đoán quản lý theo chữ "Trưởng"
- [ ] Giao diện 4 khu vực: Sơ đồ (mở/thu, tìm, gán/đổi/bỏ gán), Nhân sự, Cài đặt (Đơn vị / Chức vụ & Cấp bậc / Bộ quyền bổ sung), Nhật ký
- [ ] Gán người đơn giản từ sơ đồ; vị trí quản lý 1 người thay thế an toàn; Kinh doanh vẫn dùng bổ nhiệm Biz hiện có
- [ ] Chỉnh quyền mặc định theo chức danh (quyền thật backend hỗ trợ, xem trước số người ảnh hưởng); quyền bổ sung cá nhân không ảnh hưởng người khác
- [ ] Giữ nguyên Role cũ + quyền Kinh doanh; không migration phân quyền hàng loạt; không tự cấp quyền khi gán
- [ ] Mobile/Desktop theo spec; kiểm thử + build; chưa Publish
