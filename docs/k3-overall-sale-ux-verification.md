# Tối ưu 3K cho Sale — 05/11/2026

## 1. Màn hình đã thay đổi
- Tạo công việc: một form, không chọn Cơ bản/Nâng cao.
- 3K Của Tôi: Ngày lên trước; danh sách mục tiêu tổng nằm ở Tất cả, không chen vào việc hôm nay.
- Thẻ Ngày: tên, deadline kế thừa, trạng thái, kết quả, cập nhật và menu phụ; một KPI không cần chọn lại.
- Cập nhật: Có/Chưa là hai lựa chọn rõ ràng; bằng chứng tùy chọn được thu gọn, bắt buộc vẫn hiện.
- Tổng kết: số công việc/cập nhật/chưa cập nhật dùng từ dễ hiểu; xác nhận thủ công và chốt độc lập giữ nguyên.

## 2. Trường nhập loại bỏ hoặc kế thừa
Tên KF/KPI và tiêu chí binary kế thừa nguyên văn tên công việc nếu không có tiêu chí riêng. Ngày bắt đầu lấy hôm nay. Không nhập số 1. Mô tả, giờ/phút, nhiều bước/KPI, lộ trình và phối hợp chỉ mở theo nhu cầu. Mục tiêu/đơn vị số lượng vẫn bắt buộc; các kiểu nâng cao giữ đủ thành phần.

## 3. Thao tác trước/sau
Theo source trước thay đổi: mở form → tên → ngày bắt đầu → deadline → kết quả cần đạt → cấu hình đo/tiêu chí → lưu; 7 nhóm thao tác, tùy cách đo. Sau: mở → tên → deadline → lưu khi dùng binary mặc định (4 nhóm), hoặc thêm chọn cách đo (5 nhóm). Đây là đếm từ luồng source, chưa phải đo nghiệm thu qua người dùng thật; không tính số lần bấm lịch/bàn phím.

## 4. Nút trùng
Bỏ lựa chọn Cơ bản/Nâng cao và không tự mở chi tiết sau lưu. Không lặp nút Tạo công việc của danh sách tổng và Ngày. Nhật ký nằm ở menu phụ trên thẻ Ngày; cập nhật đơn KPI trực tiếp. Không thêm nút Bắt đầu/Hoàn thành/Hủy.

## 5. Sửa/Xóa
Menu Ngày mở chi tiết hiện có và dùng điều kiện xóa máy chủ. RPC xóa/khôi phục 15 ngày không đổi; kết quả và lịch sử chính thức vẫn được bảo vệ. Còn hạn chế: KF duy nhất không được xóa lẻ; chưa nối xóa cả công việc đơn giản trực tiếp từ thẻ Ngày.

## 6. Backend
0242 chỉ thay định nghĩa đọc: loại cancelled khỏi danh sách hoạt động, bổ sung goal_id và thời gian hạn kế thừa cho ngày. Không đổi bảng, quyền, số liệu, timestamp, snapshot hoặc cấu hình Zalo. Đã đọc lại định nghĩa thật xác nhận thay đổi. Không chuyển lịch sử hủy vào Thùng rác.

## 7. Kiểm thử
185/185 toàn bộ 3K trước 2 test database mới; chạy lại creation focused 20/20 gồm 2 test mới. Tổng 187 kiểm thử được chạy thành công. Build mới nhất OK. Browser thực tế /biz/3k chuyển /login; không giả phiên hay dữ liệu. Không nghiệm thu UI đăng nhập, mobile hoặc ghi thật.

## 8. Chưa hoàn tất
- UI desktop/mobile và tạo/cập nhật/đọc lại thật cần phiên hợp lệ và hồ sơ được phép.
- Xóa công việc đơn giản trực tiếp trên Ngày, lịch sử hủy riêng và hoạt động có kết quả ngoài lịch cần hoàn thiện.
- Nhiều bước/KPI và phối hợp cần nghiệm thu; ma trận chức danh và gửi Zalo thật chưa kiểm tra.
- Không Publish, không tự bật Zalo; không báo hoàn tất tổng thể.