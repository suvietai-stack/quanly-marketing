# Lộ trình hiện tại

## Liên kết Role hiện có với chức vụ toàn Base
- [x] Rà soát Role, nguồn cấp quyền, phạm vi và đường ghi hiện tại (18 Role, không có phân công Base trong dữ liệu đọc)
- [ ] Hoàn thiện kiểm tra phạm vi từng phân hệ trước khi bật đồng bộ Role (theo lựa chọn người dùng)
- [x] Liên kết Role gốc dạng chưa kích hoạt cho chức vụ Base/Biz; xem quyền Role, đề xuất bảo thủ, lưu nguyên tử có lý do/nhật ký/chống ghi đè (0307)
- [ ] Đối chiếu có tác động quyền và xác nhận trước khi cấp cho nhân sự cũ — chưa triển khai, phụ thuộc hoàn thiện kiểm tra phạm vi
- [ ] Cấp/thu hồi theo nguồn bổ nhiệm; giữ Role trực tiếp, ngoại lệ và phạm vi nghiệp vụ
- [x] Giao diện thiết lập Role chính/bổ sung và phạm vi đề xuất; nhân sự xem Role trực tiếp/Role chức vụ chưa cấp quyền
- [ ] Xem trước quyền thực tế và cấp/thu hồi nguồn hiệu lực — chưa triển khai, phụ thuộc hoàn thiện kiểm tra phạm vi
- [x] 69/69 kiểm thử đạt; build OK; không sửa quyền nhân sự thật, không Publish
- [ ] Nghiệm thu màn hình sau đăng nhập — không tạo được phiên cho người yêu cầu; cần đăng nhập Preview

## Hoàn thiện Cơ cấu tổ chức toàn Base (xong phần code)
- [x] Backend: quyền org.* có phạm vi đơn vị, RPC áp dụng phân công nguyên tử có kiểm tra phạm vi (migration 0306); org.manage_structure/org.manage_permissions còn bản nháp
- [x] Drawer quản lý đơn vị 5 tab: Nhân sự / Chức vụ & Cấp bậc / Phân quyền / Lịch sử / Cài đặt đơn vị
- [x] Gán nhiều nhân sự bằng checkbox (tìm kiếm, lọc chưa phân công/đơn vị khác, chọn tất cả, báo lỗi từng người)
- [x] Điều chuyển + kiêm nhiệm toàn Base (kết thúc phân công cũ có xác nhận khi đụng vị trí quản lý)
- [x] Xem trước dễ đọc (không JSON thô); chỉ bắt nhập ÁP DỤNG PHÂN QUYỀN khi thật sự sửa quyền
- [x] Lọc chức danh theo đơn vị ở tab Nhân sự
- [x] 28/28 test orgStructure, 53/53 gồm basePermissions, typecheck/build OK, cổng RPC xác thực đúng
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng

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

## Hợp nhất Cơ cấu tổ chức toàn Base, gỡ cơ cấu Kinh doanh cũ (xong phần code)
- [x] Một nơi quản lý duy nhất: /organization — sơ đồ 3 khối, bổ nhiệm/thay đổi/miễn nhiệm/lịch sử ngay trên sơ đồ cho đơn vị Kinh doanh (leaderCode + biz scope trên ChartNode), bổ nhiệm GĐĐH/Phó GĐĐH trên thẻ điều hành
- [x] Nhúng quản lý chi tiết Khối Kinh doanh (Hệ/Phòng/Nhóm/nhân sự/điều chuyển) và Chức vụ Kinh doanh vào trang Cơ cấu tổ chức — ghi qua đúng biz_org_save/biz_appointment_save/biz_position_save, không di trú dữ liệu, không đồng bộ hai chiều
- [x] Gỡ 3 tab trùng lặp trong Kinh doanh → Cài đặt (Cơ cấu tổ chức, Chức vụ & Cấp bậc, Phân quyền); giữ Quy trình/KR/Deadline/Quản trị nâng cao (quyền ngoại lệ có kiểm toán nằm trong Quản trị nâng cao); người chỉ có quyền cơ cấu thấy thông báo điều hướng tới /organization
- [x] Giữ nguyên backend quyền: biz_can/biz_scope_ok/biz_appointments không đổi; không cấp quyền rộng hơn; bảng biz_* vẫn là kho vận hành
- [x] 21/21 test orgChart+orgStructure, 56/56 hồi quy biz organization/positions + basePermissions, typecheck/build OK
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng
