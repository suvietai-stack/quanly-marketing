# Module "Tín hiệu cơ hội" — đề xuất chờ duyệt

Theo tài liệu: Bước 1 (kiểm tra) đã làm, bản này là Bước 2. Chưa đổi gì trong cơ sở dữ liệu. Khi bạn duyệt, tôi mới áp dụng thay đổi và dựng giao diện.

## Hiện trạng
- Phân quyền dùng `app_roles.permissions` + `user_permission_overrides`, kiểm tra ở cơ sở dữ liệu bằng hàm `has_permission()`. Chưa có quyền Kinh doanh.
- Các bảng nghiệp vụ cũ lưu dạng `data jsonb`. Module mới dùng bảng có cột rõ ràng để khóa quyền sửa theo từng trường.
- Không động vào Task, Web, Social, Video, Order, SEO, KPI.

## Quyền mới (thêm vào danh mục quyền hiện có, không đổi cách đăng nhập)
- `signal.create`: Marketing tạo tín hiệu, sửa thông tin gốc tín hiệu do mình tạo.
- `signal.view_all`: xem toàn bộ tín hiệu (quản lý, Marketing được cấp).
- `signal.assign`: giao hoặc đổi Sale.
- `signal.sale`: Kinh doanh, chỉ thấy tín hiệu giao cho mình.
- `signal.manage`: sửa mọi tín hiệu, mở lại tín hiệu Chốt/Trượt.
- `signal.report`: xem báo cáo.
Super Admin có đủ quyền. Các vai trò khác do Admin tự bật trong Cài đặt → Vai trò. Không vai trò nào tự động có quyền.

## Cấu trúc dữ liệu (3 bảng mới)
1. `opportunity_signals`: ngày phát hiện, khách hàng, SĐT (lưu dạng chữ, giữ số 0 đầu), địa chỉ, chi tiết nhu cầu, sản phẩm[], nhóm nhu cầu, nguồn, ghi chú Marketing, `created_by`, `assigned_to`, trạng thái (`waiting` / `consulting` / `won` / `lost`, chưa giao thì trống), ngày liên hệ tiếp, doanh số, lý do trượt, `closed_at`, các mốc thời gian. Có kiểm tra ở cơ sở dữ liệu: Chốt phải có doanh số > 0, Trượt phải có lý do.
2. `opportunity_signal_notes`: lịch sử tư vấn gồm người ghi, thời gian, nội dung, trạng thái trước và sau, ngày hẹn. Chỉ thêm mới, không ai được sửa hoặc xóa.
3. `opportunity_signal_events`: lịch sử giao/đổi Sale, mở lại và sửa thông tin gốc. Chỉ thêm mới.

Danh mục sản phẩm, nhóm nhu cầu, nguồn và lý do trượt đặt trong một file dùng chung. Sau này có thể chuyển sang bảng danh mục `catalogs` có sẵn.

## Bảo mật ở cơ sở dữ liệu (RLS)
- Xem tín hiệu: người có `view_all`/`manage`, người tạo tín hiệu, hoặc Sale đang được giao (`assigned_to = mình`). Sale khác không đọc được, kể cả gọi thẳng qua API. Khi đổi Sale, Sale cũ mất quyền ngay.
- Sửa trực tiếp bảng: chỉ người tạo tín hiệu (khi tín hiệu chưa kết thúc) hoặc người có `manage`. Sale **không** có quyền sửa trực tiếp.
- Sale cập nhật qua một hàm có kiểm tra quyền `signal_sale_update(id, status, note, next_contact, revenue, lost_reason)`. Hàm chỉ đổi các trường tư vấn, tự ghi lịch sử và từ chối nếu tín hiệu không giao cho người gọi hoặc đã kết thúc.
- Giao Sale qua hàm `signal_assign(id, user)`: cần `assign`, người nhận phải có `signal.sale`. Trạng thái về "Chờ nhận" và có ghi lịch sử bàn giao.
- Mở lại qua hàm `signal_reopen(id, reason)`: cần `manage`, có ghi lịch sử.
- Một trigger chặn việc đổi Sale, trạng thái hoặc doanh số khi không đi qua các hàm trên, và chặn sửa tín hiệu đã Chốt/Trượt. Nhờ vậy việc ẩn nút trên giao diện không phải lớp bảo vệ duy nhất.
- Lịch sử: chỉ đọc theo quyền xem tín hiệu, chỉ ghi qua các hàm trên.

## Giao diện
- Menu mới "Tín hiệu cơ hội" với 2 trang: `/signals` (danh sách, kèm nút "+ Thêm tín hiệu" mở biểu mẫu) và `/signals/report`.
- Sale thấy "Tín hiệu của tôi": 4 ô thống kê (Chờ nhận, Đang tư vấn, Cần liên hệ hôm nay, Đã chốt tháng này), danh sách dạng thẻ, nút lớn "Gọi điện" (mở trình gọi của điện thoại) và "Xem chi tiết".
- Màn hình máy tính dùng bảng 8 cột như tài liệu. Có lọc nhanh và ô tìm kiếm; kết quả tìm vẫn bị RLS giới hạn trong phạm vi được phép.
- Chi tiết tín hiệu có 3 phần: Thông tin khách hàng (Sale chỉ xem), Lịch sử tư vấn và Cập nhật tư vấn. Trên điện thoại, nút "Lưu cập nhật" cố định ở cuối màn hình.
- Báo cáo có bộ lọc: thời gian (chọn tính theo ngày tạo hoặc ngày chốt), nguồn, sản phẩm, nhóm nhu cầu, Sale, người tạo, trạng thái. Gồm 3 phần: Tổng quan, Hiệu quả Marketing, Hiệu quả Sale. Tỷ lệ chốt = Chốt / (Chốt + Trượt); khi chưa có tín hiệu kết thúc thì ghi "Chưa có dữ liệu". Tín hiệu quá lịch là tín hiệu có ngày liên hệ tiếp trước hôm nay và chưa kết thúc.

## Kiểm thử
- Kiểm thử logic cho báo cáo (ngày tạo và ngày chốt, tỷ lệ chốt) và kiểm tra dữ liệu trên biểu mẫu.
- Kiểm thử quyền ngay trong cơ sở dữ liệu với 2 tài khoản Sale giả lập, bọc trong một giao dịch rồi hủy bỏ, để không để lại dữ liệu khách hàng nào. Nội dung kiểm: Sale khác không đọc được tín hiệu, Julia không sửa được tên/SĐT/nguồn, Julia cập nhật tư vấn được, đổi Sale thì Julia mất quyền, Chốt không có doanh số thì bị từ chối, Trượt không có lý do thì bị từ chối.
- Chạy typecheck, build và 56 bài kiểm thử cũ.

## Giới hạn
- Chưa có danh sách tín hiệu chung cho Sale và chưa che số điện thoại. Hiện không cần vì Sale chỉ thấy tín hiệu của mình.
- Quyền "trong phạm vi" chỉ gồm hai mức: toàn bộ, hoặc tín hiệu do mình tạo/được giao. Base chưa có phòng ban hay khu vực để chia nhỏ hơn.
- Không Publish.
