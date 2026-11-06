# Nâng cấp phân loại, danh mục và báo cáo CRM

## 1. Tệp khách cho hai nhóm hiện có
- Thêm đúng 7 tệp **Trung Gian Quà Tặng** và 8 tệp **Đại Lý Đồ Thờ** trong tài liệu, liên kết bằng ID nhóm hiện hữu.
- Khởi tạo Đang sử dụng, thứ tự rõ ràng; chạy lại không tạo trùng, không ghi đè tệp sẵn có.
- Giữ nguyên khách, người phụ trách, liên hệ và lịch chăm sóc; không tạo lại hai nhóm gốc.

## 2. Quản lý Nhóm & Tệp khách
- Thay danh sách kỹ thuật bằng cây nhóm mở rộng: tên, trạng thái, số khách, mô tả; Thêm tệp ngay trong nhóm và Thêm nhóm cuối danh sách.
- Cho phép đổi tên, mô tả, thứ tự, kích hoạt/ngừng; mọi thay đổi phản ánh ở hồ sơ, bộ lọc và báo cáo.
- Bảo vệ ID/liên kết, tên trùng trong cùng nhóm và vòng lặp. Không xóa cứng danh mục có khách.
- Giữ nhóm cha của tệp đã có khách trong đợt này để tránh tự chuyển phân loại khách; tệp chưa dùng có thể đổi cha sau xác nhận.
- Quản lý sáu nhóm đặc điểm: kênh bán, hình thức hợp tác, khách đầu ra, dòng sản phẩm, đặc điểm kinh doanh, nhu cầu. Mỗi giá trị có phạm vi nhóm hoặc dùng chung, có thể thêm/sửa/ẩn.

## 3. Hồ sơ và bộ lọc
- Bộ chọn có tìm kiếm: Nhóm khách → Tệp khách → nhiều đặc điểm bổ sung theo nhóm; không tạo hồ sơ trùng theo kênh hoặc nhãn.
- Tạo mới chỉ chọn mục đang hoạt động; hồ sơ cũ vẫn hiện mục ngừng sử dụng.
- Đổi nhóm khi sửa cần xác nhận nếu phải bỏ tệp không tương thích; giữ các trường khác.
- Bổ sung lọc tệp theo nhóm trên danh sách và báo cáo; giao diện điện thoại không tràn, nút Lưu giữ dễ tiếp cận.

## 4. Báo cáo & Phân tích CRM
- Bộ lọc khoảng thời gian, nhóm/tệp, ưu tiên, hợp tác, tỉnh/thành, Sale và Hệ/Phòng/Nhóm theo phạm vi hiện có.
- Tám chỉ số bấm xem khách: tổng duy nhất, khách mới, trọng điểm, đang hợp tác, chưa phân loại tệp, tỷ lệ có lịch, tỷ lệ chăm sóc đúng hạn và khách có lịch quá hạn.
- Biểu đồ donut, cột và bảng tệp: số khách, tỷ trọng, khách mới, trọng điểm; luôn có **Chưa phân loại tệp**. Danh mục mới được nhận diện tự động.
- Tỷ trọng dùng khách duy nhất; tổng tệp chính và Chưa phân loại là 100% trước làm tròn. Đặc điểm phụ không cộng thành khách mới.
- Xu hướng khách mới theo kỳ, tăng trưởng từng tệp; phân tích có/chưa có lịch, quá hạn, đúng hạn, lâu chưa chăm sóc và trọng điểm chưa chăm sóc. Không suy diễn khách mất hoặc giảm hoạt động khi thiếu lịch sử.
- Bấm biểu đồ mở danh sách khách tương ứng; xuất dữ liệu giữ quyền riêng và cùng bộ lọc.

## 5. Bảo toàn và nghiệm thu
- Tái sử dụng cơ cấu, bổ nhiệm và quyền CRM hiện có; xem rộng không tự được sửa hộ hoặc xuất.
- Kiểm thử 7/8 tệp, chống trùng, đổi tên/ẩn/đổi nhóm, quyền, dữ liệu động, tỷ trọng và Chưa phân loại.
- Kiểm tra điện thoại nhỏ và desktop: tìm/chọn/lưu, Cài đặt, bộ lọc, biểu đồ và xem khách; giữ nguyên khung Base.
- Không thêm dữ liệu khách giả, không bật Zalo, không Publish. Nghiệm thu lưu/đọc bằng phiên thật chỉ khi có tài khoản và hồ sơ được phép; ghi rõ phần chưa xác minh.

## Kỹ thuật
- Dùng `crm_catalogs`, quan hệ cha–con và cấu hình hiện có; không tạo danh mục hoặc cơ cấu CRM song song.
- Bổ sung an toàn các kiểm tra trong RPC/trigger, dùng ID ổn định và giữ quyền ghi qua RPC. Dữ liệu khởi tạo danh mục thực hiện riêng, chống trùng theo nhóm cha.
- Tất cả báo cáo lấy nguồn RPC lịch sử có kiểm tra phạm vi; bộ lọc mới áp dụng nhất quán cho khách/lịch/tương tác và xuất, không lấy dữ liệu tương lai cho kỳ quá khứ.