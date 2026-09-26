# Giải trình Chấm công — loại đơn thứ tư trong Đơn từ & Phê duyệt

Giải trình **không cần phê duyệt**, không tính công, không miễn phạt. Có hai việc chạy song song, không cái nào phải chờ cái nào: **người làm chứng xác nhận** và **Hành chính đối chiếu**. Nghỉ phép, Đi muộn, Về sớm giữ nguyên hoàn toàn.

## Người dùng sẽ thấy
- **Tạo đơn** có thêm lựa chọn "Giải trình Chấm Công": ngày quên chấm công; nội dung (quên vào / quên ra / quên cả hai); ô Giờ vào hoặc Giờ ra hiện theo nội dung đã chọn; lý do (5 lý do mặc định, chọn "Lý do khác" thì bắt buộc ghi chi tiết); chi tiết; người làm chứng (chỉ nhân viên đang hoạt động, không chọn được chính mình). Không có người duyệt và không áp hạn gửi trước. Có dòng ghi chú như trong tài liệu, nút gửi là "GỬI GIẢI TRÌNH".
- **Đơn của tôi**: giải trình nằm cùng các đơn khác. Thẻ hiện ngày, nội dung, giờ tự khai, người làm chứng, trạng thái làm chứng, trạng thái đối chiếu. Không hiện trạng thái duyệt.
- **Tab mới "Giải trình chấm công"** (chỉ người có quyền): lọc theo thời gian, nhân viên, nội dung, trạng thái làm chứng, trạng thái đối chiếu. Bấm một dòng để mở chi tiết và lịch sử (toàn màn hình trên điện thoại).
- **Chi tiết**: người làm chứng có nút XÁC NHẬN / KHÔNG THỂ XÁC NHẬN (ghi chú không bắt buộc). Hành chính có nút ĐÁNH DẤU ĐÃ ĐỐI CHIẾU và được sửa ghi chú đối chiếu (có lưu lịch sử). Chủ đơn được Sửa và Thu hồi khi chưa đối chiếu.
- **Sửa**: lưu nội dung cũ, nội dung mới, người sửa, thời điểm. Nếu người làm chứng đã xác nhận mà ngày hoặc giờ bị sửa thì trạng thái quay về "Chờ xác nhận" và báo lại cho người làm chứng và Hành chính.
- **Thu hồi**: chỉ làm được khi chưa đối chiếu. Giải trình đã thu hồi vẫn được lưu, không xóa hẳn.
- **Cài đặt → Đơn từ → Thông báo**: thêm mục "Người nhận giải trình chấm công". Có công tắc, chọn nhiều vai trò và nhiều cá nhân, tự bỏ người trùng. Cảnh báo nếu người nhận thiếu quyền xem toàn bộ giải trình.
- **Báo cáo**: dùng chung bộ lọc Tuần/Tháng/Quý/Năm/Tùy chỉnh và tính theo **ngày quên chấm công**. Có bảng tổng hợp theo nhân viên và bảng chi tiết (bấm để xem đầy đủ). File Excel có thêm phần giải trình. Số liệu nghỉ phép, đi muộn, về sớm không thay đổi.

## Thông báo
- Người làm chứng: thông báo trong Base + tin Zalo "YÊU CẦU XÁC NHẬN LÀM CHỨNG", nút XEM VÀ XÁC NHẬN.
- Người nhận đã cài: thông báo trong Base + tin Zalo "GIẢI TRÌNH CHẤM CÔNG MỚI", nút XEM GIẢI TRÌNH.
- Nhân viên: chỉ nhận thông báo trong Base, lúc gửi thành công và khi có kết quả làm chứng.
- Tin Zalo không bao giờ chứa phần chi tiết giải trình. Dùng lại bộ gửi hiện có, chống gửi trùng, không gửi bù đơn cũ. Link mở thẳng `/leave?open=<id>`, và sau khi đăng nhập vẫn mở đúng đơn.

## Phân quyền (8 quyền mới, chưa bật cho vai trò nào)
Tạo giải trình cá nhân · Xem giải trình cá nhân · Sửa/thu hồi giải trình cá nhân · Xác nhận làm chứng · Xem toàn bộ giải trình · Đối chiếu giải trình · Xem báo cáo giải trình · Quản lý giải trình. Người làm chứng chỉ xem được đúng giải trình mình được chọn. Mọi quyền đều kiểm tra ở máy chủ.

## Thay đổi cơ sở dữ liệu (chỉ thêm mới, không đụng dữ liệu cũ)
- Bảng mới `attendance_explanations`: chủ đơn, ngày, nội dung, giờ vào, giờ ra, lý do, chi tiết, người làm chứng, trạng thái làm chứng (chờ / đã xác nhận / không thể xác nhận) kèm thời điểm và ghi chú, trạng thái đối chiếu kèm người, thời điểm và ghi chú, đã thu hồi.
- Bảng mới `attendance_explanation_events`: nhật ký chỉ ghi thêm (gửi, sửa kèm nội dung cũ và mới, làm chứng, đối chiếu, sửa ghi chú, thu hồi).
- Cho phép xem khi là chủ đơn, là người làm chứng được chọn, hoặc có quyền Xem toàn bộ / Đối chiếu / Quản lý. Mọi thao tác ghi đều đi qua các hàm máy chủ `att_submit / att_update / att_recall / att_witness / att_reconcile / att_note`, có khóa dòng để không xử lý hai lần.
- Bảng `notifications`: thêm cột `attendance_id` (được để trống) và các loại tin `att_witness`, `att_new`, `att_result`, `att_changed`. Hàm tạo thông báo và hàm đánh thức gửi Zalo được mở rộng cho các loại này.
- Danh sách 5 lý do và cấu hình người nhận được lưu trong cấu hình Đơn từ hiện có. Không tạo bảng cấu hình mới.

## Chi tiết kỹ thuật
- Dùng bảng riêng, không nhét vào `leave_requests`, để không lẫn với trạng thái duyệt và báo cáo của các đơn cũ.
- Phần kiểm tra dữ liệu nhập và phần dựng tin Zalo là hàm thuần, có test: `src/lib/leave/attendance.ts`, `src/lib/leave/zaloMessage.ts`. Báo cáo mở rộng trong `report.ts`.
- Giao diện: `src/components/leave/AttendanceUi.tsx`, gắn vào LeaveUi (form, thẻ, tab, chi tiết), LeaveSettings (người nhận) và LeaveReport (thống kê, Excel).
- Máy chủ gửi Zalo (`processPending`) nhận thêm các loại tin att_*. Trước khi gửi, kiểm tra lại giải trình chưa thu hồi và vẫn đúng người làm chứng.

## Kiểm thử
Viết test tự động cho kiểm tra dữ liệu nhập, dựng tin Zalo và báo cáo. Trên trình duyệt, thử tạo giải trình và các thao tác nếu có tài khoản đăng nhập được. Không gửi Zalo hàng loạt cho nhân viên thật, không tự Publish.
