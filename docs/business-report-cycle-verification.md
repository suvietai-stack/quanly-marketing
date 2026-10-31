# Báo cáo chu kỳ — kết quả kiểm chứng

## Đã triển khai
- Báo cáo → Cài đặt: Chu kỳ / Deadline / Lịch sử; dữ liệu đơn vị từ Cơ cấu tổ chức thật.
- Kết nối `biz_report_cycle_save/delete/config_of`, bảng cấu hình và lịch sử có sẵn; `biz_deadline_save`, ba mốc có sẵn.
- Phòng → Hệ → Khối → Tháng; quay về kế thừa có hiệu lực kỳ tiếp theo, không xóa cấu hình lịch sử.
- Ngày/Tuần/Tháng/Quý, lịch Ngày, xem trước, cảnh báo ngày giữa kỳ; Ngày/Tuần nhập thực tế, phân bổ tuần giao tháng và `_allocations`.
- Gửi lần đầu kiểm tra máy chủ: chưa mở/đóng chặn, quá hạn cần nộp bù đã duyệt, tiêu thụ nguyên tử; nộp lại kế hoạch giữ ngoại lệ.
- Nguồn Dashboard cộng dồn đọc khoảng thực tế, dùng phân bổ tuần, không suy quý thành tháng; nguồn chồng lấn/thiếu phủ trả NULL. Giữ công thức mục tiêu và biểu đồ.

## Đã kiểm chứng
- 59 kiểm thử đạt: 5 tệp, gồm deadline tại database độc lập, phân bổ 80/20 không chia đều, chặn chồng nguồn, lịch ISO và kế thừa.
- Tài khoản Super Admin thật mở Báo cáo qua menu → Cài đặt → chọn Tuần → xem lịch → Deadline Tuần.
- Màn 390px không tràn trang; kiểm tra máy tính 1280px.
- Kiểm tra cấu trúc database xác nhận các hàm đã áp dụng; không thay cấu hình/dữ liệu nghiệp vụ.

## Chưa nghiệm thu đầy đủ
- Chưa lưu thay đổi cho Hệ/Phòng thật, chưa đổi tài khoản nhân viên để nộp đủ bốn chu kỳ: cần xác nhận đơn vị/ngày áp dụng, không tự tạo dữ liệu test vận hành.
- Chưa xác nhận luồng tổng hợp thực tế end-to-end với hồ sơ đa chu kỳ và lịch sử mục tiêu/điều chuyển.
- Thống kê nghĩa vụ Dashboard vẫn cần hoàn thiện theo chu kỳ thực, không được coi là đã nghiệm thu.
- Chưa Publish; thay đổi database dùng chung Preview và bản đang xuất bản.