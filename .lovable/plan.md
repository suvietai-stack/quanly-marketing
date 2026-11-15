# Hộp thư Base Sứ Việt

## Kết quả
- Thêm khu vực **Hộp thư** dùng chung Sidebar và App Launcher. Hai tab: **Facebook Messenger** hoạt động với dữ liệu thật và **Chat Web — Sắp ra mắt**, không cài widget.
- Messenger có chọn nhiều Page được phép, hội thoại phân trang, chưa đọc/cần trả lời, tin nhắn và tệp đính kèm an toàn, trả lời văn bản, phân công nhân sự đang hoạt động, đóng/mở lại.
- Máy tính: ba cột danh sách/tin nhắn/khách hàng. Điện thoại: danh sách → hội thoại → chi tiết với quay lại và thao tác dễ chạm.
- Hiển thị trung thực trạng thái kết nối, thiếu quyền, token hết hạn, lỗi/tải/rỗng và lý do không thể gửi.

## Kết nối Facebook hiện hữu
- Tái sử dụng Meta App, OAuth, Page và token mã hóa hiện tại; không tạo hệ kết nối song song.
- Xác minh Messenger độc lập qua `pages_messaging`, nhiệm vụ Page `MESSAGING` và token đúng Page/App; không yêu cầu có Lead Form.
- Bổ sung khả năng Lead/Messenger trong giao diện kết nối chung. Mọi đăng ký lại hợp nhất trường webhook hiện hữu, không xóa `leadgen`, `messages` hoặc các trường khác.
- Mở rộng callback hiện tại để nhận Messenger, giữ nguyên xử lý Lead.

## Bảo mật và độ tin cậy
- Quyền module đi qua kho quyền hiệu lực hiện hữu; mỗi nhân viên còn cần quyền truy cập Page tường minh. Quyền module không tự cấp Page hay bỏ qua RLS.
- Chỉ người đăng nhập đang hoạt động được đọc/thao tác. Token chỉ ở máy chủ; quyền quản trị Page và phân công được kiểm tra phía máy chủ và có nhật ký.
- Lưu sự kiện trước khi trả xác nhận, chống trùng theo Page/message ID, hợp nhất echo và kết quả gửi, giữ thứ tự theo thời gian sự kiện.
- Gửi trong cửa sổ 24 giờ do khách khởi tạo; không dùng tag để lách hạn. Mỗi yêu cầu gửi có khóa duy nhất và trạng thái bền vững; kết quả không rõ ràng không tự gửi lại.
- Realtime theo dữ liệu được RLS cho phép, hủy khi rời trang/đăng xuất; đối chiếu lại khi kết nối phục hồi, cache theo người dùng và thử lại hữu hạn.

## Chi tiết kỹ thuật
- Tạo module `src/lib/inbox` và giao diện `src/components/inbox`, route theo cấu trúc xác thực hiện hành.
- Migration bổ sung bảng quyền Page, khả năng Messenger, hội thoại, tin nhắn, trạng thái đọc, sự kiện/audit; index phân trang, GRANT/RLS, RPC thao tác có xác thực và RPC dịch vụ nhận webhook/gửi idempotent.
- Không đổi mặc định Role, nhân sự hay dữ liệu Lead. Giao diện giữ trạng thái chưa sẵn sàng khi SQL chưa áp.
- SQL production **chỉ đóng gói** với SHA chính xác, preflight, backup/rollback; chờ duyệt riêng trước khi áp. Lệnh xây Hộp thư không phải duyệt một SHA chưa biết. **Không publish**.

## Kiểm chứng
- Kiểm thử SQL cô lập: active/inactive, cách ly hai nhân viên/hai Page, quyền module và personal DENY, phân công, cửa sổ gửi, chống trùng/echo/thứ tự và cạnh tranh gửi.
- Kiểm thử chữ ký sai, độc lập Lead/Messenger, hợp nhất subscription, URL tệp an toàn và lỗi gửi không tự retry khi mơ hồ.
- Chạy các test Facebook hiện hữu, test Inbox và ESLint các tệp đổi; kiểm tra kết quả build/TypeScript do hệ thống chạy sau sinh route. Không tự chạy build/typecheck vì quy tắc môi trường hiện hành.
- Kiểm tra trình duyệt máy tính/điện thoại nếu có phiên được phép; tuyệt đối không gửi tin cho khách thật trong kiểm thử.
- Báo rõ commit, SQL SHA, test đạt/chưa chạy và các điều kiện Meta chưa xác minh (App Review/Advanced Access, quyền Page, webhook, token). Không tuyên bố hoạt động live khi SQL/Meta chưa sẵn sàng.