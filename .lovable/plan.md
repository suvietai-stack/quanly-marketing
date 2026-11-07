# Tái cấu trúc Thiết Kế Sứ Việt

## Kết quả
- Một hệ thống Order hiện có, ba luồng: **Chụp ảnh**, **Ấn phẩm Marketing**, **Ma-két đơn hàng**.
- Năm mục trong Thiết Kế: **Tất cả công việc**, ba luồng, **Báo cáo & Phân tích**. Mỗi luồng có Công việc/Báo cáo; Tất cả không chứa báo cáo tổng hợp.
- Mobile dùng thẻ gọn, hàng trạng thái cuộn ngang và Bộ lọc; Desktop dùng bảng gọn hoặc Kanban. Giữ khung điều hướng chung và ghim hiện tại.

## 1. Bảo toàn và phân luồng
- Giữ nguyên Order gốc, ID, loại sản phẩm, người liên quan, file, deadline, trạng thái, lịch sử và liên kết hiện có. Không xây thêm ba hệ thống Order.
- Luồng là thuộc tính riêng, không dùng trường loại sản phẩm thay thế.
- Phân loại nguồn cũ chỉ khi có chứng cứ liên kết rõ: Content yêu cầu ấn phẩm và Thumbnail từ Video. Không đoán luồng từ tên Order hay loại sản phẩm; còn lại giữ **Chưa phân loại luồng**, vẫn xem và mở tại Tất cả theo quyền.
- Việc phân loại không đổi thời gian hay lịch sử nghiệp vụ. Kiểm kê và đối soát trước/sau.
- Giữ `/orders` và `/orders?open=<id>`; cập nhật người tạo từ Content/Video để lưu đúng luồng, liên kết và lịch sử chuẩn, không tạo trùng.

## 2. Quyền và quy trình
**Rà soát đã phát hiện:** quyền đọc/ghi Order hiện tại ở dữ liệu cho phép tài khoản hoạt động truy cập rộng; giới hạn theo người chủ yếu nằm trên màn hình. Phải bổ sung kiểm soát tại dữ liệu trước khi đưa các danh sách/báo cáo mới vào sử dụng.

- Người tạo xem Order mình tạo; người thực hiện xem việc được giao và việc chờ nhận hợp lệ; người duyệt xem đúng trách nhiệm; điều phối/quản lý và quản trị theo quyền hiện hành. Hợp các quyền khi một người có nhiều vai trò.
- Tách quyền tạo/xem/nhận-xử lý/duyệt/phân công/báo cáo theo luồng trong cấu hình quyền hiện có; quyền luồng chỉ giới hạn nghiệp vụ đã được cấp, không biến quyền tạo thành quyền xem toàn bộ.
- Giữ hiệu lực các quyền Order cũ; không tự gán luồng chuyên môn cho nhân viên hoặc đổi Role thật hàng loạt. Quyền cũ chưa giới hạn luồng tiếp tục có phạm vi cũ; người quản trị có thể cấu hình giới hạn từng luồng.
- Kiểm tra người nhận/người duyệt và chuyển trạng thái tại dữ liệu; giữ chuỗi workflow hiện tại và chống tự duyệt. Không coi hoàn thành nội bộ là khách duyệt mẫu sản xuất.
- Lịch sử chỉ thêm, không sửa/xóa; không xóa Order có lịch sử xử lý. Giữ các kênh thông báo và cơ chế chống trùng, gửi đúng người đủ quyền của luồng, không mặc định gửi toàn bộ Admin/Thiết Kế.
- Cài đặt/phân quyền có điểm truy cập trong Thiết Kế cho người có quyền, không thêm mục sidebar thứ sáu.

## 3. Màn hình và biểu mẫu
- Năm trang nội dung dùng chung dữ liệu và bộ xử lý Order. Tất cả bắt chọn một luồng có quyền tạo; trang luồng xác định sẵn, không hỏi lại.
- Form chia Thông tin chính, Yêu cầu chi tiết, File tham khảo, Deadline; thông tin nâng cao thu gọn. Dùng lại danh mục sản phẩm hiện có.
- Chụp ảnh: đối tượng, loại hình, khối lượng, mục đích, concept, địa điểm/thời gian dự kiến.
- Ấn phẩm: loại ấn phẩm, mục đích/kênh sử dụng, kích thước/định dạng, nội dung/brief.
- Ma-két: khách/đơn vị, mã đơn tùy chọn, sản phẩm/số lượng, logo/nội dung/vị trí in, kích thước/yêu cầu kỹ thuật. Không tự tạo đơn trong module khác.
- Lọc luồng/trạng thái/người/deadline/quá hạn, Tôi tạo/Tôi phụ trách/Cần duyệt. Bộ đếm và danh sách dùng cùng tập được phép xem.
- Chi tiết giữ thông tin, file, duyệt/sửa và lịch sử; chỉ hiện thao tác phù hợp quyền/trạng thái, lỗi lưu giữ dữ liệu và cho thử lại.

## 4. Báo cáo thật, dùng chung cách tính
**Dữ liệu hiện tại:** 83 Order, 76 hoàn thành; chỉ 1 có trường thời gian hoàn thành, nhưng cả 76 có mốc hoàn thành trong lịch sử. Đọc lịch sử thật để tính, không ghi bù thời gian vào Order.

- Dùng một nguồn dữ liệu theo quyền cho ba báo cáo riêng và Dashboard tổng hợp; không đếm trùng, giữ nhóm Chưa phân loại riêng.
- Kỳ Ngày/Tuần/Tháng/Quý/Năm và tùy chỉnh theo giờ Việt Nam; lọc đồng bộ luồng, trạng thái, người thực hiện/người yêu cầu và phạm vi được hỗ trợ.
- Tách Order tạo trong kỳ, hoàn thành trong kỳ, tồn tại và quá hạn tại thời điểm xét; trạng thái lịch sử lấy từ các mốc thật khi xem kỳ đã qua. Thiếu mốc hiển thị thiếu dữ liệu, không đoán.
- Tỷ lệ đúng hạn = số hoàn thành đúng deadline / số hoàn thành trong kỳ có cả mốc hoàn thành và deadline hợp lệ. Hiện tử/mẫu số; thiếu dữ liệu không hiện 0% giả.
- Thời gian xử lý dùng mốc nhận→hoàn thành hợp lệ, chính xác tới giây; số sửa theo dữ liệu/lịch sử hiện hữu, không chấm điểm/thưởng phạt.
- Dashboard gồm tỷ trọng luồng, trạng thái/tắc nghẽn, xu hướng tạo và hoàn thành theo tháng, so sánh đúng hạn, khối lượng theo nhân viên và số vòng sửa. Bấm chỉ số/biểu đồ mở danh sách tương ứng cùng bộ lọc và quyền.

## 5. Kiểm thử và nghiệm thu
- Kiểm thử ba luồng, một Order gốc, loại sản phẩm độc lập, dữ liệu chưa phân loại, đối soát ID/file/lịch sử/thời gian.
- Kiểm thử quyền người tạo A/B, người thực hiện, chờ nhận, duyệt, điều phối, quản trị và nhiều vai trò; truy cập trực tiếp cũng không lộ dữ liệu hay tổng ngoài quyền.
- Hồi quy Content, Video/Thumbnail, `/orders?open=`, KPI, thông báo Base/Zalo/Push và ghim.
- Kiểm thử báo cáo kỳ/mẫu số/giây/không đếm trùng/lọc/drill-down; giao diện 320/390/430/768/1280px và thao tác form/chi tiết/lỗi thử lại.
- Nghiệm thu sau đăng nhập bằng tài khoản được xác định và hồ sơ thật được phép; không chọn tài khoản khác, tạo dữ liệu thử hoặc gửi thông báo thử trên dữ liệu dùng chung.
- Chưa Publish. Thay đổi dữ liệu/quyền sẽ tác động hệ thống dùng chung ngay khi áp dụng, dù giao diện vẫn ở Preview; triển khai từng bước và kiểm tra trước khi chuyển bước.

## Chi tiết kỹ thuật
- Tiếp tục `public.orders`; thêm thuộc tính luồng nullable và thông tin chuyên môn có cấu trúc, các giá trị `photo`, `marketing_design`, `order_mockup`. Không đổi `data.type`, không chạm `oq_*`/`ot_*`.
- Mở rộng kiểm soát Order tại database bằng chính sách đọc theo người/phạm vi và thao tác nguyên tử có khóa dòng, kiểm tra quyền/trạng thái, bảo toàn history và chống ghi đè. Mọi đường ghi hiện hữu phải đi qua cùng quy tắc.
- Bổ sung routes riêng `/design/photo`, `/design/marketing`, `/design/mockups`, `/design/reports`, dùng chung màn hình/dữ liệu; `/orders` là Tất cả. Mỗi trang có metadata riêng.
- Dùng cấu hình điều hướng chung Sidebar/Launcher, không nhân bản danh mục ứng dụng. Báo cáo đọc theo người gọi, không dùng quyền quản trị để tổng hợp thông thường.