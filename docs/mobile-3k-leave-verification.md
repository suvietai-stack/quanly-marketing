# Mobile 3K và Nghỉ phép — 06/11/2026

## Phạm vi đã thay đổi

### 3K
- `Biz3K.tsx`: bộ chọn khu vực mobile và menu phụ lưu trữ/cài đặt theo quyền; đủ bộ chọn kỳ; desktop vẫn thanh hiện có.
- `K3DateControl.tsx`: trước/chọn/sau ngày, về hôm nay; không thay khoảng kỳ hoặc thời gian nghiệp vụ.
- `Biz3KKpiDay.tsx`: tóm tắt từ dữ liệu ngày/tổng kết đang có, hai thao tác chính; thẻ việc gọn và chọn nhiều KPI trong hộp riêng.
- `Biz3KKpiResult.tsx`: form mobile toàn màn hình, nút Có/Chưa lớn, số dùng bàn phím decimal, ghi chú thu gọn; giữ đủ kiểu đo, preview phía máy chủ và lý do sau chốt.
- `Biz3KQuickCreate.tsx`: class form mobile, giữ xác nhận bỏ thay đổi, validation và request key.
- `Biz3KDayReview.tsx`: công việc thiếu cập nhật lên trước, công việc đã cập nhật mở theo nhu cầu; xác nhận/cảnh báo và chốt hệ thống tách biệt.
- `Biz3KGoals.tsx`: bộ lọc/kết quả nhóm vừa màn hình, sheet/editor mobile; giữ mời/phân công/các callback hiện hữu.
- `Biz3KMeasuredPeriod.tsx`: tìm kiếm rộng, lọc đơn vị và kỷ luật thu gọn mobile, kết quả từng người mở theo nhu cầu.
- `src/routes/biz.3k.tsx`: ẩn tiêu đề nội dung trên mobile để chỉ còn header chung; desktop giữ tiêu đề.

### Nghỉ phép
- `LeaveUi.tsx`: ba ô tạo mở trực tiếp đúng loại trên mobile; không lặp tiêu đề; tab cuộn ngang, thẻ đơn đọc đủ thời gian, bộ lọc đơn cá nhân.
- Lựa chọn nhanh Cả ngày/Sáng/Chiều/Nhiều ngày chỉ cập nhật ngày/buổi form; `evaluate` hiện hữu vẫn tính preview và backend vẫn kiểm lại.
- Form mobile toàn màn hình, phút nhanh và lý do bổ sung dễ chạm, ghi chú không bắt buộc mở theo nhu cầu; xác nhận bỏ thay đổi chưa gửi, lỗi không đóng form.
- Sheet chi tiết giữ thao tác/điều kiện quyền, lịch sử mở rộng; xác nhận xử lý vẫn riêng với nội dung Sheet.
- `LeaveReport.tsx`: thẻ tổng hợp từng nhân viên mobile, chi tiết mở theo tên; bảng desktop và xuất Excel hiện hữu không thay công thức. Attendance không dùng thẻ mới.
- `src/styles.css`: class opt-in riêng hai module, kích thước chạm, full-screen/safe-area, input 16px, footer và sheet; không đổi component Dialog chung.

## Kiểm thử đã chạy

- 95 unit test thuộc KPI/3K/creation/discipline/period và leave calc/report/attendance/permission/Zalo: đạt.
- `tests/k3Mobile.browser.py` + `.tsx`, các RPC được chặn trong môi trường kiểm tra: 320/375/390/430/768/1280 đạt; mở ngày, đổi ngày/về hôm nay, tạo→lỗi→giữ dữ liệu→retry cùng request key, số 15→30 thay tổng, Có/Chưa, lịch sử, cảnh báo thiếu→xác nhận tổng kết dù KPI chưa đạt. Không lỗi JS/tràn toàn trang.
- `tests/k3Delete.browser.py`: 6 tình huống 1280/390 × Ngày/KG/KF đạt; refetch/đóng menu/blur/lỗi/retry/khóa gửi không làm mất xác nhận.
- `tests/leaveMobile.browser.py` + `.tsx`, dữ liệu cách ly: 320/375/390/430/1280 đạt; tạo đúng loại trực tiếp, sáng 0,5 ngày/cả ngày 1 ngày, lỗi gửi giữ dữ liệu/retry, cảnh báo bỏ thay đổi, mức 15 phút/đơn bổ sung/lý do, tab báo cáo, không lỗi JS/tràn trang.
- Ảnh kiểm tra lưu dưới `/tmp/browser/k3-mobile` và `/tmp/browser/leave-mobile`; đã xem ảnh 390px form/Ngày/Có-Chưa và 320px bổ sung. Các ảnh chỉ dữ liệu fixture, không phải hồ sơ thật.
- Log biên dịch mới nhất: OK.

## Giữ nguyên

Không migration, không sửa database/RLS/API/RPC/công thức KPI/ngày nghỉ/deadline/quyền/người duyệt/ghi lịch sử/chốt/snapshot/Zalo. Không đổi Sidebar Desktop, không Publish. Dữ liệu test không ghi vào backend dùng chung.

## Chưa nghiệm thu

Preview hiện tại `/login`; mint phiên theo tài khoản người yêu cầu không khớp. Chưa nghiệm thu phiên AppShell thật, ghi–đọc dữ liệu thật, quản lý phạm vi thật, mời/phân công nhóm, 10 loại KPI đầy đủ, điều chỉnh sau chốt/tổng kết lại, duyệt/từ chối/hủy/gửi lại và Excel với hồ sơ thật. Chưa kiểm bàn phím/safe-area bằng thiết bị vật lý. Không coi fixture là nghiệm thu nghiệp vụ thật.

Không tự chọn tài khoản khác, tạo dữ liệu giả trong app hoặc gửi thông báo thử. Các hạn chế này cần phiên và hồ sơ thật được người dùng cho phép.