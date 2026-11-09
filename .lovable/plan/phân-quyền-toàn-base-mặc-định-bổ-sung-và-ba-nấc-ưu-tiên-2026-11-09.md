# Phân quyền toàn Base: mặc định, bổ sung và ba nấc ưu tiên

## Hiện trạng đã xác minh
- Base có Role, quyền riêng từng người và cơ cấu **Kinh doanh**; chưa có cơ cấu tổ chức toàn Base hoặc bộ xét quyền ba nấc.
- Quyền riêng hiện tại thay thế Role, không phải quyền cộng thêm. Cơ chế này sẽ được giữ nguyên làm nguồn cũ.
- Kinh doanh/3K/CRM đang dùng quyền tổ chức riêng; Role cũ của các nghiệp vụ này đã bị vô hiệu. Không khôi phục những quyền đó bằng fallback.
- Backend dùng chung giữa Preview và bản đang chạy: mọi thay đổi nền tảng phải bổ sung, chưa kích hoạt quyền mới trên nhân sự hiện tại.

## Kết quả cần xây dựng
### 1. Nền tảng tổ chức toàn Base
- Thêm **Hành chính & Nhân sự → Cơ cấu tổ chức**, với Khối, Phòng/Bộ phận, Nhóm, Chức danh và phân công nhân sự có thời gian hiệu lực.
- Tái sử dụng tài khoản và ID nhân sự; không tạo tài khoản/Role trùng, không chuyển người hoặc suy diễn đơn vị từ tên.
- Liên kết cơ cấu Kinh doanh hiện có qua ánh xạ được quản trị viên xác nhận; không sao chép hay thay nguồn bổ nhiệm Kinh doanh.
- Chức danh, Role và nhiệm vụ độc lập; chỉ cấu hình quyền đã được chủ động áp dụng mới có hiệu lực.

### 2. Quyền mặc định và bổ sung
- Cấu hình quyền mặc định theo đơn vị/chức danh, hiển thị nguồn kế thừa và nguồn trực tiếp.
- Cấp/thu hồi quyền bổ sung từng người, phạm vi được hỗ trợ và thời hạn; thu hồi không xóa quyền mặc định hoặc nguồn cũ.
- Bộ quyền tùy chỉnh hỗ trợ nhiều người/nhiều bộ, sao chép, sửa, ngừng sử dụng và xem người đang dùng; thay đổi bộ đã gán bắt buộc xem trước và xác nhận tác động.
- Danh sách hành động lấy từ quyền thực tế hiện có. Mẫu phòng ban/chức danh chỉ là nháp, không tự gán.

### 3. Bộ quyết định quyền ba nấc
- **Nấc 1:** tổ chức mới (mặc định + trực tiếp + bộ quyền). Tách ALLOW, DENY và NOT_CONFIGURED; DENY phù hợp cùng hành động/tài nguyên thắng ALLOW, hiển thị xung đột.
- **Nấc 2:** cơ chế Kinh doanh hiện có, chỉ trong module và phạm vi do nó quản lý.
- **Nấc 3:** Role/quyền riêng cũ cho các nghiệp vụ còn cho phép nguồn này. Kết quả từ chối của Kinh doanh/3K/CRM không được đổi thành “chưa cấu hình” để thử lại Role.
- Hết hạn/thu hồi/chưa cấu hình Nấc 1 quay về đúng kết quả cũ; không có nguồn hợp lệ thì từ chối.
- Giữ kiểm tra tài khoản hoạt động, danh tính, chủ sở hữu, phạm vi lịch sử và điều kiện nghiệp vụ ngoài phép cộng quyền. Bảo toàn cơ chế quản trị đặc quyền hiện tại; không cho nhân sự tự nâng quyền.

### 4. Tích hợp từng module
- Đối soát quyền cũ–mới trước, sau đó nối bộ quyết định vào từng nhóm nghiệp vụ và kiểm thử trước khi cho áp dụng nhóm đó.
- CRM: cấp sử dụng cá nhân ngoài Kinh doanh với phạm vi cụ thể được hỗ trợ; không mặc định toàn CRM, không sửa quy thuộc lịch sử hoặc chủ sở hữu.
- Tín hiệu, Marketing, Thiết kế, Đơn hàng, Nhân sự, Tài chính và Sale Work dùng cùng kết quả hành động nhưng giữ ràng buộc dữ liệu riêng.
- Phê duyệt tài chính vẫn cần đúng người/lượt/trạng thái; Tạm ứng Lương độc lập; quản trị Sale Work vẫn không đọc mật khẩu cũ của nhân viên.
- Không cho áp dụng một quyền/phạm vi mới nếu đường đọc, ghi, báo cáo, xuất hoặc tệp của module đó chưa tích hợp đầy đủ. Không sửa hàng loạt chính sách hiện có.

### 5. Màn hình quản trị
- Nhân sự có ba tab **Quyền mặc định / Quyền bổ sung / Quyền thực tế**, tìm kiếm và nhóm chức năng thu gọn.
- Quyền thực tế hiển thị cho phép/từ chối, nguồn, nấc, thời hạn, phạm vi và điều kiện nghiệp vụ còn phải thỏa mãn; không khẳng định quyền chung đồng nghĩa được xử lý mọi hồ sơ.
- Mọi thay đổi cấp/thu hồi/bộ quyền/quyền mặc định/điều chuyển/chức danh đều có xem trước hiện tại–sau, thêm/mất, người ảnh hưởng và nguồn thay đổi.
- Lưu sau xác nhận có thẩm quyền, ghi nhật ký; chống áp dụng bản xem trước đã lỗi thời.
- Mobile dùng App Shell hiện có, thẻ nhân sự, nhóm thu gọn và nút rõ ràng; không bảng kéo ngang. Desktop không thay Sidebar ngoài điểm đến mới được yêu cầu.

## Chi tiết kỹ thuật
- Thêm dữ liệu tổ chức/liên kết, quy tắc quyền, bộ quyền, gán bộ và nhật ký bằng migration bổ sung; GRANT + RLS đầy đủ, ghi qua RPC có kiểm quyền. Không sửa Role hoặc tạo quyền gán thật trong migration.
- Bộ xét quyết định có ngữ cảnh tài nguyên/phạm vi và provenance. Tách resolver legacy, giữ đồ thị gọi một chiều để tránh đệ quy giữa `has_permission`, `sig_can`, `biz_can`, `k3_can` và `crm_can`.
- Tích hợp cả nơi gọi `has_permission` trực tiếp, không chỉ `sig_can`; kiểm tra độc lập RLS và quyền storage. Quyền có scope không thể được chuyển thành boolean ALLOW toàn cục cho mọi tài nguyên.
- Phạm vi là giao của grant hợp lệ và ràng buộc bắt buộc; chỉ hợp phạm vi các ALLOW cùng nấc sau khi loại DENY phù hợp. Chọn phạm vi được allowlist theo module đã tích hợp.
- API quyền thực tế máy chủ là nguồn cho giao diện/menu, cache theo user, hiệu lực và phiên bản; invalidation khi thay đổi quyền/tổ chức/bộ quyền và thời hạn. Giữ bảo vệ ghim Mobile khi quyền chưa tải xong.
- Xem trước và áp dụng dùng cùng evaluator; khóa/kiểm version và danh sách nhân sự ảnh hưởng khi xác nhận, ghi before/after nguyên tử.

## Kiểm thử và nghiệm thu
- Viết kiểm thử từng quy tắc trong 25 kịch bản của tài liệu: fallback, DENY, nguồn quyền, nhiều bộ, thu hồi/hết hạn, chống tự cấp, giới hạn CRM/lương/tài chính/Sale Work và xem trước/nhật ký.
- Kiểm thử resolver thật cùng RLS/RPC/tệp, không chỉ các helper giả lập; chạy hồi quy Kinh doanh/3K/CRM/Tài chính/Sale Work và menu/ghim.
- Đối soát trước/sau khi Nấc 1 chưa cấu hình: không người nào đổi quyền; sau áp dụng chỉ đúng người/quyền/phạm vi được xác nhận thay đổi.
- Kiểm tra Mobile/Desktop và luồng cấp → đọc quyền → thao tác → thu hồi bằng phiên được phép. Không tự tạo dữ liệu nghiệp vụ giả hoặc gửi thông báo thử trên backend chung.
- Báo cáo phần đã tích hợp, nguồn đang hoạt động, chênh lệch trước/sau và phần chưa nghiệm thu. **Không Publish, không tự kích hoạt hoặc tự gán quyền cho nhân sự hiện tại.**

## Thứ tự thực hiện
1. Đóng băng baseline và kiểm thử semantics/khả năng tương thích.
2. Tổ chức/liên kết và nền tảng quyền ở trạng thái chưa gán.
3. Quyền thực tế/xem trước, rồi tích hợp backend từng module.
4. Màn hình mặc định/bổ sung/bộ quyền và quản trị nhân sự.
5. Hồi quy, đối soát, nghiệm thu phiên thật; quản trị viên chủ động áp dụng cấu hình.