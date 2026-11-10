# Bước 1 — Role chuẩn theo chức vụ

## Đã triển khai
- Dùng duy nhất 18 Role gốc; không tạo/copy Role, không sửa ID hoặc permissions hiện có.
- 9 liên kết đã áp dụng bằng Super Admin hệ thống qua giao diện xem trước → xác nhận → đọc lại backend. Không chọn chức năng tự cấp cho nhân sự đang sử dụng trong lần chuẩn hóa này.
- Cơ chế cấp/thu hồi thực tế theo nguồn bổ nhiệm và khoảng hiệu lực; kiêm nhiệm cộng nguồn, kết thúc một nguồn không xóa nguồn khác hoặc Role trực tiếp. Quyền DENY ưu tiên; Role đổi permissions làm hết hiệu lực chữ ký đã kiểm chứng.
- Có thể chọn 16 chức năng cá nhân đã kiểm chứng thuộc Nghỉ phép, Chấm công và Thiết kế. Không bật quyền quản lý theo đơn vị, quyền hệ thống, tài chính, Tín hiệu hay Marketing khi chưa kiểm chứng đủ phạm vi.
- Danh mục Role có vị trí áp dụng, chức năng và Tùy chỉnh quyền; liên kết chức vụ dùng cùng quy trình thay đổi cơ cấu, không tạo màn quản trị thứ hai.

## Chức vụ → Role gốc đã liên kết
| Chức vụ | Role |
|---|---|
| Giám đốc Marketing | Leader Marketing |
| Trưởng phòng Marketing | Leader Marketing |
| Trưởng phòng Thiết kế | Designer / Chụp ảnh |
| Nhân viên Thiết kế | Designer / Chụp ảnh |
| Kế toán trưởng | Kế Toán |
| Kế toán kho | Kế Toán |
| Hành chính Nhân sự | Hành Chính Nhân Sự |
| Trưởng phòng Mua hàng & Giao vận | Cung Ứng |
| Nhân viên Thu mua | Cung Ứng |

Các liên kết này chưa cấp trọn Role. Quyền quản lý Marketing theo Khối/Phòng, quản lý Thiết kế, Kế toán/HCNS và Mua hàng theo đơn vị chưa thể kích hoạt an toàn. Nhân viên Marketing chưa liên kết tự cấp theo nhiệm vụ; Nhân viên Đóng hàng chưa có Role riêng phù hợp, không lấy quyền Cung Ứng để thay thế.

## Kiểm thử và bảo toàn
- 151 kiểm thử liên quan đạt trước vòng xác nhận tối ưu cuối: cấp/thu hồi, kiêm nhiệm, đa nguồn, tài khoản trống/khóa, tương lai/hết hạn/hủy, DENY, Role thay đổi, chống nâng quyền, giao dịch RPC/RLS và hồi quy Thiết kế/Nghỉ phép/Chuyên môn.
- Kiểm thử bổ nhiệm/miễn nhiệm thực hiện trong PGlite cô lập bằng migrations thật, không trên nhân sự thật. Super Admin hiện có nghiệm thu danh mục/liên kết Preview; desktop/mobile không lỗi JavaScript hoặc tràn ngang. Admin/quản lý/nhân viên chưa được nghiệm thu đầy đủ frontend bằng tài khoản thật; không đăng nhập tài khoản nhân sự khác.
- Hash trước–sau trùng tuyệt đối: app_roles 18, user_roles 26, biz_appointments 39, org_assignments 75. Toàn bộ quyền hiện tại và Kinh doanh giữ nguyên; không tạo Super Admin, không reset, không Publish.

## Chưa hoàn tất / bước 2–3
1. Kiểm chứng và thực thi phạm vi quản lý từng phân hệ; hiện Tasks/Video/Content/Social còn policy đọc rộng cho tài khoản hoạt động nên không bật kế thừa quyền quản lý.
2. Marketing: nhiệm vụ → Role theo nguồn, danh sách chuyên môn khi giao job; chưa cấp quyền từ chuyên môn.
3. Nhân viên Đóng hàng cần đối chiếu chức năng thực tế trước khi đề xuất Role riêng.
4. Reset quyền cá nhân cũ ngoài Kinh doanh chỉ sau khi cơ chế mới được nghiệm thu và có yêu cầu/xác nhận riêng; chưa làm.

Bước 1 mới hoàn thành nền cấp/thu hồi an toàn và liên kết; chưa hoàn thành toàn bộ quyền quản lý tự động.