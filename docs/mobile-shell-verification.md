# Khung mobile cố định — 06/11/2026

## Sửa tại layout chung
`AppShell` giữ một `MobileAppChrome` xuyên suốt route đã xác thực, gồm header và nav dưới fixed z-30; modal/popover hiện hữu z-50 tiếp tục nằm trên khung. Desktop từ 768px ẩn khung mobile và giữ Sidebar.

Header dùng branding và tên chức năng từ cùng cấu hình menu (đường dẫn chi tiết dùng tên module cha), nút quay lại, chuông hiện hữu, truy cập menu/tài khoản. Trang chủ không có nút quay lại. Thanh dưới luôn có Trang chủ/Thông báo/Cá nhân, Task chỉ khi menu hiện hữu cho phép; tab Trang chủ/Task/Cá nhân và trạng thái mở thông báo có nhận diện riêng.

Quay lại chỉ dùng entry lịch sử được khung hiện tại quan sát cho cùng tài khoản; không dùng index lớn hơn 0 như bằng chứng lịch sử nội bộ. Deep link trực tiếp hoặc refresh không có entry tin cậy sẽ về khu vực tương ứng, hoặc trang chủ. Không thay AuthGate/login hoặc chuyển deep link về trang chủ khi mở.

## Cuộn và thao tác
Giữ một vùng cuộn document, không bọc module trong scroller mới. ResizeObserver đo chiều cao header/nav thực tế gồm safe-area; main có khoảng chừa hai đầu, input có scroll-margin. Các nút fixed bottom-0/bottom-4 và sticky bottom-0/top-14 trong main được nâng theo chiều cao thanh chung. Modal portal không chịu quy tắc nâng này. Không sửa logic hoặc form của module.

Khi visualViewport xác định bàn phím đang mở trong ô nhập, tạm ẩn nav dưới để không che bàn phím và thao tác; đóng bàn phím khôi phục. Cần xác minh bổ sung trên iPhone/Android/PWA thật vì Chromium headless không có bàn phím hệ điều hành hoặc safe-area phần cứng.

## File
- `src/components/AppShell.tsx`
- `src/components/MobileAppChrome.tsx` mới
- `src/lib/mobileShell.ts`, `src/lib/mobileShell.test.ts` mới
- `src/styles.css`
- `src/components/AGENTS.md`
- `tests/mobileShell.browser.tsx`, `tests/mobileShell.browser.py` mới
- `roadmap.md`, tài liệu này

Không đổi backend, quyền, nghiệp vụ, lịch sử, thông báo/Zalo, route nghiệp vụ hoặc desktop.

## Kiểm thử
- 25/25 unit test đạt, gồm tám quy tắc tên trang và quay lại an toàn; hồi quy menu và ghim/tìm kiếm đạt.
- Khung thật trong harness tại 320/390/767px: Trang chủ→Kinh doanh→3K→chi tiết, header/nav luôn ở cạnh màn hình, scroll cuối vẫn tồn tại, về trang chủ một chạm, quay lại nội bộ đúng, deep link không lịch sử về đúng khu vực; kiểm tra các URL Tín hiệu/KPI/Thiết Kế/Tiền Về/Nghỉ phép/Hỏi Giá/Cá nhân. Một header/nav, không tràn hoặc lỗi JS.
- Nút fixed hiện hữu không nằm dưới nav; Lưu, dialog xác nhận và popover hoạt động; link thông báo đi đúng đích và khung vẫn còn.
- 1280px: khung mobile ẩn. Hồi quy Sidebar 1280/390/768 và Launcher 320/390/767/1280 đạt.
- Build mới nhất OK, kiểm tra content-route metadata không phát hiện trường bắt buộc thiếu.

## Chưa nghiệm thu
Harness dùng UI thật nhưng nội dung module mô phỏng, không tương đương phiên nghiệp vụ thật. Preview hiện đăng xuất; mint --self không khớp hồ sơ của người yêu cầu. Cần đăng nhập Preview để kiểm tra AppShell/module/modal thật với tài khoản được phép. Không tự chọn tài khoản khác hoặc tạo dữ liệu thử trên hệ thống chung. Bàn phím, safe-area/PWA thiết bị thật còn cần kiểm tra.

Chưa Publish.