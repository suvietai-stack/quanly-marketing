# Sao Sứ Việt — MVP

## Kết quả
Ba khu vực: **Ví Sao của tôi**, **Gian hàng đổi quà**, **Quản lý thưởng Sao**. Nhân viên đạt thành tích hợp lệ được nhận Sao, thấy Chipi chúc mừng ở giữa màn hình và gửi yêu cầu đổi quà.

Giữ giao diện Soft Modern và Chipi Assistant hiện có. Không thêm cấp độ, bảng xếp hạng, nhiệm vụ ngày, vòng quay, huy hiệu, AI hay thưởng/phạt bằng tiền. Chưa Publish.

## 1. Ví Sao và gian hàng
- Ví hiển thị tổng Sao, Sao đang giữ và Sao có thể dùng; lịch sử nhận/đổi ghi nguồn thành tích hoặc lý do cộng thủ công.
- Gian hàng có ảnh, tên, giá Sao, số lượng còn khả dụng và yêu cầu đổi của người dùng. Admin tạo/sửa quà, bật/tắt bán, đặt giá và số lượng, xác nhận phát hoặc hủy yêu cầu.
- Khi yêu cầu đổi được gửi: giữ Sao và giữ số lượng quà. Khi phát thành công: trừ Sao đúng một lần. Khi hủy: giải phóng cả Sao và quà. Giá/tên quà tại thời điểm yêu cầu được giữ trong lịch sử.
- Không tự tạo quà thật, giá thật hoặc cộng Sao vào tài khoản nhân viên để làm mẫu. Admin nhập dữ liệu chính thức; ảnh quà có thể tải lên.

## 2. Thưởng tự động
Admin chọn một trong ba nguồn, nhập số Sao và bật/tắt. Mỗi nguồn có một quy tắc đơn giản; số Sao và thời điểm bật được lưu để kiểm toán. Mặc định chưa bật, không hồi tố khi bật hoặc bật lại.

| Nguồn | Điều kiện và người nhận |
|---|---|
| Chốt tín hiệu | Chuyển thực sự sang `won` qua quy trình hiện tại, có doanh thu hợp lệ; thưởng Sale được giao, không thưởng người quản lý chỉ thao tác thay. Không thưởng Trượt. |
| Hoàn thành KPI | KR của nhân viên có kết quả Đạt được chốt tại bước khóa kỳ theo quy trình Giao KPI. Không thưởng chỉ vì một ghi nhận thủ công được xác nhận hoặc thanh tiến độ đang đạt tạm thời. |
| Hoàn thành công việc | Task To-do List chuyển từ Chờ xác nhận sang Hoàn thành bằng thao tác Xác nhận hoàn thành hợp lệ; thưởng người phụ trách. Không thưởng trạng thái hoàn thành ép tay, gửi hoàn thành, hoặc `ot_tasks.done` không có nghiệm thu. |

Mỗi thành tích chỉ nhận một lần theo quy tắc, kể cả retry, mở lại rồi hoàn thành lại, đổi giá thưởng hoặc bật lại. Lịch sử cũ không được sửa.

**Điểm đã kiểm tra:** Tín hiệu có Sale và chuyển trạng thái thật. Task lưu lịch sử hành động nhưng dữ liệu nằm trong trường JSON. KPI có snapshot Đạt khi khóa kỳ, tuy nhiên kết quả được tính ở phía giao diện. Trước khi nối thưởng, bổ sung kiểm chứng phía máy chủ tại đúng bước xác nhận, không tin một giá trị Đạt hoặc Hoàn thành do trình duyệt tự gửi. Nếu một loại KPI không thể xác minh từ bằng chứng hiện có, không tự thưởng và ghi rõ giới hạn thay vì đoán.

## 3. Chipi chúc mừng
- Dùng đúng ảnh Chipi gốc tư thế ăn mừng; ảnh lớn, giữ tỷ lệ và logo, không vẽ lại.
- Popup giữa màn hình có nền tối nhẹ, số Sao vừa nhận, thành tích, tổng Sao sau cộng; nút **Khám phá gian hàng**, **Để sau**, và X.
- Nhún nhẹ, vài Sao bay/lấp lánh; tôn trọng giảm chuyển động.
- Chỉ xuất hiện sau giao dịch cộng thành công. Gộp phần thưởng chưa xem thành một lời chúc; lưu trạng thái đã hiển thị theo người dùng ở máy chủ để không lặp khi tải lại hoặc mở nhiều tab. Người offline nhận lời chúc khi quay lại.
- Chờ khi có biểu mẫu/popup quan trọng đang mở; không thay chuông, Chipi Assistant, Zalo hoặc Push và không gửi thông báo ra ngoài.

## 4. Phân quyền và an toàn
- Nhân viên đang hoạt động chỉ đọc ví, lịch sử và yêu cầu đổi của mình.
- Thêm quyền riêng cho quản lý chương trình, quà/phát quà và cộng Sao thủ công có lý do; dùng hệ thống quyền thực tế và Super Admin hiện có, không dựa vào tên role.
- Không mở quyền ghi số dư/giao dịch từ trình duyệt. Mọi cộng/giữ/trừ/hủy đi qua thao tác máy chủ được xác thực.
- Khóa giao dịch và ràng buộc chống trùng để hai yêu cầu đồng thời không vượt số dư hoặc tồn kho.
- Sau phần Sao, sửa vấn đề bảo mật đã phát hiện: cấu hình diễn biến chỉ cho tài khoản đang hoạt động có quyền Tín hiệu đọc, đúng lựa chọn của bạn; kiểm cả đường đọc trực tiếp và thao tác liên quan, không thay quy trình diễn biến.

## 5. Triển khai và kiểm thử
- Thêm các trang riêng cho Ví Sao, Gian hàng, Quản lý; bổ sung menu và thông tin chia sẻ từng trang.
- Thêm kiểm thử thực thi quy tắc: bật/tắt và không hồi tố, đúng người nhận, một thành tích/một thưởng, số dư, giữ/phát/hủy, đồng thời, phạm vi nhân viên/Admin, popup không lặp và gộp.
- Kiểm giao diện desktop và mobile 360/390px; giữ Chipi và các module hiện tại hoạt động.
- Kiểm luồng thật từ thành tích → ví → lời chúc → đổi → phát/hủy trong môi trường dữ liệu tách biệt. Nếu chỉ có dữ liệu production dùng chung, không tự tạo thành tích hoặc phát quà thử cho nhân viên; báo rõ phần chưa kiểm end-to-end.
- Bàn giao nguồn thưởng đã nối/nguồn còn giới hạn, danh sách file và thay đổi dữ liệu, kết quả kiểm thử. Không báo hoàn thành nguồn chưa được xác minh.

## Chi tiết kỹ thuật
- Tạo module Sao độc lập, bảng ví, ledger bất biến, quy tắc, quà, yêu cầu đổi và trạng thái lời chúc bền vững. Cấp GRANT/RLS đúng phạm vi; ghi qua RPC có kiểm quyền, search_path cố định, khóa hàng và khóa chống xử lý trùng.
- Giữ khóa thành tích duy nhất `(rule_id, source_type, source_id)` độc lập với người nhận/thời điểm bật; thao tác thủ công và đổi quà có idempotency riêng.
- Tích hợp sau sự kiện nghiệp vụ hợp lệ trong cùng giao dịch; không quét thưởng lịch sử, không cộng từ hiệu ứng khi tải trang. Xác minh Task từ hành động mới, người phê duyệt/quyền và người phụ trách; xác minh snapshot KPI từ dữ liệu gốc, không tin JSON client.
- Ảnh quà tải lên dùng storage theo quyền quản lý; ảnh Chipi tái sử dụng asset pointer hiện có.
- Vì Preview hiện dùng chung backend với bản đang chạy, thay đổi dữ liệu chỉ mang tính bổ sung; mọi chương trình thưởng mặc định tắt và không sửa thành tích cũ. Nêu rõ ảnh hưởng backend dùng chung trước khi áp dụng.