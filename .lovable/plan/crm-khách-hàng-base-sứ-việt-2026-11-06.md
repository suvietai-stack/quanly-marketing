# CRM Khách Hàng — Base Sứ Việt

## Kết quả cần xây dựng

Thêm **Kinh doanh → CRM Khách Hàng**, ưu tiên sử dụng hằng ngày trên điện thoại, với bốn khu vực trong một module:

- **CRM Của Tôi:** mặc định Chăm sóc hôm nay; khách hàng, lịch, lịch sử và báo cáo cá nhân.
- **Theo Dõi Nhân Viên:** khách và hoạt động của nhân viên thuộc phạm vi quản lý.
- **Báo cáo & Phân tích:** chỉ số, biểu đồ, so sánh kỳ và danh sách chi tiết tương ứng.
- **Cài đặt CRM:** danh mục, mẫu chăm sóc và các quyền nghiệp vụ riêng.

Không thay thế Tín hiệu, đơn hàng hay CRM MISA; không tự đồng bộ, cộng KPI hoặc ghi doanh số. Không Publish trong đợt này.

## 1. Nền tảng, cơ cấu và quyền

- Tái sử dụng tài khoản, Hệ/Phòng/Nhóm, bổ nhiệm hiệu lực và cơ chế phạm vi của Base; không thêm tổ chức hoặc nhân sự CRM riêng.
- Sale sử dụng CRM cá nhân; quản lý xem nhân viên đúng phạm vi; lãnh đạo toàn Khối và Admin/Super Admin xem theo quyền hiện có.
- **CRM Của Tôi luôn chỉ chứa khách chính mình phụ trách**, kể cả người có quyền toàn hệ thống.
- Xem cấp dưới không tự cấp quyền sửa. Sửa hộ, bàn giao, xuất dữ liệu, lưu trữ và cấu hình được kiểm tra riêng.
- Quyền CRM thuộc nguồn quyền Cơ cấu tổ chức, không cấp qua Role tổng. Quyền ngoại lệ được cấp trong CRM, có lý do, thời hạn và nhật ký; không mở rộng quyền của module khác.
- Kiểm tra quyền tại nơi đọc/ghi dữ liệu, tìm trùng, báo cáo và tải tài liệu; không chỉ ẩn màn hình.

## 2. Danh mục và hồ sơ khách hàng

- Danh mục tùy chỉnh bằng ID ổn định: nhóm/mảng, khối, tệp, nhóm con, đặc điểm, sản phẩm, nhu cầu, ưu tiên, tình trạng, nguồn khách, vai trò liên hệ, mục tiêu/kết quả và chu kỳ mẫu.
- Khởi tạo **chỉ danh mục nghiệp vụ** theo tài liệu: Quà tặng trực tiếp; Bát đĩa nhà hàng; Khách sỉ/đại lý với Sỉ đồ thờ và Trung gian quà tặng cùng các khối/tệp đã nêu. Không tạo khách hoặc hoạt động mẫu.
- Cho thêm/sửa/sắp xếp/ngừng/kích hoạt; chặn vòng lặp và trùng tên trong cùng nhánh. Danh mục ngừng vẫn hiển thị trên hồ sơ cũ, không được chọn mới.
- Hồ sơ tổ chức hoặc cá nhân; nhóm chính và các đặc điểm/mảng liên quan đa lựa chọn, nhiều người liên hệ và địa điểm, một liên hệ/địa chỉ chính.
- Form tạo ngắn: tên, điện thoại/liên hệ, nhóm/tệp, tỉnh và lịch tiếp theo tùy chọn. Thông tin chuyên sâu mở theo nhu cầu và nhóm khách; không bắt nhập đủ mới lưu.
- Bộ chọn tìm kiếm 34 tỉnh/thành với mã chuẩn; phường/xã phụ thuộc tỉnh và không bắt buộc, không ép cấp huyện cũ. Đối chiếu nguồn danh mục hành chính trước khi đưa vào ứng dụng.
- Lưu người phụ trách mặc định là người tạo, mã tự sinh, dấu thời gian máy chủ; chống gửi trùng và cảnh báo khách trùng **chỉ trong phạm vi được phép xem**.
- Lịch sử sửa/bàn giao/lưu trữ được bảo toàn. Đổi cơ cấu không tự bàn giao khách. Ước tính tiềm năng không được tính thành doanh thu.
- Tài liệu được lưu riêng tư; tải lên và tải xuống phải kiểm tra quyền hồ sơ.

## 3. Chăm sóc và nhắc lịch

- Ba loại lịch: định kỳ, hẹn cụ thể và mùa vụ/sự kiện; mục tiêu, nội dung, liên hệ và kênh riêng cho từng lịch.
- Định kỳ tính từ lần hoàn tất hợp lệ gần nhất; hỗ trợ lịch cố định khi chọn. Lịch hẹn và mùa vụ không bị dời vì tương tác với lịch khác.
- Chăm sóc hôm nay hiển thị đến hạn, quá hạn và đã xử lý; thẻ khách có gọi/liên hệ, cập nhật và mở hồ sơ.
- Gọi điện/mở Zalo chỉ mở kênh liên hệ, không ghi nhận hoàn thành.
- Ghi kết quả nhanh: liên hệ, phương thức, kết quả, nội dung và bước tiếp theo. Phân biệt lượt thử thất bại với tương tác thực sự kết nối được.
- Hoàn tất, đặt hẹn lại, đổi chu kỳ hoặc tạm ngừng đều lưu dấu vết. Dời lịch giữ ngày cũ/ngày mới và lý do; không làm mất dấu trễ hạn.
- Lịch quá hạn vẫn xuất hiện, không tự hoàn tất hoặc nhân thêm một lịch mỗi ngày. Lịch tương lai không ghi đè lịch sử tương tác chính thức.
- Nhắc qua thông báo Base hiện có, gộp gọn và chống trùng; không tự bật Zalo OA hoặc Push.

## 4. Báo cáo và phân tích từ dữ liệu thật

- Tổng quan: khách duy nhất, khách mới/trọng điểm, có/chưa có lịch, lịch đến hạn/đã xử lý/quá hạn và khách lâu chưa chăm sóc.
- Biểu đồ cơ cấu theo danh mục tùy chỉnh, địa phương, ưu tiên, quan hệ và nguồn; phân biệt nhóm chính với nhóm liên quan, không cộng trùng tổng khách.
- Hoạt động theo Ngày/Tuần/Tháng/Quý/Năm; hiệu quả theo Nhân viên → Nhóm → Phòng → Hệ → Toàn Khối trong phạm vi.
- So sánh kỳ, nhận định theo quy tắc có căn cứ và bấm chỉ số/biểu đồ mở đúng danh sách chi tiết. Không dựng nhận định khi thiếu dữ liệu.
- Một nguồn công thức cho mọi chỉ số, biểu đồ, danh sách và xuất dữ liệu:
  - Xử lý lịch = lịch đến hạn trong kỳ đã xử lý / tổng lịch đến hạn trong kỳ.
  - Đúng hạn = lịch đến hạn trong kỳ hoàn tất hợp lệ đúng hạn / tổng lịch đến hạn trong kỳ.
  - Liên hệ thành công = lượt thực sự kết nối / tổng lượt thử ghi nhận.
  - Khách có lịch = khách có ít nhất một lịch hiệu lực / tổng khách đang quản lý.
  - Khách trọng điểm quá hạn = khách trọng điểm có lịch quá hạn chưa xử lý / tổng khách trọng điểm.
- Mẫu số 0 hiển thị **Chưa có dữ liệu**. Lịch phát sinh, trách nhiệm phụ trách và thay đổi lịch có lịch sử để báo cáo quá khứ không bị dữ liệu tương lai hoặc bàn giao mới làm sai.

## 5. Mobile và kiểm thử

- Dùng Header/Bottom Navigation hiện có; không thêm thanh điều hướng CRM riêng hoặc tiêu đề lặp.
- Một mục menu cấp hai, tự tham gia tìm kiếm và Tùy chỉnh ghim của Launcher; không đổi các mục Kinh doanh khác.
- Danh sách dạng thẻ, bộ lọc gọn trong sheet, form ngắn giữ dữ liệu khi lỗi và chống bấm Lưu lặp; vùng chạm lớn, bàn phím điện thoại, nút không bị che.
- Báo cáo điện thoại dùng chỉ số/biểu đồ dễ đọc, không bảng nhiều cột; desktop dùng bố cục hiện có.
- Kiểm thử cụ thể: quyền từng cấp và sửa URL/gọi trực tiếp; tạo tổ chức/cá nhân, nhiều liên hệ; danh mục đổi/ngừng; ba loại lịch; thất bại/thành công/dời lịch; chống trùng và đồng thời; mẫu số 0, không cộng trùng, kỳ quá khứ; tài liệu riêng tư; menu/ghim và điện thoại 320–430px, tablet và desktop.
- Nghiệm thu tạo → lưu → tải lại → chăm sóc → báo cáo qua giao diện bằng tài khoản và hồ sơ được phép. Không coi kiểm thử cách ly là nghiệm thu vận hành thật.

## Chi tiết kỹ thuật

- Bảng/RPC CRM riêng; khách, liên hệ, địa điểm, danh mục, lịch, từng nghĩa vụ đến hạn, tương tác và sự kiện lịch sử tách rõ. Không sửa schema nghiệp vụ module khác.
- Clients chỉ đọc theo RLS; ghi qua RPC an toàn, kiểm tra tài khoản hoạt động, quyền và phạm vi, khóa bản ghi, request key chống trùng và revision chống ghi đè.
- Dùng helper CRM gọi cơ chế phạm vi hiện có; mở rộng danh sách quyền hiệu lực theo cách cộng thêm, giữ nguyên hành vi Biz/3K. Cache đọc có user ID và bộ lọc.
- Trách nhiệm và đơn vị tại thời điểm phát sinh được đóng băng vào hoạt động/nghĩa vụ; phạm vi của người quản lý luôn dựa trên bổ nhiệm đang hiệu lực.
- File dùng nơi lưu riêng tư và đường dẫn tải có kiểm quyền. Nhắc CRM dùng nhịp nền đã xác thực, lỗi CRM không chặn nhắc module khác.
- Các thay đổi dữ liệu dùng migrations có GRANT/RLS đầy đủ. Chỉ dữ liệu danh mục được khởi tạo; không seed hồ sơ/hoạt động giả.

## Giới hạn nghiệm thu hiện tại

Preview đang ở màn hình đăng nhập. Việc kiểm thử tài khoản thật cần phiên đăng nhập phù hợp và khách/lịch được phép sử dụng; không tự chọn tài khoản của người khác hoặc ghi khách thử vào dữ liệu chung.

Lovable Cloud hiện dùng chung dữ liệu cho Preview và bản đang hoạt động: thay đổi cấu trúc phải cộng thêm và tương thích, không coi “chưa Publish” là dữ liệu được cách ly.

Triển khai theo năm phần trên, ghi rõ phần đã kiểm chứng và phần còn chờ nghiệm thu; không báo hoàn thành toàn bộ khi chưa đạt các luồng lưu, đọc, quyền và báo cáo.