# Kiểm kê ban đầu: Kho Role và ô vị trí

Kiểm tra chỉ đọc ngày 11/11/2026. Chưa chuyển dữ liệu, chưa reset, chưa Publish.

## Xác minh
- Preview `/organization` mở bằng phiên hiện tại; nút Role & Phân quyền hoạt động, không có JavaScript pageerror trong lượt kiểm tra.
- Code/journal có migration đến `0358`; mốc applied mới nhất `1794379454726` khớp entry 0358. Không có file 0359/0360/0361 trong cây hiện tại. Công cụ kiểm kê toàn bộ lịch sử từ chối vì vượt giới hạn kích thước; không tuyên bố đã xác minh từng migration cũ.
- 33 Role: 27 `standard`, 6 `archived`. Hai liên kết `user_roles`; 13 bản ghi override — đây là số bản ghi, không phải khẳng định 13 nguồn đang cấp quyền.
- 25 chức danh, 17 đang hoạt động; tất cả 17 có liên kết Role. Không có nhóm liên kết chức danh nhiều Role trong dữ liệu kiểm kê.
- 5 Role nhiệm vụ yêu cầu đã có đúng ID: `role-content-web`, `role-seo`, `role-local-seo`, `role-social`, `role-video`; hiện nhóm catalog là Marketing.
- 3 ID trong danh sách khởi đầu chưa tồn tại: `role-standard-sales-team`, `role-standard-hr-staff`, `role-standard-packer`. HCNS/Đóng hàng đã có Role được tham chiếu với ID khác; phải giữ ID và mapping rõ ràng, không tạo bản trùng. Trưởng nhóm Kinh doanh cần cấu hình Role riêng theo quyền/phạm vi đã kiểm chứng.

## Khoảng trống quan trọng
- `org_titles` đang chứa cả chức danh dùng chung và vị trí: Trưởng Phòng có 2 người/2 đơn vị; Giám Đốc có 2 người/2 đơn vị; Nhân viên Marketing có 4 người/1 đơn vị; Nhân viên Kinh doanh có 9 người/4 đơn vị. Đây không tự động là xung đột của ô thực tế vì chưa có định danh ô riêng.
- Có 32 cặp khoảng bổ nhiệm giao nhau theo cùng chức danh/đơn vị trong toàn bộ lịch sử. Không tự sửa hoặc coi là 32 vi phạm: mô hình cũ cho phép chức danh nhân viên nhiều người; cần phân loại và xem trước việc tách ô.
- Ràng buộc hiện tại cho nhiều liên kết Role trên một chức danh; ghi tổ chức kiểm tra capacity dưới khóa chung nhưng chưa có một ô độc lập cho từng nhân viên. Giao diện liên kết vẫn chọn Role bổ sung.
- `private.mkt_specialty_rules` kiểm tra trạng thái tài khoản/chuyên môn nhưng chưa đòi bổ nhiệm Marketing; `mkt_specialty_save` cũng chưa có điều kiện này. Thiết kế/Chụp ảnh đang dùng catalog chuyên môn cùng nhóm: phải giữ dữ liệu và tách rõ khỏi 5 Role nhiệm vụ, không tự xóa.
- `private.base_unit_member` kết hợp quyền đã được tổng hợp với bất kỳ membership hiệu lực của người quản lý; cần gắn permission với đúng bổ nhiệm cấp permission để không dùng phạm vi kiêm nhiệm khác.
- Danh sách Role đang đếm liên kết trực tiếp nên thường hiển thị 0 tài khoản dù có quyền qua bổ nhiệm; cần số nguồn/nhân sự hiệu lực và trạng thái tải/lỗi rõ ràng.
- Màn hình Role thiếu tạo/ngừng/xóa an toàn, phân loại nhiệm vụ; cơ chế xóa hiện còn chặn cả tham chiếu lịch sử. Cần snapshot audit giữ ID trước khi cho xóa Role không còn nguồn vận hành.

## Chưa sẵn sàng reset
Chưa có snapshot phục hồi cho yêu cầu mới, chưa chuyển ô, chưa kiểm chứng 15 tình huống hay toàn bộ workflow. Không thay các nguồn đang dùng trước khi có nguồn thay thế tương đương và xác nhận có thẩm quyền.