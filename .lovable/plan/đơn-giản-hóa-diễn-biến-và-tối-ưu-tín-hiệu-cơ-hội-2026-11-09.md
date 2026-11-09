# Đơn giản hóa diễn biến và tối ưu Tín hiệu cơ hội

## Phạm vi và bảo toàn
- Thay kỳ/hạn diễn biến bằng note tự nguyện; không thay tiếp nhận, phân công, trạng thái, tỷ lệ chốt, tiềm năng, nhãn, CRM hay các lịch nghiệp vụ khác.
- Giữ nguyên mọi note, tác giả, thời điểm và dữ liệu kỳ lịch sử. Không tạo dữ liệu giả hoặc sửa timestamp cũ.
- Chỉ làm trên Preview, không Publish. Thay đổi dữ liệu dùng chung sẽ có hiệu lực bảo vệ/vận hành trên cả bản đã xuất bản; giữ tương thích với giao diện cũ trong lúc chuyển đổi.

## 1. Đo hiện trạng trước khi tối ưu
- Hiện dữ liệu thật có 617 tín hiệu và 1.211 dòng nhật ký; 106 dòng có dấu diễn biến mới rõ ràng. Nhật ký còn chứa tiếp nhận/chuyển trạng thái nên không coi tất cả là note.
- Danh sách hiện tải toàn bộ tín hiệu, liên kết nhãn và dữ liệu note rồi lọc tại trình duyệt; Mobile chỉ cắt số thẻ hiển thị. Danh sách, hạn và báo cáo có nhiều lượt tải lại mỗi 10 giây.
- Ghi lại số request, dung lượng, thời gian dữ liệu đầu tiên, tìm/lọc/mở chi tiết/lưu note và truy vấn tổng hợp. So sánh cùng dữ liệu, quyền và điều kiện; không tuyên bố tăng tốc dựa vào mô phỏng đơn thuần.
- Đo và kiểm thử tải 600/3.000/5.000 tín hiệu trong môi trường cách ly, không chèn vào dữ liệu thật.

## 2. Diễn biến tự nguyện
- Chi tiết có “Diễn biến tín hiệu”, tổng số lần cập nhật, lịch sử và nút “Cập nhật diễn biến”. Form note riêng chỉ nội dung và Lưu; giữ chuyển trạng thái và các trường bắt buộc của Chốt/Trượt ở thao tác hiện có.
- Tái sử dụng lịch sử note và quy tắc nhận diện nội dung hợp lệ; không tự phân loại lại lịch sử mơ hồ.
- Lưu phía máy chủ kiểm tra quyền, khóa bản ghi và mã yêu cầu chống lặp; cùng yêu cầu trả kết quả cũ, không tạo note thứ hai. Note độc lập không ghi đè trạng thái, lịch hay phân công đồng thời.
- Lịch sử tải khi mở chi tiết, có tải thêm; note mới xuất hiện sau lưu thành công.

## 3. Ngừng kỳ hạn an toàn
- Bỏ khu vực kỳ, hạn, đúng/trễ, bộ lọc hạn và chỉ số kỳ trên danh sách/chi tiết/báo cáo; không còn gọi dữ liệu hạn ngầm.
- Ngừng lịch sinh nhắc note định kỳ và đồng bộ kỳ mới; giữ bảng, cột và dữ liệu lịch sử với ghi chú ngừng sử dụng.
- Rà soát nhắc Zalo chăm sóc riêng: bỏ phần nhắc thiếu note, giữ nguyên phần cảnh báo chưa tiếp nhận. Không vô hiệu toàn bộ loại thông báo dùng chung.
- Giữ thông báo tín hiệu mới, giao Sale, Zalo OA và Push hiện hành.

## 4. Danh sách phân trang thực sự
- Mobile tải 30 tín hiệu/lượt và tải thêm khi cuộn; Desktop 40 tín hiệu/trang. Tìm kiếm chờ khoảng 300ms và bỏ kết quả của điều kiện cũ.
- Lọc, tìm, sắp xếp và đếm phía máy chủ theo quyền trước phân trang; giữ mọi bộ lọc cần thiết, không tải toàn bộ lịch sử/nhãn liên kết để mở trang đầu.
- Mặc định Chờ phân công → Chờ nhận → đang xử lý → Chốt/Trượt; nhóm chờ lâu nhất trước, khóa phụ ổn định. Sale không được xem Chờ phân công thì Chờ nhận đứng đầu. Các sort chủ động khác độc lập.
- Đếm trạng thái và nhu cầu từ toàn bộ tập đúng quyền/bộ lọc, không từ trang đang hiển thị; tín hiệu nhiều nhu cầu không làm trùng tổng.
- Bỏ tải toàn bộ mỗi 10 giây. Dùng một cơ chế kiểm tra thay đổi nhẹ khi trang đang hoạt động và làm mới đúng truy vấn sau thao tác; không phát dữ liệu ngoài quyền.
- Cache theo tài khoản, phạm vi và bộ lọc; mở/đóng chi tiết giữ vị trí cuộn, không mất tín hiệu mở bằng liên kết khi nó ngoài trang hiện tại.

## 5. Báo cáo note và tốc độ phản hồi
- Thay báo cáo kỳ bằng tổng tín hiệu, chưa/có note, tổng lượt, tỷ lệ có note, trung bình trên tín hiệu đã note, biểu đồ phân bố và bảng từng mức chính xác 0,1,2,… không giới hạn 5.
- Tách ba góc nhìn: tệp tín hiệu tích lũy theo người phụ trách hiện tại; hoạt động note trong kỳ theo tác giả thật; tốc độ note đầu tiên theo lượt tiếp nhận trong kỳ.
- Mỗi lượt tiếp nhận chọn note hợp lệ đầu tiên của chính Sale sau tiếp nhận, trước khi lượt trách nhiệm kết thúc; không lấy note Sale cũ, note tự động hay note trước tiếp nhận.
- Tái sử dụng bộ tính giờ tiếp nhận hiện tại: 08:00–17:00 thứ Hai–thứ Bảy, giờ Việt Nam; loại mẫu không có thời gian làm việc dương, hiển thị mẫu số và “—” khi không có mẫu. Không sửa công thức tiếp nhận hiện có.
- Tổng hợp tại máy chủ, không đưa một trang dữ liệu vào công thức cần toàn bộ tập. Giữ đầy đủ báo cáo bán hàng hiện hữu và tỷ lệ chốt; bộ lọc tổ chức chỉ dùng bổ nhiệm/phạm vi hiện hành, không xây quyền riêng.

## Chi tiết kỹ thuật
- Giữ RPC-only cho ghi note và RLS hiện hành cho đọc; các đọc tổng hợp sử dụng quyền caller, không admin bypass hoặc truy vấn N+1.
- Bổ sung giao diện đọc phân trang/tổng hợp với hợp đồng bộ lọc dùng chung; giữ API cũ tương thích trong giai đoạn chuyển đổi và không sửa migration cũ.
- Sửa view ưu tiên cộng thêm tương thích, bỏ phụ thuộc `signal_progression_deadlines`; giữ mốc chờ lấy từ sự kiện phân công/nhật ký thật.
- Thống kê note dùng `signal_note_is_progression(note,event_type,is_progression)` hiện có; tiếp nhận lấy từ lịch sử phân công và note `status_from='waiting'`, không đoán từ thời điểm cập nhật cuối.
- Chỉ thêm index theo truy vấn/EXPLAIN đã đo; ghi quyết định cấu trúc và kết quả kiểm chứng vào tài liệu dự án.

## Nghiệm thu và giới hạn
- Kiểm thử note lưu một lần/lỗi/thử lại, bàn giao A→B→A, ngoài giờ/Chủ nhật/0 giây, không note, mức note lớn, quyền đọc/ghi/báo cáo, sort trước phân trang, nhãn riêng và cache đổi tài khoản.
- Kiểm tra Desktop/Mobile, tìm/lọc/tải thêm, mở chi tiết ngoài trang, thông báo tiếp nhận vẫn hoạt động và note cũ còn nguyên.
- Báo cáo rõ phần đã ngừng, truy vấn/timer/index thay đổi, phép đo trước/sau, kết quả và phần chưa xác minh.
- **Nghiệm thu phiên thật đang chờ đăng nhập Preview:** việc mở phiên tự động không tìm thấy tài khoản khớp với bạn. Không tự chọn tài khoản khác; khi chưa đăng nhập chỉ xác minh bằng kiểm thử cách ly và truy vấn được phép, không tuyên bố đã nghiệm thu lưu note thật.