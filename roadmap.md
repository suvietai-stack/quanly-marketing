# Lộ trình hiện tại

## Trung tâm Phê duyệt toàn Base (xong phần code)
- [x] Mở rộng `approval_center_read` 15 nguồn, deep link, nhóm lọc, cô lập lỗi
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng đăng nhập

## Chuẩn hóa Cơ cấu tổ chức, Chức vụ, Cấp bậc toàn Base (xong phần code)
- [x] Chức danh chuẩn: mã ổn định, cấp bậc 0–5, loại Quản lý/Nhân viên, số người tối đa; seed 11 chức danh có cấp bậc, backfill chức danh cũ không đổi tên/quyền
- [x] Không đoán quản lý theo tên với dữ liệu mới (kind rõ ràng; name-inference chỉ fallback dữ liệu cũ)
- [x] Sơ đồ: nhãn Cấp N + Quản lý, ô quản lý/cấp cao xếp trước, "Chưa phân công" giữ nguyên
- [x] Cài đặt 3 nhóm: Đơn vị tổ chức / Chức vụ & Cấp bậc (sửa đơn vị, cấp, loại, số người, mô tả + Chỉnh quyền mặc định kèm số người ảnh hưởng) / Bộ quyền bổ sung
- [x] Nhật ký hiển thị thay đổi tổ chức (gán/bỏ gán/đổi cấp/đổi tên) + thay đổi quyền (migration 0305 trả before/after config)
- [x] Giữ nguyên: Role cũ, backend Kinh doanh, fence 6 quyền kích hoạt, quy trình Xem trước → ÁP DỤNG PHÂN QUYỀN
- [x] 17/17 test orgStructure, 25/25 basePermissions, typecheck/build OK, không lỗi JS
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng (không mint được session: tài khoản chưa có trong auth)
