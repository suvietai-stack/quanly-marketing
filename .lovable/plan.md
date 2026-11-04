# Thống nhất cập nhật KPI 3K và bảo toàn dữ liệu cũ

## Kết quả cần đạt
Nhân viên chỉ nhập **kết quả thực tế theo ngày** qua một form “Cập nhật KPI”. Hệ thống tự tính kết quả, điều kiện đạt và trạng thái; chốt sổ xác nhận số liệu ngày. Giữ ba khu vực 3K hiện có, quyền theo Cơ cấu tổ chức và độc lập với KR/Kế hoạch/Báo cáo Kinh doanh.

## Hiện trạng đã kiểm tra
- Có 2 KG, 1 KF, 2 KPI, 3 bản ghi công việc ngày và 3 ngày; 2 ngày đã có chốt sổ. Chưa có bản ghi trong Thùng lưu trữ.
- Cả 3 công việc ngày chưa gắn KPI ID; 2 chưa gắn KF; 1 có số thực tế. Đây là dấu hiệu cần phân loại, **không phải kết luận dữ liệu sai**.
- Đã có xóa mềm/khôi phục và dọn Thùng rác 15 ngày, nhưng giao diện và kiểm thử còn thiếu.
- Chưa có nguồn kết quả KPI/người/ngày thống nhất. Cập nhật trạng thái, phần trăm và thực thi đang tách nhau.
- Chưa xác minh bản sao khôi phục cho chuyển đổi dữ liệu hàng loạt.

## Các bước triển khai
### 1. Kiểm kê và bảo vệ dữ liệu
- Đối chiếu cấu trúc, quan hệ, kết quả, lịch sử và bản chốt hiện có; xuất báo cáo A: đúng chuẩn, B: chuyển đổi đủ căn cứ, C: cần rà soát.
- Xác minh phương án sao lưu/khôi phục có kiểm đếm trước khi chuyển đổi; không coi việc giữ nguyên bảng là một bản sao lưu.
- Không đổi số thực tế hoặc timestamp gốc, không tự gán KPI theo đơn vị khi không đủ căn cứ, không tạo KG/KF giả.

### 2. Một nguồn kết quả và phép tính
- Ưu tiên mở rộng cấu trúc hiện có: mỗi KPI/người/ngày có một tổng hiện hành. Lưu lại là thay thế; giữ phiên bản cũ và chống ghi đè từ hai thiết bị.
- Hỗ trợ cộng dồn, không trùng có định danh, giá trị hiện tại, tỷ lệ tử/mẫu, trung bình tổng/số quan sát, mốc có tiêu chí và thời lượng chuẩn đơn vị.
- Điều kiện đạt ≥, ≤, =, trong khoảng. Không cộng phần trăm hoặc lấy trung bình ngày thiếu trọng số; không tạo tiến độ giả với KPI thấp tốt.
- Mỗi KPI tính độc lập; KF hoàn thành khi đủ KPI bắt buộc. KG đánh giá theo KPI/tiêu chí riêng, không tự hoàn thành vì một KF đạt.
- Phân biệt tổng đang cập nhật với số chính thức đã chốt, hiển thị vượt 100% và cảnh báo quá hạn riêng.

### 3. Form, nhật ký và chốt sổ chung
- Dùng chung “Cập nhật KPI” tại 3K cá nhân, chi tiết KG/KF, KG nhóm và danh sách lịch thực hiện.
- Mở đúng tổng ngày đã ghi, nhãn/ô nhập thay đổi theo phương thức, xem trước kết quả mới, phản hồi lưu thành công.
- Bỏ trạng thái/%/Hoàn thành thủ công khỏi cập nhật thường ngày. Tạm dừng/Hủy/Kết thúc chưa đạt vẫn là thao tác quản lý riêng có lý do.
- Nhật ký hiển thị kết quả ngày, lũy kế, người/thời điểm và phiên bản. Sửa sau chốt giữ bản cũ, yêu cầu xác nhận lại; số chính thức không cộng cả hai phiên bản.
- KF đã được chấp nhận và có lịch xuất hiện đúng ngày; lịch không tự tạo kết quả.

### 4. Hoàn thiện lưu trữ và chuyển đổi
- Hoàn thiện menu ba chấm, xác nhận xóa, danh sách Thùng rác và khôi phục theo quyền/quan hệ cha con.
- Thêm **Dữ liệu cần rà soát** riêng cho Admin/Super Admin, có lý do, ảnh hưởng, bản chốt liên quan và lịch sử xử lý.
- Dữ liệu chờ rà soát không vào cơ chế tự xóa 15 ngày; chỉ sau xác nhận xóa hợp lệ mới bắt đầu chu kỳ đó.
- Chuyển đổi nhóm B có bằng chứng, chạy lại không trùng; giữ nguyên ID/nguồn khi có thể. Nhóm C giữ bản gốc và bản chốt truy xuất được, tách khỏi chỉ số hiện hành có nhật ký.
- Đối soát số lượng/giá trị trước và sau; không chạy chuyển đổi nếu chưa xác minh khôi phục.

### 5. Kiểm thử và nghiệm thu
- Kiểm thử ví dụ mục tiêu 200: 20 + 30 = 50 (25%); sửa 30 thành 25 → 45; thêm 15 → 60; reload/request lặp/hai thiết bị không cộng trùng.
- Kiểm thử từng phương thức/điều kiện, nhiều KPI/người, quyền theo tổ chức, lời mời chưa nhận/thu hồi, chốt và sửa sau chốt, dữ liệu cách ly và purge 15 ngày.
- Kiểm thử hồi quy 3K và nghiệp vụ Kinh doanh; giao diện 360/375/390/430/768/1280/1440px.
- Nghiệm thu luồng ghi trên hồ sơ thật được cho phép; không tạo dữ liệu thử vào hệ thống dùng chung. Nếu chưa có hồ sơ phù hợp, báo rõ phần chưa nghiệm thu.
- Báo cáo công thức, nguồn ngày, chốt sổ, thay đổi, số chuyển đổi/cần rà soát, kiểm thử và rủi ro; không gọi hoàn tất chỉ vì giao diện đã đổi.

## Chi tiết kỹ thuật
- Giữ TanStack và client hiện có; ghi qua RPC kiểm quyền máy chủ, RLS/grants đúng phạm vi. Không dùng Role tổng cấp quyền 3K.
- Các đường đọc ngày/tuần/tháng/quý, KG/KF, theo dõi nhân viên và thống kê dùng cùng phép tính authoritative; không để bộ tổng hợp legacy NULL KPI tiếp tục đoán nguồn trong mô hình mới.
- Ràng buộc KPI/performer/date, request idempotency và revision/khóa giao dịch; bản sửa và chốt có lịch sử bất biến.
- Thay đổi schema theo hướng bổ sung, không xóa cột/bảng cũ; dữ liệu chuyển đổi có nguồn và dấu vết để đối soát/khôi phục.
- Rà lại cron dọn rác cùng mọi đường ghi/đọc để không xóa dây chuyền dữ liệu đang chờ rà soát.

## Phạm vi phát hành
**Không Publish.** Giao diện chỉ cập nhật Preview; hệ thống lưu dữ liệu dùng chung với bản đang chạy, nên thay đổi lưu trữ/quyền phải tương thích và được kiểm chứng trước khi chuyển đổi dữ liệu thật.