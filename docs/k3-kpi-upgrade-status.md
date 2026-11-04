# KPI 3K — trạng thái triển khai 04/11/2026

## Đã triển khai
- Migrations 0202–0208: kết quả KPI/người/ngày, một tổng hiện hành thay thế khi sửa; request key, revision và khóa giao dịch; lịch sử kết quả và bản chốt ngày bất biến.
- Cộng dồn/thời lượng: tổng giá trị; không trùng: định danh duy nhất; hiện tại: quan sát mới nhất theo ngày/thời điểm; tỷ lệ: tổng tử / tổng mẫu × 100; trung bình: tổng giá trị / tổng số quan sát; mốc: tiêu chí cấu hình không trùng. Điều kiện ≥, ≤, =, trong khoảng. Phần trăm chỉ có cơ sở với mục tiêu dương và ≥; hiển thị vượt 100%.
- KPI bắt buộc quyết định KF; KPI riêng quyết định KG, không tự hoàn thành từ một KF. Trạng thái tính khi đọc, giữ trạng thái lịch sử đã lưu.
- Form chung Biz3KKpiResult, query/mutation k3KpiResultQueries; màn ngày Biz3KKpiDay; kết nối chi tiết KG/KF/nhóm; giao diện Thùng lưu trữ và kiểm kê Biz3KArchive.
- Chính thức chỉ tính kết quả hiện hành khớp phiên bản chốt gần nhất; sửa sau chốt yêu cầu xác nhận lại, bản cũ còn nguyên. Thông tin ghi chú/bằng chứng và lịch sử người khác chỉ cấp cho chủ trì/Admin/quản lý đúng phạm vi; thành viên thường chỉ thấy đóng góp đo lường chung.
- Cấu hình và cập nhật dùng khóa KPI chung; đường k3_kpi_save cũ chuyển qua cấu hình chuẩn, không cho manual_actual; KPI có thực tế legacy không được đổi công thức hồi tố.
- Thùng rác không purge cha có canonical results hoặc dữ liệu chờ rà soát; canonical đã chốt bảo vệ thao tác xóa KG/KF.

## Dữ liệu thật
Kiểm kê ban đầu: 2 KG, 1 KF, 2 KPI, 3 công việc cũ, 3 ngày, 2 ngày tổng kết; cả 3 công việc chưa có KPI ID và 2 chưa có KF. Không đoán liên kết, không đổi số liệu/timestamp, không tạo dữ liệu giả.
Số chuyển đổi: **0**. Số cách ly tự động: **0**. Đã bổ sung tạo bản sao riêng tư kiểm đếm, nhưng chưa chạy hoặc kiểm tra khôi phục; không coi tồn tại RPC là sao lưu đã xác minh.

## Kiểm tra đã chạy
109/109 kiểm thử 3K đạt: 16 công thức/điều kiện và KPI bắt buộc, 20 kiểm thử máy chủ mới, 73 hồi quy cũ. Các kiểm thử mới dùng dữ liệu cô lập, không tạo kết quả thử trong hệ thống thật. Kiểm tra biên dịch gần nhất thành công. Trình duyệt vẫn ở trang đăng nhập nên chưa chứng minh luồng nhập/lưu/đọc lại qua giao diện.

## Chưa hoàn tất
- Tổng hợp kỳ/monitor còn dùng nguồn legacy; chưa nghiệm thu tính thống nhất toàn bộ màn hình.
- Còn biểu mẫu cập nhật legacy ở các màn kỳ; màn ngày lịch sử chỉ đọc.
- Chưa có quy trình đầy đủ liên kết/khôi phục/xác nhận xóa dữ liệu cần rà soát, chưa thực hiện chuyển đổi A/B/C hay đối soát sau chuyển đổi.
- Chưa hoàn tất kiểm thử purge/concurrency thật và giao diện bảy kích thước.
- Chưa nghiệm thu ghi qua UI: phiên cung cấp không khôi phục đăng nhập, mint --self không có tài khoản tương ứng. Cần đăng nhập Preview và hồ sơ thật được phép; không tự chọn nhân viên khác hoặc ghi dữ liệu thử vào hệ thống dùng chung.
- Spec 670 dòng về deadline tới giờ/phút và lộ trình định kỳ còn trong roadmap; không tự đặt lịch vận hành.

Không Publish. Các thay đổi lưu trữ chạy trên hệ thống dùng chung, không chuyển đổi/xóa dữ liệu thật trong lượt này.