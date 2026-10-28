# Nâng cấp diễn biến khách hàng và báo cáo Sale

## Phạm vi
- Nâng cấp biểu mẫu diễn biến, chi tiết, danh sách và Báo cáo tín hiệu hiện có; giữ giao diện Soft Modern, quyền và quy trình.
- Chưa Publish; không tạo dữ liệu mẫu, không gửi Zalo/Push, không sửa hoặc xóa lịch sử.

## Cập nhật nhanh và theo dõi
- Chọn nhiều gợi ý theo nhóm Tư vấn, Phản hồi, Tiến triển; chỉ Sứ quà tặng có nhóm maket.
- Ghép nội dung với ghi chú bổ sung, cho xem và chỉnh trước khi lưu; vẫn nhập tay hoàn toàn. Bỏ yêu cầu chọn phương thức liên hệ, giữ trường cũ để tương thích.
- Giữ thao tác đổi trạng thái hiện có và lý do Trượt. Gợi ý không tự Chốt hay tạo Job.
- Hiển thị tổng lượt thật, mốc ban đầu 5, gần nhất và lịch sử mới nhất trước. Trên 5 vẫn tiếp tục; Chốt/Trượt không cảnh báo thiếu mốc.
- Cảnh báo nhẹ khi tín hiệu đang mở quá 7 ngày chưa có diễn biến; chưa có diễn biến dùng mốc giao Sale, thiếu mốc thì không tự kết luận quá hạn.
- Danh sách chỉ thêm tóm tắt dưới diễn biến hiện có, không thêm cột.

## Báo cáo
Thêm “Hiệu suất cập nhật diễn biến” gồm sáu KPI và bảng Sale có sắp xếp, click tên để lọc trong phạm vi được phép:
1. Tín hiệu đang chăm sóc: tín hiệu mở trong tập báo cáo.
2. Đã cập nhật trong 7 ngày: tín hiệu mở có diễn biến hợp lệ trong cửa sổ này.
3. Tỷ lệ gần đây: chỉ số 2 / chỉ số 1 × 100%; không có mẫu số hiển thị “—”.
4. Lâu chưa cập nhật: tín hiệu mở quá 7 ngày tính từ diễn biến gần nhất hoặc giao Sale.
5. Lượt trong kỳ: các bản ghi diễn biến hợp lệ có thời điểm tạo trong khoảng ngày chọn, theo giờ Việt Nam.
6. Dưới mốc 5: tín hiệu mở có dưới 5 lượt hợp lệ.

Các chỉ số trạng thái dùng tập tín hiệu theo bộ lọc báo cáo hiện có và trạng thái hiện tại; cửa sổ 7 ngày tính đến hiện tại, ghi rõ trong tooltip. Lượt trong kỳ lọc thời điểm diễn biến độc lập với ngày tạo tín hiệu, nhưng giữ các bộ lọc nghiệp vụ/quyền. Không đưa các chỉ số trạng thái này vào biểu đồ xu hướng lịch sử và không đổi tỷ lệ chốt.

## Thay đổi dữ liệu tối thiểu — cần quyết định
Preview và ứng dụng đang chạy dùng chung dữ liệu thật. Để đáp ứng chống retry/trùng phía máy chủ, cần bổ sung vào lịch sử diễn biến hiện có:
- Mã thao tác duy nhất và dấu xác định diễn biến hợp lệ, không thêm bảng mới.
- Hàm lưu mới tận dụng luồng lưu cũ, kiểm tra cùng quyền, khóa tín hiệu và loại nội dung giống nhau trong khoảng ngắn (đề xuất 60 giây). Một mã thao tác retry trả cùng kết quả; không tạo thêm lượt.
- Hàm đọc thống kê tính từ bản ghi hợp lệ trong phạm vi quyền; không có bộ đếm để trình duyệt tự tăng.
- Lịch sử cũ không bị cập nhật: tính các ghi chú có nội dung hoặc gợi ý tư vấn rõ ràng; loại tiếp nhận, thay trạng thái đơn thuần và sự kiện hệ thống. Ghi rõ giới hạn: không thể xác minh lại nội dung hay retry lịch sử trước khi có mã chống trùng.

**Phê duyệt kế hoạch đồng nghĩa cho phép áp dụng thay đổi bổ sung này trên dữ liệu dùng chung**, dù giao diện mới chưa Publish. Không thay hàm lưu cũ của ứng dụng đang chạy, không đổi bản ghi cũ, quyền, thông báo hay công thức KPI khác.

Nếu yêu cầu “chỉ Preview” cũng cấm mọi thay đổi dữ liệu dùng chung, cần môi trường thử riêng hoặc chỉ chuẩn bị mã/thay đổi chưa áp dụng; khi đó chưa thể kiểm thử lưu và thống kê đầy đủ.

## Kỹ thuật
- Tái sử dụng `opportunity_signal_notes`, `signal_sale_update`, lịch sử và cơ chế mở Sheet; thêm RPC riêng với kiểm tra quyền tương đương, không mở quyền ghi trực tiếp.
- Tách quy tắc/gợi ý/định nghĩa KPI thành phần dùng chung và kiểm thử cụ thể, cache theo người dùng; giữ nhắc Zalo hiện có độc lập để không đổi kênh tích hợp.
- Kiểm tra chính sách đọc lịch sử, quyền Sale ngoài phạm vi, mã thao tác trùng và nội dung trùng; cập nhật quy tắc kiến trúc.

## Kiểm thử và bàn giao
- Kiểm thử các tình huống trong tài liệu: một/nhiều gợi ý, maket đúng nhóm, retry, lần 5/8/12, Chốt sớm, Trượt bắt buộc lý do, cảnh báo 7 ngày, quyền và bộ lọc.
- Kiểm tra desktop, mobile 360px/390px, cuộn/nhập/lưu, không bị Chipi che; thử luồng thật khi có tài khoản và tín hiệu được phép, không tự tạo dữ liệu production.
- Bàn giao danh sách file, thay đổi dữ liệu, công thức, lịch sử được tính, kiểm thử/ảnh và phần chưa xác minh; chưa Publish.