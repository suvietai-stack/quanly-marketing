# Trang chủ mobile Base Sứ Việt — 06/11/2026

## Phạm vi hoàn thành
- Trang chủ dưới 768px: tìm kiếm, Truy cập nhanh, lưới khu vực hai cột; màn hình khu vực và chức năng ba cột (hai cột dưới 360px).
- Header dùng branding, tên người đăng nhập, chữ cái đại diện hồ sơ (hiện chưa có trường ảnh đại diện) và NotificationBell hiện hữu.
- Thanh dưới: Trang chủ, Công việc khi có quyền Task, Thông báo mở chuông hiện hữu, Cá nhân mở `/profile`. Trên Launcher thanh nằm sát đáy; trong module thanh nằm cuối nội dung, không đè nút lưu/gửi hay modal. Safe-area được tính riêng.
- Desktop/tablet từ 768px giữ Sidebar và trang tổng quan cũ. Dashboard trên Launcher mở chính trang tổng quan hiện hữu với `/?view=dashboard`.
- Khu vực là trạng thái tìm kiếm `/?area=...`, có lịch sử trình duyệt và nút quay về `/`; không tạo module/trang nghiệp vụ giả.

## Một nguồn quyền và chức năng
`AppShell` tính `visibleNavigation` như trước rồi truyền cùng kết quả cho Sidebar và MobileLauncher. Tìm kiếm, khu vực và ghim đều chỉ dùng kết quả này. Không thay đổi predicate quyền, route guard, cơ cấu tổ chức, API/RPC/RLS, schema, cron, Zalo hoặc dữ liệu nghiệp vụ. Showroom/Sắp ra mắt dùng đúng công bố sẵn có trong cấu hình menu, không có URL và không ghim.

## Ghim
`localStorage` dùng khóa `base-launcher-pins:<userId>`, chỉ chứa các URL ưu tiên, không chứa quyền. Đọc sau khi giao diện khởi tạo, bỏ giá trị lỗi/trùng/không còn được phép; thu hồi quyền loại ngay khỏi hiển thị và lưu lại danh sách sạch. Menu ô cho Ghim/Bỏ ghim/Đưa lên trước/Đưa ra sau. Hiển thị sáu ghim đầu, nhiều hơn có Xem thêm.

Giới hạn: tùy chọn duy trì qua đăng nhập lại trên cùng trình duyệt, không đồng bộ giữa thiết bị; nếu trình duyệt cấm lưu, báo rõ và chỉ giữ trong lần mở hiện tại. Không có thay đổi dữ liệu nghiệp vụ để lưu ghim.

## Đăng nhập/deep link
Không sửa `AuthGate` hoặc `login.tsx`. Đường dẫn gốc sau đăng nhập vẫn `/`, AppShell chọn Launcher theo chiều rộng. Deep link giữ nguyên pathname/query và đích sau đăng nhập theo cơ chế hiện hữu. Nội dung tổng quan không được mount trước khi xác định chiều rộng, tránh chớp dashboard trên mobile.

## File thay đổi
- `src/components/AppShell.tsx`
- `src/components/MobileLauncher.tsx` (mới)
- `src/lib/launcher.ts` (mới)
- `src/lib/launcher.test.ts` (mới)
- `src/routes/index.tsx` (tham số điều hướng và metadata riêng trang chủ)
- `src/styles.css`
- `src/components/AGENTS.md` (quy tắc cấu trúc điều hướng mới)
- `tests/launcher.browser.tsx`, `tests/launcher.browser.py` (mới)
- `roadmap.md`, tài liệu nghiệm thu này

## Kiểm thử
- 17/17 unit test: menu chính thức/quyền, tìm kiếm không dấu, giữ quyền con, thu hồi quyền loại ghim/tìm kiếm, không ghim chức năng tương lai, thứ tự ghim, tách tài khoản.
- Launcher cách ly bằng thành phần thật tại 320/390/767/1280px: vào khu vực, ghim, tải lại giữ ghim, mở 3K đúng URL, quay lại, ghim Nghỉ phép, đổi thứ tự/bỏ ghim, tìm kiếm đúng quyền, thu hồi 3K, không tràn/lỗi JS. Desktop không hiển thị Launcher.
- Sidebar hồi quy 1280/390/768px: đường dẫn con, mở nhóm, URL đơn hàng hiện hữu, Sắp ra mắt, thu gọn/khôi phục đạt.
- Trang thật chưa đăng nhập ở 390/1280px: `/` vẫn về `/login`, màn hình đăng nhập hiện hữu. Đã kiểm tra metadata các content route, không phát hiện trường bắt buộc bị thiếu. Build mới nhất OK.

## Chưa nghiệm thu
AppShell thật sau đăng nhập, thay đổi quyền thật, chuông thông báo và deep link qua đăng nhập thật chưa được nghiệm thu: phiên Preview đang đăng xuất, không thể cấp phiên cho người yêu cầu vì không khớp hồ sơ. Cần người dùng đăng nhập Preview; không tự chọn tài khoản khác, không tạo dữ liệu thử trên hệ thống chung. Kiểm thử cách ly không được coi là nghiệm thu phiên thật.

Chưa Publish.