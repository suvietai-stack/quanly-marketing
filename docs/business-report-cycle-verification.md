# Báo cáo chu kỳ — kết quả kiểm chứng

## Đã triển khai
- Báo cáo → Cài đặt: Chu kỳ / Deadline / Lịch sử; dữ liệu đơn vị từ Cơ cấu tổ chức thật.
- Kết nối `biz_report_cycle_save/delete/config_of`, bảng cấu hình và lịch sử có sẵn; `biz_deadline_save`, ba mốc có sẵn.
- Phòng → Hệ → Khối → mặc định Tháng trước 02/11/2026, Tuần từ 02/11/2026; giữ cấu hình riêng và lịch sử.
- Ngày/Tuần/Tháng/Quý, lịch Ngày, xem trước, cảnh báo ngày giữa kỳ; Ngày/Tuần nhập thực tế, phân bổ tuần giao tháng và `_allocations`.
- Gửi lần đầu kiểm tra máy chủ: chưa mở/đóng chặn, quá hạn cần nộp bù đã duyệt, tiêu thụ nguyên tử; nộp lại kế hoạch giữ ngoại lệ.
- Nguồn Dashboard cộng dồn đọc khoảng thực tế, dùng phân bổ tuần, không suy quý thành tháng; nguồn chồng lấn/thiếu phủ trả NULL. Giữ công thức mục tiêu và biểu đồ.

## Đã kiểm chứng
- 122 kiểm thử đạt ở 10 tệp: deadline, lịch ISO, kế thừa, nguồn chính thức, điều chỉnh, tổng hợp, nghĩa vụ theo chu kỳ và chống trùng tại ranh giới chuyển chu kỳ.
- Tài khoản Super Admin thật mở Báo cáo qua menu → Cài đặt → chọn Tuần → xem lịch → Deadline Tuần.
- Màn 360/375/390/430px không tràn trang; đã xem ảnh Cài đặt trên máy tính và điện thoại, không có lỗi trình duyệt.
- Kiểm tra cấu trúc database xác nhận các hàm đã áp dụng; không thay cấu hình/dữ liệu nghiệp vụ.

## Chưa nghiệm thu đầy đủ
- Chưa lưu thay đổi cho Hệ/Phòng thật, chưa đổi tài khoản nhân viên để nộp đủ bốn chu kỳ: cần xác nhận đơn vị/ngày áp dụng, không tự tạo dữ liệu test vận hành.
- Chưa xác nhận luồng tổng hợp thực tế end-to-end với hồ sơ đa chu kỳ và lịch sử mục tiêu/điều chuyển.
- Thống kê nghĩa vụ đã chuyển sang chu kỳ thực và kiểm thử độc lập; chưa nghiệm thu Dashboard bằng hồ sơ đa chu kỳ thật.
- Cấu hình hiện có: Ngày từ 31/10, Tuần từ 02/11; lịch Tuần mở ngày +1 lúc 00:00, hạn cuối ngày +1 lúc 23:00, thiếu đóng nộp bù. Giao diện và máy chủ chặn lịch thiếu; không tự thêm thời điểm vận hành.
- Chưa Publish; thay đổi database dùng chung Preview và bản đang xuất bản.