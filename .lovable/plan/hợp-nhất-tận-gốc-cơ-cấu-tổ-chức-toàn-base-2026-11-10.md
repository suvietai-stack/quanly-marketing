# Hợp nhất tận gốc Cơ cấu tổ chức toàn Base

## Kết quả cần bàn giao

- `/organization` là nơi duy nhất quản lý cơ cấu, chức vụ, phân công, bổ nhiệm và điều chuyển.
- Một cây tổ chức, một drawer 5 tab, một danh sách chức vụ và một quy trình **Thay đổi → Xem trước → Xác nhận → Áp dụng → Nhật ký** cho mọi khối.
- Bỏ hoàn toàn giao diện `BizOrganization`, `BizPositions`, `BizAppointments` sau khi chuyển đủ chức năng; không nhúng hoặc mở lại ở nơi khác.
- Giữ ID, mã chức vụ nghiệp vụ, tài khoản, Role trực tiếp, lịch sử và liên kết CRM/Tín hiệu/KR/KPI/Báo cáo/Phê duyệt.

## Hiện trạng đã kiểm chứng

Database hiện có 3 Hệ, 4 Phòng, 0 Nhóm; 39 bổ nhiệm Biz, trong đó 16 bản ghi active trong thời hạn; 6 chức vụ Biz và 11 chức vụ Base. Có 26 tài khoản có Role trực tiếp. Chưa có liên kết Role chức vụ hoặc phân công Base. Baseline, dấu đối chiếu và các giới hạn cách đếm đã lưu trong báo cáo đối chiếu.

Hai đường quản trị hiện tại lưu riêng: Base theo cấu hình phiên bản, Biz theo bảng nghiệp vụ. Nhiều khóa ngoại và quy tắc lịch sử vẫn phụ thuộc ID Biz. Liên kết Role đang bị chặn thực sự ở database; chưa có Role nào đủ kiểm chứng để tự kế thừa.

## Triển khai theo thứ tự

### 1. Chốt đối chiếu và bảo toàn
- Hoàn tất bản đồ ID/quan hệ và kiểm tra dữ liệu đang triển khai, gồm phân công chính, kiêm nhiệm, bổ nhiệm quản lý, quyết định legacy và thời gian hiệu lực.
- Lưu số lượng, dấu đối chiếu, các quan hệ chưa ánh xạ và phương án khôi phục riêng tư trước chuyển đổi.
- Không tự gộp bản ghi có ý nghĩa khác nhau; Phòng chưa xác định cha hiện ở nhóm riêng, chờ quản trị viên xác nhận.

### 2. Một nguồn tổ chức có thẩm quyền
- Thêm mô hình tổ chức chuẩn cho đơn vị, chức vụ, phân công và lịch sử. Giữ nguyên ID có sẵn; không sao chép để tạo hai nguồn cùng được chỉnh.
- Phân biệt rõ phân công chính, kiêm nhiệm, bổ nhiệm quản lý; giữ thời gian/snapshot nguyên gốc và dấu vết nguồn cũ.
- Giữ các bảng/API Biz cần cho nghiệp vụ làm lớp tương thích được backend kiểm soát; cập nhật tương thích trong cùng giao dịch với nguồn chuẩn, không đồng bộ hai chiều từ giao diện.
- Khóa hoặc chuyển các đường ghi tổ chức cũ thành adapter dùng cùng dịch vụ; cả đường ghi Base và Biz không còn được cập nhật độc lập.

### 3. Một quy trình thay đổi an toàn
- Xem trước ở máy chủ, gắn người thao tác, phiên bản, hạn dùng và trạng thái nguồn; dữ liệu đổi sau xem trước phải xác nhận lại.
- Áp dụng nguyên tử cả thay đổi tổ chức, cập nhật tương thích và nhật ký; thất bại một phần thì hoàn tác toàn bộ.
- Bổ nhiệm có ngày hiệu lực/lý do; thay thế hoặc miễn nhiệm giữ quyết định cũ. Điều chuyển chọn chính xác phân công nguồn cần kết thúc; không tự chuyển khách hàng, công việc hay snapshot người duyệt.
- Kiêm nhiệm không nhân đôi hồ sơ, tài khoản hoặc nghĩa vụ báo cáo cá nhân.

### 4. Giao diện chung và dọn giao diện cũ
- Bốn mục: **Sơ đồ / Nhân sự / Cài đặt / Nhật ký**; Cài đặt có cây đơn vị, chức vụ/cấp bậc chung, Role mặc định và quyền bổ sung.
- Mọi Khối/Hệ/Phòng/Nhóm mở cùng `OrgUnitDrawer`; checkbox chọn nhiều người, chọn tất cả kết quả lọc, chức vụ, chính/kiêm nhiệm, xem trước và xác nhận.
- Đưa đầy đủ khả năng tạo/sửa đơn vị, bổ nhiệm có lịch hiệu lực, thay thế, miễn nhiệm, điều chuyển, lịch sử và chính sách chức vụ Biz vào điều khiển chung.
- Ban điều hành ở cấp công ty; Hệ/Nhóm được phép xuất hiện ở mọi khối. Giữ slot trống, tìm kiếm, số người duy nhất và thông tin kiêm nhiệm.
- Sau khi chức năng thay thế đạt kiểm thử, gỡ component/import/state/entry point cũ; không xóa API đọc hoặc xử lý nghiệp vụ còn phụ thuộc.

### 5. Quyền phạm vi và Role mặc định
- Backend kiểm tra quyền xem/sửa đơn vị, phân công, bổ nhiệm, chức vụ, lịch sử và Role; phạm vi đơn vị + con cháu, DENY ưu tiên, chặn chu trình/đơn vị ngừng và tự nâng quyền.
- Người được ủy quyền thao tác đúng phạm vi, không bị chặn toàn bộ chỉ vì không phải Super Admin; quyền nhạy cảm vẫn có xác nhận và giới hạn cấp quyền.
- Dùng Role gốc hiện có, một Role chính và Role bổ sung; nguồn kế thừa gắn phân công và thời gian hiệu lực, không nhập lẫn Role trực tiếp.
- Chỉ kích hoạt Role sau khi kiểm chứng mọi quyền của nó ở đọc/ghi/báo cáo/xuất/duyệt/thông báo. Role chưa đạt hiện **Chưa thể kích hoạt** và lý do; giữ fence 0307 trong khi chưa đạt.
- Không phục hồi quyền Biz/3K legacy từ Role tổng; không thu hồi Role trực tiếp hoặc nguồn cấp khác khi kết thúc bổ nhiệm.

### 6. Kiểm thử, đối chiếu và bàn giao
- Bao phủ 22 tình huống trong tài liệu: drawer chung, gán hàng loạt, bổ nhiệm, điều chuyển trong/cross-khối, kiêm nhiệm, điều hành công ty, tạo khối/chức vụ, Role, scope, lịch sử và bảo toàn nghiệp vụ.
- Kiểm thử database thật về quyền từ chối, cạnh tranh phiên bản, mốc hiệu lực và rollback khi cập nhật tương thích thất bại; không chỉ dùng kiểm thử cũ với quyền giả lập.
- Hồi quy CRM, Tín hiệu, KR, KPI/3K, Báo cáo/Kế hoạch và phê duyệt; so sánh ID, dấu đối chiếu, lịch sử và quyền trước–sau, giải thích mọi chênh lệch.
- Nghiệm thu sau đăng nhập trên desktop/mobile; thao tác ghi thử bằng dữ liệu kiểm thử cô lập, không tạo dữ liệu giả trong hệ thống thật.
- Báo rõ bất kỳ phụ thuộc chưa chuyển an toàn; không đánh dấu hoàn tất nếu còn hai nguồn ghi độc lập.

## Chi tiết kỹ thuật

- Migration bổ sung mới, không sửa migration đã triển khai hoặc xóa cột/bảng nghiệp vụ.
- Canonical units/titles/assignments + parent history/source mapping; giữ UUID/text ID gốc. Các bản ghi legacy khác loại không được ép thành một membership.
- Một dịch vụ RPC preview/apply với lock order thống nhất, version/fingerprint/transition fences và private compatibility helpers; bảng tổ chức client chỉ đọc, RLS và GRANT đầy đủ.
- Giao diện cây chỉ nhận mô hình chuẩn; bỏ `buildBizBlock/buildBaseBlocks`, cờ `!node.biz` và bộ dựng nhân sự riêng. Adapter nguồn chỉ tồn tại ở lớp chuyển đổi/tương thích, không trở thành hai đường quản trị.
- Làm mới cache quyền theo user và mốc hiệu lực, đồng thời làm mới các truy vấn nghiệp vụ sau áp dụng; không phụ thuộc đăng nhập lại để thu hồi quyền.

## Giới hạn triển khai

**Chưa Publish.** Preview và bản đang dùng hiện chia sẻ backend: migration có thể ảnh hưởng cả hai dù chưa Publish. Kiểm chứng chuyển đổi trong môi trường cô lập trước khi áp dụng backend chung; không thử miễn nhiệm/điều chuyển nhân sự thật để nghiệm thu. Không thể khẳng định Role đã kế thừa khi kiểm tra phạm vi chưa đạt.