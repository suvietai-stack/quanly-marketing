# Bước 4 — Dashboard Quản trị Kinh doanh

## Phạm vi
Thay màn hình chờ tại **Tổng quan kinh doanh** bằng Dashboard dùng dữ liệu thật, giữ nguyên quy trình Mục tiêu, Kế hoạch và Báo cáo. Chỉ Preview, chưa Publish; không tạo dữ liệu thử trên môi trường vận hành.

## 1. Rà soát và điều chỉnh thống kê
- Tách **Nộp muộn** khỏi **Quá hạn chưa nộp** ở thống kê Kế hoạch/Báo cáo hiện có.
- Nghĩa vụ nộp tiếp tục theo quy tắc đã chọn: có mặt bất kỳ lúc nào trong kỳ, mỗi người một hồ sơ; người chưa tạo hồ sơ vẫn được tính vào mẫu số.
- Số thực tế chỉ lấy một phiên bản báo cáo tháng: đã duyệt với Chính thức; chờ duyệt mới nhất hoặc bản đã duyệt với Tạm tính.
- Quy thuộc từng tháng vào một phòng theo hồ sơ/lịch sử đã ghi nhận, không dùng phòng hiện tại để cộng lại lịch sử.
- Giữ mục tiêu tham chiếu đã chốt. Mục tiêu mới nhất chỉ dùng cho phần kế hoạch chưa có tham chiếu đã chốt, ghi rõ nguồn; không thay kết quả lịch sử.
- Thiếu tháng hoặc mục tiêu: hiển thị phần đã ghi nhận với nhãn chưa đầy đủ, không biến thành 0 hoặc kết luận đạt/không đạt.

## 2. Giao diện Dashboard
Chia ba tab để trang không quá dài:

### Tổng quan
- Bộ lọc chung: Tháng/Quý/Năm, kỳ, phòng, nhân viên, KR và Chính thức/Tạm tính; mặc định năm hiện tại theo giờ Việt Nam, Chính thức, phạm vi được phép xem.
- Thẻ KR động: mục tiêu, thực tế, tỷ lệ, chênh lệch; các chỉ số không áp dụng không xuất hiện như nghĩa vụ của phòng.
- Thẻ kỷ luật báo cáo và KR đủ điều kiện đánh giá/đã đạt.
- Biểu đồ cột Mục tiêu–Thực tế, chuyển giữa tháng/quý/phòng/nhân viên.
- Biểu đồ lũy kế năm, phần còn cần đạt, trạng thái đầy đủ; khoảng trống cho tháng chưa có báo cáo.
- So sánh phòng và tỷ trọng doanh số khi được xem nhiều phòng; bấm phòng để lọc toàn trang.

### Hiệu suất
- Phân tích KR được chọn, xu hướng và so sánh nhân viên.
- Xếp hạng theo tỷ lệ doanh số mặc định; đổi sang thực tế, số đơn, KR hoặc tỷ lệ nộp đúng hạn.
- Nhân viên thiếu dữ liệu nằm nhóm riêng, không xếp như người đạt 0 đã xác nhận; đồng hạng khi cùng kết quả.
- Bấm nhân viên mở bảng chi tiết mục tiêu năm, kết quả từng tháng, KR, xu hướng và liên kết hồ sơ hiện có; không thêm quy trình duyệt.

### Kỷ luật báo cáo
- Kế hoạch/Báo cáo riêng: đúng hạn, nộp muộn, quá hạn chưa nộp, sắp đến hạn, chưa đến hạn và chưa cấu hình hạn.
- Tách trạng thái duyệt; danh sách chờ duyệt/cần bổ sung, mở đúng hồ sơ và kỳ ở trang hiện có.

## 3. Thiết kế
- Giữ Soft Modern và chữ Be Vietnam Pro của Base.
- Mục tiêu xanh dương, thực tế xanh lá, chú ý cam, quá hạn/không đạt đỏ, dữ liệu phụ tím, thiếu dữ liệu xám; có nhãn, không chỉ dựa vào màu.
- Năm đang thực hiện so sánh với mục tiêu lũy kế tương ứng, không tô đỏ chỉ vì chưa đạt 100% năm.
- Bộ lọc thu gọn trên điện thoại, thẻ 1–2 cột, biểu đồ kích thước ổn định, bảng/card và bảng chi tiết không tràn; kiểm sáng/tối ở 360/375/390/430px và desktop.

## Chi tiết kỹ thuật
- Bổ sung RPC đọc Dashboard tổng hợp phía database, không tạo bảng kinh doanh trùng lặp; kiểm `biz.view_own/dept/all` từ người đang đăng nhập trước khi tổng hợp, lọc tháng theo phòng được phép xem.
- Một yêu cầu Dashboard trả dữ liệu kỳ, chuỗi tháng, phòng, nhân viên, KR và deadline; không gọi từng nhân viên × tháng từ trình duyệt. Chi tiết nhân viên dùng yêu cầu riêng khi mở.
- Số tiền/mục tiêu giữ chuỗi số chính xác; phần trăm cộng dồn = tổng thực tế/tổng mục tiêu, không trung bình phần trăm cá nhân.
- Chỉ gộp định nghĩa KR tương thích; KR trung bình theo cấu hình, KR tỷ lệ thiếu tử/mẫu hoặc quy tắc đánh giá khác chưa được xác định sẽ không suy đoán công thức.
- Tái sử dụng Recharts, các thành phần giao diện và trang hồ sơ hiện có; cache theo tài khoản và bộ lọc, làm mới sau thay đổi mục tiêu/báo cáo.

## Kiểm thử và báo cáo
- Kiểm database tách biệt: 100/100 và 450/900 triệu cho tỷ lệ phòng **55%**, không 75%; số lớn, 0/NULL, phiên bản điều chỉnh, chính thức/tạm, thiếu tháng, chuyển phòng không trùng, deadline/mẫu số, KR động và từ chối tham số vượt quyền.
- Kiểm hồi quy mục tiêu/kế hoạch/báo cáo, trạng thái chạy, Dashboard đăng nhập đọc dữ liệu thật, bộ lọc/chi tiết/liên kết hồ sơ và giao diện sáng/tối các kích thước yêu cầu.
- Hiện môi trường vận hành chưa có hồ sơ kinh doanh để kiểm biểu đồ có số liệu. Dùng dữ liệu kiểm tách biệt và phản hồi thử chỉ trong trình duyệt, không ghi vào dữ liệu vận hành; báo rõ phần chưa nghiệm thu với báo cáo thực tế.
- Tổng kết thay đổi database/RPC, giao diện, kiểm thử và giới hạn; Dashboard không kích hoạt gửi nhắc tự động.