# Quyền Kinh doanh tự động theo bổ nhiệm

## Kết quả rà soát
- Lê Minh Ngọc đang có bổ nhiệm Giám Đốc Hệ Phân Phối và Trưởng Phòng trong Hệ đó, nhưng Role Giám Đốc Kinh Doanh còn quyền xem toàn Khối. Cơ chế hiện tại cho phép quyền này vượt phạm vi bổ nhiệm.
- Dashboard đang dùng dữ liệu chi tiết nhân viên để tổng hợp; không thể mở quyền Dashboard cho mọi nhân viên bằng cách cấp quyền xem tất cả hồ sơ.
- Xin nộp bù hiện được quyết định trực tiếp, chưa chạy theo luồng tùy chỉnh; đường đọc còn kiểm quyền rộng mà chưa giới hạn đơn vị.

## Chuyển đổi đã thống nhất
- Bỏ quyền cài đặt **Kinh doanh** của Role Giám Đốc Kinh Doanh: cơ cấu, chức vụ, quy trình, KR và deadline. Không đổi quyền của Role này ở module khác.
- Giữ ngoại lệ **xem chi tiết toàn Khối** cho Admin và Viewer / Ban Giám Đốc; hiển thị nguồn Role và ghi nhận quyết định chuyển đổi. Ngoại lệ xem không tự cho phép sửa hay duyệt.
- Giám Đốc Kinh Doanh và các quản lý thông thường chỉ có phạm vi từ bổ nhiệm còn hiệu lực; Super Admin vẫn toàn quyền, can thiệp vượt luồng có lý do và nhật ký.

## Phần triển khai
### 1. Quyền tự động và phạm vi
- Nhân viên có nghiệp vụ cá nhân; Trưởng Nhóm có phạm vi Nhóm; Trưởng Phòng có phạm vi Phòng; Giám Đốc Kinh doanh có phạm vi Hệ.
- Thêm cấu hình chức vụ toàn Khối cho Giám Đốc Điều hành, không tự bổ nhiệm và không mặc định tạo nghĩa vụ cá nhân.
- Bổ nhiệm kiêm nhiệm cộng đúng phạm vi; thời điểm bắt đầu/kết thúc có hiệu lực tự động. Không cấp quyền từ tên hoặc cấp bậc đơn thuần.
- Chỉ quản trị viên có quyền phù hợp được cấp/thu hồi ngoại lệ với người nhận hoặc Role, phạm vi, quyền, thời hạn, người cấp và lý do; giữ lịch sử.

### 2. Dashboard tổng hợp riêng
- Mọi nhân viên kinh doanh xem tổng hợp toàn Khối và từng Hệ.
- Dữ liệu tổng hợp công bố không chứa tên/ID nhân viên, liên kết hồ sơ, bản nháp hay dữ liệu chi tiết ngoài phạm vi.
- Chi tiết, xếp hạng cá nhân và mở hồ sơ vẫn kiểm phạm vi riêng phía máy chủ. Giữ công thức KR, số chính thức/tạm tính và quy thuộc đơn vị lịch sử.

### 3. Kế hoạch, KR, Báo cáo và Phê duyệt
- Đồng bộ danh sách, mở hồ sơ, lịch sử, bộ đếm, yêu cầu chỉnh sửa và truy vấn trực tiếp với quyền mới.
- Xem rộng không cho sửa báo cáo người khác hoặc xóa nháp của người khác.
- Người duyệt không cần tick quyền thủ công sau bổ nhiệm, nhưng chỉ xử lý đúng bước được giao; giữ chặn tự duyệt, phiên bản luồng và kiểm tra chống thao tác trùng.
- Kế hoạch không duyệt; báo cáo đầu tiên chính thức ngay; KR và điều chỉnh báo cáo theo luồng.
- Thêm loại luồng **xin nộp bù Kế hoạch/Báo cáo**, dùng trung tâm Phê duyệt hiện có. Không có luồng/người hợp lệ thì không tự chọn người hoặc duyệt thay. Yêu cầu cũ đã quyết định giữ nguyên; yêu cầu cũ còn chờ chỉ chuyển sang luồng bằng thao tác quản trị có xác nhận, không tự đổi lịch sử.

### 4. Giao diện bổ nhiệm và quyền thực tế
- Bổ nhiệm có xem trước quyền/phạm vi, ngày hiệu lực, kiêm nhiệm hoặc thay thế và người đang phụ trách.
- Xem quyền thực tế từng người: bổ nhiệm đang hiệu lực, phạm vi, ngoại lệ, quyền quản trị đặc biệt và quyền duyệt theo lượt.
- Phân quyền Kinh doanh tập trung quyền hệ thống/ngoại lệ, không còn bắt tick nghiệp vụ cho từng chức vụ.
- Sau thay đổi, làm mới quyền và dữ liệu; khi tới ngày hiệu lực, hết hạn hoặc quay lại ứng dụng, truy vấn phản ánh quyền mới mà không cần đăng nhập lại.

## Chi tiết kỹ thuật
- Mở rộng cấu trúc `biz_*` hiện có bằng migration mới và các helper quyền/phạm vi riêng Kinh doanh; không thay `private.sig_can` hoặc cơ chế Role của module khác.
- Chuẩn hóa thời hạn bổ nhiệm danh mục và phân công legacy theo khoảng bắt đầu bao gồm/kết thúc không bao gồm; quyền người đang xem dùng thời gian hiện tại, đơn vị hồ sơ dùng thời điểm lịch sử.
- Thay đồng bộ các nhánh đọc toàn Khối trong helper/RPC/RLS, bao gồm nộp bù, phê duyệt, thông báo và Dashboard; không chỉ giấu giao diện.
- Ngoại lệ có cấp quyền bảng rõ ràng, RLS và thao tác ghi kiểm quản trị phía máy chủ; không tin phạm vi do trình duyệt gửi.
- Trình duyệt dùng quyền hiệu lực máy chủ trả về cho riêng `biz.*`, cache theo người dùng và làm mới sau thao tác cơ cấu. Backend kiểm quyền ở mọi truy vấn/thao tác.
- Giữ toàn bộ lịch sử, dữ liệu vận hành, ảnh chụp luồng và số đã chốt; không tạo DEMO, không xóa dữ liệu, không Publish.

## Nghiệm thu
- Kiểm thử riêng cá nhân, Nhóm, Phòng, Hệ và toàn Khối; đối chiếu Giám Đốc Phân Phối không đọc được hồ sơ Hệ Đơn Hàng.
- Kiểm thử kiêm nhiệm, bổ nhiệm tương lai/hết hạn/thay thế, không cần Role thủ công và không giữ quyền cũ.
- Kiểm thử Dashboard tổng hợp không rò dữ liệu chi tiết, truy cập RPC/RLS ngoài phạm vi bị chặn, xem không thành sửa/duyệt.
- Kiểm thử đúng lượt, người thay thế, không tự duyệt, nộp bù và Super Admin can thiệp có lý do; giữ nguyên hồ sơ lịch sử.
- Kiểm thử giữ ngoại lệ Admin/Viewer, bỏ quyền cài đặt Role Giám Đốc và không đổi quyền module khác.
- Kiểm tra desktop/mobile và luồng thực tế bằng tài khoản được phép; báo rõ các kiểm tra chưa thực hiện được, không tạo dữ liệu thử trong vận hành.