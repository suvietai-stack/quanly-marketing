# Diễn biến tự nguyện — 09/11/2026

## Đã triển khai
- 0273–0278: note-only RPC khóa signal, kiểm quyền, request/payload chống lặp và 60 giây chống nội dung trùng; không UPDATE tín hiệu, không ghi status_from/status_to cho note-only để không giả mốc tiếp nhận.
- Ngừng lifecycle/note sync/tick của kỳ, bỏ cron signal-progression-daily. Giữ bảng/cột/note cũ. Nhắc careFlag chỉ còn chưa tiếp nhận; Zalo digest bỏ quét note. Không thay signal_new/signal_assigned hay kênh gửi khác.
- Danh sách RPC phân trang/lọc/sort/đếm theo RLS, Mobile 30/Desktop 40, debounce 300ms, cancellation page query, một change token 30 giây khi tab hoạt động. Tải nhãn/note-summary trong trang; chi tiết đọc ID riêng, nhật ký 30 dòng/lượt, tổng note riêng.
- View priority bốn mức với aggregate lịch sử theo nhóm thay lateral trên từng signal, không còn đọc RPC deadline. Các index hiện có đủ cho truy vấn đo; không thêm index tràn lan.
- Báo cáo bán hàng tổng hợp ở nguồn, không tải toàn bộ tín hiệu/nhãn/assign/note. Note report có phân bố chính xác >10, tệp hiện tại/tác giả thật/tốc độ theo lượt nhận trong kỳ, dùng businessMinutes không đổi acceptTime.ts.

## Phép đo
- Không có phiên thật: auth-session --self không tìm tài khoản khớp. EXPLAIN baseline trước bỏ deadline bị quyền EXECUTE chặn; không có baseline end-user thời gian trang/tìm/lọc/lưu.
- Đo cùng truy vấn đọc view ưu tiên sau bỏ deadline, dữ liệu 618 signals: lateral history **115.953ms**, grouped history **15.537ms**; giảm khoảng **86.6% cho truy vấn cụ thể**, không phải tuyên bố cả ứng dụng nhanh hơn 86.6%. Phiên công cụ không tương đương quyền Sale, một lượt đo có ảnh hưởng cache; cần đo lặp bằng người dùng thật.
- PGlite cách ly: page 30 dòng với 600/3000/5000 records lần lượt 13/40/38ms; JSON khoảng 21.983 byte không tăng theo tổng số records. Không phải kết quả latency hosted/concurrency.
- Browser fixture xác nhận page request đầu một lần, không đọc bảng note/period/deadline khi mở list; Desktop 40 dòng, Mobile 30 dòng; tìm kiếm gộp ký tự; note lưu một lần rồi lịch sử đọc lại. Fixture chặn mọi write thật.

## Kiểm chứng
- 152 unit/database tests, 18 files đạt. Bao gồm quyền RLS trước page/aggregate, note idempotency/state unchanged, level 12 và tổng ID duy nhất, bàn giao A→B→A, giờ qua đêm 16:50→08:10=20 phút, Chủ nhật/0/subminute.
- Browser 390/1280 đạt list/page/search/detail/note-save-read/report/no-deadline/no-overflow/no-JS-error. Screenshots đã xem.
- Build OK. Hosted xác minh RPC có thật và cron 0 jobs. Trong lúc làm có nghiệp vụ người dùng đồng thời: 617→618 signals, 1211→1220 history rows; không coi số tăng này là dữ liệu test và không sửa các rows đó.

## Chưa xác minh / còn giới hạn
- Phiên thật Sale/quản lý, role matrix tổ chức, upload integrations/notification delivery, network bytes/time/memory trước-sau và đồng thời nhiều người chưa nghiệm thu; cần đăng nhập Preview và hồ sơ thao tác được phép, không tự chọn tài khoản hoặc tạo note thử thật.
- Bộ lọc báo cáo Hệ/Phòng/Nhóm chưa nối; báo cáo mới hiện dùng RLS signal hiện hành, không xây scope bổ nhiệm riêng hay mở quyền. Chưa xác minh yêu cầu phạm vi tổ chức khớp toàn bộ Role-scope signal cũ.
- 0279 giới hạn first-note bằng bàn giao, hủy, mở lại và note chuyển Chốt/Trượt thật; không gán note lần sau cho lượt nhận cũ. Mở lại không có tiếp nhận mới không tự tạo mốc giả.
- First-note time samples được truyền dưới dạng timestamp tối thiểu để tái sử dụng businessMinutes phía trình duyệt; không truyền nội dung notes. Chưa thay thành aggregate phút ở nguồn nhằm tránh có công thức giờ thứ hai.
- Kiểm thử browser cũ nhắm deadline/full-list không phản ánh UI mới; test mới là luồng nghiệm thu hiện hành. Không Publish; các guard/RPC retirement đã áp dụng backend dùng chung.