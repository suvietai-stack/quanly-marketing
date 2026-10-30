# Dashboard Quản trị Kinh doanh — Bước 4

## Đã triển khai
- Tổng quan tại `/biz`: ba tab Tổng quan, Hiệu suất, Kỷ luật báo cáo; bộ lọc thời gian/phòng/nhân viên/KR/chính thức–tạm tính, làm mới, bộ lọc gọn trên điện thoại.
- KR động từ snapshot/cấu hình được phép xem, không lấy dữ liệu Tiền Về/Đơn hàng. Card mục tiêu/thực tế/tỷ lệ/chênh lệch, không áp đặt đại lý mới cho phòng không có KR đó.
- Biểu đồ tháng/quý/phòng/nhân viên; lũy kế năm, mục tiêu năm và còn cần đạt do máy chủ tính; tháng thiếu dữ liệu không vẽ thực tế 0. Tooltip giữ chuỗi giá trị chính xác, trục rút gọn.
- So sánh phòng và tỷ trọng doanh số, bấm phòng để lọc; thống kê người có hồ sơ chính thức và nộp đúng hạn.
- Xếp hạng tỷ lệ hoặc thực tế KR/số lượng, đồng hạng; số lớn so sánh chuỗi thập phân chính xác. Thiếu dữ liệu/không đủ quy tắc xếp nhóm riêng. Có thứ tự tỷ lệ nộp đúng hạn theo nghĩa vụ kỳ, không điểm KR tổng hoặc thưởng/phạt.
- Chi tiết nhân viên: KR năm, mục tiêu/thực tế từng tháng, xu hướng, nguồn mục tiêu và liên kết Kế hoạch/Báo cáo hiện có.
- Kỷ luật báo cáo: mẫu số từ lịch sử có mặt trong kỳ (không từ số hồ sơ); deadline và duyệt tách biệt. Sửa thống kê trang Kế hoạch/Báo cáo để Nộp muộn khác Quá hạn chưa nộp.
- Theme sáng/tối cục bộ Dashboard, tokens Base; kiểm 360/375/390/430px.

## Database/RPC
Migrations 0099–0102 bổ sung hàm đọc, không bảng kinh doanh mới, không dữ liệu seed hay đổi quy trình:
- `biz_dashboard_read`: chỉ quyền `biz.view_own/dept/all`, tháng/phòng hồ sơ lịch sử, một version/tháng. Quyền quản lý phòng là phạm vi hiện tại; không tự cấp xem lịch sử phòng khác khi đổi vị trí.
- `biz_dashboard_aggregate`: numeric chính xác, sum/avg theo định nghĩa tương thích (tên, đơn vị, cách tổng hợp, chiều, loại giá trị); ratio chưa có tử/mẫu không suy đoán; tỷ lệ sum = tổng thực tế/tổng mục tiêu.
- `biz_dashboard_data`: một yêu cầu cho tổng, tháng/quý/lũy kế, phòng, nhân viên, nghĩa vụ và tùy chọn bộ lọc; truy vấn riêng khi mở chi tiết. Không thực hiện hàng trăm request trình duyệt.
- Snapshot mục tiêu gắn vào hồ sơ được giữ. Với tháng chưa có baseline, phân bổ mục tiêu đã duyệt hiện tại chỉ là kế hoạch chưa chốt, có nguồn trong facts; chưa có baseline vẫn trả mục tiêu/thực tế NULL theo cấu hình, không coi đầy đủ.
- anon/PUBLIC không được gọi RPC chính; hàm aggregate không mở cho client. Không mở quyền bảng gốc, không ghi/xóa dữ liệu nghiệp vụ, không gửi nhắc.
- Cache theo user+bộ lọc, invalidation khi thay mục tiêu/báo cáo/cài đặt.

## Kiểm thử
- PostgreSQL tách biệt: 100/100 + 450/900 triệu = **55%**, số 20 chữ số, NULL khác 0, thiếu baseline, avg không sum, ratio không suy đoán, thiếu tháng, official/provisional/baseline điều chỉnh, nghĩa vụ chưa có hồ sơ, chuyển phòng mỗi tháng một lần, own/dept/all và từ chối tham số vượt quyền.
- Hồi quy Biz/KPI/Đơn từ/Tín hiệu/Sao: 327 kiểm thử đạt trước bổ sung kiểm xếp hạng số lớn; bộ Biz chạy lại sau đó.
- Playwright đăng nhập Admin thật: Dashboard đọc được dữ liệu/phạm vi/nhân sự thật, không ghi dữ liệu. Biểu đồ có số liệu và thao tác chi tiết/bộ lọc kiểm bằng phản hồi thử chỉ trong trình duyệt, không gửi ghi về backend.
- Desktop và cả ba tab ở 360/375/390/430 không tràn ngang, dialog mở đúng, không lỗi page runtime; sáng/tối đã chụp và kiểm.
- Build sạch, các trang kinh doanh giữ metadata riêng.

## Giới hạn nghiệm thu
- Chưa Publish. Dữ liệu vận hành có hồ sơ được người dùng tạo trong lúc triển khai; không reset/xóa hoặc nhận đó là dữ liệu kiểm thử của Dashboard.
- Chưa có đủ tháng/báo cáo đã duyệt để đối soát đầy đủ biểu đồ/xếp hạng có số liệu thực tế trên UI; không tạo hồ sơ giả để nghiệm thu.
- Quy tắc đạt/ranking lower-is-better và ratio cần định nghĩa nghiệp vụ trước; hiện không kết luận hoặc chấm điểm.
- Theme tối chỉ bổ sung cho Dashboard, không thiết kế lại các trang khác. Chi tiết mở liên kết hồ sơ hiện có, không tạo quy trình duyệt thứ hai.
- Nghiệm thu ghi/duyệt thật và cron nhắc thuộc các việc chờ trước đó, không được kích hoạt trong Bước 4.