# Dashboard hiệu suất cá nhân

Dashboard hiện là bản tóm tắt theo vị trí, dữ liệu và quyền: **Cá nhân tôi** / **Phạm vi quản lý**. Xem [dashboard-modes.md](dashboard-modes.md) cho hợp đồng phạm vi, nguồn gốc và cách hiển thị. Không còn mặc định trang chung là dashboard Marketing hoặc sao chép đầy đủ báo cáo chuyên môn.

## Công thức đầu việc chuyên môn

Task, Content Web, Social, Video và Thiết kế được đọc theo người trực tiếp phụ trách. Người chỉ giao/duyệt không được cộng vào khối lượng thực hiện. ID ổn định thắng tên cũ; tên trùng không được đoán. Không tính dữ liệu mẫu. Công việc chia sẻ trong nhóm chỉ đếm một lần theo ID hồ sơ.

Tuần từ thứ Hai, tháng theo lịch; dùng helper thời gian KPI Việt Nam. Đang xử lý/chờ phản hồi/trạng thái khác là tồn hiện tại. Quá hạn xử lý chỉ tính trong việc đang xử lý; chờ phản hồi quá hạn được nhắc riêng và không tự quy lỗi cá nhân.

Hoàn thành trong kỳ cần ngày hoàn thành hợp lệ từ đầu kỳ đến thời điểm cập nhật; không lấy updated_at/ngày tạo thay ngày hoàn thành. Web đã đăng chưa đồng nghĩa hoàn thành toàn quy trình. Social dùng ngày đăng làm mốc hoàn thành.

Đúng hạn = số hoàn thành không muộn hơn deadline / số hoàn thành đủ dữ liệu. Deadline có ngày tính hết ngày Việt Nam; ngày hoàn thành không có giờ không đem so với deadline có giờ. Không mẫu số thì không tạo 0% giả. Dùng phân công và deadline hiện lưu, không hồi suy các lần đổi người/đổi hạn; không thay kết quả KPI chính thức.

## Nguồn chuyên môn khác

- Sale giữ phạm vi RLS Signal, kết quả thành công/không thành công tách riêng.
- 3K dùng số liệu đo lường từ `k3_measured_period_read`, không suy KPI từ trạng thái `k3_tasks` cũ. Chỉ tóm tắt số KPI/ghi nhận/chốt, không cộng các phép đo khác đơn vị.
- Kinh doanh lấy KR tháng chính thức từ `biz_dashboard_data`. Không coi số liệu tháng là tuần hoặc tự cộng chỉ tiêu khác loại.

Khối rỗng/ngoài quyền/chưa bật ẩn. Nguồn lỗi báo lỗi riêng. Mỗi khối có lối mở báo cáo gốc; không dựng lại toàn bộ danh sách, bộ lọc, bảng xếp hạng hay báo cáo chi tiết.

## Tải và AI

Đầu việc đọc đủ trang (250/trang, giới hạn 5.000/nguồn, timeout 12 giây/trang); lỗi một trang bỏ nguồn đó thay vì âm thầm đếm một phần. Bộ lọc quản lý chia lô, khử trùng hồ sơ. JWT/RLS của người hỏi vẫn áp dụng ở tất cả lần đọc.

Dashboard cache theo tài khoản/chế độ/kỳ, nhận định cache theo dấu số liệu. Server đọc lại đúng chế độ trước khi gọi AI, không nhận actor hoặc số liệu client. AI chỉ nhận tổng hợp cần thiết; không ghi nghiệp vụ, không chấm năng lực hay đề nghị thưởng/phạt. Dashboard trống không gọi AI; lỗi AI không làm mất số liệu. Dùng API key và hạn mức hỏi AI hiện có.

Kiểm tra: `npx vitest run src/lib/performance src/lib/aiSuviet`; `npx tsc --noEmit`; `npm run build`; SQL scope tests trong `supabase/tests/dashboard_scope.sql` chạy rollback.
