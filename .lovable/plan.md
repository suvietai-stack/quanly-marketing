# Điều chỉnh phân bổ tháng của Mục tiêu KR

## Phạm vi
Bổ sung **Điều chỉnh phân bổ tháng** ngay trong Mục tiêu KR của tôi, không thay chức năng điều chỉnh mục tiêu năm hiện có. Giữ nguyên dữ liệu, lịch sử, cơ cấu tổ chức, quyền, deadline và nghĩa vụ báo cáo; chưa Publish.

## 1. Số liệu và tháng được điều chỉnh
- Mục tiêu năm và cam kết tháng lấy từ bản KR chính thức đã duyệt.
- Chỉ sửa tháng bắt đầu **sau tháng hiện tại**, theo giờ Việt Nam. Tháng hiện tại và tháng quá khứ chỉ đọc; nếu đề xuất sang tháng mới trong lúc chờ duyệt, yêu cầu cập nhật trước khi áp dụng.
- Cơ sở thực tế lấy từ các tháng đã kết thúc và đủ nguồn Báo cáo chính thức. Báo cáo Tuần giao tháng sử dụng đoạn phân bổ thật; nguồn thiếu hoặc chồng lấn không được tính thành 0.
- Với KR cộng dồn: **còn phải đạt = max(0, mục tiêu năm − thực tế các tháng đã chốt)**. Hiển thị riêng phần đã vượt, mức phấn đấu bổ sung và dự kiến cả năm.
- Nếu tháng quá khứ thiếu dữ liệu, vẫn xem được số liệu đã có và lưu nháp, nhưng chặn gửi/áp dụng đề xuất cho tới khi đủ cơ sở chính xác.
- KR bình quân/tỷ lệ không áp dụng công thức trừ dành cho KR cộng dồn; giữ quy tắc hiện tại và không tự suy diễn công thức bù.

## 2. Đề xuất phân bổ
- Mở bảng điều chỉnh khi người dùng bấm nút, không mở biểu mẫu dài ngay lúc vào trang.
- Ba phương án: **Chia đều / Theo tỷ trọng hiện hành / Tự nhập**. Mặc định đề xuất theo tỷ trọng để giữ mùa vụ; nếu tổng tỷ trọng bằng 0, dùng chia đều.
- Tất cả giá trị số lượng/VNĐ là số nguyên không âm; chia phần dư theo quy tắc xác định để tổng chính xác, không dùng số thực làm tròn tiền.
- Tổng kế hoạch thấp hơn phần còn phải đạt có cảnh báo và không gửi duyệt; nháp được lưu với cảnh báo. Tổng cao hơn được gửi và ghi rõ mức phấn đấu, không tăng cam kết năm.
- Đề xuất chỉ nằm trong biểu mẫu/nháp, không tự lưu hay tự áp dụng.

## 3. Hồ sơ và phê duyệt
- Lưu hồ sơ phân bổ riêng, gắn với mục tiêu năm hiện có; không thay `official_version_id` của cam kết năm.
- Tái sử dụng luồng KR đang cấu hình, người duyệt theo từng bước, lịch sử và thông báo hiện hành; không tạo hệ thống phê duyệt thứ hai.
- Chờ duyệt giữ phân bổ hiện hành. Từ chối giữ nguyên số liệu và nhận xét; người đề xuất có thể chỉnh sửa gửi lại.
- Duyệt cuối áp dụng nguyên tử các tháng tương lai, lưu trước/sau, lý do, nguồn thực tế, bản cam kết năm, người/thời điểm đề xuất và duyệt.
- Kiểm tra lại nguồn thực tế, bản cam kết năm, phân bổ hiện hành và thời điểm tại lúc gửi và từng lần duyệt. Hồ sơ lỗi thời phải được cập nhật, không âm thầm áp dụng.
- Cấm tự duyệt; quyền xem không cấp quyền duyệt. Mọi thao tác đều kiểm tra tại máy chủ.

## 4. Giao diện và Dashboard
- Tổng quan theo KR: mục tiêu năm, thực tế đã chốt, tỷ lệ hoàn thành thực tế, số còn phải đạt, số tháng tương lai và tổng phân bổ hiện hành.
- Bảng 12 tháng phân biệt **cam kết / thực tế / phân bổ hiện hành / đề xuất / chênh lệch**; mobile chia theo Quý mở/thu gọn, không tràn ngang trang.
- Lịch sử phân bổ riêng ngay trong mục tiêu, người quản lý xem và xử lý hồ sơ từ Phê duyệt hiện có.
- Dashboard giữ mục tiêu năm và các tỷ lệ đánh giá lịch sử. Phân bổ tương lai đã duyệt là lớp kế hoạch riêng, không cộng cam kết lịch sử với kế hoạch bù để tạo “mục tiêu năm” mới.
- Báo cáo cũ được duyệt điều chỉnh chỉ làm tính lại phần còn phải đạt và cảnh báo **Cần rà soát lại kế hoạch phân bổ**; không tự sửa kế hoạch đã duyệt.

## Chi tiết kỹ thuật
- Thay đổi dữ liệu chỉ theo hướng bổ sung; quyền đọc scoped, ghi qua RPC, GRANT/RLS đầy đủ. Không seed hoặc tạo hồ sơ thử trong dữ liệu vận hành.
- Dùng khóa hàng, revision và cơ sở nguồn để chống xung đột; một hồ sơ điều chỉnh đang mở cho mỗi mục tiêu. Giữ bản duyệt bất biến và lịch sử sự kiện.
- Nối loại hồ sơ phân bổ vào đọc/chi tiết/quyết định của approval engine với workflow `goal_year`, thay vì giả làm một phiên bản cam kết năm.
- Tái sử dụng nguồn thực tế theo khoảng ngày và độ bao phủ đã có; truy vấn và cache theo người dùng. Làm mới mục tiêu, phê duyệt, Báo cáo và Dashboard sau thao tác thành công.

## Kiểm chứng và bàn giao
- Kiểm thử cụ thể ví dụ 1,2 tỷ: thực tế 70 triệu → còn 1,13 tỷ; thực tế 150 triệu → còn 1,05 tỷ; vượt cả năm → còn 0.
- Kiểm thử phần dư số nguyên, VNĐ, tỷ trọng, tự nhập, tháng thiếu nguồn, Tuần giao tháng, tháng bị khóa và hồ sơ lỗi thời.
- Kiểm thử không thay cam kết năm/tháng lịch sử; chưa duyệt không áp dụng; từ chối giữ hiện hành; đúng bước, không tự duyệt, không vượt kiểm tra qua API.
- Kiểm tra màn hình máy tính/điện thoại và lịch sử qua UI. Luồng nộp/duyệt hồ sơ thật chỉ nghiệm thu khi có hồ sơ và xác nhận phù hợp; không tạo dữ liệu giả để báo hoàn tất.
- Báo cáo kết quả triển khai, phép tính, khóa tháng, phiên bản, luồng duyệt, đồng bộ và những phần chưa nghiệm thu; chưa Publish.