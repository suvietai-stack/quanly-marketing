# Nâng cấp Tín hiệu cơ hội và tối ưu Mobile

## Kết quả
Sale xem nhanh khách cần xử lý, đánh giá tiềm năng, gắn nhãn và cập nhật lịch theo dõi trên điện thoại. Quản lý xem báo cáo theo dữ liệu thật và phạm vi quyền hiện có.

## 1. Tiềm năng và nhãn
- Thêm Cao, Trung bình, Thấp, Chưa đánh giá; tín hiệu cũ mặc định Chưa đánh giá. Lưu người cập nhật, thời gian và lịch sử thay đổi, không đổi trạng thái.
- Sale cập nhật tín hiệu mình phụ trách; các quyền khác tuân thủ quyền chỉnh sửa hiện hành.
- Nhãn chung và nhãn cá nhân dùng ID ổn định, chọn nhiều, đổi tên/ẩn không mất liên kết. Nhãn cá nhân không lộ cho tài khoản khác.
- Quản lý nhãn chung bằng quyền quản lý danh mục hiện có; Sale tự quản lý nhãn cá nhân. Đưa các nhãn gợi ý trong tài liệu vào danh mục chung, không tạo tín hiệu mẫu.
- Không thêm xác suất chốt hoặc đánh giá tự động khi chưa có cơ sở.

## 2. Danh sách Mobile
- Giữ một tiêu đề trong header chung; tìm kiếm, Bộ lọc và Thêm tín hiệu theo quyền nằm ngay đầu nội dung.
- Thẻ gọn: tên/trạng thái, nhu cầu/giá trị nếu có, tiềm năng/tối đa hai nhãn, người phụ trách và lịch tiếp theo.
- Hành động Gọi và Xem/Cập nhật; gọi hoặc mở Zalo không ghi nhận liên hệ hay hoàn thành.
- Lọc nhanh cuộn ngang: Tất cả, Tiềm năng cao, Cần xử lý, Quá hạn, Đã chốt.
- Bộ lọc chi tiết dạng bottom sheet: giai đoạn, trạng thái, tiềm năng, nhãn, người phụ trách, ngày/khoảng thời gian, nguồn, nhóm nhu cầu và hạn theo dõi. Có Áp dụng, Xóa và số tiêu chí đang áp dụng.
- Giữ bộ lọc trong phiên theo tài khoản khi mở chi tiết rồi quay lại; không thay Sidebar Desktop.
- Sắp xếp mới/cũ, lịch sớm, tiềm năng, giá trị có dữ liệu và Ưu tiên công việc: quá hạn → hôm nay → tiềm năng cao chưa có lịch → còn lại.

## 3. Chi tiết và cập nhật
- Tái dùng màn chi tiết và các biểu mẫu hiện có; thêm cập nhật nhanh tiềm năng, nhãn và lịch theo dõi mà không mở sửa toàn bộ hồ sơ.
- Dùng lịch hẹn và hạn cập nhật diễn biến thật đang có; phân biệt hạn cập nhật diễn biến với lịch liên hệ, không tự đoán nghĩa vụ.
- Giữ nguyên trường bắt buộc, quyền, lịch sử và quy tắc chuyển trạng thái; chống thao tác Lưu lặp, giữ nội dung khi lỗi hoặc bàn phím thay đổi.
- Rà soát tạo/sửa/ghi diễn biến trên điện thoại nhỏ, vùng chạm, nút lưu, trạng thái tải/trống/lỗi và vùng an toàn của shell.

## 4. Báo cáo
- Bổ sung số lượng/cơ cấu tiềm năng, tỷ lệ chốt theo tiềm năng, tiềm năng cao theo giai đoạn và quá hạn thực tế.
- Tỷ lệ chốt = số Chốt / tổng tín hiệu thuộc bộ lọc × 100%; áp dụng nhất quán các tiêu chí, không loại trạng thái khỏi mẫu số ngầm, không đếm trùng và không coi Chưa đánh giá là Thấp.
- Xu hướng phân biệt ngày phát hiện/tạo với ngày chốt thật, không gọi số khách hiện đã chốt trong một nhóm ngày tạo là số chốt trong ngày đó.
- Giữ báo cáo hiện có và phạm vi dữ liệu được kiểm tra tại backend; biểu đồ và drill-down không tràn Mobile.

## 5. Bảo toàn và kiểm thử
- Không đổi mã trạng thái, phân phối/nhận, thông báo Zalo, lịch sử, người phụ trách hoặc dữ liệu cũ; không đồng bộ sang CRM.
- Nhóm hiển thị Tiếp nhận/Tư vấn/Chốt đơn/Kết thúc không làm đổi quy trình.
- **Chưa thêm Tạm hoãn ở đợt này:** tài liệu yêu cầu nghiên cứu; trạng thái mới cần quy định riêng về hạn, kết thúc, mở lại và báo cáo. Không chuyển tín hiệu Trượt cũ.
- Kiểm thử quyền Sale/quản lý, nhãn riêng/chung, lưu lặp, lọc kết hợp, mẫu số báo cáo, thứ tự ưu tiên và hồi quy chuyển trạng thái.
- Kiểm tra màn hình 320/360/390/430px và Desktop, không tràn/che thao tác và không mất bộ lọc.
- Nghiệm thu lưu → đọc lại → lọc → báo cáo bằng phiên đăng nhập và hồ sơ được phép; không tự chọn tài khoản khác hoặc tạo khách giả. Nếu thiếu phiên sẽ ghi rõ phần chưa xác minh.
- Không Publish. Các thay đổi dữ liệu dùng chung có hiệu lực trên backend hiện tại dù chưa Publish; chỉ thêm cấu trúc/danh mục cần thiết, không sửa dữ liệu nghiệp vụ thật.

## Chi tiết kỹ thuật
- Migration cộng thêm cho trường tiềm năng/audit và bảng nhãn/liên kết nhãn; đủ GRANT/RLS, ghi bằng RPC có xác thực/phạm vi, khóa và bảo vệ request lặp.
- Tái dùng `private.sig_scope_ok`, quyền `signal.*`, dữ liệu `next_contact_on`/`next_contact_at` và các RPC progression; không thay bằng quyền `biz.crm_*` hoặc tạo hệ quyền báo cáo mới.
- Dữ liệu báo cáo/list/export tiếp tục đi qua RLS hiện có; thông tin nhãn cá nhân được lọc riêng theo chủ sở hữu.
- Mở rộng module `src/lib/signals` và màn hình hiện tại, chia các phần tiềm năng/nhãn/bộ lọc mobile thành thành phần nhỏ, giữ interaction guards của detail Sheet.